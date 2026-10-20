import { clsx } from 'cn'
import React, { ReactNode } from 'react'

const Container = ({children, className}: {children: ReactNode, className?:string}) => {
  return (
    <div className={clsx("container mx-auto px-5",className)}>
        {children}
    </div>
  )
}

export default Container