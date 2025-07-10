import { GoogleGenAI } from '@google/genai';

class GeminiAIModal {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({
      apiKey: apiKey || process.env.GEMINI_API_KEY,
    });
    this.defaultConfig = {
      responseMimeType: 'text/plain',
    };
    this.defaultModel = 'gemini-2.5-pro-preview-03-25';
  }

  async generateContent(prompt, model = this.defaultModel, config = this.defaultConfig) {
    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    try {
      const response = await this.ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      let fullResponse = '';
      for await (const chunk of response) {
        fullResponse += chunk.text;
      }
      return fullResponse;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }


  async generateContent(prompt, model = this.defaultModel, config = this.defaultConfig) {
    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];
  
    let retries = 2;
    while (retries > 0) {
      try {
        const response = await this.ai.models.generateContentStream({
          model,
          config,
          contents,
        });
  
        let fullResponse = '';
        for await (const chunk of response) {
          fullResponse += chunk.text;
        }
        return fullResponse;
  
      } catch (error) {
        if (error?.response?.status === 429) {
          console.warn('Rate limited. Retrying...');
          retries--;
          await new Promise(res => setTimeout(res, 1000)); // wait 1 sec
        } else {
          console.error('Error generating content:', error);
          throw error;
        }
      }
    }
  
    throw new Error("Too many requests. Please try again later.");
  }
  
}

export default GeminiAIModal;