'use client'
import React, { useEffect, useState } from 'react'
import { Webcam, Video, Send } from 'lucide-react'
import useSpeechToText from 'react-hook-speech-to-text';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import moment from 'moment';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

function RecordAnsSection({ mockInterviewQuestion, chatSession, mockId,  activeIndex }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      setUserAnswer('');
      setFeedback('');
      startSpeechToText();
    }
  };

  useEffect(() => {
    if (!isRecording && results.length > 0) {
      const fullTranscript = results.map(r => r.transcript).join(' ') + (interimResult || '');
      setUserAnswer(fullTranscript.trim());
    }
  }, [isRecording, results, interimResult]);

  const getCurrentQuestion = () => {
    if (!mockInterviewQuestion || mockInterviewQuestion.length === 0) {
      return "No question available";
    }
    return mockInterviewQuestion[activeIndex]?.question || "Question not found";
  };

  const getFeedback = async () => {
    if (!userAnswer) {
      alert("Please record an answer first");
      return;
    }

    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const feedbackPrompt = `
You are an expert interview coach. Please provide short feedback on this interview response.

Question: ${getCurrentQuestion()}
Candidate's Answer: ${userAnswer}

Please provide:
1. A rating from 1-10
2. Specific areas for improvement
3. Suggestions for better responses

All these in short and crisp form.
      `;

      const result = await model.generateContent(feedbackPrompt);
      const feedbackText = result.response.text();
      setFeedback(feedbackText);

      const ratingMatch = feedbackText.match(/rating[:\- ]+(\d+)/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;

      await db.insert(UserAnswer).values({
        mockIdRef: mockId,
        question: mockInterviewQuestion[activeIndex]?.question,
        correctans: mockInterviewQuestion[activeIndex]?.answer,
        userAns: userAnswer,
        feedback: feedbackText,
        rating: rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD')
      });

    } catch (error) {
      console.error("Error getting feedback or saving to DB:", error);
      setFeedback("Sorry, there was an error getting feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Webcam className="w-5 h-5" />
        Record Answer Section
      </h2>

      <div className="w-full h-[300px] bg-black rounded-md flex items-center justify-center">
        <Video className="w-10 h-10 text-white opacity-60" />
      </div>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 ${isRecording ? 'bg-red-600' : 'bg-teal-600'} text-white rounded hover:opacity-90 transition flex-1`}
          onClick={toggleRecording}
        >
          {isRecording ? 'Stop Recording' : 'Record Answer'}
        </button>

        {userAnswer && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
            onClick={getFeedback}
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Processing...' : 'Get Feedback'}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {isRecording && <p className="text-gray-600">Listening...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {results.length > 0 && (
          <div className="mt-2 p-3 bg-white rounded border">
            <h3 className="font-medium text-gray-700 mb-2">Transcript:</h3>
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.timestamp}>{result.transcript}</li>
              ))}
              {interimResult && <li className="text-gray-500">{interimResult}</li>}
            </ul>
          </div>
        )}

        {userAnswer && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-700 mb-1">Your Answer:</h4>
            <p className="text-green-800">{userAnswer}</p>
          </div>
        )}

        {isLoading && (
          <div className="p-3 bg-gray-100 border rounded flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="ml-2 text-gray-600">Analyzing your answer...</span>
          </div>
        )}

        {feedback && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-700 mb-1">Interview Feedback:</h4>
            <pre className="text-blue-800 whitespace-pre-wrap font-sans">{feedback}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecordAnsSection;
