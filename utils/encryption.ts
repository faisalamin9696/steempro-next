import { AES, Hex, PBKDF2, WordArray, Utf8, HmacSHA256 } from "crypto-es";
import murmurhash3_32_gc from "murmurhash-js/murmurhash3_gc";

function getFingerprint() {
  let bar = "|";
  let key = "";
  if (key.endsWith(bar)) key = key.substring(0, key.length - 1);
  let seed = 256;
  return murmurhash3_32_gc(key, seed);
}

export function encryptPrivateKey(
  privateKey: string,
  password: string,
): string {
  if (!privateKey || !password) {
    return "";
  }

  var salt = WordArray.random(128 / 8);
  var iv = WordArray.random(128 / 8);

  var key128Bits = PBKDF2(password, salt, {
    keySize: 128 / 32,
    iterations: 1000,
  });

  const encryptedKey = AES.encrypt(privateKey, key128Bits, { iv });
  return `${salt.toString(Hex)}:${iv.toString(Hex)}:${encryptedKey}`;
}

export function decryptPrivateKey(
  encryptedPrivateKey: string,
  password: string,
): string {
  if (!encryptedPrivateKey || !password) {
    return "";
  }

  // Split the encryptedPrivateKey into salt, iv, and encryptedKey
  const [saltHex, ivHex, encryptedKey] = encryptedPrivateKey.split(":");

  // Parse the hex strings into WordArray
  const salt = Hex.parse(saltHex);
  const iv = Hex.parse(ivHex);

  // Derive the key using PBKDF2
  const key128Bits = PBKDF2(password, salt, {
    keySize: 128 / 32,
    iterations: 1000,
  });

  try {
    // Decrypt the key
    const decryptedKey = AES.decrypt(encryptedKey, key128Bits, { iv });

    // Convert the decrypted key to a string
    const privateKey = decryptedKey.toString(Utf8);

    // Check if the decrypted key is empty
    if (!privateKey) {
      throw new Error("Decryption failed: Invalid password");
    }

    return privateKey;
  } catch (error) {
    // Handle decryption errors (invalid password)
    console.error("Decryption failed:", error);
    return ""; // or throw an error
  }
}

export function secureDecrypt(value: string, secureKey?: string) {
  try {
    if (!secureKey) return undefined;
    var bytes = AES.decrypt(value, getFingerprint() + secureKey);
    return bytes.toString(Utf8) || null;
  } catch (ex) {
    return null;
  }
}

export const generateHMAC = (message: string, key: string) => {
  return HmacSHA256(message, key).toString();
};

// // Usage example:
// const privateKey = "your_private_key";
// const password = "your_password";
// const encryptedPrivateKey = encryptPrivateKey(privateKey, password);
// console.log("Encrypted Private Key:", encryptedPrivateKey);

// const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey, password);
// console.log("Decrypted Private Key:", decryptedPrivateKey);
