// Snake Steering Behavior Game
// Le snake suit un "eye" contrôlé par la souris pour attraper des pièces
// Mode Snake, Mode Texte (T), Mode Debug (D)
// Le jeu se termine quand le snake touche un obstacle rouge

let snake;
let eye;
let food = []; // Petits points à manger
let obstacles = [];
let deadlyObstacles = [];

// Score
let score = 0;
let gameOver = false;
let gameWon = false;

// Mode
let mode = "game"; // "game", "text"

// Sliders
let snakeLengthSlider;
let segmentDistanceSlider;
let avoidWeightSlider;
let snakeSpeedSlider;
let nbObstaclesSlider;

// Texte
let textPoints = [];

// Image de fond
let bgImage;

function preload() {
  // Charger l'image de fond
  bgImage = loadImage('snake.jfif');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Créer les sliders
  createSliders();

  // Créer le eye (cible contrôlée par la souris) - leader
  eye = new Eye(width / 2, height / 2);

  // Créer le snake - commence avec 3 segments
  snake = new Snake(width / 2, height / 2 + 100, 3);
  snake.maxSpeed = snakeSpeedSlider.value();

  // Créer les obstacles normaux (plus petits)
  for (let i = 0; i < 5; i++) {
    let obs = new Obstacle(random(100, width - 100), random(100, height - 100),
                          random(20, 35), color(100, 255, 100), false);
    obstacles.push(obs);
  }

  // Créer les obstacles mortels (plus petits)
  createDeadlyObstacles(nbObstaclesSlider.value());

  // Créer les premiers points de nourriture
  for (let i = 0; i < 15; i++) {
    spawnFood();
  }
}

function createSliders() {
  let yPos = 10;
  let xPos = 10;

  // Slider distance entre segments
  createP('Distance Segments:').position(xPos, yPos).style('color', 'white');
  segmentDistanceSlider = createSlider(10, 30, 15, 2);
  segmentDistanceSlider.position(xPos + 200, yPos + 15);
  segmentDistanceSlider.size(150);

  yPos += 50;

  // Slider poids évitement
  createP('Poids Évitement:').position(xPos, yPos).style('color', 'lime');
  avoidWeightSlider = createSlider(0, 5, 2.5, 0.1);
  avoidWeightSlider.position(xPos + 200, yPos + 15);
  avoidWeightSlider.size(150);

  yPos += 50;

  // Slider vitesse snake
  createP('Vitesse Snake:').position(xPos, yPos).style('color', 'cyan');
  snakeSpeedSlider = createSlider(2, 8, 4, 0.5);
  snakeSpeedSlider.position(xPos + 200, yPos + 15);
  snakeSpeedSlider.size(150);

  yPos += 50;

  // Slider nombre d'obstacles mortels
  createP('Obstacles Mortels:').position(xPos, yPos).style('color', 'red');
  nbObstaclesSlider = createSlider(3, 15, 5, 1);
  nbObstaclesSlider.position(xPos + 200, yPos + 15);
  nbObstaclesSlider.size(150);
  nbObstaclesSlider.input(adjustDeadlyObstacles);

  yPos += 70;

  // Instructions
  createP('Contrôlez l\'oeil avec la souris').position(xPos, yPos).style('color', 'gold');
  createP('T = Mode Texte | D = Debug | R = Reset').position(xPos, yPos + 25).style('color', 'cyan');
  createP('Évitez les obstacles ROUGES !').position(xPos, yPos + 50).style('color', 'red');
}

function adjustDeadlyObstacles() {
  createDeadlyObstacles(nbObstaclesSlider.value());
}

function createDeadlyObstacles(count) {
  deadlyObstacles = [];
  for (let i = 0; i < count; i++) {
    let obs = new Obstacle(random(100, width - 100), random(100, height - 100),
                          random(15, 25), color(255, 50, 50), true);
    deadlyObstacles.push(obs);
  }
}

function spawnFood() {
  // Générer un point de nourriture qui ne chevauche pas les obstacles
  let maxAttempts = 50;
  let attempts = 0;
  let validPosition = false;
  let x, y;

  while (!validPosition && attempts < maxAttempts) {
    x = random(80, width - 80);
    y = random(80, height - 80);
    validPosition = true;

    // Vérifier la distance avec tous les obstacles
    let allObstacles = [...obstacles, ...deadlyObstacles];
    for (let obs of allObstacles) {
      let d = dist(x, y, obs.pos.x, obs.pos.y);
      // Distance minimale = rayon obstacle + rayon food + marge de sécurité
      let minDistance = obs.r + 5 + 20;
      if (d < minDistance) {
        validPosition = false;
        break;
      }
    }

    attempts++;
  }

  // Si on n'a pas trouvé de position valide, utiliser une position aléatoire
  if (!validPosition) {
    x = random(100, width - 100);
    y = random(100, height - 100);
  }

  let foodItem = new Food(x, y);
  food.push(foodItem);
}

