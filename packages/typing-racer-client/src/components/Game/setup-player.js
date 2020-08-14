export default function (s) {
  s.drawPlayer = (player) => {
    /**
     * currentIndex: 0
     * currentSpeed: 0
     * id: "0JOzBD3mHVV-cEljAAAA"
     * profileImg: "https://i.pravatar.cc/150?u=0JOzBD3mHVV-cEljAAAA"
     * rgb: {r: 209.45350329797697, g: 11.190657642410821, b: 251.01979684619542}
     * sentence: "The melon is a bear."
     * startTime: 1597247836648
     * x: 400
     * y: 200
     */
    // console.log(player.x, player.y);
    s.fill(player.rgb.r, player.rgb.g, player.rgb.b);
    s.drawLines(player);
    s.circle(player.x, player.y, window.innerWidth / 64);
    s.drawCurrentSpeed(player);
  };

  s.drawLines = (player) => {
    s.push();
    s.setupLineStroke(player.rgb);
    if (player.winner) {
      s.doMerge(player);
    } else {
      s.calculateXPosition(player);
      s.drawLineToPlayerPosition(player);
    }
    s.drawLineToMasterBranch(player);
    s.pop();
  };

  s.calculateXPosition = (player) => {
    player.actualXPosition = s.map(
      player.currentIndex,
      0,
      player.sentence.length,
      400,
      s.windowWidth - 200
    );
    player.x = s.lerp(player.x, player.actualXPosition, 0.01);
  };

  s.setupLineStroke = (rgb) => {
    s.strokeWeight(5);
    s.stroke(rgb.r, rgb.g, rgb.b);
  };

  s.drawLineToPlayerPosition = (player) => {
    s.line(player.startX, player.y, player.x, player.y);
  };

  s.drawLineToMasterBranch = (player) => {
    s.line(player.startX, player.startY, 100, 50);
  };

  s.doMerge = (player) => {
    s.drawLineToWinnerPosition(player);
    if (player.x < player.actualXPosition - 2) {
      player.x = s.lerp(player.x, player.actualXPosition, 0.1);
    } else {
      player.hasReachedEnd = true;
      s.drawLineFromEndPositionToPlayer(player);
      player.x = s.lerp(player.x, s.windowWidth - 100, 0.1);
      player.y = s.lerp(player.y, 50, 0.1);
    }
  };

  s.drawLineToWinnerPosition = (player) => {
    if (player.hasReachedEnd) {
      s.line(player.startX, player.startY, s.windowWidth - 200, player.startY);
    } else {
      s.line(player.startX, player.startY, player.x, player.startY);
    }
  };

  s.drawLineFromEndPositionToPlayer = (player) => {
    s.push();
    s.setupLineStroke(player.rgb);
    s.line(s.windowWidth - 200, player.startY, player.x, player.y);
    s.pop();
  };

  s.drawCurrentSpeed = (player) => {
    s.textSize(32);
    s.text(`${player.currentSpeed} cps`, player.x + 55, player.y);
  };

  return s;
}
