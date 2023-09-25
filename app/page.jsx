'use client';
import { useRouter } from 'next/navigation';
import Welcome from './components/welcome';


export default function Home() {
  const router = useRouter()

  // const handleSignOut = async () => {
  //   try {
  //     await auth.signOut();

  //     router.push('/signIn');
  //   } catch (error) {
  //     console.error('Greška prilikom odjave korisnika:', error);
  //   }
  // };

  return (
    <div>
      <Welcome></Welcome>
    </div>
  )
}
