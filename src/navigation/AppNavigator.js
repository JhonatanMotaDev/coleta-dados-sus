import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import PatientListScreen from '../screens/PatientListScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import HASFormScreen from '../screens/HASFormScreen';
import DMFormScreen from '../screens/DMFormScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ChartScreen from '../screens/ChartScreen';

const Stack = createStackNavigator();

const headerBase = {
  headerStyle: { backgroundColor: COLORS.primary, elevation: 0, shadowOpacity: 0 },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  headerBackTitleVisible: false,
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={headerBase}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientList"
          component={PatientListScreen}
          options={({ navigation }) => ({
            title: 'Pacientes',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginRight: 16 }}>
                <Ionicons name="person-add" size={22} color={COLORS.white} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="PatientDetail"
          component={PatientDetailScreen}
          options={({ route }) => ({ title: route.params?.patient?.nome || 'Paciente' })}
        />
        <Stack.Screen
          name="HASForm"
          component={HASFormScreen}
          options={{ title: 'Medição — Hipertensão' }}
        />
        <Stack.Screen
          name="DMForm"
          component={DMFormScreen}
          options={{ title: 'Medição — Diabetes' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={({ route }) => ({ title: `Histórico — ${route.params?.patient?.nome || ''}` })}
        />
        <Stack.Screen
          name="Chart"
          component={ChartScreen}
          options={({ route }) => ({ title: `Gráficos — ${route.params?.patient?.nome || ''}` })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
