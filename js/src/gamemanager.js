function GameManager()
{
    // Inherit from Observable class
    Observable.call(this);

    // Singleton
    if(GameManager.Instance !== null)
        return GameManager.Instance;

    GameManager.Instance = this;

    var _players = [];
    var _currentPlayerIdx;
    var _currentPlayer;
    var _cardsSelected = [];
    var _totalCardsOnTable = 0;
    var _cardsGuessed = 0;

    this.table = null;

    this.Play = function ()
    {
        try
        {
            _checkGridParams();
            _newGame.call(this);
        }
        catch(ex)
        {
            alert(ex.message);
        }
    };

    var _checkGridParams = function()
    {
        var WH = Globals.W * Globals.H;

        // It is mandatory that the total amount of cards is even!
        if(WH % 2 !== 0)
            throw new Error("Please choose W and H values such that their product is even.");
        // Two cards only? C'mon, have a little more fun!
        if(WH === 2)
            throw new Error("Two cards aren't so challenging for a memory game...\nPlease select at least four.");
    };

    this.setNoOfPlayers = function(noOfPlayers)
    {
        for(var i = 0; i < noOfPlayers; i++)
        {
            var p = new Player(i, noOfPlayers);
            _players.push(p);
        }
    };

    this.setPlayerName = function(playerIdx, playerName)
    {
        _players[playerIdx].setName(playerName);
    };

    // cardSelected is passed as argument if the animation event was raised by user clicking on a card
    // if null, the animation event was raised by something else (card being flipped back, table rotating etc.)
    this.onAnimationStart = function(cardSelected)
    {
        if(cardSelected &&  _cardsSelected.length < 2)
            _cardsSelected[_cardsSelected.length] = cardSelected;

        this.notify(new GameEvent(GameEvent.TYPE.ANIMATION_START));
    };

    this.onAnimationEnd = function()
    {
        if(_cardsSelected.length === 2)
        {
            _onCoupleSelected.call(this);
        }
        else
        {
            this.notify(new GameEvent(GameEvent.TYPE.ANIMATION_END));
        }
    };

    this.onChangeTurnEnd = function()
    {
        this.notify(new GameEvent(GameEvent.TYPE.CHANGE_TURN_END));
    };

    var _newGame = function()
    {
        Globals.GUI.close();

        _cleanFromOlderGame.call(this);

        this.table = new Table();
        _players = [];

        GameManager.Instance.setNoOfPlayers(Globals.NUM_PLAYERS);
        for(var i = 0; i < Globals.NUM_PLAYERS; i++)
        {
            GameManager.Instance.setPlayerName(i, Globals["Player " + (i + 1)]);
        }

        _setCurrentPlayer(0);

        var W = Globals.W;
        var H = Globals.H;

        _totalCardsOnTable = W * H;
        _cardsGuessed = 0;

        this.table.createDeck(H, W);
        this.notify(new GameEvent(GameEvent.TYPE.TABLE_READY_TO_PLAY));
    };

    var _cleanFromOlderGame = function()
    {
        this.subscribers = []; // remove all the all subscribers
        _cardsSelected = [];
        _currentPlayerIdx = -1; // -1 is needed for the first move, so that the table doesn't rotate at start

        if(this.table !== null)
            this.table.destroy(); // explicitly call the old table destructor so that it removes its graphics

        var stage = Globals.app.stage;
        while(stage.children.length > 1) // remove all remaining children (but the table sprite) from scene graph
        {
            stage.removeChild(stage.children[1]);
        }
    };

    var _onCoupleSelected = function()
    {
        var delayMillis = 500;

        if(!_cardsSelected[0].checkEquals(_cardsSelected[1]))
        {
            var card_1 = _cardsSelected[0];
            var card_2 = _cardsSelected[1];

            var that = this;

            setTimeout(function()
            {
                card_1.close();
                card_2.close();
                _setCurrentPlayer.call(that, (_currentPlayerIdx + 1) % _players.length);
            }, delayMillis);

        }
        else
        {
            this.notify(new GameEvent(GameEvent.TYPE.ANIMATION_END));
            _onCardsGuessed.call(this);
        }

        _cardsSelected = [];
    };

    var _onCardsGuessed = function()
    {
        _currentPlayer.scorePoints(2);
        _cardsGuessed += 2;
        if(_cardsGuessed === _totalCardsOnTable)
            _endGame.call(this);
    };

    var _setCurrentPlayer = function(playerIdx)
    {
        if(_currentPlayerIdx !== -1)
        {
            this.notify(new GameEvent(GameEvent.TYPE.CHANGE_TURN_START));
        }

        _currentPlayerIdx = playerIdx;
        _currentPlayer = _players[playerIdx];
    };

    var _endGame = function()
    {
        var winners = _checkWinner();
        var msgWinnersList = "";
        var msgListSeparator = "";
        var msgVerb = " wins";
        var msgScore = " with " + winners[0].getScore() + " points!";
        var finalMsg;

        if(winners.length > 1)
        {
            msgVerb = " win";
            msgListSeparator = ", ";
        }

        for(var i = 0; i < winners.length; i++)
        {
            msgWinnersList += winners[i].getName();

            if(i + 1 < winners.length)
                msgWinnersList += msgListSeparator;
        }

        finalMsg = msgWinnersList + msgVerb + msgScore;


        alert("Game Over!\n" + finalMsg);
        Globals.GUI.open();
    };

    var _checkWinner = function()
    {
        var maxScore = 0;
        var winnersList = [];

        for(var i = 0; i < _players.length; i++)
        {
            var player = _players[i];
            var score = player.getScore();

            if(score > maxScore)
            {
                maxScore = score;
                winnersList = [player];
            }
            else if(score === maxScore)
            {
                winnersList[winnersList.length] = player;
            }
        }

        return winnersList;
    };

    this.getCurrentPlayer = function()
    {
        return _currentPlayerIdx;
    }
}

GameManager.Instance = null;