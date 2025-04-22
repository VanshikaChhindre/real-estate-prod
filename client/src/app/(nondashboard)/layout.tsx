"use client";

import Navbar from '@/components/Navbar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import React from 'react'
import { useGetAuthUserQuery } from '@/state/api'

const Layout = ({children} : {children : React.ReactNode}) => {
 const {data: authUser} = useGetAuthUserQuery();

  return (
    <div className="h-full w-full">
         <Navbar/>
        
        <main className={`h-full flex w-full flex-col`}
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
            {children}
        </main>
    </div>
  )
}

export default Layout