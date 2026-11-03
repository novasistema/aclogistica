import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import {
  Truck,
  FileSpreadsheet,
  Package,
  Wrench,
  Users,
  Search,
  Bell,
  Smartphone,
  Menu,
  X,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Building2,
  ShieldAlert
} from 'lucide-react';

import { LogOut, Shield } from 'lucide-react';
import { ResetSystemConfirmModal } from './ResetSystemConfirmModal';
import { DriverReportModal } from './DriverReportModal';

export const NavigationHeader: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    clearAllNotifications,
    triggerSound,
    resetToSampleData,
    isOnline,
    userRole,
    authenticatedDriver,
    activeProviderId,
    providers,
    logout,
  } = useLogistics();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const adminNavItems = [
    { id: 'dashboard', label: 'Panel', fullLabel: 'Panel Central', icon: Truck },
    { id: 'fleet', label: 'Flota', fullLabel: 'Flota y Móviles', icon: Truck },
    { id: 'routes', label: 'Rutas', fullLabel: 'Hojas de Ruta', icon: FileSpreadsheet },
    { id: 'packages', label: 'Remitos', fullLabel: 'Encomiendas y Remitos', icon: Package },
    { id: 'providers', label: 'Proveedores', fullLabel: 'Proveedores', icon: Building2 },
    { id: 'maintenance', label: 'Taller', fullLabel: 'Mantenimiento', icon: Wrench },
    { id: 'drivers', label: 'Choferes', fullLabel: 'Conductores', icon: Users },
  ];

  const currentProvider = providers.find(p => p.id === activeProviderId);

  const navItems =
    userRole === 'driver'
      ? [{ id: 'driver-app', label: 'Mi Hoja de Ruta', fullLabel: 'Mi Hoja de Ruta', icon: Smartphone }]
      : userRole === 'provider'
      ? [{ id: 'providers', label: 'Portal Proveedor', fullLabel: 'Mi Portal de Proveedor', icon: Building2 }]
      : adminNavItems;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 w-full overflow-hidden">
      <div className="w-full px-2 sm:px-4 lg:px-5 flex items-center justify-between gap-2 h-16 max-w-full">
        {/* Zone 1: Single element brand mark with official logo */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
        >
          <img
            src="/assets/aistudio/image_d9acb0e9.png"
            alt="A C Logística Integral"
            className="w-9 h-9 object-contain rounded-lg border border-slate-700 bg-slate-900 group-hover:border-sky-500 transition-colors shrink-0"
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap leading-tight">
              A C Logística Integral
            </span>
            <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase leading-none mt-0.5">
              Viajes y Transporte
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-2 py-1.5 2xl:px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">{item.fullLabel || item.label}</span>
                <span className="2xl:hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Role badge */}
          {userRole === 'admin' && (
            <div className="hidden 2xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-950/60 border border-sky-800 text-sky-300 text-xs font-semibold shrink-0">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin</span>
            </div>
          )}

          {userRole === 'driver' && authenticatedDriver && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold shrink-0">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[100px] xl:max-w-[120px]">{authenticatedDriver.fullName}</span>
            </div>
          )}

          {userRole === 'provider' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-semibold shrink-0">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[90px] xl:max-w-[120px]">
                {currentProvider?.businessName || 'Proveedor'}
              </span>
            </div>
          )}

          {/* Quick Tracking Portal button */}
          <button
            onClick={() => setCurrentTab('tracking')}
            title="Rastreo Público de Envíos"
            className={`px-2 py-1.5 xl:px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              currentTab === 'tracking'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-900 border border-slate-700 text-sky-300 hover:text-white hover:border-sky-500'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Rastreo</span>
          </button>

          {/* Driver Conduct Public Button "¿Cómo manejo?" */}
          <button
            onClick={() => setReportModalOpen(true)}
            title="Reportar o calificar la conducción de un móvil"
            className="px-2 py-1.5 xl:px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-amber-300 hover:text-white text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">¿Cómo manejo?</span>
          </button>

          {/* Driver Mode switch (only for admin or when logged in) */}
          {userRole === 'admin' && (
            <button
              onClick={() => setCurrentTab('driver-app')}
              title="Cambiar a Modo Chofer"
              className={`px-2 py-1.5 xl:px-2.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                currentTab === 'driver-app'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">Chofer</span>
            </button>
          )}

          {/* Reset System Button (Admin only) - Compact Icon */}
          {userRole === 'admin' && (
            <button
              onClick={() => setResetModalOpen(true)}
              title="Reiniciar sistema sin datos (A cero)"
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-rose-500/60 text-slate-400 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Cerrar sesión y volver a la pantalla de acceso"
            className="px-2 py-1.5 xl:px-2.5 rounded-lg bg-slate-900 border border-rose-900/50 hover:border-rose-500 text-rose-400 hover:text-rose-300 transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Salir</span>
          </button>

          {/* Notification Center Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Notificaciones Push"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white text-xs">Alertas y Notificaciones Push</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Leídas
                    </button>
                    <button
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80 my-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No hay notificaciones pendientes.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`pt-2 text-xs cursor-pointer transition-colors ${
                          n.read ? 'opacity-60' : 'opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {isOnline ? 'Conectado a Firebase' : 'Modo local offline'}
                  </span>
                  <button
                    onClick={triggerSound}
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" /> Probar audio
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 ${
                currentTab === item.id
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentTab('tracking');
                setMobileMenuOpen(false);
              }}
              className="py-2 bg-slate-900 border border-slate-700 text-sky-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Rastreo Público</span>
            </button>
            <button
              onClick={() => {
                setReportModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>¿Cómo manejo?</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('driver-app');
                setMobileMenuOpen(false);
              }}
              className="col-span-2 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Modo Chofer</span>
            </button>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={() => {
                setResetModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 py-2 px-3 bg-slate-900 border border-rose-900/50 hover:border-rose-500 text-rose-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Reiniciar Sistema Sin Datos</span>
            </button>
          )}
        </div>
      )}

      {/* Reset System Modal */}
      <ResetSystemConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />

      {/* Driver Citizen Report Modal */}
      <DriverReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </header>
  );
};
