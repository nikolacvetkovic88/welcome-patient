app.factory('educationRepository', function($base64, $http, $q, helper) {
	var EducationRepository = {};

    EducationRepository.getEducationMaterial = function (patientId, queryParams, token) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '/EducationalMaterial';
        if(queryParams)
            url += queryParams;

        return helper.getCloudData(url, token);
    }

    EducationRepository.decodeAllEducationMaterial = function(data, patientId) {
        var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/EducationalMaterial";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var educationRefs = [];

        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(triple && triple.subject === subject && triple.predicate != predicate)
                        educationRefs.push(triple.object);
                } else if(error) {
                    console.log(error);
                } else
                    defer.resolve(educationRefs);
            });

        return defer.promise;
    }

    EducationRepository.getEducationMaterialByRef = function(url, token) {
        return helper.getCloudData(url, token);
    }

    EducationRepository.decodeEducationMaterial = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var educationObj = {};
        var dates = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf("EducationalMaterial") != -1) {
                        var cloudRefArray = triple.subject.split('/');
                        educationObj.cloudRef = cloudRefArray[cloudRefArray.length-1];
                    }

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value") {
                        if(N3Util.isLiteral(triple.object) && N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                            dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isIRI(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.sent" || triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.received")) {
                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.sent" ) {
                            educationObj.dateSent = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.received" ) {
                            educationObj.dateReceived = getItemPerSubject(dates, triple.object);
                            return;
                        }

                    }

                    if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.status") {
                        educationObj.status = triple.object.split('#')[1];
                        return;
                    }

                    if(N3Util.isIRI(triple.object)) {
                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#sender") {
                            var practitionerArray = triple.object.split('/');
                            educationObj.practitioner = {};
                            educationObj.practitioner.cloudRef = practitionerArray[practitionerArray.length-1];
                            educationObj.practitioner.specialty = practitionerArray[practitionerArray.length-2];
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#recipient") {
                            var tmpPatient = triple.object.split('/');
                            educationObj.patient = tmpPatient[tmpPatient.length-1];
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#subject") {
                            educationObj.program = triple.object.split('#')[1];
                            return;
                        }
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#string")) {

                        educationObj.title = N3Util.getLiteralValue(triple.object);
                    }

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value") {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#anyURI") {
                            educationObj.url = N3Util.getLiteralValue(triple.object);
                            return;
                        }
                    }
                } else if(error){
                    console.log(error);
                } else {
                    defer.resolve(educationObj);
                }
            });

        return defer.promise;
    };

    var getItemPerSubject = function(items, searchValue){
        for(var i = 0; i < items.length; i++) {
            if(items[i].subject === searchValue) {
                return items[i].value;
            }
        }
    }

    return EducationRepository;
});