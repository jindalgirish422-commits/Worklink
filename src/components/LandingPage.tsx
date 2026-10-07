import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Compass,
  TrendingUp,
  RotateCcw,
  Wrench,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useToast } from './ui/Toast';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onFindWorkerClick: () => void;
  onExploreRadarClick: () => void;
  onViewIntelligenceClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onFindWorkerClick,
  onExploreRadarClick,
  onViewIntelligenceClick,
}) => {
  const { showToast } = useToast();
  const { openAuthModal } = useAuth();
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [proName, setProName] = useState('');
  const [proTrade, setProTrade] = useState('AC Technician');
  const [proPhone, setProPhone] = useState('');
  const [isSubmittingPro, setIsSubmittingPro] = useState(false);

  const handleProSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proName || !proPhone) return;

    setIsSubmittingPro(true);
    setTimeout(() => {
      setIsSubmittingPro(false);
      setIsWorkerModalOpen(false);
      setProName('');
      setProPhone('');
      showToast({
        type: 'success',
        title: 'Application Received',
        message: 'A WorkLink onboarding specialist will verify your trade license within 24 hours.',
      });
    }, 700);
  };

  return (
    <div className="space-y-24 sm:space-y-36 pb-20 animate-fade-in overflow-hidden">
      {/* ============================================================== */}
      {/* 1. HERO SECTION */}
      {/* ============================================================== */}
      <section className="pt-10 sm:pt-20">
        <Container size="2xl">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2">
              <Badge variant="accent" size="md">
                <Sparkles className="w-3.5 h-3.5 text-[#0071E3] mr-1" />
                Explainable Skilled-Labour Intelligence
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-hero text-[#111111] max-w-3xl mx-auto">
              The right person.
              <br />
              <span className="text-[#6E6E73]">For the right job.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-subheading max-w-2xl mx-auto text-base sm:text-lg sm:leading-relaxed">
              WorkLink intelligently matches you with skilled professionals based on what you need, where you are, when you need it, and what matters to you.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={onFindWorkerClick}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-8"
              >
                Find a Worker
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => openAuthModal('signup_worker')}
                className="w-full sm:w-auto px-7"
              >
                Become a Worker
              </Button>
            </div>
          </div>

          {/* Cinematic Visual: Need → Understanding → Match */}
          <div className="mt-14 sm:mt-20 max-w-5xl mx-auto">
            <div className="card-premium p-6 sm:p-10 bg-[#FFFFFF] relative overflow-hidden shadow-xl border border-black/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(0,113,227,0.08)] via-transparent to-transparent pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                {/* Node 1: Unstructured Need */}
                <div className="md:col-span-4 p-5 bg-[#F5F5F7] rounded-2xl border border-black/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B]">
                      01 • Customer Need
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#111111] font-medium leading-relaxed bg-[#FFFFFF] p-3.5 rounded-xl border border-black/5 shadow-2xs">
                    "My AC isn't cooling. I need someone tomorrow morning."
                  </p>
                  <p className="text-[11px] text-[#6E6E73]">
                    Natural language input — no complex trade drop-downs.
                  </p>
                </div>

                {/* Connecting Kinetic Center: WorkLink Understanding */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center mb-3 shadow-md">
                    <Zap className="w-6 h-6 text-[#0071E3]" />
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#111111]">
                    02 • AI Understanding
                  </span>
                  <p className="text-[11px] text-[#6E6E73] mt-1 max-w-xs">
                    Decodes trade, core skills, 10 km zone feasibility, and urgency constraints.
                  </p>
                  <div className="w-full max-w-[140px] h-0.5 bg-gradient-to-r from-transparent via-[#0071E3] to-transparent my-3" />
                  <span className="badge-subtle bg-[rgba(0,113,227,0.08)] text-[#0071E3] text-[10px] font-semibold">
                    Multi-Factor Calibration
                  </span>
                </div>

                {/* Node 3: The Match */}
                <div className="md:col-span-4 p-5 bg-[#FBFBFD] rounded-2xl border border-[#0071E3]/20 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#0071E3]">
                      03 • Calibrated Match
                    </span>
                    <span className="badge-subtle bg-[#34C759]/10 text-[#1B8738] text-[10px] font-bold">
                      94% Match
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-black/5 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#111111] text-white font-bold flex items-center justify-center text-xs">
                        MS
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#111111]">Manoj Sharma</h4>
                        <p className="text-[11px] text-[#6E6E73]">AC Technician • 5y Exp</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6E6E73] pt-2 border-t border-black/5">
                      <span className="font-semibold text-[#111111]">3.2 km (Free Travel)</span>
                      <span className="font-bold text-[#111111]">₹750 quote</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#1B8738] font-medium flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#34C759]" />
                    Meets all 5 hard constraints
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 2. SECTION 2: JUST TELL US WHAT YOU NEED */}
      {/* ============================================================== */}
      <section className="py-6">
        <Container size="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="accent" size="sm">
                Natural-Language Intake
              </Badge>
              <h2 className="text-heading-1 text-[#111111]">
                Just tell us what you need.
              </h2>
              <p className="text-subheading text-base leading-relaxed">
                No menus. No navigating 30 subcategories. Explain your domestic or technical issue the way you would to a friend.
              </p>
              <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
                WorkLink’s intake engine instantly parses your request into structured slots: the underlying trade, technical skill depth, time sensitivity, user location, and budget constraints.
              </p>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onFindWorkerClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Find the right professional
                </Button>
              </div>
            </div>

            {/* Right Interactive Decoding Artifact */}
            <div className="lg:col-span-7">
              <div className="card-premium p-6 sm:p-8 bg-[#FFFFFF] border border-black/10 shadow-lg space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
                    Customer Prompt
                  </span>
                  <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-black/5 text-sm font-medium text-[#111111]">
                    "My AC isn't cooling. I need someone tomorrow morning."
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3] block mb-3">
                    WorkLink Autonomous Understanding
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-[#FBFBFD] rounded-xl border border-black/5 flex items-center justify-between">
                      <span className="text-[#6E6E73]">Service Identified</span>
                      <span className="font-bold text-[#111111]">AC Repair</span>
                    </div>

                    <div className="p-3.5 bg-[#FBFBFD] rounded-xl border border-black/5 flex items-center justify-between">
                      <span className="text-[#6E6E73]">Required Core Skill</span>
                      <span className="font-bold text-[#111111]">AC Technician</span>
                    </div>

                    <div className="p-3.5 bg-[#FBFBFD] rounded-xl border border-black/5 flex items-center justify-between">
                      <span className="text-[#6E6E73]">Requested Time</span>
                      <span className="font-bold text-[#111111]">Tomorrow Morning</span>
                    </div>

                    <div className="p-3.5 bg-[#FBFBFD] rounded-xl border border-black/5 flex items-center justify-between">
                      <span className="text-[#6E6E73]">Spatial Boundary</span>
                      <span className="font-bold text-[#111111]">Current Location (10 km)</span>
                    </div>

                    <div className="p-3.5 bg-[#FBFBFD] rounded-xl border border-black/5 flex items-center justify-between sm:col-span-2">
                      <span className="text-[#6E6E73]">Urgency Classification</span>
                      <span className="font-bold text-[#0071E3]">Normal Urgency (Scheduled Slot)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 3. SECTION 3: CLOSE MATTERS. BUT CAPABLE MATTERS MORE */}
      {/* ============================================================== */}
      <section className="py-6">
        <Container size="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            {/* Left: Geographic Visual */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="card-premium p-6 sm:p-8 bg-[#111111] text-white rounded-3xl relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[#0071E3]" />
                    <span className="font-bold">Dynamic 10 km Service Geometry</span>
                  </div>
                  <span className="text-[#86868B] font-mono">Center: Customer</span>
                </div>

                {/* Abstract Topographic Radar */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 400 300" className="w-full max-w-[360px] aspect-[4/3]">
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0071E3" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0071E3" stopOpacity="0.0" />
                      </radialGradient>
                    </defs>

                    {/* Concentric rings */}
                    <circle cx="200" cy="150" r="120" fill="none" stroke="#333336" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx="200" cy="150" r="90" fill="none" stroke="#FF9500" strokeWidth="1" strokeDasharray="4,4" />
                    <circle cx="200" cy="150" r="50" fill="url(#radarGlow)" stroke="#0071E3" strokeWidth="1.5" />

                    {/* Center point */}
                    <circle cx="200" cy="150" r="6" fill="#FFFFFF" />
                    <text x="200" y="172" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                      Customer Pin
                    </text>

                    {/* Proximity Ring Labels */}
                    <text x="200" y="94" textAnchor="middle" fill="#0071E3" fontSize="8" fontWeight="bold">
                      5 km Free Zone
                    </text>
                    <text x="200" y="52" textAnchor="middle" fill="#FF9500" fontSize="8" fontWeight="bold">
                      10 km Hard Boundary
                    </text>

                    {/* Candidate nodes */}
                    <circle cx="230" cy="130" r="5" fill="#34C759" />
                    <text x="230" y="120" textAnchor="middle" fill="#34C759" fontSize="9" fontWeight="bold">
                      W3 (Optimal)
                    </text>

                    <circle cx="160" cy="120" r="4" fill="#FF3B30" />
                    <text x="160" y="112" textAnchor="middle" fill="#86868B" fontSize="8">
                      W1 (Nearest but underqualified)
                    </text>

                    <circle cx="280" cy="180" r="4" fill="#FF9500" />
                    <text x="280" y="194" textAnchor="middle" fill="#86868B" fontSize="8">
                      W5 (9.1km trade-off)
                    </text>

                    <circle cx="330" cy="70" r="4" fill="#FF3B30" />
                    <text x="330" y="62" textAnchor="middle" fill="#86868B" fontSize="8">
                      W6 (11.4km ineligible)
                    </text>
                  </svg>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-[#86868B]">
                  <span>0–5 km: Free Travel</span>
                  <span>5–10 km: Configurable Slab</span>
                  <span className="text-[#FF3B30]">&gt;10 km: Excluded</span>
                </div>
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-5 space-y-5 order-1 lg:order-2">
              <Badge variant="default" size="sm">
                Service Zone Architecture
              </Badge>
              <h2 className="text-heading-1 text-[#111111]">
                Close matters.
                <br />
                <span className="text-[#6E6E73]">But capable matters more.</span>
              </h2>
              <p className="text-subheading text-base leading-relaxed">
                Conventional directories blindly sort by physical proximity. But a plumber 400 meters away who lacks copper brazing skills or is unavailable until tomorrow solves nothing.
              </p>
              <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
                WorkLink dynamically creates a 10 km service zone around your exact location. Candidates outside 10 km are strictly excluded. Within the zone, multi-factor matching evaluates true competence over mere distance.
              </p>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onExploreRadarClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore 10 km Zone Radar
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION 4: NOT THE NEAREST. THE RIGHT ONE. */}
      {/* ============================================================== */}
      <section className="py-6">
        <Container size="2xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <Badge variant="accent" size="sm">
              Recommendation Intelligence
            </Badge>
            <h2 className="text-heading-1 text-[#111111]">
              Not the nearest.
              <br />
              <span className="text-[#6E6E73]">The right one.</span>
            </h2>
            <p className="text-subheading text-base leading-relaxed max-w-xl mx-auto">
              Labour discovery is a multi-dimensional decision. WorkLink explicitly balances six critical factors instead of collapsing them into a single crude metric.
            </p>
          </div>

          {/* Six Factors Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
            {[
              { name: 'Skill Fit', desc: 'Matched technical competence', color: '#0071E3' },
              { name: 'Experience', desc: 'Judged relative to job tier', color: '#5856D6' },
              { name: 'Availability', desc: 'Real-time slot alignment', color: '#34C759' },
              { name: 'Reputation', desc: 'Verified rating & completion', color: '#FF9500' },
              { name: 'Distance', desc: 'Normalised within 10 km', color: '#30B0C7' },
              { name: 'Price', desc: 'Quote vs budget feasibility', color: '#FF3B30' },
            ].map((factor, idx) => (
              <div key={idx} className="card-premium p-4 bg-[#FFFFFF] text-center space-y-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full mx-auto"
                  style={{ backgroundColor: factor.color }}
                />
                <h4 className="text-xs font-bold text-[#111111]">{factor.name}</h4>
                <p className="text-[11px] text-[#6E6E73]">{factor.desc}</p>
              </div>
            ))}
          </div>

          {/* "Why this worker?" Explanation Spotlight Card */}
          <div className="card-premium p-6 sm:p-8 bg-[#FBFBFD] max-w-3xl mx-auto border border-black/10 shadow-md">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-black/5">
              <Sparkles className="w-4 h-4 text-[#0071E3]" />
              <h3 className="text-sm font-bold text-[#111111]">
                AI Should Explain Itself Before Asking You to Trust It
              </h3>
            </div>

            <p className="text-xs text-[#6E6E73] mb-4">
              A recommendation should never say merely "94% Match". WorkLink details the exact structural rationale behind every recommendation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                <span className="font-medium text-[#111111]">3 / 3 required diagnostic skills verified</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                <span className="font-medium text-[#111111]">5 years experience (matches 3+ yr requirement)</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                <span className="font-medium text-[#111111]">Available immediately (ETA ~25 mins)</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                <span className="font-medium text-[#111111]">4.8 / 5.0 verified rating across 184 completed jobs</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                <span className="font-medium text-[#111111]">3.2 km away — Free travel zone (0–5 km)</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                <span className="font-medium text-[#111111]">₹750 quote is comfortably within ₹800 budget</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 5. SECTION 5: IT GETS BETTER WITH EVERY JOB */}
      {/* ============================================================== */}
      <section className="py-6">
        <Container size="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="success" size="sm">
                Feedback Loop &amp; Telemetry
              </Badge>
              <h2 className="text-heading-1 text-[#111111]">
                It gets better with every job.
              </h2>
              <p className="text-subheading text-base leading-relaxed">
                WorkLink is designed as a learning ecosystem rather than a static catalog.
              </p>
              <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
                Every completed service yields real telemetry—actual execution duration, punctuality, completion rates, customer reviews, and repeat bookings. The matching engine refines worker reliability scores and personalizes future recommendations based on what you value most.
              </p>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onViewIntelligenceClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View Workforce Intelligence
                </Button>
              </div>
            </div>

            {/* Right Telemetry Cards */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card-premium p-6 bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B]">
                      Worker Reliability
                    </span>
                    <TrendingUp className="w-4 h-4 text-[#34C759]" />
                  </div>
                  <div className="text-3xl font-extrabold text-[#111111]">98.4%</div>
                  <p className="text-xs text-[#6E6E73]">
                    Updated automatically from completion vs cancellation rates.
                  </p>
                </div>

                <div className="card-premium p-6 bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B]">
                      Response Punctuality
                    </span>
                    <Clock className="w-4 h-4 text-[#0071E3]" />
                  </div>
                  <div className="text-3xl font-extrabold text-[#111111]">14.2 min</div>
                  <p className="text-xs text-[#6E6E73]">
                    Doorstep arrival telemetry dynamically informs availability scoring.
                  </p>
                </div>

                <div className="card-premium p-6 bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B]">
                      Repeat Preference
                    </span>
                    <RotateCcw className="w-4 h-4 text-[#5856D6]" />
                  </div>
                  <div className="text-3xl font-extrabold text-[#111111]">38.2%</div>
                  <p className="text-xs text-[#6E6E73]">
                    Customers re-booking preferred tradespeople receive personalized boost.
                  </p>
                </div>

                <div className="card-premium p-6 bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B]">
                      Price Acceptance
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#FF9500]" />
                  </div>
                  <div className="text-3xl font-extrabold text-[#111111]">96.8%</div>
                  <p className="text-xs text-[#6E6E73]">
                    Estimate vs actual final invoice alignment monitored for tariff calibration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 6. SECTION 6: THE CUSTOMER JOURNEY */}
      {/* ============================================================== */}
      <section className="py-6">
        <Container size="2xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <Badge variant="default" size="sm">
              End-to-End Product Flow
            </Badge>
            <h2 className="text-heading-1 text-[#111111]">
              Simple. Transparent. Considered.
            </h2>
            <p className="text-subheading text-base leading-relaxed max-w-xl mx-auto">
              From natural-language request to post-service review, every milestone is designed for clarity and trust.
            </p>
          </div>

          {/* Stepped Journey */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              { step: '01', title: 'Tell us', desc: 'Describe your issue in plain words' },
              { step: '02', title: 'Understand', desc: 'AI decodes trade, skills, and time' },
              { step: '03', title: 'Match', desc: 'Hard constraints & multi-factor rank' },
              { step: '04', title: 'Book', desc: 'Transparent estimate & dispatch' },
              { step: '05', title: 'Work', desc: 'Live service clock & verified add-ons' },
              { step: '06', title: 'Rate', desc: 'Payment & performance feedback loop' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="card-premium p-5 bg-[#FFFFFF] flex flex-col justify-between space-y-4"
              >
                <span className="font-mono text-2xl font-extrabold text-[#86868B]/40">
                  {item.step}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">{item.title}</h4>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 7. FINAL CALL TO ACTION */}
      {/* ============================================================== */}
      <section className="py-12 sm:py-20">
        <Container size="xl">
          <div className="card-premium p-10 sm:p-16 bg-[#111111] text-white rounded-3xl text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <Badge variant="accent" size="sm">
                WorkLink AI Marketplace
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Find the right professional.
              </h2>
              <p className="text-xs sm:text-base text-[#86868B] max-w-lg mx-auto leading-relaxed">
                No guessing. No phone tag. Just the most suitable available skilled worker for your exact real-world service requirement.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={onFindWorkerClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto px-8"
                >
                  Find a Worker Now
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsWorkerModalOpen(true)}
                  className="w-full sm:w-auto px-7"
                >
                  Join as a Pro
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-[#86868B] font-medium border-t border-white/10 mt-8">
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-[#34C759] mr-1.5" />
                  100% Verified Credentials
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-[#0071E3] mr-1.5" />
                  10 km Dynamic Service Zone
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 text-[#FF9500] mr-1.5" />
                  Transparent Live Timer Billing
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Become a Worker Onboarding Modal */}
      <Modal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        maxWidth="md"
        title="Join the WorkLink Pro Network"
        subtitle="Connect with customers looking for verified trade professionals in your 10 km service zone."
        footer={
          <div className="w-full flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setIsWorkerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isSubmittingPro}
              onClick={handleProSubmit}
            >
              Submit Application
            </Button>
          </div>
        }
      >
        <form onSubmit={handleProSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={proName}
            onChange={(e) => setProName(e.target.value)}
            required
          />

          <Select
            label="Primary Skilled Trade"
            value={proTrade}
            onChange={(e) => setProTrade(e.target.value)}
            options={[
              { value: 'AC Technician', label: 'AC Technician (HVAC)' },
              { value: 'Plumber', label: 'Licensed Plumber' },
              { value: 'Electrician', label: 'Certified Electrician' },
              { value: 'Carpenter', label: 'Carpenter / Woodwork' },
              { value: 'Painter', label: 'Painter / Water-proofing' },
              { value: 'Appliance Repair', label: 'Appliance Repair' },
              { value: 'Cleaning Professional', label: 'Cleaning Specialist' },
            ]}
          />

          <Input
            label="Phone Number"
            placeholder="+91 98XXX XXXXX"
            value={proPhone}
            onChange={(e) => setProPhone(e.target.value)}
            required
          />

          <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs text-[#6E6E73] space-y-1">
            <strong className="text-[#111111] block">Verification Checklist:</strong>
            <p>• Government ID (Aadhaar / Voter ID)</p>
            <p>• Trade license or apprenticeship certification</p>
            <p>• Diagnostic tools inspection during in-person verification</p>
          </div>
        </form>
      </Modal>
    </div>
  );
};
