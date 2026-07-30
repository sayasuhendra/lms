// Mock data for Nama Organisasi Digital Learning Platform

export const mockUsers = [
  {
    id: '1',
    name: 'Ahmad Santoso',
    email: 'ahmad@example.org',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    bio: 'Anggota muda organisasi wilayah Jakarta Selatan',
    membershipTier: 'Anggota Muda'
  },
  {
    id: '2',
    name: 'Dr. Siti Nurhaliza',
    email: 'siti@example.org',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    bio: 'Pengajar organisasi dan pembina program pembelajaran',
    expertise: 'Politik Islam, pembelajaran organisasi, Kepemimpinan'
  },
  {
    id: '3',
    name: 'Ustadz Budi Rahardjo',
    email: 'budi@example.org',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    bio: 'Trainer nasional untuk pengembangan kapasitas organisasi',
    expertise: 'Ekonomi Syariah, Kebijakan Publik, Manajemen'
  }
];

export const mockCategories = [
  { id: '1', name: 'Politik & Ideologi', icon: 'BookOpen', count: 45 },
  { id: '2', name: 'Kepemimpinan & Manajemen', icon: 'Users', count: 38 },
  { id: '3', name: 'Ekonomi & Kebijakan', icon: 'TrendingUp', count: 32 },
  { id: '4', name: 'Komunikasi & Media', icon: 'MessageSquare', count: 28 },
  { id: '5', name: 'Hukum & Konstitusi', icon: 'Scale', count: 24 },
  { id: '6', name: 'Teknologi & Inovasi', icon: 'Laptop', count: 20 },
  { id: '7', name: 'Dakwah & Sosial', icon: 'Heart', count: 35 },
  { id: '8', name: 'Keterampilan Praktis', icon: 'Tool', count: 18 }
];

