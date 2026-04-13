import { useState, useCallback, useRef, useEffect } from "react";

// Browser speech recognition types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export interface STTOptions {
  lang?: string;         // BCP 47 language tag, default "en-US"
  continuous?: boolean;  // Keep listening after each result
  interimResults?: boolean; // Show partial results while speaking
}

export interface STTState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export function useSTT(options: STTOptions = {}) {
  const [state, setState] = useState<STTState>({
    isSupported:
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    isListening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  const recognitionRef = useRef<any>(null);

  // Initialize recognition instance
  useEffect(() => {
    if (!state.isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = options.lang ?? "en-US";
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "Speech recognition error";
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "No microphone found. Please connect a microphone.";
          break;
        case "not-allowed":
          errorMessage = "Microphone access denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error. Speech recognition requires internet.";
          break;
        case "aborted":
          // User stopped — not an error
          setState((prev) => ({
            ...prev,
            isListening: false,
            interimTranscript: "",
            error: null,
          }));
          return;
        default:
          errorMessage = `Speech error: ${event.error}`;
      }

      setState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: "",
        error: errorMessage,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: "",
      }));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [state.isSupported, options.lang, options.continuous, options.interimResults]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setState((prev) => ({
      ...prev,
      isListening: true,
      error: null,
      interimTranscript: "",
    }));

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started — ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Not started — ignore
    }

    setState((prev) => ({
      ...prev,
      isListening: false,
      interimTranscript: "",
    }));
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
      error: null,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

export default useSTT;
