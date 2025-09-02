const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Maintenance mode settings
let maintenanceSettings = {
  enabled: false,
  title: "🚧 Website Under Maintenance",
  message: "We're currently performing scheduled maintenance to improve your experience. We'll be back shortly! Thank you for your patience.",
  estimatedTime: ""
};

// Admin credentials
const adminCredentials = {
  username: "aryan786",
  password: "Aryan@009"
};

// Admin sessions (in production, use proper session management)
const adminSessions = new Map();

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

// Generate sequential numeric ID
async function generateSequentialId() {
  try {
    // Find the highest existing sequentialId and add 1
    const lastItem = await Item.findOne().sort({ sequentialId: -1 });
    return lastItem ? lastItem.sequentialId + 1 : 1;
  } catch (error) {
    console.error('Error generating sequential ID:', error);
    // Fallback to timestamp if there's an issue finding the last item or counting
    return Date.now(); 
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text ? text.replace(/[&<>"']/g, (m) => map[m]) : '';
}

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.query.token || 
                req.body.token;

  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const session = adminSessions.get(token);
  if (session.expires < Date.now()) {
    adminSessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  req.admin = session.user;
  next();
}

// Middleware to check maintenance mode
function checkMaintenanceMode(req, res, next) {
  // Check if user is admin by token
  const token = (req.headers && req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '') || 
                (req.query && req.query.token ? req.query.token : '') || 
                (req.body && req.body.token ? req.body.token : '');

  const isAdmin = token && adminSessions.has(token) && adminSessions.get(token).expires > Date.now();

  // Always allow these paths regardless of maintenance mode
  const allowedPaths = [
    '/maintenance.html',
    '/maintenance-preview'
  ];

  // Admin-only paths (allowed during maintenance for admins)
  const adminPaths = [
    '/admin.html',
    '/admin-login.html', 
    '/admin-login'
  ];

  // Admin-only prefixes
  const adminPrefixes = [
    '/api/maintenance',
    '/api/admin'
  ];

  // Always allow admin login endpoint regardless of maintenance mode
  if (req.path === '/api/admin/login') {
    return next();
  }

  // Static assets (CSS, JS, images) - always allowed
  const staticPrefixes = [
    '/css/',
    '/js/',
    '/assets/'
  ];

  // Allow static assets always
  if (staticPrefixes.some(prefix => req.path.startsWith(prefix))) {
    return next();
  }

  // Allow maintenance page always
  if (allowedPaths.includes(req.path)) {
    return next();
  }

  // Allow admin paths for admins only
  if (adminPaths.includes(req.path) || adminPrefixes.some(prefix => req.path.startsWith(prefix))) {
    if (!isAdmin && req.path !== '/admin-login' && req.path !== '/admin-login.html') {
      return res.redirect('/admin-login');
    }
    return next();
  }

  // If maintenance is enabled, block everything else except for admins
  if (maintenanceSettings.enabled) {
    // Allow admins to access everything during maintenance
    if (isAdmin) {
      return next();
    }

    // Block all pages and redirect to maintenance
    const blockedPages = [
      '/',
      '/index.html',
      '/upload.html', 
      '/view.html',
      '/paste.html',
      '/delete.html'
    ];

    if (blockedPages.includes(req.path)) {
      return res.redirect('/maintenance.html');
    }

    // Block other HTML files except maintenance.html
    if (req.path.endsWith('.html') && req.path !== '/maintenance.html') {
      return res.redirect('/maintenance.html');
    }

    // For API endpoints, return JSON response
    if (req.path.startsWith('/api/')) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: maintenanceSettings.message,
        maintenanceMode: true,
        estimatedTime: maintenanceSettings.estimatedTime,
        title: maintenanceSettings.title
      });
    }

    // For all other requests during maintenance, redirect to maintenance page
    return res.redirect('/maintenance.html');
  }

  next();
}

