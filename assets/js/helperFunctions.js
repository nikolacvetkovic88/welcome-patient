app.factory('helper', function($http, $base64) {
	var helper = {};

    helper.baseUrl = "https://cloud-welcome-project.eu/api/data";
    helper.hubUrl = "https://welcome-test.exodussa.com";

    helper.questionnaireMappings = [
    	{
    		id: "Questionnaire_COPDAssessmentTest",
    		name: "COPD Assessment Test"
    	},
    	{
    		id: "Questionnaire_DSQ_8",
    		name: "Disease Specific Questionnaire 8"
    	},
    	{
    		id: "Questionnaire_DSQ_1",
    		name: "Disease Specific Questionnaire 1"
    	},
    	{
    		id: "Questionnaire_DSQ_6",
    		name: "Disease Specific Questionnaire 6"
    	},
    	{
    		id: "Questionnaire_Physical_Activities",
    		name: "Physical Activities"
    	},
    	{
    		id: "Questionnaire_SmokingCessation",
    		name: "Smoking Cessation"
    	},
    	{
    		id: "Questionnaire_DSQ_16",
    		name: "Disease Specific Questionnaire 16"
    	},
    	{
    		id: "Questionnaire_FatigueSeverityScale",
    		name: "Fatigue Severity Scale"
    	},
    	{
    		id: "Questionnaire_DSQ_13",
    		name: "Disease Specific Questionnaire 13"
    	},
		{
    		id: "Questionnaire_DSQ_9",
    		name: "Disease Specific Questionnaire 9"
    	},
    	{
    		id: "Questionnaire_DSQ_11",
    		name: "Disease Specific Questionnaire 11"
    	},
    	{
    		id: "Questionnaire_DSQ_7",
    		name: "Disease Specific Questionnaire 7"
    	},
    	{
    		id: "Questionnaire_DSQ_4",
    		name: "Disease Specific Questionnaire 4"
    	},
    	{
    		id: "Questionnaire_DSQ_2",
    		name: "Disease Specific Questionnaire 2"
    	},
    	{
    		id: "Questionnaire_DSQ_14",
    		name: "Disease Specific Questionnaire 14"
    	},
    	{
    		id: "Questionnaire_DSQ_12",
    		name: "Disease Specific Questionnaire 12"
    	},
    	{
    		id: "Questionnaire_DSQ_5",
    		name: "Disease Specific Questionnaire 5"
    	},
    	{
    		id: "Questionnaire_HospitalAnxietyAndDepressionScale",
    		name: "Hospital Anxiety And Depression Scale"
    	},
    	{
    		id: "Questionnaire_FagerstromToleranceQuestionnaire",
    		name: "Fagerstrom Tolerance"
    	},
    	{
    		id: "Questionnaire_MMRC",
    		name: "MMRC"
    	},
    	{
    		id: "Questionnaire_DSQ_3",
    		name: "Disease Specific Questionnaire 3"
    	},
    	{
    		id: "Questionnaire_DSQ_10",
    		name: "Disease Specific Questionnaire 10"
    	},
    	{
    		id: "Questionnaire_DSQ_15",
    		name: "Disease Specific Questionnaire 15"
    	},
    	{
    		id: "Questionnaire_MalnutritionUniversalScreeningTool",
    		name: "Malnutrition Universal Screening Tool"
    	}
    ];

    helper.deviceMappings = [
    	{
    		id: "",
    		name: "Blood Pressure"
    	},
    	{
    		id: "",
    		name: "Weight"
    	},
    	{
    		id: "",
    		name: "Blood Glucose"
    	},
    	{
    		id: "",
    		name: "Temperature"
    	},
    	{
    		id: "",
    		name: "Spirometer"
    	},
    	{
    		id: "",
    		name: "Vest"
    	}
    ];

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

	helper.getHubData = function(url, x_token) {
		return $http.get(url, {
            headers: {
                "Authorization": "Bearer" + x_token
            }
       });
	}

	helper.postCloudData = function(url, data, x_token) {
		var encodedCred = $base64.encode('welk' + ':' + 'welk');

		return  $http({
            url: url,
            method: 'POST',
            data: data,
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle',
                'X-Token': x_token
            }
        });
	}

	helper.formatDateForUser = function(date) {
	    return moment(date).format("ll");
	}

	helper.formatDateTimeForUser = function(dateTime) {
	    return moment(dateTime).format("ll HH:mm");
	}

	helper.formatDateTimeForUserWithSeconds = function(dateTime) {
		return moment(dateTime).format("ll HH:mm:ss");	
	}

	helper.formatTimeForUser = function(dateTime) {
		return moment(dateTime).format("HH:mm");
	}

	helper.formatDateForServer = function(date) {
		return moment(date).format("YYYY-MM-DD");
	}

	helper.formatDateTimeForServer = function(dateTime) {
		return moment(dateTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
	}

	helper.notify = function(message, type) {
		$('#notification').notify({
			message: { text: message },
			type: type
		}).show();
	}

	return helper;
});