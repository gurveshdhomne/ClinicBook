import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarClock, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppointmentBoard from '../components/AppointmentBoard';
import CountUp from '../components/CountUp';
import { errMsg, toIso } from '../lib/utils';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  const load = useCallback(() => {
    api.get('/doctor/appointments').then((r) => setItems(r.data)).catch((e) => { toast.error(errMsg(e)); setItems([]); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = (request, message) => async (id) => {
    try {
      await request(id);
      toast.success(message);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const stats = useMemo(() => {
    const list = items || [];
    const today = toIso(new Date());
    return [
      { label: 'Today', value: list.filter((a) => a.status === 'BOOKED' && a.date === today).length, icon: CalendarDays },
      { label: 'Upcoming', value: list.filter((a) => a.status === 'BOOKED').length, icon: CalendarClock },
      { label: 'Completed', value: list.filter((a) => a.status === 'COMPLETED').length, icon: CalendarCheck },
    ];
  }, [items]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{user.fullName}</h1>
      <p className="mt-1 text-ink/65">Your schedule and patients.</p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4 sm:p-5">
            <Icon size={20} className="text-pine" />
            <p className="mt-3 font-display text-3xl font-bold"><CountUp value={value} /></p>
            <p className="text-sm text-ink/60">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <AppointmentBoard
          items={items}
          view="doctor"
          onComplete={run((id) => api.patch(`/doctor/appointments/${id}/complete`), 'Marked as completed')}
          onCancel={run((id) => api.patch(`/appointments/${id}/cancel`), 'Appointment cancelled')}
        />
      </div>
    </div>
  );
}
