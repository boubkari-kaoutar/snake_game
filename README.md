# Snake Steering Behavior Game
## An Interactive Exploration of Steering Behaviors in Artificial Intelligence

1. Project Overview

This project is an interactive 2D game built with p5.js to experiment with classic steering behaviors used in autonomous agents. Instead of steering the snake head directly, you guide a floating leader (the "eye"), so you can see how steering forces propagate through a multi-segment body. The world mixes player control, AI prey and predators, food, and obstacles that all react in real time.

2. Educational Objectives

- Implement and observe steering behaviors: Seek, Flee, Arrive, Wander, Pursue, Evade.
- Study emergent motion when multiple forces blend together.
- Explore multi-agent interactions (player snake, prey snakes, predator snakes).
- Provide a visual, hands-on tool for learning autonomous movement in AI systems.
- Show how abstract AI concepts feel inside a playful simulation.

3. Game Concept and Mechanics
3.1 Player Interaction
- Mouse drives a floating leader (eye).
- Snake head seeks/arrives at the eye; body segments follow via distance constraints and smoothing.
- Emphasis: behavior-based movement instead of direct steering.

3.2 Scoring and Progression
- Food pellets: +1 point, grow the snake.
- Small AI snakes (prey): +5 points, +2 segments; they try to evade you.
- Five levels get progressively harder (faster snake, more predators, more deadly obstacles).
- Win by finishing Level 5. Lose on contact with a predator or any deadly obstacle.

4. Artificial Intelligence Design
4.1 Steering Behavior Architecture
- Reusable Vehicle model computes steering from desired velocity, current velocity, max force, and max speed.
- Behaviors blend through weighted forces for smooth, adaptive motion.

4.2 Agent Types
- Player Snake: seek/arrive toward the eye, avoid obstacles (green), separate segments to keep spacing.
- Small AI Snakes (Prey): evade the player, wander when safe, avoid obstacles; add risk/reward and show reactive AI.
- Large AI Snakes (Predators): pursue the player, avoid obstacles; create pressure and show aggressive pursuit.

5. Environment and Obstacles
- Food pellets: pulsing visuals for feedback.
- Green obstacles: soft; slow you when touched.
- Red obstacles: lethal; instant game over. These reinforce awareness and tuning of avoidance behavior.

6. Game Modes and Debug Tools
6.1 Special Modes
- Text Mode (T): snake rearranges to spell "SNAKE" to demonstrate formation control.
- Debug Mode (D): visualizes steering ranges, segment links, and behavior zones. These are for learning and experimentation.

7. System Architecture
7.1 File Structure
- index.html � loads p5.js and all game scripts.
- sketch.js � main loop, level logic, UI, transitions, modes.
- ehicle.js � core steering behaviors.
- snake.js � player snake body, following, collisions.
- iSnake.js � prey/predator AI snakes.
- eye.js � player-controlled leader target.
- ood.js, obstacle.js � collectibles and hazards.
- style.css � UI and layout styling.
- snake.jfif � background image.

8. Technical Stack
- Language: JavaScript
- Library: p5.js
- Paradigm: behavior-based AI
- Rendering: responsive canvas
- Deployment: static web project (served locally)

9. Installation and Execution
To avoid file:// security limits, run a simple local server from snake_game/:
- Python: python -m http.server 8000
- Node.js: 
px http-server .
Then open http://localhost:8000/index.html in your browser.

10. Parameter Tuning and Experimentation
The right-hand UI panel lets you adjust in real time:
- Snake speed
- Segment spacing
- Obstacle avoidance weight
- Number of deadly obstacles
Use these to study emergent behavior and stability.

11. Learning Outcomes
- Hands-on implementation of steering behaviors.
- Multi-agent interaction design.
- Behavior blending and parameter tuning.
- AI visualization and debugging.
- Game-based learning for autonomous movement.

12. Conclusion and Perspectives
This project shows how classic AI movement algorithms become tangible in an interactive setting. Indirect control, varied agents, and live tuning make it both a learning lab and a playground for behavior-based AI. Possible extensions:
- Genetic algorithms to evolve behaviors
- Reinforcement learning for adaptive predators
- Pathfinding (A*) for structured navigation
- 3D or physics-driven variants
