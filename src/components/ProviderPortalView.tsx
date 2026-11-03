import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import {
  Building2,
  PackagePlus,
  Truck,
  Boxes,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  LogOut,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { NewPickupRequestModal } from './NewPickupRequestModal';

export const ProviderPortalView: React.FC = () => {
  const {
    authenticatedProvider,
    pickupRequests,
    deletePickupRequest,
    setCurrentTab,
    setPublicTrackingCode,
    logout,
  } = useLogistics();

  const [showNewPickupModal, setShowNewPickupModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const providerRequests = pickupRequests.filter(
    r => r.providerId === authenticatedProvider?.id || r.providerName === authenticatedProvider?.businessName
  );

  const filteredRequests = providerRequests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const pendingCount = providerRequests.filter(r => r.status === 'Pendiente').length;
  const assignedCount = providerRequests.filter(r => r.status === 'Chofer Asignado' || r.status === 'En Camino a Retirar').length;
  const completedCount = providerRequests.filter(r => r.status === 'Retirado').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {authenticatedProvider?.businessName || 'Portal de Proveedores'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  {authenticatedProvider?.status || 'Activo'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                CUIT: <span className="font-mono text-slate-300 font-bold">{authenticatedProvider?.cuit}</span> · Rubro: {authenticatedProvider?.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNewPickupModal(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-600/20 cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Avisar Retiro de Mercadería</span>
            </button>
            <button
              onClick={logout}
              title="Cerrar sesión de proveedor"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick contact / address bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            {authenticatedProvider?.pickupAddress}, {authenticatedProvider?.pickupCity}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            {authenticatedProvider?.phone} ({authenticatedProvider?.contactPerson})
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            {authenticatedProvider?.email}
          </span>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pendientes de Asignar</span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Chofer Asignado / En Camino</span>
            <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">{assignedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Retiros Concretados</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{completedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Content Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-sky-400" />
            Mis Solicitudes y Avisos de Retiro
          </h3>
          <p className="text-xs text-slate-400">
            Seguimiento de la carga lista en tu depósito y móviles en viaje
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['all', 'Pendiente', 'Chofer Asignado', 'Retirado'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === st ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? `Todas (${providerRequests.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Pickup Requests Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">No hay solicitudes de retiro en este estado</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando tengas mercadería embalada y lista para despachar, pulsa "Avisar Retiro de Mercadería".
          </p>
          <button
            onClick={() => setShowNewPickupModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/20"
          >
            Nueva Solicitud de Retiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map(req => {
            const isRetirado = req.status === 'Retirado';
            const isAsignado = req.status === 'Chofer Asignado' || req.status === 'En Camino a Retirar';

            return (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-base">{req.requestNumber}</span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                            isRetirado
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isAsignado
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isRetirado && <CheckCircle2 className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        Emitido: {req.createdAt}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-200 block">
                        {req.totalPackages} bultos · {req.totalWeightKg} kg
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {req.totalVolumeM3.toFixed(2)} m³ vol.
                      </span>
                    </div>
                  </div>

                  {/* Address and timing */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{req.pickupAddress}, {req.pickupCity}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Retiro solicitado: <strong className="text-white">{req.requestedDate}</strong> ({req.requestedTimeSlot})</span>
                    </div>
                  </div>

                  {/* Dimensions items breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase font-bold text-slate-500 block">
                      Detalle de Bultos y Medidas ({req.items?.length || 1} tipos):
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {req.items?.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-sky-400 font-bold">{item.quantity}x</span>
                            <span className="text-slate-300 truncate">
                              {item.description || 'Bulto'}
                            </span>
                          </div>
                          <span className="text-slate-400 shrink-0 text-[11px]">
                            {item.heightCm}x{item.widthCm}x{item.lengthCm} cm ({item.weightKg} kg)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Driver assigned info if dispatched */}
                  {req.assignedDriverName && (
                    <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-sky-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-sky-400" />
                          Móvil y Chofer Asignado:
                        </span>
                        <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {req.assignedVehiclePlate}
                        </span>
                      </div>
                      <p className="text-slate-300">
                        Conductor: <strong className="text-white">{req.assignedDriverName}</strong>
                      </p>
                    </div>
                  )}

                  {/* Converted tracking number badge */}
                  {req.convertedPackageTracking && (
                    <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-emerald-300 font-medium">Mercadería en circuito logístico:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPublicTrackingCode(req.convertedPackageTracking || '');
                          setCurrentTab('tracking');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Tracking #{req.convertedPackageTracking}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 italic truncate max-w-[200px]">
                    {req.cargoDescription}
                  </span>

                  {req.status === 'Pendiente' && (
                    <button
                      type="button"
                      onClick={() => deletePickupRequest(req.id)}
                      title="Cancelar solicitud de retiro"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Pickup Request Modal */}
      <NewPickupRequestModal
        isOpen={showNewPickupModal}
        onClose={() => setShowNewPickupModal(false)}
      />
    </div>
  );
};
