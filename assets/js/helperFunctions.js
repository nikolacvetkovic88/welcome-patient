function formatDateForUser(date) {
    return moment(date).format("ll");
}

function formatDateTimeForUser(dateTime) {
    return moment(dateTime).format("ll HH:mm");
}

function notify(message, mode) {
    $.notify(message, { position: "top center", className: mode })
}