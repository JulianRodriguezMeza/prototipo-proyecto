import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CasBrandHeader } from '@/components/cas-brand-header';

const serviceOptions = ['Servicio de laboratorio', 'Prestamo de equipos', 'Soporte tecnico'];
const subjectOptions = [
  'Reserva laboratorio de redes',
  'Reserva laboratorio de informatica',
  'Prestamo de videobeam',
  'Prestamo de portatil',
  'Soporte de conectividad',
];
const labs = [
  { id: 'lab-1', name: 'Laboratorio Redes', capacity: 30, occupied: 16 },
  { id: 'lab-2', name: 'Laboratorio Informatica', capacity: 25, occupied: 8 },
  { id: 'lab-3', name: 'Laboratorio Multimedia', capacity: 20, occupied: 6 },
];
const requestFields = [{ key: 'subject' }, { key: 'description' }] as const;

export default function CasScreen() {
  const [selectedService, setSelectedService] = useState(serviceOptions[0]);
  const [subject, setSubject] = useState('');
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState<string[]>([]);
  const [showAvailability, setShowAvailability] = useState(false);

  const canSend = useMemo(() => subject.trim().length > 0 && description.trim().length >= 5, [description, subject]);

  const sendRequest = () => {
    if (!canSend) return;
    const newItem = `${selectedService} - ${subject.trim()}`;
    setRequests((current) => [newItem, ...current]);
    setSubject('');
    setDescription('');
    setShowAvailability(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <CasBrandHeader
          title="CAS - Centro de Atencion y Servicios"
          subtitle="Gestion sencilla de servicios y solicitudes"
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Servicios disponibles</Text>
          <View style={styles.chipRow}>
            {serviceOptions.map((service) => {
              const active = service === selectedService;
              return (
                <Pressable
                  key={service}
                  onPress={() => setSelectedService(service)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{service}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nueva solicitud</Text>
          <Text style={styles.label}>Solicitante</Text>
          <View style={styles.lockedField}>
            <Text style={styles.lockedFieldText}>Usuario CECAR activo</Text>
          </View>

          <FlatList
            data={requestFields}
            keyExtractor={(item) => item.key}
            scrollEnabled={false}
            contentContainerStyle={styles.formList}
            renderItem={({ item }) => (
              <View>
                {item.key === 'subject' ? (
                  <View style={styles.subjectContainer}>
                    <Text style={styles.label}>Asunto</Text>
                    <Pressable style={styles.dropdownTrigger} onPress={() => setIsSubjectOpen((prev) => !prev)}>
                      <Text style={[styles.dropdownTriggerText, !subject && styles.dropdownPlaceholder]}>
                        {subject || 'Selecciona un asunto'}
                      </Text>
                      <Text style={styles.dropdownArrow}>{isSubjectOpen ? '▲' : '▼'}</Text>
                    </Pressable>
                    {isSubjectOpen ? (
                      <View style={styles.dropdownList}>
                        {subjectOptions.map((option) => {
                          const active = subject === option;
                          return (
                            <Pressable
                              key={option}
                              onPress={() => {
                                setSubject(option);
                                setIsSubjectOpen(false);
                              }}
                              style={[styles.dropdownItem, active && styles.dropdownItemActive]}>
                              <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                                {option}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.label}>Descripcion</Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      placeholder="Describe la necesidad o detalle del prestamo"
                      style={[styles.input, styles.textArea]}
                    />
                  </View>
                )}
              </View>
            )}
          />

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
          {requests.length === 0 ? (
            <Text style={styles.emptyText}>Hasta el momento no tienes solicitudes.</Text>
          ) : (
            requests.map((request) => (
              <View key={request} style={styles.requestRow}>
                <Text style={styles.requestText}>{request}</Text>
                <Text style={styles.requestStatus}>Abierta</Text>
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
