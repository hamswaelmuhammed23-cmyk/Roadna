/**
 * mockData.js
 *
 * Centralized mock data for the Explore page.
 * Uses Egyptian and Arab destinations/users.
 */

export const mockTrips = [
  {
    id: 1,
    title: "Pyramids of Giza Tour",
    category: "Culture",
    location: "Cairo, Egypt",
    image: "/images/pyramids.webp",
    duration: "1 Day",
    travelers: 15,
    tags: ["Culture", "heritage", "camp"],
    description: "Explore the ancient wonders of the world, ride camels across the desert, and witness the majesty of the Sphinx.",
    rating: 4.9,
  },
  {
    id: 2,
    title: "Dahab Blue Hole Diving",
    category: "Sport",
    location: "Dahab, Egypt",
    image: "/images/dahab2.jpg",
    duration: "4 Days",
    travelers: 8,
    tags: ["camp", "fitness", "leisure"],
    description: "Dive into the crystal clear waters of the Red Sea and explore the world-famous Blue Hole.",
    rating: 4.8,
  },
  {
    id: 3,
    title: "Luxor to Aswan Cultural Cruise",
    category: "Culture",
    location: "Luxor, Egypt → Aswan, Egypt",
    image: "/images/luxor.jpg",
    duration: "5 Days",
    travelers: 20,
    tags: ["tradition", "events", "learning"],
    description: "Sail the historic Nile river bordered by ancient temples, kings' valleys, and stunning sunsets.",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Siwa Oasis Expedition",
    category: "Adventure",
    location: "Siwa, Egypt",
    image: "/images/siwa-oasis.png",
    duration: "3 Days",
    travelers: 6,
    tags: ["camp", "training", "tradition"],
    description: "Dip in the salt lakes, explore the ancient Shali fortress, and ride dunes in a 4x4.",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Alexandria Coastal Escape",
    category: "Arts",
    location: "Alexandria, Egypt",
    image: "/images/alexandria-coast.jpg",
    duration: "2 Days",
    travelers: 12,
    tags: ["leisure", "heritage", "arts"],
    description: "Enjoy fresh seafood by the Mediterranean sea and visit the glorious Citadel of Qaitbay.",
    rating: 4.6,
  },
  {
    id: 6,
    title: "Cairo to Dubai Skyline Escape",
    category: "Business",
    location: "Cairo, Egypt → Dubai, UAE",
    image: "/images/cairo2.jpg",
    duration: "5 Days",
    travelers: 10,
    tags: ["market", "trade", "innovation"],
    description: "Marvel at the Burj Khalifa, explore luxury malls, and bash dunes in the Arabian desert.",
    rating: 4.8,
  },
  {
    id: 7,
    title: "Sharm to Petra Explorer",
    category: "Culture",
    location: "Sharm El-Sheikh, Egypt → Petra, Jordan",
    image: "/images/sharm-elsheikh.jpg",
    duration: "3 Days",
    travelers: 8,
    tags: ["camp", "tradition", "courses"],
    description: "Walk through the stunning Siq to reveal the Treasury in one of the new Seven Wonders.",
    rating: 4.9,
  },
  {
    id: 8,
    title: "Medical Tourism & Spa Retreat",
    category: "Medical",
    location: "Safaga, Egypt",
    image: "/images/safaga-spa.png",
    duration: "7 Days",
    travelers: 5,
    tags: ["treatment", "heritage", "events"],
    description: "Experience the healing black sands and natural mineral springs of Safaga.",
    rating: 4.9,
  },
  {
    id: 9,
    title: "Wildlife Documentary Expedition",
    category: "Documentary",
    location: "Wadi El Gemal, Egypt",
    image: "/images/wadi-el-gemal.png",
    duration: "6 Days",
    travelers: 4,
    tags: ["film", "research", "camp"],
    description: "Join professional videographers to film the rare wildlife in the Eastern Desert.",
    rating: 5.0,
  },
  {
    id: 10,
    title: "Cairo Comedy Festival Tour",
    category: "Comedy",
    location: "Cairo, Egypt",
    image: "/images/cairo-comedy.png",
    duration: "2 Days",
    travelers: 25,
    tags: ["live", "events", "tradition"],
    description: "A weekend filled with the best stand-up comedy shows across Cairo.",
    rating: 4.8,
  },
  {
    id: 11,
    title: "Nubian Dance & Music Week",
    category: "Culture",
    location: "Aswan, Egypt",
    image: "/images/aswan.jpg",
    duration: "4 Days",
    travelers: 18,
    tags: ["music", "live", "tradition"],
    description: "Immerse yourself in authentic Nubian rhythms, dance classes, and local village life.",
    rating: 4.9,
  }
];

