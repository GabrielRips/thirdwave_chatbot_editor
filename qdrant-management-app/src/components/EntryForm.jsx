import React, { useState } from 'react';

const EntryForm = ({ entry, onSave, onCancel, existingTags }) => {
  const [currentEntry, setCurrentEntry] = useState(entry);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !currentEntry.tags.includes(trimmedTag)) {
      setCurrentEntry({
        ...currentEntry,
        tags: [...currentEntry.tags, trimmedTag],
      });
      setNewTag('');
      setError('');
    }
  };

  const handleRemoveTag = (tag) => {
    setCurrentEntry({
      ...currentEntry,
      tags: currentEntry.tags.filter((t) => t !== tag),
    });
  };

  const handleSave = () => {
    if (currentEntry.tags.length === 0) {
      setError('At least one tag is required.');
      return;
    }
    onSave(currentEntry);
  };

  return (
    <div className="edit-form">
      <h2>{currentEntry.id ? 'Edit Entry' : 'Add New Entry'}</h2>

      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={currentEntry.name}
          onChange={(e) => setCurrentEntry({ ...currentEntry, name: e.target.value })}
          placeholder="Enter the entry name..."
        />
      </div>

      <div className="form-group">
        <label>Text:</label>
        <textarea
          value={currentEntry.text}
          onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })}
          rows={5}
          placeholder="Enter the content for the vector entry..."
        />
      </div>

      <div className="form-group">
        <label>Tags (at least one required):</label>
        <div className="tag-input-container">
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          >
            <option value="">Select or type a tag...</option>
            {existingTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Or type a custom tag..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <button onClick={handleAddTag}>Add Tag</button>
        </div>
        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
        <div className="current-tags">
          {currentEntry.tags.map((tag) => (
            <div key={tag} className="tag">
              {tag}
              <span className="remove-tag" onClick={() => handleRemoveTag(tag)}>
                ✕
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default EntryForm;