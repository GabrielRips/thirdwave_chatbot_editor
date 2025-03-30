import React from 'react';

const EntryCard = ({ entry, onEdit, onDelete }) => {
  return (
    <div className="entry-card">
      <div className="entry-content">
        <strong>{entry.name}</strong>: {entry.text}
      </div>
      <div className="entry-tags">
        {entry.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <div className="entry-actions">
        <button onClick={() => onEdit(entry)}>Edit</button>
        <button onClick={() => onDelete(entry.id)}>Delete</button>
      </div>
    </div>
  );
};

export default EntryCard;