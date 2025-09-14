"use client";
import React from 'react'
import BorrowBookModal from './_components/borrow-thesis';
import SuccessBorrowThesisModal from './_components/success-borrow-thesis';
import { api } from '@/trpc/react';

function Layout({children} : {children:React.ReactNode}) {
  api.mobile.student.getThesisDueDayCount.useQuery()
  return (
    <div className='relative'>
      {children}
      <BorrowBookModal/>
      <SuccessBorrowThesisModal/>
    </div>
  )
}

export default Layout