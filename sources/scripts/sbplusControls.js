/***************************************
    Storybook Plus Module
****************************************/

var sbplusControls = ( function() {
    
    var context;
    var settings;
    
    var totalSection = 0;
    var totalPages = 0;
    var currentPage = 0;
    
    function init( _context, _settings ) {
        
        context = _context;
        settings = _settings;
    
        totalPages = $( context ).find( 'page' ).length;
        totalSection = $( context ).length;
        
        $( '.control_bar_wrapper .next' ).on( 'click', function() {
            
            var section = Number( $( '.selectee.selected' ).data( 'section' ) );
            var totalPagesInSection = $( context[section] ).find( 'page' ).length;
            var page = Number( $( '.selectee.selected' ).data( 'page' ) );
            
            currentPage = Number( $( '.selectee.selected' ).data( 'order' ) );
            
            if ( page < totalPagesInSection - 1 ) {
                
                page++;
                
            } else {
                
                page = 0;
                
                if ( section < totalSection - 1 ) {
                    
                    section++;
                    
                }
                
            }
            
            currentPage++;
            
            if ( currentPage > totalPages - 1 ) {
                
                page = 0;
                section = 0;
                currentPage = 0;
                
            } 
            
            sbplusSlide.get( context, settings, section, page );
            
        });
        
        $( '.control_bar_wrapper .previous' ).on( 'click', function() {
            
            var section = Number( $( '.selectee.selected' ).data( 'section' ) );
            var totalPagesInSection = $( context[section] ).find( 'page' ).length;
            var page = Number( $( '.selectee.selected' ).data( 'page' ) );
            
            currentPage = Number( $( '.selectee.selected' ).data( 'order' ) );
            
            if ( page < totalPagesInSection && page > 0 ) {
                
                page--;
                currentPage--;
                
            } else {
                
                section--;
                
                if ( section < 0 ) {
                    
                    section = totalSection - 1;
                    
                }
                
                page = $( context[section] ).find( 'page' ).length - 1;
                currentPage = page;
                
            }
            
            sbplusSlide.get( context, settings, section, page );
            
        } );
        
        $( '.control_bar_wrapper .expandContractBtn' ).on( 'click', function() {
            
            var pageContainer = $( '.page_container' );
            var expandedControls = $( '.control_bar_wrapper .expandOnly' );
            var isExpanded = pageContainer.hasClass( 'expanded' );
            var widgets = $( '.notes, .side_panel' );
            var btnIcon = $( this ).find( 'span' );
            var mainContainerWrapper = $( '.main_content_wrapper' );
            
            if ( isExpanded ) {
                
                pageContainer.removeClass( 'expanded' ).addClass( 'aspect-ratio' ).css( 'height', 'auto' );
                expandedControls.addClass( 'hide' );
                widgets.removeClass( 'hide' );
                btnIcon.removeClass( 'icon-contract' ).addClass( 'icon-expand' );
                mainContainerWrapper.removeClass( 'full-view' );
                
            } else {
                
                pageContainer.addClass( 'expanded' ).removeClass( 'aspect-ratio' );
                expandedControls.removeClass( 'hide' );
                widgets.addClass( 'hide' );
                btnIcon.removeClass( 'icon-expand' ).addClass( 'icon-contract' );
                mainContainerWrapper.addClass( 'full-view' );
                
            }
            
            sbplus.resize();
            
        } );
        
        _render();
        
    }
    
    function updateStatus( num ) {
        
        num = typeof num !== 'undefined' ? num : currentPage;
        
        $( '.control_bar_wrapper .status .current' ).html( num + 1 );
        
    }
    
    function _render() {
        
        updateStatus();
        $( '.control_bar_wrapper .status .total' ).html( totalPages );
        
    }
    
    return {
        
        init: init,
        update: updateStatus
        
    };
    
} )();