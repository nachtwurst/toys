const speed = 2; // pixels per frame
const numElements = 40; // number of bouncing elements
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

// Start animation after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    music.play();
    music.loop = true;
    music.volume = 0.25;
    
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
});