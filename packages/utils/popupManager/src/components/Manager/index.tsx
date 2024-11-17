import React, { FC } from 'react'

import { IConfig } from '../../interfaces'

import { usePresenter } from './hooks/usePresenter'

interface IProps {
  config: IConfig
}
export const Manager: FC<IProps> = ({ config }) => {
  const { popups, goBack } = usePresenter()
  console.log('New changes in our manager!')
  return <>
    {
      popups.map((popup, i)=> {
        const ModalWindow = config[popup]
        return ModalWindow && <ModalWindow  key={popup+i} close={goBack}/>
      })
    }
  </>


}
