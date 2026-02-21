import { UploadCloud, Image as ImageIcon } from 'lucide-react';

const DropZone = ({ onFileChange, file }) => {
  return (
    <div className="relative border-4 border-dashed border-slate-700 bg-slate-800/50 rounded-2xl p-10 transition-all hover:border-indigo-500 hover:bg-slate-800 group">
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={onFileChange}
        accept="image/*"
      />
      <div className="flex flex-col items-center justify-center text-slate-300">
        {file ? (
          <div className="flex flex-col items-center animate-fade-in text-white">
            <ImageIcon size={64} className="text-emerald-400 mb-4" />
            <p className="text-xl font-semibold mb-2">{file.name}</p>
            <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="mt-4 text-indigo-400 text-sm">Click or drag to replace</p>
          </div>
        ) : (
          <>
            <UploadCloud size={64} className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-xl font-medium mb-2 text-white">Drag & Drop your screenshot here</p>
            <p className="text-sm text-slate-500">or click to browse</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DropZone;
