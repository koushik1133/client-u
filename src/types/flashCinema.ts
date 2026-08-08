export type UserRole = 'client' | 'director' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  company?: string;
  timezone: string;
  createdAt: string;
}

export interface TimezoneOption {
  id: string;
  name: string;
  code: string;
  offset: string;
  utcOffsetHours: number;
}

export interface ShootCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  basePriceUSD: number;
  durationHours: number;
  coverImage: string;
  iconName: string;
  features: string[];
  popular?: boolean;
}

export interface TimeSlot {
  id: string;
  timePST: string;
  label: string;
  isPeak: boolean;
  available: boolean;
}

export interface GearAddon {
  id: string;
  name: string;
  category: 'camera' | 'drone' | 'lighting' | 'crew' | 'speed' | 'rigs';
  description: string;
  priceUSD: number;
  icon: string;
  selected?: boolean;
}

export interface LocationOption {
  id: string;
  name: string;
  area: string;
  type: 'studio' | 'outdoor' | 'fort' | 'custom';
  description: string;
  extraFeeUSD: number;
  image: string;
}

export interface Booking {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  category: ShootCategory;
  date: string;
  timeSlotPST: string;
  convertedTime: string;
  clientTimezone: TimezoneOption;
  location: LocationOption;
  selectedAddons: GearAddon[];
  specialInstructions?: string;
  subtotalUSD: number;
  taxUSD: number;
  totalUSD: number;
  status: 'booked' | 'pre-production' | 'shoot-day' | 'color-grading' | 'delivered';
  createdAt: string;
  invoiceUrl?: string;
  proofMedia?: ProofMedia[];
}

export interface ProofMedia {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  resolution: string;
  fileSize: string;
  status: 'draft' | 'approved' | 'revision-requested';
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  client: string;
  location: string;
  cameraGear: string;
  lens: string;
  director: string;
  coverImage: string;
  videoUrl?: string;
  galleryImages: string[];
  views: string;
  likes: number;
  featured?: boolean;
  tags: string[];
}

export interface GearItem {
  id: string;
  name: string;
  brand: string;
  specs: string;
  category: 'Cameras' | 'Lenses' | 'Lighting' | 'Drones' | 'Rigs';
  image: string;
  dailyRateUSD: number;
  available: boolean;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  awards: string;
  experienceYears: number;
  avatar: string;
  instagram: string;
  bio: string;
  topShoots: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}
