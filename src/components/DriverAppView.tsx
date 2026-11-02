import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { RouteStop, PackageRemito } from '../types';
import {
  Truck,
  Phone,
  Navigation,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Clock,
  Package,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { RemitoDocumentModal } from './RemitoDocumentModal';

export const DriverAppView: React.FC = () => {
  const {
    drivers,
    vehicles,
    routes,
    packages,
    activeDriverId,
    setActiveDriverId,
    validateDeliveryWithSignature,
    updatePackage,
  } = useLogistics();

  const [selectedPackageForSign, setSelectedPackageForSign] = useState<PackageRemito | null>(null);
  const [selectedPackageForRemito, setSelectedPackageForRemito] = useState<PackageRemito | null>(null);
  const [incidentStopId, setIncidentStopId] = useState<string | null>(null);
  const [incidentText, setIncidentText] = useState('');

  const currentDriver = drivers.find(d => d.id === activeDriverId) || drivers[0];
  const assignedVehicle = vehicles.find(v => v.assignedDriverId === currentDriver.id) || vehicles[0];
  const assignedRoute = routes.find(r => r.driverId === currentDriver.id && r.status !== 'Completada') || routes[0];

  // Route packages
  const routePackages = packages.filter(
    p => p.routeId === assignedRoute?.id || (assignedRoute?.stops || []).some(s => s.packageId === p.id)
  );

  const handleReportIncident = async (pkg: PackageRemito) => {
    if (!incidentText.trim()) return;
    await updatePackage(pkg.id, {
      status: 'No Entregado / Reintento',
      history: [
        ...pkg.history,
        {
          status: 'No Entregado / Reintento',
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          location: pkg.recipientAddress,
          notes: `Novedad reportada por chofer ${currentDriver.fullName}: ${incidentText.trim()}`,
        },
      ],
    });
    setIncidentStopId(null);
    setIncidentText('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12">
      {/* Mobile Top Profile Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-lg">
              {currentDriver.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{currentDriver.fullName}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {currentDriver.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Licencia: <span className="font-mono text-slate-300">{currentDriver.licenseCategory}</span>
              </p>
            </div>
          </div>

          {/* Driver Switcher */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cambiar Chofer</span>
            <select
              value={activeDriverId}
              onChange={e => setActiveDriverId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Vehicle & Route Summary */}
        <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Unidad Asignada</span>
            <span className="font-bold text-white font-mono">{assignedVehicle.plate}</span>
            <span className="text-[11px] text-slate-400 block truncate">{assignedVehicle.brandModel}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Hoja de Ruta</span>
            <span className="font-bold text-sky-400 font-mono">{assignedRoute ? assignedRoute.routeNumber : 'Sin ruta activa'}</span>
            <span className="text-[11px] text-slate-400 block truncate">{assignedRoute ? assignedRoute.destinationCity : '-'}</span>
          </div>
        </div>
      </div>

      {/* Progress banner */}
      {assignedRoute && (
        <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-3 flex items-center justify-between text-xs text-sky-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Progreso de entregas del viaje</span>
          </div>
          <span className="font-mono font-bold text-white">
            {assignedRoute.deliveredPackages} / {assignedRoute.totalPackages} bultos entregados
          </span>
        </div>
      )}

      {/* List of stops for the driver */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            Paradas de Entrega y Encomiendas
          </h3>
          <span className="text-xs text-slate-400">{routePackages.length} remitos asignados</span>
        </div>

        {routePackages.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            No tienes encomiendas pendientes en esta hoja de ruta.
          </div>
        ) : (
          routePackages.map((pkg, idx) => {
            const isDelivered = pkg.status === 'Entregado';
            return (
              <div
                key={pkg.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all shadow-md ${
                  isDelivered
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-sm text-white">{pkg.trackingNumber}</span>
                      <span className="text-slate-400 text-xs block font-mono">Remito: {pkg.remitoNumber}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isDelivered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1'
                        : pkg.status === 'En Reparto / Zona'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                    {pkg.status}
                  </span>
                </div>

                {/* Recipient details */}
                <div className="py-3 text-xs space-y-1.5">
                  <p className="font-bold text-slate-100 text-sm">{pkg.recipientName}</p>
                  <p className="text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {pkg.recipientAddress}, <strong>{pkg.recipientCity}</strong>
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-sky-400" />
                      {pkg.packagesCount} bultos ({pkg.weightKg} kg)
                    </span>
                    <span>·</span>
                    <span>{pkg.description}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {/* Phone */}
                  {pkg.recipientPhone && (
                    <a
                      href={`tel:${pkg.recipientPhone.replace(/[^0-9+]/g, '')}`}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Llamar</span>
                    </a>
                  )}

                  {/* Maps GPS navigation link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${pkg.recipientAddress}, ${pkg.recipientCity}, Argentina`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span>Navegar GPS</span>
                  </a>

                  {/* View digital remito */}
                  <button
                    onClick={() => setSelectedPackageForRemito(pkg)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Remito</span>
                  </button>

                  {/* Primary Signature Button */}
                  {!isDelivered ? (
                    <button
                      onClick={() => setSelectedPackageForSign(pkg)}
                      className="ml-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/25"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Validar y Firmar</span>
                    </button>
                  ) : (
                    <div className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Entregado a {pkg.deliveredToName}</span>
                    </div>
                  )}
                </div>

                {/* Incident report collapsible */}
                {!isDelivered && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    {incidentStopId === pkg.id ? (
                      <div className="w-full space-y-2 mt-1">
                        <input
                          type="text"
                          value={incidentText}
                          onChange={e => setIncidentText(e.target.value)}
                          placeholder="Motivo (ej: No responde nadie al timbre, local cerrado)"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIncidentStopId(null)}
                            className="px-2 py-1 text-slate-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleReportIncident(pkg)}
                            className="px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-500"
                          >
                            Guardar Novedad
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIncidentStopId(pkg.id)}
                        className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Reportar problema / Novedad en entrega</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Signature Modal */}
      {selectedPackageForSign && (
        <DigitalSignatureModal
          packageItem={selectedPackageForSign}
          onClose={() => setSelectedPackageForSign(null)}
          onConfirmDelivery={validateDeliveryWithSignature}
        />
      )}

      {/* Remito Document Modal */}
      {selectedPackageForRemito && (
        <RemitoDocumentModal
          packageItem={selectedPackageForRemito}
          onClose={() => setSelectedPackageForRemito(null)}
          onOpenSignature={() => {
            setSelectedPackageForSign(selectedPackageForRemito);
            setSelectedPackageForRemito(null);
          }}
        />
      )}
    </div>
  );
};
