import React from "react";

export default function StatsCard(props) {
  const Icon = props.icon;
  const { title, value, gradientClass } = props;
  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl bg-gradient-to-r ${gradientClass} hover:-translate-y-1 transition duration-300`}>
      {/* Decorative background shape */}
      <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-white/80">{title}</p>
          <p className="text-3xl font-black font-sans leading-none">{value}</p>
        </div>
        
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-md text-white shrink-0">
          <Icon className="w-6 h-6 stroke-[1.8]" />
        </div>
      </div>
    </div>
  );
}
