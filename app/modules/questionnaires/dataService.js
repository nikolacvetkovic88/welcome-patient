app.factory('questionnairesRepository', function($base64, $http, $q) {
var QuestionnairesRepository = {},
    staticQuestionnairesUrl = 'app/modules/questionnaires/staticQuestionnaires.json',
    baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

    QuestionnairesRepository.getAllStaticQuestionnaires =  function() {
        return $http( {
                method: 'GET',
                url: staticQuestionnairesUrl
            });
    }

    QuestionnairesRepository.getAllAssignedQuestionnaires = function(username, password, patientId) {
        var url =  baseUrl + 'Patient/' + patientId + '/QuestionnaireOrder';
        var encodedCred = $base64.encode(username + ':' + password);
        return $http({
            url: url,
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    QuestionnairesRepository.decodeQuestionnaireOrders = function(data, patientId) {
        var subject = "http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/" + patientId + "/QuestionnaireOrder";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var diaryQuestionnaireRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    diaryQuestionnaireRefs.push(triple.object);
                } 
            }else if (error) {
            // Check for errors here and possibly reject the promise
            } else {
                    // When the function execution reaches this, it signals that all triples are successfully parsed
                    // and you can resolve the promise here/
                    defer.resolve(diaryQuestionnaireRefs);
            }
        });
        
        return defer.promise;
    }

    QuestionnairesRepository.getQuestionnaireOrderByRef = function(username, password, url) {
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url,
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    QuestionnairesRepository.decodeQuestionnaireOrder = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var questionnaireObj = {
            eventDates: []
        };
        var defer = $q.defer();
        var isFirst = true;

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isBlank(triple.subject) && triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' && N3Util.isLiteral(triple.object) ) {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                            if(!isFirst)
                                questionnaireObj.eventDates.push(N3Util.getLiteralValue(triple.object));
                            isFirst = false;
                        }
                    }

                    if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail" && N3.Util.isIRI(triple.object)) {
                        questionnaireObj.title = triple.object.split('#')[1].split('_')[1];
                        return;
                    }

                }else if (error) {
                // Check for errors here and possibly reject the promise 
                }else {
                    defer.resolve(questionnaireObj);
                }
            });

        return defer.promise;
    }

    QuestionnairesRepository.postQuestionnaire = function (username, password, patientId, answers, questionnaire) {
        var url = baseUrl + 'QuestionnaireAnswers';
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url,
            method: 'POST',
            data: CloudService.populateRegBodyForQuestionnaire(patientId, null, questionnaire),
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    QuestionnairesRepository.populateRegBodyForQuestionnaire = function(patientId, questionnaireId, score) {
        var currentDate = moment().format('YYYY-MM-DD HH:mm');
        
        return  '@prefix arg: <http://spinrdf.org/arg#> .' +
                '@prefix ns10: <http://lomi.med.auth.gr/ontologies/FHIRResources#> .' +
                '@prefix ns11: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .' +
                '@prefix ns12: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .' +
                '@prefix ns3: <http://lomi.med.auth.gr/ontologies/> .' +
                '@prefix ns7: <http://lomi.med.auth.gr/ontologies/LomiStorageServerSpecificProperties#> .' +
                '@prefix ns8: <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .' +
                '@prefix ns9: <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .' +
                '@prefix owl: <http://www.w3.org/2002/07/owl#> .' +
                '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .' +
                '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .' +
                '@prefix sp: <http://spinrdf.org/sp#> .' +
                '@prefix spin: <http://spinrdf.org/spin#> .' +
                '@prefix spl: <http://spinrdf.org/spl#> .' +
                '@prefix working2: <http://lomi.med.auth.gr/ontologies/working2#> .' +
                '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .' +

                'ns10:QuestionnaireAnswers_2' +
                ' rdf:type ns10:QuestionnaireAnswers ;' +
                '<http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.authored> [' +
                '   rdf:type ns8:dateTime ;' +
                '  rdf:value "' + currentDate + '"^^xsd:date ;' +
                '] ;' +
                '<http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.status> ns10:QuestionnaireAnswersStatus_completed ;' +
                'ns10:author <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                'ns10:questionnaire ns11:' + questionnaireId + ';' +
                'ns10:source <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                'ns10:subject <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                '<http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [' +
                '   rdf:type ns8:decimal ;' +
                '  rdf:value "' + score + '"^^xsd:decimal ;' +
                '] ' +
                '.';       
    };

    return QuestionnairesRepository;
});