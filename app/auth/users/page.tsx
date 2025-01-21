// components/UsersPage.tsx

'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios'; // Your custom Axios instance
import { AxiosError, isAxiosError } from 'axios';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import useProtected from '@/hooks/useProtected';
import { Prisma } from '@prisma/client';

type UserList = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    role: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

const UsersPage = () => {
  useProtected('ADMIN');

  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
        setLoading(false);
      } catch (error: unknown) {
        console.error('Error fetching users:', error);
        if (isAxiosError(error)) {
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
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      if (isAxiosError(error)) {
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
