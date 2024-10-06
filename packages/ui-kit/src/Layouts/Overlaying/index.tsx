import React, {FC} from 'react'

import styles from './style.module.scss'

interface IProps {
    onClose: () => void
    children: React.ReactElement
    dataTest?: string
}

export const OverlayingPopupLayout: FC<IProps> = (props) => {
    // test commit
    return (
        <div className={styles.container} data-test={props.dataTest}>
            <div onClick={props.onClose} className={styles.overlay}/>
            <div className={styles.content}>{props.children}</div>
        </div>
    )
}
