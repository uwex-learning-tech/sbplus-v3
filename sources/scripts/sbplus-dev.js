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
    xmlVersion: '3'
    
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
    
    // set the document/page title
    $( document ).attr( "title", sbplus.title );
    
    // get the sbplus template via ajax
    $.get( configs.sbplus_root_directory + 'scripts/templates/sbplus.tpl', function( sbplusFrame ) {
        
        // display the sbplus frame
        $( '.sbplus_wrapper' ).html( sbplusFrame );
        
        // get and display the splash screen
        $.get( configs.sbplus_root_directory + 'scripts/templates/splashscreen.tpl', function( splashscreen ) {
            
            var splashImgURL = configs.sbplus_splash_directory + $.fn.getProgramDirectory() + ( ( $.fn.isEmpty( sbplus.postfix ) ) ? '' : sbplus.courseNumber ) + '.jpg';
            
            // set the splashscreen DOM
            $( '.splashscreen' ).html( splashscreen );
            
            // load splash screen image
            $.get( splashImgURL , function() {
                
                $( '.splashscreen' ).css( 'background-image', 'url(' + splashImgURL + ')' );
                
            } ).fail( function() {
                
                $.get( 'assets/splash.jpg', function() {
                    
                    $( '.splashscreen' ).css( 'background-image', 'url(assets/splash.jpg)' );
                    
                } );
                
            } );
            
            // set & display presentation informations on splash screen
            $( '.splashinfo .title' ).html( sbplus.title );
            $( '.splashinfo .subtitle' ).html( sbplus.subtitle );
            $( '.splashinfo .author' ).html( sbplus.author );
            $( '.splashinfo .length' ).html( sbplus.length );
            $( '.splashinfo .startBtn' ).css( 'background-color', sbplus.accent );
            
            if ( navigator.cookieEnabled && document.cookie ) {
                
                
                $( '.splashinfo .resumeBtn' ).css( 'background-color', sbplus.accent )
                                             .removeClass( 'hide' );
                
            }
            
            // bind start button for splash screen
            $( '.splashinfo .startBtn' ).on( 'click', function() {
                
                $( '.splashscreen' ).fadeOut( 'fast', function() {
                    
                    $( '.main_content_wrapper' ).css( 'display', 'flex' ).fadeIn( 500, function() {
                        
                        // remove the hide class from the main contain wrapper
                        $( this ).removeClass( 'hide' );
                        
                        $.fn.setupPresentation();
                        
                    } );
                    
                    // remove the splash screen from the dom
                    $( this ).remove();
                    
                } );
                
            } );
            
        } ).fail( function() {
            
            $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Template file not found!</h1><p>splashscreen.tpl file not found in the templates directory.</p></div>' );
            
        } );
        
    } ).fail( function() {
            
        $( '.sbplus_wrapper' ).html( '<div class="error"><h1>Template file not found!</h1><p>sbplus.tpl file not found in the templates directory.</p></div>' );
        
    } );
    
};

$.fn.setupPresentation = function() {
    
    $( '.title_bar .title' ).html( sbplus.title );
    $( '.author' ).html( sbplus.author );
    
    $.fn.bindMenuEvents();
    
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
    
    if ( url[4] === undefined ) { return url[3]; }
    
    return url[4];

};
 
$.fn.isEmpty = function( str ) {
 
    var result = str.trim();
    
    return ( !result || result.length === 0 );
 
};
 
$.fn.bindMenuEvents = function() {
 
    $( '.menuBtn' ).on( 'click', function() {
    
        $( this ).attr( 'aria-expanded', 'true' );
        $( '#menu_panel' ).removeClass( 'hide' ).attr( 'aria-expanded', 'true' );
        
        return false;
    
    } );
    
    $( '#showProfile' ).on( 'click', function() {
    
        $( this ).showMenuItemDetails( 'Author Profile', sbplus.authorBio );
        
        return false;
    
    } );
    
    $( '#showGeneralInfo' ).on( 'click', function() {
    
        $( this ).showMenuItemDetails( 'General Information', sbplus.generalInfo );
        
        return false;
    
    } );
    
    $( '#showHelp' ).on( 'click', function() {
    
        $( this ).showMenuItemDetails( 'Help', '<p>Help information go here...</p>' );
        
        return false;
    
    } );
    
    $( '#showSettings' ).on( 'click', function() {
    
        $( this ).showMenuItemDetails( 'Settings', '<p>Settings go here...</p>' );
        
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