let routes;
let minimalMode = false;
var timeInterval;

window.onload = async function() {
  fetch("https://tavis.page/routes")
    .then(r => r.json())
    .then(r => {
      const selector = document.getElementById("route-select");
      for(const route in r) {
        const option = document.createElement("option");
        routes = r;
        option.value = route;
        option.innerText = route;
        selector.appendChild(option);
      }
    });
};

document.getElementById("route-select").onchange = function(ev) {
  const value = ev.target.value;
  const route = routes[value];
  const table = document.getElementById("route-table");
  // Set the title to the new route
  table.children[0].children[0].innerHTML = `<th colspan="3">${value}</th>`;
  // Remove all tr elements from the table
  for(let i = Array.from(table.children).length - 1; i >= 0; i--) {
    if(table.children[i].tagName === "TR" || table.children[i].tagName === "BUTTON") table.children[i].remove();
  }
  // Add new tr elements to the table
  for(const stop in route.stations) {
    const row = document.createElement("tr");
    const stopIndex = document.createElement("td");
    const stopName = document.createElement("td");
    const stopTime = document.createElement("td");
    stopIndex.innerText = parseInt(stop) + 1;
    stopIndex.classList.add("td");
    stopName.innerText = route.stations[stop];
    stopName.classList.add("td");
    const time = new Date(parseInt(route.times[stop]));
    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    const seconds = time.getUTCSeconds();
    stopTime.innerText = `${("00"+hours).slice(-2)}:${("00"+minutes).slice(-2)}:${("00"+seconds).slice(-2)}`;
    stopTime.classList.add("td");
    row.appendChild(stopIndex);
    row.appendChild(stopName);
    row.appendChild(stopTime);
    table.appendChild(row);
  }
  // Insert button
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.setAttribute("colspan", "3");
  cell.style.textAlign = "center";
  const button = document.createElement("button");
  button.innerText = "Load Route?";
  button.onclick = function() {
    const valid = confirm(`Are you sure you want to load ${value}?`);
    if(valid)
      loadRoute(route, value);
    else
      console.warn("User rejected loading route");
  };
  cell.appendChild(button);
  row.appendChild(cell);
  table.appendChild(row);
};

