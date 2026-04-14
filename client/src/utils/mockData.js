// Mock data for Phase 1 prototype — replaced by real API in Phase 2

export const MOCK_USER_STUDENT = {
  _id: 'student-001',
  name: 'Arjun Sharma',
  email: 'arjun@college.edu',
  role: 'STUDENT',
  institution: 'Mumbai Engineering College',
  avatar: null,
  createdAt: new Date().toISOString(),
}

export const MOCK_USER_TEACHER = {
  _id: 'teacher-001',
  name: 'Prof. Meera Iyer',
  email: 'meera@college.edu',
  role: 'TEACHER',
  institution: 'Mumbai Engineering College',
  avatar: null,
  createdAt: new Date().toISOString(),
}

export const MOCK_SUBJECTS = [
  {
    _id: 'sub-001',
    name: 'Data Structures & Algorithms',
    code: 'DSA301',
    semester: '3rd Sem',
    examType: 'MID_END',
    teacherName: 'Prof. Meera Iyer',
    enrolled: 42,
    progress: 68,
    color: 'hsl(250,84%,62%)',
    examEvents: [
      { type: 'MID_TERM', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), name: 'Mid Term' },
      { type: 'END_TERM', date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), name: 'End Term' },
    ],
    modules: [
      {
        _id: 'mod-001',
        title: 'Arrays & Strings',
        examScope: 'MID',
        order: 1,
        topics: [
          { _id: 't001', title: 'Array Basics & Traversal', difficulty: 'EASY', estimatedMins: 45, importanceScore: 7, status: 'COMPLETED', pageRef: 'Unit1.pdf, P.12' },
          { _id: 't002', title: 'Two Pointer Technique', difficulty: 'MEDIUM', estimatedMins: 60, importanceScore: 9, status: 'COMPLETED', pageRef: 'Unit1.pdf, P.28' },
          { _id: 't003', title: 'Sliding Window Problems', difficulty: 'HARD', estimatedMins: 90, importanceScore: 8, status: 'IN_PROGRESS', pageRef: 'Unit1.pdf, P.45' },
          { _id: 't004', title: 'String Manipulation & KMP', difficulty: 'HARD', estimatedMins: 75, importanceScore: 7, status: 'NOT_STARTED', pageRef: 'Unit1.pdf, P.62' },
        ]
      },
      {
        _id: 'mod-002',
        title: 'Linked Lists',
        examScope: 'MID',
        order: 2,
        topics: [
          { _id: 't005', title: 'Singly Linked List', difficulty: 'EASY', estimatedMins: 40, importanceScore: 8, status: 'COMPLETED', pageRef: 'Unit2.pdf, P.5' },
          { _id: 't006', title: 'Doubly & Circular Linked List', difficulty: 'MEDIUM', estimatedMins: 55, importanceScore: 7, status: 'IN_PROGRESS', pageRef: 'Unit2.pdf, P.22' },
          { _id: 't007', title: 'Fast & Slow Pointer', difficulty: 'HARD', estimatedMins: 80, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'Unit2.pdf, P.38' },
        ]
      },
      {
        _id: 'mod-003',
        title: 'Stacks & Queues',
        examScope: 'MID',
        order: 3,
        topics: [
          { _id: 't008', title: 'Stack Implementation', difficulty: 'EASY', estimatedMins: 35, importanceScore: 6, status: 'COMPLETED', pageRef: 'Unit3.pdf, P.8' },
          { _id: 't009', title: 'Monotonic Stack', difficulty: 'HARD', estimatedMins: 90, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'Unit3.pdf, P.31' },
          { _id: 't010', title: 'Queue & Deque', difficulty: 'MEDIUM', estimatedMins: 50, importanceScore: 7, status: 'NOT_STARTED', pageRef: 'Unit3.pdf, P.44' },
        ]
      },
      {
        _id: 'mod-004',
        title: 'Trees & Graphs',
        examScope: 'END',
        order: 4,
        topics: [
          { _id: 't011', title: 'Binary Trees & BST', difficulty: 'MEDIUM', estimatedMins: 70, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'Unit4.pdf, P.3' },
          { _id: 't012', title: 'Tree Traversals (DFS/BFS)', difficulty: 'MEDIUM', estimatedMins: 65, importanceScore: 10, status: 'NOT_STARTED', pageRef: 'Unit4.pdf, P.25' },
          { _id: 't013', title: 'Graph Representation', difficulty: 'MEDIUM', estimatedMins: 60, importanceScore: 8, status: 'NOT_STARTED', pageRef: 'Unit4.pdf, P.55' },
          { _id: 't014', title: 'Dijkstra & Bellman-Ford', difficulty: 'HARD', estimatedMins: 120, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'Unit4.pdf, P.75' },
        ]
      },
      {
        _id: 'mod-005',
        title: 'Dynamic Programming',
        examScope: 'END',
        order: 5,
        topics: [
          { _id: 't015', title: 'DP Fundamentals & Memoization', difficulty: 'HARD', estimatedMins: 90, importanceScore: 10, status: 'NOT_STARTED', pageRef: 'Unit5.pdf, P.2' },
          { _id: 't016', title: 'Knapsack Problems', difficulty: 'HARD', estimatedMins: 100, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'Unit5.pdf, P.30' },
          { _id: 't017', title: 'LCS & LIS', difficulty: 'HARD', estimatedMins: 85, importanceScore: 8, status: 'NOT_STARTED', pageRef: 'Unit5.pdf, P.52' },
        ]
      },
    ]
  },
  {
    _id: 'sub-002',
    name: 'Database Management Systems',
    code: 'DBMS201',
    semester: '3rd Sem',
    examType: 'MID_END',
    teacherName: 'Prof. Ravi Sinha',
    enrolled: 38,
    progress: 45,
    color: 'hsl(168,79%,48%)',
    examEvents: [
      { type: 'MID_TERM', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), name: 'Mid Term' },
      { type: 'END_TERM', date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(), name: 'End Term' },
    ],
    modules: [
      {
        _id: 'mod-d01',
        title: 'Relational Model',
        examScope: 'MID',
        order: 1,
        topics: [
          { _id: 'td001', title: 'ER Diagrams', difficulty: 'EASY', estimatedMins: 45, importanceScore: 8, status: 'COMPLETED', pageRef: 'DBMS_U1.pdf, P.5' },
          { _id: 'td002', title: 'Normalization (1NF-3NF)', difficulty: 'MEDIUM', estimatedMins: 70, importanceScore: 9, status: 'IN_PROGRESS', pageRef: 'DBMS_U1.pdf, P.28' },
          { _id: 'td003', title: 'BCNF & 4NF', difficulty: 'HARD', estimatedMins: 60, importanceScore: 7, status: 'NOT_STARTED', pageRef: 'DBMS_U1.pdf, P.55' },
        ]
      },
      {
        _id: 'mod-d02',
        title: 'SQL & Query Languages',
        examScope: 'MID',
        order: 2,
        topics: [
          { _id: 'td004', title: 'Basic SQL Queries', difficulty: 'EASY', estimatedMins: 40, importanceScore: 10, status: 'COMPLETED', pageRef: 'DBMS_U2.pdf, P.3' },
          { _id: 'td005', title: 'Joins & Subqueries', difficulty: 'MEDIUM', estimatedMins: 65, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'DBMS_U2.pdf, P.22' },
          { _id: 'td006', title: 'Stored Procedures & Triggers', difficulty: 'HARD', estimatedMins: 80, importanceScore: 7, status: 'NOT_STARTED', pageRef: 'DBMS_U2.pdf, P.45' },
        ]
      },
    ]
  },
  {
    _id: 'sub-003',
    name: 'Operating Systems',
    code: 'OS401',
    semester: '3rd Sem',
    examType: 'MID_END',
    teacherName: 'Prof. Anita Deshmukh',
    enrolled: 35,
    progress: 30,
    color: 'hsl(200, 85%, 55%)',
    examEvents: [
      { type: 'MID_TERM', date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), name: 'Mid Term' },
      { type: 'END_TERM', date: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(), name: 'End Term' },
    ],
    modules: [
      {
        _id: 'mod-o01',
        title: 'Process Management',
        examScope: 'MID',
        order: 1,
        topics: [
          { _id: 'to001', title: 'Process States & PCB', difficulty: 'EASY', estimatedMins: 40, importanceScore: 8, status: 'COMPLETED', pageRef: 'OS_U1.pdf, P.10' },
          { _id: 'to002', title: 'CPU Scheduling Algorithms', difficulty: 'MEDIUM', estimatedMins: 70, importanceScore: 10, status: 'IN_PROGRESS', pageRef: 'OS_U1.pdf, P.35' },
          { _id: 'to003', title: 'Deadlock Detection & Avoidance', difficulty: 'HARD', estimatedMins: 90, importanceScore: 9, status: 'NOT_STARTED', pageRef: 'OS_U1.pdf, P.68' },
        ]
      }
    ]
  }
]