mongoose.connect('mongodb+srv://aryanchauhan786:Aryanchauhan009@cluster0.fadh4dj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const statsSchema = new mongoose.Schema({
  totalLikes: { type: Number, default: 0 },
  totalRequests: { type: Number, default: 0 },
  totalUploads: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0},
  totalShares: { type: Number, default: 0},
  apiEndpointHits: { type: Map, of: Number, default: {} },
  lastUpdated: { type: Date, default: Date.now },
  dailyActiveUsers: { type: Number, default: 0 },
  popularTags: [{ tag: String, count: Number }],
  averageResponseTime: { type: Number, default: 0 }
});

const Stats = mongoose.model('Stats', statsSchema);

const itemSchema = new mongoose.Schema({
  itemID: { type: Number, unique: true }, // Changed to unique
  shortId: { type: String, unique: true, default: generateId },
  sequentialId: { type: Number, unique: true }, // New sequential ID field
  itemName: { type: String, required: true },
  tags: [String],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  lastUpdated: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  type: { type: String, enum: ['GoatBot', 'MiraiBot', 'AutoBot'], required: true },
  code: { type: String, required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  shareLink: { type: String, unique: true }
});

itemSchema.pre('save', function(next) {
  if (!this.shareLink) {
    this.shareLink = `${this.itemID}-${this.itemName.toLowerCase().replace(/\s+/g, '-')}`;
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin login endpoint - MUST be before maintenance check middleware
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === adminCredentials.username && password === adminCredentials.password) {
      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      adminSessions.set(token, {
        user: { username: adminCredentials.username },
        expires: expires
      });

      res.json({
        success: true,
        token: token,
        user: { username: adminCredentials.username },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply maintenance mode check to all routes EXCEPT admin login
app.use(checkMaintenanceMode);

// Request tracking middleware
app.use(async (req, res, next) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats();
    }
    stats.totalRequests++;
    await stats.save();
    next();
  } catch (error) {
    next();
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', verifyAdminToken, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.query.token || 
                req.body.token;

  if (token) {
    adminSessions.delete(token);
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// Admin delete command endpoint
app.delete('/api/admin/commands/:id', verifyAdminToken, async (req, res) => {
  try {
    const itemID = parseInt(req.params.id);
    const item = await Item.findOne({ itemID });

    if (!item) {
      return res.status(404).json({ error: 'Command not found' });
    }

    await Item.deleteOne({ itemID });

    console.log(`Command deleted by admin ${req.admin.username}: ID ${itemID} - ${item.itemName}`);

    res.json({ 
      success: true, 
      message: 'Command deleted successfully',
      deletedItem: {
        itemID: item.itemID,
        itemName: item.itemName,
        authorName: item.authorName
      }
    });
  } catch (error) {
    console.error('Error deleting command:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin restart project endpoint
app.post('/api/admin/restart', verifyAdminToken, (req, res) => {
  console.log(`Project restart initiated by admin: ${req.admin.username}`);
  res.json({ success: true, message: 'Restart initiated' });

  setTimeout(() => {
    process.exit(0); // This will restart the process in Replit
  }, 1000);
});

// Admin clear database endpoint
app.delete('/api/admin/clear-database', verifyAdminToken, async (req, res) => {
  try {
    const itemsCount = await Item.countDocuments();
    const statsCount = await Stats.countDocuments();

    await Item.deleteMany({});
    await Stats.deleteMany({});

    // Create fresh stats
    const newStats = new Stats();
    await newStats.save();

    console.log(`Database cleared by admin ${req.admin.username}: ${itemsCount} items, ${statsCount} stats deleted`);

    res.json({ 
      success: true, 
      message: 'Database cleared successfully',
      deleted: {
        items: itemsCount,
        stats: statsCount
      }
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin export data endpoint
app.get('/api/admin/export', verifyAdminToken, async (req, res) => {
  try {
    const items = await Item.find({});
    const stats = await Stats.findOne({});

    const exportData = {
      timestamp: new Date().toISOString(),
      items: items,
      stats: stats,
      totalItems: items.length
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=goatmart-export-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);

    console.log(`Data exported by admin: ${req.admin.username}`);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Analytics API endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayItems = await Item.find({ createdAt: { $gte: today } });
    const todayViews = todayItems.reduce((sum, item) => sum + item.views, 0);
    const todayLikes = todayItems.reduce((sum, item) => sum + item.likes, 0);
    const todayUploads = todayItems.length;

    const activeUsers = await Item.distinct('authorName', {
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const hourlyData = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(today);
      hourStart.setHours(i);
      const hourEnd = new Date(today);
      hourEnd.setHours(i + 1);

      const hourViews = await Item.aggregate([
        { $match: { createdAt: { $gte: hourStart, $lt: hourEnd } } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]);

      hourlyData.push(hourViews[0]?.total || 0);
    }

    res.json({
      todayViews,
      todayLikes,
      todayUploads,
      activeUsers: activeUsers.length,
      hourlyData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// Trending keywords API
app.get('/api/trending-keywords', async (req, res) => {
  try {
    const keywords = await Item.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, keyword: '$_id', count: 1 } }
    ]);

    const trendingKeywords = keywords.map(k => k.keyword);
    res.json(trendingKeywords);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching trending keywords' });
  }
});

// Advanced search API
app.get('/api/search/semantic', async (req, res) => {
  try {
    const { q, keywords } = req.query;
    const keywordArray = keywords ? keywords.split(',') : [];

    let query = {};
    if (q) {
      query.$or = [
        { itemName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: keywordArray } }
      ];
    }

    const items = await Item.find(query)
      .sort({ views: -1, likes: -1 })
      .limit(20);

    // Generate AI-powered suggestions
    const suggestions = await generateSearchSuggestions(q, keywordArray);

    res.json({
      items: items.map(item => ({
        ...item.toObject(),
        code: undefined,
        rawLink: `${req.protocol}://${req.get('host')}/raw/${item.shortId}`
      })),
      suggestions,
      query: q,
      keywords: keywordArray
    });
  } catch (error) {
    res.status(500).json({ error: 'Search error' });
  }
});

// Code validation API
app.post('/api/validate-code', async (req, res) => {
  try {
    const { code, language } = req.body;

    // Basic validation based on language
    const validation = validateCodeSyntax(code, language);

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Validation error' });
  }
});

// User profile API
app.get('/api/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const userItems = await Item.find({ authorName: username })
      .sort({ createdAt: -1 });

    const totalLikes = userItems.reduce((sum, item) => sum + item.likes, 0);
    const totalViews = userItems.reduce((sum, item) => sum + item.views, 0);

    const profile = {
      username,
      totalCommands: userItems.length,
      totalLikes,
      totalViews,
      joinDate: userItems[userItems.length - 1]?.createdAt || new Date(),
      recentCommands: userItems.slice(0, 5).map(item => ({
        ...item.toObject(),
        code: undefined
      })),
      achievements: generateUserAchievements(userItems, totalLikes, totalViews)
    };

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Helper functions
async function generateSearchSuggestions(query, keywords) {
  const suggestions = [
    `${query} tutorial`,
    `advanced ${query}`,
    `${query} examples`,
    `${query} for beginners`
  ];
  return suggestions.slice(0, 5);
}

function validateCodeSyntax(code, language) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (language === 'javascript') {
    // Basic JavaScript validation
    if (!code.includes('module.exports') && !code.includes('export')) {
      result.warnings.push('Consider adding module.exports for better compatibility');
    }
    if (code.includes('console.log')) {
      result.suggestions.push('Replace console.log with proper logging for production');
    }
  }

  if (code.length < 50) {
    result.warnings.push('Code seems quite short. Consider adding more functionality.');
  }

  return result;
}

function generateUserAchievements(items, likes, views) {
  const achievements = [];

  if (items.length >= 1) achievements.push({ name: 'First Upload', icon: '🚀', unlocked: true });
  if (items.length >= 5) achievements.push({ name: 'Active Creator', icon: '⭐', unlocked: true });
  if (items.length >= 10) achievements.push({ name: 'Command Master', icon: '👑', unlocked: true });
  if (likes >= 100) achievements.push({ name: 'Popular Creator', icon: '❤️', unlocked: true });
  if (views >= 1000) achievements.push({ name: 'Viral Creator', icon: '🔥', unlocked: true });

  return achievements;
}

// Admin logs endpoint
app.get('/api/admin/logs', verifyAdminToken, (req, res) => {
  const logs = `
<!DOCTYPE html>
<html>
<head>
    <title>System Logs - GoatMart Admin</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #fff; }
        .log-entry { margin: 5px 0; padding: 5px; border-left: 3px solid #6366f1; }
        .timestamp { color: #10b981; }
        .info { border-left-color: #10b981; }
        .warning { border-left-color: #f59e0b; }
        .error { border-left-color: #ef4444; }
    </style>
</head>
<body>
    <h1>GoatMart System Logs</h1>
    <div class="log-entry info">
        <span class="timestamp">[${new Date().toISOString()}]</span> 
        INFO: System accessed by admin ${req.admin.username}
    </div>
    <div class="log-entry info">
        <span class="timestamp">[${new Date().toISOString()}]</span> 
        INFO: Server running on port ${port}
    </div>
    <div class="log-entry info">
        <span class="timestamp">[${new Date().toISOString()}]</span> 
        INFO: MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    </div>
    <div class="log-entry info">
        <span class="timestamp">[${new Date().toISOString()}]</span> 
        INFO: Active admin sessions: ${adminSessions.size}
    </div>
    <div class="log-entry info">
        <span class="timestamp">[${new Date().toISOString()}]</span> 
        INFO: Maintenance mode: ${maintenanceSettings.enabled ? 'ENABLED' : 'DISABLED'}
    </div>
    <script>setInterval(() => window.location.reload(), 30000);</script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(logs);
});

// Maintenance API endpoints
app.get('/api/maintenance', (req, res) => {
  res.json(maintenanceSettings);
});

app.post('/api/maintenance', verifyAdminToken, (req, res) => {
  const { enabled, title, message, estimatedTime } = req.body;

  // Basic validation
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Invalid enabled value' });
  }

  if (title && typeof title !== 'string') {
    return res.status(400).json({ error: 'Invalid title' });
  }

  if (message && typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  // Update settings
  maintenanceSettings = {
    enabled,
    title: title || maintenanceSettings.title,
    message: message || maintenanceSettings.message,
    estimatedTime: estimatedTime || ""
  };

  console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'} by admin: ${req.admin.username}`);

  res.json({ 
    success: true, 
    message: 'Maintenance settings updated',
    settings: maintenanceSettings 
  });
});

// Maintenance preview endpoint
app.get('/maintenance-preview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
});

// Serve maintenance page directly
app.get('/maintenance.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin panel route (protected)
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Stats.findOne() || new Stats();
    const totalCommands = await Item.countDocuments();
    const likesAgg = await Item.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } }
    ]);
    const totalLikes = likesAgg.length > 0 ? likesAgg[0].total : 0;

    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const activeUsers = await Item.distinct('authorName', {
      createdAt: { $gte: oneDayAgo }
    });
    const dailyActiveUsers = activeUsers.length;

    const popularTags = await Item.aggregate([
      { $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topAuthors = await Item.aggregate([
      { $group: { _id: "$authorName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topViewed = await Item.find().sort({views: -1}).limit(5);

    // Get hosting information
    const startTime = process.uptime();
    const uptime = {
      seconds: Math.floor(startTime % 60),
      minutes: Math.floor((startTime / 60) % 60),
      hours: Math.floor((startTime / 3600) % 24),
      days: Math.floor((startTime / 86400) % 30),
      months: Math.floor((startTime / 2592000) % 12),
      years: Math.floor(startTime / 31536000)
    };

    const memoryUsage = process.memoryUsage();
    const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const responseTime = stats.averageResponseTime || 0;

    const os = require('os');
    const osUtils = {
      arch: process.arch,
      platform: process.platform,
      cpuUsage: process.cpuUsage(),
      pid: process.pid,
      version: process.version,
      memoryUsagePercent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      cpuCores: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)),
      osUptime: Math.round(os.uptime()),
      loadAverage: os.loadavg(),
      networkInterfaces: os.networkInterfaces(),
      hostname: os.hostname(),
      tempDir: os.tmpdir(),
      endianness: os.endianness(),
      userInfo: os.userInfo().username
    };

    const currentDate = new Date();
    const serverTime = {
      date: currentDate.toLocaleDateString(),
      time: currentDate.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: currentDate.getTime()
    };

    res.json({
      totalCommands,
      totalLikes,
      dailyActiveUsers,
      popularTags,
      topAuthors,
      topViewed,
      totalShares: stats.totalShares || 0,
      totalRequests: stats.totalRequests || 0,
      featuredCount: await Item.countDocuments({ featured: true }),
      hosting: {
        uptime: uptime,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          usagePercent: osUtils.memoryUsagePercent
        },
        database: {
          status: mongoStatus,
          connectionString: mongoose.connection.host,
          activeConnections: mongoose.connection.active || 0
        },
        performance: {
          averageResponseTime: responseTime,
          cpuUsage: osUtils.cpuUsage,
          port: port
        },
        system: {
          nodeVersion: osUtils.version,
          platform: osUtils.platform,
          arch: osUtils.arch,
          pid: osUtils.pid
        },
        serverTime: serverTime
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trending = await Item.find({
      createdAt: { $gte: oneDayAgo }
    })
    .sort({ views: -1, likes: -1 })
    .limit(10)
    .select('itemName likes views authorName');

    if (!trending.length) {
      const allTimeTrending = await Item.find()
        .sort({ views: -1, likes: -1 })
        .limit(10)
        .select('itemName likes views authorName');
      return res.json(allTimeTrending);
    }
    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching trending commands' });
  }
});

// Get items with pagination
app.get('/api/items', async (req, res) => {
  try {
    const {
      search = '',
      category = 'all',
      limit = 1000, // Default to high limit to show all commands
      page = 1,
      sort = 'newest'
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.type = category;
    }

    // Build sort
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { likes: -1, createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const items = await Item.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const itemsWithRawLinks = items.map(item => ({
      ...item.toObject(),
      code: undefined,
      rawLink: `${req.protocol}://${req.get('host')}/raw/${item.shortId}`,
      rawLinkSeq: `${req.protocol}://${req.get('host')}/raw/seq/${item.sequentialId}`,
      viewLinkSeq: `${req.protocol}://${req.get('host')}/view/seq/${item.sequentialId}`
    }));

    const total = await Item.countDocuments(query);

    res.json({
      items: itemsWithRawLinks,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + limitNum < total
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/items/:id/like', async (req, res) => {
  try {
    const itemID = parseInt(req.params.id);
    const item = await Item.findOne({ itemID });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.likes += 1;
    await item.save();
    res.json({ success: true, likes: item.likes });
  } catch (error) {
    res.status(500).json({ error: 'Error liking item' });
  }
});

// Paste-like endpoints
app.post('/v1/paste', async (req, res) => {
  try {
    const { 
      code, 
      itemName, 
      description, 
      type = 'GoatBot', 
      authorName = 'Unknown',
      tags = [],
      difficulty = 'Intermediate'
    } = req.body;

    if (!code) return res.status(400).json({ error: 'Code is required' });
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Generate unique itemID by finding the highest existing ID
    const lastItem = await Item.findOne().sort({ itemID: -1 });
    const itemID = lastItem ? lastItem.itemID + 1 : 1;
    const shortId = generateId();
    const sequentialId = await generateSequentialId();

    const newItem = new Item({
      itemID,
      shortId,
      sequentialId,
      itemName: itemName || 'Untitled',
      description: description.trim(),
      type,
      code,
      authorName,
      tags: Array.isArray(tags) ? tags : [],
      difficulty
    });

    // Save with retry logic for duplicate key errors
    let saveAttempts = 0;
    const maxAttempts = 3;

    while (saveAttempts < maxAttempts) {
      try {
        await newItem.save();
        break; // Success, exit loop
      } catch (error) {
        if (error.code === 11000 && saveAttempts < maxAttempts - 1) {
          // Duplicate key error, regenerate IDs and try again
          saveAttempts++;
          const lastItem = await Item.findOne().sort({ itemID: -1 });
          newItem.itemID = lastItem ? lastItem.itemID + 1 : 1;
          newItem.sequentialId = await generateSequentialId();
          newItem.shortId = generateId();
          console.log(`Retrying save with new IDs (attempt ${saveAttempts})`);
        } else {
          throw error; // Re-throw if not a duplicate key error or max attempts reached
        }
      }
    }

    // Update stats
    try {
      let stats = await Stats.findOne();
      if (!stats) {
        stats = new Stats();
      }
      stats.totalUploads++;
      await stats.save();
    } catch (error) {
      console.error('Error updating stats:', error);
    }

    res.json({ 
      success: true,
      link: `${req.protocol}://${req.get('host')}/raw/${shortId}`,
      id: shortId,
      itemID,
      message: 'Command uploaded successfully with custom description'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add new command with manual description
app.post('/api/items', async (req, res) => {
  try {
    const { 
      itemName, 
      description, 
      type, 
      code, 
      authorName,
      tags = [],
      difficulty = 'Intermediate'
    } = req.body;

    // Validate required fields
    if (!itemName || !itemName.trim()) {
      return res.status(400).json({ error: 'Command name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    // Generate unique itemID by finding the highest existing ID
    const lastItem = await Item.findOne().sort({ itemID: -1 });
    const itemID = lastItem ? lastItem.itemID + 1 : 1;
    const shortId = generateId();
    const sequentialId = await generateSequentialId();

    const newItem = new Item({
      itemID,
      shortId,
      sequentialId,
      itemName: itemName.trim(),
      description: description.trim(),
      type,
      code: code.trim(),
      authorName: authorName || 'Anonymous',
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      difficulty
    });

    // Save with retry logic for duplicate key errors
    let saveAttempts = 0;
    const maxAttempts = 3;

    while (saveAttempts < maxAttempts) {
      try {
        await newItem.save();
        break; // Success, exit loop
      } catch (error) {
        if (error.code === 11000 && saveAttempts < maxAttempts - 1) {
          // Duplicate key error, regenerate IDs and try again
          saveAttempts++;
          const lastItem = await Item.findOne().sort({ itemID: -1 });
          newItem.itemID = lastItem ? lastItem.itemID + 1 : 1;
          newItem.sequentialId = await generateSequentialId();
          newItem.shortId = generateId();
          console.log(`Retrying save with new IDs (attempt ${saveAttempts})`);
        } else {
          throw error; // Re-throw if not a duplicate key error or max attempts reached
        }
      }
    }

    // Update stats
    try {
      let stats = await Stats.findOne();
      if (!stats) {
        stats = new Stats();
      }
      stats.totalUploads++;
      await stats.save();
    } catch (error) {
      console.error('Error updating stats:', error);
    }

    res.json({ 
      success: true,
      itemId: itemID,
      shortId: shortId,
      link: `${req.protocol}://${req.get('host')}/raw/${shortId}`,
      viewLink: `${req.protocol}://${req.get('host')}/view.html?id=${itemID}`,
      message: 'Command uploaded successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/item/:itemId', async (req, res) => {
  try {
    const itemID = parseInt(req.params.itemId);
    const item = await Item.findOne({ itemID });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      itemID: item.itemID,
      shortId: item.shortId,
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      authorName: item.authorName,
      createdAt: item.createdAt,
      likes: item.likes,
      views: item.views,
      rawLink: `${req.protocol}://${req.get('host')}/raw/${item.shortId}`,
      code: item.code
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add route for viewing by sequential ID
app.get('/view/seq/:sequentialId', async (req, res) => {
  try {
    const sequentialId = parseInt(req.params.sequentialId);

    if (isNaN(sequentialId) || sequentialId < 1) {
      return res.sendFile(path.join(__dirname, 'public', 'view.html'));
    }

    const item = await Item.findOne({ sequentialId });

    if (!item) {
      return res.sendFile(path.join(__dirname, 'public', 'view.html'));
    }

    // Read the view.html file
    const fs = require('fs');
    let html = fs.readFileSync(path.join(__dirname, 'public', 'view.html'), 'utf8');

    // Replace meta tags with dynamic content
    const title = `${item.itemName} - GoatMart`;
    const description = item.description || 'Amazing bot command shared on GoatMart';
    const url = `${req.protocol}://${req.get('host')}/view/seq/${sequentialId}`;
    const imageUrl = `${req.protocol}://${req.get('host')}/assets/logo.png`;

    html = html.replace('<meta property="og:title" content="GoatMart - Bot Commands">', 
                       `<meta property="og:title" content="${escapeHtml(title)}">`);
    html = html.replace('<meta property="og:description" content="Discover and share amazing bot commands">', 
                       `<meta property="og:description" content="${escapeHtml(description)}">`);
    html = html.replace('<meta property="og:url" content="">', 
                       `<meta property="og:url" content="${url}">`);
    html = html.replace('<meta property="og:image" content="/assets/logo.png">', 
                       `<meta property="og:image" content="${imageUrl}">`);

    html = html.replace('<meta name="twitter:title" content="GoatMart - Bot Commands">', 
                       `<meta name="twitter:title" content="${escapeHtml(title)}">`);
    html = html.replace('<meta name="twitter:description" content="Discover and share amazing bot commands">', 
                       `<meta name="twitter:description" content="${escapeHtml(description)}">`);
    html = html.replace('<meta name="twitter:image" content="/assets/logo.png">', 
                       `<meta name="twitter:image" content="${imageUrl}">`);

    html = html.replace('<title>View Command - GoatMart</title>', 
                       `<title>${escapeHtml(title)}</title>`);

    res.send(html);
  } catch (error) {
    console.error('Error serving view page:', error);
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
  }
});

// Add route for viewing by unique shortId with dynamic meta tags
app.get('/view/:shortId', async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const item = await Item.findOne({ shortId });

    if (!item) {
      return res.sendFile(path.join(__dirname, 'public', 'view.html'));
    }

    // Read the view.html file
    const fs = require('fs');
    let html = fs.readFileSync(path.join(__dirname, 'public', 'view.html'), 'utf8');

    // Replace meta tags with dynamic content
    const title = `${item.itemName} - GoatMart`;
    const description = item.description || 'Amazing bot command shared on GoatMart';
    const url = `${req.protocol}://${req.get('host')}/view/${shortId}`;
    const imageUrl = `${req.protocol}://${req.get('host')}/assets/logo.png`;

    html = html.replace('<meta property="og:title" content="GoatMart - Bot Commands">', 
                       `<meta property="og:title" content="${escapeHtml(title)}">`);
    html = html.replace('<meta property="og:description" content="Discover and share amazing bot commands">', 
                       `<meta property="og:description" content="${escapeHtml(description)}">`);
    html = html.replace('<meta property="og:url" content="">', 
                       `<meta property="og:url" content="${url}">`);
    html = html.replace('<meta property="og:image" content="/assets/logo.png">', 
                       `<meta property="og:image" content="${imageUrl}">`);

    html = html.replace('<meta name="twitter:title" content="GoatMart - Bot Commands">', 
                       `<meta name="twitter:title" content="${escapeHtml(title)}">`);
    html = html.replace('<meta name="twitter:description" content="Discover and share amazing bot commands">', 
                       `<meta name="twitter:description" content="${escapeHtml(description)}">`);
    html = html.replace('<meta name="twitter:image" content="/assets/logo.png">', 
                       `<meta name="twitter:image" content="${imageUrl}">`);

    html = html.replace('<title>View Command - GoatMart</title>', 
                       `<title>${escapeHtml(title)}</title>`);

    res.send(html);
  } catch (error) {
    console.error('Error serving view page:', error);
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
  }
});

// API endpoint for getting command by shortId
app.get('/api/command/:shortId', async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const item = await Item.findOne({ shortId });

    if (!item) {
      return res.status(404).json({ error: 'Command not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      itemID: item.itemID,
      shortId: item.shortId,
      sequentialId: item.sequentialId,
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      authorName: item.authorName,
      createdAt: item.createdAt,
      likes: item.likes,
      views: item.views,
      rawLink: `${req.protocol}://${req.get('host')}/raw/${item.shortId}`,
      code: item.code
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// New endpoint for getting command by sequential ID (1, 2, 3, etc.)
app.get('/api/command/seq/:sequentialId', async (req, res) => {
  try {
    const sequentialId = parseInt(req.params.sequentialId);

    if (isNaN(sequentialId) || sequentialId < 1) {
      return res.status(400).json({ error: 'Invalid sequential ID' });
    }

    const item = await Item.findOne({ sequentialId });

    if (!item) {
      return res.status(404).json({ error: 'Command not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      itemID: item.itemID,
      shortId: item.shortId,
      sequentialId: item.sequentialId,
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      authorName: item.authorName,
      createdAt: item.createdAt,
      likes: item.likes,
      views: item.views,
      rawLink: `${req.protocol}://${req.get('host')}/raw/${item.shortId}`,
      code: item.code
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/raw/:shortId', async (req, res) => {
  try {
    const item = await Item.findOne({ shortId: req.params.shortId });
    if (!item) return res.status(404).send('Not found');
    res.type('text/plain').send(item.code);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Raw endpoint for sequential ID
app.get('/raw/seq/:sequentialId', async (req, res) => {
  try {
    const sequentialId = parseInt(req.params.sequentialId);

    if (isNaN(sequentialId) || sequentialId < 1) {
      return res.status(404).send('Not found');
    }

    const item = await Item.findOne({ sequentialId });
    if (!item) return res.status(404).send('Not found');
    res.type('text/plain').send(item.code);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/v1/paste/:shortId', async (req, res) => {
  try {
    const item = await Item.findOne({ shortId: req.params.shortId });
    if (!item) return res.status(404).json({ error: 'Not found' });

    res.json({
      id: item.shortId,
      code: item.code,
      title: item.itemName,
      author: item.authorName,
      type: item.type,
      createdAt: item.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Quick lookup endpoint - supports both shortId and sequential ID
app.get('/api/lookup/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let item;

    // Check if it's a numeric sequential ID
    if (/^\d+$/.test(id)) {
      const sequentialId = parseInt(id);
      item = await Item.findOne({ sequentialId });
    } else {
      // Assume it's a shortId
      item = await Item.findOne({ shortId: id });
    }

    if (!item) {
      return res.status(404).json({ error: 'Command not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      itemID: item.itemID,
      shortId: item.shortId,
      sequentialId: item.sequentialId,
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      authorName: item.authorName,
      createdAt: item.createdAt,
      likes: item.likes,
      views: item.views,
      rawLink: `${req.protocol}://${req.get('host')}/raw/${item.shortId}`,
      rawLinkSeq: `${req.protocol}://${req.get('host')}/raw/seq/${item.sequentialId}`,
      viewLinkSeq: `${req.protocol}://${req.get('host')}/view/seq/${item.sequentialId}`,
      code: item.code
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete command endpoint
app.delete('/api/items/:id', async (req, res) => {
  try {
    const itemID = parseInt(req.params.id);
    const item = await Item.findOne({ itemID });

    if (!item) {
      return res.status(404).json({ error: 'Command not found' });
    }

    await Item.deleteOne({ itemID });

    // Update stats if needed
    try {
      let stats = await Stats.findOne();
      if (stats) {
        stats.totalRequests++;
        await stats.save();
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }

    res.json({ 
      success: true, 
      message: 'Command deleted successfully',
      deletedItem: {
        itemID: item.itemID,
        itemName: item.itemName,
        authorName: item.authorName
      }
    });
  } catch (error) {
    console.error('Error deleting command:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${port}`));