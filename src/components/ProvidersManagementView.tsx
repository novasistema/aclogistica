import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { Provider, PickupRequest } from '../types';
import {
  Building2,
  PackagePlus,
  Plus,
  Truck,
  Boxes,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  UserCheck,
  FileText,
  Phone,
  Mail,
  X,
  Search,
  Filter
} from 'lucide-react';
import { ProviderRegisterModal } from './ProviderRegisterModal';
import { NewPickupRequestModal } from './NewPickupRequestModal';

export const ProvidersManagementView: React.FC = () => {
  const {
    providers,
    pickupRequests,
    vehicles,
    drivers,
    updateProvider,
    deleteProvider,
    deletePickupRequest,
    assignPickupToDriver,
    convertPickupToRemito,
    setCurrentTab,
    setPublicTrackingCode,
  } = useLogistics();

  const [activeTab, setActiveTab] = useState<'requests' | 'providers'>('requests');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNewPickupModal, setShowNewPickupModal] = useState(false);
  const [selectedProviderForPickup, setSelectedProviderForPickup] = useState<string>('');

  // Assign Driver Modal state
  const [assignModalRequest, setAssignModalRequest] = useState<PickupRequest | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');

  // Convert to Remito Modal state
  const [convertModalRequest, setConvertModalRequest] = useState<PickupRequest | null>(null);
  const [destinationCity, setDestinationCity] = useState('Córdoba Capital');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientDni, setRecipientDni] = useState('');

  // Provider Delete Confirmation
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<PickupRequest | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingRequests = pickupRequests.filter(r => r.status === 'Pendiente');

  const filteredRequests = pickupRequests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.requestNumber.toLowerCase().includes(term) ||
      r.providerName.toLowerCase().includes(term) ||
      r.pickupCity.toLowerCase().includes(term) ||
      r.cargoDescription.toLowerCase().includes(term)
    );
  });

  const filteredProviders = providers.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.businessName.toLowerCase().includes(term) ||
      p.cuit.includes(term) ||
      p.contactPerson.toLowerCase().includes(term) ||
      p.pickupCity.toLowerCase().includes(term)
    );
  });

  const handleConfirmAssignment = async () => {
    if (!assignModalRequest || !selectedDriverId || !selectedVehicleId) return;
    await assignPickupToDriver(assignModalRequest.id, selectedDriverId, selectedVehicleId);
    setAssignModalRequest(null);
  };

  const handleConfirmConvertRemito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModalRequest || !recipientName.trim() || !destinationCity.trim()) return;

    await convertPickupToRemito(
      convertModalRequest.id,
      destinationCity.trim(),
      recipientName.trim(),
      recipientAddress.trim(),
      recipientPhone.trim(),
      recipientDni.trim()
    );

    setConvertModalRequest(null);
    setRecipientName('');
    setRecipientAddress('');
    setRecipientPhone('');
    setRecipientDni('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Gestión de Proveedores y Solicitudes de Retiro
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro de proveedores, control de bultos declarados (dimensiones/peso) y asignación de unidades para retiros.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'requests'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Avisos de Retiro de Mercadería</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'providers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Directorio de Proveedores ({providers.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative hidden sm:block w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, CUIT, ciudad..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Tab 1: Pickup Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Status filters */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit">
            {['all', 'Pendiente', 'Chofer Asignado', 'Retirado'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === st ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? `Todas (${pickupRequests.length})` : st}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Boxes className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No hay avisos de retiro registrados</p>
              <p className="text-xs text-slate-500">
                Los proveedores registrados pueden enviar avisos de retiro con usuario y contraseña desde el portal público o inicio de sesión.
              </p>
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
                    <div className="space-y-3.5">
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
                          <h4 className="text-sm font-bold text-slate-200 mt-1">{req.providerName}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Tel: {req.providerPhone} · Solicitado: {req.createdAt}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white block">
                            {req.totalPackages} bultos · {req.totalWeightKg} kg
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            {req.totalVolumeM3.toFixed(2)} m³
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
                          <span>Fecha deseada: <strong className="text-white">{req.requestedDate}</strong> ({req.requestedTimeSlot})</span>
                        </div>
                      </div>

                      {/* Dimension items list */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] uppercase font-bold text-slate-500 block">
                          Dimensiones de bultos declaradas:
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {req.items?.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                            >
                              <span className="text-slate-300 truncate">
                                <strong className="text-sky-400">{item.quantity}x</strong> {item.description || 'Bulto'}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {item.heightCm} alto × {item.widthCm} ancho × {item.lengthCm} prof. ({item.weightKg} kg c/u)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Driver Assigned Info */}
                      {req.assignedDriverName && (
                        <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-sky-300">
                            <span className="font-bold flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-sky-400" />
                              Chofer de Retiro Asignado:
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

                      {/* Tracking if converted */}
                      {req.convertedPackageTracking && (
                        <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                          <span className="text-emerald-300 font-medium">Remito oficial emitido:</span>
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

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-slate-800 mt-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {req.status === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => setAssignModalRequest(req)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Asignar Chofer</span>
                          </button>
                        )}

                        {!req.convertedPackageTracking && (
                          <button
                            type="button"
                            onClick={() => {
                              setConvertModalRequest(req);
                              setRecipientName('');
                              setRecipientAddress('');
                              setRecipientPhone('');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Emitir Remito Oficial</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setRequestToDelete(req)}
                        title="Eliminar este aviso de retiro"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Providers Directory */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map(prov => (
              <div
                key={prov.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{prov.businessName}</h4>
                        <span className="font-mono text-[11px] text-slate-400 font-bold">CUIT: {prov.cuit}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {prov.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-white truncate">{prov.pickupAddress}, {prov.pickupCity}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{prov.phone} ({prov.contactPerson})</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{prov.email}</span>
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-slate-400">Usuario de acceso:</span>
                    <span className="font-mono font-bold text-sky-400">{prov.username}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Retiros solicitados:</span>
                    <span className="font-mono font-bold text-white">{prov.totalPickupsRequested} órdenes</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProviderForPickup(prov.id);
                      setShowNewPickupModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Cargar Retiro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProviderToDelete(prov)}
                    title="Eliminar proveedor del directorio"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Asignar Chofer a Solicitud de Retiro */}
      {assignModalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-sm">Asignar Móvil para Retiro de Mercadería</h3>
              </div>
              <button
                onClick={() => setAssignModalRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p><strong>Solicitud:</strong> {assignModalRequest.requestNumber} ({assignModalRequest.providerName})</p>
              <p><strong>Lugar de retiro:</strong> {assignModalRequest.pickupAddress}, {assignModalRequest.pickupCity}</p>
              <p><strong>Carga:</strong> {assignModalRequest.totalPackages} bultos · {assignModalRequest.totalWeightKg} kg · {assignModalRequest.totalVolumeM3.toFixed(2)} m³</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seleccionar Conductor *</label>
                <select
                  value={selectedDriverId}
                  onChange={e => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.status}) - Score: {d.drivingScore ?? 100} pts
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seleccionar Móvil de Flota *</label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate} ({v.brandModel}) - Capacidad: {v.capacityKg} kg / {v.capacityM3} m³
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAssignModalRequest(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/20"
              >
                Confirmar y Asignar Chofer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Convertir Retiro en Remito Oficial */}
      {convertModalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Emitir Remito Oficial con Tracking</h3>
              </div>
              <button
                onClick={() => setConvertModalRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              La carga retirada de <strong className="text-white">{convertModalRequest.providerName}</strong> ({convertModalRequest.totalPackages} bultos, {convertModalRequest.totalWeightKg} kg) se ingresará al circuito logístico con número de tracking oficial para el cliente final.
            </p>

            <form onSubmit={handleConfirmConvertRemito} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Destinatario *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="Ej. Comercial Córdoba S.A."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">DNI / CUIT Destinatario</label>
                  <input
                    type="text"
                    value={recipientDni}
                    onChange={e => setRecipientDni(e.target.value)}
                    placeholder="Ej. 30-71122334-9"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad Destino *</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={e => setDestinationCity(e.target.value)}
                    placeholder="Ej. Córdoba Capital"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Destinatario</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                    placeholder="Ej. +54 9 351 445-6677"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={e => setRecipientAddress(e.target.value)}
                  placeholder="Ej. Bv. Chacabuco 1250"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConvertModalRequest(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
                >
                  Generar Remito y Número de Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Provider Modal */}
      {providerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">¿Eliminar Proveedor?</h3>
                <p className="text-xs text-slate-400">
                  Estás a punto de eliminar a <strong className="text-white">{providerToDelete.businessName}</strong> (CUIT: {providerToDelete.cuit}). Se deshabilitará su usuario de acceso.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProviderToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (providerToDelete) {
                    await deleteProvider(providerToDelete.id);
                    setProviderToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
              >
                Confirmar y Borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Request Modal */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">¿Eliminar Aviso de Retiro?</h3>
                <p className="text-xs text-slate-400">
                  Estás por cancelar/eliminar la solicitud <strong className="text-white font-mono">{requestToDelete.requestNumber}</strong> de <span className="text-white font-medium">{requestToDelete.providerName}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRequestToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (requestToDelete) {
                    await deletePickupRequest(requestToDelete.id);
                    setRequestToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
              >
                Confirmar y Borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Register Provider */}
      <ProviderRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      {/* Modal New Pickup */}
      <NewPickupRequestModal
        isOpen={showNewPickupModal}
        onClose={() => {
          setShowNewPickupModal(false);
          setSelectedProviderForPickup('');
        }}
        overrideProviderId={selectedProviderForPickup}
      />
    </div>
  );
};
