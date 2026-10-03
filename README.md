# 🔗 URL Shortner

A simple **full-stack URL Shortener** that turns unnecessarily long URLs into short, shareable links.

Because apparently URLs also need to lose weight. 💀

## ✨ Features

- Shorten long URLs
- Fast URL redirection
- Easy copy and share of short URLs
- MongoDB-based URL storage
- Frontend ↔ Backend communication using **Proxy**
- Separate frontend and backend
- Simple development setup

## 🛠️ Tech Stack

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

## 📁 Project Structure

    URL_Shortner/
    ├── frontend/
    ├── backend/
    └── README.md

## 🚀 Run Locally

### Clone the Repository

    git clone https://github.com/prakashsoni0024/URL_Shortner.git
    cd URL_Shortner

### Frontend

Open a terminal and run:

    cd frontend
    npm install
    npm run dev

### Backend

Open another terminal and run:

    cd backend
    npm install
    npm run dev

That's it.

No 47-step setup guide.  
No ancient ritual.  
Just `npm run dev` and pray the dependencies behave. 🙏

## 🔄 How It Works

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

The frontend communicates with the backend through a **proxy setup**, keeping development simple without requiring a separate CORS configuration.

## 🎯 Why I Built This

Built this project to understand how a real-world **frontend + backend + database** application works together.

Also because copying 200-character URLs is character development nobody asked for.

## 🔮 Future Improvements

- User authentication
- URL click analytics
- URL expiration
- Custom short URLs
- Better mobile UI
- User dashboard

## 👨‍💻 Author

**Prakash Soni**  
Full-Stack Developer

[GitHub Profile](https://github.com/prakashsoni0024)

---

⭐ If you like the project, give it a star.

If you don't... well, the URL is already short enough. 😌