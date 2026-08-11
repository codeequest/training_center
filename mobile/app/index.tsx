import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../src/lib/session';

/** Écran d'entrée : aiguille vers la connexion ou l'espace personnel. */
export default function Index() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-brand-deep">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  return <Redirect href={status === 'authed' ? '/home' : '/login'} />;
}
