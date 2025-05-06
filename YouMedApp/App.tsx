import { AuthProvider } from 'contexts/AuthContext';
import AppContent from 'navigation/AppNavigator';
import './global.css';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}