let cameraId = "";
let videoInterval = "";
let qr_reader_data = "";
let scannerOn = false;
let selectedImage = false;

const reader = document.getElementById("reader");
const result = document.getElementById("result");
const options = document.getElementById("options");
const fileInput = document.getElementById("qr-input-file");

const enterLable = document.getElementById("enter");
const softLeftLable = document.getElementById("soft-left");
const softRightLable = document.getElementById("soft-right");

const html5QrCode = new Html5Qrcode(/* element id */ "reader");

function getCameraAccess() {
  return new Promise((resolve, reject) => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          cameraId = devices[0].id;
          resolve("Camera access granted!");
        } else {
          throw Error("No camera found!");
        }
      })
      .catch((err) => {
        reject(err);
      });

    checkCameraPermission();
  });
}

async function checkCameraPermission() {
  const permissionState = await navigator.permissions.query({ name: "camera" });
  checkPermissionState(permissionState.state);

  permissionState.onchange = () => {
    checkPermissionState(permissionState.state);
  };

  function checkPermissionState(state) {
    if (state === "granted") {
      if (!getLocalStorageItem("calledOnce")) {
        showMsg("Camera access granted.", false);
        setLocalStorageItem("calledOnce", true);
      }
    } else if (state === "prompt") {
      showMsg("Please allow app to use device camera.", false);
    } else if (state === "denied") {
      showMsg("Please provide access to use device camera. It is required to scan QR Code!", true, false);
    }
  }
}

function startCameraScanning() {
  const qrMessage = document.getElementById("qr-message");
  qrMessage ? (qrMessage.innerText = "Starting camera...") : "";

  getCameraAccess()
    .then(() => {
      reader.style.backgroundColor = "#000";

      videoInterval = setInterval(() => {
        const video = document.querySelector("video");
        if (!video) {
          showMsg("Could not scan properly, please try again.", true, false);
          setTimeout(() => {
            location.reload();
          }, 4000);
        }
      }, 5000);

      html5QrCode
        .start(
          cameraId,
          {
            fps: 10, // speed of scanning
          },
          (decodedText, decodedResult) => showResult(decodedText, decodedResult),
          (errorMessage) => {}
        )
        .then(() => {
          scanningKeys();
        })
        .catch((err) => {
          throw `Scanner Error <br/> ${err}`;
        });

      scannerOn = true;
    })
    .catch((err) => {
      err = err + "";
      scannerOn = false;
      if (err.startsWith("NotAllowedError")) {
        err = "Please allow app to use device camera to scan QR Code.";
        showMsg(err, true, false);
      } else if (err.includes("already under transition")) {
        showMsg("Please wait, requested task in under process!", true);
      } else if (err.startsWith("NotReadableError")) {
        showMsg("Could not start scanner, please try again later.", true, false);
        setTimeout(() => {
          location.reload();
        }, 5000);
      } else if (err.includes("scan is ongoing")) {
        location.reload();
      } else {
        showMsg(err, true);
      }
    });
}

function stopCameraScanning() {
  if (scannerOn) {
    html5QrCode
      .stop()
      .then(() => {
        scannerOn = false;
        clearInterval(videoInterval);
      })
      .catch((err) => {
        err = err + "";
        if (!err.startsWith("NotFoundError") || !err.includes("removeChild")) {
          showMsg(err, true);
        }
      });
  } else {
    scanningKeys();
  }
}

function resetToInitialUI() {
  defaultKeys();
  reader.style.backgroundColor = "unset";
  reader.innerHTML = `<div><img src="./icons/mobile-scan.png" width="56"><p id="qr-message">Scan any QR Code.<br /> Or <br /> Upload QR Code image to scan.</p></div>`;
}

function showResult(decodedText, decodedResult) {
  resultKeys();
  const qrType = document.getElementById("qr-type");
  const qrResult = document.getElementById("qr-result");

  // show result
  qrType.innerText = decodedResult
    ? decodedResult.result.format.formatName.split("_").join(" ")
    : "N/A - QR image file was scanned.";
  if (decodedText.startsWith("http")) {
    qrResult.innerHTML = `<a href="${decodedText}" target="_blank" rel="noopener noreferrer">${decodedText}</a>`;
  } else {
    qrResult.innerText = decodedText;
  }
  qr_reader_data = decodedText;
  saveScannedData(decodedText);

  decodedResult ? stopCameraScanning() : "";

  result.style.top = 0; // show result ui
  reader.style.display = "none"; // hide reader ui
}

function hideResult() {
  reader.style.display = "grid"; // show reader ui
  result.style.top = "100vh"; // hide result ui
}

function selectImage() {
  return new Promise((resolve, reject) => {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length == 0) {
        reject("No QR Code image <br /> file selected for scanning.");
      } else {
        selectedImage = true;
        resolve(e.target.files[0]);
      }
    });

    fileInput.click();
  });
}

