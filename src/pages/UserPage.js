import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import client from '../api/client';
import { useStatusMessage } from '../components/AppLayout';

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { setMessage } = useStatusMessage();

  const load = async () => {
    const [u, o] = await Promise.all([client.get('/api/users'), client.get('/api/organizations')]);
    setUsers(u.data);
    setOrgs(o.data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ user_name: record.user_name, email: record.email, org_id: record.org_id, use_yn: record.use_yn });
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await client.put(`/api/users/${editing.user_id}`, values);
        setMessage('수정되었습니다.');
      } else {
        await client.post('/api/users', values);
        setMessage('등록되었습니다.');
      }
      setOpen(false);
      load();
    } catch (e) {
      setMessage(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const handleDelete = async (user_id) => {
    try {
      await client.delete(`/api/users/${user_id}`);
      setMessage('삭제되었습니다.');
      load();
    } catch (e) {
      setMessage(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const columns = [
    { title: '사용자ID', dataIndex: 'user_id', key: 'user_id' },
    { title: '이름', dataIndex: 'user_name', key: 'user_name' },
    { title: '이메일', dataIndex: 'email', key: 'email' },
    {
      title: '조직',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (v) => orgs.find(o => o.org_id === v)?.org_name || v || '-',
    },
    {
      title: '사용여부',
      dataIndex: 'use_yn',
      key: 'use_yn',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? '사용' : '미사용'}</Tag>,
    },
    {
      title: '관리',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>수정</Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(record.user_id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>사용자 등록</Button>
      </div>
      <Table rowKey="user_id" dataSource={users} columns={columns} />

      <Modal
        title={editing ? '사용자 수정' : '사용자 등록'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <>
              <Form.Item name="user_id" label="사용자ID" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="비밀번호" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item name="user_name" label="이름" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="org_id" label="조직">
            <Select allowClear placeholder="조직 선택">
              {orgs.map(o => <Select.Option key={o.org_id} value={o.org_id}>{o.org_name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="use_yn" label="사용여부" initialValue={true}>
            <Select>
              <Select.Option value={true}>사용</Select.Option>
              <Select.Option value={false}>미사용</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
