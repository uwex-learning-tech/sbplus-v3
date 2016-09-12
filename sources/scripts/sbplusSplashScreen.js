/***************************************
    Get Splash Screen Module
****************************************/
var sbplusSplashScreen = ( function () {
    
    var manifest, context, settings;
    var startBtn, resumeBtn;
    
    function get( _manifest, _context, _settings ) {
        
        manifest = _manifest;
        context = _context;
        settings = _settings;
        
        var program = $.fn.getProgramDirectory();
        var appDefaultSplash = manifest.sbplus_root_directory + 'images/default_splash.svg',
            localSplash, programDefaultSplash, courseSplash;
        
        $.get( _manifest.sbplus_root_directory + 'scripts/templates/splashscreen.tpl', function( cntx ) {
            
            // render the splash screen HTML
            _render( cntx );
            
            // get the splash screen image
            $.ajax( {
                url: 'assets/splash.svg',
                type: 'HEAD'
            } ).done( function() {
                
                localSplash = this.url;
                _updateSplashScreen( localSplash );
                
            } ).fail( function() {
                
                if ( context.course === '' ) {
                        
                    $.ajax( {
                        url: manifest.sbplus_splash_directory + program + '/' + 'default.svg',
                        type: 'HEAD',
                    } ).done( function() {
                        
                        programDefaultSplash = this.url;
                        _updateSplashScreen( programDefaultSplash );
                        
                    } ).fail( function() {
                        
                        _updateSplashScreen( appDefaultSplash );
                        
                    } );
                    
                } else {
                    
                    $.ajax( {
                        url: manifest.sbplus_splash_directory + program + '/' + context.course + '.svg',
                        type: 'HEAD',
                    } ).done( function() {
                        
                        courseSplash = this.url;
                        _updateSplashScreen( courseSplash );
                        
                    } ).fail( function() {
                        
                        $.ajax( {
                            url: manifest.sbplus_splash_directory + program + '/' + 'default.svg',
                            type: 'HEAD',
                        } ).done( function() {
                            
                            programDefaultSplash = this.url;
                            _updateSplashScreen( programDefaultSplash );
                            
                        } ).fail( function() {
                            
                            _updateSplashScreen( appDefaultSplash );
                            
                        } ); 
                        
                    } );
                    
                }
                
            } );
                        
        } ).fail( function() {
            
            sbplusError.show( 'Template file not found!', 'splashscreen.tpl file not found in the templates directory.' );
            
        } );
    
    }
    
    function bindStartPresentationEvent() {
        
        startBtn.on( 'click', function() {
            
            sbplus.render();
            
        } );
        
        startBtn.on( 'mouseover', function() {
            
            $( this ).children().css( "background-color", $.fn.colorLum( settings.accent, 0.2 ) );
            
        } ).on( 'mouseout', function() {
            
            $( this ).children().css( "background-color", settings.accent );
            
        } );
        
    }
    
    function bindResumePresentationEvent() {
        
        resumeBtn.on( 'click', function() {
            
            sbplus.render( true );
            
        } );
        
        resumeBtn.on( 'mouseover', function() {
            
            $( this ).children().css( "background-color", $.fn.colorLum( settings.accent, 0.2 ) );
            
        } ).on( 'mouseout', function() {
            
            $( this ).children().css( "background-color", settings.accent );
            
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
        
        var resumeCookieKey = 'sbplus-' + $.fn.getRootDirectory();
        
        $( '.splashscreen' ).html( cntx );
        $( '.splashinfo .title' ).html( context.title );
        
        if ( $.fn.isEmpty(context.subtitle) ) {
            $( '.splashinfo .subtitle' ).attr('tabindex', -1);
        } else {
            $( '.splashinfo .subtitle' ).html( context.subtitle );
        }
        
        $( '.splashinfo .author' ).html( context.author );
        $( '.splashinfo .length' ).html( context.length );
        $( '.splashinfo .startBtn button' ).css( 'background-color', settings.accent );
        $( '.splashinfo .resumeBtn button' ).css( 'background-color', settings.accent );
        
        if ( Modernizr.localstorage ) {
            
            if ( $.fn.getLSItem( resumeCookieKey ) !== '0:0' && $.fn.getLSItem( resumeCookieKey ) !== null ) {
                
                $( '.splashinfo .resumeBtn' ).css( 'background-color', settings.accent )
                                         .removeClass( 'hide' );
                resumeBtn = $( '.splashinfo .resumeBtn' );
                bindResumePresentationEvent();
                
            }
            
        }
        
        startBtn = $( '.splashinfo .startBtn' );
        bindStartPresentationEvent();
        sbplusDownloadable.get(settings.accent);
        
        // popout button
/*
        if ( window.self !== window.top ) {
            $( '.popoutBtn' ).removeClass( 'hide' ).on( 'click', function() {
                
                window.open( window.location.href, '_blank' );
                
            } );
        }
*/
        
    }
    
    function _updateSplashScreen( bg ) {
        
        if ( bg !== undefined ) {
            
            $( '.splashscreen .splash_background' ).css( {
                'background-image': 'url(' + bg + ')',
                'opacity': 0
            } ).animate({
                'opacity': 1
            }, 500, 'linear' );
            
        }
        
    }
    
    return {
        
        get: get,
        unbindStartPresentationBtn: unbindStartPresentationButton,
        unbindResumePresentationBtn: unbindResumePresentationButton
        
    };
    
} )();