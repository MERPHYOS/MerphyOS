const startBtn = document.querySelector("#startBtn");
const startMenu = document.querySelector("#startMenu");
const clock = document.querySelector("#clock");
const calcDisplay = document.querySelector("#calcDisplay");

const carUpload = document.querySelector("#carUpload");
const garageCarImage = document.querySelector("#garageCarImage");
const cssCar = document.querySelector("#cssCar");
const startEngineBtn = document.querySelector("#startEngineBtn");
const garageStatus = document.querySelector("#garageStatus");
const garageScene = document.querySelector("#garageScene");

let zIndex = 20;
let calcValue = "0";
let engineStarted = false;
let carObjectUrl = null;

const operators = ["+", "-", "*", "/", "%"];

if (startBtn && startMenu) {
  startBtn.addEventListener("click", () => {
    startMenu.classList.toggle("active");
  });
}

document.addEventListener("click", (event) => {
  if (!startMenu || !startBtn) {
    return;
  }

  const isStartClick = startMenu.contains(event.target) || startBtn.contains(event.target);

  if (!isStartClick) {
    startMenu.classList.remove("active");
  }
});

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    openWindow(button.dataset.open);

    if (startMenu) {
      startMenu.classList.remove("active");
    }
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    closeWindow(button.dataset.close);
  });
});

document.querySelectorAll("[data-minimize]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    minimizeWindow(button.dataset.minimize);
  });
});

document.querySelectorAll("[data-maximize]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMaximizeWindow(button.dataset.maximize);
  });
});

function openWindow(id) {
  const appWindow = document.getElementById(id);

  if (!appWindow) {
    return;
  }

  prepareWindowAnimationToDock(appWindow, id);

  appWindow.classList.remove("minimized", "minimizing");
  appWindow.classList.add("active");
  appWindow.style.zIndex = String(++zIndex);

  appWindow.classList.remove("restoring");

  void appWindow.offsetWidth;

  appWindow.classList.add("restoring");

  setTimeout(() => {
    appWindow.classList.remove("restoring");
    updateDockButtonState(id);
  }, 300);

  updateDockButtonState(id);
}

function closeWindow(id) {
  const appWindow = document.getElementById(id);

  if (!appWindow) {
    return;
  }

  appWindow.classList.remove(
    "active",
    "minimized",
    "minimizing",
    "restoring",
    "maximized",
    "maximize-animating"
  );

  updateDockButtonState(id);
  updateMaximizeButtonState(id, false);
}

function minimizeWindow(id) {
  const appWindow = document.getElementById(id);

  if (!appWindow || !appWindow.classList.contains("active")) {
    return;
  }

  prepareWindowAnimationToDock(appWindow, id);

  appWindow.classList.remove("restoring");
  appWindow.classList.add("minimizing");

  setTimeout(() => {
    appWindow.classList.remove("active", "minimizing");
    appWindow.classList.add("minimized");
    updateDockButtonState(id);
  }, 320);
}

function toggleMaximizeWindow(id) {
  const appWindow = document.getElementById(id);

  if (!appWindow) {
    return;
  }

  if (!appWindow.classList.contains("active") && appWindow.classList.contains("minimized")) {
    openWindow(id);
  }

  if (!appWindow.classList.contains("active")) {
    return;
  }

  const shouldMaximize = !appWindow.classList.contains("maximized");

  appWindow.classList.remove("minimizing", "restoring");
  appWindow.classList.add("maximize-animating");

  if (shouldMaximize) {
   appWindow.classList.remove("is-resized");
  }


  appWindow.style.zIndex = String(++zIndex);

  appWindow.classList.toggle("maximized", shouldMaximize);

  updateMaximizeButtonState(id, shouldMaximize);

  setTimeout(() => {
    appWindow.classList.remove("maximize-animating");
  }, 300);
}

function updateMaximizeButtonState(id, isMaximized) {
  const button = document.querySelector(`[data-maximize="${id}"]`);

  if (!button) {
    return;
  }

  button.textContent = isMaximized ? "❐" : "□";
  button.title = isMaximized ? "Вернуть размер" : "На весь экран";
}

function prepareWindowAnimationToDock(appWindow, id) {
  const dockButton = getDockButton(id);

  if (!dockButton) {
    appWindow.style.setProperty("--minimize-x", "0px");
    appWindow.style.setProperty("--minimize-y", "120px");
    return;
  }

  const windowRect = appWindow.getBoundingClientRect();
  const dockRect = dockButton.getBoundingClientRect();

  const windowCenterX = windowRect.left + windowRect.width / 2;
  const windowCenterY = windowRect.top + windowRect.height / 2;

  const dockCenterX = dockRect.left + dockRect.width / 2;
  const dockCenterY = dockRect.top + dockRect.height / 2;

  const offsetX = dockCenterX - windowCenterX;
  const offsetY = dockCenterY - windowCenterY;

  appWindow.style.setProperty("--minimize-x", `${offsetX}px`);
  appWindow.style.setProperty("--minimize-y", `${offsetY}px`);
}

function getDockButton(id) {
  return document.querySelector(`.dock .dock-btn[data-open="${id}"]`);
}

function updateDockButtonState(id) {
  const appWindow = document.getElementById(id);
  const dockButton = getDockButton(id);

  if (!appWindow || !dockButton) {
    return;
  }

  const isOpen = appWindow.classList.contains("active");
  const isMinimized = appWindow.classList.contains("minimized");

  dockButton.classList.toggle("window-open", isOpen);
  dockButton.classList.toggle("window-minimized", isMinimized);
}

function updateClock() {
  if (!clock) {
    return;
  }

  const now = new Date();

  const time = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit"
  });

  clock.innerHTML = `${time}<br>${date}`;
}

setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll(".calc-btn").forEach((button) => {
  button.addEventListener("click", () => {
    handleCalc(button.dataset.calc);
  });
});

function handleCalc(value) {
  if (value === "clear") {
    calcValue = "0";
    updateCalc();
    return;
  }

  if (value === "back") {
    calcValue = calcValue.length > 1 ? calcValue.slice(0, -1) : "0";
    updateCalc();
    return;
  }

  if (value === "=") {
    calculateResult();
    return;
  }

  if (calcValue === "Ошибка") {
    calcValue = "0";
  }

  if (value === ".") {
    addDecimalPoint();
    return;
  }

  if (operators.includes(value)) {
    addOperator(value);
    return;
  }

  addDigit(value);
}

function addDigit(value) {
  if (calcValue === "0") {
    calcValue = value;
  } else if (calcValue === "-0") {
    calcValue = `-${value}`;
  } else {
    calcValue += value;
  }

  updateCalc();
}

function addDecimalPoint() {
  const lastChar = calcValue.at(-1);
  const lastNumber = getLastNumberPart();

  if (lastNumber.includes(".")) {
    return;
  }

  if (operators.includes(lastChar)) {
    calcValue += "0.";
  } else {
    calcValue += ".";
  }

  updateCalc();
}

function addOperator(value) {
  const lastChar = calcValue.at(-1);

  if (calcValue === "0" && value === "-") {
    calcValue = "-";
    updateCalc();
    return;
  }

  if (calcValue === "-") {
    return;
  }

  if (operators.includes(lastChar)) {
    const canAddNegativeNumber = value === "-" && lastChar !== "-";

    if (canAddNegativeNumber) {
      calcValue += value;
    } else {
      calcValue = calcValue.slice(0, -1) + value;
    }
  } else {
    calcValue += value;
  }

  updateCalc();
}

function getLastNumberPart() {
  const parts = calcValue.split(/[+\-*/%]/);

  return parts.at(-1) || "";
}

function calculateResult() {
  try {
    const tokens = tokenizeExpression(calcValue);
    const result = evaluateTokens(tokens);

    calcValue = Number.isFinite(result) ? formatNumber(result) : "Ошибка";
  } catch {
    calcValue = "Ошибка";
  }

  updateCalc();
}

