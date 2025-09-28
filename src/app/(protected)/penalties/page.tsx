import { IconClockShield } from '@tabler/icons-react'
import React from 'react'
import { SectionCards } from '../dashboard/_components/section-cards'
import PenaltiesTable from './_components/penalties-table'

function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <IconClockShield className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Penalties</h2>
            {/* <p className="-mt-1 text-sm">Thesis vault overall report.</p> */}
          </div>
        </div>
      </div>
      <PenaltiesTable/>
    </div>
  )
}

export default Page