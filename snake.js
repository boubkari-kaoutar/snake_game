// Classe Snake avec tous les comportements de steering
// Wander, Separation, Flee, Follow, Path Following, Boundaries

class Segment {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 5;
    this.maxForce = 0.5;
    this.r = 12;
    this.color = color(100, 255, 150);

    // Trainée derrière le segment
    this.path = [];
    this.pathMaxLength = 30;
  }

  // Comportement arrive
  arrive(target, slowingDistance = 100) {
    let desired = p5.Vector.sub(target, this.pos);
    let distance = desired.mag();
    let speed = this.maxSpeed;

    if (distance < slowingDistance) {
      speed = map(distance, 0, slowingDistance, 0, this.maxSpeed);
    }

    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);

    return steer;
  }

  // Comportement seek
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // Comportement flee
  flee(target) {
    return this.seek(target).mult(-1);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Ajouter la position actuelle à la trainée
    this.path.push(this.pos.copy());
    if (this.path.length > this.pathMaxLength) {
      this.path.shift();
    }
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

    if (Segment.debug) {
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

  // ÉVITEMENT D'OBSTACLES - Tous les segments évitent
  avoidObstacles(obstacles) {
    let head = this.segments[0];
    let distanceAhead = 60;

    let ahead = head.vel.copy();
    ahead.mult(distanceAhead);

    let ahead2 = head.vel.copy();
    ahead2.mult(distanceAhead * 0.5);

    let pointAuBoutDeAhead = p5.Vector.add(head.pos, ahead);
    let pointAuBoutDeAhead2 = p5.Vector.add(head.pos, ahead2);

    // Trouver l'obstacle le plus proche en tenant compte de TOUS les segments
    let obstacleLePlusProche = null;
    let distanceMin = Infinity;

    for (let obstacle of obstacles) {
      // Vérifier la distance avec la tête ET les segments
      let d1 = pointAuBoutDeAhead.dist(obstacle.pos);
      let d2 = pointAuBoutDeAhead2.dist(obstacle.pos);
      let d3 = head.pos.dist(obstacle.pos);

      // Vérifier aussi la proximité de tous les segments
      let minSegmentDist = Infinity;
      for (let segment of this.segments) {
        let segDist = segment.pos.dist(obstacle.pos);
        if (segDist < minSegmentDist) {
          minSegmentDist = segDist;
        }
      }

      let d = min(d1, d2, d3, minSegmentDist);

      if (d < distanceMin) {
        distanceMin = d;
        obstacleLePlusProche = obstacle;
      }
    }

    if (!obstacleLePlusProche) {
      return createVector(0, 0);
    }

    // Choisir le meilleur point
    let d1 = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
    let d2 = pointAuBoutDeAhead2.dist(obstacleLePlusProche.pos);
    let d3 = head.pos.dist(obstacleLePlusProche.pos);

    let pointUtilise;
    let distance;
    if (d1 < d2 && d1 < d3) {
      pointUtilise = pointAuBoutDeAhead;
      distance = d1;
    } else if (d2 < d1 && d2 < d3) {
      pointUtilise = pointAuBoutDeAhead2;
      distance = d2;
    } else {
      pointUtilise = head.pos;
      distance = d3;
    }

    let force = createVector(0, 0);
    // Augmenter le rayon de collision pour une détection plus précoce
    let collisionRadius = obstacleLePlusProche.r + head.r + 10;

    if (distance < collisionRadius) {
      force = p5.Vector.sub(pointUtilise, obstacleLePlusProche.pos);
      force.setMag(this.maxForce);

      if (Snake.debug) {
        push();
        stroke(255, 150, 0);
        strokeWeight(2);
        line(obstacleLePlusProche.pos.x, obstacleLePlusProche.pos.y, pointUtilise.x, pointUtilise.y);
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

    // Suivre le chemin (path following) - chaque segment suit le précédent avec un comportement plus serré
    for (let i = 1; i < this.segments.length; i++) {
      let segment = this.segments[i];
      let target = this.segments[i - 1];

      // Calculer la direction vers le segment précédent
      let desired = p5.Vector.sub(target.pos, segment.pos);
      let distance = desired.mag();

      // Utiliser arrive pour un suivi plus fluide et serré
      let arriveForce = segment.arrive(target.pos, this.segmentDistance * 2);
      segment.applyForce(arriveForce);

      // Si trop loin du segment précédent, forcer le rapprochement
      if (distance > this.segmentDistance * 1.5) {
        let urgentForce = desired.copy();
        urgentForce.setMag(this.maxSpeed * 1.5);
        let steer = p5.Vector.sub(urgentForce, segment.vel);
        steer.limit(this.maxForce * 2);
        segment.applyForce(steer);
      }

      segment.maxSpeed = this.maxSpeed * 1.2; // Segments légèrement plus rapides
      segment.maxForce = this.maxForce * 1.5; // Plus réactifs
      segment.update();

      // Contraindre la distance exacte (méthode de contrainte rigide)
      let finalDist = p5.Vector.dist(segment.pos, target.pos);
      if (finalDist > this.segmentDistance) {
        let direction = p5.Vector.sub(target.pos, segment.pos);
        direction.setMag(finalDist - this.segmentDistance);
        segment.pos.add(direction);
      }
    }
  }

  // BOUNDARIES - Rebondir sur les bords
  boundaries() {
    let head = this.segments[0];
    let d = 50; // Distance des bords pour commencer à rebondir

    let desired = null;

    if (head.pos.x < d) {
      desired = createVector(this.maxSpeed, head.vel.y);
    } else if (head.pos.x > width - d) {
      desired = createVector(-this.maxSpeed, head.vel.y);
    }

    if (head.pos.y < d) {
      desired = createVector(head.vel.x, this.maxSpeed);
    } else if (head.pos.y > height - d) {
      desired = createVector(head.vel.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxSpeed);
      let steer = p5.Vector.sub(desired, head.vel);
      steer.limit(this.maxForce * 2); // Force plus forte pour les bords
      head.applyForce(steer);

      if (Snake.debug) {
        push();
        stroke(255, 0, 0);
        strokeWeight(3);
        noFill();
        rect(d, d, width - d * 2, height - d * 2);
        pop();
      }
    }

    // Limiter strictement la position
    head.pos.x = constrain(head.pos.x, 10, width - 10);
    head.pos.y = constrain(head.pos.y, 10, height - 10);
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

// Assigner le debug aux segments aussi
Snake.debug = false;
Segment.debug = Snake.debug;
