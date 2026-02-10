import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { Drug } from '../types';
import { searchDrugs } from '../services/drugService';

interface SearchBarProps {
  onSelectDrug: (drug: Drug) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectDrug }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setIsLoading(true);
        const results = await searchDrugs(query);
        setSuggestions(results);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 400); // Increased debounce to 400ms to reduce API calls

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (drug: Drug) => {
    setQuery(drug.name);
    onSelectDrug(drug);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-50">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-medical-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-medical-500 focus:ring-1 focus:ring-medical-500 sm:text-lg shadow-sm transition duration-200"
          placeholder="처방받은 약 이름을 입력하세요 (예: 타이레놀, 쎄레브렉스)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {suggestions.map((drug) => (
            <li
              key={drug.id}
              className="cursor-pointer select-none relative py-3 pl-3 pr-4 hover:bg-medical-50 transition-colors border-b last:border-0 border-gray-100"
              onClick={() => handleSelect(drug)}
            >
              <div className="flex items-center gap-3">
                {/* Image Thumbnail */}
                <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                   {drug.image ? (
                     <img src={drug.image} alt={drug.name} className="h-full w-full object-cover" />
                   ) : (
                     <ImageIcon className="h-5 w-5 text-gray-400" />
                   )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 truncate block">{drug.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap ml-2">
                      {drug.price.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-2">
                     <span className="truncate max-w-[120px]">{drug.manufacturer}</span>
                     <span className="text-gray-300">|</span>
                     <span className="truncate">{drug.ingredientName}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};