export const getDaysUntilNextWithdrawal = (nextWithdrawalDate: string): number => {
  const nextDate = new Date(nextWithdrawalDate);
  const now = new Date();
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
