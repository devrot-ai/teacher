import React, { useState } from "react";
import RoutineManager from "./RoutineManager";
import WorkoutManager from "./WorkoutManager";
import VoiceNotes from "./VoiceNotes";

const StudentToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"routine" | "workout" | "voice">("routine");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 mt-20">
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
          Student Utilities
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Manage your daily routines, customize your physical and cognitive workouts, and take rapid voice notes to boost your learning efficiency.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-200/50 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("routine")}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "routine" 
                ? "bg-white text-orange-600 border-b-2 border-orange-500 shadow-sm" 
                : "text-gray-500 hover:text-orange-500 hover:bg-orange-50/30"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Routine Manager
          </button>
          <button
            onClick={() => setActiveTab("workout")}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-l border-gray-100 ${
              activeTab === "workout" 
                ? "bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm" 
                : "text-gray-500 hover:text-blue-500 hover:bg-blue-50/30"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Workout Manager
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-l border-gray-100 ${
              activeTab === "voice" 
                ? "bg-white text-green-600 border-b-2 border-green-500 shadow-sm" 
                : "text-gray-500 hover:text-green-500 hover:bg-green-50/30"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            Voice Notes
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {activeTab === "routine" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <RoutineManager />
            </div>
          )}
          {activeTab === "workout" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <WorkoutManager />
            </div>
          )}
          {activeTab === "voice" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <VoiceNotes />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentToolsPage;
