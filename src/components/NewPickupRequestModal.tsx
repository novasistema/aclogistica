import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import { PackageDimension } from '../types';
import {
  PackagePlus,
  Plus,
  Trash2,
  X,
  Boxes,
  MapPin,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Truck,
  CheckCircle2
} from 'lucide-react';

interface NewPickupRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  overrideProviderId?: string;
}

export const NewPickupRequestModal: React.FC<NewPickupRequestModalProps> = ({
  isOpen,
  onClose,
  overrideProviderId,
}) => {
  const {
    providers,
    authenticatedProvider,
    addPickupRequest,
    triggerSound,
  } = useLogistics();

  const currentProvider = overrideProviderId
    ? providers.find(p => p.id === overrideProviderId) || authenticatedProvider || providers[0]
    : authenticatedProvider || providers[0];

  const [pickupAddress, setPickupAddress] = useState(currentProvider?.pickupAddress || 'Av. Ovidio Lagos 5200');
  const [pickupCity, setPickupCity] = useState(currentProvider?.pickupCity || 'Rosario, Santa Fe');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('09:00 a 13:00 hs');
  const [cargoDescription, setCargoDescription] = useState('Bultos embalados listos para distribución interjurisdiccional.');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Dimensions lines
  const [items, setItems] = useState<PackageDimension[]>([
    {
      id: 'dim-1',
      lengthCm: 60,
      widthCm: 40,
      heightCm: 50,
      weightKg: 20,
      quantity: 5,
      description: 'Cajas estándar mercadería general',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedRequestNumber, setGeneratedRequestNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  // Add a new package dimension row
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `dim-${Date.now()}`,
        lengthCm: 50,
        widthCm: 50,
        heightCm: 50,
        weightKg: 15,
        quantity: 1,
        description: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PackageDimension, value: unknown) => {
    setItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        return {
          ...i,
          [field]: typeof value === 'number' ? Math.max(0, value) : value,
        };
      })
    );
  };

  // Calculations
  const totalPackages = items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
  const totalWeightKg = items.reduce((acc, i) => acc + (Number(i.weightKg) || 0) * (Number(i.quantity) || 0), 0);
  const totalVolumeM3 = items.reduce((acc, i) => {
    const l = Number(i.lengthCm) || 0;
    const w = Number(i.widthCm) || 0;
    const h = Number(i.heightCm) || 0;
    const qty = Number(i.quantity) || 0;
    const itemVol = (l * w * h) / 1000000;
    return acc + itemVol * qty;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider) return;

    setIsSubmitting(true);
    try {
      const reqNum = await addPickupRequest({
        providerId: currentProvider.id,
        providerName: currentProvider.businessName,
        providerPhone: currentProvider.phone,
        pickupAddress: pickupAddress.trim(),
        pickupCity: pickupCity.trim(),
        requestedDate,
        requestedTimeSlot,
        items,
        totalPackages,
        totalWeightKg,
        totalVolumeM3: Number(totalVolumeM3.toFixed(2)),
        cargoDescription: cargoDescription.trim(),
        specialInstructions: specialInstructions.trim(),
      });

      triggerSound();
      setGeneratedRequestNumber(reqNum);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setGeneratedRequestNumber(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Avisar Solicitud de Retiro de Mercadería</h3>
              <p className="text-xs text-slate-400">
                Proveedor: <strong className="text-white">{currentProvider?.businessName}</strong> (CUIT {currentProvider?.cuit})
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generatedRequestNumber ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">¡Aviso de Retiro Enviado!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tu solicitud fue recibida por el equipo de despacho y logística de Adrian C Logística Integral.
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-base font-bold text-sky-400">
                  {generatedRequestNumber}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1 text-slate-300">
              <p>📍 <strong>Lugar de retiro:</strong> {pickupAddress}, {pickupCity}</p>
              <p>📦 <strong>Bultos declarados:</strong> {totalPackages} unidades · {totalWeightKg} kg · {totalVolumeM3.toFixed(2)} m³</p>
              <p>🕒 <strong>Franja solicitada:</strong> {requestedDate} ({requestedTimeSlot})</p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-lg shadow-sky-600/20"
              >
                Volver al Panel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Lugar y fecha de retiro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Dirección de Retiro *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  placeholder="Calle, número, galpón"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ciudad / Localidad *
                </label>
                <input
                  type="text"
                  required
                  value={pickupCity}
                  onChange={e => setPickupCity(e.target.value)}
                  placeholder="Rosario, Santa Fe"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Fecha de Retiro Deseada *
                </label>
                <input
                  type="date"
                  required
                  value={requestedDate}
                  onChange={e => setRequestedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Horario de Retiro / Ventana *
                </label>
                <select
                  value={requestedTimeSlot}
                  onChange={e => setRequestedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="08:00 a 12:00 hs (Turno Mañana)">08:00 a 12:00 hs (Turno Mañana)</option>
                  <option value="09:00 a 13:00 hs">09:00 a 13:00 hs</option>
                  <option value="13:00 a 17:00 hs (Turno Tarde)">13:00 a 17:00 hs (Turno Tarde)</option>
                  <option value="14:00 a 18:00 hs">14:00 a 18:00 hs</option>
                  <option value="Urgente / Coordinar Inmediato">Urgente / Coordinar Inmediato</option>
                </select>
              </div>
            </div>

            {/* Dimensiones y Características de Bultos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-emerald-400" />
                    Características de los Bultos (Dimensiones y Peso)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Ingresa las medidas para cubicar la capacidad de carga del móvil
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Medida</span>
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => {
                  const itemVol = ((Number(item.lengthCm) || 0) * (Number(item.widthCm) || 0) * (Number(item.heightCm) || 0)) / 1000000;
                  const totalLineVol = itemVol * (Number(item.quantity) || 0);

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono flex items-center justify-center text-sky-400">
                            {idx + 1}
                          </span>
                          Lote de Bultos #{idx + 1}
                        </span>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Quitar esta línea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Alto (cm) *</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.heightCm}
                            onChange={e => handleUpdateItem(item.id, 'heightCm', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Ancho (cm) *</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.widthCm}
                            onChange={e => handleUpdateItem(item.id, 'widthCm', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Profundo / Largo (cm) *</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.lengthCm}
                            onChange={e => handleUpdateItem(item.id, 'lengthCm', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Peso c/u (kg) *</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            required
                            value={item.weightKg}
                            onChange={e => handleUpdateItem(item.id, 'weightKg', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Cantidad *</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={e => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center font-bold focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900 text-slate-400">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción del bulto (ej. Cajas de repuestos, pallet de vinos...)"
                          className="w-2/3 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-xs"
                        />
                        <span className="font-mono text-slate-400">
                          Vol: <strong className="text-emerald-400">{totalLineVol.toFixed(3)} m³</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Banner */}
              <div className="p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-semibold">Resumen de Carga a Retirar:</span>
                <div className="flex items-center gap-4 font-mono font-bold">
                  <span className="text-white">
                    {totalPackages} <span className="text-slate-400 font-normal">bultos</span>
                  </span>
                  <span className="text-sky-400">
                    {totalWeightKg} <span className="text-slate-400 font-normal">kg</span>
                  </span>
                  <span className="text-emerald-400">
                    {totalVolumeM3.toFixed(2)} <span className="text-slate-400 font-normal">m³ de volumen</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones generales */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instrucciones Especiales para el Chofer / Despacho
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="Ej. Anunciarse en portería portón 4. Llevar fajas de amarre o frazadas para protección."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-md shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando Aviso...' : 'Confirmar y Avisar Retiro'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
