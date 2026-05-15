import { useState } from 'react';
import { Card, Form, Input, Button, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/api/auth/login', values);
      localStorage.setItem('session', JSON.stringify(res.data));
      navigate('/users');
    } catch (e) {
      setError(e.response?.data?.detail || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card title="시스템 로그인" style={{ width: 380 }}>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="user_id" label="사용자 ID" rules={[{ required: true, message: '사용자 ID를 입력하세요.' }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            로그인
          </Button>
        </Form>
      </Card>
    </div>
  );
}
