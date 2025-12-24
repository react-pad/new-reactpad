"use client";
import { ArrowLeft } from "lucide-react";

export default function CreateProjectPage() {
  // Tally form ID
  const TALLY_FORM_ID = "lbq14N";

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-20 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <button className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold uppercase text-sm tracking-wider">BACK</span>
          </button>
        </div>

        <h1 className="text-6xl md:text-7xl font-black uppercase mb-16 tracking-tight">
          CREATE<br />PROJECT
        </h1>

        {/* Tally Embedded Form */}
        <div className="w-full">
          <iframe
            src={`https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
            width="100%"
            height="1200"
            title="Create Project Form"
            className="border-0"
          />
        </div>
      </div>
    </div>
  );
}