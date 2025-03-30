import React from 'react';
import TagList from './TagList';

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  availableTags, 
  selectedTags, 
  onTagSelect 
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search entries by name or text..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      
      <div className="tag-filter">
        <h3>Filter by Tags:</h3>
        <TagList 
          tags={availableTags}
          selectedTags={selectedTags}
          onTagSelect={onTagSelect}
          selectable={true}
        />
      </div>
    </div>
  );
};

export default SearchFilter;