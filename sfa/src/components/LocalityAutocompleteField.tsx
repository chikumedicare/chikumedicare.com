import React, { useState, useEffect, useRef } from 'react';
import { GatewayContainer } from '../core/container/GatewayContainer';

interface LocalityAutocompleteFieldProps {
  isBeat?: boolean;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function LocalityAutocompleteField({
  label,
  value,
  onChange,
  placeholder = 'Type city, town or area name...',
  required = false,
}: LocalityAutocompleteFieldProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  interface SuggestionItem { display_name: string; lat: number | string; lon: number | string; }
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchTerms = searchQuery.includes('Madhya Pradesh')
          ? searchQuery
          : `${searchQuery}, Madhya Pradesh, India`;
        const results = await GatewayContainer.getLocationGateway().searchLocations(searchTerms);
        setSuggestions(results.map((r) => ({ display_name: r.displayName, lat: r.lat, lon: r.lon })));
        setShowDropdown(true);
      } catch (err) {
        console.error('[LocalityAutocompleteField] Location lookup error:', err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (displayName: string) => {
    const parts = displayName.split(',');
    const mainName = parts[0].trim() + (parts[1] ? `, ${parts[1].trim()}` : '');
    setSearchQuery(mainName);
    onChange(mainName);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          fontSize: '13px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {loading && (
        <small style={{ position: 'absolute', right: '12px', top: '36px', color: '#64748b', fontSize: '11px' }}>
          Searching...
        </small>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item.display_name)}
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                color: '#1e293b',
                cursor: 'pointer',
                borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              📍 {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
