# 3D Anomaly Detection — Web App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/talha-sattar/3D-Anomaly-Detection---Web-App)](https://github.com/talha-sattar/3D-Anomaly-Detection---Web-App/stargazers)

## 🚀 Overview

**3D Anomaly Detection — Web App** is an interactive web application for detecting anomalies in 3D data (such as point clouds or depth images).  
This project combines modern deep learning techniques with a user-friendly interface, allowing researchers and practitioners to visualize, process, and analyze 3D anomalies directly from their browser.

## ✨ Features

- **3D Data Upload:** Upload and preview 3D files for analysis.
- **State-of-the-Art Inference:** Run anomaly detection models (PyTorch/TensorFlow supported).
- **Visualization:** Interactive 3D rendering of input data and detected anomalies.
- **Dataset Showcase:** Explore example datasets directly in the app.
- **Results Download:** Export detection results, reports, and visualizations.
- **Responsive UI:** Built with Next.js, React, and Tailwind CSS for a smooth experience.

## 🖼️ Screenshots

<!-- Uncomment and add images if available
![App Screenshot 1](screenshots/screenshot1.png)
![App Screenshot 2](screenshots/screenshot2.png)
-->

## 📦 Folder Structure

3D-Anomaly-Detection---Web-App/
├── app/ # Main web application (Next.js)
├── components/ # Reusable React components
├── hooks/ # Custom React hooks
├── lib/ # Utility functions & libraries
├── models/ # (Optional) Pretrained or custom models
├── public/ # Static assets (images, icons, etc.)
├── styles/ # CSS/Tailwind files
├── utils/ # Python utility scripts
├── datasets/ # (Optional) Example/test datasets
├── checkpoints/ # (Optional) Model checkpoints (ignored by default)
├── app.py, infer.py # Core backend scripts for inference
├── package.json # Node.js dependencies
├── requirements.txt # Python dependencies (if any)
├── .gitignore
└── README.md


## 🛠️ Tech Stack

- **Frontend:** Next.js, React, CSS
- **Backend:** Python, FastAPI/Flask
- **3D Visualization:** Three.js, React Three Fiber
- **Deep Learning:** PyTorch / TensorFlow

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/talha-sattar/3D-Anomaly-Detection---Web-App.git
cd 3D-Anomaly-Detection---Web-App
```
## 2. Install Dependencies

**Node.js dependencies**
```bash
npm install
```

**Python dependencies**

```bash
pip install -r requirements.txt
```
## 3. Run the Web App
Frontend (Next.js)

```bash
npm run dev
```
Backend (Inference API)

```bash
python app.py
```
⚙️ Note: Configure the backend URL in the frontend if running separately.

## 4. Open in Browser
Visit: http://localhost:3000
