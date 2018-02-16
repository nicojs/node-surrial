import { expect } from 'chai';
import { getParamList } from '../../src/helpers';

describe('helpers', () => {
    describe('getParamList', () => {
        it('should throw when it class definition is not supported', () => {
            expect(() => getParamList('error, this is not supported' as any))
                .throws('Constructor function "undefined" could not be serialized. Class was defined as: error, this is not supported');
        });
    });
});