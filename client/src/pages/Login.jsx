import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  const { email, password } = formData;

  const navigate = useNavigate();
  const { login, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onChange = (e) => {
    setError(null);
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    try {
      await login(formData);
    } catch (err) {
      if (err.response && (err.response.status === 400 || err.response.status === 401)) {
        setError("Wrong credentials");
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700'>
        <div className='p-8'>
          <h2 className='text-3xl font-bold text-center text-white mb-2'>
            Welcome Back
          </h2>
          <p className='text-gray-400 text-center mb-8'>
            Sign in to access your dashboard
          </p>

          {error && (
            <div className='bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-6 text-sm text-center'>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className='space-y-6'>
            <div>
              <label className='block text-gray-400 text-sm font-medium mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-500' />
                </div>
                <input
                  type='email'
                  name='email'
                  value={email}
                  onChange={onChange}
                  className='w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all'
                  placeholder='you@example.com'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-gray-400 text-sm font-medium mb-2'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-500' />
                </div>
                <input
                  type='password'
                  name='password'
                  value={password}
                  onChange={onChange}
                  className='w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all'
                  placeholder='••••••••'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50'
              disabled={isLoading}
            >
              <LogIn className='h-5 w-5 mr-2' />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className='mt-6 text-center text-gray-400 text-sm'>
            Don't have an account?{' '}
            <Link to='/signup' className='text-blue-400 hover:text-blue-300 font-medium'>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
