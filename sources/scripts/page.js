var transcriptInterval = null;
var Page = function ( obj ) {
    
    this.title = obj.title;
    this.type = obj.type;
    this.transition = obj.transition;
    this.pageNumber = obj.number;
    
    if ( obj.type === 'quiz' ) {
        
        this.quiz = obj.quiz;
        
    } else {
        
        this.src = obj.src;
        this.notes = obj.notes;
        this.widget = obj.widget;
        this.widgetSegments = {};
        this.imgType = obj.imageFormat;
        
        if ( obj.frames.length ) {
            this.frames = obj.frames;
            this.cuepoints = [];
        }
        
        this.mediaPlayer = null;
        this.isKaltura = null;
        this.isAudio = false;
        this.isVideo = false;
        this.isYoutube = false;
        this.isVimeo = false;
        this.isBundle = false;
        this.isPlaying = false;
        this.captionUrl = '';
        
        this.transcript = null;
        this.transcriptLoaded = false;
        this.transcriptIntervalStarted = false;
        
        this.hasImage = false;
        this.delayStorage = null;
        
    }
    
    this.root = SBPLUS.manifest.sbplus_root_directory;
    this.kaltura = {
        id: SBPLUS.manifest.sbplus_kaltura.id,
        flavors: {
            low: SBPLUS.manifest.sbplus_kaltura.low,
            normal: SBPLUS.manifest.sbplus_kaltura.normal,
            medium: SBPLUS.manifest.sbplus_kaltura.medium
        }
    };
    
    this.leftCol = SBPLUS.layout.leftCol;
    this.mediaContent = SBPLUS.layout.mediaContent;
    this.quizContainer = SBPLUS.layout.quizContainer;
    this.mediaError = SBPLUS.layout.mediaError;
    
};

Page.prototype.getPageMedia = function() {
    
    var self = this;
    
    // reset
    if ( $( SBPLUS.layout.quizContainer ).length ) {
        $( SBPLUS.layout.quizContainer ).remove();
    }
    
    $( this.mediaError ).empty().hide();
    
    if ( $( '#mp' ).length ) {
        videojs( 'mp' ).dispose();
    }
    
    if ( SBPLUS.hasStorageItem( 'sbplus-previously-widget-open', true ) ) {
        
        if ( SBPLUS.getStorageItem( 'sbplus-previously-widget-open', true ) === '1' ) {
            
            SBPLUS.showWidget();
            
        }
        
        SBPLUS.enableWidget();
        SBPLUS.deleteStorageItem( 'sbplus-previously-widget-open', true );
        
    }
    
    clearInterval( transcriptInterval );
    // end reset
    
    switch ( self.type ) {
        
        case 'kaltura':
            
            if ( SBPLUS.hasStorageItem( 'sbplus-kaltura-loaded', true) === false ) {
                
                $.getScript( self.root + '/scripts/libs/kaltura/mwembedloader.js', function() {
                    
                    $.getScript( self.root +  '/scripts/libs/kaltura/kwidgetgetsources.js', function() {
                        
                        SBPLUS.setStorageItem( 'sbplus-kaltura-loaded', 1, true);
                        self.loadKalturaVideoData();
                        
                    } );
                    
                } );
                
            } else {
                
                self.loadKalturaVideoData();
                
            }
            
        break;
        
        case 'image-audio':
            
            self.isAudio = true;
            
            $.get( 'assets/pages/' + self.src + '.' + self.imgType, function() {
                self.hasImage = true;
            } ).fail( function() {
                self.showPageError( 'NO_IMG', this.url );
            } ).always( function() {
                
                $.get( 'assets/audio/' + self.src + '.vtt', function( data ) {
                    self.captionUrl = this.url;
                    self.transcript = SBPLUS.stripScript( data );
                } ).always( function() {
                    
                    var html = '<video id="mp" class="video-js vjs-default-skin" webkit-playsinline playsinline></video>';
                    
                    $( self.mediaContent ).html( html ).promise().done( function() {
                
                        self.renderVideoJS();
                        self.setWidgets();
                
                    } );
                
                } );
                
            } );
            
        break;
        
        case 'image':
            
            var img = new Image();
            img.src = 'assets/pages/' + self.src + '.' + self.imgType;
            img.alt = self.title;
            img.className = 'img_only';
            
            $( img ).on( 'load', function() {
                self.hasImage = true;
                
                $( self.mediaContent ).html( img ).promise().done( function() {
                    self.setWidgets();
                } );
            } );
            
            $( img ).on( 'error', function() {
                self.hasImage = false;
                self.showPageError( 'NO_IMG', img.src );
            } );
            
        break;
        
        case 'video':
            
            $.get( 'assets/video/' + self.src + '.vtt', function( data ) {
                
                self.captionUrl = this.url;
                self.transcript = SBPLUS.stripScript( data );
                
            }).always( function() {
                
                var html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%" webkit-playsinline playsinline></video>';
                
                $( self.mediaContent ).html( html ).promise().done( function() {
                    
                    // call video js
                    self.isVideo = true;
                    self.renderVideoJS();
                    self.setWidgets();
                    
                } );
                
            } );
        
        break;
        
        case 'youtube':
            
            $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin" webkit-playsinline playsinline></video>' ).promise().done( function() {
                    
                self.isYoutube = true;
                
/*
                if ( SBPLUS.hasStorageItem( 'sbplus-vjs-yt-loaded', true ) === false ) {
                    
                    $.getScript( SBPLUS.manifest.sbplus_root_directory + 'scripts/libs/videojs/plugins/youtube/youtube.js', function() {
                    
                        self.renderVideoJS();
                        SBPLUS.setStorageItem( 'sbplus-vjs-yt-loaded', 1, true );
                        
                    } );
                    
                } else {
*/
                    
                    self.renderVideoJS();
                    
                //}
                
                self.setWidgets();
                
            } );
            
        break;
        
        case 'vimeo':
            
            $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin" webkit-playsinline playsinline></video>' ).promise().done( function() {
                    
                self.isVimeo = true;
                
