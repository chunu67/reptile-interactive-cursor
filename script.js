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
    // Fix: Use === for comparison, not =
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
    // Fix: Use === for comparison, not =
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
  
  //Food System Variables
  var foods = [];
  var score = 0;
  var foodRadius = 6;
  var maxFoods = 8; // Increased from 5 for more food
  
  //Sets up canvas
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = Math.max(window.innerWidth, window.innerWidth);
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  document.body.style.overflow = "hidden";
  var ctx = canvas.getContext("2d");
  
  //Food Class
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
  
  //Function to spawn food
  function spawnFood() {
    if (foods.length < maxFoods) {
      foods.push(new Food());
    }
  }
  
  //Function to update score display
  function updateScoreDisplay() {
    var scoreElement = document.getElementById('scoreDisplay');
    if (scoreElement && critter) {
      // Fix: Properly count all segments
      var segmentCount = countAllSegments(critter);
      scoreElement.textContent = 'Score: ' + score + ' | Length: ' + segmentCount;
    }
  }
  
  //Function to count all segments (fixed)
  function countAllSegments(node) {
    if (!node || !node.children) return 0;
    
    var count = node.children.length;
    for (var i = 0; i < node.children.length; i++) {
      count += countAllSegments(node.children[i]);
    }
    return count;
  }
  
  //Necessary classes
  var segmentCount = 0;
  class Segment {
    constructor(parent, size, angle, range, stiffness) {
      segmentCount++;
      this.isSegment = true;
      this.parent = parent; //Segment which this one is connected to
      if (typeof parent.children == "object") {
        parent.children.push(this);
      }
      this.children = []; //Segments connected to this segment
      this.size = size; //Distance from parent
      this.relAngle = angle; //Angle relative to parent
      this.defAngle = angle; //Default angle relative to parent
      this.absAngle = parent.absAngle + angle; //Angle relative to x-axis
      this.range = range; //Difference between maximum and minimum angles
      this.stiffness = stiffness; //How closely it conforms to default angle
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
      this.x = this.parent.x + Math.cos(this.absAngle) * this.size; //Position
      this.y = this.parent.y + Math.sin(this.absAngle) * this.size; //Position
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
  class LegSystem extends LimbSystem {
    constructor(end, length, speed, creature) {
      super(end, length, speed, creature);
      this.goalX = end.x;
      this.goalY = end.y;
      this.step = 0; //0 stand still, 1 move forward,2 move towards foothold
      this.forwardness = 0;
  
      //For foot goal placement
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
      this.x = x; //Position
      this.y = y;
      this.speed = 0; //Linear velocity
      this.fRes = fRes; //Forward resistance
      this.fFric = fFric; //Forward friction
      this.fAccel = fAccel; //Forward acceleration
      this.fThresh = fThresh; //Threshold distance for acceleration
      this.absAngle = angle; //Rotational position (bearing)
      this.angVel = 0; //Angular velocity
      this.rRes = rRes; //Rotational resistance
      this.rFric = rFric; //Rotational friction
      this.rAccel = rAccel; //Rotational acceleration
      this.rThresh = rThresh; //Threshold angle for acceleration (radians)
      this.children = [];
      this.systems = [];
      this.lastSpinalSegment = this; // Track the last segment of the spine
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
      if (iter) {
        for (var i = 0; i < this.children.length; i++) {
          this.children[i].draw(true);
        }
      }
    }
    
    //Function to grow the lizard by adding a segment to the tail
    grow(segmentSize) {
      //Add segment to the last spinal segment
      this.lastSpinalSegment = new Segment(this.lastSpinalSegment, segmentSize, 0, 3.1415 * 2 / 3, 1.1);
      
      //Add decorative segments (ribs/spines)
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(this.lastSpinalSegment, segmentSize * 0.75, ii, 0.1, 2);
        for (var iii = 0; iii < 3; iii++) {
          node = new Segment(node, segmentSize * 0.75, -ii * 0.1, 0.1, 2);
        }
      }
    }
  }
  
  //Function to check food collision and handle eating
  function checkFoodCollision() {
    if (!critter) return;
    
    var headRadius = 8; // Approximate head collision radius
    
    for (var i = foods.length - 1; i >= 0; i--) {
      if (foods[i].isEatenBy(critter.x, critter.y, headRadius)) {
        //Remove the food
        foods.splice(i, 1);
        
        //Increase score
        score += 10;
        
        //Grow the lizard
        var s = 8 / Math.sqrt(legNum); // Same size calculation as initial setup
        critter.grow(s * 4);
        
        //Update score display
        updateScoreDisplay();
      }
    }
    
    //Spawn new food if needed
    spawnFood();
  }
  
  //Initializes and animates
  var critter;
  var legNum;
  
  function setupLizard(size, legs, tail) {
    var s = size;
    //(x,y,angle,fAccel,fFric,fRes,fThresh,rAccel,rFric,rRes,rThresh)
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
    //(parent,size,angle,range,stiffness)
    //Neck
    for (var i = 0; i < 6; i++) {
      spinal = new Segment(spinal, s * 4, 0, 3.1415 * 2 / 3, 1.1);
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(spinal, s * 3, ii, 0.1, 2);
        for (var iii = 0; iii < 3; iii++) {
          node = new Segment(node, s * 0.1, -ii * 0.1, 0.1, 2);
        }
      }
    }
    //Torso and legs
    for (var i = 0; i < legs; i++) {
      if (i > 0) {
        //Vertebrae and ribs
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
      //Legs and shoulders
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(spinal, s * 12, ii * 0.785, 0, 8); //Hip
        node = new Segment(node, s * 16, -ii * 0.785, 6.28, 1); //Humerus
        node = new Segment(node, s * 16, ii * 1.571, 3.1415, 2); //Forearm
        for (
          var iii = 0;
          iii < 4;
          iii++ //fingers
        ) {
          new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4);
        }
        new LegSystem(node, 3, s * 12, critter);
      }
    }
    //Tail
    for (var i = 0; i < tail; i++) {
      spinal = new Segment(spinal, s * 4, 0, 3.1415 * 2 / 3, 1.1);
      for (var ii = -1; ii <= 1; ii += 2) {
        var node = new Segment(spinal, s * 3, ii, 0.1, 2);
        for (var iii = 0; iii < 3; iii++) {
          node = new Segment(node, s * 3 * (tail - i) / tail, -ii * 0.1, 0.1, 2);
        }
      }
    }
    
    //Track the last spinal segment for growth
    critter.lastSpinalSegment = spinal;
    
    //Spawn initial food
    for (var i = 0; i < maxFoods; i++) {
      spawnFood();
    }
    
    //Update initial score display
    updateScoreDisplay();
    
    //Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      //Draw food
      for (var i = 0; i < foods.length; i++) {
        foods[i].draw();
      }
      
      //Update and draw lizard
      critter.follow(Input.mouse.x, Input.mouse.y);
      
      //Check for food collision
      checkFoodCollision();
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }
  
  canvas.style.backgroundColor = "black";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  
  // Start the simulation
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
