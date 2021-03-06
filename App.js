/* eslint-disable react-hooks/exhaustive-deps */
import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import auth from '@react-native-firebase/auth';
import SignUp from './src/screens/SignUp';
import Login from './src/screens/Login';
import Home from './src/screens/Home';

enableScreens();
const LoginStack = createNativeStackNavigator();
const AppNav = createNativeStackNavigator();

export default function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(currentUser) {
    setUser(currentUser);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return null;
  }

  if (!user) {
    // No User Flow
    return (
      <NavigationContainer>
        <LoginStack.Navigator
          initialRouteName="SignUp"
          screenOptions={{
            headerShown: false,
          }}>
          <LoginStack.Screen name="SignUp" component={SignUp} />
          <LoginStack.Screen name="Login" component={Login} />
        </LoginStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AppNav.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <AppNav.Screen name="Home" component={Home} />
      </AppNav.Navigator>
    </NavigationContainer>
  );
}
