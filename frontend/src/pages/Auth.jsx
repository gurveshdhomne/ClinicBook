import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Clock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/utils';

const demos = [
  { label: 'Patient', email: 'patient@clinicbook.in', password: 'Patient@123' },
  { label: 'Doctor', email: 'ananya.sharma@clinicbook.in', password: 'Doctor@123' },
  { label: 'Admin', email: 'admin@clinicbook.in', password: 'Admin@123' },
];

const perks = [
  { icon: Clock, text: 'See only the slots that are still free' },
  { icon: CalendarCheck, text: 'Cancel or review visits from your dashboard' },
  { icon: ShieldCheck, text: 'Your password is stored as a secure hash' },
];

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        const payload = { fullName: form.fullName, email: form.email, password: form.password };
        if (form.phone.trim()) payload.phone = form.phone.trim();
        await register(payload);
      }
      toast.success(isLogin ? 'Welcome back' : 'Account created');
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-pine px-14 text-white lg:flex">
        <h2 className="max-w-md text-4xl font-bold leading-tight">Your next appointment is a few taps away.</h2>
        <ul className="mt-10 space-y-5">
          {perks.map(({ icon: Icon, text }, i) => (
            <motion.li key={text} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }} className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Icon size={18} /></span>
              <span className="text-white/90">{text}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <h1 className="text-3xl font-bold">{isLogin ? 'Log in' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-ink/65">
            {isLogin ? 'New here? ' : 'Already registered? '}
            <Link to={isLogin ? '/register' : '/login'} state={location.state} className="font-semibold text-pine hover:underline">
              {isLogin ? 'Create an account' : 'Log in'}
            </Link>
          </p>

          <div className="mt-6 space-y-3">
            {!isLogin && <input className="field" placeholder="Full name" required value={form.fullName} onChange={set('fullName')} autoComplete="name" />}
            <input className="field" type="email" placeholder="Email" required value={form.email} onChange={set('email')} autoComplete="email" />
            {!isLogin && <input className="field" inputMode="numeric" placeholder="Phone (10 digits, optional)" pattern="[0-9]{10}" value={form.phone} onChange={set('phone')} autoComplete="tel" />}
            <input className="field" type="password" placeholder="Password" required minLength={isLogin ? undefined : 6} value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </div>

          <button disabled={busy} className="btn-primary mt-6 w-full py-3">
            {busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
          </button>

          {isLogin && (
            <div className="mt-8 rounded-2xl border border-dashed border-ink/20 p-4">
              <p className="text-sm font-semibold">Try a demo account</p>
              <p className="mt-0.5 text-xs text-ink/55">Tap one to fill in the form, then press Log in.</p>
              <div className="mt-3 flex gap-2">
                {demos.map((d) => (
                  <button key={d.label} type="button" onClick={() => setForm({ ...form, email: d.email, password: d.password })} className="btn-ghost flex-1 px-3 py-2">
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.form>
      </div>
    </div>
  );
}
