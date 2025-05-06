import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotScreen from 'screens/auth/ForgotScreen';
import LoginScreen from 'screens/auth/LoginScreen';
import RegisterScreen from 'screens/auth/RegisterScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackScreen({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Forgot" component={ForgotScreen} />
    </AuthStack.Navigator>
  );
}
