"use client"

import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Webcam from 'react-webcam'
import { Lightbulb, WebcamIcon } from 'lucide-react'

function Interview() {
  const params = useParams();
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    console.log("interviewId:", params.interviewId);
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    setInterviewData(result[0]);
    console.log("Interview Data:", result);
  };

  const toggleWebcam = () => {
    setWebCamEnabled((prev) => !prev);
  };

  return (
    <div className='my-10 px-4'>
      <h2 className='font-bold text-3xl mb-8 text-center text-teal-700 drop-shadow-sm'>Let's Get Started!</h2>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
        {/* Left Side - Interview Data and Instructions */}
        <div className='flex flex-col space-y-6'>
          {/* Interview Data Section */}
          {interviewData && (
            <div className='p-6 border-2 border-teal-200 rounded-xl bg-gradient-to-br from-white to-teal-50 shadow-md transform transition hover:scale-[1.01]'>
              <h2 className='text-xl font-bold text-teal-800 mb-3'>Job Role/Position: <span className='text-teal-600'>{interviewData.jobPosition}</span></h2>
              <p className='text-lg font-bold mt-3 text-teal-800'>Description/Tech Stack: <span className='text-teal-600'>{interviewData.jobDesc}</span></p>
              <p className='text-lg font-bold mt-3 text-teal-800'>Job Experience: <span className='text-teal-600'>{interviewData.jobExperience} years</span></p>
            </div>
          )}
          
          {/* Instructions Section */}
          <div className='p-6 border-2 border-rose-200 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 shadow-md transform transition hover:scale-[1.01]'>
            <h2 className='flex items-center gap-2 font-bold mb-4 text-rose-700 text-xl'>
              <Lightbulb className="w-6 h-6 text-rose-600" />
              <span>Instructions</span>
            </h2>
            <p className='text-rose-700 font-medium leading-relaxed'>{process.env.NEXT_PUBLIC_INFORMATION}</p>
          </div>
        </div>
        
        {/* Right Side - Webcam */}
        <div className='flex flex-col items-center'>
        <div className='w-full p-5 rounded-xl border-2 shadow-md' style={{ background: 'linear-gradient(to bottom right, mediumaquamarine, seagreen)', borderColor: 'mediumaquamarine' }}>
            {webCamEnabled ? (
            <Webcam className='h-full w-full rounded-xl shadow-inner' />
            ) : (
            <div className='h-80 w-full rounded-xl bg-white flex items-center justify-center border-2 border-dashed' style={{ borderColor: 'white' }}>
                <WebcamIcon className='h-32 w-32 opacity-70' style={{ color: '#228b22' }} />
            </div>
            )}
        </div>

        <button
            onClick={toggleWebcam}
            className={`mt-6 px-8 py-3 text-white rounded-lg shadow-md transition transform hover:scale-105 ${
            webCamEnabled 
                ? 'bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600' 
                : 'bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600'
            }`}
        >
            {webCamEnabled ? "Disable Webcam" : "Enable Webcam"}
        </button>

                {/* Start Interview Button */}
        <div className='w-full flex justify-end mt-4'>
            <a 
            href={`/dashboard/interview/${params.interviewId}/start`} 
            className='px-6 py-2 bg-[indianred] text-white rounded-lg shadow-md hover:scale-105 transition'
            >
            Start Interview
            </a>
        </div>

        </div>

      </div>
    </div>
  );
}
export default Interview;
