function Table()
{
    var _deck;
    var _textGraphicContainer = new PIXI.Container();
    var _cardsGraphicContainer = new PIXI.Container();
    var _rotating = false;

    (function init()
    {
        // Let's make sure the text graphic container has always the same size of the viewport
        var invisibleBg = new PIXI.Sprite(PIXI.Texture.WHITE);
        invisibleBg.alpha = 0;
        invisibleBg.width = Globals.SCREEN_WIDTH;
        invisibleBg.height = Globals.SCREEN_HEIGHT;
        invisibleBg.anchor.set(0.5, 0.5);
        invisibleBg.x = Globals.SCREEN_WIDTH / 2;
        invisibleBg.y = Globals.SCREEN_HEIGHT / 2;

        _textGraphicContainer.addChild(invisibleBg);
    })();

    this.addCard = function (cardGraphicsBack, cardGraphicsFront)
    {
        _cardsGraphicContainer.addChild(cardGraphicsBack);
        _cardsGraphicContainer.addChild(cardGraphicsFront);
    };

    this.addText = function (textGraphics)
    {
        _textGraphicContainer.addChild(textGraphics);
    };

    GameManager.Instance.subscribe(function(gameevent)
    {
        if(gameevent.type === GameEvent.TYPE.TABLE_READY_TO_PLAY)
        {
            Globals.app.stage.addChild(_cardsGraphicContainer);
            Globals.app.stage.addChild(_textGraphicContainer);
            
            _cardsGraphicContainer.pivot.x = Math.floor(_cardsGraphicContainer.width / 2);
            _cardsGraphicContainer.pivot.y = Math.floor(_cardsGraphicContainer.height / 2);

            _cardsGraphicContainer.x = Globals.SCREEN_WIDTH / 2;
            _cardsGraphicContainer.y = Globals.SCREEN_HEIGHT / 2;

            _textGraphicContainer.pivot.x = Math.floor(_textGraphicContainer.width / 2);
            _textGraphicContainer.pivot.y = Math.floor(_textGraphicContainer.height / 2);

            _textGraphicContainer.x = Globals.SCREEN_WIDTH / 2;
            _textGraphicContainer.y = Globals.SCREEN_HEIGHT / 2;

        }
    });


    this.rotateToPlayer = function (totalPlayers)
    {
        if(_rotating)
            return;

        _rotating = true;

        var playerIdx = GameManager.Instance.getCurrentPlayer();
        var stepDegs = 3;

        var degreesToRotate;

        switch (totalPlayers)
        {
            case 1:
                return;
            case 2:
                degreesToRotate = 180;
                stepDegs *= 2;
                break;
            case 3:
                if(playerIdx !== 0)
                {
                    degreesToRotate = 270;
                    stepDegs *= 3;
                }
                else
                {
                    degreesToRotate = 180;
                    stepDegs *= 2;
                }
                break;
            case 4:
                degreesToRotate = 270;
                stepDegs *= 3;
                break;
        }

        Globals.audioPlayer.playFX(Globals.SWISH_SOUND_FILENAME);
        _rotateDegrees(degreesToRotate, stepDegs);
    };

    var _rotateDegrees = function (degs, stepDegs)
    {
        var rads = degs * Math.PI / 180;
        var stepRads = stepDegs * Math.PI / 180;

        var targetRotation = _textGraphicContainer.rotation + rads;
        Globals.app.ticker.add(doRotate);

        function doRotate(delta)
        {
            GameManager.Instance.onAnimationStart(null);
            _textGraphicContainer.rotation = Math.min(_textGraphicContainer.rotation + stepRads * delta, targetRotation);
            if(_textGraphicContainer.rotation === targetRotation)
            {
                Globals.app.ticker.remove(doRotate);
                _rotating = false;
                GameManager.Instance.onAnimationEnd();
                GameManager.Instance.onChangeTurnEnd();
            }
        }

    };
    this.container = _textGraphicContainer;

    this.createDeck = function(M, N)
    {
        _deck = new Deck(M, N);
    };

    this.destroy = function()
    {
        while(_cardsGraphicContainer.children.length > 0)
        {
            _cardsGraphicContainer.removeChild(_cardsGraphicContainer.children[0]);
        }
    };
}

// The table sprite is pretty big, better store it once and for all in a static class variable
Table.sprite = null;
Table.initSprite = function()
{
    // If called more than once, do nothing (it's useless)
    if(Table.sprite === null)
    {
        Table.sprite = new PIXI.Sprite.fromFrame(Globals.loader.resources[Globals.IMAGES_FOLDER + Globals.TABLE_SPRITE_FILENAME + Globals.IMAGES_EXTENSION].url);
        Table.sprite.anchor.set(0.5, 0.5);
        Table.sprite.x = Globals.SCREEN_WIDTH / 2;
        Table.sprite.y = Globals.SCREEN_HEIGHT / 2;

        Globals.app.stage.addChildAt(Table.sprite, 0);
    }
};