// Classe Food - Petits points de nourriture à manger
// Style simple et minimaliste

class Food {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 5; // Très petit rayon

    // Animation
    this.pulseOffset = random(TWO_PI);
    this.pulseSpeed = 0.05;

    // Couleurs aléatoires vives
    let colors = [
      color(255, 100, 100),  // Rouge
      color(100, 255, 100),  // Vert
      color(100, 200, 255),  // Bleu
      color(255, 255, 100),  // Jaune
      color(255, 150, 255),  // Rose
      color(255, 200, 100)   // Orange
    ];
    this.color = random(colors);
  }

  show() {
    push();

    // Animation de pulsation légère
    let pulse = sin(frameCount * this.pulseSpeed + this.pulseOffset);
    let size = this.r + pulse * 1;

    // Halo lumineux subtil
    fill(this.color);
    noStroke();
    circle(this.pos.x, this.pos.y, size * 4);

    // Point principal
    fill(255);
    circle(this.pos.x, this.pos.y, size * 2);

    pop();
  }
}
