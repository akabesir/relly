const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ConversationSummaryBufferMemory } = require("langchain/memory");
const { FirestoreChatMessageHistory } = require("langchain/stores/message/firestore");
const { ConversationChain } = require("langchain/chains");
const { MessagesPlaceholder, ChatPromptTemplate } = require("langchain/prompts");
const { firebaseConfig } = require("./firebase.js");

const countTokens = (text) => {
  //majorly oversimplified tokenization
  const tokens = text.split(/\s+/);
  return tokens.length;
}

const splitMessage = (message) => {
  const splitMessages = message.split(/\n+/);
        
  for (let i = 0; i < splitMessages.length; i++) {
    if (splitMessages[i].endsWith(",")) {
      splitMessages[i].slice(0, -1)
    }
  }

  return splitMessages
}

const condenseMessage = async (message, api_key) => {
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
    temperature: 1,
    topP: 1,
    frequencyPenalty: 1,
    presencePenalty: 1,
    openAIApiKey: api_key,
    
  });  

  const system_message = process.env.condense_message
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", system_message],
    ["human", "{input}"],
  ]);
  
  const chain = new ConversationChain({
    prompt: prompt,
    llm: llm
  })
  
  const response = await chain.call({ input: message });

  const aiResponse = response["response"]

  return aiResponse
}

const sendMessage = async (user_input, user_id, session_id, api_key, system_message) => {
  
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
    temperature: 1,
    topP: 1,
    frequencyPenalty: 1,
    presencePenalty: 1,
    openAIApiKey: api_key,
  });  

    let user_summary = new ConversationSummaryBufferMemory({
      memoryKey: "chat_history",
      llm: llm,
      maxTokenLimit: 10,
      chatHistory: new FirestoreChatMessageHistory({
        collectionName: "session",
        sessionId: session_id,
        userId: user_id,
        config : { ...firebaseConfig, encryptionKey: "sanjinovkljuc"},
      }),
    });

  const prompt = ChatPromptTemplate.fromMessages([
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

  let aiResponse = response["response"]
  console.log(`Base response: ${aiResponse} \n\n`)
  
  const maxTokens = countTokens(aiResponse)

  if (maxTokens > 100) {
    aiResponse = await condenseMessage(aiResponse, api_key)
    
    console.log(`Final response: ${aiResponse} \n\n`)
    return  aiResponse
  }
  //this needs to be removed in production as it has overhead
  const memory = await chain.memory.loadMemoryVariables({})
  console.log(memory)
  
  console.log(`Final response: ${aiResponse} \n\n`)
  return  aiResponse

}

module.exports = sendMessage;