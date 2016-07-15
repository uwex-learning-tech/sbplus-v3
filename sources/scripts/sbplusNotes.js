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
        var note = $( page ).find( 'note' ).text();
        var region = $( '.widget_container .notes' );
        var notesBtn = $( '.control_bar_wrapper .notesBtn' );
        
        if ( !$.fn.isEmpty( note ) ) {
            
            region.removeClass( 'noNotes' ).attr( 'tabindex', 1 ).html( note );
            
            if ( $( '.main_content_wrapper' ).hasClass( 'full-view' ) ) {
                notesBtn.removeClass( 'hide' );
            }
            
            $( '.sr-PageStatus .hasNotes' ).html('This page contains notes.');
            
        } else {
            
            var logoSrc = manifest.sbplus_logo_directory + $.fn.getProgramDirectory() + '.svg';
            var logo = new Image();
            
            region.html( '' ).addClass( 'noNotes' ).attr( 'tabindex', -1 );
            $( '.sr-PageStatus .hasNotes' ).html('');
            
            if ( logoLoaded.length === 0 ) {
                
                $( logo ).load( function() {
                
                    logoLoaded = logo;
                    region.html( logo );
                    
                } ).error( function() {
                    
                    logoLoaded = '<img src="' + manifest.sbplus_logo_directory + manifest.sbplus_logo_default + '.svg" />';
                    region.html( logoLoaded );
                    
                } ).attr( {
                    'src': logoSrc
                } );
                
            } else {
                
                region.html( logoLoaded );
                
            }
            
            notesBtn.addClass( 'hide' );
            sbplusControls.resetNote();
        }
        
    }
    
    return {
        
        get: get
        
    };
    
} )();