const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const DB_FILE = path.join(__dirname, 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database Helper Functions
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], candidates: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    return { users: [], candidates: [] };
  }
};

const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) return cb(null, true);
    cb(new Error('Only PNG, JPG, JPEG, and PDF files are allowed!'));
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    req.user = jwt.decode(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const db = readDB();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) return res.status(400).json({ error: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.encode({ id: newUser.id, email: newUser.email }, JWT_SECRET);
    res.status(201).json({ token, user: { email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error during user registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const db = readDB();

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.encode({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error during login.' });
  }
});

// --- CANDIDATE ROUTES ---
app.get('/api/candidates', authenticateToken, (req, res) => {
  try {
    const db = readDB();
    res.json((db.candidates || []).slice().reverse());
  } catch (err) {
    res.status(500).json({ error: 'Error fetching candidates.' });
  }
});

app.post('/api/candidates', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    const { fullName, email, phone, role, stage, appliedDate } = req.body;

    if (!fullName || !email || !phone || !role || !stage || !appliedDate || !req.file) {
      return res.status(400).json({ error: 'All fields including role and resume file are required.' });
    }

    const db = readDB();
    const newCandidate = {
      _id: Date.now().toString(),
      fullName,
      email,
      phone,
      role,
      stage,
      appliedDate,
      resumeUrl: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };

    if (!db.candidates) db.candidates = [];
    db.candidates.push(newCandidate);
    writeDB(db);

    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(500).json({ error: 'Error saving candidate.' });
  }
});

// UPDATE CANDIDATE STAGE
app.put('/api/candidates/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'Stage is required.' });
    }

    const db = readDB();
    const index = db.candidates.findIndex((c) => c._id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    db.candidates[index].stage = stage;
    writeDB(db);

    res.json(db.candidates[index]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating candidate stage.' });
  }
});

// DELETE CANDIDATE
app.delete('/api/candidates/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();

    const filteredCandidates = db.candidates.filter((c) => c._id !== id);
    if (db.candidates.length === filteredCandidates.length) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    db.candidates = filteredCandidates;
    writeDB(db);

    res.json({ message: 'Candidate deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting candidate.' });
  }
});

// --- ANALYTICS ROUTE ---
app.get('/api/analytics', (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const db = readDB();
    let candidates = db.candidates || [];

    if (filter === 'recent') {
      candidates = candidates.slice(-5);
    }

    const stats = {
      totalApplications: candidates.length,
      shortlisted: candidates.filter(c => c.stage === 'Shortlisted').length,
      interviews: candidates.filter(c => c.stage === 'Interview' || c.stage === 'Interviewing').length,
      hired: candidates.filter(c => c.stage === 'Hired').length
    };

    const roles = ['Frontend', 'Backend', 'Fullstack', 'Design'];
    const categoryBreakdown = roles.map(role => ({
      category: role,
      count: candidates.filter(c => (c.role || '').toLowerCase() === role.toLowerCase()).length
    }));

    const statusDistribution = [
      { name: 'Applied/Screening', value: candidates.filter(c => c.stage === 'Applied' || c.stage === 'Screening').length, color: '#f59e0b' },
      { name: 'Shortlisted', value: stats.shortlisted, color: '#3b82f6' },
      { name: 'Interview', value: stats.interviews, color: '#8b5cf6' },
      { name: 'Hired', value: stats.hired, color: '#10b981' }
    ];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    
    const recentMonths = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIndex - i);
      recentMonths.push({
        monthName: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth()
      });
    }

    const applicationTrends = recentMonths.map(m => {
      const monthCandidates = candidates.filter(c => {
        if (!c.appliedDate) return false;
        const candDate = new Date(c.appliedDate);
        return candDate.getMonth() === m.monthNum && candDate.getFullYear() === m.year;
      });

      return {
        month: m.monthName,
        applications: monthCandidates.length,
        hires: monthCandidates.filter(c => c.stage === 'Hired').length
      };
    });

    res.json({
      stats,
      applicationTrends,
      statusDistribution,
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics data.' });
  }
});

// Avoid listening directly during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;