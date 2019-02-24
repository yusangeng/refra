export default function action (target, key, descriptor) {
  if (descriptor.get || descriptor.set) {
    throw new TypeError(`Property should NOT be decorated by @action.`)
  }

  const fn = descriptor.value

  return {
    value: function (...params) {
      this.beginAction(key)
      const ret = fn.apply(this, params)

      if (ret && ret.then && ret.catch) {
        // 返回promise
        return ret.then((...data) => {
          this.endAction(key)
          return Promise.resolve(...data)
        }).catch(err => {
          this.endAction(key)
          return Promise.reject(err)
        })
      }

      // 如果不反回promise, 则等同同步action
      this.endAction(key)

      return ret
    }
  }
}
