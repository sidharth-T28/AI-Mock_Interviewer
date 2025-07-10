"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import GeminiAIModal from '@/utils/GeminiAIModal' // Adjust the import path as needed
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { uuid } from 'drizzle-orm/gel-core'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment/moment'

function AddNewInterview() {
    const router = useRouter();
    const [openDialog, setOpenDialog] = useState(false);
    const [jobRole, setJobRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobExperience, setJobExperience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useUser();
  
    const onSubmit = async (e) => {
      e.preventDefault();
      if (isLoading) return;
  
      setIsLoading(true);
      setError('');
  
      const prompt = `job position: ${jobRole}, job description: ${jobDescription}, years of experience: ${jobExperience}, 
                      depends on this information please give me 5 interview questions with answer in json format.
                      give question and answers as field in json format`;
  
      try {
        const gemini = new GeminiAIModal(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
        const mockResponse = await gemini.generateContent(prompt);
  
        let response;
        let jsonString = "";

        const match = mockResponse.match(/```json\s*([\s\S]*?)```/) || mockResponse.match(/{[\s\S]*}/);
        if (match) {
        jsonString = match[1] || match[0];
        }


        try {
            response = JSON.parse(jsonString.trim());
          } catch (err) {
            console.error("Failed to parse JSON:", err);
            setError("Gemini returned invalid JSON format.");
            return;
          }


        console.log("Parsed Questions (JSON):", response);
  
        const resp = await db.insert(MockInterview).values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(response),
          jobDesc: jobDescription,
          jobPosition: jobRole,
          jobExperience: jobExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-yyyy'),
        }).returning({ mockId: MockInterview.mockId });
  
        console.log("Inserted ID:", resp);
        setOpenDialog(false); // optionally close the dialog

        router.push(`/dashboard/interview/${resp[0].mockId}`);

      } catch (error) {
        console.error("Error:", error);
        setError("Failed to generate interview questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  
      
    
    return (
        <div>
            <div 
                className='p-10 border rounded-lg bg-gray-200 hover:scale-105 hover:shadow-md cursor-pointer transition-colors'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='font-bold text-lg text-blue-800'>+ Add New</h2>
            </div>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Tell us more about your interview</DialogTitle>
                        <DialogDescription asChild>
                            <p className="text-sm text-muted-foreground mb-4">
                                Add details about your job position/role, job description, and years of experience
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className='font-bold text-blue-600'>Job Role</label>
                            <Input 
                                placeholder="Ex. Full Stack Developer" 
                                required
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className='font-bold text-blue-600'>Tech stack/job description</label>
                            <Textarea 
                                placeholder="Ex. React, Node.js, MySQL"
                                required
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className='font-bold text-blue-600'>Years of Experience</label>
                            <Input 
                                placeholder="Ex. 6"
                                required
                                type="number"
                                min="0"
                                value={jobExperience}
                                onChange={(e) => setJobExperience(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <div className='flex gap-5 justify-end pt-4'>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setOpenDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Loading..." : "Start Interview"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview