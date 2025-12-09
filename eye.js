// Classe Eye - L'oeil que le joueur contrôle avec la souris
// Le snake suit cet oeil pour aller chercher les pièces

class Eye {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 16; // Rayon de l'oeil (réduit)

    // Animation de clignement
    this.blinkTimer = 0;
    this.blinkDuration = 10;
    this.blinkInterval = 180;
    this.isBlinking = false;

    // Pupille qui suit le mouvement et regarde où va le snake
    this.pupilOffset = createVector(0, 0);
    this.lastPos = createVector(x, y);
    this.targetLookAt = null; // Pour regarder vers une cible
  }

  // Méthode pour faire regarder l'oeil vers une cible
  lookAt(target) {
    this.targetLookAt = target;
  }

  show() {
    push();

    // Calculer le mouvement pour l'animation de la pupille
    let movement = p5.Vector.sub(this.pos, this.lastPos);

    // Si on a une cible à regarder, orienter la pupille vers elle
    if (this.targetLookAt) {
      let direction = p5.Vector.sub(this.targetLookAt, this.pos);
      direction.limit(this.r * 0.3);
      this.pupilOffset.lerp(direction, 0.15);
    } else {
      // Sinon, suivre le mouvement
      this.pupilOffset.lerp(movement.mult(0.3), 0.2);
    }

    this.pupilOffset.limit(this.r * 0.35);
    this.lastPos = this.pos.copy();

    // Gestion du clignement
    this.blinkTimer++;
    if (this.blinkTimer >= this.blinkInterval) {
      this.isBlinking = true;
      if (this.blinkTimer >= this.blinkInterval + this.blinkDuration) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Aura dorée autour de l'oeil
    fill(255, 215, 0, 40);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 3.5);

    // Blanc de l'oeil
    fill(255, 255, 255);
    stroke(100, 100, 100);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);

    if (!this.isBlinking) {
      // Iris coloré (bleu clair)
      fill(100, 180, 255);
      noStroke();
      circle(this.pos.x + this.pupilOffset.x, this.pos.y + this.pupilOffset.y, this.r * 0.8);

      // Pupille noire
      fill(20, 20, 40);
      noStroke();
      circle(this.pos.x + this.pupilOffset.x, this.pos.y + this.pupilOffset.y, this.r * 0.4);

      // Reflet blanc dans la pupille
      fill(255, 255, 255, 200);
      circle(this.pos.x + this.pupilOffset.x - 2, this.pos.y + this.pupilOffset.y - 2, this.r * 0.15);
    } else {
      // Clignement - ligne horizontale
      stroke(100, 100, 100);
      strokeWeight(3);
      line(this.pos.x - this.r, this.pos.y, this.pos.x + this.r, this.pos.y);
    }

    // Mode debug - cercle et informations
    if (Snake.debug) {
      // Cercle de debug
      noFill();
      stroke(255, 215, 0);
      strokeWeight(2);
      circle(this.pos.x, this.pos.y, this.r * 3.5);

      // Croix de visée
      stroke(255, 215, 0);
      strokeWeight(1);
      line(this.pos.x - 25, this.pos.y, this.pos.x + 25, this.pos.y);
      line(this.pos.x, this.pos.y - 25, this.pos.x, this.pos.y + 25);

      // Texte LEADER
      fill(255, 215, 0);
      noStroke();
      textAlign(CENTER);
      textSize(10);
      textStyle(BOLD);
      text('LEADER', this.pos.x, this.pos.y - this.r * 2.5);

      // Direction de la pupille
      if (this.pupilOffset.mag() > 0) {
        stroke(255, 0, 255);
        strokeWeight(1);
        line(this.pos.x, this.pos.y,
             this.pos.x + this.pupilOffset.x * 3,
             this.pos.y + this.pupilOffset.y * 3);
      }
    }

    pop();
  }
}
