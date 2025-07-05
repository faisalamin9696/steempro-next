/* istanbul ignore next */
const sleep = (durationSeconds: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, durationSeconds * 1000);
  });
};

export const AsyncUtils = { sleep };
