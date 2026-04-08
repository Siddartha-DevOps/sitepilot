import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../context/AppContext';
import { COLORS } from '../constants/theme';

// ── Screens ──────────────────────────────────────────────────────────────────
import LoginScreen            from '../screens/LoginScreen';
import DashboardScreen        from '../screens/DashboardScreen';
import ProjectListScreen      from '../screens/ProjectListScreen';
import ProjectDetailsScreen   from '../screens/ProjectDetailsScreen';
import DailyReportScreen      from '../screens/DailyReportScreen';
import MaterialEntryScreen    from '../screens/MaterialEntryScreen';
import MaterialInventoryScreen from '../screens/MaterialInventoryScreen';
import PhotoUploadScreen      from '../screens/PhotoUploadScreen';
import NotificationsScreen    from '../screens/NotificationsScreen';
import ProfileScreen          from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Bottom Tabs ───────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  '#E2E8F0',
          borderTopWidth:  1,
          height:          64,
          paddingBottom:   8,
          paddingTop:      4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard:   focused ? 'grid'           : 'grid-outline',
            Projects:    focused ? 'briefcase'      : 'briefcase-outline',
            Materials:   focused ? 'cube'           : 'cube-outline',
            Photos:      focused ? 'camera'         : 'camera-outline',
            Alerts:      focused ? 'notifications'  : 'notifications-outline',
          };
          return <Ionicons name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen} />
      <Tab.Screen name="Projects"   component={ProjectListScreen} />
      <Tab.Screen name="Materials"  component={MaterialInventoryScreen} />
      <Tab.Screen name="Photos"     component={PhotoUploadScreen} />
      <Tab.Screen name="Alerts"     component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { state } = useAppContext();

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>sitePilot</Text>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.isAuthenticated ? (
          <>
            <Stack.Screen name="Main"            component={MainTabs} />
            <Stack.Screen name="ProjectDetails"  component={ProjectDetailsScreen} />
            <Stack.Screen name="DailyReport"     component={DailyReportScreen} />
            <Stack.Screen name="MaterialEntry"   component={MaterialEntryScreen} />
            <Stack.Screen name="Profile"         component={ProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary },
  brand:   { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
});