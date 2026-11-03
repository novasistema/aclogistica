import React, { useState } from 'react';
import { useLogistics } from '../lib/store';
import {
  Building2,
  X,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProviderRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (providerId: string) => void;
}

export const ProviderRegisterModal: React.FC<ProviderRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { registerProvider, loginAsProvider, triggerSound } = useLogistics();

  const [businessName, setBusinessName] = useState('');
  const [cuit, setCuit] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('Rosario, Santa Fe');
  const [category, setCategory] = useState('Alimentos y Bebidas No Perecederas');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !cuit.trim() || !username.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      const providerId = await registerProvider({
        businessName: businessName.trim(),
        cuit: cuit.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        pickupAddress: pickupAddress.trim(),
        pickupCity: pickupCity.trim(),
        category: category.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        notes: notes.trim(),
      });

      triggerSound();
      setSuccessMessage(true);

      setTimeout(() => {
        loginAsProvider(username.trim().toLowerCase(), password.trim());
        if (onSuccessLogin) onSuccessLogin(providerId);
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Registro de Nuevo Proveedor</h3>
              <p className="text-xs text-slate-400">Únete al directorio de proveedores para solicitar retiros de carga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">¡Proveedor Registrado con Éxito!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Se ha creado tu cuenta empresarial. Ingresando automáticamente al panel de proveedores para gestionar tus retiros de mercadería...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Empresa y CUIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Razón Social / Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ej. Distribuidora Central S.A."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CUIT / Identificación Fiscal *
                </label>
                <input
                  type="text"
                  required
                  value={cuit}
                  onChange={e => setCuit(e.target.value)}
                  placeholder="Ej. 30-71458920-4"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Rubro */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rubro / Tipo de Mercadería Habitual *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Alimentos y Bebidas No Perecederas">Alimentos y Bebidas No Perecederas</option>
                <option value="Electrodomésticos y Línea Blanca">Electrodomésticos y Línea Blanca</option>
                <option value="Autopartes y Ferretería Industrial">Autopartes y Ferretería Industrial</option>
                <option value="Farmacéutico y Cosmética">Farmacéutico y Cosmética</option>
                <option value="Textil y Calzado">Textil y Calzado</option>
                <option value="Materiales de Construcción">Materiales de Construcción</option>
                <option value="Insumos Varios / Paquetería General">Insumos Varios / Paquetería General</option>
              </select>
            </div>

            {/* Contacto & Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Contacto Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="Ej. Martín Alvarez (Jefe Despacho)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej. +54 9 341 555-8899"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Correo Electrónico Empresarial *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="despacho@empresa.com.ar"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Dirección de Retiro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Dirección de Depósito / Retiro *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  placeholder="Ej. Av. Circunvalación 2450 (Galpón 3)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ciudad y Provincia *
                </label>
                <input
                  type="text"
                  required
                  value={pickupCity}
                  onChange={e => setPickupCity(e.target.value)}
                  placeholder="Ej. Rosario, Santa Fe"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Credenciales de Acceso */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Credenciales para Avisar Retiros en la Web
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Usuario Deseado *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ej. distribuidora"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Crea una clave"
                      className="w-full px-3 py-1.5 pr-8 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observaciones del Depósito / Horarios de Carga
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ej. Horario de carga: 08 a 13 hs. Cuenta con autoelevador y rampa para camiones."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Building2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registrando...' : 'Completar Registro y Entrar'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
