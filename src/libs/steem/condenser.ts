import axios from 'axios';
import { AppStrings } from '../constants/AppStrings';
import { Client, cryptoUtils, PrivateKey } from '@hiveio/dhive';
import { PrivKey } from '../utils/user';
import { toast } from 'sonner';
global.Buffer = global.Buffer || require('buffer').Buffer;

const DEFAULT_SERVER = AppStrings.rpc_servers[0];
const IMAGE_API = AppStrings.image_hosting[0];

export let client = new Client(DEFAULT_SERVER, {
    timeout: AppStrings.chain_timeout,
    addressPrefix: AppStrings.chain_prefix,
    chainId: AppStrings.chain_id,
    failoverThreshold: 10,
    consoleOnFailover: true,
});

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
export const signImage = async (photo, password) => {
    try {
        const photoBuf = Buffer.from(photo, "base64");
        const prefix = Buffer.from("ImageSigningChallenge");
        const data = Buffer.concat([prefix, photoBuf]);
        const privateKey = PrivateKey.fromString(password);
        const hash = cryptoUtils.sha256(data);
        const signature = privateKey.sign(hash);
        if (!privateKey.createPublic().verify(hash, signature)) {
            toast.error("Invalid Key");
            console.error("signature is invalid");
            return null;
        }
        return signature;
    } catch (error) {
        // console.log('failed to sign images', error);
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

const _upload = (fd, username: string, signature) => {
    const image = axios.create({
        baseURL: `${IMAGE_API}/${username}/${signature}`,
        onUploadProgress: (progressEvent) => {
            // console.log(progressEvent.loaded)
        },
        headers: {
            Authorization: IMAGE_API,
            "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
    });
    return image.post("", fd);
};

export function getKeyType(account: AccountExt, key: string) {
    if (!account) {
        throw new Error('Account not found');
    }

    try {
        // idr interface dalna
        let keyType: string = '';
        if (key[0] !== '5') {
            const privPostingKey = PrivateKey.fromLogin(account.name, key,
                'posting',
            ).toString();
            const isvalid = wifIsValid(
                privPostingKey,
                account?.posting_key_auths[0][0],
            );
            if (isvalid) {
                keyType = AppStrings.key_types.master;
            } else {
                keyType = '';
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
                account?.active_key_auths[0][0],
                account?.owner_key_auths[0][0],
                account?.posting_key_auths[0][0],
                account.memo_key,
            ];

            keyType =
                publicKeys.indexOf(publicKey) !== -1
                    ? keyArray[publicKeys.indexOf(publicKey)]
                    : '';
        }

        return keyType
            ? {
                account: account.name,
                type: keyType as Keys,
            }
            : '';
    } catch (e: any) {
        throw String(e);

    }

}

export const publishContent = async (
    postingContent: PostingContent,
    options = null,
    key: string,
    voteWeight = null,
) => {
    const keyData = getKeyType(postingContent.author, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const opArray: any = [
            [
                'comment',
                {
                    parent_author: postingContent.parent_author,
                    parent_permlink: postingContent.parent_permlink,
                    author: keyData.account,
                    permlink: postingContent.permlink,
                    title: postingContent.title,
                    body: postingContent.body,
                    json_metadata: JSON.stringify(postingContent.json_metadata),
                },
            ],
        ];

        if (options) {
            const e = ['comment_options', options];
            opArray.push(e);
        }


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
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    // if (error && error?.jse_info?.code === 4030100) {
                    //   error.message = getDsteemDateErrorMessage(error);
                    // }
                    reject(error);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};



export const deleteComment = (
    account: AccountExt,
    key: string,
    data: { author: string; permlink: string },
) => {
    const keyData = getKeyType(account, key);
    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const opArray: any = [
            [
                'delete_comment',
                {
                    author: data.author,
                    permlink: data.permlink,
                },
            ],
        ];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
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
        notes: string;
    },
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const action = mute ? 'mutePost' : 'unmutePost';
        const json = [
            action,
            {
                community: data.community,
                account: data.account,
                permlink: data.permlink,
                notes: data.notes || 'mute',
            },
        ];
        const custom_json = {
            id: 'community',
            json: JSON.stringify(json),
            required_auths: [],
            required_posting_auths: [keyData.account],
        };
        const opArray: any = [['custom_json', custom_json]];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};


export const voteComment = async (
    account: AccountExt,
    comment: Feed | Post,
    key: string,
    weight: number,
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);

        if (weight > 100 || weight < -100) {
            throw new Error('Invalid weight');
        }

        const voteData = {
            voter: keyData.account,
            author: comment.author,
            permlink: comment.permlink,
            weight: weight * 100,
        };

        return new Promise((resolve, reject) => {
            client.broadcast
                .vote(voteData, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required posting active key or above.',
        ),
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
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const action = pin ? 'pinPost' : 'unpinPost';
        const json = [
            action,
            {
                community: data.community,
                account: data.account,
                permlink: data.permlink,
            },
        ];
        const custom_json = {
            id: 'community',
            json: JSON.stringify(json),
            required_auths: [],
            required_posting_auths: [keyData.account],
        };
        const opArray: any = [['custom_json', custom_json]];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};


export const setUserTitle = async (
    account: AccountExt,
    key: string,
    data: { communityId: string; account: string; title: string },
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const action = 'setUserTitle';
        const json = [
            action,
            {
                community: data.communityId,
                account: data.account,
                title: data.title,
            },
        ];
        const custom_json = {
            id: 'community',
            json: JSON.stringify(json),
            required_auths: [],
            required_posting_auths: [keyData.account],
        };
        const opArray: any = [['custom_json', custom_json]];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};

export const setUserRole = async (
    account: AccountExt,
    key: string,
    data: {
        communityId: string;
        account: string;
        role: 'muted' | 'guest' | 'member' | 'mod' | 'admin' | 'owner';
    },
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const action = 'setRole';
        const json = [
            action,
            {
                community: data.communityId,
                account: data.account,
                role: data.role,
            },
        ];
        const custom_json = {
            id: 'community',
            json: JSON.stringify(json),
            required_auths: [],
            required_posting_auths: [keyData.account],
        };
        const opArray: any = [['custom_json', custom_json]];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};

export const setUserRoleTitle = async (
    account: AccountExt,
    key: string,
    data: {
        communityId: string;
        account: string;
        title: string;
        role: 'muted' | 'guest' | 'member' | 'mod' | 'admin' | 'owner';
    },
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const action1 = 'setRole';
        const action2 = 'setUserTitle';

        const json1 = [
            action1,
            {
                community: data.communityId,
                account: data.account,
                role: data.role,
            },
        ];

        const json2 = [
            action2,
            {
                community: data.communityId,
                account: data.account,
                title: data.title,
            },
        ];
        const custom_json1 = {
            id: 'community',
            json: JSON.stringify(json1),
            required_auths: [],
            required_posting_auths: [keyData.account],
        };
        const custom_json2 = {
            id: 'community',
            json: JSON.stringify(json2),
            required_auths: [],
            required_posting_auths: [keyData.account],
        };

        const opArray: any = [['custom_json', custom_json1, custom_json2]];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};

export const followUser = async (
    account: AccountExt,
    key: string,
    data: { follower: string; following: string },
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);
        const json = {
            id: 'follow',
            json: JSON.stringify([
                'follow',
                {
                    follower: `${data.follower}`,
                    following: `${data.following}`,
                    what: ['blog'],
                },
            ]),
            required_auths: [],
            required_posting_auths: [`${data.follower}`],
        };
        const opArray: any = [['custom_json', json]];

        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};

export const unfollowUser = async (
    account: AccountExt,
    key: string,
    data: { follower: string; following: string },
) => {
    const keyData = getKeyType(account, key);

    if (keyData && PrivKey.atLeast(keyData.type, 'POSTING')) {
        const privateKey = PrivateKey.fromString(key);

        const json = {
            id: 'follow',
            json: JSON.stringify([
                'follow',
                {
                    follower: `${data.follower}`,
                    following: `${data.following}`,
                    what: [],
                },
            ]),
            required_auths: [],
            required_posting_auths: [`${data.follower}`],
        };
        const opArray: any = [['custom_json', json]];
        return new Promise((resolve, reject) => {
            client.broadcast
                .sendOperations(opArray, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error(
            'Check private key permission! Required private posting key or above.',
        ),
    );
};
