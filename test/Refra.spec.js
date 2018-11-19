/* global describe it */

import 'babel-polyfill'
import chai from 'chai'

import { sleep } from 'polygala'
import {
  prop,
  computed,
  action,
  reaction
} from '../src/decorator'
import Refra from '../src/Refra'

chai.should()

class TestRefra2 extends Refra {
  reactionTimes = 0
  autoReactionTimes = 0

  @prop testProp1 = 1
  @prop testProp2 = 2

  @computed get testComputed () {
    return (this.testProp1 + this.testProp2) * 2
  }

  constructor () {
    super()
    TestRefra2.afterRefra()
  }

  testMethod () {
    this.testProp1 = 2
    this.testProp2 = 4
  }

  @action
  testAction () {
    this.testProp1 = 3
    this.testProp2 = 6
  }

  @action
  async testAsyncAction () {
    this.testProp1 = 3
    await sleep(100)
    this.testProp2 = 6
  }

  @reaction('testProp1')
  testReaction () {
    this.reactionTimes += 1
  }
}

describe('Refra superclass', _ => {
  describe('#constructor', _ => {
    it('should NOT throw', done => {
      void new TestRefra2()
      done()
    })

    it('should have right props', done => {
      const tr = new TestRefra2()

      tr.testProp1.should.be.equal(1)
      tr.testProp2.should.be.equal(2)
      tr.testComputed.should.be.equal(6)

      done()
    })
  })

  describe('#dispose', _ => {
    it('should NOT throw', done => {
      const tr = new TestRefra2()
      tr.dispose()
      done()
    })

    it('should throw when call method after dispose', done => {
      const tr = new TestRefra2()
      tr.dispose()
      tr.getPropValue.bind(tr, 'testProp1').should.throw()
      done()
    })
  })

  describe('#testMethod', _ => {
    it('should have right props atfer testMethod', done => {
      const tr = new TestRefra2()

      tr.testMethod()

      tr.testProp1.should.be.equal(2)
      tr.testProp2.should.be.equal(4)
      tr.testComputed.should.be.equal(12)

      done()
    })
  })

  describe('#testAction', _ => {
    it('should trigger prop-changes ONLY once', async () => {
      const tr = new TestRefra2()
      let i = 0

      tr.on('prop-changes', _ => i++)
      tr.testAction()

      await sleep(100)

      i.should.be.equal(1)
    })

    it('should have right props atfer testAction', async () => {
      const tr = new TestRefra2()

      tr.testAction()
      tr.testProp1.should.be.equal(3)
      tr.testProp2.should.be.equal(6)
      tr.testComputed.should.be.equal(18)
    })
  })

  describe('#testAsyncAction', _ => {
    it('should trigger prop-changes ONLY once', async () => {
      const tr = new TestRefra2()
      let i = 0

      tr.on('prop-changes', _ => i++)
      await tr.testAsyncAction()
      await sleep(100)

      i.should.be.equal(1)
    })

    it('should have right props atfer testAsyncAction', async () => {
      const tr = new TestRefra2()

      await tr.testAsyncAction()
      tr.testProp1.should.be.equal(3)
      tr.testProp2.should.be.equal(6)
      tr.testComputed.should.be.equal(18)
    })
  })

  describe('#reaction', _ => {
    it('should have right reactionTimes value after reaction', async () => {
      const tr = new TestRefra2()

      tr.startBatch()
      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4
      tr.endBatch()

      await sleep(100)

      tr.reactionTimes.should.be.equal(1)
    })

    it('should have right reactionTimes value after reaction', async () => {
      const tr = new TestRefra2()

      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4

      await sleep(100)

      tr.reactionTimes.should.be.equal(3)
    })
  })
})
