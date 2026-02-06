import Groq from "groq-sdk";
import { MongoClient } from "mongodb";
// import { embn } from "./set.js";
import { Pinecone } from "@pinecone-database/pinecone";
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db =  client.db("movie"); 
const collection =  db.collection("data");
const collect =  db.collection("page");
const save = db.collection("save")
const add = db.collection("add")
// import fs from "fs";

const groq = new Groq({ apiKey:process.env.GROQ_API_KEY});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);
// const data = await collect.find({}).toArray();
 
export async function recommend(em){
let res = [];
let y = await (await save.find({email:em, watchTime: { $gte: 300 } }).toArray()).reverse().slice(0,5);
  if(y.length>0){
let s = y.map(item => item.movie);
// console.log(s);
await save.deleteMany({email:em,movie:{$nin:s}});
let coll = await collect.find({title:{$in:s}}).toArray();
// console.log(coll)
for(let item of coll){
    const result = await index.query({
      vector: item.embed,
      topK: 10,
      includeMetadata: true,
    });
 res.push(...result.matches);
}
  if(res.length==0){
    console.log("oooo seeeeeet....")
    return []
}
let u = res.map((item)=>item.metadata?.title)
let hd = await collect.find({title:{$in:u}}).toArray()
console.log(hd)
return hd
 }
 }
// await recommend()
export async function main(que){
let baseMessages = [
    { 
      role: 'system',
      content: `You are a query parser.
Your job is to extract the MAIN keyword or intent from the user's query.Return ONLY the keyword.Do not explain anything.
Rules:- - Ignore generic words like:  movie, movies, film, films, video, videos , Return only 1–2 words`
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
return completion.choices[0].message.content
}
// main("bahubali new movie")
