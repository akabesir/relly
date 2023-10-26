"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { auth, db } from "../firebase";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import { signInSchema } from "../schema.js";

export default function Signin() {
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

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: signInSchema,
    onSubmit: async (values) => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", values.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.size === 0) {
          throw new Error("User not found.");
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        const isEmailVerified = userData.isEmailVerified;

        if (!isEmailVerified) {
          alert("Email address is not verified. Please verify your email.");
        } else {
          // Ako je e-mail verificiran, izvrši prijavu i preusmjeri korisnika
          await signInWithEmailAndPassword(auth, values.email, values.password);
          router.push("chat");
        }
      } catch (error) {
        let errorMessage;

        if (error.code === "auth/wrong-password") {
          errorMessage = "Incorrect password";
        }

        alert(errorMessage || error.message);
      }
    },
  });

  const { handleSubmit, getFieldProps, touched, errors } = formik;

  return (
    <div className={`flex min-h-screen items-center justify-center background text-black`}>
      <div className="w-full max-w-xl mx-auto flex roundedFirst overflow-hidden">
        {!isMobile ? (
          <div className={`w-1/2 p-8 text-center flex flex-col items-center joinRellyBg justify-center ${isMobile ? "" : "signInHeight"}`}>
            <Image src="/assets/relly_wink_pointing_right.png" alt="Image" width={250} height={200} className="rellyImg rounded-lg animated-logo" />
            <p className="text-2xl mt-2 font-semibold animated-welcome-button">Hey You Are Back!</p>
          </div>
        ) : null}
  
        <div className={`${isMobile ? "w-full" : "w-1/2"} ${isMobile ? "" : "formRellyBg"} p-8 roundedSecond flex flex-col items-center justify-center`}>
          {isMobile ? (
            <>
              <Image src="/assets/relly2.png" alt="Image" width={200} height={150} className="rellyImg rounded-lg mx-auto animated-main-image" />
              <p className="text-3xl mt-1 font-semibold text-center animated-main-title">Hey You Are Back!</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl hidden md:block font-semibold leading-9 tracking-tight mb-2 text-center animated-logo-text">Sign In</h2>
            </>
          )}
  
          <div className="flex flex-col justify-between items-center gap-4 w-full mt-2">
            <div className="w-3/4">
              <h2 className="block leading-9 font-semibold tracking-tight ml-2 text-xl md:hidden animated-signIn-text">Sign In</h2>
            </div>
  
            <input
              type="email"
              id="email"
              {...getFieldProps("email")}
              placeholder="Email Adress"
              className={`block ${isMobile ? "w-3/4" : "w-full"}  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
            />
            {touched.email && errors.email && (
              <div className="text-center">{errors.email}</div>
            )}
  
            <input
              type="password"
              id="password"
              {...getFieldProps("password")}
              placeholder="Password"
              className={`block ${isMobile ? "w-3/4" : "w-full"}  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
            />
            {touched.password && errors.password && (
              <div className="text-center">{errors.password}</div>
            )}
  
            <button
              onClick={handleSubmit}
              className={`max-w-xs mx-auto py-2 px-4 font-medium ${isMobile ? "customMobileButton" : "customButton"} `}
            >
              Sign In
            </button>
          </div>
  
          <div className="animated-learn-more">
          <p className="mt-6 text-center text-md font-semibold text-black md:text-sm ">
            Have Not Started?{" "}
            <button
              onClick={() => router.push("signUp")}
              className="font-semibold leading-6 text-black underline "
            >
              Sign Up
            </button>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}