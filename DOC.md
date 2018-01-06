# mixin

## Disposable - 资源清理相关支持

### 属性

#### disposed

资源是否已经被清理过. 

### 方法

#### dispose()

清理资源, 具体清理过程需要子类重写dispose方法执行, 注意, 子类dispose最后一步务必使用super.dispose()调用父类dispose. 

#### assertUndisposed(mtehodName)

检查对象是都已经被清理过资源. 如果已经被清理, 调用assertUndisposed会抛出异常. 此方法用来添加在子类其他方法开头, 检查时序问题. 

## Eventable - 事件收发相关支持

### 属性

#### eventPaused

是否已经暂停处理事件.

### 方法

#### dispose()

清理资源, 包括停止所有事件监听, 以及取消还未执行的事件回调函数（回调函数是异步执行的, dispose之前发出的事件, 回调函数很可能还未执行）. 

注意: Eventable不依赖Disposable, 但是建议将Eventable配合Disposable一起使用. 

#### on(eventType)

监听事件. 

##### 参数

* eventType {string} 要监听的事件类型, 对应event对象中的type字段. 

##### 返回值

{Function} 用来取消事件监听的函数

#### trigger(event, sync = false)

发出事件

##### 参数

* event {Object|string} 事件对象, 其中type字段为事件类型. 当event为string时, 内部会转换为一个type字段为event的plain object. 
* sync {boolean} 是否同步执行回调函数, 默认为false, 即异步执行. 

#### 返回值

{Promise}

#### pauseEvent()

暂停处理事件. 

#### resumeEvent()

恢复处理事件. 

#### afterEvents()

批量处理一个消息循环中的所有事件. 默认不作任何处理, 如果需要自定义处理过程, 需要子类重写这个函数. 

# decorator

## @undisposed

配合使用Disposable使用, 效果为在成员函数或属性入口处自动添加assertUndisposed()调用.

使用方法:

``` js
import undisposed from 'litchy/lib/decorator/undisposed'
import Disposable from 'litchy/lib/mixin/Disposable'
import mix from 'litchy/lib/mix'

class Foobar extends mix().with(Disposable) {
  @undisposed
  someMethod() {
    // ...
  }
}
```
