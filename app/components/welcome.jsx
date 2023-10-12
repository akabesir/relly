import Image from "next/image";
import React from "react";
import { useEffect, useState } from "react";
import "../globals.css";
import { useRouter } from "next/navigation";

const Welcome = () => {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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

  return (
    <div className={`background flex flex-col justify-between h-screen p-4 md:p-0 ${isMobile ? "pt-10" : ""}`}>
  <header className="flex md:justify-between lg:justify-around p-4 items-center">
    <div className="flex items-center">
      <Image
        src="/assets/relly-black.png"
        alt="Logo"
        width={64}
        height={64}
        className="hidden lg:block md:block"
      />
      <p
        className={`text-black text-2xl ${isMobile ? "mb-2 md:mb-0" : ""} font-semibold hidden md:block`}
      >
        RELLY
      </p>
    </div>
    <button
      className="text-white text-xl hidden md:block"
      onClick={() => router.push("/signIn")}
    >
      Already have? <span className="underline">Sign in!</span>
    </button>
  </header>
  <main className={`flex-grow flex justify-center ${isMobile ? "items-start" : ""}`}>
    <div className="text-center flex flex-col items-center md:flex-row">
      <p className="text-black text-4xl md:hidden sm:block font-semibold ">
        RELLY
      </p>
      <Image
        src="/assets/relly.png"
        alt="Image"
        width={isMobile ? 200 : 275}
        height={isMobile ? 150 : 350}
        className={` ${isMobile ? "none" : "rellyImg"}`}
      />
      <div className="md:ml-4">
        <p className="text-black text-xl tracking-wider font-semibold mb-3 md:text-2xl md:mr-4 lg:mr-0">
          A Buddy You Can Rely On. Advice <br></br> You Can Count On.
        </p>
        <button
          className="first-welcome-button"
          onClick={() => router.push("/signUp")}
        >
          Try it for free
        </button>
        <br />
        <button className="second-welcome-button">Start Experience</button>
        <br />
        <button
          className="text-white md:hidden sm:block mt-2"
          onClick={() => router.push("/signIn")}
        >
          Already have? <span className="underline">Sign in!</span>
        </button>
      </div>
    </div>
  </main>
  <footer className="text-center mb-4 md:mb-0">
    <button className={`text-white mb-10 text-xl underline`}>
      Learn more
    </button>
  </footer>
</div>

  );
};

export default Welcome;
