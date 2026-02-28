// script.js updates

// Improvements in functionality and performance

// Fix redundant Math.max on line 58
// Replace redundant usage of Math.max with correct logic

function updateScore(score) {
    this.score = score > this.maxScore ? this.maxScore : score; // Updated logic
}

// Replace deprecated keyCode with modern key handling
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            // Move up logic
            break;
        case 'ArrowDown':
            // Move down logic
            break;
        // Add other key events as necessary
    }
});

// Replace .includes() with Set for O(1) performance
const validKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
function checkKey(key) {
    return validKeys.has(key);
}

// Add GameState object with difficulty levels
const GameState = {
    difficulty: 'Normal', // Default difficulty
    setDifficulty(level) {
        if (['Easy', 'Normal', 'Hard'].includes(level)) {
            this.difficulty = level;
        }
    }
};

// Add Obstacle class for collision detection
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    collidesWith(player) {
        // Logic for collision detection with player
        return (player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                player.y < this.y + this.height &&
                player.y + player.height > this.y);
    }
}

// Add power-ups system
const powerUps = [];
function spawnPowerUp(type, x, y) {
    // Logic to create and handle power-ups
}

// Add localStorage for high scores
function saveHighScore(score) {
    localStorage.setItem('highScore', JSON.stringify(score));
}
function getHighScore() {
    return JSON.parse(localStorage.getItem('highScore')) || 0;
}

// Improve segment drawing with alpha blending
function drawSegment(context, x, y, width, height, alpha) {
    context.globalAlpha = alpha;
    context.fillRect(x, y, width, height);
    context.globalAlpha = 1.0; // Reset alpha
}

// Add game over and restart mechanics
function gameOver() {
    // Logic to handle game over
}

function restartGame() {
    // Logic reset game state
}