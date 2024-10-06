import { KeyNames } from '../interfaces'
import cb from './callbacks'
import { jest } from '@jest/globals'

jest.mock('./listener')

describe('models callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const callBack = { current: { callback: () => ({}), isCaptured: false } }
  it('it should add not captured callback to callback array and remove it', () => {
    cb.add(KeyNames.ESC, callBack)
    expect(cb.callbacks[KeyNames.ESC].length).toEqual(1)
    cb.remove(KeyNames.ESC, callBack)
    expect(cb.callbacks[KeyNames.ESC].length).toEqual(0)
  })

  it('it should add captured callback to callback array and remove it', () => {
    const capturedCallback = { ...callBack, isCaptured: true }
    cb.add(KeyNames.ESC, capturedCallback)
    expect(cb.callbacks[KeyNames.ESC].length).toEqual(1)
    cb.remove(KeyNames.ESC, callBack)
    expect(cb.callbacks[KeyNames.ESC].length).toEqual(0)
  })
})
