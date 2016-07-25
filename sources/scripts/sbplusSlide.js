/***************************************
    Get Slide Module
****************************************/

/* global videojs */
/* global kWidget */
/* global makeVideoPlayableInline */

var sbplusSlide = ( function() {
    
    var manifest;
    var context;
    var settings;
    
    var $container;
    var currentSlide;
    
    var directory;
    var pageType;
    var mediaMime;
    var mediaFormat;
    var fileName;
    var imgFormat;
    
    var mediaPlayer = null;
    var subtitles;
    var currentPlayrate = 1;
    var subtitlesOn = false;
    
    var kalturaLoaded = 0;
    var flavors = {};
    var isKaltura = false;
    var isYoutube = false;
    var isVimeo = false;
    var isVideoAudio = false;
    
    var isBundle = false;
    var cuepoints = [];
    
    var timeoutCookie;
    
    function get( _context, _settings, section, page, _manifest ) {
        
        manifest = typeof _manifest !== 'undefined' ? _manifest : manifest;
        
        settings = _settings;
        context = _context;
        imgFormat = settings.pageImgFormat;
        
        if ( Number( $.fn.getCookie( 'sbplus-vjs-enabledSubtitles' ) ) === 1 ) {
            
            subtitlesOn = true;
            
        }

        _showSlide( section, page );
        sbplusNotes.get( manifest, context, section, page );
        sbplus.resize();  
        
    }
    
    function _showSlide( s, p ) {
        
        currentSlide = $( context[s] ).find( 'page' )[p];
       
        pageType = $( currentSlide ).attr( 'type' );
        
        fileName = pageType !== 'quiz' ? $( currentSlide ).attr( 'src' ) : '';
        
        // resets
        _removeSlideErrorMsg();
        
        $( '.main_content_wrapper' ).removeClass( 'assessment-view' );
        $( '.page_container .content' ).removeClass( 'img-only' );
        $( '.page_container .content' ).removeClass( 'audio' );
        $( '.page_container .content' ).removeClass( 'html' );
        
        if ( mediaPlayer !== null ) {
            
            isKaltura = false;
            isYoutube = false;
            isVimeo = false;
            isBundle = false;
            isVideoAudio = false;
            cuepoints = [];
            mediaPlayer.dispose();
            mediaPlayer = null;
            
        }
        
        sbplusTableOfContents.update( s, p );
        
        _renderMedia();
        
        // update cookie value for resume after a delay
        window.clearTimeout( timeoutCookie );
        timeoutCookie = window.setTimeout( function() {
            
            $.fn.setCookie( 'sbplus-' + $.fn.getRootDirectory(), s + ':' + p );
            
        }, 3000 );
        
    }
    
    function _renderMedia() {
        
        $container = $( '.page_container .content' );
        
        switch ( pageType ) {
            
            case 'image':
                
                var img = new Image();
        
                $( img ).load( function() {
    
                    $container.addClass( 'img-only' ).html( img );
    
                } ).error( function() {
    
                    $container.before( '<div class="slideError">Image not found!<br>Expected image: assets/pages/' + fileName + '.' + imgFormat + '</div>' );
    
                } ).attr( {
                    'src': 'assets/pages/' + fileName + '.' + imgFormat,
                    'border': 0
                } );
                
            break;
            
            case 'image-audio':
                
                var slideImg = '';
                
                directory = 'assets/audio/';
                mediaMime = 'audio/mp3';
                mediaFormat = '.mp3';
                isVideoAudio = true;
                
                $.get( 'assets/pages/' + fileName + '.' + imgFormat, function() {
                    
                    slideImg = this.url;
                    
                } ).fail( function() {
                    
                    $container.before( '<div class="slideError">Image not found!<br>Expected image: assets/pages/' + fileName + '.' + imgFormat + '</div>' );
                
                } ).always( function() {
                    
                    $.get( directory + fileName + '.vtt', function() {
                    
                        subtitles = '<track kind="subtitles" label="English" srclang="en" src="' + directory + fileName + '.vtt" ' + ( subtitlesOn === true ? 'default' : '' ) + ' />';
                    
                    } ).fail( function(){ subtitles = ''; } ).always( function() {
                    
                    $container.html( '<video id="ap" class="video-js vjs-default-skin" webkit-playsinline>' + subtitles + '</video>' ).promise().done( function() {
                    
                            _renderVideoJsPlayer();
                    
                        } );
                    
                    } );
                    
                } );
                
            break;
            
            case 'video':
                    
                directory = 'assets/video/';
                mediaMime = 'video/mp4';
                mediaFormat = '.mp4';
                isVideoAudio = true;
                
                $.get( directory + fileName + '.vtt', function() {
                    
                    subtitles = '<track kind="subtitles" label="English" srclang="en" src="' + directory + fileName + '.vtt" ' + ( subtitlesOn === true ? 'default' : '' ) + ' />';
                
                } ).always( function() {
                    
                $container.html( '<video id="ap" class="video-js vjs-default-skin" webkit-playsinline>' + subtitles + '</video>' ).promise().done( function() {
                
                        _renderVideoJsPlayer();
                
                    } );
                
                } );
                
            break;
            
            case 'kaltura':
                
                if ( kalturaLoaded === 0 ) {

                    $.getScript( manifest.sbplus_root_directory + '/scripts/libs/kaltura/mwembedloader.js', function() {
        
                        $.getScript( manifest.sbplus_root_directory +  '/scripts/libs/kaltura/kwidgetgetsources.js', function() {
        
                            kalturaLoaded = 1;
                            _loadKalturaVideoData();
                    
                        } );
                        
                    } );
        
                } else {
        
                    _loadKalturaVideoData();
        
                }
            
            break;
            
            case 'youtube':
            case 'vimeo':
                
                if ( pageType === 'youtube' ) {
                    
                    isYoutube = true;
                    
                } else {
                    
                    isVimeo = true;
                    
                }
                
                $container.html( '<video id="ap" class="video-js vjs-default-skin" webkit-playsinline></video>' ).promise().done( function() {
                    
                    _renderVideoJsPlayer();
                
                } );
                
            break;
            
            case 'html':
            
                $container.addClass( 'html' ).html('<iframe src="assets/html/' + fileName + '/index.html"></iframe>');
                
            break;
            
            case 'bundle':
            
                var initialImg = '';
                
                directory = 'assets/audio/';
                mediaMime = 'audio/mp3';
                mediaFormat = '.mp3';
                isBundle = true;
                
                var frames = $( currentSlide ).find( 'frame' );
                
                frames.each( function() {
                    
                    var cue = $( this ).attr( 'start' );
                    cuepoints.push( $.fn.toSeconds( cue ) );
                    
                } );
                
                $.get( 'assets/pages/' + fileName + '-1.' + imgFormat, function() {
                    
                    initialImg = this.url;
                    
                } ).fail( function() {
                    
                    $container.before( '<div class="slideError">Image not found!<br>Expected image: assets/pages/' + fileName + '.' + imgFormat + '</div>' );
                
                } ).always( function() {
                    
                    $.get( directory + fileName + '.vtt', function() {
                    
                        subtitles = '<track kind="subtitles" label="English" srclang="en" src="' + directory + fileName + '.vtt" ' + ( subtitlesOn === true ? 'default' : '' ) + ' />';
                    
                    } ).always( function() {
                        
                    $container.html( '<video id="ap" class="video-js vjs-default-skin">' + subtitles + '</video>' ).promise().done( function() {
                    
                            _renderVideoJsPlayer();
                    
                        } );
                    
                    } );
                    
                } );
                
            break;
            
            case 'quiz':
                var qID = Number( $('.selectable .selected').attr('data-order') );
                $container.html( sbplusQuiz.get( $container, currentSlide, qID ) );
                //sbplus.resize();
                $( "#assessmentSubmitBtn" ).on( 'click', function() {
                    
                    var id = $(this).data('id');
                    
                    sbplusQuiz.check( id );
                    
                } );
            break;
            
        }
        
    }
    
    function _loadKalturaVideoData() {
        
        var entryId, captionId, videoDuration;
        
        isKaltura = true;
    
        kWidget.getSources( {
    
            'partnerId': manifest.sbplus_kaltura.id,
            'entryId': fileName,
            'callback': function( data ) {
    
                entryId = data.entryId;
                captionId = data.captionId;
                videoDuration = data.duration;
    
                for( var i in data.sources ) {
    
                    var source = data.sources[i];
    
                    if ( source.flavorParamsId === manifest.sbplus_kaltura.low ) {
    
                        flavors.low = source.src;
    
                    }
    
                    if ( source.flavorParamsId === manifest.sbplus_kaltura.normal ) {
    
                        flavors.normal = source.src;
    
                    }
    
                    if ( source.flavorParamsId === manifest.sbplus_kaltura.high ) {
    
                        flavors.high = source.src;
    
                    }
    
                }
                
                $container.html( '<video id="ap" class="video-js vjs-default-skin" crossorigin="anonymous" webkit-playsinline><track kind="subtitles" label="English" srclang="en" src="https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId=' + captionId + '&segmentDuration=' + videoDuration + '&segmentIndex=1" ' + ( subtitlesOn === true ? 'default' : '' ) + ' /></video>' ).promise().done( function() {
                    
                    _renderVideoJsPlayer();
            
                } );
                
            }
    
        } );
        
    }
    
    function _renderVideoJsPlayer() {

        var options = {
            
            techOrder: ["html5"],
            controls: true,
            autoplay: Number( $.fn.getCookie( 'sbplus-vjs-autoplay' ) ) === 1 ? true : false,
            preload: "auto",
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                fullscreenToggle: false
            }
    
        };
        
        if( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) ) {
            options.autoplay = false;
        }
        
        if ( isKaltura ) {
                
            options.plugins = { videoJsResolutionSwitcher: { 'default': 720 } };
            
        } else if ( isYoutube ) {
            
            options.techOrder = ["youtube"];
            options.sources = [{ type: "video/youtube", src: "https://www.youtube.com/watch?v=" + fileName }];
            options.playbackRates = null;
            options.plugins = { videoJsResolutionSwitcher: { 'default': 720 } };
            
        } else if ( isVimeo ) {
            
            options.techOrder = ["vimeo"];
            options.sources = [{ type: "video/vimeo", src: "https://vimeo.com/" + fileName }];
            options.playbackRates = null;
            
        }
        
        mediaPlayer = videojs( 'ap', options, function() {
            
            var player = this;
            
            if ( isVideoAudio || isBundle ) {
                
                player.poster( 'assets/pages/' + fileName + '.' + imgFormat );
                
            }
            
            if ( isKaltura ) {
                
        		player.updateSrc( [
        			
        			{ src: flavors.low, type: "video/mp4", label: "low", res: 360 },
        			{ src: flavors.normal, type: "video/mp4", label: "normal", res: 720 },
        			{ src: flavors.high, type: "video/mp4", label: "high", res: 1080 }
        			
        		] );
        		
        		player.on( 'resolutionchange', function() {
            		
            		player.playbackRate( currentPlayrate );
            		
        		} );
        		
        		player.on( 'ratechange', function() {
            		
            		currentPlayrate = player.playbackRate();
            		
        		} );
        		
        	} else {
            	
            	if ( isYoutube === false && isVimeo === false ) {
                	
                	player.src( { type: mediaMime, src: directory + fileName + mediaFormat } );
                	
                }
            	
        	}
        	
        	if ( isVimeo ) {
            	
            	if ( options.autoplay ) {
                	
                	player.play();
                	
            	}
            	
        	}
        	
        	if ( isBundle ) {
            	
            	var duration;
            	var image = new Image();
            	
            	$( '.vjs-poster' ).after('<div class="sbplus-vjs-poster"></div>');
            	
            	player.on( 'loadedmetadata', function() {
                            	
                	duration = Math.floor(player.duration());
                	
            	} );
            	
            	player.cuepoints();
            	
            	player.addCuepoint( {
                    	
                	namespace: fileName + '-1',
                	start: 0,
                	end: cuepoints[1],
                	onStart: function() {
                    	image.src = 'assets/pages/' + fileName + '-1.' + imgFormat;
                    	player.poster( image.src );
                	},
                	onEnd: function() {},
                	params: ''
                	
            	} );
            	
            	$.each( cuepoints, function(i) {
                	
                	var nextCue;
                    	
                	if ( cuepoints[i+1] === undefined ) {
                    	
                    	nextCue = duration;
                    	
                	} else {
                    	
                    	nextCue = cuepoints[i+1];
                    	
                	}
                	
                	player.addCuepoint( {
                    	
                    	namespace: fileName + '-'  +(i+2),
                    	start: cuepoints[i],
                    	end: nextCue,
                    	onStart: function() {
                        	image.src = 'assets/pages/' + fileName + '-'  +(i+2) + '.' + imgFormat;
                        	$('.sbplus-vjs-poster').css( 'background-image', 'url(assets/pages/' + fileName + '-' + (i+1) + '.' + imgFormat );
                        	player.poster( image.src );
                    	}
                    	
                	} );
                	
            	} );
            	
            	player.on('seeking', function() {
                    	
                	if (player.currentTime() <= cuepoints[0]) {
                    	$('.sbplus-vjs-poster').css( 'background-image', '');
                    	player.poster( 'assets/pages/' + fileName + '-1.' + imgFormat );
                	}
                	
            	});
            	
        	}
            
            // default settings
            if ( options.playbackRates !== null ) {
                
                if ( $.fn.hasCookieValue( 'sbplus-vjs-playbackrate-temp' ) ) {
                    player.playbackRate( Number( $.fn.getCookie( 'sbplus-vjs-playbackrate-temp' ) ) );
                } else {
                    player.playbackRate( Number( $.fn.getCookie( 'sbplus-vjs-playbackrate' ) ) );
                }
                
            }
            
            if ( $.fn.hasCookieValue( 'sbplus-vjs-volume-temp' ) ) {
                player.volume( Number( $.fn.getCookie( 'sbplus-vjs-volume-temp' ) ) );
            } else {
                player.volume( Number( $.fn.getCookie( 'sbplus-vjs-volume' ) ) );
            }
            
            // session settings
            player.on( 'volumechange', function() {
                
                $.fn.setCookie( 'sbplus-vjs-volume-temp', this.volume(), 0 );
                
            } );
            
            player.on( 'ratechange', function() {
                
                $.fn.setCookie( 'sbplus-vjs-playbackrate-temp', this.playbackRate(), 0 );
                
            } );
            
            player.textTracks().addEventListener( 'change', function() {
                
                var tracks = this.tracks_;
                
                $.each( tracks, function() {
                    
                    if ( this.mode === 'showing' ) {
                        
                        subtitlesOn = true;
                        return false;
                        
                    } else {
                        
                        subtitlesOn = false;
                        
                    }
                    
                } );
                
            } );
                
        } );
        
        if( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) ) {
            var video = $('video').get(0);
            makeVideoPlayableInline(video);
            $( '.video-js' ).removeClass( 'vjs-using-native-controls' );
            $( '.vjs-loading-spinner' ).hide();
        }
        
    }
    
    function _removeSlideErrorMsg() {
        
        if ( $( '.slideError' ).length ) {
                        
            $( '.slideError' ).remove();
            
        }
        
    }
    
    return {
        
        get: get
        
    };
    
} )();