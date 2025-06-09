const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const AdmZip = require('adm-zip');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// In-memory job log storage
const jobs = {};
const clients = {};

// Helper: send log to all SSE clients for a job
function sendLog(jobId, data) {
  if (clients[jobId]) {
    clients[jobId].forEach(res => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}

// POST /deploy: Accept deployment requests
app.post('/deploy', async (req, res) => {
  const { repoUrl, target } = req.body;
  if (!repoUrl || !target) {
    return res.status(400).json({ error: 'repoUrl and target are required' });
  }

  const jobId = uuidv4();
  jobs[jobId] = [];

  // Create a temp directory for this job
  const tmpDir = path.join(__dirname, 'tmp', jobId);
  fs.mkdirSync(tmpDir, { recursive: true });

  // Start deployment in background
  (async () => {
    function log(line) {
      jobs[jobId].push(line);
      sendLog(jobId, { line });
    }
    try {
      log(`Starting deployment for ${repoUrl} to ${target}`);
      // Only clone/pull repo and run deploy.sh
      const repoName = path.basename(repoUrl, '.git');
      const repoPath = path.join(tmpDir, repoName);
      if (!fs.existsSync(repoPath)) {
        log('Cloning repository...');
        await runCmd('git', ['clone', repoUrl], tmpDir, log);
      } else {
        log('Pulling latest changes...');
        await runCmd('git', ['pull'], repoPath, log);
      }
      // Run deploy.sh
      log('Starting deployment script...');
      await runCmd('sh', [path.resolve(__dirname, '../deploy.sh')], repoPath, log);
      log('Deployment finished successfully.');
    } catch (err) {
      log(`ERROR: ${err.message}`);
    } finally {
      log('Deployment job complete.');
    }
  })();

  res.json({ jobId });
});

// GET /logs: Real-time log streaming via SSE
app.get('/logs', (req, res) => {
  const jobId = req.query.jobId;
  if (!jobId || !jobs[jobId]) {
    return res.status(404).send('Invalid jobId');
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send existing logs
  jobs[jobId].forEach(line => {
    res.write(`data: ${JSON.stringify({ line })}\n\n`);
  });

  // Register client
  if (!clients[jobId]) clients[jobId] = [];
  clients[jobId].push(res);

  req.on('close', () => {
    clients[jobId] = clients[jobId].filter(r => r !== res);
  });
});

// GET /github-logs?repo=owner/repo&branch=main
app.get('/github-logs', async (req, res) => {
  const { repo, branch = 'main' } = req.query;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    return res.status(400).json({ error: 'repo and GITHUB_TOKEN required' });
  }
  try {
    // 1. Find the latest workflow run for the branch
    const runsUrl = `https://api.github.com/repos/${repo}/actions/runs?branch=${branch}&per_page=1`;
    const runsResp = await axios.get(runsUrl, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'autodevops-platform' }
    });
    if (!runsResp.data.workflow_runs.length) {
      return res.status(404).json({ error: 'No workflow runs found' });
    }
    const run = runsResp.data.workflow_runs[0];
    // 2. Poll until the run is completed (max 2 min)
    let status = run.status;
    let conclusion = run.conclusion;
    let pollCount = 0;
    while (status !== 'completed' && pollCount < 24) {
      await new Promise(r => setTimeout(r, 5000));
      const pollResp = await axios.get(`https://api.github.com/repos/${repo}/actions/runs/${run.id}`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'autodevops-platform' }
      });
      status = pollResp.data.status;
      conclusion = pollResp.data.conclusion;
      pollCount++;
    }
    if (status !== 'completed') {
      return res.status(202).json({ error: 'Workflow run not completed yet' });
    }
    // 3. Download the logs archive
    const logsResp = await axios.get(`https://api.github.com/repos/${repo}/actions/runs/${run.id}/logs`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'autodevops-platform' },
      responseType: 'arraybuffer'
    });
    // 4. Extract and concatenate all log files
    const zip = new AdmZip(logsResp.data);
    const entries = zip.getEntries();
    let allLogs = '';
    entries.forEach(entry => {
      if (!entry.isDirectory && entry.entryName.endsWith('.txt')) {
        allLogs += `\n--- ${entry.entryName} ---\n`;
        allLogs += zip.readAsText(entry);
      }
    });
    res.setHeader('Content-Type', 'text/plain');
    res.send(allLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: run a command and stream output
function runCmd(cmd, args, cwd, log) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: process.platform === 'win32' });
    child.stdout.on('data', data => log(data.toString().trim()));
    child.stderr.on('data', data => log(data.toString().trim()));
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on('error', err => reject(err));
  });
}

app.listen(PORT, () => {
  console.log(`Express backend listening on port ${PORT}`);
}); 