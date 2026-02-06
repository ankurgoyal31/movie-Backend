// import ollama from "ollama";
// import { Pinecone } from "@pinecone-database/pinecone";
// import dotenv from "dotenv";

// dotenv.config();

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
// const index = pc.index(process.env.PINECONE_INDEX);

 
// export async function  embn(query) {
//   try {
//     const emb = await ollama.embeddings({
//       model: "nomic-embed-text",
//       prompt: query,
//     });

//     const result = await index.query({
//       vector: emb.embedding,
//       topK: 30,
//       includeMetadata: true,
//     });
//     return result.matches;  
//   } catch (err) {
//     console.error("network error....", err);
//     return [];  
//   }
// }

   