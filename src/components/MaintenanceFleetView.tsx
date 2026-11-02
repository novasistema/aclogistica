import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '../types';
import {
  Wrench,
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Truck,
  Gauge,
  X,
  ShieldAlert
} from 'lucide-react';

export const MaintenanceFleetView: React.FC = () => {
  const { maintenance, vehicles, addMaintenance, updateMaintenance } = useLogistics();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [type, setType] = useState<MaintenanceType>('Preventivo');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState(350000);
  const [workshopName, setWorkshopName] = useState('Taller Mecánico Especializado Diesel Centro');
  const [status, setStatus] = useState<MaintenanceStatus>('Programado');
  const [invoicesNotes, setInvoicesNotes] = useState('');

  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  const filtered = maintenance.filter(m => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  // Calculate metrics
  const totalCost = maintenance.reduce((acc, m) => acc + (m.cost || 0), 0);
  const inWorkshopCount = maintenance.filter(m => m.status === 'En Taller').length;
  const scheduledCount = maintenance.filter(m => m.status === 'Programado').length;

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !workshopName.trim()) return;

    const currentKm = selectedVehicle ? selectedVehicle.odometerKm : 140000;
    const nextDueKm = currentKm + (type === 'Preventivo' ? 15000 : 30000);

    await addMaintenance({
      vehicleId: selectedVehicle?.id || '',
      vehiclePlate: selectedVehicle?.plate || 'AF 000 XX',
      type,
      description: description.trim(),
      scheduledDate,
      odometerKm: currentKm,
      nextDueKm,
      cost: Number(cost),
      workshopName: workshopName.trim(),
      status,
      invoicesNotes: invoicesNotes.trim(),
    });

    setShowAddModal(false);
    setDescription('');
    setInvoicesNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Gestión y Mantenimiento de Flota
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro preventivo y correctivo, intervalos de service por kilometraje y costos de talleres mecánicos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Mantenimiento</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 block">Unidades en Taller</span>
            <span className="text-2xl font-bold text-white font-mono">{inWorkshopCount} móviles</span>
            <span className="text-[11px] text-amber-400 block mt-0.5">Mantenimiento correctivo activo</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 block">Services Programados</span>
            <span className="text-2xl font-bold text-white font-mono">{scheduledCount} servicios</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Alertas preventivas por km</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 block">Inversión en Flota</span>
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              ${totalCost.toLocaleString('es-AR')}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Preventivo + Correctivo total</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit">
        {['all', 'Programado', 'En Taller', 'Completado'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st === 'all' ? 'Todos' : st}
          </button>
        ))}
      </div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => {
          const isEnTaller = item.status === 'En Taller';
          const isCompletado = item.status === 'Completado';

          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-white text-slate-950 font-black px-2.5 py-1 rounded border border-slate-900 font-mono text-xs">
                      {item.vehiclePlate}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        {item.type}
                      </span>
                      <p className="font-bold text-white text-sm mt-0.5 leading-snug">{item.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold shrink-0 ${
                      isEnTaller
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : isCompletado
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Taller Mecánico</span>
                    <span className="font-medium text-slate-200 truncate block">{item.workshopName}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Fecha Programada</span>
                    <span className="font-mono text-slate-200">{item.scheduledDate}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Costo Presupuesto</span>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      ${item.cost.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Kilometers tracker */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    <span>Odómetro en service:</span>
                    <strong className="font-mono text-white">{item.odometerKm.toLocaleString('es-AR')} km</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Próximo service:</span>
                    <strong className="font-mono text-amber-300">{item.nextDueKm.toLocaleString('es-AR')} km</strong>
                  </div>
                </div>

                {item.invoicesNotes && (
                  <p className="mt-2 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    Nota: {item.invoicesNotes}
                  </p>
                )}
              </div>

              {/* Status change actions */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-500">Actualizar estado:</span>
                <div className="flex items-center gap-2">
                  {item.status !== 'En Taller' && (
                    <button
                      onClick={() => updateMaintenance(item.id, { status: 'En Taller' })}
                      className="px-2.5 py-1 rounded bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition-colors font-medium"
                    >
                      Ingresar a Taller
                    </button>
                  )}
                  {item.status !== 'Completado' && (
                    <button
                      onClick={() =>
                        updateMaintenance(item.id, {
                          status: 'Completado',
                          completedDate: new Date().toISOString().split('T')[0],
                        })
                      }
                      className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors font-medium flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completar Service</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Registrar Mantenimiento de Flota</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Móvil / Vehículo *</label>
                  <select
                    value={vehicleId}
                    onChange={e => setVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate} ({v.brandModel}) - {v.odometerKm} km
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Servicio *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Preventivo">Preventivo (Filtros y Aceite)</option>
                    <option value="Correctivo">Correctivo (Mecánica pesada)</option>
                    <option value="Inspección Reglamentaria">Inspección VTV / Oblea</option>
                    <option value="Cambio Neumáticos">Cambio y Alineación Neumáticos</option>
                    <option value="Frenos y Suspensión">Frenos de aire y suspensión</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del Trabajo Requerido *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej. Cambio de pastillas delanteras y rectificación de campana"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Taller Mecánico *</label>
                  <input
                    type="text"
                    required
                    value={workshopName}
                    onChange={e => setWorkshopName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Costo Estimado ($) *</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={e => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as MaintenanceStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Programado">Programado</option>
                    <option value="En Taller">En Taller (Móvil no disponible)</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de Facturación / Presupuesto
                </label>
                <input
                  type="text"
                  value={invoicesNotes}
                  onChange={e => setInvoicesNotes(e.target.value)}
                  placeholder="Ej. Factura A-0004-0012, repuestos originales incluidos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 -mx-5 -mb-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20"
                >
                  Guardar Mantenimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
