import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { retrieveContext, buildContext } from '@/lib/rag';
import { generateAnswer } from '@/lib/ai';

export async function POST(request){
 try{
  const {question,documentId}=await request.json();
  if(!question?.trim())return NextResponse.json({error:'Question is required.'},{status:400});
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const chunks=await retrieveContext(user.id,question.trim(),6,documentId||null);
  const result=await generateAnswer({question:question.trim(),context:buildContext(chunks),exam:user.exam});
  return NextResponse.json({...result,sources:chunks.map(c=>({id:c.id,title:c.document.title,fileName:c.document.fileName,position:c.position,content:c.content}))});
 }catch(error){return NextResponse.json({error:error.message||'Chat failed.'},{status:500})}
}
