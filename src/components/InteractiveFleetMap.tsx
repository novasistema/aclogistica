import React, { useState } from 'react';
import { Vehicle, RouteSheet, PackageRemito } from '../types';
import { Truck, Navigation, MapPin, Gauge, ShieldCheck, Compass, Zap, Layers, RefreshCw } from 'lucide-react';

interface InteractiveFleetMapProps {
  vehicles: Vehicle[];
  routes?: RouteSheet[];
  packages?: PackageRemito[];
  selectedVehicleId?: string;
  onSelectVehicle?: (v: Vehicle) => void;
  heightClass?: string;
}

// Major logistic hubs coordinates mapped to visual SVG space (Argentina Central Corridors)
// Geographic bounds approx: Lat -30.0 to -35.5, Lng -69.0 to -57.5
const MAP_BOUNDS = {
  minLat: -35.5,
  maxLat: -30.0,
  minLng: -69.0,
  maxLng: -57.5,
};

// Coordinate projection helper to 1000x600 SVG viewBox
function projectCoords(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 1000;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 600;
  return { x: Math.max(40, Math.min(960, x)), y: Math.max(40, Math.min(560, y)) };
}

const HUBS = [
  { name: 'Rosario (Base Central)', lat: -32.9468, lng: -60.6393, isCentral: true },
  { name: 'Córdoba Capital', lat: -31.4201, lng: -64.1888, isCentral: false },
  { name: 'CABA / Puerto Bs As', lat: -34.6037, lng: -58.3816, isCentral: false },
  { name: 'Santa Fe Capital', lat: -31.6333, lng: -60.7000, isCentral: false },
  { name: 'Mendoza Capital', lat: -32.8895, lng: -68.8458, isCentral: false },
  { name: 'Villa María (Córdoba)', lat: -32.4100, lng: -63.2400, isCentral: false },
  { name: 'San Luis', lat: -33.3000, lng: -66.3300, isCentral: false },
];

