
import React, { useRef } from 'react';
import { UploadIcon, TrashIcon } from './icons';

type Language = 'ko' | 'en';

const text: Record<Language, Record<string, string>> = {
    ko: {
        drop: "이곳에 이미지를 드롭하세요",
        browse: "또는 클릭해서 찾아보세요",
        removeLabel: "이미지 제거",
    },
    en: {
        drop: "Drop your image here",
        browse: "or click to browse",
        removeLabel: "Remove image",
    }
};

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | undefined;
  onReset: () => void;
  language: Language;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl, onReset, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {imageUrl ? (
        <div className="w-full aspect-video rounded-lg overflow-hidden relative group">
          <img src={imageUrl} alt="Uploaded scene" className="w-full h-full object-cover" />
          <button
            onClick={onReset}
            className="absolute top-3 right-3 bg-black/60 hover:bg-red-600/80 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={text[language].removeLabel}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full aspect-video border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-colors"
        >
            <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-400 font-semibold">{text[language].drop}</p>
            <p className="text-gray-500 text-sm">{text[language].browse}</p>
        </div>
      )}
    </div>
  );
};
