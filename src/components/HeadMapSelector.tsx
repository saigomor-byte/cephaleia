import React from 'react';
import { HeadLocation } from '../types/migraine';
import { HEAD_LOCATIONS } from '../data/initialData';

interface HeadMapSelectorProps {
  selectedLocations: HeadLocation[];
  onChange: (locations: HeadLocation[]) => void;
  accentColor?: string;
}

export const HeadMapSelector: React.FC<HeadMapSelectorProps> = ({
  selectedLocations,
  onChange,
}) => {
  const toggleLocation = (loc: HeadLocation) => {
    if (selectedLocations.includes(loc)) {
      onChange(selectedLocations.filter((l) => l !== loc));
    } else {
      onChange([...selectedLocations, loc]);
    }
  };

  const isSelected = (loc: HeadLocation) => selectedLocations.includes(loc);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">
          Localisation de la douleur ({selectedLocations.length} sélectionnée{selectedLocations.length > 1 ? 's' : ''})
        </label>
        {selectedLocations.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Anatomical Head SVG Map */}
      <div className="relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
        <svg
          viewBox="0 0 320 280"
          className="w-full max-w-[280px] h-auto select-none"
          role="img"
          aria-label="Schéma anatomique de localisation de la migraine"
        >
          {/* Head & Neck Base Outline */}
          <path
            d="M 160 30 C 95 30, 80 85, 80 145 C 80 195, 110 225, 125 240 L 125 270 L 195 270 L 195 240 C 210 225, 240 195, 240 145 C 240 85, 225 30, 160 30 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Ears indication */}
          <path d="M 80 130 C 68 135, 68 165, 80 170" fill="none" stroke="#334155" strokeWidth="2" />
          <path d="M 240 130 C 252 135, 252 165, 240 170" fill="none" stroke="#334155" strokeWidth="2" />

          {/* Nose & Facial Guidelines */}
          <path d="M 160 130 L 157 165 L 163 165" fill="none" stroke="#1e293b" strokeWidth="2" />
          <path d="M 148 190 Q 160 196 172 190" fill="none" stroke="#1e293b" strokeWidth="2" />

          {/* Interactive Zone 1: Vertex / Sommet */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('vertex')}
          >
            <ellipse
              cx="160"
              cy="52"
              rx="42"
              ry="16"
              className={`transition-colors duration-200 ${
                isSelected('vertex')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="160"
              y="55"
              textAnchor="middle"
              className={`text-[9px] font-semibold pointer-events-none ${
                isSelected('vertex') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Sommet (Vertex)
            </text>
          </g>

          {/* Interactive Zone 2: Frontal */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('frontal')}
          >
            <path
              d="M 115 78 Q 160 70 205 78 Q 205 106 160 110 Q 115 106 115 78 Z"
              className={`transition-colors duration-200 ${
                isSelected('frontal')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="160"
              y="94"
              textAnchor="middle"
              className={`text-[10px] font-semibold pointer-events-none ${
                isSelected('frontal') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Front
            </text>
          </g>

          {/* Interactive Zone 3: Tempe Gauche (Viewer's left) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('temporal_left')}
          >
            <path
              d="M 85 92 Q 110 95 110 135 Q 85 140 85 92 Z"
              className={`transition-colors duration-200 ${
                isSelected('temporal_left')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="97"
              y="117"
              textAnchor="middle"
              className={`text-[8.5px] font-semibold pointer-events-none ${
                isSelected('temporal_left') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Tempe G
            </text>
          </g>

          {/* Interactive Zone 4: Tempe Droite (Viewer's right) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('temporal_right')}
          >
            <path
              d="M 235 92 Q 210 95 210 135 Q 235 140 235 92 Z"
              className={`transition-colors duration-200 ${
                isSelected('temporal_right')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="223"
              y="117"
              textAnchor="middle"
              className={`text-[8.5px] font-semibold pointer-events-none ${
                isSelected('temporal_right') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Tempe D
            </text>
          </g>

          {/* Interactive Zone 5: Œil Gauche (rétro-orbitaire G) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('periocular_left')}
          >
            <circle
              cx="135"
              cy="126"
              r="14"
              className={`transition-colors duration-200 ${
                isSelected('periocular_left')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="135"
              y="129"
              textAnchor="middle"
              className={`text-[8.5px] font-semibold pointer-events-none ${
                isSelected('periocular_left') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Œil G
            </text>
          </g>

          {/* Interactive Zone 6: Œil Droit (rétro-orbitaire D) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('periocular_right')}
          >
            <circle
              cx="185"
              cy="126"
              r="14"
              className={`transition-colors duration-200 ${
                isSelected('periocular_right')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="185"
              y="129"
              textAnchor="middle"
              className={`text-[8.5px] font-semibold pointer-events-none ${
                isSelected('periocular_right') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Œil D
            </text>
          </g>

          {/* Interactive Zone 7: Occipital / Arrière */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('occipital')}
          >
            <rect
              x="120"
              y="204"
              width="80"
              height="24"
              rx="6"
              className={`transition-colors duration-200 ${
                isSelected('occipital')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="160"
              y="219"
              textAnchor="middle"
              className={`text-[9px] font-semibold pointer-events-none ${
                isSelected('occipital') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Occiput (Arrière)
            </text>
          </g>

          {/* Interactive Zone 8: Nuque & Cervicales */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => toggleLocation('cervical')}
          >
            <rect
              x="125"
              y="238"
              width="70"
              height="26"
              rx="6"
              className={`transition-colors duration-200 ${
                isSelected('cervical')
                  ? 'fill-rose-500/80 stroke-rose-400 stroke-2'
                  : 'fill-slate-800/60 hover:fill-slate-700/80 stroke-slate-700'
              }`}
            />
            <text
              x="160"
              y="254"
              textAnchor="middle"
              className={`text-[9px] font-semibold pointer-events-none ${
                isSelected('cervical') ? 'fill-white' : 'fill-slate-400'
              }`}
            >
              Nuque / Cou
            </text>
          </g>
        </svg>

        <p className="text-[11px] text-slate-400 mt-1">
          Touchez une zone sur le schéma ou sélectionnez ci-dessous
        </p>
      </div>

      {/* Grid of quick selectable location pills */}
      <div className="grid grid-cols-2 gap-2">
        {HEAD_LOCATIONS.map((loc) => {
          const active = isSelected(loc.id);
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => toggleLocation(loc.id)}
              className={`min-h-[44px] px-3 py-2 text-left rounded-xl text-xs font-medium border transition-colors flex items-center justify-between ${
                active
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{loc.label}</span>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  active ? 'border-rose-400 bg-rose-500' : 'border-slate-700 bg-slate-800'
                }`}
              >
                {active && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
