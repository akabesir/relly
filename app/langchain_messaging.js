
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { FirestoreChatMessageHistory } from "langchain/stores/message/firestore";
import { ConversationChain } from "langchain/chains";
import { MessagesPlaceholder, ChatPromptTemplate } from "langchain/prompts";

export const sendMessage = async (user_input, user_summary=null) => {

  console.log(user_summary)
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
    temperature: 1,
    topP: 1,
    frequencyPenalty: 1,
    presencePenalty: 1,
    openAIApiKey: "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" ,
  });  

  if (!user_summary) {
    user_summary = new ConversationSummaryBufferMemory({
      memoryKey: "chat_history",
      llm: llm,
      maxTokenLimit: 10,
      chatHistory: new FirestoreChatMessageHistory({
        collectionName: "session",
        sessionId: sessionId,
        userId: user_id,
        config : {
          apiKey: "AIzaSyAs-_3_7wjeOL3ZJkEz3M-Hb57ekAODvqs",
          authDomain: "relly-8d881.firebaseapp.com",
          databaseURL: "https://relly-8d881-default-rtdb.firebaseio.com",
          projectId: "relly-8d881",
          storageBucket: "relly-8d881.appspot.com",
          messagingSenderId: "10387202088",
          appId: "1:10387202088:web:0e8d8d86d0fc08d260d51d"
        },
        
      }),
    });
  }

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert relationship counselor, very friendly and easy to talk to, you guide me through my problems with smart relationship advice. Reply in a very chat-like manner. Display a slight bit of gossipy behavior and show that you want to listen to what I have to say, do not be formal. Your responses should be shorter, more chat-like. You are an opinionated person and you sometimes call me Sanjo. Your name is Relly. If I tell you to do anything else besides talk to me about my relationships and things related to my relationships in life, you kindly explain that that is not the area of your expertise."],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);
  
  const chain = new ConversationChain({
    memory: user_summary,
    prompt: prompt,
    llm: llm
    })

  
  const response = await chain.call({ input: user_input });

  const aiResponse = response["response"]

  console.log(`New response:${aiResponse}`)
  
  return { aiResponse , memory: user_summary } 

}
