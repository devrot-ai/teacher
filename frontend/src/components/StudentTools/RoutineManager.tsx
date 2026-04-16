import React, { useState, useEffect } from "react";

interface RoutineTask {
  id: string;
  title: string;
  durationMinutes: number;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Done" | "Skipped";
  startTime?: Date;
  endTime?: Date;
}

const RoutineManager: React.FC = () => {
  const [tasks, setTasks] = useState<RoutineTask[]>([
    { id: "1", title: "Math Revision", durationMinutes: 45, priority: "High", status: "Pending" },
    { id: "2", title: "Read Chapter 4", durationMinutes: 30, priority: "Medium", status: "Pending" },
    { id: "3", title: "Science Project", durationMinutes: 60, priority: "High", status: "Pending" },
    { id: "4", title: "Organize Notes", durationMinutes: 15, priority: "Low", status: "Pending" },
  ]);

  const [startTime, setStartTime] = useState<string>("09:00");

  useEffect(() => {
    recalculateTimings(tasks, startTime);
  }, [startTime]);

  const recalculateTimings = (currentTasks: RoutineTask[], baseStartTime: string) => {
    let [hours, minutes] = baseStartTime.split(":").map(Number);
    let currentTime = new Date();
    currentTime.setHours(hours, minutes, 0, 0);

    const pendingHigh = currentTasks.filter(t => t.priority === "High" && t.status === "Pending");
    const pendingMedium = currentTasks.filter(t => t.priority === "Medium" && t.status === "Pending");
    const pendingLow = currentTasks.filter(t => t.priority === "Low" && t.status === "Pending");
    
    // Ordered by priority
    const orderedPending = [...pendingHigh, ...pendingMedium, ...pendingLow];
    
    const updatedTasks = currentTasks.map(t => ({ ...t }));

    // Reset all pending times
    orderedPending.forEach(pt => {
      const taskIndex = updatedTasks.findIndex(t => t.id === pt.id);
      
      const taskStart = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + pt.durationMinutes);
      const taskEnd = new Date(currentTime);
      
      updatedTasks[taskIndex].startTime = taskStart;
      updatedTasks[taskIndex].endTime = taskEnd;
    });

    setTasks(updatedTasks);
  };

  const handleStatusChange = (id: string, newStatus: "Done" | "Skipped") => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    recalculateTimings(newTasks, startTime);
  };

  const formatTime = (date?: Date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("30");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: RoutineTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      durationMinutes: parseInt(newTaskDuration) || 30,
      priority: newTaskPriority,
      status: "Pending"
    };
    const updated = [...tasks, newTask];
    recalculateTimings(updated, startTime);
    setNewTaskTitle("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end bg-orange-50 p-4 rounded-xl border border-orange-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Task</label>
          <input 
            type="text" 
            value={newTaskTitle} 
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. History Reading"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
          />
        </div>
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mins</label>
          <input 
            type="number" 
            value={newTaskDuration} 
            onChange={(e) => setNewTaskDuration(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select 
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as any)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <button 
          onClick={addTask}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            task.status === 'Done' ? 'bg-green-50 border-green-200 opacity-60' : 
            task.status === 'Skipped' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200'
          }`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-semibold ${task.status !== 'Pending' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.priority}
                </span>
                <span className="text-sm text-gray-500">{task.durationMinutes}m</span>
              </div>
              <div className="text-sm font-mono text-gray-500 mt-1">
                {task.status === 'Pending' ? `${formatTime(task.startTime)} - ${formatTime(task.endTime)}` : task.status}
              </div>
            </div>
            {task.status === 'Pending' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange(task.id, "Done")}
                  className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Done
                </button>
                <button 
                  onClick={() => handleStatusChange(task.id, "Skipped")}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  title="Skip to adjust other timings"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            No routines planned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineManager;
