'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { Layers3, Sparkles, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlashcardsPage(){
 const [topic,setTopic]=useState('Full syllabus'),[cards,setCards]=useState([]),[index,setIndex]=useState(0),[flipped,setFlipped]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const t=new URLSearchParams(window.location.search).get('topic');if(t)setTopic(t)},[]);
 const generate=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/flashcards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic})});const j=await r.json();if(!r.ok)throw Error(j.error);setCards(j.cards||[]);setIndex(0);setFlipped(false)}catch(e){setError(e.message)}finally{setLoading(false)}};
 const card=cards[index];
 return <><Nav/><main className="dashboard-main"><div className="container page"><div className="page-title"><div><div className="eyebrow">Active recall</div><h1>Flashcards</h1><p className="muted">Flip through key ideas and formulas from your own materials.</p></div></div>
 <div className="card" style={{marginBottom:18}}><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><input value={topic} onChange={e=>setTopic(e.target.value)} style={{flex:1,minWidth:240,padding:13,border:'1px solid #d0d5dd',borderRadius:11}}/><button className="btn btn-primary" onClick={generate} disabled={loading}><Sparkles size={16}/>{loading?'Generating…':'Generate flashcards'}</button></div>{error&&<p className="form-error">{error}</p>}</div>
 {card?<><div className="card" onClick={()=>setFlipped(!flipped)} style={{minHeight:350,display:'grid',placeItems:'center',textAlign:'center',cursor:'pointer',background:'linear-gradient(145deg,#fff,#f8f7ff)',border:'1px solid #ddd8ff'}}><div style={{maxWidth:650}}><span className="badge-neutral">{flipped?'ANSWER':'QUESTION'} • {index+1}/{cards.length}</span><h2 style={{fontSize:30,lineHeight:1.25,marginTop:24}}>{flipped?card.back:card.front}</h2><p className="muted">{flipped?'Tap to see the question':'Tap to reveal the answer'}</p></div></div><div style={{display:'flex',justifyContent:'center',gap:10,marginTop:16}}><button className="btn btn-secondary" disabled={index===0} onClick={()=>{setIndex(i=>i-1);setFlipped(false)}}><ChevronLeft size={16}/> Previous</button><button className="btn btn-secondary" onClick={()=>{setFlipped(false);setIndex(i=>(i+1)%cards.length)}}><ChevronRight size={16}/> Next</button></div></>:<div className="empty card"><Layers3 size={34}/><h3>Build your revision deck</h3><p>Generate flashcards from the topics you are preparing.</p></div>}
 </div></main></>;
}
