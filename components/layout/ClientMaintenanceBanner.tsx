// components/Layout/ClientMaintenanceBanner.tsx
'use client';

import dynamic from 'next/dynamic';

const MaintenanceBanner = dynamic(() => import('../MaintenanceBanner'), {
  ssr: false,
});

export default function ClientMaintenanceBanner() {
  return <MaintenanceBanner />;
}
