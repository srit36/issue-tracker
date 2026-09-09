function IssueCard({ issue, index, onDelete, onEdit }) {
  const handleDelete = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/issues/${issue._id}`, { method: 'DELETE' });
    onDelete(issue._id);
  };

  const formattedDate = new Date(issue.createdAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <tr>
      <td className="col-index mono">{index}</td>
      <td>
        <div className="issue-title">{issue.title}</div>
        {issue.description && <div className="issue-desc">{issue.description}</div>}
      </td>
      <td>
        <span className={`status-badge status-${issue.status.replace(' ', '-')}`}>
          <span className="status-dot" />
          {issue.status}
        </span>
      </td>
      <td>
        <span className={`priority-badge priority-${issue.priority}`}>
          <AlertIcon />
          {issue.priority}
        </span>
      </td>
      <td className="col-date">{formattedDate}</td>
      <td>
        <div className="row-actions">
          <button className="icon-btn" onClick={() => onEdit(issue)} title="Edit">
            <EditIcon />
          </button>
          <button className="icon-btn icon-btn-danger" onClick={handleDelete} title="Delete">
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
}
function AlertIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>;
}

export default IssueCard;