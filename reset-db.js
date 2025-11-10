const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'waste_app.db');

console.log('🔄 Resetting development database...');

// Check if database file exists and delete it
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Database file deleted');
} else {
  console.log('ℹ️  No database file found, creating fresh...');
}

// Create new database with initial data
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      bg_color TEXT DEFAULT '#f8fafc',
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
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      attempts INTEGER DEFAULT 1,
      last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Database tables created');
  
  // Create a demo user (optional)
  const bcrypt = require('bcrypt');
  const demoPassword = 'password123';
  
  bcrypt.hash(demoPassword, 12, (err, hash) => {
    if (err) {
      console.log('⚠️  Could not create demo user:', err.message);
    } else {
      db.run(
        'INSERT OR IGNORE INTO users (name, phone, email, password_hash, points) VALUES (?, ?, ?, ?, ?)',
        ['Demo User', '1234567890', 'demo@ecorewards.com', hash, 100],
        function(err) {
          if (err) {
            console.log('⚠️  Could not insert demo user:', err.message);
          } else {
            console.log('✅ Demo user created:');
            console.log('   📱 Phone: 1234567890');
            console.log('   🔑 Password: password123');
            console.log('   🎁 Starting points: 100');
          }
        }
      );
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('🎉 Database reset complete!');
    console.log('🚀 You can now start the backend server');
  }
});