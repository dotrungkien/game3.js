import { MapSchema, Schema, type } from "@colyseus/schema";
import { Constants, Types } from "..";
import { Message } from ".";
import { TRPlayer } from "./trplayer";

export interface ITRGame {
  onWaitingStart: (message?: Message) => void;
  onLobbyStart: (message?: Message) => void;
  onGameStart: (message?: Message) => void;
  onGameEnd: (message?: Message) => void;
}

export class TRGame extends Schema {
  @type("string")
  public state: Types.GameState = "lobby";

  @type("number")
  public lobbyEndsAt: number;

  @type("number")
  public gameEndsAt: number;

  // Hidden fields
  private onWaitingStart: (message?: Message) => void;
  private onLobbyStart: (message?: Message) => void;
  private onGameStart: (message?: Message) => void;
  private onGameEnd: (message?: Message) => void;

  // Init
  constructor(attributes: ITRGame) {
    super();
    this.onWaitingStart = attributes.onWaitingStart;
    this.onLobbyStart = attributes.onLobbyStart;
    this.onGameStart = attributes.onGameStart;
    this.onGameEnd = attributes.onGameEnd;
  }

  // Update
  update(players: MapSchema<TRPlayer>) {
    switch (this.state) {
      case "waiting":
        this.updateWaiting(players);
        break;
      case "lobby":
        this.updateLobby(players);
        break;
      case "game":
        this.updateGame(players);
        break;
    }
  }

  updateWaiting(players: MapSchema<TRPlayer>) {
    // If there are two players, the game starts.
    if (countPlayers(players) === 1) {
      this.startLobby();
      return;
    }
  }

  updateLobby(players: MapSchema<TRPlayer>) {
    // If a player is alone, the game stops.
    if (countPlayers(players) === 0) {
      this.startWaiting();
      return;
    }

    // If the lobby is over, the game starts.
    if (this.lobbyEndsAt < Date.now()) {
      this.startGame();
      return;
    }
  }

  updateGame(players: MapSchema<TRPlayer>) {
    // If a player is alone, the game stops.
    // if (countPlayers(players) === 1) {
    //   this.onGameEnd();
    //   this.startWaiting();
    //   return;
    // }

    // If the time is out, the game stops.
    if (this.gameEndsAt < Date.now()) {
      const message = new Message("timeout");
      this.onGameEnd(message);
      this.startLobby();

      return;
    }

    const player: TRPlayer | null = getWinningPlayer(players);
    if (player) {
      const message = new Message("won", {
        name: player.name,
      });
      this.onGameEnd(message);
      this.startLobby();

      return;
    }
  }

  // Start
  startWaiting() {
    this.lobbyEndsAt = undefined;
    this.gameEndsAt = undefined;
    this.state = "waiting";
    this.onWaitingStart();
  }

  startLobby() {
    this.lobbyEndsAt = Date.now() + Constants.LOBBY_DURATION;
    this.gameEndsAt = undefined;
    this.state = "lobby";
    this.onLobbyStart();
  }

  startGame() {
    this.lobbyEndsAt = undefined;
    this.gameEndsAt = Date.now() + Constants.GAME_DURATION;
    this.state = "game";
    this.onGameStart();
  }
}

function countPlayers(players: MapSchema<TRPlayer>) {
  let count = 0;
  for (const player in players) {
    count++;
  }

  return count;
}

function countActivePlayers(players: MapSchema<TRPlayer>) {
  let count = 0;
  for (const playerId in players) {
    if (players[playerId].isAlive) {
      count++;
    }
  }

  return count;
}

function getWinningPlayer(players: MapSchema<TRPlayer>): TRPlayer | null {
  for (const playerId in players) {
    if (players[playerId].isAlive) {
      return players[playerId];
    }
  }

  return null;
}
