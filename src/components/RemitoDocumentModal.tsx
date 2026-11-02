import React from 'react';
import { PackageRemito } from '../types';
import { Printer, Share2, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface RemitoDocumentModalProps {
  packageItem: PackageRemito;
  onClose: () => void;
  onOpenSignature?: () => void;
}

export const RemitoDocumentModal: React.FC<RemitoDocumentModalProps> = ({
  packageItem,
  onClose,
  onOpenSignature,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola ${packageItem.recipientName}! Desde Adrian C Logística Integral te compartimos el Remito Digital de tu encomienda #${packageItem.trackingNumber}. Puedes seguir el estado en tiempo real aquí: ${window.location.origin}?tracking=${packageItem.trackingNumber}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top bar (hidden in print) */}
        <div className="no-print p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Remito Oficial de Transporte</span>
            <span className="text-xs font-mono text-sky-400">#{packageItem.remitoNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-500 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Remito Sheet (Light / Paper styled for realism and printability) */}
        <div className="p-6 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0">
          <div className="border-2 border-slate-900 rounded-lg p-5 bg-white text-slate-900 relative">
            {/* Top Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/image_d9acb0e9.png"
                  alt="Adrian C Logística Integral"
                  className="w-14 h-14 object-contain rounded-lg"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                    Adrian C Logística Integral
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    A C Logística Integral · Viajes y Transporte Interprovincial
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Base Operativa Central · CUIT: 30-71829401-2 · Tel: +54 9 341 582-9901
                  </p>
                </div>
              </div>

              {/* Remito Badge Box */}
              <div className="text-right border-l-2 border-slate-900 pl-4">
                <div className="inline-block border-2 border-slate-900 px-3 py-1 rounded font-black text-xl bg-slate-100">
                  R
                </div>
                <div className="text-xs font-bold text-slate-900 uppercase mt-1">
                  Remito de Carga
                </div>
                <div className="font-mono text-sm font-black text-slate-900">
                  Nº {packageItem.remitoNumber}
                </div>
                <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                  Tracking: <strong className="text-sky-700">{packageItem.trackingNumber}</strong>
                </div>
              </div>
            </div>

            {/* Remitente and Destinatario Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3 border-b-2 border-slate-900 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block mb-1">
                  DATOS DEL REMITENTE
                </span>
                <p className="font-bold text-sm text-slate-900">{packageItem.senderName}</p>
                <p className="text-slate-600">CUIT / DNI: <span className="font-mono">{packageItem.senderDniCuit}</span></p>
                <p className="text-slate-600">Domicilio: {packageItem.senderAddress}</p>
                <p className="text-slate-600">Localidad: <strong>{packageItem.senderCity}</strong></p>
                <p className="text-slate-600">Teléfono: {packageItem.senderPhone}</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block mb-1">
                  DATOS DEL DESTINATARIO
                </span>
                <p className="font-bold text-sm text-slate-900">{packageItem.recipientName}</p>
                <p className="text-slate-600">DNI / CUIT: <span className="font-mono">{packageItem.recipientDniCuit}</span></p>
                <p className="text-slate-600">Dirección de Entrega: {packageItem.recipientAddress}</p>
                <p className="text-slate-600">Ciudad / Destino: <strong>{packageItem.recipientCity}</strong></p>
                <p className="text-slate-600">Tel: {packageItem.recipientPhone}</p>
              </div>
            </div>

            {/* Transport Logistics Info Bar */}
            <div className="py-2.5 border-b-2 border-slate-900 text-xs flex flex-wrap items-center justify-between bg-slate-100 px-3 rounded mt-2">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Hoja de Ruta</span>
                <span className="font-bold font-mono text-slate-900">
                  {packageItem.routeNumber || 'HR-2026-ASIGNADA'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Estado Actual</span>
                <span className="font-bold text-slate-900">{packageItem.status}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Tiempo Estimado</span>
                <span className="font-mono text-slate-900 font-semibold">{packageItem.eta}</span>
              </div>
            </div>

            {/* Merchandise detail table */}
            <div className="my-3">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 uppercase font-bold text-[10px]">
                    <th className="border border-slate-300 p-2 text-center w-16">Bultos</th>
                    <th className="border border-slate-300 p-2">Descripción de la Carga</th>
                    <th className="border border-slate-300 p-2 text-right w-24">Peso (Kg)</th>
                    <th className="border border-slate-300 p-2 text-right w-32">Valor Declarado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 text-center font-bold font-mono">
                      {packageItem.packagesCount}
                    </td>
                    <td className="border border-slate-300 p-2">
                      <p className="font-semibold text-slate-900">{packageItem.description}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Embalaje reglamentario. Seguro de transporte y custodia satelital activa.
                      </p>
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                      {packageItem.weightKg} kg
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                      ${packageItem.declaredValue.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Delivery Validation & Signature Box */}
            <div className="border-2 border-slate-900 rounded p-3 mt-4 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
                <span className="font-bold text-xs uppercase text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  CONSTANCIA DE RECEPCIÓN Y CONFORMIDAD (FIRMA DIGITAL)
                </span>
                {packageItem.status === 'Entregado' ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    ENTREGA VALIDADA
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    PENDIENTE DE ENTREGA
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="text-xs space-y-1">
                  <p className="text-slate-700">
                    Recibido por:{' '}
                    <strong className="text-slate-900">
                      {packageItem.deliveredToName || packageItem.recipientName}
                    </strong>
                  </p>
                  <p className="text-slate-700">
                    DNI / Identificación:{' '}
                    <strong className="font-mono text-slate-900">
                      {packageItem.deliveredToDni || packageItem.recipientDniCuit}
                    </strong>
                  </p>
                  <p className="text-slate-700">
                    Fecha y Hora:{' '}
                    <span className="font-mono text-slate-900">
                      {packageItem.deliveredAt || 'Al momento de entrega'}
                    </span>
                  </p>
                  {packageItem.deliveryNotes && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{packageItem.deliveryNotes}"
                    </p>
                  )}
                </div>

                <div className="border border-slate-300 rounded bg-white p-2 flex flex-col items-center justify-center min-h-[90px]">
                  {packageItem.deliverySignature ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={packageItem.deliverySignature}
                        alt="Firma Digital Destinatario"
                        className="max-h-16 object-contain"
                      />
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">
                        Firma Digital Validada
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <span className="text-xs text-slate-400 font-mono">
                        [Espacio reservado para firma digital]
                      </span>
                      {onOpenSignature && (
                        <button
                          type="button"
                          onClick={onOpenSignature}
                          className="no-print mt-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 underline"
                        >
                          Capturar firma ahora
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer barcode & legal notices */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-slate-700" />
                <span>
                  Documento electrónico generado por Adrian C Logística Integral. Validez como constancia de entrega.
                </span>
              </div>
              <div className="font-mono font-bold text-slate-800 tracking-widest">
                |||| | |||||| || |||| |||||
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cerrar Remito
          </button>
        </div>
      </div>
    </div>
  );
};
