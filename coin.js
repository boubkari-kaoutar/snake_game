// Classe Coin - Pièces à collecter par le snake
// Les pièces brillent et tournent pour attirer l'attention

class Coin {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 15;
    this.angle = 0;
    this.rotationSpeed = 0.1;

    // Animation
    this.pulseOffset = random(TWO_PI);
    this.pulseSpeed = 0.08;

    // Couleur or brillant
    this.colorCore = color(255, 215, 0);
    this.colorGlow = color(255, 255, 150);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Animation de pulsation
    let pulse = sin(frameCount * this.pulseSpeed + this.pulseOffset);
    let size = this.r + pulse * 3;

    // Aura brillante
    fill(this.colorGlow);
    noStroke();
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 0, 3, 0, 100);
      fill(255, 255, 150, alpha);
      circle(0, 0, size * 2 * (1 + i * 0.3));
    }

    // Rotation
    rotate(this.angle);
    this.angle += this.rotationSpeed;

    // Pièce principale
    fill(this.colorCore);
    stroke(255, 200, 0);
    strokeWeight(3);
    circle(0, 0, size * 2);

    // Détails de la pièce
    fill(255, 255, 0);
    noStroke();
    circle(0, 0, size * 1.3);

    // Symbole $
    fill(255, 180, 0);
    textAlign(CENTER, CENTER);
    textSize(size * 1.5);
    textStyle(BOLD);
    text('$', 0, 0);

    // Reflet brillant
    fill(255, 255, 255, 150);
    ellipse(-size * 0.3, -size * 0.3, size * 0.5, size * 0.3);

    pop();

    // Particules autour (mode debug)
    if (Snake.debug) {
      push();
      stroke(255, 215, 0, 100);
      strokeWeight(1);
      noFill();
      circle(this.pos.x, this.pos.y, this.r * 4);
      circle(this.pos.x, this.pos.y, this.r * 6);
      pop();
    }
  }
}
