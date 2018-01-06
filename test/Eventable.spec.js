/* global describe it */

import 'babel-polyfill'
import chai from 'chai'
import mix from 'mix-with'
import DisposableMixin from '../src/mixin/Disposable'
import EventableMixin from '../src/mixin/Eventable'

class E extends mix().with(DisposableMixin, EventableMixin) {
}

chai.should()

describe('Eventable', _ => {
  describe('#constructor', _ => {
    it('should NOT throw error.', done => {
      const e = new E()
      e.dispose()
      done()
    })
  })

  describe('#on', _ => {
    it('should listen.', done => {
      const e = new E()
      let flag = 0

      e.on('foobar', evt => { flag = evt.data })

      e.trigger({
        type: 'foobar',
        data: 1
      }).then(evt => {
        try {
          evt.type.should.to.be.equal('foobar')
          evt.target.should.to.be.equal(e)
          flag.should.to.be.equal(1)
          done()
        } catch (err) {
          done(new Error('Failed'))
        }
      }).catch(_ => done(new Error('Failed')))
    })

    it('should listen types.', done => {
      const e = new E()
      let flag = 0

      e.on(['foo', 'bar'], evt => { flag += evt.data })

      e.trigger({
        type: 'foo',
        data: 1
      }).then(evt => {
        try {
          evt.type.should.to.be.equal('foo')
          evt.target.should.to.be.equal(e)
          flag.should.to.be.equal(1)

          e.trigger({
            type: 'bar',
            data: 1
          }).then(evt => {
            try {
              evt.type.should.to.be.equal('bar')
              evt.target.should.to.be.equal(e)
              flag.should.to.be.equal(2)
              done()
            } catch (err) {
              done(err)
            }
          }).catch(err => done(err))
        } catch (err) {
          done(err)
        }
      }).catch(err => done(err))
    })

    it('should stop listening by calling handle.', done => {
      const e = new E()
      let flag = 0
      const handle = e.on('foobar', evt => { flag = evt.data })

      handle()

      e.trigger({
        type: 'foobar',
        data: 1
      }).then(_ => {
        flag.should.to.be.equal(0)
        done()
      }).catch(_ => done(new Error('Failed')))
    })

    it('should pause.', done => {
      const e = new E()
      let flag = 0
      e.on('foobar', evt => { flag = evt.data })
      e.pauseEvent()

      e.trigger({
        type: 'foobar',
        data: 1
      }).then(_ => {
        flag.should.to.be.equal(0)
        done()
      }).catch(err => done(err))
    })

    it('should resume.', done => {
      const e = new E()
      let flag = 0
      e.on('foobar', evt => { flag = evt.data })

      e.pauseEvent()
      e.resumeEvent()

      e.trigger({
        type: 'foobar',
        data: 1
      }).then(_ => {
        flag.should.to.be.equal(1)
        done()
      }).catch(err => done(err))
    })
  })

  describe('#dispose', _ => {
    it('should throw error.', done => {
      const e = new E()

      e.dispose();

      (_ => e.trigger({})).should.throw();
      (_ => e.on('', _ => _)).should.throw();
      (_ => e.off({})).should.throw()

      done()
    })

    it('should stop listening.', done => {
      const e = new E()
      let flag1 = 0
      let flag2 = 0

      e.on('foobar', evt => { flag1 = evt.data })
      e.on('foobar', evt => { flag2 = evt.data })

      e.trigger({
        type: 'foobar',
        data: 1
      }).then(evt => {
        try {
          evt.type.should.to.be.equal('foobar')
          evt.target.should.to.be.equal(e)
          flag1.should.to.be.equal(0)
          flag2.should.to.be.equal(0)
          done()
        } catch (err) {
          done(new Error('Failed'))
        }
      }).catch(_ => done(new Error('Failed')))

      e.dispose()
    })
  })

  describe('#afterEvents', _ => {
    class My extends E {
      constructor () {
        super()
        this.count = 0
      }

      afterEvents (events) {
        this.count = events.length
      }
    }

    it('should has 3 events when afterEvents called.', done => {
      const my = new My()

      my.trigger('a')
      my.trigger('a')
      my.trigger('a')

      setTimeout(_ => {
        my.count.should.to.be.equal(3)
        done()
      }, 100)
    })
  })
})
