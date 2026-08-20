import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { retrieveContext, buildContext } from '@/lib/rag';
import { generateStudyArtifact } from '@/lib/ai';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
    const body = await request.json();
    const topic = String(body.topic || user.exam || 'General');
    const chunks = await retrieveContext(user.id, topic, 10);
    const result = await generateStudyArtifact({type:'summary', topic, context:buildContext(chunks), exam:user.exam});
    return NextResponse.json({...result, topic, sources:chunks.map(c=>({id:c.id,title:c.document.title,fileName:c.document.fileName,content:c.content}))});
  } catch(error) {
    return NextResponse.json({error:error.message||'Generation failed.'},{status:500});
  }
}
