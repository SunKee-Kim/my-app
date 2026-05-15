import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import UserPage from './pages/UserPage';
import OrganizationPage from './pages/OrganizationPage';
import CommonCodePage from './pages/CommonCodePage';
import MenuPage from './pages/MenuPage';
import ScreenButtonPage from './pages/ScreenButtonPage';
import MenuPermissionPage from './pages/MenuPermissionPage';
import ButtonPermissionPage from './pages/ButtonPermissionPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UserPage />} />
          <Route path="/organizations" element={<OrganizationPage />} />
          <Route path="/common-codes" element={<CommonCodePage />} />
          <Route path="/menus" element={<MenuPage />} />
          <Route path="/screen-buttons" element={<ScreenButtonPage />} />
          <Route path="/menu-permissions" element={<MenuPermissionPage />} />
          <Route path="/button-permissions" element={<ButtonPermissionPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
