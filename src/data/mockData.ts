import type { TimezoneOption, ShootCategory, TimeSlot, GearAddon, LocationOption, PortfolioItem, GearItem, CrewMember, Booking } from '../types/flashCinema';

export const TIMEZONES: TimezoneOption[] = [
  { id: 'pst', name: 'Pacific Standard Time (Los Angeles / SF)', code: 'PST', offset: 'GMT-8:00', utcOffsetHours: -8 },
  { id: 'est', name: 'Eastern Standard Time (New York / Miami)', code: 'EST', offset: 'GMT-5:00', utcOffsetHours: -5 },
  { id: 'cst', name: 'Central Standard Time (Chicago / Dallas)', code: 'CST', offset: 'GMT-6:00', utcOffsetHours: -6 },
  { id: 'mst', name: 'Mountain Standard Time (Denver / Phoenix)', code: 'MST', offset: 'GMT-7:00', utcOffsetHours: -7 },
  { id: 'gmt', name: 'Greenwich Mean Time (London / Europe)', code: 'GMT', offset: 'GMT+0:00', utcOffsetHours: 0 }
];

export const SHOOT_CATEGORIES: ShootCategory[] = [
  {
    id: 'fashion-flash',
    title: 'High-Fashion & Runway Stills',
    subtitle: '41MP Flash Stills + High-Speed Motion Rigs',
    description: 'Editorial fashion shoots with Profoto Flash generators, high-speed shutter rigs, and celebrity styling setup in Los Angeles & New York Flagship Studios.',
    basePriceUSD: 1800,
    durationHours: 4,
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Camera',
    features: ['Profoto Pro-11 2400W AirTTL Flash Generators', '20 Ultra-High Res Retouched Master Stills', 'Dual Stylist & Makeup Station Access', '4K Behind-The-Scenes Vertical Reel'],
    popular: true
  },
  {
    id: 'wedding-films',
    title: 'Cinematic Destination Wedding Films',
    subtitle: '4K 120fps Cinema + FPV Drone Coverage',
    description: 'Bespoke wedding documentaries capturing luxury estate weddings in Napa Valley, the Hamptons, Malibu, and Beverly Hills with full crew.',
    basePriceUSD: 4500,
    durationHours: 8,
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Video',
    features: ['3 Cinema Camera Operators (RED V-Raptor / Sony FX6)', 'FPV Drone & Master Aerial Cinema', '15-Min Cinematic Film + 60-Sec Teaser (48hr Express)', 'Master Dolby Atmos Audio Score'],
    popular: true
  },
  {
    id: 'commercial-ads',
    title: 'Commercial Brand & Music Video',
    subtitle: 'RED 8K Cinema + Anamorphic Lenses',
    description: 'High-impact TV commercial and music video production featuring Arri Cinema Rigs, dynamic lighting stages, and color grading.',
    basePriceUSD: 6500,
    durationHours: 10,
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Film',
    features: ['Cooke Anamorphic Lenses & RED 8K Cinema', 'Director & Gaffer-led Lighting Crew', 'Full Color Grading in DaVinci Resolve Studio', '4K Master + Broadcast & Social Cutouts']
  },
  {
    id: 'pre-wedding',
    title: 'Heritage Engagement & Concept',
    subtitle: 'Golden Hour Coastal Flash Cinema',
    description: 'Romantic heritage film shoots at Malibu Beach, Napa Valley Vineyards, Central Park NYC, and South Beach Miami.',
    basePriceUSD: 2800,
    durationHours: 6,
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Heart',
    features: ['2 Master Cinematographers + Stills Lead', 'Drone Aerial Filming & Sunset Flash Stills', 'Custom Props & Lighting Assistant', '50 Color Mastered Photos + 3-Min Film']
  },
  {
    id: 'reels-social',
    title: 'Social Media 4K Reels & Shorts',
    subtitle: 'Vertical 9:16 High-Velocity Content',
    description: 'Fast-paced social media brand content creation with instant color LUTs, wireless mic audio, and trend editing.',
    basePriceUSD: 1200,
    durationHours: 3,
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Smartphone',
    features: ['5 Ultra-Crisp 4K Vertical Reels (9:16)', 'Sony FX3 Gimbal Stabilized Motion', 'Professional Wireless Audio Recording', 'Same-Day Raw Clips AirDrop']
  },
  {
    id: 'corporate-product',
    title: '360° Corporate & Product Flash',
    subtitle: 'Studio White-Box & Tech Rigs',
    description: 'Precision studio photography for tech brands, luxury products, and executive C-suite leadership headshots.',
    basePriceUSD: 1500,
    durationHours: 4,
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    iconName: 'Briefcase',
    features: ['Macro Focus Stacking & High-Key Studio', '360-Degree Product Spin Rigs', 'Corporate Headshot Lighting Suite', 'Full Commercial License Rights']
  }
];

