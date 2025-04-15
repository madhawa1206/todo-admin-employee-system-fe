import { useState } from 'react';
import Header from '../components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import UserFormModal from '../components/UserFormModal';
import { DashboardUser, Task } from '../types';

export default function Dashboard() {
  const [role, setRole] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
  const [view, setView] = useState<'tasks' | 'users'>('tasks');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/api/users/me');
      setRole(res.data.role);
      return res.data;
    },
  });

  const { data: allTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    enabled: !!role,
    queryFn: async () => {
      const endpoint = role === 'admin' ? '/api/tasks' : '/api/tasks/my';
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  const { data: allUsers } = useQuery<DashboardUser[]>({
    queryKey: ['users'],
    enabled: role === 'admin',
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data;
    },
  });

  const updateCompletion = useMutation({
    mutationFn: async (task: Task) =>
      await api.put(`/api/tasks/${task.id}/update`, { completed: !task.completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  const handleEditUser = (user: DashboardUser) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(taskId);
      setExpandedTaskId(null);
    }
  };

  const filteredTasks = (allTasks ?? [])
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
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {role === 'admin' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('tasks')}
                className={`px-4 py-2 rounded ${view === 'tasks' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Tasks
              </button>
              <button
                onClick={() => setView('users')}
                className={`px-4 py-2 rounded ${view === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Users
              </button>
            </div>
          )}
        </div>

        {view === 'tasks' && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border px-3 py-2 rounded w-full"
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
                className="border px-3 py-2 rounded w-full"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {role === 'admin' && (
              <div className="ml-auto">
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskModal(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-6"
                >
                  + Add Task
                </button>
              </div>
            )}
          </div>
        )}

        {role === 'admin' && view === 'users' && (
          <div className="bg-white shadow rounded p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowUserModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                + Register New User
              </button>
            </div>
            {allUsers?.map((user) => (
              <div key={user.id} className="border p-4 rounded bg-gray-50 relative">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {user.username} • {user.department}
                </p>
                <button
                  onClick={() => handleEditUser(user)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-indigo-600 text-xl"
                >
                  ⋮
                </button>
              </div>
            ))}
          </div>
        )}

        {view === 'tasks' && (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`border p-4 rounded transition relative ${
                  task.completed ? 'bg-green-100' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Priority: {task.priority} | Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    {role === 'admin' && (
                      <p className="text-sm text-gray-500">
                        Assigned to: {task.assignedTo?.username}
                      </p>
                    )}
                  </div>
                  {role === 'admin' && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                        }
                        className="text-gray-500 hover:text-indigo-600 text-xl"
                      >
                        ⋮
                      </button>
                      {expandedTaskId === task.id && (
                        <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow z-10">
                          <button
                            onClick={() => handleViewTask(task)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => updateCompletion.mutate(task)}
                    />
                    Completed
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal task={editingTask ?? undefined} onClose={() => setShowTaskModal(false)} />
      )}
      {viewingTask && (
        <TaskModal task={viewingTask} readOnly onClose={() => setViewingTask(null)} />
      )}
      {showUserModal && (
        <UserFormModal user={editingUser ?? undefined} onClose={() => setShowUserModal(false)} />
      )}
    </>
  );
}
