import React, { useState, useEffect } from 'react';
import './App.css';
import EntryCard from './components/EntryCard';
import EntryForm from './components/EntryForm';
import SearchFilter from './components/SearchFilter';
import apiService from './services/apiService';

function App() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({ id: '', name: '', text: '', tags: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchData outside useEffect
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAllVectors();
      setEntries(data);
      setFilteredEntries(data);
      const tags = new Set(data.flatMap(e => e.tags));
      setAvailableTags(Array.from(tags));
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const search = async () => {
      setIsLoading(true);
      try {
        const results = await apiService.searchVectors(searchTerm, { tags: selectedTags });
        setFilteredEntries(results);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    search();
  }, [searchTerm, selectedTags]);

  const handleAddEntry = () => {
    setCurrentEntry({ id: '', name: '', text: '', tags: [] });
    setIsEditMode(true);
  };

  const handleEditEntry = (entry) => {
    setCurrentEntry({ ...entry });
    setIsEditMode(true);
  };

  const handleSave = async (entry) => {
    if (!entry.name || !entry.text) {
      setError('Name and text are required');
      return;
    }
    try {
      const isNew = !entry.id;
      const updatedEntry = isNew
        ? await apiService.createVector(entry)
        : await apiService.updateVector(entry.id, entry);
      setEntries(isNew ? [...entries, updatedEntry] : entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      const tags = new Set([...availableTags, ...updatedEntry.tags]); // Update availableTags with new tags
      setAvailableTags(Array.from(tags));
      setIsEditMode(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await apiService.deleteVector(id);
        const updatedEntries = entries.filter(e => e.id !== id);
        setEntries(updatedEntries);
        setFilteredEntries(filteredEntries.filter(e => e.id !== id));
        const tags = new Set(updatedEntries.flatMap(e => e.tags));
        setAvailableTags(Array.from(tags));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isLoading && !entries.length) return <div className="loading">Loading...</div>;
  if (error) return (
    <div className="error">
      Error: {error} <button onClick={() => { setError(null); fetchData(); }}>Retry</button>
    </div>
  );

  return (
    <div className="app-container">
      <header>
        <h1>Third Wave BBQ Vector Editor</h1>
      </header>
      {!isEditMode ? (
        <>
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={(tag) => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}
          />
          <button className="add-button" onClick={handleAddEntry}>Add New Entry</button>
          <div className="entries-list">
            <h2>Entries ({filteredEntries.length})</h2>
            {isLoading ? <div className="loading">Loading...</div> : filteredEntries.length === 0 ? (
              <div className="no-results">No entries found</div>
            ) : (
              filteredEntries.map(entry => (
                <EntryCard key={entry.id} entry={entry} onEdit={handleEditEntry} onDelete={handleDelete} />
              ))
            )}
          </div>
        </>
      ) : (
        <EntryForm
          entry={currentEntry}
          onSave={handleSave}
          onCancel={() => setIsEditMode(false)}
          existingTags={availableTags} // Pass preloaded tags to EntryForm
        />
      )}
    </div>
  );
}

export default App;