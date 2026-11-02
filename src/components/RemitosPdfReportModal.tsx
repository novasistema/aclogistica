import React, { useState } from 'react';
import { PackageRemito } from '../types';
import {
  Printer,
  X,
  FileCheck,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  Filter,
  Package,
  Layers,
  Sparkles,
  ArrowDownToLine
} from 'lucide-react';

interface RemitosPdfReportModalProps {
  packages: PackageRemito[];
  onClose: () => void;
}

export const RemitosPdfReportModal: React.FC<RemitosPdfReportModalProps> = ({
  packages,
  onClose,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'delivered_only' | 'pending'>('all');

  const filtered = packages.filter(p => {
    if (filterMode === 'delivered_only') return p.status === 'Entregado' && Boolean(p.deliverySignature);
    if (filterMode === 'pending') return p.status !== 'Entregado';
    return true;
  });

  const totalBultos = filtered.reduce((acc, p) => acc + p.packagesCount, 0);
  const totalKg = filtered.reduce((acc, p) => acc + p.weightKg, 0);
  const totalValor = filtered.reduce((acc, p) => acc + p.declaredValue, 0);
  const totalFirmados = filtered.filter(p => p.deliverySignature).length;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const currentTimeStr = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Top Control Bar (Hidden during Print) */}
        <div className="no-print p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Reporte de Remitos y Validación de Firmas
              </h3>
              <p className="text-[11px] text-slate-400">
                Formato ejecutivo listo para impresión o exportación a PDF (Ctrl + P / Guardar como PDF)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({packages.length})
              </button>
              <button
                onClick={() => setFilterMode('delivered_only')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'delivered_only'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Firmados ({packages.filter(p => p.deliverySignature).length})
              </button>
              <button
                onClick={() => setFilterMode('pending')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                En Curso ({packages.filter(p => p.status !== 'Entregado').length})
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container (Styled as clean A4 document) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Report Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/aistudio/image_d9acb0e9.png"
                  alt="Adrian C Logística Integral"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                    Adrian C Logística Integral
                  </h1>
                  <p className="text-xs font-bold text-sky-700">
                    A C Logística Integral · Viajes y Transporte Interprovincial
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    CUIT: 30-71829401-2 · Base Operativa: Rosario / Santa Fe · Tel: +54 9 341 582-9901
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-wider">
                  Reporte Oficial de Remitos
                </div>
                <p className="text-xs font-mono text-slate-600 mt-1.5">
                  Fecha emisión: <strong>{currentDateStr}</strong> - {currentTimeStr} hs
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Generado por: Administración Central
                </p>
              </div>
            </div>

            {/* KPI Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs">
              <div className="border-r border-slate-200 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Remitos</span>
                <span className="text-lg font-black text-slate-900 font-mono">{filtered.length}</span>
                <span className="text-[10px] text-slate-500 block">documentos</span>
              </div>
              <div className="border-r border-slate-200 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Carga Total</span>
                <span className="text-lg font-black text-slate-900 font-mono">{totalBultos} bultos</span>
                <span className="text-[10px] text-slate-500 block">{totalKg.toLocaleString('es-AR')} kg</span>
              </div>
              <div className="border-r border-slate-200 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Firmas Capturadas</span>
                <span className="text-lg font-black text-emerald-700 font-mono">{totalFirmados} / {filtered.length}</span>
                <span className="text-[10px] text-emerald-600 block">validadas digitalmente</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Valor Declarado</span>
                <span className="text-lg font-black text-slate-900 font-mono">${(totalValor / 1000).toFixed(0)}k</span>
                <span className="text-[10px] text-slate-500 block">Pesos Argentinos</span>
              </div>
            </div>

            {/* Remitos and Digital Signatures Detailed Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300 text-left">
                    <th className="p-2.5">Remito / Tracking</th>
                    <th className="p-2.5">Destinatario y Domicilio</th>
                    <th className="p-2.5">Remitente</th>
                    <th className="p-2.5 text-center">Bultos/Kg</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-center">Firma Digital Capturada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                        No se encontraron remitos para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(pkg => {
                      const isDelivered = pkg.status === 'Entregado';
                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50/80">
                          {/* Remito / Tracking */}
                          <td className="p-2.5 align-top">
                            <span className="font-mono font-black text-slate-950 block">
                              {pkg.remitoNumber}
                            </span>
                            <span className="font-mono text-[10px] text-sky-700 block">
                              {pkg.trackingNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                              {pkg.createdAt || pkg.history?.[0]?.timestamp || 'Hoy'}
                            </span>
                          </td>

                          {/* Destinatario */}
                          <td className="p-2.5 align-top">
                            <span className="font-bold text-slate-900 block">{pkg.recipientName}</span>
                            <span className="text-[11px] text-slate-600 block">
                              {pkg.recipientAddress}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-800 block">
                              {pkg.recipientCity}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              DNI/CUIT: {pkg.recipientDniCuit}
                            </span>
                          </td>

                          {/* Remitente */}
                          <td className="p-2.5 align-top">
                            <span className="font-medium text-slate-800 block">{pkg.senderName}</span>
                            <span className="text-[11px] text-slate-500 block">{pkg.senderCity}</span>
                          </td>

                          {/* Bultos */}
                          <td className="p-2.5 align-top text-center font-mono">
                            <span className="font-bold text-slate-900">{pkg.packagesCount} b.</span>
                            <span className="text-[10px] text-slate-500 block">{pkg.weightKg} kg</span>
                          </td>

                          {/* Estado */}
                          <td className="p-2.5 align-top">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isDelivered
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : pkg.status === 'En Reparto / Zona'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-sky-50 text-sky-800 border-sky-300'
                              }`}
                            >
                              {pkg.status}
                            </span>
                          </td>

                          {/* Digital Signature */}
                          <td className="p-2.5 align-top text-center">
                            {pkg.deliverySignature ? (
                              <div className="flex flex-col items-center justify-center p-1 bg-slate-50 border border-slate-300 rounded max-w-[170px] mx-auto">
                                <img
                                  src={pkg.deliverySignature}
                                  alt="Firma del destinatario"
                                  className="h-10 w-28 object-contain"
                                />
                                <div className="text-[9px] text-slate-700 mt-1 leading-tight text-center">
                                  <span className="font-bold block truncate max-w-[160px]">
                                    {pkg.deliveredToName}
                                  </span>
                                  <span className="font-mono text-slate-500 block">
                                    DNI: {pkg.deliveredToDni}
                                  </span>
                                  <span className="font-mono text-emerald-700 block font-semibold text-[8px]">
                                    ✓ {pkg.deliveredAt}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-block text-[10px] text-slate-400 italic">
                                Pendiente de firma
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature & Seal of Responsibility */}
            <div className="pt-6 border-t-2 border-slate-900 flex items-end justify-between text-xs">
              <div className="space-y-1 text-[11px] text-slate-600 max-w-sm">
                <p className="font-bold text-slate-800 uppercase">
                  Declaración de Transporte y Custodia
                </p>
                <p>
                  El presente reporte certifica las encomiendas transportadas y las firmas digitales capturadas en conformidad de recepción por Adrian C Logística Integral.
                </p>
              </div>

              <div className="text-center w-56">
                <div className="border-b-2 border-slate-900 pb-12 mb-1">
                  {/* Space for stamp or signature */}
                  <div className="h-10 flex items-center justify-center text-slate-300 font-mono text-[10px]">
                    [ Sello y Firma Autorizada ]
                  </div>
                </div>
                <span className="font-bold text-slate-900 block text-xs">
                  Adrian C Logística Integral
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Responsable Operativo de Flota y Despacho
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Consejo: Para exportar a PDF, elige "Guardar como PDF" como destino en la ventana de impresión.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
