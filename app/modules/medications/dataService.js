app.factory('medicationsRepository', function($http, $q, helper) {
	var MedicationsRepository = {};

	MedicationsRepository.getMedications = function(patientId, queryParams, token) {
		var url =  helper.baseUrl + '/Patient/' + patientId + '/MedicationPrescription';
        if(queryParams)
            url += queryParams;

		return helper.getCloudData(url, token);
    }

    MedicationsRepository.decodeMedications = function(data, patientId) {
    	var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/MedicationPrescription";
    	var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    	var parser = N3.Parser();
        var N3Util = N3.Util;
        var prescriptionRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    prescriptionRefs.push(triple.object);
                } 
            }else if (error) {
                console.log(error);
            } else {
                defer.resolve(prescriptionRefs);
            }
        });
		
		return defer.promise;
    }

    MedicationsRepository.getMedicationByRef = function(url, token) {
        return helper.getCloudData(url, token);
    }

    MedicationsRepository.decodeMedication = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var medicationObj = {};
        var dates = [];
        var stringValues = [];
        var numbers = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {

                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf("MedicationPrescription") != -1) {
                        var cloudRefArray = triple.subject.split('/');
                        medicationObj.cloudRef = cloudRefArray[cloudRefArray.length-1];
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start") {
                            medicationObj.periodStart = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end") {
                            medicationObj.periodEnd = getItemPerSubject(dates, triple.object);
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.event") {
                        if(medicationObj.timingEvents == null || medicationObj.timingEvents.length == 0) {
                            medicationObj.timingEvents = [];
                        }

                        medicationObj.timingEvents.push(getItemPerSubject(dates, triple.object));
                        return;
                    }

                    if(N3Util.isBlank(triple.object) &&
                        triple.predicate ===  "http://lomi.med.auth.gr/ontologies/FHIRResources#MedicationPrescription.note") {
                        medicationObj.note = getItemPerSubject(stringValues, triple.object);
                        return;
                    }

                    if(N3Util.isBlank(triple.object) &&
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#CodeableConcept.text") {
                        medicationObj.code = getItemPerSubject(stringValues, triple.object);
                        return;
                    }

                    if(N3Util.isBlank(triple.object) &&
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Medication.name") {
                        medicationObj.medication = getItemPerSubject(stringValues, triple.object);
                        return;
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.frequency" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.period" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Quantity.value" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.periodUnits")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.frequency") {
                            medicationObj.frequency = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.period") {
                            medicationObj.period = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Quantity.value") {
                            medicationObj.quantity = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.periodUnits") {
                            medicationObj.periodUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }
                    } 

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#integer" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#int")) {

                        numbers.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#date" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#dateTime")) {

                        dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#string")) {

                        stringValues.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#boolean") {
                        medicationObj.asNeeded = N3Util.getLiteralValue(triple.object);
                    }

                    if(N3Util.isIRI(triple.object) && triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#MedicationPrescription.status") {
                        medicationObj.status = triple.object.split('#')[1].split('_')[1];
                        return;
                    }
                } else if(error){
                    console.log(error);
                } else {
                    defer.resolve(medicationObj);
                }

            });

        return defer.promise;
    }

    var getItemPerSubject = function(items, searchValue) {
        for(var i = 0; i<items.length; i++){
            if(items[i].subject === searchValue) {
                return items[i].value;
            }
        }
    };

    return MedicationsRepository;
});