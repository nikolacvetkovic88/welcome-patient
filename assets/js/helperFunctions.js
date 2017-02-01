app.factory('helper', function($http, $base64) {
	var helper = {};

    helper.baseUrl = "https://cloud-welcome-project.eu/api/data";
    helper.hubUrl = "http://welcome-test.exodussa.com";

	helper.getCloudData = function(url, x_token) {
		var encodedCred = $base64.encode('welk' + ':' + 'welk');

	    return $http({
		    url: url,
		    method: 'GET',
		    headers: {
		        'Authorization' : 'Basic ' + encodedCred,
		        'Accept' : 'text/turtle',
		        'Content-Type' : 'text/turtle',
		        'X-Token': x_token
		    }
	    });
	}

	helper.getHubData = function(url, token) {
		return $http.get(url, {
            headers: {
                "Authorization": "Bearer" + token
            }
       });
	}

	helper.postCloudData = function(url, data) {
		var encodedCred = $base64.encode('welk' + ':' + 'welk');

		return  $http({
            url: url,
            method: 'POST',
            data: data,
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
	}

	helper.formatDateForUser = function(date) {
	    return moment(date).format("ll");
	}

	helper.formatDateTimeForUser = function(dateTime) {
	    return moment(dateTime).format("ll HH:mm");
	}

	helper.formatDateForServer = function(date) {
		return moment(date).format("YYYY-MM-DD");
	}

	helper.formatDateTimeForServer = function(dateTime) {
		return moment(dateTime).format("YYYY-MM-DDTHH:mm:ssZ");
	}

	helper.notify = function(message, type) {
		$('#notification').notify({
			message: { text: message },
			type: type
		}).show();
	}

	return helper;
});