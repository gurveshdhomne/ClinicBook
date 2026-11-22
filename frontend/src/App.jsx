import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetails from './pages/DoctorDetails';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {window.scrollTo(0, 0);}, [pathname]);

  return (
    // reducedMotion="user" turns off movement for people who set "reduce motion" in their OS
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
