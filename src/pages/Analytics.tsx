import Header from '../components/Header';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface AnalyticsData {
  employeeId: number;
  username: string;
  department: string;
  completedTasks: number;
  totalTasks: number;
}

export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsData[]>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/api/users/analytics');
      return res.data;
    },
  });

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Task Completion Analytics</h1>

        {isLoading ? (
          <p>Loading analytics...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
                <tr>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Completed</th>
                  <th className="p-3">Total Tasks</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row) => (
                  <tr key={row.employeeId} className="border-t">
                    <td className="p-3">{row.employeeId}</td>
                    <td className="p-3">{row.username}</td>
                    <td className="p-3">{row.department}</td>
                    <td className="p-3">{row.completedTasks}</td>
                    <td className="p-3">{row.totalTasks}</td>
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