function tokenizeExpression(expression) {
  const tokens = [];
  let number = "";

  for (const char of expression) {
    if (isDigit(char) || char === ".") {
      number += char;
      continue;
    }

    if (!operators.includes(char)) {
      throw new Error("Invalid character");
    }

    const isUnaryMinus = char === "-" && number === "" && isPreviousTokenOperator(tokens);

    if (isUnaryMinus) {
      number = "-";
      continue;
    }

    pushNumberToken(tokens, number);
    tokens.push(char);
    number = "";
  }

  pushNumberToken(tokens, number);

  return tokens;
}

function isDigit(value) {
  return value >= "0" && value <= "9";
}

function isPreviousTokenOperator(tokens) {
  return tokens.length === 0 || operators.includes(tokens.at(-1));
}

function pushNumberToken(tokens, number) {
  if (number === "" || number === "-") {
    throw new Error("Invalid number");
  }

  const parsedNumber = Number(number);

  if (!Number.isFinite(parsedNumber)) {
    throw new Error("Invalid number");
  }

  tokens.push(parsedNumber);
}

function evaluateTokens(tokens) {
  if (!tokens.length) {
    throw new Error("Empty expression");
  }

  const firstPass = [tokens[0]];

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const nextNumber = tokens[i + 1];

    if (nextNumber === undefined) {
      throw new Error("Invalid expression");
    }

    if (operator === "*" || operator === "/" || operator === "%") {
      const previousNumber = firstPass.pop();
      const result = applyOperator(previousNumber, nextNumber, operator);

      firstPass.push(result);
    } else {
      firstPass.push(operator, nextNumber);
    }
  }

  let result = firstPass[0];

  for (let i = 1; i < firstPass.length; i += 2) {
    const operator = firstPass[i];
    const nextNumber = firstPass[i + 1];

    result = applyOperator(result, nextNumber, operator);
  }

  return result;
}

function applyOperator(left, right, operator) {
  if (operator === "+") {
    return left + right;
  }

  if (operator === "-") {
    return left - right;
  }

  if (operator === "*") {
    return left * right;
  }

  if (operator === "/") {
    return left / right;
  }

  if (operator === "%") {
    return left % right;
  }

  throw new Error("Unknown operator");
}

function formatNumber(value) {
  const rounded = Number(value.toFixed(10));

  return String(rounded);
}

function updateCalc() {
  if (calcDisplay) {
    calcDisplay.value = calcValue;
  }
}

document.querySelectorAll(".window").forEach((appWindow) => {
  makeDraggable(appWindow);
});

function makeDraggable(appWindow) {
  const header = appWindow.querySelector(".window-header");

  if (!header) {
    return;
  }

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  appWindow.addEventListener("pointerdown", () => {
    appWindow.style.zIndex = String(++zIndex);
  });

  header.addEventListener("pointerdown", (event) => {
  const isActionClick = event.target.closest(".window-actions");

  	if (isActionClick) {
   	 return;
 	 }

  	if (appWindow.classList.contains("maximized")) {
   	 return;
 	 }

    isDragging = true;
    offsetX = event.clientX - appWindow.offsetLeft;
    offsetY = event.clientY - appWindow.offsetTop;
    appWindow.style.zIndex = String(++zIndex);

    if (header.setPointerCapture) {
      header.setPointerCapture(event.pointerId);
    }
  });

  header.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    const maxX = Math.max(0, window.innerWidth - appWindow.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - appWindow.offsetHeight - 90);

    const nextX = Math.min(Math.max(0, event.clientX - offsetX), maxX);
    const nextY = Math.min(Math.max(0, event.clientY - offsetY), maxY);

    appWindow.style.left = `${nextX}px`;
    appWindow.style.top = `${nextY}px`;
  });

  header.addEventListener("pointerup", (event) => {
    isDragging = false;

    const hasCapture = header.hasPointerCapture
      && header.hasPointerCapture(event.pointerId);

    if (hasCapture) {
      header.releasePointerCapture(event.pointerId);
    }
  });

  header.addEventListener("pointercancel", () => {
    isDragging = false;
  });

	header.addEventListener("dblclick", (event) => {
  const isActionClick = event.target.closest(".window-actions");

  if (isActionClick) {
    return;
  }

  toggleMaximizeWindow(appWindow.id);
  });
}

if (garageCarImage && cssCar) {
  garageCarImage.addEventListener("error", () => {
    garageCarImage.style.display = "none";
    cssCar.style.display = "block";
  });

  garageCarImage.addEventListener("load", () => {
    garageCarImage.style.display = "block";
    cssCar.style.display = "none";
  });
}

if (carUpload && garageCarImage && garageStatus) {
  carUpload.addEventListener("change", () => {
    const file = carUpload.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      garageStatus.textContent = "Выберите файл изображения.";
      carUpload.value = "";
      return;
    }

    if (carObjectUrl) {
      URL.revokeObjectURL(carObjectUrl);
    }

    carObjectUrl = URL.createObjectURL(file);

    garageCarImage.src = carObjectUrl;
    garageCarImage.style.display = "block";

    if (cssCar) {
      cssCar.style.display = "none";
    }

    garageStatus.textContent = "Картинка машины загружена.";
    carUpload.value = "";
  });
}

if (startEngineBtn && garageScene && garageStatus) {
  startEngineBtn.addEventListener("click", () => {
    engineStarted = !engineStarted;

    garageScene.classList.toggle("engine-on", engineStarted);
    startEngineBtn.textContent = engineStarted ? "Заглушить двигатель" : "Завести двигатель";
    garageStatus.textContent = engineStarted ? "Двигатель запущен." : "Машина заглушена.";
  });
}

const wallpaperButtons = document.querySelectorAll("[data-wallpaper], [data-wallpaper-image]");

const wallpaperClasses = [
  "wallpaper-1",
  "wallpaper-2",
  "wallpaper-3",
  "wallpaper-4",
  "wallpaper-5"
];

const savedWallpaper = localStorage.getItem("desktopWallpaper") || "wallpaper-1";
const savedWallpaperImage = localStorage.getItem("desktopWallpaperImage");

if (savedWallpaperImage) {
  setImageWallpaper(savedWallpaperImage, savedWallpaper);
} else {
  setWallpaper(savedWallpaper);
}

wallpaperButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const imagePath = button.dataset.wallpaperImage;
    const wallpaperName = button.dataset.wallpaperName;

    if (imagePath) {
      setImageWallpaper(imagePath, wallpaperName);
      return;
    }

    setWallpaper(button.dataset.wallpaper);
  });
});

function setWallpaper(wallpaperName) {
  document.body.classList.remove(...wallpaperClasses);
  document.body.classList.add(wallpaperName);
  document.body.style.background = "";

  localStorage.setItem("desktopWallpaper", wallpaperName);
  localStorage.removeItem("desktopWallpaperImage");

  updateWallpaperButtons(wallpaperName, null);
}

function setImageWallpaper(imagePath, wallpaperName) {
  const overlay = "linear-gradient(rgba(8, 12, 22, 0.2), rgba(8, 12, 22, 0.34))";

  document.body.classList.remove(...wallpaperClasses);
  document.body.style.background = `${overlay}, url("${imagePath}") center / cover no-repeat`;

  localStorage.setItem("desktopWallpaper", wallpaperName);
  localStorage.setItem("desktopWallpaperImage", imagePath);

  updateWallpaperButtons(wallpaperName, imagePath);
}

function updateWallpaperButtons(wallpaperName, imagePath) {
  wallpaperButtons.forEach((button) => {
    const isDefaultWallpaper = button.dataset.wallpaper === wallpaperName;
    const isImageWallpaper = button.dataset.wallpaperImage === imagePath;

    button.classList.toggle("active", isDefaultWallpaper || isImageWallpaper);
  });
}

