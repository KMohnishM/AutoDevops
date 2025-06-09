# AutoDevOps Platform

A modern, beautiful platform to deploy your apps with one click, see real-time logs, and fetch GitHub Actions CI/CD logs—all from a single web UI.

---

## 🚀 Features
- **DeployForm:** Enter your GitHub repo and deployment target, trigger deployment instantly.
- **Real-time Logs:** Watch your deployment logs live as your app is deployed.
- **GitHub Actions Logs:** Fetch and view the full CI/CD logs from your latest GitHub Actions workflow run.
- **Modern UI:** Responsive, beautiful, and easy to use.

---

## 🏗️ Project Structure
```
AutoDevops/
  backend/           # Express backend (API, log streaming, GitHub logs)
  components/        # React components (DeployForm, LogViewer)
  pages/             # Next.js pages (main UI)
  styles/            # CSS modules for styling
  ...
```

---

## ⚙️ Setup & Installation

### 1. **Clone the repo**
```sh
git clone https://github.com/KMohnishM/AutoDevops.git
cd AutoDevops
```

### 2. **Install frontend dependencies**
```sh
npm install
```

### 3. **Setup backend**
```sh
cd backend
npm install
```

### 4. **Set your GitHub token**
- Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` and `actions` scopes.
- Export it before starting the backend:
```sh
export GITHUB_TOKEN=your_token_here
npm start
```

### 5. **Start the frontend**
```sh
cd ..
npm run dev
```

---

## 🌐 Usage
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Sign in (if required).
3. Enter your GitHub repo URL and select a deployment target.
4. Click **Deploy** to trigger deployment.
5. Watch real-time logs as your app is deployed.
6. Click **Show GitHub Actions Logs** to fetch and view the full CI/CD logs from your latest workflow run.

---

## 🔑 Environment Variables
- `GITHUB_TOKEN` (required for backend): Your GitHub Personal Access Token.

---

## 📝 Notes
- The backend only triggers your `deploy.sh` and streams its output.
- GitHub Actions logs are fetched after the workflow run completes (not real-time).
- Make sure your repo and branch names are correct in the UI.
- For private repos, your token must have access.

---

## 📦 Tech Stack
- **Frontend:** Next.js, React, CSS Modules
- **Backend:** Express, Node.js, SSE, Axios, AdmZip
- **CI/CD:** GitHub Actions

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE)