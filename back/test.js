// // buildCache.js
// import { MongoClient } from "mongodb";
// import fs from "fs";
// import dotenv from "dotenv";

// dotenv.config();

// const client = new MongoClient(process.env.MONGO_URI);
// await client.connect();

// const db = client.db("movie");
// const collect = db.collection("page");

// console.log("⏳ fetching data...");
// const data = await collect.find(
//   {},
//   {
//     projection: {
//       title: 1,
//       original_title: 1,
//       overview: 1,
//       act: 1,
//       release_date: 1,
//       original_language: 1,
//       poster_path:1,
//       pagenumber:1,
//       vote_average:1
//     }
//   }
// ).toArray();


// fs.writeFileSync("cache.json", JSON.stringify(data, null, 2));
// console.log("✅ cache.json created:", data.length);

// process.exit(0);

let y = [1,2,3,4,5,2];
let arr = y.reduce((acc,val)=>
console.log(val)
)
// console.log(arr)