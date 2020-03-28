/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from 'chai';
import { getParamList, isSurrializable } from '../../src/helpers';

describe('helpers', () => {
  describe('getParamList', () => {
    it('should throw when it class definition is not supported', () => {
      expect(() => getParamList('error, this is not supported' as any)).throws(
        'Constructor function "undefined" could not be serialized. Class was defined as: error, this is not supported'
      );
    });
  });

  describe(isSurrializable.name, () => {
    class InstanceSurrialize {
      surrialize() {}
    }
    class StaticSurrialize {
      static surrialize() {}
    }

    [undefined, null, 42, 'foo', /bar/, class Person {}, function foo() {}, InstanceSurrialize, new StaticSurrialize()].forEach(val => {
      it(`should be falsy for ${val}`, () => {
        expect(isSurrializable(val)).not.ok;
      });
    });
    function surrializable() {}
    surrializable.surrialize = () => {};

    [surrializable, { surrialize() {} }, new InstanceSurrialize(), StaticSurrialize].forEach(val => {
      it(`should be true for ${val}`, () => {
        expect(isSurrializable(val)).ok;
      });
    });
  });
});
