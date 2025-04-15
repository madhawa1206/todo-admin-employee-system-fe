import React, { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import { Task } from '../types';
import api from '../services/api';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await api.get('/api/tasks/my');
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    let updatedTasks = [...tasks];

    if (statusFilter !== 'all') {
      const isCompleted = statusFilter === 'completed';
      updatedTasks = updatedTasks.filter((task) => task.completed === isCompleted);
    }

    if (priorityFilter !== 'all') {
      updatedTasks = updatedTasks.filter((task) => task.priority === priorityFilter);
    }

    updatedTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    updatedTasks.sort((a, b) => Number(a.completed) - Number(b.completed));

    setFilteredTasks(updatedTasks);
  }, [tasks, statusFilter, priorityFilter]);

  const handleEdit = (_task: Task) => {};

  const handleDelete = async (id: number) => {
    await api.delete(`/api/tasks/${id}`);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleToggleComplete = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      await api.put(`/api/tasks/${id}/update`, updatedTask);
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? updatedTask : t)));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My Tasks</h1>
      <div className="flex space-x-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
