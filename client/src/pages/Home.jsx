import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, LogIn, LayoutDashboard } from 'lucide-react';
import Hero from '../components/Hero';
import DropZone from '../components/DropZone';
import ResultCard from '../components/ResultCard';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';

function Home() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setExtractedText('');
      setImageUrl('');
    }
  };

  const handleUpload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

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

      await axios.post('http://localhost:3000/api/screenshots/upload', formData, config);
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to upload and process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 p-6 font-sans">
      <div className="max-w-5xl mx-auto pt-32 flex flex-col items-center gap-12">
        <Hero />



        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col w-full max-w-2xl min-h-[400px]">
          {!user ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full gap-8">
              <p className="text-xl md:text-2xl font-semibold text-slate-300 max-w-2xl mx-auto leading-relaxed text-center">
                You need to sign up or log in to use this feature.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white flex-1 flex justify-center items-center rounded-full font-bold transition-all shadow-lg shadow-indigo-500/25"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 flex-1 flex justify-center items-center rounded-full font-bold transition-all border border-slate-700"
                >
                  Log In
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 w-full justify-center">
              <DropZone onFileChange={handleFileChange} file={file} />

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="mt-8 flex justify-center w-full">
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className={`
                                  relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 w-full justify-center
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
