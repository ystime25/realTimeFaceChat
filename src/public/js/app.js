// eslint-disable-next-line no-undef
const socket = io();

const userFace = document.getElementById("userFace");
const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");
const selectCamera = document.getElementById("cameras");

let userStream;
let mute = false;
let cameraOff = false;

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

getMedia();

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
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
selectCamera.addEventListener("input", handleCameraSelection);
