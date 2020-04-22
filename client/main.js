const canvas = document.getElementById("canvas");
const refreshBtn = document.getElementById("refresh");
const fullScreeBtn = document.getElementById("fullscreen");
const changeBrushBtn = document.getElementById("change-brush");
const changeBgBtn = document.getElementById("change-bg");
const ctx = canvas.getContext("2d");
const receivedCtx = canvas.getContext("2d");
const socket = io();
const bgColors = [
    "rgb(1, 22, 39)",
    "rgb(231, 29, 54)",
    "rgb(255, 159, 28)",
    "rgb(46, 196, 182)",
];
const brushColors = [
    "rgb(0,0,0)",
    "rgb(255, 190, 11)",
    "rgb(251, 86, 7)",
    "rgb(255, 0, 110)",
    "rgb(131, 56, 236)",
    "rgb(58, 134, 255)",
];
let shiftBrushColors = 0;
let shiftBgColors = 0;

const initCanvas = () => {
    canvas.width = window.innerWidth - window.innerWidth / 6;
    canvas.height = window.innerHeight - window.innerHeight / 6;
};

const brushMoveListener = (event) => {
    const pos = chooseEvent(event);
    writeEvent("message", pos);
};

const brushDownListener = (event) => {
    const pos = chooseEvent(event);
    writeEvent("mouseorigin", pos);
};

socket.on("mouseorigin", ({ x, y, w, h }) => {
    const updatedX = map(x, w, 0, window.innerWidth, 0);
    const updatedY = map(y, 0, h, 0, window.innerHeight);
    brushDown(updatedX, updatedY);
});

socket.on("message", ({ x, y, w, h, color }) => {
    const updatedX = map(x, w, 0, window.innerWidth, 0);
    const updatedY = map(y, 0, h, 0, window.innerHeight);
    drawBrush(updatedX, updatedY, color);
});

/* For interacting with events */

/**
 *
 * @param {*Chose the right data to return based on the event received (desktop | mobile)} event
 */

const chooseEvent = (event) => {
    const boundaries = canvas.getBoundingClientRect();
    if (event.buttons === 1) {
        return {
            w: window.innerWidth,
            h: window.innerHeight,
            x: event.clientX - boundaries.left,
            y: event.clientY - boundaries.top,
            color: brushColors[shiftBrushColors],
        };
    } else if (event.type === "touchmove" || event.type === "touchstart") {
        return {
            w: window.innerWidth,
            h: window.innerHeight,
            x: event.touches[0].clientX - boundaries.left,
            y: event.touches[0].clientY - boundaries.top,
            color: brushColors[shiftBrushColors],
        };
    }
    return null;
};

/* Bubbles communication */

/* Drawing communication */

/**
 *
 * @param {*The type of message to contact server} messageType
 * @param {*The content which the message is to carry} payload
 */

const writeEvent = (messageType, payload) => {
    socket.compress(true).emit(messageType, payload);
};

/**
 * @author MK
 * @param {*Position to start the line x-axis} x
 * @param {*Position to start the line y-axis} y
 */

const brushDown = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.closePath();
};

/**
 * @author MK
 * @param {*Position to end the line x-axis} x
 * @param {*Position to end the line y-axis} y
 */

const drawBrush = (x, y, color) => {
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
};

/**
 *
 * @param {*The number to be squished into a new range} value
 * @param {*The original x range of the number which is being squished} istart
 * @param {*The original y range of the number which is being squished} istop
 * @param {*The x into which the value should be squished into} ostart
 * @param {*The y into which the value should be squished into} ostop
 */

const map = (value, istart, istop, ostart, ostop) => {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};

const toggleFullScreen = () => {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen =
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullScreen ||
        docEl.msRequestFullscreen;
    const cancelFullScreen =
        doc.exitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen;

    if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement
    ) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
};

//
window.addEventListener("resize", () => {
    initCanvas();
    console.log("Fired");
});

//
canvas.addEventListener("mousedown", brushDownListener);
canvas.addEventListener("touchstart", brushDownListener);
canvas.addEventListener("touchmove", brushMoveListener);
canvas.addEventListener("mousemove", brushMoveListener);
//
fullScreeBtn.addEventListener("click", () => {
    toggleFullScreen();
});

refreshBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

changeBgBtn.addEventListener("click", () => {
    shiftBgColors = (shiftBgColors + 1) % bgColors.length;
    document.body.style.background = bgColors[shiftBgColors];
});

changeBrushBtn.addEventListener("click", () => {
    shiftBrushColors = (shiftBrushColors + 1) % brushColors.length;
    changeBrushBtn.style.color = brushColors[shiftBrushColors];
});

//
initCanvas();
