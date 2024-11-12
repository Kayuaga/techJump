"use client"
import React, {FC, ReactNode} from 'react'

import styles from './style.module.scss'

interface IProps {
    // close: () => void
    header?: string
    isThin?: boolean
    children?: ReactNode
}

export const ModalCard: FC<IProps> = ({isThin, header, children}) => {
    return (
        <div
            className={styles.container}>
            <div className={styles.headerContainer}>
                <div className={styles.header}>{header}</div>
                <button onClick={()=> console.log('HELLO!v1.7.0')}>Cross icon should be there=)</button>
            </div>
            <>{children}</>
        </div>
    )
}