export const mockEvents = [
  {
    id: "e1",
    title: "Cairo Health Innovation Summit",
    category: "Medical",
    location: "Cairo, Egypt",
    date: "20 April",
    image: "/images/health-summit.png",
    tags: ["health", "innovation", "students"],
  },
  {
    id: "e2",
    title: "Alex Entertainment Night",
    category: "Entertainment",
    location: "Alexandria, Egypt",
    date: "22 April",
    image: "/images/ev-art.jpg",
    tags: ["nightlife", "music", "arts"],
  },
  {
    id: "e3",
    title: "Business Leaders Forum",
    category: "Business",
    location: "New Cairo, Egypt",
    date: "24 April",
    image: "/images/ev-business.jpg",
    tags: ["meeting", "trade", "startups"],
  },
  {
    id: "e4",
    title: "Nile Culture & Art Expo",
    category: "Culture",
    location: "Aswan, Egypt",
    date: "27 April",
    image: "/images/ev-art.jpg",
    tags: ["heritage", "arts", "learning"],
  },
  {
    id: "e5",
    title: "Red Sea Water Sports Day",
    category: "Sport",
    location: "Hurghada, Egypt",
    date: "29 April",
    image: "/images/ev-sports.jpg",
    tags: ["fitness", "camp", "leisure"],
  },
  {
    id: "e6",
    title: "EduTech Egypt Conference",
    category: "Education",
    location: "Mansoura, Egypt",
    date: "30 April",
    image: "/images/ev-books.jpg",
    tags: ["courses", "innovation", "entrepreneurship"],
  },
  {
    id: "e7",
    title: "Documentary Film Screening",
    category: "Documentary",
    location: "Zamalek, Cairo",
    date: "2 May",
    image: "/images/ev-art.jpg",
    tags: ["film", "storytelling", "heritage"],
  },
  {
    id: "e8",
    title: "Standup Comedy Open Mic",
    category: "Comedy",
    location: "Maadi, Cairo",
    date: "5 May",
    image: "/images/ev-books.jpg",
    tags: ["standup comedy", "events", "tradition"],
  },
  {
    id: "e9",
    title: "International Trade Exhibition",
    category: "Trade Shows",
    location: "Cairo International Convention Centre",
    date: "10 May",
    image: "/images/ev-business.jpg",
    tags: ["trade", "market", "startups"],
  },
  {
    id: "e10",
    title: "Modern Dance Workshop",
    category: "Dance",
    location: "Heliopolis, Cairo",
    date: "12 May",
    image: "/images/ev-art.jpg",
    tags: ["ballet", "workshop", "music"],
  }
];

