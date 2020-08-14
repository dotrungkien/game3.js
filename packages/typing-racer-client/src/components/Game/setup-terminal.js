export default function (s) {
  const MAX_WIDTH = 1000;
  const MAX_HEIGHT = 500;
  s.x = 0;
  s.y = 0;
  s.width = 0;
  s.height = 0;

  s.cursorWidth = 14;
  s.cursorHeight = 6;
  s.drawTerminal = () => {
    s.resizeTerminal();
    s.drawWindow();
    s.displayPath();
    s.drawSentence();
    s.drawCursor();
  };

  s.resizeTerminal = () => {
    s.x = window.innerWidth * 0.2;
    s.y = window.innerHeight / 2;
    s.width = window.innerWidth * 0.6;
    s.height = window.innerHeight / 2;
  };

  s.drawWindow = () => {
    s.push();
    // top of console
    s.setGradient(
      200,
      s.y - 40,
      window.innerWidth - 420,
      40,
      s.color(89, 87, 79),
      s.color(62, 61, 57),
      1
    );

    // Buttons
    s.fill(224, 81, 31);
    s.circle(window.innerWidth - 240, s.y - 20, 10);

    s.textSize(14);
    s.fill(61, 53, 21);
    s.text("x", window.innerWidth - 243, s.y - 16);

    // Bottom of console
    s.fill(45, 9, 34, 150);
    s.rect(200, s.y, window.innerWidth - 420, s.height);
    s.pop();
  };

  s.displayPath = () => {
    let path = localStorage.getItem("myName") + "";

    s.textSize(window.innerWidth / 80);
    s.fill(100, 255, 100);
    s.text(path, 220, s.y + 50);

    s.fill(180, 180, 180);
    s.text(":~$ ", 220 + s.textWidth(path), s.y + 50);
    s.textSize(window.innerWidth / 68);
  };

  s.drawSentence = () => {
    let pathFull = localStorage.getItem("myName") + ":~$ ";
    const currentIndex = s.state.currentIndex;
    const sentence = s.state.sentence;
    const wrongLetter = s.state.wrongLetter;

    if (sentence) {
      // first fill sentence white color
      s.fill(255, 255, 255);
      s.text(
        sentence,
        200 + s.textWidth(pathFull),
        s.y + 35,
        MAX_WIDTH,
        MAX_HEIGHT
      );

      // fill red wrong letter
      if (wrongLetter && currentIndex < sentence.length) {
        s.fill(255, 100, 100);
        s.text(
          sentence.substring(0, currentIndex + 1),
          200 + s.textWidth(pathFull),
          s.y + 35,
          MAX_WIDTH,
          MAX_HEIGHT
        );

        // then fill green correct part (until currentIndex)
        s.fill(100, 255, 100);
        s.text(
          sentence.substring(0, currentIndex),
          200 + s.textWidth(pathFull),
          s.y + 35,
          MAX_WIDTH,
          MAX_HEIGHT
        );
      } else {
        // then fill green correct part (until currentIndex)
        s.fill(100, 255, 100);
        s.text(
          sentence.substring(0, currentIndex),
          200 + s.textWidth(pathFull),
          s.y + 35,
          MAX_WIDTH,
          MAX_HEIGHT
        );
      }
    }
  };

  s.drawCursor = () => {
    let pathFull = localStorage.getItem("myName") + ":~$ ";
    const currentIndex = s.state.currentIndex;
    const sentence = s.state.sentence;
    if (sentence) {
      // if (Math.floor(s.frameCount / 60) % 2 === 0) {
      const currentCharWidth = s.textWidth(sentence.charAt(currentIndex));
      const currentSentenceWidth = s.textWidth(
        sentence.substring(0, currentIndex)
      );

      const cursorX =
        200 +
        s.textWidth(pathFull) +
        (currentSentenceWidth % MAX_WIDTH) +
        (currentCharWidth - s.cursorWidth) / 2;

      const lines = (currentSentenceWidth / MAX_WIDTH) >> 0;
      const cursorY = s.y + 55 + 25 * lines;
      s.fill(100, 255, 100);
      s.rect(cursorX, cursorY, s.cursorWidth, s.cursorHeight);
      // }
    }
  };

  s.setGradient = (x, y, w, h, c1, c2, axis) => {
    s.noFill();

    if (axis === 1) {
      // Top to bottom gradient
      for (let i = y; i <= y + h; i++) {
        const inter = s.map(i, y, y + h, 0, 1);
        const c = s.lerpColor(c1, c2, inter);
        s.stroke(c);
        s.line(x, i, x + w, i);
      }
    } else if (axis === 2) {
      // Left to right gradient
      for (let i = x; i <= x + w; i++) {
        const inter = s.map(i, x, x + w, 0, 1);
        const c = s.lerpColor(c1, c2, inter);
        s.stroke(c);
        s.line(i, y, i, y + h);
      }
    }
  };
}
