'use client';

import { decryptPrivateKey, encryptPrivateKey } from "./encryption";
import secureLocalStorage from "react-secure-storage";
import { empty_settings } from "../constants/Placeholders";
import CryptoJS from 'crypto-js';

export function getCredentials(password?: string):
    User | undefined {
    const user = secureLocalStorage.getItem('auth') ?? '';
    if (user) {
        const credentials = (user ?? {}) as User
        if (credentials) {
            const privateKey = password ? decryptPrivateKey(credentials.key, password) : credentials.key;
            if (privateKey) {
                return { username: credentials.username, key: privateKey }
            }
        }
    }
}


export const parsePostMeta = (metaData: string) => {
    const metadata = JSON.parse(metaData || '{}');
    const postTags = metadata?.tags;
    return {
        image: metadata?.image || undefined,
        users: metadata?.users || [],
        tags: typeof postTags === 'string' ? [postTags] : postTags || [],
        app: metadata?.app || '',
        format: metadata?.format || '',
    };
};

export function getAllCredentials():
    User[] {
    const accounts = secureLocalStorage.getItem('accounts') ?? '';
    if (accounts) {
        const credentials = (accounts ?? []) as User[]
        if (credentials)
            return credentials
        else return []
    }
    else return []
}


function addToCurrent(username: string, encKey: string) {
    secureLocalStorage.setItem('auth', { username: username, key: encKey });

}

function addToAccounts(username: string, encKey: string) {
    const accounts = (secureLocalStorage.getItem('accounts') ?? []) as User[];
    if (accounts?.length <= 0 || accounts.some(account => account.username !== username))
        secureLocalStorage.setItem('accounts', accounts.concat(accounts.concat({ username: username, key: encKey })));
}


export function saveCredentials(username: string,
    privateKey: string, password: string,
    current?: boolean):
    User | undefined {

    const encryptedKey = encryptPrivateKey(privateKey, password);
    if (encryptedKey) {
        const isAuthExist = secureLocalStorage.getItem('auth');
        if (current) {
            addToCurrent(username, encryptedKey);
            addToAccounts(username, encryptedKey);
            return { username: username, key: encryptedKey }
        }
        else {
            if (!isAuthExist) {
                addToCurrent(username, encryptedKey);
            }
            addToAccounts(username, encryptedKey);
            return { username: username, key: encryptedKey }
        }
    };

}


export function validatePassword(input: string): boolean {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return (
        input.length >= 8 &&
        uppercaseRegex.test(input) &&
        lowercaseRegex.test(input) &&
        digitRegex.test(input) &&
        specialCharRegex.test(input)
    );
}


export function getSettings(): Setting {
    const lsSettings = (secureLocalStorage.getItem('settings') ?? {}) as Setting
    if (Object.keys(lsSettings).length > 0) {
        return { ...empty_settings(), ...lsSettings }

    } else {
        return empty_settings()
    }
}

export function updateSettings(settings: Setting) {
    const lsSettings = (secureLocalStorage.getItem('settings') as Setting ?? empty_settings());
    secureLocalStorage.setItem('settings', { ...lsSettings, ...settings });
}

export class PrivKey {
    static LEVELS = ['MEMO', 'POSTING', 'ACTIVE', 'OWNER', 'MASTER'];

    static level = (type: string): number => {
        const level = PrivKey.LEVELS.indexOf(type);
        if (level === -1) {
            throw new Error('Invalid type: ' + type);
        }

        return level;
    };
    static atLeast = (
        type: 'MEMO' | 'POSTING' | 'ACTIVE' | 'OWNER' | 'MASTER',
        target: 'MEMO' | 'POSTING' | 'ACTIVE' | 'OWNER' | 'MASTER',
    ): boolean => {
        const roleLevel = PrivKey.level(type);
        const targetLevel = PrivKey.level(target);
        return roleLevel >= targetLevel;
    };
}



export const checkPromotionText = (body: string): boolean => {
    if (!body) return false;
    const regex = /posted using \[steempro/;
    if (regex.test(body?.toLowerCase())) {
        return true;
    } else {
        return false;
    }
};

export const calculatePowerUsage = (Wp: number): number => {
    const Pu = (Wp + 0.0049) / 50;
    return Pu;
};

// function generateRandomString(length: number = 16): string {
//     const getRandomChar = (characters: string): string => characters.charAt(Math.floor(Math.random() * characters.length));

//     const randomUppercase = getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
//     const randomLowercase = getRandomChar('abcdefghijklmnopqrstuvwxyz');
//     const randomDigit = getRandomChar('0123456789');
//     const randomSpecialChar = getRandomChar('!@#$%^&*()_+{}[]:;<>,.?~\\/-');

//     const remainingChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]:;<>,.?~\\/-';
//     const randomString = randomUppercase + randomLowercase + randomDigit + randomSpecialChar +
//         Array.from({ length: length - 4 }, () => getRandomChar(remainingChars)).join('');

//     return randomString;
// }


// const getSessionId = () => {
//     let sessionId = secureLocalStorage.getItem('sessionId') as string;

//     if (!sessionId) {
//         sessionId = crypto
//             .getRandomValues(new BigUint64Array(1))[0]
//             .toString(36);

//         secureLocalStorage.setItem('sessionId', sessionId);
//     }

//     return sessionId;
// };


export let sessionAppPass = CryptoJS.lib.WordArray.random(36).toString();

export let sessionKey = '';

export const saveSessionKey = (userPassword: string) => {
    const enc = encryptPrivateKey(userPassword, sessionAppPass);
    sessionKey = enc;
    return enc;
};

export const getSessionKey = () => decryptPrivateKey(sessionKey, sessionAppPass);

export const logoutSession = () => {
    secureLocalStorage.removeItem('auth');
}