function loadRoute(route, value) {
  console.log("Loading route", value);
  //#region Table
  if(!route) return console.error(0);
  if(!Object.keys(routes).includes(value)) return console.error(1);
  const schedule = document.getElementById("schedule-table");
  schedule.hidden = false;
  // Remove all tr elements from the table
  for(let i = Array.from(schedule.children).length - 1; i >= 0; i--) {
    if(schedule.children[i].tagName === "TR") schedule.children[i].remove();
  }
  // Set the title to the route
  schedule.children[0].children[0].innerHTML = `<th colspan="3">${value}</th>`;
  schedule.children[1].classList.add("active-stop");
  // Date math
  let now = Math.floor(Date.now());
  while(new Date(now).getMinutes() % 5 > 0) now += 1000;
  // Anything 2 minutes or lower to now, set it to the next 5 minute interval
  if(now - Date.now() < 120000)
    now += (5 - (new Date(now).getMinutes() % 5)) * 60 * 1000;
  now -= new Date(now).getSeconds() * 1000;
  for(const stop in route.stations) {
    const row = document.createElement("tr");
    row.classList.add("schedule-cells");
    let canvasHolder;
    if(stop === "0") {
      canvasHolder = createDepot();
    } else if(stop === String(route.stations.length - 1)) {
      canvasHolder = createTerminus();
    } else {
      canvasHolder = createPendingStop();
    }
    const stopName = document.createElement("td");
    stopName.classList.add("schedule-cells");
    const stopTime = document.createElement("td");
    stopTime.classList.add("schedule-cells");
    stopName.innerText = route.stations[stop];
    if(stop > 0)
      now = new Date(schedule.children[parseInt(stop) + 1].getAttribute("epoch")).getTime();
    const time = new Date(now + parseInt(route.times[stop]));
    row.setAttribute("epoch", time);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    stopTime.innerText = `${("00"+hours).slice(-2)}:${("00"+minutes).slice(-2)}:${("00"+seconds).slice(-2)}`;
    row.appendChild(canvasHolder);
    row.appendChild(stopName);
    row.appendChild(stopTime);
    schedule.appendChild(row);
  }
  //#endregion
  //#region Schedule
  const row3 = document.createElement("tr");
  row3.classList.add("schedule-cells");
  const cell3 = document.createElement("td");
  cell3.setAttribute("colspan", "3");
  cell3.style.textAlign = "center";
  cell3.innerText = "Click 'Next Stop' to begin";
  cell3.style.paddingTop = "10px";
  cell3.style.paddingBottom = "25px";
  cell3.id = "station-text";
  row3.appendChild(cell3);
  schedule.appendChild(row3);
  //#endregion
  //#region Next & Previous
  const row = document.createElement("tr");
  row.classList.add("schedule-cells");
  const cell = document.createElement("td");
  cell.setAttribute("colspan", "3");
  cell.style.textAlign = "center";
  const button = document.createElement("button");
  button.innerText = "Next Stop";
  button.onclick = function() {
    const active = document.getElementsByClassName("active-stop")[0];
    const next = active.nextElementSibling;
    if(next.children[0].tagName === "TD") return alert("You are at the end of the route");
    if(active) {
      active.classList.remove("active-stop", "early", "on-time", "late");
      active.children[0].classList.remove("active-stop", "early", "on-time", "late");
    }
    if(next) {
      const stationTime = new Date(next.getAttribute("epoch"));
      if(stationTime.getHours() === new Date().getHours() && stationTime.getMinutes() === new Date().getMinutes() && stationTime.getDate() === new Date().getDate()) {
        next.classList.add("on-time");
        next.children[0].classList.add("on-time");
      } else if(new Date().getDate() < stationTime.getDate()) {
        next.classList.add("early");
        next.children[0].classList.add("early");
      } else {
        next.classList.add("late");
        next.children[0].classList.add("late");
      }
      next.classList.add("active-stop");
      next.children[0].classList.add("active-stop");
    }
  };
  cell.appendChild(button);
  row.appendChild(cell);
  schedule.appendChild(row);
  const row2 = document.createElement("tr");
  row2.classList.add("schedule-cells");
  const cell2 = document.createElement("td");
  cell2.setAttribute("colspan", "3");
  cell2.style.textAlign = "center";
  const button2 = document.createElement("button");
  button2.innerText = "Previous Stop";
  button2.onclick = function() {
    const active = document.getElementsByClassName("active-stop")[0];
    const prev = active.previousElementSibling;
    if(prev.tagName === "TBODY") return alert("You cannot go back any further");
    if(active) {
      active.classList.remove("active-stop", "early", "on-time", "late");
      active.children[0].classList.remove("active-stop", "early", "on-time", "late");
    }
    if(prev) {
      const stationTime = new Date(prev.getAttribute("epoch"));
      if(stationTime.getHours() === new Date().getHours() && stationTime.getMinutes() === new Date().getMinutes() && stationTime.getDate() === new Date().getDate()) {
        prev.classList.add("on-time");
        prev.children[0].classList.add("on-time");
      } else if(new Date().getDate() < stationTime.getDate()) {
        prev.classList.add("early");
        prev.children[0].classList.add("early");
      } else {
        prev.classList.add("late");
        prev.children[0].classList.add("late");
      }
      prev.classList.add("active-stop");
      prev.children[0].classList.add("active-stop");
    }
  };
  cell2.appendChild(button2);
  row2.appendChild(cell2);
  schedule.appendChild(row2);
  clearInterval(timeInterval);
  timeInterval = setInterval(() => checkTime(), 10);
  //#endregion
}

