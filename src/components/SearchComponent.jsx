import { useState, useRef, useEffect } from 'react';
import '../styles/search.css';

<<<<<<< HEAD
/*
  SearchComponent
  - Lightweight, reusable search box for buildings.
  - Props:
    - `buildings`: array of building objects (id, name, department, description,...)
    - `onResultSelect(building)`: callback when the user selects a building from results
    - `searchBuildings(query)`: a search function provided by the parent for filtering
  - Behavior:
    - Shows a dropdown with results while typing
    - Supports keyboard navigation (ArrowUp/Down, Enter, Escape)
*/

=======
>>>>>>> main
const SearchComponent = ({ buildings, onResultSelect, searchBuildings }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchBuildings(query);
      setResults(searchResults);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query, searchBuildings]);

  const handleSelect = (building) => {
    onResultSelect(building);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <input
        type="search"
        className="search-input"
        placeholder="Search building name or keyword..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query && setShowDropdown(true)}
        aria-label="Search for buildings"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls="search-results"
        autoComplete="off"
      />

      {showDropdown && results.length > 0 && (
        <div
          id="search-results"
          className="search-dropdown"
          role="listbox"
        >
          {results.map((building, index) => (
            <div
              key={building.id}
              className={`search-result-item ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handleSelect(building)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="result-name">{building.name}</div>
              <div className="result-dept">{building.department}</div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query && results.length === 0 && (
        <div className="search-no-results" role="status">
          No buildings found matching "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
