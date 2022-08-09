export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export const formatDate = (date: number | Date, verbose?: boolean, utc?: boolean) => {
	if (!date) {
		return;
	}
	if (typeof date === 'number') {
		date *= 1000; // NOTE: Not sure if this project will every have timestamps in ms. For now this function assumes number dates are in seconds.
	}
	date = new Date(date);
	const year = date[`get${utc ? 'UTC' : ''}FullYear`]();
	const month = date[`get${utc ? 'UTC' : ''}Month`]();
	const day = date[`get${utc ? 'UTC' : ''}Date`]();
	const hour = date[`get${utc ? 'UTC' : ''}Hours`]();
	const minute = date[`get${utc ? 'UTC' : ''}Minutes`]();
	const second = date[`get${utc ? 'UTC' : ''}Seconds`]();

	if (verbose) {
		const minute = date.getMinutes();
		// · middle dot shift+option+9
		// • bullet option+8
		return `${year} ${MONTHS[month]} ${day} · ${date.getHours()}:${
			minute < 10 ? `0${minute}` : minute
		}`;
	}
	return `${year}/${month + 1}/${day} ${hour}:${minute}:${second}`;
};
