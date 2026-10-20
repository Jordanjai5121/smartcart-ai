
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import Compare from './pages/Compare';
import History from './pages/History';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import SettingsPage from './pages/SettingsPage';
import AuthGate from './AuthGate';

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="compare" element={<Compare />} />
          <Route path="history" element={<History />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="cart" element={<Cart />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthGate>
  );
}
