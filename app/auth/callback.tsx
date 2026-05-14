import { Redirect, useLocalSearchParams } from 'expo-router';

export default function AuthCallbackScreen() {
  // This route exists mainly to satisfy the CAS "service" URL.
  // The app handles the flow in `login.tsx` via `openAuthSessionAsync`.
  // If the OS opens this screen, we forward back to login to retry the validation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useLocalSearchParams<{ ticket?: string }>();
  return <Redirect href={'/login' as never} />;
}

