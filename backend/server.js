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

// Explicit CORS configuration to allow all requests from any local origin
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Ensure Uploads Directory Exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper: Read Database File
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], candidates: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], candidates: [] };
  }
};

// Helper: Write Database File
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Fixed Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

// File Filter
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error('Only PNG, JPG, JPEG, and PDF files are allowed!'));
  }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.encode({ id: newUser.id, email: newUser.email }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.encode({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// -------------------------------------------------------------
// CANDIDATE & UPLOAD ROUTES
// -------------------------------------------------------------

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    message: 'File uploaded successfully!',
    fileName: req.file.originalname,
    filePath: fileUrl
  });
});

app.get('/api/candidates', authenticateToken, (req, res) => {
  const db = readDB();
  res.json(db.candidates.reverse());
});

app.post('/api/candidates', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    const { fullName, email, phone, stage, appliedDate } = req.body;

    if (!fullName || !email || !phone || !stage || !appliedDate || !req.file) {
      return res.status(400).json({ error: 'All fields including resume file are required.' });
    }

    const db = readDB();
    const newCandidate = {
      _id: Date.now().toString(),
      fullName,
      email,
      phone,
      stage,
      appliedDate,
      resumeUrl: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };

    db.candidates.push(newCandidate);
    writeDB(db);

    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(500).json({ error: 'Error saving candidate.' });
  }
});

app.put('/api/candidates/:id', authenticateToken, (req, res) => {
  try {
    const { stage } = req.body;
    const db = readDB();
    const candidate = db.candidates.find(c => c._id === req.params.id);

    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    candidate.stage = stage;
    writeDB(db);

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Error updating candidate stage.' });
  }
});

app.delete('/api/candidates/:id', authenticateToken, (req, res) => {
  try {
    const db = readDB();
    db.candidates = db.candidates.filter(c => c._id !== req.params.id);
    writeDB(db);

    res.json({ message: 'Candidate deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting candidate.' });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Upload Error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`📁 JSON Database active at database.json`);
});