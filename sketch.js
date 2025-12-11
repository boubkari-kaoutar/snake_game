// Snake Steering Behavior Game
// Le snake suit un "eye" contrôlé par la souris pour attraper des pièces
// Mode Snake, Mode Texte (T), Mode Debug (D)
// Le jeu se termine quand le snake touche un obstacle rouge

let snake;
let eye;
let food = []; // Petits points à manger
let obstacles = [];
let deadlyObstacles = [];

// Score et Niveaux
let score = 0;
let currentLevel = 1;
let maxLevel = 5;
let pointsPerLevel = 10; // Points nécessaires pour passer au niveau suivant
let gameOver = false;
let gameWon = false;
let levelTransition = false;
let transitionTimer = 0;

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

// Zones d'interface
let gameArea = {
  x: 20,
  y: 20,
  width: 0,
  height: 0
};

let controlPanel = {
  x: 0,
  y: 20,
  width: 300,
  height: 0
};

function preload() {
  // Charger l'image de fond
  bgImage = loadImage('snake.jfif');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Calculer les dimensions des zones
  controlPanel.x = width - controlPanel.width - 20;
  controlPanel.height = height - 40;
  gameArea.width = controlPanel.x - gameArea.x - 20;
  gameArea.height = height - 40;

  // Créer les sliders
  createSliders();

  // Créer le eye (cible contrôlée par la souris) - leader dans la zone de jeu
  eye = new Eye(gameArea.x + gameArea.width / 2, gameArea.y + gameArea.height / 2);

  // Créer le snake - commence avec 3 segments dans la zone de jeu
  snake = new Snake(gameArea.x + gameArea.width / 2, gameArea.y + gameArea.height / 2 + 100, 3);
  snake.maxSpeed = snakeSpeedSlider.value();

  // Initialiser le niveau 1
  initLevel(currentLevel);
}

// Fonction pour initialiser un niveau avec difficulté progressive
function initLevel(level) {
  // Nettoyer les obstacles et nourriture existants
  obstacles = [];
  deadlyObstacles = [];
  food = [];

  // Configuration selon le niveau
  let config = getLevelConfig(level);

  // Créer les obstacles normaux (verts) - taille réduite dans la zone de jeu
  for (let i = 0; i < config.normalObstacles; i++) {
    let obs = new Obstacle(
      random(gameArea.x + 60, gameArea.x + gameArea.width - 60),
      random(gameArea.y + 60, gameArea.y + gameArea.height - 60),
      random(12, 20), color(100, 255, 100), false);
    obstacles.push(obs);
  }

  // Créer les obstacles mortels (rouges) - taille réduite dans la zone de jeu
  for (let i = 0; i < config.deadlyObstacles; i++) {
    let obs = new Obstacle(
      random(gameArea.x + 60, gameArea.x + gameArea.width - 60),
      random(gameArea.y + 60, gameArea.y + gameArea.height - 60),
      random(10, 16), color(255, 50, 50), true);
    deadlyObstacles.push(obs);
  }

  // Créer la nourriture
  for (let i = 0; i < config.foodCount; i++) {
    spawnFood();
  }

  // Ajuster la vitesse du snake selon le niveau
  snake.maxSpeed = config.snakeSpeed;
  snakeSpeedSlider.value(config.snakeSpeed);
}

// Configuration de difficulté par niveau
function getLevelConfig(level) {
  switch(level) {
    case 1:
      return {
        normalObstacles: 3,
        deadlyObstacles: 3,
        foodCount: 15,
        minFoodCount: 10,
        snakeSpeed: 4
      };
    case 2:
      return {
        normalObstacles: 4,
        deadlyObstacles: 5,
        foodCount: 12,
        minFoodCount: 8,
        snakeSpeed: 4.5
      };
    case 3:
      return {
        normalObstacles: 5,
        deadlyObstacles: 7,
        foodCount: 10,
        minFoodCount: 7,
        snakeSpeed: 5
      };
    case 4:
      return {
        normalObstacles: 6,
        deadlyObstacles: 10,
        foodCount: 8,
        minFoodCount: 6,
        snakeSpeed: 5.5
      };
    case 5:
      return {
        normalObstacles: 7,
        deadlyObstacles: 13,
        foodCount: 7,
        minFoodCount: 5,
        snakeSpeed: 6
      };
    default:
      return getLevelConfig(1);
  }
}

