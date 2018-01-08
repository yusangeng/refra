
export function action (target, key, descriptor) {
  if (descriptor.get || descriptor.set) {
    throw new TypeError(`Property should NOT be decorated by @action.`)
  }

  const fn = descriptor.value

  return {
    value: function (...params) {
      this.startBatch()
      let error = null

      try {
        fn.apply(this, params)
      } catch (err) {
        error = err
      }

      this.endBatch()
      if (error) throw error
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
      fn.apply(this, [() => this.endBatch()].concat(params))
    }
  }
}
