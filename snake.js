// Classe Snake avec tous les comportements de steering
// Wander, Separation, Flee, Follow, Path Following, Boundaries

// Segment hérite maintenant de Vehicle pour réutiliser les comportements de base
class Segment extends Vehicle {
  constructor(x, y) {
    super(x, y, 12);
    this.maxSpeed = 5;
    this.maxForce = 0.5;
    this.color = color(100, 255, 150);
  }

  show() {
    push();

    // Dessiner la trainée derrière le segment
    if (this.path.length > 1) {
      for (let i = 0; i < this.path.length; i++) {
        if (i % 3 === 0) { // Afficher un point tous les 3 pour performance
          let alpha = map(i, 0, this.path.length, 0, 150);
          fill(red(this.color), green(this.color), blue(this.color), alpha);
          noStroke();
          circle(this.path[i].x, this.path[i].y, 2);
        }
      }
    }

    // Style simple et clean
    fill(this.color);
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);

    // Point blanc au centre
    fill(255, 255, 255, 180);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 0.8);

    if (Vehicle.debug) {
      noFill();
      stroke(255, 255, 0);
      circle(this.pos.x, this.pos.y, this.r * 3);
    }
    pop();
  }
}

class Snake {
  static debug = false;

  constructor(x, y, length = 3) {
    this.segments = [];
    this.maxSpeed = 4;
    this.maxForce = 0.4;
    this.segmentDistance = 15;

    // Créer la tête - Leader
    let head = new Segment(x, y);
    head.color = color(255, 100, 100); // Rouge pour la tête (leader)
    head.r = 10;
    this.segments.push(head);

    // Créer les segments du corps - Suiveurs
    for (let i = 1; i < length; i++) {
      let segment = new Segment(x - i * this.segmentDistance, y);
      // Dégradé de couleur du rouge vers le bleu
      let ratio = i / max(length - 1, 1);
      segment.color = lerpColor(color(255, 100, 100), color(100, 150, 255), ratio);
      segment.r = 8;
      this.segments.push(segment);
    }

    // Pour le wander
    this.wanderTheta = 0;
    this.distanceCercle = 60;
    this.wanderRadius = 35;
    this.displaceRange = 0.25;

    // Limites de la zone de jeu (par défaut = canvas complet)
    this.boundariesX = 0;
    this.boundariesY = 0;
    this.boundariesWidth = width;
    this.boundariesHeight = height;
  }

  // Définir les limites de la zone de jeu
  setBoundaries(x, y, w, h) {
    this.boundariesX = x;
    this.boundariesY = y;
    this.boundariesWidth = w;
    this.boundariesHeight = h;
  }

  // Faire grandir le snake d'un segment
  grow() {
    let lastSegment = this.segments[this.segments.length - 1];
    let newSegment = new Segment(lastSegment.pos.x, lastSegment.pos.y);

    // Calculer la couleur en fonction de la longueur
    let ratio = this.segments.length / max(this.segments.length + 1, 1);
    newSegment.color = lerpColor(color(255, 100, 100), color(100, 150, 255), ratio);
    newSegment.r = 8;

    this.segments.push(newSegment);
  }

  getSegments() {
    return this.segments;
  }

  // COMPORTEMENT FOLLOW - Suivre une cible
  follow(target) {
    let head = this.segments[0];
    return head.arrive(target.pos);
  }

  // COMPORTEMENT WANDER - Déambulation
  wander() {
    let head = this.segments[0];

    let wanderPoint = head.vel.copy();
    wanderPoint.setMag(this.distanceCercle);
    wanderPoint.add(head.pos);

    if (Snake.debug) {
      fill(255, 0, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 8);

      noFill();
      stroke(255);
      circle(wanderPoint.x, wanderPoint.y, this.wanderRadius * 2);

      line(head.pos.x, head.pos.y, wanderPoint.x, wanderPoint.y);
    }

    let theta = this.wanderTheta + head.vel.heading();
    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);
    wanderPoint.add(x, y);

    if (Snake.debug) {
      fill(0, 255, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 16);

      stroke(255);
      line(head.pos.x, head.pos.y, wanderPoint.x, wanderPoint.y);
    }

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    let force = wanderPoint.sub(head.pos);
    force.setMag(this.maxForce);

