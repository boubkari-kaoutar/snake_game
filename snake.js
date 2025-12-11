// Classe Snake - Hérite de Vehicle
// La tête du snake est le vehicle principal
// Les segments sont des instances de Vehicle qui suivent

class Snake extends Vehicle {
  static debug = false;

  constructor(x, y, length = 3) {
    super(x, y);

    // Propriétés du snake
    this.maxSpeed = 4;
    this.maxForce = 0.4;
    this.segmentDistance = 15;
    this.r = 10;
    this.color = color(255, 100, 100); // Rouge pour la tête

    // Créer les segments suiveurs (composition avec Vehicle)
    this.segments = [];
    for (let i = 0; i < length; i++) {
      let segment = new Vehicle(x - i * this.segmentDistance, y);
      // Dégradé de couleur du rouge vers le bleu
      let ratio = i / max(length - 1, 1);
      segment.color = lerpColor(color(255, 100, 100), color(100, 150, 255), ratio);
      segment.r = 8;
      this.segments.push(segment);
    }
  }

  // Faire grandir le snake d'un segment
  grow() {
    let lastSegment = this.segments[this.segments.length - 1];
    let newSegment = new Vehicle(lastSegment.pos.x, lastSegment.pos.y);

    // Calculer la couleur en fonction de la longueur
    let ratio = this.segments.length / max(this.segments.length + 1, 1);
    newSegment.color = lerpColor(color(255, 100, 100), color(100, 150, 255), ratio);
    newSegment.r = 8;

    this.segments.push(newSegment);
  }

  // COMPORTEMENT FOLLOW - La tête suit une cible
  follow(target) {
    return this.arrive(target.pos);
  }

  // ÉVITEMENT D'OBSTACLES - Détection depuis la tête
  avoidObstacles(obstacles) {
    let distanceAhead = 60;
    let ahead = this.vel.copy();
    ahead.mult(distanceAhead);

    let ahead2 = this.vel.copy();
    ahead2.mult(distanceAhead * 0.5);

    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
    let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);

    // Trouver l'obstacle le plus proche
    let obstacleLePlusProche = null;
    let distanceMin = Infinity;

    for (let obstacle of obstacles) {
      let d1 = pointAuBoutDeAhead.dist(obstacle.pos);
      let d2 = pointAuBoutDeAhead2.dist(obstacle.pos);
      let d3 = this.pos.dist(obstacle.pos);

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
    let d3 = this.pos.dist(obstacleLePlusProche.pos);

    let pointUtilise;
    let distance;
    if (d1 < d2 && d1 < d3) {
      pointUtilise = pointAuBoutDeAhead;
      distance = d1;
    } else if (d2 < d1 && d2 < d3) {
      pointUtilise = pointAuBoutDeAhead2;
      distance = d2;
    } else {
      pointUtilise = this.pos;
      distance = d3;
    }

    let force = createVector(0, 0);
    let collisionRadius = obstacleLePlusProche.r + this.r + 10;

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

  // COMPORTEMENT SEPARATION - Entre la tête et les segments
  separate() {
    let desiredSeparation = this.r * 2.5;
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of this.segments) {
      let d = p5.Vector.dist(this.pos, other.pos);

      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;

        if (Snake.debug) {
          push();
          stroke(255, 255, 0, 100);
          strokeWeight(1);
          line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          pop();
        }
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

  // Mettre à jour la tête et tous les segments
  update() {
    // Mise à jour de la tête (utilise la méthode héritée de Vehicle)
    super.update();

    // Mise à jour des segments - chaque segment suit le précédent
    for (let i = 0; i < this.segments.length; i++) {
      let segment = this.segments[i];
      let target = (i === 0) ? this : this.segments[i - 1];

      // Calculer la direction et distance vers le segment précédent
      let desired = p5.Vector.sub(target.pos, segment.pos);
      let distance = desired.mag();

      // Zone morte pour maintenir la distance
      let minDistance = this.segmentDistance * 0.85;
      let maxDistance = this.segmentDistance * 1.3;

      if (distance < minDistance) {
        // Trop proche: appliquer une force de répulsion
        let repulsionForce = desired.copy();
        repulsionForce.normalize();
        repulsionForce.mult(-1);
        let strength = map(distance, 0, minDistance, this.maxForce * 2, 0);
        repulsionForce.setMag(strength);
        segment.applyForce(repulsionForce);
      } else if (distance > maxDistance) {
        // Trop loin: appliquer une force d'attraction
        let attractionForce = segment.arrive(target.pos, this.segmentDistance * 2);
        segment.applyForce(attractionForce);

        // Si vraiment trop loin, forcer le rapprochement urgent
        if (distance > this.segmentDistance * 2) {
          let urgentForce = desired.copy();
          urgentForce.setMag(this.maxSpeed * 1.5);
          let steer = p5.Vector.sub(urgentForce, segment.vel);
          steer.limit(this.maxForce * 2);
          segment.applyForce(steer);
        }
      } else {
        // Dans la zone morte: réduire la vélocité pour maintenir la position
        segment.vel.mult(0.85);
      }

      segment.maxSpeed = this.maxSpeed * 1.2;
      segment.maxForce = this.maxForce * 1.5;
      segment.update();

      // Contrainte rigide: forcer la distance à rester dans une plage acceptable
      let finalDist = p5.Vector.dist(segment.pos, target.pos);
      if (finalDist > this.segmentDistance * 1.5) {
        let direction = p5.Vector.sub(target.pos, segment.pos);
        direction.setMag(finalDist - this.segmentDistance);
        segment.pos.add(direction);
      } else if (finalDist < this.segmentDistance * 0.7) {
        let direction = p5.Vector.sub(segment.pos, target.pos);
        direction.setMag(this.segmentDistance * 0.7 - finalDist);
        segment.pos.add(direction);
      }
    }
  }

  // BOUNDARIES - Rebondir sur les bords de la zone de jeu
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
      this.applyForce(steer);

      if (Snake.debug) {
        push();
        stroke(255, 0, 0);
        strokeWeight(3);
        noFill();
        rect(bx + d, by + d, bw - d * 2, bh - d * 2);
        pop();
      }
    }

    // Limiter strictement la position
    this.pos.x = constrain(this.pos.x, bx + 10, bx + bw - 10);
    this.pos.y = constrain(this.pos.y, by + 10, by + bh - 10);
  }

