import axios from "axios";
import { AppStrings } from "../../constants/AppStrings";
import {
  Client,
  cryptoUtils,
  Operation,
  PrivateKey,
  PublicKey,
  Signature,
  TransactionConfirmation,
} from "@steempro/dsteem";
import { PrivKey } from "../../utils/user";
import { toast } from "sonner";
import { CurrentSetting } from "../../constants/AppConstants";
import { steemToVest } from "../../utils/helper/vesting";
import { hasSteemProPostingAuthority } from "@/app/submit/SubmitPage";
global.Buffer = global.Buffer || require("buffer").Buffer;

const getExpirationISO = () => {
  const expireSeconds = 60 * 60 * 24 * 27; // 27 days
  const date = new Date(Date.now() + expireSeconds * 1000);
  return date.toISOString().split(".")[0]; // Remove milliseconds for Steem format
};

const IMAGE_API = AppStrings.image_hostings[0];

export let client = new Client(AppStrings.rpc_servers, {
  timeout: AppStrings.chain_timeout,
  failoverThreshold: 10,
  consoleOnFailover: true,
});

export function updateClient() {
  const updatedList = AppStrings.rpc_servers;
  const server = CurrentSetting.rpc;
  const index = updatedList.indexOf(server);
  if (server && index !== -1) {
    updatedList.splice(index, 1);
    updatedList.unshift(server);
  }

  client = new Client(updatedList, {
    ...client.options,
  });
}

updateClient();

export async function validateKeychain() {
  return new Promise((resolve, reject) => {
    if (window.steem_keychain) {
      try {
        window.steem_keychain.requestHandshake(function (e) {
          resolve(window.steem_keychain);
        });
      } catch {
        reject(new Error("SteemKeychain connection failed"));
      }
    } else {
      reject(new Error("SteemKeychain connection failed"));
    }
  });
}

// get public wif from private wif
export const wifToPublic = (privWif: string) => {
  const privateKey = PrivateKey.fromString(privWif);
  const pubWif = privateKey.createPublic(client.addressPrefix).toString();
  return pubWif;
};

export const wifIsValid = (privWif: string, pubWif: string) => {
  return wifToPublic(privWif) == pubWif;
};

//// sign image to upload
export const signImage = async (
  account: string,
  photo: any,
  key: string,
  isKeychain?: boolean
) => {
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

    if (isKeychain) {
      await validateKeychain();
      return new Promise((resolve, reject) => {
        window.steem_keychain.requestSignBuffer(
          account,
          JSON.stringify(data),
          "Posting",
          function (response) {
            if (response.success) {
              const signature = Signature.fromString(response.result);
              resolve(signature);
            } else {
              reject(response);
            }
          }
        );
      });
    } else {
      const privateKey = PrivateKey.fromString(key);
      const signature = privateKey.sign(hash);

      if (!privateKey.createPublic().verify(hash, signature)) {
        toast.error("Invalid Key");
        console.error("signature is invalid");
        return null;
      }
      return signature;
    }
  } catch (error) {
    // console.error('failed to sign images', error);
    return null;
  }
};

//// upload image
export const uploadImage = (file: File, username: string, sign) => {
  const fData = new FormData();

  // replace the braces and spaces with _ in file name with replaceAll
  fData.append(
    "file",
    file,
    file.name.replaceAll(/[()]/g, "_").replaceAll(" ", "_")
  );
  return _upload(fData, username, sign);
};

