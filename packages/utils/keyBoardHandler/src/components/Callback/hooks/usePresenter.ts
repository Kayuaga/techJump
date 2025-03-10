import { useRef, useEffect } from 'react'

import {foo} from '../../foo'

import { IProps } from '../interfaces'
import callbacks from '../../../models/callbacks'

export const baz = ()=> console.log('Shake baz')

export const usePresenter = ({ callbackData }: IProps): void => {
  const { callback, isCaptured, keyName } = callbackData

  const value = useRef({
    callback,
    isCaptured,
  })

  useEffect(() => {
    value.current = {
      callback,
      isCaptured,
    }
  }, [callback, isCaptured])

  useEffect(() => {
    const remove = callbacks.add(keyName, value)

    return () => {
      remove()
    }
  }, [])
}
