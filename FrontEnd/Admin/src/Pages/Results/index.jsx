import React from 'react'
import Sidebar from '../../Components/Sidebar'

export default function Result() {
  return (
    <>
      <div className="overflow-hidden h-screen w-full">
        <Sidebar activeNum={5} />
      </div>
    </>
  )
}