const audioPlayer = document.querySelector("#audioPlayer");
const trackTitle = document.querySelector("#trackTitle");
const trackArtist = document.querySelector("#trackArtist");
const musicCover = document.querySelector("#musicCover");
const playTrackBtn = document.querySelector("#playTrackBtn");
const prevTrackBtn = document.querySelector("#prevTrackBtn");
const nextTrackBtn = document.querySelector("#nextTrackBtn");
const shuffleTrackBtn = document.querySelector("#shuffleTrackBtn");
const repeatTrackBtn = document.querySelector("#repeatTrackBtn");
const muteTrackBtn = document.querySelector("#muteTrackBtn");
const musicProgress = document.querySelector("#musicProgress");
const currentTimeBox = document.querySelector("#currentTime");
const durationTimeBox = document.querySelector("#durationTime");
const volumeSlider = document.querySelector("#volumeSlider");
const playlistItems = document.querySelectorAll(".playlist-item");

const tracks = [
  {
    title: "KUPER",
    artist: "Трек 1",
    src: "music/KUPER.mp3",
    cover: "linear-gradient(135deg, #7e57ff, #1f3b58)"
  },
  {
    title: "TOKYO",
    artist: "SQWOZ BAB",
    src: "music/TOKYO - SQWOZ BAB.mp3",
    cover: "linear-gradient(135deg, #ff9966, #ff5e62)"
  },
  {
    title: "Отпускай",
    artist: "Три дня дождя",
    src: "music/Отпускай - Три дня дождя.mp3",
    cover: "linear-gradient(135deg, #56ab2f, #a8e063)"
  },
  {
    title: "Прощание",
    artist: "Три Дня Дождя",
    src: "music/Прощание - Три Дня Дождя.mp3",
    cover: "linear-gradient(135deg, #614385, #516395)"
  },
  {
    title: "Я и одиночество",
    artist: "Три дня дождя",
    src: "music/Я и одиночество - Три дня дождя.mp3",
    cover: "linear-gradient(135deg, #1d976c, #93f9b9)"
  }
];

let currentTrackIndex = 0;
let isMusicPlaying = false;
let isShuffleEnabled = false;
let isRepeatEnabled = false;
let previousVolume = 0.8;

if (audioPlayer) {
  audioPlayer.volume = previousVolume;
  loadTrack(currentTrackIndex, false);
}

if (playTrackBtn) {
  playTrackBtn.addEventListener("click", () => {
    if (isMusicPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  });
}

if (prevTrackBtn) {
  prevTrackBtn.addEventListener("click", () => {
    playPreviousTrack();
  });
}

if (nextTrackBtn) {
  nextTrackBtn.addEventListener("click", () => {
    playNextTrack();
  });
}

if (shuffleTrackBtn) {
  shuffleTrackBtn.addEventListener("click", () => {
    isShuffleEnabled = !isShuffleEnabled;
    shuffleTrackBtn.classList.toggle("active", isShuffleEnabled);
  });
}

if (repeatTrackBtn) {
  repeatTrackBtn.addEventListener("click", () => {
    isRepeatEnabled = !isRepeatEnabled;
    repeatTrackBtn.classList.toggle("active", isRepeatEnabled);
  });
}

if (muteTrackBtn && audioPlayer) {
  muteTrackBtn.addEventListener("click", () => {
    audioPlayer.muted = !audioPlayer.muted;
    updateMuteButton();
  });
}

if (volumeSlider && audioPlayer) {
  volumeSlider.addEventListener("input", () => {
    const volume = Number(volumeSlider.value);

    audioPlayer.volume = volume;
    previousVolume = volume;

    if (volume > 0) {
      audioPlayer.muted = false;
    }

    updateMuteButton();
  });
}

if (musicProgress && audioPlayer) {
  musicProgress.addEventListener("input", () => {
    if (!Number.isFinite(audioPlayer.duration)) {
      return;
    }

    const nextTime = audioPlayer.duration * (Number(musicProgress.value) / 100);

    audioPlayer.currentTime = nextTime;
  });
}

playlistItems.forEach((item) => {
  item.addEventListener("click", () => {
    const trackIndex = Number(item.dataset.track);

    loadTrack(trackIndex, true);
  });
});

if (audioPlayer) {
  audioPlayer.addEventListener("loadedmetadata", () => {
    updateDuration();
    updateProgress();
  });

  audioPlayer.addEventListener("timeupdate", () => {
    updateProgress();
  });

  audioPlayer.addEventListener("ended", () => {
    if (isRepeatEnabled) {
      audioPlayer.currentTime = 0;
      playTrack();
      return;
    }

    playNextTrack();
  });

  audioPlayer.addEventListener("error", () => {
    isMusicPlaying = false;
    updatePlayButton();

    if (trackArtist) {
      trackArtist.textContent = "Не удалось загрузить файл";
    }
  });
}

function loadTrack(index, shouldPlay) {
  if (!audioPlayer || !tracks[index]) {
    return;
  }

  currentTrackIndex = index;

  const track = tracks[currentTrackIndex];

  audioPlayer.src = track.src;
  audioPlayer.load();

  if (trackTitle) {
    trackTitle.textContent = track.title;
  }

  if (trackArtist) {
    trackArtist.textContent = track.artist;
  }

  if (musicCover) {
    musicCover.style.background = track.cover;
    musicCover.textContent = "🎵";
  }

  playlistItems.forEach((item) => {
    const isActive = Number(item.dataset.track) === currentTrackIndex;

    item.classList.toggle("active", isActive);
  });

  resetProgress();

  if (shouldPlay) {
    playTrack();
  } else {
    isMusicPlaying = false;
    updatePlayButton();
  }
}

function playTrack() {
  if (!audioPlayer) {
    return;
  }

  audioPlayer.play()
    .then(() => {
      isMusicPlaying = true;
      updatePlayButton();
    })
    .catch(() => {
      isMusicPlaying = false;
      updatePlayButton();

      if (trackArtist) {
        trackArtist.textContent = "Не удалось запустить файл";
      }
    });
}

function pauseTrack() {
  if (!audioPlayer) {
    return;
  }

  audioPlayer.pause();
  isMusicPlaying = false;
  updatePlayButton();
}

function playPreviousTrack() {
  const previousIndex = currentTrackIndex === 0
    ? tracks.length - 1
    : currentTrackIndex - 1;

  loadTrack(previousIndex, true);
}

function playNextTrack() {
  if (isShuffleEnabled) {
    loadTrack(getRandomTrackIndex(), true);
    return;
  }

  const nextIndex = currentTrackIndex === tracks.length - 1
    ? 0
    : currentTrackIndex + 1;

  loadTrack(nextIndex, true);
}

function getRandomTrackIndex() {
  if (tracks.length <= 1) {
    return currentTrackIndex;
  }

  let randomIndex = currentTrackIndex;

  while (randomIndex === currentTrackIndex) {
    randomIndex = Math.floor(Math.random() * tracks.length);
  }

  return randomIndex;
}

function updatePlayButton() {
  if (!playTrackBtn) {
    return;
  }

  playTrackBtn.textContent = isMusicPlaying ? "⏸" : "▶";
  playTrackBtn.title = isMusicPlaying ? "Пауза" : "Играть";
}

function updateMuteButton() {
  if (!muteTrackBtn || !audioPlayer) {
    return;
  }

  const isMuted = audioPlayer.muted || audioPlayer.volume === 0;

  muteTrackBtn.textContent = isMuted ? "🔇" : "🔊";
  muteTrackBtn.classList.toggle("active", isMuted);
}

function updateProgress() {
  if (!audioPlayer || !musicProgress || !currentTimeBox) {
    return;
  }

  const current = audioPlayer.currentTime;
  const duration = audioPlayer.duration;

  currentTimeBox.textContent = formatMusicTime(current);

  if (Number.isFinite(duration) && duration > 0) {
    musicProgress.value = String((current / duration) * 100);
  } else {
    musicProgress.value = "0";
  }
}

function updateDuration() {
  if (!audioPlayer || !durationTimeBox) {
    return;
  }

  durationTimeBox.textContent = formatMusicTime(audioPlayer.duration);
}

function resetProgress() {
  if (musicProgress) {
    musicProgress.value = "0";
  }

  if (currentTimeBox) {
    currentTimeBox.textContent = "0:00";
  }

  if (durationTimeBox) {
    durationTimeBox.textContent = "0:00";
  }
}

function formatMusicTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}

