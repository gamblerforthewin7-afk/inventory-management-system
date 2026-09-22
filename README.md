# ApexInventory — Enterprise Inventory Management System

A production-grade, enterprise-oriented **Inventory Management System (IMS)** built with **React, TypeScript, Vite, Tailwind CSS, Netlify Functions**, and **MySQL**. Designed with a strict **Black & Red** visual identity.

![Theme Identity](https://img.shields.io/badge/Theme-Black%20%26%20Red-red)
![Platform](https://img.shields.io/badge/Hosting-Netlify-00C7B7)
![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-blue)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1)

---

## 🌟 Visual Theme & Design Identity

- **Dominant Base**: Dark Black (`#09090B`, `#121215`, `#18181B`) for page canvas, header, sidebar, cards, and data tables.
- **Primary Accent**: Crimson Red (`#DC2626`, `#EF4444`) for primary call-to-action buttons, active navigation indicators, low-stock warning banners, and key stat badges.
- **Typography & Contrast**: Crisp white headings (`#FFFFFF`) and zinc secondary text (`#A1A1AA`). High contrast, technical, and clean interface.

---

## 🔑 Demo Accounts (Zero-Config Preview)

The application includes an in-memory & stateful `localStorage` demo service layer, enabling instant testing without requiring an immediate MySQL database connection.

| Persona / Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@inventory.com` | `password123` | Full access: Products, Stock Tracking, Suppliers, POs, Analytics, User Role Management, System Settings. |
| **Inventory Manager** | `manager@inventory.com` | `password123` | Full access to Products, Stock Adjustments, Suppliers, PO Creation/Approval, and Analytics. |
| **Warehouse Staff** | `staff@inventory.com` | `password123` | Stock level viewing, stock-in / stock-out adjustments, viewing reorder alerts. |

> **Tip**: Click any of the **1-Click Demo Persona buttons** on the Login screen or use the **Role Switcher** in the top navigation bar to switch roles instantly!

---

## 🚀 Deploying to Netlify

Follow these step-by-step instructions to deploy this project to **Netlify**:

### Step 1: Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com).
2. Push your project code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Enterprise IMS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/inventory-management-system.git
   git push -u origin main
   ```

### Step 2: Import Project in Netlify
1. Log in to [Netlify App](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and authorize Netlify to access your repository.
4. Select your `inventory-management-system` repository.

### Step 3: Configure Build & Publish Settings
Netlify will automatically read `netlify.toml`, but verify these settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### Step 4: Configure Environment Variables in Netlify
In Netlify Dashboard:
1. Navigate to **Site configuration** → **Environment variables**.
2. Add your external MySQL database credentials:
   - `DB_HOST`: Your hosted MySQL database hostname (e.g., Aiven, PlanetScale, Railway, AWS RDS)
   - `DB_PORT`: `3306`
   - `DB_NAME`: `inventory_db`
   - `DB_USER`: `your_database_user`
   - `DB_PASSWORD`: `your_database_password`
   - `VITE_USE_LIVE_API`: `true`

### Step 5: Deploy & Verify
1. Click **Deploy site**.
2. Netlify will build the Vite frontend and bundle the serverless API functions.
3. Test direct route access (e.g. `https://your-site.netlify.app/products` or `/inventory`). The SPA redirect rule in `netlify.toml` and `public/_redirects` ensures zero 404 errors!

---

## 🗄️ Database Setup (MySQL Integration)

1. Provision a MySQL 8.0+ instance on your cloud host (e.g., Aiven, Railway, AWS RDS, PlanetScale).
2. Execute the DDL schema file to initialize tables, constraints, foreign keys, and indexes:
   ```bash
   mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p < database/schema.sql
   ```
3. Insert initial realistic seed data:
   ```bash
   mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p < database/seed.sql
   ```

### Entity Hierarchy preserved from PPT Requirements:
- **Users**: RBAC roles (`admin`, `manager`, `staff`).
- **Categories**: Taxonomies (`IND-MACH`, `ELEC-COMP`, `RAW-MAT`, `SAFE-PPE`, `HYD-PNEU`).
- **Suppliers**: Lead times, contact info, ratings.
- **Products**: SKUs, costs, prices, location bins, reorder rules.
- **Inventory**: Real-time stock counts, reserved allocations, low-stock status views.
- **PurchaseOrders & OrderDetails**: Procurement headers, multi-item order details, 1-click PO receipt stock sync.
- **StockLogs**: Immutable audit log for stock-in, stock-out, and PO receipts.

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build & Preview Production Bundle
```bash
npm run build
npm run preview
```

---

## 📁 Deliverable Project Structure

```
inventory-management-system/
├── public/
│   ├── favicon.svg
│   └── _redirects              # SPA routing fallback for Netlify
├── src/
│   ├── components/
│   │   ├── common/             # Badge, StatCard, Modal, DataTable
│   │   └── layout/             # Navbar, Sidebar, MainLayout
│   ├── context/
│   │   └── AuthContext.tsx     # Role-based access control & demo switcher
│   ├── pages/
│   │   ├── Dashboard.tsx       # Executive KPIs & Recharts visualization
│   │   ├── Products.tsx        # Product catalog & SKU management
│   │   ├── Inventory.tsx       # Stock tracking & audit logs
│   │   ├── Suppliers.tsx       # Vendor directory & lead times
│   │   ├── PurchaseOrders.tsx  # PO creation & 1-click receipt
│   │   ├── Reports.tsx         # Valuation analytics & CSV exporter
│   │   ├── Users.tsx           # User role assignment (Admin)
│   │   ├── Settings.tsx        # Thresholds & architecture info
│   │   └── Login.tsx           # Black & Red theme sign-in
│   ├── services/
│   │   ├── api.ts              # Service layer (Demo fallback + Live Netlify Functions)
│   │   └── mockData.ts         # Stateful demo dataset
│   ├── types/
│   │   └── index.ts            # TypeScript entity interfaces
│   ├── App.tsx
│   ├── index.css               # Black & Red theme styling
│   └── main.tsx
├── netlify/
│   └── functions/              # Netlify Serverless API endpoints
│       ├── db.ts               # MySQL connection handler
│       ├── auth.ts
│       ├── products.ts
│       ├── inventory.ts
│       ├── suppliers.ts
│       ├── purchase-orders.ts
│       └── reports.ts
├── database/
│   ├── schema.sql              # MySQL DDL schema
│   └── seed.sql                # Seed data script
├── netlify.toml                # Netlify deployment manifest
├── .env.example                # Environment variable placeholders
├── package.json
└── vite.config.ts
```
