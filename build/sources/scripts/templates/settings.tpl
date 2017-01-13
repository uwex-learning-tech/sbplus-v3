<form class="settings">
    
    <p class="name">General</p>
    
    <div class="grid">
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_gs_widget">Hide Widget</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_gs_widget" value="0" />
            </div>
            
        </div>
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_gs_sidebar">Hide Sidebar</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_gs_sidebar" value="0" />
            </div>
            
        </div>
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_gs_it">Disable interactive transcript</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_gs_it" value="0" />
            </div>
            
        </div>
        
    </div>
    
    <p class="name">Video & Audio Player</p>
    
    <div class="grid">
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_va_autoplay" id="autoplay_label">Autoplay on start</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_va_autoplay" value="1" checked />
            </div>
            
        </div>
        
        <div class="row">
            
            <div class="label">
                <label for="sbplus_va_volume">Default volume level (%)</label>
            </div>
            
            <div class="control">
                <input type="number" id="sbplus_va_volume" min="0" max="100" value="80" />
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
                <label for="sbplus_va_subtitle">Always display subtitle</label>
            </div>
            
            <div class="control">
                <input type="checkbox" id="sbplus_va_subtitle" value="0" />
            </div>
            
        </div>
        
    </div>
    
</form>