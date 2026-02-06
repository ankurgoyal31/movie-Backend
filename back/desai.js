import Groq from "groq-sdk";
import { MongoClient } from "mongodb";
import { embn } from "./set.js";
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db =  client.db("movie"); 
const collection =  db.collection("data");
const collect =  db.collection("page");
const save = db.collection("save")
const add = db.collection("add")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});

export async function description(que){
let baseMessages = [
    { 
      role: 'system',
      content: `You are a movie summrizer who summarize a movie in simple word.
Your job is to summurize a movie in very simple english worlds 

 rule :  1.point to point summrize a movie in simple english word
        2.strictly,response should be descriptive  `
    }, 
        {
      role: 'user', 
      content: que 
    },
  
   ];
 
   const completion = await groq.chat.completions.create({ 
    model: "llama-3.3-70b-versatile",
    messages: baseMessages,             
   }) 
 return completion.choices[0].message.content;
}
// main("bahubali Full Movie in hinglish")