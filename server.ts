import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Middleware for JSON & form parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data and uploads directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOVELS_FILE = path.join(DATA_DIR, 'novels.json');
const RESET_TOKENS_FILE = path.join(DATA_DIR, 'reset_tokens.json');

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Novel {
  id: string;
  userId: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  coverUrl: string;
  fileUrl?: string;
  fileName?: string;
  fileType: 'pdf' | 'epub' | 'text';
  totalPages: number;
  currentPage: number;
  progressPercent: number;
  status: 'unread' | 'reading' | 'completed';
  isFavorite: boolean;
  lastReadAt?: string;
  createdAt: string;
  updatedAt: string;
  contentSnippet?: string;
  chapters?: { id: string; title: string; content: string }[];
}

// Helper to read/write JSON files safely
function readJson<T>(file: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultValue;
  }
}

function writeJson<T>(file: string, data: T): void {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_novelbox_salt_2026').digest('hex');
}

// Seed initial default novels
const SEED_NOVELS: Omit<Novel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    synopsis: 'Kisah klasik tentang cinta, kesalahpahaman kelas sosial, dan kebanggaan antara Elizabeth Bennet yang cerdas dan Tuan Darcy yang tampak angkuh di pedesaan Inggris abad ke-19.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    fileUrl: '/api/files/pride-and-prejudice.pdf',
    fileName: 'pride-and-prejudice.pdf',
    fileType: 'pdf',
    totalPages: 5,
    currentPage: 2,
    progressPercent: 40,
    status: 'reading',
    isFavorite: true,
    lastReadAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    chapters: [
      {
        id: 'c1',
        title: 'Bab 1: Kedatangan Tuan Bingley',
        content: `Adalah sebuah kebenaran yang diakui secara universal, bahwa seorang pria lajang yang memiliki kekayaan memadai pastilah membutuhkan seorang istri. Betapapun sedikitnya perasaan atau pandangan pria semacam itu diketahui ketika pertama kali memasuki suatu lingkungan, kebenaran ini begitu tertanam di benak keluarga-keluarga tetangga, sehingga ia dianggap sebagai hak milik sah dari salah satu putri mereka.\n\n"Suamiku tersayang," kata istrinya kepadanya suatu hari, "sudahkah kau dengar bahwa Taman Netherfield akhirnya disewa?"\n\nTuan Bennet menjawab bahwa ia belum mendengarnya.\n\n"Tapi itu benar," sahutnya; "karena Nyonya Long baru saja berada di sini, dan dia menceritakan semuanya kepadaku."\n\nTuan Bennet tidak menjawab.\n\n"Tidakkah kau ingin tahu siapa yang menyewanya?" seru istrinya dengan tidak sabar.\n\n"Kau ingin menceritakannya kepadaku, dan aku tidak berkeberatan mendengarkannya."\n\nUndangan itu sudah lebih dari cukup.`
      },
      {
        id: 'c2',
        title: 'Bab 2: Kunjungan Tuan Bennet',
        content: `Tuan Bennet termasuk salah seorang yang pertama berkunjung ke Tuan Bingley. Ia selalu berniat untuk mengunjunginya, meskipun sampai saat-saat terakhir selalu meyakinkan istrinya bahwa ia tidak akan pergi; dan baru pada malam hari setelah kunjungan itu dilakukan, istrinya mendapat kabar mengenai hal tersebut.\n\nSaat mengamati putri keduanya sedang menjahit pita pada topinya, ia tiba-tiba menyapanya:\n\n"Kuharap Tuan Bingley akan menyukainya, Lizzy."\n\n"Kita tidak mungkin tahu apa yang disukai Tuan Bingley," kata ibunya dengan kesal, "karena kita tidak akan mengunjunginya."`
      },
      {
        id: 'c3',
        title: 'Bab 3: Dansa di Meryton',
        content: `Tak lama kemudian pesta dansa di Meryton dimulai. Tuan Bingley adalah pria yang tampan dan bersahaja; ia memiliki wajah yang menyenangkan dan tingkah laku yang luwes serta ramah. Namun temannya, Tuan Darcy, segera menarik perhatian seisi ruangan karena sosoknya yang tegap, ketampanannya, dan kabar bahwa penghasilannya mencapai sepuluh ribu pound setahun.\n\nNamun sebelum malam berakhir, sikapnya yang dingin dan menjaga jarak membuat seluruh hadirin menganggapnya sebagai pria paling sombong dan tidak menyenangkan di dunia.`
      }
    ]
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    genre: 'Mystery',
    synopsis: 'Kumpulan kasus penyelidikan sang detektif brilian Sherlock Holmes dan sahabatnya Dr. John Watson di Baker Street, memecahkan teka-teki paling rumit di London era Victoria.',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    fileUrl: '/api/files/the-adventures-of-sherlock-holmes.pdf',
    fileName: 'the-adventures-of-sherlock-holmes.pdf',
    fileType: 'pdf',
    totalPages: 3,
    currentPage: 1,
    progressPercent: 33,
    status: 'reading',
    isFavorite: true,
    lastReadAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    chapters: [
      {
        id: 'c1',
        title: 'Skandal di Bohemia: Bagian I',
        content: `Bagi Sherlock Holmes, dia selalu menjadi wanita itu. Jarang sekali aku mendengar dia menyebut namanya dengan cara lain. Di matanya, dia mengungguli dan mendominasi seluruh kaumnya.\n\nBukan berarti dia merasakan emosi yang mirip dengan cinta untuk Irene Adler. Semua emosi, terutama yang satu itu, sangat menjijikkan bagi pikirannya yang dingin, tepat, namun sangat seimbang. Dia adalah mesin penalaran dan observasi paling sempurna yang pernah dikenal dunia.\n\nPada suatu malam tanggal dua puluh Maret 1888, aku sedang kembali dari kunjungan pasien ketika langkah kakiku membawaku melewati Baker Street...`
      },
      {
        id: 'c2',
        title: 'Skandal di Bohemia: Bagian II',
        content: `Pria misterius bertopeng melangkah masuk ke dalam kamar bernomor 221B. Tingginya tidak kurang dari enam kaki enam inci, dengan dada dan anggota tubuh pahlawan Herkules.\n\n"Anda telah menerima surat saya?" tanyanya dengan aksen Jerman yang kental.\n\n"Duduklah, Yang Mulia," kata Holmes santai. "Apakah saya berbicara dengan Wilhelm Gottsreich Sigismond von Ormstein, Pangeran Agung Cassel-Felstein, dan Raja Bohemia?"\n\nPria itu melompat berdiri dari kursinya dan melepaskan topeng gelapnya dengan terkejut.`
      }
    ]
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    genre: 'Horror',
    synopsis: 'Catatan harian Jonathan Harker saat mengunjungi kastil Count Dracula di pegunungan Transylvania yang diselimuti kabut dan rahasia kegelapan kuno penghisap darah.',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    fileType: 'text',
    totalPages: 410,
    currentPage: 0,
    progressPercent: 0,
    status: 'unread',
    isFavorite: false,
    chapters: [
      {
        id: 'c1',
        title: 'Bistritz ke Bukovina',
        content: `3 Mei. Bistritz.—Meninggalkan Munich pada pukul 8:35 malam tanggal 1 Mei, tiba di Wina keesokan harinya pagi-pagi sekali. Kereta terlambat satu jam. Budapest tampaknya merupakan tempat yang indah. Kesan yang saya peroleh adalah bahwa kami meninggalkan Barat dan memasuki Timur.\n\nKereta api membawa kami melewati perbukitan yang hijau dan kastil-kastil tua yang menjulang di puncak tebing berbatu.`
      }
    ]
  },
  {
    title: 'Around the World in Eighty Days',
    author: 'Jules Verne',
    genre: 'Adventure',
    synopsis: 'Taruhan 20.000 poundsterling mendorong pria Inggris yang eksentrik Phileas Fogg dan pelayannya Passepartout untuk mengelilingi dunia dalam waktu tepat 80 hari.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    fileType: 'text',
    totalPages: 250,
    currentPage: 250,
    progressPercent: 100,
    status: 'completed',
    isFavorite: true,
    lastReadAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    chapters: [
      {
        id: 'c1',
        title: 'Taruhan di Reform Club',
        content: `Pada tahun 1872, rumah bernomor 7 di Savile Row, Burlington Gardens—tempat meninggalnya Sheridan pada tahun 1814—dihuni oleh Phileas Fogg, Esq., salah satu anggota Reform Club yang paling terkemuka dan istimewa.\n\nPhileas Fogg adalah pria yang jarang sekali berbicara banyak, namun tindakannya setepat jarum jam dinding.`
      }
    ]
  },
  {
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    genre: 'Fantasy',
    synopsis: 'Petualangan fantastis gadis kecil bernama Alice yang mengejar kelinci putih berompi ke dalam lubang tanah dan menemukan dunia penuh keajaiban aneh.',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    fileType: 'text',
    totalPages: 160,
    currentPage: 0,
    progressPercent: 0,
    status: 'unread',
    isFavorite: false,
    chapters: [
      {
        id: 'c1',
        title: 'Menuruni Lubang Kelinci',
        content: `Alice mulai merasa sangat lelah duduk di samping saudara perempuannya di tepi sungai, dan tidak memiliki apa pun untuk dilakukan. Sekali atau dua kali ia mengintip ke dalam buku yang sedang dibaca kakaknya, tetapi buku itu tidak memiliki gambar atau percakapan di dalamnya.\n\n"Dan apa gunanya buku," pikir Alice, "tanpa gambar atau percakapan?"`
      }
    ]
  },
  {
    title: 'The Importance of Being Earnest',
    author: 'Oscar Wilde',
    genre: 'Comedy',
    synopsis: 'Komedi satir tajam masyarakat kelas atas Victoria tentang dua pria lajang yang menggunakan nama samaran yang sama demi memikat wanita pujaan mereka.',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    fileType: 'text',
    totalPages: 120,
    currentPage: 30,
    progressPercent: 25,
    status: 'reading',
    isFavorite: false,
    lastReadAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    chapters: [
      {
        id: 'c1',
        title: 'Babak I: Ruang Duduk Algernon',
        content: `Ruang duduk di flat Algernon di Half-Moon Street. Ruangan tersebut ditata dengan mewah dan artistik. Suara piano terdengar dari ruangan sebelah.\n\nAlgernon melangkah masuk.\n\n"Apakah kau mendengar apa yang kumainkan, Lane?"\n\n"Saya rasa tidak sopan untuk mendengarkan, Tuan."\n\n"Sayang sekali bagi dirimu. Aku tidak memainkan piano dengan akurat—siapa pun bisa memainkan dengan akurat—tetapi aku memainkannya dengan ekspresi yang luar biasa!"`
      }
    ]
  }
];

