'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios'; // Your custom Axios instance
import { AxiosError, isAxiosError } from 'axios'; // Import directly from 'axios'
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import useProtected from '@/hooks/useProtected';

interface User {
  id: number;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

const UsersPage = () => {
  useProtected('ADMIN');

  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
        setLoading(false);
      } catch (error: unknown) {
        // Changed from 'AxiosError' to 'unknown'
        console.error('Error fetching users:', error);
        if (isAxiosError(error)) {
          // Use the imported 'isAxiosError'
          const axiosError = error as AxiosError<{ message: string }>;
          setError(
            axiosError.response?.data?.message || 'Failed to load users'
          );
        } else {
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error: unknown) {
      // Changed from 'AxiosError' to 'unknown'
      console.error('Error deleting user:', error);
      if (isAxiosError(error)) {
        // Use the imported 'isAxiosError'
        const axiosError = error as AxiosError<{ message: string }>;
        alert(axiosError.response?.data?.message || 'Failed to delete user');
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>User List</h1>
      <button onClick={() => router.push('/auth/users/create')}>
        Create User
      </button>
      <button
        onClick={() => {
          logout();
          router.push('/auth/login');
        }}
      >
        Logout
      </button>
      <ul>
        {users.map((userItem) => (
          <li key={userItem.id}>
            {userItem.email} - {userItem.role}
            <button onClick={() => router.push(`/auth/users/${userItem.id}`)}>
              Edit
            </button>
            <button onClick={() => handleDelete(userItem.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
