# 🔐 Malicious URL Detection System

URL_Analyzer is a cybersecurity-focused web application designed to detect and analyze potentially malicious or phishing URLs. It provides real-time scanning, threat classification, and confidence scoring to help users stay safe online.

---

## 🚀 Features

* 🔍 **URL Scanning Engine**

  * Analyze URLs for phishing or malicious behavior

* 📊 **Threat Detection System**

  * Classifies URLs as Safe / Suspicious / Malicious

* 📈 **Confidence Meter**

  * Displays probability score of threat detection

* 🧠 **Machine Learning Integration (Pluggable)**

  * Supports ML-based URL classification

* 🗂 **Scan History Tracking**

  * Keeps record of previously scanned URLs

* ⚡ **Fast Frontend UI**

  * Built with modern frameworks for performance

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS

### Backend / API

* Node.js
* Serverless API (Vercel / custom API)

### Other Tools

* Drizzle ORM
* PostCSS
* Vercel Deployment

---

## 📁 Project Structure

```
URL_Analyzer/
│── client/          # Frontend application
│── api/             # Backend API (URL scanning logic)
│── archive/         # Dataset (Phishing URLs)
│── components/      # UI components
│── config files     # Tailwind, Vite, TypeScript configs
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/https://github.com/DarkUser7/URL_Analyzer.git
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Run Development Server

```bash
npm run dev
```

---

### 4. Open in Browser

```
http://localhost:5173
```

---

## 🔬 How It Works

1. User enters a URL
2. System extracts features
3. Backend analyzes URL patterns / dataset
4. Result is classified:

   * Safe ✅
   * Suspicious ⚠️
   * Malicious ❌
5. Confidence score is displayed

---

## 📊 Dataset

* Includes phishing URL dataset (`Phishing URLs.csv`)
* Can be extended with real-time threat intelligence

---

## 🚧 Future Improvements

* 🔗 Integration with VirusTotal API
* 🤖 Advanced ML model (Random Forest / Deep Learning)
* 🌐 Browser Extension version
* 🔐 User authentication & dashboard

---

