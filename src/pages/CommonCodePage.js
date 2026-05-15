import { useEffect, useState } from 'react';
import { Row, Col, Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import client from '../api/client';
import { useStatusMessage } from '../components/AppLayout';

export default function CommonCodePage() {
  const [groups, setGroups] = useState([]);
  const [codes, setCodes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [groupForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const { setMessage } = useStatusMessage();

  const loadGroups = async () => {
    const res = await client.get('/api/common-codes/groups');
    setGroups(res.data);
  };

  const loadCodes = async (groupCode) => {
    const res = await client.get(`/api/common-codes/groups/${groupCode}/codes`);
    setCodes(res.data);
  };

  useEffect(() => { loadGroups(); }, []);

  const selectGroup = (record) => {
    setSelectedGroup(record);
    loadCodes(record.group_code);
  };

  const handleGroupOk = async () => {
    const values = await groupForm.validateFields();
    try {
      if (editingGroup) {
        await client.put(`/api/common-codes/groups/${editingGroup.group_code}`, values);
      } else {
        await client.post('/api/common-codes/groups', values);
      }
      setMessage('저장되었습니다.');
      setGroupOpen(false);
      loadGroups();
    } catch (e) {
      setMessage(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const handleCodeOk = async () => {
    const values = await codeForm.validateFields();
    try {
      if (editingCode) {
        await client.put(`/api/common-codes/groups/${selectedGroup.group_code}/codes/${editingCode.code}`, values);
      } else {
        await client.post(`/api/common-codes/groups/${selectedGroup.group_code}/codes`, values);
      }
      setMessage('저장되었습니다.');
      setCodeOpen(false);
      loadCodes(selectedGroup.group_code);
    } catch (e) {
      setMessage(e.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const groupColumns = [
    { title: '그룹코드', dataIndex: 'group_code', key: 'group_code' },
    { title: '그룹명', dataIndex: 'group_name', key: 'group_name' },
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
          <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setEditingGroup(record); groupForm.setFieldsValue(record); setGroupOpen(true); }}>수정</Button>
          <Popconfirm title="삭제?" onConfirm={async (e) => { e.stopPropagation(); await client.delete(`/api/common-codes/groups/${record.group_code}`); loadGroups(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const codeColumns = [
    { title: '코드', dataIndex: 'code', key: 'code' },
    { title: '코드명', dataIndex: 'code_name', key: 'code_name' },
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
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingCode(record); codeForm.setFieldsValue(record); setCodeOpen(true); }}>수정</Button>
          <Popconfirm title="삭제?" onConfirm={async () => { await client.delete(`/api/common-codes/groups/${selectedGroup.group_code}/codes/${record.code}`); loadCodes(selectedGroup.group_code); }}>
            <Button size="small" danger icon={<DeleteOutlined />}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col span={10}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <strong>코드 그룹</strong>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingGroup(null); groupForm.resetFields(); setGroupOpen(true); }}>그룹 등록</Button>
          </div>
          <Table
            rowKey="group_code"
            dataSource={groups}
            columns={groupColumns}
            size="small"
            rowClassName={(r) => r.group_code === selectedGroup?.group_code ? 'ant-table-row-selected' : ''}
            onRow={(record) => ({ onClick: () => selectGroup(record), style: { cursor: 'pointer' } })}
          />
        </Col>
        <Col span={14}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <strong>{selectedGroup ? `상세 코드 — ${selectedGroup.group_name}` : '그룹을 선택하세요'}</strong>
            {selectedGroup && (
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCode(null); codeForm.resetFields(); setCodeOpen(true); }}>코드 등록</Button>
            )}
          </div>
          <Table rowKey="code" dataSource={codes} columns={codeColumns} size="small" />
        </Col>
      </Row>

      <Modal title={editingGroup ? '그룹 수정' : '그룹 등록'} open={groupOpen} onOk={handleGroupOk} onCancel={() => setGroupOpen(false)} okText="저장" cancelText="취소">
        <Form form={groupForm} layout="vertical">
          {!editingGroup && <Form.Item name="group_code" label="그룹코드" rules={[{ required: true }]}><Input /></Form.Item>}
          <Form.Item name="group_name" label="그룹명" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="설명"><Input /></Form.Item>
          <Form.Item name="use_yn" label="사용여부" initialValue={true}>
            <Select><Select.Option value={true}>사용</Select.Option><Select.Option value={false}>미사용</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={editingCode ? '코드 수정' : '코드 등록'} open={codeOpen} onOk={handleCodeOk} onCancel={() => setCodeOpen(false)} okText="저장" cancelText="취소">
        <Form form={codeForm} layout="vertical">
          {!editingCode && <Form.Item name="code" label="코드" rules={[{ required: true }]}><Input /></Form.Item>}
          <Form.Item name="code_name" label="코드명" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort_order" label="순서" initialValue={0}><Input type="number" /></Form.Item>
          <Form.Item name="use_yn" label="사용여부" initialValue={true}>
            <Select><Select.Option value={true}>사용</Select.Option><Select.Option value={false}>미사용</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
