/**
 * id支持
 *
 * @author Y3G
 */

import shortid from 'shortid'
import check from 'param-check'
import Logger from 'chivy'
import isString from 'lodash/isString'

const log = new Logger('litchy/mixin/HasId')

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
      check(id.length, 'id.length').gt(0)
      this.id_ = id
      log.debug(`External id: ${id}.`)

      return id
    }

    const newId = this.mapRawId(shortid())
    this.id_ = newId
    log.debug(`Generated id: ${newId}.`)

    return newId
  }

  changeId (id) {
    check(id, 'id').isString().got('length').gt(0)
    log.warn(`Changing id is DANGEROUS, ${this.id} -> ${id}.`)

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

  mapRawId (rawId) {
    // 由子类重写
    return rawId
  }
}
