// procmon/main.js
// Process Monitor — spawn kids, watch them live, talk to their pipes.

// ============================================================
//  STATE
// ============================================================

const state = {
    selectedPid: null,         // currently selected PID or null
    knownPids: new Set(),      // pids we believe are alive
    pidNames: new Map(),       // pid -> name (what was used to spawn it)
    pollInterval: null,        // listApps polling timer
    readInterval: null,        // readApp polling timer
};

// ============================================================
//  DOM REFS  (built imperatively, no framework)
// ============================================================

const body = document.body;

// --- Left panel
const panelLeft = el('div', { id: 'panel-left' });

// Spawn menu
const spawnMenu = el('div', { id: 'spawn-menu' });
const spawnLabel = el('label', {}, 'Spawn');
spawnLabel.setAttribute('for', 'spawn-path');
const spawnPath = el('input', { id: 'spawn-path', type: 'text', placeholder: 'apps/thing.exe' });
const spawnBtn = el('button', { id: 'spawn-btn' }, 'Spawn child');

spawnMenu.append(spawnLabel, spawnPath, spawnBtn);

// Process list
const procListWrap = el('div', { id: 'proc-list-wrap' });
const procListTitle = el('div', { id: 'proc-list-title' }, 'Children');
const procList = el('div', { id: 'proc-list' });
procListWrap.append(procListTitle, procList);

panelLeft.append(spawnMenu, procListWrap);

// --- Right panel
const panelRight = el('div', { id: 'panel-right' });

// Selected bar
const selectedBar = el('div', { id: 'selected-bar' });
const selectedLabel = el('span', { id: 'selected-label' }, 'Selected PID');
const selectedPidEl = el('span', { id: 'selected-pid', class: 'empty' }, '—');
selectedBar.append(selectedLabel, selectedPidEl);

// Consoles
const consolesEl = el('div', { id: 'consoles' });

// stdout pane
const stdoutPane = el('div', { class: 'console-pane', id: 'stdout-pane' });
const stdoutHeader = el('div', { class: 'console-header' });
const stdoutTitle = el('span', { class: 'console-title' }, 'stdout');
stdoutHeader.append(stdoutTitle);
const stdoutOutput = el('div', { class: 'console-output', id: 'stdout-output' });
stdoutPane.append(stdoutHeader, stdoutOutput);

// stdin pane
const stdinPane = el('div', { class: 'console-pane', id: 'stdin-pane' });
const stdinHeader = el('div', { class: 'console-header' });
const stdinTitle = el('span', { class: 'console-title' }, 'stdin');
stdinHeader.append(stdinTitle);
const stdinOutput = el('div', { class: 'console-output', id: 'stdin-output' });
const stdinInputRow = el('div', { id: 'stdin-input-row' });
const stdinPrompt = el('span', {}, 'hex›');
const stdinInput = el('input', { id: 'stdin-input', type: 'text', placeholder: 'AA BB 43 ...' });
stdinInputRow.append(stdinPrompt, stdinInput);
stdinPane.append(stdinHeader, stdinOutput, stdinInputRow);

consolesEl.append(stdoutPane, stdinPane);
panelRight.append(selectedBar, consolesEl);

body.append(panelLeft, panelRight);

// ============================================================
//  EVENTS
// ============================================================

spawnBtn.addEventListener('click', spawnChild);
spawnPath.addEventListener('keydown', (e) => { if (e.key === 'Enter') spawnChild(); });
stdinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendBytes(); });

// ============================================================
//  SPAWN
// ============================================================

async function spawnChild() {
    const rawPath = spawnPath.value.trim();
    if (!rawPath) return;

    const result = await window.api.startApp(rawPath, 'static' );
    if (!result?.success) {
        appendLine(stdoutOutput, `[error] Failed to spawn: ${result?.message ?? 'unknown error'}`);
        return;
    }

    const { pid, launched } = result.data;
    state.pidNames.set(pid, rawPath);
    spawnPath.value = '';

    // Immediately refresh the list
    await refreshList();
}

// ============================================================
//  PROCESS LIST — poll listApps
// ============================================================

async function refreshList() {
    const result = await window.api.listApps();
    if (!result?.success) return;

    const livePids = new Set(result.data.pids);

    // Remove rows for dead processes
    for (const pid of state.knownPids) {
        if (!livePids.has(pid)) {
            state.knownPids.delete(pid);
            state.pidNames.delete(pid);
            const row = document.getElementById(`proc-row-${pid}`);
            if (row) row.remove();
            // If selected process died, deselect
            if (state.selectedPid === pid) deselect();
        }
    }

    // Add rows for new processes
    for (const pid of livePids) {
        if (!state.knownPids.has(pid)) {
            state.knownPids.add(pid);
            if (!state.pidNames.has(pid)) state.pidNames.set(pid, String(pid));
            addProcRow(pid);
        }
    }

    // Show empty state if needed
    const emptyEl = document.getElementById('proc-empty');
    if (livePids.size === 0) {
        if (!emptyEl) {
            const empty = el('div', { id: 'proc-empty' }, 'No children yet.');
            procList.appendChild(empty);
        }
    } else {
        if (emptyEl) emptyEl.remove();
    }
}

