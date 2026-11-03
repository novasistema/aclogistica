export type VehicleStatus = 'Disponible' | 'En Ruta' | 'En Mantenimiento' | 'Fuera de Servicio';
export type VehicleType = 'Camión Chasis' | 'Semirremolque' | 'Furgón Utilitario' | 'Camioneta';

export interface Vehicle {
  id: string;
  plate: string;
  brandModel: string;
  type: VehicleType;
  capacityKg: number;
  capacityM3: number;
  odometerKm: number;
  status: VehicleStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  vtvExpiration: string;
  insuranceExpiration: string;
  currentLat: number;
  currentLng: number;
  currentSpeed: number;
  heading: number;
  lastLocationUpdate: string;
  notes?: string;
}

export type DriverStatus = 'Disponible' | 'En Viaje' | 'Descanso' | 'Licencia';

export interface Driver {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  licenseCategory: string;
  licenseExpiration: string;
  status: DriverStatus;
  currentVehicleId?: string;
  rating: number;
  drivingScore?: number; // Score de manejo (0 a 100, inicia en 100)
  penaltyPoints?: number; // Puntos de penalización acumulados
  activeReportsCount?: number; // Cantidad de reportes de tránsito recibidos
  totalDeliveries: number;
  emergencyContact?: string;
  password?: string;
  pin?: string;
}

export type RouteStatus = 'Planificada' | 'En Tránsito' | 'Completada' | 'Con Novedades';

export interface RouteStop {
  id: string;
  sequence: number;
  city: string;
  address: string;
  recipientName: string;
  packageId: string;
  trackingNumber: string;
  status: 'Pendiente' | 'En Camino' | 'Entregado' | 'Fallido';
  lat: number;
  lng: number;
}

export interface RouteSheet {
  id: string;
  routeNumber: string;
  title: string;
  date: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  status: RouteStatus;
  originCity: string;
  destinationCity: string;
  totalPackages: number;
  deliveredPackages: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  departureTime: string;
  estimatedArrivalTime: string;
  actualArrivalTime?: string;
  stops: RouteStop[];
  notes?: string;
}

export type PackageStatus =
  | 'Recibido en Depósito'
  | 'Asignado a Hoja de Ruta'
  | 'En Tránsito'
  | 'En Reparto / Zona'
  | 'Entregado'
  | 'No Entregado / Reintento';

export interface TrackingHistoryEvent {
  status: PackageStatus;
  timestamp: string;
  location: string;
  notes: string;
}

export interface PackageRemito {
  id: string;
  trackingNumber: string;
  remitoNumber: string;
  routeId?: string;
  routeNumber?: string;
  senderName: string;
  senderDniCuit: string;
  senderAddress: string;
  senderCity: string;
  senderPhone: string;
  recipientName: string;
  recipientDniCuit: string;
  recipientAddress: string;
  recipientCity: string;
  recipientPhone: string;
  recipientEmail?: string;
  packagesCount: number;
  weightKg: number;
  declaredValue: number;
  description: string;
  status: PackageStatus;
  currentLat: number;
  currentLng: number;
  eta: string;
  deliverySignature?: string; // Data URL of the signature canvas
  deliveredToName?: string;
  deliveredToDni?: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  createdAt?: string;
  history: TrackingHistoryEvent[];
}

export type MaintenanceType =
  | 'Preventivo'
  | 'Correctivo'
  | 'Inspección Reglamentaria'
  | 'Cambio Neumáticos'
  | 'Frenos y Suspensión';

export type MaintenanceStatus = 'Programado' | 'En Taller' | 'Completado' | 'Vencido';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  odometerKm: number;
  nextDueKm: number;
  cost: number;
  workshopName: string;
  status: MaintenanceStatus;
  invoicesNotes?: string;
}

export interface PushNotification {
  id: string;
  trackingNumber?: string;
  title: string;
  message: string;
  type: 'estado_envio' | 'proximo_a_entrega' | 'entregado' | 'mantenimiento_alerta' | 'sistema' | 'proveedor' | 'penalizacion';
  timestamp: string;
  read: boolean;
  channel: string;
}

export type ProviderStatus = 'Activo' | 'Pendiente' | 'Suspendido';

export interface Provider {
  id: string;
  businessName: string; // Razón Social o Empresa
  cuit: string; // CUIT / Identificación Fiscal
  contactPerson: string; // Nombre del contacto responsable
  phone: string;
  email: string;
  pickupAddress: string;
  pickupCity: string;
  category: string; // Rubro (ej. Industrial, Mayorista, Repuestos, Farmacéutico)
  username: string; // Usuario para inicio de sesión
  password?: string;
  status: ProviderStatus;
  createdAt: string;
  totalPickupsRequested: number;
  notes?: string;
}

export type PickupRequestStatus =
  | 'Pendiente'
  | 'Chofer Asignado'
  | 'En Camino a Retirar'
  | 'Retirado'
  | 'Cancelado';

export interface PackageDimension {
  id: string;
  lengthCm: number; // Largo / Profundidad en cm
  widthCm: number;  // Ancho en cm
  heightCm: number; // Alto en cm
  weightKg: number; // Peso unitario en kg
  quantity: number; // Cantidad de bultos
  description?: string; // Descripción del bulto
}

export interface PickupRequest {
  id: string;
  requestNumber: string; // ej. SOL-0012
  providerId: string;
  providerName: string;
  providerPhone: string;
  pickupAddress: string;
  pickupCity: string;
  requestedDate: string;
  requestedTimeSlot: string; // ej. "09:00 - 13:00 hs"
  items: PackageDimension[];
  totalPackages: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  cargoDescription: string;
  specialInstructions?: string;
  status: PickupRequestStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  convertedPackageTracking?: string;
  createdAt: string;
  completedAt?: string;
}

export type DriverReportType =
  | 'Exceso de Velocidad'
  | 'Conducción Imprudente / Maniobra Peligrosa'
  | 'Adelantamiento Indebido'
  | 'Uso de Teléfono Celular al Volante'
  | 'No Respetar Señalización / Semáforo'
  | 'Estacionamiento Indebido / Bloqueo'
  | 'Falta de Respeto / Trato Inadecuado'
  | 'Conducción Ejemplar / Felicitación'
  | 'Otro Motivo';

export type DriverReportStatus = 'Pendiente' | 'Verificado / Penalizado' | 'Desestimado';

export interface DriverReport {
  id: string;
  reportNumber: string; // ej. REP-2026-0041
  plateOrVehicleNumber: string;
  vehicleId?: string;
  driverId?: string;
  driverName?: string;
  reportType: DriverReportType;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  description: string;
  severity: 'Baja' | 'Media' | 'Grave' | 'Positiva';
  penaltyPoints: number; // Puntos restados del score del chofer
  status: DriverReportStatus;
  reportedBy?: string; // Anónimo o nombre de quien reporta
  contactPhone?: string;
  adminResolutionNotes?: string;
  createdAt: string;
}