const _upload = async (fd: FormData, username: string, signature: string) => {
  const controller = new AbortController(); // Handles timeout cancellation
  const timeout = setTimeout(() => controller.abort(), 50000); // 50s timeout

  try {
    const response = await axios.post(
      `${IMAGE_API}/${username}/${signature}`,
      fd,
      {
        headers: {
          Authorization: IMAGE_API,
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal, // Attach timeout signal
        onUploadProgress: (progressEvent) => {
          // console.error(
          //   `Uploaded: ${(progressEvent.loaded / progressEvent.total) * 100}%`
          // );
        },
      }
    );

    clearTimeout(timeout); // Clear timeout if successful
    return response.data; // Return data
  } catch (error: any) {
    clearTimeout(timeout); // Ensure timeout is cleared

    if (axios.isCancel(error)) {
      return { success: false, error: "Upload timed out" };
    }

    return {
      success: false,
      error: error.response?.data || error.message || "Unknown error",
    };
  }
};
export function getKeyType(account: AccountExt, key: string) {
  if (!account) {
    throw new Error("Account not found");
  }

  try {
    let privKey = key;
    let privMemoKey = "";

    let keyType: string = "";
    if (key[0] !== "5") {
      const privPostingKey = PrivateKey.fromLogin(
        account.name,
        key,
        "posting"
      ).toString();

      const isvalid = wifIsValid(
        privPostingKey,
        account?.posting_key_auths[0][0]
      );
      if (isvalid) {
        // derive the active key from master key
        privKey = PrivateKey.fromLogin(account.name, key, "posting").toString();

        // derive the memo key from master key
        privMemoKey = PrivateKey.fromLogin(
          account.name,
          key,
          "memo"
        ).toString();

        keyType = AppStrings.key_types.posting;
      } else {
        keyType = "";
      }
    } else {
      const keyArray = [
        AppStrings.key_types.active,
        AppStrings.key_types.owner,
        AppStrings.key_types.posting,
        AppStrings.key_types.memo,
      ];

      const publicKey = wifToPublic(key);

      const publicKeys = [
        account?.active_key_auths?.[0]?.[0],
        account?.owner_key_auths?.[0]?.[0],
        account?.posting_key_auths?.[0]?.[0],
        account?.memo_key,
      ];

      keyType =
        publicKeys.indexOf(publicKey) !== -1
          ? keyArray[publicKeys.indexOf(publicKey)]
          : "";
    }

    return keyType
      ? {
          account: account.name,
          type: keyType as Keys,
          key: privKey,
          memo: keyType === "MEMO" ? key : privMemoKey,
        }
      : "";
  } catch (e: any) {
    throw new Error(String(e));
  }
}

export const publishContent = async (
  postingContent: PostingContent,
  options = null,
  key: string,
  isKeychain?: boolean
) => {
  const opArray: any = [
    [
      "comment",
      {
        parent_author: postingContent.parent_author,
        parent_permlink: postingContent.parent_permlink,
        author: postingContent.author.name,
        permlink: postingContent.permlink,
        title: postingContent.title,
        body: postingContent.body,
        json_metadata: JSON.stringify(postingContent.json_metadata),
      },
    ],
  ];

  if (options) {
    const e = ["comment_options", options];
    opArray.push(e);
  }

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        postingContent.author.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(postingContent.author, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    // if (voteWeight) {
    //   const e = [
    //     'vote',
    //     {
    //       voter: author,
    //       author,
    //       permlink,
    //       weight: voteWeight,
    //     },
    //   ];
    //   opArray.push(e);
    // }

    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const deleteComment = async (
  account: AccountExt,
  key: string,
  data: { author: string; permlink: string },
  isKeychain?: boolean
) => {
  const opArray: any = [
    [
      "delete_comment",
      {
        author: data.author,
        permlink: data.permlink,
      },
    ],
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        data.author,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);
  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const mutePost = async (
  account: AccountExt,
  key: string,
  mute: boolean,
  data: {
    community: string;
    account: string;
    permlink: string;
    notes?: string;
  },
  isKeychain?: boolean
) => {
  const action = mute ? "mutePost" : "unmutePost";
  const json = [
    action,
    {
      community: data.community,
      account: data.account,
      permlink: data.permlink,
      notes: data.notes || "mute",
    },
  ];
  const custom_json = {
    id: "community",
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [account.name],
  };
  const opArray: any = [["custom_json", custom_json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const voteComment = async (
  account: AccountExt,
  comment: Feed | Post,
  key: string,
  weight: number,
  isKeychain?: boolean
) => {
  if (weight > 100 || weight < -100) {
    throw new Error("Invalid weight");
  }

  const voteData = {
    voter: account.name,
    author: comment.author,
    permlink: comment.permlink,
    weight: weight * 100,
  };

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestVote(
        account.name,
        voteData.permlink,
        voteData.author,
        voteData.weight,
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .vote(voteData, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required posting active key or above."
    )
  );
};

export const pinPost = async (
  account: AccountExt,
  key: string,
  pin: boolean,
  data: {
    community: string;
    account: string;
    permlink: string;
  },
  isKeychain?: boolean
) => {
  const action = pin ? "pinPost" : "unpinPost";
  const json = [
    action,
    {
      community: data.community,
      account: data.account,
      permlink: data.permlink,
    },
  ];
  const custom_json = {
    id: "community",
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [account.name],
  };
  const opArray: any = [["custom_json", custom_json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        data.account,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }
  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const setUserTitle = async (
  account: AccountExt,
  key: string,
  data: { communityId: string; account: string; title: string },
  isKeychain?: boolean
) => {
  const action = "setUserTitle";
  const json = [
    action,
    {
      community: data.communityId,
      account: data.account,
      title: data.title,
    },
  ];
  const custom_json = {
    id: "community",
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [account.name],
  };
  const opArray: any = [["custom_json", custom_json]];
  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }
  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const setUserRole = async (
  account: AccountExt,
  key: string,
  data: {
    communityId: string;
    account: string;
    role: "muted" | "guest" | "member" | "mod" | "admin" | "owner";
  },
  isKeychain?: boolean
) => {
  const action = "setRole";
  const json = [
    action,
    {
      community: data.communityId,
      account: data.account,
      role: data.role,
    },
  ];
  const custom_json = {
    id: "community",
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [account.name],
  };
  const opArray: any = [["custom_json", custom_json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const setUserRoleTitle = async (
  account: AccountExt,
  key: string,
  data: {
    communityId: string;
    account: string;
    role: "muted" | "guest" | "member" | "mod" | "admin" | "owner";
    title: string;
  },
  isKeychain?: boolean
) => {
  const action = "setRole";
  const json = [
    action,
    {
      community: data.communityId,
      account: data.account,
      role: data.role,
    },
  ];
  const custom_json = {
    id: "community",
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [account.name],
  };

  const action_2 = "setUserTitle";
  const json_2 = [
    action_2,
    {
      community: data.communityId,
      account: data.account,
      title: data.title,
    },
  ];
  const custom_json_2 = {
    id: "community",
    json: JSON.stringify(json_2),
    required_auths: [],
    required_posting_auths: [account.name],
  };

  const opArray: any = [
    ["custom_json", custom_json],
    ["custom_json", custom_json_2],
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const followUser = async (
  account: AccountExt,
  key: string,
  data: { follower: string; following: string },
  isKeychain?: boolean
) => {
  const json = {
    id: "follow",
    json: JSON.stringify([
      "follow",
      {
        follower: `${data.follower}`,
        following: `${data.following}`,
        what: ["blog"],
      },
    ]),
    required_auths: [],
    required_posting_auths: [`${data.follower}`],
  };
  const opArray: any = [["custom_json", json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const unfollowUser = async (
  account: AccountExt,
  key: string,
  data: { follower: string; following: string },
  isKeychain?: boolean
) => {
  const json = {
    id: "follow",
    json: JSON.stringify([
      "follow",
      {
        follower: `${data.follower}`,
        following: `${data.following}`,
        what: [],
      },
    ]),
    required_auths: [],
    required_posting_auths: [`${data.follower}`],
  };
  const opArray: any = [["custom_json", json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const subscribeCommunity = async (
  account: AccountExt,
  key: string,
  data: { community: string; subscribe: boolean },
  isKeychain?: boolean
) => {
  const json = [
    data.subscribe ? "subscribe" : "unsubscribe",
    { community: data.community },
  ];
  const custom_json = {
    id: "community",
    json: JSON.stringify(json),
    required_auths: [],
    required_posting_auths: [account.name],
  };
  const opArray: any = [["custom_json", custom_json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const reblogPost = async (
  account: AccountExt,
  key: string,
  data: { author: string; permlink: string },
  isKeychain?: boolean
) => {
  const follower = account.name;

  const json = {
    id: "follow",
    json: JSON.stringify([
      "reblog",
      {
        account: follower,
        author: data.author,
        permlink: data.permlink,
      },
    ]),
    required_auths: [],
    required_posting_auths: [follower],
  };

  const opArray: any = [["custom_json", json]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        follower,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const updateProfile = async (
  account: AccountExt,
  key: string,
  params: {
    name: string;
    about: string;
    profile_image: string;
    website: string;
    location: string;
    cover_image: string;
    version?: number;
  },
  isKeychain?: boolean
) => {
  params.version = 2;

  const opArray: any = [
    [
      "account_update2",
      {
        account: account.name,
        json_metadata: "",
        posting_json_metadata: JSON.stringify({ profile: params }),
        extensions: [],
      },
    ],
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);
  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          // if (error && get(error, 'jse_info.code') === 4030100) {
          //   error.message = getDsteemDateErrorMessage(error);
          // }
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const claimRewardBalance = async (
  account: AccountExt,
  key: string,
  rewardSteem: number,
  rewardSbd: number,
  rewardVests: number,
  isKeychain?: boolean
) => {
  const opArray: any = [
    [
      "claim_reward_balance",
      {
        account: account.name,
        reward_steem: rewardSteem?.toFixed(3) + " STEEM",
        reward_sbd: rewardSbd?.toFixed(3) + " SBD",
        reward_vests: rewardVests?.toFixed(6) + " VESTS",
      },
    ],
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);
  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.error("Claim Error", err);
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const markasRead = async (
  account: AccountExt,
  key: string,
  isKeychain?: boolean
) => {
  let date = new Date().toISOString().slice(0, 19);

  const params = {
    id: "notify",
    required_auths: [],
    required_posting_auths: [account.name],
    json: JSON.stringify(["setLastRead", { date }]),
  };

  const opArray: Operation[] = [["custom_json", params]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);
  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then(async (result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const markasReadChat = async (
  account: AccountExt,
  key: string,
  isKeychain?: boolean
) => {
  let date = new Date().toISOString().slice(0, 19);

  const params = {
    id: "steempro_notify",
    required_auths: [],
    required_posting_auths: [account.name],
    json: JSON.stringify([
      "setLastRead",
      {
        type: "message",
        date,
      },
    ]),
  };

  const opArray: Operation[] = [["custom_json", params]];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        opArray,
        "Posting",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);
  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const privateKey = PrivateKey.fromString(key);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then(async (result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

// active operations

export const voteForWitness = async (
  account: AccountExt,
  key: string,
  options: { witness: string; approved: boolean },
  isKeychain?: boolean
): Promise<TransactionConfirmation> => {
  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestWitnessVote(
        account.name,
        options.witness,
        options.approved,
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);

    const operation: any = [
      [
        "account_witness_vote",
        {
          account: keyData.account,
          witness: options.witness,
          approve: options.approved,
        },
      ],
    ];
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(operation, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Witness vote error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const transferToVesting = async (
  account: AccountExt,
  key: string,
  options: { to: string; amount: number },
  isKeychain?: boolean
) => {
  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestPowerUp(
        account.name,
        options.to,
        options.amount.toFixed(3),
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);

    const transferAmount = options.amount.toFixed(3).toString() + " " + "STEEM";

    const args: any = [
      [
        "transfer_to_vesting",
        {
          from: keyData.account,
          to: options.to,
          amount: transferAmount,
        },
      ],
    ];
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("PowerUp error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const delegateVestingShares = async (
  account: AccountExt,
  key: string,
  options: { delegatee: string; amount: number },
  isKeychain?: boolean,
  globalData?: SteemProps
) => {
  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestDelegation(
        account.name,
        options.delegatee,
        options.amount.toFixed(3).toString(),
        "SP",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);
    const vests = steemToVest(options.amount, globalData?.steem_per_share ?? 0);
    const transferAmountVests = vests.toFixed(6).toString() + " " + "VESTS";

    return new Promise((resolve, reject) => {
      client.broadcast
        .delegateVestingShares(
          {
            delegator: keyData.account,
            delegatee: options.delegatee,
            vesting_shares: transferAmountVests,
          },
          privateKey
        )
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.error("Delegation error", err);

          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export async function transferAsset(
  account: AccountExt,
  privateKey: string,
  options: Transfer,
  isKeychain?: boolean
) {
  let { from, amount, to, memo, unit } = options;

  const transferAmount = amount.toFixed(3).toString() + " " + unit;

  const transferOp: any = [
    "transfer",
    {
      from,
      to,
      amount: transferAmount,
      memo,
    },
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestTransfer(
        from,
        to,
        amount.toFixed(3).toString(),
        memo,
        unit,
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        },
        true
      );
    });
  }

  const keyData = getKeyType(account, privateKey);
  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const key = PrivateKey.fromString(privateKey);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations([transferOp], key)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Transfer error", err);
        });
    });
  }
  return Promise.reject(
    new Error(
      "Check private key permission! Required posting active key or above."
    )
  );
}

export const transferToSavings = async (
  account: AccountExt,
  privateKey: string,
  options: Transfer,
  isKeychain?: boolean
) => {
  let { amount, to, memo, from, unit } = options;

  const transferAmount = amount.toFixed(3).toString() + " " + unit;
  const transferOp: any = [
    [
      "transfer_to_savings",
      {
        from,
        to,
        amount: transferAmount,
        memo,
      },
    ],
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        from,
        transferOp,
        "Active",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, privateKey);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const key = PrivateKey.fromString(privateKey);
    let { amount, to, memo, from, unit } = options;

    if (typeof amount === "string") {
      amount = parseFloat(amount);
    }

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(transferOp, key)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Savings error", err);
        });
    });
  }
  return Promise.reject(
    new Error(
      "Check private key permission! Required posting active key or above."
    )
  );
};

export async function withdrawVesting(
  account: AccountExt,
  privateKey: string,
  amount: number,
  isKeychain?: boolean,
  globalData?: SteemProps
) {
  const transferOp: Operation = [
    "withdraw_vesting",
    {
      account: account.name,
      vesting_shares: amount?.toFixed(3) + " STEEM",
    },
  ];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestPowerDown(
        account.name,
        amount?.toFixed(3),
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, privateKey);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const key = PrivateKey.fromString(privateKey);

    const vests = steemToVest(amount, globalData?.steem_per_share ?? 0);
    const withdrawAmountVests = vests.toFixed(6).toString() + " " + "VESTS";
    transferOp[1].vesting_shares = withdrawAmountVests;

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations([transferOp], key)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Withdraw error", err);
        });
    });
  }
  return Promise.reject(
    new Error(
      "Check private key permission! Required posting active key or above."
    )
  );
}

export const grantPostingPermission = async (
  account: AccountExt,
  privateKey: string,
  isKeychain?: boolean
) => {
  if (hasSteemProPostingAuthority(account.posting_account_auths)) {
    return Promise.resolve();
  }

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestAddAccountAuthority(
        account.name,
        AppStrings.official_account,
        "Posting",
        1,
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, privateKey);

  const currentPosting = {
    account_auths: account.posting_account_auths,
    key_auths: account.posting_key_auths,
    weight_threshold: account.posting_weight_threshold,
  };
  // Add new authority
  const accountAuths = new Map(currentPosting.account_auths);
  accountAuths.set(AppStrings.official_account, 1);

  const newPosting = {
    weight_threshold: currentPosting.weight_threshold,
    account_auths: Array.from(accountAuths.entries()),
    key_auths: currentPosting.key_auths,
  };

  const opArray: any[] = [
    [
      "account_update",
      {
        account: account.name,
        memo_key: account.memo_key,
        json_metadata: account.posting_json_metadata,
        posting: newPosting,
      },
    ],
  ];

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const key = PrivateKey.fromString(privateKey);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, key)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

// others

export function verifyPrivKey(account: AccountExt, key: string): boolean {
  if (!account || !key) {
    return false;
  }
  const keyType = getKeyType(account, key);

  if (!keyType) {
    return false;
  }

  if (PrivKey.atLeast(keyType.type, "POSTING")) {
    return true;
  }
  return false;
}

export function signMessage(
  privKey: string,
  message: string
): { signature: Signature; hash: Buffer } {
  const privateKey = PrivateKey.fromString(privKey);
  const hash = cryptoUtils.sha256(message);
  const signature = privateKey.sign(hash);
  return { signature, hash };
}

export function verifyMessage(
  pubKey: string,
  hash: Buffer,
  signature: Signature
): boolean {
  try {
    const isValid = PublicKey.from(pubKey).verify(hash, signature) || false;
    return isValid;
  } catch (error) {
    return false;
  }
}

export const getProposals = async (): Promise<Proposal[]> => {
  return new Promise((resolve, reject) => {
    client
      .call("condenser_api", "list_proposals", [
        [-1],
        1000,
        "by_total_votes",
        "descending",
        "all",
      ])
      .then((res) => {
        if (res) {
          res.map((data) => {
            if (
              new Date(data.start_date) < new Date() &&
              new Date(data.end_date) >= new Date()
            ) {
              data.status = "active";
            } else if (new Date(data.end_date) < new Date()) {
              data.status = "expired";
            } else {
              data.status = "upcoming";
            }
          });
        }
        resolve(res);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

export const findProposals = (id: number): Promise<Proposal> => {
  return new Promise((resolve, reject) => {
    client
      .call("condenser_api", "find_proposals", [[id]])
      .then((r: Proposal[]) => {
        const proposal = r?.[0];
        if (proposal) {
          if (
            new Date(proposal.start_date) < new Date() &&
            new Date(proposal.end_date) >= new Date()
          ) {
            proposal.status = "active";
          } else if (new Date(r?.[0].end_date) < new Date()) {
            proposal.status = "expired";
          } else {
            proposal.status = "upcoming";
          }
          resolve(proposal);
        } else {
          reject(
            `No proposal was found for the provided ID: #${id}. Please verify the ID and try again.`
          );
        }
      });
  });
};

export interface ProposalVote {
  id: number;
  proposal: Proposal;
  voter: string;
}

export const getProposalVotes = (
  proposalId: number,
  voter: string,
  limit: number
): Promise<ProposalVote[]> =>
  client
    .call("condenser_api", "list_proposal_votes", [
      [proposalId, voter],
      limit,
      "by_proposal_voter",
    ])
    .then((r) =>
      r.filter((x: ProposalVote) => x.proposal.proposal_id === proposalId)
    )
    .then((r) => r.map((x: ProposalVote) => ({ id: x.id, voter: x.voter })));

export const voteForProposal = async (
  account: AccountExt,
  key: string,
  options: { proposalId: number; approved: boolean },
  isKeychain?: boolean
): Promise<TransactionConfirmation> => {
  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestUpdateProposalVote(
        account.name,
        JSON.stringify([options.proposalId]),
        options.approved,
        JSON.stringify([]),
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);

    const operation: any = [
      [
        "update_proposal_votes",
        {
          voter: keyData.account,
          proposal_ids: [options.proposalId],
          approve: options.approved,
          extensions: [],
        },
      ],
    ];
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(operation, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Proposal vote error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const sendMessage = async (
  sender: AccountExt,
  recipient: string,
  message: string,
  ref_tid: string | null | undefined,
  key: string,
  community?: string,
  isKeychain?: boolean
) => {
  const payload = {
    sender: sender.name,
    recipient: recipient,
    message: message,
    ref_tid: ref_tid,
    community: community,
    secret: "",
  };

  const custom_json = {
    id: "steempro_chat",
    required_auths: [],
    required_posting_auths: [sender.name],
    json: JSON.stringify(payload),
  };

  if (isKeychain) {
    await validateKeychain();

    const secretResponse = await axios.post("/api/chat/secret");

    if (secretResponse?.data?.secret) {
      // Parse JSON string to object
      const parsed = JSON.parse(custom_json.json);
      // Update secret
      parsed.secret = secretResponse?.data?.secret;
      // Re-stringify and update custom_json
      custom_json.json = JSON.stringify(parsed);
      const opArray: Operation = ["custom_json", custom_json];

      const props = await client.database.getDynamicGlobalProperties();
      const headBlockNumber = props.head_block_number;
      const headBlockId = props.head_block_id;
      const expireTime = 40000;

      const op = {
        ref_block_num: headBlockNumber & 0xffff,
        ref_block_prefix: Buffer.from(headBlockId, "hex").readUInt32LE(4),
        expiration: new Date(Date.now() + expireTime).toISOString(),
        operations: [opArray], // Add operations here
      };

      return new Promise((resolve, reject) => {
        window.steem_keychain.requestSignTx(
          sender.name,
          op,
          "Posting",
          async (response) => {
            if (!response.error) {
              try {
                const isValid = await client.database.verifyAuthority(
                  response.result
                );
                if (!isValid) {
                  reject(new Error("Failed to verify transaction"));
                }
                const result = await client.broadcast.send(response.result);
                if (!result.id) {
                  reject(new Error("Transaction is expired try again"));
                } else {
                  resolve({ success: true, tx_id: result.id });
                }
              } catch (error: any) {
                const isExpired = error?.message?.includes("trx.exp=");
                if (isExpired)
                  reject(new Error("Transaction is expired try again"));
                reject(new Error("Something went wrong!"));
              }
            }
            reject(response);
          }
        );
      });
    }
  }

  const keyData = getKeyType(sender, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const secretResponse = await axios.post("/api/chat/secret");
    if (secretResponse?.data?.secret) {
      // Parse JSON string to object
      const parsed = JSON.parse(custom_json.json);
      // Update secret
      parsed.secret = secretResponse?.data?.secret;
      // Re-stringify and update custom_json
      custom_json.json = JSON.stringify(parsed);
      const opArray: Operation = ["custom_json", custom_json];

      const privateKey = PrivateKey.fromString(key);
      return new Promise((resolve, reject) => {
        client.broadcast
          .sendOperations([opArray], privateKey)
          .then(async (result) => {
            if (!result.id) {
              reject(new Error("Something went wrong!"));
            } else {
              resolve({ success: true, tx_id: result.id });
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    }
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export function requestKeychainSignBuffer(
  username: string,
  message: any,
  keyType: Keys
): Promise<any> {
  return new Promise((resolve, reject) => {
    window.steem_keychain.requestSignBuffer(
      username,
      message,
      keyType.toLowerCase(),
      function (response) {
        if (response?.success && response?.result) {
          resolve(response);
        } else {
          reject(new Error(response?.message || "Keychain failed"));
        }
      }
    );
  });
}

export const createMarketOrder = async (
  account: AccountExt,
  amount_to_sell: string,
  min_to_receive: string,
  key: string,
  isKeychain?: boolean
) => {
  const orderid = Math.floor(Date.now() / 1000);

  let operation = {
    owner: account.name,
    orderid: orderid,
    amount_to_sell: amount_to_sell,
    min_to_receive: min_to_receive,
    fill_or_kill: false,
    expiration: getExpirationISO(),
    // 24 hours
  };

  const opArray: Operation = ["limit_order_create", operation];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        [opArray],
        "Active",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations([opArray], privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Market order error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const cancelMarketOrder = async (
  account: AccountExt,
  orderid: number,
  key: string,
  isKeychain?: boolean
) => {
  const operation = {
    owner: account.name,
    orderid: orderid,
  };
  const op = ["limit_order_cancel", operation];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        [op],
        "Active",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations([["limit_order_cancel", operation]], privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Market order error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const updateWitnessConfiguration = async (
  account: AccountExt,
  witness: Witness,
  key: string,
  isKeychain?: boolean
) => {
  const operation = {
    owner: witness.name,
    url: witness.url,
    block_signing_key: witness.signing_key,
    props: {
      account_creation_fee: witness.props.account_creation_fee,
      maximum_block_size: witness.props.maximum_block_size,
      sbd_interest_rate: witness.props.sbd_interest_rate,
      account_subsidy_budget: witness.props.account_subsidy_budget,
      account_subsidy_decay: witness.props.account_subsidy_decay,
    },
    fee: "0.000 STEEM",
  };

  const opArray: Operation = ["witness_update", operation];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        [opArray],
        "Active",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations([opArray], privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Witness setting error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const updateWitnessProxy = async (
  account: AccountExt,
  proxy: string,
  key: string,
  isKeychain?: boolean
) => {
  const operation = {
    account: account.name,
    proxy: proxy,
  };

  const opArray: Operation = ["account_witness_proxy", operation];

  if (isKeychain) {
    await validateKeychain();

    return new Promise((resolve, reject) => {
      window.steem_keychain.requestBroadcast(
        account.name,
        [opArray],
        "Active",
        function (response) {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      );
    });
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "ACTIVE")) {
    const privateKey = PrivateKey.fromString(key);
    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations([opArray], privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
          console.error("Witness proxy error", err);
        });
    });
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private active key or above."
    )
  );
};

export const broadcastCrateData = async (
  account: AccountExt,
  reward: number,
  key: string,
  isKeychain?: boolean
) => {
  if (!reward) {
    return Promise.reject(new Error("Something went wrong!"));
  }

  const encResponse = await axios.post("/api/encrypt", {
    data: reward,
  });

  if (!encResponse?.data?.encData) {
    return Promise.reject(new Error("Something went wrong!"));
  }

  const payload = {
    username: account.name,
    reward: encResponse?.data?.encData,
    secret: "",
  };

  const custom_json = {
    id: "steempro_crate",
    required_auths: [],
    required_posting_auths: [account.name],
    json: JSON.stringify(payload),
  };

  if (isKeychain) {
    await validateKeychain();

    const secretResponse = await axios.post("/api/chat/secret");

    if (secretResponse?.data?.secret) {
      // Parse JSON string to object
      const parsed = JSON.parse(custom_json.json);
      // Update secret
      parsed.secret = secretResponse?.data?.secret;
      // Re-stringify and update custom_json
      custom_json.json = JSON.stringify(parsed);
      const opArray: Operation = ["custom_json", custom_json];

      const props = await client.database.getDynamicGlobalProperties();
      const headBlockNumber = props.head_block_number;
      const headBlockId = props.head_block_id;
      const expireTime = 40000;

      const op = {
        ref_block_num: headBlockNumber & 0xffff,
        ref_block_prefix: Buffer.from(headBlockId, "hex").readUInt32LE(4),
        expiration: new Date(Date.now() + expireTime).toISOString(),
        operations: [opArray], // Add operations here
      };

      return new Promise((resolve, reject) => {
        window.steem_keychain.requestSignTx(
          account.name,
          op,
          "Posting",
          async (response) => {
            if (!response.error) {
              try {
                const isValid = await client.database.verifyAuthority(
                  response.result
                );
                if (!isValid) {
                  reject(new Error("Failed to verify transaction"));
                }
                const result = await client.broadcast.send(response.result);
                if (!result.id) {
                  reject(new Error("Transaction is expired try again"));
                } else {
                  resolve({ success: true, tx_id: result.id });
                }
              } catch (error: any) {
                const isExpired = error?.message?.includes("trx.exp=");
                if (isExpired)
                  reject(new Error("Transaction is expired try again"));
                reject(new Error("Something went wrong!"));
              }
            }
            reject(response);
          }
        );
      });
    }
  }

  const keyData = getKeyType(account, key);

  if (keyData && PrivKey.atLeast(keyData.type, "POSTING")) {
    const secretResponse = await axios.post("/api/chat/secret");
    if (secretResponse?.data?.secret) {
      // Parse JSON string to object
      const parsed = JSON.parse(custom_json.json);
      // Update secret
      parsed.secret = secretResponse?.data?.secret;
      // Re-stringify and update custom_json
      custom_json.json = JSON.stringify(parsed);
      const opArray: Operation = ["custom_json", custom_json];

      const privateKey = PrivateKey.fromString(key);
      return new Promise((resolve, reject) => {
        client.broadcast
          .sendOperations([opArray], privateKey)
          .then(async (result) => {
            if (!result.id) {
              reject(new Error("Something went wrong!"));
            } else {
              resolve({ success: true, tx_id: result.id });
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    }
  }

  return Promise.reject(
    new Error(
      "Check private key permission! Required private posting key or above."
    )
  );
};

export const updateAccountRecovery = async (
  username: string,
  newRecoveryAccount: string,
  ownerKey: string
) => {
  try {
    // Validate the new recovery account exists
    const accounts = await client.database.getAccounts([newRecoveryAccount]);
    if (accounts.length === 0) {
      throw new Error(`Recovery account ${newRecoveryAccount} does not exist`);
    }

    // Get current account info to get the sequence number
    const accountInfo = await client.database.getAccounts([username]);
    if (accountInfo.length === 0) {
      throw new Error(`Account ${username} not found`);
    }

    // Prepare the operation
    const operation: Operation = [
      "change_recovery_account",
      {
        account_to_recover: username,
        new_recovery_account: newRecoveryAccount,
        extensions: [],
      },
    ];

    // Create the transaction
    const props = await client.database.getDynamicGlobalProperties();
    const refBlockNum = props.head_block_number & 0xffff;
    const refBlockPrefix = Buffer.from(props.head_block_id, "hex").readUInt32LE(
      4
    );

    const transaction = {
      ref_block_num: refBlockNum,
      ref_block_prefix: refBlockPrefix,
      expiration: new Date(Date.now() + 60000).toISOString().slice(0, -5),
      operations: [operation],
      extensions: [],
    };

    // Sign the transaction
    const privateKeyInstance = PrivateKey.fromString(ownerKey);
    const signedTransaction = client.broadcast.sign(
      transaction,
      privateKeyInstance
    );

    // Broadcast the transaction
    const result = await client.broadcast.send(signedTransaction);
    return result;
  } catch (error) {
    console.error("Error changing recovery account:", error);
    throw error;
  }
};
