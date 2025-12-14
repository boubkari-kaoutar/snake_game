// Classe AISnake - Snakes contrôlés par IA
// Deux types: SMALL (nourriture) et LARGE (prédateur)

class AISnake extends Snake {
  constructor(x, y, type = "SMALL") {
    // SMALL: 2-3 segments, LARGE: 8-12 segments
    let length = (type === "SMALL") ? floor(random(2, 4)) : floor(random(8, 13));
    super(x, y, length);

    this.type = type; // "SMALL" ou "LARGE"

    if (type === "SMALL") {
      // Petit snake (nourriture)
      this.maxSpeed = 2;
      this.maxForce = 0.2;
      this.r = 6;
      this.color = color(100, 255, 200); // Vert clair
      this.segmentDistance = 10;

      // Colorer les segments
      for (let segment of this.segments) {
        segment.r = 5;
        segment.color = color(120, 255, 220);
      }
    } else {
      // Grand snake (prédateur)
      this.maxSpeed = 2.5;  // Réduit de 3.5 à 2.5
      this.maxForce = 0.3;   // Réduit de 0.35 à 0.3
      this.r = 14;
      this.color = color(255, 150, 0); // Orange pour prédateur
      this.segmentDistance = 18;

      // Colorer les segments
      for (let i = 0; i < this.segments.length; i++) {
        let ratio = i / max(this.segments.length - 1, 1);
        this.segments[i].r = 12;
        this.segments[i].color = lerpColor(color(255, 150, 0), color(200, 50, 0), ratio);
      }
    }

    // Pour le wander
    this.wanderTheta = random(TWO_PI);

    // Target pour le comportement
    this.target = null;
  }

  // Comportements IA avec logiques avancées
  applyBehaviors(playerSnake, obstacles, bounds, largeSnakes) {
    let steerForce = createVector(0, 0);

    if (this.type === "SMALL") {
      // ====== PETIT SNAKE (Proie) ======
      // Stratégie: Fuir le joueur et les prédateurs, wander sinon

      let wanderForce = this.wander();
      wanderForce.mult(0.8);
      steerForce.add(wanderForce);

      // Fuir le joueur avec EVADE (anticipe sa position future)
      let dToPlayer = p5.Vector.dist(this.pos, playerSnake.pos);
      if (dToPlayer < 120) {
        let evadeForce = this.evade(playerSnake);
        // Plus le joueur est proche, plus la force est forte
        let evadeMult = map(dToPlayer, 0, 120, 3.5, 1.5);
        evadeForce.mult(evadeMult);
        steerForce.add(evadeForce);
      }

      // Fuir les grands snakes (prédateurs)
      if (largeSnakes) {
        for (let predator of largeSnakes) {
          let dToPredator = p5.Vector.dist(this.pos, predator.pos);
          if (dToPredator < 100) {
            let fleeForce = this.flee(predator.pos);
            fleeForce.mult(2.5);
            steerForce.add(fleeForce);
          }
        }
      }

      // Éviter obstacles
      let avoidForce = this.avoidObstacles(obstacles);
      avoidForce.mult(1.8);
      steerForce.add(avoidForce);

    } else {
      // ====== GRAND SNAKE (Prédateur) ======
      // Stratégie: Poursuivre le joueur intelligemment avec PURSUE

      let dToPlayer = p5.Vector.dist(this.pos, playerSnake.pos);

      if (dToPlayer < 180) {
        // Poursuivre avec PURSUE (anticipe la position future du joueur)
        let pursueForce = this.pursue(playerSnake);

        // Plus le joueur est proche, plus la poursuite est agressive
        let pursueMult = map(dToPlayer, 0, 180, 2.5, 1.2);
        pursueForce.mult(pursueMult);
        steerForce.add(pursueForce);

        // Si très proche (< 50px), comportement de chasse agressive
        if (dToPlayer < 50) {
          let directSeekForce = this.seek(playerSnake.pos);
          directSeekForce.mult(1.5);
          steerForce.add(directSeekForce);
        }
      } else if (dToPlayer < 300) {
        // À moyenne distance: patrouille vers la dernière position connue
        let seekForce = this.seek(playerSnake.pos);
        seekForce.mult(0.6);
        steerForce.add(seekForce);

        let wanderForce = this.wander();
        wanderForce.mult(0.5);
        steerForce.add(wanderForce);
      } else {
        // Hors de portée: wander en patrouille
        let wanderForce = this.wander();
        wanderForce.mult(0.9);
        steerForce.add(wanderForce);
      }

      // Éviter obstacles (moins prioritaire que la chasse)
      let avoidForce = this.avoidObstacles(obstacles);
      avoidForce.mult(1.0);
      steerForce.add(avoidForce);

      // Séparation entre prédateurs (éviter de se chevaucher)
      if (largeSnakes) {
        let separationForce = this.separate(largeSnakes, 40);
        separationForce.mult(0.8);
        steerForce.add(separationForce);
      }
    }

    // Boundaries (priorité haute) - Utiliser la méthode héritée de Vehicle
    let boundaryForce = this.boundaries(bounds.x, bounds.y, bounds.width, bounds.height, 50);
    boundaryForce.mult(2.0);  // Augmenter le poids pour priorité haute
    steerForce.add(boundaryForce);

    // Appliquer les forces
    this.applyForce(steerForce);
  }

