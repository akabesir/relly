import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, orderBy, Timestamp } from "firebase/firestore";
import axios from "axios";
import { useRouter } from "next/navigation";


const ChatComponent = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sessionDocumentId, setSessionDocumentId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter()

  useEffect(() => {
    const checkForUser = () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setCurrentUser(user);
          console.log('user is set!')
        } else {
            router.push('/signIn')
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

    if(sessionDocumentId){
      setChatHistory((prevChatHistory) => [
        { type: "human", data: { content: inputMessage }, createdAt: timestamp },
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
    }else{
      setChatHistory((prevChatHistory) => [
        { type: "human", data: { content: inputMessage }, createdAt: timestamp },
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

  return (
    <div className="p-4 space-y-4">
       <div className="h-96 border border-gray-300 p-4 overflow-y-auto text-black">
        {/* Prikazati poruke iz chatHistory */}
        {chatHistory.slice().reverse().map((message, index) => (
          <div key={index} className={message.type === 'human' ? 'text-blue-600' : 'text-green-600'}>
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
      </div>
    </div>
  );
};

export default ChatComponent;