function addProcRow(pid) {
    const name = state.pidNames.get(pid) ?? String(pid);

    const row = el('div', { class: 'proc-row', id: `proc-row-${pid}` });

    const nameEl = el('span', { class: 'proc-name', title: name }, name);
    const pidEl = el('span', { class: 'proc-pid' }, String(pid));

    const killBtn = el('button', { class: 'proc-btn kill-btn' }, 'kill');
    killBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.api.killApp(pid);
        await refreshList();
    });

    const selectBtn = el('button', { class: 'proc-btn select-btn' }, 'select');
    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectPid(pid);
    });

    row.append(nameEl, pidEl, killBtn, selectBtn);
    procList.appendChild(row);
}

// ============================================================
//  SELECTION
// ============================================================

function selectPid(pid) {
    // Deselect previous highlight
    if (state.selectedPid !== null) {
        const prev = document.getElementById(`proc-row-${state.selectedPid}`);
        if (prev) prev.classList.remove('selected');
    }

    state.selectedPid = pid;

    // Highlight new
    const row = document.getElementById(`proc-row-${pid}`);
    if (row) row.classList.add('selected');

    // Update selected bar
    selectedPidEl.textContent = String(pid);
    selectedPidEl.classList.remove('empty');

    // Clear consoles on switch
    clearConsoles();

    // Start reading stdout for this pid
    startReadPolling(pid);
}

function deselect() {
    if (state.selectedPid !== null) {
        const prev = document.getElementById(`proc-row-${state.selectedPid}`);
        if (prev) prev.classList.remove('selected');
    }
    state.selectedPid = null;
    selectedPidEl.textContent = '—';
    selectedPidEl.classList.add('empty');
    clearConsoles();
    stopReadPolling();
}

// ============================================================
//  STDOUT POLLING  (readApp)
// ============================================================

function startReadPolling(pid) {
    stopReadPolling();
    state.readInterval = setInterval(async () => {
        if (state.selectedPid !== pid) {
            stopReadPolling();
            return;
        }
        const result = await window.api.readApp(pid);
        if (!result?.success) return;

        const { stdout, stderr } = result.data;

        if (stdout?.byteLength > 0) {
            const text = new TextDecoder().decode(stdout);
            appendLine(stdoutOutput, text);
        }
        if (stderr?.byteLength > 0) {
            const text = new TextDecoder().decode(stderr);
            appendLine(stdoutOutput, `[stderr] ${text}`);
        }
    }, 200);
}

function stopReadPolling() {
    if (state.readInterval !== null) {
        clearInterval(state.readInterval);
        state.readInterval = null;
    }
}

// ============================================================
//  STDIN WRITE  (writeApp)
// ============================================================

async function sendBytes() {
    const raw = stdinInput.value.trim();
    if (!raw || state.selectedPid === null) return;

    // Parse "AA BB 43" style hex input into Uint8Array
    const parts = raw.split(/\s+/);
    const bytes = [];
    for (const p of parts) {
        const byte = parseInt(p, 16);
        if (isNaN(byte) || byte < 0 || byte > 255) {
            appendLine(stdinOutput, `[error] Invalid byte: "${p}" — use hex like AA BB 43`);
            return;
        }
        bytes.push(byte);
    }

    const data = new Uint8Array(bytes);
    const result = await window.api.writeApp( state.selectedPid, data );

    if (!result?.success) {
        appendLine(stdinOutput, `[error] Write failed: ${result?.message ?? 'unknown'}`);
        return;
    }

    // Echo what we sent to the stdin console
    appendLine(stdinOutput, `→ ${raw} (${bytes.length} byte${bytes.length !== 1 ? 's' : ''})`);
    stdinInput.value = '';
}

// ============================================================
//  CONSOLE HELPERS
// ============================================================

function appendLine(outputEl, text) {
    // Strip trailing newline for cleanliness, split on internal newlines
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    for (const line of lines) {
        if (line === '' && lines.length > 1) continue; // skip pure empty separators mid-split
        const span = document.createElement('div');
        span.textContent = line;
        outputEl.appendChild(span);
    }
    // Auto-scroll to bottom
    outputEl.scrollTop = outputEl.scrollHeight;
}

function clearConsoles() {
    stdoutOutput.innerHTML = '';
    stdinOutput.innerHTML = '';
}

// ============================================================
//  UTILITY — minimal element factory
// ============================================================

function el(tag, attrs = {}, text = null) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else node.setAttribute(k, v);
    }
    if (text !== null) node.textContent = text;
    return node;
}

// ============================================================
//  INIT
// ============================================================

async function init() {
    await refreshList();
    // Poll process list every 800ms to stay faithful to reality
    state.pollInterval = setInterval(refreshList, 800);
}

init();
