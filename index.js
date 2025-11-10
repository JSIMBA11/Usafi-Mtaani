const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const SECRET = 'development_secret_key';
const PORT = 4000;

// Initialize SQLite database
const db = new sqlite3.Database('./waste_app.db');

// Initialize Twilio (SMS) - Demo mode
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'demo_account_sid',
  process.env.TWILIO_AUTH_TOKEN || 'demo_auth_token'
);

// Initialize Nodemailer (Email) - Demo mode
const emailTransporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'demo@ecorewards.com',
    pass: process.env.EMAIL_PASS || 'demo_password'
  }
});

// Create all tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      bg_color TEXT DEFAULT '#ffffff',
      tier TEXT DEFAULT 'bronze',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      points INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      scheduled_for DATETIME,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      sms_notifications BOOLEAN DEFAULT 1,
      email_notifications BOOLEAN DEFAULT 1,
      reminder_frequency TEXT DEFAULT 'weekly',
      payment_reminders BOOLEAN DEFAULT 1,
      promotional_offers BOOLEAN DEFAULT 1,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ All database tables created');
});

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for development
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Helper function to promisify database queries
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function createToken(user) {
  return jwt.sign({ 
    id: user.id, 
    phone: user.phone,
    tier: user.tier 
  }, SECRET, { expiresIn: '365d' });
}