  // Afficher la tête et tous les segments
  show() {
    // Dessiner les segments du corps vers la tête
    for (let i = this.segments.length - 1; i >= 0; i--) {
      let segment = this.segments[i];

      // Dessiner la trainée du segment
      if (segment.path.length > 1) {
        for (let j = 0; j < segment.path.length; j++) {
          if (j % 3 === 0) {
            let alpha = map(j, 0, segment.path.length, 0, 150);
            fill(red(segment.color), green(segment.color), blue(segment.color), alpha);
            noStroke();
            circle(segment.path[j].x, segment.path[j].y, 2);
          }
        }
      }

      // Dessiner le segment
      fill(segment.color);
      stroke(255, 255, 255, 200);
      strokeWeight(2);
      circle(segment.pos.x, segment.pos.y, segment.r * 2);

      // Point blanc au centre
      fill(255, 255, 255, 180);
      noStroke();
      circle(segment.pos.x, segment.pos.y, segment.r * 0.8);
    }

    // Dessiner la tête (utilise super pour le chemin)
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

    // Style de la tête
    fill(this.color);
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);

    // Point blanc au centre
    fill(255, 255, 255, 180);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 0.8);

    // Dessiner les connexions entre segments en mode debug
    if (Snake.debug) {
      push();
      stroke(255, 255, 0, 150);
      strokeWeight(2);
      noFill();

      // Ligne entre tête et premier segment
      if (this.segments.length > 0) {
        line(this.pos.x, this.pos.y, this.segments[0].pos.x, this.segments[0].pos.y);
      }

      // Lignes entre segments
      for (let i = 0; i < this.segments.length - 1; i++) {
        line(this.segments[i].pos.x, this.segments[i].pos.y,
             this.segments[i + 1].pos.x, this.segments[i + 1].pos.y);
      }
      pop();
    }
  }

  // Vérifier collision avec la nourriture
  checkFoodCollision(foodItem) {
    let d = p5.Vector.dist(this.pos, foodItem.pos);
    return d < this.r + foodItem.r + 5;
  }

  // Vérifier collision avec un obstacle mortel - TOUS LES SEGMENTS
  checkObstacleCollision(obstacle) {
    if (!obstacle.deadly) return false;

    // Vérifier collision pour la tête - marge de 2px pour contact certain
    let d = p5.Vector.dist(this.pos, obstacle.pos);
    let collisionThreshold = this.r + obstacle.r + 2;

    if (Snake.debug) {
      console.log(`Distance tête-obstacle: ${d.toFixed(2)}, Seuil: ${collisionThreshold.toFixed(2)}`);
    }

    if (d < collisionThreshold) {
      if (Snake.debug) {
        console.log("COLLISION DÉTECTÉE - TÊTE!");
      }
      return true;
    }

    // Vérifier collision pour tous les segments - marge de 2px
    for (let segment of this.segments) {
      let d = p5.Vector.dist(segment.pos, obstacle.pos);
      let segmentCollisionThreshold = segment.r + obstacle.r + 2;

      if (d < segmentCollisionThreshold) {
        if (Snake.debug) {
          console.log("COLLISION DÉTECTÉE - SEGMENT!");
        }
        return true;
      }
    }
    return false;
  }

  // Vérifier collision avec un obstacle normal (vert) - TOUS LES SEGMENTS
  checkNormalObstacleCollision(obstacle) {
    if (obstacle.deadly) return false;

    // Vérifier collision pour la tête avec petite marge
    let d = p5.Vector.dist(this.pos, obstacle.pos);
    let collisionThreshold = this.r + obstacle.r + 1;

    if (d < collisionThreshold) {
      return true;
    }

    // Vérifier collision pour tous les segments
    for (let segment of this.segments) {
      let d = p5.Vector.dist(segment.pos, obstacle.pos);
      let segmentCollisionThreshold = segment.r + obstacle.r + 1;

      if (d < segmentCollisionThreshold) {
        return true;
      }
    }
    return false;
  }

  // Obtenir tous les segments (incluant la tête)
  getAllSegments() {
    return [this, ...this.segments];
  }
}
