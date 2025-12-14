import React from "react"
import { Button } from "@/components/ui/button"
import  Historylist  from './_components/Historylist'
import DoctorAgentList from './_components/DoctorAgentList'
import AddNewSessionDialog from "./_components/AddNewSessionDialog" 
function Dashboard() {
    return (
        <div>
            <div className='flex justify-between items-center '>
            <h2 className='font-bold text-2xl '> My Dashboard</h2>
            <AddNewSessionDialog />
        </div>
        <Historylist />

        <DoctorAgentList />
        </div>
    )
}

export default Dashboard