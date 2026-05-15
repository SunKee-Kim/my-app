import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import client from '../api/client';

export default function OrganizationPage() {
  const [orgs, setOrgs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    const res = await client.get('/api/organizations');
    setOrgs(res.data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ org_name: record.org_name, parent_org_id: record.parent_org_id, sort_order: record.sort_order, use_yn: record.use_yn });
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await client.put(`/api/organizations/${editing.org_id}`, values);
        message.success('수정되었습니다.');
      } else {
        await client.post('/api/organizations', values);
        message.success('등록되었습니다.');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const handleDelete = async (org_id) => {
    try {
      await client.delete(`/api/organizations/${org_id}`);
      message.success('삭제되었습니다.');
      load();
    } catch (e) {
      message.error(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const columns = [
    { title: '조직ID', dataIndex: 'org_id', key: 'org_id' },
    { title: '조직명', dataIndex: 'org_name', key: 'org_name' },
    {
      title: '상위조직',
      dataIndex: 'parent_org_id',
      key: 'parent_org_id',
      render: (v) => orgs.find(o => o.org_id === v)?.org_name || '-',
    },
    { title: '순서', dataIndex: 'sort_order', key: 'sort_order' },
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
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(record.org_id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>조직 관리</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>조직 등록</Button>
      </div>
      <Table rowKey="org_id" dataSource={orgs} columns={columns} />

      <Modal
        title={editing ? '조직 수정' : '조직 등록'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="org_id" label="조직ID" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="org_name" label="조직명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="parent_org_id" label="상위조직">
            <Select allowClear placeholder="상위조직 선택">
              {orgs.filter(o => !editing || o.org_id !== editing.org_id).map(o => (
                <Select.Option key={o.org_id} value={o.org_id}>{o.org_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort_order" label="순서" initialValue={0}>
            <Input type="number" />
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
