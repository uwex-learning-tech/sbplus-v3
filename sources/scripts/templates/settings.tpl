<form class="settings">
    
    <!-- the visible "saved" pill is for sighted users; screen readers hear
         the always-present status line below it instead -->
    <div id="save_settings" aria-hidden="true"></div>
    <div id="save_settings_status" class="sr-only" role="status" aria-live="polite"></div>
    
    <h2 class="name" id="sbplus_settings_player">Video &amp; Audio Player</h2>
    
    <div class="grid" role="group" aria-labelledby="sbplus_settings_player">
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_va_autoplay" id="autoplay_label">Autoplay audio and video</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_va_autoplay" value="1" checked />
            </div>
            
        </div>
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_va_volume" id="volume_label">Default volume level</label>
            </div>
            
            <div class="control">
                <select id="sbplus_va_volume">
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                    <option value="30">30%</option>
                    <option value="40">40%</option>
                    <option value="50">50%</option>
                    <option value="60">60%</option>
                    <option value="70">70%</option>
                    <option value="80" selected>80%</option>
                    <option value="90">90%</option>
                    <option value="100">100%</option>
                </select>
            </div>
            
        </div>
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_va_playbackrate">Default playback rate</label>
            </div>
            
            <div class="control">
                <select id="sbplus_va_playbackrate">
                    <option value="0.5">0.5x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
            
        </div>
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_va_subtitle">Always display subtitles</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_va_subtitle" value="0" />
            </div>
            
        </div>
        
    </div>
    
</form>