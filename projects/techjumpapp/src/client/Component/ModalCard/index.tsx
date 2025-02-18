"use client"
import {ModalCard} from '@kayuaga/ui-kit'
import {useCallback} from "react";
import {serverConfig} from '../../../serverConfig'

// @ts-ignore
export const Modal: FC<any> = ({ children }) => {
    const secondClick = useCallback(() => {
        fetch('api/clickTwo', {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }})
    },[])

    const firstClick = useCallback(() => {
        fetch('api/clickOne', {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }})
    },[])
    return (<ModalCard secondClick={secondClick} firstClick={firstClick}>{children}</ModalCard>)
}