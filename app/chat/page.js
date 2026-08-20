'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { Send, Sparkles, Layers3, RotateCcw, BookOpen } from 'lucide-react';

const welcome={role:'ai',content:'Namaste! Ma PadhAI ho. Timro uploaded study materials bata source-grounded answer dinchu. कुनै concept, formula वा exam question sodha.'};

export default function ChatPage(){
 const [messages,setMessages]=useState([welcome]),[q,setQ]=useState(''),[sources,setSources]=useState([]),[loading,setLoading]=useState(false),[documentId,setDocumentId]=useState(null);
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const id=p.get('document');setDocumentId(id);const key=`padhai-chat-${id||'all'}`;try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.messages)setMessages(saved.messages)}catch{}},[]);
 useEffect(()=>{if(typeof window!=='undefined')localStorage.setItem(`padhai-chat-${documentId||'all'}`,JSON.stringify({messages}))},[messages,documentId]);
 const send=async e=>{e.preventDefault();if(!q.trim()||loading)return;const question=q.trim();setQ('');setMessages(m=>[...m,{role:'user',content:question}]);setLoading(true);try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,documentId})});const j=await r.json();if(!r.ok)throw Error(j.error);setMessages(m=>[...m,{role:'ai',content:j.answer}]);setSources(j.sources||[])}catch(err){setMessages(m=>[...m,{role:'ai',content:`Sorry — ${err.message}`}])}finally{setLoading(false)}};
 const clear=()=>{setMessages([welcome]);setSources([]);localStorage.removeItem(`padhai-chat-${documentId||'all'}`)};
 return <><Nav/><main className="dashboard-main"><div className="container page"><div className="page-title"><div><div className="eyebrow">Source-grounded tutor</div><h1>AI Tutor</h1><p className="muted">Ask questions and get answers grounded in your uploaded materials.</p></div><button className="btn btn-secondary btn-sm" onClick={clear}><RotateCcw size={14}/> New session</button></div>
 <div className="tool-grid"><Link className="tool-card" href="/summary"><Sparkles size={19}/><strong>Generate summary</strong><small>Turn your sources into revision notes.</small></Link><Link className="tool-card" href="/flashcards"><Layers3 size={19}/><strong>Make flashcards</strong><small>Practice key concepts with active recall.</small></Link><Link className="tool-card" href="/quiz"><BookOpen size={19}/><strong>Generate quiz</strong><small>Test yourself from your materials.</small></Link><Link className="tool-card" href="/mock-test"><BookOpen size={19}/><strong>Mock test</strong><small>Simulate an exam and find weak areas.</small></Link></div>
 <div className="chat" style={{marginTop:18}}><div className="card sources"><div style={{display:'flex',justifyContent:'space-between'}}><h3>Sources</h3>{documentId&&<span className="badge-success">One document</span>}</div>{sources.length?sources.map((s,i)=><div className="source" key={s.id}><strong>[Source {i+1}] {s.title}</strong><div className="muted" style={{fontSize:11,marginTop:3}}>Chunk {s.position+1}</div><p>{s.content.slice(0,420)}…</p></div>):<div className="empty">Supporting sources will appear here after you ask.</div>}</div>
 <div className="card chatbox"><div className="messages">{messages.map((m,i)=><div className={`msg ${m.role}`} key={i}>{m.content}</div>)}{loading&&<div className="msg ai"><span className="spinner"/> Thinking from your sources…</div>}</div><form className="composer" onSubmit={send}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask about a concept, formula, or exam question…"/><button className="btn btn-primary" disabled={loading||!q.trim()}><Send size={16}/>{loading?'Thinking':'Ask'}</button></form></div></div>
 </div></main></>;
}