/*
                if ( SBPLUS.hasStorageItem( 'sbplus-vjs-vimeo-loaded', true ) === false ) {
                    
                    $.getScript( SBPLUS.manifest.sbplus_root_directory + 'scripts/libs/videojs/plugins/vimeo/vimeo.js', function() {
                    
                        self.renderVideoJS();
                        SBPLUS.setStorageItem( 'sbplus-vjs-vimeo-loaded', 1, true );
                        
                    } );
                    
                } else {
*/
                    
                    self.renderVideoJS();
                    
                //}
                
                self.setWidgets();
                
            } );
            
        break;
        
        case 'html':
            
            $( self.mediaContent ).html( '<iframe class="html" src="assets/html/' + self.src + '/index.html"></iframe>' ).promise().done( function() {
                    
                self.setWidgets();
                
            } );
            
        break;
        
        case 'bundle':
            
            $( self.frames ).each( function() {
                var cue = toSeconds( $( this ).attr( 'start' ) );
                self.cuepoints.push( cue );
            } );
            
            $.get( 'assets/audio/' + self.src + '.vtt', function( data ) {
                self.captionUrl = this.url;
                self.transcript = SBPLUS.stripScript( data );
            } ).always( function() {
                
                var html = '<video id="mp" class="video-js vjs-default-skin" webkit-playsinline playsinline></video>';
                
                $( self.mediaContent ).html( html ).promise().done( function() {
            
                    self.isBundle = true;
                    self.renderVideoJS();
                    self.setWidgets();
            
                } );
            
            } );
            
        break;
        
        case 'quiz':
            
            $( self.leftCol ).append( '<div id="sbplus_quiz_wrapper"></div>' )
                .promise().done( function() {
            
                    var qObj = {
                        id: self.pageNumber,
                        context: self.quiz
                    };
                    
                    var quizItem = new Quiz( qObj );
                    quizItem.getQuiz();
                    
                    if ( $( '#sbplus_widget' ).is( ':visible' ) ) {
                        SBPLUS.setStorageItem( 'sbplus-previously-widget-open', 1, true );
                    }
                    
                    SBPLUS.hideWidget();
                    SBPLUS.disableWidget();

            } );
            
        break;
        
        default:
            self.setWidgets();
        break;
        
    }
    
    if ( self.type === 'image' || self.type === 'html' ) {
        
        $( self.mediaContent ).addClass( self.transition )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', function() {
                $( this ).removeClass( self.transition );
                $( this ).off();
            }
        );
        
    }
    
    window.clearTimeout( self.delayStorage );
    
    self.delayStorage = window.setTimeout( function() {
        
        var presentation = SBPLUS.sanitize( $( SBPLUS.banner.title ).html() );
        
        SBPLUS.setStorageItem( 'sbplus-' + presentation, self.pageNumber[0] + ',' + self.pageNumber[1] );
        
    }, 3000 );
    
};

