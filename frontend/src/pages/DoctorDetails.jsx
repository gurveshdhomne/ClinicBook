import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { errMsg, fmtTime, initials, parseDate, tintFor, toIso } from '../lib/utils';

function CheckDraw() {
  return (
    <svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden="true">
      <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#0D5C4D" strokeWidth="3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
      <motion.path d="M15 27l8 8 14-16" fill="none" stroke="#0D5C4D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
    </svg>
  );
}

export default function DoctorDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }),
    []
  );

  const [doctor, setDoctor] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [date, setDate] = useState(days[0]);
  const [slots, setSlots] = useState(null);
  const [time, setTime] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`).then((r) => setDoctor(r.data)).catch(() => setNotFound(true));
  }, [id]);

  const loadSlots = useCallback(() => {
    setSlots(null);
    api.get(`/doctors/${id}/slots`, { params: { date: toIso(date) } })
      .then((r) => setSlots(r.data))
      .catch((e) => { toast.error(errMsg(e)); setSlots([]); });
  }, [id, date]);

  useEffect(() => { setTime(null); loadSlots(); }, [loadSlots]);

  const canBook = !user || user.role === 'PATIENT';
  const freeCount = slots ? slots.filter((s) => s.available).length : 0;

  const book = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setBusy(true);
    try {
      const { data } = await api.post('/appointments', {
        doctorId: doctor.id, date: toIso(date), time, reason: reason.trim() || null,
      });
      setDone(data);
      toast.success('Appointment confirmed');
    } catch (e) {
      toast.error(errMsg(e));
      setTime(null);
      loadSlots(); // the slot may have just been taken, so refresh the list
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Doctor not found</h1>
        <Link to="/doctors" className="btn-primary mt-6">Back to all doctors</Link>
      </div>
    );
  }
  if (!doctor) return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-ink/5" /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft size={16} /> All doctors
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[340px_1fr]">
        <motion.aside initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card h-fit p-6">
          <span className={`grid h-20 w-20 place-items-center rounded-full font-display text-2xl font-bold ${tintFor(doctor.id)}`}>
            {initials(doctor.name)}
          </span>
          <h1 className="mt-4 text-2xl font-bold">{doctor.name}</h1>
          <p className="font-medium text-pine">{doctor.specialization}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{doctor.bio}</p>
          <dl className="mt-5 space-y-3 border-t border-ink/10 pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-ink/55">Experience</dt><dd className="font-semibold">{doctor.experienceYears} years</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">Consultation fee</dt><dd className="font-semibold">₹{doctor.consultationFee}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">Working hours</dt><dd className="font-semibold">{fmtTime(doctor.workStart)} to {fmtTime(doctor.workEnd)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">Visit length</dt><dd className="font-semibold">{doctor.slotMinutes} minutes</dd></div>
          </dl>
        </motion.aside>

        <section className="card p-5 sm:p-7">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center gap-3 py-10 text-center">
                <CheckDraw />
                <h2 className="text-2xl font-bold">Appointment confirmed</h2>
                <p className="max-w-sm text-ink/70">
                  {doctor.name}, {parseDate(done.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {fmtTime(done.time)}.
                  Please pay the ₹{doctor.consultationFee} fee at the clinic.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  <Link to="/dashboard" className="btn-primary">View my appointments</Link>
                  <button onClick={() => { setDone(null); setTime(null); setReason(''); loadSlots(); }} className="btn-ghost">Book another</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-xl font-bold">Choose a day</h2>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {days.map((d, i) => {
                    const active = toIso(d) === toIso(date);
                    return (
                      <button
                        key={i}
                        onClick={() => setDate(d)}
                        aria-pressed={active}
                        className={`relative w-16 shrink-0 rounded-xl border py-2.5 text-center transition ${active ? 'border-transparent text-white' : 'border-ink/15 bg-white hover:border-pine'}`}
                      >
                        {active && <motion.span layoutId="day-pick" className="absolute inset-0 rounded-xl bg-pine" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                        <span className="relative block text-xs font-medium opacity-80">{i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                        <span className="relative block font-display text-xl font-bold">{d.getDate()}</span>
                        <span className="relative block text-xs opacity-80">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Choose a time</h2>
                  {slots && <span className="text-sm text-ink/55">{freeCount} free</span>}
                </div>

                {slots === null ? (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-xl bg-ink/5" />)}
                  </div>
                ) : (
                  <motion.div key={toIso(date)} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.025 } } }} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <motion.button
                        key={s.time}
                        variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                        disabled={!s.available}
                        onClick={() => setTime(s.time)}
                        aria-pressed={time === s.time}
                        className={`relative h-11 rounded-xl border text-xs font-semibold sm:text-sm ${
                          s.available ? 'border-ink/15 bg-white hover:border-pine' : 'cursor-not-allowed border-transparent bg-ink/5 text-ink/30 line-through'
                        }`}
                      >
                        {time === s.time && <motion.span layoutId="slot-pick" className="absolute inset-0 rounded-xl bg-sun" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                        <span className="relative">{fmtTime(s.time)}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
                {slots && slots.length > 0 && freeCount === 0 && (
                  <p className="mt-4 rounded-xl bg-sun-soft px-4 py-3 text-sm text-[#8A5A00]">No free slots on this day. Try another date.</p>
                )}

                <label className="mt-6 block text-sm font-semibold" htmlFor="reason">Reason for visit (optional)</label>
                <textarea id="reason" rows={3} maxLength={300} className="field mt-2" placeholder="For example: chest discomfort since two days" value={reason} onChange={(e) => setReason(e.target.value)} />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
                  <p className="flex items-center gap-2 text-sm text-ink/70">
                    <Clock size={16} />
                    {time
                      ? `${date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at ${fmtTime(time)}`
                      : 'Select a time to continue'}
                  </p>
                  <button onClick={book} disabled={busy || !canBook || (!!user && !time)} className="btn-primary px-7 py-3">
                    {busy ? 'Booking...' : user ? 'Confirm appointment' : 'Log in to book'}
                  </button>
                </div>
                {!canBook && <p className="mt-3 text-sm text-coral">Only patient accounts can book appointments.</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
