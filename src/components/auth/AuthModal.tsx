import React, { useState } from 'react';
import {
  User,
  Shield,
  Briefcase,
  Lock,
  Mail,
  Phone,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import {
  TradeCategory,
  AvailabilityStatus,
  CustomerLocation,
} from '../../types';
import { DEFAULT_CUSTOMER_LOCATION } from '../../data/mockWorkers';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup_customer' | 'signup_worker';
}

const TRADE_OPTIONS: TradeCategory[] = [
  'AC Technician',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Mechanic',
  'Appliance Repair',
  'Cleaning Professional',
  'Mason / General Technician',
];

const SKILL_CATALOG: Partial<Record<TradeCategory, string[]>> = {
  'AC Technician': ['Inverter Compressor', 'Gas Refill', 'Leak Detection', 'Coil Cleaning', 'PCB Board Repair'],
  'Plumber': ['PPR Pipe Welding', 'Pressure Booster', 'Drain Snake', 'Fixture Installation', 'Concealed Leak Detection'],
  'Electrician': ['MCB Tripping Diagnostic', 'Phase Balancing', 'Rewiring', 'Inverter Battery Backup', 'Appliance Earthing'],
  'Carpenter': ['Modular Cabinet Fitting', 'Hinge Alignment', 'Hardwood Restoration', 'Lock Mortising', 'Custom Shelving'],
  'Painter': ['Waterproofing Primer', 'Airless Spray', 'Stucco Texture', 'Interior Emulsion', 'Damp Proofing'],
  'Mechanic': ['Engine Diagnostic', 'Brake Pad Replacement', 'Carburetor Tuning', 'Battery Charging', 'Suspension Overhaul'],
  'Appliance Repair': ['Washing Machine Drum', 'Microwave Magnetron', 'Refrigerator Thermostat', 'RO Membrane', 'Geyser Element'],
  'Cleaning Professional': ['Deep Kitchen Sanitization', 'Sofa Upholstery Shampoo', 'Bathroom Descaling', 'Floor Polishing', 'Balcony Cleaning'],
  'Mason / General Technician': ['Tile Grouting', 'Plaster Patching', 'Wall Drilling', 'Drilling & Mounting', 'Crack Filling'],
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signupCustomer, signupWorker, switchRole } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup_customer' | 'signup_worker'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode when initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
  }, [initialMode, isOpen]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer signup state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerLocationGranted, setCustomerLocationGranted] = useState(true);
  const [customerSelectedTrades, setCustomerSelectedTrades] = useState<TradeCategory[]>(['AC Technician']);
  const [customerPriceSensitivity, setCustomerPriceSensitivity] = useState<'low' | 'medium' | 'high'>('medium');

  // Worker progressive onboarding state (4 steps)
  const [workerStep, setWorkerStep] = useState<1 | 2 | 3 | 4>(1);
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  
  const [workerTrade, setWorkerTrade] = useState<TradeCategory>('AC Technician');
  const [workerSkills, setWorkerSkills] = useState<string[]>(['Inverter Compressor', 'Gas Refill']);
  const [workerExp, setWorkerExp] = useState<number>(5);

  const [workerBaseAddress, setWorkerBaseAddress] = useState('Indiranagar, Bengaluru');
  const [workerAvailability, setWorkerAvailability] = useState<AvailabilityStatus>('immediate');

  const [workerHourlyRate, setWorkerHourlyRate] = useState<number>(500);
  const [workerQuote, setWorkerQuote] = useState<number>(700);
  const [workerLicense, setWorkerLicense] = useState('');
  const [workerConsent, setWorkerConsent] = useState(true);

  // Toggle skill selection for worker
  const toggleWorkerSkill = (skill: string) => {
    setWorkerSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Toggle trade interest for customer
  const toggleCustomerTrade = (trade: TradeCategory) => {
    setCustomerSelectedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
    );
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      showToast({
        type: 'success',
        title: 'Signed In Successfully',
        message: 'Welcome back to WorkLink.',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (role: 'customer' | 'worker' | 'operator') => {
    setErrorMsg(null);
    switchRole(role);
    const roleTitles = {
      customer: 'Customer Priya Sharma',
      worker: 'Worker Rajesh Kumar (Master HVAC)',
      operator: 'Platform Operator Anita Roy',
    };
    showToast({
      type: 'info',
      title: 'Active Session Switched',
      message: `Signed in as ${roleTitles[role]}.`,
    });
    onClose();
  };

  // Submit Customer Signup
  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await signupCustomer({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        password: customerPassword,
        location: DEFAULT_CUSTOMER_LOCATION,
        locationPermissionGranted: customerLocationGranted,
        preferredTrades: customerSelectedTrades,
        priceSensitivity: customerPriceSensitivity,
      });

      showToast({
        type: 'success',
        title: 'Account Created',
        message: 'Welcome to WorkLink! Your dynamic 10 km service zone is activated.',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Worker Signup
  const handleWorkerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await signupWorker({
        name: workerName,
        email: workerEmail,
        phone: workerPhone,
        password: workerPassword,
        trade: workerTrade,
        skills: workerSkills,
        experienceYears: Number(workerExp),
        baseAddress: workerBaseAddress,
        coordinates: { lat: 12.9784, lng: 77.6408 },
        serviceRadiusKm: 10,
        hourlyRate: Number(workerHourlyRate),
        estimatedQuote: Number(workerQuote),
        availabilityStatus: workerAvailability,
        licenseNumber: workerLicense || `VERIF-${Date.now().toString().slice(-6)}`,
        backgroundCheckConsent: workerConsent,
      });

      showToast({
        type: 'success',
        title: 'Worker Profile Approved & Live',
        message: `Welcome aboard, ${workerName}! You are now visible in the WorkLink 10 km pool.`,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Worker registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login'
          ? 'Sign in to WorkLink'
          : mode === 'signup_customer'
          ? 'Create Customer Account'
          : 'Worker Professional Onboarding'
      }
      subtitle={
        mode === 'login'
          ? 'Access your matched services and booking tracking'
          : mode === 'signup_customer'
          ? 'Only essential info needed for instant 10 km matching'
          : `Step ${workerStep} of 4: Progressive Skill & License Registration`
      }
      size={mode === 'signup_worker' ? 'lg' : 'md'}
    >
      <div className="space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-start space-x-2.5 text-xs text-[#FF3B30] animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Switcher Strip - Supreme convenience for Hackathon Evaluation */}
        <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-black/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
              1-Click Demo Evaluation Profiles
            </span>
            <Badge variant="accent" size="sm">
              Instant
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer')}
              className="p-2 rounded-xl bg-white hover:bg-black/5 border border-black/5 text-left transition-all"
            >
              <div className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0071E3]" />
                <span className="text-xs font-semibold text-[#111111] truncate">Customer</span>
              </div>
              <span className="text-[10px] text-[#86868B] block truncate">Priya (Indiranagar)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('worker')}
              className="p-2 rounded-xl bg-white hover:bg-black/5 border border-black/5 text-left transition-all"
            >
              <div className="flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#34C759]" />
                <span className="text-xs font-semibold text-[#111111] truncate">Worker</span>
              </div>
              <span className="text-[10px] text-[#86868B] block truncate">Rajesh (AC Pro)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('operator')}
              className="p-2 rounded-xl bg-white hover:bg-black/5 border border-black/5 text-left transition-all"
            >
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-[#AF52DE]" />
                <span className="text-xs font-semibold text-[#111111] truncate">Admin</span>
              </div>
              <span className="text-[10px] text-[#86868B] block truncate">Anita (Operations)</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* MODE: LOGIN */}
        {/* ==================================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="e.g. customer@worklink.ai or worker@worklink.ai"
              required
              leftIcon={<Mail className="w-4 h-4 text-[#86868B]" />}
            />

            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4 text-[#86868B]" />}
              helperText="Demo accounts use 'Password123'"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Sign In to Account
            </Button>

            <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#6E6E73]">
              <span>New to WorkLink?</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setMode('signup_customer')}
                  className="font-semibold text-[#0071E3] hover:underline"
                >
                  Join as Customer
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setMode('signup_worker')}
                  className="font-semibold text-[#111111] hover:underline"
                >
                  Join as Worker
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* MODE: CUSTOMER ONBOARDING (Collect only essential info) */}
        {/* ==================================================================== */}
        {mode === 'signup_customer' && (
          <form onSubmit={handleCustomerSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Aditi Rao"
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                helperText="For dispatch ETA alerts"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="aditi@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                placeholder="••••••••"
                required
                helperText="Minimum 6 characters"
              />
            </div>

            {/* Location Permission with Explicit Rationale */}
            <div className="p-3.5 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/20 space-y-2">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#111111]">
                    Location Permission Rationale
                  </h4>
                  <p className="text-[11px] text-[#0071E3] italic font-medium leading-relaxed mt-0.5">
                    &ldquo;WorkLink uses your location to find professionals who can actually reach you.&rdquo;
                  </p>
                </div>
              </div>
              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customerLocationGranted}
                  onChange={(e) => setCustomerLocationGranted(e.target.checked)}
                  className="rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <span className="text-xs text-[#111111] font-medium">
                  Grant permission to anchor 10 km service radius to current Bengaluru area
                </span>
              </label>
            </div>

            {/* Basic Preferences */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Services you most frequently require
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TRADE_OPTIONS.slice(0, 5).map((trade) => {
                  const isSelected = customerSelectedTrades.includes(trade);
                  return (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => toggleCustomerTrade(trade)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                      }`}
                    >
                      {trade}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Pricing Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCustomerPriceSensitivity(level)}
                    className={`p-2 rounded-xl text-xs font-medium text-center border transition-all capitalize ${
                      customerPriceSensitivity === level
                        ? 'bg-[#0071E3] text-white border-[#0071E3]'
                        : 'bg-[#F5F5F7] text-[#111111] border-black/5 hover:bg-[#EBEBEF]'
                    }`}
                  >
                    {level === 'low' ? 'Budget First' : level === 'medium' ? 'Balanced' : 'Master Expert'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Complete Registration &amp; Find Workers
            </Button>

            <div className="pt-2 text-center text-xs text-[#6E6E73]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-[#0071E3] hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* MODE: WORKER ONBOARDING (Progressive 4-Step Wizard) */}
        {/* ==================================================================== */}
        {mode === 'signup_worker' && (
          <form onSubmit={handleWorkerSignup} className="space-y-4">
            {/* Step Indicators */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              {[
                { num: 1, label: 'Identity' },
                { num: 2, label: 'Skills' },
                { num: 3, label: 'Zone' },
                { num: 4, label: 'Pricing & Govt ID' },
              ].map((s) => (
                <div key={s.num} className="flex items-center space-x-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      workerStep === s.num
                        ? 'bg-[#111111] text-white'
                        : workerStep > s.num
                        ? 'bg-[#34C759] text-white'
                        : 'bg-[#F0F0F2] text-[#86868B]'
                    }`}
                  >
                    {workerStep > s.num ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline ${
                      workerStep === s.num ? 'font-semibold text-[#111111]' : 'text-[#86868B]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* STEP 1: IDENTITY & CONTACT */}
            {workerStep === 1 && (
              <div className="space-y-3 animate-fade-in">
                <Input
                  label="Full Legal / Professional Name"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Mobile Number (Calls & Dispatches)"
                    type="tel"
                    value={workerPhone}
                    onChange={(e) => setWorkerPhone(e.target.value)}
                    placeholder="+91 98450 99887"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={workerEmail}
                    onChange={(e) => setWorkerEmail(e.target.value)}
                    placeholder="ramesh@worklink.pro"
                    required
                  />
                </div>
                <Input
                  label="Account Password"
                  type="password"
                  value={workerPassword}
                  onChange={(e) => setWorkerPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  helperText="Minimum 6 characters"
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (!workerName || !workerPhone || !workerEmail || !workerPassword) {
                        setErrorMsg('Please complete all contact and identity fields.');
                        return;
                      }
                      setErrorMsg(null);
                      setWorkerStep(2);
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Trade &amp; Skills
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: TRADE & SKILLS */}
            {workerStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    Primary Trade Category
                  </label>
                  <select
                    value={workerTrade}
                    onChange={(e) => {
                      const newTrade = e.target.value as TradeCategory;
                      setWorkerTrade(newTrade);
                      setWorkerSkills(SKILL_CATALOG[newTrade]?.slice(0, 2) || []);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-medium text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    {TRADE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    Select Your Verified Capabilities ({workerTrade})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(SKILL_CATALOG[workerTrade] || []).map((skill) => {
                      const isSelected = workerSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleWorkerSkill(skill)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#111111] text-white shadow-xs'
                              : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111] hover:bg-[#EBEBEF]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Years of Field Experience"
                  type="number"
                  min={1}
                  max={45}
                  value={workerExp}
                  onChange={(e) => setWorkerExp(Number(e.target.value))}
                  helperText="Evaluated against matching job requirements"
                />

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWorkerStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (workerSkills.length === 0) {
                        setErrorMsg('Please select at least one specialized skill.');
                        return;
                      }
                      setErrorMsg(null);
                      setWorkerStep(3);
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Service Area
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: SERVICE AREA & AVAILABILITY */}
            {workerStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  label="Primary Operating Base / District"
                  value={workerBaseAddress}
                  onChange={(e) => setWorkerBaseAddress(e.target.value)}
                  placeholder="e.g. Koramangala / Indiranagar"
                  leftIcon={<MapPin className="w-4 h-4 text-[#86868B]" />}
                  helperText="Your dynamic 10 km service radius is anchored from here"
                />

                <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/5">
                  <span className="text-xs font-semibold text-[#111111] block mb-1">
                    WorkLink 10 km Service Guarantee
                  </span>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    You will only be dispatched for customers within your 10 km radius.
                    Jobs within 5 km have zero travel deductions; jobs between 5–10 km include your configured travel allowance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    Initial Availability Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'immediate' as const, label: 'Available Now', desc: 'Accepting dispatches' },
                      { status: 'today' as const, label: 'Today (Slots)', desc: '2–4 hrs window' },
                      { status: 'tomorrow' as const, label: 'Tomorrow', desc: 'Next-day booking' },
                    ].map((item) => (
                      <button
                        key={item.status}
                        type="button"
                        onClick={() => setWorkerAvailability(item.status)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          workerAvailability === item.status
                            ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                            : 'bg-[#F5F5F7] text-[#111111] border-black/5 hover:bg-[#EBEBEF]'
                        }`}
                      >
                        <span className="text-xs font-semibold block">{item.label}</span>
                        <span
                          className={`text-[10px] block ${
                            workerAvailability === item.status ? 'text-white/70' : 'text-[#86868B]'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWorkerStep(2)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (!workerBaseAddress) {
                        setErrorMsg('Please specify your base address.');
                        return;
                      }
                      setErrorMsg(null);
                      setWorkerStep(4);
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Pricing &amp; Verification
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: PRICING & VERIFICATION INFORMATION */}
            {workerStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Hourly Rate (₹/hr)"
                    type="number"
                    min={200}
                    max={3000}
                    value={workerHourlyRate}
                    onChange={(e) => setWorkerHourlyRate(Number(e.target.value))}
                    leftIcon={<DollarSign className="w-4 h-4 text-[#86868B]" />}
                    helperText="Transparent hourly pricing"
                  />
                  <Input
                    label="Standard Diagnostic Quote (₹)"
                    type="number"
                    min={200}
                    max={2500}
                    value={workerQuote}
                    onChange={(e) => setWorkerQuote(Number(e.target.value))}
                    leftIcon={<DollarSign className="w-4 h-4 text-[#86868B]" />}
                    helperText="Initial visit + inspection"
                  />
                </div>

                <Input
                  label="Government ID / Trade License / Certificate Number"
                  value={workerLicense}
                  onChange={(e) => setWorkerLicense(e.target.value)}
                  placeholder="e.g. DL-AC-2022-7712 or GOVT-ITI-449"
                  leftIcon={<Award className="w-4 h-4 text-[#86868B]" />}
                  required
                  helperText="Required for Verified Pro badge"
                />

                <div className="p-3.5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#111111]">
                    <span className="font-semibold block">Automatic Verification Tier</span>
                    <span className="text-[#6E6E73] text-[11px] leading-relaxed block mt-0.5">
                      Your profile will instantly be granted the Verified Pro badge and enrolled in the live dispatch engine.
                    </span>
                  </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={workerConsent}
                    onChange={(e) => setWorkerConsent(e.target.checked)}
                    className="rounded text-[#0071E3] focus:ring-[#0071E3]"
                  />
                  <span className="text-xs text-[#111111] font-medium">
                    I declare my trade experience is authentic and consent to WorkLink verification terms.
                  </span>
                </label>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWorkerStep(3)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    rightIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Complete Onboarding &amp; Go Live
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-xs text-[#6E6E73]">
              Already registered as a professional?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-[#0071E3] hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
