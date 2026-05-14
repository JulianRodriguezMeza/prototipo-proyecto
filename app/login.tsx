import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { inferRoleFromUsername, useAuth } from '@/lib/auth';
import { createCasLoginUrl, extractTicket, validateTicket } from '@/lib/cas';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => username.trim().length > 0 && password.trim().length > 0, [password, username]);

  const goAfterLogin = useCallback(
    (role: 'student' | 'admin' | 'auxiliar') => {
      router.replace(role === 'student' ? '/(tabs)' : '/(tabs)/explore');
    },
    [router]
  );

  const signInWithCas = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const loginUrl = createCasLoginUrl();
      const result = await WebBrowser.openAuthSessionAsync(loginUrl);

      if (result.type !== 'success' || !result.url) {
        throw new Error('CAS cancelado');
      }

      const ticket = extractTicket(result.url);
      if (!ticket) throw new Error('No se recibio ticket CAS');

      const casUser = await validateTicket(ticket);
      const role = inferRoleFromUsername(casUser.username);
      signIn({ username: casUser.username, displayName: casUser.displayName, role });
      goAfterLogin(role);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  }, [goAfterLogin, signIn]);

  const signInDemo = useCallback(() => {
    setError(null);
    const u = username.trim() || 'estudiante';
    const role = inferRoleFromUsername(u);
    signIn({ username: u, role });
    goAfterLogin(role);
  }, [goAfterLogin, signIn, username]);

  return (
    <ImageBackground
      source={require('@/assets/images/cecar-campus-bg.png')}
      style={styles.bg}
      imageStyle={styles.bgImage}
      resizeMode="cover">
      <View style={styles.bgOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <View style={styles.container}>
            <View style={styles.brand}>
              <Image
                source={require('@/assets/images/cecar-logo-extended.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.brandSubtitle}>Sistema Integrado de Aplicaciones</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Tu usuario institucional"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={styles.captchaRow}>
                <View style={styles.captchaField}>
                  <Text style={styles.label}>Captcha</Text>
                  <TextInput value={captcha} onChangeText={setCaptcha} placeholder="Escribe el captcha" style={styles.input} />
                </View>
                <View style={styles.captchaPreview}>
                  <Text style={styles.captchaText}>T7pB8</Text>
                </View>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                disabled={isLoading}
                onPress={signInWithCas}
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>}
              </Pressable>

              <Pressable disabled={isLoading || !canSubmit} onPress={signInDemo} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Entrar (demo)</Text>
              </Pressable>

              <Pressable disabled={isLoading} style={styles.forgot}>
                <Text style={styles.forgotText}>¿Olvidó su contraseña?</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%', backgroundColor: '#0b1220' },
  bgImage: { width: '100%', height: '100%' },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    gap: 18,
  },
  brand: {
    alignItems: 'center',
    gap: 8,
  },
  logo: { width: 300, height: 80 },
  brandSubtitle: { color: '#f0fdf4', fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 12,
  },
  field: { gap: 6 },
  label: { color: '#475569', fontWeight: '700', fontSize: 13 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  captchaRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  captchaField: { flex: 1, gap: 6 },
  captchaPreview: {
    width: 90,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captchaText: { fontWeight: '900', letterSpacing: 1.5, color: '#0f172a' },
  error: { color: '#b91c1c', fontWeight: '600' },
  primaryButton: {
    marginTop: 2,
    backgroundColor: '#008f3d',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryButton: {
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#008f3d',
  },
  secondaryButtonText: { color: '#008f3d', fontWeight: '800' },
  forgot: { alignItems: 'center', paddingTop: 2 },
  forgotText: { color: '#64748b', fontWeight: '600' },
});

