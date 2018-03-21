function Card(valueId)
{
    // private fields

    // in JS this is unneeded because valueId is closed within the scope of the "class"
    // however, if I was using C++ or C# I'd use a private field to store the constructor parameter
    var _valueId = valueId;
    var _frontSprite;
    var _backSprite;
    var _valueSprite;
    var _state;
    var _that = this;

    // simulates class constructor
    function _init()
    {
        _backSprite = new PIXI.Sprite.fromFrame(Globals.loader.resources[Globals.IMAGES_FOLDER + Globals.CARD_BACK_FILENAME + Globals.IMAGES_EXTENSION].url);
        _backSprite.width = Card.TARGET_SIZE.x;
        _backSprite.height = Card.TARGET_SIZE.y;

        _backSprite.anchor.set(0.5, 0.5);
        _backSprite.x = Globals.SCREEN_WIDTH / 2;
        _backSprite.y = Globals.SCREEN_HEIGHT / 2;

        _frontSprite = new PIXI.Sprite.fromFrame(Globals.loader.resources[Globals.IMAGES_FOLDER + Globals.CARD_FRONT_FILENAME + Globals.IMAGES_EXTENSION].url);
        _frontSprite.width = _backSprite.width;
        _frontSprite.height = _backSprite.height;
        _frontSprite.anchor.set(0.5, 0.5);
        _frontSprite.scale.x = 0;
        _frontSprite.x = Globals.SCREEN_WIDTH / 2;
        _frontSprite.y = Globals.SCREEN_HEIGHT / 2;

        _valueSprite = new PIXI.Sprite.fromFrame(
            Globals.loader.resources
                [
            Globals.IMAGES_FOLDER +
            Globals.CARD_RES_PREFIX +
            valueId +
            Globals.IMAGES_EXTENSION
                ].url);

        _valueSprite.width = _backSprite.width;
        _valueSprite.height = _backSprite.height;
        _valueSprite.anchor.set(0.5, 0.5);
        _valueSprite.scale.set(0.1);
        _valueSprite.x = 0;
        _valueSprite.y = 0;

        _frontSprite.addChild(_valueSprite);
        _setInteractive(true);

        // pointerdown event also recognizes touches, so the game would work on mobile platforms!
        // if undesired, simply replace with "click"
        _backSprite.on("pointerdown", _open);

        GameManager.Instance.table.addCard(_backSprite, _frontSprite);

        _setState(Card.STATE.BACK);

        GameManager.Instance.subscribe(function(message)
        {
            switch (message.type)
            {
                case GameEvent.TYPE.ANIMATION_START:
                    _setInteractive(false);
                    break;
                case GameEvent.TYPE.ANIMATION_END:
                    _setInteractive(true);
                    break;
                default:
                    break;
            }
        });
    }

    var _setState = function(state)
    {
        _state = state;
    };

    // open doesn't need to be public, the card only opens when clicked
    var _open = function()
    {
        GameManager.Instance.onAnimationStart(_that);
        Globals.audioPlayer.playFX("flip");
        _flip();
    };

    var _flip = function()
    {
        // the flipping step must be proportional to the card's width:
        // if we have very small cards, we must flip them in the same time as if we had full-res cards
        const FLIPPING_STEP = _state === Card.STATE.FRONT ? _frontSprite.scale.x / 10 : _backSprite.scale.x / 10;
        Globals.app.ticker.add(flip);


        function flip(delta)
        {
            var card_1 = _state === Card.STATE.FRONT ? _frontSprite : _backSprite;
            var card_2 = card_1 === _backSprite ? _frontSprite : _backSprite;

            var currentCard = card_1;
            var multiplier = 1;
            if(card_1.scale.x <= 0)
            {
                card_1.scale.x = 0;
                currentCard = card_2;
                multiplier *= -1;
            }

            currentCard.scale.x -= FLIPPING_STEP * delta * multiplier;
            if(currentCard === card_2 && currentCard.width >= Card.TARGET_SIZE.x)
            {
                currentCard.width = Card.TARGET_SIZE.x;
                Globals.app.ticker.remove(flip);
                _state = _state === Card.STATE.BACK ? Card.STATE.FRONT : Card.STATE.BACK;
                GameManager.Instance.onAnimationEnd();
            }
        }
    };

    var _setInteractive = function(boolean)
    {
        _backSprite.interactive = boolean;
        _backSprite.buttonMode = boolean;
    };

    // close is public because it's called by the GameManager if two selected cards don't match
    this.close = function ()
    {
        GameManager.Instance.onAnimationStart(null);
        _flip();
    };

    this.getValueId = function()
    {
        return _valueId;
    };

    this.checkEquals = function (card)
    {
        return valueId === card.getValueId();
    };

    this.setPosition = function(x, y)
    {
        _backSprite.x = x;
        _backSprite.y = y;
        _frontSprite.x = x;
        _frontSprite.y = y;
    };

    this.getWidth = function ()
    {
        return _backSprite.width;
    };

    this.getHeight = function()
    {
        return _backSprite.height;
    };

    (function ()
    {
        _init();
    })();
}

// all these variables simulate static class members, shared by each instance
Card.STATE = { "BACK" : 0, "FRONT" : 1 }; // simulates enum
Card.NATIVE_SIZE = { "width" : 143, "height" : 200 };
Card.TARGET_SIZE = null;