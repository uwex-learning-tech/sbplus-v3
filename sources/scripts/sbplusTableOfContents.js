/***************************************
    Get Table of Contents Module
****************************************/
var sbplusTableOfContents = ( function() {
    
    var context;
    
    function get( _context ) {
        
        context = _context;
        _render();
        
    }
    
    function _render() {
        
        var toc = $( '.tableOfContents' );
        
        $.each( context.section, function( index ) {
            
            var page = $( this ).find( 'page' );
            var sectionTitle = ( $.fn.isEmpty( $( this ).attr( 'title' ) ) ) ? 'Section ' + ( index + 1 ) : $( this ).attr( 'title' );
            
            toc.append( '<div class="section"><div class="header"><div class="title">' + sectionTitle + '</div><div class="expandCollapseIcon"><span class="icon-collapse"></span></div></div><div class="content"><ul class="selectable">' );
            
            $.each( page, function( j ) {
                    
                $( '.selectable:eq(' + index + ')' ).append( '<li class="selectee" data-slide="' + j + '">' + ( ( $( this ).attr( 'type' ) !== 'quiz' ) ? '<span class="num">' + ( context.trackCount + 1 ) + '.</span> ' : '<span class="icon-assessment"></span> ' ) + $( this ).attr('title') + '</li>' );
                
                context.trackCount++;
                
            } );
            
            toc.append( '</ul></div></div>' );
            
        } );
        
        bindTOCEvents();
        
    }
    
    function bindTOCEvents() {
        
        var sectionHeader = $( '.tableOfContents .section .header' );
        var item = $( '.selectable .selectee' );
        
        if ( context.section.length >= 2 ) {
            
            sectionHeader.on( 'click', function() {
            
                var content = $( this ).parent().find( '.content' );
                var icon = $( this ).parent().find( '.expandCollapseIcon' ).find( 'span' );
                
                if ( $( content ).is( ':visible' ) ) {
                    
                    content.slideUp( 250, function() {
                        
                        $( icon ).removeClass( 'icon-collapse' ).addClass( 'icon-open' );
                        
                    } );
                    
                } else {
                    
                    content.slideDown( 250, function() {
                        
                        $( icon ).removeClass( 'icon-open' ).addClass( 'icon-collapse' );
                        
                    } );
                    
                }
                
            } );
            
        } else {
            
            sectionHeader.remove();
            
        }
        
        item.on( 'click', function() {
            
            if ( context.section.length >= 2 ) {
                
                var header = $( this ).parent().parent().prev();
                
                // reset old
                $( '.header' ).removeClass( 'current' );
                
                // hightlight new
                $( header ).addClass( 'current' );
                
            }
            
            item.removeClass( 'selected' );
            $( this ).addClass( 'selected' );
            
        } );
        
    }
    
    return {
        
        get: get
        
    };
    
} )();