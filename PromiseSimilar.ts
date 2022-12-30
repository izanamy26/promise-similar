const STATUS = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
}

interface Fulfilled<T, TResult = T> {
    (value: T): TResult | PromiseSimilar<TResult>;
}

interface Rejected<TReject = never> {
    (reason: any): TReject | PromiseSimilar<TReject>;
}

const getInstance = (item: unknown): PromiseSimilar<unknown> =>  item instanceof PromiseSimilar
        ? item
        : PromiseSimilar.resolve(item);

class PromiseSimilar<T = unknown> {
    private status = STATUS.PENDING;
    private result: T | Error | null = null;
    private handlers: {
        onFulfilled: Fulfilled<any, any>;
        onRejected: Rejected<any>;
        onFinally?: () => void;
    } | null;

    constructor(executor: (resolve: Fulfilled<T>, reject?: Rejected) => void) {
        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (err) {
            this.reject(err);
        }
    }

    static resolve<TResolve>(value: TResolve): PromiseSimilar<TResolve> {
        return new PromiseSimilar((resolve) => resolve(value));
    }

    static reject<TReject = never>(error?: TReject): PromiseSimilar<TReject> {
        return new PromiseSimilar((_, reject) => reject && reject(error));
    }

    private resolve(value: T): void {
        this.solve(value, STATUS.FULFILLED);
    }

    private reject(error: T): void {
        this.solve(error, STATUS.REJECTED);
    }

    private solve(value: T, status: string): void {
        setTimeout(() => {
            if (this.status === STATUS.PENDING) {
                this.status = status;
                this.result = value;
                this.runHandler();
            }
        }, 0);
    }

    private runHandler() {
        if (this.status === STATUS.PENDING || !this.handlers) {
            return;
        }

        const { onFulfilled, onRejected, onFinally } = this.handlers;

        if (onFinally) {
            onFinally();
        }

        if (this.status === STATUS.FULFILLED) {
            return onFulfilled(this.result as T);
        }

        if (this.status === STATUS.REJECTED) {
            return onRejected(this.result);
        }

        this.handlers = null;
    }

    then<TResult = T, TReject = never>(
        onFulfilled: Fulfilled<T, TResult> | null, 
        onRejected?: Rejected<TReject> | null
    ): PromiseSimilar<TResult | TReject> {
        return new PromiseSimilar((resolve, reject) => {
            if (!resolve || !reject) {
                return;
            }

            this.handlers = {
                onFulfilled: (response) => {
                    try {
                        return resolve(onFulfilled ? onFulfilled(response) : response);
                    } catch (err) {
                        return reject(err);
                    }
                },
                onRejected: (error) => {
                    try {
                        return reject(onRejected ? onRejected(error) : error);
                    } catch (err) {
                        return reject(err);
                    }
                }
            };

            this.runHandler();
        });
    }

    catch<TReject = never>(onRejected: Rejected<TReject>): PromiseSimilar<T | TReject> {
        return this.then(null, onRejected);
    }

    finally(onFinally: () => void): PromiseSimilar<void> {
        return new PromiseSimilar((resolve, reject) => {
            if (!resolve || !reject) {
                return;
            }

            this.handlers = {
                onFulfilled: (response) => {
                    try {
                        return resolve(response);
                    } catch (err) {
                        return reject(err);
                    }
                },
                onRejected: (error) => {
                    try {
                        return reject(error);
                    } catch (err) {
                        return reject(err);
                    }
                },
                onFinally,
            };

            this.runHandler();
        });
    }


    static all(promises) {
        return new PromiseSimilar((resolve, reject) => {
            const result: unknown[] = [];
            let resolvedPromiseCount = 0;

            promises.forEach((item, index) => {
                const promise = getInstance(item);

                promise
                    .then((response) => {
                        result[index] = response;
                        resolvedPromiseCount++;

                        if (resolvedPromiseCount === promises.length) {
                            return resolve(result);
                        }
                    })
                    .catch((error) => {
                        if (reject) {
                            return reject(error);
                        }
                    });    
            });
        });
    }

    static race(promises) {
        return new PromiseSimilar((resolve, reject) => {
            promises.forEach((item) => {
                const promise = getInstance(item);

                promise
                    .then((response) => resolve(response))
                    .catch((error) => reject && reject(error));
            })
        });
    }

    static any(promises) {
        return new PromiseSimilar((resolve, reject) => {
            let settledPromiseCount = 0;
            const errors: unknown[] = [];

            promises.forEach((item) => {
                const promise = getInstance(item);

                promise
                    .then((response) => {
                        return resolve(response);
                    })
                    .catch((error) => {
                        settledPromiseCount++;
                        errors.push(error);

                        if (settledPromiseCount === promises.length && reject) {
                            return reject(errors);
                        }
                    });
            })
        });
    }

    static allSettled(promises) {
        return new PromiseSimilar((resolve, reject) => {
            const result: unknown[] = [];
            let settledPromiseCount = 0;

            promises.forEach((item, index) => {
                const promise = getInstance(item);

                promise
                    .then((response) => {
                        result[index] = {
                            status: STATUS.FULFILLED,
                            value: response
                        };

                        settledPromiseCount++;
                    })
                    .catch((error) => {
                        result[index] = {
                            status: STATUS.REJECTED,
                            reason: error
                        };

                        settledPromiseCount++;
                    })
                    .finally(() => {
                        if (settledPromiseCount === promises.length) {
                            return resolve(result);
                        }
                    });
            })
        });
    }
}

export default PromiseSimilar;