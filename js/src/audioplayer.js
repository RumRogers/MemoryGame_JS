function AudioPlayer()
{
    this.audioResources = {}; // Hashmap audioId->audioResource

    var _currentFX;
    var _bgMusic;

    this.playFX = function(audioResId)
    {
        if(!AudioPlayer["SFX enabled"])
            return;

        if(_currentFX)
            _stopAudio(_currentFX);
        _currentFX = this.audioResources[audioResId];
        _currentFX.volume = AudioPlayer["SFX volume"];
        _currentFX.play();
    };

    this.playMusic = function(audioResId)
    {
        if(_bgMusic)
            _stopAudio(_bgMusic);
        _bgMusic = this.audioResources[audioResId];
        _bgMusic.volume = AudioPlayer["Music volume"];
        _bgMusic.loop = true;
        _bgMusic.play();
    };

    this.stopMusic = function()
    {
        if(_bgMusic)
            _stopAudio(_bgMusic);
    };

    this.loadAudioResource = function(audioPath, resourceId)
    {
        this.audioResources[resourceId] = new Audio(audioPath); // HTML5 Audio element
    };

    this.setVolume = function(resourceId, volume)
    {
        var audioRes = this.audioResources[resourceId];

        if(audioRes)
        {
            audioRes.volume = volume;
        }
    };

    function _stopAudio(audioRes)
    {
        audioRes.pause();
        audioRes.currentTime = 0;
    }
}

// The object keys contain spaces due to the direct binding with dat.gui.js
// The keys are going to be shown on the GUI as they are declared here.
// We want exactly this text to appear to the user, not MusicEnabled or Music_Enabled or similar text.
AudioPlayer["Music enabled"] = true;
AudioPlayer["SFX enabled"] = true;
AudioPlayer["Music volume"] = 0.5;
AudioPlayer["SFX volume"] = 1;