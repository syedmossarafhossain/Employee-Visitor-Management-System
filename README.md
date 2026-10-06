# Employee Visitor Management System

MERN full-stack Employee Visitor Management System with:

Deploy Link: https://employee-visitor-management-system.vercel.app/

- React + Vite frontend
- Node.js + Express backend
- MongoDB / Mongoose
- Email/password registration and login
- JWT authentication
- Google OAuth login
- Role-based access control
- Admin-only visitor add/edit/status/delete operations
- Employee view/search-only access

## Folder structure

```text
employee-visitor-management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
└── backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── utils/
    ├── .env.example
    └── package.json
```

## 1. Backend setup

```powershell
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=your-admin-email@gmail.com
GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
```

The email in `ADMIN_EMAIL` receives the `admin` role when it registers or logs in. All other registered accounts receive the `employee` role.

## 2. Google OAuth setup

In Google Cloud Console:

1. Create/select a Google Cloud project.
2. Configure the OAuth consent screen.
3. Create an OAuth Client ID for a **Web application**.
4. Add this Authorized JavaScript origin:

```text
http://localhost:5173
```

5. Put the generated Web Client ID in both:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

For production, add your production frontend domain to the Google authorized origins.

## 3. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
```

## 4. Run

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Access rules

| Action | Admin | Employee |
|---|---:|---:|
| Register/Login | Yes | Yes |
| Google Login | Yes | Yes |
| View visitors | Yes | Yes |
| Search visitors | Yes | Yes |
| Add visitor | Yes | No |
| Edit visitor | Yes | No |
| Check In/Out | Yes | No |
| Delete visitor | Yes | No |

The access rules are enforced by Express middleware, so an employee cannot bypass the UI and modify records by calling the API directly.
