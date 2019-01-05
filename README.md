# refra | 响应式对象模型

[![Build Status](https://travis-ci.org/yusangeng/refra.svg?branch=master)](https://travis-ci.org/yusangeng/refra) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Npm Package](https://badge.fury.io/js/refra.svg)](https://www.npmjs.com/package/refra)


refra 是一个虚构单词, 用于指代具有可监听属性等特性, 支持响应式编程的对象模型. 本项目旨在提供一种简单的方式, 使得上层开发者可以 0 成本引入 refra 对象, 并在此之上开发应用.

## 安装

``` shell
npm install refra --save
```

## 样板代码

以下代码依赖babel-plugin-transform-decorators-legacy插件进行转译.

``` js
import { refra, obx, action, reaction } from 'refra'

@refra
class Foobar {
  @obx someProp = 0

  @obx get comeComputedProp () {
    return this.someProp * 2
  }

  @action
  someAction () {
    this.someProp = 1
  }

  @reaction('someProp')
  someReaction (slice) {
    console.log(slice)
  }
}
```

## API

### 装饰器

#### @refra

类型装饰器, 用于将一个 class 转化为 refra class.

案例:
``` js
@refra
class Foobar {
  // ...
}
```

#### @obx

属性装饰器, 用于将成员变量转化为可监听属性.

案例:
``` js
@refra
class Foobar {
  @obx someProperty = 0

  @obx get anotherProperty () {
    return this.someProperty + 1
  }
}

const fb = new Foobar()
console.log(fb.anotherProperty) // => 1
```

注意:
1. 可监听属性的取值只能为 undefined, null, primitive, 以及 plain object.
2. 当使用 @obx 装饰 getter 时, 将被转化为一个计算(只读)属性.

#### @action

方法装饰器, 将一个成员方法转化为 action. 所谓action是指, 当一个 action 多次改变可监听属性的值时, refra 对象只会发出一个`changes`事件. action一般用来优化不必要的刷新行为.

案例:
``` js
import sleep from 'sleep-promise'

@refra
class Foobar {
  @obx someProperty = 0

  @obx get anotherProperty () {
    return this.someProperty + 1
  }

  @action
  async someAction () {
    this.someProperty += 1
    await sleep(1000)

    this.someProperty += 1
    await sleep(1000)

    console.log(`anotherProperty = ${this.anotherProperty}.`)
  }
}

const fb = new Foobar()
fb.someAction() // => anotherProperty is 3.
```

#### @reaction()

方法装饰器, 将一个成员方法转化为一个监听属性变化并自动运行的数据回调. 支持监听多个属性, 支持监听属性的某一字段.

案例:
``` js
import sleep from 'sleep-promise'

@refra
class Foobar {
  @obx foo = { x: 0, y: 0 }
  @obx bar = { x: 0, y: 0 }

  @action
  changeFoo () {
    this.foo = { x: 0, y: 1 }
  }

  @action
  changeBar () {
    this.bar = { x: 1, y: 0 }
  }

  @reaction('foo')
  handleFooChange ({ foo }) {
    const { former, value } = foo
    console.log(`foo changed, former value is ${former}, current value is ${value}.`)
  }

  @reaction('foo.y')
  handleFooYChange ({ foo }) {
    const { former, value } = foo
    console.log(`foo.y changed, former value is ${former.y}, current value is ${value.y}.`)
  }

  @reaction ('foo', 'bar')
  handleFooBarChange ({ foo, bar }) {
    const { formerFoo, valueFoo } = foo
    const { formerBar, valueBar } = bar

    console.log(`foo changed, former value is ${formerFoo}, current value is ${valueFoo}.`) 
    console.log(`bar changed too, former value is ${formerBar}, current value is ${valueBar}.`) 
  }
}

const fb = new Foobar()

fb.changeFoo()
fb.changeBar()
```

#### @on()

refra 底层有一套用来支撑响应式特性的事件机制. 如果需要在应用层使用事件驱动机制, 可以使用 @on() 装饰器来将一个成员方法转化成一个监听事件自动运行的事件回调. 运行时使用 trigger 方法发出事件.

案例:
``` js
@refra
class Foobar {
  @on('some-event-type')
  handleSomeEvent (evt) {
    console.log(`event callback invoked: ${evt.type}.`)
  }
}

const fb = new Foobar()

fb.trigger('some-event-type') // 无参数事件
fb.trigger({ type: 'some-event-type', data: {} }) // 有参数事件
```

#### @eventable

如果只需要使用事件机制不需要使用响应式特性, 可以不使用 @refra, 而是使用 @eventable 来装饰 class. 此时只能使用 @on() 装饰器.

案例:
``` js
@eventable
class Foobar {
  @on('some-event-type')
  handleSomeEvent (evt) {
    console.log(`event callback invoked: ${evt.type}.`)
  }
}

const fb = new Foobar()

fb.trigger('some-event-type')
```

### 方法

#### dispose()

销毁 refra 或 eventable 对象. 销毁后各种联动关系都将失效.

案例:
``` js
const fb = new Foobar()

// ...

fb.dispose()
```

#### getSnapshot(freezed = true)

获取可监听属性(包括计算属性)的快照.

参数:
* freezed: 为 true 时返回一个被冻结的对象.


#### trigger(evt, sync = false)

发出事件.

参数:
* evt: 事件对象或事件类型字符串.
* sync: 是否同步发送, 默认情况下事件发送是异步的, 即发出事件后系统会启动一个 microtask 去调用事件回调, 如果设置为异步发送, 则会立即调用事件回调.

案例:
``` js
const fb = new Foobar()

fb.trigger('some-event-type') // 无参数事件
fb.trigger({ type: 'some-event-type', data: {} }) // 有参数事件
fb.trigger('some-event-type', true) // 同步发送
```

#### [DEPRECATED] connectReactComponent(component, eventType = 'update', includes = null)

将 refra 对象与 react 组件连接, 当 refra对象发生变化时, 重新渲染 react 组件.

`注意, 此API为兼容老项目用, 新项目不要使用此API.`

参数:
* component: 组件实例.
* 监听的事件, 默认为 update.
* 监听的属性, null 或属性名数组. 如果为 null 则监听所有属性.

案例
``` js
import appStore from '../app/appStore'
import FoobarStore from './FoobarStore'

class Foobar extends React.Component {
  constructor (props) {
    // 简单监听
    this.store = new FoobarStore()
    this.store.connectReactComponent(this)

    // 自定义监听
    appStore.connectReactComponent(this, 'update', [ 'foo', 'bar' ])
  }

  render () {
    return <div>
      <div>{this.store.title}</div>
      <div>{appStore.foo + appStore.bar}</div>
    </div>
  }
}
```

### 事件

由于 refra 底层使用事件机制实现响应式特性, 所以我们可以监听到一些系统内部事件帮助应用开发.

#### change 事件

可监听属性(包括计算属性)改变时发出的事件.

#### change:propname 事件

可监听属性(包括计算属性)改变时发出的事件. 用来监听某个特定的属性改变, 其中 propname 为属性名.

案例:
``` js
const fb = new Foobar()

fb.on('change:someProperty', evt => {
  console.log(evt)
})
```

#### changes 事件

批量改变事件, 一个 action 中所有属性的改变会被合并到同一个 changes 事件中.

#### update 事件

批量改变事件, 当一个属性改变的时候, 系统会开启一个 microtask 用来合并 change 事件, 在此 microtask 之前的 change 事件会被合并为同一个 update 事件. update 事件一般用来避免不必要的刷新.










