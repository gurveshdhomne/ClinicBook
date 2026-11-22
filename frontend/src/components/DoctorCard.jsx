import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { fmtTime, initials, tintFor } from '../lib/utils';

const DoctorCard = forwardRef(function DoctorCard({ doctor: d, index = 0 }, ref) {
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, transition: { delay: 0, duration: 0.2 } }}
      className="card flex flex-col p-5 transition-shadow hover:shadow-lg hover:shadow-pine/10"
    >
      <div className="flex items-center gap-4">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold ${tintFor(d.id)}`}>
          {initials(d.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">{d.name}</h3>
          <p className="text-sm font-medium text-pine">{d.specialization}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-ink/65">{d.bio}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink/50">Experience</dt>
          <dd className="font-semibold">{d.experienceYears} years</dd>
        </div>
        <div>
          <dt className="text-ink/50">Consultation</dt>
          <dd className="font-semibold">₹{d.consultationFee}</dd>
        </div>
      </dl>

      <p className="mt-4 flex items-center gap-1.5 text-sm text-ink/60">
        <Clock size={15} /> {fmtTime(d.workStart)} to {fmtTime(d.workEnd)}
      </p>

      <Link to={`/doctors/${d.id}`} className="btn-primary mt-5 w-full">View slots</Link>
    </motion.article>
  );
});

export default DoctorCard;
