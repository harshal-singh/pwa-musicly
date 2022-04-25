"use strict";

const handlers = {};

// notification sound
const audio = new Audio("sounds/notification.mp3");

// alert box
const layer = document.getElementById("layer");
const msgBox = document.getElementById("msg-box");

// hide loader
document.body.onload = () => {
  totalUsers();
  hideLoader();
};

// loader
function hideLoader() {
  const main = document.querySelector("main");
  const loader = document.getElementById("loader");

  loader.style.top = "100vh";

  if (navigator.onLine) {
    setTimeout(() => {
      main.style.opacity = "1";
    }, 1000);
    defaultKeys();
    addKeyPressEventListener();
  } else {
    main.style.visibility = "hidden";
    showMsg("NO INTERNET <br/><br/> Please connect to internet first.", true, false);
  }
}

// show message
function showMsg(message, alert, showCloseText = true) {
  const msg = document.getElementById("msg");
  const msgType = document.getElementById("msg-type");

  msgType.innerText = alert ? "💥 New Alert!" : "🔔 New Message";
  msg.innerHTML = message + (showCloseText ? "<span id='close-text'>( Press 9 to close )</span>" : "");

  layer.style.top = "0";
  msgBox.style.transform = "translate(-50%, -50%) scale(1)";
  document.body.style.overflowY = "hidden";

  document.body.click();
  audio.play();

  !showCloseText ? removeKeyPressEventListener() : addKeyPressEventListener();
}

// hide message
function hideMsg() {
  layer.style.top = "-100vh";
  msgBox.style.transform = "translate(-50%, -50%) scale(0)";
  document.body.style.overflowY = "scroll";
}

// set localStorage
function setLocalStorageItem(name, value) {
  return localStorage.setItem(name, value);
}

// get localStorage
function getLocalStorageItem(name) {
  return localStorage.getItem(name);
}

// add key event listener
function addKeyPressEventListener() {
  document.addEventListener("keyup", keyEvents);
}

// remove key event listener
function removeKeyPressEventListener() {
  document.removeEventListener("keyup", keyEvents);
}

// key events
function keyEvents(e) {
  switch (e.key) {
    // KaiOS
    case "SoftLeft":
      handlers.softLeft ? handlers.softLeft() : null;
      break;

    case "SoftRight":
      handlers.softRight ? handlers.softRight() : null;
      break;

    case "Enter":
      handlers.enter ? handlers.enter() : null;
      break;

    case "ArrowUp":
      handlers.upArrow ? handlers.upArrow() : null;
      break;

    case "ArrowDown":
      handlers.downArrow ? handlers.downArrow() : null;
      break;

    case "9":
      hideMsg();
      break;

    // desktop
    case "ArrowRight":
      handlers.softRight ? handlers.softRight() : null;
      break;

    case "ArrowLeft":
      handlers.softLeft ? handlers.softLeft() : null;
      break;

    default:
      return;
  }
}
