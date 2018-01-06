/* global describe it */

import 'babel-polyfill'
import chai from 'chai'
import mix from 'mix-with'
import EventableMixin from '../src/mixin/Eventable'
import HasIdMixin from '../src/mixin/HasId'

class HasId extends mix().with(EventableMixin, HasIdMixin) {
  constructor (id) {
    super()
    this.initId(id)
  }
}

chai.should()

describe('HasId', _ => {
  describe('#constructor', _ => {
    it('should NOT throw error.', done => {
      const h = new HasId()
      done()
    })
  })

  describe('#id property', _ => {
    it('should be a string.', done => {
      const h = new HasId()
      // console.log(h.id)
      h.id.should.be.string
      done()
    })

    it('should be equal to input.', done => {
      const h = new HasId('qwerty')
      // console.log(h.id)
      h.id.should.be.equal('qwerty')
      done()
    })

    it('should be equal to mapRawId(input).', done => {
      var temp = null
      class HasIdX extends HasId {
        mapRawId (id) {
          // console.log(`map ${id} to x-${id}`)
          temp = `x-${id}`
          return `x-${id}`
        }
      }
      const h = new HasIdX()
      console.log(h.id)
      h.id.should.be.equal(temp)
      done()
    })
  })
})
