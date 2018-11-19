/* global describe it */

import 'babel-polyfill'
import chai from 'chai'
import mix from 'mix-with'
import DisposableMixin from '../src/mixin/Disposable'

class Disposable extends mix().with(DisposableMixin) {
}

chai.should()

describe('Disposable', _ => {
  describe('#constructor', _ => {
    it('should NOT throw error.', done => {
      void new Disposable()
      done()
    })
  })

  describe('#disposed', _ => {
    const dsp = new Disposable()

    it('sould be false when sidpose has\'nt been called.', done => {
      void dsp.disposed.should.to.be.false
      done()
    })

    it('sould be true when sidpose has been called.', done => {
      dsp.dispose()
      void dsp.disposed.should.to.be.true
      done()
    })
  })

  describe('#dispose', _ => {
    it('should NOT throw error.', done => {
      const dsp = new Disposable()
      dsp.dispose()
      done()
    })

    it('should be called just once.', done => {
      const dsp = new Disposable()
      dsp.dispose();
      (_ => dsp.dispose()).should.throw()
      done()
    })
  })

  describe('#assertUndisposed', _ => {
    it('should throw an error when obj is disposed.', done => {
      const dsp = new Disposable()
      dsp.dispose();
      (_ => dsp.assertUndisposed()).should.throw()
      done()
    })

    it('should NOT throw error when obj is NOT disposed.', done => {
      const dsp = new Disposable()
      dsp.assertUndisposed()
      done()
    })
  })
})
