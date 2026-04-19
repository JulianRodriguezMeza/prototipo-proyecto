import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type CasBrandHeaderProps = {
  title: string;
  subtitle: string;
};

export function CasBrandHeader({ title, subtitle }: CasBrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('@/assets/images/cecar-logo.png')} style={styles.cecarLogo} contentFit="contain" />
      </View>
      <View style={styles.hero}>
        <View style={styles.textContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    overflow: 'hidden',
  },
  topBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cecarLogo: {
    width: 260,
    height: 72,
  },
  hero: {
    backgroundColor: '#008f3d',
    padding: 14,
  },
  textContent: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#dcfce7',
  },
});
