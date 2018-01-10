# litchy | Basic object model used in ES201x code.

[![Build Status](https://travis-ci.org/yusangeng/litchy.svg?branch=master)](https://travis-ci.org/yusangeng/litchy) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Npm Info](https://nodei.co/npm/litchy.png?compact=true)](https://www.npmjs.com/package/litchy)

## 综述

ES201x基础对象模型, 以mixin和装饰的形式提供.

## 安装

``` shell
npm install litchy --save
```

## 使用

### mixin形式

``` js
import Eventable from 'litchy/lib/mixin/Disposable'
import mix from 'litchy/lib/mix'

class Base {
  // ...
}

class Foobar extends mix(Base).with(Disposable) {
  someMethod() {
    this.assertUndisposed()
    // ...
  }
}
```

### 装饰形式

``` js
import disposable from 'litchy/lib/decorator/disposable'
import undisposed from 'litchy/lib/decorator/undisposed'
import mix from 'mix-with'

@disposable
class Foobar {
  @undisposed
  someMethod() {
    // ...
  }
}
```
