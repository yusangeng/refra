/**
 * 监听属性变化的副作用支持.
 *
 * @author Y3G
 */

import isFunction from 'lodash.isfunction'
import undisposed from '../../decorator/undisposed'

export default superclass => class HasReaction extends superclass {
  @undisposed
  dispose () {
    delete this.reactions_

    super.dispose()
  }

  @undisposed
  initHasReaction (reactions) {
    this.reactionHandlerBound_ = false
    this.reactions_ = []
    this.defineReactions(reactions)
    return this
  }

  @undisposed
  defineReactions (reactions) {
    reactions.forEach(reaction => {
      this.reactions_.push(this.createReactionItem(reaction))
    })

    return this.listenUpdateForReaction()
  }

  // private

  createReactionItem (desc) {
    if (isFunction(desc)) {
      throw new Error('Refra does NOT support @autoReaction decorator.')
    }

    const item = {
      fn: desc.fn.bind(this),
      observing: desc.observing
    }

    return item
  }

  listenUpdateForReaction () {
    if (this.reactionHandlerBound_) {
      return
    }

    this.reactionHandlerBound_ = true
    return this.addClearer(this.on('changes', this.handlerForReaction.bind(this)))
  }

  handlerForReaction (evt) {
    const reactions = this.reactions_
    const { changes } = evt

    const invokingReactions = reactions.filter(reaction => {
      return reaction.observing.some(el => !!changes.find(change => {
        return change.name === el
      }))
    })

    const values = changes.reduce((prev, el) => {
      prev[el.name] = el
      return prev
    }, {})

    invokingReactions.forEach(reaction => reaction.fn(values))
  }
}
