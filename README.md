# Document Management System 


## 👥 Team
- Your Name – Utsav Lakhani
- Teammate 1 – Dhaval Solanki
- Teammate 2 – Anish Shah
- Teammate 3 – Dhrumil Vaghela

## 🏆 Hackathon Details
- Event: Hackovate
- Track: AI / Responsible Tech


## 📌 Project Overview
This project is a *content moderation system* designed to automatically detect and filter *NSFW (Not Safe For Work)* text and images.  
It helps platforms maintain a safe environment by preventing inappropriate content from being uploaded or displayed.  

Built for *hackathons*, the system is lightweight, extendable, and easy to integrate with any web or mobile application.

---



## ⚡ Features
- 📝 *Text Moderation* – Detects offensive, abusive, or adult content in text.
- 🖼 *Image Moderation* – Identifies NSFW or explicit content in uploaded images.
- ⚙ *REST API* – Exposes moderation endpoints for integration with frontends.
- 🎨 *Frontend Integration* – Demo frontend with Axios for text/image checks.
- 📊 *Scalable* – Can be extended with advanced ML models or external APIs.

---

## 🏗 Tech Stack
- *Frontend:* React.js (with Axios for API calls)  
- *Backend:* FastAPI (Python)  
- *Machine Learning / Models:*  
  - Pre-trained NSFW detection models (e.g., nsfw_model for images)  
  - Text classification filters (for bad/offensive words detection)  
- *Database (Optional):* SQLite / MongoDB (for logs & analytics)  
- *Deployment:* Docker / Localhost (for hackathon demo)

---

## 🔌 API Endpoints

### 1️⃣ Text Moderation
POST /moderate-text  
*Body (FormData):*
json
{
  "text": "Some input text to check"
}


### Response
json
{
  "status": "flagged",
  "category": "offensive"
}


### 2️⃣ Image Moderation
POST /moderate-image  
*Body (FormData):*
json
{
  "file": "image.png"
}


### Response
json
{
  "status": "safe",
  "confidence": 0.92
}


## 🚀 Installation & Setup
### 🔧 Backend (FastAPI)
#### Clone the repo
- 1. git clone https://github.com/yourusername/nsfw-moderation.git
- 2. cd nsfw-moderation

#### Create virtual environment
- 1. python -m venv venv
- 2. source venv/bin/activate   # (Linux/Mac)
- 3. venv\Scripts\activate      # (Windows)

#### Install dependencies
- 1. ip install -r requirements.txt

#### Run server
- 1. uvicorn main:app --reload

## 🎨 Frontend (React)
- cd frontend
- npm install
- npm start

## 🧪 Usage
- Open the frontend app.
- Enter text or upload an image.
- The app sends data to FastAPI backend.
- Backend checks if content is Safe / NSFW.
- Response is shown instantly.

## 🎯 Future Scope
- 🌍 Multi-language support for text moderation
- 🔍 Real-time video content moderation
- 📊 Admin dashboard for flagged content analytics
- 🤖 Fine-tuned AI models for higher accuracy


## 📜 License
---

👉 This README is *plug-and-play*. You’ll just need to:  
- Change *repo link*  
- Update *hackathon name & team members*  
- Add any *specific models/APIs* you’re using  

Would you like me to also prepare a *short version* of this README (1-page style), so you can paste it directly in your hackathon submission form without the long details?

- Duration: 24/48 hrs
- Project Type: MVP (Minimum Viable Product)
