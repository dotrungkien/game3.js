const colyseus = require("colyseus");
const GameEngine = require("./game-engine");
const gameEngine = new GameEngine();
const rpcWrapperEngine = require("./rpc-wrapper-engine.js");
const EthQuery = require("ethjs-query");
const ethUtil = require("ethereumjs-util");
const config = require("./get-config");

exports.MyRoom = class extends colyseus.Room {
  onCreate(options) {
    console.log("====CREATE===");
    setInterval(() => updateGame(this), 100);

    function updateGame(room) {
      gameEngine.updatePlayers();
      room.broadcast("heartbeat", { players: gameEngine.players });
      room.broadcast("sentence", { sentence: gameEngine.sentence });
      if (gameEngine.winner && !gameEngine.endGameCountdown) {
        // emit event to show everyone that the game is finished
        room.broadcast("winner", { clientId: gameEngine.winner.id });
        gameEngine.endGameCountdown = setTimeout(() => restartGame(room), 5000);
      }
    }

    function restartGame(room) {
      room.broadcast("restart");
      gameEngine.restart();
    }
  }

  onJoin(client, options) {
    console.log(`${client.id} joined`);
    gameEngine.createNewPlayer(client.id);

    this.onMessage("keyPressed", (client, key) => {
      if (!gameEngine.correctKeyPressed(key, client.id)) {
        if (!isModifierKey(key)) {
          client.send("wrongLetter", { type: "wrongLetter" });
        }
      }

      function isModifierKey(key) {
        return key === "Shift" || key === "Control" || key === "Alt";
      }
    });

    this.onMessage("claimReward", (client, address) => {
      console.log("received claim reward", address);
      claimToWallet(address).then(({ tx, address }) => {
        console.log("claim reward succesuflly, tx hash: ", tx);
        client.send("claimSuccess", { clientId: client.id, tx, address });
      });
    });

    const claimToWallet = async (address) => {
      const ether = 1e18;
      const amountWei = 0.01 * ether;
      const engine = rpcWrapperEngine({
        rpcUrl: config.rpcOrigin,
        addressHex: config.address,
        privateKey: ethUtil.toBuffer(config.privateKey),
      });
      const ethQuery = new EthQuery(engine);
      try {
        const tx = await ethQuery.sendTransaction({
          to: address,
          from: config.address,
          value: amountWei,
          data: "",
        });

        return { tx, address };
      } catch (e) {
        console.log(e);
        return null;
      }
    };
  }

  onLeave(client, consented) {
    console.log(`${client.id} left`);
    gameEngine.removePlayer(client.id);
    this.broadcast("disconnect", { clientId: client.id });
  }

  onDispose() {}
};
