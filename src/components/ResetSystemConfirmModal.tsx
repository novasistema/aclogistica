import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { AlertTriangle, Trash2, RotateCcw, X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ResetSystemConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetSystemConfirmModal: React.FC<ResetSystemConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resetSystemEmptyData, resetToSampleData, triggerSound } = useLogistics();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetEmpty = async () => {
    setIsProcessing(true);
    triggerSound();
    await resetSystemEmptyData();
    setIsProcessing(false);
    setSuccessMessage('El sistema ha sido reiniciado a cero con éxito.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1400);
  };

  const handleResetDemo = async () => {
    setIsProcessing(true);
    triggerSound();
    await resetToSampleData();
    setIsProcessing(false);
    setSuccessMessage('Datos de demostración restablecidos con éxito.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Reiniciar Sistema</h3>
              <p className="text-xs text-slate-400">Gestión y depuración de la base de datos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {successMessage ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <p className="text-sm font-bold text-white">{successMessage}</p>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>¿Deseas reiniciar el sistema sin datos?</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Esta acción vaciará todas las <strong>hojas de ruta</strong>, <strong>encomiendas</strong>, <strong>remitos</strong> y <strong>móviles</strong>, dejando el sistema completamente en blanco para que puedas ingresar tus datos reales de operación.
                </p>
              </div>

              <div className="text-xs text-slate-400 space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="font-semibold text-slate-200">Al reiniciar sin datos:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Se conservará tu acceso de Administrador (clave: <code className="text-sky-400">admin2026</code>).</li>
                  <li>Se creará un perfil inicial de chofer para pruebas inmediatas.</li>
                  <li>Podrás volver a cargar los datos de muestra en cualquier momento si lo necesitas.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  disabled={isProcessing}
                  onClick={handleResetEmpty}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sí, reiniciar sistema sin datos (A cero)</span>
                </button>

                <button
                  disabled={isProcessing}
                  onClick={handleResetDemo}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer datos de muestra (Demo)</span>
                </button>

                <button
                  disabled={isProcessing}
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
