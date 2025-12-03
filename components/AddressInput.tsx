"use client";

import { useEffect, useRef, useState } from "react";

interface Prediction {
  description: string;
  place_id: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function AddressAutocomplete({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const loader = setInterval(() => {
      if (window.google?.maps?.places && inputRef.current) {
        clearInterval(loader);

        const autocompleteService =
          new window.google.maps.places.AutocompleteService();

        inputRef.current.addEventListener("input", (e: any) => {
          const text = e.target.value;
          onChange(text);

          if (!text) {
            setPredictions([]);
            return;
          }

          autocompleteService.getPlacePredictions(
            { input: text },
            (suggestions: any) => {
              setPredictions(suggestions || []);
            }
          );
        });
      }
    }, 300);

    return () => clearInterval(loader);
  }, [onChange]);

  return (
    <div className="relative">
      {/* Main Input */}
      <input
        ref={inputRef}
        value={value}
        placeholder="Search your business address…"
        className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 rounded-lg 
                   text-white placeholder:text-neutral-500
                   focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
        onChange={() => {}}
      />

      {/* Suggestions */}
      {predictions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-[#111111] border border-neutral-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {predictions.map((p: Prediction) => (
            <button
              key={p.place_id}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-[var(--color-gold)]/10 text-white"
              onClick={() => {
                onChange(p.description);
                setPredictions([]);
                if (inputRef.current) inputRef.current.value = p.description;
              }}
            >
              {p.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
