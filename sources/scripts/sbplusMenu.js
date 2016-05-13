/***************************************
    Get Menu Module
****************************************/

var sbplusMenu = ( function() {
    
    var context;
    
    function get( _context ) {
        
        context = _context;
        _render();
        
    }
    
    function _render() {
        
        bindMenuEvents();
        
    }
    
    function bindMenuEvents() {
 
        $( '.menuBtn' ).on( 'click', function() {
        
            $( this ).attr( 'aria-expanded', 'true' );
            $( '#menu_panel' ).removeClass( 'hide' ).attr( 'aria-expanded', 'true' );
            
            return false;
        
        } );
        
        
        $( '.backBtn' ).on( 'click', function() {
        
            renderMenuItemDetails();
            
            return false;
        
        } );
        
        $( '.closeBtn' ).on( 'click', function() {
        
            $( '.menuBtn' ).attr( 'aria-expanded', 'false' );
            $( '#menu_panel' ).addClass( 'hide' ).attr( 'aria-expanded', 'false' );
            
            renderMenuItemDetails();
            return false;
        
        } );
        
        $( '#showProfile' ).on( 'click', onMenuItemClick );
        $( '#showGeneralInfo' ).on( 'click', onMenuItemClick );
        $( '#showHelp' ).on( 'click', onMenuItemClick );
        $( '#showSettings' ).on( 'click', onMenuItemClick );
     
    }
    
    function onMenuItemClick () {
    
        var title, content; 
        var selector = '#' + this.id;
        
        switch ( selector ) {
        
            case '#showProfile':
                
                title = 'Author Profile';
                content = context.authorBio;
                
            break;
            
            case '#showGeneralInfo':
                
                title = 'General Information';
                content = context.generalInfo;
                
            break;
            
            case '#showHelp':
                
                title = 'Help';
                content = '<p>Help information go here...</p>';
                
            break;
            
            case '#showSettings':
                
                title = 'Settings';
                content = '<p>Settings go here...</p>';
                
            break;
            
            default:
            
                title = '';
                content ='';
                
            break;
            
        }
        
        if ( title !== '' && content !== '' ) {
            
            renderMenuItemDetails( this, title, content );
            
        }
        
        return false;
        
    }
    
    function renderMenuItemDetails( el, title, content ) {
        
        if ( typeof el === 'undefined' ) {
            
            $( '.menu_item a' ).attr( 'aria-expanded', 'false' );
        
            $( '.menu_item_details' ).attr( 'aria-expanded', 'false' ).animate( { right: '-100%' }, 250, function() {
                
                $( this ).addClass( 'hide' );
            
            } );
            
            return;
            
        }
        
        $( el ).attr( 'aria-expanded', 'true' );
        
        $( '.menu_item_details' ).attr( 'aria-expanded', 'true' );
        $( '.menu_item_details .navbar .title' ).html( title );
        $( '.menu_item_details .menu_item_content' ).html( content );
        $( '.menu_item_details' ).removeClass( 'hide' ).animate( { right: '0px' }, 250 );
        
    }
    
    return {
        
        get: get
        
    };
    
} )();