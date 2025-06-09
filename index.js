const speed = 2; // pixels per frame
const numElements = 55; // number of bouncing elements
const elements = [];
const bpm = 132;
const msPerBeat = 60000 / bpm;
const colors = [
    '#FF0080', // Hot Pink
    '#00FFFF', // Cyan
    '#FF8000', // Orange
    '#80FF00', // Lime
    '#8000FF'  // Purple
];
let colorIndex = 0;
const music = new Audio('static/audio/dingdongsong.m4a');
music.volume = 0.25;
const clickAudio = new Audio('static/audio/click.mp3');
clickAudio.volume = 0.25;
let audioPermissionGranted = false;
const screenCover = document.getElementById('screen-blackout');

class BouncingElement {
    constructor(element, startX, startY) {
        this.element = element;
        this.x = startX;
        this.y = startY;
        this.dx = speed * (Math.random() > 0.5 ? 1 : -1);
        this.dy = speed * (Math.random() > 0.5 ? 1 : -1);
    }

    update(winWidth, winHeight) {
        // Cache element dimensions once
        const width = this.element.offsetWidth;
        const height = this.element.offsetHeight;

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off walls with cached dimensions
        if (this.x <= 0) {
            this.x = 0;
            this.dx = speed;
        } else if (this.x + width >= winWidth) {
            this.x = winWidth - width;
            this.dx = -speed;
        }

        if (this.y <= 0) {
            this.y = 0;
            this.dy = speed;
        } else if (this.y + height >= winHeight) {
            this.y = winHeight - height;
            this.dy = -speed;
        }

        // Update element position
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

function moveAll() {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    elements.forEach(element => element.update(winWidth, winHeight));
    requestAnimationFrame(moveAll);
}

function updateOverlayColor() {
    const overlay = document.getElementById('color-overlay');
    colorIndex = (colorIndex + 1) % colors.length;
    overlay.style.backgroundColor = colors[colorIndex];
}

async function requestAudioPermission() {
    try {
        await music.play();
        audioPermissionGranted = true;
        music.pause(); // Pause immediately after confirming we can play
        music.currentTime = 0; // Reset to beginning
        return true;
    } catch (error) {
        console.log('Audio play blocked:', error);
        return false;
    }
}

function startAudioExperience() {
    if (audioPermissionGranted) {
        music.play();
        music.loop = true;
        music.volume = 0.25;
    }
}

function startAnimation() {
    const template = document.getElementById('cat-img-box');
    
    // Get template dimensions before modifications
    const templateWidth = template.offsetWidth;
    const templateHeight = template.offsetHeight;
    
    // Create multiple elements
    for (let i = 0; i < numElements; i++) {
        const clone = template.cloneNode(true);
        clone.id = `cat-img-box-${i}`;
        
        // Set required CSS properties
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.margin = '0';
        
        document.body.appendChild(clone);
        
        // Random starting position using cached dimensions
        const startX = Math.random() * (window.innerWidth - templateWidth);
        const startY = Math.random() * (window.innerHeight - templateHeight);
        
        elements.push(new BouncingElement(clone, startX, startY));
    }
    
    // Start color animation
    setInterval(updateOverlayColor, msPerBeat);
    
    // Remove template last
    template.remove();
    moveAll();
}

function fadeScreenCover(duration = 1000) { // Duration in milliseconds, default 1s
    screenCover.style.transition = `opacity ${duration/1000}s ease-in-out`;
    screenCover.style.opacity = '0';
    
    // Wait for transition to complete before hiding
    setTimeout(() => {
        screenCover.style.display = 'none';
    }, duration);
}


window.addEventListener('DOMContentLoaded', async () => {
    const playButton = document.createElement('button');
    playButton.textContent = 'Start Experience';
    playButton.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        padding: 20px 40px;
        font-size: 32px;
        font-family: 'Brush Script MT', 'Comic Sans MS', cursive;
        background: #FF0080;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        text-shadow: 
            2px 2px 3px rgba(0,0,0,0.5),
            -1px -1px 2px rgba(0,0,0,0.4),
            1px -1px 2px rgba(0,0,0,0.4),
            -1px 1px 2px rgba(0,0,0,0.4),
            0 0 12px rgba(0,0,0,0.1);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(playButton);
    
    playButton.addEventListener('click', async () => {
        const canPlay = await requestAudioPermission();
        if (canPlay) {
            clickAudio.play();
            startAudioExperience();
            playButton.remove();
            fadeScreenCover(1500);
            startAnimation();
        } else {
            playButton.textContent = '⚠️ Audio blocked - Click to try again';
            playButton.style.background = '#FF4040';
        }
    });
});