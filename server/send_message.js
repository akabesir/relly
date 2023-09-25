const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ConversationSummaryBufferMemory } = require("langchain/memory");
const { FirestoreChatMessageHistory } = require("langchain/stores/message/firestore");
const { ConversationChain } = require("langchain/chains");
const { MessagesPlaceholder, ChatPromptTemplate } = require("langchain/prompts");
const { firebaseConfig } = require("./firebase.js");

const sendMessage = async (user_input, user_id, session_id, api_key, system_message) => {
  
  console.log(firebaseConfig)
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
    temperature: 1,
    topP: 1,
    frequencyPenalty: 1,
    presencePenalty: 1,
    openAIApiKey: api_key ,
  });  

    let user_summary = new ConversationSummaryBufferMemory({
      memoryKey: "chat_history",
      llm: llm,
      maxTokenLimit: 10,
      chatHistory: new FirestoreChatMessageHistory({
        collectionName: "session",
        sessionId: session_id,
        userId: user_id,
        config : firebaseConfig,
      }),
    });

  const prompt = ChatPromptTemplate.fromPromptMessages([
    ["system", system_message],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);
  
  const chain = new ConversationChain({
    memory: user_summary,
    prompt: prompt,
    llm: llm
    })

  
  let response = await chain.call({ input: user_input });

  const aiResponse = response["response"]
  console.log(`New response:${aiResponse}`)

  const memory = await chain.memory.loadMemoryVariables({})
  console.log(memory)
  
  return aiResponse

}

module.exports = sendMessage;