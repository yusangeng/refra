# Eventable - 事件收发支持

提供通用的事件发送与监听机制.

## 引用方式

### mixin方式

*注意*: Eventable会自动引入Disposable, 不要重复引入.

``` js
import Eventable from 'litchy/lib/mixin/Eventable'
import mix from 'litchy/lib/mix'

class Base {
  // ...
}

class Foobar extends mix(Base).with(Eventable) {
  someMethod() {
    this.trigger({
      type: 'foobar',
      data: {}
    })
  }
}
```

### 装饰方式

``` js
import eventable from 'litchy/lib/decorator/eventable'

@eventable
class Foobar {
  someMethod() {
    this.trigger({
      type: 'foobar',
      data: {}
    })
  }
}
```

## 属性

### eventPaused[只读]

事件发送是否暂停, 如果暂停, 则`trigger`方法不会发送事件. 

## 方法

### dispose()

清理资源.

### trigger(event, sync = false)

发送事件. 

#### 参数

* event {Object|string} 事件对象, 如果是字符串, 则会发送一个type字段为入参的对象. 
* sync {boolean} 是否同步发送, 如果同步发送, 事件回调函数会被同步调用, 否则被异步调用. 

#### 返回值

{Promise} 可以通过返回值跟踪回调执行情况. 

### on(type, callback)

监听事件. 

#### 参数

* type {string} 要监听的事件类型, 即事件对象的type字段. 
* callback {Function} 回调函数. 

#### 返回值

{Function} 清理函数, 调用则停止监听. 

### afterEvents(events)

批量处理上一个消息循环中的所有事件. 默认不做任何处理, 自定义处理过程由子类重写`afterEvents`实现.

#### 参数

events {Array<Object>} 事件列表. 

#### 返回值

无. 

## 装饰

### @eventable

在类定义前添加此装饰, 你定义的类会自动mixin Eventable. 
