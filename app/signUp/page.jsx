"use client";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { serverTimestamp, doc, setDoc, updateDoc } from "firebase/firestore";
import { uuid } from "uuidv4";
import "../globals.css";
import Image from "next/image";
import * as Yup from "yup";
import { useFormik } from "formik";
import RegisterForm from "../components/registerForm";
export default function SignUp() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [docId, setDocId] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password too short")
      .required("Password is required"),
    passwordAgain: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Field required"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordAgain: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsModalOpen(true);
        // Stvaranje korisničkog računa
        const authUser = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const user_id = authUser.user.uid;
        const newDocId = uuid(); // Generiranje novog UUID-a
        setDocId(newDocId); // Postavljanje novog docId-a u stanje

        const salt = crypto.randomBytes(16).toString("hex");
        const hashedPassword = crypto
          .pbkdf2Sync(values.password, salt, 1000, 64, "sha512")
          .toString("hex");

        const userRef = doc(db, "users", newDocId);

        await setDoc(userRef, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          hashedPassword,
          userName: userName,
          createdAt: serverTimestamp(),
          userId: user_id,
          isEmailVerified: false,
        });

        // Slanje e-mail verifikacije
        await sendEmailVerification(authUser.user);

        // Petlja za čekanje verifikacije e-maila
        while (!authUser.user.emailVerified) {
          await authUser.user.reload();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Ažuriranje dokumenta nakon verifikacije
        await updateDoc(userRef, { isEmailVerified: true });
      } catch (error) {
        const errorMessage =
          (error.code === "auth/email-already-in-use" &&
            "Email address already in use") ||
          error.message ||
          "An unknown error occurred";

        alert(errorMessage);
      }
    },
  });

  const addNickname = async () => {
    if (docId) {
      const userRef = doc(db, "users", docId);

      await updateDoc(userRef, {
        userName: userName,
      });

      setIsModalOpen(false);
      setRegistrationSuccess(true);
    } else {
      alert("Please Verify Your Email To Contiue Creation Process");
    }
  };

  return (
    <>
      <RegisterForm
        isMobile={isMobile}
        formik={formik}
        registrationSuccess={registrationSuccess}
        isModalOpen={isModalOpen}
        userName={userName}
        setUserName={setUserName}
        addNickname={addNickname}
      ></RegisterForm>
    </>
  );
}
