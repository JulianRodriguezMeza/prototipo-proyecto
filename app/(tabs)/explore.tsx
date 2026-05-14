import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';

type NavItem = {
  id: string;
  label: string;
};

type Lab = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
};

type ReservationRequest = {
  id: string;
  roomName: string;
  requester: string;
  status: 'Pendiente' | 'En revision' | 'Aprobada' | 'Rechazada';
};

export default function AdminPanelScreen() {
  const { signOut, user } = useAuth();
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  useEffect(() => {
    if (user?.role === 'auxiliar' && (activeNav === 'dashboard' || activeNav === 'reservas' || activeNav === 'fallas' || activeNav === 'metricas')) {
      setActiveNav('tareas_asignadas');
    } else if (user?.role === 'admin' && (activeNav === 'tareas_asignadas' || activeNav === 'salas_abrir' || activeNav === 'laboratorios')) {
      setActiveNav('dashboard');
    }
  }, [user?.role, activeNav]);



  const labs = useMemo<Lab[]>(
    () => [
      { id: 'lab-1', name: 'Laboratorio de Redes', capacity: 30, occupied: 18 },
      { id: 'lab-2', name: 'Laboratorio de Informatica', capacity: 25, occupied: 9 },
      { id: 'lab-3', name: 'Laboratorio Multimedia', capacity: 20, occupied: 7 },
    ],
    []
  );

  const [requests, setRequests] = useState<ReservationRequest[]>([
    { id: 'r-1', roomName: 'Laboratorio Multimedia', requester: 'Est. Juan P.', status: 'Pendiente' },
    { id: 'r-2', roomName: 'Laboratorio de Redes', requester: 'Est. Maria G.', status: 'Pendiente' },
    { id: 'r-3', roomName: 'Laboratorio de Informatica', requester: 'Est. Carlos R.', status: 'En revision' },
  ]);

  const topRooms = useMemo(
    () => [
      { id: 't-1', name: 'Lab. Informatica', requests: 28 },
      { id: 't-2', name: 'Sala Multimedia', requests: 21 },
      { id: 't-3', name: 'Lab. Redes', requests: 17 },
    ],
    []
  );

  const navItems = useMemo<NavItem[]>(() => {
    if (user?.role === 'auxiliar') {
      return [
        { id: 'tareas_asignadas', label: 'Tareas Asignadas' },
        { id: 'salas_abrir', label: 'Salas por abrir' },
        { id: 'laboratorios', label: 'Laboratorios' },
      ];
    }
    return [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'reservas', label: 'Gestión de Reservas' },
      { id: 'fallas', label: 'Reporte de Fallas' },
      { id: 'disponibilidad', label: 'Disponibilidad' },
      { id: 'metricas', label: 'Métricas' },
    ];
  }, [user?.role]);

  const totalCapacity = useMemo(() => labs.reduce((acc, l) => acc + l.capacity, 0), [labs]);
  const totalOccupied = useMemo(() => labs.reduce((acc, l) => acc + l.occupied, 0), [labs]);
  const totalAvailable = useMemo(() => Math.max(0, totalCapacity - totalOccupied), [totalCapacity, totalOccupied]);

  const selectedLab = labs[0];
  const qrUrl = useMemo(
    () => `https://quickchart.io/qr?text=SIGLA-CECAR-${encodeURIComponent(selectedLab.name)}&size=220`,
    [selectedLab.name]
  );

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'Pendiente' || r.status === 'En revision').length,
    [requests]
  );

  const setRequestStatus = (id: string, status: ReservationRequest['status']) => {
    setRequests((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const approveAllPending = () => {
    setRequests((current) =>
      current.map((r) =>
        r.status === 'Pendiente' || r.status === 'En revision' ? { ...r, status: 'Aprobada' } : r
      )
    );
    setActiveNav('dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bg}>
        <Image
          source={require('@/assets/images/cecar-admin-bg-1.png')}
          style={styles.bgPhotoBase}
          contentFit="cover"
        />
        <Image
          source={require('@/assets/images/cecar-admin-bg-2.png')}
          style={styles.bgPhotoAccent}
          contentFit="cover"
        />
        <View style={styles.bgOverlay} />
        <View style={styles.bgAccentOne} />
        <View style={styles.bgAccentTwo} />
        <View style={styles.shell}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarBrand}>
            <Image source={require('@/assets/images/cecar-logo-extended.png')} style={styles.sidebarLogo} contentFit="contain" />
            <Text style={styles.sidebarHello}>Hola {user?.role === 'admin' ? 'admi' : 'auxiliar'}</Text>
            <View style={styles.sidebarDivider} />
          </View>

          <View style={styles.sidebarNav}>
            {navItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setActiveNav(item.id)}
                  style={[styles.navItem, active && styles.navItemActive]}>
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent}>
          <View style={styles.topbar}>
            <Text style={styles.topbarTitle}>
              {navItems.find((item) => item.id === activeNav)?.label || 'Inicio'}
            </Text>
            <View style={styles.topbarRight}>
              <Pressable onPress={signOut} style={styles.signOut}>
                <Text style={styles.signOutText}>Salir</Text>
              </Pressable>
            </View>
          </View>

          {activeNav === 'dashboard' && (
            <>
              <View style={styles.kpiStrip}>
                <View style={[styles.kpiWide, styles.kpiWideGreen]}>
                  <Text style={styles.kpiWideLabel}>Disponibles</Text>
                  <Text style={styles.kpiWideValue}>{totalAvailable}</Text>
                </View>
                <View style={[styles.kpiWide, styles.kpiWideGray]}>
                  <Text style={styles.kpiWideLabel}>Ocupados</Text>
                  <Text style={styles.kpiWideValue}>{totalOccupied}</Text>
                </View>
                <View style={[styles.kpiWide, styles.kpiWideAmber]}>
                  <Text style={styles.kpiWideLabel}>Pendientes</Text>
                  <Text style={styles.kpiWideValue}>{pendingCount}</Text>
                </View>
                <View style={[styles.kpiWide, styles.kpiWideBlue]}>
                  <Text style={styles.kpiWideLabel}>Total de Salas</Text>
                  <Text style={styles.kpiWideValue}>{labs.length}</Text>
                </View>
              </View>

              <View style={[styles.grid, { marginTop: 16 }]}>
                {/* Mock Bar Chart */}
                <View style={[styles.card, styles.cardLarge]}>
                  <Text style={styles.sectionTitle}>Actividad de Uso (Semana)</Text>
                  <View style={styles.chartContainer}>
                    <View style={styles.barWrapper}><View style={[styles.bar, { height: '60%', backgroundColor: '#10b981' }]} /><Text style={styles.barLabel}>Lun</Text></View>
                    <View style={styles.barWrapper}><View style={[styles.bar, { height: '80%', backgroundColor: '#3b82f6' }]} /><Text style={styles.barLabel}>Mar</Text></View>
                    <View style={styles.barWrapper}><View style={[styles.bar, { height: '40%', backgroundColor: '#f59e0b' }]} /><Text style={styles.barLabel}>Mié</Text></View>
                    <View style={styles.barWrapper}><View style={[styles.bar, { height: '90%', backgroundColor: '#ef4444' }]} /><Text style={styles.barLabel}>Jue</Text></View>
                    <View style={styles.barWrapper}><View style={[styles.bar, { height: '50%', backgroundColor: '#8b5cf6' }]} /><Text style={styles.barLabel}>Vie</Text></View>
                  </View>
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#10b981' }]} /><Text style={styles.legendText}>Lab. Info</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Lab. Redes</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} /><Text style={styles.legendText}>Lab. Multi</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Audiovisual</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} /><Text style={styles.legendText}>Salas Est.</Text></View>
                  </View>
                </View>

                {/* Actividades Recientes */}
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Actividades Recientes</Text>
                  <View style={styles.activityList}>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#10b981' }]} />
                      <View>
                        <Text style={styles.activityText}>Reserva aprobada</Text>
                        <Text style={styles.activityTime}>Hace 5 min</Text>
                      </View>
                    </View>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#f59e0b' }]} />
                      <View>
                        <Text style={styles.activityText}>Nueva solicitud (Lab. Redes)</Text>
                        <Text style={styles.activityTime}>Hace 12 min</Text>
                      </View>
                    </View>

                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#ef4444' }]} />
                      <View>
                        <Text style={styles.activityText}>Reporte: Falla de Equipo (Lab. Info)</Text>
                        <Text style={styles.activityTime}>Hace 45 min</Text>
                      </View>
                    </View>

                    <View style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#64748b' }]} />
                      <View>
                        <Text style={styles.activityText}>Reserva rechazada</Text>
                        <Text style={styles.activityTime}>Hace 2 horas</Text>
                      </View>
                    </View>
                  </View>
                </View>


              </View>
            </>
          )}

          <View style={styles.grid}>
            {activeNav === 'disponibilidad' && (
              <View style={[styles.card, styles.cardLarge]}>
                <Text style={styles.sectionTitle}>Disponibilidad en tiempo real</Text>
                <Text style={styles.helperText}>
                  Según el avance SIGLA-CECAR, este módulo permite visualizar la disponibilidad de laboratorios y aulas en tiempo real.
                </Text>
                <View style={styles.simpleList}>
                  {labs.map((lab) => {
                    const available = Math.max(0, lab.capacity - lab.occupied);
                    return (
                      <View key={lab.id} style={styles.labRow}>
                        <View style={styles.labInfo}>
                          <Text style={styles.labName}>{lab.name}</Text>
                          <Text style={styles.labMeta}>
                            {available} libres de {lab.capacity}
                          </Text>
                        </View>
                        <View style={[styles.labBadge, available < 5 ? styles.badgeWarn : styles.badgeOk]}>
                          <Text style={styles.labBadgeText}>{available < 5 ? 'Alta demanda' : 'Disponible'}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {activeNav === 'reservas' && (
              <View style={[styles.card, styles.cardLarge]}>
                <Text style={styles.sectionTitle}>Reserva automatizada</Text>
                <Text style={styles.helperText}>Solicitudes recientes (pendientes / en revisión).</Text>
                {requests
                  .filter((r) => r.status === 'Pendiente' || r.status === 'En revision')
                  .map((item) => (
                  <View key={item.id} style={styles.listRow}>
                    <View style={styles.listRowInfo}>
                      <Text style={styles.listRowTitle}>{item.roomName}</Text>
                      <Text style={styles.listRowSub}>{item.requester}</Text>
                    </View>
                    <View style={styles.rowActions}>
                      <View style={[styles.pill, item.status === 'Pendiente' ? styles.pillGreen : styles.pillGray]}>
                        <Text style={styles.pillText}>{item.status}</Text>
                      </View>
                      {user?.role === 'admin' && (
                        <>
                          <Pressable
                            onPress={() => setRequestStatus(item.id, 'Aprobada')}
                            style={[styles.actionBtn, styles.actionApprove]}>
                            <Text style={styles.actionBtnText}>Aprobar</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => setRequestStatus(item.id, 'Rechazada')}
                            style={[styles.actionBtn, styles.actionReject]}>
                            <Text style={styles.actionBtnText}>Rechazar</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  </View>
                ))}
                {user?.role === 'admin' && (
                  <Pressable style={styles.primaryButton} onPress={approveAllPending}>
                    <Text style={styles.primaryButtonText}>Aprobar / Gestionar</Text>
                  </Pressable>
                )}
              </View>
            )}
            {activeNav === 'fallas' && (
              <View style={[styles.card, styles.cardLarge]}>
                <Text style={styles.sectionTitle}>Reporte de Fallas de Equipo</Text>
                <Text style={styles.helperText}>Historial de averías reportadas por docentes.</Text>
                
                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Laboratorio de Informática</Text>
                    <Text style={styles.listRowSub}>Bloque A | Fecha: 12/05/2026 | Prof: Juan Pérez</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, styles.pillGray]}>
                      <Text style={styles.pillText}>En Revisión</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Laboratorio de Redes</Text>
                    <Text style={styles.listRowSub}>Bloque C | Fecha: 10/05/2026 | Prof: Ana Gómez</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, styles.pillGreen]}>
                      <Text style={styles.pillText}>Resuelto</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Laboratorio Multimedia</Text>
                    <Text style={styles.listRowSub}>Bloque G | Fecha: 13/05/2026 | Prof: Carlos Ruiz</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, { backgroundColor: '#fee2e2' }]}>
                      <Text style={[styles.pillText, { color: '#b91c1c' }]}>Pendiente</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeNav === 'metricas' && (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Métricas de uso</Text>
                  <Text style={styles.helperText}>Top salas más pedidas (semana).</Text>
                  {topRooms.map((room) => (
                    <View key={room.id} style={styles.topRow}>
                      <Text style={styles.topName}>{room.name}</Text>
                      <Text style={styles.topCount}>{room.requests}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.card, styles.cardLarge]}>
                  <Text style={styles.sectionTitle}>Informe General</Text>
                  <Text style={styles.helperText}>Resumen del estado actual del sistema y ocupación.</Text>
                  <View style={styles.simpleList}>
                    <View style={styles.labRow}>
                      <Text style={styles.labName}>Total de Salas Registradas</Text>
                      <Text style={styles.topCount}>{labs.length}</Text>
                    </View>
                    <View style={styles.labRow}>
                      <Text style={styles.labName}>Capacidad Total (puestos)</Text>
                      <Text style={styles.topCount}>{totalCapacity}</Text>
                    </View>
                    <View style={styles.labRow}>
                      <Text style={styles.labName}>Ocupación Actual</Text>
                      <Text style={styles.topCount}>{((totalOccupied / totalCapacity) * 100).toFixed(1)}%</Text>
                    </View>
                    <View style={styles.labRow}>
                      <Text style={styles.labName}>Total Solicitudes Pendientes</Text>
                      <Text style={styles.topCount}>{pendingCount}</Text>
                    </View>
                    <View style={styles.labRow}>
                      <Text style={styles.labName}>Total Solicitudes Aprobadas</Text>
                      <Text style={styles.topCount}>{requests.filter(r => r.status === 'Aprobada').length}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {activeNav === 'tareas_asignadas' && (
              <View style={[styles.card, styles.cardLarge]}>
                <Text style={styles.sectionTitle}>Tareas Asignadas</Text>
                <Text style={styles.helperText}>Instrucciones enviadas por el administrador.</Text>
                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Verificar cableado de red</Text>
                    <Text style={styles.listRowSub}>Lab. de Informática - Hace 30 min</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, styles.pillGray]}><Text style={styles.pillText}>Pendiente</Text></View>
                  </View>
                </View>
                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Revisar aire acondicionado</Text>
                    <Text style={styles.listRowSub}>Sala Multimedia - Hace 2 horas</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, styles.pillGray]}><Text style={styles.pillText}>Pendiente</Text></View>
                  </View>
                </View>
              </View>
            )}

            {activeNav === 'salas_abrir' && (
              <View style={[styles.card, styles.cardLarge]}>
                <Text style={styles.sectionTitle}>Salas por abrir hoy</Text>
                <Text style={styles.helperText}>Cronograma de aperturas programadas.</Text>
                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Lab. de Redes (Bloque B)</Text>
                    <Text style={styles.listRowSub}>Apertura: 08:00 AM</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, styles.pillGreen]}><Text style={styles.pillText}>Abierto</Text></View>
                  </View>
                </View>
                <View style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowTitle}>Sala de Estudio 1</Text>
                    <Text style={styles.listRowSub}>Apertura: 10:00 AM</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.pill, {backgroundColor: '#fef3c7'}]}><Text style={[styles.pillText, {color: '#92400e'}]}>Próximo</Text></View>
                  </View>
                </View>
              </View>
            )}

            {activeNav === 'laboratorios' && (
              <View style={[styles.card, styles.cardLarge]}>
                <Text style={styles.sectionTitle}>Estado de los Laboratorios</Text>
                <Text style={styles.helperText}>Inventario y capacidades generales (Solo lectura).</Text>
                <View style={styles.simpleList}>
                  {labs.map((lab) => (
                    <View key={lab.id} style={styles.labRow}>
                      <View style={styles.labInfo}>
                        <Text style={styles.labName}>{lab.name}</Text>
                        <Text style={styles.labMeta}>Capacidad máxima: {lab.capacity} personas</Text>
                      </View>
                      <View style={[styles.labBadge, styles.badgeOk]}>
                        <Text style={styles.labBadgeText}>Activo</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  bg: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  bgPhotoBase: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.36,
  },
  bgPhotoAccent: {
    position: 'absolute',
    top: -120,
    right: -220,
    width: 640,
    height: 640,
    opacity: 0.26,
    transform: [{ rotate: '8deg' }],
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,78,59,0.58)',
  },
  bgAccentOne: {
    position: 'absolute',
    top: -140,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.28)',
  },
  bgAccentTwo: {
    position: 'absolute',
    bottom: -220,
    left: -220,
    width: 520,
    height: 520,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.18)',
  },
  shell: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 250,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    margin: 12,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sidebarBrand: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  sidebarLogo: { width: 210, height: 52 },
  sidebarHello: { marginTop: 6, color: '#065f46', fontWeight: '900', textAlign: 'center' },
  sidebarDivider: { marginTop: 10, height: 4, width: 70, borderRadius: 999, backgroundColor: '#16a34a' },
  sidebarNav: { padding: 10, gap: 6 },
  navItem: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
  },
  navItemActive: { backgroundColor: '#16a34a' },
  navItemText: { color: '#334155', fontWeight: '800' },
  navItemTextActive: { color: '#ffffff' },
  mainScroll: {
    flex: 1,
    marginVertical: 12,
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
  },
  mainContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
    flexGrow: 1,
  },
  topbar: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topbarTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  signOut: {
    backgroundColor: '#047857',
    borderWidth: 1,
    borderColor: '#047857',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  signOutText: { color: '#fff', fontWeight: '800' },
  kpiStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiWide: {
    width: 220,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  kpiWideLabel: { color: '#e5e7eb', fontWeight: '900' },
  kpiWideValue: { color: '#ffffff', fontWeight: '900', fontSize: 20, marginTop: 6 },
  kpiWideGreen: { backgroundColor: '#16a34a' },
  kpiWideGray: { backgroundColor: '#6b7280' },
  kpiWideAmber: { backgroundColor: '#f59e0b' },
  kpiWideBlue: { backgroundColor: '#15803d' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 10,
    width: 340,
  },
  cardLarge: { width: 520 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  helperText: { color: '#6b7280', fontWeight: '600' },
  simpleList: { gap: 10, marginTop: 4 },
  labRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  labInfo: { flex: 1, gap: 2 },
  labName: { fontWeight: '900', color: '#0f172a' },
  labMeta: { color: '#64748b', fontWeight: '700' },
  labBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeOk: { backgroundColor: '#16a34a' },
  badgeWarn: { backgroundColor: '#d97706' },
  labBadgeText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  listRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listRowInfo: { flex: 1, gap: 2 },
  listRowTitle: { fontWeight: '900', color: '#0f172a' },
  listRowSub: { color: '#64748b', fontWeight: '600' },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillGreen: { backgroundColor: '#dcfce7' },
  pillGray: { backgroundColor: '#f1f5f9' },
  pillText: { fontWeight: '900', color: '#065f46', fontSize: 12 },
  actionBtn: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  actionApprove: { backgroundColor: '#16a34a' },
  actionReject: { backgroundColor: '#ef4444' },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
  },
  primaryButtonText: { color: '#fff', fontWeight: '900' },
  topRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topName: { fontWeight: '800', color: '#0f172a' },
  topCount: { fontWeight: '900', color: '#008f3d', fontSize: 16 },
  qr: { width: 220, height: 220, alignSelf: 'center' },
  qrLegend: { textAlign: 'center', color: '#64748b', fontWeight: '800' },
  chartContainer: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  barWrapper: {
    alignItems: 'center',
    width: 30,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  activityList: {
    marginTop: 10,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  donutOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 15,
    borderBottomWidth: 15,
    borderColor: '#e5e7eb',
  },
  donutInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  donutLegend: {
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '600',
    marginTop: 5,
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  calendarContainer: {
    marginTop: 10,
  },
  calHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calHeadDay: {
    width: 32,
    textAlign: 'center',
    fontWeight: '800',
    color: '#94a3b8',
    fontSize: 12,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4,
  },
  calDayBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calDayToday: {
    backgroundColor: '#16a34a',
  },
  calDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  calDayTextToday: {
    color: '#ffffff',
  },
  calTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  calBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  calMonthText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    width: 90,
    textAlign: 'center',
  },
});
