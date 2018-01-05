# litchy | Basic object model used in ES201x code.

[![Build Status](https://travis-ci.org/yusangeng/litchy.svg?branch=master)](https://travis-ci.org/yusangeng/litchy) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Npm Info](https://nodei.co/npm/litchy.png?compact=true)](https://www.npmjs.com/package/litchy)

## 综述

ES201x基础对象模型, 包括基类, mixin类, 以及相关辅助工具.

## 安装

``` shell
npm install litchy --save
```

## 使用

### 引用基类

``` js
import Litchy from 'litchy'

class Foobar extends Litchy {
  // ...
}
```

### 引用mixin

``` js
import Disposable from 'litchy/lib/mixin/Disposable'
import Eventable from 'litchy/lib/mixin/Eventable'
import mix from 'mix-with'

class Base {
  // ...
}

class Foobar extends mix(Base).with(Disposable, Eventable) {
  // ...
}
```

### 使用注解

``` js
import Disposable from 'litchy/lib/mixin/Disposable'
import undisposed from 'litchy/lib/decorator/undisposed'
import mix from 'mix-with'

class Base {
  // ...
}

class Foobar extends mix(Base).with(Disposable) {
  @undisposed
  someMethod() {
    // ...
  }
}
```