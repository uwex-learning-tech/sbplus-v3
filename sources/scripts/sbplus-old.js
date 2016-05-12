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
 
var sbplus = sbplus || {
        
    accent: '#535cab',
    slideFormat: 'jpg',
    analytics: 'off',
    xmlVersion: '3',
    trackCount: 0
    
};
 
/**** ON DOM READY ****/

$( function() {
    
    $.getJSON( $.fn.getConfigFileUrl(), function( data ) {
        
        $.fn.loadSBPlus( data );
        
    } ).fail( function() {
        
        $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Configuration file (manifest.json) is not found!</h1><p>Please make sure the index.html file is compatible with Storybook Plus version 3.</p></div>' );
        
    });
    
} );

/**** CORE ****/

$.fn.loadSBPlus = function( configs ) {
    
    // check for core compatible features
    if ( $( this ).haveCoreFeatures() ) {
        
        $.get( 'assets/sbplus.xml', function( data ) {
            
            $.fn.loadPresentation( configs, $( data ) );
            
        }).fail( function() {
            
            $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Table of Contents XML file (sbplus.xml) is not found!</h1><p>Please make sure the XML file exists in the assets directory and compatible with Storybook Plus version 3.</p></div>' );
            
        } );
        
    } else {
        
        $.get( configs.sbplus_root_directory + 'scripts/templates/nosupport.tpl', function( template ) {
            
            $( '.sbplus_wrapper' ).html( template );
            
        } ).fail( function() {
            
            $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Template file not found!</h1><p>nosupport.tpl file not found in the templates directory.</p></div>' );
            
        } );
        
    }
    
};
 
$.fn.loadPresentation = function( configs, context ) {
    
    // set the sbplus object contexts
    var globalCntxt = context.find( 'storybook' );
    var setupCntxt = context.find( 'setup' );
    
    sbplus.title = setupCntxt.find( 'title' ).text();
    sbplus.subtitle = setupCntxt.find( 'subtitle' ).text();
    sbplus.author = setupCntxt.find( 'author' ).attr( 'name' );
    sbplus.authorBio = setupCntxt.find( 'author' ).text();
    sbplus.length = setupCntxt.find( 'length' ).text();
    sbplus.generalInfo = setupCntxt.find( 'generalInfo' ).text();
    sbplus.postfix = setupCntxt.attr( 'postfix' );
    
    sbplus.accent = ( $.fn.isEmpty( globalCntxt.attr( 'accent' ) ) ) ? sbplus.accent : globalCntxt.attr( 'accent' );
    sbplus.slideFormat = ( $.fn.isEmpty( globalCntxt.attr( 'slideFormat' ) ) ) ? sbplus.slideFormat : globalCntxt.attr( 'slideFormat' );
    sbplus.analytics = ( $.fn.isEmpty( globalCntxt.attr( 'analytics' ) ) ) ? sbplus.analytics : globalCntxt.attr( 'analytics' );
    
    sbplus.section = context.find( 'section' );
    
    // set the document/page title
    $( document ).attr( "title", sbplus.title );
    
    // get the sbplus template via ajax
    $.get( configs.sbplus_root_directory + 'scripts/templates/sbplus.tpl', function( sbplusFrame ) {
        
        // display the sbplus frame
        $( '.sbplus_wrapper' ).html( sbplusFrame );
        
        // get and display the splash screen
        $.get( configs.sbplus_root_directory + 'scripts/templates/splashscreen.tpl', function( splashscreen ) {
            
            // set the splashscreen DOM
            $( '.splashscreen' ).html( splashscreen );
            
            // get the splash screen image
            $.get( 'assets/splash.jpg', function() {
                        
                $( '.splashscreen' ).css( 'background-image', 'url(assets/splash.jpg)' );
                
            } ).fail( function() {
                
                $.get( configs.sbplus_splash_directory + $.fn.getProgramDirectory() + sbplus.postfix + '.jpg' , function() {
                
                    $( '.splashscreen' ).css( 'background-image', 'url(' + this.url + ')' );
                    
                } ).fail( function() {
                    
                    $.get( configs.sbplus_splash_directory + $.fn.getProgramDirectory() + '.jpg' , function() {
                
                        $( '.splashscreen' ).css( 'background-image', 'url(' + this.url + ')' );
                        
                    } );
                    
                } );
                
            } );
            
            // set & display presentation informations on splash screen
            $( '.splashinfo .title' ).html( sbplus.title );
            $( '.splashinfo .subtitle' ).html( sbplus.subtitle );
            $( '.splashinfo .author' ).html( sbplus.author );
            $( '.splashinfo .length' ).html( sbplus.length );
            $( '.splashinfo .startBtn' ).css( 'background-color', sbplus.accent );
            
            if ( navigator.cookieEnabled && $.fn.checkValueInCookie( 'sbplus-' + $.fn.getRootDirectory() ) ) {
                
                $( '.splashinfo .resumeBtn' ).css( 'background-color', sbplus.accent )
                                             .removeClass( 'hide' );

            }
            
            // bind start button for splash screen
            $( '.splashinfo .startBtn' ).on( 'click', function() {
                
                $( '.splashscreen' ).fadeOut( 'fast', function() {
                    
                    $( '.main_content_wrapper' ).css( 'display', 'flex' ).fadeIn( 500, function() {
                        
                        // remove the hide class from the main contain wrapper
                        $( this ).removeClass( 'hide' );
                        
                        $.fn.startPresentation();
                        
                    } );
                    
                    // remove the splash screen from the dom
                    $( this ).remove();
                    
                } );
                
            } );
            
            $.fn.loadTableOfContents();
            $.fn.getDownloadableFiles( configs );
            
        } ).fail( function() {
            
            $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Template file not found!</h1><p>splashscreen.tpl file not found in the templates directory.</p></div>' );
            
        } );
        
    } ).fail( function() {
            
        $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Template file not found!</h1><p>sbplus.tpl file not found in the templates directory.</p></div>' );
        
    } );
    
};

