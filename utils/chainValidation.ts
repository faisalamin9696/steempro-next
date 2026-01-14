import { PrivateKey } from "@steempro/dsteem/lib/crypto";
import BadActorList from "./badActorList";
import VerifiedExchangeList from "./VerifiedExchangeList";

export function validateAccountName(
  value: string,
  exchange_validation = false
) {
  let i, label, len, length, ref;

  if (!value) {
    return "Account name should not be empty";
  }
  length = value.length;
  if (length < 3) {
    return "Account name should be longer";
  }
  if (length > 16) {
    return "Account name should be shorter";
  }

  if (!exchange_validation && BadActorList.includes(value)) {
    return "Use caution sending to this account. Please double check your spelling for possible phishing.";
  }

  //   if (BadActorList.includes(value)) {
  //     return "Chain valifation occurred";
  //   }

  ref = value.split(".");
  for (i = 0, len = ref.length; i < len; i++) {
    label = ref[i];
    if (!/^[a-z]/.test(label)) {
      return "Each account segment should start with a letter";
    }
    if (!/^[a-z0-9-]*$/.test(label)) {
      return "Each account segment should have only letters digits or dashes";
    }
    if (/--/.test(label)) {
      return "Each account segment should have only one dash in a row";
    }
    if (!/[a-z0-9]$/.test(label)) {
      return "chainvalidation_js.Each account segment should end with a letter or digit";
    }
    if (!(label.length >= 3)) {
      return "each account segment should be longer";
    }
  }
  return null;
}

export function validateAccountNameWithMemo(
  name,
  memo,
  transfer_type = "",
  exchange_validation = false
) {
  if (
    !exchange_validation &&
    VerifiedExchangeList.includes(name) &&
    !memo &&
    transfer_type === "transfer_to_account"
  ) {
    return "You must include a memo for your exchange transfer.";
  }
  return validateAccountName(name, exchange_validation);
}

export function validateExchangeWithMemo(name, transfer_type = "") {
  if (
    VerifiedExchangeList.includes(name) &&
    transfer_type === "transfer_to_account"
  ) {
    return true;
  } else if (BadActorList.includes(name)) {
    return true;
  }
  return null;
}

export function validateMemoField(value, username, memokey) {
  value = value.split(" ").filter((v) => v != "");
  for (let w in value) {
    // Only perform key tests if it might be a key, i.e. it is a long string.
    if (value[w].length >= 39) {
      if (/5[HJK]\w{40,45}/i.test(value[w])) {
        return "Please do not include what appears to be a private key or password.";
      }
      if (PrivateKey.from(value[w])) {
        return "Do not use private keys in memo.";
      }
      if (
        memokey ===
        PrivateKey.fromSeed(username + "memo" + value[w])
          .createPublic()
          .toString()
      ) {
        return "Do not use passwords in memos.";
      }
    }
  }
  return null;
}
