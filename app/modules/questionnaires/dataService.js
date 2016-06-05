app.factory('questionnairesRepository', function($base64, $http) {
var QuestionnairesRepository = {},
    questionnairesUrl = "app/modules/testData/questionnaires.json",
    baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

    QuestionnairesRepository.getAllQuestionnaires = function() {
        return $http({
            method: 'GET',
            url: questionnairesUrl
        })
    };
   
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

    QuestionnairesRepository.populateRegBodyForQuestionnaire = function(patientId, score, questionnaire) {
        var currentDate = moment().format('YYYY-MM-DD HH:mm');
        switch(questionnaire) {
            case "mMRC Questionnaire":
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
                        'ns10:questionnaire ns11:Questionnaire_MMRC ;' +
                        'ns10:source <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        'ns10:subject <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '<http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [' +
                        '   rdf:type ns8:decimal ;' +
                        '  rdf:value "' + score + '"^^xsd:decimal ;' +
                        '] ' +
                        '.';
            case "Your Daily Questionnaire":
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

                        'ns10:QuestionnaireAnswers_3' +
                        '  rdf:type ns10:QuestionnaireAnswers ;' +
                        '  <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.authored> [' +
                        '      rdf:type ns8:dateTime ;' +
                        '      rdf:value "' + currentDate + '"^^xsd:date ;' +
                        '    ] ;' +
                        '  <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.status> ns10:QuestionnaireAnswersStatus_completed ;' +
                        '  ns10:author <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '  ns10:questionnaire ns11:Questionnaire_DSQ_3 ;' +
                        '  ns10:source <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '  ns10:subject <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '  <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [' +
                        '      rdf:type ns8:decimal ;' +
                        '      rdf:value "' + score + '"^^xsd:decimal ;' +
                        '    ] ;' +
                        '.';
            default:
                break;
        }
    };

    return QuestionnairesRepository;
});