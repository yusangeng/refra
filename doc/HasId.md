# HasId - id支持

提供通用的id生成与读写机制. 默认情况下使用[shortid](https://www.npmjs.com/package/shortid)生成id.

## 引用方式

### mixin方式

``` js
import HasId from 'litchy/lib/mixin/HasId'
import mix from 'litchy/lib/mix'

class Base {
  // ...
}

class Foobar extends mix(Base).with(HasId) {
  someMethod() {
    conssole.log(this.id)
  }
}
```

### 装饰方式

``` js
import hasid from 'litchy/lib/decorator/hasid'

@hasid
class Foobar {
  someMethod() {
    conssole.log(this.id)
  }
}
```

## 属性

### id[只读]

id值. 

## 方法

### dispose()

清理资源.

### initId(id)

初始化对象id值, 建议在子类构造函数中调用. 

#### 参数

* id {string} id值.  

#### 返回值

无. 

### changeId(newId)

更换id. 如果子类mixin了Eventable, 此方法会发送`id-change`事件. 

#### 参数

* newId {string} 新id值. 

#### 返回值

{string} 原id值. 

## 装饰

### @hasid

在类定义前添加此装饰, 你定义的类会自动mixin HasId. 
