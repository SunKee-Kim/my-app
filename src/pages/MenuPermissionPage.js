import { useEffect, useState } from 'react';
import { Select, Table, Button, Checkbox } from 'antd';
import client from '../api/client';
import { useStatusMessage } from '../components/AppLayout';

export default function MenuPermissionPage() {
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const { setMessage } = useStatusMessage();

  const loadBase = async () => {
    const [u, m] = await Promise.all([client.get('/api/users'), client.get('/api/menus')]);
    setUsers(u.data);
    setMenus(m.data);
  };

  useEffect(() => { loadBase(); }, []);

  const loadPermissions = async (userId) => {
    const res = await client.get(`/api/permissions/menu/${userId}`);
    const map = {};
    res.data.forEach(p => { map[p.menu_id] = p; });
    setPermissions(map);
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    if (userId) loadPermissions(userId);
    else setPermissions({});
  };

  const togglePerm = (menuId, field) => {
    setPermissions(prev => ({
      ...prev,
      [menuId]: {
        ...(prev[menuId] || { menu_id: menuId, can_read: false, can_write: false, can_update: false, can_delete: false }),
        [field]: !(prev[menuId]?.[field]),
      },
    }));
  };

  const handleSave = async () => {
    const items = menus.map(m => ({
      menu_id: m.menu_id,
      can_read: permissions[m.menu_id]?.can_read || false,
      can_write: permissions[m.menu_id]?.can_write || false,
      can_update: permissions[m.menu_id]?.can_update || false,
      can_delete: permissions[m.menu_id]?.can_delete || false,
    }));
    try {
      await client.put(`/api/permissions/menu/${selectedUser}`, items);
      setMessage('저장되었습니다.');
    } catch (e) {
      setMessage('저장 실패');
    }
  };

  const columns = [
    { title: '메뉴명', dataIndex: 'menu_name', key: 'menu_name' },
    ...['can_read', 'can_write', 'can_update', 'can_delete'].map(field => ({
      title: { can_read: '조회', can_write: '등록', can_update: '수정', can_delete: '삭제' }[field],
      key: field,
      render: (_, record) => (
        <Checkbox
          checked={permissions[record.menu_id]?.[field] || false}
          onChange={() => togglePerm(record.menu_id, field)}
          disabled={!selectedUser}
        />
      ),
    })),
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select
          placeholder="사용자 선택"
          style={{ width: 220 }}
          onChange={handleUserChange}
          allowClear
        >
          {users.map(u => <Select.Option key={u.user_id} value={u.user_id}>{u.user_name} ({u.user_id})</Select.Option>)}
        </Select>
        <Button type="primary" disabled={!selectedUser} onClick={handleSave}>저장</Button>
      </div>
      <Table rowKey="menu_id" dataSource={menus} columns={columns} />
    </>
  );
}