// kaltura api request
Page.prototype.loadKalturaVideoData = function () {
    
    var self = this;
    self.isKaltura = {
        
        flavors: {},
        status: {
            entry: 0,
            low: 0,
            normal: 0,
            high: 0
        },
        duration: ''
        
    };
    
    kWidget.getSources( {

        'partnerId': self.kaltura.id,
        'entryId': self.src,
        'callback': function( data ) {
            
            var captionId = data.captionId;
            var html = '';
            
            self.isKaltura.status.entry = data.status;
            self.isKaltura.duration = data.duration;
            
            for( var i in data.sources ) {

                var source = data.sources[i];

                if ( source.flavorParamsId === self.kaltura.flavors.low ) {
                    
                    self.isKaltura.flavors.low = source.src;
                    self.isKaltura.status.low = source.status;

                }

                if ( source.flavorParamsId === self.kaltura.flavors.normal ) {

                    self.isKaltura.flavors.normal = source.src;
                    self.isKaltura.status.normal = source.status;

                }

                if ( source.flavorParamsId === self.kaltura.flavors.medium ) {

                    self.isKaltura.flavors.medium = source.src;
                    self.isKaltura.status.high = source.status;

                }

            }
            
            // entry video
            if ( self.isKaltura.status.entry >= 1 && self.isKaltura.status.entry <= 2 ) {
                
                // flavor videos
                if ( self.isKaltura.status.low === 2 && self.isKaltura.status.normal === 2 
                && self.isKaltura.status.high === 2 ) {
                
                    if ( captionId !== null ) {
                    
                        self.captionUrl = 'https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId=' + captionId + '&segmentDuration=' + self.isKaltura.duration + '&segmentIndex=1';
                        
                    }
                    
                    html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%" webkit-playsinline playsinline></video>';
                
                    $( self.mediaContent ).html( html ).promise().done( function() {
                        
                        // call video js
                        self.renderVideoJS();
                        self.setWidgets();
                        
                    } );
                    
                    
                } else {
                    self.showPageError( 'KAL_NOT_READY' );
                }
                    
            } else {
                self.showPageError( 'KAL_ENTRY_NOT_READY' );
            }
            
        }

    } );
    
};

