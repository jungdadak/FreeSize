// components/CreateUserPage.tsx

'use client';

import { useState } from 'react';
import axios from '@/lib/axios'; // Your custom Axios instance
import { AxiosError, isAxiosError } from 'axios'; // Import directly from 'axios'
import { useRouter } from 'next/navigation';
import useProtected from '@/hooks/useProtected';

const CreateUserPage = () => {
  useProtected('ADMIN');

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await axios.post('/api/users', { email, password, name, role });
      setMessage('User created successfully');
      router.push('/users');
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        setMessage(
          axiosError.response?.data?.message || 'Failed to create user'
        );
      } else {
        setMessage('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create User</h1>
      {message && (
        <p style={{ color: message.includes('success') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Role:
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUserPage;
