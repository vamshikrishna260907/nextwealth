import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Plus, Trash2, Sparkles, TrendingUp, Wallet, ArrowRight, Loader2, AlertCircle, 
  Calendar, User, LogOut, Briefcase, CreditCard, Edit3, Lock, Mail, CheckCircle2,
  PieChart as PieIcon, BarChart3, Filter, Shield, ChevronRight, Zap, Target, TrendingDown, Layers
} from 'lucide-react';

// --- Categories & Custom Neon Palette ---
const CATEGORIES = [
  'Food & Dining', 
  'Travel & Transport', 
  'Shopping & Lifestyle', 
  'Bills & Utilities', 
  'Entertainment', 
  'Health & Fitness', 
  'Education & Upskilling', 
  'Investments',
  'Other'
];

const CATEGORY_COLORS = {
  'Food & Dining': '#10b981',        // Emerald
  'Travel & Transport': '#0ea5e9',     // Sky Blue
  'Shopping & Lifestyle': '#f43f5e',    // Rose
  'Bills & Utilities': '#f59e0b',     // Amber
  'Entertainment': '#8b5cf6',       // Purple
  'Health & Fitness': '#ec4899',       // Pink
  'Education & Upskilling': '#3b82f6', // Blue
  'Investments': '#06b6d4',           // Cyan
  'Other': '#64748b'                  // Slate
};

