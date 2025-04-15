import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import api from '../services/api';
import UserFormModal from '../components/UserFormModal';
import { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { HiOutlineDotsVertical } from 'react-icons/hi';

export default function Users() {
  const queryClient = useQueryClient();
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedUserId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Employees</h1>
          <button
            onClick={() => setModalUser({} as User)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add User
          </button>
        </div>

        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <div>
            <table className="min-w-full bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-t relative">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{`${user.firstName} ${user.lastName}`}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.department}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3 relative">
                      <div
                        className="relative inline-block"
                        ref={expandedUserId === user.id ? dropdownRef : null}
                      >
                        <button
                          onClick={() =>
                            setExpandedUserId(expandedUserId === user.id ? null : user.id)
                          }
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <HiOutlineDotsVertical size={20} />
                        </button>
                        {expandedUserId === user.id && (
                          <div className="absolute right-0 top-6 bg-white border rounded shadow-md z-50 w-32">
                            <button
                              onClick={() => {
                                setModalUser(user);
                                setExpandedUserId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const confirmDelete = confirm(
                                  'Are you sure you want to delete this user?',
                                );
                                if (confirmDelete) {
                                  deleteMutation.mutate(user.id);
                                  setExpandedUserId(null);
                                }
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalUser && <UserFormModal user={modalUser} onClose={() => setModalUser(null)} />}
    </>
  );
}
