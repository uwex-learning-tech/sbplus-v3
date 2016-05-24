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
    var subtitles = false;
    
    var kalturaLoaded = 0;
    var flavors = {};
    var isKaltura = false;
    var kalturaCaptionId;
    var kalturaVideoDuration;
    
    var timeoutCookie;
    
    function get( _context, _settings, section, page, _manifest ) {
        
        manifest = typeof _manifest !== 'undefined' ? _manifest : manifest;
        
        settings = _settings;
        context = _context;
        imgFormat = settings.slideFormat;

        _showSlide( section, page );       
        
    }
    
    function _showSlide( s, p ) {
        
        var slide = $( context[s] ).find( 'page' )[p];
       
        pageType = $( slide ).attr( 'type' );
        
        fileName = pageType !== 'quiz' ? $( slide ).attr( 'src' ) : '';
        
        if ( mediaPlayer !== null ) {
            
            mediaPlayer.dispose();
            mediaPlayer = null;
            isKaltura = false;
            
        }
        
        _renderMedia();
        sbplusTableOfContents.update( s, p );
        
        // update cookie value for resume
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
                    _removeSlideErrorMsg();
                    
                } ).fail( function() {
                    
                    if ( pageType === 'audio' ) {
                    
                        $container.before( '<div class="slideError">Slide image not found!<br>Expected image: assets/slide/' + fileName + '.' + imgFormat + '</div>' );
                        
                    } else {
                        
                        _removeSlideErrorMsg();
                        
                    }
                
                } ).always( function() {
                    
                    $.get( directory + fileName + '.vtt', function() {
                    
                        subtitles = true;
                    
                    } ).always( function() {
                        
                    $container.html( '<video id="ap" class="video-js vjs-default-skin" poster="' + slideImg + '\"></video>' ).promise().done( function() {
                    
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
        
        var entryId;
    
        kWidget.getSources( {
    
            'partnerId': 1660872,
            'entryId': fileName,
            'callback': function( data ) {
    
                entryId = data.entryId;
                kalturaCaptionId = data.captionId;
                kalturaVideoDuration = data.duration;
    
                for( var i in data.sources ) {
    
                    var source = data.sources[i];
    
                    if ( source.flavorParamsId === 487061 ) {
    
                        flavors.low = source.src;
    
                    }
    
                    if ( source.flavorParamsId === 487071 ) {
    
                        flavors.normal = source.src;
    
                    }
    
                    if ( source.flavorParamsId === 487081 ) {
    
                        flavors.high = source.src;
    
                    }
    
                }
                
                $container.html( '<video id="ap" class="video-js vjs-default-skin" crossorigin="anonymous"></video>' ).promise().done( function() {
                    
                    isKaltura = true;
                    _renderVideoJsPlayer( 'ap' );
            
                } );
                
            }
    
        } );
        
    }
    
    function _renderVideoJsPlayer( playerID ) {
        
        var options = {
            
            techOrder: ["html5"],
            width: 640,
            height: 360,
            controls: true,
            autoplay: Number( $.fn.getCookie( 'sbplus-vjs-autoplay' ) ) === 1 ? true : false,
            preload: "auto",
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                fullscreenToggle: false
            }
    
        };
        
        switch ( playerID ) {
            
            case 'ap':
                
                options.plugins = null;
                
                if ( isKaltura ) {
                
                    options.plugins = { videoJsResolutionSwitcher: { 'default': 720 } };
                    
                }
                
            break;
            
        }
        
        mediaPlayer = videojs( playerID, options, function() {
            
            if ( isKaltura ) {
        			
                this.addRemoteTextTrack( { 
                    src: 'https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId=' + kalturaCaptionId + '&segmentDuration=' + kalturaVideoDuration + '&segmentIndex=1',
                    kind: 'subtitles',
                    label: 'English',
                    srclang: 'en',
                    default: Number( $.fn.getCookie( 'sbplus-vjs-enabledSubtitles' ) ) === 1 ? true : false
                } );
                
        		this.updateSrc( [
        			
        			{ src: flavors.low, type: "video/mp4", label: "low", res: 360 },
        			{ src: flavors.normal, type: "video/mp4", label: "normal", res: 720 },
        			{ src: flavors.high, type: "video/mp4", label: "high", res: 1080 }
        			
        		] );
        		
        	} else {
            	
            	if ( subtitles ) {
                
                    this.addRemoteTextTrack( { 
                        src: directory + fileName + '.vtt',
                        kind: 'subtitles',
                        label: 'English',
                        srclang: 'en',
                        default: Number( $.fn.getCookie( 'sbplus-vjs-enabledSubtitles' ) ) === 1 ? true : false
                    } );
                    
                }
            	
            	this.src( { type: mediaMime, src: directory + fileName + mediaFormat } );
            	
        	}
            
            // settings
            this.playbackRate( $.fn.getCookie( 'sbplus-vjs-playbackrate' ) );
            this.volume( Number( $.fn.getCookie( 'sbplus-vjs-volume' ) ) );
            
            this.textTracks().addEventListener( 'change', function() {
                
                var tracks = this.tracks_;
                
                $.each( tracks, function() {
                    
                    if ( this.mode === 'showing' ) {

                        $.fn.setCookie( 'sbplus-vjs-enabledSubtitles', 1 );
                        return false;
                        
                    } else {
                        
                        $.fn.setCookie( 'sbplus-vjs-enabledSubtitles', 0 );
                        
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