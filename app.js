require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var UserNameKey = 'UserName';
var UserWelcomedKey = 'UserWelcomed';
var Issuetypes = {
    Deals: 'Deals',
    Facility: 'Facility',
    Support: 'Contact Support',
    Casual: 'Fun with SGBot'
};


var bot = new builder.UniversalBot(connector,
    [
        function (session, result, next) {
            var userName = session.userData[UserNameKey];
            if (!session.privateConversationData[UserWelcomedKey]) {
                session.send('Bonjour, I am SGBot at your service');
                builder.Prompts.text(session, 'Before we get started , what should I call you ?');
            } else {
                next();
            }
        },
        function (session, result, next) {

            if (session.privateConversationData[UserWelcomedKey]) {
                session.send('Welcome Back %s!', session.userData[UserNameKey]);
            }
            else {
                session.userData[UserNameKey] = result.response;
                session.send('Welcome %s!', session.userData[UserNameKey]);
                session.privateConversationData[UserWelcomedKey] = true;
            }
            next();
        },
        function (session) {
            builder.Prompts.choice(
                session,
                'What is the issue you are dealing with ? \n',
                [Issuetypes.Deals, Issuetypes.Facility, Issuetypes.Support, Issuetypes.Casual],
                {
                    maxRetries: 3,
                    retryPrompt: 'Not a valid option'
                });
        },
        function (session, result) {
            if (!result.response) {
                // exhausted attemps and no selection, start over
                session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');
                return session.endDialog();
            }

            // continue on proper dialog
            var selection = result.response.entity;
            switch (selection) {
                case Issuetypes.Deals:
                    return session.beginDialog('deals');
                case Issuetypes.Facility:
                    return session.beginDialog('facility');
                case Issuetypes.Support:
                    return session.beginDialog('support');
                case Issuetypes.Casual:
                    return session.beginDialog('casual');
            }
        }
    ]);

bot.set('persistConversationData', true);

bot.dialog('deals', require('./deals'));
bot.dialog('facility', require('./facility'));
bot.dialog('casual', require('./casual'));
bot.dialog('support', require('./support'));


bot.dialog('reset', function (session) {
    delete session.userData[UserNameKey];
    delete session.privateConversationData[UserWelcomedKey];
    session.endDialog('Resetting data...');
}).triggerAction({ matches: /^reset/i });

bot.dialog('thank', function (session) {
    session.endDialog('My Pleasure...');
}).triggerAction({ matches: /.*thank*/i });

bot.dialog('ok', function (session) {
    session.endDialog('Hmmmm...');
}).triggerAction({ matches: /^ok$/i });

bot.dialog('hate', function (session) {
    session.endDialog('I am sorry, trying to be better...');
}).triggerAction({ matches: [/.*hate*/i,/.*retard*/i,/.*nut*/i,/.*stupid*/i]});

bot.dialog('nothing', function (session) {
    session.endDialog('oh ok great.. Hibernating in 3..2..1');
}).triggerAction({ matches: [/.*hate*/i,/.*retard*/i,/.*nut*/i]});

