// Config
const TOTAL_GAMES = 270;
const HAPPY_USERS = 333;
const TEAM_MEMBERS = 92113;

// Animate counter from 0 to target
function animateCounter(id, target) {
  const element = document.getElementById(id);
  if (!element) return;
  
  let count = 0;
  const increment = target / 50; // Smooth animation steps
  
  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      clearInterval(timer);
      count = target;
    }
    element.textContent = Math.floor(count).toLocaleString();
  }, 20);
}

// Update all counters
function updateCounters() {
  animateCounter("total-games-count", TOTAL_GAMES);
  animateCounter("happy-users-count", HAPPY_USERS);
  animateCounter("team-members-count", TEAM_MEMBERS);
}

// Start when page loads
document.addEventListener("DOMContentLoaded", updateCounters);