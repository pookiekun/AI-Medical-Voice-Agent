"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { Loader2, ArrowRight } from 'lucide-react';
import SuggestedDoctorCard from './SuggestedDoctorCard';

interface doctorAgent {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
}

function AddNewSessionDialog() {
    const router = useRouter();
    const [note, setNote] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>();
    const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const OnclickNext = async () => {
      setLoading(true);
      try {
        const result = await axios.post('/api/users/suggest-doctors', { notes: note });
        if (result.data.error) {
          alert(result.data.error);
        } else {
          setSuggestedDoctors(result.data);
        }
      } catch (error: any) {
        alert("Service is busy. Please wait 30 seconds and try again.");
        console.error("Error:", error);
      }
      setLoading(false);
    }

    const onStartConsultation = async () => {
      setLoading(true);
      // Save All Info To Database
      const result = await axios.post('/api/session-chat', {
        notes: note,
        selectedDoctor: selectedDoctor
      });
      console.log(result.data);
      if (result.data) {
        // Route to new Conversation Screen
        router.push('/dashboard/medical-agent/' + result.data.sessionId);
      }
      setLoading(false);
    }

    if (!mounted) {
      return <Button className='mt-3'>+ Start a Consultation</Button>;
    }
    
    return (
        <Dialog>
          <DialogTrigger asChild>
            <Button className='mt-3'>+ Start a Consultation</Button>
          </DialogTrigger>
          <DialogContent className={suggestedDoctors ? 'sm:max-w-[600px]' : ''}>
            <DialogHeader>
              <DialogTitle>Add Basic Details</DialogTitle>
              <DialogDescription asChild>
                {!suggestedDoctors ? (
                  <div>
                    <h2>Add Symptoms or Any Other Details</h2>
                    <Textarea 
                      placeholder='Add Detail here...'
                      className='h-[200px] mt-1'
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className='text-black font-medium mb-3'>Select a Doctor</h2>
                    <div className='grid grid-cols-3 gap-5'>
                      {suggestedDoctors.map((doctor, index) => (
                        <SuggestedDoctorCard 
                          doctorAgent={doctor} 
                          key={index}
                          selectedDoctor={selectedDoctor}
                          setSelectedDoctor={() => setSelectedDoctor(doctor)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={'outline'}>Cancel</Button>
              </DialogClose>
              {!suggestedDoctors ? (
                <Button disabled={!note || loading} onClick={() => OnclickNext()}>
                  Next {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
                </Button>
              ) : (
                <Button disabled={!selectedDoctor || loading} onClick={() => onStartConsultation()}>
                  Start Consultation {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}

export default AddNewSessionDialog