import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { COLORS } from '../constants/theme';

import LoginScreen             from '../screens/LoginScreen';
import DashboardScreen         from '../screens/DashboardScreen';
import ProjectListScreen       from '../screens/ProjectListScreen';
import ProjectDetailsScreen    from '../screens/ProjectDetailsScreen';
import DailyReportScreen       from '../screens/DailyReportScreen';
import MaterialEntryScreen     from '../screens/MaterialEntryScreen';
import MaterialInventoryScreen from '../screens/MaterialInventoryScreen';
import PhotoUploadScreen       from '../screens/PhotoUploadScreen';
import NotificationsScreen     from '../screens/NotificationsScreen';
import ProfileScreen           from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: ['grid','grid-outline'],
  Projects:  ['briefcase','briefcase-outline'],
  Materials: ['cube','cube-outline'],
  Photos:    ['camera','camera-outline'],
  Alerts:    ['notifications','notifications-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor:   COLORS.primary,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: { backgroundColor:'#fff', borderTopColor:'#E2E8F0', height:62, paddingBottom:8, paddingTop:4 },
      tabBarLabelStyle: { fontSize:11, fontWeight:'600' },
      tabBarIcon: ({ focused, color, size }) => {
        const [a,b] = TAB_ICONS[route.name]||['circle','circle-outline'];
        return <Ionicons name={focused?a:b} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects"  component={ProjectListScreen} />
      <Tab.Screen name="Materials" component={MaterialInventoryScreen} />
      <Tab.Screen name="Photos"    component={PhotoUploadScreen} />
      <Tab.Screen name="Alerts"    component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { state } = useAppContext();

  if (state.isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.brand}>sitePilot</Text>
        <ActivityIndicator color="#fff" size="large" style={{ marginTop:24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>
        {state.isAuthenticated ? (
          <>
            <Stack.Screen name="Main"           component={MainTabs} />
            <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
            <Stack.Screen name="DailyReport"    component={DailyReportScreen} />
            <Stack.Screen name="MaterialEntry"  component={MaterialEntryScreen} />
            <Stack.Screen name="Profile"        component={ProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex:1, backgroundColor:COLORS.primary, justifyContent:'center', alignItems:'center' },
  brand:  { fontSize:40, fontWeight:'900', color:'#fff', letterSpacing:-1 },
});