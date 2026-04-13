import { useState, useCallback, useRef, useEffect } from "react";

export interface TTSOptions {
  rate?: number;    // 0.1 to 10, default 1
  pitch?: number;   // 0 to 2, default 1
  volume?: number;  // 0 to 1, default 1
  lang?: string;    // BCP 47 language tag, e.g. "en-US", "hi-IN"
}

export interface TTSState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useTTS(options: TTSOptions = {}) {
  const [state, setState] = useState<TTSState>({
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    isSpeaking: false,
    isPaused: false,
    voices: [],
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (!state.isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setState((prev) => ({ ...prev, voices }));
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [state.isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!state.isSupported || !text.trim()) return;

      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.lang ?? "en-US";

      // Try to find a matching voice
      if (state.voices.length > 0) {
        const langCode = options.lang ?? "en-US";
        const matchingVoice = state.voices.find(
          (v) => v.lang.startsWith(langCode.split("-")[0])
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true, isPaused: false }));
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
      };

      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [state.isSupported, state.voices, options.rate, options.pitch, options.volume, options.lang]
  );

  const pause = useCallback(() => {
    if (!state.isSupported) return;
    window.speechSynthesis.pause();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [state.isSupported]);

  const resume = useCallback(() => {
    if (!state.isSupported) return;
    window.speechSynthesis.resume();
    setState((prev) => ({ ...prev, isPaused: false }));
  }, [state.isSupported]);

  const stop = useCallback(() => {
    if (!state.isSupported) return;
    window.speechSynthesis.cancel();
    setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
  }, [state.isSupported]);

  const toggle = useCallback(
    (text: string) => {
      if (state.isSpeaking && !state.isPaused) {
        pause();
      } else if (state.isPaused) {
        resume();
      } else {
        speak(text);
      }
    },
    [state.isSpeaking, state.isPaused, speak, pause, resume]
  );

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    toggle,
  };
}

export default useTTS;
