"use client"

import {loadStripe} from '@stripe/stripe-js'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';



let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe("pk_test_51NUovsF9bhIsInp9TXrSVJX27B43agYz5j2pZDpZNjssgtFgs2wKfL8RVIDHRjH8hhIcQbWKweewnI6W7NMTp9DJ00EJqIY34b");
  }

  return stripePromise;
};


const Page = () => {
    const [stripeError, setStripeError] = useState(null);


    const premiumPlan = {
        price: "price_1NqzGmF9bhIsInp9zrpBxWci",
        quantity: 1,
    }
    
    const proPlan = {
        price: "price_1NqzHGF9bhIsInp9nbToqtU3",
        quantity: 1
    }
    
    const redirectToCheckout = async (plan) => {
        console.log("redirectToCheckout");
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({
            lineItems: [plan],
            mode: "subscription",
            successUrl: `/`,
            cancelUrl: `/`
        });
        console.log("Stripe checkout error", error);
        if (error) setStripeError(error.message);
    };
    
      if (stripeError) alert(stripeError);

    const router = useRouter()
    const session = useSession({
      required: true,
      onUnauthenticated() {
        router.push('signIn');
      },
    });
  

  return (
    <div className="h-full bg-gray-900 flex flex-col justify-center items-center text-white">
      <h1 className="text-3xl font-semibold mb-4">Plans</h1>
      <div className="flex justify-center space-x-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-white">Basic Plan</h2>
          <p className="text-xl font-bold mt-2">Free</p>
          <p className="mt-2">5 free messages</p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
            Choose Plan
          </button>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-white">Premium Plan</h2>
          <p className="text-xl font-bold mt-2">$19.99/month</p>
          <p className="mt-2">10 free messages</p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105" onClick={()=> redirectToCheckout(premiumPlan)}>
            Choose Plan
          </button>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-white">Pro Plan</h2>
          <p className="text-xl font-bold mt-2">$29.99/month</p>
          <p className="mt-2">15 free messages</p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105" onClick={()=> redirectToCheckout(proPlan)}>
            Choose Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
