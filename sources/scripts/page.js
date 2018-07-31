// var transcriptInterval = null;
var Page = function ( obj, data ) {
    
    this.pageXML = obj.xml[0];
    this.pageData = data;
    this.title = obj.title;
    this.type = obj.type;
    this.transition = obj.transition;
    this.pageNumber = obj.number;
    
    // google analytic variables
    this.gaEventCate = '';
    this.gaEventLabel = '';
    this.gaEventAction = '';
    this.gaEventValue = -1;
    this.gaEventHalfway = false;
    this.gaDelays = {
        start: 0,
        halfway: 0,
        completed: 0
    }; 
    
    if ( obj.type !== 'quiz' ) {
        
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
        
        this.hasImage = false;
        this.missingImgUrl = '';
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
    
    $( SBPLUS.layout.mediaContent ).css('backgroundImage', '').removeClass('compat-object-fit').removeClass( 'show-vjs-poster' );
    
    $( this.mediaError ).empty().hide();
    
    if ( $( '#mp' ).length ) {
        videojs( 'mp' ).dispose();
    }
    
    SBPLUS.clearWidget();
    SBPLUS.enableWidget();
    
    $( self.mediaContent ).removeClass('iframeEmbed').empty();
    
    if ( SBPLUS.hasStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-previously-widget-open', true ) ) {
        
        if ( SBPLUS.getStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-previously-widget-open', true ) === '1' ) {
            
            SBPLUS.showWidget();
            
        }
        
        SBPLUS.deleteStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-previously-widget-open', true );
        
    }
    
    self.gaEventHalfway = false;
    SBPLUS.clearGATimeout();
    
    // clearInterval( transcriptInterval );
    
    // end reset
    
    switch ( self.type ) {
        
        case 'kaltura':
            
            if ( SBPLUS.kalturaLoaded === false ) {
                
                $.getScript( self.root + 'scripts/libs/kaltura/mwembedloader.js', function() {
                    
                    $.getScript( self.root +  'scripts/libs/kaltura/kwidgetgetsources.js', function() {
                        
                        SBPLUS.kalturaLoaded = true;
                        self.loadKalturaVideoData();
                        
                    } );
                    
                } );
                
            } else {
                
                self.loadKalturaVideoData();
                
            }

            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':kaltura:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
            
        break;
        
        case 'image-audio':
            
            self.isAudio = true;
            
            $.ajax( {
                
                url: 'assets/pages/' + self.src + '.' + self.imgType,
                type: 'HEAD'
                
            } ).done( function() {
                
                self.hasImage = true;
                
            } ).fail( function() {
                
                self.showPageError( 'NO_IMG', this.url );
                self.missingImgUrl = this.url;
                
            } ).always( function() {
                
                $.ajax( {
                    
                    url: 'assets/audio/' + self.src + '.vtt',
                    type: 'HEAD'
                    
                } ).done( function( data ) {
                    
                    self.captionUrl = this.url;
                    self.transcript = SBPLUS.noScript( data );
                    
                } ).always( function() {
                    
                    var html = '<video id="mp" class="video-js vjs-default-skin"></video>';
                    
                    if ( ! Modernizr.objectfit ) {
                        $( self.mediaContent ).addClass( 'show-vjs-poster' );
                    }
                    
                    $( self.mediaContent ).html( html ).promise().done( function() {
                
                        self.renderVideoJS();
                        self.setWidgets();
                
                    } );
                    
                } );
                
            } );
            
            self.gaEventCate = 'Audio';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':audio:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 2;
            self.gaDelays.start = 6;
            
        break;
        
        case 'image':
            
            var img = new Image();
            img.src = 'assets/pages/' + self.src + '.' + self.imgType;
            img.alt = self.title;
            
            $( img ).on( 'load', function() {
                
                self.hasImage = true;
                
                if ( ! Modernizr.objectfit ) {
                  $('.sbplus_media_content').each(function () {
                    var $container = $(this),
                        imgUrl = $container.find('img').prop('src');
                    if (imgUrl) {
                      $container
                        .css('backgroundImage', 'url(' + imgUrl + ')')
                        .addClass('compat-object-fit');
                    }  
                  });
                }
                
                
            } );
            
            $( img ).on( 'error', function() {
                self.hasImage = false;
                self.showPageError( 'NO_IMG', img.src );
            } );
            
            $( self.mediaContent ).html( '<img src="' + img.src + '" class="img_only" alt="' + img.alt + '" />' ).promise().done( function() {
                self.setWidgets();
            } );
            
            self.gaEventCate = 'Image';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':image:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 4;
            self.gaDelays.start = 10;
            self.gaDelays.halfway = 30;
            self.gaDelays.completed = 60;
                        
        break;
        
        case 'video':
            
            $.ajax( {
                
                url: 'assets/video/' + self.src + '.vtt',
                type: 'HEAD'
                
            } ).done( function( data ) {
                
                self.captionUrl = this.url;
                self.transcript = SBPLUS.noScript( data );
                
            } ).always( function() {
                
                var html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>';
                
                $( self.mediaContent ).html( html ).promise().done( function() {
                    
                    // call video js
                    self.isVideo = true;
                    self.renderVideoJS();
                    self.setWidgets();
                    
                } );
                
            } );
            
            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':video:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
        
        break;
        
        case 'youtube':
            
            $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin"></video>' ).promise().done( function() {
                    
                self.isYoutube = true;
                
                self.renderVideoJS();
                self.setWidgets();
                
            } );
            
            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':youtube:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
            
        break;
        
        case 'vimeo':
            
            $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin"></video>' ).promise().done( function() {
                    
                self.isVimeo = true;
                
                self.renderVideoJS();
                self.setWidgets();
                
            } );
            
            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':vimeo:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
            
        break;
        
        case 'bundle':
            
            $( self.frames ).each( function() {
                var cue = toSeconds( $( this ).attr( 'start' ) );
                self.cuepoints.push( cue );
            } );
            
            $.ajax( {
                
                url: 'assets/audio/' + self.src + '.vtt',
                type: 'HEAD'
                
            } ).done( function( data ) {
                
                self.captionUrl = this.url;
                self.transcript = SBPLUS.noScript( data );
                
            } ).always( function() {
                
                var html = '<video id="mp" class="video-js vjs-default-skin"></video>';
                
                $( self.mediaContent ).html( html ).promise().done( function() {
            
                    self.isBundle = true;
                    self.renderVideoJS();
                    self.setWidgets();
            
                } );
                
            } );
            
            self.gaEventCate = 'Audio';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':bundle:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 2;
            self.gaDelays.start = 6;
            
        break;
        
        case 'quiz':
            
            $( self.leftCol ).append( '<div id="sbplus_quiz_wrapper"></div>' )
                .promise().done( function() {
            
                    var qObj = {
                        id: self.pageNumber
                    };
                    
                    var quizItem = new Quiz( qObj, self.pageData  );
                    quizItem.getQuiz();
                    
                    if ( $( '#sbplus_widget' ).is( ':visible' ) ) {
                        SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-previously-widget-open', 1, true );
                    }
                    
                    SBPLUS.hideWidget();
                    SBPLUS.disableWidget();

            } );
            
            self.gaEventCate = 'Quiz';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':quiz:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 5;
            self.gaDelays.start = 10;
            self.gaDelays.halfway = 30;
            
        break;
        
        case 'html':
            
            var embed = false;
            var hasAudio = false;
            var path = self.src;
                
            if ( !isUrl(path) ) {
                path = 'assets/html/' + self.src;
            }
            
            if ( $(self.pageXML).attr('embed') !== undefined ) {
                embed = $(self.pageXML).attr('embed').toLowerCase();
            }
            
            if ( $(self.pageXML).find('audio').length >= 1 ) {
                hasAudio = $($(self.pageXML).find('audio')[0]).attr('src').toLowerCase();
            }
            
            if ( embed === 'yes' ) {
                
                var content = '<iframe class="html" src="' + path + '"></iframe>';
                
                $( self.mediaContent ).addClass( 'iframeEmbed' ).html( content ).promise().done( function() {
                    
                    if ( hasAudio.length ) {
                        
                        self.isAudio = true;
                        $( self.mediaContent ).append( '<audio id="mp" class="video-js vjs-default-skin"></audio>' );
                        self.renderVideoJS( hasAudio );
                        
                    }
                    
                } );
                
            } else {
                
               var holder = '<div class="html exLink">';
               holder += '<small>click the link to open it in a new tab/window</small>';
               holder += '<a href="' + path + '" target="_blank">' + path + '</a>';
               holder += '</div>'
               
               $( self.mediaContent ).addClass( 'html' ).html( holder );
               window.open(path, '_blank');
               
            }
            
            self.setWidgets();
            
            self.gaEventCate = 'HTML';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':html:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 6;
            self.gaDelays.start = 10;
            self.gaDelays.halfway = 30;
            self.gaDelays.completed = 60;
            
        break;
        
        default:
            self.showPageError( 'UNKNOWN_TYPE', self.type);
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
    
    // add current page index to local storage
    
    window.clearTimeout( self.delayStorage );
    
    self.delayStorage = window.setTimeout( function() {
        
        var presentation = SBPLUS.sanitize( $( SBPLUS.banner.title ).text() );
        
        var pSectionNumber = self.pageNumber[0] + ',' + self.pageNumber[1];
        
        if ( pSectionNumber !== '0,0' ) {
            SBPLUS.setStorageItem( 'sbplus-' + presentation, pSectionNumber );
        } else {
            SBPLUS.deleteStorageItem( 'sbplus-' + presentation );
        }
        
    }, 3000 );
    
    // send event to Google Analytics
    if ( self.gaEventCate !== '' ) {
        
        SBPLUS.sendToGA( self.gaEventCate, self.gaEventAction,
                         self.gaEventLabel, self.gaEventValue,
                         self.gaDelays );
        
    }
    
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
                    
                    html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>';
                
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
Page.prototype.renderVideoJS = function( src ) {
    
    var self = this;
    
    src = typeof src !== 'undefined' ? src : self.src;

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
            replayButton: true
        }

    };
    
    // autoplay is off for iPhone or iPod
    if( SBPLUS.isIOSDevice() ) {
        options.autoplay = false;
        options.playsinline = true;
        options.nativeControlsForTouch = false;
    }
    
    // set tech order and plugins
    if ( self.isKaltura ) {
        
        $.extend( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );
        
    } else if ( self.isYoutube ) {
        
        options.techOrder = ['youtube'];
        options.sources = [{ type: "video/youtube", src: "https://www.youtube.com/watch?v=" + src }];
        options.playbackRates = null;
        
        $.extend( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );

    } else if ( self.isVimeo ) {
        
        options.techOrder = ["vimeo"];
        options.sources = [{ type: "video/vimeo", src: "https://vimeo.com/" + src }];
        options.playbackRates = null;
        //options.controls = false;
        
    }
    
    self.mediaPlayer = videojs( 'mp', options, function() {
        
        var player = this;
        
        if ( self.isKaltura ) {
            
            player.updateSrc( [
			
    			{ src: self.isKaltura.flavors.low, type: "video/mp4", label: "low", res: 360 },
    			{ src: self.isKaltura.flavors.normal, type: "video/mp4", label: "normal", res: 720 },
    			{ src: self.isKaltura.flavors.medium, type: "video/mp4", label: "medium", res: 640 }
    			
    		] );
            
        }
        
        if ( self.isAudio || self.isBundle ) {
            
            if ( self.isAudio && self.hasImage ) {
                player.poster( 'assets/pages/' + src + '.' + self.imgType );
            }
            
            if ( self.isBundle ) {
                
                var srcDuration = 0;
                var pageImage = new Image();
                
                player.on( 'loadedmetadata', function() {
                    
                    srcDuration = Math.floor( player.duration() );
                    
                } );
                
                player.cuepoints();
                player.addCuepoint( {
                    	
                	namespace: src + '-1',
                	start: 0,
                	end: self.cuepoints[0],
                	onStart: function() {
                    	pageImage.src = 'assets/pages/' + src + '-1.' + self.imgType;
                    	player.poster( pageImage.src );
                	},
                	onEnd: function() {},
                	params: ''
                	
            	} );
                
                $.each( self.cuepoints, function( i ) {
            
                    var endCue;
                    
                    if ( self.cuepoints[i+1] === undefined ) {
                        endCue = srcDuration;
                    } else {
                        endCue = self.cuepoints[i+1];
                    }
                    
                    player.addCuepoint( {
                        namespace: src + '-' + ( i + 2 ),
                        start: self.cuepoints[i],
                        end: endCue,
                        onStart: function() {
                            pageImage.src = 'assets/pages/' + src + '-' + ( i + 2 ) + '.' + self.imgType;
                            $( pageImage ).on( 'error', function() {
                                self.showPageError( 'NO_IMG', pageImage.src );
                            } );
                            player.poster( pageImage.src );
                        }
                    } );
                    
                } );
                
                player.on('seeking', function() {
                    	
                	if ( player.currentTime() <= self.cuepoints[0] ) {
                    	
                    	player.poster( 'assets/pages/' + src + '-1.' + self.imgType );
                    	
                	}
                	
            	} );
                
            }
            
            player.src( { type: 'audio/mp3', src: 'assets/audio/' + src + '.mp3' } );
            
        }
        
        if ( self.isVideo ) {
            player.src( { type: 'video/mp4', src: 'assets/video/' + src + '.mp4' } );
        }
        
        // add caption
        if ( self.captionUrl ) {
    		player.addRemoteTextTrack( {
        		kind: 'captions',
        		language: 'en',
        		label: 'English',
        		src: self.captionUrl
    		}, true );
		}
        
        // set playback rate
        if ( options.playbackRates !== null ) {
            player.playbackRate( SBPLUS.playbackrate );
        }
        
        // video events
        player.on(['waiting', 'pause'], function() {
            
          self.isPlaying = false;
          
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
          }
*/
          
        });
        
        player.on( 'ready', function() {
            
            if ( self.isKaltura ) {
                
                var timestamp = + new Date();
                
                $.get( 'http://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId=' + guid() + '&event%3AeventType=2&event%3ApartnerId=' + self.kaltura.id + '&event%3AentryId=' + self.src + '&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=false&event%3Aduration=' + player.duration() + '&event%3AeventTimestamp=' + timestamp );
                
            }
            
        } );
        
        player.on( 'ended', function() {
            
            self.isPlaying = false;
            
            if ( self.isKaltura ) {
            
                var timestamp = + new Date();
                
                $.get( 'http://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId=' + guid() + '&event%3AeventType=7&event%3ApartnerId=' + self.kaltura.id + '&event%3AentryId=' + self.src + '&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=false&event%3Aduration=' + player.duration() + '&event%3AeventTimestamp=' + timestamp );
            
            }
          
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' ) ) {
                  $( '.lt-wrapper .lt-line' ).removeClass( 'current' );
              }
              
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
              
          }
          
*/

            // send event to Google Analytics
            if ( self.gaEventCate !== '' ) {
                
                SBPLUS.sendToGA( self.gaEventCate, "completed",
                                 self.gaEventLabel, 3, 0 );
                
            }
          
        });
        
        
        
        player.on('playing', function() {
            
          self.isPlaying = true;
          
          if ( self.isKaltura ) {
                
            var timestamp = + new Date();
            
            $.get( 'http://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId=' + guid() + '&event%3AeventType=3&event%3ApartnerId=' + self.kaltura.id + '&event%3AentryId=' + self.src + '&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=false&event%3Aduration=' + player.duration() + '&event%3AeventTimestamp=' + timestamp );
            
        }
          
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' )
              && self.transcriptIntervalStarted === false ) {
                self.startInteractiveTranscript();
              }
          }
