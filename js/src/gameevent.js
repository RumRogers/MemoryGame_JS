function GameEvent(type)
{
    this.type = type;
}

GameEvent.TYPE =
    {
        "ANIMATION_START" : 0,
        "ANIMATION_END" : 1,
        "TABLE_READY_TO_PLAY" : 2,
        "CHANGE_TURN_START" : 3,
        "CHANGE_TURN_END" : 4
    };