function createSliders() {
  // Calculer la position du panneau de contrôle
  let panelX = width - 300 - 20;
  let yPos = 50;
  let xPos = panelX + 20;

  // Titre du panneau
  createP('🎮 CONTRÔLES').position(xPos, 30).style('color', '#FFD700').style('font-size', '20px').style('font-weight', 'bold');

  // Slider distance entre segments
  createP('Distance Segments:').position(xPos, yPos).style('color', 'white').style('font-size', '12px');
  segmentDistanceSlider = createSlider(10, 30, 15, 2);
  segmentDistanceSlider.position(xPos, yPos + 20);
  segmentDistanceSlider.size(260);

  yPos += 60;

  // Slider poids évitement
  createP('Poids Évitement:').position(xPos, yPos).style('color', 'lime').style('font-size', '12px');
  avoidWeightSlider = createSlider(0, 5, 2.5, 0.1);
  avoidWeightSlider.position(xPos, yPos + 20);
  avoidWeightSlider.size(260);

  yPos += 60;

  // Slider vitesse snake
  createP('Vitesse Snake:').position(xPos, yPos).style('color', 'cyan').style('font-size', '12px');
  snakeSpeedSlider = createSlider(2, 8, 4, 0.5);
  snakeSpeedSlider.position(xPos, yPos + 20);
  snakeSpeedSlider.size(260);

  yPos += 60;

  // Slider nombre d'obstacles mortels
  createP('Obstacles Mortels:').position(xPos, yPos).style('color', 'red').style('font-size', '12px');
  nbObstaclesSlider = createSlider(3, 15, 5, 1);
  nbObstaclesSlider.position(xPos, yPos + 20);
  nbObstaclesSlider.size(260);
  nbObstaclesSlider.input(adjustDeadlyObstacles);

  yPos += 80;

  // Instructions
  createP('⌨️ COMMANDES').position(xPos, yPos).style('color', '#FFD700').style('font-size', '16px').style('font-weight', 'bold');
  yPos += 30;
  createP('🖱️ Souris = Contrôler l\'oeil').position(xPos, yPos).style('color', 'gold').style('font-size', '11px');
  createP('T = Mode Texte').position(xPos, yPos + 25).style('color', 'cyan').style('font-size', '11px');
  createP('D = Debug').position(xPos, yPos + 45).style('color', 'cyan').style('font-size', '11px');
  createP('R = Reset').position(xPos, yPos + 65).style('color', 'cyan').style('font-size', '11px');
  createP('ENTER = Niveau suivant').position(xPos, yPos + 85).style('color', 'lime').style('font-size', '11px');
  yPos += 120;
  createP('⚠️ Évitez les obstacles ROUGES !').position(xPos, yPos).style('color', 'red').style('font-size', '12px').style('font-weight', 'bold');
}

function adjustDeadlyObstacles() {
  createDeadlyObstacles(nbObstaclesSlider.value());
}

function createDeadlyObstacles(count) {
  deadlyObstacles = [];
  for (let i = 0; i < count; i++) {
    let validPosition = false;
    let x, y;
    let attempts = 0;
    let maxAttempts = 100;

    // Chercher une position qui ne chevauche pas le snake
    while (!validPosition && attempts < maxAttempts) {
      x = random(gameArea.x + 60, gameArea.x + gameArea.width - 60);
      y = random(gameArea.y + 60, gameArea.y + gameArea.height - 60);
      validPosition = true;

      // Vérifier la distance avec tous les segments du snake
      if (snake && snake.segments) {
        for (let segment of snake.segments) {
          let d = dist(x, y, segment.pos.x, segment.pos.y);
          // Distance de sécurité : rayon obstacle + rayon segment + marge de 50px
          let minDistance = 16 + segment.r + 50;
          if (d < minDistance) {
            validPosition = false;
            break;
          }
        }
      }

      attempts++;
    }

    let obs = new Obstacle(x, y, random(10, 16), color(255, 50, 50), true);
    deadlyObstacles.push(obs);
  }
}

