import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { sendChatMessage, signupUser, signinUser, sendOTP, verifyOTP } from './services/api';
import { Sparkles, MessageSquare, Plus, Search, Share2, Check, User, Trash2, LogOut } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('shopmate_user') || null);
  const [authMode, setAuthMode] = useState('signin');
  const [authMethod, setAuthMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Load chats on login
  useEffect(() => {
    if (currentUser) {
      const savedChats = localStorage.getItem(`shopmate_chats_${currentUser}`);
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
        } else {
          const initialChat = { id: Date.now(), title: 'New Chat', messages: [] };
          setChats([initialChat]);
          setCurrentChatId(initialChat.id);
        }
      } else {
        const initialChat = { id: Date.now(), title: 'New Chat', messages: [] };
        setChats([initialChat]);
        setCurrentChatId(initialChat.id);
      }
    }
  }, [currentUser]);

  // Save chats on change
  useEffect(() => {
    if (currentUser && chats.length > 0) {
      localStorage.setItem(`shopmate_chats_${currentUser}`, JSON.stringify(chats));
    }
  }, [chats, currentUser]);

  if (!currentUser) {
    const handleAuth = async (e) => {
      e.preventDefault();
      setAuthError('');
      setAuthLoading(true);

      try {
        if (authMethod === 'password') {
          if (authMode === 'signup') {
            const res = await signupUser(email, password);
            localStorage.setItem('shopmate_user', res.username);
            setCurrentUser(res.username);
          } else {
            const res = await signinUser(email, password);
            localStorage.setItem('shopmate_user', res.username);
            setCurrentUser(res.username);
          }
        } else {
          // OTP flow submission
          if (!otpSent) {
            setAuthError('Please request an OTP first.');
            setAuthLoading(false);
            return;
          }
          const res = await verifyOTP(email, otp);
          localStorage.setItem('shopmate_user', res.username);
          setCurrentUser(res.username);
        }
      } catch (err) {
        setAuthError(typeof err === 'string' ? err : 'Authentication failed');
      } finally {
        setAuthLoading(false);
      }
    };

    const handleSendOtp = async () => {
      if (!email.trim()) {
        setAuthError("Please enter your email first.");
        return;
      }
      setAuthError('');
      setAuthLoading(true);
      try {
        const res = await sendOTP(email);
        setOtpSent(true);
        if (res.otp) {
          const typeLabel = res.type === 'phone' ? 'phone number' : 'email';
          alert(`DEVELOPMENT MODE\n\nYour mock OTP is: ${res.otp}\n\n(Normally this would be sent to your ${typeLabel})`);
        } else {
          alert(res.message || `OTP sent to ${email}`);
        }
      } catch (err) {
        setAuthError(typeof err === 'string' ? err : 'Failed to send OTP');
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-100 p-4 font-sans">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400">
              <Sparkles size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            {authMode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-center text-slate-400 mb-6 text-sm">
            {authMode === 'signin' 
              ? 'Sign in to access your personalized shopping advisor' 
              : 'Join ShopMate AI for the best shopping experience'}
          </p>
          
          <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl">
            <button 
              onClick={() => { setAuthMode('signin'); setOtpSent(false); setAuthError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${authMode === 'signin' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); setOtpSent(false); setAuthError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${authMode === 'signup' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email or Phone Number</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com or +1234567890" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                required
              />
            </div>

            {authMethod === 'password' ? (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">One-Time Password (OTP)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code" 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    required={authMethod === 'otp'}
                    disabled={!otpSent}
                  />
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-3 px-4 font-semibold transition-colors shadow-lg shadow-indigo-500/20 mt-2 flex items-center justify-center"
            >
              {authLoading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod(authMethod === 'password' ? 'otp' : 'password');
                  setAuthError('');
                }}
                className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-700 text-white rounded-xl py-3 px-4 font-medium transition-colors"
              >
                {authMethod === 'password' ? 'Use OTP instead' : 'Use Password instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentChat = chats.find(c => c.id === currentChatId) || { id: 'temp', title: 'Loading...', messages: [] };

  const handleSendMessage = async (query) => {
    const userMsg = { text: query, isAi: false };
    
    // Optimistic UI update
    let updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        // Update title if it's the first message
        const newTitle = chat.messages.length === 0 ? (query.length > 30 ? query.slice(0, 30) + '...' : query) : chat.title;
        return { ...chat, title: newTitle, messages: [...chat.messages, userMsg] };
      }
      return chat;
    });
    setChats(updatedChats);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(query);
      
      const aiMsg = {
        text: response.message,
        products: response.products || [],
        isAi: true
      };
      
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, aiMsg] };
        }
        return chat;
      }));
    } catch (error) {
      const errorMsg = {
        text: "I'm sorry, I encountered an error while fetching recommendations. Please ensure the backend is running and API keys are set.",
        isAi: true
      };
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, errorMsg] };
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat = { id: Date.now(), title: 'New Chat', messages: [] };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      const updatedChats = chats.filter(c => c.id !== chatId);
      if (updatedChats.length === 0) {
        const initialChat = { id: Date.now(), title: 'New Chat', messages: [] };
        setChats([initialChat]);
        setCurrentChatId(initialChat.id);
      } else {
        setChats(updatedChats);
        if (currentChatId === chatId) {
          setCurrentChatId(updatedChats[0].id);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shopmate_user');
    setCurrentUser(null);
    setChats([]);
    setCurrentChatId(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredChats = chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300">
        {/* User Profile */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 uppercase font-bold text-lg">
            {currentUser.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{currentUser}</h2>
            <p className="text-xs text-slate-400 truncate">ShopMate Member</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Search & New Chat */}
        <div className="p-4 space-y-3 border-b border-slate-800">
          <button 
            onClick={handleNewChat}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} /> New Chat
          </button>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.length === 0 ? (
            <p className="text-center text-slate-500 text-sm mt-4">No chats found</p>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                className={`w-full text-left flex items-center justify-between gap-2 px-3 py-3 rounded-lg transition-all group cursor-pointer ${
                  currentChatId === chat.id 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MessageSquare size={16} className={`shrink-0 ${currentChatId === chat.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  <div className="flex-1 truncate text-sm font-medium">
                    {chat.title}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">ShopMate <span className="text-indigo-400">AI</span></h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Personalized Shopping Advisor</p>
            </div>
          </div>
          
          <button 
            onClick={handleCopyLink}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors border ${
              isCopied 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
          >
            {isCopied ? <Check size={16} /> : <Share2 size={16} />}
            {isCopied ? 'Link Copied' : 'Share'}
          </button>
        </header>

        {/* Chat Window & Input */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {currentChat.messages ? (
            <ChatWindow messages={currentChat.messages} isLoading={isLoading} />
          ) : (
            <div className="flex-1 flex items-center justify-center">Loading...</div>
          )}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}

export default App;
