import React from "react";

interface MicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  error?: string | null;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  isSupported,
  onClick,
  error,
  className = "",
}) => {
  if (!isSupported) {
    return (
      <button
        disabled
        title="Speech recognition is not supported in this browser. Use Chrome or Edge."
        className={`w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onClick}
        title={isListening ? "Stop recording" : "Start voice input"}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse scale-110"
            : "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-105"
        } ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3z" />
        </svg>
      </button>

      {/* Pulsing ring when recording */}
      {isListening && (
        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-40" />
      )}

      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 whitespace-nowrap shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default MicButton;