const desktop = document.querySelector("#desktop");
const desktopIcons = document.querySelector(".desktop-icons");
const desktopContextMenu = document.querySelector("#desktopContextMenu");

const contextWallpaperBtn = document.querySelector("#contextWallpaperBtn");
const contextCalculatorBtn = document.querySelector("#contextCalculatorBtn");
const contextMusicBtn = document.querySelector("#contextMusicBtn");
const contextRefreshBtn = document.querySelector("#contextRefreshBtn");
const contextToggleIconsBtn = document.querySelector("#contextToggleIconsBtn");

const savedIconsHidden = localStorage.getItem("desktopIconsHidden") === "true";

if (desktopIcons) {
  desktopIcons.classList.toggle("hidden", savedIconsHidden);
  updateToggleIconsButton(savedIconsHidden);
}

document.addEventListener("contextmenu", (event) => {
  if (!desktopContextMenu || !desktop) {
    return;
  }

  const shouldIgnore = event.target.closest(
    ".window, .dock, .start-menu, .desktop-context-menu, button, input, label"
  );

  if (shouldIgnore) {
    return;
  }

  event.preventDefault();
  showDesktopContextMenu(event.clientX, event.clientY);
});

document.addEventListener("click", () => {
  hideDesktopContextMenu();
});

window.addEventListener("resize", () => {
  hideDesktopContextMenu();
});

if (desktopContextMenu) {
  desktopContextMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (contextWallpaperBtn) {
  contextWallpaperBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    hideDesktopContextMenu();

    if (startMenu) {
      startMenu.classList.add("active");
    }
  });
}

if (contextCalculatorBtn) {
  contextCalculatorBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    hideDesktopContextMenu();
    openWindow("calculator");
  });
}

if (contextMusicBtn) {
  contextMusicBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    hideDesktopContextMenu();
    openWindow("music");
  });
}

if (contextRefreshBtn) {
  contextRefreshBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    hideDesktopContextMenu();
    refreshDesktop();
  });
}

if (contextToggleIconsBtn) {
  contextToggleIconsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    hideDesktopContextMenu();
    toggleDesktopIcons();
  });
}

function showDesktopContextMenu(x, y) {
  if (!desktopContextMenu) {
    return;
  }

  desktopContextMenu.classList.add("active");

  const menuWidth = desktopContextMenu.offsetWidth;
  const menuHeight = desktopContextMenu.offsetHeight;

  const safeX = Math.min(x, window.innerWidth - menuWidth - 8);
  const safeY = Math.min(y, window.innerHeight - menuHeight - 8);

  desktopContextMenu.style.left = `${Math.max(8, safeX)}px`;
  desktopContextMenu.style.top = `${Math.max(8, safeY)}px`;
}

function hideDesktopContextMenu() {
  if (!desktopContextMenu) {
    return;
  }

  desktopContextMenu.classList.remove("active");
}

function refreshDesktop() {
  if (!desktop) {
    return;
  }

  desktop.classList.remove("refreshing");

  void desktop.offsetWidth;

  desktop.classList.add("refreshing");

  setTimeout(() => {
    desktop.classList.remove("refreshing");
  }, 350);
}

function toggleDesktopIcons() {
  if (!desktopIcons) {
    return;
  }

  const isHidden = desktopIcons.classList.toggle("hidden");

  localStorage.setItem("desktopIconsHidden", String(isHidden));
  updateToggleIconsButton(isHidden);
}

function updateToggleIconsButton(isHidden) {
  if (!contextToggleIconsBtn) {
    return;
  }

  contextToggleIconsBtn.innerHTML = isHidden
    ? "<span>👁️</span>Показать иконки"
    : "<span>👁️</span>Скрыть иконки";
}

const selectionDesktop = document.querySelector("#desktop");
const selectionBox = document.querySelector("#selectionBox");

let isDesktopSelecting = false;
let selectionStartX = 0;
let selectionStartY = 0;
let selectionMoved = false;

if (selectionDesktop && selectionBox) {
  selectionDesktop.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    const shouldIgnoreSelection = event.target.closest(
      ".window, .dock, .start-menu, .desktop-context-menu, button, input, label"
    );

    if (shouldIgnoreSelection) {
      return;
    }

    if (event.target.closest(".desktop-icon")) {
      return;
    }

    const desktopRect = selectionDesktop.getBoundingClientRect();

    isDesktopSelecting = true;
    selectionMoved = false;
    selectionStartX = event.clientX - desktopRect.left;
    selectionStartY = event.clientY - desktopRect.top;

    clearDesktopIconSelection();

    selectionBox.style.left = `${selectionStartX}px`;
    selectionBox.style.top = `${selectionStartY}px`;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";

    selectionDesktop.setPointerCapture(event.pointerId);
  });

  selectionDesktop.addEventListener("pointermove", (event) => {
    if (!isDesktopSelecting) {
      return;
    }

    const desktopRect = selectionDesktop.getBoundingClientRect();

    const currentX = event.clientX - desktopRect.left;
    const currentY = event.clientY - desktopRect.top;

    const left = Math.min(selectionStartX, currentX);
    const top = Math.min(selectionStartY, currentY);
    const width = Math.abs(currentX - selectionStartX);
    const height = Math.abs(currentY - selectionStartY);

    if (width > 4 || height > 4) {
      selectionMoved = true;
      selectionBox.classList.add("active");
    }

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    updateDesktopIconSelection();
  });

  selectionDesktop.addEventListener("pointerup", (event) => {
    if (!isDesktopSelecting) {
      return;
    }

    isDesktopSelecting = false;
    selectionBox.classList.remove("active");

    if (!selectionMoved) {
      clearDesktopIconSelection();
    }

    const hasCapture = selectionDesktop.hasPointerCapture
      && selectionDesktop.hasPointerCapture(event.pointerId);

    if (hasCapture) {
      selectionDesktop.releasePointerCapture(event.pointerId);
    }
  });

  selectionDesktop.addEventListener("pointercancel", () => {
    isDesktopSelecting = false;
    selectionBox.classList.remove("active");
  });
}

function updateDesktopIconSelection() {
  if (!selectionBox) {
    return;
  }

  const selectedRect = selectionBox.getBoundingClientRect();
  const desktopIconsWrapper = document.querySelector(".desktop-icons");

  if (desktopIconsWrapper && desktopIconsWrapper.classList.contains("hidden")) {
    return;
  }

  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    const iconRect = icon.getBoundingClientRect();
    const isSelected = areRectsIntersecting(selectedRect, iconRect);

    icon.classList.toggle("selected", isSelected);
  });
}

function areRectsIntersecting(firstRect, secondRect) {
  return !(
    firstRect.right < secondRect.left
    || firstRect.left > secondRect.right
    || firstRect.bottom < secondRect.top
    || firstRect.top > secondRect.bottom
  );
}

function clearDesktopIconSelection() {
  document.querySelectorAll(".desktop-icon.selected").forEach((icon) => {
    icon.classList.remove("selected");
  });
}

const bootScreen = document.querySelector("#bootScreen");
const bootStatus = document.querySelector("#bootStatus");

const bootMessages = [
  "Запуск системы...",
  "Загрузка рабочего стола...",
  "Подключение приложений...",
  "Настройка интерфейса...",
  "MerphyOS готова."
];

if (bootScreen) {
  let bootMessageIndex = 0;

  const bootMessageTimer = setInterval(() => {
    bootMessageIndex += 1;

    if (bootStatus && bootMessages[bootMessageIndex]) {
      bootStatus.textContent = bootMessages[bootMessageIndex];
    }

    if (bootMessageIndex >= bootMessages.length - 1) {
      clearInterval(bootMessageTimer);
    }
  }, 1000);

  setTimeout(() => {
    bootScreen.classList.add("hidden");
    document.body.classList.remove("booting");

    setTimeout(() => {
      bootScreen.remove();
    }, 800);
  }, 5000);
}

const shutdownBtn = document.querySelector("#shutdownBtn");
const shutdownScreen = document.querySelector("#shutdownScreen");
const shutdownTitle = document.querySelector("#shutdownTitle");
const shutdownText = document.querySelector("#shutdownText");
const restartBtn = document.querySelector("#restartBtn");

