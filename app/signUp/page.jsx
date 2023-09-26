"use client";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { uuid } from "uuidv4";
import "../globals.css";
import Image from "next/image";

export default function signUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [firstName, setFirstName] = useState("");
  const [userName, setUserName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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

  const crypto = require("crypto");

  const signup = async () => {
    try {
      const authUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const salt = crypto.randomBytes(16).toString("hex");
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");

      const user_id = authUser.user.uid;
      const docId = uuid();

      const userRef = doc(db, "users", docId);

      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        hashedPassword,
        userName,
        isEmailVerified: false,
        createdAt: serverTimestamp(),
        userId: user_id,
      });

      // await sendEmailVerification(auth.currentUser);

      alert("Account created");

      await new Promise((resolve) => setTimeout(resolve, 6500));

      router.push("signIn");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message, {
        className: "custom-toast-error",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center background">
      <div className="w-full max-w-xl mx-auto flex roundedFirst overflow-hidden">
        {!isMobile ? (
          <div className="w-1/2 p-8 text-center flex flex-col items-center joinRellyBg  justify-center">
            <Image
              src="/assets/relly_wink_pointing_right.png"
              alt="Image"
              width={200}
              height={150}
              className="rellyImg rounded-lg"
            />
            <p className={`text-3xl font-bold mt-4`}>Join Relly</p>
            <p className="text-lg mt-2 font-semibold">
              Your Trusted Relationship Guide
            </p>
          </div>
        ) : null}
  
        <div className={`${isMobile ? 'w-full': 'w-1/2'}  p-8 ${isMobile ? '' : 'formRellyBg'} roundedSecond flex flex-col items-center justify-center`}>
          {isMobile ? (
            <>
              <Image
                src="/assets/relly2.png"
                alt="Image"
                width={200}
                height={150}
                className="rellyImg rounded-lg mx-auto"
              />
              <p className="text-2xl font-extrabold mt-4 text-center">Join Relly</p>
              <p className="text-lg mt-2 font-semibold text-center">
                Your Trusted Relationship Guide
              </p>
              <h2 className="md:hidden sm:block leading-9 font-semibold tracking-tight text-xl text-left">
                Sign Up
              </h2>
            </>
          ) : (
            <>
              <h2 className="text-2xl hidden md:block font-semibold leading-9 tracking-tight mb-6 text-center">
                Get Started
              </h2>
            
            </>
          )}
  
  <div className="space-y-4 w-full">
  <input
    id="firstName"
    name="firstName"
    type="text"
    placeholder="First Name"
    onChange={(e) => setFirstName(e.target.value)}
    required
    className={`block ${isMobile ? 'w-3/4' : 'w-full'} mx-auto border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded sm:text-sm`}
  />
  <input
    id="lastName"
    name="lastName"
    type="text"
    placeholder="Last Name"
    onChange={(e) => setLastName(e.target.value)}
    required
    className={`block ${isMobile ? 'w-3/4' : 'w-full'} mx-auto border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded sm:text-sm`}
  />
  <input
    id="email"
    name="email"
    type="email"
    placeholder="Email address"
    autoComplete="email"
    onChange={(e) => setEmail(e.target.value)}
    required
    className={`block ${isMobile ? 'w-3/4' : 'w-full'} mx-auto border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded sm:text-sm`}
  />
  <input
    id="password"
    name="password"
    type="password"
    placeholder="Password"
    autoComplete="current-password"
    onChange={(e) => setPassword(e.target.value)}
    required
    className={`block ${isMobile ? 'w-3/4' : 'w-full'} mx-auto border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded sm:text-sm`}
  />
  <input
    id="passwordAgain"
    name="passwordAgain"
    type="password"
    placeholder="Password Again"
    autoComplete="current-password"
    onChange={(e) => setPasswordAgain(e.target.value)}
    required
    className={`block ${isMobile ? 'w-3/4' : 'w-full'} mx-auto border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded sm:text-sm`}
  />
  <button
    disabled={
      !email ||
      !password ||
      !passwordAgain ||
      password !== passwordAgain
    }
    onClick={() => signup()}
    className={`max-w-xs mx-auto py-2 px-4 font-semibold ${isMobile ? 'customMobileButton': 'customButton'}`}
  >
    Sign Up
  </button>
</div>

          <p className="mt-4 text-center text-sm font-semibold text-black">
            Already started?{" "}
            <button
              onClick={() => router.push("signIn")}
              className="font-semibold leading-6 text-black underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
  
  
}
