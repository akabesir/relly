'use client';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import { auth, db } from '../firebase';
import Image from 'next/image';


export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size === 0) {
        // Korisnik s ovom email adresom ne postoji u Firestore-u
        throw new Error('User not found.');
      }

      // Pretpostavka da postoji samo jedan korisnik s ovim emailom
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // if (!userData.isEmailVerified) {
      //   throw new Error('Email is not verified.');
      // } else {
      
        await signInWithEmailAndPassword(auth, email, password);
      

      toast.success('You are signed in.', {
        position: 'top-right',
        autoClose: 3000,
      });
      router.push('chat');
    } catch (error) {
      toast.error(error.message);
    }
  };
  


  
  return (
<div className={`flex min-h-screen items-center justify-center background text-black`}>
      <div className="w-full max-w-xl mx-auto flex roundedFirst overflow-hidden">
        {!isMobile ? (
          <div className={`w-1/2 p-8 text-center flex flex-col items-center joinRellyBg justify-center  ${isMobile ? '' : 'signInHeight'}`}>
            <Image
              src="/assets/relly_wink_pointing_right.png"
              alt="Image"
              width={250}
              height={200}
              className="rellyImg rounded-lg"
            />
            <p className="text-2xl mt-2 font-semibold">
              Hey You Are Back!
            </p>
          </div>
        ) : null}

        <div
          className={`${isMobile ? "w-full" : "w-1/2"} ${
            isMobile ? "" : "formRellyBg"
          } p-8  roundedSecond flex flex-col items-center justify-center`}
        >
          {isMobile ? (
            <>
              <Image
                src="/assets/relly2.png"
                alt="Image"
                width={200}
                height={150}
                className="rellyImg rounded-lg mx-auto"
              />
             
              <p className="text-3xl mt-1 font-semibold text-center">
                Hey You Are Back!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl hidden md:block font-semibold leading-9 tracking-tight mb-2 text-center">
                Sign In
              </h2>



            </>
          )}

          <div className="flex flex-col justify-between items-center gap-4 w-full mt-2">
            <div className="w-3/4">
              <h2 className="block leading-9 font-semibold tracking-tight text-2xl md:hidden">
                Sign In
              </h2>
            </div>
            
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`block ${
                isMobile ? "w-3/4" : "w-full"
              }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
            />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`block ${
                isMobile ? "w-3/4" : "w-full"
              }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
            />
            
            <button
             
              onClick={() => handleSignIn()}
              className={`max-w-xs mx-auto py-2 px-4 font-medium ${
                isMobile ? "customMobileButton" : "customButton"
              }`}
            >
              Sign In
            </button>
          </div>

          <p className="mt-6 text-center text-md font-semibold text-black md:text-sm">
            Havent started?{" "}
            <button
              onClick={() => router.push("signUp")}
              className="font-semibold leading-6 text-black underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}






