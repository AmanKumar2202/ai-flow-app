# ⬡ AI Flow

A full-stack AI prompt visualizer built with MongoDB, Express, React, Node.js, React Flow, and OpenRouter.

Type a prompt into a node, hit Run, and see the AI's response appear in a connected result node — all visualized as a live flow chart.

---

## 📁 Project Structure

```
ai-flow-app/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json       # Backend dependencies
│   └── .env               # Your secret keys
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js          # Main React component + theme toggle
    │   ├── App.css         # All styles (dark + light theme)
    │   ├── FlowNodes.js    # Custom Input and Result node components
    │   └── index.js        # React entry point
    └── package.json        # Frontend dependencies
```

---

## ✅ Prerequisites

Make sure you have these installed before starting:

| Tool | Version | Check with |
| Node.js | v18 or higher | `node -v` |
| npm | v8 or higher | `npm -v` |
| MongoDB | Running locally | `mongod --version` |

> **Don't have MongoDB?** Install it from https://www.mongodb.com/try/download/community  
> After installing, start it with: `mongod` (keep this terminal open)

---

## 🔑 Step 1 — Get Your OpenRouter API Key

The app uses OpenRouter to call the AI. It's free.

1. Go to **https://openrouter.ai** and create an account
2. Navigate to **Keys** → click **Create Key**
3. Copy your key — it looks like `sk-or-v1-xxxxxxxx...`
4. The app uses `nvidia/nemotron-3-super-120b-a12b:free` — completely free, no billing needed

---

## ⚙️ Step 2 — Set Up the Backend

Open a terminal and run the following:

```bash
# 1. Go into the backend folder
cd ai-flow-app/backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Now open the `.env` file and fill in your values:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MONGODB_URI=mongodb://localhost:27017/aiflow
PORT=5000
```

Then start the backend server:

```bash
node server.js
```

You should see:

```
MongoDB connected
Server running on port 5000
```

> Keep this terminal open. The backend must stay running while you use the app.

---

## 🎨 Step 3 — Set Up the Frontend

Open a **second terminal** (keep the backend running in the first one):

```bash
# 1. Go into the frontend folder
cd ai-flow-app/frontend

# 2. Install dependencies
npm install

# 3. Start the React app
npm start
```

Your browser will automatically open at **http://localhost:3000**

---

## 🚀 Running the App (Quick Reference)

Every time you want to use the app, you need **two terminals open**:

**Terminal 1 — Backend**
```bash
cd ai-flow-app/backend
node server.js
```

**Terminal 2 — Frontend**
```bash
cd ai-flow-app/frontend
npm start
```

Then open **http://localhost:3000** in your browser.

---

## 🧠 How to Use the App

### Basic Flow
1. The app loads with one **Prompt Node** and one **Response Node** connected by an arrow
2. Click inside the **Prompt Node** and type your question
3. Click **▶ Run** inside the node
4. Watch the AI's answer appear in the **Response Node**

### Adding More Nodes
- Click **+ Add Node** in the top-right header
- A new prompt/response pair appears on the canvas below the existing ones
- Each pair runs independently — you can have multiple conversations on the same canvas

### Saving to Database
- After running a prompt, click **⬡ Save** inside the node
- The prompt and response are saved to your local MongoDB database

### Viewing History
- Click **History** in the header
- A panel slides in showing your last 20 saved conversations

### Switching Themes
- Click **☀** in the header to switch to light mode
- Click **☾** to switch back to dark mode

---

## 🔌 API Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/api/ask-ai` | Sends your prompt to OpenRouter, returns AI response |
| `POST` | `/api/save` | Saves a prompt + response pair to MongoDB |
| `GET` | `/api/history` | Returns the last 20 saved flows |

---

## 🐛 Common Issues

**MongoDB connection error**
```
❌ MongoDB error: connect ECONNREFUSED 127.0.0.1:27017
```
MongoDB isn't running. Start it with:
```bash
mongod
```

**OpenRouter API error**
```
AI API error: No auth credentials found
```
Your `OPENROUTER_API_KEY` in `.env` is missing or incorrect. Double-check it.

**Frontend can't reach backend**
Make sure both servers are running and that `frontend/package.json` has:
```json
"proxy": "http://localhost:5000"
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| Frontend UI | React 18 |
| Flow visualization | React Flow |
| Backend server | Node.js + Express |
| AI responses | OpenRouter (Gemini Flash — free) |
| Database | MongoDB + Mongoose |
| Styling | Plain CSS with CSS variables (supports dark + light theme) |
