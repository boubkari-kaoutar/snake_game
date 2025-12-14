# Snake Steering Behavior Game

I am building this project as an AI student to explore steering behaviors (seek, flee, arrive, wander, pursue/evade) in a playful snake game using p5.js. You pilot a snake indirectly through a floating "eye" cursor while the world reacts with food, obstacles, and AI-driven snakes.

## How to Play
- Move your mouse inside the blue game area: the eye follows the cursor and the player snake follows the eye.
- Eat food pellets (+1) to grow; collect enough points to progress through 5 levels.
- Small AI snakes count as bonus prey (+5, +2 segments) but will try to run away.
- Large AI snakes are predators: avoid them or it is game over.
- Green obstacles are soft: touching them slows you. Red obstacles are deadly: touching them ends the run.
- Win by reaching the score target at level 5; lose on any collision with a red obstacle or predator.

## Controls
- Mouse: steer the eye (and thus the snake) within the play area.
- T: toggle Text mode (snake arranges itself to spell "SNAKE").
- D: toggle Debug overlays (ranges, links between segments, etc.).
- R: reset to level 1.
- Enter: advance when the between-level freeze is active.
- UI sliders (right panel): segment spacing, avoidance weight, snake speed, number of deadly obstacles.

## Game Loop & Systems
- Levels: 5 stages with increasing speed, more food required, and more deadly obstacles/predators.
- Steering: core behaviors live in `vehicle.js`; `snake.js` manages a head plus following segments; `aiSnake.js` defines small prey (evade) and large predators (pursue) with obstacle avoidance and separation.
- Entities: `food.js` (pulsing pellets), `obstacle.js` (green soft walls, red lethal), `eye.js` (leader you steer).
- Rendering & flow: `sketch.js` sets up the canvas, UI, level config, scoring, transitions, and modes. Styling is in `style.css`; `index.html` wires p5.js and scripts; `snake.jfif` is the background image.

## Running Locally
- Install nothing extra; it is plain p5.js. From `snake_game/`, start a simple server so the image and scripts load cleanly (prevents browser file:// security issues):
  - Python: `python -m http.server 8000`
  - Node: `npx http-server .`
- Open `http://localhost:8000/index.html` in your browser. Resize the window; the canvas adapts.

## Tips for Tuning
- Increase avoidance weight if you clip green obstacles too often; decrease if the snake feels jittery.
- Lower segment distance for a tighter, smoother body; raise it for a looser chain look.
- Slow the snake when learning the controls, then ramp speed as you get comfortable.
- Use Debug mode to visualize pursuit/evade ranges and segment links when experimenting.

## Folder Overview
- `index.html` � loads p5.js and all scripts.
- `sketch.js` � main game loop, levels, UI, and transitions.
- `vehicle.js` � reusable steering behaviors.
- `snake.js` � player snake body/segment logic and collisions.
- `aiSnake.js` � prey/predator AI snakes.
- `eye.js` � player-controlled leader target.
- `food.js`, `obstacle.js` � collectibles and hazards.
- `style.css` � minimal styling for canvas and sliders.
- `snake.jfif` � background image.

Have fun experimenting with the behaviors and tweaking the sliders to see how the ecosystem of snakes reacts.
