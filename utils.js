const https = require('https');
const { parse } = require('path');
// const sampleData = require('./form_submissions_sample_data.json');

const API_KEY = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';

const getHttpRequestOptions = (path,queries) => {
    // API URL example: https://api.fillout.com/v1/api/forms/cLZojxk94ous/submissions
    // TODO: followAllRedirects: true
    return {
        host: 'api.fillout.com',
        path: path,
        query: queries,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    };
};

exports.compareValues = (condition, valueA, valueB) => {
    let isMatched = true;

    switch (condition) {
        case 'equals':
            isMatched = valueA == valueB;
            break;
        case 'does_not_equal':
            isMatched = valueA != valueB;
            break;
        case 'greater_than':
            isMatched = valueA > valueB;
            break;
        case 'less_than':
            isMatched = valueA < valueB;
            break;
        default:;
    }

    return isMatched;
};

// Filter the responses.
exports.filterResponses = (data, filtersJason) => {
    if (data && data['responses'] && (filtersJason 
    
        )) {
        const filteredResponses = [];
        for (let responseItem of data['responses']) {
            // Get the list of questions and convert it to a map.
            const questionsList = responseItem['questions'];
            const questionsMap = {};
            for (let questionsItem of questionsList) {
                questionsMap[questionsItem['id']] = questionsItem;
            }

            // Filter the questions.
            let isQuestionMatched = true;
            for (let filter of filtersJason) {
                const questionItem = questionsMap[filter['id']];
                if (questionItem) {
                    isQuestionMatched = this.compareValues(filter['condition'], questionItem['value'], filter['value']);
                    if (!isQuestionMatched) {
                        break;
                    }
                }
            }
            if (isQuestionMatched) {
                filteredResponses.push(responseItem);
            }
        }
        


        data['responses'] = filteredResponses;
        data['totalResponses'] = filteredResponses.length;

    }






    return data;
};

exports.getFilteredFilloutFormResponses = (formId, filtersJason, queries) => {

    const httpGetOptions = getHttpRequestOptions(`/v1/api/forms/${formId}/submissions`,queries);

    return new Promise((resolve) => {
        let data = '';
    
        // Fetch data from fillout.com API.
        const request = https.get(httpGetOptions, (response) => {
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                let filteredData = {};
                if (data) {
                    filteredData = this.filterResponses(JSON.parse(data), filtersJason, );
                    if (!queries.limit){
                        queries.limit=150
                    }
                       filteredData['pageCount']= Math.ceil((filteredData.responses).length/queries.limit)
                }
                resolve(filteredData);
            });
        });
    
        request.on('error', (error) => {
            console.error(error);
            rejects(error);
        });
    
        request.end();
    });
};