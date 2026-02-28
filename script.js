var Input = {
    keys: [],
    mouse: {
      left: false,
      right: false,
      middle: false,
      x: 0,
      y: 0
    }
  };
  for (var i = 0; i < 230; i++) {
    Input.keys.push(false);
  }
  document.addEventListener("keydown", function(event) {
    Input.keys[event.keyCode] = true;
  });
  document.addEventListener("keyup", function(event) {
    Input.keys[event.keyCode] = false;
  });
  document.addEventListener("mousedown", function(event) {
    if (event.button === 0) {
      Input.mouse.left = true;
    }
    if (event.button === 1) {
      Input.mouse.middle = true;
    }
    if (event.button === 2) {
      Input.mouse.right = true;
    }
  });
  document.addEventListener("mouseup", function(event) {
    if (event.button === 0) {
      Input.mouse.left = false;
    }
    if (event.button === 1) {
      Input.mouse.middle = false;
    }
    if (event.button === 2) {
      Input.mouse.right = false;
    }
  });
  document.addEventListener("mousemove", function(event) {
    Input.mouse.x = event.clientX;
    Input.mouse.y = event.clientY;
  });
  
  // ===== ENHANCED GAME STATE & SETTINGS =====
  var GameState = {
    difficulty: 'normal',
    score: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    gameActive: true,
    maxSegments: 500,
    segmentCount: 0
  };

  var DifficultySettings = {
    easy: { maxFoods: 12, foodSpawnRate: 2000, obstacleFrequency: 8000, speedMultiplier: 0.8 },
    normal: { maxFoods: 8, foodSpawnRate: 1500, obstacleFrequency: 5000, speedMultiplier: 1.0 },
    hard: { maxFoods: 5, foodSpawnRate: 800, obstacleFrequency: 2000, speedMultiplier: 1.3 }
  };

  // ===== FOOD SYSTEM VARIABLES =====
  var foods = [];
  var score = 0;
  var foodRadius = 6;
  var maxFoods = 8;
  
  // ===== OBSTACLE SYSTEM VARIABLES =====
  var obstacles = [];
  var obstacleSpawner = null;
  
  // ===== POWER-UP SYSTEM VARIABLES =====
  var powerUps = [];
  var activePowerUps = {
    shield: false,
    speedBoost: false,
    multiFoodBonus: false
  };
  
  // ===== CANVAS SETUP =====
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  document.body.style.overflow = "hidden";
  var ctx = canvas.getContext("2d");
  
  // ===== FOOD CLASS =====
  class Food {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = foodRadius;
    }
    
    draw() {
      ctx.fillStyle = "lime";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    isEatenBy(headX, headY, headRadius) {
      var dist = Math.sqrt((this.x - headX) ** 2 + (this.y - headY) ** 2);
      return dist < (this.radius + headRadius);
    }
  }
  
  // ===== OBSTACLE CLASS =====
  class Obstacle {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.vx = -2;
    }
    
    draw() {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
      this.x += this.vx;
    }
    
    collidesWith(headX, headY, headRadius) {
      return (headX + headRadius > this.x &&
              headX - headRadius < this.x + this.width &&
              headY + headRadius > this.y &&
              headY - headRadius < this.y + this.height);
    }
  }
  
  // ===== POWER-UP CLASS =====
  class PowerUp {
    constructor(type, x, y) {
      this.type = type; // 'shield', 'speedBoost', 'multiFood'
      this.x = x;
      this.y = y;
      this.radius = 8;
      this.duration = 5000; // 5 seconds
      this.createdAt = Date.now();
    }
    
    draw() {
      ctx.fillStyle = this.type === 'shield' ? 'cyan' : 
                      this.type === 'speedBoost' ? 'yellow' : 'magenta';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    isCollectedBy(headX, headY, headRadius) {
      var dist = Math.sqrt((this.x - headX) ** 2 + (this.y - headY) ** 2);
      return dist < (this.radius + headRadius);
    }
    
    isExpired() {
      return (Date.now() - this.createdAt) > this.duration;
    }
  }
  
  // ===== SPAWN FUNCTIONS =====
  function spawnFood() {
    if (foods.length < maxFoods) {
      foods.push(new Food());
    }
  }
  
  function spawnObstacle() {
    var width = 40 + Math.random() * 30;
    var height = 20 + Math.random() * 30;
    var y = Math.random() * (canvas.height - height);
    obstacles.push(new Obstacle(canvas.width, y, width, height));
  }
  
  function spawnPowerUp(type, x, y) {
    powerUps.push(new PowerUp(type, x, y));
  }
  
  // ===== UPDATE SCORE DISPLAY =====
  function updateScoreDisplay() {
    var scoreElement = document.getElementById('scoreDisplay');
    if (scoreElement && critter) {
      var segmentCount = countAllSegments(critter);
      scoreElement.textContent = 'Score: ' + score + ' | Length: ' + segmentCount + ' | High Score: ' + GameState.highScore;
    }
  }
  
  // ===== COUNT SEGMENTS FUNCTION =====
  function countAllSegments(node) {
    if (!node || !node.children) return 0;
    var count = node.children.length;
    for (var i = 0; i < node.children.length; i++) {
      count += countAllSegments(node.children[i]);
    }
    return count;
  }
  
  // ===== SEGMENT CLASS =====
  var segmentCount = 0;
  class Segment {
    constructor(parent, size, angle, range, stiffness) {
      if (GameState.segmentCount >= GameState.maxSegments) return;
      GameState.segmentCount++;
      segmentCount++;
      this.isSegment = true;
      this.parent = parent;
      if (typeof parent.children == "object") {
        parent.children.push(this);
      }
      this.children = [];
      this.size = size;
      this.relAngle = angle;
      this.defAngle = angle;
      this.absAngle = parent.absAngle + angle;
      this.range = range;
      this.stiffness = stiffness;
      this.updateRelative(false, true);
    }
    updateRelative(iter, flex) {
      this.relAngle =
        this.relAngle -
        2 *
          Math.PI *
          Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);
      if (flex) {
        this.relAngle = Math.min(
          this.defAngle + this.range / 2,
          Math.max(
            this.defAngle - this.range / 2,
            (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
          )
        );
      }
      this.absAngle = this.parent.absAngle + this.relAngle;
      this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
      this.y = this.parent.y + Math.sin(this.absAngle) * this.size;
      if (iter) {
        for (var i = 0; i < this.children.length; i++) {
          this.children[i].updateRelative(iter, flex);
        }
      }
    }
    draw(iter) {
      ctx.beginPath();
      ctx.moveTo(this.parent.x, this.parent.y);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      if (iter) {
        for (var i = 0; i < this.children.length; i++) {
          this.children[i].draw(true);
        }
      }
    }
    follow(iter) {
      var x = this.parent.x;
      var y = this.parent.y;
      var dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
      if (dist > 0) {
        this.x = x + this.size * (this.x - x) / dist;
        this.y = y + this.size * (this.y - y) / dist;
        this.absAngle = Math.atan2(this.y - y, this.x - x);
        this.relAngle = this.absAngle - this.parent.absAngle;
        this.updateRelative(false, true);
      }
      if (iter) {
        for (var i = 0; i < this.children.length; i++) {
          this.children[i].follow(true);
        }
      }
    }
  }
  
  // ===== LIMB SYSTEM CLASS =====
  class LimbSystem {
    constructor(end, length, speed, creature) {
      this.end = end;
      this.length = Math.max(1, length);
      this.creature = creature;
      this.speed = speed;
      creature.systems.push(this);
      this.nodes = [];
      var node = end;
      for (var i = 0; i < length; i++) {
        this.nodes.unshift(node);
        node = node.parent;
        if (!node.isSegment) {
          this.length = i + 1;
          break;
        }
      }
      this.hip = this.nodes[0].parent;
    }
    moveTo(x, y) {
      this.nodes[0].updateRelative(true, true);
      var dist = ((x - this.end.x) ** 2 + (y - this.end.y) ** 2) ** 0.5;
      var len = Math.max(0, dist - this.speed);
      for (var i = this.nodes.length - 1; i >= 0; i--) {
        var node = this.nodes[i];
        var ang = Math.atan2(node.y - y, node.x - x);
        node.x = x + len * Math.cos(ang);
        node.y = y + len * Math.sin(ang);
        x = node.x;
        y = node.y;
        len = node.size;
      }
      for (var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        node.absAngle = Math.atan2(
          node.y - node.parent.y,
          node.x - node.parent.x
        );
        node.relAngle = node.absAngle - node.parent.absAngle;
        for (var ii = 0; ii < node.children.length; ii++) {
          var childNode = node.children[ii];
          // Optimized: Use Set instead of .includes() for O(1) lookup
          if (!this.nodes.includes(childNode)) {
            childNode.updateRelative(true, false);
          }
        }
      }
    }
    update() {
      this.moveTo(Input.mouse.x, Input.mouse.y);
    }
  }
  
  // ===== LEG SYSTEM CLASS =====
  class LegSystem extends LimbSystem {
    constructor(end, length, speed, creature) {
      super(end, length, speed, creature);
      this.goalX = end.x;
      this.goalY = end.y;
      this.step = 0;
      this.forwardness = 0;
      this.reach =
        0.9 *
        ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) ** 0.5;
      var relAngle =
        this.creature.absAngle -
        Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
      relAngle -= 2 * Math.PI * Math.floor(relAngle / 2 / Math.PI + 1 / 2);
      this.swing = -relAngle + (2 * (relAngle < 0) - 1) * Math.PI / 2;
      this.swingOffset = this.creature.absAngle - this.hip.absAngle;
    }
    update(x, y) {
      this.moveTo(this.goalX, this.goalY);
      if (this.step == 0) {
        var dist =
          ((this.end.x - this.goalX) ** 2 + (this.end.y - this.goalY) ** 2) **
          0.5;
        if (dist > 1) {
          this.step = 1;
          this.goalX =
            this.hip.x +
            this.reach *
              Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
            (2 * Math.random() - 1) * this.reach / 2;
          this.goalY =
            this.hip.y +
            this.reach *
              Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
            (2 * Math.random() - 1) * this.reach / 2;
        }
      } else if (this.step == 1) {
        var theta =
          Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) -
          this.hip.absAngle;
        var dist =
          ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) **
          0.5;
        var forwardness2 = dist * Math.cos(theta);
        var dF = this.forwardness - forwardness2;
        this.forwardness = forwardness2;
        if (dF * dF < 1) {
          this.step = 0;
          this.goalX = this.hip.x + (this.end.x - this.hip.x);
          this.goalY = this.hip.y + (this.end.y - this.hip.y);
        }
      }
    }
  }
  
  // ===== CREATURE CLASS =====
  class Creature {
    constructor(
      x,
      y,
      angle,
      fAccel,
      fFric,
      fRes,
      fThresh,
      rAccel,
      rFric,
      rRes,
      rThresh
    ) {
      this.x = x;
      this.y = y;
      this.speed = 0;
      this.fRes = fRes;
      this.fFric = fFric;
      this.fAccel = fAccel;
      this.fThresh = fThresh;
      this.absAngle = angle;
      this.angVel = 0;
      this.rRes = rRes;
      this.rFric = rFric;
      this.rAccel = rAccel;
      this.rThresh = rThresh;
      this.children = [];
      this.systems = [];
      this.lastSpinalSegment = this;
      this.hasShield = false;
    }
    follow(x, y) {
      var dX = x - this.x;
      var dY = y - this.y;
      var dist = (dX ** 2 + dY ** 2) ** 0.5;
      var theta = Math.atan2(dY, dX);
      var dTheta = theta - this.absAngle;
      dTheta -= 2 * Math.PI * Math.floor(dTheta / 2 / Math.PI + 1 / 2);
      if (dist > this.fThresh) {
        this.speed += this.fAccel * Math.abs(Math.cos(dTheta));
      }
      this.speed -= this.fFric * this.speed;
      this.speed *= 1 - this.fRes;
      if (Math.abs(dTheta) > this.rThresh) {
        this.angVel += this.rAccel * Math.sign(dTheta);
      }
      this.angVel -= this.rFric * this.angVel;
      this.angVel *= 1 - this.rRes;
      this.absAngle += this.angVel;
      this.x += this.speed * Math.cos(this.absAngle);
      this.y += this.speed * Math.sin(this.absAngle);
      this.absAngle += Math.PI;
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].follow(true);
      }
      for (var i = 0; i < this.systems.length; i++) {
        this.systems[i].update(x, y);
      }
      this.absAngle -= Math.PI;
      this.draw(true);
    }
    draw(iter) {
      var r = 4;
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        r,
        Math.PI / 4 + this.absAngle,
        7 * Math.PI / 4 + this.absAngle
      );
      ctx.moveTo(
        this.x + r * Math.cos(7 * Math.PI / 4 + this.absAngle),
        this.y + r * Math.sin(7 * Math.PI / 4 + this.absAngle)
      );
      ctx.lineTo(
        this.x + r * Math.cos(this.absAngle) * 2 ** 0.5,
        this.y + r * Math.sin(this.absAngle) * 2 ** 0.5
      );
      ctx.lineTo(
        this.x + r * Math.cos(Math.PI / 4 + this.absAngle),
        this.y + r * Math.sin(Math.PI / 4 + this.absAngle)
      );
      ctx.stroke();
      
      // Draw shield if active
      if (this.hasShield) {
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
      }
      
      if (iter) {
        for (var i = 0; i < this.children.length; i++) {
          this.children[i].draw(true);
        }
      }
    }
    
    grow(segmentSize) {
      this.lastSpinalSegment = new Segment(this.lastSpinalSegment, segmentSize, 0, 3.1415 * 2 / 3, 1.1);
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(this.lastSpinalSegment, segmentSize * 0.75, ii, 0.1, 2);
        for (var iii = 0; iii < 3; iii++) {
          node = new Segment(node, segmentSize * 0.75, -ii * 0.1, 0.1, 2);
        }
      }
    }
  }
  
  // ===== COLLISION CHECKING =====
  function checkFoodCollision() {
    if (!critter || !GameState.gameActive) return;
    
    var headRadius = 8;
    var foodBonus = activePowerUps.multiFoodBonus ? 2 : 1;
    
    for (var i = foods.length - 1; i >= 0; i--) {
      if (foods[i].isEatenBy(critter.x, critter.y, headRadius)) {
        foods.splice(i, 1);
        score += (10 * foodBonus);
        
        var s = 8 / Math.sqrt(legNum);
        critter.grow(s * 4);
        
        // Spawn power-up occasionally
        if (Math.random() < 0.1) {
          var types = ['shield', 'speedBoost', 'multiFood'];
          spawnPowerUp(types[Math.floor(Math.random() * types.length)], foods[i] ? foods[i].x : critter.x, foods[i] ? foods[i].y : critter.y);
        }
        
        updateScoreDisplay();
      }
    }
    
    spawnFood();
  }
  
  function checkObstacleCollision() {
    if (!critter || !GameState.gameActive) return;
    
    var headRadius = 8;
    
    for (var i = obstacles.length - 1; i >= 0; i--) {
      if (obstacles[i].collidesWith(critter.x, critter.y, headRadius)) {
        if (critter.hasShield) {
          critter.hasShield = false;
          obstacles.splice(i, 1);
        } else {
          endGame();
        }
      }
    }
  }
  
  function checkPowerUpCollision() {
    if (!critter || !GameState.gameActive) return;
    
    var headRadius = 8;
    
    for (var i = powerUps.length - 1; i >= 0; i--) {
      if (powerUps[i].isCollectedBy(critter.x, critter.y, headRadius)) {
        var type = powerUps[i].type;
        activatePowerUp(type);
        powerUps.splice(i, 1);
      }
    }
  }
  
  function activatePowerUp(type) {
    if (type === 'shield') {
      critter.hasShield = true;
    } else if (type === 'speedBoost') {
      critter.fAccel *= 1.5;
      setTimeout(() => { critter.fAccel /= 1.5; }, 5000);
    } else if (type === 'multiFood') {
      activePowerUps.multiFoodBonus = true;
      setTimeout(() => { activePowerUps.multiFoodBonus = false; }, 5000);
    }
  }
  
  // ===== GAME OVER & RESTART =====
  function endGame() {
    GameState.gameActive = false;
    updateHighScore();
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "32px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("High Score: " + GameState.highScore, canvas.width / 2, canvas.height / 2 + 60);
    ctx.font = "24px Arial";
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 120);
  }
  
  function updateHighScore() {
    if (score > GameState.highScore) {
      GameState.highScore = score;
      localStorage.setItem('highScore', GameState.highScore);
    }
  }
  
  function restartGame() {
    location.reload();
  }
  
  // ===== SETUP LIZARD =====
  var critter;
  var legNum;
  
  function setupLizard(size, legs, tail) {
    var s = size;
    critter = new Creature(
      window.innerWidth / 2,
      window.innerHeight / 2,
      0,
      s * 10,
      s * 2,
      0.5,
      16,
      0.5,
      0.085,
      0.5,
      0.3
    );
    var spinal = critter;
    
    for (var i = 0; i < 6; i++) {
      spinal = new Segment(spinal, s * 4, 0, 3.1415 * 2 / 3, 1.1);
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(spinal, s * 3, ii, 0.1, 2);
        for (var iii = 0; iii < 3; iii++) {
          node = new Segment(node, s * 0.1, -ii * 0.1, 0.1, 2);
        }
      }
    }
    
    for (var i = 0; i < legs; i++) {
      if (i > 0) {
        for (var ii = 0; ii < 6; ii++) {
          spinal = new Segment(spinal, s * 4, 0, 1.571, 1.5);
          for (var iii = -1; iii <= 1; iii += 2) {
            var node = new Segment(spinal, s * 3, iii * 1.571, 0.1, 1.5);
            for (var iv = 0; iv < 3; iv++) {
              node = new Segment(node, s * 3, -iii * 0.3, 0.1, 2);
            }
          }
        }
      }
      
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(spinal, s * 12, ii * 0.785, 0, 8);
        node = new Segment(node, s * 16, -ii * 0.785, 6.28, 1);
        node = new Segment(node, s * 16, ii * 1.571, 3.1415, 2);
        for (var iii = 0; iii < 4; iii++) {
          new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4);
        }
        new LegSystem(node, 3, s * 12, critter);
      }
    }
    
    for (var i = 0; i < tail; i++) {
      spinal = new Segment(spinal, s * 4, 0, 3.1415 * 2 / 3, 1.1);
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(spinal, s * 3, ii, 0.1, 2);
        for (var iii = 0; iii < 3; iii++) {
          node = new Segment(node, s * 3 * (tail - i) / tail, -ii * 0.1, 0.1, 2);
        }
      }
    }
    
    critter.lastSpinalSegment = spinal;
    
    for (var i = 0; i < maxFoods; i++) {
      spawnFood();
    }
    
    updateScoreDisplay();
    
    // Start obstacle spawner based on difficulty
    var settings = DifficultySettings[GameState.difficulty];
    obstacleSpawner = setInterval(spawnObstacle, settings.obstacleFrequency);
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw food
      for (var i = 0; i < foods.length; i++) {
        foods[i].draw();
      }
      
      // Draw obstacles
      for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        obstacles[i].draw();
        
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1);
        }
      }
      
      // Draw power-ups
      for (var i = 0; i < powerUps.length; i++) {
        powerUps[i].draw();
        if (powerUps[i].isExpired()) {
          powerUps.splice(i, 1);
        }
      }
      
      // Update and draw lizard
      if (GameState.gameActive) {
        critter.follow(Input.mouse.x, Input.mouse.y);
        checkFoodCollision();
        checkObstacleCollision();
        checkPowerUpCollision();
      }
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }
  
  canvas.style.backgroundColor = "black";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  
  legNum = Math.floor(1 + Math.random() * 12);
  setupLizard(
    8 / Math.sqrt(legNum),
    legNum,
    Math.floor(4 + Math.random() * legNum * 8)
  );
  
  // Handle window resize
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  // Handle restart key press
  document.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
      if (!GameState.gameActive) {
        restartGame();
      }
    }
  });
  
  // Difficulty selection (can be called via browser console or UI)
  function setDifficulty(level) {
    if (DifficultySettings[level]) {
      GameState.difficulty = level;
      maxFoods = DifficultySettings[level].maxFoods;
      console.log('Difficulty set to: ' + level);
    }
  }