function createTextPoints() {
  // Générer les points pour "SNAKE"
  textPoints = [];
  let txt = 'SNAKE';
  let startX = width / 2 - 250;
  let y = height / 2;
  let spacing = 100;

  let letterShapes = {
    'S': [
      // Arc supérieur
      [25, -40], [15, -40], [5, -40], [-5, -35], [-15, -30], [-20, -20],
      // Milieu
      [-15, -10], [-5, -5], [5, -5], [15, -10],
      // Arc inférieur
      [20, 0], [20, 10], [15, 20], [5, 30], [-5, 35], [-15, 40], [-25, 40]
    ],
    'N': [
      // Ligne gauche
      [-20, -40], [-20, -30], [-20, -20], [-20, -10], [-20, 0], [-20, 10], [-20, 20], [-20, 30], [-20, 40],
      // Diagonale
      [-10, -20], [0, -10], [10, 0], [20, 10], [20, 20],
      // Ligne droite
      [20, -40], [20, -30], [20, -20], [20, 30], [20, 40]
    ],
    'A': [
      [-20, 40], [-15, 30], [-10, 20], [-5, 10], [0, 0], [0, -10], [0, -20], [0, -30], [0, -40],
      [20, 40], [15, 30], [10, 20], [5, 10], [0, 0],
      [-10, 10], [-5, 10], [0, 10], [5, 10], [10, 10]
    ],
    'K': [
      [0, -40], [0, -30], [0, -20], [0, -10], [0, 0], [0, 10], [0, 20], [0, 30], [0, 40],
      [10, -20], [20, -30], [30, -40],
      [10, 0], [20, 10], [30, 20], [30, 30], [30, 40]
    ],
    'E': [
      [-20, -40], [-20, -30], [-20, -20], [-20, -10], [-20, 0], [-20, 10], [-20, 20], [-20, 30], [-20, 40],
      [-15, -40], [-10, -40], [-5, -40], [0, -40], [5, -40], [10, -40], [15, -40],
      [-15, 0], [-10, 0], [-5, 0], [0, 0], [5, 0], [10, 0],
      [-15, 40], [-10, 40], [-5, 40], [0, 40], [5, 40], [10, 40], [15, 40]
    ]
  };

  for (let i = 0; i < txt.length; i++) {
    let char = txt[i];
    let charX = startX + i * spacing;
    let shape = letterShapes[char];

    if (shape) {
      shape.forEach(point => {
        textPoints.push({x: charX + point[0], y: y + point[1]});
      });
    }
  }
}

function draw() {
  // Fond avec image
  if (bgImage) {
    push();
    tint(255, 180); // Transparence pour voir les éléments
    image(bgImage, 0, 0, width, height);
    pop();
  }

  // Overlay semi-transparent
  background(0, 0, 0, 30);

  // Afficher Game Over ou Game Won
  if (gameOver) {
    displayGameOver();
    return;
  }

  if (gameWon) {
    displayGameWon();
    return;
  }

  // Mise à jour des paramètres
  snake.maxSpeed = snakeSpeedSlider.value();
  snake.segmentDistance = segmentDistanceSlider.value();

  // === MODE GAME ===
  if (mode === "game") {
    // Le eye (leader) suit la souris
    eye.pos.x = mouseX;
    eye.pos.y = mouseY;

    // L'oeil regarde vers la tête du snake
    if (snake && snake.segments.length > 0) {
      eye.lookAt(snake.segments[0].pos);
    }

    eye.show();

    // Dessiner les obstacles
    obstacles.forEach(o => o.show());
    deadlyObstacles.forEach(o => o.show());

    // Dessiner les points de nourriture
    food.forEach(f => f.show());

    // Comportement du snake: suivre l'eye
    let allObstacles = [...obstacles, ...deadlyObstacles];

    let followForce = snake.follow(eye);
    let avoidForce = snake.avoidObstacles(allObstacles);
    let separateForce = snake.separate();

    followForce.mult(1.2);
    avoidForce.mult(avoidWeightSlider.value());
    separateForce.mult(0.3);

    snake.applyForce(followForce);
    snake.applyForce(avoidForce);
    snake.applyForce(separateForce);

    snake.update();
    snake.boundaries(); // Rebondit sur les bords
    snake.show();

    // Vérifier collision avec la nourriture
    for (let i = food.length - 1; i >= 0; i--) {
      if (snake.checkFoodCollision(food[i])) {
        food.splice(i, 1);
        score++;

        // Faire grandir le snake
        snake.grow();

        // Ajouter 2 nouveaux points de nourriture
        spawnFood();
        spawnFood();
      }
    }

    // Maintenir au moins 10 points de nourriture
    while (food.length < 10) {
      spawnFood();
    }

    // Vérifier collision avec obstacles mortels (ROUGES) - Game Over
    deadlyObstacles.forEach(obs => {
      if (snake.checkObstacleCollision(obs)) {
        gameOver = true;
      }
    });

    // Vérifier collision avec obstacles normaux (VERTS) - Ralentit mais pas de game over
    obstacles.forEach(obs => {
      if (snake.checkNormalObstacleCollision(obs)) {
        // Le snake ralentit temporairement quand il touche un obstacle vert
        snake.maxSpeed = max(snake.maxSpeed * 0.5, 2);
      }
    });

    // Condition de victoire: 30 points collectés
    if (score >= 30) {
      gameWon = true;
    }
  }

  // === MODE TEXT ===
  else if (mode === "text") {
    // Dessiner les points du texte
    push();
    fill(255, 0, 255);
    noStroke();
    textPoints.forEach(pt => {
      circle(pt.x, pt.y, 4);
    });
    pop();

    // Le snake forme le mot "SNAKE"
    let allSegments = snake.getSegments();
    allSegments.forEach((segment, i) => {
      if (i < textPoints.length) {
        let target = createVector(textPoints[i].x, textPoints[i].y);
        let arriveForce = segment.arrive(target, 50);
        segment.applyForce(arriveForce);
      }
      segment.update();
      segment.show();
    });
  }

  // Affichage des informations
  displayInfo();
}