*/
          
        });
        
        if ( SBPLUS.xml.settings.analytics === 'on' ) {
            
            player.on( 'timeupdate', function() {
                
                var percent = player.currentTime() / player.duration() * 100;
                
                if ( self.gaEventCate !== '' && percent >= 50
                     && self.gaEventHalfway === false ) {
                    
                    SBPLUS.sendToGA( self.gaEventCate, "halfway",
                                 self.gaEventLabel, 2, 0 );
                    self.gaEventHalfway = true;
                                 
                }
              
            });
        
        }
        
        player.on( 'error', function() {
            
          self.showPageError( 'NO_MEDIA', player.src() );
          
        });
        
        player.on( 'resolutionchange', function() {
                
    		player.playbackRate( SBPLUS.playbackrate );
    		
		} );
        
        player.on( 'ratechange', function() {
            
            var rate = this.playbackRate();
            
            if ( SBPLUS.playbackrate !== rate ) {
                
                SBPLUS.playbackrate = rate;
                this.playbackRate(rate);
                
            }
    		
		} );
        
        // volume
        
        if ( SBPLUS.hasStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-volume-temp', true ) ) {
            player.volume( Number( SBPLUS.getStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-volume-temp', true ) ) );
            
        } else {
            
            player.volume( Number( SBPLUS.getStorageItem( 'sbplus-volume' ) ) );
            
        }
        
        player.on( 'volumechange', function() {
            
            SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-volume-temp', this.volume(), true );
            
        } );
        
        // subtitle
        if ( self.isYoutube === false && self.isVimeo === false && player.textTracks().tracks_.length >= 1 ) {
            
            if ( SBPLUS.hasStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-subtitle-temp', true ) ) {
            
                if ( SBPLUS.getStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-subtitle-temp', true ) === '1' ) {
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
                        
                        SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-subtitle-temp', 1, true );
                        
                    } else {
                        
                        SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.uniqueTitle + '-subtitle-temp', 0, true );
                        
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
                    
                    SBPLUS.addSegment( 'Interactive Transcript (alpha)' );
                    
                }
                
            }
            
            if ( self.isKaltura ) {
                
                if ( !SBPLUS.isEmpty( self.captionUrl ) ) {
                    
                    SBPLUS.addSegment( 'Interactive Transcript (alpha)' );
                    
                }
                
            }
            
        }
        
        if ( this.widget.length ) {
            
            var segments = $( $( this.widget ).find( 'segment' ) );
            
            segments.each( function() {
                
                var name = $( this ).attr( 'name' );
                var key = 'sbplus_' + SBPLUS.sanitize( name );
                
                self.widgetSegments[key] = SBPLUS.getTextContent( $( this ) );
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
        
        case 'sbplus_interactivetranscriptalpha':
            
            if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
                
                if ( self.isAudio || self.isVideo ) {
                
                    displayWidgetContent( parseTranscript( self.transcript ) );
                    self.startInteractiveTranscript();
                    
                } else {
                    
                    if ( self.transcriptLoaded === false ) {
                        
                        $.get( self.captionUrl, function( d ) {
                        
                            self.transcriptLoaded = true;
                            self.transcript = parseTranscript( SBPLUS.noScript( d ) );
                            
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

/*
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
*/

// display page error
Page.prototype.showPageError = function( type, src ) {
    
    src = typeof src !== 'undefined' ? src : '';
    
    var self = this;
    
    var msg = '';
    
    switch ( type ) {
                
        case 'NO_IMG':
        
            msg = '<p><strong>The content for this Storybook Page could not be loaded.</strong></p><p><strong>Expected image:</strong> ' + src + '</p><p>Please try refreshing your browser, or coming back later.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';

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
        
        case 'NO_MEDIA':
        
            msg = '<p><strong>The content for this Storybook Page could not be loaded.</strong></p>';
            
            if ( self.hasImage === false ) {
                msg += '<p><strong>Expected audio:</strong> ' + src + '<br>';
                msg += '<strong>Expected image:</strong> ' + self.missingImgUrl + '</p>';
            } else {
                msg += '<p><strong>Expected media:</strong> ' + src + '</p>';
            }
            
            msg += '<p>Please try refreshing your browser, or coming back later.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';
            
        break;
        
        case 'UNKNOWN_TYPE':
            msg = '<p><strong>UNKNOWN PAGE TYPE</strong></p><p>Page type ("' + src + '") is not supported.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';
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
            
            var region = $( this );
            
            region.removeClass( 'fadeIn' ).off();
            
            if ( region.find( 'a' ).length ) {

        		region.find( 'a' ).each( function() {
            		
        			$( this ).attr( "target", "_blank" );
        
                } );
        
            }
            
        }
     );
    
}

function parseTranscript( str ) {
    
    try {
        
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
        
    } catch(e) {
        
        return 'Oops, SB+ has some complications with the requested caption file.';
        
    }
    
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

function guid() {
    
    function s4() {
        return Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring (1 );
    }
    
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    
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

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}