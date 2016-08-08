/***************************************
    Get Notes Module
****************************************/

var sbplusNotes = ( function() {
    
    var context;
    var manifest;
    var logoLoaded = '';
    
    function get( _manifest, _context, section, page ) {
        
        context = _context;
        manifest = _manifest;
        
        _render( section, page );
        
    }
    
    function _render( s, p ) {
        
        var page = $( context[s] ).find( 'page' )[p];
        var note = $.fn.stripScript( $( page ).find( 'note' ).text() );
        var region = $( '.widget_container .notes' );
        var notesBtn = $( '.control_bar_wrapper .notesBtn' );
        var docWidth = $(document).width();
        var docHeight = $(document).height();
        
        if ( !$.fn.isEmpty( note ) ) {
            
            region.removeClass( 'noNotes' ).attr( 'tabindex', 1 ).html( note );
            
            if ( region.find( 'a' ).length ) {

        		region.find( 'a' ).each( function() {
            		
        			$( this ).attr( "target", "_blank" );
        
                } );
        
            }
            
            if ( $( '.main_content_wrapper' ).hasClass( 'full-view' ) ) {
                notesBtn.removeClass( 'hide' );
            }

            if ( docWidth <= 414 && docHeight <= 736 ) {
                
                region.addClass('hide');
                notesBtn.removeClass( 'hide' );
                
            }
            
            $( '.sr-PageStatus .hasNotes' ).html( 'This page contains notes.');
            $( '#pageHasNotes' ).html( 'This page contains notes.' );
            
        } else {
            
            var logoSrc = manifest.sbplus_logo_directory + $.fn.getProgramDirectory() + '.svg';
            var logo = new Image();
            
            region.html( '' ).addClass( 'noNotes' ).attr( 'tabindex', -1 );
            $( '.sr-PageStatus .hasNotes' ).empty();
            $( '#pageHasNotes' ).empty();
            
            if ( logoLoaded.length === 0 ) {
                
                logo.src = logoSrc;
                
                $( logo ).on( 'load', function() {
                    
                    logoLoaded = logo;
                    region.html( logo );
                    
                } );
                
                $( logo ).on( 'error', function() {
                    
                    logoLoaded = '<img src="' + manifest.sbplus_logo_directory + manifest.sbplus_logo_default + '.svg" />';
                    region.html( logoLoaded );
                    
                } );
                
            } else {
                
                region.html( logoLoaded );
                
            }
            
            if ( docWidth <= 414 && docHeight <= 736 ) {
                notesBtn.addClass( 'hide' );
                region.addClass('hide');
            }
            
            notesBtn.addClass( 'hide' );
            sbplusControls.resetNote();
            
        }
        
    }
    
    return {
        
        get: get
        
    };
    
} )();