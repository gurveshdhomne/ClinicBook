import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'ADMIN') return <AdminDashboard />;
  if (user.role === 'DOCTOR') return <DoctorDashboard />;
  return <PatientDashboard />;
}
