import { useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { CasBrandHeader } from '@/components/cas-brand-header';
import { ScheduleTable } from '@/components/ScheduleTable';
import { api, Lab, ReservationRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function CasScreen() {
  const { user, signOut } = useAuth();
  const [subject, setSubject] = useState('');
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [observations, setObservations] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [endTime, setEndTime] = useState('');
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [allRequests, setAllRequests] = useState<ReservationRequest[]>([]);

  // Función para mostrar la hora en formato 12h (AM/PM) en el móvil
  const formatTime12h = (time24: string) => {
    if (!time24) return '--:--';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  // Estados nativos para los selectores de Fecha y Hora en Celular
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTimeObj, setStartTimeObj] = useState(() => {
    const d = new Date(); d.setHours(8, 0, 0, 0); return d;
  });
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [endTimeObj, setEndTimeObj] = useState(() => {
    const d = new Date(); d.setHours(10, 0, 0, 0); return d;
  });
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      setDateObj(selectedDate);
      setReservationDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const onStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime && event.type !== 'dismissed') {
      setStartTimeObj(selectedTime);
      const hs = selectedTime.getHours().toString().padStart(2, '0');
      const ms = selectedTime.getMinutes().toString().padStart(2, '0');
      setStartTime(`${hs}:${ms}`);
    }
  };

  const onEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime && event.type !== 'dismissed') {
      setEndTimeObj(selectedTime);
      const hs = selectedTime.getHours().toString().padStart(2, '0');
      const ms = selectedTime.getMinutes().toString().padStart(2, '0');
      setEndTime(`${hs}:${ms}`);
    }
  };

  const canSend = useMemo(() => subject.trim().length > 0 && reservationDate.trim().length > 0 && startTime.trim().length > 0 && endTime.trim().length > 0 && !isSending, [subject, reservationDate, startTime, endTime, isSending]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedLabs, fetchedReqs] = await Promise.all([
          api.getLabs(),
          api.getRequests()
        ]);
        setLabs(fetchedLabs);
        setAllRequests(fetchedReqs);
        setRequests(fetchedReqs.filter(r => r.requester.includes(user?.username || '')));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.username]);

  const sendRequest = async () => {
    if (!canSend) return;
    setIsSending(true);
    try {
      const newReq = await api.createRequest({
        roomName: subject.trim(),
        requester: user?.displayName || user?.username || 'Estudiante',
        observations: observations.trim(),
        reservationDate: reservationDate.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      });
      setRequests((current) => [newReq, ...current]);
      setAllRequests((current) => [newReq, ...current]);
      setSubject('');
      setObservations('');
      setReservationDate('');
      setStartTime('');
      setEndTime('');
      setShowAvailability(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{__html: `
          ::-webkit-scrollbar {
            width: 12px !important;
            height: 12px !important;
            background-color: #f1f5f9 !important;
            display: block !important;
            -webkit-appearance: none;
          }
          ::-webkit-scrollbar-track {
            background: #f1f5f9 !important;
            border-radius: 8px !important;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #94a3b8 !important;
            border-radius: 8px !important;
            border: 3px solid #f1f5f9 !important;
          }
          ::-webkit-scrollbar-thumb:hover {
            background-color: #64748b !important;
          }
        `}} />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <CasBrandHeader
          title="CAS - Centro de Atencion y Servicios"
          subtitle="Gestion sencilla de servicios y solicitudes"
          onSignOut={signOut}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Solicitar Préstamo de Espacio</Text>
          <Text style={styles.label}>Solicitante</Text>
          <View style={styles.lockedField}>
            <Text style={styles.lockedFieldText}>Usuario CECAR activo</Text>
          </View>

          <View style={styles.formList}>
            <View style={styles.subjectContainer}>
              <Text style={styles.label}>Espacio a solicitar</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setIsSubjectOpen((prev) => !prev)}>
                <Text style={[styles.dropdownTriggerText, !subject && styles.dropdownPlaceholder]}>
                  {subject || 'Selecciona un espacio'}
                </Text>
                <Text style={styles.dropdownArrow}>{isSubjectOpen ? '▲' : '▼'}</Text>
              </Pressable>
              {isSubjectOpen ? (
                <View style={styles.dropdownList}>
                  {labs.map((lab) => {
                    const active = subject === lab.name;
                    return (
                      <Pressable
                        key={lab.id}
                        onPress={() => {
                          setSubject(lab.name);
                          setIsSubjectOpen(false);
                        }}
                        style={[styles.dropdownItem, active && styles.dropdownItemActive]}>
                        <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                          {lab.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            {subject ? <ScheduleTable labName={subject} allRequests={allRequests} /> : null}

            <View>
              <Text style={styles.label}>Fecha solicitada</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={reservationDate}
                  onChange={(e: any) => setReservationDate(e.target.value)}
                  style={styles.input as any}
                />
              ) : (
                <>
                  <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
                    <Text style={{ color: reservationDate ? '#0f172a' : '#64748b' }}>
                      {reservationDate || 'Selecciona la fecha...'}
                    </Text>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dateObj}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={onDateChange}
                    />
                  )}
                </>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Hora de Inicio</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    min="06:00"
                    max="12:00"
                    value={startTime}
                    onFocus={() => {
                      if (!startTime) setStartTime('06:00');
                    }}
                    onChange={(e: any) => setStartTime(e.target.value)}
                    style={styles.input as any}
                  />
                ) : (
                  <>
                    <Pressable style={styles.input} onPress={() => setShowStartTimePicker(true)}>
                      <Text style={{ color: startTime ? '#0f172a' : '#64748b' }}>
                        {startTime ? formatTime12h(startTime) : '--:--'}
                      </Text>
                    </Pressable>
                    {showStartTimePicker && (
                      <DateTimePicker
                        value={startTimeObj}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onStartTimeChange}
                      />
                    )}
                  </>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Hora de Fin</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    min="06:00"
                    max="12:00"
                    value={endTime}
                    onFocus={() => {
                      if (!endTime) setEndTime('08:00');
                    }}
                    onChange={(e: any) => setEndTime(e.target.value)}
                    style={styles.input as any}
                  />
                ) : (
                  <>
                    <Pressable style={styles.input} onPress={() => setShowEndTimePicker(true)}>
                      <Text style={{ color: endTime ? '#0f172a' : '#64748b' }}>
                        {endTime ? formatTime12h(endTime) : '--:--'}
                      </Text>
                    </Pressable>
                    {showEndTimePicker && (
                      <DateTimePicker
                        value={endTimeObj}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onEndTimeChange}
                      />
                    )}
                  </>
                )}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Observaciones adicionales (Opcional)</Text>
              <TextInput
                value={observations}
                onChangeText={setObservations}
                multiline
                placeholder="Ej. Necesito utilizar la sala con MySQL instalado"
                style={[styles.input, styles.textArea]}
              />
            </View>
          </View>

          <Pressable
            onPress={sendRequest}
            disabled={!canSend}
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}>
            <Text style={styles.sendButtonText}>Enviar solicitud</Text>
          </Pressable>
        </View>

        {showAvailability ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Salas disponibles</Text>
            <Text style={styles.statusNote}>
              Tu solicitud fue enviada. Estas son las salas disponibles actualmente:
            </Text>
            {labs.map((lab) => {
              const available = lab.capacity - lab.occupied;
              return (
                <View key={lab.id} style={styles.availabilityRow}>
                  <View>
                    <Text style={styles.availabilityName}>{lab.name}</Text>
                    <Text style={styles.availabilityMeta}>
                      {available} cupos libres de {lab.capacity}
                    </Text>
                  </View>
                  <Text style={styles.availableBadge}>Disponible</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mis solicitudes</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#008f3d" style={{ marginTop: 10 }} />
          ) : requests.length === 0 ? (
            <Text style={styles.emptyText}>Hasta el momento no tienes solicitudes.</Text>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestRow}>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Text style={styles.requestText}>{request.roomName}</Text>
                  {request.reservationDate && <Text style={{ color: '#008f3d', fontSize: 13, marginTop: 2 }}>{request.reservationDate}</Text>}
                  {request.observations && <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Obs: {request.observations}</Text>}
                  {request.adminNote && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Respuesta: {request.adminNote}</Text>}
                </View>
                <Text style={[
                  styles.requestStatus, 
                  request.status === 'Pendiente' ? { color: '#f59e0b' } : 
                  request.status === 'Aprobada' ? { color: '#10b981' } : 
                  request.status === 'Rechazada' ? { color: '#ef4444' } : 
                  { color: '#64748b' }
                ]}>
                  {request.status}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  lockedField: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 11,
  },
  lockedFieldText: {
    color: '#475569',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 14,
  },
  formList: {
    gap: 10,
  },
  subjectContainer: {
    gap: 6,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    color: '#0f172a',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#64748b',
  },
  dropdownArrow: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemActive: {
    backgroundColor: '#e8f7ef',
  },
  dropdownItemText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#008f3d',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: 4,
    backgroundColor: '#008f3d',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    color: '#64748b',
  },
  requestRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestText: {
    color: '#1e293b',
    flex: 1,
    paddingRight: 6,
  },
  requestStatus: {
    color: '#008f3d',
    fontWeight: '700',
  },
  statusNote: {
    color: '#475569',
    fontSize: 13,
  },
  availabilityRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  availabilityName: {
    color: '#1e293b',
    fontWeight: '700',
  },
  availabilityMeta: {
    color: '#475569',
    fontSize: 13,
  },
  availableBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
});
