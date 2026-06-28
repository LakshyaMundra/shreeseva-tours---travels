import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import {
  Phone,
  MapPin,
  Calendar,
  Users,
  Car,
  Shield,
  Award,
  Clock,
  Compass,
  Mail,
  Menu,
  X,
  CheckCircle,
  MessageSquare,
  Settings,
  Database,
  TrendingUp,
  Briefcase,
  Heart,
  Plane,
  ChevronRight,
  Info,
  ChevronLeft,
  Filter,
  Trash2,
  Lock,
  Eye,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Map,
  DollarSign
} from 'lucide-react';

// Import generated premium images
import heroImg from './assets/images/shreeseva_hero_urbania_1782480707677.jpg';
import ttImg from './assets/images/shreeseva_tempo_traveller_1782480724860.jpg';

// Interface definitions
interface Booking {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  destination: string;
  travelDate: string;
  passengers: number;
  vehicleType: string;
  status: 'Pending' | 'Contacted' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  notes?: string;
}

// Initial seed bookings for the Admin Dashboard
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'SS-2026-8491',
    name: 'Rajesh Sharma',
    phone: '+91 9876543210',
    pickup: 'Indore Airport (IDR)',
    destination: 'Ujjain Mahakaleshwar Temple',
    travelDate: '2026-07-10',
    passengers: 12,
    vehicleType: 'Luxury Force Urbania (17 Seater)',
    status: 'Confirmed',
    createdAt: '2026-06-25T14:30:00Z',
    notes: 'Airport pick up. Pilgrimage tour group, needs luggage assistance.'
  },
  {
    id: 'SS-2026-3021',
    name: 'Priyanka Patel',
    phone: '+91 9425012345',
    pickup: 'Vijay Nagar, Indore',
    destination: 'Omkareshwar Jyotirlinga',
    travelDate: '2026-07-12',
    passengers: 15,
    vehicleType: 'Executive Tempo Traveller (15 Seater)',
    status: 'Pending',
    createdAt: '2026-06-26T08:15:00Z',
    notes: 'Family trip. Senior citizens traveling. Prefer comfortable driving speed.'
  },
  {
    id: 'SS-2026-5742',
    name: 'Amit Verma',
    phone: '+91 8827055667',
    pickup: 'Corporate Office, Dewas Naka',
    destination: 'Mandu Historical Site',
    travelDate: '2026-07-18',
    passengers: 22,
    vehicleType: 'Super Luxury Tempo Traveller (26 Seater)',
    status: 'Contacted',
    createdAt: '2026-06-26T02:45:00Z',
    notes: 'Corporate weekend getaway. Invoice required on company name.'
  }
];

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Inquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: '',
    destination: '',
    travelDate: '',
    passengers: '12',
    vehicleType: 'Luxury Force Urbania (17 Seater)'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);

  // Admin Portal State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('shreeseva_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });
  const [adminPin, setAdminPin] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [adminFilter, setAdminFilter] = useState<'All' | 'Pending' | 'Contacted' | 'Confirmed' | 'Cancelled'>('All');
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Persist bookings to localStorage
  useEffect(() => {
    localStorage.setItem('shreeseva_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Section scroll spy / observer
  useEffect(() => {
    if (activeTab !== 'user') return;

    const sections = ['home', 'fleet', 'services', 'gallery', 'about', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const scrollToSection = (id: string) => {
    setActiveTab('user');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({
          top: el.offsetTop - 80,
          behavior: 'smooth'
        });
        setActiveSection(id);
      }
    }, 100);
  };

  // Pre-fill form from Fleet Card and scroll
  const handleBookVehicle = (vehicleName: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleType: vehicleName
    }));
    scrollToSection('contact');

    // Briefly highlight the form
    setTimeout(() => {
      const formEl = document.getElementById('inquiry-form-card');
      if (formEl) {
        formEl.classList.add('ring-2', 'ring-[#d4af37]', 'scale-[1.01]');
        setTimeout(() => {
          formEl.classList.remove('ring-2', 'ring-[#d4af37]', 'scale-[1.01]');
        }, 1500);
      }
    }, 800);
  };

  // Inquiry Form Handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        name === "phone"
          ? value.replace(/[^0-9+ ]/g, "")
          : value,
    }));
  };

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors: Record<string, string> = {};

  if (!formData.name.trim()) errors.name = "Full name is required";
  if (!formData.phone.trim()) errors.phone = "Phone number is required";
  else if (formData.phone.length < 10)
    errors.phone = "Enter a valid phone number";

  if (!formData.pickup.trim())
    errors.pickup = "Pickup location is required";

  if (!formData.destination.trim())
    errors.destination = "Destination is required";

  if (!formData.travelDate)
    errors.travelDate = "Travel date is required";

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setIsSubmitting(true);

  const bookingId = `SS-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const newBooking: Booking = {
    id: bookingId,
    name: formData.name,
    phone: formData.phone,
    pickup: formData.pickup,
    destination: formData.destination,
    travelDate: formData.travelDate,
    passengers: parseInt(formData.passengers),
    vehicleType: formData.vehicleType,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("bookings")
    .insert([
      {
        booking_id: newBooking.id,
        name: newBooking.name,
        phone: newBooking.phone,
        pickup: newBooking.pickup,
        destination: newBooking.destination,
        travel_date: newBooking.travelDate,
        passengers: newBooking.passengers,
        vehicle_type: newBooking.vehicleType,
        status: newBooking.status,
        created_at: newBooking.createdAt,
      },
    ]);
if (error) {
  alert(error.message);
  console.log(error);
  setIsSubmitting(false);
  return;
}

  setBookings((prev) => [newBooking, ...prev]);

  const whatsappMessage = `*🚐 New Booking Inquiry*

🆔 Booking ID: ${newBooking.id}

👤 Name: ${newBooking.name}

📞 Phone: ${newBooking.phone}

📍 Pickup: ${newBooking.pickup}

🏁 Destination: ${newBooking.destination}

📅 Travel Date: ${newBooking.travelDate}

👥 Passengers: ${newBooking.passengers}

