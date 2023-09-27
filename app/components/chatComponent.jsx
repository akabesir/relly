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
          console.log("user is set!");
        } else {
          router.push("/signIn");
        }
      });
    };

    checkForUser();
  }, []);

  useEffect(() => {
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
  }, [currentUser]);

  useEffect(() => {
    const getChatHistory = async () => {
      if (sessionDocumentId) {
        // Napravite referencu na kolekciju "messages" unutar dokumenta "session"
        const messagesRef = collection(
          db,
          `session/${sessionDocumentId}/messages`
        );

        // Napravite upit za porukama, sortiranim po "createdAt" u silaznom redoslijedu
        const q = query(messagesRef, orderBy("createdAt", "desc"));

        try {
          const querySnapshot = await getDocs(q);

          const messages = [];
          querySnapshot.forEach((doc) => {
            const messageData = doc.data();
            messages.push(messageData);
          });
          setChatHistory(messages);
        } catch (error) {
          console.error("Greška prilikom dohvaćanja poruka", error);
        }
      }
    };

    getChatHistory();
  }, [sessionDocumentId]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const timestamp = Timestamp.now();

    // console.log("id iz dokumenta:", sessionDocumentId);

    setInputMessage("");

    if (sessionDocumentId) {
      setChatHistory((prevChatHistory) => [
        {
          type: "human",
          data: { content: inputMessage },
          createdAt: timestamp,
        },
        ...prevChatHistory,
      ]);

      const sendMessageResponse = await axios.post(
        "http://localhost:5000/message/send",
        {
          userMessage: inputMessage,
          userId: currentUser.uid,
          sessionId: sessionDocumentId,
          nickname: "NICKNAME",
        }
      );
      setChatHistory((prevChatHistory) => [
        {
          type: "ai",
          data: { content: sendMessageResponse.data },
          createdAt: timestamp,
        },
        ...prevChatHistory,
      ]);
    } else {
      setChatHistory((prevChatHistory) => [
        {
          type: "human",
          data: { content: inputMessage },
          createdAt: timestamp,
        },
        ...prevChatHistory,
      ]);

      const sendMessageResponse = await axios.post(
        "http://localhost:5000/message/send",
        {
          userMessage: inputMessage,
          userId: currentUser.uid,
          nickname: "NICKNAME",
        }
      );
      setChatHistory((prevChatHistory) => [
        {
          type: "ai",
          data: { content: sendMessageResponse.data },
          createdAt: timestamp,
        },
        ...prevChatHistory,
      ]);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="h-96 border border-gray-300 p-4 overflow-y-auto text-black">
        {/* Prikazati poruke iz chatHistory */}
        {chatHistory
          .slice()
          .reverse()
          .map((message, index) => (
            <div
              key={index}
              className={
                message.type === "human" ? "text-blue-600" : "text-green-600"
              }
            >
              {message.data.content}
            </div>
          ))}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 border border-gray-300 p-2 rounded-l text-black"
          placeholder="Unesite poruku..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          className="bg-blue-600 text-black p-2 rounded-r"
          onClick={handleSendMessage}
        >
          Pošalji
        </button>
        <button
          className="bg-blue-600 text-white p-2 rounded"
          onClick={openModal}
        >
          Settings
        </button>
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
                <button className="modalColor rounded-full p-4 flex items-center">
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
