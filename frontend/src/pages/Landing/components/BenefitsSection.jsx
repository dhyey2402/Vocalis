import React from 'react';

const benefits = [
  {
    title: "LANGUAGES",
    description: "Choose from supported languages and create speech for audiences globally."
  },
  {
    title: "VOICES",
    description: "Select the specific voice that perfectly fits the tone of your content."
  },
  {
    title: "PLAYBACK",
    description: "Listen to generated speech directly in your browser without waiting."
  },
  {
    title: "AUDIO",
    description: "Download the high-quality generated speech for offline integration."
  }
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="w-full max-w-7xl mx-auto px-8 md:px-12 py-12 md:py-24">
      <div className="flex flex-col border-t border-slate-200">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            className="flex flex-col md:flex-row md:items-start py-10 border-b border-slate-200 gap-6 md:gap-16 group"
          >
            <div className="text-xs font-bold tracking-[0.2em] text-slate-400 w-12 pt-1 group-hover:text-blue-900 transition-colors">
              0{index + 1}
            </div>
            <div className="w-48">
              <h3 className="text-sm font-bold tracking-[0.15em] text-slate-900 uppercase">
                {benefit.title}
              </h3>
            </div>
            <div className="flex-1 max-w-2xl">
              <p className="text-lg text-slate-500 font-light leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
