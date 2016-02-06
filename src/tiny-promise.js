import {
  isFunction,
  defineProp
} from './helper/util'

import * as promiseState from './constant/promiseState'
import resolve from './resolve'
import reject from './reject'

function TinyPromise (executor) {
  if (!isFunction(executor))
    throw TypeError('Not a function')

  this.state = promiseState.PENDING
  this.msg = void 0
  this.chains = []

  this['then'] = (onFullfilled, onRejected) => {
    onFullfilled = isFunction(onFullfilled) ? onFullfilled : () => void 666
    onRejected = isFunction(onRejected) ? onRejected : () => void 233

    let o = {
      onFullfilled,
      onRejected
    }

    o.promise = new this.constructor((resolve, reject) => {
      o = Object.assign(o, {resolve, reject})
    })

    this.chains = [...this.chains, o]

    // doesn't call resolve or reject in executor async-ly
    if (this.state === promiseState.FULLFILLED)
      resolve.call(this)
    else if (this.state === promiseState.REJECTED)
      reject.call(this)

    return o.promise
  }

  this['catch'] = onRejected =>
    this['then'](void 0, onRejected)

  executor(resolve.bind(this), reject.bind(this))
}

defineProp(TinyPromise, 'resolve', msg =>
  new TinyPromise((resolve, reject) => {
    resolve(msg)
  })
)

defineProp(TinyPromise, 'reject', msg =>
  new TinyPromise((resolve, reject) =>
    reject(msg)
  )
)

export default TinyPromise
