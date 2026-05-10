import { QUOTES } from './quotes.js';

export function initClock() {
  const timeEl = document.querySelector('#clock-widget .time');
  const dateEl = document.querySelector('#clock-widget .date');
  const greetingEl = document.querySelector('#greeting-widget');
  const quoteEl = document.querySelector('#quote-widget .quote-text');

  let currentUserName = '';

  function getGreeting(hours) {
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function getQuoteOfDay() {
    const index = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[index];
  }

  function update() {
    const now = new Date();
    const hoursNum = now.getHours();

    // Time
    const hours = hoursNum.toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;

    // Date
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);

    // Greeting
    const baseGreeting = getGreeting(hoursNum);
    greetingEl.textContent = currentUserName ? `${baseGreeting}, ${currentUserName}` : baseGreeting;
  }

  // Initial Quote
  quoteEl.textContent = getQuoteOfDay();

  // Handle name updates from storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['userName'], (result) => {
      if (result.userName) {
        currentUserName = result.userName;
        update();
      }
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.userName) {
        currentUserName = changes.userName.newValue;
        update();
      }
    });
  }

  update();
  setInterval(update, 1000);
}

