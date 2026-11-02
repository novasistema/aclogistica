import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { PackageRemito, PackageStatus } from '../types';
import {
  Package,
  Plus,
  Search,
  FileText,
  PenTool,
  CheckCircle2,
  MapPin,
  X,
  Share2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Printer,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { RemitoDocumentModal } from './RemitoDocumentModal';
import { RemitosPdfReportModal } from './RemitosPdfReportModal';

export const PackagesRemitosView: React.FC = () => {
  const { packages, addPackageRemito, deletePackage, setPublicTrackingCode, setCurrentTab, validateDeliveryWithSignature } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [selectedForSignature, setSelectedForSignature] = useState<PackageRemito | null>(null);
  const [selectedForRemito, setSelectedForRemito] = useState<PackageRemito | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<PackageRemito | null>(null);

  // Form state
  const [senderName, setSenderName] = useState('');
  const [senderDniCuit, setSenderDniCuit] = useState('');
  const [senderAddress, setSenderAddress] = useState('Av. Circunvalación 4500');
  const [senderCity, setSenderCity] = useState('Rosario, Santa Fe');
  const [senderPhone, setSenderPhone] = useState('+54 341 490-1122');
  const [recipientName, setRecipientName] = useState('');
  const [recipientDniCuit, setRecipientDniCuit] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packagesCount, setPackagesCount] = useState(1);
  const [weightKg, setWeightKg] = useState(25);
  const [declaredValue, setDeclaredValue] = useState(150000);
  const [description, setDescription] = useState('Mercadería general y repuestos');

  const filteredPackages = packages.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.trackingNumber.toLowerCase().includes(term) ||
      p.remitoNumber.toLowerCase().includes(term) ||
      p.recipientName.toLowerCase().includes(term) ||
      p.recipientCity.toLowerCase().includes(term) ||
      p.senderName.toLowerCase().includes(term)
    );
  });

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !recipientName.trim() || !recipientAddress.trim() || !recipientCity.trim()) {
      return;
    }

    const createdTracking = await addPackageRemito({
      senderName: senderName.trim(),
      senderDniCuit: senderDniCuit.trim() || '30-11223344-5',
      senderAddress: senderAddress.trim(),
      senderCity: senderCity.trim(),
      senderPhone: senderPhone.trim(),
      recipientName: recipientName.trim(),
      recipientDniCuit: recipientDniCuit.trim() || '20-33445566-7',
      recipientAddress: recipientAddress.trim(),
      recipientCity: recipientCity.trim(),
      recipientPhone: recipientPhone.trim(),
      packagesCount: Number(packagesCount),
      weightKg: Number(weightKg),
      declaredValue: Number(declaredValue),
      description: description.trim(),
      status: 'Recibido en Depósito',
    });

    setShowCreateModal(false);
    setRecipientName('');
    setRecipientAddress('');
    setRecipientCity('');
    setRecipientPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-400" />
            Control de Encomiendas, Remitos y Firmas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Emisión de remitos oficiales, números de seguimiento y registro de validación por firma digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPdfReportModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 hover:border-sky-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            title="Generar reporte completo de remitos listo para imprimir o descargar en PDF"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Generar Reporte PDF</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nuevo Remito</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por remito, guía, cliente..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['all', 'Recibido en Depósito', 'Asignado a Hoja de Ruta', 'En Tránsito', 'En Reparto / Zona', 'Entregado'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Guía / Remito</th>
                <th className="p-3.5">Destinatario y Ciudad</th>
                <th className="p-3.5">Remitente</th>
                <th className="p-3.5 text-center">Bultos · Peso</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Validación de Entrega</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPackages.map(pkg => {
                const isDelivered = pkg.status === 'Entregado';
                return (
                  <tr key={pkg.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Tracking & Remito */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400 text-sm">{pkg.trackingNumber}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                        {pkg.remitoNumber}
                      </span>
                    </td>

                    {/* Destinatario */}
                    <td className="p-3.5">
                      <p className="font-bold text-white text-sm">{pkg.recipientName}</p>
                      <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{pkg.recipientCity}</span>
                      </p>
                    </td>

                    {/* Remitente */}
                    <td className="p-3.5">
                      <p className="text-slate-300 font-medium">{pkg.senderName}</p>
                      <p className="text-slate-500 text-[11px]">{pkg.senderCity}</p>
                    </td>

                    {/* Bultos & Peso */}
                    <td className="p-3.5 text-center font-mono">
                      <span className="font-bold text-slate-200">{pkg.packagesCount} bulto(s)</span>
                      <span className="text-slate-400 block text-[11px]">{pkg.weightKg} kg</span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                          isDelivered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : pkg.status === 'En Reparto / Zona'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                        {pkg.status}
                      </span>
                    </td>

                    {/* Digital Signature status */}
                    <td className="p-3.5">
                      {isDelivered && pkg.deliverySignature ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-7 bg-white rounded border border-slate-700 flex items-center justify-center p-0.5">
                            <img
                              src={pkg.deliverySignature}
                              alt="Firma"
                              className="max-h-full object-contain"
                            />
                          </div>
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-200 block truncate max-w-[120px]">
                              {pkg.deliveredToName}
                            </span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {pkg.deliveredAt?.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedForSignature(pkg)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Firmar Entrega</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedForRemito(pkg)}
                          title="Ver e imprimir Remito Oficial (PDF)"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors text-xs font-medium cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                          <span>Remito PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            setPublicTrackingCode(pkg.trackingNumber);
                            setCurrentTab('tracking');
                          }}
                          title="Rastrear en Portal Público"
                          className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackageToDelete(pkg)}
                          title="Eliminar este remito / encomienda"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Remito Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Emitir Nuevo Remito y Guía de Encomienda</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-5 space-y-4 overflow-y-auto">
              {/* Remitente Section */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  1. Datos del Remitente (Origen)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Nombre o Razón Social *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="Ej. Distribuidora Santa Fe SRL"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">CUIT / DNI</label>
                    <input
                      type="text"
                      value={senderDniCuit}
                      onChange={e => setSenderDniCuit(e.target.value)}
                      placeholder="30-71889900-1"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Dirección de Carga</label>
                    <input
                      type="text"
                      value={senderAddress}
                      onChange={e => setSenderAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Ciudad Origen</label>
                    <input
                      type="text"
                      value={senderCity}
                      onChange={e => setSenderCity(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Destinatario Section */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  2. Datos del Destinatario (Entrega)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Nombre o Empresa Destino *</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Ej. Talleres Metalúrgicos Cuyo"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">DNI / CUIT</label>
                    <input
                      type="text"
                      value={recipientDniCuit}
                      onChange={e => setRecipientDniCuit(e.target.value)}
                      placeholder="30-68192031-4"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Dirección de Entrega *</label>
                    <input
                      type="text"
                      required
                      value={recipientAddress}
                      onChange={e => setRecipientAddress(e.target.value)}
                      placeholder="Calle y Número / Local"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Ciudad Destino *</label>
                    <input
                      type="text"
                      required
                      value={recipientCity}
                      onChange={e => setRecipientCity(e.target.value)}
                      placeholder="Ej. Córdoba Capital"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Teléfono Móvil (Avisos WhatsApp)</label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                    placeholder="+54 9 351 123-4567"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Package Specs */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cantidad Bultos *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packagesCount}
                    onChange={e => setPackagesCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Peso Total (Kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor Declarado ($)</label>
                  <input
                    type="number"
                    value={declaredValue}
                    onChange={e => setDeclaredValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción de la Carga</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej. Cajas de repuestos industriales y accesorios"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 -mx-5 -mb-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/20"
                >
                  Generar Remito Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {selectedForSignature && (
        <DigitalSignatureModal
          packageItem={selectedForSignature}
          onClose={() => setSelectedForSignature(null)}
          onConfirmDelivery={validateDeliveryWithSignature}
        />
      )}

      {/* Remito Document Modal */}
      {selectedForRemito && (
        <RemitoDocumentModal
          packageItem={selectedForRemito}
          onClose={() => setSelectedForRemito(null)}
          onOpenSignature={() => {
            setSelectedForSignature(selectedForRemito);
            setSelectedForRemito(null);
          }}
        />
      )}

      {/* Full Remitos PDF Report Modal */}
      {showPdfReportModal && (
        <RemitosPdfReportModal
          packages={filteredPackages}
          onClose={() => setShowPdfReportModal(false)}
        />
      )}

      {/* Delete Package Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">¿Eliminar Remito / Encomienda?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de eliminar el remito <strong className="text-white font-mono">{packageToDelete.remitoNumber}</strong> (Tracking: <span className="font-mono text-sky-400">{packageToDelete.trackingNumber}</span>), consignado a <span className="text-white font-medium">{packageToDelete.recipientName}</span> ({packageToDelete.recipientCity}).
                </p>
                {packageToDelete.status === 'Entregado' && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Nota: Este remito ya tiene firma digital y figura &quot;Entregado&quot;.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (packageToDelete) {
                    await deletePackage(packageToDelete.id);
                    setPackageToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Borrar Remito</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
