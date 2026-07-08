import { Route, Routes } from 'react-router-dom';
import { OnboardingProvider } from './context/OnboardingContext';
import AIAssistant from './components/AIAssistant';
import OnboardingSpotlight from './components/OnboardingSpotlight';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import VendedorPage from './pages/VendedorPage';

export default function App() {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/vendedor" element={<VendedorPage />} />
        <Route path="/vendedor/*" element={<VendedorPage />} />
      </Routes>
      <AIAssistant />
      <OnboardingSpotlight />
    </OnboardingProvider>
  );
}
