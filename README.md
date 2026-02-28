# Reptile-interactive-cursor
🦎 Reptile Interactive Cursor  A mesmerizing interactive creature simulation where a procedural lizard follows your mouse cursor, eats food, and grows longer! Built with vanilla JavaScript and HTML5 Canvas.

🦎 Reptile Interactive Cursor

A mesmerizing interactive creature simulation where a procedural lizard follows your mouse cursor, eats food, and grows longer! Built with vanilla JavaScript and HTML5 Canvas.

demo.gif

✨ Features

· Realistic Creature Physics – The lizard has a flexible spine, articulated legs, and natural movement
· Interactive Mouse Tracking – The creature's head follows your cursor with smooth acceleration
· Growth System – Eat green food pellets to make the lizard grow longer
· Procedural Generation – Each lizard is randomly generated with different numbers of legs and tail length
· Score Tracking – Real-time display of score and total segment count
· Responsive Canvas – Automatically adjusts to window size

🎮 How to Play

1. Move your mouse to control where the lizard's head goes
2. Guide the head over the green food pellets to eat them
3. Watch the lizard grow longer with each food eaten
4. Try to grow the longest lizard possible!

🚀 Quick Start

Option 1: Direct Download

1. Download index.html and script.js
2. Open index.html in a modern web browser
3. Start playing!

Option 2: Clone Repository

```bash
git clone https://github.com/yourusername/reptile-interactive-cursor.git
cd reptile-interactive-cursor
# Open index.html in your browser
```

Option 3: Live Server (Recommended for Development)

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx live-server

# Then open http://localhost:8000
```

🛠️ Technical Details

Built With

· HTML5 Canvas
· Vanilla JavaScript (ES6+)
· No external dependencies (except eruda for debugging)

Key Classes

Class Description
Creature Main creature controller with physics
Segment Building block for spines, legs, and tails
LimbSystem Handles limb IK (Inverse Kinematics)
LegSystem Specialized limb system for walking
Food Food pellets for growth

Core Mechanics

```javascript
// Each food eaten adds a new tail segment
function checkFoodCollision() {
  if (food.isEatenBy(critter.x, critter.y)) {
    score += 10;
    critter.grow(segmentSize); // Adds new segment!
  }
}
```

🎨 Customization

You can easily modify the lizard's appearance and behavior in script.js:

```javascript
// Adjust these parameters
legNum = Math.floor(1 + Math.random() * 12); // Number of legs (1-12)
maxFoods = 8;                                 // Maximum food on screen
foodRadius = 6;                               // Size of food pellets

// Change creature physics
critter = new Creature(
  x, y, angle,           // Position and orientation
  fAccel, fFric, fRes,   // Forward movement
  fThresh,               // Distance threshold
  rAccel, rFric, rRes,   // Rotation movement
  rThresh                // Angle threshold
);
```

📁 Project Structure

```
reptile-interactive-cursor/
├── index.html          # Main HTML file
├── script.js           # All game logic
├── README.md           # This file
├── LICENSE            # MIT License
└── demo.gif           # Demo animation (optional)
```

🔧 Browser Compatibility

Tested and working on:

· Chrome (latest)
· Firefox (latest)
· Safari (latest)
· Edge (latest)
· Mobile browsers (basic touch support)

🐛 Known Issues & Fixes

Issue Solution
Mouse buttons not working Fixed – use === instead of =
Incorrect segment count Fixed – proper nested segment counting
Janky animation Fixed – uses requestAnimationFrame
Canvas resize issues Fixed – added window resize handler

🤝 Contributing

Contributions are welcome! Here are some ideas to get started:

· Add different creature types (snake, spider, octopus)
· Implement obstacles or hazards
· Add sound effects
· Create level progression system
· Improve leg movement physics
· Add touch support for mobile
· Create color customization options
· Add save/load functionality for creatures

Contribution Steps

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

📝 License

This project is licensed under the MIT License – see the LICENSE file for details.

```
MIT License

Copyright (c) 2024 @coding.stella

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

🙏 Acknowledgments

· Inspired by procedural animation systems and inverse kinematics tutorials
· Created by @coding.stella
· Thanks to all contributors and testers
· Special thanks to the open-source community

📊 Project Stats

· Lines of Code: ~500
· Files: 2
· Dependencies: 0
· Browser Support: Modern browsers
· Performance: 60fps on most devices

🔮 Future Plans

· WebGL version for better performance
· Multiple creature types
· Breeding/genetics system
· Online leaderboard
· Creature editor
· Export/share creatures

💬 FAQ

Q: Why does the lizard move weirdly?
A: It uses inverse kinematics for natural movement – it's supposed to look organic!

Q: Can I change the colors?
A: Yes! Modify ctx.strokeStyle and ctx.fillStyle in the code.

Q: How long can the lizard grow?
A: There's no limit – it can grow indefinitely!

Q: Does it work on mobile?
A: Basic touch support works, but it's optimized for mouse.

🌟 Support

If you find this project interesting, please consider:

· Giving it a ⭐ star on GitHub
· Sharing it with friends
· Contributing to development
· Reporting bugs or suggesting features

---

Happy growing! 🦎✨

---

<sub>Made with ❤️ and JavaScript</sub>
