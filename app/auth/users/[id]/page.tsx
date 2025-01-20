'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios'; // Your custom Axios instance
import { AxiosError, isAxiosError } from 'axios'; // Import directly from 'axios'
import useAuthStore from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import useProtected from '@/hooks/useProtected';

interface User {
  id: number;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

const EditUserPage = () => {
  useProtected('ADMIN');

  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(res.data);
          setEmail(res.data.email);
          setName(res.data.name || '');
          setRole(res.data.role);
        } catch (error: unknown) {
          // Use 'unknown' for better type safety
          console.error('Error fetching user:', error);
          if (isAxiosError(error)) {
            // Use the imported 'isAxiosError'
            const axiosError = error as AxiosError<{ message: string }>;
            setMessage(
              axiosError.response?.data?.message || 'Failed to fetch user'
            );
          } else {
            setMessage('An unexpected error occurred');
          }
        }
      };
      fetchUser();
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await axios.put(
        `/api/users/${id}`,
        { email, password, name, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('User updated successfully');
      router.push('/auth/users');
    } catch (error: unknown) {
      // Use 'unknown' for better type safety
      console.error('Error updating user:', error);
      if (isAxiosError(error)) {
        // Use the imported 'isAxiosError'
        const axiosError = error as AxiosError<{ message: string }>;
        setMessage(
          axiosError.response?.data?.message || 'Failed to update user'
        );
      } else {
        setMessage('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div>Loading user...</div>;

  return (
    <div>
      <h1>Edit User</h1>
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
          Password (leave blank to keep unchanged):
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'Updating...' : 'Update User'}
        </button>
      </form>
    </div>
  );
};

export default EditUserPage;