if (shutdownBtn) {
  shutdownBtn.addEventListener("click", () => {
    startShutdown();
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    window.location.reload();
  });
}

function startShutdown() {
  if (!shutdownScreen) {
    return;
  }

  if (startMenu) {
    startMenu.classList.remove("active");
  }

  stopSystemAudio();
  closeAllSystemWindows();

  shutdownScreen.classList.add("active");

  if (shutdownTitle) {
    shutdownTitle.textContent = "Завершение работы";
  }

  if (shutdownText) {
    shutdownText.textContent = "MerphyOS завершает процессы...";
  }

  setTimeout(() => {
    if (shutdownText) {
      shutdownText.textContent = "Остановка приложений...";
    }
  }, 900);

  setTimeout(() => {
    if (shutdownText) {
      shutdownText.textContent = "Сохранение состояния системы...";
    }
  }, 1800);

  setTimeout(() => {
    if (shutdownTitle) {
      shutdownTitle.textContent = "MerphyOS выключена";
    }

    if (shutdownText) {
      shutdownText.textContent = "Теперь можно закрыть вкладку.";
    }

    shutdownScreen.classList.add("finished");

    tryCloseBrowserTab();
  }, 3000);
}

function stopSystemAudio() {
  if (!audioPlayer) {
    return;
  }

  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  isMusicPlaying = false;

  if (typeof updatePlayButton === "function") {
    updatePlayButton();
  }
}

function closeAllSystemWindows() {
  document.querySelectorAll(".window").forEach((appWindow) => {
    appWindow.classList.remove(
      "active",
      "minimized",
      "minimizing",
      "restoring",
      "maximized",
      "maximize-animating"
    );
  });

  document.querySelectorAll(".dock-btn").forEach((button) => {
    button.classList.remove("window-open", "window-minimized");
  });
}

function tryCloseBrowserTab() {
  window.close();
}

const snakeCanvas = document.querySelector("#snakeCanvas");
const snakeScoreBox = document.querySelector("#snakeScore");
const snakeBestBox = document.querySelector("#snakeBest");
const snakeStatusBox = document.querySelector("#snakeStatus");
const snakeStartBtn = document.querySelector("#snakeStartBtn");
const snakePauseBtn = document.querySelector("#snakePauseBtn");
const snakeResetBtn = document.querySelector("#snakeResetBtn");
const snakeOverlay = document.querySelector("#snakeOverlay");

const snakeSettings = {
  cells: 20,
  size: 360,
  speed: 115
};

let snakeContext = null;
let snake = [];
let snakeFood = null;
let snakeDirection = { x: 1, y: 0 };
let snakeNextDirection = { x: 1, y: 0 };
let snakeScore = 0;
let snakeBest = Number(localStorage.getItem("snakeBestScore")) || 0;
let snakeTimer = null;
let snakeRunning = false;
let snakePaused = false;

if (snakeCanvas) {
  snakeContext = snakeCanvas.getContext("2d");
  initSnakeGame();
}

if (snakeStartBtn) {
  snakeStartBtn.addEventListener("click", () => {
    startSnakeGame();
  });
}

if (snakePauseBtn) {
  snakePauseBtn.addEventListener("click", () => {
    toggleSnakePause();
  });
}

if (snakeResetBtn) {
  snakeResetBtn.addEventListener("click", () => {
    resetSnakeGame();
  });
}

document.querySelectorAll("[data-snake-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    setSnakeDirection(button.dataset.snakeDir);
  });
});

document.addEventListener("keydown", (event) => {
  const gamesWindow = document.querySelector("#games");

  if (!gamesWindow || !gamesWindow.classList.contains("active")) {
    return;
  }

  const keyMap = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right"
  };

  const direction = keyMap[event.code];

  if (!direction) {
    return;
  }

  event.preventDefault();
  setSnakeDirection(direction);
});

function initSnakeGame() {
  snakeBest = Number(localStorage.getItem("snakeBestScore")) || 0;

  resetSnakeState();
  updateSnakeInfo();
  drawSnakeGame();
}

function startSnakeGame() {
  if (!snakeCanvas) {
    return;
  }

  if (snakeRunning && snakePaused) {
    snakePaused = false;
    updateSnakeStatus("Игра");
    hideSnakeOverlay();
    return;
  }

  if (snakeRunning) {
    return;
  }

  resetSnakeState();

  snakeRunning = true;
  snakePaused = false;

  updateSnakeStatus("Игра");
  hideSnakeOverlay();

  clearInterval(snakeTimer);
  snakeTimer = setInterval(runSnakeTick, snakeSettings.speed);
}

function toggleSnakePause() {
  if (!snakeRunning) {
    return;
  }

  snakePaused = !snakePaused;

  updateSnakeStatus(snakePaused ? "Пауза" : "Игра");

  if (snakePaused) {
    showSnakeOverlay("Пауза", "Нажми «Пауза» ещё раз или «Старт», чтобы продолжить.");
  } else {
    hideSnakeOverlay();
  }
}

function resetSnakeGame() {
  clearInterval(snakeTimer);

  snakeRunning = false;
  snakePaused = false;

  resetSnakeState();
  updateSnakeStatus("Готова");
  updateSnakeInfo();
  drawSnakeGame();

  showSnakeOverlay("Змейка", "Нажми «Старт» и управляй стрелками или WASD.");
}

function resetSnakeState() {
  snakeScore = 0;

  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];

  snakeDirection = { x: 1, y: 0 };
  snakeNextDirection = { x: 1, y: 0 };
  snakeFood = createSnakeFood();
}

function runSnakeTick() {
  const gamesWindow = document.querySelector("#games");

  if (!gamesWindow || !gamesWindow.classList.contains("active")) {
    return;
  }

  if (!snakeRunning || snakePaused) {
    return;
  }

  snakeDirection = snakeNextDirection;

  const head = snake[0];

  const nextHead = {
    x: head.x + snakeDirection.x,
    y: head.y + snakeDirection.y
  };

  if (isSnakeCollision(nextHead)) {
    finishSnakeGame();
    return;
  }

  snake.unshift(nextHead);

  const hasEatenFood = nextHead.x === snakeFood.x && nextHead.y === snakeFood.y;

  if (hasEatenFood) {
    snakeScore += 1;
    snakeFood = createSnakeFood();
    updateSnakeInfo();
  } else {
    snake.pop();
  }

  drawSnakeGame();
}

function finishSnakeGame() {
  clearInterval(snakeTimer);

  snakeRunning = false;
  snakePaused = false;

  if (snakeScore > snakeBest) {
    snakeBest = snakeScore;
    localStorage.setItem("snakeBestScore", String(snakeBest));
  }

  updateSnakeInfo();
  updateSnakeStatus("Конец");

  showSnakeOverlay("Игра окончена", `Твой счёт: ${snakeScore}. Нажми «Старт», чтобы сыграть ещё.`);
}

function setSnakeDirection(direction) {
  const directionMap = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const nextDirection = directionMap[direction];

  if (!nextDirection) {
    return;
  }

  const isOppositeDirection = snakeDirection.x + nextDirection.x === 0
    && snakeDirection.y + nextDirection.y === 0;

  if (isOppositeDirection) {
    return;
  }

  snakeNextDirection = nextDirection;
}

function createSnakeFood() {
  let food = null;
  let isOnSnake = true;

  while (isOnSnake) {
    food = {
      x: Math.floor(Math.random() * snakeSettings.cells),
      y: Math.floor(Math.random() * snakeSettings.cells)
    };

    isOnSnake = snake.some((part) => {
      return part.x === food.x && part.y === food.y;
    });
  }

  return food;
}

function isSnakeCollision(position) {
  const isWallCollision = position.x < 0
    || position.y < 0
    || position.x >= snakeSettings.cells
    || position.y >= snakeSettings.cells;

  if (isWallCollision) {
    return true;
  }

  return snake.some((part) => {
    return part.x === position.x && part.y === position.y;
  });
}

