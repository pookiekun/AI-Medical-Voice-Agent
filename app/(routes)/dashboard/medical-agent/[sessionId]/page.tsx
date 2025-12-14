"use client"
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { PhoneCall, PhoneOff, Circle, Loader2Icon } from 'lucide-react'
import Vapi from '@vapi-ai/web'
import { toast } from 'sonner'

interface doctorAgent {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId: string;
}

type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
}

function MedicalVoiceAgent() {
    const { sessionId } = useParams();
    const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
    const [callStarted, setCallStarted] = useState(false);
    const [vapiInstance, setVapiInstance] = useState<any>();
    const [currentRole, setCurrentRole] = useState<string>();
    const [liveTranscript, setLiveTranscript] = useState<string>();
    const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        // Initialize Vapi only once on mount
        if (!vapiInstance && process.env.NEXT_PUBLIC_VAPI_API_KEY) {
            const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
            setVapiInstance(vapi);
        }
        
        sessionId && GetSessionDetails();
    }, [sessionId])

    const GetSessionDetails = async () => {
        const result = await axios.get('/api/session-chat?sessionId=' + sessionId);
        console.log(result.data);
        setSessionDetail(result.data);
    }

    const StartCall = async () => {
        if (!vapiInstance) {
            console.error('Vapi not initialized. Check NEXT_PUBLIC_VAPI_API_KEY');
            return;
        }

        const VapiAgentConfig = {
            name: 'AI Medical Doctor Voice Agent',
            firstMessage: "Hi there! I'm your AI Medical Assistant. I'm here to help you with your health concerns today. How can I assist you?",
            transcriber: {
                provider: 'assembly-ai',
                language: 'en'
            },
            voice: {
                provider: 'vapi',
                voiceId: sessionDetail?.selectedDoctor?.voiceId
            },
            model: {
                provider: 'openai',
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: sessionDetail?.selectedDoctor?.agentPrompt
                    }
                ]
            }
        };
        
        try {
            await vapiInstance.start(VapiAgentConfig);
            
            vapiInstance.on('call-start', () => {
                console.log('Call started');
                setCallStarted(true);
            });
            vapiInstance.on('call-end', () => {
                setCallStarted(false);
                console.log('Call ended');
            });
            vapiInstance.on('message', (message: any) => {
                if (message.type === 'transcript') {
                    const { role, transcript } = message;
                    console.log(`${message.role}: ${message.transcript}`);
                    setLiveTranscript(transcript);
                    setCurrentRole(role);
                }
            });
            vapiInstance.on('speech-start', () => {
                console.log('Assistant started speaking');
                setCurrentRole('assistant');
            });
            vapiInstance.on('speech-end', () => {
                console.log('Assistant stopped speaking');
                setCurrentRole('user');
            });
            vapiInstance.on('error', (error: any) => {
                console.error('Vapi error:', error);
            });
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    }

    const endCall = () => {
        if (!vapiInstance) return;
        // Save the last live transcript as a message if it exists
        if (liveTranscript && liveTranscript.length > 0 && currentRole) {
            setMessages(prev => [...prev, { role: currentRole, content: liveTranscript }]);
        }
        // Stop the call
        vapiInstance.stop();
        // Remove listeners (good for memory management)
        vapiInstance.removeAllListeners('call-start');
        vapiInstance.removeAllListeners('call-end');
        vapiInstance.removeAllListeners('message');
        vapiInstance.removeAllListeners('speech-start');
        vapiInstance.removeAllListeners('speech-end');
        setCallStarted(false);
        setVapiInstance(null);
        // Delay report generation to ensure message state is updated
        setTimeout(() => {
            GenerateReport();
        }, 100);
    }

    const GenerateReport = async () => {
        setLoading(true);
        const result = await axios.post('/api/medical-report', {
            messages: messages,
            sessionDetail: sessionDetail,
            sessionId: sessionId
        });
        setLoading(false);
        toast.success('Your report is generated!');
        router.replace('/dashboard');
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
                        {messages?.slice(-4).map((msg, index) => (
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
                        <Button variant='destructive' className='mt-10' onClick={() => endCall()}>
                            <PhoneOff /> Disconnect
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
export default MedicalVoiceAgent
