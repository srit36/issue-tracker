import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StatsBar from './StatsBar';
import IssueForm from './IssueForm';
import IssueCard from './IssueCard';
import './App.css';

function App() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [formOpen, setFormOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/issues`)
      .then(res => res.json())
      .then(data => setIssues(data));
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const openCreateForm = () => {
    setEditingIssue(null);
    setFormOpen(true);
  };

  const openEditForm = (issue) => {
    setEditingIssue(issue);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingIssue(null);
  };

  const handleSave = async (data) => {
    if (editingIssue) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/issues/${editingIssue._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updated = await res.json();
      setIssues(issues.map((i) => (i._id === updated._id ? updated : i)));
    } else {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const created = await res.json();
      setIssues([created, ...issues]);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    setIssues(issues.filter((i) => i._id !== id));
  };

  const priorityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  const visibleIssues = issues
    .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => (statusFilter === 'All' ? true : i.status === statusFilter))
    .sort((a, b) => {
      if (sortBy === 'priority') return priorityRank[b.priority] - priorityRank[a.priority];
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const counts = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'Open').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    closed: issues.filter((i) => i.status === 'Closed').length,
  };

  return (
    <div data-theme={darkMode ? 'dark' : 'light'} className="app-shell">
      <Sidebar
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onNewIssue={openCreateForm}
        counts={counts}
      />

      <main className="main-content">
        <div className="main-header">
          <div>
            <h1>Issues</h1>
            <p className="subtitle">Track and manage your issues</p>
          </div>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀' : '●'}
            </button>
          </div>
        </div>

        <StatsBar issues={issues} />

        <div className="toolbar">
          <button className="new-issue-btn" onClick={openCreateForm}>+ New Issue</button>
          <div className="toolbar-right">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleIssues.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No issues found.</td></tr>
              ) : (
                visibleIssues.map((issue, idx) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    index={idx + 1}
                    onDelete={handleDelete}
                    onEdit={openEditForm}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <IssueForm
        isOpen={formOpen}
        editingIssue={editingIssue}
        onSave={handleSave}
        onClose={closeForm}
      />
    </div>
  );
}

export default App;