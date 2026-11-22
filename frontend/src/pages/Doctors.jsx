import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import DoctorCard from '../components/DoctorCard';
import { errMsg } from '../lib/utils';

export default function Doctors() {
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState(null);
  const [q, setQ] = useState('');
  const spec = params.get('spec') || 'All';

  useEffect(() => {
    api.get('/doctors')
      .then((r) => setAll(r.data))
      .catch((e) => { toast.error(errMsg(e)); setAll([]); });
  }, []);

  const specs = useMemo(() => ['All', ...new Set((all || []).map((d) => d.specialization))], [all]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (all || []).filter(
      (d) => (spec === 'All' || d.specialization === spec) && `${d.name} ${d.specialization}`.toLowerCase().includes(needle)
    );
  }, [all, spec, q]);

  const clear = () => { setQ(''); setParams({}, { replace: true }); };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Find your doctor</h1>
      <p className="mt-2 text-ink/65">Pick a specialist, then choose a time that suits you.</p>

      <div className="relative mt-6 max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input className="field pl-11" placeholder="Search by name or specialty" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {specs.map((s) => (
          <button
            key={s}
            onClick={() => setParams(s === 'All' ? {} : { spec: s }, { replace: true })}
            className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
              spec === s ? 'border-transparent text-white' : 'border-ink/15 bg-white hover:border-pine'
            }`}
          >
            {spec === s && (
              <motion.span layoutId="spec-chip" className="absolute inset-0 rounded-full bg-pine" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative">{s}</span>
          </button>
        ))}
      </div>

      {all === null ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-ink/5" />)}
        </div>
      ) : (
        <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((d, i) => <DoctorCard key={d.id} doctor={d} index={i} />)}
          </AnimatePresence>
        </motion.div>
      )}

      {all && list.length === 0 && (
        <div className="card mt-8 grid place-items-center gap-3 px-6 py-14 text-center">
          <p className="text-ink/65">
            {all.length === 0 ? 'No doctors are available yet.' : 'No doctors match your search. Try another name or clear the filters.'}
          </p>
          {all.length > 0 && <button onClick={clear} className="btn-ghost">Clear filters</button>}
        </div>
      )}
    </div>
  );
}
