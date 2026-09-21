import React from 'react';

const steps = [
  {
    number: "01",
    title: "WRITE",
    description: "Enter or paste your text into the editor."
  },
  {
    number: "02",
    title: "CHOOSE",
    description: "Select a language and an authentic voice."
  },
  {
    number: "03",
    title: "LISTEN",
    description: "Generate speech and listen instantly."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-8 md:px-12 py-32">
      
      <div className="mb-24 text-center md:text-left">
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">
          The Vocalis Experience
        </h2>
        <p className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 leading-[1.1]">
          From a blank page<br />to a voice.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between relative">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-[9px] left-[5%] right-[25%] h-[1px] bg-slate-200"></div>
        
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col w-full md:w-1/3 pr-8 mb-16 md:mb-0">
            <div className="flex items-center gap-4 mb-6 relative z-10 bg-[#FDFDFC] pr-4 max-w-max">
              <span className="text-[10px] font-bold tracking-[0.2em] text-blue-900">{step.number}</span>
              <span className="text-sm font-bold tracking-[0.1em] text-slate-900 uppercase">{step.title}</span>
            </div>
            <p className="text-slate-500 font-light text-lg leading-relaxed max-w-[250px]">{step.description}</p>
          </div>
        ))}
      </div>
      
    </section>
  );
};

export default HowItWorks;
