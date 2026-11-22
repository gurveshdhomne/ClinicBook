import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { errMsg } from '../lib/utils';

const specialties = ['Cardiologist', 'Orthopedic', 'Dermatologist', 'Pediatrician', 'Neurologist', 'General Physician', 'Dentist', 'ENT Specialist', 'Gynecologist'];

export default function AddDoctorModal({ onClose, onCreated }) {
  const [f, setF] = useState({
    fullName: '', email: '', password: '', specialization: '', experienceYears: 5,
    consultationFee: 500, bio: '', workStart: '09:00', workEnd: '13:00', slotMinutes: 30,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/doctors', {
        ...f,
        experienceYears: Number(f.experienceYears),
        consultationFee: Number(f.consultationFee),
        slotMinutes: Number(f.slotMinutes),
      });
      toast.success('Doctor added');
      onCreated();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4"
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="card w-full max-w-lg p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Add a doctor</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-ink/5"><X size={20} /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className="field" placeholder="Full name (Dr. ...)" required value={f.fullName} onChange={set('fullName')} />
          <input className="field" type="email" placeholder="Email" required value={f.email} onChange={set('email')} />
          <input className="field" type="password" placeholder="Temporary password" minLength={6} required value={f.password} onChange={set('password')} />
          <input className="field" list="specialties" placeholder="Specialization" required value={f.specialization} onChange={set('specialization')} />
          <datalist id="specialties">{specialties.map((s) => <option key={s} value={s} />)}</datalist>
          <label className="text-xs font-medium text-ink/60">Experience (years)
            <input className="field mt-1" type="number" min="0" max="60" value={f.experienceYears} onChange={set('experienceYears')} />
          </label>
          <label className="text-xs font-medium text-ink/60">Fee (₹)
            <input className="field mt-1" type="number" min="0" value={f.consultationFee} onChange={set('consultationFee')} />
          </label>
          <label className="text-xs font-medium text-ink/60">Starts at
            <input className="field mt-1" type="time" required value={f.workStart} onChange={set('workStart')} />
          </label>
          <label className="text-xs font-medium text-ink/60">Ends at
            <input className="field mt-1" type="time" required value={f.workEnd} onChange={set('workEnd')} />
          </label>
          <label className="text-xs font-medium text-ink/60 sm:col-span-2">Slot length
            <select className="field mt-1" value={f.slotMinutes} onChange={set('slotMinutes')}>
              {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
            </select>
          </label>
          <textarea className="field sm:col-span-2" rows={3} maxLength={600} placeholder="Short bio" value={f.bio} onChange={set('bio')} />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button disabled={busy} className="btn-primary">{busy ? 'Saving...' : 'Add doctor'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}
