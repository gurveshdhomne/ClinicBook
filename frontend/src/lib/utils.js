export const errMsg = (e) => e?.response?.data?.message || 'Something went wrong. Please try again.';

// Date -> "2026-11-25" (local date, not UTC)
export const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// "2026-11-25" -> Date (local)
export const parseDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// "13:30" -> "1:30 PM"
export const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const initials = (name = '') =>
  name.replace(/^Dr\.?\s+/i, '').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const tints = [
  'bg-pine-soft text-pine-dark',
  'bg-sun-soft text-[#8A5A00]',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
];
export const tintFor = (id) => tints[id % tints.length];
