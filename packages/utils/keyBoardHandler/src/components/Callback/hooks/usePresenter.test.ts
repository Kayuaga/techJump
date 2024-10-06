/**
 * @jest-environment jsdom
 */
import { usePresenter } from './usePresenter'
import { renderHook } from '@testing-library/react-hooks'

import { KeyNames } from '../../../interfaces'
import { IProps } from '../interfaces'

import callbacks from '../../../models/callbacks'
import { jest } from '@jest/globals'

jest.mock('../../../models/callbacks')

describe('Callback hooks ', () => {
  const mockAddCallback = callbacks.add as jest.Mock
  const remove = jest.fn()

  mockAddCallback.mockReturnValue(remove)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call add function on mount and remove on unmount', async () => {
    const props: IProps = {
      callbackData: {
        isCaptured: true,
        callback: () => ({}),
        keyName: KeyNames.ESC,
      },
    }
    const { unmount } = renderHook(() => usePresenter(props))
    expect(mockAddCallback).toBeCalledWith(props.callbackData.keyName, {
      current: {
        isCaptured: props.callbackData.isCaptured,
        callback: props.callbackData.callback,
      },
    })

    unmount()
    expect(remove).toBeCalled()
  })
})
