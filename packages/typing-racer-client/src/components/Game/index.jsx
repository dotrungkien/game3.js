import React, { useContext, useState, useEffect } from "react";
import * as Colyseus from "colyseus.js";

import { generate } from "shortid";

import sketch from "./sketch";
import { updatePlayers, removePlayer, resetPlayers } from "./player-handler";
import { AppDispatchContext, AppStateContext } from "../App/AppStateProvider";
import p5Wrapper from "../P5Wrapper";
import {
  MDBRow,
  MDBCol,
  MDBContainer,
  MDBBtn,
  MDBModal,
  MDBModalBody,
  MDBModalHeader,
  MDBModalFooter,
  MDBInput,
} from "mdbreact";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GameSketch = p5Wrapper(generate());

const Game = () => {
  let state = useContext(AppStateContext);
  let dispatch = useContext(AppDispatchContext);
  let client = new Colyseus.Client("ws://localhost:2567");

  let room;

  const start = async () => {
    room = await client.joinOrCreate("typing-room");
    console.log(room.sessionId, "joined", room.name);
    dispatch({ type: "UPDATE_ROOM", payload: room });
    dispatch({ type: "UPDATE_CLIENT_ID", payload: room.sessionId });

    window.keyPressed = function (e) {
      e.preventDefault();
      room.send("keyPressed", e.key);
    };

    room.onMessage("sentence", ({ sentence }) => {
      if (sentence !== state.sentence) {
        // console.log('change sentence', state.sentence, sentence);
        dispatch({ type: "UPDATE_SENTENCE", payload: sentence });
      }
    });

    room.onMessage("heartbeat", ({ players }) => {
      // if (players.length) console.log(players[0]);
      updatePlayers(state, dispatch, players);
    });

    room.onMessage("wrongLetter", (message) => {
      // console.log('on wrong letter message ', message);
      // dispatch({ type: 'WRONG_LETTER', payload: true });
    });

    room.onMessage("disconnect", ({ clientId }) => {
      console.log(`Disconnect ${clientId}`);
      removePlayer(state, dispatch, clientId);
    });

    room.onMessage("winner", ({ clientId }) => {
      console.log("winner found", clientId, room.sessionId);
      if (room.sessionId === clientId) {
        setModal(true);
      }
    });

    room.onMessage("restart", () => {
      console.log("restarting game-------------");
      resetPlayers(state, dispatch);
      // countDown.beginGameStarting();
    });

    room.onMessage("claimSuccess", ({ clientId, tx, address }) => {
      if (room.sessionId === clientId) {
        console.log(`claim reward successfully for ${address} tx = ${tx}`);
        toast.success(`Transaction Hash = ${tx}`, "Transaction Completed");
      }
    });
  };

  const stop = () => {
    console.log("leaving room");
    if (room) room.leave();
  };

  useEffect(() => {
    start();
    let localName = localStorage.getItem("myName");
    console.log({ localName });
    if (!!localName) {
      setMyName(localName);
    }

    return stop();
  }, []);

  const [modal, setModal] = useState(false);
  const [hasName, setHasName] = useState(false);
  const [myName, setMyName] = useState("");

  const saveName = () => {
    if (!myName) {
      console.error("invalid name");
      return;
    }
    console.log("saveName");
    localStorage.setItem("myName", myName);
    setHasName(true);
  };
  const handleInput = (e) => {
    console.log("handle Input");
    e.preventDefault();
    setMyName(e.target.value);
  };

  const claimReward = () => {
    const { account, room } = state;
    // console.log('sent claim for ', account);
    room.send("claimReward", account);
    toast.success("Claim transaction sent!");
    setModal(false);
  };

  return (
    <div>
      <ToastContainer />
      <MDBContainer>
        <MDBModal isOpen={!hasName} toggle={() => {}}>
          <MDBModalHeader>Choose your name</MDBModalHeader>
          <MDBModalBody>
            <form>
              <MDBInput
                icon="user"
                type="text"
                onInput={(e) => handleInput(e)}
                value={myName}
                label="Your name here"
                outline
              />
            </form>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color="primary" onClick={() => saveName()}>
              Save
            </MDBBtn>
          </MDBModalFooter>
        </MDBModal>
      </MDBContainer>

      <MDBContainer>
        <MDBModal isOpen={modal} toggle={() => setModal(false)}>
          <MDBModalHeader>Congratulation!</MDBModalHeader>
          <MDBModalBody>
            <MDBRow>
              <MDBCol md="3" color="danger">
                <p></p>
                <p className="text-center">
                  <i className="fas fa-gift fa-4x"></i>
                </p>
              </MDBCol>

              <MDBCol md="9">
                <p>
                  <strong>You just won 0.1 ETH from Typing Racer.</strong>
                </p>
              </MDBCol>
            </MDBRow>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color="danger" onClick={() => claimReward()}>
              Get it now
              <i className="far fa-gem ml-1 white-text"></i>
            </MDBBtn>
            <MDBBtn outline color="danger" onClick={() => setModal(false)}>
              No, thanks
            </MDBBtn>
          </MDBModalFooter>
        </MDBModal>
      </MDBContainer>
      <GameSketch dispatch={dispatch} sketch={sketch} state={state} />
    </div>
  );
};

export default Game;
