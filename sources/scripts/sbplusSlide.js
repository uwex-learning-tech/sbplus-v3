/***************************************
    Get Slide Module
****************************************/

/* global videojs */

var sbplusSlide = ( function() {
    
    var context;
    var settings;
    var fileName;
    var imgFormat;
    var mediaPlayer = null;
    
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
        var type = $( slide ).attr( 'type' );
        
        fileName = type !== 'quiz' ? $( slide ).attr( 'src' ) : '';
        
        if ( mediaPlayer !== null ) {
            
            mediaPlayer.dispose();
            mediaPlayer = null;
            $( '#ap' ).remove();
            
        }
        
        switch ( type ) {
            
            case 'audio':
                
                _renderMedia( 'audio' );
                
            break;
            
        }
         
    }
    
    function _renderMedia( type ) {
        
        var $container = $( '.main_content .container .content' );
        var subtitle = '';
        var slideImg = '';
        
        switch ( type ) {
            
            case 'audio':
            
                $.get( 'assets/slide/' + fileName + '.' + imgFormat, function() {
                    
                    slideImg = this.url;
                    
                    $.get( 'assets/audio/' + fileName + '.vtt', function() {
                    
                        subtitle = '<track kind="subtitles" src="assets/audio/' + fileName + '.vtt" srclang="en" label="English">';
                    
                    } ).always( function() {
                    
                        var audioSrc = '<source src="assets/audio/' + fileName + '.mp3" type="audio/mp3">';
                    
                        $container.html( '<video id="ap" class="video-js vjs-default-skin" poster="' + slideImg + '\">' + audioSrc + subtitle + '</video>' ).promise().done( function() {
                    
                            _renderVideoJsPlayer( 'ap' );
                    
                        } );
                    
                    } );
                
                } ).fail( function() {
                
                    $container.html( "Image not found!", "Expected image: assets/slide/" + fileName + "." + imgFormat );
                
                } );
                
            break;
            
        }
        
    }
    
    function _renderVideoJsPlayer( playerID ) {
        
        var options = {
    
            techOrder: ["html5"],
            "width": 640,
            "height": 360,
            "controls": true,
            "autoplay": $.fn.getCookie( 'sbplus-vjs-autoplay' ) === '1' ? true : false,
            "preload": "auto",
            "playbackRates": [0.5, 1, 1.5, 2],
            "plugins": {}
    
        };
        
        switch ( playerID ) {
            
            case 'ap':
                
                options.plugins = null;
                
            break;
            
        }
        
        mediaPlayer = videojs( playerID, options, function() {
            
            // settings
            this.removeChild( 'vjs-fullscreen-control' );
            this.volume( Number( $.fn.getCookie( 'sbplus-vjs-volume' ) ) );
            
            this.rate( 1.5 );
    
        } );
    
    }
    
    return {
        
        get: get
        
    };
    
} )();