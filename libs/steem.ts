import { Constants } from "@/constants";
import {
  Client,
  cryptoUtils,
  Operation,
  PrivateKey,
  PublicKey,
  Signature,
  TransactionConfirmation,
} from "@steempro/dsteem";
import { sdsApi } from "./sds";
import { keychainApi } from "./keychain";
import moment from "moment";

export let client = new Client(Constants.rpc_servers, {
  timeout: Constants.chain_timeout,
  failoverThreshold: 3,
  consoleOnFailover: true,
});

export function updateClient() {
  const settings = Constants.activeSettings;
  let updatedList = [...Constants.rpc_servers];

  if (settings.auto_rpc) {
    client = new Client(updatedList, {
      ...client.options,
      failoverThreshold: 3,
    });
  } else {
    const server = settings.rpc;
    client = new Client(server, {
      ...client.options,
      failoverThreshold: 1,
    });
  }
}

class SteemApi {
  constructor() {}

  private get client(): Client {
    return client;
  }

  signImage = async (
    account: string,
    photo: any,
    privateKey?: string,
    useKeychain: boolean = false
  ): Promise<Signature | null> => {
    try {
      // Convert the photo to a Uint8Array
      const photoBuf = new Uint8Array(Buffer.from(photo, "base64"));
      if (photoBuf.length === 0) {
        throw new Error("Something went wrong!");
      }

      // Create a prefix as a Uint8Array
      const prefix = new Uint8Array(Buffer.from("ImageSigningChallenge"));
      const data = Buffer.concat([prefix, photoBuf]);
      const hash = cryptoUtils.sha256(data);

      if (useKeychain && (window as any).steem_keychain) {
        keychainApi.validateKeychain();

        return (
          await this.signMessageWithKeychain(account, JSON.stringify(data))
        ).signature;
      }

      if (!privateKey) {
        throw new Error(
          "Private posting key is required if Keychain is not used"
        );
      }

      const key = PrivateKey.fromString(privateKey);
      const signature = key.sign(hash);
      const isValid = key.createPublic().verify(hash, signature);
      if (!isValid) {
        throw new Error("Signature verification failed - key may be incorrect");
      }
      return signature;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  uploadImage = (
    file: File,
    username: string,
    signature: string,
    onProgress?: (percentage: number) => void
  ): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // Validate inputs
      if (
        !file ||
        !username ||
        !signature ||
        !Constants.activeSettings.image_server
      ) {
        resolve(null);
        return;
      }

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const sanitizedFilename = file.name.replace(/[()\s]/g, "_");
      formData.append("file", file, sanitizedFilename);

      const url = `${Constants.activeSettings.image_server}/${username}/${signature}`;

      xhr.open("POST", url);
      xhr.setRequestHeader(
        "Authorization",
        Constants.activeSettings.image_server
      );

      // Set timeout to 60 seconds
      xhr.timeout = 60000;
      xhr.responseType = "json";

      // Progress tracking
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage);
          }
        };
      }

      // Handle successful upload
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = xhr.response;
            if (data?.url) {
              resolve(data.url);
            } else {
              // If no URL, the response might contain an error message
              const errorMsg =
                data?.message ||
                (typeof data === "string" ? data : "No URL in response");
              reject(new Error(errorMsg));
            }
          } catch (error) {
            console.error("Failed to parse response:", error);
            reject(new Error("Failed to parse server response"));
          }
        } else {
          // Handle non-200 status codes
          const errorData = xhr.response;
          const errorMsg =
            errorData?.message ||
            (typeof errorData === "string"
              ? errorData
              : `Status ${xhr.status}`);
          console.error(`Upload failed: ${errorMsg}`);
          reject(new Error(errorMsg));
        }
      };

      // Handle errors
      xhr.onerror = () => {
        console.error("Network error during upload");
        reject(new Error("Network error"));
      };

      xhr.ontimeout = () => {
        console.error("Upload timed out");
        reject(new Error("Upload timed out"));
      };

      // Send the request
      xhr.send(formData);
    });
  };
  /**
   * Detect what authority this private key belongs to
   */
  public async detectKeyAuthority(username: string, privateWif: string) {
    let publicKey: string;

    // Validate WIF
    try {
      publicKey = PrivateKey.fromString(privateWif)
        .createPublic(client.addressPrefix)
        .toString();
    } catch (e) {
      throw new Error("Invalid private key format");
    }

    // Fetch account authorities
    const account = await sdsApi.getAccountExt(username, undefined, [
      "posting_key_auths",
      "active_key_auths",
      "owner_key_auths",
      "memo_key",
    ]);
    if (!account) throw new Error("Account not found");

    const postingKeys = account.posting_key_auths.map(([key]) => key);
    const activeKeys = account.active_key_auths.map(([key]) => key);
    const ownerKeys = account.owner_key_auths.map(([key]) => key);
    const memoKey = account.memo_key;

    if (postingKeys.includes(publicKey)) return "posting";
    if (activeKeys.includes(publicKey)) return "active";
    if (ownerKeys.includes(publicKey)) return "owner";
    if (memoKey === publicKey) return "memo";
    return "unknown";
  }

  private async validateKeyForAuthority(
    username: string,
    required: "Posting" | "Active",
    privateWif?: string,
    useKeychain?: boolean
  ) {
    if (useKeychain) return; // Keychain handles auth automatically

    if (!privateWif) {
      throw new Error("Private key is required when Keychain is disabled.");
    }

    const keyAuthority = await this.detectKeyAuthority(username, privateWif);

    if (keyAuthority === "unknown") {
      throw new Error(
        "The provided private key does not belong to this account."
      );
    }

    if (required === "Active" && keyAuthority === "posting") {
      throw new Error(
        "Active authority required. Posting key cannot sign this operation."
      );
    }
    return true;
  }

  private getRequiredAuthority(operation: Operation): "Posting" | "Active" {
    const type = operation[0];

    // Posting ops
    const postingOps = [
      "vote",
      "comment",
      "custom_json",
      "reblog",
      "delete_comment",
      "follow",
      "claim_reward_balance",
      "account_update2",
    ];

    if (postingOps.includes(type)) return "Posting";

    // Everything else = Active
    return "Active";
  }

  /**
   * Broadcast any operation safely
   */
  private async broadcast(
    username: string,
    operations: Operation[],
    privateKey?: string,
    useKeychain: boolean = false
  ): Promise<TransactionConfirmation> {
    try {
      if (useKeychain && (window as any).steem_keychain) {
        return await this.broadcastWithKeychain(username, operations);
      }

      if (!privateKey) {
        throw new Error(
          "Private posting key is required if Keychain is not used"
        );
      }

      const required = this.getRequiredAuthority(operations[0]);
      await this.validateKeyForAuthority(
        username,
        required,
        privateKey,
        useKeychain
      );

      const postingKey = PrivateKey.fromString(privateKey);

      const result = await this.client.broadcast.sendOperations(
        operations,
        postingKey
      );

      return this.handleResponse(result);
    } catch (error: any) {
      throw new Error(`Steem broadcast failed: ${error.message || error}`);
    }
  }

  /**
   * Steem Keychain broadcast
   */
  private async broadcastWithKeychain(
    username: string,
    operations: Operation[]
  ): Promise<TransactionConfirmation> {
    keychainApi.validateKeychain();
    return new Promise((resolve, reject) => {
      const op = operations[0];
      const authority = this.getRequiredAuthority(op);
      (window as any).steem_keychain.requestBroadcast(
        username,
        operations,
        authority, // "Posting" or "Active"
        (res: any) => {
          if (res.success) resolve(res);
          else reject(res.error);
        }
      );
    });
  }

  /**
   * Consistent error handling
   */
  private handleResponse(
    response: TransactionConfirmation
  ): TransactionConfirmation {
    if (!response || (response as any).error) {
      throw new Error(JSON.stringify(response));
    }
    return response;
  }

  // ---------------------------------------------------------------------
  // CORE OPERATIONS
  // ---------------------------------------------------------------------

  private signMessageWithKeychain(account: string, data: string) {
    return new Promise<{ signature: Signature; hash: Buffer }>(
      (resolve, reject) => {
        (window as any).steem_keychain.requestSignBuffer(
          account,
          data,
          "Posting",
          (res: any) => {
            if (res.success) {
              const hash = cryptoUtils.sha256(data);
              const signature = Signature.fromString(res.result);
              resolve({ signature, hash });
            } else reject(res.error);
          }
        );
      }
    );
  }
  signMessage(
    account: string,
    message: string,
    privateKey?: string,
    useKeychain: boolean = false
  ): Promise<{ signature: Signature; hash?: Buffer }> {
    // Make hash optional
    if (useKeychain) {
      return this.signMessageWithKeychain(account, message);
    }

    if (!privateKey) {
      throw new Error(
        "Private posting key is required if Keychain is not used"
      );
    }

    const hash = cryptoUtils.sha256(message);
    const key = PrivateKey.fromString(privateKey);
    const signature = key.sign(hash);
    const isValid = key.createPublic().verify(hash, signature);
    if (!isValid) {
      throw new Error("Signature verification failed - key may be incorrect");
    }
    return Promise.resolve({ signature, hash });
  }

  async verifySignature(
    username: string,
    hash: Buffer,
    signature: Signature
  ): Promise<boolean> {
    try {
      const account = await sdsApi.getAccountExt(username);
      const postingPubKey = account?.posting_key_auths?.[0]?.[0];
      const activePubKey = account?.active_key_auths?.[0]?.[0];
      const isValid =
        PublicKey.from(postingPubKey).verify(hash, signature) ||
        PublicKey.from(activePubKey).verify(hash, signature) ||
        false;

      return isValid;
    } catch (error) {
      return false;
    }
  }

  parseSignature(signatureString: string): Signature | null {
    try {
      return Signature.fromString(signatureString);
    } catch (error) {
      console.error("Failed to parse signature:", error);
      return null;
    }
  }

  /**
   * Publish Post/Comment
   *
   */

  publish = async (
    data: PostingContent,
    options = null,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const operations: Operation[] = [
      [
        "comment",
        {
          parent_author: data.parent_author,
          parent_permlink: data.parent_permlink,
          author: data.author,
          permlink: data.permlink,
          title: data.title,
          body: data.body,
          json_metadata: JSON.stringify(data.json_metadata),
        },
      ],
    ];

    if (options) {
      const comment_options: Operation = ["comment_options", options];
      operations.push(comment_options);
    }

    return this.broadcast(data.author, operations, privateKey, useKeychain);
  };

  /**
   * Cast an upvote / downvote / unvote
   */
  vote(
    voter: string,
    author: string,
    permlink: string,
    weight: number,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const operations: Operation[] = [
      [
        "vote",
        {
          voter,
          author,
          permlink,
          weight,
        },
      ],
    ];

    return this.broadcast(voter, operations, privateKey, useKeychain);
  }

  /**
   * Resteem / Share a post
   */
  resteem(
    account: string,
    author: string,
    permlink: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const json = JSON.stringify([
      "reblog",
      {
        account,
        author,
        permlink,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "follow",
          json,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  }

  /**
   * Delete a post or comment
   */
  deleteComment(
    account: string,
    author: string,
    permlink: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const operations: Operation[] = [
      [
        "delete_comment",
        {
          author,
          permlink,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  }

  /**
   * Follow or Unfollow
   */
  follow(
    follower: string,
    following: string,
    follow: boolean = true,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const json = JSON.stringify([
      "follow",
      {
        follower,
        following,
        what: follow ? ["blog"] : [],
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [follower],
          id: "follow",
          json,
        },
      ],
    ];

    return this.broadcast(follower, operations, privateKey, useKeychain);
  }

  /**
   * Mute or Unmute a user
   */
  mute(
    follower: string,
    following: string,
    mute: boolean = true,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const json = JSON.stringify([
      "follow",
      {
        follower,
        following,
        what: mute ? ["ignore"] : [],
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [follower],
          id: "follow",
          json,
        },
      ],
    ];

    return this.broadcast(follower, operations, privateKey, useKeychain);
  }

  mutePost = async (
    account: string,
    community: string,
    author: string,
    permlink: string,
    notes: string,
    mute: boolean,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const action = mute ? "mutePost" : "unmutePost";

    const json = JSON.stringify([
      action,
      {
        community,
        account: author,
        permlink,
        notes,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  setRole = async (
    account: string,
    community: string,
    targetAccount: string,
    role: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const json = JSON.stringify([
      "setRole",
      {
        community,
        account: targetAccount,
        role,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  setUserTitle = async (
    account: string,
    community: string,
    targetAccount: string,
    title: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const json = JSON.stringify([
      "setUserTitle",
      {
        community,
        account: targetAccount,
        title,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  setUserRoleTitle = async (
    account: string,
    community: string,
    targetAccount: string,
    role: string,
    title: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const json_title = JSON.stringify([
      "setUserTitle",
      {
        community,
        account: targetAccount,
        title,
      },
    ]);

    const json_role = JSON.stringify([
      "setRole",
      {
        community,
        account: targetAccount,
        role,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json: json_role,
        },
      ],

      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json: json_title,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  subscribe = async (
    account: string,
    community: string,
    subscribe: boolean,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const action = subscribe ? "subscribe" : "unsubscribe";

    const json = JSON.stringify([
      action,
      {
        community,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  claimReward = async (
    account: string,
    rewardSteem: number,
    rewardSbd: number,
    rewardVests: number,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const operations: Operation[] = [
      [
        "claim_reward_balance",
        {
          account: account,
          reward_steem: rewardSteem?.toFixed(3) + " STEEM",
          reward_sbd: rewardSbd?.toFixed(3) + " SBD",
          reward_vests: rewardVests?.toFixed(6) + " VESTS",
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  async updateProfile(
    account: string,
    params: Partial<PostingJsonMetadata>,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const existing = await sdsApi.getAccountExt(account);
    const existingMetadata = JSON.parse(
      existing?.posting_json_metadata || "{}"
    );
    const profile = existingMetadata.profile || {};

    const updatedProfile = {
      ...profile,
      ...params,
    };

    const updatedMetadata = {
      ...existingMetadata,
      profile: updatedProfile,
    };

    return this.broadcast(
      account,
      [
        [
          "account_update2",
          {
            account: account,
            json_metadata: "",
            posting_json_metadata: JSON.stringify(updatedMetadata),
            extensions: [],
          },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  markAsRead(
    account: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    let currentTime = new Date().toISOString().slice(0, 19);
    return this.broadcast(
      account,
      [
        [
          "custom_json",
          {
            id: "notify",
            required_auths: [],
            required_posting_auths: [account],
            json: JSON.stringify([
              "setLastRead",
              {
                date: currentTime,
              },
            ]),
          },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  pinPost(
    account: string,
    community: string,
    author: string,
    permlink: string,
    pin: boolean = true,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const json = JSON.stringify([
      pin ? "pinPost" : "unpinPost",
      {
        community,
        account: author,
        permlink,
      },
    ]);

    const operations: Operation[] = [
      [
        "custom_json",
        {
          required_auths: [],
          required_posting_auths: [account],
          id: "community",
          json,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  }

  /** -------------------------
   *  ACTIVE OPERATIONS
   *  -------------------------
   */

  /**
   * Vote for a witness
   * @param account
   * @param witness
   * @param approve
   * @param key
   * @param useKeychain
   * @returns
   */

  async voteWitness(
    voter: string,
    witness: string,
    approve: boolean,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const operations: Operation[] = [
      [
        "account_witness_vote",
        {
          account: voter,
          witness,
          approve,
        },
      ],
    ];

    return this.broadcast(voter, operations, privateKey, useKeychain);
  }

  /**
   * Set or remove a witness proxy
   */
  async setProxy(
    account: string,
    proxy: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const operations: Operation[] = [
      [
        "account_witness_proxy",
        {
          account,
          proxy,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  }

  /**
   * Transfer asset e.g amount: 1.000 STEEM
   * @param from
   * @param to
   * @param amount
   * @param memo
   * @param key
   * @param useKeychain
   * @returns
   */
  transfer(
    from: string,
    to: string,
    amount: string,
    memo: string,
    toSavings: boolean = false,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    return this.broadcast(
      from,
      [
        [
          toSavings ? "transfer_to_savings" : "transfer",
          { from, to, amount, memo },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  /**
   * Powerup STEEM balance
   * @param from
   * @param to
   * @param amount
   * @param privateKey
   * @param useKeychain
   * @returns
   */
  powerUp(
    from: string,
    to: string,
    amount: number,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    return this.broadcast(
      from,
      [
        [
          "transfer_to_vesting",
          { from, to, amount: amount.toFixed(3) + " STEEM" },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  /**
   * Delegate STEEM POWER
   * @param from
   * @param to
   * @param vestingShares
   * @param key
   * @param useKeychain
   * @returns
   */
  delegate(
    from: string,
    to: string,
    vests: number,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    return this.broadcast(
      from,
      [
        [
          "delegate_vesting_shares",
          {
            delegator: from,
            delegatee: to,
            vesting_shares: vests.toFixed(6) + " VESTS",
          },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  /**
   *
   * @param account
   * @param vestingShares
   * @param key
   * @param useKeychain
   * @returns
   */
  powerDown(
    account: string,
    vests: number,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    return this.broadcast(
      account,
      [
        [
          "withdraw_vesting",
          { account, vesting_shares: vests?.toFixed(6) + " VESTS" },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  /**
   *
   * @param owner
   * @param url
   * @param blockSigningKey
   * @param props
   * @param key
   * @param useKeychain
   * @returns
   */
  witnessUpdate(
    owner: string,
    url: string,
    blockSigningKey: string,
    props: any,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    return this.broadcast(
      owner,
      [
        [
          "witness_update",
          {
            owner,
            url,
            block_signing_key: blockSigningKey,
            props,
            fee: "3.000 STEEM",
          },
        ],
      ],
      privateKey,
      useKeychain
    );
  }

  voteProposal(
    voter: string,
    proposalIds: number[],
    approve: boolean,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const op: Operation = [
      "update_proposal_votes",
      {
        voter,
        proposal_ids: proposalIds,
        approve,
        extensions: [],
      },
    ];

    return this.broadcast(voter, [op], privateKey, useKeychain);
  }

  removeProposal(
    account: string,
    proposalIds: number[],
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const op: Operation = [
      "remove_proposal",
      {
        proposal_owner: account,
        proposal_ids: proposalIds,
      },
    ];

    return this.broadcast(account, [op], privateKey, useKeychain);
  }

  async createLimitOrder(
    owner: string,
    orderId: number,
    amountToSell: string, // "10.000 STEEM"
    minToReceive: string, // "5.000 SBD"
    fillOrKill = false,
    expirationSeconds = 60 * 60, // 1 hour
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const expiration = new Date(Date.now() + expirationSeconds * 1000)
      .toISOString()
      .split(".")[0];

    const op: Operation = [
      "limit_order_create",
      {
        owner,
        orderid: orderId,
        amount_to_sell: amountToSell,
        min_to_receive: minToReceive,
        fill_or_kill: fillOrKill,
        expiration,
      },
    ];

    return this.broadcast(owner, [op], privateKey, useKeychain);
  }

  cancelLimitOrder(
    owner: string,
    orderId: number,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const op: Operation = [
      "limit_order_cancel",
      {
        owner,
        orderid: orderId,
      },
    ];

    return this.broadcast(owner, [op], privateKey, useKeychain);
  }

  generateRequestId() {
    return Number(`${moment().unix() + Math.floor(Math.random())}`);
  }
  convertSBDToSteem(
    owner: string,
    amount: string, // Example: "10.000 SBD"
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const requestId = this.generateRequestId();

    const op: Operation = [
      "convert",
      {
        owner,
        requestid: requestId,
        amount,
      },
    ];

    return this.broadcast(owner, [op], privateKey, useKeychain);
  }

  /**
   * array of { owner, requestid, amount, conversion_date }
   * @param owner
   * @returns
   */

  grantPostingAuthority = async (
    account: string,
    authorizedAccount: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) => {
    const accountData = await sdsApi.getAccountExt(account);
    if (!accountData) throw new Error("Account not found");

    const postingAuths = accountData.posting_account_auths || [];
    const isAlreadyAuthorized = postingAuths.some(
      ([acc]) => acc === authorizedAccount
    );

    if (isAlreadyAuthorized) return;

    const newPostingAuths = [...postingAuths, [authorizedAccount, 1]];

    const operations: Operation[] = [
      [
        "account_update",
        {
          account: account,
          posting: {
            weight_threshold: accountData.posting_weight_threshold,
            account_auths: newPostingAuths,
            key_auths: accountData.posting_key_auths,
          },
          memo_key: accountData.memo_key,
          json_metadata: accountData.posting_json_metadata,
        },
      ],
    ];

    return this.broadcast(account, operations, privateKey, useKeychain);
  };

  /**
   * Set withdraw vesting route
   */
  async setWithdrawVestingRoute(
    from: string,
    to: string,
    percent: number,
    autoVest: boolean,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const operations: Operation[] = [
      [
        "set_withdraw_vesting_route",
        {
          from_account: from,
          to_account: to,
          percent: Math.floor(percent * 100), // e.g., 50% = 5000
          auto_vest: autoVest,
        },
      ],
    ];

    return this.broadcast(from, operations, privateKey, useKeychain);
  }

  /**
   * Change recovery account
   */
  async changeRecoveryAccount(
    accountToRecover: string,
    newRecoveryAccount: string,
    privateKey?: string,
    useKeychain: boolean = false
  ) {
    const operations: Operation[] = [
      [
        "change_recovery_account",
        {
          account_to_recover: accountToRecover,
          new_recovery_account: newRecoveryAccount,
          extensions: [],
        },
      ],
    ];

    return this.broadcast(
      accountToRecover,
      operations,
      privateKey,
      useKeychain
    );
  }
}

export const steemApi = new SteemApi();
