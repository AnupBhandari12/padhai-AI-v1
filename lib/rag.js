import { db } from './prisma';

function tokenize(text) {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((x) => x.length > 2));
}
function lexicalScore(questionTokens, chunk) {
  const tokens = tokenize(chunk.content);
  let hits = 0;
  for (const token of questionTokens) if (tokens.has(token)) hits += 1;
  return hits;
}
function cosine(a,b){
  let dot=0,na=0,nb=0;
  for(let i=0;i<a.length;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
  return dot/(Math.sqrt(na)*Math.sqrt(nb)||1);
}
async function semanticRank(question, chunks){
  const key=process.env.OPENAI_API_KEY;
  if(!key||!chunks.length)return null;
  try{
    const input=[question,...chunks.slice(0,80).map(c=>c.content)];
    const r=await fetch('https://api.openai.com/v1/embeddings',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
      body:JSON.stringify({model:process.env.OPENAI_EMBEDDING_MODEL||'text-embedding-3-small',input})
    });
    if(!r.ok)return null;
    const j=await r.json(); const vectors=(j.data||[]).sort((a,b)=>a.index-b.index).map(x=>x.embedding);
    if(vectors.length!==input.length)return null;
    const qv=vectors[0];
    return chunks.slice(0,80).map((c,i)=>({...c,semantic:cosine(qv,vectors[i+1])})).sort((a,b)=>b.semantic-a.semantic);
  }catch{return null}
}
export async function retrieveContext(userId, question, limit=6, documentId=null){
  const where={document:{userId,...(documentId?{id:documentId}:{})}};
  const chunks=await db.chunk.findMany({where,include:{document:{select:{id:true,title:true,fileName:true}}},orderBy:{position:'asc'}});
  const q=tokenize(question);
  const ranked=chunks.map(c=>({...c,lexical:lexicalScore(q,c)}));
  const semantic=await semanticRank(question,ranked);
  if(semantic){
    const byId=new Map(semantic.map(c=>[c.id,c]));
    return ranked.map(c=>({...c,semantic:byId.get(c.id)?.semantic||0,hybrid:(c.lexical*0.08)+(byId.get(c.id)?.semantic||0)})).sort((a,b)=>b.hybrid-a.hybrid).slice(0,limit);
  }
  const matched=ranked.sort((a,b)=>b.lexical-a.lexical).filter(x=>x.lexical>0).slice(0,limit);
  return matched.length?matched:ranked.slice(0,Math.min(limit,ranked.length));
}
export function buildContext(chunks){
  return chunks.map((c,i)=>`SOURCE ${i+1}: ${c.document.title} (${c.document.fileName})\nCHUNK ${c.position+1}\n${c.content}`).join('\n\n');
}
