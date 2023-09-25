import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import {signInWithEmailAndPassword} from 'firebase/auth';
import { auth } from "@/app/firebase";


export default NextAuth({
  // Configure one or more authentication providers
  pages: {
    signIn: '/signin',
  },
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: {  label: "Password",  type: "password" },
        },
        async authorize(credentials) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            if (userCredential.user) {
              return Promise.resolve(userCredential.user);
            }
            return Promise.resolve(null);
          } catch (error) {
            console.error(error);
            return Promise.resolve(null);
          }
        },
      })
      
  ],
})


