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
  Trash2,
  ShieldAlert,
  Building2,
  PackagePlus,
} from 'lucide-react';
import { ResetSystemConfirmModal } from './ResetSystemConfirmModal';
import { DriverReportModal } from './DriverReportModal';
import { ProviderRegisterModal } from './ProviderRegisterModal';

export const LoginGateView: React.FC = () => {
  const {
    drivers,
    providers,
    routes,
    packages,
    loginAsAdmin,
    loginAsDriver,
    loginAsProvider,
    setUserRole,
    setCurrentTab,
    triggerSound,
  } = useLogistics();

  const [activePortal, setActivePortal] = useState<'admin' | 'driver' | 'provider' | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDriverReportModal, setShowDriverReportModal] = useState(false);
  const [showProviderRegisterModal, setShowProviderRegisterModal] = useState(false);

  // Admin form
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Driver form
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || 'drv-01');
  const [driverPassword, setDriverPassword] = useState('');
  const [showDriverPass, setShowDriverPass] = useState(false);
  const [driverError, setDriverError] = useState('');

  // Provider form
  const [providerUser, setProviderUser] = useState('litoral');
  const [providerPassword, setProviderPassword] = useState('');
  const [showProviderPass, setShowProviderPass] = useState(false);
  const [providerError, setProviderError] = useState('');

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

  const handleProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProviderError('');
    const res = loginAsProvider(providerUser, providerPassword);
    if (!res.success) {
      setProviderError(res.message || 'Credenciales de proveedor incorrectas');
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
              alt="A C Logística Integral"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              A C Logística Integral
            </h1>
            <p className="text-xs sm:text-sm text-sky-400 font-semibold uppercase tracking-wider mt-0.5">
              Viajes y Transporte
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              Bienvenido al sistema integral de transporte. Selecciona tu perfil de ingreso o utiliza los servicios públicos:
            </p>
          </div>
        </div>

        {/* ¿CÓMO MANEJO? - Control y Reporte Ciudadano de Vehículos / Choferes */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-bold text-white text-base">
                  ¿Cómo manejo? Reporte y Control de Choferes
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                  Público
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                Ingresa la patente o número de móvil para notificar infracciones, excesos de velocidad o felicitaciones viales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDriverReportModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Ingresar Patente / Reportar</span>
          </button>
        </div>

        {/* Portal Selection Cards (3 Columns: Admin, Chofer, Proveedor) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Administrador */}
          <div
            onClick={() => {
              setActivePortal('admin');
              setAdminError('');
            }}
            className={`cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden group shadow-xl flex flex-col justify-between ${
              activePortal === 'admin'
                ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Panel Central
                </span>
              </div>

              <div className="mt-3.5">
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  Administrador
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Flota, hojas de ruta, remitos, penalizaciones y mantenimiento.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <span>{activePortal === 'admin' ? 'Formulario activo' : 'Ingresar con clave'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Chofer */}
          <div
            onClick={() => {
              setActivePortal('driver');
              setDriverError('');
            }}
            className={`cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden group shadow-xl flex flex-col justify-between ${
              activePortal === 'driver'
                ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Modo Chofer
                </span>
              </div>

              <div className="mt-3.5">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Chofer / Conductor
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Hoja de ruta del día, paradas de entrega y firma digital táctil.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>{activePortal === 'driver' ? 'Formulario activo' : 'Seleccionar chofer'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Proveedor */}
          <div
            onClick={() => {
              setActivePortal('provider');
              setProviderError('');
            }}
            className={`cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden group shadow-xl flex flex-col justify-between ${
              activePortal === 'provider'
                ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Proveedores
                </span>
              </div>

              <div className="mt-3.5">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Portal Proveedores
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Avisar retiro de mercadería con medidas (alto/ancho/profundo) y peso.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <span>{activePortal === 'provider' ? 'Formulario activo' : 'Ingresar / Registrarse'}</span>
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

        {/* Selected Authentication Form Area: PROVEEDOR */}
        {activePortal === 'provider' && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Portal de Proveedores</h4>
                  <p className="text-xs text-slate-400">Ingresa con tu usuario para avisar retiros de mercadería o regístrate</p>
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

            <form onSubmit={handleProviderSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Usuario o Correo Electrónico *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={providerUser}
                    onChange={e => {
                      setProviderUser(e.target.value);
                      setProviderError('');
                    }}
                    placeholder="Ej. litoral o despacho@empresa.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña de Proveedor *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showProviderPass ? 'text' : 'password'}
                    required
                    value={providerPassword}
                    onChange={e => {
                      setProviderPassword(e.target.value);
                      setProviderError('');
                    }}
                    placeholder="Contraseña de acceso..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProviderPass(!showProviderPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showProviderPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {providerError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{providerError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Ingresar al Portal de Proveedores</span>
              </button>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
                <span className="text-xs text-slate-400 block">¿Tu empresa aún no está registrada?</span>
                <button
                  type="button"
                  onClick={() => setShowProviderRegisterModal(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>Registrarse como Nuevo Proveedor</span>
                </button>
              </div>

              {/* Quick credential chips for test providers */}
              {providers.length > 0 && (
                <div className="pt-1 text-center space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">
                    Autocompletar proveedores de muestra:
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {providers.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProviderUser(p.username);
                          setProviderPassword(p.password || 'proveedor123');
                          setProviderError('');
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        {p.username} ("{p.password || 'proveedor123'}")
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Driver Report Modal ("¿Cómo manejo?") */}
      <DriverReportModal
        isOpen={showDriverReportModal}
        onClose={() => setShowDriverReportModal(false)}
      />

      {/* Provider Register Modal */}
      <ProviderRegisterModal
        isOpen={showProviderRegisterModal}
        onClose={() => setShowProviderRegisterModal(false)}
      />
    </div>
  );
};
