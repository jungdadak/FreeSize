'use client';
import { useSession } from 'next-auth/react';
export default function ProfilePage() {
  const { data: session } = useSession();
  const name = session?.user.name;
  return (
    <div className="mt-20 p-3">
      <h1> {name}님 </h1>
      <p>프로필 페이지는 준비중 입니다</p>
    </div>
  );
}
