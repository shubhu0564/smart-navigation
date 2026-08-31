import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavigationProvider } from './context/NavigationContext.jsx'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import NavigationPage from './pages/NavigationPage'
import LandmarkPage from './pages/LandmarkPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/navigation" element={<NavigationPage />} />
            <Route path="/landmark/:id" element={<LandmarkPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </NavigationProvider>
    </BrowserRouter>
  )
}

export default App