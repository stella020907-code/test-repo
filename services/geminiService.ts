
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

type Language = 'ko' | 'en';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyPrompts: Record<Language, string> = {
    ko: "이 이미지의 분위기, 무드, 그리고 핵심 요소들을 분석해주세요. 분석을 바탕으로, 이 세계를 배경으로 하는 매력적이고 감성적인 이야기의 첫 문단을 한국어로 작성해주세요. 전체적인 톤은 이미지와 일치해야 합니다. 제목이나 '다음은 첫 문단입니다'와 같은 소개글은 추가하지 마세요.",
    en: "Analyze the atmosphere, mood, and key elements of this image. Based on your analysis, write a compelling and evocative opening paragraph for a story set in this world, in English. The overall tone should match the image. Do not add a title or any introductory text like 'Here is the first paragraph'."
};

const voiceMap: Record<Language, string> = {
    ko: 'Kore',
    en: 'Zephyr'
};

export async function generateStoryFromImage(base64ImageData: string, mimeType: string, language: Language): Promise<string> {
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64ImageData,
    },
  };

  const textPart = {
    text: storyPrompts[language]
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating story from image:", error);
    throw new Error("The AI service failed to generate a story.");
  }
}

export async function generateSpeechFromText(text: string, language: Language): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceMap[language] },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from the API.");
        }
        return base64Audio;

    } catch (error) {
        console.error("Error generating speech from text:", error);
        throw new Error("The AI service failed to generate audio.");
    }
}