// render videojs
Page.prototype.renderVideoJS = function() {
    
    var self = this;
    
    var isAutoplay = true;
    
    if ( SBPLUS.getStorageItem( 'sbplus-autoplay' ) === '0' ) {
        isAutoplay = false;
    }
    
    var options = {
        
        techOrder: ['html5'],
        controls: true,
        autoplay: isAutoplay,
        preload: "auto",
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
            fullscreenToggle: false
        },
        plugins: {
            replayButton: {}
        },
        manualCleanup: true

    };
    
    // autoplay is off for iPhone or iPod
    if( SBPLUS.isMobileDevice() ) {
        options.autoplay = false;
    }
    
    // set tech order and plugins
    if ( self.isKaltura ) {
        options.plugins = Object.assign( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );
    } else if ( self.isYoutube ) {
        options.techOrder = ['youtube'];
        options.sources = [{ type: "video/youtube", src: "https://www.youtube.com/watch?v=" + self.src }];
        options.playbackRates = null;
        options.plugins = Object.assign( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );
    } else if ( self.isVimeo ) {
        options.techOrder = ["vimeo"];
        options.sources = [{ type: "video/vimeo", src: "https://vimeo.com/" + self.src }];
        options.playbackRates = null;
        options.controls = false;
    }
    
    self.mediaPlayer = videojs( 'mp', options, function() {
        
        var player = this;
        
        player.manualCleanup = true;
        
        if ( self.isKaltura ) {
            
            player.updateSrc( [
			
    			{ src: self.isKaltura.flavors.low, type: "video/mp4", label: "low", res: 360 },
    			{ src: self.isKaltura.flavors.normal, type: "video/mp4", label: "normal", res: 720 },
    			{ src: self.isKaltura.flavors.medium, type: "video/mp4", label: "medium", res: 640 }
    			
    		] );
            
        }
        
        if ( self.isAudio || self.isBundle ) {
            
            if ( self.isAudio && self.hasImage ) {
                player.poster( 'assets/pages/' + self.src + '.' + self.imgType );
            }
            
            if ( self.isBundle ) {
                
                var srcDuration = 0;
                var pageImage = new Image();
                
                player.on( 'loadedmetadata', function() {
                    
                    srcDuration = Math.floor( player.duration() );
                    
                } );
                
                player.cuepoints();
                player.addCuepoint( {
                    	
                	namespace: self.src + '-1',
                	start: 0,
                	end: self.cuepoints[1],
                	onStart: function() {
                    	pageImage.src = 'assets/pages/' + self.src + '-1.' + self.imgType;
                    	player.poster( pageImage.src );
                	},
                	onEnd: function() {},
                	params: ''
                	
            	} );
                
                $.each( self.cuepoints, function( i ) {
                    
                    var nextCue;
                    
                    if ( self.cuepoints[i+1] === undefined ) {
                        nextCue = srcDuration;
                    } else {
                        nextCue = self.cuepoints[i+1];
                    }
                    
                    player.addCuepoint( {
                        namespace: self.src + '-' + ( i + 2 ),
                        start: self.cuepoints[1],
                        end: nextCue,
                        onStart: function() {
                            pageImage.src = 'assets/pages/' + self.src + '-' + ( i + 2 ) + '.' + self.imgType;
                            $( pageImage ).on( 'error', function() {
                                self.showPageError( 'NO_IMG', pageImage.src );
                            } );
                            player.poster( pageImage.src );
                        }
                    } );
                    
                } );
                
                player.on('seeking', function() {
                    	
                	if ( player.currentTime() <= self.cuepoints[0] ) {
                    	
                    	player.poster( 'assets/pages/' + self.src + '-1.' + self.imgType );
                    	
                	}
                	
            	} );
                
            }
            
            player.src( { type: 'audio/mp3', src: 'assets/audio/' + self.src + '.mp3' } );
            
        }
        
        if ( self.isVideo ) {
            player.src( { type: 'video/mp4', src: 'assets/video/' + self.src + '.mp4' } );
        }
        
        // add caption
        if ( self.captionUrl ) {
    		player.addRemoteTextTrack( {
        		kind: 'subtitles',
        		language: 'en',
        		label: 'English',
        		src: self.captionUrl
    		}, true );
		}
        
        player.on(['waiting', 'pause'], function() {
            
          self.isPlaying = false;
          
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
          }
          
        });
        
        player.on('ended', function() {
            
          self.isPlaying = false;
          
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' ) ) {
                  $( '.lt-wrapper .lt-line' ).removeClass( 'current' );
              }
              
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
              
          }
          
        });
        
        player.on('playing', function() {
            
          self.isPlaying = true;
          
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' )
              && self.transcriptIntervalStarted === false ) {
                self.startInteractiveTranscript();
              }
          }
          
        });
        
        // playrate
        if ( options.playbackRates !== null && self.isYoutube === false
        && self.isVimeo === false ) {
            
            player.on( 'resolutionchange', function() {
            		
        		player.playbackRate( Number( SBPLUS.getStorageItem( 'sbplus-playbackrate-temp', true ) ) );
        		
    		} );
            
            // default settings
            if ( SBPLUS.hasStorageItem( 'sbplus-playbackrate-temp', true ) ) {
                
                player.playbackRate( Number( SBPLUS.getStorageItem( 'sbplus-playbackrate-temp', true ) ) );
                
            } else {
                
                player.playbackRate( Number( SBPLUS.getStorageItem( 'sbplus-playbackrate' ) ) );
                SBPLUS.setStorageItem( 'sbplus-playbackrate-temp', SBPLUS.getStorageItem( 'sbplus-playbackrate' ), true );
                
            }
            
            player.on( 'ratechange', function() {
        		SBPLUS.setStorageItem( 'sbplus-playbackrate-temp', player.playbackRate(), true );
    		} );
            
        }
        
        // volume
        
        if ( SBPLUS.hasStorageItem( 'sbplus-volume-temp', true ) ) {
            player.volume( Number( SBPLUS.getStorageItem( 'sbplus-volume-temp', true ) ) );
            
        } else {
            
            player.volume( Number( SBPLUS.getStorageItem( 'sbplus-volume' ) ) );
            
        }
        
        player.on( 'volumechange', function() {
            
            SBPLUS.setStorageItem( 'sbplus-volume-temp', this.volume(), true );
            
        } );
        
        // subtitle
        if ( self.isYoutube === false && self.isVimeo === false ) {
            
            if ( SBPLUS.hasStorageItem( 'sbplus-subtitle-temp', true ) ) {
            
                if ( SBPLUS.getStorageItem( 'sbplus-subtitle-temp', true ) === '1' ) {
                    player.textTracks().tracks_[0].mode = 'showing';
                } else {
                    player.textTracks().tracks_[0].mode = 'disabled';
                }
                
            } else {
                
                if ( SBPLUS.getStorageItem( 'sbplus-subtitle' ) === '1' ) {
                    player.textTracks().tracks_[0].mode = 'showing';
                } else {
                    player.textTracks().tracks_[0].mode = 'disabled';
                }
                
            }
            
            player.textTracks().addEventListener( 'change', function() {
                
                var tracks = this.tracks_;
                
                $.each( tracks, function() {
                    
                    if ( this.mode === 'showing' ) {
                        
                        SBPLUS.setStorageItem( 'sbplus-subtitle-temp', 1, true );
                        
                    } else {
                        
                        SBPLUS.setStorageItem( 'sbplus-subtitle-temp', 0, true );
                        
                    }
                    
                } );
                
            } );
            
        }
            
    } );
    
    if ( $( '#mp_html5_api' ).length ) {
        
        $( '#mp_html5_api' ).addClass( 'animated ' + self.transition )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', function() {
                $( this ).removeClass( 'animated ' +  self.transition );
                $( this ).off();
            }
        );
        
    }
    
    if ( $( '#mp_Youtube_api' ).length ) {
        
        var parent = $( '#mp_Youtube_api' ).parent();
        
        parent.addClass( 'animated ' + self.transition )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', function() {
                $( this ).removeClass( 'animated ' +  self.transition );
                $( this ).off();
            }
        );
        
    }
    
    // if on small iOS device, allow inline playback
    if ( SBPLUS.isMobileDevice() ) {
        
        var video = $('video').get(0);
        
        makeVideoPlayableInline(video);
        $( '.video-js' ).removeClass( 'vjs-using-native-controls' );
        $( '.vjs-loading-spinner' ).hide();
        
    }

}