function displayInfo() {
  push();
  fill(255);
  textSize(18);
  textAlign(RIGHT, TOP);

  let modeText = mode === "game" ? "GAME MODE" : "TEXT MODE";
  fill(0, 255, 255);
  text(`Mode: ${modeText}`, width - 20, 20);

  fill(255, 215, 0);
  text(`Score: ${score} / 30`, width - 20, 50);

  fill(255);
  text(`Snake Length: ${snake.segments.length}`, width - 20, 80);
  text(`Food: ${food.length}`, width - 20, 110);

  if (Snake.debug) {
    fill(0, 255, 0);
    text('MODE DEBUG ACTIVÉ', width - 20, 140);
  }
  pop();
}

function displayGameOver() {
  background(20, 0, 0);

  push();
  textAlign(CENTER, CENTER);
  textSize(80);
  fill(255, 0, 0);
  text('GAME OVER', width / 2, height / 2 - 50);

  textSize(40);
  fill(255);
  text(`Score Final: ${score}`, width / 2, height / 2 + 50);

  textSize(24);
  fill(255, 255, 0);
  text('Appuyez sur R pour recommencer', width / 2, height / 2 + 120);
  pop();
}

function displayGameWon() {
  background(0, 20, 0);

  push();
  textAlign(CENTER, CENTER);
  textSize(80);
  fill(0, 255, 0);
  text('VICTOIRE !', width / 2, height / 2 - 50);

  textSize(40);
  fill(255);
  text(`Score: ${score} / 30`, width / 2, height / 2 + 50);

  textSize(24);
  fill(255, 255, 0);
  text('Vous avez collecté tous les points !', width / 2, height / 2 + 120);
  text('Appuyez sur R pour recommencer', width / 2, height / 2 + 160);
  pop();
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Snake.debug = !Snake.debug;
  }

  if (key === 'r' || key === 'R') {
    // Reset
    resetGame();
  }

  if (key === 't' || key === 'T') {
    // Mode Texte
    if (mode === "game") {
      mode = "text";
      createTextPoints();
      console.log("Mode TEXTE activé");
    } else {
      mode = "game";
      console.log("Mode GAME activé");
    }
  }
}

function resetGame() {
  score = 0;
  gameOver = false;
  gameWon = false;
  mode = "game";

  // Réinitialiser le snake - commence avec 3 segments
  snake = new Snake(width / 2, height / 2 + 100, 3);
  snake.maxSpeed = snakeSpeedSlider.value();

  // Réinitialiser les obstacles
  obstacles = [];
  for (let i = 0; i < 5; i++) {
    let obs = new Obstacle(random(100, width - 100), random(100, height - 100),
                          random(20, 35), color(100, 255, 100), false);
    obstacles.push(obs);
  }

  createDeadlyObstacles(nbObstaclesSlider.value());

  // Réinitialiser la nourriture
  food = [];
  for (let i = 0; i < 15; i++) {
    spawnFood();
  }

  console.log("Jeu réinitialisé !");
}
