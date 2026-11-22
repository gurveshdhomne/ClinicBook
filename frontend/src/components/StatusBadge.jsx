const styles = {
  BOOKED: { label: 'Upcoming', cls: 'bg-sun-soft text-[#8A5A00]' },
  COMPLETED: { label: 'Completed', cls: 'bg-pine-soft text-pine-dark' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-coral/10 text-coral' },
};

export default function StatusBadge({ status }) {
  const s = styles[status] || styles.BOOKED;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}
