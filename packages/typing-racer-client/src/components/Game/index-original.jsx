import React, {
  useRef,
  useContext,
  useState,
  useEffect,
  Fragment,
} from "react";
import p5 from "p5";
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

import {
  localSaveReplay,
  clientSaveTournamentReplay,
  getFileFromHash,
} from "../../helpers/database";

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
      toast.info(`👋 Nice to meet you ${myName}`);
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
        // stopRecording();
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

  const [mediaSource, setMediaSource] = useState(new window.MediaSource());
  // const [canvas, setCanvas] = useState(null);
  const [video, setVideo] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordFileHash, setRecordFileHash] = useState(null);

  const startRecording = () => {
    console.log("start recording");
    let options = { mimeType: "video/webm" };
    setRecordedBlobs([]);
    try {
      setMediaRecorder(new window.MediaRecorder(stream, options));
    } catch (e0) {
      console.log("Unable to create MediaRecorder with options Object: ", e0);
      try {
        options = { mimeType: "video/webm,codecs=vp9" };
        setMediaRecorder(new window.MediaRecorder(stream, options));
      } catch (e1) {
        console.log("Unable to create MediaRecorder with options Object: ", e1);
        try {
          options = "video/vp8"; // Chrome 47
          setMediaRecorder(new window.MediaRecorder(stream, options));
        } catch (e2) {
          alert(
            "MediaRecorder is not supported by this browser.\n\n" +
              "Try Firefox 29 or later, or Chrome 47 or later, " +
              "with Enable experimental Web Platform features enabled from chrome://flags."
          );
          console.error("Exception while creating MediaRecorder:", e2);
          return;
        }
      }
    }
    console.log(
      "Created MediaRecorder",
      mediaRecorder,
      "with options",
      options
    );

    mediaRecorder.onstop = (event) => {
      // console.log('Recorder stopped: ', event);
      // const superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' });
      // this.video.src = window.URL.createObjectURL(superBuffer);
    };

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        let newRecordedBlobs = recordedBlobs;
        newRecordedBlobs.push(event.data);
        setRecordedBlobs(newRecordedBlobs);
      }
    };

    mediaRecorder.start(100); // collect 100ms of data
    // console.log('MediaRecorder started', this.mediaRecorder);
  };

  const stopRecording = async () => {
    mediaRecorder.stop();

    // TODO: playerId = roomId? change to something more meaningful
    const playerId = state.clientId;
    const tournamentId = "demo";
    // const time = gameManager.gameEndsAt - Date.now();
    const time = Date.now();

    console.log("Recorded Blobs: ", recordedBlobs);

    const replayDate = new Date();
    const filename =
      "replay_" + playerId + "_" + replayDate.valueOf() + ".webm";
    const options = { type: "video/webm" };

    const file = new File(recordedBlobs, filename, options);

    // this.video.controls = true;

    // TODO: move to web worker so it doesn't pause main thread
    if (tournamentId === "demo") {
      localSaveReplay(playerId, tournamentId, time, file);
    } else {
      recordFileHash = await clientSaveTournamentReplay(file);
      //const resultId = 1
      //const result = await putTournamentResult(tournamentId, resultId, fileHash);
      //console.log(result)
    }
  };

  const [isReplay, setIsReplay] = useState(false);
  const sketchContainer = useRef(null);
  let p5Canvas = null;

  useEffect(() => {
    p5Canvas = new p5(sketch, sketchContainer.current);
    p5Canvas.state = state;
    p5Canvas.dispath = dispatch;

    const getCanvas = async () => {
      let canvas = await document.getElementsByTagName("canvas");
      return canvas;
    };
    getCanvas().then((canvas) => {
      console.log(canvas);
      console.log(canvas.length);
      if (canvas.length) {
        const canvas2 = canvas[0];
        console.log(canvas2);
        const stream2 = canvas2.captureStream(25); // frames per second
        console.log("Started stream capture from canvas element: ", stream2);
        // startRecording();
      }
    });

    return () => {
      p5Canvas.remove();
    };
  }, []);

  return (
    <div>
      {isReplay ? renderReplayVideo() : null}
      <ToastContainer />
      {hasName ? (
        // <GameSketch dispatch={dispatch} sketch={sketch} state={state} />
        <div id="main-game" ref={sketchContainer} />
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
