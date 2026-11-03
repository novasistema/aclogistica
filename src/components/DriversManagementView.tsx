import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { Driver, DriverStatus } from '../types';
import {
  Users,
  Plus,
  ShieldCheck,
  Phone,
  Mail,
  Truck,
  Star,
  Award,
  CheckCircle2,
  Calendar,
  X,
  FileBadge,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Gauge,
  Check,
  RotateCcw,
} from 'lucide-react';
import { DriverReport } from '../types';

export const DriversManagementView: React.FC = () => {
  const {
    drivers,
    vehicles,
    routes,
    packages,
    driverReports,
    addDriver,
    updateDriver,
    updateVehicle,
    deleteDriver,
    resolveDriverReport,
    deleteDriverReport,
  } = useLogistics();

  const [activeView, setActiveView] = useState<'drivers' | 'reports'>('drivers');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [assignedVehicleId, setAssignedVehicleId] = useState('');

  // Penalize Modal state
  const [reportToResolve, setReportToResolve] = useState<DriverReport | null>(null);
  const [penaltyPointsInput, setPenaltyPointsInput] = useState<number>(8);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('E1 - Cargas Generales y Peligrosas');
  const [licenseExpiration, setLicenseExpiration] = useState('2028-10-15');
  const [emergencyContact, setEmergencyContact] = useState('');

  const filteredDrivers = drivers.filter(d => {
    if (filterStatus === 'all') return true;
    return d.status === filterStatus;
  });

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dni.trim() || !phone.trim()) return;

    await addDriver({
      fullName: fullName.trim(),
      dni: dni.trim(),
      phone: phone.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@logistica-integral.com`,
      licenseCategory,
      licenseExpiration,
      status: 'Disponible',
      rating: 5.0,
      totalDeliveries: 0,
      emergencyContact: emergencyContact.trim(),
    });

    setShowAddModal(false);
    setFullName('');
    setDni('');
    setPhone('');
    setEmail('');
    setEmergencyContact('');
  };

  const handleAssignVehicle = async (driver: Driver, newVehId: string) => {
    const selectedVeh = vehicles.find(v => v.id === newVehId);
    await updateDriver(driver.id, { currentVehicleId: newVehId || undefined });
    if (selectedVeh) {
      await updateVehicle(selectedVeh.id, {
        assignedDriverId: driver.id,
        assignedDriverName: driver.fullName,
      });
    }
    setSelectedDriverForAssign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Gestión Centralizada de Conductores y Asignaciones
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Plantel de choferes profesionales, categorías de licencia, asignación de unidades y hojas de ruta.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeView === 'drivers' ? (
            <>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                {['all', 'Disponible', 'En Viaje', 'Descanso'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      filterStatus === st ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? `Todos (${drivers.length})` : st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Conductor</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              {['all', 'Pendiente', 'Verificado / Penalizado', 'Desestimado'].map(st => (
                <button
                  key={st}
                  onClick={() => setReportFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    reportFilter === st ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? `Todos (${driverReports.length})` : st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveView('drivers')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === 'drivers'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Plantel de Choferes ({drivers.length})</span>
        </button>

        <button
          onClick={() => setActiveView('reports')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors relative ${
            activeView === 'reports'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Control de Manejo y Penalizaciones</span>
          {driverReports.filter(r => r.status === 'Pendiente').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              {driverReports.filter(r => r.status === 'Pendiente').length} pend.
            </span>
          )}
        </button>
      </div>

      {activeView === 'drivers' ? (
        /* Drivers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map(drv => {
            const isEnViaje = drv.status === 'En Viaje';
            const isDisponible = drv.status === 'Disponible';
            const currentVehicle = vehicles.find(
              v => v.id === drv.currentVehicleId || v.assignedDriverId === drv.id
            );
            const activeRoute = routes.find(
              r => r.driverId === drv.id && r.status === 'En Tránsito'
            );
            const score = drv.drivingScore ?? 95;
            const penaltyPts = drv.penaltyPoints ?? 0;
            const driverPendingReports = driverReports.filter(
              r => (r.driverId === drv.id || (currentVehicle && r.plateOrVehicleNumber.toLowerCase() === currentVehicle.plate.toLowerCase())) && r.status === 'Pendiente'
            ).length;

            return (
              <div
                key={drv.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-base">
                        {drv.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{drv.fullName}</h3>
                        <span className="text-xs text-slate-400 font-mono">DNI: {drv.dni}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        isEnViaje
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isDisponible
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {drv.status}
                    </span>
                  </div>

                  {/* Driving Score & Penalty Banner */}
                  <div className="my-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Gauge className={`w-4 h-4 ${score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-amber-400' : 'text-rose-400'}`} />
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Scoring de Manejo</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-black text-sm ${score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {score}/100
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({penaltyPts > 0 ? `-${penaltyPts} pts` : 'Sin sanciones'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {driverPendingReports > 0 ? (
                      <button
                        onClick={() => setActiveView('reports')}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/20"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{driverPendingReports} reporte{driverPendingReports > 1 ? 's' : ''}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Conducción óptima
                      </span>
                    )}
                  </div>

                  {/* License details */}
                  <div className="my-3 space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex items-start gap-1.5 text-slate-300">
                      <FileBadge className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white">{drv.licenseCategory}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Vence: {drv.licenseExpiration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {drv.phone}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {drv.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Assignment details */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-sky-400" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Unidad Asignada</span>
                          <span className="font-mono font-bold text-white">
                            {currentVehicle ? `${currentVehicle.plate} (${currentVehicle.brandModel})` : 'Sin asignar'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDriverForAssign(drv);
                          setAssignedVehicleId(currentVehicle?.id || '');
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-semibold"
                      >
                        Asignar
                      </button>
                    </div>

                    {(() => {
                      const driverRoute = routes.find((r: any) => r.driverId === drv.id && r.status !== 'Completada') || routes.find((r: any) => r.driverId === drv.id);
                      const driverPkgs = packages.filter((p: any) => p.routeId === driverRoute?.id || driverRoute?.stops?.some((s: any) => s.packageId === p.id));
                      const count = driverPkgs.length > 0 ? driverPkgs.length : (driverRoute?.totalPackages || 0);
                      const bultos = driverPkgs.length > 0 ? driverPkgs.reduce((acc: number, p: any) => acc + p.packagesCount, 0) : (driverRoute?.totalPackages || 0);

                      return (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Encomiendas asignadas:</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {count > 0 ? `${count} encomiendas (${bultos} bultos)` : '0 encomiendas'}
                          </span>
                        </div>
                      );
                    })()}

                    {activeRoute && (
                      <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-300">
                        <span className="font-bold block">Hoja de Ruta en curso:</span>
                        <span>
                          {activeRoute.routeNumber} ({activeRoute.originCity} ➔ {activeRoute.destinationCity})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status footer toggle and delete */}
                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Estado:</span>
                    <select
                      value={drv.status}
                      onChange={e => updateDriver(drv.id, { status: e.target.value as DriverStatus })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none focus:border-sky-500"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="En Viaje">En Viaje</option>
                      <option value="Descanso">Descanso</option>
                      <option value="Licencia">Licencia</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDriverToDelete(drv)}
                    title="Eliminar este conductor del plantel"
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
      ) : (
        /* Driver Reports & Penalty Management View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">
                Control de Conducta Vial y Gestión de Penalizaciones
              </p>
              <p className="mt-1 text-slate-300">
                Los ciudadanos y clientes pueden reportar o felicitar a los móviles mediante el botón <strong>&quot;¿Cómo manejo?&quot;</strong> ingresando la patente o número de móvil. Desde aquí puedes auditar cada reporte, verificar la telemetría, aplicar deducción de puntos al scoring del chofer o desestimar el caso.
              </p>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driverReports
              .filter(r => {
                if (reportFilter === 'all') return true;
                return r.status === reportFilter;
              })
              .map(report => {
                const isPending = report.status === 'Pendiente';
                const isPenalized = report.status === 'Verificado / Penalizado';
                const isDismissed = report.status === 'Desestimado';

                return (
                  <div
                    key={report.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono font-bold text-xs">
                              {report.plateOrVehicleNumber}
                            </span>
                            {report.driverName && (
                              <span className="text-xs text-slate-300 font-semibold">
                                • {report.driverName}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">
                            {report.reportType}
                          </h4>
                        </div>

                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : isPenalized
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 leading-relaxed border border-slate-800/80">
                        &quot;{report.description}&quot;
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="text-slate-500 block">Lugar / Ubicación:</span>
                          <span className="text-white font-medium">{report.incidentLocation || 'No especificado'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Fecha y Hora:</span>
                          <span className="text-white font-medium">{report.incidentDate} - {report.incidentTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Denunciante / Ciudadano:</span>
                          <span className="text-slate-300">{report.reportedBy || 'Anónimo'} {report.contactPhone ? `(${report.contactPhone})` : ''}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">N° Ticket Referencia:</span>
                          <span className="font-mono text-sky-400">{report.reportNumber}</span>
                        </div>
                      </div>

                      {/* Penalty details if resolved */}
                      {report.penaltyPoints !== undefined && report.penaltyPoints > 0 && isPenalized && (
                        <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span>Penalización Aplicada:</span>
                            <span className="font-mono text-rose-400">-{report.penaltyPoints} Puntos</span>
                          </div>
                          {report.adminResolutionNotes && (
                            <p className="text-[11px] text-slate-300">
                              Resolución: {report.adminResolutionNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Report action footer */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => deleteDriverReport(report.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1 transition-colors"
                        title="Borrar registro de reporte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Borrar</span>
                      </button>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => resolveDriverReport(report.id, 'desestimar', 0, 'Reporte desestimado tras verificación de telemetría y tacógrafo.')}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            Desestimar
                          </button>
                          <button
                            onClick={() => {
                              setReportToResolve(report);
                              setPenaltyPointsInput(8);
                              setResolutionNotes(`Sanción por ${report.reportType}. Constatado con auditoría de tráfico.`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Aplicar Penalización</span>
                          </button>
                        </div>
                      )}

                      {!isPending && (
                        <span className="text-[11px] text-slate-500 italic">
                          Auditado por Administración
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {driverReports.length === 0 && (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
              No hay reportes ni denuncias viales registradas actualmente.
            </div>
          )}
        </div>
      )}

      {/* Penalize Resolution Modal */}
      {reportToResolve && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Aplicar Penalización a Conductor</h3>
              </div>
              <button
                onClick={() => setReportToResolve(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p><strong>Móvil / Patente:</strong> {reportToResolve.plateOrVehicleNumber}</p>
              <p><strong>Motivo:</strong> {reportToResolve.reportType}</p>
              <p><strong>Relato:</strong> {reportToResolve.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Puntos a descontar del Scoring (1 a 30)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={penaltyPointsInput}
                    onChange={e => setPenaltyPointsInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex gap-1.5">
                    {[5, 8, 12, 20].map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setPenaltyPointsInput(pt)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                          penaltyPointsInput === pt ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        -{pt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dictamen / Observaciones administrativas
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Detalles de la penalización, apercibimiento o suspensión preventiva..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReportToResolve(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (reportToResolve) {
                    await resolveDriverReport(
                      reportToResolve.id,
                      'penalizar',
                      penaltyPointsInput,
                      resolutionNotes
                    );
                    setReportToResolve(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Sanción</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vehicle Drawer Modal */}
      {selectedDriverForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Asignar Móvil a {selectedDriverForAssign.fullName}
              </h3>
              <button
                onClick={() => setSelectedDriverForAssign(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Selecciona la unidad de transporte
              </label>
              <select
                value={assignedVehicleId}
                onChange={e => setAssignedVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">Desvincular unidad actual</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plate} - {v.brandModel} ({v.type}) [{v.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDriverForAssign(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAssignVehicle(selectedDriverForAssign, assignedVehicleId)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20"
              >
                Confirmar Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Registrar Nuevo Conductor</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ej. Martín Gomez"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">DNI *</label>
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                    placeholder="34.120.450"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+54 9 341 555-1234"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="m.gomez@logistica-integral.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoría Licencia *</label>
                  <select
                    value={licenseCategory}
                    onChange={e => setLicenseCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="E1 - Cargas Generales y Peligrosas">E1 - Cargas Generales y Peligrosas</option>
                    <option value="C1 - Camiones sin acoplado">C1 - Camiones sin acoplado</option>
                    <option value="B2 - Utilitarios y camionetas">B2 - Utilitarios y camionetas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vencimiento Licencia</label>
                  <input
                    type="date"
                    value={licenseExpiration}
                    onChange={e => setLicenseExpiration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  placeholder="Ej. Mariana Gomez (Hermana) - +54 9 341 444-5566"
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
                  Guardar Conductor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Driver Confirmation Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">¿Eliminar conductor del plantel?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás por eliminar al conductor <strong className="text-white">{driverToDelete.fullName}</strong> (DNI: {driverToDelete.dni}). Se dará de baja de la nómina y de las asignaciones de carga.
                </p>
                {driverToDelete.status === 'En Viaje' && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Atención: El conductor figura &quot;En Viaje&quot; actualmente.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDriverToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (driverToDelete) {
                    await deleteDriver(driverToDelete.id);
                    setDriverToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Borrar Chofer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
