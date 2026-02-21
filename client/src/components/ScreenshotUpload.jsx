import { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import DropZone from './DropZone';
import ResultCard from './ResultCard';
import useAuthStore from '../store/useAuthStore';

const ScreenshotUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuthStore();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setExtractedText('');
      setImageUrl('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    setError('');
    setExtractedText('');
    setImageUrl('');

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const res = await axios.post('http://localhost:3000/api/screenshots/upload', formData, config);

      setExtractedText(res.data.extractedText);
      setImageUrl(`http://localhost:3000${res.data.imageUrl}`);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to upload and process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
      {loading && (
        <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-blue-400 font-medium animate-pulse">Analyzing content...</p>
        </div>
      )}

      <DropZone onFileChange={handleFileChange} file={file} />

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`
            relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3
            ${loading || !file
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-indigo-500/25 active:scale-95'
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Processing...
            </>
          ) : (
            'Upload & Extract Text'
          )}
        </button>
      </div>

      {(imageUrl && extractedText) && (
        <ResultCard imageUrl={imageUrl} extractedText={extractedText} />
      )}
    </div>
  );
};

export default ScreenshotUpload;
