import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { RouteSheet, RouteStatus, RouteStop } from '../types';
import {
  FileSpreadsheet,
  Plus,
  Truck,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Play,
  CheckSquare,
  X,
  Package,
  Printer,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const RouteSheetsView: React.FC = () => {
  const { routes, vehicles, drivers, packages, addRouteSheet, updateRouteSheet, deleteRouteSheet } = useLogistics();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRouteForManifest, setSelectedRouteForManifest] = useState<RouteSheet | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<RouteSheet | null>(null);

  // New route form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [originCity, setOriginCity] = useState('Rosario, Santa Fe');
  const [destinationCity, setDestinationCity] = useState('Córdoba Capital');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [departureTime, setDepartureTime] = useState('09:00 hs');
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState('17:00 hs');
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const filteredRoutes = routes.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const availablePackages = packages.filter(
    p => p.status === 'Recibido en Depósito' || p.status === 'Asignado a Hoja de Ruta'
  );

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const driver = drivers.find(d => d.id === selectedDriverId);
    const chosenPkgs = packages.filter(p => selectedPackageIds.includes(p.id));

    const totalWeight = chosenPkgs.reduce((acc, p) => acc + p.weightKg, 0);
    const totalCount = chosenPkgs.reduce((acc, p) => acc + p.packagesCount, 0);

    const stops: RouteStop[] = chosenPkgs.map((p, idx) => ({
      id: `stop-${Date.now()}-${idx}`,
      sequence: idx + 1,
      city: p.recipientCity,
      address: p.recipientAddress,
      recipientName: p.recipientName,
      packageId: p.id,
      trackingNumber: p.trackingNumber,
      status: 'Pendiente',
      lat: p.currentLat,
      lng: p.currentLng,
    }));

    const nextNumber = `HR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await addRouteSheet({
      routeNumber: nextNumber,
      title: title.trim(),
      date,
      vehicleId: vehicle?.id || '',
      vehiclePlate: vehicle?.plate || 'AF 000 XX',
      driverId: driver?.id || '',
      driverName: driver?.fullName || 'Adrian C.',
      status: 'Planificada',
      originCity,
      destinationCity,
      totalPackages: totalCount > 0 ? totalCount : 5,
      deliveredPackages: 0,
      totalWeightKg: totalWeight > 0 ? totalWeight : 1200,
      totalVolumeM3: 15,
      departureTime,
      estimatedArrivalTime,
      stops: stops.length > 0 ? stops : [
        {
          id: 'stop-auto-1',
          sequence: 1,
          city: destinationCity,
          address: 'Centro de Distribución Destino',
          recipientName: 'Clientes Varios',
          packageId: 'pkg-01',
          trackingNumber: 'AC-8941',
          status: 'Pendiente',
          lat: -31.4201,
          lng: -64.1888,
        }
      ],
      notes: notes.trim(),
    });

    setShowCreateModal(false);
    setTitle('');
    setSelectedPackageIds([]);
  };

  const togglePackageSelection = (pkgId: string) => {
    setSelectedPackageIds(prev =>
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            Hojas de Ruta y Despacho de Viajes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Planificación logística, asignación de cargas a choferes y seguimiento de paradas de entrega.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({routes.length})
            </button>
            <button
              onClick={() => setStatusFilter('En Tránsito')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'En Tránsito' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Tránsito
            </button>
            <button
              onClick={() => setStatusFilter('Planificada')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'Planificada' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Planificadas
            </button>
            <button
              onClick={() => setStatusFilter('Completada')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'Completada' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completadas
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Hoja de Ruta</span>
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRoutes.map(route => {
          const isEnTransito = route.status === 'En Tránsito';
          const isPlanificada = route.status === 'Planificada';
          const isCompletada = route.status === 'Completada';
          const progressPct =
            route.totalPackages > 0
              ? Math.round((route.deliveredPackages / route.totalPackages) * 100)
              : 0;

          return (
            <div
              key={route.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                {/* Top Route identifiers */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">
                      {route.routeNumber}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1.5 leading-snug">{route.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{route.originCity}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <strong className="text-slate-200">{route.destinationCity}</strong>
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold shrink-0 ${
                      isEnTransito
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isPlanificada
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {route.status}
                  </span>
                </div>

                {/* Logistics assignments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Conductor</span>
                    <span className="font-bold text-slate-200 truncate block">{route.driverName}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Móvil / Patente</span>
                    <span className="font-mono font-bold text-white block">{route.vehiclePlate}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Carga Total</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {(route.totalWeightKg / 1000).toFixed(1)} tn
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Horarios</span>
                    <span className="text-slate-300 font-mono text-[11px] block">
                      {route.departureTime} → {route.estimatedArrivalTime}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progreso de Entregas:</span>
                    <span className="font-mono font-bold text-white">
                      {route.deliveredPackages} de {route.totalPackages} bultos ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompletada ? 'bg-slate-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Stops sequence snippet */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Paradas de Distribución ({route.stops.length})
                  </span>
                  {route.stops.map(stop => (
                    <div key={stop.id} className="flex items-center justify-between gap-2 text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center font-bold text-slate-400">
                          {stop.sequence}
                        </span>
                        <span className="font-medium text-white truncate">{stop.recipientName}</span>
                        <span className="text-slate-500">({stop.city})</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-semibold font-mono ${
                          stop.status === 'Entregado'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {stop.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedRouteForManifest(route)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver Manifiesto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouteToDelete(route)}
                    title="Eliminar esta hoja de ruta"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isPlanificada && (
                    <button
                      onClick={() => updateRouteSheet(route.id, { status: 'En Tránsito' })}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Iniciar Viaje</span>
                    </button>
                  )}
                  {isEnTransito && (
                    <button
                      onClick={() =>
                        updateRouteSheet(route.id, {
                          status: 'Completada',
                          deliveredPackages: route.totalPackages,
                          actualArrivalTime: new Date().toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        })
                      }
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completar Ruta</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Route Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Crear Nueva Hoja de Ruta de Transporte</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre / Corredor del Viaje *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. Troncal Buenos Aires - Rosario - Rafaela"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ciudad Origen *</label>
                  <input
                    type="text"
                    required
                    value={originCity}
                    onChange={e => setOriginCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ciudad Destino *</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={e => setDestinationCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Móvil Asignado *</label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate} ({v.brandModel}) - {v.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Chofer Asignado *</label>
                  <select
                    value={selectedDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.licenseCategory})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fecha de Viaje</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Salida Est.</label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    placeholder="09:00 hs"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Llegada Est.</label>
                  <input
                    type="text"
                    value={estimatedArrivalTime}
                    onChange={e => setEstimatedArrivalTime(e.target.value)}
                    placeholder="17:00 hs"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Package selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Asignar Encomiendas a este Viaje ({selectedPackageIds.length} seleccionadas)
                </label>
                <div className="border border-slate-800 rounded-xl bg-slate-950 max-h-40 overflow-y-auto p-2 space-y-1.5">
                  {availablePackages.map(pkg => {
                    const isChecked = selectedPackageIds.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => togglePackageSelection(pkg.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-sky-500/20 border border-sky-500/40 text-white'
                            : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CheckSquare
                            className={`w-4 h-4 ${isChecked ? 'text-sky-400' : 'text-slate-600'}`}
                          />
                          <span className="font-mono font-bold text-slate-200">{pkg.trackingNumber}</span>
                          <span className="truncate text-slate-300">{pkg.recipientName}</span>
                          <span className="text-slate-500">({pkg.recipientCity})</span>
                        </div>
                        <span className="font-mono text-slate-300 shrink-0">{pkg.weightKg} kg</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Observaciones / Ruta</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej. Parada en estación de servicio Villa María. Entrega con control térmico."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 -mx-5 -mb-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/20"
                >
                  Generar Hoja de Ruta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manifest modal */}
      {selectedRouteForManifest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">
                  Manifiesto de Carga: {selectedRouteForManifest.routeNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setSelectedRouteForManifest(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-white text-slate-900 text-xs space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-black uppercase text-slate-950">
                    ADRIAN C LOGÍSTICA INTEGRAL
                  </h1>
                  <p className="font-bold text-slate-700">HOJA DE RUTA Y MANIFIESTO DE CARGA</p>
                  <p className="text-slate-500">
                    {selectedRouteForManifest.originCity} ➔ {selectedRouteForManifest.destinationCity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base block">{selectedRouteForManifest.routeNumber}</span>
                  <span className="text-slate-600">Fecha: {selectedRouteForManifest.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 rounded">
                <div>
                  <span className="font-bold block text-slate-600">Chofer:</span>
                  <span className="font-bold">{selectedRouteForManifest.driverName}</span>
                </div>
                <div>
                  <span className="font-bold block text-slate-600">Móvil Asignado:</span>
                  <span className="font-mono font-bold">{selectedRouteForManifest.vehiclePlate}</span>
                </div>
                <div>
                  <span className="font-bold block text-slate-600">Carga Total:</span>
                  <span className="font-bold">
                    {selectedRouteForManifest.totalWeightKg} kg ({selectedRouteForManifest.totalPackages} bultos)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase mb-2">Paradas y Entregas Programadas:</h4>
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800">
                      <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                      <th className="p-2 border border-slate-300">Destinatario y Dirección</th>
                      <th className="p-2 border border-slate-300">Ciudad</th>
                      <th className="p-2 border border-slate-300 font-mono">Guía / Remito</th>
                      <th className="p-2 border border-slate-300 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRouteForManifest.stops.map(s => (
                      <tr key={s.id}>
                        <td className="p-2 border border-slate-300 text-center font-bold">{s.sequence}</td>
                        <td className="p-2 border border-slate-300 font-medium">
                          {s.recipientName}
                          <span className="block text-[11px] text-slate-500">{s.address}</span>
                        </td>
                        <td className="p-2 border border-slate-300">{s.city}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold">{s.trackingNumber}</td>
                        <td className="p-2 border border-slate-300 text-right font-bold">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center">
                <div className="border-t border-slate-400 pt-1">
                  <span className="font-bold block">Firma y Aclaración Despachante</span>
                  <span className="text-slate-500 text-[10px]">Base Operativa Central</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <span className="font-bold block">Firma y Conformidad Chofer</span>
                  <span className="text-slate-500 text-[10px]">{selectedRouteForManifest.driverName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Route Confirmation Modal */}
      {routeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">¿Eliminar Hoja de Ruta?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de eliminar la hoja de ruta <strong className="text-white font-mono">{routeToDelete.routeNumber}</strong> ({routeToDelete.originCity} ➔ {routeToDelete.destinationCity}), asignada a <span className="text-white font-medium">{routeToDelete.driverName}</span> con {routeToDelete.totalPackages} encomiendas.
                </p>
                {routeToDelete.status === 'En Tránsito' && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Atención: Este viaje actualmente se encuentra &quot;En Tránsito&quot;.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRouteToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (routeToDelete) {
                    await deleteRouteSheet(routeToDelete.id);
                    setRouteToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Borrar Hoja</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