$.fn.startPresentation = function() {
    
    $( '.title_bar .title' ).html( sbplus.title );
    $( '.author' ).html( sbplus.author );
    
    $.fn.bindMenuEvents();
    
};

$.fn.loadTableOfContents = function() {
    
    $.each( sbplus.section, function( index ) {
        
        var page = $( this ).find( 'page' );
        var sectionTitle = ( $.fn.isEmpty( $( this ).attr( 'title' ) ) ) ? 'Section ' + ( index + 1 ) : $( this ).attr( 'title' );
        
        $( '.tableOfContents' ).append( '<div class="section"><div class="header"><div class="title">' + sectionTitle + '</div><div class="expandCollapseIcon"><span class="icon-collapse"></span></div></div><div class="content"><ul class="selectable">' );
        
        $.each( page, function( j ) {
            
            if ( $( this ).attr( 'type' ) !== 'quiz' ) {
                
                $( '.selectable:eq(' + index + ')' ).append( '<li class="selectee" data-slide="' + j + '"><span class="num">' + ( sbplus.trackCount + 1 ) +'.</span> ' + $( this ).attr('title') + '</li>' );
                
            } else {
                
                $( '.selectable:eq(' + index + ')' ).append( '<li class="selectee" data-slide="' + j + '"><span class="icon-assessment"></span> ' + $( this ).attr('title') + '</li>' );
                
            }
            
            sbplus.trackCount++;
            
        } );
        
        $( '.tableOfContents' ).append( '</ul></div></div>' );
        
    } );
    
    if ( sbplus.section.length >= 2 ) {
        
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
        
        if ( sbplus.section.length >= 2 ) {
            
            var header = $( this ).parent().parent().prev();
            
            // reset old
            $( '.header' ).removeClass( 'current' );
            
            // hightlight new
            $( header ).addClass( 'current' );
            
        }
        
        $( '.selectable .selectee' ).removeClass( 'selected' );
        $( this ).addClass( 'selected' );
        
    } );
    
};

$.fn.getDownloadableFiles = function() {
    
    $.get( $.fn.getProgramDirectory() + '.mp4', function() {
        
        sbplus.videoDownloadSrc = this.url;
        $( '.dl_item.video' ).attr( 'href', sbplus.videoDownloadSrc ).removeClass( 'hide' );
        
    } );
    
    $.get( $.fn.getProgramDirectory() + '.mp3', function() {
        
        sbplus.audioDownloadSrc = this.url;
        $( '.dl_item.audio' ).attr( 'href', sbplus.audioDownloadSrc ).removeClass( 'hide' );
        
    } );
    
    $.get( $.fn.getProgramDirectory() + '.pdf', function() {
        
        sbplus.pdfDownloadSrc = this.url;
        $( '.dl_item.pdf' ).attr( 'href', sbplus.pdfDownloadSrc ).removeClass( 'hide' );
        
    } );
    
    $.get( $.fn.getProgramDirectory() + '.zip', function() {
        
        sbplus.zipDownloadSrc = this.url;
        $( '.dl_item.zip' ).attr( 'href', sbplus.zipDownloadSrc ).removeClass( 'hide' );
        
    } );
    
};

/**** HELPER METHODS ****/
 
$.fn.haveCoreFeatures = function() {
    
    if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.flexbox ) {
    
        return false;
    
    }
    
    return true;
     
};
 
