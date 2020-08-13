export default class Player {
  constructor(player, s) {
    console.log('player');
    this.s = s;
    this.x = player.x;

    this.startX = this.x - 200;
    this.startY = player.y;

    this.y = player.y;
    this.id = player.id;
    this.rgb = player.rgb;
    this.sentence = player.sentence;

    this.currentIndex = 0;
    this.currentIndex = player.currentIndex;
    this.actualXPosition = 0;
    this.currentSpeed = player.currentSpeed || 0;

    this.finished = false;
    this.winner = false;
  }

  draw() {
    console.log('player draw');
    this.s.fill(this.rgb.r, this.rgb.g, this.rgb.b);
    this.drawLines();
    this.s.circle(this.x, this.y, window.innerWidth / 96);

    this.drawCurrentSpeed();
    // this.drawGithubImage();
  }

  // drawGithubImage() {
  //   imageMode(CENTER);
  //   image(this.img, this.x, this.y, 80, 80);
  // }

  drawLines() {
    this.s.push();
    this.setupLineStroke();
    if (this.winner) {
      this.doMerge();
    } else {
      this.calculateXPosition();
      this.drawLineToPlayerPosition();
    }
    this.drawLineToMasterBranch();
    this.s.pop();
  }

  calculateXPosition() {
    this.actualXPosition = this.s.map(
      this.currentIndex,
      // this.s.state.currentIndex,
      0,
      this.sentence.length,
      400,
      this.s.windowWidth - 200
    );
    // console.log(
    //   this.currentIndex,
    //   this.s.state.currentIndex,
    //   this.sentence.length,
    //   this.s.windowWidth
    // );
    this.x = this.s.lerp(this.x, this.actualXPosition, 0.01);
    // console.log(this.x);
  }

  setupLineStroke() {
    this.s.strokeWeight(5);
    this.s.stroke(this.rgb.r, this.rgb.g, this.rgb.b);
  }

  drawLineToPlayerPosition() {
    this.s.line(this.startX, this.y, this.x, this.y);
  }

  drawLineToMasterBranch() {
    this.s.line(this.startX, this.startY, 100, 50);
  }

  doMerge() {
    this.drawLineToWinnerPosition();
    if (this.x < this.actualXPosition - 2) {
      this.x = this.s.lerp(this.x, this.actualXPosition, 0.05);
    } else {
      this.hasReachedEnd = true;
      this.drawLineFromEndPositionToPlayer();
      this.x = this.s.lerp(this.x, this.s.windowWidth - 100, 0.05);
      this.y = this.s.lerp(this.y, 50, 0.05);
    }
  }

  drawLineToWinnerPosition() {
    if (this.hasReachedEnd) {
      this.s.line(this.startX, this.startY, this.s.windowWidth - 200, this.startY);
    } else {
      this.s.line(this.startX, this.startY, this.x, this.startY);
    }
  }

  drawLineFromEndPositionToPlayer() {
    this.s.push();
    this.setupLineStroke();
    this.s.line(this.s.windowWidth - 200, this.startY, this.x, this.y);
    this.s.pop();
  }

  drawCurrentSpeed() {
    this.s.textSize(32);
    this.s.text(`${this.currentSpeed} cps`, this.x + 55, this.y);
  }
}
