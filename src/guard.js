#!/usr/bin/env node
// 🛡️ branchguard — Branch Naming Convention Enforcer

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const GREEN  = '\x1b[32m'; const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m'; const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';  const DIM    = '\x1b[2m';
const NC     = '\x1b[0m';

const DEFAULT_CONFIG = {
  protected: ['main', 'master', 'develop', 'staging'],
  patterns:  ['feat/*', 'fix/*', 'chore/*', 'docs/*', 'release/v*', 'hotfix/*', 'test/*', 'refactor/*'],
};

function run(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim(); }
  catch { return ''; }
}

function loadConfig() {
  const cfgPath = '.branchguard.yml';
  if (!fs.existsSync(cfgPath)) return DEFAULT_CONFIG;
  const raw = fs.readFileSync(cfgPath, 'utf8');
  const protected_ = (raw.match(/protected:\s*\n((?:\s+-\s+\S+\n?)+)/) || [])[1]
    ?.split('\n').map(l => l.replace(/\s+-\s+/, '').trim()).filter(Boolean) || DEFAULT_CONFIG.protected;
  const patterns = (raw.match(/patterns:\s*\n((?:\s+-\s+\S+\n?)+)/) || [])[1]
    ?.split('\n').map(l => l.replace(/\s+-\s+/, '').trim()).filter(Boolean) || DEFAULT_CONFIG.patterns;
  return { protected: protected_, patterns };
}

function matchesPattern(branch, patterns) {
  return patterns.some(p => {
    if (p.endsWith('/*')) return branch.startsWith(p.slice(0, -2) + '/');
    if (p.endsWith('*'))  return branch.startsWith(p.slice(0, -1));
    return branch === p;
  });
}

function checkBranch(branch, config) {
  if (config.protected.includes(branch)) return { ok: false, reason: `"${branch}" is a protected branch — work on a feature branch instead.` };
  if (!matchesPattern(branch, config.patterns)) {
    const suggestions = config.patterns.slice(0, 3).map(p => p.replace('*', branch.split('/').pop() || 'my-change'));
    return { ok: false, reason: `"${branch}" doesn't match any allowed pattern.\n  Suggestions: ${suggestions.join(', ')}` };
  }
  return { ok: true };
}

function getAllBranches() {
  return run('git branch -a').split('\n').map(b => b.replace(/^\*?\s+/, '').replace('remotes/origin/', '').trim()).filter(Boolean);
}

const cmd     = process.argv[2] || 'check';
const config  = loadConfig();

console.log(`\n${CYAN}${BOLD}🛡️  branchguard${NC}\n`);

if (cmd === 'check') {
  const branch = run('git branch --show-current');
  if (!branch) { console.error('Not inside a git repo.'); process.exit(1); }
  const result = checkBranch(branch, config);
  if (result.ok) {
    console.log(`${GREEN}✅ Branch "${branch}" is valid!${NC}\n`);
  } else {
    console.log(`${RED}❌ ${result.reason}${NC}\n`);
    process.exit(1);
  }

} else if (cmd === 'audit') {
  const branches = [...new Set(getAllBranches())];
  console.log(`${BOLD}Auditing ${branches.length} branches...${NC}\n`);
  let violations = 0;
  branches.forEach(branch => {
    if (!branch || branch === 'HEAD') return;
    const result = checkBranch(branch, config);
    if (result.ok) {
      console.log(`${GREEN}✅ ${branch}${NC}`);
    } else {
      console.log(`${RED}❌ ${branch}${NC} — ${DIM}${result.reason.split('\n')[0]}${NC}`);
      violations++;
    }
  });
  console.log(`\n${BOLD}Result:${NC} ${violations > 0 ? RED+violations+' violations'+NC : GREEN+'All clean!'+NC}\n`);

} else if (cmd === 'install') {
  const hook = `#!/bin/sh\nBRANCH=$(git branch --show-current)\nnode "$(git rev-parse --show-toplevel)/src/guard.js" check\n`;
  fs.writeFileSync('.git/hooks/pre-push', hook);
  execSync('chmod +x .git/hooks/pre-push');
  console.log(`${GREEN}✅ pre-push hook installed — branchguard will run on every push.${NC}\n`);

} else if (cmd === 'protect') {
  const branches = process.argv.slice(3);
  console.log(`${GREEN}Protected branches: ${branches.join(', ')}${NC}`);
  console.log(`${DIM}Add these to .branchguard.yml to persist.${NC}\n`);

} else {
  console.log(`Usage:`);
  console.log(`  node src/guard.js check       — Check current branch`);
  console.log(`  node src/guard.js audit        — Audit all branches`);
  console.log(`  node src/guard.js install      — Install git pre-push hook`);
  console.log(`  node src/guard.js protect <b>  — List branches to protect\n`);
}
