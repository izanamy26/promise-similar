import { describe, it, expect } from '@jest/globals';
import  PromiseSimilar  from "../PromiseSimilar";

describe('short resolve promise', () => {
    it('should make resolved pormise', () => {
        const expectResult = 'result';

        PromiseSimilar.resolve(expectResult)
            .then((receiveResult) => 
                expect(receiveResult).toEqual(expectResult));
    });
});

describe('short reject promise', () => {
    it('should make rejected pormise', () => {
        const expectResult = 'error';

        PromiseSimilar.reject(expectResult)
            .catch((receiveError) => expect(receiveError).toEqual(expectResult));
    });
});
