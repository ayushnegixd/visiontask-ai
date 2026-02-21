import { Camera } from 'lucide-react';

const Hero = () => {
  return (
    <div className="text-center mb-10 text-white">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Camera size={48} className="text-indigo-500" />
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            VisionTask AI
          </span>{' '}
          Assistant
        </h1>
      </div>
      <p className="text-slate-400 text-lg">
        Instantly convert your images into ai generated text. <br />
        you can copy the text and also download it in pdf format.
      </p>
    </div>
  );
};

export default Hero;
