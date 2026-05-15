import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  ApartmentOutlined,
  CodeOutlined,
  MenuOutlined,
  AppstoreOutlined,
  KeyOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/users', icon: <UserOutlined />, label: '사용자 관리' },
  { key: '/organizations', icon: <ApartmentOutlined />, label: '조직 관리' },
  { key: '/common-codes', icon: <CodeOutlined />, label: '공통코드 관리' },
  { key: '/menus', icon: <MenuOutlined />, label: '메뉴명 관리' },
  { key: '/screen-buttons', icon: <AppstoreOutlined />, label: '화면별 버튼 관리' },
  { key: '/menu-permissions', icon: <KeyOutlined />, label: '사용자 메뉴권한' },
  { key: '/button-permissions', icon: <LockOutlined />, label: '사용자 버튼권한' },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontWeight: 'bold', fontSize: 16 }}>시스템 공통 관리</span>
        </Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24, minHeight: 360 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
