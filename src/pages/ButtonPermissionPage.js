import { useEffect, useState } from 'react';
import { Select, Table, Button, Checkbox, Tag } from 'antd';
import client from '../api/client';
import { useStatusMessage } from '../components/AppLayout';

export default function ButtonPermissionPage() {
  const [users, setUsers] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const { setMessage } = useStatusMessage();

  const loadBase = async () => {
    const [u, b, m] = await Promise.all([
      client.get('/api/users'),
      client.get('/api/screen-buttons'),
      client.get('/api/menus'),
    ]);
    setUsers(u.data);
    setButtons(b.data);
    setMenus(m.data);
  };

  useEffect(() => { loadBase(); }, []);

  const loadPermissions = async (userId) => {
    const res = await client.get(`/api/permissions/button/${userId}`);
    const map = {};
    res.data.forEach(p => { map[p.button_id] = p.granted; });
    setPermissions(map);
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    if (userId) loadPermissions(userId);
    else setPermissions({});
  };

  const toggle = (buttonId) => {
    setPermissions(prev => ({ ...prev, [buttonId]: !prev[buttonId] }));
  };

  const handleSave = async () => {
    const items = buttons.map(b => ({ button_id: b.button_id, granted: permissions[b.button_id] || false }));
    try {
      await client.put(`/api/permissions/button/${selectedUser}`, items);
      setMessage('저장되었습니다.');
    } catch (e) {
      setMessage('저장 실패');
    }
  };

  const columns = [
    {
      title: '화면(메뉴)',
      dataIndex: 'menu_id',
      key: 'menu_id',
      render: (v) => menus.find(m => m.menu_id === v)?.menu_name || v,
    },
    { title: '버튼명', dataIndex: 'button_name', key: 'button_name' },
    { title: '버튼코드', dataIndex: 'button_code', key: 'button_code' },
    {
      title: '권한',
      key: 'granted',
      render: (_, record) => (
        <Checkbox
          checked={permissions[record.button_id] || false}
          onChange={() => toggle(record.button_id)}
          disabled={!selectedUser}
        />
      ),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => (
        <Tag color={permissions[record.button_id] ? 'green' : 'default'}>
          {permissions[record.button_id] ? '허용' : '미허용'}
        </Tag>
      ),
    },
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
      <Table rowKey="button_id" dataSource={buttons} columns={columns} />
    </>
  );
}
