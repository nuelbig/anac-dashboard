import React, { useState, useRef, useEffect, SelectHTMLAttributes } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  error,
  onChange,
  value,
  fullWidth = true,
  placeholder = 'Search or select an option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set the initial selected label based on the value
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value.toString() === value.toString());
      if (option) {
        setSelectedLabel(option.label);
      }
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: Option) => {
    onChange(option.value.toString());
    setSelectedLabel(option.label);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const clearSelection = () => {
    onChange('');
    setSelectedLabel('');
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className={`flex items-center w-full relative ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } border rounded-md shadow-sm bg-white dark:bg-gray-800`}>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none"
            placeholder={placeholder}
            value={searchTerm || selectedLabel}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          {(searchTerm || selectedLabel) && (
            <button
              type="button"
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
              onClick={clearSelection}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="p-2 flex items-center justify-center text-gray-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    option.value.toString() === value?.toString() ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">No options found</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default SearchableSelect;