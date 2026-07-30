import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavigationProvider } from './context/NavigationContext.jsx'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import NavigationPage from './pages/NavigationPage'
import NearbyPage from './pages/NearbyPage'
import LandmarkPage from './pages/LandmarkPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/navigation" element={<NavigationPage />} />
            <Route path="/nearby" element={<NearbyPage />} />
            <Route path="/landmark/:id" element={<LandmarkPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </NavigationProvider>
    </BrowserRouter>
  )
}

export default App
