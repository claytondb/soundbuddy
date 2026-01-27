// SoundBuddy App Controller

// Preset sound banks
const presets = {
    reactions: [
        { name: 'Laugh', emoji: '😂', color: '#fbbf24', type: 'tts', text: 'Ha ha ha ha' },
        { name: 'Wow', emoji: '😮', color: '#3b82f6', type: 'tts', text: 'Wow!' },
        { name: 'Sad', emoji: '😢', color: '#6366f1', type: 'tts', text: 'Aww' },
        { name: 'Applause', emoji: '👏', color: '#22c55e', type: 'tts', text: 'Amazing! Bravo!' },
        { name: 'Boo', emoji: '👎', color: '#ef4444', type: 'tts', text: 'Boo!' },
        { name: 'Nice', emoji: '👍', color: '#10b981', type: 'synth', synthType: 'ding' },
    ],
    gaming: [
        { name: 'Victory', emoji: '🏆', color: '#fbbf24', type: 'synth', synthType: 'tada' },
        { name: 'Defeat', emoji: '💀', color: '#ef4444', type: 'synth', synthType: 'error' },
        { name: 'Power Up', emoji: '⚡', color: '#8b5cf6', type: 'synth', synthType: 'coin' },
        { name: 'Hit', emoji: '💥', color: '#f97316', type: 'synth', synthType: 'drum' },
        { name: 'Laser', emoji: '🔫', color: '#06b6d4', type: 'synth', synthType: 'laser' },
        { name: 'Jump', emoji: '🦘', color: '#84cc16', type: 'synth', synthType: 'bloop' },
    ],
    podcast: [
        { name: 'Intro', emoji: '🎙️', color: '#667eea', type: 'synth', synthType: 'tada' },
        { name: 'Transition', emoji: '➡️', color: '#764ba2', type: 'synth', synthType: 'whoosh' },
        { name: 'Ding', emoji: '🔔', color: '#fbbf24', type: 'synth', synthType: 'ding' },
        { name: 'Correct', emoji: '✅', color: '#22c55e', type: 'synth', synthType: 'coin' },
        { name: 'Wrong', emoji: '❌', color: '#ef4444', type: 'synth', synthType: 'buzzer' },
        { name: 'Break', emoji: '☕', color: '#f59e0b', type: 'tts', text: "We'll be right back" },
    ],
    stream: [
        { name: 'Sub Alert', emoji: '🎉', color: '#fbbf24', type: 'synth', synthType: 'tada' },
        { name: 'Donation', emoji: '💰', color: '#22c55e', type: 'synth', synthType: 'coin' },
        { name: 'Follow', emoji: '❤️', color: '#ec4899', type: 'synth', synthType: 'pop' },
        { name: 'Raid', emoji: '🚀', color: '#8b5cf6', type: 'synth', synthType: 'whoosh' },
        { name: 'Hype', emoji: '🔥', color: '#f97316', type: 'tts', text: 'Lets go!' },
        { name: 'GG', emoji: '🎮', color: '#3b82f6', type: 'tts', text: 'Good game everyone' },
    ],
    nature: [
        { name: 'Wind', emoji: '💨', color: '#94a3b8', type: 'synth', synthType: 'whoosh' },
        { name: 'Bird', emoji: '🐦', color: '#22d3ee', type: 'tts', text: 'Tweet tweet' },
        { name: 'Rain', emoji: '🌧️', color: '#6366f1', type: 'synth', synthType: 'whoosh' },
        { name: 'Thunder', emoji: '⚡', color: '#fbbf24', type: 'synth', synthType: 'drum' },
        { name: 'Water', emoji: '💧', color: '#3b82f6', type: 'synth', synthType: 'bloop' },
        { name: 'Cricket', emoji: '🦗', color: '#84cc16', type: 'tts', text: 'Chirp chirp chirp' },
    ]
};

// State
let sounds = [];
let editingIndex = -1;
let recordedBlob = null;
let mediaRecorder = null;

// DOM Elements
const soundboard = document.getElementById('soundboard');
const editModal = document.getElementById('edit-modal');
const soundForm = document.getElementById('sound-form');
const modalTitle = document.getElementById('modal-title');
const deleteBtn = document.getElementById('delete-sound');

// Initialize
function init() {
    loadSounds();
    renderSoundboard();
    setupEventListeners();
    setupKeyboardShortcuts();
    
    // Load speech synthesis voices
    speechSynthesis.getVoices();
}

function setupEventListeners() {
    // Stop all
    document.getElementById('stop-all').addEventListener('click', () => {
        synth.stopAll();
        document.querySelectorAll('.sound-button').forEach(btn => btn.classList.remove('playing'));
    });

    // Add sound
    document.getElementById('add-sound').addEventListener('click', () => openEditModal());

    // Master volume
    document.getElementById('master-volume').addEventListener('input', (e) => {
        synth.setVolume(e.target.value / 100);
    });

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            loadPreset(preset);
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Sound type change
    document.getElementById('sound-type').addEventListener('change', (e) => {
        document.querySelectorAll('.synth-options, .tts-options, .url-options, .record-options').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelector(`.${e.target.value}-options`).style.display = 'block';
    });

    // Recording
    document.getElementById('record-btn').addEventListener('click', toggleRecording);

    // Form submission
    soundForm.addEventListener('submit', saveSound);

    // Cancel
    document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

    // Delete
    deleteBtn.addEventListener('click', deleteSound);

    // Hotkey input
    document.getElementById('sound-hotkey').addEventListener('keydown', (e) => {
        e.preventDefault();
        e.target.value = e.key.toUpperCase();
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (editModal.classList.contains('show')) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toUpperCase();
        const sound = sounds.find(s => s.hotkey === key);
        if (sound) {
            e.preventDefault();
            playSound(sounds.indexOf(sound));
        }
    });
}

