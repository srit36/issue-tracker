function Sidebar({ statusFilter, onFilterChange, onNewIssue, counts }) {
  const items = [
    { label: 'Open', value: 'Open', count: counts.open, icon: <DotIcon color="var(--status-open)" /> },
    { label: 'In Progress', value: 'In Progress', count: counts.inProgress, icon: <ClockIcon /> },
    { label: 'Closed', value: 'Closed', count: counts.closed, icon: <CheckIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <BugIcon />
        <span>IssueTracker</span>
      </div>

      <nav className="sidebar-primary">
        <a className={`sidebar-link ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => onFilterChange('All')}>
          <ListIcon /> Issues
        </a>
        <a className="sidebar-link" onClick={onNewIssue}>
          <PlusIcon /> New Issue
        </a>
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-filters">
        <a className={`sidebar-link ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => onFilterChange('All')}>
          <span className="sidebar-link-icon"><ListIcon /></span>
          <span className="sidebar-link-label">All Issues</span>
          <span className="sidebar-count">{counts.total}</span>
        </a>
        {items.map((item) => (
          <a key={item.value} className={`sidebar-link ${statusFilter === item.value ? 'active' : ''}`} onClick={() => onFilterChange(item.value)}>
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
            <span className="sidebar-count">{item.count}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        Simple Issue Tracker
        <div className="sidebar-version">v1.0</div>
      </div>
    </aside>
  );
}

function BugIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2l1.5 1.5M16 2l-1.5 1.5M12 7v10M9 14H5M15 14h4M9 8H6M15 8h3M9 20l-2 2M15 20l2 2" />
      <rect x="7" y="7" width="10" height="12" rx="5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function DotIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

export default Sidebar;