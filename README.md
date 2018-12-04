# refra

[![Build Status](https://travis-ci.org/yusangeng/refra.svg?branch=master)](https://travis-ci.org/yusangeng/refra) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Npm Info](https://nodei.co/npm/refra.png?compact=true)](https://www.npmjs.com/package/refra)

Infrastructure of reactive programming.

用来编写响应式（reactive）代码的基础对象模型.

## Install

``` shell
npm install refra --save
```

## Usage

### Using decorator @refra

``` js
import { refra, obx, action, reaction } from 'refra'

@refra
class Foobar {
  @obx someProp = 0

  @obx get comeComputedProp () {
    return this.someProp * 2
  }

  @action someAction () {
    this.someProp = 1
  }

  @reaction('someProp') someReaction (slice) {
    console.log(slice)
  }
}
```

### Using superclass Refra

``` js
import { Refra, obx, action, reaction } from 'refra'

class Foobar extends Refra {
  @obx someProp = 0

  @obx get comeComputedProp () {
    return this.someProp * 2
  }

  @action someAction () {
    this.someProp = 1
  }

  @reaction('someProp') someReaction (slice) {
    console.log(slice)
  }
}
```
