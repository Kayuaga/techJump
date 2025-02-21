import React, {FC, ReactNode} from 'react'

import styles from './style.module.scss'

interface IProps {
    // close: () => void
    header?: string
    isThin?: boolean
    children?: ReactNode,
    firstClick: ()=> void,
    secondClick: ()=> void,
}

export const ModalCard: FC<IProps> = ({ header, children, firstClick,secondClick}) => {
    return (
        <div
            className={styles.container}>
            <div className={styles.headerContainer}>
                <div className={styles.header}>{header}</div>
                <button onClick={firstClick}>First click</button>
                <button onClick={secondClick}>Second click</button>
            </div>
            <>{children}</>
        </div>
    )
}
