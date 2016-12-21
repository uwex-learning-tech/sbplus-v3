var Page = function ( obj ) {
    
    this.title = obj.title;
    this.type = obj.type;
    this.src = obj.src;
    this.transition = obj.transition;
    this.notes = obj.notes;
    this.widget = obj.widget;
    this.imgType = obj.imageFormat;

    this.isKaltura = false;
    this.isAudio = false;
    this.mediaPlayer = null;
    this.video = null;
    this.transcript = null;
    this.hasImage = false;
    
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
    this.mediaError = SBPLUS.layout.mediaError;
    
    if ( $( '#ap' ).length ) {
        videojs( 'ap' ).dispose();
    }
    
};

Page.prototype.getPageMedia = function() {
    
    var self = this;
    
    $( this.mediaError ).empty();
    
    SBPLUS.externalContentLoaded = false;
    
    switch ( self.type ) {
        
        case 'kaltura':
            
            if ( self.kaltura.loaded === false ) {
                
                $.getScript( self.root + '/scripts/libs/kaltura/mwembedloader.js', function() {
                    
                    $.getScript( self.root +  '/scripts/libs/kaltura/kwidgetgetsources.js', function() {
                        
                        SBPLUS.kalturaLoaded = true;
                        self.loadKalturaVideoData();
                        
                    } );
                    
                } );
                
            } else {
                
                self.loadKalturaVideoData();
                
            }
            
        break;
        
        case 'image-audio':
            
            self.isAudio = true;
            var caption = '';
            
            $.get( 'assets/pages/' + self.src + '.' + self.imgType, function() {
                self.hasImage = true;
            } ).fail( function() {
                self.showPageError( 'NO_IMG' );
            } ).always( function() {
                
                $.get( 'assets/audio/' + self.src + '.vtt', function() {
                    caption = '<track kind="subtitles" label="English" srclang="en" src="' + this.url + '" />';
                } ).fail( function() { 
                    caption = '';
                } ).always( function() {
                    
                    var html = '<video id="ap" class="video-js vjs-default-skin" webkit-playsinline>' + caption + '</video>';
                    
                    $( self.mediaContent ).html( html ).promise().done( function() {
                
                        self.renderVideoJS();
                
                    } );
                
                } );
                
                self.setWidgets();
                
            } );
            
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
                    
                    // inject HTML5 Video Tag
                    if ( self.video.captionUrl.length > 0 ) {
                        captionTrack = '<track kind="subtitles" label="English" srclang="en" src="' + self.video.captionUrl + '">';
                    }
                    
                    html = '<video id="ap" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%" webkit-playsinline>'+captionTrack+'</video>';
                
                    $( self.mediaContent ).html( html ).promise().done( function() {
                        
                        // call video js
                        self.isKaltura = true;
                        self.renderVideoJS();
                        
                    } );
                    
                    
                } else {
                    self.showPageError( 'KAL_NOT_READY' );
                }
                    
            } else {
                self.showPageError( 'KAL_ENTRY_NOT_READY' );
            }
            
            self.setWidgets();
            
        }

    } );
    
};

Page.prototype.renderVideoJS = function() {
    
    var self = this;
    var plugins = null;
    var options = {
        
        techOrder: ["html5"],
        controls: true,
        autoplay: true,
        preload: "auto",
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
            fullscreenToggle: false
        },
        plugins: {
            replayButton: {}
        }

    };
    
    if ( self.isKaltura ) {
        options.plugins = Object.assign( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );
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
        
        if ( self.isAudio ) {
            
            if ( self.hasImage ) {
                player.poster( 'assets/pages/' + self.src + '.' + self.imgType );
            }
            
            player.src( { type: 'audio/mp3', src: 'assets/audio/' + self.src + '.mp3' } );
            
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
        } else {
            SBPLUS.hideWidgetSegment();
        }
        
        SBPLUS.selectFirstSegment();
        
    }
    
}

Page.prototype.getWidgetContent = function( id ) {
    
    var self = this;
    
    switch( id ) {
        
        case 'sbplus_notes':
        
            $( SBPLUS.widget.content ).html( this.notes ).addClass( 'fadeIn' )
                .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                    function() {
                        $( this ).removeClass( 'fadeIn' ).off();
                    }
             );
            
        break;
        
        case 'sbplus_livetranscript':
            if ( !SBPLUS.isEmpty( this.video.captionUrl ) ) {
                
                if ( SBPLUS.externalContentLoaded === false ) {
                    
                    $.get( this.video.captionUrl, function( data ) {
                        SBPLUS.externalContentLoaded = true;
                        self.transcript = data;
                        $( SBPLUS.widget.content ).html( data ).addClass( 'fadeIn' )
                            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                                function() {
                                    $( this ).removeClass( 'fadeIn' ).off();
                                }
                            );
                    } );
                    
                } else {
                    $( SBPLUS.widget.content ).html( self.transcript )
                        .addClass( 'fadeIn' ).one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                        function() {
                            $( this ).removeClass( 'fadeIn' ).off();
                        }
                     );
                }
                
            }
        break;
        
    }
    
}

Page.prototype.showPageError = function( type ) {
    
    var self = this;
    
    var msg = '';
    
    switch ( type ) {
                
        case 'NO_IMG':
        
            msg = '<p>The image for this Storybook Page could not be loaded. Please try refreshing your browser. Contact support if you continue to have issues.</p>';

        break;
        
        case 'KAL_NOT_READY':
            msg = '<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID  ' + self.src + '<br><strong>Status</strong>:<br>';
            
            msg += 'Low &mdash; ' + getKalturaStatus( self.video.status.low ) + '<br>';
            msg += 'Normal &mdash; ' + getKalturaStatus( self.video.status.normal ) + '<br>';
            msg += 'High &mdash; ' + getKalturaStatus( self.video.status.high ) + '</p>';
            
        break;
        
        case 'KAL_ENTRY_NOT_READY':
            msg = '<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID ' + self.src + '<br><strong>Status</strong>: ';
            
            msg += getEntryKalturaStatus( self.video.status.entry ) + '</p>';
            
        break;
        
    }
    
    $( self.mediaError ).html( msg );
    
}

function getKalturaStatus( code ) {
    var msg = '';
    switch( code ) {
        case -1:
        msg = 'ERROR';
        break;
        case 0:
        msg = 'QUEUED (queued for conversion)';
        break;
        case 1:
        msg = 'CONVERTING';
        break;
        case 2:
        msg = 'READY';
        break;
        case 3:
        msg = 'DELETED';
        break;
        case 4:
        msg = 'NOT APPLICABLE';
        break;
        default:
        msg = 'UNKNOWN ERROR (check main entry)';
        break;
        
    }
    return msg;
}

function getEntryKalturaStatus( code ) {
    var msg = '';
    switch( code ) {
        case -2:
        msg = 'ERROR IMPORTING';
        break;
        case -1:
        msg = 'ERROR CONVERTING';
        break;
        case 0:
        msg = 'IMPORTING';
        break;
        case 1:
        msg = 'PRECONVERT';
        break;
        case 2:
        msg = 'READY';
        break;
        case 3:
        msg = 'DELETED';
        break;
        case 4:
        msg = 'PENDING MODERATION';
        break;
        case 5:
        msg = 'MODERATE';
        break;
        case 6:
        msg = 'BLOCKED';
        break;
        default:
        msg = 'UNKNOWN ERROR (check entry ID)';
        break;
        
    }
    return msg;
}