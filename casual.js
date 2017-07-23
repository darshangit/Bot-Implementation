var builder = require('botbuilder');

var FunTypes = {
    FunnyGifs: 'Random funny gifs',
    Hotel: 'Search for a Hotel'
}
var bot = new builder.UniversalBot(connector,   function (session) {});
module.exports = [
    function (session) {
        builder.Prompts.choice(
            session,
            'How May I help you ? \n',
            [FunTypes.FunnyGifs, FunTypes.Hotel],
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

        var selection = result.response.entity;

        switch (selection) {
            case FunTypes.FunnyGifs:
                return session.beginDialog('gifs');
            case FunTypes.Hotel:
                  return session.send('hotels');
        }
    }
];

bot.dialog('gifs', function (session) {
    new builder.AnimationCard(session)
        .title('Funnt Gif')
        .subtitle('Stressbuster')
        .image(builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'))
        .media([
            { url: 'https://media.giphy.com/media/1aLFYfbItZcSk/giphy.gif' }
        ]);
        session.endDialog();
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
