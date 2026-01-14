import Fuse from "fuse.js";
import { validateExchangeWithMemo } from "@/utils/chainValidation";
import VerifiedExchangeList from "./VerifiedExchangeList";

export interface TransferChecks {
  isVerifiedAccount: boolean;
  isSuspiciousAccount: boolean;
  exchangeValidation: boolean;
}

export interface SimilarityInfo {
  percentage: number;
  exactMatch: boolean;
  isSubstring: boolean;
  containsOriginal: boolean;
  noMatch: boolean;
}

export interface ExchangeValidationResult {
  transferChecks: TransferChecks;
  similarityPercentage: number;
  similarAccountName: string | null;
}

// Create Fuse instance for fuzzy search
export const createFuseInstance = () => {
  return new Fuse(VerifiedExchangeList, {
    includeScore: true,
    threshold: 0.4,
  });
};

// Character matching utility
export const getCharMatchInfo = (
  input: string,
  target: string
): SimilarityInfo => {
  const result: SimilarityInfo = {
    percentage: 0,
    exactMatch: false,
    isSubstring: false,
    containsOriginal: false,
    noMatch: true,
  };

  if (!input || !target) return result;

  const lowerInput = input.toLowerCase();
  const lowerTarget = target.toLowerCase();

  if (lowerInput === lowerTarget) {
    result.percentage = 100;
    result.exactMatch = true;
    result.noMatch = false;
  } else if (lowerTarget.includes(lowerInput)) {
    result.percentage = Math.round(
      (lowerInput.length / lowerTarget.length) * 100
    );
    result.isSubstring = true;
    result.noMatch = false;
  } else if (lowerInput.includes(lowerTarget)) {
    result.percentage = Math.round(
      (lowerTarget.length / lowerInput.length) * 100
    );
    result.containsOriginal = true;
    result.noMatch = false;
  }

  return result;
};

// Main exchange validation function
export const checkExchangeStatus = (
  accountName: string,
  fuse: Fuse<string>
): ExchangeValidationResult => {
  const lowerName = accountName.trim().toLowerCase();
  const isVerified = VerifiedExchangeList.includes(lowerName);

  let similarityPercentage = 0;
  let similarAccountName: string | null = null;
  let isSuspicious = false;

  const fuzzyResults = fuse.search(lowerName);
  const exchangeValidation = validateExchangeWithMemo(accountName);

  // Check for fuzzy matches
  if ((!isVerified && fuzzyResults.length > 0) || exchangeValidation) {
    const topResult = fuzzyResults[0];
    similarAccountName = topResult.item;
    const score = Math.round((1 - (topResult?.score || 0)) * 100);
    const matchInfo = getCharMatchInfo(accountName, similarAccountName);
    const finalScore = Math.round((matchInfo.percentage + score) / 2);

    similarityPercentage = finalScore;
    isSuspicious = finalScore >= 70;
  }

  return {
    transferChecks: {
      isVerifiedAccount: isVerified,
      isSuspiciousAccount: isSuspicious,
      exchangeValidation: exchangeValidation || false,
    },
    similarityPercentage,
    similarAccountName,
  };
};

// Helper to get warning type
export const getWarningType = (
  transferChecks: TransferChecks
): "verified" | "suspicious" | "validation" | null => {
  if (transferChecks.isVerifiedAccount) return "verified";
  if (transferChecks.exchangeValidation) return "validation";
  if (transferChecks.isSuspiciousAccount) return "suspicious";
  return null;
};
