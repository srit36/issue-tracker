function StatsBar({ issues }) {
  const open = issues.filter((i) => i.status === 'Open').length;
  const inProgress = issues.filter((i) => i.status === 'In Progress').length;
  const closed = issues.filter((i) => i.status === 'Closed').length;

  const stats = [
    { label: 'Total', value: issues.length, className: 'stat-total', icon: <ListIcon /> },
    { label: 'Open', value: open, className: 'stat-open', icon: <DotIcon /> },
    { label: 'In Progress', value: inProgress, className: 'stat-progress', icon: <ClockIcon /> },
    { label: 'Closed', value: closed, className: 'stat-closed', icon: <CheckIcon /> },
  ];

  return (
    <div className="stats-row">
      {stats.map((s) => (
        <div key={s.label} className={`stat-card ${s.className}`}>
          <div className="stat-icon">{s.icon}</div>
          <div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value mono">{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function DotIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /></svg>;
}
function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>;
}

export default StatsBar;