// Classe de base Vehicle - contient toutes les méthodes de steering behavior
class Vehicle {
  constructor(x, y) {
    // Position du véhicule
    this.pos = createVector(x, y);
    // Vitesse du véhicule
    this.vel = createVector(0, 0);
    // Accélération du véhicule
    this.acc = createVector(0, 0);
    // Vitesse maximale
    this.maxSpeed = 4;
    // Force maximale
    this.maxForce = 0.4;
    // Rayon du véhicule
    this.r = 12;

    // Pour le wander behavior
    this.wanderTheta = 0;
    this.distanceCercle = 60;
    this.wanderRadius = 35;
    this.displaceRange = 0.25;

    // Pour le chemin de trainée
    this.path = [];
    this.pathMaxLength = 30;
  }

  // Comportement SEEK - Se diriger vers une cible
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let force = p5.Vector.sub(desired, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // Comportement FLEE - Fuir une cible
  flee(target) {
    return this.seek(target).mult(-1);
  }

  // Comportement ARRIVE - Arriver à une cible avec ralentissement
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

  // Comportement PURSUE - Poursuivre un véhicule mobile en anticipant sa position
  pursue(targetVehicle) {
    // Calculer la position future de la cible
    let distance = p5.Vector.dist(this.pos, targetVehicle.pos);

    // Prédire combien de frames il faut pour atteindre la cible
    let T = distance / this.maxSpeed;

    // Calculer la position future de la cible
    let futurePos = targetVehicle.pos.copy();
    let futureVel = targetVehicle.vel.copy();
    futureVel.mult(T);
    futurePos.add(futureVel);

    // Seek vers la position future
    return this.seek(futurePos);
  }

  // Comportement EVADE - Fuir un véhicule mobile en anticipant sa position
  evade(targetVehicle) {
    let distance = p5.Vector.dist(this.pos, targetVehicle.pos);
    let T = distance / this.maxSpeed;

    let futurePos = targetVehicle.pos.copy();
    let futureVel = targetVehicle.vel.copy();
    futureVel.mult(T);
    futurePos.add(futureVel);

    return this.flee(futurePos);
  }

  // Comportement WANDER - Déambulation aléatoire
  wander() {
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(this.distanceCercle);
    wanderPoint.add(this.pos);

    let theta = this.wanderTheta + this.vel.heading();
    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);
    wanderPoint.add(x, y);

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    let force = wanderPoint.sub(this.pos);
    force.setMag(this.maxForce);
    return force;
  }

  // Comportement BOUNDARIES - Rebondir aux bords d'une zone
  boundaries(bx, by, bw, bh, d = 50) {
    let desired = null;

    if (this.pos.x < bx + d) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > bx + bw - d) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < by + d) {
      desired = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > by + bh - d) {
      desired = createVector(this.vel.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 2);
      return steer;
    }

    return createVector(0, 0);
  }

  // Comportement SEPARATION - Maintenir une distance avec les autres
  separate(vehicles, desiredSeparation = 25) {
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of vehicles) {
      if (other === this) continue;

      let d = p5.Vector.dist(this.pos, other.pos);

      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  // Appliquer une force au véhicule
  applyForce(force) {
    this.acc.add(force);
  }

  // Mettre à jour la position du véhicule
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

  // Afficher le véhicule (méthode à surcharger dans les classes filles)
  show() {
    push();
    fill(100, 200, 255);
    stroke(255);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }

  // Gestion des bords avec wrap-around
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}
