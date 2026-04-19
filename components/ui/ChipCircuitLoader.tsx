import React from 'react';
import './chipCircuitLoader.css';

type ChipCircuitLoaderProps = {
  className?: string;
  label?: string;
};

const ChipCircuitLoader: React.FC<ChipCircuitLoaderProps> = ({
  className = '',
  label = 'Loading',
}) => (
  <div
    className={`chip-circuit-loader ${className}`}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <div className="main-container">
      <div className="loader">
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="chipCircuitChipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2a32" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient id="chipCircuitTextGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4f1ea" />
              <stop offset="100%" stopColor="#8a8580" />
            </linearGradient>
            <linearGradient id="chipCircuitPinGrad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#6b6b75" />
              <stop offset="50%" stopColor="#45454d" />
              <stop offset="100%" stopColor="#2d2d35" />
            </linearGradient>
          </defs>

          <g id="traces">
            <path d="M100 100 H200 V210 H326" className="trace-bg" />
            <path d="M100 100 H200 V210 H326" className="trace-flow purple" />

            <path d="M80 180 H180 V230 H326" className="trace-bg" />
            <path d="M80 180 H180 V230 H326" className="trace-flow blue" />

            <path d="M60 260 H150 V250 H326" className="trace-bg" />
            <path d="M60 260 H150 V250 H326" className="trace-flow yellow" />

            <path d="M100 350 H200 V270 H326" className="trace-bg" />
            <path d="M100 350 H200 V270 H326" className="trace-flow green" />

            <path d="M700 90 H560 V210 H474" className="trace-bg" />
            <path d="M700 90 H560 V210 H474" className="trace-flow blue" />

            <path d="M740 160 H580 V230 H474" className="trace-bg" />
            <path d="M740 160 H580 V230 H474" className="trace-flow green" />

            <path d="M720 250 H590 V250 H474" className="trace-bg" />
            <path d="M720 250 H590 V250 H474" className="trace-flow red" />

            <path d="M680 340 H570 V270 H474" className="trace-bg" />
            <path d="M680 340 H570 V270 H474" className="trace-flow yellow" />
          </g>

          <rect
            x="330"
            y="190"
            width="140"
            height="100"
            rx="20"
            ry="20"
            fill="url(#chipCircuitChipGrad)"
            stroke="#2d2d35"
            strokeWidth="3"
            filter="drop-shadow(0 0 6px rgba(0,0,0,0.75))"
          />

          <g>
            <rect x="322" y="205" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
            <rect x="322" y="225" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
            <rect x="322" y="245" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
            <rect x="322" y="265" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
          </g>

          <g>
            <rect x="470" y="205" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
            <rect x="470" y="225" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
            <rect x="470" y="245" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
            <rect x="470" y="265" width="8" height="10" fill="url(#chipCircuitPinGrad)" rx="2" />
          </g>

          <text
            x="400"
            y="240"
            className="font-mono"
            fontSize="20"
            fill="url(#chipCircuitTextGrad)"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>

          <circle cx="100" cy="100" r="5" fill="#0a0a0a" />
          <circle cx="80" cy="180" r="5" fill="#0a0a0a" />
          <circle cx="60" cy="260" r="5" fill="#0a0a0a" />
          <circle cx="100" cy="350" r="5" fill="#0a0a0a" />
          <circle cx="700" cy="90" r="5" fill="#0a0a0a" />
          <circle cx="740" cy="160" r="5" fill="#0a0a0a" />
          <circle cx="720" cy="250" r="5" fill="#0a0a0a" />
          <circle cx="680" cy="340" r="5" fill="#0a0a0a" />
        </svg>
      </div>
    </div>
  </div>
);

export default ChipCircuitLoader;