// Initialize default users if empty
function initData() {
  const users = readJson<User[]>(USERS_FILE, []);
  if (users.length === 0) {
    const demoUser: User = {
      id: 'usr_demo_1',
      email: 'demo@novelbox.app',
      name: 'Aurelia Santoso',
      passwordHash: hashPassword('password123'),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Pencinta novel klasik, fantasi, dan misteri. Menikmati secangkir kopi hangat ditemani buku yang memikat.',
      createdAt: new Date().toISOString()
    };
    users.push(demoUser);
    writeJson(USERS_FILE, users);

    // Seed novels for demo user
    const novels = readJson<Novel[]>(NOVELS_FILE, []);
    SEED_NOVELS.forEach((item, index) => {
      novels.push({
        ...item,
        id: `nov_seed_${index + 1}`,
        userId: demoUser.id,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
      });
    });
    writeJson(NOVELS_FILE, novels);
  }
}
initData();

// Storage config for Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.epub', '.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap unggah PDF, EPUB, atau gambar.'));
    }
  }
});

// Serve uploaded files statically
app.use('/api/files', express.static(UPLOADS_DIR));

// Simple Bearer token authorization helper
function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const users = readJson<User[]>(USERS_FILE, []);
    return users.find(u => u.id === userId) || null;
  } catch {
    return null;
  }
}

function createToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
  }

  const users = readJson<User[]>(USERS_FILE, []);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
  }

  const newUser: User = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    passwordHash: hashPassword(password),
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=f3ece2,e8dacb`,
    bio: 'Pustakawan digital di NovelBox.',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);

  // Clone sample starter books for the new user so their shelf isn't completely empty
  const novels = readJson<Novel[]>(NOVELS_FILE, []);
  SEED_NOVELS.slice(0, 3).forEach((item, index) => {
    novels.push({
      ...item,
      id: `nov_init_${Date.now()}_${index}`,
      userId: newUser.id,
      currentPage: 0,
      progressPercent: 0,
      status: 'unread',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  writeJson(NOVELS_FILE, novels);

  const token = createToken(newUser.id);
  const { passwordHash: _, ...safeUser } = newUser;
  return res.json({ token, user: safeUser });
});

// 2. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const users = readJson<User[]>(USERS_FILE, []);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Email atau password tidak sesuai.' });
  }

  const token = createToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

// 3. Auth: Forgot Password request
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi.' });
  }
  const users = readJson<User[]>(USERS_FILE, []);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Email tidak ditemukan di sistem NovelBox.' });
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  const tokens = readJson<Record<string, { token: string; expires: number }>>(RESET_TOKENS_FILE, {});
  tokens[user.email.toLowerCase()] = {
    token: resetToken,
    expires: Date.now() + 15 * 60 * 1000 // 15 mins
  };
  writeJson(RESET_TOKENS_FILE, tokens);

  // Return reset code in response for testing/demo ease
  return res.json({
    message: 'Kode pemulihan telah dibuat.',
    email: user.email,
    verificationCode: resetToken
  });
});

// 4. Auth: Reset Password verify
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, verificationCode, newPassword } = req.body;
  if (!email || !verificationCode || !newPassword) {
    return res.status(400).json({ error: 'Lengkapi semua kolom formulir.' });
  }

  const tokens = readJson<Record<string, { token: string; expires: number }>>(RESET_TOKENS_FILE, {});
  const entry = tokens[email.toLowerCase()];

  if (!entry || entry.token !== verificationCode || Date.now() > entry.expires) {
    return res.status(400).json({ error: 'Kode verifikasi tidak valid atau telah kedaluwarsa.' });
  }

  const users = readJson<User[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  users[userIndex].passwordHash = hashPassword(newPassword);
  writeJson(USERS_FILE, users);

  delete tokens[email.toLowerCase()];
  writeJson(RESET_TOKENS_FILE, tokens);

  return res.json({ message: 'Kata sandi berhasil diperbarui. Silakan login kembali.' });
});

// 5. Auth: Get Current Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json(safeUser);
});

// 6. Auth: Update Profile
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const { name, bio, avatarUrl, newPassword } = req.body;
  const users = readJson<User[]>(USERS_FILE, []);
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  if (name) users[idx].name = name.trim();
  if (bio !== undefined) users[idx].bio = bio.trim();
  if (avatarUrl) users[idx].avatarUrl = avatarUrl;
  if (newPassword && newPassword.length >= 6) {
    users[idx].passwordHash = hashPassword(newPassword);
  }

  writeJson(USERS_FILE, users);
  const { passwordHash: _, ...safeUser } = users[idx];
  return res.json(safeUser);
});

// 7. File Upload Endpoint (PDF, EPUB, Cover)
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Harap login terlebih dahulu untuk mengunggah berkas.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada berkas yang diunggah.' });
  }

  const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  const fileUrl = `/api/files/${req.file.filename}`;

  return res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    type: fileExt
  });
});

// 8. Novels: List user's novels
app.get('/api/novels', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const novels = readJson<Novel[]>(NOVELS_FILE, []);
  const userNovels = novels.filter(n => n.userId === user.id);

  // Ensure page bounds consistency
  userNovels.forEach(n => {
    if (n.totalPages > 0 && n.currentPage > n.totalPages) {
      n.currentPage = n.totalPages;
      n.progressPercent = 100;
    }
  });

  // Sorting: recently updated first
  userNovels.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return res.json(userNovels);
});

// 9. Novels: Create new novel
app.post('/api/novels', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const {
    title,
    author,
    genre,
    synopsis,
    coverUrl,
    fileUrl,
    fileName,
    fileType,
    totalPages,
    status
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Judul dan nama penulis wajib diisi.' });
  }

  const novels = readJson<Novel[]>(NOVELS_FILE, []);
  const defaultCovers = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
  ];

  const newNovel: Novel = {
    id: 'nov_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId: user.id,
    title: title.trim(),
    author: author.trim(),
    genre: genre || 'Lainnya',
    synopsis: synopsis || 'Belum ada sinopsis untuk novel ini.',
    coverUrl: coverUrl || defaultCovers[Math.floor(Math.random() * defaultCovers.length)],
    fileUrl: fileUrl || undefined,
    fileName: fileName || undefined,
    fileType: fileType || 'pdf',
    totalPages: Number(totalPages) > 0 ? Number(totalPages) : 100,
    currentPage: 0,
    progressPercent: 0,
    status: status || 'unread',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  novels.unshift(newNovel);
  writeJson(NOVELS_FILE, novels);

  return res.status(201).json(newNovel);
});

// 10. Novels: Update novel details or progress
app.put('/api/novels/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const { id } = req.params;
  const novels = readJson<Novel[]>(NOVELS_FILE, []);
  const index = novels.findIndex(n => n.id === id && n.userId === user.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Novel tidak ditemukan.' });
  }

  const current = novels[index];
  const {
    title,
    author,
    genre,
    synopsis,
    coverUrl,
    fileUrl,
    fileName,
    fileType,
    totalPages,
    currentPage,
    status,
    isFavorite
  } = req.body;

  if (title !== undefined) current.title = title.trim();
  if (author !== undefined) current.author = author.trim();
  if (genre !== undefined) current.genre = genre;
  if (synopsis !== undefined) current.synopsis = synopsis;
  if (coverUrl !== undefined) current.coverUrl = coverUrl;
  if (fileUrl !== undefined) current.fileUrl = fileUrl;
  if (fileName !== undefined) current.fileName = fileName;
  if (fileType !== undefined) current.fileType = fileType;
  if (totalPages !== undefined) current.totalPages = Math.max(1, Number(totalPages));
  if (isFavorite !== undefined) current.isFavorite = Boolean(isFavorite);

  if (currentPage !== undefined) {
    current.currentPage = Math.min(Math.max(0, Number(currentPage)), current.totalPages);
    current.progressPercent = Math.round((current.currentPage / current.totalPages) * 100);
    current.lastReadAt = new Date().toISOString();

    if (current.currentPage >= current.totalPages) {
      current.status = 'completed';
    } else if (current.currentPage > 0 && current.status === 'unread') {
      current.status = 'reading';
    }
  }

  if (status !== undefined) {
    current.status = status;
    if (status === 'completed') {
      current.currentPage = current.totalPages;
      current.progressPercent = 100;
    } else if (status === 'unread' && current.currentPage === current.totalPages) {
      current.currentPage = 0;
      current.progressPercent = 0;
    }
  }

  current.updatedAt = new Date().toISOString();
  novels[index] = current;
  writeJson(NOVELS_FILE, novels);

  return res.json(current);
});

// 11. Novels: Toggle Favorite
app.post('/api/novels/:id/favorite', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Tidak terautentikasi' });

  const { id } = req.params;
  const novels = readJson<Novel[]>(NOVELS_FILE, []);
  const index = novels.findIndex(n => n.id === id && n.userId === user.id);
  if (index === -1) return res.status(404).json({ error: 'Novel tidak ditemukan.' });

  novels[index].isFavorite = !novels[index].isFavorite;
  novels[index].updatedAt = new Date().toISOString();
  writeJson(NOVELS_FILE, novels);

  return res.json(novels[index]);
});

// 12. Novels: Delete novel
app.delete('/api/novels/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Tidak terautentikasi' });

  const { id } = req.params;
  const novels = readJson<Novel[]>(NOVELS_FILE, []);
  const index = novels.findIndex(n => n.id === id && n.userId === user.id);
  if (index === -1) return res.status(404).json({ error: 'Novel tidak ditemukan.' });

  const deleted = novels.splice(index, 1)[0];
  writeJson(NOVELS_FILE, novels);

  // If there's an uploaded file, we could clean it up optionally
  if (deleted.fileName) {
    const filePath = path.join(UPLOADS_DIR, deleted.fileName);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  return res.json({ success: true, message: 'Novel berhasil dihapus dari perpustakaan.' });
});

// 13. Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NovelBox] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[NovelBox] Server failed to start:', err);
});
