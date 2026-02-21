import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Calendar, Eye, Loader, LogOut, Upload, Grid, Trash2, Copy, Check, Clock, Star, Square, CheckSquare, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScreenshotUpload from '../components/ScreenshotUpload';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const [screenshots, setScreenshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get(
        'http://localhost:3000/api/screenshots/history',
        config
      );

      if (Array.isArray(response.data)) {
        setScreenshots(response.data);
      } else {
        setScreenshots([]);
        console.error('API response is not an array:', response.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Server Connection Failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 100);
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.post('http://localhost:3000/api/screenshots/upload', formData, config);
      setScreenshots(prev => [response.data, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.response && err.response.status === 413) {
        alert('File too large. Please select a smaller image.');
      } else {
        alert('Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const initiateDelete = (id) => {
    setDeletingId(id);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/screenshots/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setScreenshots((prev) => prev.filter((s) => s._id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      setDeletingId(null);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text || '');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateScreenshot = async (id, updates) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/screenshots/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setScreenshots((prev) => prev.map((s) => s._id === id ? { ...s, ...response.data } : s));
    } catch (error) {
      console.error('Error updating screenshot:', error);
    }
  };

  const handleReminderChange = (id, date) => {
    updateScreenshot(id, { reminderDate: date });
  };

  const handleExportPDF = async (item) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxLineWidth = pageWidth - (margin * 2);
      let currentY = margin;

      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      const title = item.title || 'VisionTask Export';
      const titleLines = doc.splitTextToSize(title, maxLineWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 20) + 10;

      if (item.imageUrl) {
        const response = await fetch(`${item.imageUrl}?t=${new Date().getTime()}`, { mode: 'cors' });
        const blob = await response.blob();
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        img.src = base64data;
        await new Promise((resolve) => { img.onload = resolve; });

        const imgWidth = maxLineWidth;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(base64data, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      const textLines = doc.splitTextToSize(item.extractedText || 'No text found.', maxLineWidth);

      for (let i = 0; i < textLines.length; i++) {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(textLines[i], margin, currentY);
        currentY += 14;
      }

      doc.save(`${title.replace(/\\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Export failed. Check console.");
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <div className='max-w-7xl mx-auto'>

        {isUploading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-blue-400 font-medium animate-pulse text-lg">Analyzing content...</p>
          </div>
        )}

        <div className='flex justify-between items-center mb-8 pt-20'>
          <div>
            <h1 className='text-3xl font-bold text-white'>Your Dashboard</h1>
            <p className='text-gray-400 mt-1'>
              Welcome back, <span className='text-blue-400'>{user?.name || 'User'}</span>
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
          {(!screenshots || screenshots.length === 0) && (
            <div className='flex bg-gray-800 rounded-lg p-1 border border-gray-700 opacity-0 pointer-events-none absolute'>
            </div>
          )}
        </div>

        {error ? (
          <div className='text-center py-20 bg-gray-800 rounded-lg border border-red-900/50'>
            <p className='text-red-400 text-xl font-bold mb-2'>Error Loading Data</p>
            <p className='text-gray-400 mb-4'>{error}</p>
            <button
              onClick={fetchHistory}
              className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className='flex justify-center py-20'>
            <Loader className='w-10 h-10 text-blue-500 animate-spin' />
          </div>
        ) : (!screenshots || screenshots.length === 0) ? (
          <div className='text-center py-20 bg-gray-800 rounded-lg border border-gray-700'>
            <p className='text-gray-400 text-xl'>No screenshots uploaded yet.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-blue-400 hover:text-blue-300 underline"
            >
              Upload your first screenshot
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {screenshots.map((item) => (
              <div
                key={item?._id || Math.random()}
                id={`screenshot-card-${item?._id}`}
                className={`bg-gray-800 rounded-lg overflow-hidden border ${item?.isPinned ? 'border-yellow-500 shadow-yellow-500/20' : 'border-gray-700'} shadow-lg hover:shadow-2xl transition-all duration-300 relative`}
              >
                {deletingId === item?._id && (
                  <div className='absolute inset-0 z-20 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200'>
                    <p className='text-white font-bold text-lg mb-6'>Are you sure?</p>
                    <div className='flex gap-3'>
                      <button
                        onClick={() => confirmDelete(item._id)}
                        className='bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20'
                      >
                        Confirm
                      </button>
                      <button
                        onClick={cancelDelete}
                        className='bg-gray-700 hover:bg-gray-600 text-gray-200 px-5 py-2 rounded-lg font-medium transition-colors'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className='h-48 overflow-hidden bg-gray-700 group relative'>
                  <ImageWithLoader src={item?.imageUrl ? `${item.imageUrl}?t=${new Date().getTime()}` : ''} alt='Screenshot' />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={item?.imageUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-white bg-blue-600 px-4 py-2 rounded-full text-sm font-bold">View Full Image</a>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    {item?.category === 'Note' && (
                      <button
                        onClick={() => updateScreenshot(item._id, { isPinned: !item.isPinned })}
                        className={`p-1 rounded-full ${item.isPinned ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 bg-black/40'}`}
                      >
                        <Star className={`w-4 h-4 ${item.isPinned ? 'fill-yellow-400' : ''}`} />
                      </button>
                    )}
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md
                      ${(item?.category || 'General') === 'Task' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        (item?.category || 'General') === 'Note' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          (item?.category || 'General') === 'Reminder' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'}
                    `}>
                      {item?.category || 'General'}
                    </span>
                  </div>
                </div>
                <div className='p-6'>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className={`text-white font-bold text-lg truncate flex-1 ${item?.status ? 'line-through text-gray-500' : ''}`} title={item?.title || 'Untitled'}>
                      {item?.title || 'Untitled Screenshot'}
                    </h3>
                    {item?.category === 'Task' && (
                      <button
                        onClick={() => updateScreenshot(item._id, { status: !item.status })}
                        className={`mt-1 ${item.status ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                      >
                        {item.status ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    )}
                  </div>

                  <div className='flex items-center text-gray-400 text-sm mb-4 flex-wrap gap-3'>
                    <div className="flex items-center">
                      <Calendar className='w-4 h-4 mr-2' />
                      {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Date unknown'}
                    </div>
                    {item?.category === 'Reminder' && (
                      <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs relative group-date">
                        <Clock className="w-3 h-3 mr-1" />
                        <input
                          type="date"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleReminderChange(item._id, e.target.value)}
                          value={item.reminderDate ? new Date(item.reminderDate).toISOString().split('T')[0] : ''}
                        />
                        {item.reminderDate ? new Date(item.reminderDate).toLocaleDateString() : 'Set Date'}
                      </div>
                    )}
                    {item?.suggestedDate && !item.reminderDate && (
                      <div className="text-xs text-blue-400 italic">
                        Suggestion: {item.suggestedDate}
                      </div>
                    )}
                  </div>
                  <div className='bg-gray-900 p-3 rounded-lg mb-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent text-sm text-gray-300'>
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!inline && match) {
                            return (
                              <SyntaxHighlighter
                                language={match[1]}
                                style={vscDarkPlus}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {item?.extractedText || 'No description available.'}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center justify-between mt-4" data-html2canvas-ignore="true">
                    <button
                      onClick={() => handleExportPDF(item)}
                      className='flex items-center text-green-400 hover:text-green-300 transition-colors text-sm'
                    >
                      <Download className='w-4 h-4 mr-2' />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleCopy(item?._id, item?.extractedText)}
                      className='flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm'
                    >
                      {copiedId === item?._id ? (
                        <>
                          <Check className='w-4 h-4 mr-2' />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className='w-4 h-4 mr-2' />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => initiateDelete(item?._id)}
                      className='flex items-center text-red-400 hover:text-red-300 transition-colors text-sm'
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const ImageWithLoader = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const imageSrc = src.startsWith('http') ? src : `http://localhost:3000${src}`;

  return (
    <>
      {!loaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        crossOrigin="anonymous"
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
};

export default Dashboard;