export const InteractiveFleetMap: React.FC<InteractiveFleetMapProps> = ({
  vehicles,
  routes = [],
  packages = [],
  selectedVehicleId,
  onSelectVehicle,
  heightClass = 'h-[460px]',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'en_ruta' | 'disponibles'>('all');
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [showRoutesLayer, setShowRoutesLayer] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredVehicles = vehicles.filter(v => {
    if (activeFilter === 'en_ruta') return v.status === 'En Ruta';
    if (activeFilter === 'disponibles') return v.status === 'Disponible';
    return true;
  });

  const rosarioPt = projectCoords(-32.9468, -60.6393);
  const cbaPt = projectCoords(-31.4201, -64.1888);
  const bsasPt = projectCoords(-34.6037, -58.3816);
  const staFePt = projectCoords(-31.6333, -60.7000);
  const mzaPt = projectCoords(-32.8895, -68.8458);
  const vmPt = projectCoords(-32.4100, -63.2400);

  return (
    <div className={`relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${heightClass}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 pointer-events-auto shadow-md">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
            Radar Flota GPS
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
              activeFilter === 'all' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveFilter('en_ruta')}
            className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
              activeFilter === 'en_ruta' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            En Ruta ({vehicles.filter(v => v.status === 'En Ruta').length})
          </button>
          <button
            onClick={() => setActiveFilter('disponibles')}
            className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
              activeFilter === 'disponibles' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disponibles ({vehicles.filter(v => v.status === 'Disponible').length})
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-700 pointer-events-auto shadow-md">
          <button
            onClick={() => setShowRoutesLayer(!showRoutesLayer)}
            title="Alternar capas de corredores viales"
            className={`p-1.5 rounded text-xs flex items-center gap-1 ${
              showRoutesLayer ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rutas</span>
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
            className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold"
          >
            -
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setActiveVehicle(null);
            }}
            title="Restablecer vista"
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="w-full h-full relative overflow-hidden bg-[#090d16] flex items-center justify-center">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.25) 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />

        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full transition-transform duration-500 ease-out select-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <linearGradient id="routeGradCba" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="routeGradBsAs" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Regional borders simulation outline (Centro y Cuyo Argentina) */}
          <path
            d="M 120 50 L 320 60 L 580 40 L 760 80 L 890 280 L 840 480 L 590 560 L 320 540 L 100 480 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Geographic Rivers outline (Paraná River) */}
          <path
            d="M 720 40 Q 710 160 690 240 T 670 330 Q 720 400 850 420"
            fill="none"
            stroke="#0e3a5a"
            strokeWidth="3.5"
            opacity="0.4"
          />

          {/* Highways / Corredores Viales */}
          {showRoutesLayer && (
            <g className="corridors transition-opacity duration-300">
              {/* RN 9: Buenos Aires -> Rosario -> Villa Maria -> Cordoba */}
              <path
                d={`M ${bsasPt.x} ${bsasPt.y} L ${rosarioPt.x} ${rosarioPt.y} L ${vmPt.x} ${vmPt.y} L ${cbaPt.x} ${cbaPt.y}`}
                fill="none"
                stroke="url(#routeGradCba)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
              />
              <path
                d={`M ${bsasPt.x} ${bsasPt.y} L ${rosarioPt.x} ${rosarioPt.y} L ${vmPt.x} ${vmPt.y} L ${cbaPt.x} ${cbaPt.y}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                className="animate-pulse"
                opacity="0.9"
              />

              {/* RN 11: Rosario -> Santa Fe */}
              <line
                x1={rosarioPt.x}
                y1={rosarioPt.y}
                x2={staFePt.x}
                y2={staFePt.y}
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* RN 7: CABA -> San Luis -> Mendoza */}
              <path
                d={`M ${bsasPt.x} ${bsasPt.y} Q 400 420 ${mzaPt.x} ${mzaPt.y}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity="0.5"
              />
            </g>
          )}

          {/* Major Logistic Hubs Nodes */}
          {HUBS.map((hub, idx) => {
            const pt = projectCoords(hub.lat, hub.lng);
            return (
              <g key={idx} className="hub-node group cursor-default">
                {hub.isCentral && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hub.isCentral ? '6' : '4'}
                  fill={hub.isCentral ? '#0284c7' : '#475569'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <text
                  x={pt.x + 8}
                  y={pt.y + 4}
                  fill={hub.isCentral ? '#38bdf8' : '#94a3b8'}
                  fontSize={hub.isCentral ? '11' : '9'}
                  fontWeight={hub.isCentral ? '700' : '500'}
                  className="pointer-events-none drop-shadow"
                >
                  {hub.name}
                </text>
              </g>
            );
          })}

          {/* Active Fleet Vehicles Pins on Map */}
          {filteredVehicles.map(v => {
            const pt = projectCoords(v.currentLat, v.currentLng);
            const isSelected = selectedVehicleId === v.id || activeVehicle?.id === v.id;
            const isMoving = v.status === 'En Ruta';

            return (
              <g
                key={v.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                onClick={() => {
                  setActiveVehicle(v);
                  if (onSelectVehicle) onSelectVehicle(v);
                }}
                className="cursor-pointer group"
              >
                {/* Ping animation for moving trucks */}
                {isMoving && (
                  <circle
                    r="16"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Selected Halo */}
                {isSelected && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0' }}
                  />
                )}

                {/* Vehicle Badge Icon */}
                <rect
                  x="-14"
                  y="-14"
                  width="28"
                  height="28"
                  rx="7"
                  fill={
                    v.status === 'En Ruta'
                      ? '#065f46'
                      : v.status === 'Disponible'
                      ? '#1e3a8a'
                      : v.status === 'En Mantenimiento'
                      ? '#78350f'
                      : '#334155'
                  }
                  stroke={isSelected ? '#38bdf8' : '#e2e8f0'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter="url(#glow)"
                />

                {/* Direction compass arrow or truck icon */}
                <g transform="translate(-7, -7)">
                  <path
                    d="M1 3h10v6H1z M11 6h3l2 3v3h-5z M3 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z M14 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
                    fill="#ffffff"
                    transform="scale(0.85)"
                  />
                </g>

                {/* Floating Plate & Speed Pill */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-42"
                    y="-14"
                    width="84"
                    height="16"
                    rx="4"
                    fill="#0f172ae6"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="700"
                    className="font-mono tabular-nums tracking-wide"
                  >
                    {v.plate} · {v.currentSpeed}km/h
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Bottom Telemetry Drawer when a vehicle is clicked */}
      {activeVehicle && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeVehicle.status === 'En Ruta'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{activeVehicle.plate}</span>
                <span className="text-xs text-slate-300 font-medium">({activeVehicle.brandModel})</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    activeVehicle.status === 'En Ruta'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : activeVehicle.status === 'Disponible'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {activeVehicle.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Navigation className="w-3 h-3 text-sky-400" />
                <span>{activeVehicle.lastLocationUpdate}</span>
              </p>
            </div>
          </div>

          {(() => {
            const activeVehicleRoute = routes.find(
              (r: RouteSheet) => r.vehicleId === activeVehicle.id && r.status !== 'Completada'
            ) || routes.find((r: RouteSheet) => r.vehicleId === activeVehicle.id);

            const assignedPkgs = (packages || []).filter(
              (p: PackageRemito) => p.routeId === activeVehicleRoute?.id || activeVehicleRoute?.stops?.some((s: any) => s.packageId === p.id)
            );

            const pkgsCount = assignedPkgs.length > 0 ? assignedPkgs.length : (activeVehicleRoute?.totalPackages || 0);
            const bultosCount = assignedPkgs.length > 0 ? assignedPkgs.reduce((acc: number, p: PackageRemito) => acc + p.packagesCount, 0) : (activeVehicleRoute?.totalPackages || 0);
            const deliveredCount = assignedPkgs.filter((p: PackageRemito) => p.status === 'Entregado').length || (activeVehicleRoute?.deliveredPackages || 0);

            return (
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300 sm:divide-x sm:divide-slate-800 w-full sm:w-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Conductor</span>
                  <span className="font-semibold text-white truncate max-w-[140px]">{activeVehicle.assignedDriverName || 'Sin asignar'}</span>
                </div>
                <div className="sm:pl-4 flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Encomiendas</span>
                  <span className="font-bold text-emerald-400 font-mono tabular-nums">
                    {pkgsCount > 0 ? `${pkgsCount} envíos (${bultosCount} b.)` : 'Sin carga'}
                  </span>
                  {pkgsCount > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {deliveredCount}/{pkgsCount} entregadas
                    </span>
                  )}
                </div>
                <div className="sm:pl-4 flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Velocidad</span>
                  <span className="font-bold text-sky-400 font-mono tabular-nums">{activeVehicle.currentSpeed} km/h</span>
                </div>
                <div className="sm:pl-4 flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Odómetro</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {activeVehicle.odometerKm.toLocaleString('es-AR')} km
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 sm:pl-4 flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Capacidad</span>
                  <span className="text-slate-200">
                    {(activeVehicle.capacityKg / 1000).toFixed(1)} tn · {activeVehicle.capacityM3} m³
                  </span>
                </div>
              </div>
            );
          })()}

          <button
            onClick={() => setActiveVehicle(null)}
            className="self-end sm:self-center text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Map Footer status */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            Corredores Troncales Nacionales (RN 9, RN 7, RN 11)
          </span>
          <span className="hidden md:inline text-slate-600">·</span>
          <span className="hidden md:inline">Monitoreo Satelital y Telemetría en Vivo</span>
        </div>
        <div className="flex items-center gap-2 font-mono tabular-nums text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Flota activa 100% verificada</span>
        </div>
      </div>
    </div>
  );
};
