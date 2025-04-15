import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div className={`border p-4 rounded shadow ${task.completed ? 'bg-gray-200' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
          <p className="text-sm text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">Priority: {task.priority}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button onClick={() => onEdit(task)} className="text-blue-500 hover:underline">
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} className="text-red-500 hover:underline">
            Delete
          </button>
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm">Completed</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
