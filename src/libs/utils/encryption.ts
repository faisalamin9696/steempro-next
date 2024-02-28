import CryptoJS from 'crypto-js';


export function encryptPrivateKey(privateKey: string, password: string): string {
    if (!privateKey || !password) {
        return '';
    }

    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    var iv = CryptoJS.lib.WordArray.random(128 / 8);

    var key128Bits = CryptoJS.PBKDF2(password, salt, {
        keySize: 128 / 32,
        iterations: 1000
    });

    const encryptedKey = CryptoJS.AES.encrypt(privateKey, key128Bits, { iv })
    return `${salt.toString(CryptoJS.enc.Hex)}:${iv.toString(CryptoJS.enc.Hex)}:${encryptedKey}`;
}

export function decryptPrivateKey(encryptedPrivateKey: string, password: string): string {
    if (!encryptedPrivateKey || !password) {
        return '';
    }

    // Split the encryptedPrivateKey into salt, iv, and encryptedKey
    const [saltHex, ivHex, encryptedKey] = encryptedPrivateKey.split(':');

    // Parse the hex strings into WordArray
    const salt = CryptoJS.enc.Hex.parse(saltHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // Derive the key using PBKDF2
    const key128Bits = CryptoJS.PBKDF2(password, salt, {
        keySize: 128 / 32,
        iterations: 1000
    });

    try {
        // Decrypt the key
        const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, key128Bits, { iv });

        // Convert the decrypted key to a string
        const privateKey = decryptedKey.toString(CryptoJS.enc.Utf8);

        // Check if the decrypted key is empty
        if (!privateKey) {
            throw new Error('Decryption failed: Invalid password');
        }

        return privateKey;
    } catch (error) {
        // Handle decryption errors (invalid password)
        console.error('Decryption failed:', error);
        return ''; // or throw an error
    }
}

// // Usage example:
// const privateKey = "your_private_key";
// const password = "your_password";
// const encryptedPrivateKey = encryptPrivateKey(privateKey, password);
// console.log("Encrypted Private Key:", encryptedPrivateKey);

// const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey, password);
// console.log("Decrypted Private Key:", decryptedPrivateKey);