Page.prototype.setWidgets = function() {
    
    var self = this;
    SBPLUS.clearWidgetSegment();
    
    if ( this.type != 'quiz' ) {
        
        if ( !SBPLUS.isEmpty( this.notes ) ) {
            
            SBPLUS.addSegment( 'Notes' );
            
        }
        
        if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
            
            if ( self.isAudio || self.isVideo || self.isBundle ) {
            
                if ( !SBPLUS.isEmpty( self.transcript ) ) {
                    
                    SBPLUS.addSegment( 'Interactive Transcript' );
                    
                }
                
            }
            
            if ( self.isKaltura ) {
                
                if ( !SBPLUS.isEmpty( self.captionUrl ) ) {
                    
                    SBPLUS.addSegment( 'Interactive Transcript' );
                    
                }
                
            }
            
        }
        
        if ( this.widget.length ) {
            
            var segments = $( $( this.widget ).find( 'segment' ) );
            
            segments.each( function() {
                
                var name = $( this ).attr( 'name' );
                var content = SBPLUS.stripScript( $( this ).text() );
                var key = 'sbplus_' + SBPLUS.sanitize( name );
                
                self.widgetSegments[key] = content;
                
                SBPLUS.addSegment( name );
                
            } );
            
        }
        
        SBPLUS.selectFirstSegment();
        
    }
    
}

