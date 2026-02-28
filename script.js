class Segment {
    constructor() {
        // Previous initialization code...
        // Removed early return to allow proper initialization
        this.color = this.setColor();
        this.length = this.calculateLength();
    }
}

function createScoreDisplay() {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.right = '10px';
    document.body.appendChild(scoreDisplay);
}

function updateScoreDisplay(score) {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.innerText = 'Score: ' + score;
    }
}

// Fixing timing of updateScoreDisplay call in the game loop or related function...
// Make sure to call updateScoreDisplay appropriately after updating score.