  // Override du show pour différencier visuellement
  show(playerSnake) {
    // Mode Debug: afficher les zones de détection
    if (Snake.debug) {
      push();
      noFill();
      strokeWeight(1);

      if (this.type === "SMALL") {
        // Zone de fuite (120px)
        stroke(255, 255, 0, 100);
        circle(this.pos.x, this.pos.y, 120 * 2);
      } else {
        // Zone de poursuite agressive (180px)
        stroke(255, 0, 0, 100);
        circle(this.pos.x, this.pos.y, 180 * 2);

        // Zone de patrouille (300px)
        stroke(255, 150, 0, 80);
        circle(this.pos.x, this.pos.y, 350 * 2);

        // Ligne vers le joueur si en poursuite
        if (playerSnake) {
          let d = p5.Vector.dist(this.pos, playerSnake.pos);
          if (d < 180) {
            stroke(255, 0, 0, 150);
            strokeWeight(2);
            line(this.pos.x, this.pos.y, playerSnake.pos.x, playerSnake.pos.y);

            // Afficher la distance
            fill(255, 0, 0);
            noStroke();
            textSize(10);
            text(`${d.toFixed(0)}px`, (this.pos.x + playerSnake.pos.x) / 2, (this.pos.y + playerSnake.pos.y) / 2);
          }
        }
      }
      pop();
    }

    // Dessiner les segments
    for (let i = this.segments.length - 1; i >= 0; i--) {
      let segment = this.segments[i];

      // Dessiner le segment
      push();
      fill(segment.color);
      stroke(255, 255, 255, 150);
      strokeWeight(1.5);
      circle(segment.pos.x, segment.pos.y, segment.r * 2);

      // Point au centre
      fill(255, 255, 255, 120);
      noStroke();
      circle(segment.pos.x, segment.pos.y, segment.r * 0.6);
      pop();
    }

    // Dessiner la tête
    push();
    fill(this.color);
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);

    // Point au centre
    fill(255, 255, 255, 150);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 0.7);

    // Yeux pour les grands snakes (prédateurs)
    if (this.type === "LARGE") {
      fill(255, 0, 0);
      noStroke();
      let eyeOffset = this.r * 0.4;
      circle(this.pos.x - eyeOffset/2, this.pos.y - eyeOffset, this.r * 0.3);
      circle(this.pos.x + eyeOffset/2, this.pos.y - eyeOffset, this.r * 0.3);
    }
    pop();
  }

  // Vérifier collision avec le joueur
  checkPlayerCollision(playerSnake) {
    // Vérifier collision tête du joueur avec tous les segments de ce snake
    let d = p5.Vector.dist(playerSnake.pos, this.pos);
    if (d < playerSnake.r + this.r + 2) {
      return true;
    }

    for (let segment of this.segments) {
      let d = p5.Vector.dist(playerSnake.pos, segment.pos);
      if (d < playerSnake.r + segment.r + 2) {
        return true;
      }
    }

    return false;
  }

  // Vérifier si en dehors des bounds (pour suppression)
  isOutOfBounds(bounds) {
    return (this.pos.x < bounds.x - 50 ||
            this.pos.x > bounds.x + bounds.width + 50 ||
            this.pos.y < bounds.y - 50 ||
            this.pos.y > bounds.y + bounds.height + 50);
  }
}
