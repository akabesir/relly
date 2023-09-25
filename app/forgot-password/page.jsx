"use client";
import { useState } from "react";
import { auth, db,  } from "../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import "../globals.css";
import { doc, updateDoc, query, where, getDocs, collection } from "firebase/firestore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const crypto = require("crypto");
  const router = useRouter();

  

  const resetEmail = async () => {
    try {
      // Pronađite korisnika u Firestore bazi podataka na temelju email adrese
      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);

      if (emailSnapshot.empty) {
        toast.error("User not found.", {
          className: "custom-toast-error",
        });
        return;
      }

      // Dohvatite ID pronađenog korisnika
      const userId = emailSnapshot.docs[0].id;

      // Provjerite stari password
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Ako je stara lozinka ispravna, ažurirajte je na novu lozinku
      await updatePassword(user, newPassword);

      // Ažurirajte hashedPassword u bazi podataka
      const salt = crypto.randomBytes(16).toString("hex");
      const hashedPassword = crypto
        .pbkdf2Sync(newPassword, salt, 1000, 64, "sha512")
        .toString("hex");

      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        hashedPassword: hashedPassword,
      });

      toast.success("Password updated successfully.", {
        className: "custom-toast-success",
      });

      await new Promise((resolve) => setTimeout(resolve, 6500));
      router.push("signIn");
    } catch (error) {
      toast.error(error.message, {
        className: "custom-toast-error",
      });
    }
  };




  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
         
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Forgot Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-white"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium leading-6 text-white"
              >
                Old Password
              </label>
              <div className="mt-2">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  autoComplete="current-password"
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium leading-6 text-white"
              >
                New Password
              </label>
              <div className="mt-2">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => resetEmail()}
                disabled={!email}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Send Forgot Password Email
              </button>
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
