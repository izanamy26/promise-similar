import { describe, it, expect, beforeAll } from '@jest/globals';
import PromiseSimilar from "../PromiseSimilar";

type TestParams = Promise<string> | PromiseSimilar<string>;
type ReturnedData = string | string[] | void;
type TestChainResult = Promise<ReturnedData> | PromiseSimilar<ReturnedData>;

const resolveCallback = (resolve) => {
    setTimeout(() => {
        resolve('result');
    }, 500);
};

const getResultExpectChain = (promiseFunc, promiseReceive, promiseExpect, done) => {
    promiseFunc(promiseReceive, done)
        .then(async (receiveResult) => {
            const expectResult = await promiseFunc(promiseExpect, done);
            return expect(receiveResult).toEqual(expectResult);
        });
};

describe('Resolve promise', () => {
    const promiseSimilarResolve = new PromiseSimilar<string>(resolveCallback);
    const promiseResolve = new Promise<string>(resolveCallback);

    const getThenFinallyChain = (promise: TestParams): TestChainResult => {
        const result: string[] = [];

        return promise
            .then((res: string) => {
                result.push(res);
                return 'result 1';
            })
            .then((res: string) => {
                result.push(res);
                return 'result 2';
            })
            .then((res: string) => {
                result.push(res);
                return result;
            })
            .finally(() => result.push('finally'))
            .then(() => result);;
    }

    it('should execute onFulfilled and onFinally callbacks', async () => {
        return getResultExpectChain(getThenFinallyChain, promiseResolve, promiseSimilarResolve, null);
    });
});

describe('Reject promise', () => {
    let promiseSimilarReject;
    let promiseReject;

    beforeAll((done) => {
        const rejectCallback = (_, reject) => {
            setTimeout(() => {
                done(reject('error'));
            }, 500);
        };

        promiseSimilarReject = new PromiseSimilar<string>(rejectCallback);
        promiseReject = new Promise<string>(rejectCallback);
    });

    const getCatchChain = (promise: TestParams, done): Promise<string[]> => {
        const result: string[] = [];

        return new Promise((resolve) => {
            return promise
                .then((res: string) => {
                    result.push(res);
                    return 'result 1';
                })
                .catch((err: string) => {
                    result.push(err);
                    return 'error 1';
                })
                .catch((err: string) => {
                    result.push(err);
                    return 'error 2';
                })
                .finally(() => {
                    result.push('finally');
                    done(resolve(result));
                });
        });
    }

    const getThanAfterFinallyChain = (promise: TestParams, done): Promise<string[]> => {
        const result: string[] = [];

        return new Promise((resolve) => {
            return promise
                .catch((err: string) => {
                    result.push(err);
                    return 'error 1';
                })
                .finally(() => {
                    result.push('finally');
                })
                .then(() => {
                    result.push('then 1');
                    done(resolve(result));
                });
        });
    };

    it('should execute one onRejected and onFinnaly callbacks', (done) => {
        return getResultExpectChain(getCatchChain, promiseReject, promiseSimilarReject, done);
    });

    it('should execute onFulfilled after onFinally', (done) => {
        return getResultExpectChain(getThanAfterFinallyChain, promiseReject, promiseSimilarReject, done);
    });
});