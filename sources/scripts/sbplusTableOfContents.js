/***************************************
    Get Table of Contents Module
****************************************/
var sbplusTableOfContents = ( function() {
    
    var context;
    var settings;
    
    function get( _context, _settings ) {
        
        settings = _settings;
        context = _context;
        _render();
        
    }
    
    function _render() {
        
        var toc = $( '.tableOfContents' );
        
        $.each( context.section, function( s ) {
            
            var page = $( this ).find( 'page' );
            var sectionTitle = ( $.fn.isEmpty( $( this ).attr( 'title' ) ) ) ? 'Section ' + ( s + 1 ) : $( this ).attr( 'title' );
            
            toc.append( '<div class="section"><div class="header"><div class="title">' + sectionTitle + '</div><div class="expandCollapseIcon"><span class="icon-collapse"></span></div></div><div class="content"><ul class="selectable">' );
            
            $.each( page, function( p ) {
                
                $( '.selectable:eq(' + s + ')' ).append( '<li class="selectee" data-section="' + s + '" data-page="' + p + '" data-order="' + context.trackCount + '">' + ( ( $( this ).attr( 'type' ) !== 'quiz' ) ? '<span class="num">' + ( context.trackCount + 1 ) + '.</span> ' : '<span class="icon-assessment"></span> ' ) + $( this ).attr('title') + '</li>' );
                
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
            
            if ( !$( this ).hasClass( 'selected' ) ) {
                
                sbplusSlide.get( context.section, settings, $( this ).data( 'section' ), $( this ).data( 'page' ) );
                
            } 
            
            item.removeClass( 'selected' );
            $( this ).addClass( 'selected' );
            
        } );
        
    }
    
    function updateSelected( s, p ) {
        
        var currentHeader = $( '.section .header:eq(' + s + ')' );
        var currentPage = $( '.section:eq(' + s + ') .selectee[data-page="' + p + '"]' );
        
        // reset
        $( '.header' ).removeClass( 'current' );
        $( '.selectee' ).removeClass( 'selected' );
        
        // hightlight new
        currentHeader.addClass( 'current' );
        currentPage.addClass( 'selected' );
        
        setTimeout(function() {
            sbplusControls.update( currentPage.data( 'order' ) );
        }, 250);
        
    }
    
    return {
        
        get: get,
        update: updateSelected
        
    };
    
} )();