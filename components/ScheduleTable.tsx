import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { ReservationRequest } from '../lib/api';

const DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const TIMES = [
  '06:00 am-08:00 am',
  '08:00 am-10:00 am',
  '10:00 am-12:00 pm',
  '12:00 pm-02:00 pm',
  '02:00 pm-04:00 pm',
  '04:00 pm-06:00 pm'
];

const generateGrid = (labName: string, allRequests: ReservationRequest[]) => {
  if (!labName) return [];
  
  // Create a 6x6 grid (6 times, 6 days) initialized to 'Libre'
  const grid = TIMES.map(time => {
    const row: Record<string, string> = { time };
    DAYS.forEach(day => {
      row[day] = 'Libre';
    });
    return row;
  });

  // Populate 'Ocupada' based on allRequests
  const approved = allRequests.filter(r => r.roomName === labName && r.status === 'Aprobada');

  approved.forEach(req => {
    if (!req.reservationDate || !req.startTime) return;
    
    // Find day
    let matchedDay = '';
    const dateStr = req.reservationDate.toUpperCase();
    if (dateStr.includes('LUNES')) matchedDay = 'LUNES';
    else if (dateStr.includes('MARTES')) matchedDay = 'MARTES';
    else if (dateStr.includes('MIÉRCOLES') || dateStr.includes('MIERCOLES')) matchedDay = 'MIÉRCOLES';
    else if (dateStr.includes('JUEVES')) matchedDay = 'JUEVES';
    else if (dateStr.includes('VIERNES')) matchedDay = 'VIERNES';
    else if (dateStr.includes('SÁBADO') || dateStr.includes('SABADO')) matchedDay = 'SÁBADO';
    else {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            const daysOfWeek = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
            matchedDay = daysOfWeek[d.getDay()];
        }
    }

    // Find time slot
    let matchedTimeIndex = -1;
    const reqHourMatch = req.startTime.match(/(\d{1,2})/);
    let reqHour = reqHourMatch ? parseInt(reqHourMatch[1], 10) : -1;
    if (req.startTime.toLowerCase().includes('pm') && reqHour !== 12) reqHour += 12;
    if (req.startTime.toLowerCase().includes('am') && reqHour === 12) reqHour = 0;

    if (reqHour !== -1) {
        TIMES.forEach((timeSlot, index) => {
            const slotHourMatch = timeSlot.split('-')[0].match(/(\d{1,2})/);
            let slotHour = slotHourMatch ? parseInt(slotHourMatch[1], 10) : -1;
            if (timeSlot.split('-')[0].toLowerCase().includes('pm') && slotHour !== 12) slotHour += 12;
            if (timeSlot.split('-')[0].toLowerCase().includes('am') && slotHour === 12) slotHour = 0;

            if (reqHour >= slotHour && reqHour < slotHour + 2) {
                matchedTimeIndex = index;
            }
        });
    }

    if (matchedDay && matchedTimeIndex !== -1) {
       grid[matchedTimeIndex][matchedDay] = 'Ocupada';
    }
  });

  return grid;
};

export function ScheduleTable({ labName, allRequests }: { labName: string, allRequests?: ReservationRequest[] }) {
  if (!labName) return null;

  const rows = generateGrid(labName, allRequests || []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horario de {labName}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true} 
        style={styles.scroll}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 10 }}
      >
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.row}>
            {DAYS.map((day) => (
              <View key={day} style={styles.headerCell}>
                <Text style={styles.headerText}>{day}</Text>
              </View>
            ))}
          </View>
          
          {/* Data Rows */}
          {rows.map((rowData, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {DAYS.map((day) => {
                const status = rowData[day];
                const isOcupada = status === 'Ocupada';
                return (
                  <View 
                    key={day} 
                    style={styles.cell}
                  >
                    <View style={styles.cellContent}>
                      <Text style={[
                        styles.statusText,
                        isOcupada ? styles.textOcupada : styles.textLibre
                      ]}>
                        {isOcupada ? 'OCUPADA' : 'LIBRE'}
                      </Text>
                      {isOcupada && (
                        <Text style={styles.roomText}>Aula. {labName}</Text>
                      )}
                      <Text style={styles.timeText}>{rowData.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  scroll: {
  },
  table: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#cbd5e1',
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    width: 52, // Ajuste milimétrico para que sume ~312px y quepa con los márgenes (padding)
    paddingVertical: 4,
    paddingHorizontal: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  headerText: {
    fontWeight: '800',
    fontSize: 8, // Ajustado
    color: '#334155',
    textAlign: 'center',
  },
  cell: {
    width: 52, // Mismo ancho que el header
    minHeight: 55, // Más bajo para mantener proporción
    padding: 2,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  cellContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 1,
    textAlign: 'center',
  },
  textOcupada: {
    color: '#000000',
  },
  textLibre: {
    color: '#16a34a',
  },
  roomText: {
    fontSize: 7,
    color: '#475569',
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 7, // Apenas para que encaje
    color: '#334155',
    marginTop: 'auto',
    textAlign: 'center',
    paddingTop: 1,
  }
});
