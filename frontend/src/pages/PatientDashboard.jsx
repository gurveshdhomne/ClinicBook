import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppointmentBoard from '../components/AppointmentBoard';
import { errMsg } from '../lib/utils';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  const load = useCallback(() => {
    api.get('/appointments/my').then((r) => setItems(r.data)).catch((e) => { toast.error(errMsg(e)); setItems([]); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user.fullName.split(' ')[0]}</h1>
          <p className="mt-1 text-ink/65">Your appointments in one place.</p>
        </div>
        <Link to="/doctors" className="btn-sun">Book new appointment</Link>
      </div>
      <div className="mt-8">
        <AppointmentBoard items={items} view="patient" onCancel={cancel} />
      </div>
    </div>
  );
}