Page.prototype.getWidgetContent = function( id ) {
    
    var self = this;
    
    switch( id ) {
        
        case 'sbplus_notes':
            
            displayWidgetContent( this.notes );
            
        break;
        
        case 'sbplus_interactivetranscript':
            
            if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
                
                if ( self.isAudio || self.isVideo ) {
                
                    displayWidgetContent( parseTranscript( self.transcript ) );
                    self.startInteractiveTranscript();
                    
                } else {
                    
                    if ( self.transcriptLoaded === false ) {
                        
                        $.get( self.captionUrl, function( d ) {
                        
                            self.transcriptLoaded = true;
                            self.transcript = parseTranscript( SBPLUS.stripScript( d ) );
                            
                            displayWidgetContent( self.transcript );
                            self.startInteractiveTranscript();
                            
                        } );
                        
                    } else {
                         
                         displayWidgetContent( self.transcript );
                         self.startInteractiveTranscript();
                        
                    }
                 
                }
                
            }
            
              
        break;
        
        default:
            
            displayWidgetContent( self.widgetSegments[id] );
            
        break;
        
    }
    
}

Page.prototype.startInteractiveTranscript = function() {
    
    var self = this;
    
    if ( self.mediaPlayer ) {
        
        var ltArray = $( '.lt-wrapper .lt-line' );
        
        transcriptInterval = setInterval( function() {
            
            if ( self.isPlaying 
            && $( SBPLUS.layout.widget ).is( ':visible' ) ) {
                
                ltArray.removeClass( 'current' );
                
                // TO DO: Refine loop to binary search
                ltArray.each( function() {

                    if ( self.mediaPlayer.currentTime() >= $( this ).data('start') 
                    && self.mediaPlayer.currentTime() <= $( this ).data('end') ) {
                        $( this ).addClass( 'current' );
                        return;
                    }
                    
                } );
                
                var target = $( '.lt-wrapper .lt-line.current' );
            
                if ( target.length ) {
                    
                    var scrollHeight = $( '#sbplus_widget' ).height();
                    var targetTop = target[0].offsetTop;
                    
                    if ( targetTop > scrollHeight ) {
                        target[0].scrollIntoView( false );
                    }
                    
                }
                
            }
            
        }, 500 );
        
        self.transcriptIntervalStarted = true;
    
    }
    
    $( '.lt-wrapper .lt-line' ).on( 'click', function(e) {
        
        var currentTarget = $( e.currentTarget ).data('start');
        self.mediaPlayer.currentTime(currentTarget);
        
    } );
    
}

