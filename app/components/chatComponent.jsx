"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import axios from "axios";
import { useRouter } from "next/navigation";
import "../globals.css";

const ChatComponent = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sessionDocumentId, setSessionDocumentId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWritting, setIsWritting] = useState(false);

  const [nickname, setNickname] = useState("");
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

  useEffect(() => {
    const checkForUser = () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          router.push("/signIn");
        }
      });
    };

    checkForUser();
  }, []);

  useEffect(() => {
    if (sessionId == null) {
      const getSessionId = async () => {
        if (currentUser) {
          const user_id = await currentUser.uid;

          const q = query(
            collection(db, "session"),
            where("user_id", "==", user_id)
          );
          try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const firstDoc = querySnapshot.docs[0];
              setSessionId(firstDoc.id);
              setSessionDocumentId(firstDoc.id);
            } else {
              console.error("Dokument ne postoji");
            }
          } catch (error) {
            console.error("Greška prilikom dohvaćanja dokumenata", error);
          }
        }
      };

      getSessionId();
    }
  }, [currentUser, isWritting]);

  useEffect(() => {
    const getNickname = async () => {
      if (currentUser) {
        const user_id = await currentUser.uid;

        const q = query(
          collection(db, "users"),
          where("userId", "==", user_id)
        );
        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              const userName = userData.userName;
              setNickname(userName);
            });
          } else {
            console.error("Dokument ne postoji");
          }
        } catch (error) {
          console.error("Greška prilikom dohvaćanja dokumenata", error);
        }
      }
    };

    getNickname();
  }, [currentUser]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.post(
          "https://rellyv2.vercel.app/message/get_messages",
          {
            userId: currentUser.uid,
          }
        );

        const chatMessages = response.data;
        const formattedMessages = chatMessages.map((message) => ({
          type: message.role === "user" ? "human" : "ai",
          data: {
            content: message.content.split("\n").map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index !== array.length - 1 && <br />} 
              </React.Fragment>
            )),
          },
          createdAt: message.timestamp,
        }));
    
        setChatHistory(formattedMessages);
      } catch (error) {
        console.error("Greška prilikom dobijanja poruka:", error);
      }
    };

    fetchChatHistory();
  }, [currentUser.uid]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
  
    const timestamp = Timestamp.now();
  
    setIsWritting(true);
  
    setInputMessage("");
  
    try {
      let sendMessageResponse;
  
      if (sessionDocumentId) {
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          {
            type: "human",
            data: { content: inputMessage },
            createdAt: timestamp,
          },
        ]);
  
        sendMessageResponse = await axios.post(
          "https://rellyv2.vercel.app/message/send",
          {
            userMessage: inputMessage,
            userId: currentUser.uid,
            sessionId: sessionDocumentId,
            nickname: nickname,
          }
        );
  
      } else {
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          {
            type: "human",
            data: { content: inputMessage },
            createdAt: timestamp,
          },
        ]);
  
        sendMessageResponse = await axios.post(
          "https://rellyv2.vercel.app/message/send",
          {
            userMessage: inputMessage,
            userId: currentUser.uid,
            nickname: nickname,
          }
        );
  
      }
  
      // Zamijeni sve /n s JSX <br> tagom za AI poruke
      const aiMessages = sendMessageResponse.data.split("\n").map((content, index, array) => (
        <React.Fragment key={index}>
          {content}
          {index !== array.length - 1 && <br />} 
        </React.Fragment>
      ));
      
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        {
          type: "ai",
          data: { content: aiMessages },
          createdAt: timestamp,
        },
      ]);
    } catch (error) {
      console.error("Greška prilikom slanja poruke:", error);
    } finally {
      setIsWritting(false);
    }
  };
  
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();

      router.push("/signIn");
    } catch (error) {
      console.error("Greška prilikom odjave korisnika:", error);
    }
  };

  return (
    <div className="chatBg min-h-screen">
      <div className="main-navbar-div">
        <div className={`mainColor p-2 flex justify items-center `}>
          <div className="flex items-center justify-center space-x-2 ">
            <img
              src="/assets/relly_wink_face.png"
              alt="Relly Logo"
              className="w-8 h-7 bg-white logoRounded"
            />
            <p className="text-white text-2xl font-semibold">Relly</p>
          </div>
          <div
            className="text-white text-2xl cursor-pointer"
            onClick={openModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="3"
              height="16"
              viewBox="0 0 3 16"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="#fff" />
              <circle cx="1.5" cy="7.5" r="1.5" fill="#fff" />
              <circle cx="1.5" cy="13.5" r="1.5" fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
      <div className={`p-2  mx-auto customChatWidth chat-container`}>
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 ${
              message.type === "human" ? "justify-end" : "justify-start"
            } ${index === chatHistory.length - 1 ? "last-message" : ""}`}
          >
            {message.type === "ai"  && (
              <img
                src="/assets/relly_face_grin.png"
                alt="Relly Logo"
                className={`w-12 h-12 ${
                  message.type === "human" ? "order-2 ml-2" : "order-1 mr-2"
                } `}
              />
            )}

            {message.type === "ai" && (
              <div
                className={`bg-purple-200 textRounded px-4 py-3 max-w-md text-sm ${
                  message.type === "human" ? "order-1 ml-2" : "order-2 mr-2"
                } ${isMobile ? "mb-3" : "none"}`}
              >
                {message.data.content}
              </div>
            )}

            {message.type === "human" && (
              <div
                className={`userBg textRounded px-4 py-3 my-3 max-w-md text-sm ${
                  message.type === "human" ? "order-1 ml-2" : "order-2 mr-2"
                } ${isMobile ? "mb-3" : "none"} `}
              >
                {message.data.content}
              </div>
            )}
          </div>
        ))}

        <div
          className={`bg-white p-2 inputRounded mx-auto mt-10 ${
            isWritting ? "writtingWidth" : "inputWidth"
          }   fixed bottom-10 left-0 right-0`}
        >
          {isWritting ? (
            <div
              className={`flex items-center writting-animation justify-center`}
            >
              <img
                src="/assets/relly_face_grin.png"
                alt="Relly Logo"
                className={`w-12 h-12 
            "order-1 mr-2"
                  `}
              />
              <div
                className={`  bg-purple-200 textRounded px-4 max-w-md text-xl ${
                  isMobile ? "mb-3" : "none"
                } `}
              >
                Writting...
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 35 35"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 35C27.165 35 35 27.165 35 17.5C35 7.83502 27.165 0 17.5 0C7.83502 0 0 7.83502 0 17.5C0 27.165 7.83502 35 17.5 35Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M33.25 17.5C33.25 26.1985 26.1985 33.25 17.5 33.25C8.80152 33.25 1.75 26.1985 1.75 17.5C1.75 8.80151 8.80151 1.75 17.5 1.75C26.1985 1.75 33.25 8.80152 33.25 17.5Z"
                    stroke="#363636"
                    stroke-opacity="0.3"
                    stroke-width="3.5"
                  />
                  <path
                    d="M10.7917 16.0416C12.4025 16.0416 13.7083 14.7358 13.7083 13.125C13.7083 11.5141 12.4025 10.2083 10.7917 10.2083C9.18084 10.2083 7.875 11.5141 7.875 13.125C7.875 14.7358 9.18084 16.0416 10.7917 16.0416Z"
                    fill="#EEEEEE"
                  />
                  <path
                    d="M11.9583 13.125C11.9583 13.7693 11.436 14.2916 10.7917 14.2916C10.1473 14.2916 9.625 13.7693 9.625 13.125C9.625 12.4806 10.1473 11.9583 10.7917 11.9583C11.436 11.9583 11.9583 12.4806 11.9583 13.125Z"
                    stroke="#363636"
                    stroke-opacity="0.3"
                    stroke-width="3.5"
                  />
                  <path
                    d="M24.2084 16.0416C25.8192 16.0416 27.125 14.7358 27.125 13.125C27.125 11.5141 25.8192 10.2083 24.2084 10.2083C22.5975 10.2083 21.2917 11.5141 21.2917 13.125C21.2917 14.7358 22.5975 16.0416 24.2084 16.0416Z"
                    fill="#EEEEEE"
                  />
                  <path
                    d="M25.375 13.125C25.375 13.7693 24.8527 14.2916 24.2084 14.2916C23.564 14.2916 23.0417 13.7693 23.0417 13.125C23.0417 12.4806 23.564 11.9583 24.2084 11.9583C24.8527 11.9583 25.375 12.4806 25.375 13.125Z"
                    stroke="#363636"
                    stroke-opacity="0.3"
                    stroke-width="3.5"
                  />
                  <path
                    d="M27.4167 20.9999C27.4167 20.5333 27.1251 19.9499 26.3667 19.7749C24.3251 19.3666 21.3501 19.0166 17.5001 19.0166C13.6501 19.0166 10.6751 19.4249 8.6334 19.7749C7.87507 19.9499 7.5834 20.5333 7.5834 20.9999C7.5834 25.2583 10.8501 29.5166 17.5001 29.5166C24.1501 29.5166 27.4167 25.2583 27.4167 20.9999Z"
                    fill="#EEEEEE"
                  />
                  <path
                    d="M25.6533 21.4197C25.5551 22.9574 24.9157 24.4537 23.7343 25.5984C22.4582 26.835 20.4378 27.7666 17.5001 27.7666C14.5624 27.7666 12.5419 26.835 11.2658 25.5984C10.087 24.4561 9.44782 22.9638 9.34743 21.4296C11.3031 21.1087 14.0326 20.7666 17.5001 20.7666C21.0137 20.7666 23.7462 21.0664 25.6533 21.4197Z"
                    stroke="#363636"
                    stroke-opacity="0.3"
                    stroke-width="3.5"
                  />
                  <path
                    d="M24.9083 21.1749C23.625 20.9416 20.9416 20.5916 17.5 20.5916C14.0583 20.5916 11.375 20.9416 10.0916 21.1749C9.33331 21.2916 9.27498 21.5832 9.33331 22.0499C9.39164 22.2832 9.39164 22.6332 9.50831 22.9832C9.56664 23.3332 9.68331 23.5082 10.2666 23.4499C11.375 23.3332 23.6833 23.3332 24.7916 23.4499C25.375 23.5082 25.4333 23.3332 25.55 22.9832C25.6083 22.6332 25.6666 22.3416 25.725 22.0499C25.725 21.5832 25.6666 21.2916 24.9083 21.1749Z"
                    fill="white"
                  />
                  <path
                    d="M10.0903 21.7088C10.091 21.7087 10.0918 21.7086 10.0925 21.7086L10.0928 21.7118M10.0903 21.7088C10.088 21.709 10.0857 21.7093 10.0834 21.7095L10.0836 21.7114M10.0903 21.7088C10.0761 21.7102 10.067 21.7107 10.0625 21.711M10.0903 21.7088L10.0991 21.8584M10.0928 21.7118C10.0895 21.7116 10.0865 21.7115 10.0836 21.7114M10.0928 21.7118L10.1073 21.8564L10.1932 21.8349L10.2108 21.8305L10.4027 21.7825C10.3186 21.7508 10.2456 21.7333 10.1914 21.7237C10.186 21.7228 10.1807 21.7219 10.1757 21.7211C10.1711 21.7204 10.1667 21.7197 10.1625 21.7191C10.1338 21.7149 10.1102 21.7128 10.0928 21.7118ZM10.0836 21.7114L10.0991 21.8584M10.0836 21.7114C10.0736 21.7109 10.0664 21.7109 10.0625 21.711M10.0991 21.8584L9.33331 22.0499M10.0991 21.8584L17.5 20.5916C14.0583 20.5916 11.375 20.9416 10.0916 21.1749C9.33331 21.2916 9.27498 21.5832 9.33331 22.0499M10.0625 21.711C10.0603 21.711 10.0592 21.711 10.0591 21.7111L10.0625 21.711ZM9.33331 22.0499L10.1091 21.9529L9.50831 22.9832C9.43668 22.7683 9.40902 22.5534 9.38485 22.3655C9.36965 22.2474 9.35583 22.14 9.33331 22.0499ZM24.9999 21.7111C24.9999 21.7112 24.9984 21.7111 24.9952 21.711L24.9999 21.7111ZM10.1168 21.9519L10.2094 21.9404L10.2303 21.9378L10.6212 21.8889C10.6554 21.9096 10.6903 21.9327 10.7255 21.9585L10.1168 21.9519Z"
                    stroke="#363636"
                    stroke-opacity="0.3"
                    stroke-width="3.5"
                  />
                </svg>

                <input
                  type="text"
                  disabled={isWritting}
                  className={`flex-1 rounded-full p-2 bg-white outline-none `}
                  placeholder="Share your thoughts..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                <button
                  className="mainColor text-white rounded-full p-2"
                  onClick={handleSendMessage}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 32 33"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.13957 32.11C3.29281 32.11 2.1221 31.4845 1.38009 30.7438C-0.0709359 29.2952 -1.09325 26.217 2.17156 19.6821L3.6061 16.8344C3.78748 16.4558 3.78748 15.6657 3.6061 15.2871L2.17156 12.4394C-1.10974 5.90445 -0.0709359 2.80982 1.38009 1.37773C2.81463 -0.0708147 5.91455 -1.10784 12.4442 2.16785L26.5586 9.21306C30.0708 10.9579 32 13.3941 32 16.0607C32 18.7274 30.0708 21.1636 26.5751 22.9084L12.4607 29.9536C9.26181 31.5503 6.8874 32.11 5.13957 32.11ZM5.13957 2.48061C4.24917 2.48061 3.55663 2.6946 3.12792 3.12258C1.92423 4.30775 2.40241 7.38592 4.38108 11.32L5.81562 14.1842C6.34327 15.2542 6.34327 16.8673 5.81562 17.9373L4.38108 20.785C2.40241 24.7356 1.92423 27.7973 3.12792 28.9825C4.31513 30.1841 7.39856 29.7067 11.3559 27.7314L25.4704 20.6862C28.0591 19.4023 29.5267 17.7068 29.5267 16.0443C29.5267 14.3817 28.0427 12.6863 25.4539 11.4023L11.3394 4.37359C8.8331 3.12258 6.67305 2.48061 5.13957 2.48061Z"
                      fill="#FAFAFA"
                    />
                    <path
                      d="M14.0923 17.2955H5.18821C4.51216 17.2955 3.95154 16.7358 3.95154 16.0609C3.95154 15.386 4.51216 14.8264 5.18821 14.8264H14.0923C14.7684 14.8264 15.329 15.386 15.329 16.0609C15.329 16.7358 14.7684 17.2955 14.0923 17.2955Z"
                      fill="#FAFAFA"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 p w-full h-full flex items-center justify-center z-50">
          <div className="absolute top-0 left-0 w-full h-screen bg-black opacity-50"></div>
          <div
            className={`relative modalBg ${
              !isMobile ? "modalRounded" : "none"
            } padding ${isMobile ? "modalWidthMobile" : "modalWidthDesktop"}`}
          >
            <div className="buttonContainer">
              {isMobile ? (
                <>
                  <button
                    className="absolute top-2 left-10"
                    onClick={closeModal}
                  >
                    <svg
                      width="26"
                      height="20"
                      viewBox="0 0 26 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.85529 2L2 9.85525L9.85529 17.7105"
                        stroke="#FFABAB"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M24 9.85535H2.22006"
                        stroke="#FFABAB"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="absolute top-4 right-4 "
                    onClick={closeModal}
                  >
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 34 34"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 32C25.2842 32 32 25.2842 32 17C32 8.71572 25.2842 2 17 2C8.71572 2 2 8.71572 2 17C2 25.2842 8.71572 32 17 32Z"
                        stroke="#FFABAB"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M21.5 23L12.5 11"
                        stroke="#FFABAB"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12.5 23L21.5 11"
                        stroke="#FFABAB"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}

              <div>
                <button className="modalColor rounded-full p-4 mb-4 flex items-center">
                  <svg
                    width="22"
                    height="26"
                    viewBox="0 0 22 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M21 8.46286V20.1049C21 23.6871 18.7625 24.8812 16 24.8812H6C3.2375 24.8812 1 23.6871 1 20.1049V8.46286C1 4.58217 3.2375 3.68663 6 3.68663C6 4.42695 6.31246 5.09562 6.82496 5.58518C7.33746 6.07475 8.0375 6.37326 8.8125 6.37326H13.1875C14.7375 6.37326 16 5.16726 16 3.68663C18.7625 3.68663 21 4.58217 21 8.46286Z"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16 3.68663C16 5.16726 14.7375 6.37326 13.1875 6.37326H8.8125C8.0375 6.37326 7.33746 6.07475 6.82496 5.58518C6.31246 5.09562 6 4.42695 6 3.68663C6 2.206 7.2625 1 8.8125 1H13.1875C13.9625 1 14.6625 1.29851 15.175 1.78808C15.6875 2.27764 16 2.94632 16 3.68663Z"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 14.1346H11"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 18.9109H16"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Relly Notes
                </button>
                <button className="modalColor rounded-full p-4 mb-4 flex items-center">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M17.1396 9.72093C16.72 9.72093 16.3721 9.37302 16.3721 8.95349V6.90698C16.3721 3.68372 15.4614 1.53488 11 1.53488C6.53863 1.53488 5.62793 3.68372 5.62793 6.90698V8.95349C5.62793 9.37302 5.28003 9.72093 4.86049 9.72093C4.44096 9.72093 4.09305 9.37302 4.09305 8.95349V6.90698C4.09305 3.93954 4.80933 0 11 0C17.1907 0 17.907 3.93954 17.907 6.90698V8.95349C17.907 9.37302 17.5591 9.72093 17.1396 9.72093Z"
                      fill="#FFABAB"
                    />
                    <path
                      d="M11 18.4186C9.16834 18.4186 7.67439 16.9246 7.67439 15.093C7.67439 13.2614 9.16834 11.7674 11 11.7674C12.8316 11.7674 14.3255 13.2614 14.3255 15.093C14.3255 16.9246 12.8316 18.4186 11 18.4186ZM11 13.3023C10.0176 13.3023 9.20927 14.1107 9.20927 15.093C9.20927 16.0753 10.0176 16.8837 11 16.8837C11.9823 16.8837 12.7907 16.0753 12.7907 15.093C12.7907 14.1107 11.9823 13.3023 11 13.3023Z"
                      fill="#FFABAB"
                    />
                    <path
                      d="M16.1163 22H5.88372C1.37116 22 0 20.6288 0 16.1163V14.0698C0 9.5572 1.37116 8.18604 5.88372 8.18604H16.1163C20.6288 8.18604 22 9.5572 22 14.0698V16.1163C22 20.6288 20.6288 22 16.1163 22ZM5.88372 9.72092C2.22047 9.72092 1.53488 10.4167 1.53488 14.0698V16.1163C1.53488 19.7693 2.22047 20.4651 5.88372 20.4651H16.1163C19.7795 20.4651 20.4651 19.7693 20.4651 16.1163V14.0698C20.4651 10.4167 19.7795 9.72092 16.1163 9.72092H5.88372Z"
                      fill="#FFABAB"
                    />
                  </svg>
                  Privacy and Security
                </button>
                <button className="modalColor rounded-full p-4 mb-4 flex items-center">
                  <svg
                    width="22"
                    height="26"
                    viewBox="0 0 22 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M14.5156 2.1758C13.5377 1.43075 12.327 1 10.9999 1C7.7868 1 5.17911 3.60769 5.17911 6.82074C5.17911 10.0338 7.7868 12.6415 10.9999 12.6415C14.2129 12.6415 16.8206 10.0338 16.8206 6.82074"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M21 24.283C21 19.7777 16.5181 16.1339 11.0001 16.1339C5.48196 16.1339 1 19.7777 1 24.283"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Help and Support
                </button>
                <button className="modalColor rounded-full p-4 mb-4 flex items-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8.70001 8.69999C8.70001 4.84996 14.75 4.84999 14.75 8.69999C14.75 11.45 12 10.8999 12 14.1999"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 18.611L12.011 18.5988"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  About
                </button>
                <button
                  className="modalColor rounded-full p-4 flex items-center"
                  onClick={handleSignOut}
                >
                  <svg
                    width="22"
                    height="27"
                    viewBox="0 0 22 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M11 13.3871H21M21 13.3871L16.7143 17.5161M21 13.3871L16.7143 9.25806"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M21 5.12903V3.75269C21 2.23242 19.7209 1 18.1429 1H3.85714C2.27919 1 1 2.23242 1 3.75269V23.0215C1 24.5418 2.27919 25.7742 3.85714 25.7742H18.1429C19.7209 25.7742 21 24.5418 21 23.0215V21.6452"
                      stroke="#FFABAB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
