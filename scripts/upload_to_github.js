/**
 * EduQuery AI 2.0 - GitHub Direct Uploader Script
 * 
 * Allows committing and pushing the complete project directly to GitHub
 * via GitHub REST API without requiring Git to be installed locally.
 * 
 * Usage:
 *   node scripts/upload_to_github.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');

// Ignored files and folders (strict security filter)
const IGNORED_PATTERNS = [
  /node_modules/,
  /\.next/,
  /(^|\/|\\)\.env($|\..*)/,
  /\.git($|\/|\\)/,
  /\.DS_Store/,
  /Thumbs\.db/,
  /dist/,
  /build/,
  /coverage/,
  /\.log$/,
];

function isIgnored(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  // Allow .env.example files
  if (normalized.endsWith('.env.example')) {
    return false;
  }
  return IGNORED_PATTERNS.some((pattern) => pattern.test(normalized));
}

function getAllFiles(dir, baseDir = dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (isIgnored(relPath)) continue;

    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else {
      files.push({
        fullPath,
        relPath: relPath.replace(/\\/g, '/'),
      });
    }
  }
  return files;
}

function githubRequest({ token, method, path: reqPath, body }) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: reqPath,
        method: method || 'GET',
        headers: {
          'User-Agent': 'EduQuery-AI-Uploader',
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
        },
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(resBody || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.message || `GitHub API returned HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${resBody}`));
          }
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('====================================================');
  console.log('  EDUQUERY AI 2.0 - DIRECT GITHUB PROJECT UPLOADER  ');
  console.log('====================================================\n');
  console.log('This script uploads your project to GitHub without needing Git installed.\n');

  try {
    const owner = (await question('Enter your GitHub Username (or Org name): ')).trim();
    const repo = (await question('Enter the GitHub Repository Name: ')).trim();
    const token = (await question('Enter your GitHub Personal Access Token (classic with repo scope or fine-grained): ')).trim();
    const branch = ((await question('Target Branch [default: main]: ')).trim()) || 'main';
    const commitMsg = ((await question('Commit Message [default: Initial commit - EduQuery AI 2.0]: ')).trim()) || 'Initial commit - EduQuery AI 2.0';

    if (!owner || !repo || !token) {
      console.error('\n❌ Error: Username, Repo, and Token are required.');
      rl.close();
      return;
    }

    console.log('\n🔍 Scanning project files (excluding node_modules, .env, and build artifacts)...');
    const filesToUpload = getAllFiles(ROOT_DIR);
    console.log(`Found ${filesToUpload.length} project files ready for upload.\n`);

    // Verify repository exists
    console.log(`Checking repository https://github.com/${owner}/${repo}...`);
    let repoInfo;
    try {
      repoInfo = await githubRequest({ token, reqPath: `/repos/${owner}/${repo}` });
      console.log(`Repository found: ${repoInfo.full_name}`);
    } catch (err) {
      console.log(`Repository not found. Attempting to create repo "${repo}" under ${owner}...`);
      repoInfo = await githubRequest({
        token,
        method: 'POST',
        path: '/user/repos',
        body: { name: repo, private: false, auto_init: true },
      });
      console.log(`Repository created: ${repoInfo.full_name}`);
    }

    // Upload blobs in parallel batches
    console.log('\nUploading file blobs to GitHub...');
    const treeItems = [];
    let completed = 0;

    for (const file of filesToUpload) {
      const content = fs.readFileSync(file.fullPath);
      const isBinary = /[\x00-\x08\x0E-\x1F]/.test(content.slice(0, 512).toString('binary'));

      const blobRes = await githubRequest({
        token,
        method: 'POST',
        path: `/repos/${owner}/${repo}/git/blobs`,
        body: {
          content: content.toString(isBinary ? 'base64' : 'utf-8'),
          encoding: isBinary ? 'base64' : 'utf-8',
        },
      });

      treeItems.push({
        path: file.relPath,
        mode: '100644',
        type: 'blob',
        sha: blobRes.sha,
      });

      completed++;
      if (completed % 10 === 0 || completed === filesToUpload.length) {
        process.stdout.write(`\rProgress: ${completed}/${filesToUpload.length} files uploaded.`);
      }
    }

    console.log('\n\nBuilding Git Tree on GitHub...');
    const treeRes = await githubRequest({
      token,
      method: 'POST',
      path: `/repos/${owner}/${repo}/git/trees`,
      body: { tree: treeItems },
    });

    // Check if branch exists to get parent commit
    let parentSha = null;
    try {
      const refRes = await githubRequest({
        token,
        path: `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      });
      parentSha = refRes.object.sha;
    } catch (e) {
      // Branch doesn't exist yet
    }

    console.log('Creating Commit...');
    const commitBody = {
      message: commitMsg,
      tree: treeRes.sha,
      ...(parentSha ? { parents: [parentSha] } : { parents: [] }),
    };

    const commitRes = await githubRequest({
      token,
      method: 'POST',
      path: `/repos/${owner}/${repo}/git/commits`,
      body: commitBody,
    });

    console.log(`Updating branch reference "${branch}"...`);
    if (parentSha) {
      await githubRequest({
        token,
        method: 'PATCH',
        path: `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
        body: { sha: commitRes.sha, force: true },
      });
    } else {
      await githubRequest({
        token,
        method: 'POST',
        path: `/repos/${owner}/${repo}/git/refs`,
        body: { ref: `refs/heads/${branch}`, sha: commitRes.sha },
      });
    }

    console.log('\n====================================================');
    console.log('  SUCCESSFULLY PUSHED EDUQUERY AI 2.0 TO GITHUB! 🎉 ');
    console.log(`  Repository URL: https://github.com/${owner}/${repo}`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ GitHub Upload Failed:', err.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { getAllFiles, isIgnored };
