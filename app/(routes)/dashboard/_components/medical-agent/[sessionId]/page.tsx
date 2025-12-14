"use client"
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { PhoneCall, PhoneOff, Circle } from 'lucide-react'
import Vapi from '@vapi-ai/web'

interface doctorAgent {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
}

type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
}

type Message = {
  role: string;
  content: string;
}

function MedicalVoiceAgent() {
    const { sessionId } = useParams();
    const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_KEY || '');
    const [callStarted, setCallStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [currentRole, setCurrentRole] = useState('');
    
    

    useEffect(() => {
        sessionId && GetSessionDetails();
    }, [sessionId])

    const GetSessionDetails = async () => {
        const result = await axios.get('/api/session-chat?sessionId=' + sessionId);
        console.log(result.data);
        setSessionDetail(result.data);
    }

    const StartCall = () => {
        vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID || '');
        vapi.on('call-start', () => {
            console.log('Call started');
            setCallStarted(true);
        });
        vapi.on('call-end', () => {
            setCallStarted(false);
            console.log('Call ended');
        });
        vapi.on('message', (message) => {
            if (message.type === 'transcript') {
                console.log(`${message.role}: ${message.transcript}`);
                setCurrentRole(message.role);
                setLiveTranscript(message.transcript);
                if (message.transcriptType === 'final') {
                    setMessages(prev => [...prev, {
                        role: message.role,
                        content: message.transcript
                    }]);
                    setLiveTranscript('');
                }
            }
        });
    }

    const StopCall = () => {
        vapi.stop();
        setCallStarted(false);
    }

    return (
        <div className='p-5 border rounded-3xl bg-secondary'>
            <div className='flex justify-between items-center'>
                <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'>
                    <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`} />
                    {callStarted ? 'Connected...' : 'Not Connected'}
                </h2>
                <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
            </div>
            {sessionDetail && (
                <div className='flex items-center flex-col mt-10'>
                    <Image 
                        src={sessionDetail?.selectedDoctor?.image} 
                        alt={sessionDetail?.selectedDoctor?.specialist || 'Doctor'}
                        width={120}
                        height={120}
                        className='h-[100px] w-[100px] object-cover rounded-full'
                    />
                    <h2 className='mt-2 text-lg'>{sessionDetail?.selectedDoctor?.specialist}</h2>
                    <p className='text-sm text-gray-400'>AI Medical Voice Agent</p>
                    <div className='mt-10 w-full max-w-md h-64 overflow-y-auto px-8 flex flex-col items-center'>
                        {messages?.slice(-4).map((msg: Message, index: number) => (
                            <h2 className='text-gray-400 p-2 w-full' key={index}>
                                {msg.role}: {msg.content}
                            </h2>
                        ))}
                        {liveTranscript && liveTranscript?.length > 0 && (
                            <h2 className='text-lg p-2 w-full'>{currentRole}: {liveTranscript}</h2>
                        )}
                    </div>
                    {!callStarted ? (
                        <Button className='mt-10' onClick={StartCall}>
                            <PhoneCall /> Start Call
                        </Button>
                    ) : (
                        <Button variant='destructive' className='mt-10' onClick={StopCall}>
                            <PhoneOff /> Disconnect
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
export default MedicalVoiceAgent