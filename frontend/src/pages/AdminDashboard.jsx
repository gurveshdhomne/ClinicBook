import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CalendarCheck, CalendarClock, CalendarDays, CalendarX, Plus, Stethoscope, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import AppointmentBoard from '../components/AppointmentBoard';
import AddDoctorModal from '../components/AddDoctorModal';
import CountUp from '../components/CountUp';
import { errMsg, fmtTime, initials, tintFor } from '../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appts, setAppts] = useState(null);
  const [docs, setDocs] = useState(null);
  const [modal, setModal] = useState(false);

  const load = useCallback(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/appointments'), api.get('/admin/doctors')])
      .then(([s, a, d]) => { setStats(s.data); setAppts(a.data); setDocs(d.data); })
      .catch((e) => toast.error(errMsg(e)));
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

  const toggle = async (d) => {
    try {
      await api.patch(`/admin/doctors/${d.id}/active`, null, { params: { value: !d.active } });
      toast.success(d.active ? `${d.name} hidden from patients` : `${d.name} is visible again`);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const cards = stats && [
    { label: 'Doctors', value: stats.doctors, icon: Stethoscope },
    { label: 'Patients', value: stats.patients, icon: Users },
    { label: 'All bookings', value: stats.appointments, icon: CalendarDays },
    { label: 'Upcoming', value: stats.booked, icon: CalendarClock },
    { label: 'Completed', value: stats.completed, icon: CalendarCheck },
    { label: 'Cancelled', value: stats.cancelled, icon: CalendarX },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="mt-1 text-ink/65">Doctors, bookings and clinic activity.</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> Add doctor</button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards
          ? cards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="card p-4">
                <Icon size={20} className="text-pine" />
                <p className="mt-3 font-display text-3xl font-bold"><CountUp value={value} /></p>
                <p className="text-sm text-ink/60">{label}</p>
              </div>
            ))
          : [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink/5" />)}
      </div>

      <h2 className="mt-12 text-xl font-bold">Doctors</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(docs || []).map((d) => (
          <div key={d.id} className="card flex items-center gap-4 p-4">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full font-display font-bold ${tintFor(d.id)}`}>{initials(d.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{d.name}</p>
              <p className="truncate text-sm text-ink/60">{d.specialization}, {fmtTime(d.workStart)} to {fmtTime(d.workEnd)}</p>
            </div>
            <button onClick={() => toggle(d)} className={d.active ? 'btn-ghost px-4 py-2' : 'btn-sun px-4 py-2'}>
              {d.active ? 'Hide' : 'Show'}
            </button>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-12 text-xl font-bold">All appointments</h2>
      <AppointmentBoard items={appts} view="admin" onCancel={cancel} />

      <AnimatePresence>
        {modal && <AddDoctorModal onClose={() => setModal(false)} onCreated={() => { setModal(false); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
