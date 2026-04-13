import React from "react";
import { useTTS } from "../../hooks/useTTS";

interface TTSButtonProps {
  text: string;
  lang?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({
  text,
  lang = "en-US",
  size = "sm",
  label,
  className = "",
}) => {
  const { isSpeaking, isPaused, isSupported, toggle, stop } = useTTS({
    lang,
    rate: 0.95,
  });

  if (!isSupported) return null;

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const iconSize = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
  };

  const isActive = isSpeaking || isPaused;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        onClick={() => toggle(text)}
        title={
          isSpeaking && !isPaused
            ? "Pause reading"
            : isPaused
            ? "Resume reading"
            : "Read aloud"
        }
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
          isActive
            ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110"
            : "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-105"
        }`}
      >
        {isSpeaking && !isPaused ? (
          /* Pause icon */
          <svg className={iconSize[size]} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          /* Speaker / Play icon */
          <svg className={iconSize[size]} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 010 7.07" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        )}
      </button>

      {isActive && (
        <button
          onClick={stop}
          title="Stop reading"
          className="w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-all"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      )}

      {label && (
        <span className="text-xs text-gray-500">{label}</span>
      )}
    </div>
  );
};

export default TTSButton;
