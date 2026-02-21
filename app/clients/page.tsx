import { redirect } from 'next/navigation';

// /clients with no token — redirect to home
export default function ClientsIndex() {
  redirect('/');
}
