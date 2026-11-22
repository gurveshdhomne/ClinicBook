import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Baby, Bone, Brain, CheckCircle2, HeartPulse, Sparkles, Stethoscope } from 'lucide-react';
import api from '../api/client';
import DoctorCard from '../components/DoctorCard';

const slots = [
  { t: '9:00', taken: true }, { t: '9:30', taken: false }, { t: '10:00', taken: true }, { t: '10:30', taken: false },
  { t: '11:00', taken: false }, { t: '11:30', taken: true }, { t: '12:00', taken: false }, { t: '12:30', taken: false },
];
const open = slots.filter((s) => !s.taken);
const label = (t) => `${t} ${parseInt(t, 10) >= 12 ? 'PM' : 'AM'}`;

const specialties = [
  { name: 'Cardiologist', icon: HeartPulse },
  { name: 'Orthopedic', icon: Bone },
  { name: 'Dermatologist', icon: Sparkles },
  { name: 'Pediatrician', icon: Baby },
  { name: 'Neurologist', icon: Brain },
  { name: 'General Physician', icon: Stethoscope },
];

const steps = [
  { title: 'Choose a doctor', text: 'Search by name or filter by specialty. Fees and working hours are shown up front.' },
  { title: 'Pick a free slot', text: 'You only see times that are still open, so there is no clash with another patient.' },
  { title: 'Manage it from your dashboard', text: 'Cancel or review past visits any time. The doctor sees your booking instantly.' },
];

// The one animated moment on the page: a doctor's day where slots appear and a free one gets picked.
function SlotBoard() {
  const [pick, setPick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPick((p) => (p + 1) % open.length), 2400);
    return () => clearInterval(id);
  }, []);
  const chosen = open[pick];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-pine-soft" aria-hidden="true" />
      <div className="card p-5 shadow-xl shadow-pine/10 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sun-soft font-display font-bold text-[#8A5A00]">AS</span>
          <div>
            <p className="font-semibold">Dr. Ananya Sharma</p>
            <p className="text-sm text-ink/60">Cardiologist</p>
          </div>
          <span className="ml-auto rounded-full bg-pine-soft px-3 py-1 text-xs font-semibold text-pine-dark">
            {open.length} slots free
          </span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2.5">
          {slots.map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
              className={`relative grid h-12 place-items-center rounded-xl border text-sm font-semibold ${
                s.taken ? 'border-transparent bg-ink/5 text-ink/30 line-through' : 'border-ink/10 bg-white'
              }`}
            >
              {chosen.t === s.t && (
                <motion.span
                  layoutId="home-pick"
                  className="absolute inset-0 rounded-xl bg-sun"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{s.t}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex h-11 items-center gap-2 rounded-xl bg-mist px-4 text-sm font-medium">
          <CheckCircle2 size={18} className="text-pine" />
          <AnimatePresence mode="wait">
            <motion.span
              key={chosen.t}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              Slot held for {label(chosen.t)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [doctors, setDoctors] = useState(null);
  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data.slice(0, 3))).catch(() => setDoctors([]));
  }, []);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Book a doctor in under a minute.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink/70">
            Choose a specialist, pick a time that is actually free, and get a confirmed appointment. No phone calls, no waiting on hold.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/doctors" className="btn-sun px-6 py-3 text-base">Find a doctor</Link>
            <Link to="/register" className="btn-ghost px-6 py-3 text-base">Create free account</Link>
          </div>
          <p className="mt-4 text-sm text-ink/55">Slots update the moment someone books.</p>
        </div>
        <SlotBoard />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Browse by specialty</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specialties.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/doctors?spec=${encodeURIComponent(name)}`}
              className="group card flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-1 hover:border-pine hover:shadow-lg hover:shadow-pine/10"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-pine-soft text-pine transition group-hover:bg-pine group-hover:text-white">
                <Icon size={22} />
              </span>
              <span className="text-sm font-semibold">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine font-display font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-1 text-ink/65">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Doctors taking bookings</h2>
          <Link to="/doctors" className="text-sm font-semibold text-pine hover:underline">See all doctors</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors === null
            ? [0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-ink/5" />)
            : doctors.map((d, i) => <DoctorCard key={d.id} doctor={d} index={i} />)}
        </div>
        {doctors && doctors.length === 0 && (
          <p className="mt-6 text-ink/60">No doctors to show yet. Make sure the backend is running on port 8080.</p>
        )}
      </section>
    </>
  );
}
