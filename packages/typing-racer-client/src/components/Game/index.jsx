import React, { useContext, useState, useEffect, Fragment } from "react";
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

import { getFileFromHash } from "../../helpers/database";

const GameSketch = p5Wrapper(generate());

const Game = () => {
  let state = useContext(AppStateContext);
  let dispatch = useContext(AppDispatchContext);
  let client = new Colyseus.Client("ws://localhost:2567");

  /**
   * Save user name
   */
  const [modal, setModal] = useState(false);
  const [myName, setMyName] = useState(
    localStorage.getItem("myName") ? localStorage.getItem("myName") : ""
  );
  const [hasName, setHasName] = useState(!!myName);

  useEffect(() => {
    let localName = localStorage.getItem("myName");
    if (!!localName) {
      console.log(`Welcome back ${localName}`);
      setMyName(localName);
      toast.info(`Welcome ${myName}`);
    }
  }, [myName]);

  /**
   * Colyseus Networking
   */

  let room;

  useEffect(() => {
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
        // console.log("on wrong letter message ", message);
        dispatch({ type: "WRONG_LETTER", payload: true });
      });

      room.onMessage("disconnect", ({ clientId }) => {
        console.log(`Disconnect ${clientId}`);
        removePlayer(state, dispatch, clientId);
      });

      room.onMessage("winner", ({ clientId }) => {
        if (room.sessionId === clientId) {
          console.log(`Congratulation ${myName}`);
          setModal(true);
        }
      });

      room.onMessage("restart", () => {
        console.log("restarting game-------------");
        resetPlayers(state, dispatch);
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
    start();
    return stop();
  }, [room]);

  const saveName = () => {
    if (!myName) {
      console.error("invalid name");
      return;
    }
    localStorage.setItem("myName", myName);
    setHasName(true);
    toast.info(`Welcome ${myName}`);
  };

  const handleInput = (e) => {
    e.preventDefault();
    setMyName(e.target.value);
  };

  const claimReward = () => {
    const { account, room } = state;
    room.send("claimReward", account);
    toast.success("Claim transaction sent!");
    setModal(false);
  };

  const handleReplayClick = async (hash) => {
    // start reading the file from DB
    const replayFile = await getFileFromHash(hash);

    const url = window.URL.createObjectURL(replayFile);

    this.video = document.querySelector("video");
    this.video.src = url;
    this.video.play();

    this.setState({
      replayingVideo: true,
    });
  };

  const renderReplayVideo = () => {
    return (
      <Fragment>
        <video id="recorded" loop></video>
      </Fragment>
    );
  };

  return (
    <div>
      {renderReplayVideo()}
      <ToastContainer />
      {hasName ? (
        <GameSketch dispatch={dispatch} sketch={sketch} state={state} />
      ) : (
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
      )}
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
                  <strong>You just won 0.01 ETH from Typing Racer.</strong>
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

            <MDBBtn
              outline
              color="primary"
              onClick={() => {
                setModal(false);
              }}
            >
              Open Replay
            </MDBBtn>
          </MDBModalFooter>
        </MDBModal>
      </MDBContainer>
    </div>
  );
};

export default Game;
