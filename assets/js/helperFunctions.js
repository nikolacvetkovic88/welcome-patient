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

function notify(message, mode) {
	var className = "";
	switch(mode) {
		case "warn":
		    className = "text-warning";
		    break;
		case "error":
		    className = "text-danger";
		    break;
		case "info":
		    className = "text-info";
		    break;
		case "success":
		    className = "text-success";
		    break;
		default:
		    className = "text-primary";
		    break;
	}
	var fullMessage = "<div class='" + className + "'>" + message + "</div>";
	bootbox.alert(fullMessage);
}