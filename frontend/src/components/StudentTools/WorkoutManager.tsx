import React, { useState } from "react";

interface Workout {
  id: string;
  type: "Physical" | "Brain";
  title: string;
  durationMins: number;
  completed: boolean;
}

const defaultWorkouts: Workout[] = [
  { id: "1", type: "Physical", title: "Morning Stretch & Jumping Jacks", durationMins: 10, completed: false },
  { id: "2", type: "Physical", title: "Walk or Jog", durationMins: 20, completed: false },
  { id: "3", type: "Brain", title: "Sudoku / Crossword", durationMins: 15, completed: false },
  { id: "4", type: "Brain", title: "Memory Match Challenge", durationMins: 10, completed: false },
];

const WorkoutManager: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(defaultWorkouts);

  const [newType, setNewType] = useState<"Physical" | "Brain">("Physical");
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("10");

  const toggleComplete = (id: string) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, completed: !w.completed } : w));
  };

  const removeWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const addWorkout = () => {
    if (!newTitle.trim()) return;
    const newTask: Workout = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle,
      durationMins: parseInt(newDuration) || 10,
      completed: false
    };
    setWorkouts([...workouts, newTask]);
    setNewTitle("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          Customize Workout
        </h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <label className="block text-sm text-gray-700 mb-1">Type</label>
            <select 
              value={newType} 
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full border-gray-300 rounded-lg p-2 border"
            >
              <option value="Physical">Physical</option>
              <option value="Brain">Brain</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Workout Activity</label>
            <input 
              type="text" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Chess puzzles"
              className="w-full border-gray-300 rounded-lg p-2 border"
            />
          </div>
          <div className="w-24">
            <label className="block text-sm text-gray-700 mb-1">Mins</label>
            <input 
              type="number" 
              value={newDuration} 
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-2 border"
            />
          </div>
          <button 
            onClick={addWorkout}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span className="bg-red-100 text-red-600 p-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
            Physical Workout
          </h4>
          <div className="space-y-3">
            {workouts.filter(w => w.type === "Physical").map(w => (
              <div key={w.id} className="flex items-center gap-3 p-3 border rounded-xl bg-white hover:border-blue-300 transition-colors">
                <input 
                  type="checkbox" 
                  checked={w.completed} 
                  onChange={() => toggleComplete(w.id)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className={`flex-1 ${w.completed ? 'opacity-50 line-through' : ''}`}>
                  <p className="font-medium text-gray-800">{w.title}</p>
                  <p className="text-xs text-gray-500">{w.durationMins} mins</p>
                </div>
                <button onClick={() => removeWorkout(w.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))}
            {workouts.filter(w => w.type === "Physical").length === 0 && (
              <p className="text-sm text-gray-500 italic">No physical workouts planned.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            </span>
            Brain Workout
          </h4>
          <div className="space-y-3">
            {workouts.filter(w => w.type === "Brain").map(w => (
              <div key={w.id} className="flex items-center gap-3 p-3 border rounded-xl bg-white hover:border-purple-300 transition-colors">
                <input 
                  type="checkbox" 
                  checked={w.completed} 
                  onChange={() => toggleComplete(w.id)}
                  className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <div className={`flex-1 ${w.completed ? 'opacity-50 line-through' : ''}`}>
                  <p className="font-medium text-gray-800">{w.title}</p>
                  <p className="text-xs text-gray-500">{w.durationMins} mins</p>
                </div>
                <button onClick={() => removeWorkout(w.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))}
            {workouts.filter(w => w.type === "Brain").length === 0 && (
              <p className="text-sm text-gray-500 italic">No brain workouts planned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutManager;
