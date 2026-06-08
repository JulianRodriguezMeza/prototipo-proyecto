import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lab = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
};

export type ReservationRequest = {
  id: string;
  roomName: string;
  requester: string;
  status: 'Pendiente' | 'En revision' | 'Aprobada' | 'Rechazada';
  description?: string;
  service?: string;
  reservationDate?: string;
  startTime?: string;
  endTime?: string;
  observations?: string;
  adminNote?: string;
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const DEFAULT_LABS: Lab[] = [
  { id: 'lab-1', name: 'Laboratorio de Redes', capacity: 30, occupied: 18 },
  { id: 'lab-2', name: 'Laboratorio de Informatica', capacity: 25, occupied: 9 },
  { id: 'lab-3', name: 'Laboratorio Multimedia', capacity: 20, occupied: 7 },
];

const DEFAULT_REQUESTS: ReservationRequest[] = [
  { id: 'r-1', roomName: 'Laboratorio Multimedia', requester: 'Est. Juan P.', status: 'Pendiente', reservationDate: '2026-05-25', observations: 'Necesito el proyector' },
  { id: 'r-2', roomName: 'Laboratorio de Redes', requester: 'Est. Maria G.', status: 'Aprobada', reservationDate: '2026-05-24', adminNote: 'Aprobado para las 4 PM' },
  { id: 'r-3', roomName: 'Laboratorio de Informatica', requester: 'Est. Carlos R.', status: 'En revision', reservationDate: '2026-05-26', observations: 'Requiero MySQL instalado' },
];

// URL BASE de tu backend PHP.
// IMPORTANTE:
// - Si pruebas en navegador web usa 'http://localhost:8000' (o puerto XAMPP)
// - Si pruebas en emulador Android usa 'http://10.0.2.2:8000'
// - Si pruebas en celular físico cambia esto por la IP local de tu PC ej: 'http://192.168.1.15:8000'
import { Platform } from 'react-native';

// Detectar automáticamente si estamos en la web o en el celular (App)
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost/backend' 
  : 'http://192.168.1.75/backend';

export const api = {
  getLabs: async (): Promise<Lab[]> => {
    try {
      const response = await fetch(`${BASE_URL}/get_espacios.php`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (!response.ok) throw new Error('Network error');
      return await response.json();
    } catch (e) {
      console.warn('Fallo PHP, usando fallback local', e);
      const data = await AsyncStorage.getItem('cecar_labs');
      return data ? JSON.parse(data) : DEFAULT_LABS;
    }
  },
  
  getRequests: async (): Promise<ReservationRequest[]> => {
    try {
      const response = await fetch(`${BASE_URL}/get_reservas.php`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      
      // Si logramos conectar a la BD, borramos los fantasmas locales para limpiar la pantalla
      await AsyncStorage.removeItem('cecar_requests');
      
      return data;
    } catch (e) {
      const data = await AsyncStorage.getItem('cecar_requests');
      return data ? JSON.parse(data) : DEFAULT_REQUESTS;
    }
  },
  
  createRequest: async (req: Omit<ReservationRequest, 'id' | 'status'>): Promise<ReservationRequest> => {
    try {
      const response = await fetch(`${BASE_URL}/create_reserva.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify(req)
      });
      const data = await response.json();
      if (data.error) {
          // Si el error viene de PHP (como el horario ocupado), queremos mostrarlo en pantalla.
          throw new Error(data.error);
      }
      return data;
    } catch (e: any) {
      // Si el error es el de horario ocupado u otro de validación enviado desde PHP, lo relanzamos
      if (e.message && e.message.includes('ocupado')) {
          throw e;
      }
      
      console.warn('Fallo PHP, creando localmente', e);
      const requests = await api.getRequests();
      const newReq: ReservationRequest = { ...req, id: `r-${Date.now()}`, status: 'Pendiente' };
      await AsyncStorage.setItem('cecar_requests', JSON.stringify([newReq, ...requests]));
      return newReq;
    }
  },
  
  updateRequestStatus: async (id: string, status: ReservationRequest['status'], adminNote?: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/update_reserva.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ id, status, adminNote })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
    } catch (e) {
      console.warn('Error al actualizar en la BD. Guardando en local...', e);
      const requests = await api.getRequests();
      const updated = requests.map(r => r.id === id ? { ...r, status, adminNote: adminNote || r.adminNote } : r);
      await AsyncStorage.setItem('cecar_requests', JSON.stringify(updated));
      // throw e; // Opcionalmente podríamos relanzarlo para que la UI sepa que falló la BD
    }
  },
  
  approveAllPending: async (): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/update_reserva.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ id: 'approveAll', status: 'Aprobada' })
      });
    } catch (e) {
      const requests = await api.getRequests();
      const updated = requests.map(r => 
        r.status === 'Pendiente' || r.status === 'En revision' ? { ...r, status: 'Aprobada' } : r
      );
      await AsyncStorage.setItem('cecar_requests', JSON.stringify(updated));
    }
  }
};
