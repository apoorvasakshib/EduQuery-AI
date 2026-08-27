import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Cpu, Database, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <>
      <Head>
        <title>About | EduQuery AI</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-700 dark:bg-sky-600 text-white mx-auto flex items-center justify-center shadow-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            About EduQuery AI Platform
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
            A production-quality Retrieval-Augmented Generation (RAG) system engineered for high-accuracy institutional query resolution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="console-card p-6 space-y-3">
            <Cpu className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Hybrid RAG Search Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Combines Google Gemini embeddings vector cosine similarity with BM25 keyword matching to locate precise candidate text passages across official PDF documents.
            </p>
          </div>

          <div className="console-card p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Strict Grounding Protection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforces zero hallucination rules. If an answer cannot be verified from active college documents, the assistant responds strictly with "I couldn't find this information in official documents."
            </p>
          </div>
        </div>

        <div className="console-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Key Architecture Capabilities</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Department Knowledge Bases
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Document Version Control (V1 / V2)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multilingual Support (English, Kannada, Hindi)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Speech-to-Text & Audio TTS Reader
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Source Citation & Text Passage Highlighting
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SaaS Admin Analytics & AI FAQ Generator
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/login" className="console-btn-primary px-6 py-2.5 inline-flex">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
