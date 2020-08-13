export default function (s) {
  s.drawPlayer = player => {
    player.startX = player.x - 200;
    player.startY = player.y;

    player.currentIndex = 0;
    player.actualXPosition = 0;
    player.currentSpeed = player.currentSpeed || 0;

    player.finished = false;
    player.winner = false;

    s.fill(player.rgb.r, player.rgb.g, player.rgb.b);
    s.drawLines(player);
    s.circle(player.x, player.y, window.innerWidth / 96);

    s.drawCurrentSpeed(player.currentSpeed, player.x, player.y);
  };

  s.drawLines = player => {
    s.push();
    s.setupLineStroke(player.rgb);
    if (s.winner) {
      // s.doMerge();
    } else {
      s.calculateXPosition(player);
      s.drawLineToPlayerPosition(player);
    }
    s.drawLineToMasterBranch(player);
    s.pop();
  };
  };

  s.calculateXPosition = player => {
    player.actualXPosition = s.map(
      player.currentIndex,
      0,
      player.sentence.length,
      400,
      window.windowWidth - 200
    );
    player.x = s.lerp(player.x, player.actualXPosition, 0.01);
    console.log(player.x);
  };

  s.setupLineStroke = rgb => {
    s.strokeWeight(5);
    s.stroke(rgb.r, rgb.g, rgb.b);
  };

  s.drawLineToPlayerPosition = player => {
    s.line(player.startX, player.y, player.x, player.y);
  };

  s.drawLineToMasterBranch = player => {
    s.line(player.startX, player.startY, 100, 50);
  };

  // s.doMerge = () => {
  //   s.drawLineToWinnerPosition();
  //   if (x < s.actualXPosition - 2) {
  //     x = s.lerp(x, s.actualXPosition, 0.05);
  //   } else {
  //     s.hasReachedEnd = true;
  //     s.drawLineFromEndPositionToPlayer();
  //     x = s.lerp(x, window.windowWidth - 100, 0.05);
  //     s.y = s.lerp(s.y, 50, 0.05);
  //   }
  // };

  // s.drawLineToWinnerPosition = () => {
  //   if (s.hasReachedEnd) {
  //     s.line(s.startX, s.startY, window.windowWidth - 200, s.startY);
  //   } else {
  //     s.line(s.startX, s.startY, x, s.startY);
  //   }
  // };

  // s.drawLineFromEndPositionToPlayer = () => {
  //   s.push();
  //   s.setupLineStroke();
  //   s.line(window.windowWidth - 200, s.startY, x, s.y);
  //   s.pop();
  // };

  s.drawCurrentSpeed = (currentSpeed, x, y) => {
    s.textSize(32);
    s.text(`${currentSpeed} cps`, x + 55, y);
  };

  return s;
}
