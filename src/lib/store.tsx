import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Vehicle,
  Driver,
  RouteSheet,
  PackageRemito,
  MaintenanceRecord,
  PushNotification,
  PackageStatus,
} from '../types';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_ROUTES,
  INITIAL_PACKAGES,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
} from './initialData';

interface LogisticsContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: RouteSheet[];
  packages: PackageRemito[];
  maintenance: MaintenanceRecord[];
  notifications: PushNotification[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  publicTrackingCode: string;
  setPublicTrackingCode: (code: string) => void;
  selectedPackageForRemito: PackageRemito | null;
  setSelectedPackageForRemito: (pkg: PackageRemito | null) => void;
  selectedPackageForSignature: PackageRemito | null;
  setSelectedPackageForSignature: (pkg: PackageRemito | null) => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;
  isLoading: boolean;
  isOnline: boolean;
  unreadNotificationsCount: number;

  // Actions
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, v: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addDriver: (d: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, d: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  addRouteSheet: (r: Omit<RouteSheet, 'id'>) => Promise<void>;
  updateRouteSheet: (id: string, r: Partial<RouteSheet>) => Promise<void>;
  deleteRouteSheet: (id: string) => Promise<void>;
  addPackageRemito: (p: Partial<PackageRemito>) => Promise<string>;
  updatePackage: (id: string, p: Partial<PackageRemito>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  validateDeliveryWithSignature: (
    packageId: string,
    signatureDataUrl: string,
    deliveredToName: string,
    deliveredToDni: string,
    notes?: string
  ) => Promise<void>;
  addMaintenance: (m: Omit<MaintenanceRecord, 'id'>) => Promise<void>;
  updateMaintenance: (id: string, m: Partial<MaintenanceRecord>) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  userRole: 'admin' | 'driver' | 'public' | null;
  setUserRole: (role: 'admin' | 'driver' | 'public' | null) => void;
  authenticatedDriver: Driver | null;
  loginAsAdmin: (password: string) => { success: boolean; message?: string };
  loginAsDriver: (driverId: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  triggerSound: () => void;
  resetToSampleData: () => Promise<void>;
  resetSystemEmptyData: () => Promise<void>;
}

const LogisticsContext = createContext<LogisticsContextType | null>(null);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('ac_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('ac_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [routes, setRoutes] = useState<RouteSheet[]>(() => {
    const saved = localStorage.getItem('ac_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });

  const [packages, setPackages] = useState<PackageRemito[]>(() => {
    const saved = localStorage.getItem('ac_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('ac_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('ac_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Session state: 'admin' | 'driver' | 'public' | null (null shows login gateway)
  const [userRole, setUserRoleState] = useState<'admin' | 'driver' | 'public' | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tracking') || params.get('remito')) {
      return 'public';
    }
    const savedRole = localStorage.getItem('ac_user_role');
    return (savedRole as 'admin' | 'driver' | 'public') || null;
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tracking') || params.get('remito')) {
      return 'tracking';
    }
    const savedRole = localStorage.getItem('ac_user_role');
    if (savedRole === 'driver') return 'driver-app';
    if (savedRole === 'public') return 'tracking';
    return 'dashboard';
  });

  const [publicTrackingCode, setPublicTrackingCode] = useState<string>('');
  const [selectedPackageForRemito, setSelectedPackageForRemito] = useState<PackageRemito | null>(null);
  const [selectedPackageForSignature, setSelectedPackageForSignature] = useState<PackageRemito | null>(null);
  const [activeDriverId, setActiveDriverId] = useState<string>(() => {
    return localStorage.getItem('ac_active_driver_id') || 'drv-01';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const setUserRole = useCallback((role: 'admin' | 'driver' | 'public' | null) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem('ac_user_role', role);
    } else {
      localStorage.removeItem('ac_user_role');
      localStorage.removeItem('ac_active_driver_id');
    }
  }, []);

  const authenticatedDriver = useMemo(() => {
    return drivers.find(d => d.id === activeDriverId) || null;
  }, [drivers, activeDriverId]);

  const loginAsAdmin = useCallback((password: string): { success: boolean; message?: string } => {
    const cleanPass = password.trim();
    if (cleanPass === 'admin' || cleanPass === 'admin2026' || cleanPass === '1234') {
      setUserRole('admin');
      setCurrentTab('dashboard');
      return { success: true };
    }
    return { success: false, message: 'Contraseña de administrador incorrecta (Prueba: admin2026 o 1234)' };
  }, [setUserRole]);

  const loginAsDriver = useCallback((driverId: string, password: string): { success: boolean; message?: string } => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      return { success: false, message: 'Conductor no encontrado en el sistema.' };
    }
    const cleanPass = password.trim();
    const expectedPass = (driver.password || 'chofer123').trim();
    const expectedPin = (driver.pin || '1234').trim();

    if (cleanPass === expectedPass || cleanPass === expectedPin || cleanPass === '1234' || cleanPass === 'chofer123') {
      setActiveDriverId(driver.id);
      localStorage.setItem('ac_active_driver_id', driver.id);
      setUserRole('driver');
      setCurrentTab('driver-app');
      return { success: true };
    }
    return {
      success: false,
      message: `Contraseña incorrecta para ${driver.fullName}. (Prueba: ${driver.password || 'chofer123'} o PIN ${driver.pin || '1234'})`
    };
  }, [drivers, setUserRole]);

  const logout = useCallback(() => {
    setUserRole(null);
    setCurrentTab('dashboard');
  }, [setUserRole]);

  // Sync state to local storage for offline resilience
  useEffect(() => {
    localStorage.setItem('ac_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('ac_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('ac_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('ac_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('ac_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('ac_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Audio trigger
  const triggerSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio autoplay restrictions may ignore silent failure
    }
  }, []);

  // Browser notification request
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }, []);

  // Push helper
  const sendPushNotification = useCallback(
    (title: string, message: string, trackingNumber?: string, type: PushNotification['type'] = 'estado_envio') => {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        trackingNumber,
        title,
        message,
        type,
        timestamp: 'Justo ahora',
        read: false,
        channel: 'Push Web',
      };

      setNotifications(prev => [newNotif, ...prev]);
      triggerSound();

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/assets/aistudio/image_d9acb0e9.png',
          });
        } catch {
          // notification fallback
        }
      }
    },
    [triggerSound]
  );

  // Firestore seeding and initial hydration
  useEffect(() => {
    let isMounted = true;
    async function loadOrSeedFirestore() {
      setIsLoading(true);
      try {
        const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
        if (vehiclesSnap.empty) {
          // Seed Firestore with initial rich data
          for (const v of INITIAL_VEHICLES) {
            await setDoc(doc(db, 'vehicles', v.id), v);
          }
          for (const d of INITIAL_DRIVERS) {
            await setDoc(doc(db, 'drivers', d.id), d);
          }
          for (const r of INITIAL_ROUTES) {
            await setDoc(doc(db, 'routes', r.id), r);
          }
          for (const p of INITIAL_PACKAGES) {
            await setDoc(doc(db, 'packages', p.id), p);
          }
          for (const m of INITIAL_MAINTENANCE) {
            await setDoc(doc(db, 'maintenance', m.id), m);
          }
          for (const n of INITIAL_NOTIFICATIONS) {
            await setDoc(doc(db, 'notifications', n.id), n);
          }
        } else {
          // Hydrate from Firestore
          const loadedVehicles = vehiclesSnap.docs.map(d => d.data() as Vehicle);
          const driversSnap = await getDocs(collection(db, 'drivers'));
          const loadedDrivers = driversSnap.docs.map(d => d.data() as Driver);
          const routesSnap = await getDocs(collection(db, 'routes'));
          const loadedRoutes = routesSnap.docs.map(d => d.data() as RouteSheet);
          const packagesSnap = await getDocs(collection(db, 'packages'));
          const loadedPackages = packagesSnap.docs.map(d => d.data() as PackageRemito);
          const maintSnap = await getDocs(collection(db, 'maintenance'));
          const loadedMaint = maintSnap.docs.map(d => d.data() as MaintenanceRecord);

          if (isMounted) {
            if (loadedVehicles.length > 0) setVehicles(loadedVehicles);
            if (loadedDrivers.length > 0) setDrivers(loadedDrivers);
            if (loadedRoutes.length > 0) setRoutes(loadedRoutes);
            if (loadedPackages.length > 0) setPackages(loadedPackages);
            if (loadedMaint.length > 0) setMaintenance(loadedMaint);
          }
        }
      } catch (err) {
        console.warn('Utilizando datos locales para máxima velocidad:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrSeedFirestore();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Read URL query params on load (e.g. ?tracking=AC-8941)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('tracking') || params.get('remito');
    if (trackParam) {
      setPublicTrackingCode(trackParam.toUpperCase());
      setCurrentTab('tracking');
    }
  }, []);

  // Simulated GPS Telemetry: every 6 seconds, slightly update vehicles in 'En Ruta'
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles(prev =>
        prev.map(v => {
          if (v.status !== 'En Ruta') return v;
          // minor delta jitter
          const latDelta = (Math.random() - 0.48) * 0.002;
          const lngDelta = (Math.random() - 0.48) * 0.002;
          const speedJitter = Math.floor(Math.random() * 8) - 4;
          const newSpeed = Math.max(55, Math.min(92, v.currentSpeed + speedJitter));
          return {
            ...v,
            currentLat: +(v.currentLat + latDelta).toFixed(5),
            currentLng: +(v.currentLng + lngDelta).toFixed(5),
            currentSpeed: newSpeed,
            odometerKm: +(v.odometerKm + 0.15).toFixed(1),
            lastLocationUpdate: `En movimiento (${newSpeed} km/h) - Telemetría satelital activa`,
          };
        })
      );
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // CRUD actions with Firestore update + fallback
  const addVehicle = async (v: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...v,
      id: `veh-${Date.now()}`,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    try {
      await setDoc(doc(db, 'vehicles', newVehicle.id), newVehicle);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `vehicles/${newVehicle.id}`);
    }
  };

  const updateVehicle = async (id: string, partial: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...partial } : v)));
    try {
      await updateDoc(doc(db, 'vehicles', id), partial);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `vehicles/${id}`);
    }
  };

  const deleteVehicle = async (id: string) => {
    const target = vehicles.find(v => v.id === id);
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    localStorage.setItem('ac_vehicles', JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `vehicles/${id}`);
    }
    if (target) {
      sendPushNotification(
        `🗑️ Móvil eliminado: ${target.plate}`,
        `Se eliminó el móvil ${target.brandModel} (${target.plate}) del parque automotor.`,
        undefined,
        'sistema'
      );
    }
  };

  const addDriver = async (d: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...d,
      id: `drv-${Date.now()}`,
    };
    setDrivers(prev => [newDriver, ...prev]);
    try {
      await setDoc(doc(db, 'drivers', newDriver.id), newDriver);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `drivers/${newDriver.id}`);
    }
  };

  const updateDriver = async (id: string, partial: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => (d.id === id ? { ...d, ...partial } : d)));
    try {
      await updateDoc(doc(db, 'drivers', id), partial);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `drivers/${id}`);
    }
  };

  const deleteDriver = async (id: string) => {
    const target = drivers.find(d => d.id === id);
    const updated = drivers.filter(d => d.id !== id);
    setDrivers(updated);
    localStorage.setItem('ac_drivers', JSON.stringify(updated));

    if (activeDriverId === id) {
      const nextDriverId = updated.length > 0 ? updated[0].id : '';
      setActiveDriverId(nextDriverId);
      if (nextDriverId) {
        localStorage.setItem('ac_active_driver_id', nextDriverId);
      } else {
        localStorage.removeItem('ac_active_driver_id');
      }
    }

    try {
      await deleteDoc(doc(db, 'drivers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `drivers/${id}`);
    }
    if (target) {
      sendPushNotification(
        `🗑️ Conductor eliminado: ${target.fullName}`,
        `Se removió a ${target.fullName} del plantel de choferes.`,
        undefined,
        'sistema'
      );
    }
  };

  const addRouteSheet = async (r: Omit<RouteSheet, 'id'>) => {
    const newRoute: RouteSheet = {
      ...r,
      id: `rt-${Date.now()}`,
    };
    setRoutes(prev => [newRoute, ...prev]);
    // Also update vehicle to 'En Ruta'
    if (r.vehicleId) {
      await updateVehicle(r.vehicleId, {
        status: 'En Ruta',
        assignedDriverName: r.driverName,
        assignedDriverId: r.driverId,
      });
    }
    try {
      await setDoc(doc(db, 'routes', newRoute.id), newRoute);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `routes/${newRoute.id}`);
    }
    sendPushNotification(
      `📋 Hoja de Ruta generada: ${newRoute.routeNumber}`,
      `Asignada a ${newRoute.driverName} con ${newRoute.totalPackages} encomiendas hacia ${newRoute.destinationCity}.`,
      undefined,
      'estado_envio'
    );
  };

  const updateRouteSheet = async (id: string, partial: Partial<RouteSheet>) => {
    setRoutes(prev => prev.map(r => (r.id === id ? { ...r, ...partial } : r)));
    try {
      await updateDoc(doc(db, 'routes', id), partial);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `routes/${id}`);
    }
  };

  const deleteRouteSheet = async (id: string) => {
    const target = routes.find(r => r.id === id);
    const updated = routes.filter(r => r.id !== id);
    setRoutes(updated);
    localStorage.setItem('ac_routes', JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'routes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `routes/${id}`);
    }
    if (target) {
      sendPushNotification(
        `🗑️ Hoja de Ruta eliminada: ${target.routeNumber}`,
        `Se eliminó la hoja de ruta con destino a ${target.destinationCity}.`,
        undefined,
        'sistema'
      );
    }
  };

  const addPackageRemito = async (p: Partial<PackageRemito>): Promise<string> => {
    const trackingSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = p.trackingNumber || `AC-${trackingSuffix}`;
    const remitoNumber = p.remitoNumber || `R-0001-${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`;

    const newPkg: PackageRemito = {
      id: `pkg-${Date.now()}`,
      trackingNumber,
      remitoNumber,
      routeId: p.routeId || '',
      routeNumber: p.routeNumber || '',
      senderName: p.senderName || '',
      senderDniCuit: p.senderDniCuit || '',
      senderAddress: p.senderAddress || '',
      senderCity: p.senderCity || 'Rosario, Santa Fe',
      senderPhone: p.senderPhone || '',
      recipientName: p.recipientName || '',
      recipientDniCuit: p.recipientDniCuit || '',
      recipientAddress: p.recipientAddress || '',
      recipientCity: p.recipientCity || '',
      recipientPhone: p.recipientPhone || '',
      recipientEmail: p.recipientEmail || '',
      packagesCount: p.packagesCount || 1,
      weightKg: p.weightKg || 10,
      declaredValue: p.declaredValue || 100000,
      description: p.description || 'Mercadería general',
      status: (p.status as PackageStatus) || 'Recibido en Depósito',
      currentLat: p.currentLat || -32.9468,
      currentLng: p.currentLng || -60.6393,
      eta: p.eta || 'Estimado en 24 a 48 hs',
      history: [
        {
          status: 'Recibido en Depósito',
          timestamp: timeStr,
          location: 'Depósito Central Rosario (Adrian C Logística)',
          notes: 'Remito generado e ingresado en sistema para control de carga.',
        },
      ],
    };

    setPackages(prev => [newPkg, ...prev]);

    try {
      await setDoc(doc(db, 'packages', newPkg.id), newPkg);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `packages/${newPkg.id}`);
    }

    sendPushNotification(
      `📦 Nuevo Remito emitido: ${newPkg.remitoNumber}`,
      `Tracking #${newPkg.trackingNumber} para ${newPkg.recipientName} (${newPkg.recipientCity}).`,
      newPkg.trackingNumber,
      'estado_envio'
    );

    return newPkg.trackingNumber;
  };

  const updatePackage = async (id: string, partial: Partial<PackageRemito>) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, ...partial } : p)));
    try {
      await updateDoc(doc(db, 'packages', id), partial);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `packages/${id}`);
    }
  };

  const deletePackage = async (id: string) => {
    const target = packages.find(p => p.id === id);
    const updated = packages.filter(p => p.id !== id);
    setPackages(updated);
    localStorage.setItem('ac_packages', JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'packages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `packages/${id}`);
    }
    if (target) {
      sendPushNotification(
        `🗑️ Remito eliminado: ${target.remitoNumber}`,
        `Se eliminó la encomienda ${target.trackingNumber} destinada a ${target.recipientName}.`,
        undefined,
        'sistema'
      );
    }
  };

  // Digital Signature validation when package is delivered
  const validateDeliveryWithSignature = async (
    packageId: string,
    signatureDataUrl: string,
    deliveredToName: string,
    deliveredToDni: string,
    notes?: string
  ) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`;

    const target = packages.find(p => p.id === packageId);
    if (!target) return;

    const newHistoryItem = {
      status: 'Entregado' as PackageStatus,
      timestamp: timeStr,
      location: `${target.recipientAddress}, ${target.recipientCity}`,
      notes: `Entrega validada mediante firma digital táctil conforme a ${deliveredToName} (DNI ${deliveredToDni}). ${notes || ''}`,
    };

    const updatedPackage: PackageRemito = {
      ...target,
      status: 'Entregado',
      deliverySignature: signatureDataUrl,
      deliveredToName,
      deliveredToDni,
      deliveredAt: timeStr,
      deliveryNotes: notes || 'Entrega realizada en mano con firma digital validada.',
      history: [...target.history, newHistoryItem],
    };

    setPackages(prev => prev.map(p => (p.id === packageId ? updatedPackage : p)));

    // Update stop status if assigned to route
    setRoutes(prev =>
      prev.map(r => {
        const hasStop = r.stops.some(s => s.packageId === packageId);
        if (!hasStop) return r;
        return {
          ...r,
          deliveredPackages: r.deliveredPackages + 1,
          stops: r.stops.map(s => (s.packageId === packageId ? { ...s, status: 'Entregado' } : s)),
        };
      })
    );

    try {
      await updateDoc(doc(db, 'packages', packageId), {
        status: 'Entregado',
        deliverySignature: signatureDataUrl,
        deliveredToName,
        deliveredToDni,
        deliveredAt: timeStr,
        deliveryNotes: notes || '',
        history: updatedPackage.history,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `packages/${packageId}`);
    }

    sendPushNotification(
      `✅ ¡Entrega Confirmada! Encomienda #${target.trackingNumber}`,
      `Recibido por ${deliveredToName} (DNI ${deliveredToDni}) con firma digital validada.`,
      target.trackingNumber,
      'entregado'
    );
  };

  const addMaintenance = async (m: Omit<MaintenanceRecord, 'id'>) => {
    const newMaint: MaintenanceRecord = {
      ...m,
      id: `maint-${Date.now()}`,
    };
    setMaintenance(prev => [newMaint, ...prev]);

    // If status is 'En Taller', mark vehicle as 'En Mantenimiento'
    if (m.status === 'En Taller' && m.vehicleId) {
      await updateVehicle(m.vehicleId, { status: 'En Mantenimiento' });
    }

    try {
      await setDoc(doc(db, 'maintenance', newMaint.id), newMaint);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `maintenance/${newMaint.id}`);
    }

    sendPushNotification(
      `🔧 Mantenimiento registrado para ${newMaint.vehiclePlate}`,
      `${newMaint.type}: ${newMaint.description}. Taller: ${newMaint.workshopName}.`,
      undefined,
      'mantenimiento_alerta'
    );
  };

  const updateMaintenance = async (id: string, partial: Partial<MaintenanceRecord>) => {
    setMaintenance(prev => prev.map(m => (m.id === id ? { ...m, ...partial } : m)));
    try {
      await updateDoc(doc(db, 'maintenance', id), partial);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `maintenance/${id}`);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToSampleData = async () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setRoutes(INITIAL_ROUTES);
    setPackages(INITIAL_PACKAGES);
    setMaintenance(INITIAL_MAINTENANCE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveDriverId('drv-01');
    localStorage.setItem('ac_vehicles', JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem('ac_drivers', JSON.stringify(INITIAL_DRIVERS));
    localStorage.setItem('ac_routes', JSON.stringify(INITIAL_ROUTES));
    localStorage.setItem('ac_packages', JSON.stringify(INITIAL_PACKAGES));
    localStorage.setItem('ac_maintenance', JSON.stringify(INITIAL_MAINTENANCE));
    localStorage.setItem('ac_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  };

  const resetSystemEmptyData = async () => {
    const defaultInitialDriver: Driver[] = [
      {
        id: 'drv-admin',
        fullName: 'Adrian C (Chofer Principal)',
        dni: '30.849.201',
        phone: '+54 9 341 582-9901',
        email: 'contacto@logistica-integral.com',
        licenseCategory: 'E1 - Cargas e Interprovincial',
        licenseExpiration: '2028-12-31',
        status: 'Disponible',
        rating: 5.0,
        totalDeliveries: 0,
        password: 'chofer',
        pin: '1234',
      },
    ];

    const cleanNotifs: PushNotification[] = [
      {
        id: `notif-${Date.now()}`,
        title: '🚀 Sistema inicializado a cero',
        message: 'Base de datos limpia y lista para operar. Comienza agregando tus móviles, choferes y remitos.',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'sistema',
        channel: 'push',
      },
    ];

    setVehicles([]);
    setDrivers(defaultInitialDriver);
    setRoutes([]);
    setPackages([]);
    setMaintenance([]);
    setNotifications(cleanNotifs);
    setActiveDriverId('drv-admin');

    localStorage.setItem('ac_vehicles', JSON.stringify([]));
    localStorage.setItem('ac_drivers', JSON.stringify(defaultInitialDriver));
    localStorage.setItem('ac_routes', JSON.stringify([]));
    localStorage.setItem('ac_packages', JSON.stringify([]));
    localStorage.setItem('ac_maintenance', JSON.stringify([]));
    localStorage.setItem('ac_notifications', JSON.stringify(cleanNotifs));
    localStorage.setItem('ac_active_driver_id', 'drv-admin');
  };

  const unreadNotificationsCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  return (
    <LogisticsContext.Provider
      value={{
        vehicles,
        drivers,
        routes,
        packages,
        maintenance,
        notifications,
        currentTab,
        setCurrentTab,
        publicTrackingCode,
        setPublicTrackingCode,
        selectedPackageForRemito,
        setSelectedPackageForRemito,
        selectedPackageForSignature,
        setSelectedPackageForSignature,
        activeDriverId,
        setActiveDriverId,
        isLoading,
        isOnline,
        unreadNotificationsCount,
        userRole,
        setUserRole,
        authenticatedDriver,
        loginAsAdmin,
        loginAsDriver,
        logout,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addRouteSheet,
        updateRouteSheet,
        deleteRouteSheet,
        addPackageRemito,
        updatePackage,
        deletePackage,
        validateDeliveryWithSignature,
        addMaintenance,
        updateMaintenance,
        markNotificationAsRead,
        clearAllNotifications,
        requestNotificationPermission,
        triggerSound,
        resetToSampleData,
        resetSystemEmptyData,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
