import Player from './Player.js';

export default function playerHandlerNew(s) {
  s.players = [];

  const playerInitialYPosition = s.state.playerInitialYPosition;
  const playerYPositionDelta = s.state.playerYPositionDelta;

  s.updatePlayers = serverPlayers => {
    for (let i = 0; i < serverPlayers.length; i++) {
      const playerFromServer = serverPlayers[i];

      const existingPlayer = s.playerExists(playerFromServer);
      if (!existingPlayer) {
        const playersYPosition =
          playerYPositionDelta + playerYPositionDelta * (s.players.length + 1);
        playerFromServer.y = playersYPosition;
        s.players.push(new Player(playerFromServer));
      } else {
        existingPlayer.currentIndex = playerFromServer.currentIndex;
        existingPlayer.finished = playerFromServer.finished;
        existingPlayer.winner = playerFromServer.winner;
        existingPlayer.currentSpeed = playerFromServer.currentSpeed;
      }
    }
  };

  s.playerExists = playerFromServer => {
    for (let i = 0; i < s.players.length; i++) {
      if (s.players[i].id === playerFromServer.id) {
        return s.players[i];
      }
    }
    return undefined;
  };

  s.removePlayer = playerId => {
    s.players = s.players.filter(player => player.id !== playerId);
    s.players.forEach((player, idx) => {
      player.y = playerInitialYPosition + playerYPositionDelta * idx;
      player.startY = playerInitialYPosition + playerYPositionDelta * idx;
    });
  };

  s.resetPlayers = () => {
    s.players = [];
  };

  s.drawPlayers = () => {
    s.players.forEach(player => player.draw());
  };

  s.getPlayer = id => {
    for (let i = 0; i < s.players.length; i++) {
      if (s.players[i].id === id) {
        return s.players[i];
      }
    }
    return undefined;
  };
}
