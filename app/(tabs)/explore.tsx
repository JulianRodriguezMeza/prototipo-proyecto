import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CasBrandHeader } from '@/components/cas-brand-header';

type Lab = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
};

const baseLabs: Lab[] = [
  { id: 'lab-1', name: 'Laboratorio Redes', capacity: 30, occupied: 20 },
  { id: 'lab-2', name: 'Laboratorio Informatica', capacity: 25, occupied: 10 },
  { id: 'lab-3', name: 'Laboratorio Multimedia', capacity: 20, occupied: 8 },
];

export default function AdminPanelScreen() {
  const [labs, setLabs] = useState(baseLabs);
  const [selectedLabId, setSelectedLabId] = useState(baseLabs[0].id);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLabs((current) =>
        current.map((lab) => {
          const variation = Math.floor(Math.random() * 5) - 2;
          const nextOccupied = Math.max(0, Math.min(lab.capacity, lab.occupied + variation));
          return { ...lab, occupied: nextOccupied };
        })
      );
      setLastSync(new Date());
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const selectedLab = useMemo(
    () => labs.find((lab) => lab.id === selectedLabId) ?? labs[0],
    [labs, selectedLabId]
  );

  const qrUrl = `https://quickchart.io/qr?text=CAS-${encodeURIComponent(selectedLab.name)}-ACCESO&size=220`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <CasBrandHeader
          title="Panel Administrativo CAS"
          subtitle="Control de laboratorios, reservas y acceso QR"
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Disponibilidad en tiempo real</Text>
          <Text style={styles.helperText}>
            Ultima actualizacion: {lastSync.toLocaleTimeString('es-CO')}
          </Text>
          {labs.map((lab) => {
            const available = lab.capacity - lab.occupied;
            return (
              <View key={lab.id} style={styles.labRow}>
                <View style={styles.labInfo}>
                  <Text style={styles.labName}>{lab.name}</Text>
                  <Text style={styles.labMeta}>
                    {available} cupos libres de {lab.capacity}
                  </Text>
                </View>
                <View style={[styles.badge, available < 5 ? styles.badgeWarn : styles.badgeOk]}>
                  <Text style={styles.badgeText}>{available < 5 ? 'Alta demanda' : 'Disponible'}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reserva automatizada</Text>
          <View style={styles.chipRow}>
            {labs.map((lab) => (
              <Pressable
                key={lab.id}
                onPress={() => setSelectedLabId(lab.id)}
                style={[styles.chip, selectedLabId === lab.id && styles.chipActive]}>
                <Text style={[styles.chipText, selectedLabId === lab.id && styles.chipTextActive]}>
                  {lab.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Reservar bloque disponible</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Control de acceso con QR</Text>
          <Text style={styles.helperText}>Escanear en entrada: {selectedLab.name}</Text>
          <Image source={{ uri: qrUrl }} style={styles.qr} contentFit="contain" />
          <Text style={styles.qrLegend}>Codigo dinamico generado para acceso seguro.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
  helperText: {
    color: '#64748b',
    fontSize: 13,
  },
  labRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  labInfo: {
    flex: 1,
    gap: 2,
  },
  labName: {
    fontWeight: '700',
    color: '#1e293b',
  },
  labMeta: {
    color: '#475569',
    fontSize: 13,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeOk: {
    backgroundColor: '#16a34a',
  },
  badgeWarn: {
    backgroundColor: '#d97706',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
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
    backgroundColor: '#008f3d',
    borderColor: '#008f3d',
  },
  chipText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#008f3d',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  qr: {
    width: 220,
    height: 220,
    alignSelf: 'center',
  },
  qrLegend: {
    textAlign: 'center',
    color: '#475569',
  },
});
