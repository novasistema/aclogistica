import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { DriverReportType } from '../types';
import {
  AlertTriangle,
  X,
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  FileText,
  ShieldAlert,
  ThumbsUp
} from 'lucide-react';

interface DriverReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledPlate?: string;
}

export const DriverReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  prefilledPlate?: string;
}> = ({ isOpen, onClose, prefilledPlate = '' }) => {
  const { vehicles, drivers, submitDriverReport } = useLogistics();

  const [plate, setPlate] = useState(prefilledPlate);
  const [reportType, setReportType] = useState<DriverReportType>('Exceso de Velocidad');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(
    new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  );
  const [incidentLocation, setIncidentLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedReportNumber, setSubmittedReportNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-detect matched vehicle & driver
  const cleanPlate = plate.trim().toUpperCase().replace(/\s+/g, '');
  const matchedVehicle = vehicles.find(
    v => v.plate.toUpperCase().replace(/\s+/g, '') === cleanPlate || v.id.toLowerCase() === plate.trim().toLowerCase()
  );
  const matchedDriver = matchedVehicle
    ? drivers.find(d => d.id === matchedVehicle.assignedDriverId)
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !incidentLocation.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const isPositive = reportType === 'Conducción Ejemplar / Felicitación';
      const severity = isPositive
        ? 'Positiva'
        : reportType === 'Exceso de Velocidad' || reportType === 'Conducción Imprudente / Maniobra Peligrosa'
        ? 'Grave'
        : reportType === 'Uso de Teléfono Celular al Volante' || reportType === 'No Respetar Señalización / Semáforo'
        ? 'Media'
        : 'Baja';

      const repNum = await submitDriverReport({
        plateOrVehicleNumber: plate.trim().toUpperCase(),
        vehicleId: matchedVehicle?.id,
        driverId: matchedDriver?.id,
        driverName: matchedDriver?.fullName || matchedVehicle?.assignedDriverName,
        reportType,
        incidentDate,
        incidentTime,
        incidentLocation: incidentLocation.trim(),
        description: description.trim(),
        severity,
        reportedBy: isAnonymous ? 'Denuncia Anónima' : reportedBy.trim() || 'Ciudadano / Usuario particular',
        contactPhone: isAnonymous ? '' : contactPhone.trim(),
      });

      setSubmittedReportNumber(repNum);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedReportNumber(null);
    setPlate('');
    setIncidentLocation('');
    setDescription('');
    setReportedBy('');
    setContactPhone('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">¿Cómo manejo? Reporte y Control de Choferes</h3>
              <p className="text-xs text-slate-400">Canal ciudadano y clientes para notificar conductas en la vía pública</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedReportNumber ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">¡Reporte Ingresado Exitosamente!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tu reporte ha sido registrado en el centro de control logístico de A C Logística Integral bajo el número:
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-base font-bold text-amber-400">
                  {submittedReportNumber}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              El área de auditoría de flota revisará la telemetría satelital (GPS, odómetro y tacógrafo digital del móvil) para contrastar el hecho y aplicar las sanciones correspondientes al legajo del chofer.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-lg shadow-sky-600/20"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Quick Fleet Vehicle Plate helper chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  Patente / Número del Vehículo *
                </label>
                <span className="text-[11px] text-slate-500">Móviles oficiales de la flota</span>
              </div>

              <input
                type="text"
                required
                value={plate}
                onChange={e => setPlate(e.target.value)}
                placeholder="Ej. AF 892 CD o AD 732 KL"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold uppercase text-sm focus:outline-none focus:border-amber-500"
              />

              {/* Detected vehicle feedback */}
              {matchedVehicle ? (
                <div className="mt-2 p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/50 flex items-center justify-between text-xs text-sky-300">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-400" />
                    <span>
                      <strong>Móvil identificado:</strong> {matchedVehicle.brandModel} ({matchedVehicle.plate})
                    </span>
                  </div>
                  {matchedVehicle.assignedDriverName && (
                    <span className="text-[11px] text-slate-400">
                      Chofer habitual: <strong className="text-white">{matchedVehicle.assignedDriverName}</strong>
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500">Móviles en ruta:</span>
                  {vehicles.slice(0, 4).map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setPlate(v.plate)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 transition-colors"
                    >
                      {v.plate}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Motivo del reporte */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Motivo del Reporte / Tipo de Infracción *
              </label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as DriverReportType)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="Exceso de Velocidad">🚨 Exceso de Velocidad</option>
                <option value="Conducción Imprudente / Maniobra Peligrosa">⚠️ Conducción Imprudente / Maniobra Peligrosa</option>
                <option value="Adelantamiento Indebido">⛔ Adelantamiento Indebido / Encierro</option>
                <option value="Uso de Teléfono Celular al Volante">📱 Uso de Teléfono Celular al Volante</option>
                <option value="No Respetar Señalización / Semáforo">🛑 Semáforo en Rojo / No Ceder el Paso</option>
                <option value="Estacionamiento Indebido / Bloqueo">🅿️ Estacionamiento Indebido / Obstrucción de Garaje o Rampa</option>
                <option value="Falta de Respeto / Trato Inadecuado">💬 Falta de Respeto / Agresividad Vial</option>
                <option value="Conducción Ejemplar / Felicitación">👍 Felicitación / Conducción Ejemplar y Prudente</option>
                <option value="Otro Motivo">📝 Otro Motivo</option>
              </select>
            </div>

            {/* Date, Time and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha del Suceso</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hora Aproximada</label>
                <input
                  type="text"
                  value={incidentTime}
                  onChange={e => setIncidentTime(e.target.value)}
                  placeholder="Ej. 14:30 hs"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Lugar / Intersección / Ruta *
              </label>
              <input
                type="text"
                required
                value={incidentLocation}
                onChange={e => setIncidentLocation(e.target.value)}
                placeholder="Ej. Av. Pellegrini esquina Mitre, Rosario / o RN 9 km 305"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción Detallada del Hecho *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explica qué maniobra o situación ocurrió..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Informant identity */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Datos de Contacto (Opcional)
                </span>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Reportar de forma anónima</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={reportedBy}
                    onChange={e => setReportedBy(e.target.value)}
                    placeholder="Tu nombre o apellido"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="Teléfono / WhatsApp para contacto"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando Reporte...' : 'Enviar Reporte de Conducción'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
