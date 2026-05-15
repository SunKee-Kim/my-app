import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import RequireAuth from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/users" element={<UserPage />} />
            <Route path="/organizations" element={<OrganizationPage />} />
            <Route path="/common-codes" element={<CommonCodePage />} />
            <Route path="/menus" element={<MenuPage />} />
            <Route path="/screen-buttons" element={<ScreenButtonPage />} />
            <Route path="/menu-permissions" element={<MenuPermissionPage />} />
            <Route path="/button-permissions" element={<ButtonPermissionPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
