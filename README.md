# Coaching Institute ERP App

A free-cost MERN-style MVP for a coaching institute ERP based on the uploaded prompt.

## What is included
- Role-based login: admin, teacher, student, parent
- Admin dashboard
- Teacher dashboard
- Student/parent dashboard
- Class management
- Student and teacher management
- Subject and timetable management
- Attendance
- Marks
- Fees
- Notices / notifications
- ERP assistant endpoint that follows your uploaded prompt rules

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB + JWT

## Free deployment options
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas Free

## Important note
This is a strong MVP and starter project. It is not a giant enterprise ERP with every possible edge case already finished.
You can run it locally, extend it, and deploy it free for a demo or college project.

## Folder structure
- `backend/` - Express API
- `frontend/` - React app

## Quick start

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Default seeded users
After running `npm run seed` in backend:

- Admin: `admin@erp.com` / `Admin@123`
- Teacher: `teacher@erp.com` / `Teacher@123`
- Student: `student@erp.com` / `Student@123`
- Parent: `parent@erp.com` / `Parent@123`

## Backend URL
Default backend: `http://localhost:5000`

## Frontend URL
Default frontend: `http://localhost:5173`

## Deployment notes
### Backend env
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

### Frontend env
- `VITE_API_URL`

## Future upgrades
- Password reset via email API
- Excel export / PDF reports
- Fine-grained permissions
- SMS / WhatsApp reminders
- File attachments
- Real charts and analytics widgets
