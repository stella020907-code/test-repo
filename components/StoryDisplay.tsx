
import React from 'react';
import { BookOpenIcon, SpeakerWaveIcon } from './icons';
import { Spinner } from './Spinner';

type Language = 'ko' | 'en';

const text: Record<Language, Record<string, string>> = {
    ko: {
        waiting: "당신의 이야기가 기다리고 있어요...",
        waitingSub: "이미지를 업로드하여 이야기를 시작하세요.",
        generating: "생성 중...",
        readAloud: "소리내어 읽기",
    },
    en: {
        waiting: "Your story awaits...",
        waitingSub: "Upload an image to begin the narrative.",
        generating: "Generating...",
        readAloud: "Read Aloud",
    }
};

interface StoryDisplayProps {
  story: string;
  isLoadingStory: boolean;
  isLoadingAudio: boolean;
  onReadAloud: () => void;
  language: Language;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
    </div>
);


export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoadingStory, isLoadingAudio, onReadAloud, language }) => {
  return (
    <div className="flex flex-col h-full bg-gray-900/50 p-6 rounded-lg">
      <div className="flex-grow min-h-[200px] overflow-y-auto pr-2">
        {isLoadingStory ? (
            <SkeletonLoader />
        ) : story ? (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{story}</p>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <BookOpenIcon className="w-12 h-12 mb-4" />
            <p className="font-semibold">{text[language].waiting}</p>
            <p className="text-sm">{text[language].waitingSub}</p>
          </div>
        )}
      </div>
      {story && !isLoadingStory && (
        <div className="mt-6 flex-shrink-0">
          <button
            onClick={onReadAloud}
            disabled={isLoadingAudio}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingAudio ? (
              <>
                <Spinner className="w-5 h-5 mr-2" />
                {text[language].generating}
              </>
            ) : (
              <>
                <SpeakerWaveIcon className="w-5 h-5 mr-2" />
                {text[language].readAloud}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
