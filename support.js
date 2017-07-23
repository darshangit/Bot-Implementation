var builder = require('botbuilder');
var restify = require('restify');
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });

var dealId;
var facilityId;
var comments;
var attachment = false;
var UserNameKey = 'UserName';
var UserAttachment= 'Attachment';

module.exports = [
    function (session) {
        builder.Prompts.text(session,'Please enter the Deal ID if known, else enter NO');
    },
    function (session, result) {
        dealId = result.response;
        builder.Prompts.text(session,'Please enter the Facility ID if known, else enter NO');
    },
    function (session, result) {
        facilityId = result.response;
        builder.Prompts.text(session,'Please add any attachments if you have, else enter NO');
    },
    function (session,result,next) {
        var msg = session.message;
        if (msg.attachments.length) {
            var attachment = msg.attachments[0];
            var fileDownload = checkRequiresToken(msg)
                ? requestWithToken(attachment.contentUrl)
                : request(attachment.contentUrl);

            fileDownload.then(
                function (response) {
                    var reply = new builder.Message(session)
                        .text('Attachment of %s type and size of %s bytes received.', attachment.contentType, response.length);
                    session.send(reply);
                    session.userData[UserAttachment] = 'Yes';
                    next();
                }).catch(function (err) {
                    console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
                });
        }else{
             var reply = new builder.Message(session)
            .text('No Attachements');
            session.send(reply);
            session.userData[UserAttachment] = 'No'
            next();
        }
    },
    function(session){
        builder.Prompts.text(session,'Please add any comments if you have');
   },
    function (session, result,next) {
        comments = result.response;
        session.send('Your Ticket Details are as follows: \n * Deal ID: '+dealId+' \n * Facility ID: '+facilityId+' \n * Comments: '+comments+' \n * Attachments Present: '+session.userData[UserAttachment]);
        session.send('Generating Ticket...');
        next();
    },
    function (session, result) {
        // Generate ticket
        var tickerNumber = Math.ceil(Math.random() * 20000);
        session.send("Ticket generated with Ticket Number : %s",tickerNumber);
        var userName = session.userData[UserNameKey];
        session.send(userName+", Thank you for contacting Support, we will get back to you at the earliest");
        session.endDialog();
    }
];

var requestWithToken = function (url) {
    return obtainToken().then(function (token) {
        return request({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/octet-stream'
            }
        });
    });
};

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Promise for obtaining JWT Token (requested once)
var obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

var checkRequiresToken = function (message) {
    return message.source === 'skype' || message.source === 'msteams';
};
