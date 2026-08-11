import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDictionary } from '@shared/i18n/dictionaries';
import { useSession } from '../src/lib/session';

const t = getDictionary('fr');

/** Libellé d'espace selon le rôle — les trois espaces du site existent aussi ici. */
const spaceLabel = {
  STUDENT: 'Espace stagiaire',
  TEACHER: 'Espace formateur',
  ADMIN: 'Espace administrateur',
} as const;

export default function Home() {
  const { status, user, signOut } = useSession();
  const router = useRouter();

  if (status === 'anon') return <Redirect href="/login" />;
  if (!user) return null;

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-brand-deep px-6 pb-8 pt-4">
        <Text className="text-sm text-white/70">{t.brand.name}</Text>

        <View className="mt-6 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Text className="text-base font-bold text-white">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-white/60">
              {spaceLabel[user.role]}
            </Text>
            <Text className="text-xl font-bold text-white">
              Bonjour, {user.firstName}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-6 py-6">
        <View className="rounded-2xl bg-white p-5">
          <Text className="text-base font-semibold text-ink">Session authentifiée</Text>
          <Text className="mt-1 text-sm text-ink-muted">
            Jeton conservé dans le trousseau de l'appareil et renouvelé automatiquement.
          </Text>

          <View className="mt-4 gap-2">
            <Row label="Compte" value={user.email} />
            <Row label="Rôle" value={user.role} />
            <Row label="Langue" value={user.locale.toUpperCase()} />
          </View>
        </View>

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
          accessibilityRole="button"
          className="mt-6 items-center rounded-xl border border-slate-200 bg-white py-3.5"
        >
          <Text className="text-base font-semibold text-ink">{t.nav.logout}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-t border-slate-100 pt-2">
      <Text className="text-sm text-ink-muted">{label}</Text>
      <Text className="text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}
