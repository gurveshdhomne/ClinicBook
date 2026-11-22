import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, Stethoscope, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/utils';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/doctors', label: 'Find a doctor' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-mist/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={close} className="flex items-center gap-2 font-display text-xl font-bold text-pine-dark">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine text-white">
            <Stethoscope size={18} />
          </span>
          ClinicBook
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="relative py-1 text-sm font-medium text-ink/65 hover:text-ink">
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-ink' : ''}>{l.label}</span>
                  {isActive && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-sun" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost py-2">Dashboard</Link>
              <span title={user.fullName} className="grid h-9 w-9 place-items-center rounded-full bg-pine-soft text-xs font-bold text-pine-dark">
                {initials(user.fullName)}
              </span>
              <button onClick={handleLogout} aria-label="Log out" className="rounded-full p-2 text-ink/60 transition hover:bg-ink/5 hover:text-coral">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink/70 hover:text-ink">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} className="rounded-lg p-2 md:hidden">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-ink/10 bg-mist px-4 pb-5 pt-3 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} onClick={close} className="rounded-xl px-3 py-3 font-medium hover:bg-white">
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={close} className="rounded-xl px-3 py-3 font-medium hover:bg-white">Dashboard</Link>
                  <button onClick={handleLogout} className="rounded-xl px-3 py-3 text-left font-medium text-coral hover:bg-white">Log out</button>
                </>
              ) : (
                <div className="mt-2 flex gap-3">
                  <Link to="/login" onClick={close} className="btn-ghost flex-1">Log in</Link>
                  <Link to="/register" onClick={close} className="btn-primary flex-1">Sign up</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
