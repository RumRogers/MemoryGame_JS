function initGUI()
{
    var GUI = new dat.GUI({ "autoPlace" : false });
    var folder = GUI.addFolder("Grid parameters");
    folder.open();
    folder.add(Globals, "W").min(1).step(1);
    folder.add(Globals, "H").min(1).step(1);
    folder = GUI.addFolder("Players");
    folder.add(Globals, "NUM_PLAYERS").min(1).step(1).max(4);
    folder.add(Globals, "Player 1");
    folder.add(Globals, "Player 2");
    folder.add(Globals, "Player 3");
    folder.add(Globals, "Player 4");
    folder.open();
    folder = GUI.addFolder("Sound");

    var musicBooleanController = folder.add(AudioPlayer, "Music enabled");
    musicBooleanController.onChange(function(value)
    {
        if(value)
        {
            Globals.audioPlayer.playMusic(Globals.BG_MUSIC_FILENAME);
        }
        else
        {
            Globals.audioPlayer.stopMusic();
        }
    });

    folder.add(AudioPlayer, "SFX enabled");

    var musicVolumeController = folder.add(AudioPlayer, "Music volume").min(0).max(1).step(0.01);
    musicVolumeController.onChange(function(value)
    {
        Globals.audioPlayer.setVolume(Globals.BG_MUSIC_FILENAME, value);
    });
    var fxVolumeController = folder.add(AudioPlayer, "SFX volume").min(0).max(1).step(0.01);
    fxVolumeController.onChange(function(value)
    {
        Globals.audioPlayer.setVolume(Globals.CARD_FLIP_SOUND_FILENAME, value);
    });

    GUI.add(new GameManager(), "Play");

    var w = GUI.width;

    var $guiContainer = $("#gui");
    $guiContainer.hide();
    $guiContainer.css(
        {
            "position" : "absolute",
            "left" : 0,
            "top" : 0,
            "width" : w
        });
    $guiContainer.append(GUI.domElement);

    Globals.GUI = GUI;
}