    return force;
  }

  // ÉVITEMENT D'OBSTACLES - Avec calcul de distance progressive
  avoidObstacles(obstacles) {
    let head = this.segments[0];
    let distanceAhead = 80; // Distance de prédiction augmentée

    // Vecteurs de prédiction devant le snake
    let ahead = head.vel.copy();
    ahead.setMag(distanceAhead);
    let ahead2 = ahead.copy().mult(0.5);

    let pointAuBoutDeAhead = p5.Vector.add(head.pos, ahead);
    let pointAuBoutDeAhead2 = p5.Vector.add(head.pos, ahead2);

    // Trouver l'obstacle le plus proche et sa distance
    let obstacleLePlusProche = null;
    let distanceMin = Infinity;
    let pointLePlusProche = null;

    for (let obstacle of obstacles) {
      // Calculer les distances aux trois points de prédiction
      let d1 = pointAuBoutDeAhead.dist(obstacle.pos);
      let d2 = pointAuBoutDeAhead2.dist(obstacle.pos);
      let d3 = head.pos.dist(obstacle.pos);

      // Vérifier aussi la distance de tous les segments
      let minSegmentDist = Infinity;
      for (let segment of this.segments) {
        let segDist = segment.pos.dist(obstacle.pos);
        if (segDist < minSegmentDist) {
          minSegmentDist = segDist;
        }
      }

      // Prendre la distance minimale
      let d = min(d1, d2, d3, minSegmentDist);

      if (d < distanceMin) {
        distanceMin = d;
        obstacleLePlusProche = obstacle;

        // Déterminer quel point est le plus proche
        if (d1 <= d2 && d1 <= d3 && d1 <= minSegmentDist) {
          pointLePlusProche = pointAuBoutDeAhead;
        } else if (d2 <= d1 && d2 <= d3 && d2 <= minSegmentDist) {
          pointLePlusProche = pointAuBoutDeAhead2;
        } else {
          pointLePlusProche = head.pos;
        }
      }
    }

    if (!obstacleLePlusProche) {
      return createVector(0, 0);
    }

    // Calculer la zone d'évitement progressive
    let avoidanceRadius = obstacleLePlusProche.r + head.r + 60; // Zone large d'évitement
    let dangerRadius = obstacleLePlusProche.r + head.r + 20;    // Zone de danger immédiat

    let force = createVector(0, 0);

    // Si dans la zone d'évitement, calculer la force basée sur la distance
    if (distanceMin < avoidanceRadius) {
      // Vecteur d'évitement - s'éloigner de l'obstacle
      force = p5.Vector.sub(pointLePlusProche, obstacleLePlusProche.pos);
      force.normalize();

      // Force inversement proportionnelle à la distance
      // Plus on est proche, plus la force est forte
      let strength;
      if (distanceMin < dangerRadius) {
        // Zone de danger - force maximale
        strength = map(distanceMin, 0, dangerRadius, this.maxForce * 3, this.maxForce * 1.5);
      } else {
        // Zone d'évitement normale - force progressive
        strength = map(distanceMin, dangerRadius, avoidanceRadius, this.maxForce * 1.5, this.maxForce * 0.3);
      }

      force.setMag(strength);

      // Mode debug - visualiser les zones d'évitement
      if (Snake.debug) {
        push();

        // Zone d'évitement (cyan)
        noFill();
        stroke(0, 255, 255, 100);
        strokeWeight(2);
        circle(obstacleLePlusProche.pos.x, obstacleLePlusProche.pos.y, avoidanceRadius * 2);

        // Zone de danger (orange)
        stroke(255, 150, 0, 150);
        strokeWeight(2);
        circle(obstacleLePlusProche.pos.x, obstacleLePlusProche.pos.y, dangerRadius * 2);

        // Ligne de force d'évitement
        stroke(255, 0, 0);
        strokeWeight(3);
        line(head.pos.x, head.pos.y,
             head.pos.x + force.x * 10, head.pos.y + force.y * 10);

        // Distance text
        fill(255, 255, 0);
        noStroke();
        textSize(12);
        text(`Dist: ${distanceMin.toFixed(0)}`,
             obstacleLePlusProche.pos.x, obstacleLePlusProche.pos.y - obstacleLePlusProche.r - 10);

        pop();
      }
    }

    return force;
  }

  // COMPORTEMENT SEPARATION - Entre les segments
  separate() {
    let head = this.segments[0];
    let desiredSeparation = head.r * 2.5;
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of this.segments) {
      if (other === head) continue;

      let d = p5.Vector.dist(head.pos, other.pos);

      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(head.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;

        if (Snake.debug) {
          push();
          stroke(255, 255, 0, 100);
          strokeWeight(1);
          line(head.pos.x, head.pos.y, other.pos.x, other.pos.y);
          pop();
        }
      }
    }

    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(head.vel);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  applyForce(force) {
    let head = this.segments[0];
    head.applyForce(force);
  }

  update() {
    // Mise à jour de la tête avec les forces appliquées
    let head = this.segments[0];
    head.maxSpeed = this.maxSpeed;
    head.maxForce = this.maxForce;
    head.update();

    // Suivre le chemin (path following) - chaque segment suit le précédent
    // IMPORTANT: On utilise une contrainte rigide pour maintenir la forme du snake
    for (let i = 1; i < this.segments.length; i++) {
      let segment = this.segments[i];
      let target = this.segments[i - 1];

      // Calculer la direction vers le segment précédent
      let desired = p5.Vector.sub(target.pos, segment.pos);
      let distance = desired.mag();

      // NOUVELLE APPROCHE: Contrainte rigide AVANT le mouvement
      // Maintenir la distance exacte entre les segments
      if (distance > 0) {
        // Calculer la position idéale pour ce segment
        let direction = desired.copy();
        direction.normalize();
        direction.mult(this.segmentDistance);

        // Position cible = position du segment précédent - direction * segmentDistance
        let idealPos = p5.Vector.sub(target.pos, direction);

        // Interpoler vers la position idéale (LERP pour un mouvement fluide)
        segment.pos.lerp(idealPos, 0.5);
      }

      // Ajouter un léger mouvement basé sur arrive seulement si nécessaire
      if (distance > this.segmentDistance * 1.2) {
        let arriveForce = segment.arrive(target.pos, this.segmentDistance * 2);
        arriveForce.mult(0.3); // Force réduite car la contrainte rigide fait le travail principal
        segment.applyForce(arriveForce);
      }

      segment.maxSpeed = this.maxSpeed * 1.1;
      segment.maxForce = this.maxForce * 1.2;
      segment.update();
    }
  }

  // WRAPPING - Le snake passe d'un bord à l'autre (wrapping edges)
  boundaries() {
    // Appliquer le wrapping à TOUS les segments
    for (let segment of this.segments) {
      // Wrapping horizontal
      if (segment.pos.x > this.boundariesX + this.boundariesWidth) {
        segment.pos.x = this.boundariesX;
      } else if (segment.pos.x < this.boundariesX) {
        segment.pos.x = this.boundariesX + this.boundariesWidth;
      }

      // Wrapping vertical
      if (segment.pos.y > this.boundariesY + this.boundariesHeight) {
        segment.pos.y = this.boundariesY;
      } else if (segment.pos.y < this.boundariesY) {
        segment.pos.y = this.boundariesY + this.boundariesHeight;
      }
    }

    // Mode debug: afficher les limites de wrapping
    if (Snake.debug) {
      push();
      stroke(0, 255, 255);
      strokeWeight(2);
      noFill();
      rect(this.boundariesX, this.boundariesY,
           this.boundariesWidth, this.boundariesHeight);

      // Ajouter des flèches pour indiquer le wrapping
      fill(0, 255, 255, 150);
      noStroke();
      textSize(20);
      textAlign(CENTER);
      text('←→', this.boundariesX + this.boundariesWidth / 2, this.boundariesY - 10);
      text('←→', this.boundariesX + this.boundariesWidth / 2, this.boundariesY + this.boundariesHeight + 20);

      push();
      translate(this.boundariesX - 10, this.boundariesY + this.boundariesHeight / 2);
      rotate(-HALF_PI);
      text('←→', 0, 0);
      pop();

      push();
      translate(this.boundariesX + this.boundariesWidth + 10, this.boundariesY + this.boundariesHeight / 2);
      rotate(-HALF_PI);
      text('←→', 0, 0);
      pop();

      pop();
    }
  }

  show() {
    // Dessiner les segments du corps vers la tête
    for (let i = this.segments.length - 1; i >= 0; i--) {
      this.segments[i].show();
    }

    // Dessiner les connexions entre segments
    if (Snake.debug) {
      push();
      stroke(255, 255, 0, 150);
      strokeWeight(2);
      noFill();
      for (let i = 0; i < this.segments.length - 1; i++) {
        line(this.segments[i].pos.x, this.segments[i].pos.y,
             this.segments[i + 1].pos.x, this.segments[i + 1].pos.y);
      }
      pop();
    }
  }

  // Vérifier collision avec la nourriture
  checkFoodCollision(foodItem) {
    let head = this.segments[0];
    let d = p5.Vector.dist(head.pos, foodItem.pos);
    return d < head.r + foodItem.r + 5;
  }

  // Vérifier collision avec un obstacle mortel - TOUS LES SEGMENTS
  checkObstacleCollision(obstacle) {
    if (!obstacle.deadly) return false;

    // Vérifier collision pour TOUS les segments du snake
    for (let segment of this.segments) {
      let d = p5.Vector.dist(segment.pos, obstacle.pos);
      if (d < segment.r + obstacle.r) {
        return true;
      }
    }
    return false;
  }

  // Vérifier collision avec un obstacle normal (vert) - TOUS LES SEGMENTS
  checkNormalObstacleCollision(obstacle) {
    if (obstacle.deadly) return false; // Seulement les obstacles non-mortels

    // Vérifier collision pour TOUS les segments du snake
    for (let segment of this.segments) {
      let d = p5.Vector.dist(segment.pos, obstacle.pos);
      if (d < segment.r + obstacle.r) {
        return true;
      }
    }
    return false;
  }
}

// Synchroniser le debug avec la classe de base Vehicle
Snake.debug = false;
Object.defineProperty(Snake, 'debug', {
  get() { return Vehicle.debug; },
  set(value) { Vehicle.debug = value; }
});
