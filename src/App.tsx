/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogisticsProvider, useLogistics } from './lib/store';
import { NavigationHeader } from './components/NavigationHeader';
import { GeneralDashboardView } from './components/GeneralDashboardView';
import { FleetManagementView } from './components/FleetManagementView';
import { RouteSheetsView } from './components/RouteSheetsView';
import { PackagesRemitosView } from './components/PackagesRemitosView';
import { MaintenanceFleetView } from './components/MaintenanceFleetView';
import { DriversManagementView } from './components/DriversManagementView';
import { PublicTrackingView } from './components/PublicTrackingView';
import { DriverAppView } from './components/DriverAppView';
import { RemitoDocumentModal } from './components/RemitoDocumentModal';
import { DigitalSignatureModal } from './components/DigitalSignatureModal';
import { ShieldCheck, Truck, Phone, Mail, MapPin } from 'lucide-react';

import { LoginGateView } from './components/LoginGateView';

const AppContent: React.FC = () => {
  const {
    userRole,
    setUserRole,
    currentTab,
    selectedPackageForRemito,
    setSelectedPackageForRemito,
    selectedPackageForSignature,
    setSelectedPackageForSignature,
    validateDeliveryWithSignature,
  } = useLogistics();

  // If user is not authenticated or hasn't selected a portal, show Login Gateway
  if (!userRole) {
    return (
      <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
        <LoginGateView />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <NavigationHeader />

      {/* Main Workspace Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {userRole === 'driver' ? (
          <DriverAppView />
        ) : (
          <>
            {currentTab === 'dashboard' && <GeneralDashboardView />}
            {currentTab === 'fleet' && <FleetManagementView />}
            {currentTab === 'routes' && <RouteSheetsView />}
            {currentTab === 'packages' && <PackagesRemitosView />}
            {currentTab === 'maintenance' && <MaintenanceFleetView />}
            {currentTab === 'drivers' && <DriversManagementView />}
            {currentTab === 'tracking' && <PublicTrackingView />}
            {currentTab === 'driver-app' && <DriverAppView />}
          </>
        )}
      </main>

      {/* Global Modals */}
      {selectedPackageForRemito && (
        <RemitoDocumentModal
          packageItem={selectedPackageForRemito}
          onClose={() => setSelectedPackageForRemito(null)}
          onOpenSignature={() => {
            setSelectedPackageForSignature(selectedPackageForRemito);
            setSelectedPackageForRemito(null);
          }}
        />
      )}

      {selectedPackageForSignature && (
        <DigitalSignatureModal
          packageItem={selectedPackageForSignature}
          onClose={() => setSelectedPackageForSignature(null)}
          onConfirmDelivery={validateDeliveryWithSignature}
        />
      )}

      {/* Professional Footer */}
      <footer className="no-print border-t border-slate-800 bg-slate-950/80 py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_d9acb0e9.png"
              alt="Adrian C Logística Integral"
              className="w-7 h-7 object-contain rounded"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <p className="font-bold text-slate-200">Adrian C Logística Integral</p>
              <p className="text-[11px] text-slate-500">Viajes y transporte nacional · Base Operativa Central</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              +54 9 341 582-9901
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              contacto@logistica-integral.com
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Remitos y Firmas Digitales Homologadas
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            &copy; 2026 Adrian C Logística Integral. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LogisticsProvider>
      <AppContent />
    </LogisticsProvider>
  );
}
