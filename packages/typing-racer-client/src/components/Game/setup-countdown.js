export default function (s) {
  s.gameIsStarting = false;
  s.gameIsEnding = false;
  s.secondsLeft = 0;

  s.drawCountDown = () => {
    if (s.secondsLeft < 0 && s.decrementInterval) {
      s.gameIsEnding = false;
      s.gameIsStarting = false;
      clearInterval(s.decrementInterval);
    }
    if (s.gameIsStarting || s.gameIsEnding) {
      s.fill(255);
      s.textSize(100);
      s.text(s.secondsLeft, window.windowWidth / 2, window.windowHeight / 3);
    }
  };

  s.beginGameStarting = () => {
    s.gameIsStarting = true;
    s.secondsLeft = 10;
    s.decrementInterval = setInterval(() => s.secondsLeft--, 1000);
  };
}
