// Mock data for all screens — structured for future backend integration

export const USER_DATA = {
  id: '1',
  name: 'Alex Sterling',
  email: 'alex@4bitlabs.com',
  phone: '+91 98765 43210',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Sterling&background=ba0013&color=fff&size=128',
  school: 'Elite Science Academy',
  course: 'Advanced Physics',
  progress: 74,
  attendance: 92,
  rank: 14,
  bits: 845,
  streak: 12,
  lessonsCompleted: 12,
  totalLessons: 18,
};

export const SCHOOLS = [
  { id: '1', name: 'Elite Science Academy' },
  { id: '2', name: 'Silicon Valley Institute' },
  { id: '3', name: 'Tech Corridor Academy' },
  { id: '4', name: 'Innovation Hub East' },
];

export const COURSES = [
  { id: '1', name: 'Electronics 101' },
  { id: '2', name: 'Advanced Algorithmics' },
  { id: '3', name: 'UX Architecture' },
  { id: '4', name: 'Data Ethics & Equity' },
];

export const ANNOUNCEMENTS = [
  {
    id: '1',
    category: 'Campus News',
    title: 'Winter Hackathon 2024',
    description: 'Registration is now open for the annual 4Bit Labs Winter Hackathon. Join us for 48 hours of building!',
    icon: 'campaign',
    iconBg: 'primary',
  },
  {
    id: '2',
    category: 'Academic',
    title: 'Midterm Schedule Released',
    description: 'Check the portal for the updated midterm examination schedule starting next Monday.',
    icon: 'event',
    iconBg: 'tertiary',
  },
  {
    id: '3',
    category: 'System Update',
    title: 'Platform Maintenance',
    description: 'The learning portal will be undergoing scheduled maintenance this Sunday from 2AM to 4AM UTC.',
    icon: 'update',
    iconBg: 'secondary',
  },
];

export const RECORDED_LECTURES = [
  {
    id: '1',
    title: '01. Introduction to Semiconductors',
    duration: '24:15',
    topic: 'Basic Principles',
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=130&fit=crop',
  },
  {
    id: '2',
    title: '02. PN Junction Dynamics',
    duration: '18:40',
    topic: 'Next Up',
    status: 'next',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=130&fit=crop',
  },
  {
    id: '3',
    title: '03. Transistor as a Switch',
    duration: '32:00',
    topic: 'Practical Application',
    status: 'locked',
    thumbnail: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=200&h=130&fit=crop',
  },
];

export const BUILD_PROJECTS = [
  {
    id: '1',
    title: 'Digital Clock Module',
    description: 'Design a 7-segment display driver using logic gates and breadboards.',
    difficulty: 'Intermediate',
    icon: 'developer_board',
  },
  {
    id: '2',
    title: 'Signal Generator',
    description: 'Construct a variable frequency oscillator circuit with Op-Amps.',
    difficulty: 'Hard',
    icon: 'waves',
  },
];

export const LEADERBOARD = [
  {
    id: '1',
    rank: 1,
    name: 'Marcus Chen',
    school: 'Tech Valley High',
    course: 'Electronics',
    bits: 1240,
    change: +12,
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=006190&color=fff&size=80',
  },
  {
    id: '2',
    rank: 2,
    name: 'Sarah Jenkins',
    school: 'Riverside High',
    course: 'Computer Science',
    bits: 1190,
    change: 0,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=3755c3&color=fff&size=80',
  },
  {
    id: '3',
    rank: 3,
    name: 'Priya Patel',
    school: 'Innovation Hub',
    course: 'Data Science',
    bits: 1050,
    change: +5,
    avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=006190&color=fff&size=80',
  },
  {
    id: '4',
    rank: 4,
    name: 'David Chen',
    school: 'Central Tech',
    course: 'Data Analytics',
    bits: 980,
    change: -2,
    avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=3755c3&color=fff&size=80',
  },
];

