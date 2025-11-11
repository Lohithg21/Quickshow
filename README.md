 QuickShow – Online Movie Ticket Booking Platform

QuickShow is a **full-stack movie booking web application** that allows users to browse movies currently playing in theatres, book seats for specific shows, and manage their bookings.  
Admins can add new movies, set showtimes, and manage pricing — all through an elegant dashboard.  

Built using **React.js**, **Node.js**, **Express**, and **MongoDB**, with **Clerk Authentication** for secure user login and **TMDB API** integration for live movie data.

---

## Features

### For Users
- Browse **Now Playing Movies** fetched live from **TMDB API**  
- View detailed movie information (poster, description, genre, release date, etc.)  
- Check **available showtimes** and book preferred seats  
- View and manage **your bookings** easily  

### For Admins
- **Admin dashboard** for managing movies and shows  
- Add, edit, and remove showtimes with pricing  
- View all user bookings in tabular format  
- Secure **role-based access** (Admins only)  

### Technical Highlights
- **Frontend:** React.js (Vite) + TailwindCSS  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose ODM)  
- **Authentication:** Clerk (secure JWT-based auth)  
- **API Integration:** TMDB API for live movie data  
- **Deployment Ready:** Works with Render / Vercel / Railway  

---

## Project Architecture

QuickShow-main/
│
├── frontend/ # React + Vite app
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # App pages (Home, Movies, Bookings, Admin)
│ │ ├── context/ # Global App Context (Auth, Movies, etc.)
│ │ └── App.jsx
│ └── package.json
│
├── server/ # Express backend
│ ├── controllers/ # Logic for API endpoints
│ ├── models/ # Mongoose schemas (Movie, Show, Booking)
│ ├── middleware/ # Clerk & admin authentication
│ ├── routes/ # Express routes (user, admin, show)
│ ├── server.js # Entry point
│ ├── .env # Environment variables
│ └── package.json
│
└── README.md

---

Future Improvements

-Add seat layout with real-time availability
-Integrate Razorpay or Stripe for payments
-Add support for multiple cities/theatres
-Implement email confirmations for bookings
-Make fully responsive with PWA support
