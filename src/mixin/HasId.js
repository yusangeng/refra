/**
 * id支持
 *
 * @author Y3G
 */

import shortid from '../utils/shortid'
import isString from '../utils/isString'

function inv (fn, that, ...params) {
  if (fn) {
    return fn.apply(that, params || [])
  }
}

export default superclass => class HasId extends superclass {
  get id () {
    return this.id_
  }

  constructor (...params) {
    super(...params)
    this.id_ = null
  }

  initId (id) {
    if (isString(id)) {
      this.id_ = id
      return id
    }

    const newId = this.mapRawId(shortid())

    this.id_ = newId
    return newId
  }

  changeId (id) {
    if (this.id === id) {
      return
    }

    inv(this.trigger, this, {
      type: 'id-change',
      id: id,
      prevId: this.id
    })

    const ret = this.id
    this.id_ = id

    return ret
  }

  // private

  mapRawId (rawId) {
    // 由子类重写
    return rawId
  }
}