export const MOCK_STUDY_PLAN = [
  {
    date: new Date().toISOString().split('T')[0],
    topics: [
      { topicId: 't003', topicTitle: 'Sliding Window Problems', subject: 'DSA', estimatedMins: 90, status: 'IN_PROGRESS' },
      { topicId: 'td002', topicTitle: 'Normalization (1NF-3NF)', subject: 'DBMS', estimatedMins: 70, status: 'NOT_STARTED' },
    ],
    totalMins: 160
  },
  {
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    topics: [
      { topicId: 't004', topicTitle: 'String Manipulation & KMP', subject: 'DSA', estimatedMins: 75, status: 'NOT_STARTED' },
      { topicId: 'to002', topicTitle: 'CPU Scheduling Algorithms', subject: 'OS', estimatedMins: 70, status: 'IN_PROGRESS' },
    ],
    totalMins: 145
  },
  {
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    topics: [
      { topicId: 't007', topicTitle: 'Fast & Slow Pointer', subject: 'DSA', estimatedMins: 80, status: 'NOT_STARTED' },
      { topicId: 'td003', topicTitle: 'BCNF & 4NF', subject: 'DBMS', estimatedMins: 60, status: 'NOT_STARTED' },
    ],
    totalMins: 140
  },
]

export const MOCK_GAMIFICATION = {
  xp: 2340,
  level: 8,
  xpToNextLevel: 3000,
  streak: 12,
  todayDone: true,
  rank: 3,
  totalStudents: 42,
  badges: [
    { id: 'b1', name: 'First Steps', icon: '🌱', description: 'Completed your first topic', earned: true, xp: 50 },
    { id: 'b2', name: 'Week Warrior', icon: '⚡', description: '7-day study streak', earned: true, xp: 200 },
    { id: 'b3', name: 'Half Moon', icon: '🌙', description: 'Completed 50% of syllabus', earned: true, xp: 300 },
    { id: 'b4', name: 'Topic Hunter', icon: '🎯', description: 'Completed 10 topics in one day', earned: true, xp: 150 },
    { id: 'b5', name: 'Bookworm', icon: '📚', description: 'Studied for 5 hours straight', earned: false, xp: 250 },
    { id: 'b6', name: 'Exam Ready', icon: '🏆', description: 'Completed entire mid-term syllabus', earned: false, xp: 500 },
    { id: 'b7', name: 'Legend', icon: '👑', description: 'Top of leaderboard for 2 weeks', earned: false, xp: 1000 },
    { id: 'b8', name: 'Night Owl', icon: '🦉', description: 'Used Last-Night Mode 3 times', earned: true, xp: 100 },
  ]
}

