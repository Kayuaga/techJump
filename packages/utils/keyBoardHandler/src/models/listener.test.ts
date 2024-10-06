import { CallbackRef, KeyCodes, KeyNames } from '../interfaces'

import Listener from './listener'
import { jest } from '@jest/globals'

describe('models callbacks', () => {
  const isCaptured = true
  const firstCallback = jest.fn()
  const lastCallback = jest.fn()
  let listener: Listener
  let unCupteredListener: Listener
  const onEscValue = { callback: firstCallback, isCaptured }

  const callbacks: Record<KeyNames, CallbackRef[]> = {
    [KeyNames.ESC]: [
      { current: { ...onEscValue } },
      { current: { ...onEscValue, callback: lastCallback } },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    listener = new Listener(true, callbacks)
    unCupteredListener = new Listener(false, callbacks)
  })

  it("should call last callback on 'call' function", () => {
    listener.call(KeyNames.ESC)
    expect(lastCallback).toBeCalledTimes(1)
  })

  it("shouldn't call last callback when this.isCaptured and callback isCaptured are not equal", () => {
    unCupteredListener.call(KeyNames.ESC)
    expect(lastCallback).toBeCalledTimes(0)
  })

  it("it should call 'call' method on onKeyDown call when KeyCode defined", () => {
    const keyEvent = {
      keyCode: KeyCodes.ESC,
    }
    listener.call = jest.fn()

    listener.onKeyDown(keyEvent as KeyboardEvent)
    expect(listener.call).toBeCalledTimes(1)
  })

  it("it shouldn't call 'call' method on onKeyDown call when KeyCode is not defined", () => {
    listener.call = jest.fn()
    listener.onKeyDown({ keyCode: 666 } as KeyboardEvent)
    expect(listener.call).toBeCalledTimes(0)
  })
})
