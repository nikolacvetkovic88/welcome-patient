app.factory('questionnairesRepository', function($base64, $http, $q) {
    var QuestionnairesRepository = {},
        staticQuestionnairesUrl = 'app/modules/questionnaires/staticQuestionnaires.json',
        baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

    QuestionnairesRepository.getStaticQuestionnaires =  function() {
        return $http( {
                method: 'GET',
                url: staticQuestionnairesUrl
            });
    }

    QuestionnairesRepository.getQuestionnaires = function(username, password, patientId) {
        var url =  baseUrl + 'Patient/' + patientId + '/QuestionnaireOrder?q=Timing.repeat/Timing.repeat.bounds/Period.start,afterEq,' + formatDateForServer(moment());
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

    QuestionnairesRepository.decodeQuestionnaires = function(data, patientId) {
        var subject = "http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/" + patientId + "/QuestionnaireOrder";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var questionnaireRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    questionnaireRefs.push(triple.object);
                } 
            } else if (error) {
                console.log(error);
            } else {
                defer.resolve(questionnaireRefs);
            }
        });
        
        return defer.promise;
    }

    QuestionnairesRepository.getQuestionnaireByRef = function(username, password, url) {
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

    QuestionnairesRepository.decodeQuestionnaire = function(data) {
        var N3Util = N3.Util;
        var questionnaireObj = {};
        var dates = [];
        var stringValues = [];
        var numbers = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf('QuestionnaireOrder') != -1) {
                        var cloudRefArray = triple.subject.split('/');
                        questionnaireObj.cloudRef = cloudRefArray[cloudRefArray.length-1];

                        /*if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail" && N3.Util.isIRI(triple.object)) {
                            questionnaireObj.id =  triple.object.split('#')[1];
                            questionnaireObj.title = triple.object.split('#')[1].split('_')[1];
                            return;
                        }*/
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start" ||
                        triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end")) {

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start") {
                            questionnaireObj.periodStart = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end") {
                            questionnaireObj.periodEnd = getItemPerSubject(dates, triple.object);
                            return;
                        }
                    }

                    if (N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#date" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#dateTime")) {

                        dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }
                } else if(error){
                    console.log(error);
                } else {
                    defer.resolve(questionnaireObj);
                }
            });

        return defer.promise;
    }
 
    QuestionnairesRepository.postQuestion = function(username, password, questionId, answer) {
        var regBody =   '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
                        @prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .\
                        @prefix FHIRct:   <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .\
                        @prefix FHIRpt:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .\
                        @prefix FHIRResources:   <http://lomi.med.auth.gr/ontologies/FHIRResources#> .\
                        @prefix FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .\
                        @prefix WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .\
                        \
                        []\
                          rdf:type FHIRResourcesExtensions:QuestionAnswer ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionAnswer.value> WELCOME_entities:' + answer + ';\
                          FHIRResourcesExtensions:question WELCOME_entities:' + questionId + ';\
                        .';

        var url = baseUrl + 'QuestionAnswer';
        var encodedCred = $base64.encode(username + ':' + password);

        return  $http({
            url: url,
            method: 'POST',
            data: regBody,
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    QuestionnairesRepository.postQuestionGroup = function(username, password, questionGroupId, score, questionAnswers) {
    	var regBody =  '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
                        @prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .\
                        @prefix FHIRct:   <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .\
                        @prefix FHIRpt:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .\
                        @prefix FHIRResources:   <http://lomi.med.auth.gr/ontologies/FHIRResources#> .\
                        @prefix FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .\
                        @prefix WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .\
                        \
                        []\
                          rdf:type FHIRResourcesExtensions:QuestionsGroupAnswers ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionsGroupAnswers.score> [\
                              rdf:type FHIRpt:decimal ;\
                              rdf:value "' + score + '"^^xsd:decimal ;\
                            ] ;';
  
	    angular.forEach(questionAnswers, function(questionAnswer) {
	    	regBody = regBody + 'FHIRResourcesExtensions:questionAnswer <' + questionAnswer + '>;'
	    });
	    regBody = regBody + 'FHIRResourcesExtensions:questionsGroup WELCOME_entities:' + questionGroupId + ';.';

        var url = baseUrl + 'QuestionsGroupAnswers';
        var encodedCred = $base64.encode(username + ':' + password);

        return  $http({
            url: url,
            method: 'POST',
            data: regBody,
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    QuestionnairesRepository.postQuestionnaire = function(username, password, patientId, questionnaireId, score, questionGroupAnswers) {
        var regBody =   '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
                        @prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .\
                        @prefix FHIRct:   <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .\
                        @prefix FHIRpt:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .\
                        @prefix FHIRResources:   <http://lomi.med.auth.gr/ontologies/FHIRResources#> .\
                        @prefix FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .\
                        @prefix WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .\
                        \
                        []\
                          rdf:type FHIRResources:QuestionnaireAnswers ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.authored> [\
                              rdf:type FHIRpt:dateTime ;\
                              rdf:value "' + moment().format("YYYY-MM-DDTHH:mm") + '"^^xsd:dateTime ;\
                            ] ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.status> FHIRResources:QuestionnaireAnswersStatus_completed ;\
                          FHIRResources:author <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;\
                          FHIRResources:questionnaire WELCOME_entities:' + questionnaireId + ' ;\
                          FHIRResources:source <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;\
                          FHIRResources:subject <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [\
                              rdf:type FHIRpt:decimal ;\
                              rdf:value "' + score + '"^^xsd:decimal ;\
                            ] ;';


        angular.forEach(questionGroupAnswers, function(questionGroupAnswer) {
            regBody = regBody +  'FHIRResourcesExtensions:questionsGroupAnswers <' + questionGroupAnswer + '>;';
        });
        regBody = regBody + ".";

        var url = baseUrl + 'QuestionnaireAnswers';
        var encodedCred = $base64.encode(username + ':' + password);

        return  $http({
            url: url,
            method: 'POST',
            data: regBody,
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    var getItemPerSubject = function(items, searchValue){
        for(var i = 0; i < items.length; i++){
            if(items[i].subject === searchValue) {
                return items[i].value;
            }
        }
    };
     
    return QuestionnairesRepository;
});