export const MOCK_LEADERBOARD = [
  { rank: 1, studentId: 's1', name: 'Priya Nair', xp: 4200, streak: 24, avatar: null, color: 'hsl(250,84%,62%)' },
  { rank: 2, studentId: 's2', name: 'Rohit Verma', xp: 3800, streak: 18, avatar: null, color: 'hsl(168,79%,48%)' },
  { rank: 3, studentId: 's3', name: 'Arjun Sharma', xp: 2340, streak: 12, avatar: null, color: 'hsl(38,92%,55%)', isMe: true },
  { rank: 4, studentId: 's4', name: 'Sneha Patel', xp: 2100, streak: 10, avatar: null, color: 'hsl(200,85%,55%)' },
  { rank: 5, studentId: 's5', name: 'Kiran Desai', xp: 1900, streak: 8, avatar: null, color: 'hsl(290,70%,60%)' },
  { rank: 6, studentId: 's6', name: 'Aditya Kumar', xp: 1650, streak: 6, avatar: null, color: 'hsl(350,80%,58%)' },
  { rank: 7, studentId: 's7', name: 'Riya Singh', xp: 1400, streak: 5, avatar: null, color: 'hsl(48,96%,54%)' },
  { rank: 8, studentId: 's8', name: 'Vivek Joshi', xp: 1200, streak: 4, avatar: null, color: 'hsl(142,69%,48%)' },
]

