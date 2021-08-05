// eslint-disable-next-line no-undef
const socket = io();

const userFace = document.getElementById("userFace");
const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");
const selectCamera = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let userStream;
let mute = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = userStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      selectCamera.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

const getMedia = async (deviceId) => {
  const initialSettings = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraSettings = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    userStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraSettings : initialSettings
    );
    userFace.srcObject = userStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
};

const handleMuteClick = () => {
  userStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!mute) {
    muteBtn.innerText = "음소거 해제";
    mute = true;
  } else {
    muteBtn.innerText = "음소거";
    mute = false;
  }
};

const handleCameraClick = () => {
  userStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "카메라 끄기";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "카메라 켜기";
    cameraOff = true;
  }
};

const handleCameraSelection = async () => {
  await getMedia(selectCamera.value);
  if (myPeerConnection) {
    const videoTrack = userStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
selectCamera.addEventListener("input", handleCameraSelection);

// Join room

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const startFaceTalk = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
};

const handleUserEnter = async (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await startFaceTalk();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
};

welcomeForm.addEventListener("submit", handleUserEnter);

// Socket Code

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("offer sent");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  console.log("offer recieved");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("answer sent");
});

socket.on("answer", (answer) => {
  console.log("answer recieved");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("ICE candidate recieved");
  myPeerConnection.addIceCandidate(ice);
});

//RTC code

const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleICE);
  myPeerConnection.addEventListener("addStream", handleAddStream);
  userStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, userStream));
};

const handleICE = (data) => {
  console.log("ICE candidate sent");
  socket.emit("ice", data.candidate, roomName);
};

const handleAddStream = (data) => {
  const peersStream = document.getElementById("peersStream");
  peersStream.srcObject = data.stream;
  console.log("got an event from my peer");
  console.log(data);
};
