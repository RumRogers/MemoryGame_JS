$(function()
{
    (function initGlobals()
    {
        Globals.SCREEN_WIDTH = window.innerWidth;
        Globals.SCREEN_HEIGHT = window.innerHeight;
        Globals.app = new PIXI.Application(Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT, { backgroundColor: 0x000000 });
    })();

    (function loadResources()
    {
        Globals.audioPlayer = new AudioPlayer();
        var flipSoundFullPath = Globals.ASSETS_ROOT_FOLDER + Globals.AUDIO_FOLDER + Globals.CARD_FLIP_SOUND_FILENAME + Globals.AUDIO_EXTENSION;
        Globals.audioPlayer.loadAudioResource(flipSoundFullPath, Globals.CARD_FLIP_SOUND_FILENAME);
        var swishSoundFullPath = Globals.ASSETS_ROOT_FOLDER + Globals.AUDIO_FOLDER + Globals.SWISH_SOUND_FILENAME + Globals.AUDIO_EXTENSION;
        Globals.audioPlayer.loadAudioResource(swishSoundFullPath, Globals.SWISH_SOUND_FILENAME);
        var bgMusicFullPath = Globals.ASSETS_ROOT_FOLDER + Globals.AUDIO_FOLDER + Globals.BG_MUSIC_FILENAME + Globals.AUDIO_EXTENSION;
        Globals.audioPlayer.loadAudioResource(bgMusicFullPath, Globals.BG_MUSIC_FILENAME);

        Globals.loader = new PIXI.loaders.Loader(Globals.ASSETS_ROOT_FOLDER);

        console.log(Globals.IMAGES_FOLDER + Globals.TABLE_SPRITE_FILENAME + Globals.IMAGES_EXTENSION);
        Globals.loader.add(Globals.IMAGES_FOLDER + Globals.TABLE_SPRITE_FILENAME + Globals.IMAGES_EXTENSION);
        Globals.loader.add(Globals.IMAGES_FOLDER + Globals.CARD_BACK_FILENAME + Globals.IMAGES_EXTENSION);
        Globals.loader.add(Globals.IMAGES_FOLDER + Globals.CARD_FRONT_FILENAME + Globals.IMAGES_EXTENSION);

        for(var i = 0; i < Globals.TOTAL_TYPES_OF_CARD_AVAILABLE; i++)
        {
            Globals.loader.add(Globals.IMAGES_FOLDER + Globals.CARD_RES_PREFIX + i +  Globals.IMAGES_EXTENSION);
        }

        Globals.loader.once("complete", onLoadResources);

        Globals.loader.load();

        function onLoadResources()
        {
            Globals.audioPlayer.playMusic(Globals.BG_MUSIC_FILENAME);
            Table.initSprite();
            Player.initTextStyle();
            $("#gui").show();
        }
    })();

    initGUI();

    document.body.appendChild(Globals.app.view);
});