import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

 export type doctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string
}
type props={
    doctorAgent:doctorAgent
}

function DoctorAgentCard({doctorAgent}: props) {
    return (
        <div >
           <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={200}
           className='w-full h-[250px] object-cover rounded-2xl shadow-md'/>
           <h2 className='font-bold  mt-2'>{doctorAgent.specialist}</h2>
           <p className='line-clamp-2 text-sm text-gray-500 mt-1'>{doctorAgent.description}</p>
           <Button className='w-full mt-2'>Start Consultation <ArrowRight className='w-4 h-4 ml-1' /></Button>
        </div>
    )
}

export default DoctorAgentCard
