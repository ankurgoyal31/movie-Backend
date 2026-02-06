import Groq from "groq-sdk";
import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import 'dotenv/config';

// import { embn } from "./set.js";
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db =  client.db("movie"); 
const collection =  db.collection("data");
const collect =  db.collection("page");
const save = db.collection("save")
const add = db.collection("add")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);

export async function runEmbedding(emb){
  try{
 const result = await index.query({
      vector: emb,
      topK: 30,
      includeMetadata: true,
    });
    console.log(result.matches)
    return result.matches;  
  } catch (err) {
    console.error("network error....", err);
    return [];  
  }
}
// main("bahubali Full Movie in hinglish")
