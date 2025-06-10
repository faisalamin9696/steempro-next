import { SMTAsset } from "@steempro/dsteem";

export enum Symbol {
  HIVE = "STEEM",
  HBD = "SBD",
  VESTS = "VESTS",
}

export enum NaiMap {
  "@@000000021" = "STEEM",
  "@@000000013" = "SBD",
  "@@000000037" = "VESTS",
}

export interface Asset {
  amount: number;
  symbol: Symbol;
}

export default (sval: string | SMTAsset): Asset => {
  if (typeof sval === "string") {
    const sp = sval.split(" ");
    return {
      amount: parseFloat(sp[0]),
      symbol: Symbol[sp[1]],
    };
  } else {
    return {
      amount: parseFloat(sval?.amount.toString()) / Math.pow(10, sval?.precision),
      symbol: NaiMap[sval?.nai],
    };
  }
};