function drawSnakeGame() {
  if (!snakeContext) {
    return;
  }

  const cellSize = snakeSettings.size / snakeSettings.cells;

  snakeContext.clearRect(0, 0, snakeSettings.size, snakeSettings.size);

  drawSnakeBackground(cellSize);
  drawSnakeFood(cellSize);
  drawSnakeBody(cellSize);
}

function drawSnakeBackground(cellSize) {
  snakeContext.fillStyle = "#07101f";
  snakeContext.fillRect(0, 0, snakeSettings.size, snakeSettings.size);

  snakeContext.strokeStyle = "rgba(255, 255, 255, 0.045)";
  snakeContext.lineWidth = 1;

  for (let i = 0; i <= snakeSettings.cells; i += 1) {
    const position = i * cellSize;

    snakeContext.beginPath();
    snakeContext.moveTo(position, 0);
    snakeContext.lineTo(position, snakeSettings.size);
    snakeContext.stroke();

    snakeContext.beginPath();
    snakeContext.moveTo(0, position);
    snakeContext.lineTo(snakeSettings.size, position);
    snakeContext.stroke();
  }
}

function drawSnakeFood(cellSize) {
  if (!snakeFood) {
    return;
  }

  const padding = 4;
  const x = snakeFood.x * cellSize + padding;
  const y = snakeFood.y * cellSize + padding;
  const size = cellSize - padding * 2;

  snakeContext.fillStyle = "#ff5f57";
  snakeContext.shadowColor = "rgba(255, 95, 87, 0.65)";
  snakeContext.shadowBlur = 16;

  roundRect(snakeContext, x, y, size, size, 6);
  snakeContext.fill();

  snakeContext.shadowBlur = 0;
}

function drawSnakeBody(cellSize) {
  snake.forEach((part, index) => {
    const padding = index === 0 ? 3 : 4;
    const x = part.x * cellSize + padding;
    const y = part.y * cellSize + padding;
    const size = cellSize - padding * 2;

    snakeContext.fillStyle = index === 0 ? "#68d8ff" : "#2fd389";
    snakeContext.shadowColor = index === 0
      ? "rgba(104, 216, 255, 0.55)"
      : "rgba(47, 211, 137, 0.45)";
    snakeContext.shadowBlur = index === 0 ? 14 : 10;

    roundRect(snakeContext, x, y, size, size, 6);
    snakeContext.fill();

    snakeContext.shadowBlur = 0;
  });
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function updateSnakeInfo() {
  if (snakeScoreBox) {
    snakeScoreBox.textContent = String(snakeScore);
  }

  if (snakeBestBox) {
    snakeBestBox.textContent = String(snakeBest);
  }
}

function updateSnakeStatus(status) {
  if (snakeStatusBox) {
    snakeStatusBox.textContent = status;
  }
}

function showSnakeOverlay(title, text) {
  if (!snakeOverlay) {
    return;
  }

  snakeOverlay.innerHTML = `
    <h3>${title}</h3>
    <p>${text}</p>
  `;

  snakeOverlay.classList.remove("hidden");
}

function hideSnakeOverlay() {
  if (snakeOverlay) {
    snakeOverlay.classList.add("hidden");
  }
}

const gameTabButtons = document.querySelectorAll("[data-game-tab]");
const gamePanels = document.querySelectorAll("[data-game-panel]");

gameTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateGameTab(button.dataset.gameTab);
  });
});

function activateGameTab(tabName) {
  gameTabButtons.forEach((button) => {
    const isActive = button.dataset.gameTab === tabName;

    button.classList.toggle("active", isActive);
  });

  gamePanels.forEach((panel) => {
    const isActive = panel.dataset.gamePanel === tabName;

    panel.classList.toggle("active", isActive);
  });

  if (tabName !== "racing" && raceRunning && !racePaused) {
    pauseRaceGame();
  }

  if (tabName !== "snake" && snakeRunning && !snakePaused) {
    toggleSnakePause();
  }
}

const raceCanvas = document.querySelector("#raceCanvas");
const raceScoreBox = document.querySelector("#raceScore");
const raceBestBox = document.querySelector("#raceBest");
const raceSpeedBox = document.querySelector("#raceSpeed");
const raceStartBtn = document.querySelector("#raceStartBtn");
const racePauseBtn = document.querySelector("#racePauseBtn");
const raceResetBtn = document.querySelector("#raceResetBtn");
const raceOverlay = document.querySelector("#raceOverlay");

const raceSettings = {
  width: 360,
  height: 520,
  lanes: 3,
  playerWidth: 48,
  playerHeight: 76,
  obstacleWidth: 50,
  obstacleHeight: 70
};

let raceContext = null;
let raceAnimationId = null;
let raceLastTime = 0;
let raceRunning = false;
let racePaused = false;
let racePlayerLane = 1;
let raceObstacles = [];
let raceScore = 0;
let raceBest = Number(localStorage.getItem("raceBestScore")) || 0;
let raceSpeed = 220;
let raceSpawnTimer = 0;
let raceSpawnDelay = 850;

if (raceCanvas) {
  raceContext = raceCanvas.getContext("2d");
  initRaceGame();
}

if (raceStartBtn) {
  raceStartBtn.addEventListener("click", () => {
    startRaceGame();
  });
}

if (racePauseBtn) {
  racePauseBtn.addEventListener("click", () => {
    toggleRacePause();
  });
}

if (raceResetBtn) {
  raceResetBtn.addEventListener("click", () => {
    resetRaceGame();
  });
}

document.querySelectorAll("[data-race-move]").forEach((button) => {
  button.addEventListener("click", () => {
    moveRacePlayer(button.dataset.raceMove);
  });
});

document.addEventListener("keydown", (event) => {
  const gamesWindow = document.querySelector("#games");
  const racingPanel = document.querySelector('[data-game-panel="racing"]');

  if (!gamesWindow || !gamesWindow.classList.contains("active")) {
    return;
  }

  if (!racingPanel || !racingPanel.classList.contains("active")) {
    return;
  }

  const keyMap = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right"
  };

  const direction = keyMap[event.code];

  if (!direction) {
    return;
  }

  event.preventDefault();
  moveRacePlayer(direction);
});

function initRaceGame() {
  raceBest = Number(localStorage.getItem("raceBestScore")) || 0;

  resetRaceState();
  updateRaceInfo();
  drawRaceGame();
}

function startRaceGame() {
  if (!raceCanvas) {
    return;
  }

  if (raceRunning && racePaused) {
    racePaused = false;
    hideRaceOverlay();
    raceLastTime = performance.now();
    raceAnimationId = requestAnimationFrame(runRaceFrame);
    return;
  }

  if (raceRunning) {
    return;
  }

  resetRaceState();

  raceRunning = true;
  racePaused = false;
  raceLastTime = performance.now();

  hideRaceOverlay();

  cancelAnimationFrame(raceAnimationId);
  raceAnimationId = requestAnimationFrame(runRaceFrame);
}

function toggleRacePause() {
  if (!raceRunning) {
    return;
  }

  if (racePaused) {
    racePaused = false;
    hideRaceOverlay();
    raceLastTime = performance.now();
    raceAnimationId = requestAnimationFrame(runRaceFrame);
    return;
  }

  pauseRaceGame();
}

function pauseRaceGame() {
  racePaused = true;
  cancelAnimationFrame(raceAnimationId);
  showRaceOverlay("Пауза", "Нажми «Пауза» ещё раз или «Старт», чтобы продолжить.");
}

function resetRaceGame() {
  cancelAnimationFrame(raceAnimationId);

  raceRunning = false;
  racePaused = false;

  resetRaceState();
  updateRaceInfo();
  drawRaceGame();

  showRaceOverlay("Merphy Racing", "Нажми «Старт» и уворачивайся от препятствий.");
}

function resetRaceState() {
  racePlayerLane = 1;
  raceObstacles = [];
  raceScore = 0;
  raceSpeed = 220;
  raceSpawnTimer = 0;
  raceSpawnDelay = 850;
}

