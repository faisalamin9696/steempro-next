export const formatAmount = (amount) => {
  // Handle null or undefined
  if (amount === null || amount === undefined) {
    return "0.000";
  }

  // Handle string format like "1.000 STEEM"
  if (typeof amount === "string") {
    if (amount.trim() === "") return "0.000";
    const numericPart = amount.split(" ")[0];
    const parsed = parseFloat(numericPart);
    return isNaN(parsed) ? "0.000" : parsed.toFixed(3);
  }

  // Handle number
  if (typeof amount === "number") {
    return isNaN(amount) ? "0.000" : amount.toFixed(3);
  }

  // Handle object format
  if (typeof amount === "object" && amount !== null) {
    if (amount.amount && amount.precision !== undefined) {
      const numericAmount = parseFloat(amount.amount);
      if (isNaN(numericAmount)) return "0.000";
      const precision = amount.precision;
      const result = numericAmount / Math.pow(10, precision);
      return isNaN(result) ? "0.000" : result.toFixed(3);
    }
  }

  // Fallback - try to parse as number
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? "0.000" : parsed.toFixed(3);
};

export const formatAmountFromObject = (amountData) => {
  // Handle null or undefined
  if (amountData === null || amountData === undefined) {
    return 0;
  }

  // Handle new API format with object structure
  if (typeof amountData === "object" && amountData !== null) {
    if (amountData.amount && amountData.precision !== undefined) {
      // New format: {amount: "15", precision: 3, nai: "@@000000021"}
      const amount = parseFloat(amountData.amount);
      if (isNaN(amount)) return 0;
      const precision = amountData.precision;
      const result = amount / Math.pow(10, precision);
      return isNaN(result) ? 0 : result;
    }
  }

  // Handle legacy string format like "0.015 STEEM"
  if (typeof amountData === "string") {
    if (amountData.trim() === "") return 0;
    const parsed = parseFloat(amountData.split(" ")[0]);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Handle direct number
  if (typeof amountData === "number") {
    return isNaN(amountData) ? 0 : amountData;
  }

  // Fallback
  const parsed = parseFloat(amountData);
  return isNaN(parsed) ? 0 : parsed;
};

export const extractVestsAmount = (vestsData) => {
  // Handle null or undefined
  if (vestsData === null || vestsData === undefined) {
    return 0;
  }

  // Handle new API format with object structure
  if (typeof vestsData === "object" && vestsData !== null) {
    if (vestsData.amount && vestsData.precision !== undefined) {
      // New format: {amount: "455553333", precision: 6, nai: "@@000000037"}
      const amount = parseFloat(vestsData.amount);
      if (isNaN(amount)) return 0;
      const precision = vestsData.precision;
      const result = amount / Math.pow(10, precision);
      return isNaN(result) ? 0 : result;
    }
  }

  // Handle legacy string format like "455.553333 VESTS"
  if (typeof vestsData === "string") {
    if (vestsData.trim() === "") return 0;
    const parsed = parseFloat(vestsData.split(" ")[0]);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Handle direct number
  if (typeof vestsData === "number") {
    return isNaN(vestsData) ? 0 : vestsData;
  }

  // Fallback
  const parsed = parseFloat(vestsData);
  return isNaN(parsed) ? 0 : parsed;
};