const PAYMENT_METHODS = ['UPI (GPay/PhonePe)', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'];

const PROFESSIONS = [
  'Software Engineer / IT Professional',
  'College Student',
  'Freelancer / Digital Creator',
  'Business Owner / Entrepreneur',
  'Healthcare / Doctor',
  'Finance & Accounting',
  'Creative / Designer',
  'Other Professional'
];

// Seed expenses for Alex Sharma demo account
const SEED_EXPENSES = [
  { id: 'seed-1', amount: 4500, category: 'Food & Dining', description: 'Swiggy & Zomato Monthly Orders', paymentMethod: 'UPI (GPay/PhonePe)', dateString: '2026-10-24', timestamp: new Date('2026-10-24').getTime() },
  { id: 'seed-2', amount: 12500, category: 'Bills & Utilities', description: 'Apartment Rent & Wi-Fi', paymentMethod: 'Net Banking', dateString: '2026-10-05', timestamp: new Date('2026-10-05').getTime() },
  { id: 'seed-3', amount: 3200, category: 'Travel & Transport', description: 'Uber & Fuel Top-up', paymentMethod: 'Credit Card', dateString: '2026-10-18', timestamp: new Date('2026-10-18').getTime() },
  { id: 'seed-4', amount: 5000, category: 'Investments', description: 'Nifty 50 Index Fund SIP', paymentMethod: 'Net Banking', dateString: '2026-10-01', timestamp: new Date('2026-10-01').getTime() },
  { id: 'seed-5', amount: 2800, category: 'Shopping & Lifestyle', description: 'Diwali Festive Apparel', paymentMethod: 'Credit Card', dateString: '2026-10-12', timestamp: new Date('2026-10-12').getTime() },
  { id: 'seed-6', amount: 899, category: 'Entertainment', description: 'Netflix & Spotify Premium', paymentMethod: 'UPI (GPay/PhonePe)', dateString: '2026-10-02', timestamp: new Date('2026-10-02').getTime() },
  { id: 'seed-7', amount: 14500, category: 'Bills & Utilities', description: 'Sep Rent & Electricity', paymentMethod: 'Net Banking', dateString: '2026-09-04', timestamp: new Date('2026-09-04').getTime() },
  { id: 'seed-8', amount: 5800, category: 'Food & Dining', description: 'Team Outing & Cafes', paymentMethod: 'Credit Card', dateString: '2026-09-20', timestamp: new Date('2026-09-20').getTime() },
  { id: 'seed-9', amount: 4200, category: 'Education & Upskilling', description: 'Cloud Certification Exam', paymentMethod: 'UPI (GPay/PhonePe)', dateString: '2026-09-15', timestamp: new Date('2026-09-15').getTime() },
  { id: 'seed-10', amount: 3500, category: 'Health & Fitness', description: 'Quarterly Gym Membership', paymentMethod: 'Debit Card', dateString: '2026-08-10', timestamp: new Date('2026-08-10').getTime() }
];

export default function ExpenseTracker() {
  // Authentication & Session States
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthModeRegister, setIsAuthModeRegister] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form states for sign up / sign in
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authProfession, setAuthProfession] = useState('Software Engineer / IT Professional');
  const [authError, setAuthError] = useState('');

  // Per-user isolated database store
  const [userStore, setUserStore] = useState({
    'alex@nexawealth.ai': {
      profile: {
        name: 'Alex Sharma',
        email: 'alex@nexawealth.ai',
        password: 'password123',
        profession: 'Software Engineer / IT Professional'
      },
      expenses: SEED_EXPENSES
    }
  });

  // Logged-in Active Session Profile
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profession: 'Software Engineer / IT Professional'
  });

  // Edit Profession Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempProfession, setTempProfession] = useState('Software Engineer / IT Professional');

  // Active User Expense Database
  const [expenses, setExpenses] = useState([]);

  // Form inputs for logging expense
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Selected Filter Month
  const [selectedMonth, setSelectedMonth] = useState(() => 
    new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  );

  // AI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiError, setAiError] = useState('');

  // Submit Sign In or Register
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPassword) {
      setAuthError('Please complete all required fields.');
      return;
    }

    const trimmedEmail = authEmail.trim().toLowerCase();

    if (isAuthModeRegister) {
      if (!authName) {
        setAuthError('Please enter your full name.');
        return;
      }

      if (userStore[trimmedEmail]) {
        setAuthError('An account with this email already exists. Please sign in.');
        return;
      }

      const newProfile = {
        name: authName,
        email: trimmedEmail,
        password: authPassword,
        profession: authProfession
      };

      // Register new user with isolated blank expense list
      setUserStore(prev => ({
        ...prev,
        [trimmedEmail]: {
          profile: newProfile,
          expenses: []
        }
      }));

      setProfile(newProfile);
      setExpenses([]);
      setCurrentUserEmail(trimmedEmail);
      setIsLoggedIn(true);
      setAiAdvice('');
    } else {
      // Sign In mode
      const existingAccount = userStore[trimmedEmail];
      if (!existingAccount) {
        setAuthError('Account not found. Please register a new account.');
        return;
      }

      if (existingAccount.profile.password && existingAccount.profile.password !== authPassword) {
        setAuthError('Invalid password. Please try again.');
        return;
      }

      setProfile(existingAccount.profile);
      setExpenses(existingAccount.expenses || []);
      setCurrentUserEmail(trimmedEmail);
      setIsLoggedIn(true);
      setAiAdvice('');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserEmail('');
    setAiAdvice('');
    setAuthError('');
  };

  const handleUpdateProfession = () => {
    const updatedProfile = { ...profile, profession: tempProfession };
    setProfile(updatedProfile);
    setShowEditProfileModal(false);
    setAiAdvice('');

    if (currentUserEmail) {
      setUserStore(prev => ({
        ...prev,
        [currentUserEmail]: {
          ...prev[currentUserEmail],
          profile: updatedProfile
        }
      }));
    }
  };

  // Distinct available months across expense dates
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    const currentMonthStr = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    monthSet.add(currentMonthStr);

    expenses.forEach(exp => {
      const d = new Date(exp.timestamp);
      if (!isNaN(d.getTime())) {
        const monthYear = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        monthSet.add(monthYear);
      }
    });

    return Array.from(monthSet);
  }, [expenses]);

  // Expenses filtered by selected month
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const d = new Date(exp.timestamp);
      if (isNaN(d.getTime())) return false;
      const expMonth = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      return expMonth === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  // Sorted expenses (newest first)
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredExpenses]);

  // Grouped expenses by month
  const groupedExpenses = useMemo(() => {
    const groups = {};
    sortedExpenses.forEach(exp => {
      const month = new Date(exp.timestamp).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      if (!groups[month]) groups[month] = [];
      groups[month].push(exp);
    });
    return groups;
  }, [sortedExpenses]);

  // Total amount spent in selected month
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [filteredExpenses]);

  // Daily average calculation
  const dailyAverage = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    const now = new Date();
    const dayOfMonth = now.getDate();
    return Math.round(totalExpenses / (dayOfMonth || 1));
  }, [filteredExpenses, totalExpenses]);

  // Category summary for Recharts Pie Chart
  const chartData = useMemo(() => {
    const totals = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {});
    
    return Object.keys(totals).map(cat => ({
      name: cat,
      value: totals[cat]
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Top category
  const topCategory = useMemo(() => {
    if (chartData.length === 0) return 'N/A';
    return chartData[0].name;
  }, [chartData]);

  // Monthly Spending Trend for Recharts Bar Chart
  const monthlyTrendData = useMemo(() => {
    const monthTotals = {};
    expenses.forEach(exp => {
      const month = new Date(exp.timestamp).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthTotals[month] = (monthTotals[month] || 0) + Number(exp.amount);
    });
    return Object.keys(monthTotals).map(m => ({ month: m, amount: monthTotals[m] })).reverse();
  }, [expenses]);

  // Add Expense Handler
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const customTimestamp = expenseDate ? new Date(expenseDate).getTime() : Date.now();

    const newExpense = {
      id: `exp-${Date.now()}`,
      amount: Number(amount),
      category,
      description,
      paymentMethod,
      dateString: expenseDate,
      timestamp: customTimestamp
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);

    if (currentUserEmail) {
      setUserStore(prev => ({
        ...prev,
        [currentUserEmail]: {
          ...prev[currentUserEmail],
          expenses: updatedExpenses
        }
      }));
    }

    const newMonthYear = new Date(customTimestamp).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    setSelectedMonth(newMonthYear);

    setAmount('');
    setDescription('');
  };

  // Delete Expense Handler
  const handleDeleteExpense = (id) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);

    if (currentUserEmail) {
      setUserStore(prev => ({
        ...prev,
        [currentUserEmail]: {
          ...prev[currentUserEmail],
          expenses: updatedExpenses
        }
      }));
    }
  };

  // Call Google Gemini API for Bullet Point Advice
  const generateAITips = async () => {
    if (filteredExpenses.length === 0) {
      setAiError(`Add a few expenses for ${selectedMonth} to get AI recommendations.`);
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiAdvice('');

    const expenseSummary = chartData.map(d => `${d.name}: ₹${d.value}`).join(', ');
    
    const prompt = `You are Nexa AI, a high-impact financial wealth advisor in India.
The user is a "${profile.profession}" named "${profile.name}".
Their categorized expenses for "${selectedMonth}" in Indian Rupees (₹) are: [${expenseSummary}].
Total spent this month: ₹${totalExpenses}.

CRITICAL FORMATTING INSTRUCTION:
- Respond ONLY with 3 to 4 bullet points.
- Do NOT write long introductory or concluding paragraphs.
- EVERY single bullet point MUST start with a relevant high-impact emoji, followed by a BOLD key action phrase, and then 1 concise sentence of direct advice tailored for a ${profile.profession} in India.
- Format strictly as:
  • 💡 **Bold Heading**: Concise 1-sentence action advice.
- Example profession hacks: 80C/NPS tax savings or tech gear depreciation for IT/Engineers, GST/cashflow buffer for Business Owners, student mess/bus pass discounts for Students, Section 44ADA for Freelancers/Creators.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('API Request Failed');
      
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setAiAdvice(text);
      } else {
        setAiError("Couldn't generate advice right now. Please try again.");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setAiError("Unable to reach Nexa AI. Please check network connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Parse Bullet Points into Clean JSX
  const parsedBulletPoints = useMemo(() => {
    if (!aiAdvice) return [];
    return aiAdvice
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-\*]\s*/, ''));
  }, [aiAdvice]);

  // Loading Screen State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-200">
        <div className="flex flex-col items-center gap-5 animate-pulse">
          <Wallet className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]" />
          <p className="text-xl font-medium tracking-widest text-emerald-300">Loading NexaWealth...</p>
        </div>
      </div>
    );
  }

  // --- LOGIN & ONBOARDING VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0b0f19] to-black text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 mb-4 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]">
              <Wallet className="w-9 h-9 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-indigo-400 tracking-tight">
              NexaWealth
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">Smart AI Expense Tracker tailored to your Career</p>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-white/5">
            <button
              onClick={() => { setIsAuthModeRegister(true); setAuthError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isAuthModeRegister ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Get Started
            </button>
            <button
              onClick={() => { setIsAuthModeRegister(false); setAuthError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isAuthModeRegister ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 text-center">
            💡 Demo Login: <span className="font-mono font-bold">alex@nexawealth.ai</span> / <span className="font-mono font-bold">password123</span>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isAuthModeRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                    placeholder="e.g. Rahul Verma"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                  placeholder="rahul@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isAuthModeRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Profession / Career
                </label>
                <div className="relative">
                  <Briefcase className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <select
                    value={authProfession}
                    onChange={(e) => setAuthProfession(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm [&>option]:bg-slate-900 transition-all cursor-pointer"
                  >
                    {PROFESSIONS.map((prof) => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 text-base tracking-wide"
            >
              {isAuthModeRegister ? 'Create Account & Continue' : 'Sign In'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Secured with Nexa AI Core
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-[#0b0f19] to-black text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Wallet className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-purple-400">
              NexaWealth
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Personalized Intelligent Financial Hub</p>
          </div>
        </div>

        {/* User Pill & Month Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 px-3.5 py-2 rounded-xl shadow-inner text-sm">
            <Calendar className="w-4 h-4 text-sky-400" />
            <select 
              value={selectedMonth} 
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setAiAdvice('');
              }}
              className="bg-transparent border-none text-slate-200 outline-none font-semibold focus:ring-0 [&>option]:bg-slate-900 cursor-pointer text-sm"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-emerald-500/30 px-4 py-2 rounded-xl shadow-lg">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-none">{profile.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5" />
                  {profile.profession}
                </span>
                <button
                  onClick={() => {
                    setTempProfession(profile.profession);
                    setShowEditProfileModal(true);
                  }}
                  className="text-slate-400 hover:text-white text-[10px] underline ml-1"
                  title="Edit Profession"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="ml-2 text-slate-400 hover:text-rose-400 transition-colors p-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Profession AI Advisor */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Total Spent ({selectedMonth})</p>
              <p className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-4 shadow-xl">
              <p className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">Daily Avg ({selectedMonth})</p>
              <p className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                ₹{dailyAverage.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-xl">
              <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider">Top Category</p>
              <p className="text-sm sm:text-base font-bold text-white mt-1.5 truncate">
                {topCategory}
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-xl">
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Active Career</p>
              <p className="text-xs font-bold text-slate-200 mt-1.5 truncate" title={profile.profession}>
                {profile.profession}
              </p>
            </div>
          </div>

          {/* Quick Log Form */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5 text-white tracking-wide">
              <Plus className="w-5 h-5 text-emerald-400" />
              Quick Log Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none text-base font-semibold"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-sm [&>option]:bg-slate-900 cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="e.g. Swiggy order / Petrol refill"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-xs [&>option]:bg-slate-900 cursor-pointer"
                  >
                    {PAYMENT_METHODS.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                Add Transaction
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* AI Advisor Panel */}
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-black backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                  Nexa AI Bullet Advisor
                </h2>
              </div>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Concise bullet points & career tax hacks tailored for a <span className="text-emerald-300 font-semibold">{profile.profession}</span>.
              </p>

              {!aiAdvice && !isAiLoading && (
                <button
                  onClick={generateAITips}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold py-3 rounded-xl transition-all shadow-[inset_0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 text-sm"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Get Actionable Bullet Tips
                </button>
              )}

              {isAiLoading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs font-semibold text-emerald-200 tracking-wider">Formulating bullet tips for {profile.profession}...</span>
                </div>
              )}

              {aiError && (
                <div className="flex items-start gap-2.5 bg-rose-500/10 text-rose-300 p-3.5 rounded-xl text-xs border border-rose-500/30">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}

              {aiAdvice && !isAiLoading && (
                <div className="space-y-3">
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {parsedBulletPoints.map((point, idx) => (
                      <div 
                        key={idx}
                        className="bg-black/60 border border-emerald-500/20 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-inner"
                      >
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <div dangerouslySetInnerHTML={{ 
                          __html: point
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-300 font-bold">$1</strong>') 
                        }} />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateAITips}
                    className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold py-2.5 rounded-xl border border-emerald-500/20 transition-all"
                  >
                    Refresh Bullet Tips
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Charts & Ledger */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Charts Card */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <PieIcon className="w-5 h-5 text-sky-400" />
                Category Breakdown ({selectedMonth})
              </h2>

              <div className="h-60 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name] || '#64748b'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                        contentStyle={{ 
                          backgroundColor: '#090d16', 
                          borderRadius: '12px', 
                          borderColor: 'rgba(255,255,255,0.1)', 
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium">
                    No transaction records found for {selectedMonth}.
                  </div>
                )}
              </div>
            </div>

            {/* Spending Trend Bar Chart */}
            {monthlyTrendData.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Monthly Spending Comparison (₹)
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                        contentStyle={{ backgroundColor: '#090d16', borderRadius: '10px', borderColor: 'rgba(255,255,255,0.1)' }}
                      />
                      <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Month-Wise Transaction Ledger */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Ledger History
              </h2>
              <span className="text-xs text-slate-400 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                {filteredExpenses.length} Records ({selectedMonth})
              </span>
            </div>

            {sortedExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-400">No expenses recorded for this month.</p>
                <p className="text-xs mt-1">Use the quick log form to start recording your spending.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                {Object.entries(groupedExpenses).map(([month, monthExpenses]) => (
                  <div key={month} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{month}</span>
                      <span className="text-[10px] text-slate-500">({monthExpenses.length} items)</span>
                    </div>

                    <div className="space-y-2.5">
                      {monthExpenses.map((expense) => {
                        const catColor = CATEGORY_COLORS[expense.category] || '#64748b';
                        const dateFormatted = expense.dateString 
                          ? new Date(expense.dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(expense.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                        return (
                          <div 
                            key={expense.id} 
                            className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                                style={{ backgroundColor: catColor, boxShadow: `0 0 15px ${catColor}30` }}
                              >
                                {expense.category.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-100 text-sm leading-tight">{expense.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                  <span style={{ color: catColor }} className="font-medium">{expense.category}</span>
                                  <span>•</span>
                                  <span>{expense.paymentMethod || 'UPI'}</span>
                                  <span>•</span>
                                  <span>{dateFormatted}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-bold text-white text-base tracking-wide">
                                ₹{Number(expense.amount).toLocaleString('en-IN')}
                              </span>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-all"
                                title="Delete Expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Edit Profession Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Update Your Profession</h3>
            <p className="text-xs text-slate-400">
              Nexa AI will immediately customize all saving & tax tips for your updated career profile.
            </p>
            <select
              value={tempProfession}
              onChange={(e) => setTempProfession(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 [&>option]:bg-slate-900 cursor-pointer"
            >
              {PROFESSIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfession}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
              >
                Save Profession
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