function loadPreset(name) {
    if (!presets[name]) return;
    sounds = presets[name].map((s, i) => ({
        ...s,
        hotkey: (i + 1).toString()
    }));
    saveSounds();
    renderSoundboard();
}

function renderSoundboard() {
    soundboard.innerHTML = '';
    
    sounds.forEach((sound, index) => {
        const btn = document.createElement('button');
        btn.className = 'sound-button';
        btn.style.background = `linear-gradient(135deg, ${sound.color}, ${adjustColor(sound.color, -30)})`;
        btn.innerHTML = `
            <span class="sound-emoji">${sound.emoji || '🔊'}</span>
            <span class="sound-name">${sound.name}</span>
            ${sound.hotkey ? `<span class="sound-hotkey">${sound.hotkey}</span>` : ''}
        `;
        
        btn.addEventListener('click', () => playSound(index));
        
        // Long press to edit
        let pressTimer;
        btn.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => openEditModal(index), 500);
        });
        btn.addEventListener('mouseup', () => clearTimeout(pressTimer));
        btn.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        soundboard.appendChild(btn);
    });
}

function playSound(index) {
    const sound = sounds[index];
    if (!sound) return;

    const btn = soundboard.children[index];
    btn.classList.add('playing');

    let duration = 0;
    
    if (sound.type === 'synth') {
        duration = synth.play(sound.synthType);
    } else if (sound.type === 'tts') {
        duration = synth.play('tts', { text: sound.text });
    } else if (sound.type === 'url' && sound.url) {
        const audio = new Audio(sound.url);
        audio.volume = synth.masterVolume;
        audio.play();
        duration = 2000;
    } else if (sound.type === 'record' && sound.audioData) {
        const audio = new Audio(sound.audioData);
        audio.volume = synth.masterVolume;
        audio.play();
        duration = 2000;
    } else {
        duration = synth.play('ding');
    }

    setTimeout(() => btn.classList.remove('playing'), duration);
}

function openEditModal(index = -1) {
    editingIndex = index;
    modalTitle.textContent = index === -1 ? 'Add Sound' : 'Edit Sound';
    deleteBtn.style.display = index === -1 ? 'none' : 'block';

    if (index >= 0) {
        const sound = sounds[index];
        document.getElementById('sound-name').value = sound.name || '';
        document.getElementById('sound-emoji').value = sound.emoji || '';
        document.getElementById('sound-color').value = sound.color || '#667eea';
        document.getElementById('sound-type').value = sound.type || 'synth';
        document.getElementById('synth-type').value = sound.synthType || 'ding';
        document.getElementById('tts-text').value = sound.text || '';
        document.getElementById('sound-url').value = sound.url || '';
        document.getElementById('sound-hotkey').value = sound.hotkey || '';
    } else {
        soundForm.reset();
        document.getElementById('sound-color').value = '#667eea';
    }

    // Show/hide relevant options
    const type = document.getElementById('sound-type').value;
    document.querySelectorAll('.synth-options, .tts-options, .url-options, .record-options').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelector(`.${type}-options`).style.display = 'block';

    editModal.classList.add('show');
}

function closeEditModal() {
    editModal.classList.remove('show');
    editingIndex = -1;
    recordedBlob = null;
}

function saveSound(e) {
    e.preventDefault();

    const sound = {
        name: document.getElementById('sound-name').value,
        emoji: document.getElementById('sound-emoji').value || '🔊',
        color: document.getElementById('sound-color').value,
        type: document.getElementById('sound-type').value,
        synthType: document.getElementById('synth-type').value,
        text: document.getElementById('tts-text').value,
        url: document.getElementById('sound-url').value,
        hotkey: document.getElementById('sound-hotkey').value.toUpperCase(),
        audioData: recordedBlob ? URL.createObjectURL(recordedBlob) : null
    };

    if (editingIndex >= 0) {
        sounds[editingIndex] = sound;
    } else {
        sounds.push(sound);
    }

    saveSounds();
    renderSoundboard();
    closeEditModal();
}

function deleteSound() {
    if (editingIndex >= 0) {
        sounds.splice(editingIndex, 1);
        saveSounds();
        renderSoundboard();
        closeEditModal();
    }
}

async function toggleRecording() {
    const btn = document.getElementById('record-btn');
    const status = document.getElementById('record-status');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        btn.textContent = '🎤 Start Recording';
        btn.classList.remove('recording');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(chunks, { type: 'audio/webm' });
            status.textContent = 'Recording saved! Click save to keep it.';
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        btn.textContent = '⏹️ Stop Recording';
        btn.classList.add('recording');
        status.textContent = 'Recording...';
    } catch (err) {
        status.textContent = 'Microphone access denied';
    }
}

function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Persistence
function saveSounds() {
    // Can't persist recorded audio URLs, so filter those out
    const toSave = sounds.map(s => {
        const copy = { ...s };
        if (copy.type === 'record') delete copy.audioData;
        return copy;
    });
    localStorage.setItem('soundbuddy-sounds', JSON.stringify(toSave));
}

function loadSounds() {
    const saved = localStorage.getItem('soundbuddy-sounds');
    if (saved) {
        sounds = JSON.parse(saved);
    } else {
        // Load default preset
        loadPreset('reactions');
    }
}

// Init
document.addEventListener('DOMContentLoaded', init);
