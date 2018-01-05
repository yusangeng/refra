/**
 * 资源清理支持
 *
 * @author Y3G
 */

export default superclass => class extends superclass {
  get disposed () {
    return this.disposed_
  }

  constructor () {
    super()
    this.disposed_ = false
  }

  dispose () {
    this.assertUndisposed('dispose')
    this.disposed_ = true
  }

  assertUndisposed (name = 'unknown') {
    if (this.disposed) {
      throw new Error(`Object has been disposed, method(${name}) should NOT be invoked.`)
    }
  }
}
