import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext, ACTIONS } from '../context/AppContext';
import authService from '../services/authService';
import InputField  from '../components/InputField';
import Button      from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function LoginScreen() {
  const { dispatch } = useAppContext();
  const insets       = useSafeAreaInsets();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!email.trim())    errs.email    = 'Email / phone is required';
    if (!password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
      dispatch({ type: ACTIONS.SET_TOKEN, payload: res.token });
      dispatch({ type: ACTIONS.SET_USER,  payload: res.user  });
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Demo login (remove in production) ──────────────────────────────────────
  function handleDemoLogin() {
    dispatch({
      type: ACTIONS.SET_USER,
      payload: { id: '1', name: 'Ravi Kumar', email: 'ravi@sitepilot.com', company: 'Kumar Constructions', role: 'Site Engineer' },
    });
    dispatch({ type: ACTIONS.SET_TOKEN, payload: 'demo-token-123' });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header bar ──────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <Text style={styles.brand}>sitePilot</Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Ionicons name="help-circle-outline" size={26} color={COLORS.textWhite} />
          </TouchableOpacity>
        </View>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="construct" size={52} color={COLORS.textWhite} />
          </View>
          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSub}>Sign in to manage your construction sites</Text>
        </View>

        {/* ── Card ────────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <InputField
            label="Email or Phone"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
            error={errors.email}
            icon={<Ionicons name="person-outline" size={20} color={COLORS.textLight} />}
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />}
          />

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />

          {/* Demo */}
          <Button
            title="Demo Login (Testing)"
            onPress={handleDemoLogin}
            variant="outline"
            size="lg"
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Text style={styles.footer}>
          By signing in you agree to our{' '}
          <Text style={styles.link}>Terms</Text> &{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: COLORS.primary },
  scroll:     { flexGrow: 1 },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  brand:      { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textWhite, letterSpacing: -0.5 },
  helpBtn:    { padding: 4 },
  hero:       { alignItems: 'center', paddingVertical: SPACING.xl },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  heroTitle:  { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textWhite, marginBottom: 6 },
  heroSub:    { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: SPACING.xl },
  card:       { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.lg, paddingTop: SPACING.xl, flex: 1 },
  forgot:     { alignSelf: 'flex-end', marginTop: -SPACING.xs, marginBottom: SPACING.md },
  forgotText: { color: COLORS.primary, fontWeight: '600', fontSize: FONTS.sizes.sm },
  loginBtn:   { marginTop: SPACING.xs },
  footer:     { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.xs, paddingVertical: SPACING.md, backgroundColor: COLORS.surface },
  link:       { color: COLORS.primary, fontWeight: '600' },
});