export const LEADERBOARD_FULL = [
  { id: '1', rank: 1, name: 'Marcus Chen', school: 'Tech Valley High', course: 'Electronics', score: 12400, avatar: 'https://ui-avatars.com/api/?name=MC&background=006190&color=fff&size=80' },
  { id: '2', rank: 2, name: 'Rina Okeke', school: 'Summit Academy', course: 'Robotics', score: 12350, avatar: 'https://ui-avatars.com/api/?name=RO&background=3755c3&color=fff&size=80' },
  { id: '3', rank: 3, name: 'James Liu', school: 'Pacific Heights', course: 'AI Systems', score: 12300, avatar: 'https://ui-avatars.com/api/?name=JL&background=006190&color=fff&size=80' },
  { id: '4', rank: 4, name: 'Sarah Jenkins', school: 'Riverside High', course: 'Computer Science', score: 12150, avatar: 'https://ui-avatars.com/api/?name=SJ&background=3755c3&color=fff&size=80' },
  { id: '5', rank: 5, name: 'David Chen', school: 'Central Tech', course: 'Data Analytics', score: 11980, avatar: 'https://ui-avatars.com/api/?name=DC&background=006190&color=fff&size=80' },
  { id: '12', rank: 12, name: 'Alex Sterling', school: 'Elite Science Academy', course: 'Advanced Physics', score: 10240, isUser: true, avatar: 'https://ui-avatars.com/api/?name=AS&background=ba0013&color=fff&size=80' },
];

export const RANK_TREND = [
  { day: 'Mon', rank: 20 },
  { day: 'Tue', rank: 19 },
  { day: 'Wed', rank: 21 },
  { day: 'Thu', rank: 18 },
  { day: 'Fri', rank: 15 },
  { day: 'Sat', rank: 14 },
  { day: 'Today', rank: 12 },
];

