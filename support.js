var builder = require('botbuilder');

var dealId;
var facilityId;

module.exports = [

    function(session){
        builder.Prompts.text('Do you have a dealId? yes or no ?')
    },
    function(session,result){
        var dealresponse = result.response;
        
        if(dealresponse == 'yes'){
            builder.Prompts.text('Please provide the deal number');
        }
        if(dealresponse == 'no'){

        }
    }

]