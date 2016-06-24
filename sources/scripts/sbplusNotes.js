/***************************************
    Get Notes Module
****************************************/

var sbplusNotes = ( function() {
    
    var context;
    var manifest;
    
    function get( _manifest, _context, section, page ) {
        
        context = _context;
        manifest = _manifest;
        
        _render( section, page );
        
    }
    
    function _render( s, p ) {
        
        var page = $( context[s] ).find( 'page' )[p];
        var note = $( page ).find( 'note' ).text();
        var region = $( '.widget_container .notes' );
        var notesBtn = $( '.control_bar_wrapper .expandOnly .notesBtn' );
        
        if ( !$.fn.isEmpty( note ) ) {
            region.removeClass( 'noNotes' ).html( note );
            notesBtn.removeClass( 'hide' );
        } else {
            
            var logoSrc = manifest.sbplus_logo_directory + $.fn.getProgramDirectory() + '.svg';
            var logo = new Image();
            
            region.html( '' ).addClass( 'noNotes' );
            
            $( logo ).load( function() {
                
                region.html( logo );
                
            } ).error( function() {
                
                region.html(  '<img src="' + manifest.sbplus_logo_directory + manifest.sbplus_logo_default + '.svg" />' );
                
            } ).attr( {
                'src': logoSrc
            } );
            
            notesBtn.addClass( 'hide' );
            sbplusControls.resetNote();
        }
        
    }
    
    return {
        
        get: get
        
    };
    
} )();