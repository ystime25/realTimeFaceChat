// eslint-disable-next-line no-undef
const socket = io();

const userFace = document.getElementById("userFace");
const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");

let userStream;
let mute = false;
let cameraOff = false;

const getMedia = async () => {
  try {
    userStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    userFace.srcObject = userStream;
  } catch (e) {
    console.log(e);
  }
};

getMedia();

const handleMuteClick = () => {
  if (!mute) {
    muteBtn.innerText = "음소거 해제";
    mute = true;
  } else {
    muteBtn.innerText = "음소거";
    mute = false;
  }
};

const handleCameraClick = () => {
  if (cameraOff) {
    cameraBtn.innerText = "카메라 끄기";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "카메라 키기";
    cameraOff = true;
  }
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
