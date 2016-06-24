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
        
        $( '.control_bar_wrapper .downloadsBtn' ).on( 'click', function() {
            
            var items = $( '.download_items' );
            
            if ( items.hasClass( 'hide' ) ) {
                
                items.removeClass( 'hide' );
                
            } else {
                
                items.addClass( 'hide' );
                
            }
            
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
                
                // reset note & toc
                resetNote();
                $( '.control_bar_wrapper .expandOnly .tocBtn' ).removeClass( 'active' );
                $( '.widget_container .side_panel' ).css( 'right', '' );
                
            } else {
                
                pageContainer.addClass( 'expanded' ).removeClass( 'aspect-ratio' );
                expandedControls.removeClass( 'hide' );
                widgets.addClass( 'hide' );
                btnIcon.removeClass( 'icon-expand' ).addClass( 'icon-contract' );
                mainContainerWrapper.addClass( 'full-view' );
                
            }
            
            sbplus.resize();
            
        } );
        
        $( '.control_bar_wrapper .expandOnly .notesBtn' ).on( 'click', function() {
            
            var self = this;
            var notes = $( '.widget_container .notes' );
            
            if ( notes.hasClass( 'hide' ) ) {
                
                notes.removeClass( 'hide' ).animate( {
                    
                    top: '-250px'
                    
                }, 250, function() {
                    
                    $( self ).addClass( 'active' );
                    
                } );
                
            } else {
                
                notes.animate( {
                    
                    top: '40px'
                    
                }, 250, function() {
                    
                    notes.addClass( 'hide' );
                    $( self ).removeClass( 'active' );
                    
                } );
                
            }
            
        } );
        
        $( '.control_bar_wrapper .expandOnly .tocBtn' ).on( 'click', function() {
            
            var self = this;
            var toc = $( '.widget_container .side_panel' );
            
            if ( toc.hasClass( 'hide' ) ) {
                
                toc.removeClass( 'hide' ).animate( {
                    
                    right: '0'
                    
                }, 250, function() {
                    
                    $( self ).addClass( 'active' );
                    
                } );
                
            } else {
                
                toc.animate( {
                    
                    right: ( toc.outerWidth() * -1 ) + 'px'
                    
                }, 250, function() {
                    
                    toc.addClass( 'hide' );
                    $( self ).removeClass( 'active' );
                    
                } );
                
            }
            
        } );
        
        _render();
        
    }
    
    function getDownloadItems() {
        
        var items = sbplusDownloadable.getDownloads();
        var files = $( '.download_items .files' );
        
        if ( items.video !== undefined ) {
            
            files.append( '<li><a href="'+items.video+'" download>Video</a></li>' );
        }
        
        if ( items.audio !== undefined ) {
            
            files.append( '<li><a href="'+items.audio+'" download>Audio</a></li>' );
        }
        
        if ( items.pdf !== undefined ) {
            
            files.append( '<li><a href="'+items.pdf+'" download>Transcript</a></li>' );
        }
        
        if ( items.zip !== undefined ) {
            
            files.append( '<li><a href="'+items.zip+'" download>Supplement</a></li>' );
        }
        
    }
    
    function updateStatus( num ) {
        
        num = typeof num !== 'undefined' ? num : currentPage;
        $( '.control_bar_wrapper .status .current' ).html( num + 1 );
        
    }
    
    function resetNote() {
        $( '.control_bar_wrapper .expandOnly .notesBtn' ).removeClass( 'active' );
        $( '.full-view .widget_container .notes' ).css( 'top', '40px' ).addClass( 'hide' );
    }
    
    function _render() {
        
        updateStatus();
        $( '.control_bar_wrapper .status .total' ).html( totalPages );
        getDownloadItems();
        
    }
    
    return {
        
        init: init,
        update: updateStatus,
        resetNote: resetNote
        
    };
    
} )();