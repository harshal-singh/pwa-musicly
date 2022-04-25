"use strict";

const baseURL = "https://kaiostestapi.quadbtech.com";

if (navigator.onLine) {
  if (getLocalStorageItem("qr_reader_token")) {
    userInfo(getLocalStorageItem("qr_reader_token"));
  } else {
    getIpAndRegister();
    showMsg("Welcome to QR Reader! <br/><br/> Please wait, we are starting scanner...", false, false);
  }
} else {
  showMsg("NO INTERNET <br/><br/> Please connect to internet first.", true);
}

//  get user ip address
function getIpAndRegister() {
  fetch("https://api.ipify.org?format=json")
    .then((data) => {
      return data.json();
    })
    .then(({ ip }) => {
      register(ip);
    })
    .catch((err) => {
      showMsg("GET IP ADDRESS <br/><br/>" + err, true);
    });
}

// register
function register(ip) {
  fetch(`${baseURL}/api/qrcodescanner/register`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      ip_address: ip,
      device: navigator.userAgent,
    }),
  })
    .then((data) => {
      return data.json();
    })
    .then((obj) => {
      if (obj.status == "success") {
        const token = obj.token;
        setLocalStorageItem("qr_reader_token", token);
        userInfo(token);
      } else if (obj.status == "fail") {
        const msg = obj["Error"]["errors"][0].message;
        showMsg(msg, true);
      } else {
        showMsg("REGISTRATION <br/><br/> Problem with api", true);
      }
    })
    .catch((err) => {
      err = err + "";
      if (err.includes("Failed to fetch")) {
        err = "Could not start server, please try again later!";
        showMsg(err, true, false);
      } else {
        showMsg(err, true);
      }
    });
}

// get user info
function userInfo(token) {
  fetch(`${baseURL}/api/qrcodescanner/user_info?token=${token}`)
    .then((data) => {
      return data.json();
    })
    .then((obj) => {
      if (obj.status == "success") {
        if (getLocalStorageItem("qr_reader_token")) {
          setTimeout(() => {
            hideMsg();
          }, 2500);
        }
      } else if (obj.status == "fail") {
        const msg = obj["Error"]["errors"][0].message;
        showMsg(msg, true);
      } else {
        showMsg("GET USERINFO <br/><br/> Problem with api", true);
      }
    })
    .catch((err) => {
      err = err + "";
      if (err.includes("Failed to fetch")) {
        err = "Could not start server, please try again later!";
        showMsg(err, true, false);
      } else {
        showMsg(err, true);
      }
    });
}

// total users
function totalUsers() {
  fetch(`${baseURL}/api/qrcodescanner/total_visitors`)
    .then((data) => {
      return data.json();
    })
    .then((obj) => {
      document.getElementById("users-count").innerText = obj.visitor;
    })
    .catch((err) => {
      err = err + "";
      if (err.includes("Failed to fetch")) {
        err = "Could not start server, please try again later!";
        showMsg(err, true, false);
      } else {
        showMsg(err, true);
      }
    });
}

// save scanned data
function saveScannedData(data) {
  fetch(`${baseURL}/api/qrcodescanner/scanned_data`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      user_data: data,
      token: getLocalStorageItem("qr_reader_token"),
    }),
  }).catch((err) => {
    err = err + "";
    if (err.includes("Failed to fetch")) {
      err = "Could not start server, please try again later!";
      showMsg(err, true, false);
    }
  });
}

// share data
function shareData(data) {
  if ("MozActivity" in window) {
    const sharing = new MozActivity({
      name: "share",
      data: {
        type: "text/plain",
        text: data,
      },
    });

    // if successfully shared
    sharing.onsuccess = () => {
      showMsg("Sharing data was successful.", false);
    };

    // if error in sharing
    sharing.onerror = () => {
      showMsg("Could not share data, please try again!", true);
    };
  } else {
    showMsg("Sharing not supported by your device.", true);
  }
}
