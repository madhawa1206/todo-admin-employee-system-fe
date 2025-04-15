import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Task } from '../types';

interface TaskModalProps {
  onClose: () => void;
  task?: Task;
  readOnly?: boolean;
}

export default function TaskModal({ onClose, task, readOnly }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState<number | ''>('');

  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data;
    },
    enabled: !readOnly,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate.slice(0, 10));
      setAssignedToUserId(task.assignedTo?.id ?? '');
    }
  }, [task]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (task) {
        return api.put(`/api/tasks/${task.id}/details`, {
          title,
          description,
          priority,
          dueDate,
          assignedToUserId,
        });
      } else {
        return api.post('/api/tasks/create', {
          title,
          description,
          priority,
          dueDate,
          assignedToUserId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: () => {
      alert('Failed to save task');
    },
  });

  const handleSubmit = () => {
    if (!title || !description || !priority || !dueDate || !assignedToUserId) {
      alert('Please fill all fields');
      return;
    }

    mutation.mutate();
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="text-lg font-bold mb-4">
                {readOnly ? 'View Task' : task ? 'Edit Task' : 'Create Task'}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    disabled={readOnly}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                {!readOnly && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign To</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={assignedToUserId}
                      onChange={(e) => setAssignedToUserId(Number(e.target.value))}
                    >
                      <option value="">-- Select User --</option>
                      {users?.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded border bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Close
                </button>
                {!readOnly && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {task ? 'Update' : 'Create'}
                  </button>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
