import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LiffForm from './pages/LiffForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/liff" element={<LiffForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/liff" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
