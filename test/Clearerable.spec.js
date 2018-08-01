/* global describe it */

import 'babel-polyfill'
import chai from 'chai'
import mix from 'mix-with'
import EventableMixin from '../src/mixin/Eventable'
import ClearableMixin from '../src/mixin/Clearable'

class Clearable extends mix().with(EventableMixin, ClearableMixin) {
}

chai.should()

describe('Clearable', _ => {
  describe('#constructor', _ => {
    it('should NOT throw error.', done => {
      const dsp = new Clearable()
      done()
    })
  })

  describe('#clearerQueue_', _ => {
    const dsp = new Clearable()

    it('clearerQueue_ should be empty when dispose has\'nt been called.', done => {
      dsp.clearerQueue_.length.should.be.equal(0)
      done()
    })

    it('clearerQueue_.length should be 0 when addClearer has been called.', done => {
      dsp.addClearer(_ => _)
      dsp.clearerQueue_.length.should.be.equal(1)
      done()
    })

    it('clearerQueue_ should be empty when runClearers has been called.', done => {
      dsp.runClearers()
      dsp.clearerQueue_.length.should.be.equal(0)
      done()
    })
  })

  describe('#clear event listener', _ => {
    const cl = new Clearable()
    let i = 0

    cl.addClearer(cl.on('x', evt => i++))
    cl.runClearers()

    cl.trigger('x')

    it('x should be 0', done => {
      setTimeout(_ => {
        i.should.be.equal(0)
        done()
      }, 100)
    })
  })
})
