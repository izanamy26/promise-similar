import { describe, it, expect, beforeAll} from '@jest/globals';
import  PromiseSimilar  from "../PromiseSimilar";

describe('Method \'all\'', () => {
    const promise1 = PromiseSimilar.resolve<number>(3);
    const promise2 = 42;
    const promise3 = new PromiseSimilar((_, reject) => setTimeout(() => {reject && reject('foo')}, 100));
    const promise4 = new PromiseSimilar((resolve) => setTimeout(() => {resolve('foo 4')}, 800));

    it('should wait all promises in strict order', (done) => {
        const expectResult = ['foo 4', 42, 3];

        PromiseSimilar.all([promise4, promise2, promise1])
            .then((receiveResult) => {
                expect(receiveResult).toEqual(expectResult);
                done();
        });
    });

    it('should reject promise and execute onRejected callback', (done) => {
        const result: unknown[] = [];

        PromiseSimilar.all([promise1, promise2, promise3, promise4])
            .then((values) => result.push(values))
            .catch(() => {
                expect(result.length).toBe(0);
                done();
            });
    });
});

describe('Method \'race\'', () => {
    it('should resolve promise', (done) => {
        const promise3 = new PromiseSimilar((_, reject) => setTimeout(() => {reject && reject('foo')}, 100));
        const promise4 = new PromiseSimilar((resolve) => setTimeout(() => {resolve('foo 4')}, 800));
        const promise5 = new PromiseSimilar((resolve) => setTimeout(() => {resolve('foo 5')}, 50));
        const expectResult = 'foo 5';

        PromiseSimilar.race([promise3, promise4, promise5])
            .then((receiveResult) => {
                expect(receiveResult).toBe(expectResult);
                done();
        });
    });

    it('should reject promise', (done) => {
        const expectResult = 'foo';
        const promise3 = new PromiseSimilar((_, reject) => setTimeout(() => {reject && reject('foo')}, 100));
        const promise4 = new PromiseSimilar((resolve) => setTimeout(() => {resolve('foo 4')}, 800));

        PromiseSimilar.race([promise3, promise4])
            .catch((receiveResult) => {
                expect(receiveResult).toEqual(expectResult);
                done();
        });
    });
});

describe('Method \'any\'', () => {

    it('should resolve promise', (done) => {
        const promise3 = new PromiseSimilar((_, reject) => setTimeout(() => {reject && reject('foo')}, 100));
        const promise4 = new PromiseSimilar((resolve) => setTimeout(() => {resolve('foo 4')}, 800));
        const promise5 = new PromiseSimilar((resolve) => setTimeout(() => {resolve('foo 5')}, 50));
        const promise6 = PromiseSimilar.reject<string>('error');
        const expectResult = 'foo 5';

        PromiseSimilar.any([promise3, promise4, promise5, promise6])
            .then((receiveResult) => {
                expect(receiveResult).toEqual(expectResult);
                done();
            });
    });

    it('should reject promise', (done) => {
        const promise3 = new PromiseSimilar((_, reject) => setTimeout(() => {reject && reject('foo')}, 100));
        const promise6 = PromiseSimilar.reject<string>('error');
        const expectResult = ['error', 'foo'];

        PromiseSimilar.any([promise3, promise6])
            .catch((receiveResult) => {
                expect(receiveResult).toEqual(expectResult);
                done();
            });
    });
});

describe('Method \'allSettled\'', () => {
    it ('should return all result of promises', (done) => {
        const promise1 = PromiseSimilar.resolve(3);
        const promise2 = new PromiseSimilar((_, reject) => setTimeout(() => {reject && reject('foo')}, 100));
        const expectResult = [
            { status: "fulfilled", value: 3 },
            { status: "rejected", reason: "foo" }
        ];

        PromiseSimilar.allSettled([promise1, promise2])
            .then((receiveResult) => {
                expect(receiveResult).toEqual(expectResult);
                done();
            });
    });
});