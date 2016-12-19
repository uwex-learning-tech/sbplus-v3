var Page = function ( obj ) {
    
    this.title = obj.title;
    this.type = obj.type;
    this.src = obj.src;
    this.transition = obj.transition;
    this.notes = obj.notes;
    this.widget = obj.widget;
    this.isKaltura = false;
    this.mediaPlayer = null;
    this.video = null;
    this.transcript = null;
    
    this.root = SBPLUS.manifest.sbplus_root_directory;
    this.kaltura = {
        loaded: SBPLUS.kalturaLoaded,
        id: SBPLUS.manifest.sbplus_kaltura.id,
        flavors: {
            low: SBPLUS.manifest.sbplus_kaltura.low,
            normal: SBPLUS.manifest.sbplus_kaltura.normal,
            high: SBPLUS.manifest.sbplus_kaltura.high
        }
    };
    
    this.mediaContent = SBPLUS.layout.mediaContent;
    
};

Page.prototype.getPageMedia = function() {
    
    SBPLUS.externalContentLoaded = false;
    
    var self = this;
    
    switch ( self.type ) {
        
        case 'kaltura':
            
            if ( self.kaltura.loaded === false ) {
                
                $.when(
                    $.getScript( self.root + '/scripts/libs/kaltura/mwembedloader.js' ),
                    $.getScript( self.root +  '/scripts/libs/kaltura/kwidgetgetsources.js' ),
                    $.Deferred( function( deferred ) {
                        $( deferred.resolve );
                    } )
                ).done( function() {
                
                    SBPLUS.kalturaLoaded = true;
                    self.loadKalturaVideoData();
                
                } );
                
            } else {
                
                self.loadKalturaVideoData();
                
            }
            
        break;
        
        default:
        self.setWidgets();
        break;
        
    }
    
};

Page.prototype.loadKalturaVideoData = function () {
    
    var self = this;
    self.video = {
        
        flavors: {},
        status: {
            entry: 0,
            low: 0,
            normal: 0,
            high: 0
        },
        captionUrl: '',
        duration: ''
        
    };
    
    kWidget.getSources( {

        'partnerId': self.kaltura.id,
        'entryId': self.src,
        'callback': function( data ) {
            
            var captionId = data.captionId;
            var captionTrack = '';
            var html = '';
            
            self.video.status.entry = data.status;
            self.video.duration = data.duration;
            
            for( var i in data.sources ) {

                var source = data.sources[i];

                if ( source.flavorParamsId === self.kaltura.flavors.low ) {
                    
                    self.video.flavors.low = source.src;
                    self.video.status.low = source.status;

                }

                if ( source.flavorParamsId === self.kaltura.flavors.normal ) {

                    self.video.flavors.normal = source.src;
                    self.video.status.normal = source.status;

                }

                if ( source.flavorParamsId === self.kaltura.flavors.high ) {

                    self.video.flavors.high = source.src;
                    self.video.status.high = source.status;

                }

            }
            
            // entry video
            if ( self.video.status.entry >= 1 && self.video.status.entry <= 2 ) {
                
                // flavor videos
                if ( self.video.status.low === 2 && self.video.status.normal === 2 && self.video.status.high === 2 ) {
                
                    if ( captionId !== null ) {
                    
                        self.video.captionUrl = 'https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId=' + captionId + '&segmentDuration=' + self.video.duration + '&segmentIndex=1';
                        
                    }
                    
                }
                    
            }
            
            // inject HTML5 Video Tag
            if ( self.video.captionUrl.length > 0 ) {
                captionTrack = '<track kind="subtitles" label="English" srclang="en" src="' + self.video.captionUrl + '">';
            }
            
            html = '<video id="ap" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%" webkit-playsinline>'+captionTrack+'</video>';
        
            $( self.mediaContent ).html( html ).promise().done( function() {
                
                // call video js
                self.isKaltura = true;
                self.renderVideoJS();
                self.setWidgets();
                
            } );
            
        }

    } );
    
};

Page.prototype.renderVideoJS = function() {
    
    var self = this;
    var options = {
        
        techOrder: ["html5"],
        controls: true,
        autoplay: true,
        preload: "auto",
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
            fullscreenToggle: false
        }

    };
    
    if ( self.isKaltura ) {
        options.plugins = { videoJsResolutionSwitcher: { 'default': 720 } };
    }
    
    
    self.mediaPlayer = videojs( 'ap', options, function() {
        
        var player = this;
        
        if ( self.isKaltura ) {
            
            player.updateSrc( [
			
    			{ src: self.video.flavors.low, type: "video/mp4", label: "low", res: 360 },
    			{ src: self.video.flavors.normal, type: "video/mp4", label: "normal", res: 720 },
    			{ src: self.video.flavors.high, type: "video/mp4", label: "high", res: 1080 }
    			
    		] );
            
        }
            
    } );

}

Page.prototype.setWidgets = function() {
    
    SBPLUS.clearWidgetSegment();
    
    if ( this.type != 'quiz' ) {
        
        var segmentCount = 0;
        
        if ( !SBPLUS.isEmpty( this.notes ) ) {
            
            SBPLUS.addSegment( 'Notes' );
            segmentCount++;
            
        }
        
        if ( this.video !== null ) {
            
            if ( !SBPLUS.isEmpty( this.video.captionUrl ) ) {
            
                SBPLUS.addSegment( 'Live Transcript' );
                segmentCount++;
                
            }
            
        }
        
        if ( this.widget.length ) {
            
            segmentCount += this.widget.length;
            
        }
        
        if ( segmentCount >= 2 ) {
            SBPLUS.showWidgetSegment();
            SBPLUS.selectFirstSegment();
        } else {
            SBPLUS.hideWidgetSegment();
        }
        
    }
    
}

Page.prototype.getWidgetContent = function( id ) {
    
    var self = this;
    
    switch( id ) {
        
        case 'sbplus_notes':
        
            $( SBPLUS.widget.content ).html( this.notes );
            
        break;
        
        case 'sbplus_livetranscript':
            if ( !SBPLUS.isEmpty( this.video.captionUrl ) ) {
                
                if ( SBPLUS.externalContentLoaded === false ) {
                    
                    $.get( this.video.captionUrl, function( data ) {
                        SBPLUS.externalContentLoaded = true;
                        self.transcript = data;
                        $( SBPLUS.widget.content ).html( data );
                    } );
                    
                } else {
                    $( SBPLUS.widget.content ).html( self.transcript );
                }
                
            }
        break;
        
    }
    
}