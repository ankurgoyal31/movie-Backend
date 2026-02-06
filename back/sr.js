import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import { runEmbedding } from "./se.js";
import ollama from "ollama";
import { recommend } from "./ai.js";
import Fuse from "fuse.js";
import { main } from "./ai.js";
import { ObjectId } from "mongodb";
import { description } from "./desai.js";
import jwt from "jsonwebtoken";
import { auth } from "./auth.js";
import { embed } from "@pinecone-database/pinecone/dist/inference/embed.js";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../cache.json"), "utf-8")
);

   const app = express(); 
app.use(cors()); 
app.use(express.json());
dotenv.config(); 
const SECRET = "MY_SECRET_KEY";
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);
 const store= new Map();
 let data = [];
// const client = new MongoClient("mongodb+srv://ankurgoyal1227_db_user:0fqu2Vnd81bkdyJV@emploee.ltat2dt.mongodb.net/emploee");
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db =  client.db("movie"); 
const collection =  db.collection("data");
const collect =  db.collection("page");
const save = db.collection("save")
const add = db.collection("add")
const watch = db.collection("watch")
const ai = db.collection("ai")
const user = db.collection("user");
const cache = new Map(); 

console.log("total length->",dataset.length);
// function call(){
  try{ 
 app.post("/movies", async (req, res) => {
  try {
    const { it } = req.body; 
    if (cache.has(it)) {
      return res.json(cache.get(it));
    }
    // const data = await collect.find({ pagenumber: Number(it) }).toArray();
    const data = dataset.filter((item)=>item.pagenumber==Number(it));
    console.log(data)
    cache.set(it, data);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});
console.log("ENV KEY =>", process.env.YOUTUBE_API_KEY);

app.post("/search",async(req,res)=>{
   const data = await collection.findOne({movie:req.body.p})
  if(data){
    console.log("databases se aya h bhai congratulations......")
     return res.send(data);
  }
  if (store.has(req.body.p)) {
   return res.send(store.get(req.body.p));
}
   if(!store.has(req.body.p)){ 
 const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(`${req.body.p} full movie`)}&key=${process.env.YOUTUBE_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("YT search failed");
  const data  = await r.json();
   store.set(req.body.p,data); 
  collection.insertOne({movie:req.body.p,video:data.items[0].id.videoId,title:data.items[0].snippet.title,des:data.items[0].snippet.description,date:data.items[0].snippet.publishedAt})
 return res.send(data)
  }
  else{
    throw new Error("title is not undefine")
  }
 }) 

 app.post("/lo",async(req,res)=>{
 const data =await collection.find({movie:req.body.it}).toArray();
 return res.send(data);
 })
 app.post("/some",async(req,res)=>{
    const data = await collect.findOne({title:req.body.p})
   if(data){
    return res.send(data);
  }
  // else{
  //   throw new Error("fuck....")
  // }
 })
 app.post("/recommend", async (req, res) => {
   try {
     const d = await collect.findOne({title:req.body.query});
    if(d){
const data = await runEmbedding(d.embed);
const titles = data.map(it => it.metadata.title);
const movies = await collect.find({ title: { $in: titles } }).toArray();
let sa = movies.filter((items)=>items.title)
 const uniqueMovies = [...new Map(sa.map(m => [`${m.title}-${m.year}-${m.overview}`,m]) ).values()].slice(0,22);
   return  res.send(uniqueMovies);
    }
  } catch (e) { 
    res.status(500).json({ error: "AI failed" });
  }
}); 
// let data = [];
// async function get(){
//   console.log("calling..........")
//       data = await collect.find({}).toArray()
// fs.writeFileSync("cache.json", JSON.stringify(data));
// console.log("sucesssfull added.....")
//        } 
//        setTimeout(get,5000) 
app.post("/get",async(req,res)=>{
  try {
   console.log("data was came ..",dataset)
   let y = await main(req.body.k)
    console.log(y)
    const fuse = new Fuse(dataset, {
  keys: ["original_language","original_title","title","act","overview","release_date" ],      // kis field pe search
  threshold: 0.25,    // tolerance
  ignoreLocation: true,
  minMatchCharLength: 3  
});
const results = fuse.search(y);
 let rep = results.map((item)=>item.item);
   return res.send(rep)  
  } catch (error) {
    
    throw new Error("somthing wrong....")
  }
})  
app.post("/savek",async(req,res)=>{
   let data = await save.findOne({email:req.body.em,movie:req.body.m})
    //  let da = await watch.findOne({movie:req.body.m})

  if(req.body.like){
await save.updateOne({_id:data._id},{$set:{like:1}})
return res.send({ok:true});
  }
   if(data){
await save.updateOne({movie:req.body.m},{ $set: { watchTime: req.body.watcht } } );
//  if(da){
//     await watch.updateOne({movie:req.body.m},{ $set: { watchTime: req.body.watcht } } );
//     return res.send("continue");
//   }
     return res.send("continue");
  }
  
await save.insertOne({email:req.body.em,movie:req.body.m,watchTime:req.body.watcht,genres:req.body.gen,des:req.body.ge,like:0})
// await watch.insertOne({movie:req.body.m,watchTime:req.body.watcht,genres:req.body.gen,des:req.body.ge,like:0})
return res.send({ok:true})
  }) 

  app.post("/store",async(req,res)=>{
     let data = await watch.findOne({email:req.body.em,movie:req.body.m})

if(data && req.body.unlike){ 
 await watch.updateOne({_id:data._id},{$set:{like:-1}})
return res.send({ok:true});
}
 if(!data && req.body.unlike){
    await watch.insertOne({email:req.body.em,movie:req.body.m,watchTime:0,genres:req.body.gen,des:req.body.ge,like:-1})
return res.send({ok:true});
  }
  if(data && req.body.like){
await watch.updateOne({_id:data._id},{$set:{like:1}})
return res.send({ok:true});
  }
  if(!data && req.body.like){
    await watch.insertOne({email:req.body.em,movie:req.body.m,watchTime:0,genres:req.body.gen,des:req.body.ge,like:1})
return res.send({ok:true});
  }
   if(data){
await watch.updateOne({_id:data._id},{$inc:{ watchTime:req.body.watcht},})
    return res.send("continue");
  }
await watch.insertOne({email:req.body.em,movie:req.body.m,watchTime:req.body.watcht,genres:req.body.gen,des:req.body.ge,like:0})
return res.send({ok:true})
  })



app.post("/similier", async (req, res) => {
  try {
    let data = await recommend(req.body.em);
    const uniqueMovies = [
      ...new Map(
        data.map(m => [`${m.title}-${m.year}-${m.overview}`, m])
      ).values()
    ].slice(0, 30);
if(data.length==0){ 
     return res.json({ok:false,Array:[]}); // 🔥 EMPTY ARRAY 
}
    return res.json(uniqueMovies);
  } catch (err) {
    console.error(err);
    return res.json({ok:false,Array:[]}); // 🔥 EMPTY ARRAY
  }
});
app.post("/addM",async(req,res)=>{
  let data = await add.findOne({email:req.body.em,movie:req.body.m})
  if(data){
    return;
  }
await add.insertOne({email:req.body.em,movie:req.body.m,overvie:req.body.n,img:req.body.o,orgt:req.body.p,famus:req.body.q,rating:req.body.r,act:req.body.s,orllang:req.body.t,date:req.body.u});
})
app.post("/watchl",async(req,res)=>{
  try{
    let data = await add.find({email:req.body.em}).toArray()
    return res.send(data)
  } catch(err){
return "something went wrong....."
  }
})

app.post("/svs",async(req,res)=>{
  let data = await watch.find({email:req.body.em}).toArray()
  return res.send(data)
})

app.post("/del", async (req, res) => {
await add.deleteOne({_id: new ObjectId(req.body.id), });
return res.send({ ok: true });
});
app.post("/ais",async(req,res)=>{
  let movie = await ai.findOne({movie:req.body.data})
  if(movie){
    return  res.send({data:movie.content})
  }
 let dat = await description(req.body.data)
if(dat){
  await ai.insertOne({movie:req.body.data,content:dat})
  return res.send({data:dat})
}
else{
  return res.send("somthing went wrong....")
}
})
app.post("/user",async(req,res)=>{
  try{
  let find = await user.findOne({name:req.body.name,email:req.body.email,password:req.body.password})
  if(find){
    return res.send({ok:true,msg:"already exist...."});
  }
  await user.insertOne({name:req.body.name,email:req.body.email,password:req.body.password});
  return res.send({ok:true})
  }
 catch(err){
  return res.send({ok:false,msg:"somthing went wrong...."});
 }
})

app.post("/login", async(req, res) => {
  const { email, password } = req.body;
  const userf =await user.findOne(
     {email:email,password:password}
  );

  if (!userf) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

   const token = jwt.sign(
    {
      userId: userf.id,
      email: userf.email,
    },
    SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    name: userf.name,
    email: userf.email,
  });
});

app.get("/profile", auth, (req, res) => {
   res.json({
    ok:true,
    message: "Profile data",
    user: req.user,
  });
});


app.post("/count",async(req,res)=>{
  try{
let data = await watch.find({movie:req.body.m,like:1}).toArray();
return res.send(data);
  }catch(err){
   return res.send({ok:false})
  }
})
app.post("/unl",async(req,res)=>{
  try{
let data = await watch.find({movie:req.body.m,like:-1}).toArray();
return res.send(data);
  }catch(err){
   return res.send({ok:false})
  }
})
app.listen(3000, () => {
  console.log(" Server running on http://localhost:3000");
});  
   }catch(err){
     console.log("server crash.....")
  } 
