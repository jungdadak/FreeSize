'use client';

import Link from 'next/link';
export default function DashBoard() {
  return (
    <>
      <div>sadklgjlsadfkjlsdakjfldaskj</div>
      <Link href={'/auth/users'} className="text-4xl text-white">
        users
      </Link>
      <Link href={'/auth/users/create'} className="text-4xl text-white">
        create users
      </Link>
    </>
  );
}
