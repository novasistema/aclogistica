import React, { useRef, useState, useEffect } from 'react';
import { PackageRemito } from '../types';
import { PenTool, CheckCircle2, X, RotateCcw, ShieldCheck, MapPin, Package, User } from 'lucide-react';

interface DigitalSignatureModalProps {
  packageItem: PackageRemito;
  onClose: () => void;
  onConfirmDelivery: (
    packageId: string,
    signatureDataUrl: string,
    deliveredToName: string,
    deliveredToDni: string,
    notes?: string
  ) => Promise<void>;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  packageItem,
  onClose,
  onConfirmDelivery,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [receiverName, setReceiverName] = useState(packageItem.recipientName || '');
  const [receiverDni, setReceiverDni] = useState(packageItem.recipientDniCuit || '');
  const [deliveryNotes, setDeliveryNotes] = useState('Recibido conforme en domicilio/local');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup canvas resolution and styling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0284c7'; // Professional logistics navy-cyan ink
    ctx.lineWidth = 2.5;
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setErrorMsg('');
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleValidate = async () => {
    if (!receiverName.trim()) {
      setErrorMsg('Por favor ingresa el nombre de la persona que recibe.');
      return;
    }
    if (!receiverDni.trim()) {
      setErrorMsg('Por favor ingresa el DNI de quien recibe.');
      return;
    }
    if (!hasSignature || !canvasRef.current) {
      setErrorMsg('Es obligatoria la firma digital en pantalla para validar la entrega.');
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');
      await onConfirmDelivery(
        packageItem.id,
        signatureDataUrl,
        receiverName.trim(),
        receiverDni.trim(),
        deliveryNotes
      );
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al registrar la firma digital. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Validación de Entrega con Firma Digital</h3>
              <p className="text-xs text-slate-400">
                Remito: <span className="font-mono text-slate-200">{packageItem.remitoNumber}</span> · Guía:{' '}
                <span className="font-mono text-sky-400">{packageItem.trackingNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Consignment Quick Summary */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-sky-400" />
                {packageItem.packagesCount} bulto(s) · {packageItem.weightKg} kg
              </span>
              <span className="text-slate-400 font-mono">Valor dec: ${packageItem.declaredValue.toLocaleString('es-AR')}</span>
            </div>
            <p className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate text-slate-200 font-medium">
                {packageItem.recipientAddress}, {packageItem.recipientCity}
              </span>
            </p>
            <p className="text-slate-400 text-[11px] truncate">
              Contenido: <span className="text-slate-300">{packageItem.description}</span>
            </p>
          </div>

          {/* Receiver Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre de quien recibe *
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={e => setReceiverName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                DNI / CUIT de quien recibe *
              </label>
              <input
                type="text"
                value={receiverDni}
                onChange={e => setReceiverDni(e.target.value)}
                placeholder="Ej. 32.415.892"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observaciones de recepción
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={e => setDeliveryNotes(e.target.value)}
              placeholder="Ej. Recibió en portería / Sin daños visibles"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Digital Signature Touch Pad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-sky-400" />
                Firma Digital en Pantalla (Táctil o Mouse) *
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 py-0.5 px-2 rounded hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Borrar firma
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-700 rounded-xl bg-slate-950 overflow-hidden touch-none h-44 cursor-crosshair">
              {/* Baseline signature guide */}
              <div className="absolute inset-x-8 bottom-8 border-b border-slate-800 pointer-events-none flex justify-end">
                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">
                  Firme sobre la línea
                </span>
              </div>

              {!hasSignature && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none select-none">
                  <PenTool className="w-7 h-7 mb-1 opacity-40 text-sky-400" />
                  <span className="text-xs">Dibuje su firma con el dedo o puntero</span>
                </div>
              )}

              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full block"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              La firma se estampará en el remito digital y quedará registrada con fecha y hora.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleValidate}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Validando...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Validar y Confirmar Entrega
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
