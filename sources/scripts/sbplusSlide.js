/***************************************
    Get Slide Module
****************************************/

/* global videojs */

var sbplusSlide = ( function() {
    
    var context;
    var settings;
    
    var directory;
    var pageType;
    var mediaMime;
    var mediaFormat;
    var fileName;
    var imgFormat;
    
    var mediaPlayer = null;
    var subtitles = false;
    
    var timeoutCookie;
    
    function get( _context, _settings, section, page ) {
        
        section = typeof section !== 'undefined' ?  Number( section ) : 0;
        page = typeof page !== 'undefined' ?  Number( page ) : 0;
        
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
        
        var $container = $( '.main_content .container .content' );
        var slideImg = '';
        
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
            
        }
        
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
            },
            plugins: {}
    
        };
        
        switch ( playerID ) {
            
            case 'ap':
                
                options.plugins = null;
                
            break;
            
        }
        
        mediaPlayer = videojs( playerID, options, function() {
            
            this.src( { type: mediaMime, src: directory + fileName + mediaFormat } );
            
            if ( subtitles ) {
                
                this.addRemoteTextTrack( { 
                    src: directory + fileName + '.vtt',
                    kind: 'subtitles',
                    label: 'English',
                    srclang: 'en',
                    default: Number( $.fn.getCookie( 'sbplus-vjs-enabledSubtitles' ) ) === 1 ? true : false
                } );
                
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