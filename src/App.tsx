import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
import ListDetailPage from './pages/list-detail';
import CreateListPage from './pages/create-list';
import PublicRegistryPage from './pages/public-view';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/public/:slug" element={<PublicRegistryPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-list" element={<CreateListPage />} />
            <Route path="/lists/:id" element={<ListDetailPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
