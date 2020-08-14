import setupMasterBranch from "./setup-master-branch";
import setupTerminal from "./setup-terminal";
import setupCountdown from "./setup-countdown";
import setupPlayer from "./setup-player";

export default function (s) {
  s.state = {};
  s.dispatch = () => {};

  s.setup = () => {
    s.createCanvas(window.innerWidth, window.innerHeight);

    //terminal

    s.gameIsStarting = false;
    s.gameIsEnding = false;
    s.secondsLeft = 0;

    setupTerminal(s);

    setupMasterBranch(s);
    setupCountdown(s);
    setupPlayer(s);
  };

  window.onresize = () => {
    s.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  window.keyPressed = function (e) {
    e.preventDefault();
    s.dispatch({ type: "WRONG_LETTER", payload: false });
  };

  s.draw = () => {
    s.background(14, 16, 18);
    s.drawTerminal();
    s.drawPlayers();
    s.drawMasterBranch();
    s.drawCountDown();
  };

  s.drawPlayers = () => {
    const { players, clientId } = s.state;

    players.forEach((playerInfo) => {
      if (playerInfo.id === clientId) {
        s.dispatch({
          type: "UPDATE_CURRENT_INDEX",
          payload: playerInfo.currentIndex,
        });
      }
      s.drawPlayer(playerInfo);
    });
  };
}
