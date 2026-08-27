"use client"

import { useAuth } from '../providers/auth-provider';

export default function Home() {
  const { user } = useAuth();
  return (
    <div>Hallo {user ? user.username : 'Guest'}</div>
  );
}
