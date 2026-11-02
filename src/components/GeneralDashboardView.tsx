import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { InteractiveFleetMap } from './InteractiveFleetMap';
import {
  Truck,
  Package,
  FileSpreadsheet,
  Wrench,
  ShieldCheck,
  ArrowUpRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { ResetSystemConfirmModal } from './ResetSystemConfirmModal';

export const GeneralDashboardView: React.FC = () => {
  const { vehicles, routes, packages, maintenance, setCurrentTab, setPublicTrackingCode, setSelectedPackageForRemito } = useLogistics();
  const [showResetModal, setShowResetModal] = useState(false);

  const activeVehicles = vehicles.filter(v => v.status === 'En Ruta');
  const enTransitoPkgs = packages.filter(
    p => p.status === 'En Tránsito' || p.status === 'En Reparto / Zona'
  );
  const activeRoutes = routes.filter(r => r.status === 'En Tránsito');
  const inWorkshopVehicles = maintenance.filter(m => m.status === 'En Taller');
  const deliveredPkgs = packages.filter(p => p.status === 'Entregado');

  const totalDeliveredWeight = packages.reduce((acc, p) => acc + p.weightKg, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Centro de Control Logístico y Tráfico en Tiempo Real
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoreo satelital de móviles, gestión de hojas de ruta y despacho de encomiendas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowResetModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reiniciar sistema a cero (sin datos)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Reiniciar Sin Datos</span>
          </button>
          <button
            onClick={() => setCurrentTab('packages')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Emitir Remito</span>
          </button>
          <button
            onClick={() => setCurrentTab('routes')}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Despachar Viaje</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fleet in Route */}
        <div
          onClick={() => setCurrentTab('fleet')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Móviles en Ruta</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              {activeVehicles.length}
            </span>
            <span className="text-xs text-slate-400">de {vehicles.length} unidades</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetría GPS activa</span>
          </div>
        </div>

        {/* Metric 2: Packages in transit */}
        <div
          onClick={() => setCurrentTab('packages')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">En Tránsito / Reparto</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              {enTransitoPkgs.length}
            </span>
            <span className="text-xs text-slate-400">encomiendas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {packages.reduce((acc, p) => (p.status.includes('Tránsito') ? acc + p.weightKg : acc), 0).toLocaleString('es-AR')}{' '}
            kg en trayecto
          </div>
        </div>

        {/* Metric 3: Active Routes */}
        <div
          onClick={() => setCurrentTab('routes')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Hojas de Ruta</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              {activeRoutes.length}
            </span>
            <span className="text-xs text-slate-400">viajes en curso</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {routes.filter(r => r.status === 'Planificada').length} viajes planificados
          </div>
        </div>

        {/* Metric 4: Fleet Health / Maintenance */}
        <div
          onClick={() => setCurrentTab('maintenance')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Taller y Mantenimiento</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              {inWorkshopVehicles.length}
            </span>
            <span className="text-xs text-slate-400">en taller</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 font-medium">
            {maintenance.filter(m => m.status === 'Programado').length} services preventivos próximos
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Telemetry radar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-bold text-white text-sm">
              Seguimiento Satelital en Tiempo Real de la Flota
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Actualización continua cada 6s · RN 9, RN 7, RN 11
          </span>
        </div>

        <InteractiveFleetMap
          vehicles={vehicles}
          routes={routes}
          packages={packages}
          heightClass="h-[480px]"
        />
      </div>

      {/* Split section: Active Shipments and Quick Remitos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Route Corridors */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              Corredores Troncales Activos Hoy
            </h3>
            <button
              onClick={() => setCurrentTab('routes')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <span>Ver todas las hojas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {routes.slice(0, 3).map(route => {
              const progressPct =
                route.totalPackages > 0
                  ? Math.round((route.deliveredPackages / route.totalPackages) * 100)
                  : 0;

              return (
                <div
                  key={route.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                          {route.routeNumber}
                        </span>
                        <span className="font-bold text-white text-sm">{route.title}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{route.originCity}</span> ➔ <strong className="text-slate-200">{route.destinationCity}</strong>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        route.status === 'En Tránsito'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : route.status === 'Planificada'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-slate-300 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Chofer</span>
                      <strong className="text-slate-200">{route.driverName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Móvil / Patente</span>
                      <strong className="font-mono text-white">{route.vehiclePlate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Horario</span>
                      <span className="font-mono text-slate-300">
                        {route.departureTime} → {route.estimatedArrivalTime}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Progreso de entrega:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {route.deliveredPackages} / {route.totalPackages} bultos ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Shipments and Digital Validation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              Últimas Encomiendas y Remitos
            </h3>
            <button
              onClick={() => setCurrentTab('packages')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-2.5">
            {packages.slice(0, 4).map(pkg => {
              const isDelivered = pkg.status === 'Entregado';
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setPublicTrackingCode(pkg.trackingNumber);
                    setCurrentTab('tracking');
                  }}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/50 cursor-pointer transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-400">{pkg.trackingNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : pkg.status === 'En Reparto / Zona'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>
                  <p className="font-bold text-white truncate">{pkg.recipientName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{pkg.recipientCity}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                    <span>Remito: {pkg.remitoNumber}</span>
                    {isDelivered && (
                      <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Firma digital archivada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset System Modal */}
      <ResetSystemConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
};
