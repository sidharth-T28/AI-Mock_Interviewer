import React, { useState } from 'react';
import { Lightbulb, WebcamIcon, Volume2 } from 'lucide-react';

function QuestionSection({ mockInterviewQuestion , activeIndex, setActiveIndex}) {
  
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakQuestion = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      speech.text = mockInterviewQuestion[activeIndex].question;
      speech.rate = 0.9; // Speed (0.1 to 10)
      speech.pitch = 9; // Pitch (0 to 2)
      
      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(speech);
    } else {
      alert("Text-to-speech is not supported in your browser");
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!mockInterviewQuestion || !Array.isArray(mockInterviewQuestion) || mockInterviewQuestion.length === 0) {
    return (
      <div className='p-5 border rounded-b-lg'>
        <p>No questions available.</p>
      </div>
    );
  }

  return (
    <div className='p-5 border rounded-b-lg bg-teal-50'>
      {/* Bubble Navigation */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {mockInterviewQuestion.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 rounded-full text-sm font-medium 
              ${activeIndex === index 
                ? 'bg-teal-600 text-white' 
                : 'bg-white text-teal-700 border border-teal-300 hover:bg-teal-100'}
            `}
          >
            Question {index + 1}
          </button>
        ))}
      </div>

      {/* Selected Question (no answer) */}
      <div className='p-4 border border-teal-200 rounded-lg bg-white'>
        <div className="flex justify-between items-start mb-2">
          <h2 className='text-lg font-bold text-teal-700'>
            Question #{activeIndex + 1}
          </h2>
          <button
            onClick={isSpeaking ? stopSpeaking : speakQuestion}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium
              ${isSpeaking 
                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'}
            `}
          >
            <Volume2 className="w-4 h-4" />
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
        </div>
        
        <p className='text-gray-800 mb-4'>
          {mockInterviewQuestion[activeIndex].question}
        </p>

        <div className='my-10 p-5 border-2 border-rose-200 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 shadow-md transform transition hover:scale-[1.01]'>
          <h2 className='flex items-center gap-2 font-bold mb-4 text-rose-700 text-xl'>
            <Lightbulb className="w-6 h-6 text-rose-500" />
            <span>Note</span>
          </h2>
          <p className='text-rose-700 font-medium leading-relaxed'>{process.env.NEXT_PUBLIC_QUESTION_NOTE}</p>
        </div>
      </div>
    </div>
  );
}

export default QuestionSection;