export const mockUsers = [
  {
    id: "c1",
    name: "Ahmed Ali",
    age: 28,
    country: "Egypt",
    interests: ["Hiking", "Photography", "Culture"], // Will show Amber (~30-40%)
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "History grad from Cairo, I love exploring old temples. 🏛️",
    tripsCount: 12,
  },
  {
    id: "c2",
    name: "Sarah",
    age: 25,
    country: "Egypt",
    interests: ["Hiking", "Music", "Adventure"], // Will show Sky Blue (~60%)
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    bio: "Based in Dahab, underwater explorer and free diver 🌊",
    tripsCount: 18,
  },
  {
    id: "c3",
    name: "Ali",
    age: 30,
    country: "Egypt",
    interests: ["Hiking", "Music", "Business"], // Will show Emerald (100%)
    photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80",
    bio: "Sinai resident, always looking for the next mountain to climb ⛰️",
    tripsCount: 25,
  },
  {
    id: "c4",
    name: "Farah",
    age: 23,
    country: "Saudi Arabia",
    interests: ["City", "Food", "Culture"],
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    bio: "Designer from Riyadh, obsessed with street food and art galleries ✨",
    tripsCount: 5,
  },
  {
    id: "c5",
    name: "Omar",
    age: 32,
    country: "UAE",
    interests: ["Adventure", "Photography", "Beach"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    bio: "Dubai-based photographer chasing the perfect sunset 📸",
    tripsCount: 8,
  },
  {
    id: "c6",
    name: "Lina Hassan",
    age: 27,
    country: "Egypt",
    interests: ["History", "Culture", "Relaxation"],
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
    bio: "Alexandria born. Just give me a book and a view of the sea 📖",
    tripsCount: 14,
  },
];

export const CATEGORY_TAGS = {
  'Documentary': ['Exploration', 'film', 'story', 'travel', 'history', 'theatre'],
  'Medical': ['treatment', 'clinic', 'rehabilitation', 'health'],
  'Entertainment': ['nightlife', 'cinema', 'leisure', 'events', 'festival', 'horses'],
  'Business': ['conference', 'meeting', 'market', 'entrepreneurship', 'networking'],
  'Culture': ['tradition', 'museum', 'heritage', 'architecture', 'art'],
  'Sport': ['stadium', 'fitness', 'team', 'competition', 'training'],
  'Education': ['students', 'research', 'knowledge', 'courses', 'learning'],
  'Arts': ['arts', 'gallery', 'talks', 'storytelling', 'workshop', 'festival'],
  'Music': ['music', 'live', 'jazz', 'oud', 'concert', 'sunset'],
  'Technology': ['conference', 'startups', 'ai', 'robotics', 'cybersecurity', 'innovation', 'e-commerce', 'logistics'],
  'Adventure': ['camp'],
  'Trade Shows': ['trade', 'tourism', 'industry', 'photography', 'ceramic', 'conference'],
  'Comedy': ['standup comedy', 'comedy show', 'live', 'shows'],
  'Dance': ['ballet', 'music', 'party']
};

function getExpandedInterests(userInterests) {
  const expanded = new Set(userInterests.map(i => i.toLowerCase()));
  userInterests.forEach(interest => {
    const categoryKey = Object.keys(CATEGORY_TAGS).find(k => k.toLowerCase() === interest.toLowerCase());
    if (categoryKey) {
      CATEGORY_TAGS[categoryKey].forEach(t => expanded.add(t.toLowerCase()));
    }
  });
  return Array.from(expanded);
}

export function getRecommendedTrips(user, trips) {
  if (!user?.interests?.length) return trips;
  const userInterests = getExpandedInterests(user.interests);

  const matches = trips
    .filter((trip) =>
      trip.tags.some((tag) => userInterests.includes(tag.toLowerCase()))
    )
    .sort((a, b) => {
      const aMatches = a.tags.filter((t) =>
        userInterests.includes(t.toLowerCase())
      ).length;
      const bMatches = b.tags.filter((t) =>
        userInterests.includes(t.toLowerCase())
      ).length;
      return bMatches - aMatches;
    });

  return matches;
}

export function getMatchedUsers(user, users) {
  if (!user?.interests?.length) return users;
  const myInterests = getExpandedInterests(user.interests);

  return users
    .map((u) => {
      const theirInterests = u.interests.map((i) => i.toLowerCase());
      const shared = myInterests.filter((i) => theirInterests.includes(i));
      const union = new Set([...myInterests, ...theirInterests]);
      const matchPercent = Math.round((shared.length / union.size) * 100);
      return { ...u, matchPercent };
    })
    .filter((u) => u.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export function getRecommendedEvents(user, events) {
  if (!user?.interests?.length) return events;
  const userInterests = getExpandedInterests(user.interests);

  const matches = events
    .filter((event) =>
      event.tags.some((tag) => userInterests.includes(tag.toLowerCase()))
    )
    .sort((a, b) => {
      const aMatches = a.tags.filter((t) =>
        userInterests.includes(t.toLowerCase())
      ).length;
      const bMatches = b.tags.filter((t) =>
        userInterests.includes(t.toLowerCase())
      ).length;
      return bMatches - aMatches;
    });

  return matches;
}

// ── Home Page Specific Mock Data ──

export const mockLiveActivities = [
  { 
    id: 1, 
    user: "Ahmed", 
    action: "joined a diving trip in Dahab", 
    time: "2 mins ago", 
    count: 4,
    match: 98,
    iconType: "Anchor"
  },
  { 
    id: 2, 
    user: "Sara", 
    action: "matched with travelers in Cairo", 
    time: "5 mins ago", 
    count: 3,
    match: 94,
    iconType: "Star"
  },
  { 
    id: 3, 
    user: "Omar", 
    action: "joined a cultural event in Luxor", 
    time: "12 mins ago", 
    count: 12,
    match: 91,
    iconType: "Landmark"
  },
];

export const mockLiveTravelers = [
  { id: 1, x: 10, y: 15, size: 44, opacity: 1, blur: 0, delay: 1.2, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
  { id: 2, x: 80, y: 12, size: 32, opacity: 0.5, blur: 1, delay: 1.6, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
  { id: 3, x: 75, y: 65, size: 38, opacity: 0.85, blur: 0, delay: 2.0, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
];

export const mockHomeEvents = [
  { id: 'e1', image: '/images/ev-ai.jpg', tag: 'AI', title: 'AI & Machine Learning', text: 'Discover how AI is shaping the future of technology.', peopleCurrent: 3, peopleMax: 10 },
  { id: 'e2', image: '/images/ev-security.jpg', tag: 'Security', title: 'Cyber Security', text: 'Learn how to protect systems from cyber attacks.', peopleCurrent: 5, peopleMax: 12 },
  { id: 'e3', image: '/images/ev-art.jpg', tag: 'Art', title: 'Drawing & Art', text: 'Express your creativity and improve your skills.', peopleCurrent: 7, peopleMax: 15 },
  { id: 'e4', image: '/images/office-365.jpg', tag: 'Office', title: 'Office Skills', text: 'Master Word, Excel, and PowerPoint.', peopleCurrent: 4, peopleMax: 8 },
  { id: 'e5', image: '/images/ev-business.jpg', tag: 'Business', title: 'Entrepreneurship', text: 'Turn your ideas into a real business.', peopleCurrent: 6, peopleMax: 10 },
  { id: 'e6', image: '/images/ev-sports.jpg', tag: 'Sports', title: 'Sports Event', text: 'Stay active and enjoy sports activities.', peopleCurrent: 8, peopleMax: 20 },
  { id: 'e7', image: '/images/ev-books.jpg', tag: 'Books', title: 'Book Fair', text: 'Explore books, authors, and knowledge.', peopleCurrent: 2, peopleMax: 10 },
];

export const mockHomeTrips = [
  { id: 't1', mockId: 1, image: '/images/pyramids.webp', imageAlt: 'Cairo', location: '📍 Cairo', peopleSeed: '👥 4/6', avatar: '/images/user1.jpg', avatarAlt: 'TALA', name: 'TALA', age: '28 years', title: 'Pyramids & Museum Adventure', tags: ['History', 'Photography', 'Food'], dates: '📅 Dec 15–18, 2025', price: '$ 3000 EGP', bannerLine: 'Pyramids & Museum Adventure — Dec 15–18' },
  { id: 't2', mockId: 2, image: '/images/dahab2.jpg', imageAlt: 'Dahab', location: '📍 Dahab', peopleSeed: '👥 3/6', avatar: '/images/user2.jpg', avatarAlt: 'Mona', name: 'Mona', age: '26 years', title: 'Diving & Desert Safari', tags: ['Adventure', 'Diving', 'Nature'], dates: '📅 Jan 5–10, 2026', price: '$ 5500 EGP', bannerLine: 'Diving & Desert Safari — Jan 5–10' },
  { id: 't3', mockId: 3, image: '/images/luxor.jpg', imageAlt: 'Luxor', location: '📍 Luxor', peopleSeed: '👥 5/6', avatar: '/images/user3.jpg', avatarAlt: 'Sara', name: 'Sara', age: '25 years', title: 'Temple & Nile Cruise Tour', tags: ['Culture', 'History', 'Luxury'], dates: '📅 Feb 12–15, 2026', price: '$ 4200 EGP', bannerLine: 'Temple & Nile Cruise Tour — Feb 12–15' },
  { id: 't4', mockId: 4, image: '/images/siwa-oasis.png', imageAlt: 'Siwa Oasis', location: '📍 Siwa', peopleSeed: '👥 2/4', avatar: '/images/user4.jpg', avatarAlt: 'Laila', name: 'Laila', age: '24 years', title: 'Oasis Escape Experience', tags: ['Relax', 'Nature', 'Camping'], dates: '📅 Mar 20–23, 2026', price: '$ 3900 EGP', bannerLine: 'Oasis Escape Experience — Mar 20–23' },
];