$.fn.getConfigFileUrl = function() {
 
    var configsFile = document.getElementById( 'sbplus_configs' );
    
    if ( configsFile === null ) {
     
     return false;
     
    }
    
    return configsFile.href;
 
};
 
$.fn.getProgramDirectory = function() {

    var url = window.location.href.split( "/" );
    
    if ( $.fn.isEmpty( url[url.length - 1] ) || new RegExp( '[\?]' ).test( url[url.length - 1] ) ) {
        
        url.splice( url.length - 1, 1 );
        
    }
    
    if ( url[4] === undefined ) {
        
        return url[3];
        
    }
    
    return url[4];

};

$.fn.getRootDirectory = function() {
    
    var url = window.location.href.split( "/" );
    
    if ( $.fn.isEmpty( url[url.length - 1] ) || new RegExp( '[\?]' ).test( url[url.length - 1] ) || url[url.length - 1] === 'index.html'  ) {
        
        url.splice( url.length - 1, 1 );
        
    }
    
    return url[url.length - 1];
    
};
 
$.fn.isEmpty = function( str ) {
    
    return ( !str.trim() || str.trim().length === 0 );
 
};
 
$.fn.bindMenuEvents = function() {
 
    $( '.menuBtn' ).on( 'click', function() {
    
        $( this ).attr( 'aria-expanded', 'true' );
        $( '#menu_panel' ).removeClass( 'hide' ).attr( 'aria-expanded', 'true' );
        
        return false;
    
    } );
    
    
    $( '.backBtn' ).on( 'click', function() {
    
        $.fn.hideMenuItemDetails();
        
        return false;
    
    } );
    
    $( '.closeBtn' ).on( 'click', function() {
    
        $( '.menuBtn' ).attr( 'aria-expanded', 'false' );
        $( '#menu_panel' ).addClass( 'hide' ).attr( 'aria-expanded', 'false' );
        
        $.fn.hideMenuItemDetails();
        return false;
    
    } );
    
    // menu items
    $( '#showProfile' ).onMenuItemClick();
    $( '#showGeneralInfo' ).onMenuItemClick();
    $( '#showHelp' ).onMenuItemClick();
    $( '#showSettings' ).onMenuItemClick();
 
};

$.fn.onMenuItemClick = function() {
    
    var title, content;
    
    $( this ).on( 'click', function() {
        
        var selector = '#' + this.id;
        
        switch ( selector ) {
        
            case '#showProfile':
                
                title = 'Author Profile';
                content = sbplus.authorBio;
                
            break;
            
            case '#showGeneralInfo':
                
                title = 'General Information';
                content = sbplus.generalInfo;
                
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
            
            $( this ).showMenuItemDetails( title, content );
            
        }
        
        return false;
        
    } );
    
};
 
$.fn.showMenuItemDetails = function( title, content ) {
 
    $(this).attr( 'aria-expanded', 'true' );
    
    $( '.menu_item_details' ).attr( 'aria-expanded', 'true' );
    $( '.menu_item_details .navbar .title' ).html( title );
    $( '.menu_item_details .menu_item_content' ).html( content );
    $( '.menu_item_details' ).removeClass( 'hide' ).animate( { right: '0px' }, 250 );
 
};
 
$.fn.hideMenuItemDetails = function() {
 
    $( '.menu_item a' ).attr( 'aria-expanded', 'false' );
    
    $( '.menu_item_details' ).attr( 'aria-expanded', 'false' ).animate( { right: '-258px' }, 250, function() {
        
        $( this ).addClass( 'hide' );
    
    } );
 
};


/********** COOKIE METHODS ***************/

$.fn.setCookie = function( cname, cvalue, exdays ) {
    
    var d = new Date();
    
    d.setTime( d.getTime() + ( exdays * 24 * 60 * 60 * 1000 ) );
    
    var expires = 'expires=' + d.toUTCString();
    
    document.cookie = cname + '=' + cvalue + '; ' + expires;
    
};

$.fn.getCookie = function( cname ) {
    
    var name = cname + '=';
    var ca = document.cookie.split(';');
    
    for ( var i = 0; i < ca.length; i++ ) {
        
        var c = ca[i];
        
        while ( c.charAt( 0 ) === ' ' ) {
            
            c = c.substring( 1 );
            
        }
        
        if ( c.indexOf( name ) === 0 ) {
            
            return c.substring( name.length, c.length );
            
        }
        
    }
    
    return '';
    
};

$.fn.deleteCookie = function( cname ) {
    
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    
};

$.fn.checkValueInCookie = function( cname ) {
    
    var name = $.fn.getCookie( cname );
    
    if ( name !== '' ) {
        
        return true;
        
    }
    
    return false;
    
};





