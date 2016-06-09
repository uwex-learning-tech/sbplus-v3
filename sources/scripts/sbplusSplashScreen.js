/***************************************
    Get Splash Screen Module
****************************************/
var sbplusSplashScreen = ( function () {
    
    var manifest, context, settings, bg = '';
    var startBtn, resumeBtn;
    
    function get( _manifest, _context, _settings ) {
        
        manifest = _manifest;
        context = _context;
        settings = _settings;
        
        $.get( _manifest.sbplus_root_directory + 'scripts/templates/splashscreen.tpl', function( cntx ) {
            
            // get the splash screen image
            $.get( 'assets/splash.jpg', function() {
                
                bg = 'assets/splash.jpg';
                
            } ).fail( function() {
                
                $.get( manifest.sbplus_splash_directory + $.fn.getProgramDirectory() + context.postfix + '.jpg' , function() {
                
                    bg = this.url;
                    
                } ).fail( function() {
                    
                    $.get( manifest.sbplus_splash_directory + $.fn.getProgramDirectory() + '.jpg' , function() {
                
                        bg = this.url;
                        
                    } );
                    
                } );
                
            } );
            
            _render( cntx );
            
        } ).fail( function() {
            
            sbplusError.show( 'Template file not found!', 'splashscreen.tpl file not found in the templates directory.' );
            
        } );
    
    }
    
    function bindStartPresentationEvent() {
        
        startBtn.on( 'click', function() {
            
            sbplus.render();
            
        } );
        
        startBtn.on( 'mouseover', function() {
            
            $( this ).css( "background-color", $.fn.colorLum( settings.accent, 0.2 ) );
            
        } ).on( 'mouseout', function() {
            
            $( this ).css( "background-color", settings.accent );
            
        } );
        
    }
    
    function bindResumePresentationEvent() {
        
        resumeBtn.on( 'click', function() {
            
            sbplus.render( true );
            
        } );
        
        resumeBtn.on( 'mouseover', function() {
            
            $( this ).css( "background-color", $.fn.colorLum( settings.accent, 0.2 ) );
            
        } ).on( 'mouseout', function() {
            
            $( this ).css( "background-color", settings.accent );
            
        } );
        
    }
    
    function unbindStartPresentationButton() {
        
        startBtn.off( 'click' );
        startBtn.off( 'mouseover' );
        startBtn.off( 'mouseout' );
        
    }
    
    function unbindResumePresentationButton() {
        
        resumeBtn.off( 'click' );
        resumeBtn.off( 'mouseover' );
        resumeBtn.off( 'mouseout' );
        
    }
    
    function _render( cntx ) {
        
        $( '.splashscreen' ).html( cntx );
        
        if ( bg !== '' ) {
            
            $( '.splashscreen' ).css( 'background-image', 'url(' + bg + ')' );
            
        }
    
        $( '.splashinfo .title' ).html( context.title );
        $( '.splashinfo .subtitle' ).html( context.subtitle );
        $( '.splashinfo .author' ).html( context.author );
        $( '.splashinfo .length' ).html( context.length );
        $( '.splashinfo .startBtn' ).css( 'background-color', settings.accent );
        
        if ( navigator.cookieEnabled && $.fn.hasCookieValue( 'sbplus-' + $.fn.getRootDirectory() ) ) {
            
            $( '.splashinfo .resumeBtn' ).css( 'background-color', settings.accent )
                                         .removeClass( 'hide' );
            resumeBtn = $( '.splashinfo .resumeBtn' );
            bindResumePresentationEvent();

        }
        
        startBtn = $( '.splashinfo .startBtn' );
        bindStartPresentationEvent();
        sbplusDownloadable.get();
        
    }
    
    return {
        
        get: get,
        unbindStartPresentationBtn: unbindStartPresentationButton,
        unbindResumePresentationBtn: unbindResumePresentationButton
        
    };
    
} )();