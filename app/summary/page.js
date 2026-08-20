'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { FileText, Sparkles, Copy, Check } from 'lucide-react';

export default function SummaryPage(){
 const [topic,setTopic]=useState('Full syllabus'),[data,setData]=useState(null),[loading,setLoading]=useState(false),[copied,setCopied]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const t=new URLSearchParams(window.location.search).get('topic');if(t)setTopic(t)},[]);
 const generate=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic})});const j=await r.json();if(!r.ok)throw Error(j.error);setData(j)}catch(e){setError(e.message)}finally{setLoading(false)}};
 const copy=async()=>{if(!data)return;await navigator.clipboard?.writeText(data.content);setCopied(true);setTimeout(()=>setCopied(false),1400)};
 return <><Nav/><main className="dashboard-main"><div className="container page">
  <div className="page-title"><div><div className="eyebrow">Fast revision</div><h1>AI Summary</h1><p className="muted">Turn your uploaded materials into clean, exam-ready revision notes.</p></div></div>
  <div className="card" style={{marginBottom:18}}><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Topic, e.g. Organic Chemistry" style={{flex:1,minWidth:240,padding:13,border:'1px solid #d0d5dd',borderRadius:11}}/><button className="btn btn-primary" onClick={generate} disabled={loading}><Sparkles size={16}/>{loading?<><span className="spinner"/>Generating…</>:'Generate summary'}</button></div>{error&&<p className="form-error" style={{marginBottom:0,marginTop:12}}>{error}</p>}</div>
  {data?<div className="grid" style={{gridTemplateColumns:'1.35fr .65fr'}}><article className="card"><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><span className="badge-success">AI generated</span><h2 style={{margin:'12px 0 4px'}}>{data.title}</h2></div><button className="btn btn-secondary btn-sm" onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button></div><div style={{whiteSpace:'pre-wrap',lineHeight:1.75,marginTop:20}}>{data.content}</div></article><aside className="card"><h3>Sources used</h3>{data.sources?.map((s,i)=><div className="source" key={s.id}><strong>Source {i+1}</strong><div>{s.title}</div><p>{s.content.slice(0,220)}…</p></div>)}</aside></div>:<div className="empty card"><FileText size={34} style={{marginBottom:10}}/><h3>No summary yet</h3><p>Upload a PDF, choose a topic, and generate revision notes.</p></div>}
 </div></main></>;
}