function startImageScanning() {
  defaultKeys();

  let timeOut = 0;
  const timeLimit = 20;

  const qrMessage = document.getElementById("qr-message");
  qrMessage ? (qrMessage.innerText = "Opening file manager...") : "";

  const checkFile = setInterval(() => {
    if (!selectedImage) {
      qrMessage ? (qrMessage.innerHTML = "No QR Code image <br /> file selected for scanning.") : "";
      timeOut++;
    } else {
      timeOut = timeLimit;
    }

    if (timeOut == timeLimit) {
      clearInterval(checkFile);
      reader.innerHTML = `<div><img src="./icons/mobile-scan.png" width="56"><p id="qr-message">Scan any QR Code.<br /> Or <br /> Upload QR Code image to scan.</p></div>`;
    }
  }, 1000);

  selectImage()
    .then((imageFile) => {
      fileInput.value = "";
      selectedImage = false;

      html5QrCode
        .scanFile(imageFile, true)
        .then((decodedText) => {
          showResult(decodedText, null);
        })
        .catch((err) => {
          err = err + "";
          if (err.includes("No MultiFormat Readers")) {
            resetToInitialUI();
            err = "Error while scanning. <br/> QR type not supported.";
          }
          showMsg(err, true);
        });
    })
    .catch((err) => {
      showMsg(err, true);
    });
}

// ---------------------- keys ------------------------ //
function resultKeys() {
  enterLable.style.visibility = "visible";
  enterLable.innerText = "Scan";

  softLeftLable.style.visibility = "visible";
  softRightLable.style.visibility = "visible";
  softLeftLable.innerText = "Options";
  softRightLable.innerText = "Close";

  handlers.softLeft = () => {
    removeKeyEvents();

    showOptions();
  };

  handlers.softRight = () => {
    removeKeyEvents();

    hideResult();
    resetToInitialUI();
  };

  handlers.enter = () => {
    removeKeyEvents();

    hideResult();
    startCameraScanning();
  };
}

function scanningKeys() {
  softLeftLable.style.visibility = "hidden";
  softRightLable.style.visibility = "hidden";
  softLeftLable.innerText = "";
  softRightLable.innerText = "";

  enterLable.style.visibility = "visible";
  enterLable.innerText = "Stop";

  handlers.enter = () => {
    removeKeyEvents();

    stopCameraScanning();
    resetToInitialUI();
  };
}

function defaultKeys() {
  enterLable.style.visibility = "hidden";
  enterLable.innerText = "";

  softLeftLable.style.visibility = "visible";
  softRightLable.style.visibility = "visible";
  softLeftLable.innerText = "Upload";
  softRightLable.innerText = "Scan";

  handlers.softLeft = () => {
    removeKeyEvents();

    startImageScanning();
  };

  handlers.softRight = () => {
    removeKeyEvents();

    startCameraScanning();
  };
}

function optionsKeys() {
  enterLable.style.visibility = "visible";
  enterLable.innerText = "Ok";

  softLeftLable.style.visibility = "visible";
  softRightLable.style.visibility = "hidden";
  softLeftLable.innerText = "Close";
  softRightLable.innerText = "";

  const copy = document.getElementById("copy");
  const share = document.getElementById("share");
  const download = document.getElementById("download");

  share.onclick = () => {
    shareData(qr_reader_data);
  };

  copy.onclick = () => {
    navigator.clipboard
      .writeText(qr_reader_data)
      .then(() => {
        showMsg("Copied data to clipboard.", false);
      })
      .catch((err) => {
        showMsg("Could not copy data, please try again!" + err, true);
      });
  };

  download.onclick = () => {
    const blob = new Blob([qr_reader_data], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // file name
    a.download = "qr-reader";
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  let i = 0;
  const buttons = document.querySelectorAll("button");
  buttons[i].focus();

  handlers.downArrow = () => {
    i++;
    if (i < buttons.length) {
      buttons[i].focus();
    } else {
      i = 0;
      buttons[i].focus();
    }
  };

  handlers.upArrow = () => {
    i--;
    if (i >= 0) {
      buttons[i].focus();
    } else {
      i = 2;
      buttons[i].focus();
    }
  };

  handlers.softLeft = () => {
    removeKeyEvents();

    buttons[i].blur();
    hideOptions();
  };
}

function showOptions() {
  options.style.bottom = "28px";
  optionsKeys();
}

function hideOptions() {
  options.style.bottom = "-100vh";
  handlers.downArrow = null;
  handlers.upArrow = null;
  resultKeys();
}

function removeKeyEvents() {
  handlers.enter = null;
  handlers.softLeft = null;
  handlers.softRight = null;
}
