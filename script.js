const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const teamCards = document.querySelectorAll(".team-card");
const attendeeList = document.getElementById("attendeeList");

let count = 0;
let attendees = [];
const maxCount = 50;
const STORAGE_KEY = "intelEventCheckInState";

function getStoredState() {
  const storedState = localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return {
      count: 0,
      teams: {
        water: 0,
        zero: 0,
        power: 0,
      },
      attendees: [],
    };
  }

  try {
    return JSON.parse(storedState);
  } catch (error) {
    return {
      count: 0,
      teams: {
        water: 0,
        zero: 0,
        power: 0,
      },
      attendees: [],
    };
  }
}

function saveState() {
  const state = {
    count: count,
    teams: {
      water:
        parseInt(document.getElementById("waterCount").textContent, 10) || 0,
      zero: parseInt(document.getElementById("zeroCount").textContent, 10) || 0,
      power:
        parseInt(document.getElementById("powerCount").textContent, 10) || 0,
    },
    attendees: attendees,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  attendees.forEach(function (attendee) {
    const attendeeItem = document.createElement("li");
    attendeeItem.className = "attendee-item";
    attendeeItem.textContent = attendee.name + " — " + attendee.teamName;
    attendeeList.appendChild(attendeeItem);
  });
}

function restoreState() {
  const state = getStoredState();

  count = state.count || 0;
  attendees = state.attendees || [];

  const teamKeys = Object.keys(state.teams || {});

  teamKeys.forEach(function (teamKey) {
    const teamCounter = document.getElementById(teamKey + "Count");
    if (teamCounter) {
      const teamTotal = parseInt(state.teams[teamKey], 10) || 0;
      teamCounter.textContent = teamTotal;
    }
  });

  renderAttendeeList();
  updateAttendance();
}

function getWinningTeam() {
  const teams = ["water", "zero", "power"];
  let winningTeam = "";
  let winningCount = -1;

  teams.forEach(function (team) {
    const teamCounter = document.getElementById(team + "Count");
    const teamTotal = parseInt(teamCounter.textContent, 10) || 0;

    if (teamTotal > winningCount) {
      winningCount = teamTotal;
      winningTeam = team;
    }
  });

  return {
    team: winningTeam,
    count: winningCount,
  };
}

function updateWinningTeamHighlight() {
  teamCards.forEach(function (teamCard) {
    teamCard.classList.remove("winning-team");
  });

  const winner = getWinningTeam();

  if (winner.team !== "") {
    const winningCard = document.querySelector(".team-card." + winner.team);

    if (winningCard) {
      winningCard.classList.add("winning-team");
    }
  }
}

function updateAttendance() {
  const percentage = Math.min(Math.round((count / maxCount) * 100), 100);

  attendeeCount.textContent = count;
  progressBar.style.width = percentage + "%";
  updateWinningTeamHighlight();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  if (name === "" || team === "") {
    return;
  }

  count++;

  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;

  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });

  saveState();
  renderAttendeeList();
  updateAttendance();

  const winner = getWinningTeam();
  const winningCard = document.querySelector(".team-card." + winner.team);
  const winningTeamLabel =
    winningCard && winningCard.querySelector(".team-name")
      ? winningCard.querySelector(".team-name").textContent
      : "The winning team";

  if (count >= maxCount) {
    greeting.textContent = `🎉 Goal reached! We hit ${maxCount} attendees. ${winningTeamLabel} is the winning team!`;
    greeting.classList.add("success-message", "celebration-message");
    greeting.style.display = "block";
  } else {
    greeting.textContent = `Welcome ${name}! You checked in for the ${teamName} team.`;
    greeting.classList.add("success-message");
    greeting.style.display = "block";
  }

  form.reset();
});

restoreState();
