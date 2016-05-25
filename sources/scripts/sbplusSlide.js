/***************************************
    Get Slide Module
****************************************/

/* global videojs */
/* global kWidget */

var sbplusSlide = ( function() {
    
    var manifest;
    var context;
    var settings;
    
    var $container;
    
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
    
    var timeoutCookie;
    
    function get( _context, _settings, section, page, _manifest ) {
        
        manifest = typeof _manifest !== 'undefined' ? _manifest : manifest;
        
        settings = _settings;
        context = _context;
        imgFormat = settings.slideFormat;
        
        if ( Number( $.fn.getCookie( 'sbplus-vjs-enabledSubtitles' ) ) === 1 ) {
            
            subtitlesOn = true;
            
        }

        _showSlide( section, page );       
        
    }
    
    function _showSlide( s, p ) {
        
        var slide = $( context[s] ).find( 'page' )[p];
       
        pageType = $( slide ).attr( 'type' );
        
        fileName = pageType !== 'quiz' ? $( slide ).attr( 'src' ) : '';
        
        // resets
        if ( mediaPlayer !== null ) {
            
            mediaPlayer.dispose();
            mediaPlayer = null;
            isKaltura = false;
            
        }
        
        _removeSlideErrorMsg();
        
        // new "instance"
        
        _renderMedia();
        sbplusTableOfContents.update( s, p );
        
        // update cookie value for resume after a delay
        window.clearTimeout( timeoutCookie );
        timeoutCookie = window.setTimeout( function() {
            
            $.fn.setCookie( 'sbplus-' + $.fn.getRootDirectory(), s + ':' + p );
            
        }, 3000 );
        
    }
    
    function _renderMedia() {
        
        var slideImg = '';
        
        $container = $( '.main_content .container .content' );
        
        switch ( pageType ) {
            
            case 'audio':
            case 'video':
                
                if ( pageType === 'video' ) {
                    
                    directory = 'assets/video/';
                    mediaMime = 'video/mp4';
                    mediaFormat = '.mp4';
                    
                } else {
                    
                    directory = 'assets/audio/';
                    mediaMime = 'audio/mp3';
                    mediaFormat = '.mp3';
                    
                }
                
                $.get( 'assets/slide/' + fileName + '.' + imgFormat, function() {
                    
                    slideImg = this.url;
                    
                } ).fail( function() {
                    
                    if ( pageType === 'audio' ) {
                    
                        $container.before( '<div class="slideError">Slide image not found!<br>Expected image: assets/slide/' + fileName + '.' + imgFormat + '</div>' );
                        
                    }
                
                } ).always( function() {
                    
                    $.get( directory + fileName + '.vtt', function() {
                    
                        subtitles = '<track kind="subtitles" label="English" srclang="en" src="' + directory + fileName + '.vtt" ' + ( subtitlesOn === true ? 'default' : '' ) + ' />';
                    
                    } ).always( function() {
                        
                    $container.html( '<video id="ap" class="video-js vjs-default-skin" poster="' + slideImg + '\">' + subtitles + '</video>' ).promise().done( function() {
                    
                            _renderVideoJsPlayer( 'ap' );
                    
                        } );
                    
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
            
        }
        
    }
    
    function _loadKalturaVideoData() {
        
        var entryId, captionId, videoDuration;
    
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
                
                $container.html( '<video id="ap" class="video-js vjs-default-skin" crossorigin="anonymous"><track kind="subtitles" label="English" srclang="en" src="https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId=' + captionId + '&segmentDuration=' + videoDuration + '&segmentIndex=1" ' + ( subtitlesOn === true ? 'default' : '' ) + ' /></video>' ).promise().done( function() {
                    
                    isKaltura = true;
                    _renderVideoJsPlayer( 'ap' );
            
                } );
                
            }
    
        } );
        
    }
    
    function _renderVideoJsPlayer( playerID ) {
        
        var options = {
            
            techOrder: ["html5"],
            controls: true,
            autoplay: Number( $.fn.getCookie( 'sbplus-vjs-autoplay' ) ) === 1 ? true : false,
            preload: "auto",
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                fullscreenToggle: false
            },
            plugins: {}
    
        };
        
        switch ( playerID ) {
            
            case 'ap':
                
                if ( isKaltura ) {
                
                    options.plugins = { videoJsResolutionSwitcher: { 'default': 720 } };
                    
                }
                
            break;
            
        }
        
        mediaPlayer = videojs( playerID, options, function() {
            
            var player = this;
            
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
            	
            	player.src( { type: mediaMime, src: directory + fileName + mediaFormat } );
            	
        	}
            
            // settings
            player.playbackRate( $.fn.getCookie( 'sbplus-vjs-playbackrate' ) );
            player.volume( Number( $.fn.getCookie( 'sbplus-vjs-volume' ) ) );
            
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