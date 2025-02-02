'use client';
import { DummyCharts } from '@/components/auth/admin/Charts';
import MaintenanceControl from '@/components/auth/admin/MaintenanceControl';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session } = useSession();
  const name = session?.user.name;
  return (
    <div className="container mt-20">
      <h1 className="text-3xl font-bold">관리자 대시보드</h1>
      <p className="m-2 p-3">관리자 : {name}</p>
      <DummyCharts />
      <MaintenanceControl />;
    </div>
  );
}
