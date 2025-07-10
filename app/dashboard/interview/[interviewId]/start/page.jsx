"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import QuestionSection from './_components/QuestionSection';
// import RecordAnsSection from './_components/RecordAnsSection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dynamic from 'next/dynamic';

const RecordAnsSection = dynamic(() => import('./_components/RecordAnsSection'), {
  ssr: false,
});


function StartInterview() {
  const params = useParams();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    const fetchInterview = async () => {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      const interview = result[0];

      if (interview?.jsonMockResp) {
        const cleaned = interview.jsonMockResp.replace(/\\"/g, '"');
        try {
          const parsed = JSON.parse(cleaned);
          setMockInterviewQuestion(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          const extracted = extractJsonObjects(cleaned);
          setMockInterviewQuestion(extracted);
        }
      }
    };

    const initChat = async () => {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chat = await model.startChat({ history: [] });
      setChatSession(chat);
    };

    fetchInterview();
    initChat();
  }, [params.interviewId]);

  const extractJsonObjects = (str) => {
    const results = [];
    const regex = /{"question":"(.*?)","answer":"(.*?)"}/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      results.push({
        question: match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        answer: match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
      });
    }
    return results;
  };

  if (!chatSession) {
    return <div className="text-center py-10 text-gray-500">Loading interview...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left - Webcam and Recording */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-xl border shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-rose-700">Recording</h2>
          <RecordAnsSection 
              mockInterviewQuestion={mockInterviewQuestion} 
              chatSession={chatSession}
              mockId={params.interviewId}
              activeIndex={activeIndex}
          />
        </div>

        {/* Right - Questions */}
        <div className="bg-white p-4 rounded-xl border shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Questions</h2>
          {mockInterviewQuestion.length > 0 ? (
            <QuestionSection 
            mockInterviewQuestion={mockInterviewQuestion}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex} />
          ) : (
            <p className="text-gray-500">No questions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
