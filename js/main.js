"use strict";

window.ononline = () => location.reload();
window.onoffline = () => alert("No internet connection available. Please connection to internet.");

const body = document.querySelector("body");
const curr_track = document.querySelector("audio");

const title = document.getElementById("song__title");
const artist = document.getElementById("song__artist");
const image = document.getElementById("image");

const prev = document.getElementById("prev");
const next = document.getElementById("next");
const play__pause = document.getElementById("paly-pause");
const repeat_one = document.getElementById("repeat-one");
const repeat_one_svg = document.getElementById("repeat-one-svg");
const shuffle = document.getElementById("shuffle");
const shuffle_svg = document.getElementById("shuffle-svg");

const time__line__box = document.getElementById("time__line__box");
const time__line = document.getElementById("time__line");
const current_min = document.getElementById("current_min");
const current_sec = document.getElementById("current_sec");
const total_min = document.getElementById("total_min");
const total_sec = document.getElementById("total_sec");

const music_list = document.getElementById("music_list");

const track_list = [
  {
    name: "paagal",
    artist: "Badshah",
    image: "./images/1_paagal.jpg",
    path: "./songs/1_paagal.mp3",
    time: "3:03",
  },
  {
    name: "o saki saki",
    artist: "Neha Kakkar, B Praak, Tulsi Kumar",
    image: "./images/2_o_saki_saki.jpg",
    path: "./songs/2_o_saki_saki.mp3",
    time: "3:24",
  },
  {
    name: "aankh marey",
    artist: "Kumar Sanu, Neha Kakkar, Mika Singh",
    image: "./images/3_aankh_marey.jpg",
    path: "./songs/3_aankh_marey.mp3",
    time: "3:48",
  },
  {
    name: "naach meri rani",
    artist: "Guru Randhawa, Nikhita Gandhi",
    image: "./images/4_naach_meri_rani.jpg",
    path: "./songs/4_naach_meri_rani.mp3",
    time: "3:43",
  },
];

track_list.forEach((obj, i) => {
  let num = i + 1 < 10 ? "0" + (i + 1) : i + 1;
  let html = `<div onclick="addQueryParam('song_id', '${i + 1}')" class="music">
                    <div>
                        <span class="number">${num}</span>
                        <div>
                            <h4>${obj.name}</h4>
                            <small>${obj.artist}</small>
                        </div>
                    </div>
                    <h5>${obj.time}</h5>
                </div>`;
  music_list.insertAdjacentHTML("beforeend", html);
});

let updateTimer;
let track_index = 0;
let isPlaying = false;
let repeat = false;
let shuffled = false;

const addQueryParam = (key, value) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({}, "", url.toString());

  loadTrack();
  playTrack();
};

// loads track details
function loadTrack() {
  if (!window.navigator.onLine) {
    alert("No internet connection available. Please connection to internet first");
    return;
  }

  // get values from parmas
  const urlSearchParams = new URLSearchParams(window.location.search);
  const { song_id } = Object.fromEntries(urlSearchParams.entries());
  if (song_id) {
    track_index = song_id - 1;
  }

  clearInterval(updateTimer);
  // reset values
  resetValues();

  curr_track.src = track_list[track_index].path;
  image.src = track_list[track_index].image;
  title.innerHTML = track_list[track_index].name;
  artist.innerHTML = track_list[track_index].artist;

  updateTimer = setInterval(seekUpdate, 1000);

  // if current track ends load next
  curr_track.addEventListener("ended", nextTrack);

  if (!isPlaying) {
    play__pause.innerHTML =
      '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 41.25C12.1444 41.25 3.75 32.8556 3.75 22.5C3.75 12.1444 12.1444 3.75 22.5 3.75C32.8556 3.75 41.25 12.1444 41.25 22.5C41.25 32.8556 32.8556 41.25 22.5 41.25ZM19.9163 15.7781C19.8034 15.7028 19.6723 15.6596 19.5368 15.6529C19.4013 15.6463 19.2665 15.6765 19.1468 15.7404C19.0272 15.8042 18.9271 15.8994 18.8572 16.0157C18.7873 16.1319 18.7503 16.265 18.75 16.4006V28.5994C18.7503 28.735 18.7873 28.8681 18.8572 28.9844C18.9271 29.1006 19.0272 29.1958 19.1468 29.2596C19.2665 29.3235 19.4013 29.3537 19.5368 29.3471C19.6723 29.3404 19.8034 29.2972 19.9163 29.2219L29.0644 23.1244C29.1673 23.0559 29.2516 22.9631 29.31 22.8542C29.3683 22.7452 29.3989 22.6236 29.3989 22.5C29.3989 22.3764 29.3683 22.2548 29.31 22.1458C29.2516 22.0369 29.1673 21.9441 29.0644 21.8756L19.9144 15.7781H19.9163Z" fill="var(--secondary)"/></svg>';
  }
}
loadTrack();

