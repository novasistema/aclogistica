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
  type: 'estado_envio' | 'proximo_a_entrega' | 'entregado' | 'mantenimiento_alerta' | 'sistema';
  timestamp: string;
  read: boolean;
  channel: string;
}
