import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import client from '../api/client';
import { useStatusMessage } from '../components/AppLayout';

export default function MenuPage() {
  const [menus, setMenus] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { setMessage } = useStatusMessage();

  const load = async () => {
    const res = await client.get('/api/menus');
    setMenus(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await client.put(`/api/menus/${editing.menu_id}`, values);
      } else {
        await client.post('/api/menus', values);
      }
      setMessage('저장되었습니다.');
      setOpen(false);
      load();
    } catch (e) {
      setMessage(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const columns = [
    { title: '메뉴ID', dataIndex: 'menu_id', key: 'menu_id' },
    { title: '메뉴명', dataIndex: 'menu_name', key: 'menu_name' },
    {
      title: '상위메뉴',
      dataIndex: 'parent_menu_id',
      key: 'parent_menu_id',
      render: (v) => menus.find(m => m.menu_id === v)?.menu_name || '-',
    },
    { title: 'URL', dataIndex: 'url', key: 'url', render: (v) => v || '-' },
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
          <Popconfirm title="삭제?" onConfirm={async () => { await client.delete(`/api/menus/${record.menu_id}`); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>메뉴 등록</Button>
      </div>
      <Table rowKey="menu_id" dataSource={menus} columns={columns} />

      <Modal title={editing ? '메뉴 수정' : '메뉴 등록'} open={open} onOk={handleOk} onCancel={() => setOpen(false)} okText="저장" cancelText="취소">
        <Form form={form} layout="vertical">
          {!editing && <Form.Item name="menu_id" label="메뉴ID" rules={[{ required: true }]}><Input /></Form.Item>}
          <Form.Item name="menu_name" label="메뉴명" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="parent_menu_id" label="상위메뉴">
            <Select allowClear placeholder="상위메뉴 선택">
              {menus.filter(m => !editing || m.menu_id !== editing.menu_id).map(m => (
                <Select.Option key={m.menu_id} value={m.menu_id}>{m.menu_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="url" label="URL"><Input /></Form.Item>
          <Form.Item name="icon" label="아이콘"><Input /></Form.Item>
          <Form.Item name="sort_order" label="순서" initialValue={0}><Input type="number" /></Form.Item>
          <Form.Item name="use_yn" label="사용여부" initialValue={true}>
            <Select><Select.Option value={true}>사용</Select.Option><Select.Option value={false}>미사용</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
