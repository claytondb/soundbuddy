// SoundBuddy Synthesizer
// Generates various sounds using Web Audio API

class SoundSynth {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.8;
        this.activeSources = [];
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    setVolume(vol) {
        this.masterVolume = vol;
    }

    stopAll() {
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {}
        });
        this.activeSources = [];
        speechSynthesis.cancel();
    }

    play(type, options = {}) {
        switch (type) {
            case 'ding': return this.playDing();
            case 'bloop': return this.playBloop();
            case 'buzzer': return this.playBuzzer();
            case 'whoosh': return this.playWhoosh();
            case 'tada': return this.playTada();
            case 'error': return this.playError();
            case 'pop': return this.playPop();
            case 'coin': return this.playCoin();
            case 'laser': return this.playLaser();
            case 'drum': return this.playDrum();
            case 'tts': return this.playTTS(options.text);
            default: return this.playDing();
        }
    }

    playDing() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.5);
        this.activeSources.push(osc);
        
        return 500;
    }

    playBloop() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
        this.activeSources.push(osc);
        
        return 200;
    }

    playBuzzer() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.setValueAtTime(0, now + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.5);
        this.activeSources.push(osc);
        
        return 500;
    }

    playWhoosh() {
        const ctx = this.init();
        const now = ctx.currentTime;
        const duration = 0.4;
        
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const env = Math.sin(Math.PI * t);
            data[i] = (Math.random() * 2 - 1) * env;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + duration);
        filter.Q.value = 1;
        
        const gain = ctx.createGain();
        gain.gain.value = this.masterVolume * 0.5;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        source.start(now);
        this.activeSources.push(source);
        
        return 400;
    }

    playTada() {
        const ctx = this.init();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.12;
            gain.gain.setValueAtTime(this.masterVolume * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
            this.activeSources.push(osc);
        });
        
        return 800;
    }

    playError() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = 200;
            
            const startTime = now + i * 0.15;
            gain.gain.setValueAtTime(this.masterVolume * 0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.1);
            this.activeSources.push(osc);
        }
        
        return 300;
    }

    playPop() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
        this.activeSources.push(osc);
        
        return 100;
    }

    playCoin() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        const freqs = [988, 1319];
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.1;
            gain.gain.setValueAtTime(this.masterVolume * 0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.15);
            this.activeSources.push(osc);
        });
        
        return 250;
    }

    playLaser() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
        this.activeSources.push(osc);
        
        return 200;
    }

    playDrum() {
        const ctx = this.init();
        const now = ctx.currentTime;
        
        // Kick body
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        
        gain.gain.setValueAtTime(this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Click
        const bufferSize = ctx.sampleRate * 0.02;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-10 * i / bufferSize);
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = this.masterVolume * 0.5;
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.15);
        noise.start(now);
        
        this.activeSources.push(osc, noise);
        
        return 150;
    }

    playTTS(text) {
        if (!text) return 0;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.masterVolume;
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
        
        return text.length * 80; // Rough estimate
    }
}

// Global instance
const synth = new SoundSynth();
