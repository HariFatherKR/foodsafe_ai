# Ralph Loop Pro Plugin Design

## Overview

기존 ralph-loop 플러그인을 완전 대체하는 고급 자율 개발 루프 플러그인.
GitHub repo(frankbria/ralph-claude-code)의 핵심 기능을 Claude Code 플러그인으로 구현.

## Plugin Structure

```
~/.claude/plugins/ralph-loop-pro/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── ralph-pro.md
│   ├── cancel-ralph-pro.md
│   ├── ralph-pro-status.md
│   └── ralph-pro-help.md
├── hooks/
│   ├── hooks.json
│   └── stop-hook.sh
├── scripts/
│   └── setup-ralph-pro.sh
├── lib/
│   ├── circuit_breaker.sh
│   ├── response_analyzer.sh
│   ├── rate_limiter.sh
│   └── file_protection.sh
└── README.md
```

## State File (`.claude/ralph-pro.local.md`)

YAML frontmatter with extended fields:

```yaml
---
active: true
iteration: 1
max_iterations: 20
completion_promise: "TASK COMPLETE"
started_at: "2026-02-19T12:00:00Z"
cb_state: CLOSED
cb_no_progress_count: 0
cb_same_error_count: 0
cb_last_error_hash: ""
cb_opened_at: ""
cb_cooldown_minutes: 30
calls_this_hour: 0
hour_started: "2026-02-19T12:00:00Z"
max_calls_per_hour: 100
completion_indicators: 0
last_exit_signal: false
cb_no_progress_threshold: 3
cb_same_error_threshold: 5
---
<prompt text>
```

## Core Mechanisms

### 1. Dual-Condition Exit Gate

Both conditions must be true to exit:
- completion_indicators >= 2
- EXIT_SIGNAL: true (from RALPH_STATUS block)

### 2. Circuit Breaker (3 states)

CLOSED → OPEN (on: no-progress x3, same-error x5)
OPEN → HALF_OPEN (on: cooldown elapsed, default 30min)
HALF_OPEN → CLOSED (on: progress detected)
HALF_OPEN → OPEN (on: failure again)

### 3. RALPH_STATUS Block

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <N>
FILES_MODIFIED: <N>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
WORK_TYPE: IMPLEMENTATION | TESTING | DOCUMENTATION | REFACTORING
EXIT_SIGNAL: false | true
RECOMMENDATION: <next action summary>
---END_RALPH_STATUS---
```

### 4. Rate Limiting

- Configurable max_calls_per_hour (default: 100)
- Auto-reset each hour
- Loop pauses when limit reached

### 5. File Protection

- Validate state file integrity each loop iteration
- Check critical fields exist and are valid
- Auto-recover or stop on corruption

## Commands

- `/ralph-pro <PROMPT> [OPTIONS]` - Start loop
- `/cancel-ralph-pro` - Cancel active loop
- `/ralph-pro-status` - Show circuit breaker + loop status
- `/ralph-pro-help` - Documentation

## CLI Options

```
--max-iterations <N>        Max iterations (default: unlimited)
--completion-promise <TEXT>  Promise phrase for completion
--max-calls-per-hour <N>    Rate limit (default: 100)
--cooldown-minutes <N>      Circuit breaker cooldown (default: 30)
--no-progress-threshold <N> No-progress trips (default: 3)
--same-error-threshold <N>  Same-error trips (default: 5)
```
