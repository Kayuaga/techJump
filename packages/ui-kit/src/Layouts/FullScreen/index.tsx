import React, { FC } from 'react'

import styles from './style.module.scss'

interface IProps {
  children: React.ReactElement
}

export const FullScreenPopupLayout: FC<IProps> = (props) => {
  return <div className={styles.container}>{props.children}</div>
}
