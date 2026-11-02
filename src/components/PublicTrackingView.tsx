import React, { useState, useEffect } from 'react';
import { useLogistics } from '../lib/store';
import { PackageRemito } from '../types';
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Share2,
  FileText,
  Bell,
  Copy,
  Check,
  Building,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { RemitoDocumentModal } from './RemitoDocumentModal';

const STEP_DEFINITIONS = [
  { key: 'Recibido en Depósito', label: '1. En Depósito', desc: 'Ingreso y control de bultos' },
  { key: 'Asignado a Hoja de Ruta', label: '2. En Hoja de Ruta', desc: 'Asignado a unidad de transporte' },
  { key: 'En Tránsito', label: '3. En Tránsito', desc: 'En viaje interprovincial' },
  { key: 'En Reparto / Zona', label: '4. En Reparto', desc: 'Móvil en recorrido hacia destino' },
  { key: 'Entregado', label: '5. Entregado', desc: 'Firmado y validado conforme' },
];

export const PublicTrackingView: React.FC = () => {
  const { packages, publicTrackingCode, setPublicTrackingCode, requestNotificationPermission, userRole, setUserRole } = useLogistics();
  const [searchInput, setSearchInput] = useState(publicTrackingCode || 'AC-8941');
  const [activePackage, setActivePackage] = useState<PackageRemito | null>(null);
  const [hasSearched, setHasSearched] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewingRemito, setViewingRemito] = useState(false);
  const [subscribedNotifs, setSubscribedNotifs] = useState(false);

  // Sync search input if publicTrackingCode changed externally
  useEffect(() => {
    if (publicTrackingCode) {
      setSearchInput(publicTrackingCode);
      const match = packages.find(
        p =>
          p.trackingNumber.toUpperCase() === publicTrackingCode.toUpperCase() ||
          p.remitoNumber.toUpperCase() === publicTrackingCode.toUpperCase()
      );
      if (match) setActivePackage(match);
      setHasSearched(true);
    }
  }, [publicTrackingCode, packages]);

  // Initial load auto-search default
  useEffect(() => {
    if (!activePackage && packages.length > 0) {
      const initial = packages.find(p => p.trackingNumber === 'AC-8941') || packages[0];
      setActivePackage(initial);
      setSearchInput(initial.trackingNumber);
    }
  }, [packages, activePackage]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (!clean) return;

    setPublicTrackingCode(clean);
    const found = packages.find(
      p =>
        p.trackingNumber.toUpperCase() === clean ||
        p.remitoNumber.toUpperCase() === clean ||
        p.id.toUpperCase() === clean
    );
    setActivePackage(found || null);
    setHasSearched(true);
  };

  const handleCopyLink = () => {
    if (!activePackage) return;
    const shareUrl = `${window.location.origin}?tracking=${activePackage.trackingNumber}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubscribePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setSubscribedNotifs(true);
    } else {
      alert('Las notificaciones no están permitidas en este navegador o ventana.');
    }
  };

  // Helper to determine step active index
  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const order = [
      'Recibido en Depósito',
      'Asignado a Hoja de Ruta',
      'En Tránsito',
      'En Reparto / Zona',
      'Entregado',
    ];
    const currentIndex = order.indexOf(currentStatus);
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Access Gate link */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setUserRole(null)}
          className="text-xs font-semibold text-slate-400 hover:text-sky-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          <span>← Volver al Portal de Ingreso (Admin / Chofer)</span>
        </button>
      </div>

      {/* Hero Tracking Box */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Sistema de Rastreo Público en Tiempo Real
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Seguimiento de Encomiendas y Cargas
          </h2>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            Ingresa tu número de guía de seguimiento o remito para conocer la ubicación y estado actual de tu envío.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Ej. AC-8941 o R-0001-00045812"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/90 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-600/25 shrink-0 flex items-center justify-center gap-2"
            >
              <span>Rastrear</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick chip examples */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Envíos de prueba:</span>
            {packages.slice(0, 4).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSearchInput(p.trackingNumber);
                  setActivePackage(p);
                  setPublicTrackingCode(p.trackingNumber);
                }}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  activePackage?.id === p.id
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {p.trackingNumber} ({p.status})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking Result View */}
      {hasSearched && (
        <>
          {activePackage ? (
            <div className="space-y-6">
              {/* Status Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                        Guía de Transporte
                      </span>
                      <span className="text-xl font-bold font-mono text-white tracking-wide">
                        #{activePackage.trackingNumber}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          activePackage.status === 'Entregado'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : activePackage.status === 'En Reparto / Zona'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {activePackage.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Remito oficial: <strong className="font-mono text-slate-300">{activePackage.remitoNumber}</strong></span>
                      <span>·</span>
                      <span>Tiempo estimado: <strong className="text-slate-200">{activePackage.eta}</strong></span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link'}</span>
                    </button>
                    <button
                      onClick={() => setViewingRemito(true)}
                      className="px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ver Remito Digital</span>
                    </button>
                    <button
                      onClick={handleSubscribePush}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        subscribedNotifs
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      <span>{subscribedNotifs ? 'Alertas Activas' : 'Activar Alertas'}</span>
                    </button>
                  </div>
                </div>

                {/* 5-Step Progress Bar */}
                <div className="pt-8 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
                    {/* Connecting line */}
                    <div className="hidden sm:block absolute top-4 left-8 right-8 h-1 bg-slate-800 -z-0" />

                    {STEP_DEFINITIONS.map((step, idx) => {
                      const status = getStepStatus(idx, activePackage.status);
                      return (
                        <div key={idx} className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                              status === 'completed'
                                ? 'bg-emerald-500 text-slate-950 border-2 border-emerald-400'
                                : status === 'active'
                                ? 'bg-sky-500 text-slate-950 border-2 border-sky-300 ring-4 ring-sky-500/20 animate-pulse'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-slate-950" />
                            ) : status === 'active' ? (
                              <Truck className="w-5 h-5 text-slate-950" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span
                            className={`mt-2.5 text-xs font-bold leading-tight ${
                              status === 'active'
                                ? 'text-sky-400'
                                : status === 'completed'
                                ? 'text-slate-200'
                                : 'text-slate-500'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Package Details & Journey Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consignment summary info */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-sky-400" />
                    Detalles del Envío
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Origen y Remitente
                      </span>
                      <p className="font-bold text-slate-200">{activePackage.senderName}</p>
                      <p className="text-slate-400">{activePackage.senderCity}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Destino y Receptor
                      </span>
                      <p className="font-bold text-slate-200">{activePackage.recipientName}</p>
                      <p className="text-slate-400">{activePackage.recipientAddress}</p>
                      <p className="text-slate-300 font-semibold">{activePackage.recipientCity}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Bultos</span>
                        <span className="font-mono font-bold text-sm text-white">
                          {activePackage.packagesCount} unidad(es)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Peso Total</span>
                        <span className="font-mono font-bold text-sm text-white">
                          {activePackage.weightKg} kg
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Descripción de la carga
                      </span>
                      <p className="text-slate-300">{activePackage.description}</p>
                    </div>
                  </div>

                  {/* If delivered, show the Digital Signature Box */}
                  {activePackage.status === 'Entregado' && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Firma Digital Validada</span>
                      </div>
                      <p className="text-slate-300">
                        Recibió: <strong>{activePackage.deliveredToName}</strong> (DNI: {activePackage.deliveredToDni})
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono">
                        Fecha: {activePackage.deliveredAt}
                      </p>
                      {activePackage.deliverySignature && (
                        <div className="bg-white rounded p-2 mt-1 flex justify-center">
                          <img
                            src={activePackage.deliverySignature}
                            alt="Firma"
                            className="max-h-14 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline History */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-sky-400" />
                    Historial de Movimientos y Puntos de Control
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                    {activePackage.history.map((event, idx) => (
                      <div key={idx} className="relative group">
                        {/* Bullet */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            idx === activePackage.history.length - 1
                              ? 'bg-sky-500 border-sky-300 shadow-lg shadow-sky-500/30'
                              : 'bg-slate-900 border-slate-600'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              idx === activePackage.history.length - 1 ? 'bg-slate-950' : 'bg-slate-400'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="font-bold text-sm text-white">{event.status}</span>
                            <span className="text-xs text-sky-400 font-mono tabular-nums">
                              {event.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            {event.location}
                          </p>
                          {event.notes && (
                            <p className="text-xs text-slate-400 mt-1 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">No se encontró el envío</h3>
              <p className="text-xs text-slate-400">
                No encontramos ningún envío con el código <span className="font-mono text-white">"{searchInput}"</span>. Por favor verifica que el número de remito o código de guía esté escrito correctamente.
              </p>
            </div>
          )}
        </>
      )}

      {/* Remito Document Modal if opened */}
      {viewingRemito && activePackage && (
        <RemitoDocumentModal
          packageItem={activePackage}
          onClose={() => setViewingRemito(false)}
        />
      )}
    </div>
  );
};
