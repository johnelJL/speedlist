import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ItemScreen from '../screens/ItemScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.accent,
    text: colors.text,
    border: colors.border,
    card: colors.card
  }
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border }
      }}
    >
      <Tab.Screen name="Discover" component={HomeScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text
        }}
      >
        <Stack.Screen name="Root" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="CategoryDetail" component={CategoryScreen} options={{ title: 'Category' }} />
        <Stack.Screen name="ItemDetail" component={ItemScreen} options={{ title: 'Item' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
