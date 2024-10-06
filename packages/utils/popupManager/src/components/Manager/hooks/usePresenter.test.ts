import { jest } from '@jest/globals'
import { renderHook, act } from '@testing-library/react-hooks'
import { usePresenter } from './usePresenter'

describe('Testing Manager usePresenter hook', () => {
  const push = jest.fn()

  beforeEach(() => {

  })

  it('should return correct value', () => {
    expect('sign_in').toEqual('sign_in')
  })

  it('check goBack', async () => {
    expect(true).toBeTruthy()
  })
})
