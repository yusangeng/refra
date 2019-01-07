/**
 * 子模块支持.
 *
 * @author Y3G
 */

import isFunction from 'lodash.isfunction'
import mapValue from '../../utils/mapValue'
import undisposed from '../../decorator/undisposed'

const { keys, defineProperty, freeze } = Object

export default superclass => class HasChildren extends superclass {
  initHasChildren (children) {
    this.observableChildren_ = {}

    keys(children).forEach(key => {
      let child
      const formal = this[key]

      if (formal && formal.isReactive) {
        child = formal
      } else {
        child = children[key]

        if (isFunction(child)) {
          child = child()
        }
      }

      this.defineChild(key, child)
    })

    return this
  }

  @undisposed
  dispose () {
    keys(this.observableChildren_).forEach(key => {
      this.observableChildren_[key].dispose()
    })

    this.observableChildren_ = {}

    super.dispose()
  }

  @undisposed
  getChild (name) {
    const model = this.observableChildren_[name]

    if (!model) {
      throw new Error(`Bad model name: ${name}.`)
    }

    return model
  }

  @undisposed
  getChildSnapshotByName (name, freezed = true) {
    const model = this.observableChildren_[name]

    if (!model) {
      throw new Error(`Bad model name: ${name}.`)
    }

    return model.getSnapshot(freezed)
  }

  @undisposed
  getChildrenSnapshot (freezed = true) {
    const snapshot = mapValue(this.observableChildren_, (_, key) => this.getChildSnapshotByName(key, freezed))
    return freezed ? freeze(snapshot) : snapshot
  }

  @undisposed
  updateChild (name, data) {
    if (!this.hasChild(name)) {
      throw new Error(`Bad child model name: ${name}.`)
    }

    const model = this.getChild(name)

    model.setProps(data)

    return this
  }

  @undisposed
  hasChild (name) {
    return !!(this.observableChildren_ && this.observableChildren_[name])
  }

  @undisposed
  defineChild (name, other) {
    if (this.hasOwnProperty(name) && other !== this[name]) {
      throw new Error(`The child model name(${name}) has neen used by other field.`)
    }

    this.addClearer(other.on('update', evt => {
      this.addPendingPropChange(name, other.getSnapshot())

      if (!this.isActing) {
        this.doTriggerChanges()
      }
    }))

    defineProperty(this, name, {
      enumerable: true,
      get: this.getChildSnapshotByName.bind(this, name)
    })

    this.observableChildren_[name] = other

    return this
  }
}
