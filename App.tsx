
import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryDisplay } from './components/StoryDisplay';
import { generateStoryFromImage, generateSpeechFromText } from './services/geminiService';
import { playAudio } from './utils/audio';

type Language = 'ko' | 'en';

const uiText: Record<Language, Record<string, string>> = {
  ko: {
    title: "이야기 엮는 AI",
    subtitle: "한 장의 이미지에서 천 마디 이야기가 피어납니다.",
    imageReadError: "이미지 파일을 읽는 데 실패했습니다.",
    storyGenerationError: "이야기 생성에 실패했습니다. AI 서비스 사용량이 많을 수 있습니다. 다시 시도해 주세요.",
    audioGenerationError: "오디오 생성에 실패했습니다. 나중에 다시 시도해 주세요.",
  },
  en: {
    title: "Story Weaver AI",
    subtitle: "A thousand words bloom from a single image.",
    imageReadError: "Failed to read the image file.",
    storyGenerationError: "Failed to generate the story. The AI service may be busy. Please try again.",
    audioGenerationError: "Failed to generate audio. Please try again later.",
  }
};

const App: React.FC = () => {
  const [imageData, setImageData] = useState<{ url: string; mimeType: string; data: string; } | null>(null);
  const [story, setStory] = useState<string>('');
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<Language>('ko');

  const handleImageUpload = (file: File) => {
    setStory('');
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setImageData({
        url: result,
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = () => {
      setError(uiText[language].imageReadError);
    };
    reader.readAsDataURL(file);
  };

  const generateStory = useCallback(async () => {
    if (!imageData) return;

    setIsLoadingStory(true);
    setError('');
    try {
      const generatedStory = await generateStoryFromImage(imageData.data, imageData.mimeType, language);
      setStory(generatedStory);
    } catch (err) {
      console.error(err);
      setError(uiText[language].storyGenerationError);
    } finally {
      setIsLoadingStory(false);
    }
  }, [imageData, language]);

  useEffect(() => {
    if (imageData) {
      generateStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData, language]);

  const handleReadAloud = async () => {
    if (!story) return;

    setIsLoadingAudio(true);
    setError('');
    try {
      const audioData = await generateSpeechFromText(story, language);
      await playAudio(audioData);
    } catch (err) {
      console.error(err);
      setError(uiText[language].audioGenerationError);
    } finally {
      setIsLoadingAudio(false);
    }
  };
  
  const handleReset = () => {
    setImageData(null);
    setStory('');
    setError('');
    setIsLoadingStory(false);
    setIsLoadingAudio(false);
  };
  
  const LanguageButton: React.FC<{lang: Language, children: React.ReactNode}> = ({ lang, children }) => (
      <button
        onClick={() => setLanguage(lang)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          language === lang
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {children}
      </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          {uiText[language].title}
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          {uiText[language].subtitle}
        </p>
        <div className="flex justify-center gap-3 mt-4">
            <LanguageButton lang="ko">한국어</LanguageButton>
            <LanguageButton lang="en">English</LanguageButton>
        </div>
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
        <div className="w-full bg-gray-800/50 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              imageUrl={imageData?.url} 
              onReset={handleReset} 
              language={language}
            />
            <StoryDisplay
              story={story}
              isLoadingStory={isLoadingStory}
              isLoadingAudio={isLoadingAudio}
              onReadAloud={handleReadAloud}
              language={language}
            />
          </div>
        </div>
      </main>
      
      <footer className="w-full max-w-4xl text-center mt-8 py-4">
        <p className="text-gray-500 text-sm">Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
