import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  assignedTo: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function Tasks() {
  useAuth();

  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', isAdmin ? 'all' : 'my'],
    queryFn: async () => {
      const endpoint = isAdmin ? '/api/tasks/all' : '/api/tasks/my';
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  const updateTask = useMutation({
    mutationFn: (task: Task) =>
      api.put(`/api/tasks/${task.id}/update`, {
        completed: !task.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', isAdmin ? 'all' : 'my'] });
    },
  });

  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter === 'completed') return task.completed;
      if (statusFilter === 'pending') return !task.completed;
      return true;
    })
    .filter((task) => {
      if (priorityFilter === 'all') return true;
      return task.priority === priorityFilter;
    });

  const sortedTasks = filteredTasks.slice().sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const dueA = new Date(a.dueDate).getTime();
    const dueB = new Date(b.dueDate).getTime();
    if (dueA !== dueB) return dueA - dueB;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">My Tasks</h1>

        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border px-3 py-2 rounded"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="border px-3 py-2 rounded"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
                  <th className="p-3">Title</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`border-t ${task.completed ? 'bg-green-50' : 'bg-white'}`}
                  >
                    <td className="p-3 font-medium">{task.title}</td>
                    <td className="p-3 text-sm text-gray-700">{task.description}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm capitalize">{task.priority}</td>
                    <td className="p-3">
                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => updateTask.mutate(task)}
                        />
                        <span>{task.completed ? 'Completed' : 'Mark Complete'}</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
