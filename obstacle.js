// Classe Obstacle pour les objets à éviter
// Les obstacles verts sont normaux
// Les obstacles rouges sont mortels (fin du jeu)

class Obstacle {
  constructor(x, y, r, couleur, deadly = false) {
    this.pos = createVector(x, y);
    this.r = r;
    this.color = couleur;
    this.deadly = deadly; // Si true, toucher cet obstacle termine le jeu

    // Animation pour les obstacles mortels
    this.pulseOffset = random(TWO_PI);
    this.pulseSpeed = 0.03;
  }

  show() {
    push();

    // Style minimaliste et clean
    if (this.deadly) {
      // Obstacle mortel - style simple avec pulsation
      let pulse = sin(frameCount * this.pulseSpeed + this.pulseOffset);
      let size = this.r + pulse * 2;

      // Aura rouge subtile
      fill(255, 0, 0, 80);
      noStroke();
      circle(this.pos.x, this.pos.y, size * 2.8);

      // Obstacle principal - carré rouge
      fill(220, 30, 30);
      stroke(255, 100, 100);
      strokeWeight(2);
      rectMode(CENTER);
      rect(this.pos.x, this.pos.y, size * 2, size * 2, 5);

      // X simple au centre
      stroke(255, 200, 200);
      strokeWeight(2);
      let xs = size * 0.5;
      line(this.pos.x - xs, this.pos.y - xs, this.pos.x + xs, this.pos.y + xs);
      line(this.pos.x + xs, this.pos.y - xs, this.pos.x - xs, this.pos.y + xs);
    } else {
      // Obstacle normal - style hexagone
      fill(80, 200, 120);
      stroke(150, 255, 180);
      strokeWeight(2);

      // Dessiner hexagone
      beginShape();
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i;
        let x = this.pos.x + cos(angle) * this.r;
        let y = this.pos.y + sin(angle) * this.r;
        vertex(x, y);
      }
      endShape(CLOSE);

      // Centre
      fill(120, 240, 150);
      noStroke();
      circle(this.pos.x, this.pos.y, this.r * 0.5);
    }

    pop();
  }
}
