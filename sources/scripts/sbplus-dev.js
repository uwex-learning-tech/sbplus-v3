/**
 * Storybook Plus
 *
 * @author: Ethan S. Lin
 * @url: https://github.com/oel-mediateam/sbplus_v3
 * @version: 3.0.0
 * Released MM/DD/2016
 *
   Storybook Plus Web Application Version 3
   Copyright (C) 2013-2016  Ethan S. Lin

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
 
 /* global Modernizr */

/***************************************
    Storybook Plus Module
****************************************/

var sbplus = ( function() {
    
    var manifest;
    var settings = {
        
        accent: '#535cab',
        slideFormat: 'jpg',
        analytics: 'off',
        xmlVersion: '3',
        trackCount: 0
        
    };
    var context = {
        
        data: '',
        trackCount: 0
        
    };
    
    var $sbplus;
    
    $( document ).ready( function() {
        
        $sbplus = $( '.sbplus_wrapper' );
        
        $.getJSON( $.fn.getConfigFileUrl(), function( e ) {
        
            manifest = e;
            loadSBPlusData();
            
        } ).fail( function() {
            
            sbplusError.show( 'Configuration file (manifest.json) is not found!', 'Please make sure the index.html file is compatible with Storybook Plus version 3.');
            
        } );
        
    } );
    
    function loadSBPlusData() {
        
        if ( $.fn.haveCoreFeatures() ) {
            
            $.get( 'assets/sbplus.xml', function( data ) {
                
                context.data = $( data );
                loadPresentation();
                
            }).fail( function() {
                
                sbplusError.show( 'Table of Contents XML file (sbplus.xml) is not found!', 'Please make sure the XML file exists in the assets directory and compatible with Storybook Plus version 3.' );
                
            } );
            
        } else {
            
            $.get( manifest.sbplus_root_directory + 'scripts/templates/nosupport.tpl', function( e ) {
                
                renderUnsupportedMessage( e );
                
            } ).fail( function() {
                
                sbplusError.show( 'Unsupported web browser!', 'Your web browser does not support current version of Storybook Plus. In addition, nosupport.tpl file is not found. nosuppory.tpl file contains information to display in regard to unsupported web browsers.');
                
            } );
            
        }
        
    }
    
    function loadPresentation() {
        
        var globalCntxt = context.data.find( 'storybook' );
        var setupCntxt = context.data.find( 'setup' );
        
        context.title = setupCntxt.find( 'title' ).text();
        context.subtitle = setupCntxt.find( 'subtitle' ).text();
        context.author = setupCntxt.find( 'author' ).attr( 'name' );
        context.authorBio = setupCntxt.find( 'author' ).text();
        context.length = setupCntxt.find( 'length' ).text();
        context.generalInfo = setupCntxt.find( 'generalInfo' ).text();
        context.postfix = setupCntxt.attr( 'postfix' );
        context.section = context.data.find( 'section' );
        
        settings.accent = $.fn.isEmpty( globalCntxt.attr( 'accent' ) ) ? settings.accent : globalCntxt.attr( 'accent' );
        settings.slideFormat = $.fn.isEmpty( globalCntxt.attr( 'slideFormat' ) ) ? settings.slideFormat : globalCntxt.attr( 'slideFormat' );
        settings.analytics = $.fn.isEmpty( globalCntxt.attr( 'analytics' ) ) ? settings.analytics : globalCntxt.attr( 'analytics' );
        
        $.get( manifest.sbplus_root_directory + 'scripts/templates/sbplus.tpl', function( e ) {
            
            renderSBPlus( e );
            
        } ).fail( function() {
            
            sbplusError.show( 'Template file not found!', 'sbplus.tpl file not found in the templates directory.' );
            
        } );
        
    }
    
    function renderTableOfContents() {
        
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
        
    }
    
    function renderPresentation() {
        
        $( '.splashscreen' ).fadeOut( 'fast', function() {
                
            $( '.main_content_wrapper' ).css( 'display', 'flex' ).fadeIn( 500, function() {
                
                $( this ).removeClass( 'hide' );
                
                $( '.title_bar .title' ).html( context.title );
                $( '.author' ).html( context.author );
                
                renderTableOfContents();
                bindTOCEvents();
                bindMenuEvents();
                
            } );
            
            $( this ).remove();
            sbplusSplashScreen.unbindStartPresentationBtn();
            
        } );
        
    }
    
    function renderSBPlus( e ) {

        $( document ).attr( "title", context.title );
        $sbplus.html( e );
        sbplusSplashScreen.get( manifest, context, settings );
        
    }
    
    function renderUnsupportedMessage( e ) {
        
        $sbplus.html( e );
        
    }
    
    function renderMenuItemDetails( el, title, content ) {
        
        if ( typeof el === 'undefined' ) {
            
            $( '.menu_item a' ).attr( 'aria-expanded', 'false' );
        
            $( '.menu_item_details' ).attr( 'aria-expanded', 'false' ).animate( { right: '-258px' }, 250, function() {
                
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
    
    
    // event functions
    
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
    
    function bindTOCEvents() {
        
        if ( context.section.length >= 2 ) {
            
            $( '.tableOfContents .section .header' ).on( 'click', function() {
            
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
            
            $( '.tableOfContents .section .header' ).remove();
            
        }
        
        $( '.selectable .selectee' ).on( 'click', function() {
            
            if ( context.section.length >= 2 ) {
                
                var header = $( this ).parent().parent().prev();
                
                // reset old
                $( '.header' ).removeClass( 'current' );
                
                // hightlight new
                $( header ).addClass( 'current' );
                
            }
            
            $( '.selectable .selectee' ).removeClass( 'selected' );
            $( this ).addClass( 'selected' );
            
        } );
        
    }
        
    return {
        
        render: renderPresentation
        
    };
    
} )();