import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { Driver, RouteSheet, PackageRemito } from '../types';
import {
  Truck,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { ResetSystemConfirmModal } from './ResetSystemConfirmModal';

export const LoginGateView: React.FC = () => {
  const { drivers, routes, packages, loginAsAdmin, loginAsDriver, setUserRole, setCurrentTab, triggerSound } = useLogistics();

  const [activePortal, setActivePortal] = useState<'admin' | 'driver' | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Admin form
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Driver form
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || 'drv-01');
  const [driverPassword, setDriverPassword] = useState('');
  const [showDriverPass, setShowDriverPass] = useState(false);
  const [driverError, setDriverError] = useState('');

  // Quick Tracking code input from login gate
  const [trackingInput, setTrackingInput] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const res = loginAsAdmin(adminPassword);
    if (!res.success) {
      setAdminError(res.message || 'Contraseña incorrecta');
      triggerSound();
    }
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDriverError('');
    const res = loginAsDriver(selectedDriverId, driverPassword);
    if (!res.success) {
      setDriverError(res.message || 'Contraseña o PIN incorrecto');
      triggerSound();
    }
  };

  const handleQuickTracking = (e: React.FormEvent) => {
    e.preventDefault();
    setUserRole('public');
    setCurrentTab('tracking');
  };

  const selectedDriverObj = drivers.find(d => d.id === selectedDriverId) || drivers[0];

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-sky-950/40">
            <img
              src="/assets/aistudio/image_d9acb0e9.png"
              alt="Adrian C Logística Integral"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Adrian C Logística Integral
            </h1>
            <p className="text-xs sm:text-sm text-sky-400 font-semibold uppercase tracking-wider mt-0.5">
              A C Logística Integral · Viajes y Transporte
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              Bienvenido al sistema integral de transporte. Selecciona tu perfil de ingreso para acceder:
            </p>
          </div>
        </div>

        {/* Portal Selection Cards if none selected or segmented buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Administrador */}
          <div
            onClick={() => {
              setActivePortal('admin');
              setAdminError('');
            }}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group shadow-xl ${
              activePortal === 'admin'
                ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Panel Central
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                Entrar como Administrador
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Control de flota completa, hojas de ruta, emisión de remitos, asignaciones y gestión de mantenimiento.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <span>{activePortal === 'admin' ? 'Formulario activo' : 'Ingresar con contraseña'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Chofer */}
          <div
            onClick={() => {
              setActivePortal('driver');
              setDriverError('');
            }}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group shadow-xl ${
              activePortal === 'driver'
                ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Modo Móvil
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Entrar como Chofer
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                App móvil para conductores: hoja de ruta del día, llamadas, GPS y validación de entregas con firma digital.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>{activePortal === 'driver' ? 'Formulario activo' : 'Seleccionar chofer y contraseña'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Selected Authentication Form Area */}
        {activePortal === 'admin' && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Autenticación de Administrador</h4>
                  <p className="text-xs text-slate-400">Introduce la contraseña del centro de control logístico</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePortal(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Cambiar perfil
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña de Administrador *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    autoFocus
                    value={adminPassword}
                    onChange={e => {
                      setAdminPassword(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Ingresa la contraseña..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Ingresar al Panel Central</span>
              </button>

              {/* Quick credential filler for convenience */}
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Clave de demostración rápida:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminPassword('admin2026');
                    setAdminError('');
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-mono underline bg-slate-950 px-3 py-1 rounded-lg border border-slate-800"
                >
                  Usar "admin2026"
                </button>
              </div>
            </form>
          </div>
        )}

        {activePortal === 'driver' && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Acceso para Conductores</h4>
                  <p className="text-xs text-slate-400">Cada chofer ingresa con su usuario y contraseña personal</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePortal(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Cambiar perfil
              </button>
            </div>

            <form onSubmit={handleDriverSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Selecciona tu Nombre de Conductor *</span>
                  <span className="text-[11px] text-emerald-400 font-normal">Muestra encomiendas asignadas</span>
                </label>
                <select
                  value={selectedDriverId}
                  onChange={e => {
                    setSelectedDriverId(e.target.value);
                    setDriverError('');
                    setDriverPassword('');
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {drivers.map((d: Driver) => {
                    const driverRoute = routes.find((r: RouteSheet) => r.driverId === d.id && r.status !== 'Completada') || routes.find((r: RouteSheet) => r.driverId === d.id);
                    const driverPkgs = packages.filter((p: PackageRemito) => p.routeId === driverRoute?.id || driverRoute?.stops?.some((s: any) => s.packageId === p.id));
                    const count = driverPkgs.length > 0 ? driverPkgs.length : (driverRoute?.totalPackages || 0);

                    return (
                      <option key={d.id} value={d.id}>
                        {d.fullName} (DNI: {d.dni}) — 📦 {count} encomiendas [{d.status}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedDriverObj && (() => {
                const driverRoute = routes.find((r: RouteSheet) => r.driverId === selectedDriverObj.id && r.status !== 'Completada') || routes.find((r: RouteSheet) => r.driverId === selectedDriverObj.id);
                const driverPkgs = packages.filter((p: PackageRemito) => p.routeId === driverRoute?.id || driverRoute?.stops?.some((s: any) => s.packageId === p.id));
                const count = driverPkgs.length > 0 ? driverPkgs.length : (driverRoute?.totalPackages || 0);
                const bultos = driverPkgs.length > 0 ? driverPkgs.reduce((acc: number, p: PackageRemito) => acc + p.packagesCount, 0) : (driverRoute?.totalPackages || 0);
                const pendingCount = driverPkgs.filter((p: PackageRemito) => p.status !== 'Entregado').length;

                return (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Carga / Encomiendas asignadas:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1.5">
                        <span>📦</span>
                        <span>{count} encomiendas</span>
                        <span className="text-slate-400 text-xs font-normal">({bultos} bultos)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-slate-900">
                      <span className="text-[11px] text-slate-400">
                        Hoja de ruta: <strong className="text-white font-mono">{driverRoute?.routeNumber || 'Sin ruta asignada'}</strong>
                      </span>
                      <span className="text-[11px] text-sky-400 font-medium">
                        {driverRoute ? `${driverRoute.originCity} ➔ ${driverRoute.destinationCity}` : 'Disponible'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Licencia: <strong className="text-slate-300">{selectedDriverObj.licenseCategory}</strong></span>
                      <span className="text-amber-400/90 font-medium">
                        {count > 0 ? `${pendingCount} pendientes de entrega` : 'Sin viajes activos'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña o PIN del Conductor *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showDriverPass ? 'text' : 'password'}
                    required
                    value={driverPassword}
                    onChange={e => {
                      setDriverPassword(e.target.value);
                      setDriverError('');
                    }}
                    placeholder={`Contraseña de ${selectedDriverObj.fullName.split(' ')[0]}...`}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDriverPass(!showDriverPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showDriverPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {driverError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{driverError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Ingresar a la Hoja de Ruta</span>
              </button>

              {/* Quick credential chips for each driver */}
              <div className="pt-2 text-center space-y-1.5">
                <span className="text-[11px] text-slate-400 block">
                  Autocompletar clave de prueba para {selectedDriverObj.fullName}:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDriverPassword(selectedDriverObj.password || 'chofer123');
                      setDriverError('');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    Clave: "{selectedDriverObj.password || 'chofer123'}"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDriverPassword(selectedDriverObj.pin || '1234');
                      setDriverError('');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    PIN: "{selectedDriverObj.pin || '1234'}"
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Public Tracking Direct Gateway */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">¿Eres cliente y quieres rastrear tu envío?</h4>
              <p className="text-xs text-slate-400">
                No necesitas iniciar sesión. Ingresa tu número de guía para ver la ubicación en tiempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickTracking}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Ir al Rastreador Público</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean database / reset link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-[11px] text-slate-500 hover:text-rose-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reiniciar sistema a cero (sin datos de prueba)</span>
          </button>
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