export const TIME_SLOTS_PST: TimeSlot[] = [
  { id: 'slot-1', timePST: '07:00 AM', label: 'Sunrise Golden Hour Coastal Flash', isPeak: true, available: true },
  { id: 'slot-2', timePST: '10:00 AM', label: 'Morning High-Key Studio Block', isPeak: false, available: true },
  { id: 'slot-3', timePST: '02:00 PM', label: 'Afternoon Editorial Runway & Commercial', isPeak: false, available: true },
  { id: 'slot-4', timePST: '05:30 PM', label: 'Sunset Sunset Blvd Flash Cinema', isPeak: true, available: true },
  { id: 'slot-5', timePST: '08:30 PM', label: 'Hollywood Night Neon & Drama Cinema', isPeak: false, available: true }
];

export const GEAR_ADDONS: GearAddon[] = [
  {
    id: 'drone-fpv',
    name: '4K FPV Drone Cinema Rig',
    category: 'drone',
    description: 'High-speed acrobatic fly-through filming by FAA-licensed drone pilots.',
    priceUSD: 450,
    icon: 'Navigation'
  },
  {
    id: 'red-vraptor',
    name: 'RED V-Raptor 8K Camera Upgrade',
    category: 'camera',
    description: '16 stops of dynamic range & 120fps 8K RAW cinema recording.',
    priceUSD: 600,
    icon: 'Camera'
  },
  {
    id: 'crane-jib',
    name: 'Motorized Camera Crane & Jib',
    category: 'rigs',
    description: 'Sweeping 18ft overhead cinema crane moves for estate galas.',
    priceUSD: 550,
    icon: 'Sliders'
  },
  {
    id: 'express-delivery',
    name: '24-Hour Express Teaser Delivery',
    category: 'speed',
    description: 'Receive color-graded 60-second teaser within 24 hours of shoot wrapped.',
    priceUSD: 350,
    icon: 'Zap'
  },
  {
    id: 'profoto-flash',
    name: 'Profoto Pro-11 High-Speed Flash Pack',
    category: 'lighting',
    description: '1/80,000s flash duration freeze-motion lighting suite.',
    priceUSD: 400,
    icon: 'Sun'
  }
];

export const LOCATIONS: LocationOption[] = [
  {
    id: 'la-studio',
    name: 'Apex Los Angeles Flagship Studio',
    area: 'Sunset Blvd, Hollywood, CA',
    type: 'studio',
    description: '5,500 sq ft soundproof studio with cyclorama wall, RGB light grid & infinity cove.',
    extraFeeUSD: 0,
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'nyc-loft',
    name: 'Apex Manhattan Skyline Loft',
    area: 'SoHo, New York City, NY',
    type: 'studio',
    description: 'Glass-walled luxury penthouse loft stage with panoramic views over Manhattan.',
    extraFeeUSD: 350,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'napa-estate',
    name: 'Napa Valley Heritage Vineyard',
    area: 'Napa Valley, California',
    type: 'fort',
    description: 'Access to private vineyard estates, rolling hills, and historic chateaus.',
    extraFeeUSD: 600,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'custom-venue',
    name: 'Client Custom Resort / Location',
    area: 'Malibu / Hamptons / Miami / Outstation',
    type: 'custom',
    description: 'Our mobile production cinema truck deploys directly to your US destination.',
    extraFeeUSD: 500,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  }
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Napa Valley Vineyard Estate Gala',
    category: 'Wedding Films',
    client: 'Vance & Sterling Wedding',
    location: 'St. Helena Vineyard Estate, Napa Valley, CA',
    cameraGear: 'RED V-Raptor 8K + Sony FX6',
    lens: 'Cooke Anamorphic 50mm T2.3',
    director: 'Marcus Vance',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    galleryImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80'
    ],
    views: '184.5K',
    likes: 5840,
    featured: true,
    tags: ['Wedding', 'Estate', '4K Cinema', 'Dolby Atmos']
  },
  {
    id: 'port-2',
    title: 'Vogue US - Sunset Blvd Neon Flash',
    category: 'Fashion Flash',
    client: 'Vogue US x Hollywood Fashion',
    location: 'Apex Studio 1, Sunset Blvd, LA',
    cameraGear: 'Hasselblad H6D-100c + Profoto Pro-11',
    lens: 'HC 100mm f/2.2',
    director: 'Sarah Jenkins',
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
    ],
    views: '142.2K',
    likes: 4910,
    featured: true,
    tags: ['High Fashion', 'Profoto Flash', 'Editorial']
  },
  {
    id: 'port-3',
    title: 'Porsche 911 GT3 RS - Night Drive',
    category: 'Commercial Ads',
    client: 'Porsche North America',
    location: 'Angeles Crest Highway, Los Angeles, CA',
    cameraGear: 'ARRI Alexa Mini LF + Pursuit Car Rig',
    lens: 'ARRI Signature Prime 35mm',
    director: 'Marcus Vance',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    galleryImages: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
    ],
    views: '340.8K',
    likes: 11420,
    featured: true,
    tags: ['Commercial', 'Automotive', '8K Cinema']
  },
  {
    id: 'port-4',
    title: 'Sunset Whispers at Malibu Beach',
    category: 'Drone Cinema',
    client: 'Chloe & Brandon',
    location: 'El Matador State Beach, Malibu, CA',
    cameraGear: 'DJI Inspire 3 Zenmuse X9-8K Air',
    lens: 'DL 24mm F2.8 LS ASPH',
    director: 'Sarah Jenkins',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    views: '96.4K',
    likes: 3850,
    tags: ['Drone 8K', 'Sunset', 'Engagement']
  }
];