🚐 Vehicle: ${newBooking.vehicleType}`;

  window.open(
    `https://wa.me/919685177357?text=${encodeURIComponent(
      whatsappMessage
    )}`,
    "_blank"
  );

  setBookingSuccess(newBooking);
  setIsSubmitting(false);

  setFormData({
    name: "",
    phone: "",
    pickup: "",
    destination: "",
    travelDate: "",
    passengers: "12",
    vehicleType: "Luxury Force Urbania (17 Seater)",
  });
};

  // Admin Access Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234') {
      setIsAdminAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid PIN. Use default pin 1234');
    }
  };

  const handleUpdateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status, notes: adminNotes || b.notes } : b));
    setSelectedBookingForDetails(prev => prev && prev.id === id ? { ...prev, status, notes: adminNotes || prev.notes } : prev);
    setAdminNotes('');
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(prev => prev.filter(b => b.id !== id));
      setSelectedBookingForDetails(null);
    }
  };

  const handleResetAdminData = () => {
    if (window.confirm('Reset database to initial demo submissions?')) {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem('shreeseva_bookings', JSON.stringify(INITIAL_BOOKINGS));
    }
  };

  // Fleet Database / Cards
  const fleet = [
    {
      id: 'urbania',
      name: 'Luxury Force Urbania',
      type: 'Luxury Force Urbania (17 Seater)',
      capacity: '17 Passengers + Chauffeur',
      image: heroImg,
      tag: 'ULTRA LUXURY',
      features: [
        'Premium reclining leatherette seats',
        'Dual fully automatic climate control AC',
        'State-of-the-art 32" Smart LED TV',
        'Harman/Kardon surround sound system',
        'Individual reading lights & USB charging ports',
        'Elegant warm LED roof ambient lighting',
        'Extremely spacious under-seat & rear luggage',
        'Air suspension for ultra-smooth ride'
      ],
      price: 'Starting from ₹24/km',
      desc: 'Experience global standards of travel. Perfectly modeled for elite group travels, family pilgrimages, and high-profile corporate delegates.'
    },
    {
      id: 'traveller',
      name: 'Elite Tempo Traveller',
      type: 'Executive Tempo Traveller (15 Seater)',
      capacity: '12 - 26 Passengers + Chauffeur',
      image: ttImg,
      tag: 'ELITE COMFORT',
      features: [
        'Comfortable high-back pushback seats',
        'Heavy-duty cooling twin air conditioning',
        'Smart LED TV with Bluetooth & Aux audio',
        'Individual mobile holders & charging hubs',
        'Panoramic window glass with blackout curtains',
        'Spacious rooftop carrier & separate luggage boot',
        'GPS tracking with live telemetry',
        'Professional highly trained uniform driver'
      ],
      price: 'Starting from ₹20/km',
      desc: 'The gold standard of Indian road tours. Reliable, powerful, and remarkably comfortable for long-distance family excursions and wedding transfers.'
    }
  ];

  // Services list
  const services = [
    {
      icon: <Users className="w-6 h-6 text-[#d4af37]" />,
      title: 'Family Trips',
      desc: 'Unforgettable, secure long-distance holidays with customized halts, comfortable driving pacing, and spacious luggage room for the whole family.'
    },
    {
      icon: <Compass className="w-6 h-6 text-[#d4af37]" />,
      title: 'Pilgrimage Tours',
      desc: 'Spiritual journeys to Jyotirlingas, Mahakaleshwar (Ujjain), Omkareshwar, and Char Dham. Designed with special care for senior citizens.'
    },
    {
      icon: <Briefcase className="w-6 h-6 text-[#d4af37]" />,
      title: 'Corporate Travel',
      desc: 'Polished executive transfers, delegate transport for conventions, industrial tours, and company retreats in premium, clean vehicles.'
    },
    {
      icon: <Heart className="w-6 h-6 text-[#d4af37]" />,
      title: 'Wedding Events',
      desc: 'Elegant guest logistics, grand bridal party arrivals, and multiple venue transfers with coordinates and schedules carefully managed.'
    },
    {
      icon: <Plane className="w-6 h-6 text-[#d4af37]" />,
      title: 'Airport Transfers',
      desc: 'Timely, stress-free pickups and drop-offs to Indore Airport (IDR) and major hubs, with dynamic flight delay tracking and baggage support.'
    },
    {
      icon: <Map className="w-6 h-6 text-[#d4af37]" />,
      title: 'Outstation Trips',
      desc: 'Round-the-clock availability for outstation tour itineraries across Madhya Pradesh, Rajasthan, Maharashtra, and pan India.'
    }
  ];

  // Gallery Database
  const galleryItems = [
    {
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
      category: 'Pilgrimage',
      title: 'Scenic Temple Routes',
      location: 'Ujjain, Madhya Pradesh'
    },
    {
      url: heroImg,
      category: 'Fleet',
      title: 'Force Urbania Premium Fleet',
      location: 'Shreeseva Head Office'
    },
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      category: 'Weddings',
      title: 'Royal Wedding Transportation',
      location: 'Indore Palace Venue'
    },
    {
      url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80',
      category: 'Nature',
      title: 'Family Wilderness Vacation',
      location: 'Pachmarhi Hill Station'
    },
    {
      url: ttImg,
      category: 'Fleet',
      title: 'Elite Tempo Traveller In Action',
      location: 'Scenic Highway Route'
    },
    {
      url: 'https://images.unsplash.com/photo-1561361531-99e224e98456?auto=format&fit=crop&w=1000&q=80',
      category: 'Pilgrimage',
      title: 'Holy Narmada Aarti Journey',
      location: 'Omkareshwar'
    }
  ];

  const filteredGallery = galleryFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === galleryFilter);

  // Admin Portal Calculations
  const totalSubmissions = bookings.length;
  const pendingSubmissions = bookings.filter(b => b.status === 'Pending').length;
  const confirmedSubmissions = bookings.filter(b => b.status === 'Confirmed').length;
  const contactRate = totalSubmissions > 0
    ? Math.round(((totalSubmissions - pendingSubmissions) / totalSubmissions) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden bg-[#050b14] text-slate-100">

      {/* Dynamic Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{
        backgroundImage: `radial-gradient(#d4af37 0.5px, transparent 0.5px)`,
        backgroundSize: '24px 24px'
      }} />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 h-20 bg-[#0a192f]/90 backdrop-blur-xl border-b border-[#d4af37]/20 flex items-center justify-between px-4 sm:px-8 shrink-0 transition-all shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#fbe697] to-[#d4af37] rounded-full flex items-center justify-center text-[#0a192f] font-black text-2xl shadow-xl border border-white/20 transition-transform duration-300 hover:rotate-12">
            S
          </div>
          <div>
            <h1 className="text-white font-cinzel font-bold text-lg tracking-wider leading-none">SHREESEVA</h1>
            <p className="text-[#d4af37] text-[10px] uppercase tracking-[0.25em] font-bold mt-1">Tours & Travels</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        {activeTab === 'user' ? (
          <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide">
            {['home', 'fleet', 'services', 'gallery', 'about', 'contact'].map((sec) => (
              <button
                key={sec}
                onClick={() => scrollToSection(sec)}
                className={`uppercase tracking-widest text-[11px] transition-luxury hover:text-[#d4af37] relative py-1 ${activeSection === sec ? 'text-[#d4af37]' : 'text-slate-300'
                  }`}
              >
                {sec === 'about' ? 'About Us' : sec}
                {activeSection === sec && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[#d4af37] font-semibold">Active Database Connection</span>
          </div>
        )}

        {/* Header Action Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-slate-400 text-[9px] uppercase tracking-widest leading-none">24/7 Helpline</p>
            <a href="tel:+919685177357" className="text-[#d4af37] font-bold tracking-wider hover:underline text-sm">+91 9685177357</a>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'user') {
                setActiveTab('admin');
              } else {
                setActiveTab('user');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-luxury flex items-center gap-2 ${activeTab === 'admin'
              ? 'bg-[#d4af37] text-[#0a192f] border-[#d4af37]'
              : 'bg-white/5 text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/10'
              }`}
          >
            {activeTab === 'admin' ? (
              <>
                <Car className="w-4 h-4" /> Client Site
              </>
            ) : (
              <>
                <Database className="w-4 h-4" /> Admin Portal
              </>
            )}
          </button>
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'user') {
                setActiveTab('admin');
              } else {
                setActiveTab('user');
              }
            }}
            className="p-2 rounded-lg bg-white/5 text-[#d4af37] border border-[#d4af37]/20"
            title="Toggle Admin View"
          >
            <Database className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full bg-[#0a192f] border-b border-[#d4af37]/30 z-40 p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {activeTab === 'user' ? (
            ['home', 'fleet', 'services', 'gallery', 'about', 'contact'].map((sec) => (
              <button
                key={sec}
                onClick={() => scrollToSection(sec)}
                className="w-full text-left py-3 border-b border-white/5 text-slate-200 hover:text-[#d4af37] uppercase text-xs tracking-widest font-semibold"
              >
                {sec === 'about' ? 'About Us' : sec}
              </button>
            ))
          ) : (
            <div className="p-3 bg-white/5 rounded-xl text-center text-xs text-[#d4af37] font-semibold">
              Admin Portal Active Mode
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4">
            <div className="text-center">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Call for Instant Booking</p>
              <a href="tel:+919685177357" className="text-[#d4af37] font-bold text-lg">+91 9685177357</a>
            </div>
            <a
              href="https://wa.me/919685177357?text=Hi%20Shreeseva%20Tours%20and%20Travels,%20I%20am%20interested%20in%20booking%20a%20vehicle."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-white" /> WhatsApp Inquiry
            </a>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 z-10">

        {/* TAB 1: CLIENT SITE VIEW */}
        {activeTab === 'user' && (
          <>
            {/* HERO SECTION */}
            <section id="home" className="relative min-h-[90vh] md:h-[95vh] flex items-center justify-center pt-24 pb-16 px-4 md:px-8 overflow-hidden">

              {/* Sunrise Backdrop Ambient Glows */}
              <div className="absolute top-1/4 right-1/4 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-gradient-to-br from-[#d4af37]/15 to-transparent blur-3xl pointer-events-none animate-pulse duration-[10000ms]" />
              <div className="absolute bottom-10 left-10 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-gradient-to-tr from-sky-500/5 to-transparent blur-3xl pointer-events-none" />

              <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

                {/* Left Side: Headings */}
                <div className="lg:col-span-6 text-left space-y-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 px-4 py-2 rounded-full border border-[#d4af37]/40">
                    <Sparkles className="w-4 h-4 text-[#d4af37] animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-[#d4af37] font-bold text-[10px] tracking-[0.2em] uppercase">Premium Rental Service</span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-white leading-tight">
                    Travel India In <br />
                   <span className="text-red-500">luxury & Comfort
                  </span>
</h2>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                    Experience the absolute pinnacle of group travel. Rent premium
                    <strong className="text-[#d4af37]"> Force Urbania</strong>, customized luxury
                    <strong className="text-[#d4af37]"> Tempo Travellers</strong>, and executive tourist vehicles across India. Specially curated for spiritual pilgrimages, high-class corporate excursions, and stunning family getaways.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                        <Shield className="w-4 h-4 text-[#d4af37]" />
                      </div>
                      <span className="text-xs text-slate-200 font-semibold">100% Secure & Sanitized</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                        <Clock className="w-4 h-4 text-[#d4af37]" />
                      </div>
                      <span className="text-xs text-slate-200 font-semibold">24/7 Support Guard</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                        <MapPin className="w-4 h-4 text-[#d4af37]" />
                      </div>
                      <span className="text-xs text-slate-200 font-semibold">Pan-India Permits</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                        <Award className="w-4 h-4 text-[#d4af37]" />
                      </div>
                      <span className="text-xs text-slate-200 font-semibold">Elite Certified Drivers</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => scrollToSection('contact')}
                      className="px-8 py-4 bg-gradient-to-r from-[#fbe697] to-[#d4af37] hover:brightness-110 text-[#0a192f] rounded-xl font-bold text-sm shadow-xl shadow-[#d4af37]/20 uppercase tracking-widest transition-transform duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      Book Your Trip <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollToSection('fleet')}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-luxury flex items-center justify-center gap-2"
                    >
                      Explore Fleet
                    </button>
                  </div>
                </div>

                {/* Right Side: Showcase Image (Generated Force Urbania) */}
                <div className="lg:col-span-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-3xl blur-2xl pointer-events-none" />

                  {/* Decorative Frame */}
                  <div className="relative border border-[#d4af37]/30 rounded-3xl p-3 bg-[#0a192f]/60 backdrop-blur-md shadow-2xl">
                    <div className="relative rounded-2xl overflow-hidden aspect-video group">
                      <img
                        src={heroImg}
                        alt="Premium Force Urbania Scenic View"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transform duration-[8000ms] group-hover:scale-105"
                      />

                      {/* Sunrise sky layer blend effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/10 to-transparent opacity-80" />

                      {/* Floating metadata badge */}
                      <div className="absolute bottom-4 left-4 right-4 glass-panel p-3.5 rounded-xl border border-[#d4af37]/30 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-[#d4af37] font-extrabold uppercase tracking-widest">Featured Vehicle</p>
                          <h4 className="text-white font-bold text-sm">Force Urbania (Luxury Edition)</h4>
                        </div>
                        <span className="bg-[#d4af37] text-[#0a192f] text-[10px] font-black uppercase px-2.5 py-1 rounded">17 Seater</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Accent dots */}
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 grid grid-cols-4 gap-2 opacity-30">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* QUICK CONTACT BADGE BANNER */}
            <section className="bg-gradient-to-r from-[#0a192f] via-[#1a2c4e] to-[#0a192f] py-6 border-y border-[#d4af37]/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-10 h-10 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#d4af37] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Need immediate travel booking or vehicle consultation?</h3>
                    <p className="text-xs text-slate-400">Get customized quotes on call or WhatsApp in under 5 minutes.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="tel:+919685177357"
                    className="px-5 py-2.5 bg-white/5 border border-white/20 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-luxury"
                  >
                    Call: +91 9685177357
                  </a>
                  <a
                    href="https://wa.me/919685177357?text=Hi%20Shreeseva%20Tours%20and%20Travels,%20I%20am%20interested%20in%20booking%20a%20vehicle."
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-luxury flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" /> WhatsApp Us
                  </a>
                </div>
              </div>
            </section>

            {/* FLEET SECTION */}
            <section id="fleet" className="py-24 px-4 md:px-8 bg-[#070f1a]">
              <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center space-y-4 mb-16">
                  <span className="text-[#d4af37] font-bold text-xs tracking-[0.3em] uppercase">OUR LUXURIOUS FLEET</span>
                  <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white">Elite Highway Cruisers</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-2" />
                  <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
                    Step inside absolute comfort. Our select vehicles are regularly maintained, commercially licensed, sanitarily scrubbed, and customized with ultra-luxury specs.
                  </p>
                </div>

                {/* Fleet Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {fleet.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-[#0a192f]/40 border border-[#d4af37]/15 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-[#d4af37]/40 shadow-2xl transition-all duration-500"
                    >
                      <div>
                        {/* Vehicle Image Container */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] to-transparent opacity-80" />

                          {/* Left upper tag */}
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-[#fbe697] to-[#d4af37] text-[#0a192f] text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg tracking-widest">
                            {vehicle.tag}
                          </div>

                          {/* Capacity Badge */}
                          <div className="absolute bottom-4 right-4 bg-[#0a192f]/90 border border-[#d4af37]/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span className="text-white text-[11px] font-bold">{vehicle.capacity}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-xl md:text-2xl font-cinzel font-bold text-white">{vehicle.name}</h3>
                              <p className="text-xs text-slate-400 mt-1 italic">{vehicle.type}</p>
                            </div>
                            <span className="text-sm font-bold text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/20 self-start shrink-0">
                              {vehicle.price}
                            </span>
                          </div>

                          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                            {vehicle.desc}
                          </p>

                          {/* Features Bullet List */}
                          <div className="space-y-2.5 pt-2">
                            <h4 className="text-[#d4af37] text-[10px] font-extrabold uppercase tracking-wider">Premium Indulgences & Amenities:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              {vehicle.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                                  <span className="text-slate-300 text-xs">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-6 md:p-8 border-t border-white/5 bg-[#0a192f]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                          <Shield className="w-4 h-4 text-emerald-500" /> State/All-India Permits Done
                        </div>
                        <button
                          onClick={() => handleBookVehicle(vehicle.type)}
                          className="w-full sm:w-auto px-6 py-3 bg-[#d4af37] hover:brightness-110 text-[#0a192f] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#d4af37]/10"
                        >
                          Book Force {vehicle.id === 'urbania' ? 'Urbania' : 'Traveller'}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* SERVICES SECTION */}
            <section id="services" className="py-24 px-4 md:px-8 bg-[#050b14]">
              <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center space-y-4 mb-16">
                  <span className="text-[#d4af37] font-bold text-xs tracking-[0.3em] uppercase">TAILORED EXPERIENCES</span>
                  <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white">Elite Carriage Solutions</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-2" />
                  <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
                    Whether you are coordinating a critical wedding commute, launching a corporate campaign, or conducting a profound spiritual pilgrimage.
                  </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0a192f]/30 border border-[#d4af37]/10 rounded-2xl p-6 md:p-8 space-y-4 hover:border-[#d4af37]/40 hover:-translate-y-1 transition-all duration-300 shadow-xl group"
                    >
                      <div className="w-12 h-12 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#d4af37] group-hover:text-[#0a192f]">
                        {React.cloneElement(srv.icon, { className: "w-6 h-6 transition-colors group-hover:text-[#0a192f]" })}
                      </div>
                      <h3 className="text-lg font-cinzel font-bold text-white tracking-wide">{srv.title}</h3>
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                        {srv.desc}
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, destination: `${srv.title} Destination` }));
                            scrollToSection('contact');
                          }}
                          className="text-xs text-[#d4af37] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                        >
                          Book Service <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* GALLERY SECTION */}
            <section id="gallery" className="py-24 px-4 md:px-8 bg-[#070f1a]">
              <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center space-y-4 mb-12">
                  <span className="text-[#d4af37] font-bold text-xs tracking-[0.3em] uppercase">MOMENTS OF COMFORT</span>
                  <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white">Visual Expeditious Logs</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-2" />
                  <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
                    A glimpse into the stunning terrains, high-profile pilgrimages, premium vehicle setups, and corporate voyages we have successfully carried out.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2.5 justify-center mb-12">
                  {['All', 'Fleet', 'Pilgrimage', 'Nature', 'Weddings'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGalleryFilter(cat)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-luxury border ${galleryFilter === cat
                        ? 'bg-[#d4af37] text-[#0a192f] border-[#d4af37]'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGallery.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setLightboxIndex(index)}
                      className="group cursor-pointer bg-[#0a192f]/40 border border-white/5 rounded-2xl overflow-hidden relative aspect-4/3 shadow-lg hover:border-[#d4af37]/30 transition-luxury"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/40 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-95 transition-opacity duration-300" />

                      {/* Text content absolute position */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end">
                        <div>
                          <span className="text-[#d4af37] text-[9px] font-black uppercase tracking-widest">
                            {item.category}
                          </span>
                          <h3 className="text-white font-cinzel font-bold text-sm mt-0.5">{item.title}</h3>
                          <p className="text-slate-400 text-[10px] flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-[#d4af37]" /> {item.location}
                          </p>
                        </div>
                        <span className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] text-xs">
                          +
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* LIGHTBOX MODAL */}
            {lightboxIndex !== null && (
              <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between items-center p-4 md:p-8 animate-in fade-in duration-300">

                {/* Top Bar */}
                <div className="w-full flex justify-between items-center text-white relative z-10 max-w-7xl">
                  <div>
                    <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
                      {filteredGallery[lightboxIndex].category}
                    </span>
                    <h3 className="font-cinzel font-bold text-base md:text-lg">{filteredGallery[lightboxIndex].title}</h3>
                  </div>
                  <button
                    onClick={() => setLightboxIndex(null)}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Centered Image Showcase */}
                <div className="flex-1 flex justify-center items-center max-w-5xl w-full my-6 relative">

                  {/* Left Control */}
                  <button
                    onClick={() => setLightboxIndex(prev => prev !== null ? (prev - 1 + filteredGallery.length) % filteredGallery.length : null)}
                    className="absolute left-2 md:-left-12 p-3 bg-[#0a192f]/80 border border-white/10 rounded-full hover:bg-[#d4af37] hover:text-[#0a192f] transition-all text-white z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={filteredGallery[lightboxIndex].url}
                    alt={filteredGallery[lightboxIndex].title}
                    referrerPolicy="no-referrer"
                    className="max-h-[70vh] max-w-full object-contain rounded-xl border border-white/10 shadow-2xl"
                  />

                  {/* Right Control */}
                  <button
                    onClick={() => setLightboxIndex(prev => prev !== null ? (prev + 1) % filteredGallery.length : null)}
                    className="absolute right-2 md:-right-12 p-3 bg-[#0a192f]/80 border border-white/10 rounded-full hover:bg-[#d4af37] hover:text-[#0a192f] transition-all text-white z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer specs */}
                <div className="text-center text-slate-400 text-xs pb-4">
                  <p className="flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4 text-[#d4af37]" /> {filteredGallery[lightboxIndex].location}
                  </p>
                  <p className="mt-1 text-[10px] tracking-widest text-slate-500 uppercase">
                    Image {lightboxIndex + 1} of {filteredGallery.length}
                  </p>
                </div>

              </div>
            )}

            {/* INTERACTIVE BOOKING / INQUIRY SECTION & MOCK MAP */}
            <section id="contact" className="py-24 px-4 md:px-8 bg-[#050b14] relative">

              <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                  {/* Left Side: Booking Ticket Success OR Booking Form */}
                  <div className="lg:col-span-7">

                    {bookingSuccess ? (
                      <div className="bg-[#0a192f] border-2 border-[#d4af37] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Golden Watermark decoration */}
                        <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#d4af37]/5 rounded-full border border-[#d4af37]/10 pointer-events-none" />

                        <div className="text-center space-y-4 mb-6">
                          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-10 h-10" />
                          </div>
                          <h3 className="text-2xl font-cinzel font-bold text-white">Booking Inquiry Submitted</h3>
                          <p className="text-xs text-[#d4af37] font-semibold uppercase tracking-widest">Reference No: {bookingSuccess.id}</p>
                          <p className="text-slate-300 text-sm max-w-md mx-auto">
                            Thank you, <strong>{bookingSuccess.name}</strong>. Your inquiry has been safely saved in our corporate reservation ledger. Our booking commander will contact you within 15 minutes!
                          </p>
                        </div>

                        {/* Ticket spec sheet */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 relative">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-1">
                            <span className="w-3 h-6 bg-[#0a192f] border-r border-white/10 rounded-r-full -ml-1" />
                            <span className="w-3 h-6 bg-[#0a192f] border-l border-white/10 rounded-l-full -mr-1" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase">Passenger Contact</p>
                              <p className="font-bold text-white mt-0.5">{bookingSuccess.phone}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase">Vehicle Chosen</p>
                              <p className="font-bold text-[#d4af37] mt-0.5">{bookingSuccess.vehicleType}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase">Pickup Source</p>
                              <p className="font-bold text-white mt-0.5">{bookingSuccess.pickup}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase">Drop Destination</p>
                              <p className="font-bold text-white mt-0.5">{bookingSuccess.destination}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase">Travel Date</p>
                              <p className="font-bold text-[#d4af37] mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {bookingSuccess.travelDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase">Passenger Count</p>
                              <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> {bookingSuccess.passengers} Adults
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom action */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => setBookingSuccess(null)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-luxury"
                          >
                            Submit Another Booking
                          </button>
                          <a
                            href={`https://wa.me/919685177357?text=Hi%20Shreeseva%20Tours%20and%20Travels!%20I%20just%20submitted%20booking%20inquiry%20${bookingSuccess.id}%20for%20${bookingSuccess.vehicleType}%20to%20${bookingSuccess.destination}%20on%20${bookingSuccess.travelDate}.%20Please%20verify.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4 fill-white" /> Confirm on WhatsApp
                          </a>
                        </div>

                      </div>
                    ) : (
                      <div
                        id="inquiry-form-card"
                        className="bg-[#0a192f] border border-[#d4af37]/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
                      >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="mb-6 space-y-2">
                          <h3 className="text-[#d4af37] font-cinzel font-bold text-lg uppercase tracking-wider">Quick Inquiry Booking</h3>
                          <p className="text-xs text-slate-300">Submit this formal ledger request to immediately check real-time availability of your luxury vehicle.</p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Name */}
                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Full Name *</label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="E.g., Devendra Singh"
                                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37] transition-colors ${formErrors.name ? 'border-red-500' : 'border-white/10'
                                  }`}
                              />
                              {formErrors.name && <span className="text-red-500 text-[10px] pl-1 block">{formErrors.name}</span>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Phone Number (with WhatsApp) *</label>
                              <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="E.g., +91 9685177357"
                                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37] transition-colors ${formErrors.phone ? 'border-red-500' : 'border-white/10'
                                  }`}
                              />
                              {formErrors.phone && <span className="text-red-500 text-[10px] pl-1 block">{formErrors.phone}</span>}
                            </div>

                            {/* Pickup */}
                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Pickup Location *</label>
                              <input
                                type="text"
                                name="pickup"
                                value={formData.pickup}
                                onChange={handleInputChange}
                                placeholder="City or Landmark (e.g., Indore Airport)"
                                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37] transition-colors ${formErrors.pickup ? 'border-red-500' : 'border-white/10'
                                  }`}
                              />
                              {formErrors.pickup && <span className="text-red-500 text-[10px] pl-1 block">{formErrors.pickup}</span>}
                            </div>

                            {/* Destination */}
                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Destination *</label>
                              <input
                                type="text"
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                placeholder="Where are you traveling to?"
                                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37] transition-colors ${formErrors.destination ? 'border-red-500' : 'border-white/10'
                                  }`}
                              />
                              {formErrors.destination && <span className="text-red-500 text-[10px] pl-1 block">{formErrors.destination}</span>}
                            </div>

                            {/* Travel Date */}
                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Travel Date *</label>
                              <input
                                type="date"
                                name="travelDate"
                                value={formData.travelDate}
                                onChange={handleInputChange}
                                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37] transition-colors ${formErrors.travelDate ? 'border-red-500' : 'border-white/10'
                                  }`}
                              />
                              {formErrors.travelDate && <span className="text-red-500 text-[10px] pl-1 block">{formErrors.travelDate}</span>}
                            </div>

                            {/* Passengers */}
                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Number of Passengers *</label>
                              <select
                                name="passengers"
                                value={formData.passengers}
                                onChange={handleInputChange}
                                className="w-full bg-[#0a192f] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37]"
                              >
                                {[8, 10, 12, 14, 17, 20, 26, 30].map(n => (
                                  <option key={n} value={n.toString()}>{n} Passengers</option>
                                ))}
                              </select>
                            </div>

                          </div>

                          {/* Vehicle Type selection */}
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase tracking-widest ml-1 block font-bold">Select Fleet Vehicle Class *</label>
                            <select
                              name="vehicleType"
                              value={formData.vehicleType}
                              onChange={handleInputChange}
                              className="w-full bg-[#0a192f] border border-white/10 rounded-xl px-4 py-3 text-[#d4af37] text-xs font-semibold outline-none focus:border-[#d4af37]"
                            >
                              <option value="Luxury Force Urbania (17 Seater)">Luxury Force Urbania (17 Seater)</option>
                              <option value="Executive Tempo Traveller (15 Seater)">Executive Tempo Traveller (15 Seater)</option>
                              <option value="Super Luxury Tempo Traveller (26 Seater)">Super Luxury Tempo Traveller (26 Seater)</option>
                              <option value="Royal Tourist Coach Multi-Axle">Royal Tourist Coach Multi-Axle</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-[#fbe697] to-[#d4af37] hover:brightness-110 disabled:opacity-50 text-[#0a192f] rounded-xl font-bold text-sm shadow-xl shadow-[#d4af37]/20 uppercase tracking-widest transition-luxury flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Inserting Submissions...
                              </>
                            ) : (
                              <>
                                Confirm Availability <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <p className="text-center text-[10px] text-slate-400 italic">
                            * No credit card required. Submitting logs a formal booking request instantly.
                          </p>
                        </form>
                      </div>
                    )}

                  </div>

                  {/* Right Side: Contact Information Cards & Mock Dark Map */}
                  <div className="lg:col-span-5 space-y-6">

                    {/* Contact details */}
                    <div className="bg-[#0a192f]/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                      <h3 className="font-cinzel font-bold text-lg text-white">Central Offices & Helpline</h3>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Corporate Headquarters</h4>
                            <p className="text-sm text-white font-medium mt-1">Indore, Madhya Pradesh, India</p>
                            <p className="text-xs text-slate-400">Regular services serving Indore, Bhopal, Ujjain, Dewas, Mandu, Omkareshwar, and Pan India.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Helpline & WhatsApp</h4>
                            <p className="text-sm text-white font-medium mt-1">
                              <a href="tel:+919685177357" className="hover:text-[#d4af37] transition-colors">+91 9685177357</a>
                            </p>
                            <p className="text-xs text-slate-400">Call anytime for booking, billing inquiries, dynamic itinerary requests.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Corporate Mail Desk</h4>
                            <p className="text-sm text-white font-medium mt-1">
                              <a href="mailto:info@shreesevatours.com" className="hover:text-[#d4af37] transition-colors">info@shreesevatours.com</a>
                            </p>
                            <p className="text-xs text-slate-400">For contract proposals, government tender quotes, corporate invoicing.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highly Polished Mock Google Maps Widget */}
                    <div className="bg-[#0a192f] border border-[#d4af37]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-2 right-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                        LIVE MP TRACK
                      </div>
                      <h4 className="font-cinzel text-[#d4af37] font-semibold text-xs uppercase tracking-wider mb-2">Central Route Hub</h4>
                      <p className="text-slate-300 text-xs mb-4">Indore Terminal Central Office - Madhya Pradesh Hub</p>

                      {/* Interactive Visual Map Card */}
                      <div className="w-full h-44 bg-[#050b14] border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-40 mix-blend-color-dodge" style={{
                          backgroundImage: `radial-gradient(circle, #d4af37 1px, transparent 1px)`,
                          backgroundSize: '16px 16px'
                        }} />
                        {/* Mock Map routes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#d4af37]/30 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '4s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-[#d4af37]/40 rounded-full pointer-events-none" />

                        {/* Center marker */}
                        <div className="relative z-10 text-center flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0a192f] font-bold shadow-xl">
                            <MapPin className="w-5 h-5 animate-bounce" />
                          </div>
                          <span className="text-white text-[10px] font-black tracking-widest uppercase mt-2 bg-[#0a192f] px-2.5 py-1 rounded border border-[#d4af37]/40 shadow-xl">
                            Shreeseva HQ
                          </span>
                        </div>

                        {/* Top corner distance indicator */}
                        <div className="absolute bottom-2 left-2 bg-[#0a192f] border border-white/10 px-2 py-1 rounded text-[9px] text-slate-300 font-mono">
                          LAT: 22.7196° N | LON: 75.8577° E
                        </div>
                      </div>

                      <a
                        href="https://maps.google.com/?q=Indore,Madhya+Pradesh,India"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-4 py-3 border border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-slate-200 hover:text-white rounded-xl flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-luxury gap-2"
                      >
                        Open In Google Maps <ExternalLink className="w-4.5 h-4.5" />
                      </a>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="py-24 px-4 md:px-8 bg-[#070f1a] border-t border-[#d4af37]/10">
              <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center space-y-4 mb-16">
                  <span className="text-[#d4af37] font-bold text-xs tracking-[0.3em] uppercase">CLIENT ACCLAIMS</span>
                  <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white">Words From Elite Patrons</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      name: 'Vikramaditya Solanki',
                      role: 'Spiritual Group Organizer',
                      feedback: 'Our pilgrimage trip to Ujjain and Omkareshwar with 17 family members was absolute bliss. The Force Urbania is incredibly luxurious. It has actual recliners, beautiful lights and pristine suspension. Highly recommend Shreeseva!',
                      trip: 'Ujjain Jyotirlinga tour'
                    },
                    {
                      name: 'Shruti Kashyap',
                      role: 'Corporate HR Director',
                      feedback: 'We rented two 26-seater Tempo Travellers for our executive leadership summit. The vehicles were immaculately clean, drivers in uniform, and punctual. Shreeseva is our permanent transport partner now.',
                      trip: 'Corporate Leadership Excursion'
                    },
                    {
                      name: 'Rahul Deshmukh',
                      role: 'Grand Groom Coordinator',
                      feedback: 'Logistics for a wedding with 150 guests across 3 venues can be a total nightmare. Shreeseva managed the airport pickups and hotel runs seamlessly. Safe, polite, and extremely luxury feel.',
                      trip: 'Indore Royal Wedding commute'
                    }
                  ].map((test, index) => (
                    <div
                      key={index}
                      className="bg-[#0a192f]/40 border border-[#d4af37]/15 rounded-2xl p-6 md:p-8 space-y-4 relative flex flex-col justify-between"
                    >
                      <div className="absolute top-6 right-6 text-7xl font-serif text-[#d4af37]/10 pointer-events-none select-none">“</div>
                      <div className="space-y-3">
                        {/* Rating */}
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-[#d4af37] text-base">★</span>
                          ))}
                        </div>
                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed italic">
                          "{test.feedback}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white text-xs">{test.name}</h4>
                          <p className="text-slate-400 text-[10px] uppercase mt-0.5">{test.role}</p>
                        </div>
                        <span className="bg-[#d4af37]/10 text-[#d4af37] text-[9px] font-black uppercase px-2 py-0.5 rounded border border-[#d4af37]/20">
                          {test.trip}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* ABOUT US STORY PANEL */}
            <section id="about" className="py-24 px-4 md:px-8 bg-[#050b14] relative">
              <div className="max-w-7xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                  {/* Left Side: Photo panel */}
                  <div className="lg:col-span-5 relative">
                    <div className="absolute inset-0 bg-[#d4af37]/10 rounded-3xl blur-2xl pointer-events-none" />

                    <div className="relative border border-white/10 rounded-3xl p-3 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden aspect-square flex flex-col justify-between">
                      <div className="flex-1 rounded-2xl overflow-hidden mb-4 bg-slate-900 flex items-center justify-center">
                        {/* High resolution spiritual/heritage travel background */}
                        <img
                          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
                          alt="Shreeseva Heritage Tour Route"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-[#0a192f] border border-[#d4af37]/20 rounded-xl">
                          <h4 className="text-xl font-bold text-[#d4af37]">500+</h4>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Trips Led</p>
                        </div>
                        <div className="p-3 bg-[#0a192f] border border-[#d4af37]/20 rounded-xl">
                          <h4 className="text-xl font-bold text-[#d4af37]">100%</h4>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Safety Record</p>
                        </div>
                        <div className="p-3 bg-[#0a192f] border border-[#d4af37]/20 rounded-xl">
                          <h4 className="text-xl font-bold text-[#d4af37]">12+</h4>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Vans Fleet</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Narrative */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                      <span className="text-[#d4af37] font-bold text-xs tracking-[0.3em] uppercase">SHREESEVA ADVENTURE STORY</span>
                      <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white">The Legacy Of Faithful Journeys</h2>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed">
                      At <strong className="text-[#d4af37]">Shreeseva Tours & Travels</strong>, we believe travel is not merely about traversing kilometres—it is about the premium comfort, peaceful environment, and absolute security that binds family members, friends, and co-workers together.
                    </p>

                    <p className="text-slate-300 text-sm leading-relaxed">
                      Based in the historical heart of <strong className="text-white">Indore, Madhya Pradesh</strong>, we started as a boutique car service. Over the decade, we realized group travel was highly underserved with premium vehicles. Today, we stand as Central India's premier luxury Force Urbania and luxury Tempo Traveller pioneer.
                    </p>

                    {/* Quality Badges */}
                    <div className="space-y-3 pt-2">
                      {[
                        {
                          title: 'Elite Chauffeur Cadre',
                          desc: 'All Shreeseva drivers undergo commercial highway drills, pilgrimage navigation checks, and extensive customer ethics grooming.'
                        },
                        {
                          title: 'Impeccable Mechanical Auditing',
                          desc: 'Each Force Urbania and Tempo Traveller completes a exhaustive 45-point engine, AC, suspension, and tires check before every dispatch.'
                        },
                        {
                          title: 'Custom In-Coach Luxuries',
                          desc: 'We customized our interiors beyond standard factory parameters with luxury captain chairs, ambient roof configurations, and high-fidelity smart TV acoustics.'
                        }
                      ].map((badge, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-5 h-5 rounded bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            ✓
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">{badge.title}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{badge.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="px-6 py-3 bg-white/5 border border-white/20 hover:border-[#d4af37]/50 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-luxury"
                      >
                        Contact Director Desk
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </section>
          </>
        )}

        {/* TAB 2: SECURED ADMIN PORTAL */}
        {false && (
          <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8 min-h-[80vh] animate-in fade-in duration-300">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#d4af37]/20">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Shreeseva Central Operations Panel</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-white mt-1">Reservation & Lead Ledger</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleResetAdminData}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-luxury"
                >
                  Reset Demo Data
                </button>
                <button
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setAdminPin('');
                    setActiveTab('user');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-luxury"
                >
                  Logout Panel
                </button>
              </div>
            </div>

            {/* Authentication Lock if not logged in */}
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-[#0a192f] border border-[#d4af37]/30 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]" />

                <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-cinzel font-bold text-white text-lg">Secure Operation Authorization</h3>
                  <p className="text-xs text-slate-300">Enter the four-digit reservation desk PIN to access customer ledgers and booking pipelines.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400 tracking-widest block font-bold">Desk Access PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • •"
                      className="w-full text-center tracking-[1.5em] bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-black text-lg outline-none focus:border-[#d4af37]"
                    />
                    {pinError && <span className="text-red-500 text-[10px] block mt-1 font-semibold">{pinError}</span>}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#fbe697] to-[#d4af37] text-[#0a192f] rounded-xl font-bold text-xs uppercase tracking-widest transition-luxury shadow-lg"
                  >
                    Authorize Operations
                  </button>

                  <p className="text-[10px] text-slate-400 italic">
                    Hint: Use default demo access pin <strong className="text-white">1234</strong>
                  </p>
                </form>
              </div>
            ) : (
              // FULL ADMIN DASHBOARD SYSTEM
              <div className="space-y-8">

                {/* Analytics summary bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="bg-[#0a192f]/40 border border-white/5 rounded-2xl p-5 space-y-1 relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Leads Registered</p>
                    <h3 className="text-3xl font-cinzel font-bold text-[#d4af37]">{totalSubmissions}</h3>
                    <p className="text-[10px] text-slate-400">Recorded client forms submitted</p>
                    <div className="absolute top-4 right-4 text-slate-500/20"><Database className="w-8 h-8" /></div>
                  </div>

                  <div className="bg-[#0a192f]/40 border border-white/5 rounded-2xl p-5 space-y-1 relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Awaiting Dispatch Call</p>
                    <h3 className="text-3xl font-cinzel font-bold text-orange-400">{pendingSubmissions}</h3>
                    <p className="text-[10px] text-slate-400">Leads with Pending status</p>
                    <div className="absolute top-4 right-4 text-slate-500/20"><Clock className="w-8 h-8" /></div>
                  </div>

                  <div className="bg-[#0a192f]/40 border border-white/5 rounded-2xl p-5 space-y-1 relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Bookings Confirmed</p>
                    <h3 className="text-3xl font-cinzel font-bold text-emerald-400">{confirmedSubmissions}</h3>
                    <p className="text-[10px] text-slate-400">Vehicles formally committed</p>
                    <div className="absolute top-4 right-4 text-slate-500/20"><CheckCircle className="w-8 h-8" /></div>
                  </div>

                  <div className="bg-[#0a192f]/40 border border-white/5 rounded-2xl p-5 space-y-1 relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Chauffeur Contact Rate</p>
                    <h3 className="text-3xl font-cinzel font-bold text-sky-400">{contactRate}%</h3>
                    <p className="text-[10px] text-slate-400">Percentage processed out of pending</p>
                    <div className="absolute top-4 right-4 text-slate-500/20"><TrendingUp className="w-8 h-8" /></div>
                  </div>

                </div>

                {/* Submissions Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left Column: List of Submissions */}
                  <div className="lg:col-span-8 bg-[#0a192f]/30 border border-white/5 rounded-3xl p-6 space-y-6">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="font-cinzel font-bold text-lg text-white">Client Inquiry Ledger</h3>

                      {/* Filter list */}
                      <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        {['All', 'Pending', 'Contacted', 'Confirmed', 'Cancelled'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setAdminFilter(st as any)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${adminFilter === st
                              ? 'bg-[#d4af37] text-[#0a192f]'
                              : 'text-slate-300 hover:bg-white/5'
                              }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {bookings.filter(b => adminFilter === 'All' || b.status === adminFilter).length === 0 ? (
                        <div className="text-center py-12 text-slate-400 border border-dashed border-white/10 rounded-2xl">
                          No bookings found with status {adminFilter}
                        </div>
                      ) : (
                        bookings
                          .filter(b => adminFilter === 'All' || b.status === adminFilter)
                          .map((b) => (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBookingForDetails(b)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${selectedBookingForDetails?.id === b.id
                                ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-lg'
                                : 'bg-[#0a192f]/60 border-white/5 hover:border-white/20'
                                }`}
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-xs">{b.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">({b.id})</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.pickup} → {b.destination}
                                  </p>
                                  <p className="flex items-center gap-1 font-semibold text-[#d4af37]">
                                    <Calendar className="w-3.5 h-3.5" /> {b.travelDate}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded tracking-wider border ${b.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' :
                                  b.status === 'Contacted' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                    b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                      'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}>
                                  {b.status}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>

                            </div>
                          ))
                      )}
                    </div>

                  </div>

                  {/* Right Column: Detail View & Status Modifiers */}
                  <div className="lg:col-span-4 space-y-6">
                    {selectedBookingForDetails ? (
                      <div className="bg-[#0a192f] border border-[#d4af37]/30 rounded-3xl p-6 space-y-6 shadow-2xl relative animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">{selectedBookingForDetails.id}</span>
                            <h4 className="font-cinzel font-bold text-white text-lg mt-0.5">{selectedBookingForDetails.name}</h4>
                          </div>
                          <button
                            onClick={() => setSelectedBookingForDetails(null)}
                            className="p-1.5 hover:bg-white/5 rounded text-slate-400"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-4 text-xs border-y border-white/5 py-4">
                          <div>
                            <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Phone Contact</p>
                            <p className="text-white font-bold text-sm mt-0.5">{selectedBookingForDetails.phone}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Travel Itinerary</p>
                            <p className="text-white mt-0.5 font-medium">{selectedBookingForDetails.pickup} to {selectedBookingForDetails.destination}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Travel Date</p>
                              <p className="text-[#d4af37] font-bold mt-0.5">{selectedBookingForDetails.travelDate}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Passengers</p>
                              <p className="text-white font-bold mt-0.5">{selectedBookingForDetails.passengers} Passengers</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Selected Fleet Car</p>
                            <p className="text-[#d4af37] font-bold mt-0.5">{selectedBookingForDetails.vehicleType}</p>
                          </div>
                          {selectedBookingForDetails.notes && (
                            <div>
                              <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Inquiry Notes / Special Requests</p>
                              <p className="text-slate-200 mt-1 bg-white/5 p-2 rounded border border-white/5">{selectedBookingForDetails.notes}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Inquiry Logs Created At</p>
                            <p className="text-slate-400 mt-0.5 font-mono text-[10px]">{new Date(selectedBookingForDetails.createdAt).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Status update controls */}
                        <div className="space-y-3">
                          <p className="text-slate-400 uppercase text-[9px] tracking-widest block font-bold">Update Inquiry Status</p>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, 'Contacted')}
                              className="py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-xl text-xs font-semibold"
                            >
                              Mark Contacted
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, 'Confirmed')}
                              className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold"
                            >
                              Confirm Booking
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, 'Cancelled')}
                              className="py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold"
                            >
                              Cancel Booking
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, 'Pending')}
                              className="py-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-xs font-semibold"
                            >
                              Reset Pending
                            </button>
                          </div>

                          {/* Quick note addition */}
                          <div className="space-y-1.5 pt-2">
                            <label className="text-slate-400 uppercase text-[9px] tracking-widest block font-bold">Operation Notes</label>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Write dispatch details, price quoted, or driver assigned..."
                              className="w-full bg-[#050b14] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#d4af37] resize-none h-16"
                            />
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => handleDeleteBooking(selectedBookingForDetails.id)}
                              className="w-full py-2.5 bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Submission
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-[#0a192f]/20 border border-dashed border-white/10 rounded-3xl p-8 text-center text-slate-400 py-16">
                        <Info className="w-8 h-8 mx-auto text-[#d4af37]/40 mb-3 animate-bounce" />
                        <h4 className="font-semibold text-sm text-slate-300">Select Submission Log</h4>
                        <p className="text-xs mt-1">Select any client inquiry from the left ledger to review complete details, update status, append operation notes, or clear records.</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </section>
        )}

      </main>

      {/* FOOTER SECTION BAR */}
      <footer className="bg-[#070f1a] border-t border-[#d4af37]/20 pt-16 pb-8 px-4 sm:px-8 mt-auto relative z-10 text-xs text-slate-400 font-medium">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/5">

          {/* Logo Brand Footer column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0a192f] font-bold text-xl">
                S
              </div>
              <div>
                <h3 className="text-white font-cinzel font-bold text-sm tracking-wide leading-none">SHREESEVA</h3>
                <p className="text-[#d4af37] text-[9px] uppercase tracking-widest font-semibold mt-0.5">Tours & Travels</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Madhya Pradesh's undisputed champion of luxury Force Urbania, customized Tempo Traveller, and elite group commutes. Safe journeys, elite drivers, and luxury guarantees.
            </p>
            <div className="flex gap-4 pt-1">
              {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social) => (
                <span key={social} className="text-xs text-[#d4af37] hover:underline hover:text-white cursor-pointer uppercase font-semibold text-[10px] tracking-wider">
                  {social}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-cinzel text-white text-xs font-bold uppercase tracking-wider">Site Sections</h4>
            <div className="grid grid-cols-1 gap-2.5">
              {['home', 'fleet', 'services', 'gallery', 'about', 'contact'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => scrollToSection(sec)}
                  className="text-left hover:text-[#d4af37] text-slate-300 transition-colors uppercase text-[10px] tracking-wider font-semibold"
                >
                  {sec === 'about' ? 'About Us' : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Legal and Support contact Desk */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-cinzel text-white text-xs font-bold uppercase tracking-wider">Immediate Assistance desk</h4>
            <p className="text-slate-300 text-xs">For offline reservations, pricing quotes, or dynamic route consultations:</p>
            <div className="space-y-1">
              <p className="text-white font-bold">Mobile Desk: +91 9685177357</p>
              <p className="text-white font-bold">Corporate Desk: +91 9685177357</p>
              <p className="text-[#d4af37] font-semibold text-[11px] hover:underline cursor-pointer" onClick={() => scrollToSection('contact')}>
                info@shreesevatours.com
              </p>
            </div>
          </div>

        </div>

        {/* Copy bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Shreeseva Tours & Travels. Designed in Professional Polish Theme.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <span>Safe Cruising</span>
            <span>✓ Reliable Fleet</span>
            <span>✓ Pan India permits</span>
           
          </div>
        </div>

      </footer>

    </div>
  );
}