export const MOCK_STUDY_GROUPS = [
  {
    _id: 'g1',
    name: 'DSA Masters',
    subject: 'Data Structures & Algorithms',
    memberCount: 6,
    maxMembers: 8,
    members: ['Arjun', 'Priya', 'Rohit', 'Sneha', 'Kiran', 'Aditya'],
    lastActivity: '2 hours ago',
    description: 'Focused group for DSA prep',
    isMember: true,
  },
  {
    _id: 'g2',
    name: 'DBMS Squad',
    subject: 'Database Management Systems',
    memberCount: 4,
    maxMembers: 6,
    members: ['Riya', 'Vivek', 'Ankit', 'Pooja'],
    lastActivity: '1 day ago',
    description: 'SQL and schema design discussions',
    isMember: false,
  },
  {
    _id: 'g3',
    name: 'OS Nerds',
    subject: 'Operating Systems',
    memberCount: 3,
    maxMembers: 6,
    members: ['Meena', 'Raj', 'Sai'],
    lastActivity: '3 hours ago',
    description: 'Deep diving into OS concepts',
    isMember: true,
  }
]

export const MOCK_AI_MESSAGES = [
  {
    id: 'm1',
    role: 'ai',
    content: '👋 Hi Arjun! I\'m your AI Study Assistant. I can help you understand any topic from your syllabus, quiz you on concepts, or explain things in simpler terms. What would you like to study today?',
    timestamp: new Date(Date.now() - 60000).toISOString()
  }
]

export const MOCK_PYQ_ANALYSIS = [
  { topicTitle: 'Tree Traversals (DFS/BFS)', frequency: 8, importanceScore: 10 },
  { topicTitle: 'Joins & Subqueries', frequency: 7, importanceScore: 9 },
  { topicTitle: 'Dynamic Programming', frequency: 6, importanceScore: 9 },
  { topicTitle: 'CPU Scheduling Algorithms', frequency: 6, importanceScore: 9 },
  { topicTitle: 'Normalization', frequency: 5, importanceScore: 8 },
  { topicTitle: 'Two Pointer Technique', frequency: 5, importanceScore: 8 },
  { topicTitle: 'Deadlock Detection', frequency: 4, importanceScore: 7 },
  { topicTitle: 'Linked Lists', frequency: 4, importanceScore: 7 },
  { topicTitle: 'Stack & Monotonic Stack', frequency: 3, importanceScore: 6 },
  { topicTitle: 'ER Diagrams', frequency: 3, importanceScore: 6 },
]

// Materials mock data
export const MOCK_MATERIALS = {
  'sub-001': [
    { _id: 'm1', name: 'Unit 1 - Arrays & Strings.pdf', size: '2.4 MB', type: 'pdf', uploadedBy: 'Prof. Meera', uploadedAt: '2024-01-15', mappedTopics: ['t001', 't002', 't003', 't004'] },
    { _id: 'm2', name: 'Unit 2 - Linked Lists.pdf', size: '1.8 MB', type: 'pdf', uploadedBy: 'Prof. Meera', uploadedAt: '2024-01-20', mappedTopics: ['t005', 't006', 't007'] },
    { _id: 'm3', name: 'DSA Lecture Slides - Week 1.pptx', size: '5.2 MB', type: 'pptx', uploadedBy: 'Prof. Meera', uploadedAt: '2024-01-22', mappedTopics: ['t001', 't002'] },
    { _id: 'm4', name: 'Practice Problems Set 1.pdf', size: '890 KB', type: 'pdf', uploadedBy: 'Prof. Meera', uploadedAt: '2024-01-28', mappedTopics: ['t003', 't004'] },
  ]
}

// Teacher mock data
export const MOCK_TEACHER_SUBJECTS = [
  {
    _id: 'ts-001',
    name: 'Data Structures & Algorithms',
    code: 'DSA301',
    semester: '3rd Sem',
    enrolled: 42,
    atRisk: 8,
    avgProgress: 68,
    topics: 17,
    nextExam: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    examName: 'Mid Term',
    color: 'hsl(250,84%,62%)',
    topicCompletionByClass: [
      { topic: 'Array Basics', completion: 92 },
      { topic: 'Two Pointer', completion: 78 },
      { topic: 'Sliding Window', completion: 45 },
      { topic: 'String Manipulation', completion: 32 },
      { topic: 'Linked Lists', completion: 88 },
    ]
  },
  {
    _id: 'ts-002',
    name: 'Database Management Systems',
    code: 'DBMS201',
    semester: '3rd Sem',
    enrolled: 38,
    atRisk: 5,
    avgProgress: 55,
    topics: 9,
    nextExam: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    examName: 'Mid Term',
    color: 'hsl(168,79%,48%)',
    topicCompletionByClass: []
  }
]
