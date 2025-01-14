import Link from 'next/link';
import { LogIn } from 'lucide-react';
export default function SignInButton() {
  return (
    <Link
      href="/auth/login"
      className="
    border px-2 py-1 rounded-md hover:border-dotted hover:text-black hover:bg-white flex gap-3"
    >
      <LogIn /> <span>login</span>
    </Link>
  );
}
