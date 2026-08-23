import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getDirectoryLocalities, COMMON_BEAT_PATTERNS } from './localityDirectory';
import { SuggestionDropdown, type LocalityItem } from './SuggestionDropdown';

interface LocalityAutocompleteFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  contextLocation?: string;
  isBeat?: boolean;
  disabled?: boolean;
}

export function LocalityAutocompleteField({
  label,
  value,
  onChange,
  placeholder,
  contextLocation = '',
  isBeat = false,
  disabled = false,
}: LocalityAutocompleteFieldProps) {
  const [query, setQuery] = useState(value);
  const [webSuggestions, setWebSuggestions] = useState<LocalityItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const directoryList = useMemo(() => {
    if (isBeat) return COMMON_BEAT_PATTERNS;
    return getDirectoryLocalities(contextLocation);
  }, [contextLocation, isBeat]);

  const filteredDirectory = useMemo(() => {
    if (!query || query.trim() === '') return directoryList;
    return directoryList.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [directoryList, query]);

  useEffect(() => {
    if (!query || query.trim().length < 2 || disabled) {
      setWebSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchTerms = [query.trim(), contextLocation.trim(), 'India'].filter(Boolean).join(', ');
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerms)}&format=json&addressdetails=1&countrycodes=in&limit=5`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const data = await res.json();

        const mapped: LocalityItem[] = (data || []).map((item: any) => {
          const addr = item.address || {};
          const primaryName =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.road ||
            addr.commercial ||
            item.name ||
            item.display_name.split(',')[0];

          return {
            id: String(item.place_id || Math.random()),
            name: primaryName.trim(),
            fullName: item.display_name,
            source: 'WEB',
          };
        });

        setWebSuggestions(mapped);
      } catch (err) {
        console.warn('[LocalityAutocomplete] Web search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, contextLocation, disabled]);

  const allSuggestions: LocalityItem[] = useMemo(() => {
    const list: LocalityItem[] = filteredDirectory.map((name, idx) => ({
      id: `dir_${idx}_${name}`,
      name,
      fullName: `${name} • Verified ${isBeat ? 'Beat Route' : 'HQ Locality'}`,
      source: 'DIRECTORY',
    }));

    for (const w of webSuggestions) {
      if (!list.some((d) => d.name.toLowerCase() === w.name.toLowerCase())) {
        list.push(w);
      }
    }
    return list;
  }, [filteredDirectory, webSuggestions, isBeat]);

  const handleSelect = (name: string) => {
    setQuery(name);
    onChange(name);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(allSuggestions[selectedIndex].name);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
          {label}
        </label>
        {directoryList.length > 0 && (
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
            ⚡ {directoryList.length} Prominent Localities Auto-Loaded
          </span>
        )}
      </div>

      <input
        type="text"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          fontSize: '13px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          color: disabled ? '#64748b' : '#0f172a',
          outline: 'none',
        }}
      />

      {directoryList.length > 0 && !value && (
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '72px', overflowY: 'auto' }}>
          {directoryList.slice(0, 8).map((areaName) => (
            <button
              key={areaName}
              type="button"
              onClick={() => handleSelect(areaName)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#334155',
                whiteSpace: 'nowrap',
              }}
            >
              ＋ {areaName}
            </button>
          ))}
        </div>
      )}

      {isOpen && allSuggestions.length > 0 && (
        <SuggestionDropdown
          suggestions={allSuggestions}
          selectedIndex={selectedIndex}
          contextLocation={contextLocation}
          loading={loading}
          onSelect={handleSelect}
          onHover={setSelectedIndex}
        />
      )}
    </div>
  );
}
