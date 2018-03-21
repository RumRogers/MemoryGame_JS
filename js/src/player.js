function Player(playerIdx, totalPlayers)
{
    var _name = "";
    var _score = 0;
    var _sprites = null;
    var _locationOnScreen = -1;
    var translationVector = null;

    var _init = function()
    {
        _sprites = Player.createSprites(playerIdx, _name, totalPlayers);
        translationVector = Player.getTranslationVector(playerIdx, totalPlayers);
        _locationOnScreen = Player.getInitialLocationOnScreen(playerIdx, totalPlayers);

        GameManager.Instance.table.addText(_sprites.bg);
        GameManager.Instance.table.addText(_sprites.text);

        GameManager.Instance.subscribe(_changeTurnStart);
        GameManager.Instance.subscribe(_changeTurnEnd);
    };


    var _changeTurnStart = function(gameevent)
    {
        if(gameevent.type === GameEvent.TYPE.CHANGE_TURN_START)
        {
            _moveLabelTowardsCenter(_locationOnScreen);
            _locationOnScreen = Player.getNextLocationOnScreen(_locationOnScreen, totalPlayers);
        }
    };

    var _changeTurnEnd = function(gameevent)
    {
        if(gameevent.type === GameEvent.TYPE.CHANGE_TURN_END)
        {
            _moveLabelTowardsEdge(_locationOnScreen);
            _sprites.text.scale.x = _sprites.text.scale.y = Player.getSpriteScale(_locationOnScreen, playerIdx, totalPlayers);
        }
    };

    var _translateSprite = function(vector, callback)
    {
        var targetLocation = new PIXI.Point(_sprites.text.x + vector.x, _sprites.text.y + vector.y);
        var vectorMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        var step = 0.05;
        var translationSoFar = 0;

        GameManager.Instance.onAnimationStart(null);
        Globals.app.ticker.add(animateTranslation);

        function animateTranslation(delta)
        {
            var T = new PIXI.Point(vector.x * step * delta, vector.y * step * delta);
            _sprites.text.x += T.x;
            _sprites.text.y += T.y;
            _sprites.bg.x += T.x;
            _sprites.bg.y += T.y;
            translationSoFar += Math.sqrt(T.x * T.x + T.y * T.y);

            if(translationSoFar >= vectorMagnitude)
            {
                _sprites.text.x = targetLocation.x;
                _sprites.text.y = targetLocation.y;
                _sprites.bg.x = targetLocation.x;
                _sprites.bg.y = targetLocation.y;

                Globals.app.ticker.remove(animateTranslation);
                if(callback)
                    callback();
            }
        }
    };

    var _moveLabelTowardsCenter = function(loc)
    {
        var T;
        var translationCallback = function()
        {
            GameManager.Instance.table.rotateToPlayer(totalPlayers, playerIdx, _name);
        };

        if(loc === Player.LOCATION.WEST || loc === Player.LOCATION.EAST)
            T = new PIXI.Point(-translationVector.x, -translationVector.y);
        else
        {
            T = new PIXI.Point(0, 0);
            if(totalPlayers > 2)
                translationCallback = null;
        }
        _translateSprite(T, translationCallback);
    };

    var _moveLabelTowardsEdge = function(loc)
    {
        var T;
        var translationCallback = function()
        {
            GameManager.Instance.onAnimationEnd();
        };

        if(loc === Player.LOCATION.WEST || loc === Player.LOCATION.EAST)
            T = new PIXI.Point(translationVector.x, translationVector.y);
        else
        {
            T = new PIXI.Point(0, 0);
            if(totalPlayers > 2)
                translationCallback = null;
        }

        _translateSprite(T, translationCallback);
    };

    this.setName = function (name)
    {
        _name = name;
        _init();
    };

    this.getName = function()
    {
        return _name;
    };

    this.scorePoints = function(points)
    {
        _score += points;
    };

    this.getScore = function ()
    {
        return _score;
    };
}

Player.textStyle = null;
Player.initTextStyle = function ()
{
    if(Player.textStyle === null)
    {
        Player.textStyle = new PIXI.TextStyle(
            {
                fontFamily: 'Arial',
                fontSize: 15,
                fontWeight: 'bold',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 1,
                dropShadowColor: '#000000',
                dropShadowBlur: 1
            });
    }
};

Player.LOCATION = { "SOUTH" : 0, "WEST" : 1, "NORTH" : 2, "EAST" : 3 };

// Simple struct to store both sprites for player
function PlayerSprites(text, bg)
{
    this.text = text;
    this.bg = bg;
}