function runRaceFrame(timestamp) {
  if (!raceRunning || racePaused) {
    return;
  }

  const gamesWindow = document.querySelector("#games");
  const racingPanel = document.querySelector('[data-game-panel="racing"]');

  if (!gamesWindow || !gamesWindow.classList.contains("active")) {
    pauseRaceGame();
    return;
  }

  if (!racingPanel || !racingPanel.classList.contains("active")) {
    pauseRaceGame();
    return;
  }

  const deltaTime = Math.min((timestamp - raceLastTime) / 1000, 0.05);

  raceLastTime = timestamp;

  updateRaceGame(deltaTime);
  drawRaceGame();

  raceAnimationId = requestAnimationFrame(runRaceFrame);
}

function updateRaceGame(deltaTime) {
  raceScore += Math.floor(deltaTime * 45);
  raceSpeed += deltaTime * 8;
  raceSpawnDelay = Math.max(430, 850 - raceScore * 0.7);

  raceSpawnTimer += deltaTime * 1000;

  if (raceSpawnTimer >= raceSpawnDelay) {
    spawnRaceObstacle();
    raceSpawnTimer = 0;
  }

  raceObstacles.forEach((obstacle) => {
    obstacle.y += raceSpeed * deltaTime;
  });

  raceObstacles = raceObstacles.filter((obstacle) => {
    return obstacle.y < raceSettings.height + raceSettings.obstacleHeight;
  });

  if (isRaceCollision()) {
    finishRaceGame();
    return;
  }

  updateRaceInfo();
}

function spawnRaceObstacle() {
  const lane = Math.floor(Math.random() * raceSettings.lanes);
  const lastObstacle = raceObstacles[raceObstacles.length - 1];

  if (lastObstacle && lastObstacle.lane === lane && lastObstacle.y < 110) {
    return;
  }

  raceObstacles.push({
    lane,
    y: -raceSettings.obstacleHeight
  });
}

function moveRacePlayer(direction) {
  if (direction === "left") {
    racePlayerLane = Math.max(0, racePlayerLane - 1);
  }

  if (direction === "right") {
    racePlayerLane = Math.min(raceSettings.lanes - 1, racePlayerLane + 1);
  }

  drawRaceGame();
}

function isRaceCollision() {
  const playerRect = getRacePlayerRect();

  return raceObstacles.some((obstacle) => {
    const obstacleRect = getRaceObstacleRect(obstacle);

    return areRaceRectsIntersecting(playerRect, obstacleRect);
  });
}

function finishRaceGame() {
  cancelAnimationFrame(raceAnimationId);

  raceRunning = false;
  racePaused = false;

  if (raceScore > raceBest) {
    raceBest = raceScore;
    localStorage.setItem("raceBestScore", String(raceBest));
  }

  updateRaceInfo();
  drawRaceGame();

  showRaceOverlay("Авария", `Твой счёт: ${raceScore}. Нажми «Старт», чтобы попробовать ещё.`);
}

function drawRaceGame() {
  if (!raceContext) {
    return;
  }

  drawRaceRoad();
  drawRaceObstacles();
  drawRacePlayer();
}

function drawRaceRoad() {
  const width = raceSettings.width;
  const height = raceSettings.height;
  const laneWidth = width / raceSettings.lanes;

  raceContext.clearRect(0, 0, width, height);

  const roadGradient = raceContext.createLinearGradient(0, 0, 0, height);

  roadGradient.addColorStop(0, "#101827");
  roadGradient.addColorStop(1, "#050812");

  raceContext.fillStyle = roadGradient;
  raceContext.fillRect(0, 0, width, height);

  raceContext.fillStyle = "rgba(255, 255, 255, 0.05)";

  for (let i = 1; i < raceSettings.lanes; i += 1) {
    const x = i * laneWidth;

    drawDashedRaceLine(x, height);
  }

  raceContext.fillStyle = "rgba(47, 211, 137, 0.12)";
  raceContext.fillRect(0, 0, 8, height);
  raceContext.fillRect(width - 8, 0, 8, height);
}

function drawDashedRaceLine(x, height) {
  const dashHeight = 34;
  const gap = 26;
  const offset = raceScore % (dashHeight + gap);

  raceContext.fillStyle = "rgba(255, 255, 255, 0.28)";

  for (let y = -dashHeight + offset; y < height; y += dashHeight + gap) {
    raceContext.fillRect(x - 2, y, 4, dashHeight);
  }
}

function drawRacePlayer() {
  const rect = getRacePlayerRect();

  drawRaceCar(rect.x, rect.y, rect.width, rect.height, "#2fd389", "#68d8ff");
}

function drawRaceObstacles() {
  raceObstacles.forEach((obstacle) => {
    const rect = getRaceObstacleRect(obstacle);

    drawRaceCar(rect.x, rect.y, rect.width, rect.height, "#ff5f57", "#ffbd2e");
  });
}

function drawRaceCar(x, y, width, height, color, glassColor) {
  raceContext.save();

  raceContext.shadowColor = color;
  raceContext.shadowBlur = 16;

  raceContext.fillStyle = color;
  raceRoundRect(raceContext, x, y, width, height, 12);
  raceContext.fill();

  raceContext.shadowBlur = 0;

  raceContext.fillStyle = glassColor;
  raceRoundRect(raceContext, x + 10, y + 12, width - 20, 18, 7);
  raceContext.fill();

  raceContext.fillStyle = "rgba(0, 0, 0, 0.38)";
  raceRoundRect(raceContext, x + 7, y + height - 18, 10, 20, 5);
  raceContext.fill();

  raceRoundRect(raceContext, x + width - 17, y + height - 18, 10, 20, 5);
  raceContext.fill();

  raceContext.restore();
}

function getRacePlayerRect() {
  const laneWidth = raceSettings.width / raceSettings.lanes;
  const x = laneWidth * racePlayerLane
    + laneWidth / 2
    - raceSettings.playerWidth / 2;

  return {
    x,
    y: raceSettings.height - raceSettings.playerHeight - 24,
    width: raceSettings.playerWidth,
    height: raceSettings.playerHeight
  };
}

function getRaceObstacleRect(obstacle) {
  const laneWidth = raceSettings.width / raceSettings.lanes;
  const x = laneWidth * obstacle.lane
    + laneWidth / 2
    - raceSettings.obstacleWidth / 2;

  return {
    x,
    y: obstacle.y,
    width: raceSettings.obstacleWidth,
    height: raceSettings.obstacleHeight
  };
}

function areRaceRectsIntersecting(firstRect, secondRect) {
  const first = normalizeRaceRect(firstRect);
  const second = normalizeRaceRect(secondRect);

  return !(
    first.right < second.left
    || first.left > second.right
    || first.bottom < second.top
    || first.top > second.bottom
  );
}

function normalizeRaceRect(rect) {
  return {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height
  };
}

function updateRaceInfo() {
  if (raceScoreBox) {
    raceScoreBox.textContent = String(raceScore);
  }

  if (raceBestBox) {
    raceBestBox.textContent = String(raceBest);
  }

  if (raceSpeedBox) {
    raceSpeedBox.textContent = String(Math.max(1, Math.floor(raceSpeed / 100)));
  }
}

function showRaceOverlay(title, text) {
  if (!raceOverlay) {
    return;
  }

  raceOverlay.innerHTML = `
    <h3>${title}</h3>
    <p>${text}</p>
  `;

  raceOverlay.classList.remove("hidden");
}

function hideRaceOverlay() {
  if (raceOverlay) {
    raceOverlay.classList.add("hidden");
  }
}

function raceRoundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

document.querySelectorAll(".window").forEach((appWindow) => {
  makeResizable(appWindow);
});