function createPendingStop() {
  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");
  // Create an orange circle in the middle
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(25, 25, 12.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  // Create two lines extending from the top and bottom of the circle
  ctx.beginPath();
  // Top
  ctx.moveTo(25, 0);
  ctx.lineTo(25, 12.5);
  // Bottom
  ctx.moveTo(25, 50);
  ctx.lineTo(25, 37.5);
  ctx.strokeStyle = "black";
  ctx.stroke();
  return canvas;
}

function createTerminus() {
  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");
  // Create an orange circle in the middle
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(25, 25, 12.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  // Create two lines extending from the top and bottom of the circle
  ctx.beginPath();
  // Top
  ctx.moveTo(25, 0);
  ctx.lineTo(25, 12.5);
  ctx.strokeStyle = "black";
  ctx.stroke();
  return canvas;
}

function createDepot() {
  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");
  // Create an orange circle in the middle
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(25, 25, 12.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  // Create two lines extending from the top and bottom of the circle
  ctx.beginPath();
  // Bottom
  ctx.moveTo(25, 50);
  ctx.lineTo(25, 37.5);
  ctx.strokeStyle = "black";
  ctx.stroke();
  return canvas;
}

// eslint-disable-next-line no-unused-vars
function loadDb() {
  // Get the database URL from route-db
  const dbUrl = document.getElementById("route-db").value;
  const status = document.getElementById("route-db-status");
  if(dbUrl === "") {
    status.innerText = "Please enter a database URL";
    status.style.color = "red";
    return console.error(0);
  }
  if(!dbUrl || !status) return console.error(1);
  status.style.color = "black";
  status.innerText = "Validating database URL...";
  // Validation
  if(!dbUrl.startsWith("https://")) {
    status.innerText = "Database must be HTTPS";
    status.style.color = "red";
    return console.error(2);
  }
  status.innerText = "Fetching database...";
  // Fetch
  fetch(dbUrl)
    .then(r => {
      status.innerText = `${r.status} ${r.statusText}`;
      return r;
    })
    .then(r => r.json())
    .then(r => {
      status.innerText = `Database loaded (${status.innerText})`;
      status.style.color = "green";

      // Remove all options from the select, minus the first one
      const select = document.getElementById("route-select");
      while(select.options.length > 1) {
        select.removeChild(select.options[1]);
      }
      for(const route in routes) {
        const option = document.createElement("option");
        option.value = route;
        option.innerText = route;
        select.appendChild(option);
      }
      routes = r;
    })
    .catch(e => {
      status.innerText = String(e);
      status.style.color = "red";
      return {};
    });
}

// eslint-disable-next-line no-unused-vars
function checkTime() {
  const text = document.getElementById("station-text");
  if(!text) return 1;
  // Get the active station
  const active = document.getElementsByClassName("active-stop");
  if(!active || !active.length) return 2;
  const stationTime = new Date(active[0].getAttribute("epoch"));
  if(stationTime.getTime() === 0) return 3;
  const now = new Date();
  // Get the difference in seconds between the two times
  const diff = Math.floor((now.getTime() - stationTime.getTime()) / 1000);
  let minutes = Math.round(Math.abs(diff) / 60);
  const seconds = Math.abs(diff % 60);
  if(seconds >= 30)
    minutes = minutes - 1;
  const time = `Next Stop: ${active[0].children[1].innerText} | <span id="lateness">${setPrefix(diff, minutes, seconds)}${("00"+minutes).slice(-2)}:${("00"+seconds).slice(-2)}</span>`;
  text.innerHTML = time;
  const lateness = document.getElementById("lateness");
  lateness.classList.add("active-stop");
  // Check if the time is on time
  if(stationTime.getHours() === now.getHours() && stationTime.getMinutes() === now.getMinutes() && stationTime.getDate() === now.getDate()) {
    // On time
    active[0].classList.remove("early", "late");
    active[0].children[0].classList.remove("early", "late");
    lateness.classList.remove("early", "late");
    active[0].classList.add("on-time");
    active[0].children[0].classList.add("on-time");
    lateness.classList.add("on-time");
  } else if(now.getTime() > stationTime.getTime()) {
    // Late
    active[0].classList.remove("on-time", "early");
    active[0].children[0].classList.remove("on-time", "early");
    lateness.classList.remove("on-time", "early");
    active[0].classList.add("late");
    active[0].children[0].classList.add("late");
    lateness.classList.add("late");
  } else {
    // Early
    active[0].classList.remove("on-time", "late");
    active[0].children[0].classList.remove("on-time", "late");
    lateness.classList.remove("on-time", "late");
    active[0].classList.add("early");
    active[0].children[0].classList.add("early");
    lateness.classList.add("early");
  }
}

function setPrefix(diff, minutes, seconds) {
  if(minutes === 0 && diff < 0) return "-";
  if(minutes === 0 && seconds === 0 && diff <= 0) return "";
  if(diff < 0) return "-";
  return "+";
}

// eslint-disable-next-line no-unused-vars
function minimal() {
  const elements = [];
  for(const element of document.getElementsByTagName("p")) elements.push(element);
  for(const element of document.getElementsByTagName("h1")) elements.push(element);
  for(const element of document.getElementsByTagName("label")) elements.push(element);
  for(const element of document.getElementsByTagName("br")) elements.push(element);
  for(const element of document.getElementsByTagName("hr")) elements.push(element);
  elements.push(document.getElementById("load-db"));
  elements.push(document.getElementById("route-db"));
  elements.push(document.getElementById("route-db-status"));
  elements.push(document.getElementById("route-select"));
  elements.push(document.getElementById("route-table"));
  if(!minimalMode) {
    elements.forEach(e => e.hidden = true);
    minimalMode = true;
  } else {
    elements.forEach(e => e.hidden = false);
    minimalMode = false;
  }
}