# 🛍️ ShopKart — Premium MERN Stack E-Commerce Platform

Welcome to **ShopKart**, a feature-rich, high-performance, modern MERN stack e-commerce web application. ShopKart offers a smooth, end-to-end shopping experience featuring secure user authentication, responsive design, an administrative dashboard, cart persistence, and dynamic payment gateway integration.

---

## 🚀 Tech Stack

| Layer | Technology | Key Features |
|---|---|---|
| **Frontend** | React v19, Vite, React Router v7 | Fast SPA, Component-driven, HMR |
| **Styling** | Tailwind CSS v4, Framer Motion | Modern design, fluid micro-animations, glassmorphism |
| **Backend** | Node.js, Express | REST API, robust middleware, secure routing |
| **Database** | MongoDB Atlas, Mongoose | Schema-driven document storage, indexing, persistence |
| **Payments** | Razorpay SDK | Dual-mode checkout (Live Gateway + Sandbox/Mock fallback) |
| **Uploads** | Cloudinary | Auto-configured cloud asset storage with disk fallbacks |
| **Security** | JWT (jsonwebtoken), BcryptJS | Secure session cookies/headers, salted passwords |

---

## ✨ Features

- **Secure Authentication**: JWT-based user register/login and profile updating, with cryptographically salted passwords using Bcrypt.
- **Product Catalog & Details**: Dynamic catalog filters, tags, product review and rating engine, and real-time inventory management.
- **Dynamic Cart**: Synchronized React context cart that persists directly to the database on checkout, enabling cart sessions across multiple sessions/devices.
- **Razorpay Payments**: Integrated dual-mode Razorpay checkout interface. If live keys are present, it initializes the real-time gateway; otherwise, it handles a complete mock payment verification loop seamlessly.
- **Admin Command Center**: An exclusive, protected administrative suite (`/admin`) for:
  - Order fulfillment tracking and status updating.
  - Full product inventory management (Create, Read, Update, Delete).
  - User database auditing.
  - Live revenue and sales analytic widgets.
- **Modern Responsive Design**: Stunning CSS styles, Google Fonts integration (Outfit & serif headers), custom animated notifications, and a responsive layout designed for mobile, tablet, and desktop screens.

---

## 📂 Project Structure

```text
Shop_kart/
├── backend/                  # Express REST Backend Server
│   ├── config/               # Database and seeding configs
│   ├── controllers/          # API route handler controllers
│   ├── middleware/           # Auth guarding and error-handling middlewares
│   ├── models/               # Mongoose database schemas (User, Product, Order, Cart)
│   ├── routes/               # API endpoint router files
│   ├── services/             # Third-party integrations (Cloudinary, Razorpay)
│   ├── .env.example          # Sample environment template for server
│   ├── server.js             # Main server entrypoint
│   └── package.json          # Backend dependencies and nodemon scripts
│
├── src/                      # Vite + React Frontend SPA
│   ├── components/           # Reusable UI elements (Navbar, Footer, ProductCard, etc.)
│   ├── context/              # Global state providers (ShopContext)
│   ├── layouts/              # Routing layout wrappers (RootLayout, AdminLayout)
│   ├── pages/                # Page views (Home, Products, Checkout, Admin pages)
│   ├── services/             # Axios API service instances and endpoints
│   ├── App.jsx               # React Router navigation tree
│   ├── main.jsx              # DOM entrypoint
│   └── index.css             # Design tokens and custom CSS variables
│
├── .env.production           # Production environment variables
├── eslint.config.js          # ESLint build verification profile
├── vercel.json               # SPA client-side deep routing configuration
├── package.json              # Main workspace devDependencies & root execution scripts
└── README.md                 # Project documentation
```

---

## ⚙️ Getting Started

### 📋 Prerequisites
- Ensure **Node.js** (v18+) is installed on your local machine.
- A **MongoDB Atlas** database URI or a locally running MongoDB instance.
- *(Optional)* A **Razorpay Test Account** (for generating test keys).

### 🔧 Local Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hustlerss/Shop-kart.git
   cd Shop-kart
   ```

2. **Install Workspace Dependencies**:
   Install root-level packages (Vite, ESLint, React Router):
   ```bash
   npm install
   ```
   Install backend-level packages (Express, Mongoose, JWT, Razorpay):
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the **root directory** (for the Vite frontend):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=rzp_test_SsSGz7VXN84Wv5
   ```

   Create a `.env` file inside the **`backend/` folder**:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signature_secret_key
   RAZORPAY_KEY_ID=rzp_test_SsSGz7VXN84Wv5
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Seed the Database**:
   Populate the MongoDB database with dynamic catalog items and initial users (including a default administrator):
   ```bash
   cd backend
   npm run seed
   cd ..
   ```
   *This seeds the following sample accounts:*
   * **Admin User**: `admin@shopkart.com` | Password: `adminpassword123`
   * **Standard User**: `rohan@gmail.com` | Password: `userpassword123`