// All the following are helper functions to get correct sprites and positions/rotations on screen
// They could have been included as instance methods as well, but I decided to move all the
// necessary hard-coded geometric stuff in static functions, in favor of a cleaner and
// more readable instance code
Player.createSprites = function(playerIdx, playerName, totalPlayers)
{
    const BG_MARGIN = 10;
    var xPos;
    var yPos;
    var rot;

    var textLabel = new PIXI.Text(playerName, Player.textStyle);
    textLabel.anchor.set(0.5, 0.5);

    if(playerIdx === 0)
    {
        xPos = Globals.SCREEN_WIDTH / 2;
        yPos = Globals.SCREEN_HEIGHT - textLabel.height / 2 - BG_MARGIN / 2;
        rot = 0;
    }
    else if(playerIdx === 1 && totalPlayers > 2)
    {
        xPos = textLabel.height / 2 + BG_MARGIN / 2;
        yPos = Globals.SCREEN_HEIGHT / 2;
        rot = 90;
    }
    else if((playerIdx === 1 && totalPlayers === 2) || (playerIdx === 2))
    {
        xPos = Globals.SCREEN_WIDTH / 2;
        yPos = textLabel.height / 2 + BG_MARGIN / 2;
        rot = 0;
    }
    else
    {
        xPos = Globals.SCREEN_WIDTH - textLabel.height / 2 - BG_MARGIN / 2;
        yPos = Globals.SCREEN_HEIGHT / 2;
        rot = -90;
    }

    textLabel.x = xPos;
    textLabel.y = yPos;
    textLabel.rotation = rot * Math.PI / 180;

    var textLabelBG = new PIXI.Sprite(PIXI.Texture.WHITE);
    textLabelBG.anchor.set(0.5, 0.5);
    textLabelBG.alpha = 0.7;
    textLabelBG.tint = 0x000000;
    textLabelBG.width = textLabel.width + BG_MARGIN;
    textLabelBG.height = textLabel.height + BG_MARGIN;

    textLabelBG.rotation = rot * Math.PI / 180;
    textLabelBG.x = textLabel.x;
    textLabelBG.y = textLabel.y;

    return new PlayerSprites(textLabel, textLabelBG);
};

Player.getNextLocationOnScreen = function(playerLocation, totalPlayers)
{
    const MAX_PLAYERS = 4;

    switch (totalPlayers)
    {
        case 1:
            return playerLocation;
        case 2:
            return (playerLocation + 2) % MAX_PLAYERS;
        case 3:
            if(GameManager.Instance.getCurrentPlayer() === 2)
                return (playerLocation + 2) % MAX_PLAYERS;
            return (playerLocation + 3) % MAX_PLAYERS;
        case 4:
            return (playerLocation + 3) % MAX_PLAYERS;
    }
};

Player.getSpriteScale = function (playerLocation, playerIdx, totalPlayers)
{
    // Some ifs are redundant but it's more readable this way
    switch (totalPlayers)
    {
        case 1:
            return 1;
        case 2:
            if(playerLocation === Player.LOCATION.NORTH)
            {
                if(playerIdx === 0)
                    return -1;
                return 1;
            }
            if(playerIdx === 0)
                return 1;
            return -1;
        case 3:
            if(playerIdx === 0)
            {
                if(playerLocation === Player.LOCATION.SOUTH || playerLocation === Player.LOCATION.EAST)
                    return 1;
                if(playerLocation === Player.LOCATION.NORTH)
                    return -1;
            }
            if(playerIdx === 1)
            {
                return 1;
            }
            if(playerIdx === 2)
            {
                if(playerLocation === Player.LOCATION.SOUTH  || playerLocation === Player.LOCATION.WEST)
                    return -1;
                if(playerLocation === Player.LOCATION.NORTH)
                    return 1;
            }
        case 4:
            if(playerIdx === 0 || playerIdx === 1)
            {
                if(playerLocation === Player.LOCATION.NORTH)
                    return -1;
                return 1;
            }
            if(playerIdx === 2)
            {
                if(playerLocation === Player.LOCATION.NORTH)
                    return 1;
                return -1;
            }
            if(playerIdx === 3)
            {
                if(playerLocation === Player.LOCATION.NORTH)
                    return -1;
                return 1;
            }
    }
};

// A note about getTranslactionVector and getInitialLocationOnScreen:
// they both have the same if-chain and could be merged to avoid code repetition.
// However they have a very different purpose and, for a matter of personal taste,
// I decided to isolate the two purposes in two different functions
// in spite of the if-chain repetition
Player.getTranslationVector = function(playerIdx, totalPlayers)
{
    var radius = Math.min(Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT) / 2;
    var offsetFromCircle = Globals.SCREEN_WIDTH / 2 - radius;

    if(playerIdx === 0)
    {
        return new PIXI.Point(0, offsetFromCircle);
    }
    if(playerIdx === 1 && totalPlayers > 2)
    {
        return new PIXI.Point(-offsetFromCircle, 0);
    }
    if((playerIdx === 1 && totalPlayers === 2) || (playerIdx === 2))
    {
        return new PIXI.Point(0, -offsetFromCircle);

    }
    return new PIXI.Point(offsetFromCircle, 0);
};

Player.getInitialLocationOnScreen = function(playerIdx, totalPlayers)
{
    if(playerIdx === 0)
    {
        return Player.LOCATION.SOUTH;
    }
    if(playerIdx === 1 && totalPlayers > 2)
    {
        return Player.LOCATION.WEST;
    }
    if((playerIdx === 1 && totalPlayers === 2) || (playerIdx === 2))
    {
        return Player.LOCATION.NORTH;

    }
    return Player.LOCATION.EAST;
};