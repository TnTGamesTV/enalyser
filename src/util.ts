/**
 * Wait for given ms
 * @param {Number} ms
 * @returns the promise that will resolve after the given ms
 */
export const timeout = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
