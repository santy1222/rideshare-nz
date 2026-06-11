"use client";

import { useState, useRef, useEffect } from "react";
import { NZ_CITIES } from "@/lib/cities";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  /** Clases extra para el input (se agregan a "input-field"). */
  inputClassName?: string;
}

export function CityAutocomplete({ value, onChange, placeholder, id, name, inputClassName }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  // Ciudades que empiezan con lo tecleado; sin texto, muestra todas.
  const suggestions = query
    ? NZ_CITIES.filter((c) => c.toLowerCase().startsWith(query))
    : [...NZ_CITIES];

  // Cerrar el desplegable al hacer clic fuera del componente.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(city: string) {
    onChange(city);
    setOpen(false);
    setHighlight(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      // Solo intercepta Enter si hay una opción resaltada; si no, deja enviar el formulario.
      if (highlight >= 0 && highlight < suggestions.length) {
        e.preventDefault();
        select(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`input-field ${inputClassName ?? ""}`}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-100 bg-cream-50 shadow-lg py-1">
          {suggestions.map((city, i) => (
            <li
              key={city}
              onMouseDown={(e) => {
                // mousedown (no click) para seleccionar antes de que el input pierda el foco.
                e.preventDefault();
                select(city);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === highlight ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-cream-100"
              }`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
