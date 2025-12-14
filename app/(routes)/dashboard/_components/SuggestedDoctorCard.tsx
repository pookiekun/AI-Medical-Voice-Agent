import Image from "next/image";

interface doctorAgent {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
}

type props = {
  doctorAgent: doctorAgent;
  selectedDoctor?: doctorAgent;
  setSelectedDoctor: () => void;
}

function SuggestedDoctorCard({ doctorAgent, selectedDoctor, setSelectedDoctor }: props) {
  return (
    <div 
      onClick={setSelectedDoctor}
      className={`flex flex-col items-center border rounded-2xl shadow p-5 cursor-pointer hover:border-blue-500 transition-all ${selectedDoctor?.id === doctorAgent.id ? 'border-blue-500' : ''}`}
    >
      <Image 
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={70}
        height={70}
        className='w-[50px] h-[50px] rounded-full object-cover'
      />
      <h2 className='font-bold text-sm text-center mt-2'>{doctorAgent.specialist}</h2>
      <p className='text-xs text-center line-clamp-2 text-gray-500'>{doctorAgent.description}</p>
    </div>
  )
}

export default SuggestedDoctorCard