export const GEAR_INVENTORY: GearItem[] = [
  {
    id: 'g-1',
    name: 'RED V-Raptor 8K VV Cinema Package',
    brand: 'RED Digital Cinema',
    specs: '8K 120fps, 16 Stops Dynamic Range, RF Mount',
    category: 'Cameras',
    image: 'https://images.unsplash.com/photo-1585856467700-de5c6592b643?auto=format&fit=crop&w=600&q=80',
    dailyRateUSD: 650,
    available: true
  },
  {
    id: 'g-2',
    name: 'Profoto Pro-11 2400 AirTTL Flash Pack',
    brand: 'Profoto Sweden',
    specs: '1/80,000s flash duration, 50 flashes per sec',
    category: 'Lighting',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    dailyRateUSD: 400,
    available: true
  },
  {
    id: 'g-3',
    name: 'DJI Inspire 3 8K Cinema Drone',
    brand: 'DJI Enterprise',
    specs: 'Full-Frame 8K ProRes RAW, Waypoint Pro 3.0',
    category: 'Drones',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
    dailyRateUSD: 500,
    available: true
  },
  {
    id: 'g-4',
    name: 'Cooke Anamorphic /i Full Frame 5-Lens Set',
    brand: 'Cooke Optics UK',
    specs: '32mm, 40mm, 50mm, 75mm, 100mm T2.3',
    category: 'Lenses',
    image: 'https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?auto=format&fit=crop&w=600&q=80',
    dailyRateUSD: 850,
    available: true
  }
];

export const CREW_MEMBERS: CrewMember[] = [
  {
    id: 'crew-1',
    name: 'Marcus Vance',
    role: 'Founder & Lead Director of Photography',
    awards: 'Emmy Award & Cannes Lion Winner for Best Cinematography 2024',
    experienceYears: 16,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    instagram: '@marcusvance_cinema',
    bio: 'Pioneer of high-speed flash videography in North America with over 400 luxury wedding and commercial TV credits.',
    topShoots: ['Napa Valley Estate Gala', 'Vogue US Cover', 'Porsche 911 GT3 Spot']
  },
  {
    id: 'crew-2',
    name: 'Sarah Jenkins',
    role: 'Lead Fashion Photographer & Lighting Director',
    awards: 'International Fashion Photographer of the Year (Americas)',
    experienceYears: 11,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    instagram: '@sarahjenkins_flash',
    bio: 'Specializes in high-fashion studio flash portraits and editorial lighting setups for top US brands and celebrity stars.',
    topShoots: ['New York Fashion Week', 'Hollywood Star Portfolios']
  }
];

export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'APEX-US-9402',
    userId: 'client-1',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah.j@vogue.com',
    clientPhone: '+1 (310) 555-0199',
    category: SHOOT_CATEGORIES[0],
    date: '2026-08-15',
    timeSlotPST: '10:00 AM',
    convertedTime: '10:00 AM PST (1:00 PM EST)',
    clientTimezone: TIMEZONES[0],
    location: LOCATIONS[0],
    selectedAddons: [GEAR_ADDONS[3]],
    subtotalUSD: 2150,
    taxUSD: 190.81,
    totalUSD: 2340.81,
    status: 'pre-production',
    createdAt: '2026-08-05T10:30:00Z',
    proofMedia: [
      {
        id: 'proof-1',
        title: 'Runway Lighting Test - Raw Stills',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
        resolution: '8192 x 5464',
        fileSize: '42.5 MB',
        status: 'approved'
      },
      {
        id: 'proof-2',
        title: '60-Sec Teaser First Cut (Color Graded)',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80',
        resolution: '3840 x 2160 (4K 60fps)',
        fileSize: '320 MB',
        status: 'draft'
      }
    ]
  }
];
