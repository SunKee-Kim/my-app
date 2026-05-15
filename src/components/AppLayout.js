import { createContext, useContext, useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  ApartmentOutlined,
  CodeOutlined,
  MenuOutlined,
  AppstoreOutlined,
  KeyOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getSession, clearSession } from '../utils/auth';

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  { key: '/users', icon: <UserOutlined />, label: '사용자 관리' },
  { key: '/organizations', icon: <ApartmentOutlined />, label: '조직 관리' },
  { key: '/common-codes', icon: <CodeOutlined />, label: '공통코드 관리' },
  { key: '/menus', icon: <MenuOutlined />, label: '메뉴명 관리' },
  { key: '/screen-buttons', icon: <AppstoreOutlined />, label: '화면별 버튼 관리' },
  { key: '/menu-permissions', icon: <KeyOutlined />, label: '사용자 메뉴권한' },
  { key: '/button-permissions', icon: <LockOutlined />, label: '사용자 버튼권한' },
];

const StatusMessageContext = createContext({ message: '', setMessage: () => {} });

export const useStatusMessage = () => useContext(StatusMessageContext);

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const currentScreen = menuItems.find(m => m.key === location.pathname)?.label || '';
  const session = getSession();

  const onLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <StatusMessageContext.Provider value={{ message, setMessage }}>
      <Layout style={{ minWidth: 1920, minHeight: 1080 }}>
        <Sider width={220} theme="dark">
          <div style={{ color: '#fff', padding: '16px', fontWeight: 'bold', fontSize: 16 }}>
            시스템 관리
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: 16 }}>{currentScreen}</span>
            <Button icon={<LogoutOutlined />} onClick={onLogout}>로그아웃</Button>
          </Header>
          <Content style={{ margin: 24, background: '#fff', padding: 24, minHeight: 360 }}>
            <Outlet />
          </Content>
          <Footer
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 24px',
              background: '#fafafa',
              borderTop: '1px solid #e8e8e8',
              fontSize: 13,
              color: '#555',
            }}
          >
            <span>{message}</span>
            <span>
              <span style={{ marginRight: 24 }}>로그인 ID: {session?.user_id || '-'}</span>
              <span>사용자명: {session?.user_name || '-'}</span>
            </span>
          </Footer>
        </Layout>
      </Layout>
    </StatusMessageContext.Provider>
  );
}
