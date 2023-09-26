'use client';
import { useRouter } from 'next/navigation';
import Welcome from './components/welcome';
import SignUp from './signUp/page';

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
      <SignUp></SignUp>
    </div>
  )
}