// display page error
Page.prototype.showPageError = function( type, src ) {
    
    src = typeof src !== 'undefined' ? src : '';
    
    var self = this;
    
    var msg = '';
    
    switch ( type ) {
                
        case 'NO_IMG':
        
            msg = '<p>The image for this Storybook Page could not be loaded. Please try refreshing your browser. Contact support if you continue to have issues.</p><p><strong>Expected image:</strong> ' + src + '</p>';

        break;
        
        case 'KAL_NOT_READY':
            msg = '<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID  ' + self.src + '<br><strong>Status</strong>:<br>';
            
            msg += 'Low &mdash; ' + getKalturaStatus( self.isKaltura.status.low ) + '<br>';
            msg += 'Normal &mdash; ' + getKalturaStatus( self.isKaltura.status.normal ) + '<br>';
            msg += 'High &mdash; ' + getKalturaStatus( self.isKaltura.status.high ) + '</p>';
            
        break;
        
        case 'KAL_ENTRY_NOT_READY':
            msg = '<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID ' + self.src + '<br><strong>Status</strong>: ';
            
            msg += getEntryKalturaStatus( self.isKaltura.status.entry ) + '</p>';
            
        break;
        
    }
    
    $( self.mediaError ).html( msg ).show();
    
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

// page class helper functions
function displayWidgetContent( str ) {
    
    $( SBPLUS.widget.content ).html( str )
        .addClass( 'fadeIn' ).one( 'webkitAnimationEnd mozAnimationEnd animationend', 
        function() {
            $( this ).removeClass( 'fadeIn' ).off();
        }
     );
    
}

function parseTranscript( str ) {
    
    var result = '<div class="lt-wrapper">';
    var tAry = str.replace(/\n/g, '<br>').split('<br>');
    var brCount = 0;
    
    tAry = cleanArray( SBPLUS.removeEmptyElements( tAry ) );

    if ( tAry[0].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) 
    && tAry[1].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) ) {
        tAry[0] = '';
        tAry = SBPLUS.removeEmptyElements( tAry );
    }
    
    for ( var i = 1; i < tAry.length; i += 2 ) {
        
        var cueParts = tAry[i-1].split( ' ' );
        
        
        result += '<span class="lt-line" data-start="' + toSeconds(cueParts[0]) + '" data-end="' + toSeconds(cueParts[2]) + '">' + tAry[i] + '</span> ';
        brCount++;
        
        if( brCount >= 17 ) {
            result += '<br><br>';
            brCount = 0;
        }
        
    }
    
    result += '</div>';
    
    return result;
    
} 

function cleanArray( array ) {
    
    array = SBPLUS.removeEmptyElements( array );
    
    var index = array.findIndex( firstCueZero );
    
    if ( index === -1 ) {
        index = array.indexOf( array.find( firstCue ) );
    }
    
    array = array.splice( index );
    
    for ( var j = 0; j < array.length; j++ ) {
        
        if ( array[j].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) ) {
            
            var innerSplit = array[j].split( ' ' );
            
            if ( innerSplit.length > 3 ) {
                array[j] = innerSplit.splice( 0, 3 ).join(' ');
            } else {
                continue;
            }
            
        } else {
            
            if ( array[j+1] !== undefined ) {
                
                if ( !array[j+1].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) ) {
                    array[j] = array[j] + ' ' + array[j+1];
                    array[j+1] = '';
                }
                
            }
            
        }
        
    }
    
    return SBPLUS.removeEmptyElements( array );
    
}

function firstCueZero( cue ) {
    
    return cue.match(/(00:00:00.000)/);
    
}

function firstCue( cue ) {
    
    return cue.match(/\d{2}:\d{2}:\d{2}.\d{3}/g);
    
}

function toSeconds( str ) {
    
    var arr = str.split( ':' );
    
    if ( arr.length >= 3 ) {
        return Number( arr[0] * 60 ) * 60 + Number( arr[1] * 60 ) + Number( arr[2] );
    } else {
        return Number( arr[0] * 60 ) + Number( arr[1] );
    }
    
}