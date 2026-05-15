import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import client from '../api/client';

export default function ScreenButtonPage() {
  const [buttons, setButtons] = useState([]);
  const [menus, setMenus] = useState([]);
  const [filterMenu, setFilterMenu] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async (menuId) => {
    const params = menuId ? { params: { menu_id: menuId } } : {};
    const [b, m] = await Promise.all([client.get('/api/screen-buttons', params), client.get('/api/menus')]);
    setButtons(b.data);
    setMenus(m.data);
  };

  useEffect(() => { load(filterMenu); }, [filterMenu]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await client.put(`/api/screen-buttons/${editing.button_id}`, values);
      } else {
        await client.post('/api/screen-buttons', values);
      }
      message.success('저장되었습니다.');
      setOpen(false);
      load(filterMenu);
    } catch (e) {
      message.error(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const columns = [
    { title: '버튼ID', dataIndex: 'button_id', key: 'button_id' },
    {
      title: '화면(메뉴)',
      dataIndex: 'menu_id',
      key: 'menu_id',
      render: (v) => menus.find(m => m.menu_id === v)?.menu_name || v,
    },
    { title: '버튼명', dataIndex: 'button_name', key: 'button_name' },
    { title: '버튼코드', dataIndex: 'button_code', key: 'button_code' },
    { title: '순서', dataIndex: 'sort_order', key: 'sort_order' },
    {
      title: '사용',
      dataIndex: 'use_yn',
      key: 'use_yn',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Y' : 'N'}</Tag>,
    },
    {
      title: '관리',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setOpen(true); }}>수정</Button>
          <Popconfirm title="삭제?" onConfirm={async () => { await client.delete(`/api/screen-buttons/${record.button_id}`); load(filterMenu); }}>
            <Button size="small" danger icon={<DeleteOutlined />}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <h2 style={{ margin: 0 }}>화면별 버튼 관리</h2>
          <Select
            allowClear
            placeholder="화면(메뉴) 필터"
            style={{ width: 200 }}
            onChange={setFilterMenu}
          >
            {menus.map(m => <Select.Option key={m.menu_id} value={m.menu_id}>{m.menu_name}</Select.Option>)}
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>버튼 등록</Button>
      </div>
      <Table rowKey="button_id" dataSource={buttons} columns={columns} />

      <Modal title={editing ? '버튼 수정' : '버튼 등록'} open={open} onOk={handleOk} onCancel={() => setOpen(false)} okText="저장" cancelText="취소">
        <Form form={form} layout="vertical">
          {!editing && <Form.Item name="button_id" label="버튼ID" rules={[{ required: true }]}><Input /></Form.Item>}
          <Form.Item name="menu_id" label="화면(메뉴)" rules={[{ required: true }]}>
            <Select>
              {menus.map(m => <Select.Option key={m.menu_id} value={m.menu_id}>{m.menu_name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="button_name" label="버튼명" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="button_code" label="버튼코드" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort_order" label="순서" initialValue={0}><Input type="number" /></Form.Item>
          <Form.Item name="use_yn" label="사용여부" initialValue={true}>
            <Select><Select.Option value={true}>사용</Select.Option><Select.Option value={false}>미사용</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
