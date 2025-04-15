import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Analytics from './pages/Analytics';

const App = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/tasks" element={token ? <Tasks /> : <Navigate to="/login" />} />
      <Route
        path="/users"
        element={
          token && JSON.parse(user || '{}')?.role === 'admin' ? <Users /> : <Navigate to="/" />
        }
      />
      <Route
        path="/analytics"
        element={
          token && JSON.parse(user || '{}')?.role === 'admin' ? <Analytics /> : <Navigate to="/" />
        }
      />
    </Routes>
  );
};

export default App;
