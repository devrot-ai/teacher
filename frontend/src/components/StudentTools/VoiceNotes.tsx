import React, { useState, useEffect, useRef } from "react";
import TTSButton from "../ui/TTSButton";

interface Note {
  id: string;
  text: string;
  date: Date;
}

const VoiceNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setCurrentTranscript(prev => prev + finalTranscript + interimTranscript);
        // Clear interim transcript for better UI flow, appending only finals usually works better,
        // but for simplicity we show raw string:
        setCurrentTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setCurrentTranscript("");
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const saveNote = () => {
    if (!currentTranscript.trim()) return;
    setNotes([
      { id: Date.now().toString(), text: currentTranscript, date: new Date() },
      ...notes
    ]);
    setCurrentTranscript("");
    setIsRecording(false);
    if (isRecording) {
      recognitionRef.current?.stop();
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          Dictate Note
        </h3>
        
        {!isSupported && (
          <div className="text-red-500 text-sm mb-4">
            Speech Recognition is not supported in this browser. Please use Chrome.
          </div>
        )}

        <div className="relative mb-4">
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500 resize-none shadow-sm"
            placeholder="Click the microphone to start speaking, or type here manually..."
            value={currentTranscript}
            onChange={(e) => setCurrentTranscript(e.target.value)}
          />
          {isRecording && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleRecording}
            disabled={!isSupported}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
              isRecording 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
            {isRecording ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            )}
          </button>
          <button
            onClick={saveNote}
            disabled={!currentTranscript.trim()}
            className="bg-gray-800 text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-900 transition-all disabled:opacity-50 shadow-md"
          >
            Save Note
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Saved Voice Notes</h4>
        {notes.length === 0 ? (
          <p className="text-gray-500 italic">No notes saved yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map(note => (
              <div key={note.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{note.text}</p>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-xs text-gray-400">
                    {note.date.toLocaleDateString()} {note.date.toLocaleTimeString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <TTSButton text={note.text} size="sm" />
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceNotes;