5. **Start Dev Servers**:
   Run both frontend and backend development instances concurrently:
   ```bash
   # From root directory:
   npm run dev:all
   ```
   - Frontend Server will run on: [http://localhost:3000](http://localhost:3000)
   - Backend API will run on: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default Value | Required |
|---|---|---|---|
| `PORT` | Local server port | `5000` | No |
| `MONGO_URI` | Connection string for MongoDB Atlas | - | **Yes** |
| `JWT_SECRET` | Secret token signature for JWT session generation | - | **Yes** |
| `RAZORPAY_KEY_ID` | Public API Key ID for Razorpay SDK | - | No (falls back to mock sandbox) |
| `RAZORPAY_KEY_SECRET` | Private secret token for verifying payments | - | No (falls back to mock sandbox) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary asset cloud container namespace | - | No (falls back to disk storage) |
| `CLOUDINARY_API_KEY` | Public key credential for Cloudinary API | - | No (falls back to disk storage) |
| `CLOUDINARY_API_SECRET` | Secret credential for Cloudinary API | - | No (falls back to disk storage) |

### Frontend (`.env`)
| Variable | Description | Value |
|---|---|---|
| `VITE_API_URL` | Route mapping target for backend API | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID` | Public API Key used to initialize the Razorpay checkout overlay | `rzp_test_SsSGz7VXN84Wv5` |

---

## 🛣️ API Endpoints

### 🔐 Authentication & Profile (`/api/auth`)
- `POST /api/auth/register` - Create user profile and get JWT.
- `POST /api/auth/login` - Verify user credentials and return profile + JWT.
- `GET /api/auth/profile` - Get logged-in user details (Private).
- `PUT /api/auth/profile` - Update logged-in user profile (Private).

### 📦 Products Catalog (`/api/products`)
- `GET /api/products` - List all products (supports tag/search/sorting query params).
- `GET /api/products/:id` - Fetch single product specifications.
- `POST /api/products/:id/review` - Add user reviews and ratings (Private).

### 🛒 Persistent Cart (`/api/cart`)
- `GET /api/cart` - Fetch persistent cart items for logged-in user (Private).
- `POST /api/cart` - Sync temporary browser shopping cart state to MongoDB (Private).

### 💳 Checkout & Orders (`/api/orders`)
- `POST /api/orders` - Generate order receipt and create Razorpay payment order (Private).
- `POST /api/orders/verify` - Cryptographically verify payment signatures and decrement inventory stock (Private).
- `GET /api/orders/mine` - View authenticated user's order history (Private).

### 👑 Protected Admin Portal (`/api/admin`)
*(All admin routes require administrator role validation)*
- `GET /api/admin/stats` - Fetch aggregate platform statistics (Users count, Sales, Revenue charts).
- `GET /api/admin/users` - Fetch full user accounts list.
- `DELETE /api/admin/users/:id` - Remove user from platform.
- `GET /api/admin/orders` - Audit full transaction histories.
- `PUT /api/admin/orders/:id` - Update shipping and delivery statuses (`Processing`, `Shipped`, `Delivered`).
- `POST /api/admin/products` - Create new items with image attachments.
- `PUT /api/admin/products/:id` - Update existing product parameters.
- `DELETE /api/admin/products/:id` - Remove product from store catalog.

---

## 🎨 Design & Styling Principles
ShopKart embraces modern, visual web layouts:
- **Google Fonts**: Loaded with the contemporary serif header look alongside `Outfit` for body text.
- **Glassmorphism**: Elegant transparent headers, modern floating menus, card borders, and smooth shadows.
- **Tailwind CSS Utility Design**: Pure vanilla CSS styles alongside Tailwind CSS utilities for seamless rendering across devices.
- **Responsive Layout**: Designed mobile-first to translate beautifully onto smaller device screens.

---

## 🚀 Deployment Instructions

### 🔗 Frontend Deployment (Vercel)
1. Link your GitHub repository in your Vercel Dashboard.
2. Ensure the build configuration is:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure the following environment variables:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = `rzp_test_SsSGz7VXN84Wv5`

### 🔗 Backend Deployment (Render)
1. Add a new **Web Service** pointing to your repository on Render.
2. Set the **Root Directory** field to `backend`.
3. Set the **Build Command** to `npm install`.
4. Set the **Start Command** to `npm start` (or `node server.js`).
5. Configure your environmental variables (`MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in the Environment dashboard.
