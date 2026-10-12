interface KeychainLoginResult {
  username: string;
  signedMessage: string;
  pubKey: string;
  challenge: string;
}

class KeychainApi {
  validateKeychain() {
    const keychain = (window as any).steem_keychain;

    if (!keychain || typeof keychain !== "object") {
      throw new Error("Steem Keychain is not installed.");
    }

    if (typeof keychain.requestBroadcast !== "function") {
      throw new Error(
        "Steem Keychain is installed but not active or outdated."
      );
    }

    return keychain;
  }

  /**
   * Non-throwing availability check, so the UI can decide whether to offer a
   * Keychain path at all instead of surfacing an error after the fact.
   */
  isAvailable(): boolean {
    if (typeof window === "undefined") return false;

    const keychain = window.steem_keychain;
    return (
      !!keychain &&
      typeof keychain === "object" &&
      typeof keychain.requestBroadcast === "function"
    );
  }

  /**
   * Login using Steem Keychain via signBuffer.
   * The user signs a short challenge text proving ownership.
   */
  loginWithKeychain(
    username: string,
    challenge = "Login to SteemPro"
  ): Promise<KeychainLoginResult> {
    const keychain = this.validateKeychain();
    return new Promise((resolve, reject) => {
      try {
        keychain.requestSignBuffer(
          username,
          challenge,
          "Posting",
          (res: any) => {
            if (!res.success) {
              return reject(new Error(res.error || "Keychain login failed."));
            }

            resolve({
              username,
              signedMessage: res.result,
              pubKey: res.publicKey,
              challenge,
            });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const keychainApi = new KeychainApi();
