# ♻️ Usafi Mtaani

A full-stack waste management web application that promotes responsible recycling through a loyalty rewards system. Built with **Node.js**, **Express**, **React**, and **Tailwind CSS**, the app offers secure user authentication, tiered incentives, and a clean, responsive UI.

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based login and registration
- Password hashing with bcrypt
- Rate limiting and Helmet.js for enhanced security
- Login attempt tracking with account lockout

### 🎁 Loyalty Program
- Tiered rewards: Bronze, Silver, Gold, Platinum
- Points earned based on payments and tier bonuses
- Redeem points for rewards
- Transaction history tracking
- Dynamic tier upgrades

### 🎨 Customizable UI
- Background color personalization
- Glassmorphism design with smooth transitions
- Font Awesome icons and responsive layout

### 📊 Dashboard & Settings
- View profile, points, and tier status
- Update background preferences
- Access loyalty benefits and recent activity

---

## 🛠️ Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Backend    | Node.js, Express, SQLite |
| Frontend   | React, Tailwind CSS      |
| Security   | JWT, bcrypt, Helmet.js   |
| Styling    | Tailwind, Font Awesome   |

---

## 📂 Project Structure

```bash
Waste-Manager/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── waste_app.db
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Loyalty.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   ├── index.css
│   └── package.json


🧪 Setup Instructions
1️⃣ Backend
bash
cd backend
npm install
node index.js
Backend runs at: http://localhost:4000

2️⃣ Frontend
bash
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173

✅ API Endpoints
Method	Endpoint	Description
POST	/api/register	Register new user
POST	/api/login	Login user
GET	/api/profile	Get user profile and transactions
POST	/api/profile/bg	Update background color
POST	/api/pay	Earn points via payment
POST	/api/redeem	Redeem points
GET	/api/loyalty/info	Get tier benefits
GET	/api/health	Health check endpoint
🧠 Tier System
Tier	Min Points	Bonus Multiplier	Benefits
Bronze	0	1.0×	Basic earning rate
Silver	500	1.1×	10% bonus, faster support
Gold	2000	1.25×	Priority service, special rewards
Platinum	5000	1.5×	VIP support, exclusive offers
📌 Notes
Welcome bonus of 100 points for new users

Points earned = amount / 10 × tier multiplier

Secure token-based access to protected routes

Responsive design for desktop and mobile

👤 Author
Jerald Hindia Simba Project Owner

📎 License
This project is licensed under the MIT License. See the LICENSE file for details.


