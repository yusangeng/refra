import Logger from 'chivy'

const log = new Logger('chivy/decorator/action')

export function action (target, key, descriptor) {
  if (descriptor.get || descriptor.set) {
    throw new TypeError(`Property should NOT be decorated by @action.`)
  }

  const fn = descriptor.value

  return {
    value: function (...params) {
      this.startBatch()
      let error = null
      let ret = null

      try {
        ret = fn.apply(this, params)
      } catch (err) {
        error = err
      }

      this.endBatch()
      if (error) throw error

      return ret
    }
  }
}

export function asyncAction (target, key, descriptor) {
  if (descriptor.get || descriptor.set) {
    throw new TypeError(`Property should NOT be decorated by @action.`)
  }

  const fn = descriptor.value

  return {
    value: function (...params) {
      this.startBatch()
      const ret = fn.apply(this, params)

      if (ret.then && ret.catch) {
        // 返回promise
        ret.then((...params) => {
          this.endBatch()
          return Promise.resolve(...params)
        }).catch(err => {
          log.error(`Error occured during async action invoked. error: ${err.message || err}, action name: ${fn.mame || '[unknown]'}.`)
          return Promise.reject(err)
        })
      }

      // 如果不反回promise, 则等同同步action
      this.endBatch()

      return ret
    }
  }
}
