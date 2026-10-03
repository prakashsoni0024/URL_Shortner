# URL Shortner

A simple **full-stack URL Shortener** that turns long URLs into short, shareable links.

Because apparently URLs also need to lose weight.

## Features

- Shorten long URLs
- Fast URL redirection
- MongoDB-based URL storage
- Frontend ↔ Backend communication using Proxy
- Separate frontend and backend

## Tech Stack

**Frontend**
- React
- JavaScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Other**
- REST API
- Proxy Configuration
- Git & GitHub

## Project Structure

    URL_Shortner/
    ├── frontend/
    ├── backend/
    └── README.md

## Run Locally

### Clone

    git clone https://github.com/prakashsoni0024/URL_Shortner.git
    cd URL_Shortner

### Frontend

    cd frontend
    npm install
    npm run dev

### Backend

Open another terminal:

    cd backend
    npm install
    npm run dev

That's it. No 47-step setup guide. Just `npm run dev` and hope the dependencies behave.

## How It Works

    Long URL
       ↓
    Frontend
       ↓
    Proxy
       ↓
    Backend API
       ↓
    MongoDB
       ↓
    Short URL
       ↓
    Redirect

The frontend communicates with the backend through a **proxy setup**, keeping development simple without a separate CORS configuration.

## Future Improvements

- User authentication
- URL click analytics
- URL expiration
- Custom short URLs
- User dashboard

## Author

**Prakash Soni**  
Full-Stack Developer

[GitHub](https://github.com/prakashsoni0024)

---

If you like the project, give it a star.

If you don't... well, the URL is already short enough.