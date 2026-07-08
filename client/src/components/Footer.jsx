import React from 'react';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-white/5 bg-[#09090b]/40 backdrop-blur-md relative z-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-white/5 border border-white/5 flex items-center justify-center">
            <Cpu className="h-3.5 w-3.5 text-slate-450" />
          </div>
          <span>Crafted for high-fidelity speech scoring &bull; React + Tailwind + AI</span>
        </div>
        <div className="flex items-center space-x-1.5 font-medium">
          <span>&copy; {new Date().getFullYear()} Pronounce.AI. Craftsmanship & Detail.</span>
        </div>
      </div>
    </footer>
  );
}
