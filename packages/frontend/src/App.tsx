import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.js'
import RegisterPage from './pages/RegisterPage.js'
import GamePage from './pages/GamePage.js'
import AdminPage from './pages/AdminPage.js'

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="/game"
        element={token ? <GamePage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={token ? '/game' : '/login'} replace />} />
    </Routes>
  )
}
