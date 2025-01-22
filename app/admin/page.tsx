import { DummyCharts } from '@/components/auth/admin/Charts';
import MaintenanceControl from '@/components/auth/admin/MaintenanceControl';

export default function AdminPage() {
  return (
    <>
      {' '}
      <DummyCharts /> <h1 className="text-3xl font-bold">관리자 대시보드</h1>
      <MaintenanceControl />;
    </>
  );
}