// play__pause
play__pause.addEventListener("click", function () {
  if (!isPlaying) {
    playTrack();
  } else {
    pauseTrack();
  }
});

// playTrack
function playTrack() {
  curr_track.play();
  isPlaying = true;

  play__pause.innerHTML =
    '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 41.25C12.1444 41.25 3.75 32.8556 3.75 22.5C3.75 12.1444 12.1444 3.75 22.5 3.75C32.8556 3.75 41.25 12.1444 41.25 22.5C41.25 32.8556 32.8556 41.25 22.5 41.25ZM16.875 16.875V28.125H20.625V16.875H16.875ZM24.375 16.875V28.125H28.125V16.875H24.375Z" fill="var(--secondary)"/></svg>';
}

// pauseTrack
function pauseTrack() {
  curr_track.pause();
  isPlaying = false;

  play__pause.innerHTML =
    '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 41.25C12.1444 41.25 3.75 32.8556 3.75 22.5C3.75 12.1444 12.1444 3.75 22.5 3.75C32.8556 3.75 41.25 12.1444 41.25 22.5C41.25 32.8556 32.8556 41.25 22.5 41.25ZM19.9163 15.7781C19.8034 15.7028 19.6723 15.6596 19.5368 15.6529C19.4013 15.6463 19.2665 15.6765 19.1468 15.7404C19.0272 15.8042 18.9271 15.8994 18.8572 16.0157C18.7873 16.1319 18.7503 16.265 18.75 16.4006V28.5994C18.7503 28.735 18.7873 28.8681 18.8572 28.9844C18.9271 29.1006 19.0272 29.1958 19.1468 29.2596C19.2665 29.3235 19.4013 29.3537 19.5368 29.3471C19.6723 29.3404 19.8034 29.2972 19.9163 29.2219L29.0644 23.1244C29.1673 23.0559 29.2516 22.9631 29.31 22.8542C29.3683 22.7452 29.3989 22.6236 29.3989 22.5C29.3989 22.3764 29.3683 22.2548 29.31 22.1458C29.2516 22.0369 29.1673 21.9441 29.0644 21.8756L19.9144 15.7781H19.9163Z" fill="var(--secondary)"/></svg>';
}

