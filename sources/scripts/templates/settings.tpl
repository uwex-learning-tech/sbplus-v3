<p><strong>Video and Audio Player</strong></p>
<form class="sbplus_settings">
    
    <div class="grid">
        
        <div class="row">
            <div class="label"><label for="autoplay">Auto play on start?</label></div>
            <div class="control"><input id="autoplay" type="checkbox" value="1" checked /></div>
        </div>
        
        <div class="row">
            <div class="label"><label for="volume">Default volume level</label></div>
            <div class="control"><input id="volume" type="number" value="0.8" /></div>
        </div>
        
        <div class="row">
            <div class="label"><label for="playback">Default playback rate</label></div>
            <div class="control">
                <select>
                    <option value=".5">0.5x</option>
                    <option value="1" selected>1</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
        </div>
        
        <div class="row">
            <div class="label"><label for="subtitle">Display subtitle?</label></div>
            <div class="control"><input id="subtitle" type="checkbox" value="0" /></div>
        </div>
        
    </div>
    
    <button id="saveSettingBtn">Save</button>
    
</form>