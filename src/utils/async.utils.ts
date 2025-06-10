/* istanbul ignore next */
const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration * 1000);
  });
};

export const AsyncUtils = { sleep };
