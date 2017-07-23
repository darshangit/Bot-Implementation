var builder = require('botbuilder');

var FunTypes = {
    FunnyGifs: 'Random funny gifs',
    Hotel: 'Search for a Hotel',
    Weather: 'Weather',
    Lucky: 'Feeling Lucky'
};

module.exports = [
    function (session) {
        builder.Prompts.choice(
            session,
            'How May I be of service? \n ',
            [FunTypes.FunnyGifs,
            FunTypes.Hotel,
            FunTypes.Weather,
            FunTypes.Lucky],
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
                session.send(new builder.Message(session).addAttachment(new builder.AnimationCard(session).title('Laughter is the best medicine').subtitle('Stressbuster').image(builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png')).media([{ url: 'https://media.giphy.com/media/1aLFYfbItZcSk/giphy.gif' }])));
                return session.endDialog();
            case FunTypes.Hotel:
                return session.send('Dev in progress');
            case FunTypes.Weather:
                return session.send('Dev in progress');
            case FunTypes.Lucky:
                return session.send('Dev in progress');
        }
    }
];