// SMS sending function
async function sendSMS(phone, message) {
  // In development, just log the SMS
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 SMS to ${phone}: ${message}`);
    return { success: true, sid: 'demo_sms_id' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Email sending function
async function sendEmail(email, subject, message) {
  // In development, just log the email
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Email to ${email}: ${subject} - ${message}`);
    return { success: true, messageId: 'demo_email_id' };
  }

  try {
    const result = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'EcoRewards <noreply@ecorewards.com>',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">♻️ EcoRewards</h1>
          </div>
          <div style="padding: 20px; background: #f8fafc;">
            ${message}
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Thank you for helping us make the world cleaner! 🌍
              </p>
            </div>
          </div>
        </div>
      `
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Create payment reminder
async function createPaymentReminder(userId, daysUntilDue = 3) {
  const user = await dbGet(
    'SELECT name, phone, email FROM users WHERE id = ?',
    [userId]
  );

  if (!user) return;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  const smsMessage = `Hi ${user.name}! Friendly reminder: Your garbage collection payment is due in ${daysUntilDue} days. Pay now to avoid service interruption. Thank you! ♻️ EcoRewards`;
  const emailMessage = `
    <h2>Payment Reminder</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>This is a friendly reminder that your garbage collection payment is due in <strong>${daysUntilDue} days</strong>.</p>
    <p>Please make your payment to ensure uninterrupted waste collection services.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="http://localhost:5173/dashboard" 
         style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Pay Now
      </a>
    </div>
    <p>Thank you for helping us keep our community clean! 🌱</p>
  `;

  // Store notification in database
  await dbRun(
    'INSERT INTO notifications (user_id, type, message, scheduled_for) VALUES (?, ?, ?, ?)',
    [userId, 'payment_reminder', smsMessage, dueDate]
  );

  // Send immediate notifications based on user preferences
  const preferences = await dbGet(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [userId]
  ) || { sms_notifications: 1, email_notifications: 1 };

  if (preferences.sms_notifications && user.phone) {
    await sendSMS(user.phone, smsMessage);
  }

  if (preferences.email_notifications && user.email) {
    await sendEmail(user.email, `Payment Reminder - Due in ${daysUntilDue} Days`, emailMessage);
  }

  return { success: true, dueDate };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running with notification features',
    timestamp: new Date().toISOString()
  });
});

// Development reset endpoint
app.post('/api/dev/reset', async (req, res) => {
  try {
    await dbRun('DELETE FROM users');
    await dbRun('DELETE FROM loyalty_transactions');
    await dbRun('DELETE FROM notifications');
    await dbRun('DELETE FROM user_preferences');
    
    // Create demo user
    const hash = await bcrypt.hash('password123', 10);
    await dbRun(
      'INSERT INTO users (name, phone, email, password_hash, points) VALUES (?, ?, ?, ?, ?)',
      ['Demo User', '1234567890', 'demo@ecorewards.com', hash, 500]
    );

    res.json({ 
      success: true, 
      message: 'Development environment completely reset!',
      demoUser: {
        phone: '1234567890',
        password: 'password123',
        points: 500
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed: ' + err.message });
  }
});

// Enhanced registration
app.post('/api/register', async (req, res) => {
  const { name, phone, email, password } = req.body;
  
  try {
    // Check if user already exists
    const existing = await dbGet('SELECT id FROM users WHERE phone = ? OR email = ?', [phone, email]);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this phone or email' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      'INSERT INTO users (name, phone, email, password_hash) VALUES (?, ?, ?, ?)',
      [name || '', phone, email || '', hash]
    );
    
    // Welcome points for new users
    const welcomePoints = 500;
    await dbRun('UPDATE users SET points = points + ? WHERE id = ?', [welcomePoints, result.lastID]);
    await dbRun(
      'INSERT INTO loyalty_transactions (user_id, type, points, description) VALUES (?, "earn", ?, "Welcome bonus")',
      [result.lastID, welcomePoints]
    );

    // Create default notification preferences
    await dbRun(
      'INSERT INTO user_preferences (user_id) VALUES (?)',
      [result.lastID]
    );

    const user = await dbGet(
      'SELECT id, name, phone, email, points, bg_color, tier FROM users WHERE id = ?',
      [result.lastID]
    );
    const token = createToken(user);
    
    res.status(201).json({ 
      token, 
      user,
      message: `Welcome! You've earned ${welcomePoints} points! 🎉`
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Enhanced login
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }

  try {
    const row = await dbGet('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await dbRun('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [row.id]);

    const user = { 
      id: row.id, 
      name: row.name, 
      phone: row.phone, 
      email: row.email, 
      points: row.points, 
      bg_color: row.bg_color,
      tier: row.tier
    };
    
    const token = createToken(user);
    res.json({ 
      token, 
      user,
      message: `Welcome back, ${user.name}! 👋`
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Authentication middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing authorization header' });
  
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Enhanced profile with loyalty history
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, name, phone, email, points, bg_color, tier, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    const transactions = await dbAll(
      'SELECT * FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    
    res.json({ ...user, transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user tier based on points
async function updateUserTier(userId) {
  const user = await dbGet('SELECT points FROM users WHERE id = ?', [userId]);
  let tier = 'bronze';
  
  if (user.points >= 5000) tier = 'platinum';
  else if (user.points >= 2000) tier = 'gold';
  else if (user.points >= 500) tier = 'silver';
  
  await dbRun('UPDATE users SET tier = ? WHERE id = ?', [tier, userId]);
  return tier;
}

// Update background color
app.post('/api/profile/bg', auth, async (req, res) => {
  const { bg_color } = req.body;
  try {
    await dbRun('UPDATE users SET bg_color = ? WHERE id = ?', [bg_color || '#ffffff', req.user.id]);
    res.json({ success: true, bg_color });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update background' });
  }
});

// Enhanced payment with tier bonuses
app.post('/api/pay', auth, async (req, res) => {
  const { amount, description = "Payment" } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  try {
    // Base points
    let pointsEarned = Math.round(amount / 10);
    
    // Tier bonuses
    const user = await dbGet('SELECT tier FROM users WHERE id = ?', [req.user.id]);
    let bonusMultiplier = 1;
    
    switch (user.tier) {
      case 'silver': bonusMultiplier = 1.1; break;
      case 'gold': bonusMultiplier = 1.25; break;
      case 'platinum': bonusMultiplier = 1.5; break;
    }
    
    pointsEarned = Math.round(pointsEarned * bonusMultiplier);
    const bonusPoints = pointsEarned - Math.round(amount / 10);

    await dbRun('UPDATE users SET points = points + ? WHERE id = ?', [pointsEarned, req.user.id]);
    await dbRun(
      'INSERT INTO loyalty_transactions (user_id, type, points, description) VALUES (?, "earn", ?, ?)',
      [req.user.id, pointsEarned, description]
    );

    // Update tier
    const newTier = await updateUserTier(req.user.id);
    
    const updatedUser = await dbGet('SELECT points, tier FROM users WHERE id = ?', [req.user.id]);
    
    res.json({ 
      success: true, 
      points: updatedUser.points, 
      pointsEarned,
      bonusPoints,
      tier: updatedUser.tier,
      message: `Earned ${pointsEarned} points! ${bonusPoints > 0 ? `(${bonusPoints} bonus)` : ''}`
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Enhanced redemption
app.post('/api/redeem', auth, async (req, res) => {
  const { points, reward = "Reward" } = req.body;
  
  if (!points || points <= 0) {
    return res.status(400).json({ error: 'Valid points amount is required' });
  }

  try {
    const user = await dbGet('SELECT points FROM users WHERE id = ?', [req.user.id]);
    if (user.points < points) {
      return res.status(400).json({ error: 'Not enough points' });
    }

    await dbRun('UPDATE users SET points = points - ? WHERE id = ?', [points, req.user.id]);
    await dbRun(
      'INSERT INTO loyalty_transactions (user_id, type, points, description) VALUES (?, "redeem", ?, ?)',
      [req.user.id, points, reward]
    );

    const updatedUser = await dbGet('SELECT points FROM users WHERE id = ?', [req.user.id]);
    
    res.json({ 
      success: true, 
      remaining: updatedUser.points,
      message: `Successfully redeemed ${points} points for ${reward}`
    });
  } catch (err) {
    console.error('Redemption error:', err);
    res.status(500).json({ error: 'Redemption failed' });
  }
});

// Loyalty program info
app.get('/api/loyalty/info', auth, (req, res) => {
  const tiers = {
    bronze: { minPoints: 0, multiplier: 1, benefits: ['Basic earning rate'] },
    silver: { minPoints: 500, multiplier: 1.1, benefits: ['10% bonus points', 'Faster support'] },
    gold: { minPoints: 2000, multiplier: 1.25, benefits: ['25% bonus points', 'Priority service', 'Special rewards'] },
    platinum: { minPoints: 5000, multiplier: 1.5, benefits: ['50% bonus points', 'VIP support', 'Exclusive offers', 'Early access'] }
  };
  
  res.json({ tiers });
});

// NOTIFICATION ENDPOINTS

// Get user notification preferences
app.get('/api/notifications/preferences', auth, async (req, res) => {
  try {
    let preferences = await dbGet(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    if (!preferences) {
      // Create default preferences
      await dbRun(
        'INSERT INTO user_preferences (user_id) VALUES (?)',
        [req.user.id]
      );
      preferences = {
        user_id: req.user.id,
        sms_notifications: 1,
        email_notifications: 1,
        reminder_frequency: 'weekly',
        payment_reminders: 1,
        promotional_offers: 1
      };
    }

    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update notification preferences
app.post('/api/notifications/preferences', auth, async (req, res) => {
  const { sms_notifications, email_notifications, reminder_frequency, payment_reminders, promotional_offers } = req.body;

  try {
    await dbRun(
      `INSERT OR REPLACE INTO user_preferences 
       (user_id, sms_notifications, email_notifications, reminder_frequency, payment_reminders, promotional_offers) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, sms_notifications, email_notifications, reminder_frequency, payment_reminders, promotional_offers]
    );

    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Create payment reminder (manual trigger for testing)
app.post('/api/notifications/payment-reminder', auth, async (req, res) => {
  const { days_until_due = 3 } = req.body;

  try {
    const result = await createPaymentReminder(req.user.id, days_until_due);
    res.json({ 
      success: true, 
      message: `Payment reminder set for ${days_until_due} days from now`,
      ...result 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Get user notifications
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const notifications = await dbAll(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Schedule automatic reminders (runs daily)
function scheduleAutomaticReminders() {
  setInterval(async () => {
    try {
      // Find users with payment_reminders enabled and no recent payment
      const users = await dbAll(`
        SELECT u.id, u.name, u.phone, u.email, up.reminder_frequency 
        FROM users u
        JOIN user_preferences up ON u.id = up.user_id
        WHERE up.payment_reminders = 1
        AND u.id NOT IN (
          SELECT user_id FROM loyalty_transactions 
          WHERE type = 'earn' AND description LIKE '%Payment%'
          AND created_at > datetime('now', '-30 days')
        )
      `);

      for (const user of users) {
        await createPaymentReminder(user.id, 3); // Remind 3 days before due
      }

      console.log(`✅ Sent automatic reminders to ${users.length} users`);
    } catch (err) {
      console.error('Automatic reminder error:', err);
    }
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

// Create demo user on startup
async function createDemoUser() {
  try {
    const existing = await dbGet('SELECT id FROM users WHERE phone = ?', ['1234567890']);
    if (!existing) {
      const hash = await bcrypt.hash('password123', 10);
      await dbRun(
        'INSERT INTO users (name, phone, email, password_hash, points) VALUES (?, ?, ?, ?, ?)',
        ['Demo User', '1234567890', 'demo@ecorewards.com', hash, 500]
      );
      console.log('✅ Demo user created: 1234567890 / password123');
    }
  } catch (err) {
    console.log('⚠️ Could not create demo user:', err.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log('🚀 DEVELOPMENT SERVER STARTED');
  console.log('📍 Port:', PORT);
  console.log('🔓 NO ACCOUNT LOCKS - Development mode');
  console.log('📧 NOTIFICATIONS ENABLED - SMS & Email reminders');
  console.log('👤 Demo: phone=1234567890, password=password123');
  console.log('🔄 Reset: POST http://localhost:4000/api/dev/reset');
  console.log('❤️  Health: http://localhost:4000/api/health');
  
  await createDemoUser();
  scheduleAutomaticReminders();
});