export const QUIZ_LIST = [
  {
    id: '1',
    title: 'Basic Electronics',
    questions: 10,
    duration: '15 min',
    status: 'available',
    category: 'Electronics 101',
  },
  {
    id: '2',
    title: 'Advanced Circuits',
    questions: 15,
    duration: '20 min',
    status: 'completed',
    score: 85,
    category: 'Electronics 101',
  },
  {
    id: '3',
    title: 'Digital Logic Gates',
    questions: 12,
    duration: '18 min',
    status: 'locked',
    category: 'Electronics 101',
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is a resistor used for?',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=250&fit=crop',
    options: [
      { key: 'A', text: 'To limit or regulate the flow of electrical current' },
      { key: 'B', text: 'To increase the voltage of a power source' },
      { key: 'C', text: 'To store electrical energy like a battery' },
      { key: 'D', text: 'To switch between AC and DC circuits' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 2,
    question: 'What does LED stand for?',
    options: [
      { key: 'A', text: 'Light Emitting Device' },
      { key: 'B', text: 'Light Emitting Diode' },
      { key: 'C', text: 'Low Energy Display' },
      { key: 'D', text: 'Linear Electronic Driver' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 3,
    question: 'Which component stores electrical energy in an electric field?',
    options: [
      { key: 'A', text: 'Resistor' },
      { key: 'B', text: 'Inductor' },
      { key: 'C', text: 'Capacitor' },
      { key: 'D', text: 'Transistor' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 4,
    question: 'What is the unit of electrical resistance?',
    options: [
      { key: 'A', text: 'Ampere' },
      { key: 'B', text: 'Volt' },
      { key: 'C', text: 'Watt' },
      { key: 'D', text: 'Ohm' },
    ],
    correctAnswer: 'D',
  },
  {
    id: 5,
    question: 'Which law states that V = IR?',
    options: [
      { key: 'A', text: "Kirchhoff's Law" },
      { key: 'B', text: "Ohm's Law" },
      { key: 'C', text: "Faraday's Law" },
      { key: 'D', text: "Coulomb's Law" },
    ],
    correctAnswer: 'B',
  },
  {
    id: 6,
    question: 'What is the function of a diode?',
    options: [
      { key: 'A', text: 'Amplify signals' },
      { key: 'B', text: 'Allow current flow in one direction' },
      { key: 'C', text: 'Store charge' },
      { key: 'D', text: 'Measure voltage' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 7,
    question: 'What type of circuit has only one path for current?',
    options: [
      { key: 'A', text: 'Parallel circuit' },
      { key: 'B', text: 'Series circuit' },
      { key: 'C', text: 'Complex circuit' },
      { key: 'D', text: 'Bridge circuit' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 8,
    question: 'What is the color code for a 1kΩ resistor?',
    options: [
      { key: 'A', text: 'Brown, Black, Red' },
      { key: 'B', text: 'Red, Black, Brown' },
      { key: 'C', text: 'Brown, Black, Orange' },
      { key: 'D', text: 'Orange, Black, Brown' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 9,
    question: 'What does a transistor primarily do?',
    options: [
      { key: 'A', text: 'Store energy' },
      { key: 'B', text: 'Measure current' },
      { key: 'C', text: 'Amplify or switch electronic signals' },
      { key: 'D', text: 'Convert AC to DC' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 10,
    question: 'What is the SI unit of electric current?',
    options: [
      { key: 'A', text: 'Volt' },
      { key: 'B', text: 'Watt' },
      { key: 'C', text: 'Ampere' },
      { key: 'D', text: 'Joule' },
    ],
    correctAnswer: 'C',
  },
];

export const MENTORS = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Full-Stack Architect',
    rating: 4.9,
    reviews: 120,
    skills: ['React', 'Node.js', 'System Design'],
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=006190&color=fff&size=128',
  },
  {
    id: '2',
    name: 'Arjun Mehta',
    role: 'Data Science Lead',
    rating: 5.0,
    reviews: 85,
    skills: ['Python', 'ML Ops', 'SQL'],
    verified: true,
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=ba0013&color=fff&size=128',
  },
  {
    id: '3',
    name: 'Vikram Singh',
    role: 'Mobile Dev Expert',
    rating: 4.8,
    reviews: 210,
    skills: ['Flutter', 'Kotlin', 'Firebase'],
    avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=3755c3&color=fff&size=128',
  },
];

export const TIME_SLOTS = [
  '09:00 AM', '11:30 AM', '02:00 PM',
  '04:30 PM', '06:00 PM', '08:30 PM',
];

export const STORE_PRODUCTS = [
  {
    id: '1',
    name: 'Arduino Uno',
    description: 'The cornerstone of embedded systems. Authentic R3 board with high-precision crystal oscillators.',
    price: 24.99,
    badge: "Editor's Choice",
    featured: true,
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    name: 'Resistor Kit',
    description: 'Comprehensive 600-piece metal film resistor set with 1% tolerance across 30 common values.',
    price: 12.50,
    inStock: true,
    icon: 'inventory_2',
  },
  {
    id: '3',
    name: 'Breadboard',
    description: '830 Points / Dual Rail',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Sensor Pack',
    description: '12 Essential sensors including ultrasonic and infrared.',
    price: 35.00,
    icon: 'sensors',
  },
  {
    id: '5',
    name: 'Jumper Wires',
    description: 'Premium quality jumper wire set.',
    price: 4.99,
    originalPrice: 8.00,
    flashSale: true,
  },
];

export const LAB_INVENTORY = [
  { id: '1', name: 'ESP32 Dev', price: '$8.50', icon: 'memory' },
  { id: '2', name: 'Power Supply', price: '$19.99', icon: 'power' },
  { id: '3', name: 'USB-C Hub', price: '$14.25', icon: 'cable' },
  { id: '4', name: 'OLED Display', price: '$5.30', icon: 'grid_view' },
];

export const STORE_URL = 'https://4bitlabs.com/store';
