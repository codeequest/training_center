import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiRequestError } from '@shared/api/client';
import { getDictionary } from '@shared/i18n/dictionaries';
import { useSession } from '../src/lib/session';

// Les libellés viennent du dictionnaire partagé avec le site : une seule traduction
// à maintenir pour les deux plateformes.
const t = getDictionary('fr');

export default function Login() {
  const { signIn } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      router.replace('/home');
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : t.login.networkError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-deep">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-bold text-white">{t.brand.name}</Text>
          <Text className="mt-2 text-base text-white/70">{t.brand.tagline}</Text>

          <View className="mt-10 rounded-2xl bg-white p-6">
            <Text className="text-xl font-semibold text-ink">{t.login.title}</Text>
            <Text className="mt-1.5 text-sm text-ink-muted">{t.login.subtitle}</Text>

            <Text className="mt-6 text-sm font-medium text-ink">{t.login.emailLabel}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              placeholder={t.login.emailPlaceholder}
              placeholderTextColor="#94a3b8"
              className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-base text-ink"
            />

            <Text className="mt-4 text-sm font-medium text-ink">{t.login.passwordLabel}</Text>
            <View className="mt-1.5 flex-row items-center rounded-xl border border-slate-200 pr-2">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoComplete="current-password"
                placeholder={t.login.passwordPlaceholder}
                placeholderTextColor="#94a3b8"
                onSubmitEditing={submit}
                returnKeyType="go"
                className="flex-1 px-4 py-3 text-base text-ink"
              />
              <Pressable
                onPress={() => setVisible((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={visible ? t.login.hidePassword : t.login.showPassword}
              >
                <Text className="px-2 text-sm font-medium text-brand">
                  {visible ? t.login.hide : t.login.show}
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View className="mt-4 rounded-xl bg-red-50 px-4 py-3">
                <Text className="text-sm text-red-700">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={busy || !email || !password}
              accessibilityRole="button"
              className={`mt-6 flex-row items-center justify-center rounded-xl py-3.5 ${
                busy || !email || !password ? 'bg-slate-300' : 'bg-brand'
              }`}
            >
              {busy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">{t.login.submit}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
