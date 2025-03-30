import React from 'react';

const TagList = ({ tags, selectedTags, onTagSelect, selectable = false }) => {
  return (
    <div className="tag-list">
      {tags.map(tag => (
        <div 
          key={tag} 
          className={`tag ${selectedTags && selectedTags.includes(tag) ? 'selected' : ''}`}
          onClick={() => selectable && onTagSelect(tag)}
          style={{ cursor: selectable ? 'pointer' : 'default' }}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

export default TagList;