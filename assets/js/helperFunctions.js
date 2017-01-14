function formatDateForUser(date) {
    return moment(date).format("ll");
}

function formatDateTimeForUser(dateTime) {
    return moment(dateTime).format("ll HH:mm");
}

function formatDateForServer(date) {
	return moment(date).format("YYYY-MM-DD");
}

function formatDateTimeForServer(dateTime) {
	return moment(dateTime).format("YYYY-MM-DDTHH:mm");
}

function notify(message, type) {
	$('#notification').notify({
		message: { text: message },
		type: type
	}).show();
}