export const mockCourses = [
  {
    id: '1',
    title: 'Kepemimpinan Politik Modern',
    instructor: mockUsers[1],
    category: 'Kepemimpinan & Manajemen',
    description: 'Pelajari konsep kepemimpinan politik yang efektif, karakteristik pemimpin sukses, dan penerapannya dalam organisasi.',
    longDescription: 'Program komprehensif tentang kepemimpinan politik modern yang mencakup teori, praktik, dan studi kasus pemimpin dunia. Anda akan mempelajari gaya kepemimpinan, pengambilan keputusan strategis, dan bagaimana memimpin perubahan dalam konteks politik Indonesia.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    rating: 4.9,
    reviews: 856,
    students: 3245,
    duration: '8 minggu',
    level: 'Intermediate',
    price: 0,
    skills: ['Kepemimpinan', 'Manajemen Tim', 'Pengambilan Keputusan', 'Public Speaking'],
    language: 'Bahasa Indonesia',
    subtitles: ['Bahasa Indonesia', 'English'],
    curriculum: [
      {
        id: 'm1',
        title: 'Pengantar Kepemimpinan Politik',
        lessons: [
          { id: 'l1', title: 'Definisi Kepemimpinan Politik', duration: '15 min', type: 'video', completed: false },
          { id: 'l2', title: 'Karakteristik Pemimpin Efektif', duration: '20 min', type: 'video', completed: false },
          { id: 'l3', title: 'Gaya Kepemimpinan dalam Politik', duration: '18 min', type: 'video', completed: false },
          { id: 'l4', title: 'Kuis Modul 1', duration: '20 min', type: 'quiz', completed: false }
        ]
      },
      {
        id: 'm2',
        title: 'Kepemimpinan Transformasional',
        lessons: [
          { id: 'l5', title: 'Teori Kepemimpinan Transformasional', duration: '25 min', type: 'video', completed: false },
          { id: 'l6', title: 'Visi dan Misi Pemimpin', duration: '22 min', type: 'video', completed: false },
          { id: 'l7', title: 'Membangun Trust dan Kredibilitas', duration: '28 min', type: 'video', completed: false },
          { id: 'l8', title: 'Kuis Modul 2', duration: '20 min', type: 'quiz', completed: false }
        ]
      },
      {
        id: 'm3',
        title: 'Studi Kasus Pemimpin Dunia',
        lessons: [
          { id: 'l9', title: 'Kepemimpinan di Era Digital', duration: '30 min', type: 'video', completed: false },
          { id: 'l10', title: 'Analisis Kepemimpinan Tokoh Nasional', duration: '35 min', type: 'video', completed: false },
          { id: 'l11', title: 'Praktik Kepemimpinan di Organisasi', duration: '25 min', type: 'video', completed: false },
          { id: 'l12', title: 'Kuis Final', duration: '30 min', type: 'quiz', completed: false }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Sistem Politik Indonesia',
    instructor: mockUsers[1],
    category: 'Politik & Ideologi',
    description: 'Memahami sistem politik Indonesia secara komprehensif, dari teori hingga praktik demokrasi Pancasila.',
    longDescription: 'Kursus mendalam tentang sistem politik Indonesia yang mencakup sejarah, struktur pemerintahan, lembaga negara, sistem pemilu, dan peran partai politik dalam demokrasi. Dilengkapi dengan analisis kebijakan dan studi kasus aktual.',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
    rating: 4.8,
    reviews: 1243,
    students: 5678,
    duration: '6 minggu',
    level: 'Beginner',
    price: 0,
    skills: ['Politik Indonesia', 'Demokrasi', 'Sistem Pemerintahan', 'Analisis Kebijakan'],
    language: 'Bahasa Indonesia',
    subtitles: ['Bahasa Indonesia'],
    curriculum: [
      {
        id: 'm1',
        title: 'Dasar-Dasar Sistem Politik',
        lessons: [
          { id: 'l1', title: 'Pengantar Ilmu Politik', duration: '20 min', type: 'video', completed: false },
          { id: 'l2', title: 'Sejarah Politik Indonesia', duration: '25 min', type: 'video', completed: false },
          { id: 'l3', title: 'Kuis Modul 1', duration: '15 min', type: 'quiz', completed: false }
        ]
      },
      {
        id: 'm2',
        title: 'Struktur Pemerintahan',
        lessons: [
          { id: 'l4', title: 'Lembaga Eksekutif, Legislatif, Yudikatif', duration: '30 min', type: 'video', completed: false },
          { id: 'l5', title: 'Sistem Pemilu dan Partai Politik', duration: '28 min', type: 'video', completed: false },
          { id: 'l6', title: 'Kuis Modul 2', duration: '20 min', type: 'quiz', completed: false }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Ekonomi Syariah & Pembangunan',
    instructor: mockUsers[2],
    category: 'Ekonomi & Kebijakan',
    description: 'Memahami prinsip ekonomi syariah dan penerapannya dalam pembangunan nasional serta kebijakan publik.',
    longDescription: 'Program pembelajaran tentang ekonomi Islam modern, prinsip-prinsip syariah dalam ekonomi, sistem keuangan Islam, dan bagaimana mengintegrasikannya dalam kebijakan pembangunan nasional.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    rating: 4.7,
    reviews: 678,
    students: 2890,
    duration: '10 minggu',
    level: 'Intermediate',
    price: 0,
    skills: ['Ekonomi Syariah', 'Kebijakan Publik', 'Pembangunan', 'Keuangan Islam'],
    language: 'Bahasa Indonesia',
    subtitles: ['Bahasa Indonesia', 'English'],
    curriculum: [
      {
        id: 'm1',
        title: 'Prinsip Ekonomi Syariah',
        lessons: [
          { id: 'l1', title: 'Konsep Dasar Ekonomi Islam', duration: '25 min', type: 'video', completed: false },
          { id: 'l2', title: 'Sistem Keuangan Syariah', duration: '30 min', type: 'video', completed: false },
          { id: 'l3', title: 'Kuis Modul 1', duration: '20 min', type: 'quiz', completed: false }
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'Strategi Kampanye Digital',
    instructor: mockUsers[1],
    category: 'Komunikasi & Media',
    description: 'Kuasai teknik kampanye digital modern, media sosial, dan strategi komunikasi politik efektif di era digital.',
    longDescription: 'Kursus praktis tentang kampanye digital yang mencakup strategi media sosial, content marketing, digital branding, dan analitik untuk kampanye politik yang efektif.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    rating: 4.9,
    reviews: 934,
    students: 4123,
    duration: '6 minggu',
    level: 'Intermediate',
    price: 0,
    skills: ['Digital Marketing', 'Media Sosial', 'Strategi Kampanye', 'Content Creation'],
    language: 'Bahasa Indonesia',
    subtitles: ['Bahasa Indonesia'],
    curriculum: [
      {
        id: 'm1',
        title: 'Dasar Kampanye Digital',
        lessons: [
          { id: 'l1', title: 'Pengantar Digital Campaign', duration: '18 min', type: 'video', completed: false },
          { id: 'l2', title: 'Memahami Target Audience', duration: '22 min', type: 'video', completed: false },
          { id: 'l3', title: 'Kuis Modul 1', duration: '15 min', type: 'quiz', completed: false }
        ]
      }
    ]
  },
  {
    id: '5',
    title: 'Hukum Tata Negara Indonesia',
    instructor: mockUsers[1],
    category: 'Hukum & Konstitusi',
    description: 'Pelajari konstitusi Indonesia, struktur hukum tata negara, dan implementasinya dalam praktik pemerintahan.',
    longDescription: 'Kursus komprehensif tentang hukum tata negara yang mencakup UUD 1945, amandemen, lembaga negara, hak asasi manusia, dan judicial review.',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    rating: 4.6,
    reviews: 567,
    students: 2345,
    duration: '8 minggu',
    level: 'Beginner',
    price: 0,
    skills: ['Hukum Tata Negara', 'Konstitusi', 'HAM', 'Judicial Review'],
    language: 'Bahasa Indonesia',
    subtitles: ['Bahasa Indonesia'],
    curriculum: [
      {
        id: 'm1',
        title: 'Pengantar Hukum Tata Negara',
        lessons: [
          { id: 'l1', title: 'UUD 1945 dan Amandemen', duration: '25 min', type: 'video', completed: false },
          { id: 'l2', title: 'Sistem Ketatanegaraan RI', duration: '28 min', type: 'video', completed: false },
          { id: 'l3', title: 'Kuis Modul 1', duration: '20 min', type: 'quiz', completed: false }
        ]
      }
    ]
  },
  {
    id: '6',
    title: 'Public Speaking & Orasi Politik',
    instructor: mockUsers[2],
    category: 'Komunikasi & Media',
    description: 'Tingkatkan kemampuan berbicara di depan umum dan menyampaikan orasi politik yang persuasif dan inspiratif.',
    longDescription: 'Pelatihan intensif public speaking khusus untuk konteks politik yang mencakup teknik retorika, body language, storytelling, dan mengatasi demam panggung.',
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    rating: 4.8,
    reviews: 789,
    students: 3456,
    duration: '4 minggu',
    level: 'Beginner',
    price: 0,
    skills: ['Public Speaking', 'Retorika', 'Komunikasi Verbal', 'Presentasi'],
    language: 'Bahasa Indonesia',
    subtitles: ['Bahasa Indonesia'],
    curriculum: [
      {
        id: 'm1',
        title: 'Dasar Public Speaking',
        lessons: [
          { id: 'l1', title: 'Teknik Berbicara Efektif', duration: '20 min', type: 'video', completed: false },
          { id: 'l2', title: 'Body Language dan Gesture', duration: '18 min', type: 'video', completed: false },
          { id: 'l3', title: 'Kuis Modul 1', duration: '15 min', type: 'quiz', completed: false }
        ]
      }
    ]
  }
];

export const mockEnrollments = [
  {
    id: 'e1',
    userId: '1',
    courseId: '1',
    enrolledDate: '2024-09-15',
    progress: 65,
    lastAccessed: '2024-12-10',
    completed: false
  },
  {
    id: 'e2',
    userId: '1',
    courseId: '4',
    enrolledDate: '2024-10-01',
    progress: 40,
    lastAccessed: '2024-12-09',
    completed: false
  }
];

export const mockQuizzes = [
  {
    id: 'q1',
    lessonId: 'l4',
    courseId: '1',
    title: 'Kuis Modul 1: Pengantar Kepemimpinan Politik',
    questions: [
      {
        id: 'q1_1',
        question: 'Apa perbedaan utama antara kepemimpinan politik dan kepemimpinan bisnis?',
        options: [
          'Kepemimpinan politik fokus pada profit, sedangkan bisnis fokus pada pelayanan',
          'Kepemimpinan politik melibatkan kepentingan publik yang luas dan kompleksitas sosial-politik',
          'Tidak ada perbedaan signifikan antara keduanya',
          'Kepemimpinan bisnis lebih kompleks daripada kepemimpinan politik'
        ],
        correctAnswer: 1,
        explanation: 'Kepemimpinan politik berfokus pada kepentingan publik yang luas, melibatkan dinamika sosial-politik yang kompleks, dan memerlukan akuntabilitas kepada rakyat.'
      },
      {
        id: 'q1_2',
        question: 'Manakah yang BUKAN karakteristik pemimpin politik yang efektif?',
        options: [
          'Memiliki visi yang jelas untuk masa depan',
          'Mampu berkomunikasi dengan berbagai kelompok masyarakat',
          'Menghindari kritik dan hanya mendengar pendukung',
          'Memiliki integritas dan kredibilitas tinggi'
        ],
        correctAnswer: 2,
        explanation: 'Pemimpin efektif harus terbuka terhadap kritik dan mendengarkan berbagai perspektif, bukan hanya dari pendukungnya.'
      },
      {
        id: 'q1_3',
        question: 'Dalam konteks kepemimpinan transformasional, apa yang dimaksud dengan "inspirational motivation"?',
        options: [
          'Memberikan bonus finansial kepada pengikut',
          'Menggunakan kekuasaan untuk memaksa kepatuhan',
          'Menginspirasi dan memotivasi melalui visi yang menarik',
          'Menghindari konflik dengan cara apapun'
        ],
        correctAnswer: 2,
        explanation: 'Inspirational motivation adalah kemampuan pemimpin untuk menginspirasi dan memotivasi pengikut melalui visi yang jelas dan menarik.'
      }
    ]
  }
];

export const mockDiscussions = [
  {
    id: 'd1',
    courseId: '1',
    userId: '1',
    userName: 'Ahmad Santoso',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    title: 'Diskusi: Penerapan Gaya Kepemimpinan di DPC',
    content: 'Bagaimana cara menerapkan gaya kepemimpinan transformasional di tingkat DPC? Mohon sharing pengalaman rekan-rekan.',
    replies: 8,
    likes: 15,
    createdAt: '2024-12-05T10:30:00Z',
    category: 'Modul 2'
  },
  {
    id: 'd2',
    courseId: '1',
    userId: '2',
    userName: 'Dr. Siti Nurhaliza',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    title: 'Tips: Membangun Kredibilitas sebagai Pemimpin Muda',
    content: 'Berikut beberapa tips praktis untuk membangun kredibilitas sebagai pemimpin muda di organisasi...',
    replies: 12,
    likes: 23,
    createdAt: '2024-12-03T14:20:00Z',
    category: 'Modul 2'
  }
];

export const mockCertificates = [
  {
    id: 'cert1',
    userId: '1',
    courseId: '2',
    courseName: 'Sistem Politik Indonesia',
    instructorName: 'Dr. Siti Nurhaliza',
    completionDate: '2024-11-20',
    certificateUrl: '#'
  }
];

// Helper functions
export const getCourseById = (id) => mockCourses.find(course => course.id === id);
export const getUserEnrollments = (userId) => {
  return mockEnrollments
    .filter(e => e.userId === userId)
    .map(e => ({
      ...e,
      course: getCourseById(e.courseId)
    }));
};
export const isUserEnrolled = (userId, courseId) => {
  return mockEnrollments.some(e => e.userId === userId && e.courseId === courseId);
};
export const getCoursesByCategory = (category) => {
  return mockCourses.filter(course => course.category === category);
};