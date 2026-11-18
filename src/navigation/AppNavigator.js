import React from 'react';
import {Text} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import OrderScreen from '../screens/OrderScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import SalesHistoryScreen from '../screens/SalesHistoryScreen';
import {colors} from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const icon = e => ({focused}) => (
  <Text style={{fontSize: focused ? 24 : 20}}>{e}</Text>
);

const theme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: colors.cream},
};

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.peach,
        tabBarInactiveTintColor: '#E9CDB8',
        tabBarLabelStyle: {fontSize: 11, fontWeight: '700'},
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: insets.bottom + 12,
          height: 66,
          borderRadius: 33,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 10,
        },
      }}>
      <Tab.Screen name="Home" component={DashboardScreen} options={{tabBarIcon: icon('🏠')}} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{tabBarIcon: icon('🍰')}} />
      <Tab.Screen name="Order" component={OrderScreen} options={{tabBarIcon: icon('🛒')}} />
      <Tab.Screen name="Stock" component={InventoryScreen} options={{tabBarIcon: icon('📦')}} />
      <Tab.Screen name="History" component={SalesHistoryScreen} options={{tabBarIcon: icon('🧾')}} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}