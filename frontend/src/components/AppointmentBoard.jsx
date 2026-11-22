import { forwardRef, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { fmtTime, parseDate } from '../lib/utils';

const tabs = [
  { key: 'BOOKED', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

/**
 * Shared list of appointments with Upcoming / Completed / Cancelled tabs.
 * view: 'patient' | 'doctor' | 'admin' decides what each row shows and which buttons appear.
 */
export default function AppointmentBoard({ items, view, onCancel, onComplete }) {
  const [tab, setTab] = useState('BOOKED');

  const counts = useMemo(() => {
    const c = { BOOKED: 0, COMPLETED: 0, CANCELLED: 0 };
    (items || []).forEach((a) => (c[a.status] += 1));
    return c;
  }, [items]);

  const rows = useMemo(() => {
    const list = (items || []).filter((a) => a.status === tab);
    const dir = tab === 'BOOKED' ? 1 : -1;
    return list.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time) * dir);
  }, [items, tab]);

  return (
    <div>
      <div className="flex gap-6 border-b border-ink/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative pb-3 text-sm font-semibold transition ${tab === t.key ? 'text-ink' : 'text-ink/50 hover:text-ink'}`}
          >
            {t.label} <span className="ml-1 text-ink/40">{counts[t.key]}</span>
            {tab === t.key && <motion.span layoutId="board-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-pine" />}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />)}
        </div>
      ) : (
        <motion.ul layout className="mt-5 space-y-3">
          <AnimatePresence mode="popLayout">
            {rows.map((a) => (
              <Row key={a.id} a={a} view={view} onCancel={onCancel} onComplete={onComplete} />
            ))}
          </AnimatePresence>
          {rows.length === 0 && <Empty tab={tab} view={view} />}
        </motion.ul>
      )}
    </div>
  );
}

const Row = forwardRef(function Row({ a, view, onCancel, onComplete }, ref) {
  const d = parseDate(a.date);
  const title = view === 'patient' ? a.doctorName : view === 'doctor' ? a.patientName : `${a.patientName} with ${a.doctorName}`;
  const subtitle =
    view === 'doctor'
      ? [a.reason || 'No reason given', a.patientPhone].filter(Boolean).join(', ')
      : view === 'admin'
      ? a.specialization
      : `${a.specialization}${a.reason ? ': ' + a.reason : ''}`;

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
      className="card flex flex-wrap items-center gap-4 p-4"
    >
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-pine-soft text-center leading-tight text-pine-dark">
        <div>
          <p className="text-xs font-semibold">{d.toLocaleString('en-IN', { month: 'short' })}</p>
          <p className="font-display text-xl font-bold">{d.getDate()}</p>
        </div>
      </div>

      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-sm text-ink/60">{subtitle}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
          <Clock size={14} /> {d.toLocaleString('en-IN', { weekday: 'short' })}, {fmtTime(a.time)}
        </p>
      </div>

      <StatusBadge status={a.status} />

      {a.status === 'BOOKED' && (
        <div className="flex gap-2">
          {view === 'doctor' && onComplete && (
            <button onClick={() => onComplete(a.id)} className="btn-primary px-4 py-2">Mark completed</button>
          )}
          {onCancel && (
            <button onClick={() => window.confirm('Cancel this appointment?') && onCancel(a.id)} className="btn-danger">
              Cancel
            </button>
          )}
        </div>
      )}
    </motion.li>
  );
});

function Empty({ tab, view }) {
  const text = {
    BOOKED: view === 'patient' ? 'No upcoming appointments.' : 'Nothing scheduled right now.',
    COMPLETED: 'No completed appointments yet.',
    CANCELLED: 'No cancelled appointments.',
  }[tab];
  return (
    <li className="card grid place-items-center gap-3 px-6 py-12 text-center">
      <p className="text-ink/60">{text}</p>
      {tab === 'BOOKED' && view === 'patient' && <Link to="/doctors" className="btn-sun">Find a doctor</Link>}
    </li>
  );
}
