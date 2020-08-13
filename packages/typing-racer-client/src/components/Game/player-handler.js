export function updatePlayers(state, dispatch, serverPlayers) {
  const { players, playerYPositionDelta } = state;

  for (let i = 0; i < serverPlayers.length; i++) {
    const playerFromServer = serverPlayers[i];

    const existingPlayer = playerExists(players, playerFromServer);
    if (!existingPlayer) {
      const playersYPosition = playerYPositionDelta + playerYPositionDelta * (players.length + 1);
      playerFromServer.y = playersYPosition;
      playerFromServer.startY = playersYPosition;
      players.push(playerFromServer);
    } else {
      existingPlayer.currentIndex = playerFromServer.currentIndex;
      existingPlayer.finished = playerFromServer.finished;
      existingPlayer.winner = playerFromServer.winner;
      existingPlayer.currentSpeed = playerFromServer.currentSpeed;
    }
    dispatch({ type: 'UPDATE_PLAYERS', payload: players });
  }
}

const playerExists = (players, playerFromServer) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === playerFromServer.id) {
      return players[i];
    }
  }
  return undefined;
};

export function removePlayer(state, dispatch, playerId) {
  let { playerYPositionDelta, playerInitialYPosition, players } = state;
  players = players.filter(player => player.id !== playerId);
  players.forEach((player, idx) => {
    player.y = playerInitialYPosition + playerYPositionDelta * idx;
    player.startY = playerInitialYPosition + playerYPositionDelta * idx;
  });
  dispatch({ type: 'UPDATE_PLAYERS', payload: players });
}

export function resetPlayers(state, dispatch) {
  const { players } = state;
  for (let i = 0; i < players.length; i++) {
    players[i].x = players[i].startX + 200;
    players[i].y = players[i].startY;
  }
  dispatch({ type: 'UPDATE_PLAYERS', payload: players });
}
