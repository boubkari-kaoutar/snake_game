// Classe de base Vehicle pour tous les agents mobiles
// Fournit les comportements de steering de base

class Vehicle {
  static debug = false;

  constructor(x, y, r = 10) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.4;
    this.r = r;
    this.color = color(255);

    // Trainée derrière le véhicule
    this.path = [];
    this.pathMaxLength = 30;

    // Limites de la zone de jeu
    this.boundariesX = 0;
    this.boundariesY = 0;
    this.boundariesWidth = width;
    this.boundariesHeight = height;
  }

  // Définir les limites de la zone
  setBoundaries(x, y, w, h) {
    this.boundariesX = x;
    this.boundariesY = y;
    this.boundariesWidth = w;
    this.boundariesHeight = h;
  }

  // COMPORTEMENT ARRIVE - Ralentir en approchant de la cible
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

  // COMPORTEMENT SEEK - Aller vers une cible
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // COMPORTEMENT FLEE - Fuir une cible
  flee(target) {
    return this.seek(target).mult(-1);
  }

  // COMPORTEMENT WANDER - Déambulation aléatoire
  wander(distanceCercle = 60, wanderRadius = 35, wanderTheta = 0, displaceRange = 0.25) {
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(distanceCercle);
    wanderPoint.add(this.pos);

    if (Vehicle.debug) {
      fill(255, 0, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 8);

      noFill();
      stroke(255);
      circle(wanderPoint.x, wanderPoint.y, wanderRadius * 2);

      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }

    let theta = wanderTheta + this.vel.heading();
    let x = wanderRadius * cos(theta);
    let y = wanderRadius * sin(theta);
    wanderPoint.add(x, y);

    if (Vehicle.debug) {
      fill(0, 255, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 16);

      stroke(255);
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }

    let force = wanderPoint.sub(this.pos);
    force.setMag(this.maxForce);

    return force;
  }

  // Appliquer une force
  applyForce(force) {
    this.acc.add(force);
  }

  // Mise à jour de la physique
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

  // Wrapping des bords
  edges() {
    // Wrapping horizontal
    if (this.pos.x > this.boundariesX + this.boundariesWidth) {
      this.pos.x = this.boundariesX;
    } else if (this.pos.x < this.boundariesX) {
      this.pos.x = this.boundariesX + this.boundariesWidth;
    }

    // Wrapping vertical
    if (this.pos.y > this.boundariesY + this.boundariesHeight) {
      this.pos.y = this.boundariesY;
    } else if (this.pos.y < this.boundariesY) {
      this.pos.y = this.boundariesY + this.boundariesHeight;
    }
  }

  // Affichage de base
  show() {
    // Dessiner la trainée
    if (this.path.length > 1) {
      for (let i = 0; i < this.path.length; i++) {
        if (i % 3 === 0) {
          let alpha = map(i, 0, this.path.length, 0, 150);
          fill(red(this.color), green(this.color), blue(this.color), alpha);
          noStroke();
          circle(this.path[i].x, this.path[i].y, 2);
        }
      }
    }

    // Dessiner le véhicule
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    fill(this.color);
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    circle(0, 0, this.r * 2);

    fill(255, 255, 255, 180);
    noStroke();
    circle(0, 0, this.r * 0.8);

    if (Vehicle.debug) {
      noFill();
      stroke(255, 255, 0);
      circle(0, 0, this.r * 3);
    }

    pop();
  }
}

// Synchroniser le debug entre Vehicle et ses sous-classes
Vehicle.debug = false;
