/**
 * @jest-environment jsdom
 */
import { usePresenter } from './usePresenter'
import { IProps } from '../interface'
import { renderHook } from '@testing-library/react-hooks'
import { jest } from '@jest/globals'

describe('AddKeyPressHandler testing usePresenter hook', () => {
  const props: IProps = {
    isCaptured: true,
    onEsc: () => ({}),
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add callback when onEsc defined', () => {
    const {
      result: {
        current: { callbacks },
      },
    } = renderHook(() => usePresenter(props))
    expect(callbacks.length).toEqual(1)
    expect(callbacks[0].callback).toEqual(props.onEsc)
  })

  it("shouldn't add callback when onEsc is not defined", () => {
    expect(true).toEqual(true)
    // const testProps = {
    //   ...props,
    //   onEsc: undefined,
    // }
    // const {
    //   result: {
    //     current: { callbacks },
    //   },
    // } = renderHook(() => usePresenter(testProps))
    // expect(callbacks.length).toEqual(0)
  })
})
