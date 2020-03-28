## [2.0.2](https://github.com/nicojs/node-surrial/compare/v2.0.1...v2.0.2) (2020-03-28)


### Bug Fixes

* **surrializable:** support surrializable in array or objects ([#10](https://github.com/nicojs/node-surrial/issues/10)) ([f1c9bda](https://github.com/nicojs/node-surrial/commit/f1c9bda559cf55e428c474e870bee97c6b582ecb))



## [2.0.1](https://github.com/nicojs/node-surrial/compare/v2.0.0...v2.0.1) (2020-02-14)



# [2.0.0](https://github.com/nicojs/node-surrial/compare/v1.0.0...v2.0.0) (2020-02-14)


### Features

* **template:** add surrial tag for template literals ([bf27e77](https://github.com/nicojs/node-surrial/commit/bf27e7772af833b799e814387733fcad1c682dc9))


*  feat(custom): allow custom serialization logic (#7) ([bd78dc4](https://github.com/nicojs/node-surrial/commit/bd78dc4557191bf105534992dd9445c6973edf0b)), closes [#7](https://github.com/nicojs/node-surrial/issues/7) [#5](https://github.com/nicojs/node-surrial/issues/5)


### BREAKING CHANGES

* If you have `surrialize()` methods on your objects (for some reason?) that function will now be used when serializing the object.



# [1.0.0](https://github.com/nicojs/node-surrial/compare/v0.2.0...v1.0.0) (2019-02-12)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/nicojs/node-surrial/compare/v0.1.3...v0.2.0) (2019-01-23)


### Bug Fixes

* remove unused typescript options ([f689593](https://github.com/nicojs/node-surrial/commit/f689593))


### Features

* **Serialize:** Only serialize known class instances  ([#3](https://github.com/nicojs/node-surrial/issues/3)) ([245008d](https://github.com/nicojs/node-surrial/commit/245008d))


### BREAKING CHANGES

* **Serialize:** Class instances will now only be serialized in its
constructor form if it is a "knownClass".

```js
serialize(new Foo('bar'));
// Should now be:
serialize(new Foo('bar'), [Foo]);
```



<a name="0.1.3"></a>
## [0.1.3](https://github.com/nicojs/node-surrial/compare/v0.1.2...v0.1.3) (2018-02-23)


### Bug Fixes

* **arrays:** add support for arrays inside objects. ([5b5ca10](https://github.com/nicojs/node-surrial/commit/5b5ca10))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/nicojs/node-surrial/compare/v0.1.1...v0.1.2) (2018-02-19)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/nicojs/node-surrial/compare/v0.1.0...v0.1.1) (2018-02-16)


### Bug Fixes

* **buffer:** support binary data as buffer ([7dc94bb](https://github.com/nicojs/node-surrial/commit/7dc94bb))



<a name="0.1.0"></a>
# 0.1.0 (2018-02-16)


### Bug Fixes

* **node-4:** support classes in node 4 ([0991835](https://github.com/nicojs/node-surrial/commit/0991835))


### Features

* **collections:** support Sets and Maps ([60c06ea](https://github.com/nicojs/node-surrial/commit/60c06ea))
* **html-tags:** support html tags as-is ([0da8fdb](https://github.com/nicojs/node-surrial/commit/0da8fdb))



