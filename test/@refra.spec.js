/* global describe it */

import 'babel-polyfill'
import chai from 'chai'

import { sleep } from 'polygala'
import {
  obx,
  action,
  reaction,
  refra,
  on
} from '../src/decorator'

chai.should()

@refra
class TestRefra {
  reactionTimes = 0
  autoReactionTimes = 0
  propChangesEventHandlerTimes = 0

  @obx testProp1 = 1
  @obx testProp2 = 2

  @obx get testComputed () {
    return (this.testProp1 + this.testProp2) * 2
  }

  // constructor () {
  //   console.log('new TestRefra')
  // }

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

  @on('changes')
  onPropChanges (evt) {
    this.propChangesEventHandlerTimes++
  }
}

describe('@refra', _ => {
  describe('#constructor', _ => {
    it('should NOT throw', done => {
      void new TestRefra()
      done()
    })

    it('should have right props', done => {
      const tr = new TestRefra()

      tr.testProp1.should.be.equal(1)
      tr.testProp2.should.be.equal(2)
      tr.testComputed.should.be.equal(6)

      done()
    })
  })

  describe('#dispose', _ => {
    it('should NOT throw', done => {
      const tr = new TestRefra()
      tr.dispose()
      done()
    })

    it('should throw when call method after dispose', done => {
      const tr = new TestRefra()
      tr.dispose()
      tr.getPropValue.bind(tr, 'testProp1').should.throw()
      done()
    })
  })

  describe('#testMethod', _ => {
    it('should have right props after testMethod', done => {
      const tr = new TestRefra()

      tr.testMethod()

      tr.testProp1.should.be.equal(2)
      tr.testProp2.should.be.equal(4)
      tr.testComputed.should.be.equal(12)

      done()
    })
  })

  describe('#testAction', _ => {
    it('should trigger changes ONLY once', async () => {
      const tr = new TestRefra()
      let i = 0

      tr.on('changes', _ => i++)
      tr.testAction()

      await sleep(100)

      i.should.be.equal(1)
    })

    it('should have right props after testAction', async () => {
      const tr = new TestRefra()

      tr.testAction()
      tr.testProp1.should.be.equal(3)
      tr.testProp2.should.be.equal(6)
      tr.testComputed.should.be.equal(18)
    })
  })

  describe('#testAsyncAction', _ => {
    it('should trigger changes ONLY once', async () => {
      const tr = new TestRefra()
      let i = 0

      tr.on('changes', _ => i++)
      await tr.testAsyncAction()
      await sleep(100)

      i.should.be.equal(1)
    })

    it('should have right props after testAsyncAction', async () => {
      const tr = new TestRefra()

      await tr.testAsyncAction()
      tr.testProp1.should.be.equal(3)
      tr.testProp2.should.be.equal(6)
      tr.testComputed.should.be.equal(18)
    })
  })

  describe('#reaction', _ => {
    it('should have right reactionTimes value after reaction', async () => {
      const tr = new TestRefra()

      tr.beginAction()
      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4
      tr.endAction()

      await sleep(100)

      tr.reactionTimes.should.be.equal(1)
    })

    it('should have right reactionTimes value after reaction', async () => {
      const tr = new TestRefra()

      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4

      await sleep(100)

      tr.reactionTimes.should.be.equal(3)
    })
  })

  describe('changes event handler', _ => {
    it('should have right propChangesEventHandlerTimes', async () => {
      const tr = new TestRefra()

      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4

      await sleep(100)

      tr.propChangesEventHandlerTimes.should.be.equal(3)
    })

    it('should have right propChangesEventHandlerTimes in batch mode', async () => {
      const tr = new TestRefra()

      tr.beginAction()
      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4
      tr.endAction()

      await sleep(100)

      tr.propChangesEventHandlerTimes.should.be.equal(1)
    })
  })
})