body.addEventListener("keydown", (e) => {
  if (isPlaying && e.key === "MediaPlayPause") {
    isPlaying = false;

    play__pause.innerHTML =
      '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 41.25C12.1444 41.25 3.75 32.8556 3.75 22.5C3.75 12.1444 12.1444 3.75 22.5 3.75C32.8556 3.75 41.25 12.1444 41.25 22.5C41.25 32.8556 32.8556 41.25 22.5 41.25ZM19.9163 15.7781C19.8034 15.7028 19.6723 15.6596 19.5368 15.6529C19.4013 15.6463 19.2665 15.6765 19.1468 15.7404C19.0272 15.8042 18.9271 15.8994 18.8572 16.0157C18.7873 16.1319 18.7503 16.265 18.75 16.4006V28.5994C18.7503 28.735 18.7873 28.8681 18.8572 28.9844C18.9271 29.1006 19.0272 29.1958 19.1468 29.2596C19.2665 29.3235 19.4013 29.3537 19.5368 29.3471C19.6723 29.3404 19.8034 29.2972 19.9163 29.2219L29.0644 23.1244C29.1673 23.0559 29.2516 22.9631 29.31 22.8542C29.3683 22.7452 29.3989 22.6236 29.3989 22.5C29.3989 22.3764 29.3683 22.2548 29.31 22.1458C29.2516 22.0369 29.1673 21.9441 29.0644 21.8756L19.9144 15.7781H19.9163Z" fill="var(--secondary)"/></svg>';
  } else if (!isPlaying && e.key === "MediaPlayPause") {
    isPlaying = true;

    play__pause.innerHTML =
      '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 41.25C12.1444 41.25 3.75 32.8556 3.75 22.5C3.75 12.1444 12.1444 3.75 22.5 3.75C32.8556 3.75 41.25 12.1444 41.25 22.5C41.25 32.8556 32.8556 41.25 22.5 41.25ZM16.875 16.875V28.125H20.625V16.875H16.875ZM24.375 16.875V28.125H28.125V16.875H24.375Z" fill="var(--secondary)"/></svg>';
  }
});

// prev
function prevTrack() {
  if (track_index > 0) {
    track_index--;
  } else {
    // last track = track_list.lenght -1
    track_index = track_list.length - 1;
  }

  addQueryParam("song_id", track_index + 1);

  loadTrack();
  playTrack();
}
prev.addEventListener("click", prevTrack);

// next
function nextTrack() {
  if (repeat) {
    track_index = track_index;
  } else if (shuffled) {
    track_index = Math.round(Math.random() * 40);
  } else {
    // last track = track_list.lenght -1
    if (track_index < track_list.length - 1) {
      track_index++;
    } else {
      track_index = 0;
    }
  }

  addQueryParam("song_id", track_index + 1);

  loadTrack();
  playTrack();
}
next.addEventListener("click", nextTrack);

// seekTo
function seekTo(e) {
  let width = this.clientWidth;
  let clickX = e.offsetX;
  let duration = curr_track.duration;
  // update seek
  curr_track.currentTime = (clickX / width) * duration;
}
time__line__box.addEventListener("click", seekTo);

// seekUpdate pre sec
function seekUpdate() {
  time__line.style.width = `${(curr_track.currentTime * 100) / curr_track.duration}%`;

  // total time
  let totalMin = Math.floor(curr_track.duration / 60);
  let totalSec = Math.floor(curr_track.duration - totalMin * 60);

  // current time
  let currMin = Math.floor(curr_track.currentTime / 60);
  let currSec = Math.floor(curr_track.currentTime - currMin * 60);

  // Add a zero to the single digit time values
  if (currMin < 10) {
    currMin = "0" + currMin;
  }
  if (currSec < 10) {
    currSec = "0" + currSec;
  }
  if (totalMin < 10) {
    totalMin = "0" + totalMin;
  }
  if (totalSec < 10) {
    totalSec = "0" + totalSec;
  }

  // update time
  total_min.innerText = totalMin;
  total_sec.innerText = totalSec;
  current_min.innerText = currMin;
  current_sec.innerText = currSec;
}

// reset all values
function resetValues() {
  // time line
  time__line.style.width = 0;

  // total
  total_min.innerText = "00";
  total_sec.innerText = "00";
  // remain
  current_min.innerText = "00";
  current_sec.innerText = "00";
}

// repeat
repeat_one?.addEventListener("click", () => {
  if (repeat) {
    repeat = false;
    repeat_one_svg.style.fill = "#ABABAB";
  } else {
    repeat = true;
    repeat_one_svg.style.fill = "#000000";
    if (shuffled) {
      shuffled = false;
      shuffle_svg.style.fill = "#ABABAB";
    }
  }
});

// shuffle
shuffle?.addEventListener("click", () => {
  if (shuffled) {
    shuffled = false;
    shuffle_svg.style.fill = "#ABABAB";
  } else {
    shuffled = true;
    shuffle_svg.style.fill = "#000000";
    if (repeat) {
      repeat = false;
      repeat_one_svg.style.fill = "#ABABAB";
    }
  }
});