function makeResizable(appWindow) {
  if (appWindow.querySelector(".resize-handle")) {
    return;
  }

  const resizeHandle = document.createElement("div");

  resizeHandle.className = "resize-handle";
  resizeHandle.title = "Изменить размер";
  appWindow.appendChild(resizeHandle);

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  resizeHandle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (appWindow.classList.contains("maximized")) {
      return;
    }

    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = appWindow.offsetWidth;
    startHeight = appWindow.offsetHeight;

    appWindow.classList.add("resizing");
    appWindow.style.zIndex = String(++zIndex);

    if (resizeHandle.setPointerCapture) {
      resizeHandle.setPointerCapture(event.pointerId);
    }
  });

  resizeHandle.addEventListener("pointermove", (event) => {
    if (!isResizing) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    const minSize = getWindowMinSize(appWindow);
    const maxWidth = Math.max(minSize.width, window.innerWidth - appWindow.offsetLeft - 8);
    const maxHeight = Math.max(minSize.height, window.innerHeight - appWindow.offsetTop - 98);

    const nextWidth = clamp(startWidth + deltaX, minSize.width, maxWidth);
    const nextHeight = clamp(startHeight + deltaY, minSize.height, maxHeight);

    appWindow.style.width = `${nextWidth}px`;
    appWindow.style.height = `${nextHeight}px`;
    appWindow.classList.add("is-resized");
  });

  resizeHandle.addEventListener("pointerup", (event) => {
    if (!isResizing) {
      return;
    }

    isResizing = false;
    appWindow.classList.remove("resizing");

    const hasCapture = resizeHandle.hasPointerCapture
      && resizeHandle.hasPointerCapture(event.pointerId);

    if (hasCapture) {
      resizeHandle.releasePointerCapture(event.pointerId);
    }
  });

  resizeHandle.addEventListener("pointercancel", () => {
    isResizing = false;
    appWindow.classList.remove("resizing");
  });

  resizeHandle.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (appWindow.classList.contains("maximized")) {
      return;
    }

    resetWindowSize(appWindow);
  });
}

function getWindowMinSize(appWindow) {
  if (appWindow.id === "garage") {
    return {
      width: 520,
      height: 420
    };
  }

  if (appWindow.id === "games") {
    return {
      width: 560,
      height: 440
    };
  }

  if (appWindow.id === "music") {
    return {
      width: 380,
      height: 420
    };
  }

  return {
    width: 340,
    height: 260
  };
}

function resetWindowSize(appWindow) {
  appWindow.style.width = "";
  appWindow.style.height = "";
  appWindow.classList.remove("is-resized");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const browserForm = document.querySelector("#browserForm");
const browserAddress = document.querySelector("#browserAddress");
const browserFrame = document.querySelector("#browserFrame");
const browserHome = document.querySelector("#browserHome");
const browserLoading = document.querySelector("#browserLoading");
const browserError = document.querySelector("#browserError");

const browserBackBtn = document.querySelector("#browserBackBtn");
const browserForwardBtn = document.querySelector("#browserForwardBtn");
const browserReloadBtn = document.querySelector("#browserReloadBtn");
const browserHomeBtn = document.querySelector("#browserHomeBtn");
const browserExternalBtn = document.querySelector("#browserExternalBtn");
const browserErrorExternalBtn = document.querySelector("#browserErrorExternalBtn");

let browserCurrentUrl = "";
let browserLoadTimer = null;
let browserBackStack = [];
let browserForwardStack = [];

if (browserForm) {
  browserForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!browserAddress) {
      return;
    }

    navigateBrowser(browserAddress.value, true);
  });
}

document.querySelectorAll("[data-browser-url]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateBrowser(button.dataset.browserUrl, true);
  });
});

if (browserBackBtn) {
  browserBackBtn.addEventListener("click", () => {
    goBrowserBack();
  });
}

if (browserForwardBtn) {
  browserForwardBtn.addEventListener("click", () => {
    goBrowserForward();
  });
}

if (browserReloadBtn) {
  browserReloadBtn.addEventListener("click", () => {
    reloadBrowserPage();
  });
}

if (browserHomeBtn) {
  browserHomeBtn.addEventListener("click", () => {
    showBrowserHome();
  });
}

if (browserExternalBtn) {
  browserExternalBtn.addEventListener("click", () => {
    openBrowserCurrentExternal();
  });
}

if (browserErrorExternalBtn) {
  browserErrorExternalBtn.addEventListener("click", () => {
    openBrowserCurrentExternal();
  });
}

if (browserFrame) {
  browserFrame.addEventListener("load", () => {
    hideBrowserLoading();
  });

  browserFrame.addEventListener("error", () => {
    showBrowserError();
  });
}

function navigateBrowser(value, shouldAddHistory) {
  if (!browserFrame || !value.trim()) {
    return;
  }

  const nextUrl = normalizeBrowserInput(value);

  if (shouldAddHistory && browserCurrentUrl) {
    browserBackStack.push(browserCurrentUrl);
    browserForwardStack = [];
  }

  browserCurrentUrl = nextUrl;

  if (browserAddress) {
    browserAddress.value = nextUrl;
  }

  hideBrowserHome();
  hideBrowserError();
  showBrowserLoading();

  browserFrame.classList.add("active");
  browserFrame.src = nextUrl;

  clearTimeout(browserLoadTimer);

  browserLoadTimer = setTimeout(() => {
    showBrowserError();
  }, 4500);

  updateBrowserNavButtons();
}

function normalizeBrowserInput(value) {
  const input = value.trim();

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  const looksLikeDomain = input.includes(".") && !input.includes(" ");

  if (looksLikeDomain) {
    return `https://${input}`;
  }

  const query = encodeURIComponent(input);

  return `https://duckduckgo.com/?q=${query}`;
}

function showBrowserLoading() {
  if (browserLoading) {
    browserLoading.classList.add("active");
  }
}

function hideBrowserLoading() {
  clearTimeout(browserLoadTimer);

  if (browserLoading) {
    browserLoading.classList.remove("active");
  }
}

function showBrowserError() {
  hideBrowserLoading();

  if (browserError) {
    browserError.classList.add("active");
  }
}

function hideBrowserError() {
  if (browserError) {
    browserError.classList.remove("active");
  }
}

function showBrowserHome() {
  browserCurrentUrl = "";
  clearTimeout(browserLoadTimer);

  if (browserAddress) {
    browserAddress.value = "";
  }

  if (browserFrame) {
    browserFrame.classList.remove("active");
    browserFrame.src = "about:blank";
  }

  if (browserHome) {
    browserHome.classList.add("active");
  }

  hideBrowserLoading();
  hideBrowserError();
  updateBrowserNavButtons();
}

function hideBrowserHome() {
  if (browserHome) {
    browserHome.classList.remove("active");
  }
}

function openBrowserCurrentExternal() {
  if (!browserCurrentUrl) {
    return;
  }

  window.open(browserCurrentUrl, "_blank", "noopener,noreferrer");
}

function reloadBrowserPage() {
  if (!browserFrame || !browserCurrentUrl) {
    return;
  }

  hideBrowserError();
  showBrowserLoading();

  browserFrame.src = browserCurrentUrl;

  clearTimeout(browserLoadTimer);

  browserLoadTimer = setTimeout(() => {
    showBrowserError();
  }, 4500);
}

function goBrowserBack() {
  if (!browserBackStack.length) {
    return;
  }

  if (browserCurrentUrl) {
    browserForwardStack.push(browserCurrentUrl);
  }

  const previousUrl = browserBackStack.pop();

  navigateBrowserFromHistory(previousUrl);
}

function goBrowserForward() {
  if (!browserForwardStack.length) {
    return;
  }

  if (browserCurrentUrl) {
    browserBackStack.push(browserCurrentUrl);
  }

  const nextUrl = browserForwardStack.pop();

  navigateBrowserFromHistory(nextUrl);
}

function navigateBrowserFromHistory(url) {
  browserCurrentUrl = url;

  if (browserAddress) {
    browserAddress.value = url;
  }

  hideBrowserHome();
  hideBrowserError();
  showBrowserLoading();

  if (browserFrame) {
    browserFrame.classList.add("active");
    browserFrame.src = url;
  }

  clearTimeout(browserLoadTimer);

  browserLoadTimer = setTimeout(() => {
    showBrowserError();
  }, 4500);

  updateBrowserNavButtons();
}

function updateBrowserNavButtons() {
  if (browserBackBtn) {
    browserBackBtn.disabled = browserBackStack.length === 0;
  }

  if (browserForwardBtn) {
    browserForwardBtn.disabled = browserForwardStack.length === 0;
  }
}