function spawnFood() {
  // Générer un point de nourriture qui ne chevauche pas les obstacles - UNIQUEMENT dans la zone de jeu
  let maxAttempts = 50;
  let attempts = 0;
  let validPosition = false;
  let x, y;

  while (!validPosition && attempts < maxAttempts) {
    // Générer TOUJOURS dans la zone de jeu
    x = random(gameArea.x + 60, gameArea.x + gameArea.width - 60);
    y = random(gameArea.y + 60, gameArea.y + gameArea.height - 60);
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

  // Si on n'a pas trouvé de position valide, utiliser quand même une position dans la zone de jeu
  if (!validPosition) {
    x = random(gameArea.x + 60, gameArea.x + gameArea.width - 60);
    y = random(gameArea.y + 60, gameArea.y + gameArea.height - 60);
  }

  let foodItem = new Food(x, y);
  food.push(foodItem);
}

function createTextPoints() {
  // Générer les points pour "SNAKE" dans la zone de jeu
  textPoints = [];
  let txt = 'SNAKE';
  let centerX = gameArea.x + gameArea.width / 2;
  let centerY = gameArea.y + gameArea.height / 2;
  let startX = centerX - 250;
  let y = centerY;
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
  // Fond noir pour tout l'écran
  background(0);

  // Image de fond UNIQUEMENT dans la zone de jeu
  if (bgImage) {
    push();
    tint(255, 180); // Transparence pour voir les éléments
    image(bgImage, gameArea.x, gameArea.y, gameArea.width, gameArea.height);
    pop();
  }

  // Overlay semi-transparent sur la zone de jeu
  push();
  fill(0, 0, 0, 30);
  noStroke();
  rect(gameArea.x, gameArea.y, gameArea.width, gameArea.height);
  pop();

  // Dessiner les cadres de l'interface
  drawInterfaceFrames();

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
    // Le eye (leader) suit la souris - contraint dans la zone de jeu
    if (mouseX >= gameArea.x && mouseX <= gameArea.x + gameArea.width &&
        mouseY >= gameArea.y && mouseY <= gameArea.y + gameArea.height) {
      eye.pos.x = mouseX;
      eye.pos.y = mouseY;
    } else {
      eye.pos.x = constrain(eye.pos.x, gameArea.x + 30, gameArea.x + gameArea.width - 30);
      eye.pos.y = constrain(eye.pos.y, gameArea.y + 30, gameArea.y + gameArea.height - 30);
    }

    // L'oeil regarde vers la tête du snake
    if (snake) {
      eye.lookAt(snake.pos);
    }

    eye.show();

    // Dessiner les obstacles
    obstacles.forEach(o => o.show());
    deadlyObstacles.forEach(o => o.show());

    // Dessiner les points de nourriture
    food.forEach(f => f.show());

    // Comportement du snake: suivre l'eye
    // IMPORTANT: Le snake évite SEULEMENT les obstacles verts (normaux)
    // Il N'évite PAS les obstacles rouges (mortels) - s'il les touche il meurt

    let followForce = snake.follow(eye);
    let avoidForce = snake.avoidObstacles(obstacles); // Seulement les obstacles VERTS
    let separateForce = snake.separate();

    followForce.mult(1.2);
    avoidForce.mult(avoidWeightSlider.value());
    separateForce.mult(0.3);

    snake.applyForce(followForce);
    snake.applyForce(avoidForce);
    snake.applyForce(separateForce);

    snake.update();
    snake.boundaries(gameArea.x, gameArea.y, gameArea.width, gameArea.height, 50); // Rebondit sur les bords
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

    // Maintenir un minimum de points de nourriture selon le niveau
    let config = getLevelConfig(currentLevel);
    while (food.length < config.minFoodCount) {
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

    // Vérifier passage au niveau suivant
    if (score >= currentLevel * pointsPerLevel && currentLevel < maxLevel) {
      levelTransition = true;
      transitionTimer = 0;
    }

    // Condition de victoire: finir le niveau 5
    if (currentLevel === maxLevel && score >= maxLevel * pointsPerLevel) {
      gameWon = true;
    }
  }

  // === TRANSITION DE NIVEAU ===
  if (levelTransition) {
    transitionTimer++;
    displayLevelTransition();

    // Passer automatiquement après 2 secondes OU si le joueur appuie sur ENTER
    if (transitionTimer > 120) { // 2 secondes à 60 FPS
      currentLevel++;
      levelTransition = false;
      initLevel(currentLevel);
    }
    return;
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
    let allSegments = snake.getAllSegments();
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

function drawInterfaceFrames() {
  push();

  // Cadre de la zone de jeu (bleu)
  stroke(100, 200, 255);
  strokeWeight(3);
  noFill();
  rect(gameArea.x, gameArea.y, gameArea.width, gameArea.height, 10);

  // Titre de la zone de jeu
  fill(100, 200, 255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text('🎮 ZONE DE JEU', gameArea.x + 10, gameArea.y - 20);

  // Cadre du panneau de contrôle avec fond semi-transparent (doré)
  fill(0, 0, 0, 180);
  stroke(255, 215, 0);
  strokeWeight(3);
  rect(controlPanel.x, controlPanel.y, controlPanel.width, controlPanel.height, 10);

  pop();
}

function displayInfo() {
  push();
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);

  // Position dans la zone de jeu (coin supérieur gauche)
  let infoX = gameArea.x + 15;
  let infoY = gameArea.y + 15;

  let modeText = mode === "game" ? "GAME MODE" : "TEXT MODE";
  fill(0, 255, 255);
  text(`Mode: ${modeText}`, infoX, infoY);

  // Afficher le niveau actuel
  fill(255, 100, 255);
  textSize(20);
  textStyle(BOLD);
  text(`LEVEL ${currentLevel} / ${maxLevel}`, infoX, infoY + 30);

  // Score avec objectif du niveau
  fill(255, 215, 0);
  textSize(18);
  textStyle(NORMAL);
  let targetScore = currentLevel * pointsPerLevel;
  text(`Score: ${score} / ${targetScore}`, infoX, infoY + 60);

  fill(255);
  text(`Snake Length: ${1 + snake.segments.length}`, infoX, infoY + 90);
  text(`Food: ${food.length}`, infoX, infoY + 120);

  if (Snake.debug) {
    fill(0, 255, 0);
    text('MODE DEBUG ACTIVÉ', infoX, infoY + 150);
  }
  pop();
}

function displayLevelTransition() {
  // Overlay semi-transparent
  background(0, 0, 0, 200);

  push();
  textAlign(CENTER, CENTER);

  // Animation de pulsation
  let pulse = sin(transitionTimer * 0.1) * 10;

  textSize(80 + pulse);
  fill(100, 255, 100);
  text(`LEVEL ${currentLevel} COMPLETE!`, width / 2, height / 2 - 100);

  textSize(50);
  fill(255, 215, 0);
  text(`→ LEVEL ${currentLevel + 1} ←`, width / 2, height / 2 - 20);

  textSize(30);
  fill(255);
  text(`Score: ${score}`, width / 2, height / 2 + 40);

  // Afficher la configuration du prochain niveau
  let nextConfig = getLevelConfig(currentLevel + 1);
  textSize(20);
  fill(255, 100, 100);
  text(`Obstacles Mortels: ${nextConfig.deadlyObstacles}`, width / 2, height / 2 + 90);
  fill(100, 255, 255);
  text(`Vitesse: ${nextConfig.snakeSpeed}`, width / 2, height / 2 + 120);

  // Instruction pour passer au niveau suivant
  textSize(24);
  fill(255, 255, 0);
  // Animation de clignotement
  let alpha = map(sin(transitionTimer * 0.2), -1, 1, 100, 255);
  fill(255, 255, 0, alpha);
  text('Appuyez sur ENTER pour continuer', width / 2, height / 2 + 170);

  pop();
}

function displayGameOver() {
  background(20, 0, 0);

  push();
  textAlign(CENTER, CENTER);
  textSize(80);
  fill(255, 0, 0);
  text('GAME OVER', width / 2, height / 2 - 80);

  textSize(40);
  fill(255, 100, 100);
  text(`Level Atteint: ${currentLevel}`, width / 2, height / 2 - 10);

  textSize(40);
  fill(255);
  text(`Score Final: ${score}`, width / 2, height / 2 + 40);

  textSize(24);
  fill(255, 255, 0);
  text('Appuyez sur R pour recommencer', width / 2, height / 2 + 120);
  pop();
}

function displayGameWon() {
  background(0, 20, 0);

  push();
  textAlign(CENTER, CENTER);

  // Animation arc-en-ciel
  let hue = (frameCount * 2) % 360;
  colorMode(HSB);
  fill(hue, 80, 100);
  textSize(80);
  text('🎉 VICTOIRE ! 🎉', width / 2, height / 2 - 100);

  colorMode(RGB);
  textSize(50);
  fill(255, 215, 0);
  text(`TOUS LES ${maxLevel} NIVEAUX COMPLÉTÉS !`, width / 2, height / 2 - 20);

  textSize(40);
  fill(100, 255, 100);
  text(`Score Final: ${score}`, width / 2, height / 2 + 40);

  textSize(30);
  fill(255);
  text(`Longueur du Snake: ${1 + snake.segments.length}`, width / 2, height / 2 + 90);

  textSize(24);
  fill(255, 255, 0);
  text('Vous êtes un maître du Snake !', width / 2, height / 2 + 140);
  text('Appuyez sur R pour recommencer', width / 2, height / 2 + 180);
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

  // Passer au niveau suivant avec ENTER pendant la transition
  if (keyCode === ENTER && levelTransition) {
    currentLevel++;
    levelTransition = false;
    initLevel(currentLevel);
    console.log(`Passage au niveau ${currentLevel}`);
  }
}

function resetGame() {
  score = 0;
  currentLevel = 1;
  gameOver = false;
  gameWon = false;
  levelTransition = false;
  transitionTimer = 0;
  mode = "game";

  // Réinitialiser le snake - commence avec 3 segments dans la zone de jeu
  snake = new Snake(gameArea.x + gameArea.width / 2, gameArea.y + gameArea.height / 2 + 100, 3);
  snake.maxSpeed = snakeSpeedSlider.value();

  // Réinitialiser au niveau 1
  initLevel(currentLevel);

  console.log("Jeu réinitialisé - Niveau 1 !");
}
