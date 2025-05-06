import { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from 'contexts/AuthContext';
import { NotificationProvider } from 'contexts/NotificationContext';

import AuthStackScreen from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import DoctorNavigator from './DoctorNavigator';
import ClinicNavigator from './ClinicNavigator';

const RootStack = createNativeStackNavigator();

export default function AppContent() {
  const { user, isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn && user ? (
          <RootStack.Screen name="LoggedIn">
            {() => (
              <NotificationProvider userID={user.userID}>
                {user.role === 'Client' ? (
                  <ClientNavigator setIsLoggedIn={setIsLoggedIn} />
                ) : user.role === 'Doctor' ? (
                  <DoctorNavigator setIsLoggedIn={setIsLoggedIn} />
                ) : user.role === 'Clinic' ? (
                  <ClinicNavigator setIsLoggedIn={setIsLoggedIn} />
                ) : null}
              </NotificationProvider>
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthStackScreen setIsLoggedIn={setIsLoggedIn} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
