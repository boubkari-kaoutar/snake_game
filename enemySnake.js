// Classe EnemySnake - Snake adversaire contrôlé par IA
// Hérite des mêmes comportements que Snake mais avec wander + évitement

class EnemySnake extends Snake {
  constructor(x, y, length = 3) {
    super(x, y, length);

    // Couleurs distinctes pour les ennemis
    this.enemyColorScheme = [
      [color(255, 150, 0), color(255, 200, 100)],   // Orange
      [color(150, 0, 255), color(200, 100, 255)],   // Violet
      [color(0, 255, 150), color(100, 255, 200)],   // Vert cyan
      [color(255, 0, 150), color(255, 100, 200)]    // Rose
    ];

    let colorScheme = random(this.enemyColorScheme);

    // Appliquer le schéma de couleur
    this.segments[0].color = colorScheme[0]; // Tête
    this.segments[0].r = 9; // Légèrement plus petit que le joueur

    for (let i = 1; i < this.segments.length; i++) {
      let ratio = i / max(this.segments.length - 1, 1);
      this.segments[i].color = lerpColor(colorScheme[0], colorScheme[1], ratio);
      this.segments[i].r = 7;
    }

    // Comportement IA
    this.targetFood = null;
    this.wanderTimer = 0;
    this.searchFoodInterval = 60; // Chercher nourriture toutes les 60 frames

    // Vitesse légèrement réduite par rapport au joueur
    this.maxSpeed = 3.5;
    this.maxForce = 0.35;
  }

  // Comportement IA principal
  applyAI(food, obstacles, playerSnake) {
    let head = this.segments[0];

    this.wanderTimer++;

    // Rechercher nourriture la plus proche périodiquement
    if (this.wanderTimer >= this.searchFoodInterval) {
      this.targetFood = this.findNearestFood(food);
      this.wanderTimer = 0;
    }

    // Si on a une cible de nourriture proche, aller la chercher
    if (this.targetFood && food.includes(this.targetFood)) {
      let distToFood = head.pos.dist(this.targetFood.pos);

      if (distToFood < 200) {
        // Chercher la nourriture
        let seekForce = head.arrive(this.targetFood.pos, 100);
        seekForce.mult(1.5);
        this.applyForce(seekForce);
      } else {
        // Trop loin, abandonner et wander
        this.targetFood = null;
        let wanderForce = this.wander();
        wanderForce.mult(1.2);
        this.applyForce(wanderForce);
      }
    } else {
      // Pas de cible, wander
      let wanderForce = this.wander();
      wanderForce.mult(1.2);
      this.applyForce(wanderForce);
    }

    // Éviter les obstacles
    let avoidForce = this.avoidObstacles(obstacles);
    avoidForce.mult(2.5);
    this.applyForce(avoidForce);

    // Éviter le snake du joueur si trop proche
    if (playerSnake) {
      let distToPlayer = head.pos.dist(playerSnake.segments[0].pos);
      if (distToPlayer < 80) {
        let fleeForce = head.flee(playerSnake.segments[0].pos);
        fleeForce.mult(1.5);
        this.applyForce(fleeForce);
      }
    }

    // Séparation entre segments
    let separateForce = this.separate();
    separateForce.mult(0.3);
    this.applyForce(separateForce);
  }

  // Trouver la nourriture la plus proche
  findNearestFood(foodArray) {
    if (foodArray.length === 0) return null;

    let head = this.segments[0];
    let nearest = null;
    let minDist = Infinity;

    for (let f of foodArray) {
      let d = head.pos.dist(f.pos);
      if (d < minDist) {
        minDist = d;
        nearest = f;
      }
    }

    return nearest;
  }

  // Vérifier si cet ennemi a mangé la nourriture
  checkFoodCollision(foodItem) {
    let head = this.segments[0];
    let d = p5.Vector.dist(head.pos, foodItem.pos);
    return d < head.r + foodItem.r + 5;
  }

  // Affichage avec marqueur ennemi
  show() {
    super.show();

    // Afficher un marqueur au-dessus de la tête pour indiquer que c'est un ennemi
    let head = this.segments[0];
    push();
    fill(255, 0, 0);
    noStroke();
    textAlign(CENTER);
    textSize(12);
    text('⚠', head.pos.x, head.pos.y - 20);
    pop();
  }
}
