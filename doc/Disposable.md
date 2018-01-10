# Disposable - 资源清理支持

js的垃圾回收是不可控的, 一个本该被抛弃的对象仍然被引用或者调用, 是开发中的常见错误. Disposable提供源清理方法, 以及检查资源是否已经被清理的方法, 以方便排查这种错误. 

## 引用方式

### mixin方式

``` js
import Disposable from 'litchy/lib/mixin/Disposable'
import mix from 'litchy/lib/mix'

class Base {
  // ...
}

class Foobar extends mix(Base).with(Disposable) {
  someMethod() {
    this.assertUndisposed('undisposed')
    // ...
  }
}
```

### 装饰方式

``` js
import disposable from 'litchy/lib/decorator/disposable'
import undisposed from 'litchy/lib/decorator/undisposed'

@disposable
class Foobar {
  @undisposed
  someMethod() {
    // ...
  }
}
```

## 属性

### disposed[只读]

是否已经被清理. 

## 方法

### dispose()

清理对象资源, 默认实现不做任何清理, 只会将`disposed`属性设为`true`. 自定义清理过程由子类重写`dispose`方法实现. 
**注意**: 请务必在子类`dispose`方法结尾, 调用`super.dispose()`. 

### assertUndisposed(methodName)

断言当前对象的资源没有被清理, 如果已经被清理, 则抛出异常. 

#### 参数

* methodName {string} 当前方法名, 会在抛出的异常中包含, 方便错误排查. 

#### 返回值

无. 

## 装饰

### @disposable

在类定义前添加此装饰, 你定义的类会自动mixin Disposable. 

### @undisposed

在方法前添加此装饰, 你定义的方法入口处会自动添加`assertUndisposed`调用. 