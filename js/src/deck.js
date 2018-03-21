function Deck(M, N)
{
    this.isValid = (M * N) % 2 === 0;

    // this should never happen because it's checked earlier, but just in case
    if(!this.isValid)
        throw "Error: the product of M and N must be an even number.";

    var _cards = [];

    var _init = function()
    {
        var availableCardSeeds = [];
        var totalCards = M * N;
        Card.TARGET_SIZE = _getCardTargetSize(M, N);

        for(var i = 0; i < totalCards; i += 2)
        {
            /* This will be called in 2 cases: at the first cycle (for sure)
               and in case W * H is bigger than twice the available cards (i.e. 81 * 2 = 162).
               If so, we will have to re-use the seeds, so we're going to have more than one possible pair of cards for those seeds
            */
            if(availableCardSeeds.length === 0)
                initAvailableSeeds();

            // choose a random seed from the list of still available seeds
            var randomSeed = _getRandomCardSeed(availableCardSeeds);
            // remove such seed from list
            var randomSeedIdx = availableCardSeeds.indexOf(randomSeed);
            availableCardSeeds.splice(randomSeedIdx, 1);

            _cards.push(new Card(randomSeed));
            _cards.push(new Card(randomSeed));
        }

        _shuffle(10);

        function initAvailableSeeds()
        {
            for(var i = 0; i < Globals.TOTAL_TYPES_OF_CARD_AVAILABLE; i++)
                availableCardSeeds.push(i);
        }
    };

    var _shuffle = function(howManyTimes)
    {
        if(howManyTimes === undefined)
            howManyTimes = 1;

        for(var times = 0; times < howManyTimes; times++)
        {
            for (var i = 0; i < _cards.length; i++)
            {
                swapCards(i, Math.floor(Math.random() * _cards.length));
            }
        }

        function swapCards(cardIdx_1, cardIdx_2)
        {
            var card_1 = _cards[cardIdx_1];
            var card_2 = _cards[cardIdx_2];

            var card_1_row = Math.floor(cardIdx_1 / N);
            var card_1_col = cardIdx_1 % N;
            var card_2_row = Math.floor(cardIdx_2 / N);
            var card_2_col = cardIdx_2 % N;

            _cards[cardIdx_1] = card_2;
            _cards[cardIdx_2] = card_1;

            card_2.setPosition(card_1_col * card_2.getWidth() + card_2.getWidth() / 2, card_1_row * card_2.getHeight() + card_2.getHeight() / 2);
            card_1.setPosition(card_2_col * card_1.getWidth() + card_1.getWidth() / 2, card_2_row * card_1.getHeight() + card_1.getHeight() / 2);
        }
    };

    var _getRandomCardSeed = function(availableSeeds)
    {
        return availableSeeds[Math.floor(Math.random() * availableSeeds.length)];
    };

    // Obtains width and height of a card, keeping original proportions, depending on how many cards to show on screen
    var _getCardTargetSize = function(M, N)
    {
        var overflowWidth = false;
        var overflowHeight = false;
        var width;
        var height;

        overflowWidth = N * Card.NATIVE_SIZE.width > Globals.SCREEN_WIDTH;
        overflowHeight = M * Card.NATIVE_SIZE.height > Globals.SCREEN_HEIGHT;

        // The cards won't fit the screen at their original size
        // Let's scale the cards so that all of them are visible on screen, keeping ratio between card width and height
        if(overflowWidth || overflowHeight)
        {
            ////
            width = Globals.SCREEN_WIDTH / N;
            height = width * (Card.NATIVE_SIZE.height / Card.NATIVE_SIZE.width);
            if(height * M > Globals.SCREEN_HEIGHT)
            {
                height = Globals.SCREEN_HEIGHT / M;
                width = height * (Card.NATIVE_SIZE.width / Card.NATIVE_SIZE.height);
            }

        }
        // This happens for very low W and H Grid params. We can have full res-cards!
        else
        {
            width = Card.NATIVE_SIZE.width;
            height = Card.NATIVE_SIZE.height;
        }

        return new PIXI.Point(width, height);
    };

    (function ()
    {
        _init();
    })();
}