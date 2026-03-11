export function initClock() {
	const timeEl = document.querySelector('#clock-widget .time');
	const dateEl = document.querySelector('#clock-widget .date');

	function update() {
		const now = new Date();

		// Time
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		timeEl.textContent = `${hours}:${minutes}`;

		// Date
		const options = { weekday: 'short', month: 'short', day: 'numeric' };
		dateEl.textContent = now.toLocaleDateString('en-US', options);
	}

	update();
	setInterval(update, 1000);
}
