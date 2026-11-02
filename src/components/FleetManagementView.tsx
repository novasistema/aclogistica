import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { Vehicle, VehicleType, VehicleStatus } from '../types';
import {
  Truck,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Fuel,
  Navigation,
  Calendar,
  X,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const FleetManagementView: React.FC = () => {
  const { vehicles, drivers, addVehicle, updateVehicle, deleteVehicle } = useLogistics();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Form state
  const [plate, setPlate] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [type, setType] = useState<VehicleType>('Camión Chasis');
  const [capacityKg, setCapacityKg] = useState(10000);
  const [capacityM3, setCapacityM3] = useState(40);
  const [odometerKm, setOdometerKm] = useState(120000);
  const [status, setStatus] = useState<VehicleStatus>('Disponible');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [vtvExpiration, setVtvExpiration] = useState('2027-05-15');
  const [insuranceExpiration, setInsuranceExpiration] = useState('2027-06-20');
  const [notes, setNotes] = useState('');

  const filteredVehicles = vehicles.filter(v => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !brandModel.trim()) return;

    const driverObj = drivers.find(d => d.id === assignedDriverId);

    await addVehicle({
      plate: plate.toUpperCase().trim(),
      brandModel: brandModel.trim(),
      type,
      capacityKg: Number(capacityKg),
      capacityM3: Number(capacityM3),
      odometerKm: Number(odometerKm),
      status,
      assignedDriverId: driverObj?.id,
      assignedDriverName: driverObj?.fullName,
      vtvExpiration,
      insuranceExpiration,
      currentLat: -32.9468,
      currentLng: -60.6393,
      currentSpeed: 0,
      heading: 0,
      lastLocationUpdate: 'Base Central Rosario',
      notes: notes.trim(),
    });

    setShowAddModal(false);
    setPlate('');
    setBrandModel('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-400" />
            Gestión y Parque de Móviles de Flota
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Control de unidades, capacidades de carga, odómetros, VTV y seguros reglamentarios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({vehicles.length})
            </button>
            <button
              onClick={() => setFilterStatus('En Ruta')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'En Ruta' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Ruta ({vehicles.filter(v => v.status === 'En Ruta').length})
            </button>
            <button
              onClick={() => setFilterStatus('Disponible')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'Disponible' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setFilterStatus('En Mantenimiento')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'En Mantenimiento' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Taller
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Móvil</span>
          </button>
        </div>
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map(veh => {
          const isEnRuta = veh.status === 'En Ruta';
          const isTaller = veh.status === 'En Mantenimiento';

          return (
            <div
              key={veh.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg"
            >
              <div>
                {/* Plate and Status badge */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="inline-block bg-white text-slate-950 font-black px-2.5 py-1 rounded border-2 border-slate-900 font-mono text-sm tracking-widest shadow-sm">
                      {veh.plate}
                    </div>
                    <h3 className="font-bold text-white text-base mt-2">{veh.brandModel}</h3>
                    <span className="text-xs text-sky-400">{veh.type}</span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      isEnRuta
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isTaller
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {veh.status}
                  </span>
                </div>

                {/* Specs List */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-medium block">Capacidad Carga</span>
                    <span className="font-bold text-slate-200">
                      {(veh.capacityKg / 1000).toFixed(1)} tn ({veh.capacityKg} kg)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-medium block">Volumen</span>
                    <span className="font-bold text-slate-200">{veh.capacityM3} m³</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-medium block">Odómetro Actual</span>
                    <span className="font-mono text-slate-200 font-bold tabular-nums">
                      {veh.odometerKm.toLocaleString('es-AR')} km
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-medium block">Chofer Asignado</span>
                    <span className="font-medium text-slate-200 truncate block">
                      {veh.assignedDriverName || 'Sin asignar'}
                    </span>
                  </div>
                </div>

                {/* Expirations documentation checks */}
                <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      VTV / RTO Obligatoria:
                    </span>
                    <span className="font-mono text-slate-200 font-medium">{veh.vtvExpiration}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      Póliza Seguro Flota:
                    </span>
                    <span className="font-mono text-slate-200 font-medium">{veh.insuranceExpiration}</span>
                  </div>
                </div>

                {/* Location telemetry note */}
                <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{veh.lastLocationUpdate}</span>
                </div>
              </div>

              {/* Status toggles and delete */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Estado:</span>
                  <select
                    value={veh.status}
                    onChange={e => updateVehicle(veh.id, { status: e.target.value as VehicleStatus })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none focus:border-sky-500"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setVehicleToDelete(veh)}
                  title="Eliminar este móvil de la flota"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[11px] font-medium hidden sm:inline">Borrar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Registrar Nuevo Móvil a la Flota</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Patente / Dominio *</label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={e => setPlate(e.target.value)}
                    placeholder="Ej. AF 990 ZX"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white uppercase font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Vehículo *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Camión Chasis">Camión Chasis</option>
                    <option value="Semirremolque">Semirremolque</option>
                    <option value="Furgón Utilitario">Furgón Utilitario</option>
                    <option value="Camioneta">Camioneta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Marca y Modelo *</label>
                <input
                  type="text"
                  required
                  value={brandModel}
                  onChange={e => setBrandModel(e.target.value)}
                  placeholder="Ej. Mercedes-Benz Actros 2045"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Capacidad (Kg) *</label>
                  <input
                    type="number"
                    required
                    value={capacityKg}
                    onChange={e => setCapacityKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Volumen (m³)</label>
                  <input
                    type="number"
                    value={capacityM3}
                    onChange={e => setCapacityM3(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Odómetro (Km)</label>
                  <input
                    type="number"
                    value={odometerKm}
                    onChange={e => setOdometerKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vencimiento VTV</label>
                  <input
                    type="date"
                    value={vtvExpiration}
                    onChange={e => setVtvExpiration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vencimiento Seguro</label>
                  <input
                    type="date"
                    value={insuranceExpiration}
                    onChange={e => setInsuranceExpiration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Chofer Habitual</label>
                  <select
                    value={assignedDriverId}
                    onChange={e => setAssignedDriverId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Sin chofer asignado</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estado Inicial</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as VehicleStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Equipamiento y Notas</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej. Climatizador, rampa hidráulica, sensor de temperatura"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/20"
                >
                  Guardar Móvil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Vehicle Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">¿Eliminar móvil de la flota?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de eliminar la unidad <strong className="text-white font-mono">{vehicleToDelete.plate}</strong> ({vehicleToDelete.brandModel}). Se removerá del parque automotor y de la base de datos de telemetría.
                </p>
                {vehicleToDelete.status === 'En Ruta' && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Atención: Este móvil actualmente figura en estado &quot;En Ruta&quot;.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (vehicleToDelete) {
                    await deleteVehicle(vehicleToDelete.id);
                    setVehicleToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Borrar Móvil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
