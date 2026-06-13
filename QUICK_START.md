# 🚀 Quick Start Guide - Nusantara ERP

Get up and running in **5 minutes**!

---

## 📋 Prerequisites

- **Node.js** 20.19.0 or higher
- **npm** or **yarn**
- **Firebase Account** (free tier works!)
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Clone & Install (1 min)

```bash
# Clone repository
git clone <your-repo-url>
cd nusantara-erp

# Install dependencies
npm install
```

### Step 2: Firebase Configuration (2 min)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the wizard

2. **Get Firebase Config**
   - In Firebase Console, click ⚙️ (Settings) → Project settings
   - Scroll to "Your apps" → Click Web icon (</>)
   - Copy the `firebaseConfig` object

3. **Update Config File**
   ```bash
   # Edit src/config/firebase.js
   # Replace firebaseConfig with your config
   ```

### Step 3: Enable Firebase Services (1 min)

In Firebase Console:

1. **Authentication**
   - Click "Authentication" → "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password"
   - Click "Save"

2. **Firestore Database**
   - Click "Firestore Database" → "Create database"
   - Choose "Start in test mode"
   - Select location (closest to you)
   - Click "Enable"

3. **Storage**
   - Click "Storage" → "Get started"
   - Choose "Start in test mode"
   - Click "Done"

### Step 4: Create First User (1 min)

In Firebase Console → Authentication → Users:

1. Click "Add user"
2. Enter:
   - **Email**: `admin@example.com` (or your email)
   - **Password**: `Admin123!` (or your password)
3. Click "Add user"

**📖 Detailed guide:** [Firebase Auth Setup](./docs/FIREBASE_AUTH_SETUP.md)

### Step 5: Deploy Security Rules & Run

```bash
# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules

# Start development server
npm run dev
```

Open browser at `http://localhost:5173` and login with your credentials!

---

## 🎯 What's Next?

### Explore the System

1. **Dashboard** - View real-time metrics
2. **Master Data** - Add customers, suppliers, products
3. **Sales** - Create your first sales order
4. **Inventory** - Track stock levels
5. **Finance** - Monitor cash flow

### Customize

- **Change Password**: Click user menu → Change Password
- **Settings**: Configure company info, preferences
- **Master Data**: Add your business data

### Deploy to Production

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

---

## 🔧 Troubleshooting

### "Firebase: Error (auth/user-not-found)"

**Solution**: Create user first in Firebase Console (Step 4)

### "Permission denied" errors

**Solution**: Deploy security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### Port 5173 already in use

**Solution**: Kill the process or use different port:

```bash
npm run dev -- --port 3000
```

### Firebase config not found

**Solution**: Make sure you updated `src/config/firebase.js` with your Firebase config

---

## 📚 Documentation

- **[Firebase Auth Setup](./docs/FIREBASE_AUTH_SETUP.md)** - Detailed authentication guide
- **[README.md](./README.md)** - Full documentation
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guide

---

## 🆘 Need Help?

1. Check [Firebase Auth Setup Guide](./docs/FIREBASE_AUTH_SETUP.md)
2. Check browser console (F12) for errors
3. Verify Firebase Console → Authentication → Users
4. Check Firebase Console → Firestore → Data

---

## ✅ Setup Checklist

- [ ] Node.js 20.19.0+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Firebase project created
- [ ] Firebase config updated in `src/config/firebase.js`
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] First user created
- [ ] Security rules deployed
- [ ] App running (`npm run dev`)
- [ ] Successfully logged in

---

**Ready to go!** 🎉

Start building your Nusantara business with this modern ERP system.

**Last Updated**: 2026-05-04
