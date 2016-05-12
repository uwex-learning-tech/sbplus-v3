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
    
    var $sbplus = $( '.sbplus_wrapper' );
    
    
    // main functions
    
    function loadSBPlusData() {
        
        // TODO: try to simply this block of code into just one method call
        
        if ( haveCoreFeatures() ) {
            
            $.get( 'assets/sbplus.xml', function( data ) {
                
                context.data = $( data );
                loadPresentation();
                
            }).fail( function() {
                
                renderError( 'Table of Contents XML file (sbplus.xml) is not found!', 'Please make sure the XML file exists in the assets directory and compatible with Storybook Plus version 3.' );
                
            } );
            
        } else {
            
            $.get( manifest.sbplus_root_directory + 'scripts/templates/nosupport.tpl', function( e ) {
                
                renderUnsupportedMessage( e );
                
            } ).fail( function() {
                
                renderError( 'Unsuppored web browser!', 'Your web browser does not support current version of Storybook Plus. In addition, nosupport.tpl file is not found. nosuppory.tpl file contains information to display in regard to unsupported web browsers.');
                
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
        
        settings.accent = isEmpty( globalCntxt.attr( 'accent' ) ) ? settings.accent : globalCntxt.attr( 'accent' );
        settings.slideFormat = isEmpty( globalCntxt.attr( 'slideFormat' ) ) ? settings.slideFormat : globalCntxt.attr( 'slideFormat' );
        settings.analytics = isEmpty( globalCntxt.attr( 'analytics' ) ) ? settings.analytics : globalCntxt.attr( 'analytics' );
        
        $.get( manifest.sbplus_root_directory + 'scripts/templates/sbplus.tpl', function( e ) {
            
            renderSBPlus( e );
            getSplashScreen();
            
        } ).fail( function() {
            
            renderError( 'Template file not found!', 'sbplus.tpl file not found in the templates directory.' );
            
        } );
        
    }
    
    function getSplashScreen() {
        
        var bg = '';
        
        $.get( manifest.sbplus_root_directory + 'scripts/templates/splashscreen.tpl', function( cntx ) {
            
            // TODO: try the defferred method to combine the get for splash image
            
            // get the splash screen image
            $.get( 'assets/splash.jpg', function() {
                
                bg = 'assets/splash.jpg';
                
            } ).fail( function() {
                
                $.get( manifest.sbplus_splash_directory + getProgramDirectory() + context.postfix + '.jpg' , function() {
                
                    bg = this.url;
                    
                } ).fail( function() {
                    
                    $.get( manifest.sbplus_splash_directory + getProgramDirectory() + '.jpg' , function() {
                
                        bg = this.url;
                        
                    } ).always( function() {
                        
                        renderSplashScreen( cntx, bg );
                        renderTableOfContents();
                        getDownloadableFiles();
                        bindStartPresentationEvent();
                        
                    } );
                    
                } );
                
            } );
            
        } ).fail( function() {
            
            renderError( 'Template file not found!', 'splashscreen.tpl file not found in the templates directory.' );
            
        } );
        
    }
    
    function getDownloadableFiles() {
        
        $.get( getProgramDirectory() + '.mp4', function() {
            
            context.videoDownloadSrc = this.url;
            
        } ).always( function() {
            
            $.get( getProgramDirectory() + '.mp3', function() {
            
                context.audioDownloadSrc = this.url;
                
            } ).always( function() {
                
                $.get( getProgramDirectory() + '.pdf', function() {
            
                    context.pdfDownloadSrc = this.url;
                    
                } ).always( function() {
                    
                    $.get( getProgramDirectory() + '.zip', function() {
            
                        context.zipDownloadSrc = this.url;
                        
                    } ).always( function() {
                        
                        renderDownloadableItems();
                        
                    } );
                    
                } );
                
            } );
            
        } );
        
    }
    
    
    // rendering functions
    
    function renderTableOfContents() {
    
        $.each( context.section, function( index ) {
            
            var page = $( this ).find( 'page' );
            var sectionTitle = ( isEmpty( $( this ).attr( 'title' ) ) ) ? 'Section ' + ( index + 1 ) : $( this ).attr( 'title' );
            
            $( '.tableOfContents' ).append( '<div class="section"><div class="header"><div class="title">' + sectionTitle + '</div><div class="expandCollapseIcon"><span class="icon-collapse"></span></div></div><div class="content"><ul class="selectable">' );
            
            $.each( page, function( j ) {
                
                if ( $( this ).attr( 'type' ) !== 'quiz' ) {
                    
                    $( '.selectable:eq(' + index + ')' ).append( '<li class="selectee" data-slide="' + j + '"><span class="num">' + ( context.trackCount + 1 ) +'.</span> ' + $( this ).attr('title') + '</li>' );
                    
                } else {
                    
                    $( '.selectable:eq(' + index + ')' ).append( '<li class="selectee" data-slide="' + j + '"><span class="icon-assessment"></span> ' + $( this ).attr('title') + '</li>' );
                    
                }
                
                context.trackCount++;
                
            } );
            
            $( '.tableOfContents' ).append( '</ul></div></div>' );
            
        } );
        
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
    
    function renderDownloadableItems() {
        
        var downloadables = '';
        
        if ( typeof context.videoDownloadSrc !== 'undefined' ) {
            
            downloadables += '<a class="dl_item video" href="' + context.videoDownloadSrc + '" role="button" tabindex="1" aria-label="Download video file" download><span class="icon-download"></span> Video</a> ';
            
        }
        
        if ( typeof context.audioDownloadSrc !== 'undefined' ) {
            
            downloadables += '<a class="dl_item audio" href="' + context.audioDownloadSrc + '" role="button" tabindex="1" aria-label="Download audio file" download><span class="icon-download"></span> Audio</a> ';
            
        }
        
        if ( typeof context.pdfDownloadSrc !== 'undefined' ) {
            
            downloadables += '<a class="dl_item pdf" href="' + context.pdfDownloadSrc + '" role="button" tabindex="1" aria-label="Download PDF file" download><span class="icon-download"></span> Transcript</a> ';
            
        }
        
        if ( typeof context.zipDownloadSrc !== 'undefined' ) {
            
            downloadables += '<a class="dl_item zip" href="' + context.zipDownloadSrc + '" role="button" tabindex="1" aria-label="Download Supplement file" download><span class="icon-download"></span> Supplement</a>';
            
        }
        
        $( '.download_files' ).hide().html( downloadables ).fadeIn( 500 );
        
    }
    
    function renderPresentation() {
        
        $( '.splashscreen' ).fadeOut( 'fast', function() {
                
            $( '.main_content_wrapper' ).css( 'display', 'flex' ).fadeIn( 500, function() {
                
                $( this ).removeClass( 'hide' );
                
                $( '.title_bar .title' ).html( context.title );
                $( '.author' ).html( context.author );
                
                bindMenuEvents();
                
            } );
            
            $( this ).remove();
            unbindStartPresentationButton();
            
        } );
        
    }
    
    function renderSBPlus( e ) {

        $( document ).attr( "title", context.title );
        $sbplus.html( e );
        
    }
    
    function renderSplashScreen( cntx, bg ) {
        
        $( '.splashscreen' ).html( cntx );
        
        if ( bg !== '' ) {
            
            $( '.splashscreen' ).css( 'background-image', 'url(' + bg + ')' );
            
        }
    
        $( '.splashinfo .title' ).html( context.title );
        $( '.splashinfo .subtitle' ).html( context.subtitle );
        $( '.splashinfo .author' ).html( context.author );
        $( '.splashinfo .length' ).html( context.length );
        $( '.splashinfo .startBtn' ).css( 'background-color', settings.accent );
        
        if ( navigator.cookieEnabled && $.fn.checkValueInCookie( 'sbplus-' + getRootDirectory() ) ) {
            
            $( '.splashinfo .resumeBtn' ).css( 'background-color', settings.accent )
                                         .removeClass( 'hide' );

        }
        
    }
    
    function renderUnsupportedMessage( e ) {
        
        $sbplus.html( e );
        
    }
    
    function renderError( title, content ) {
        
        $sbplus.html( '<div class="error"><h1>' + title + '</h1><p>' + content + '</p></div>' );
        
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
    
    function bindStartPresentationEvent() {
        
        $( '.splashinfo .startBtn' ).on( 'click', renderPresentation );
        
    }
    
    function unbindStartPresentationButton() {
        
        $( '.splashinfo .startBtn' ).off( 'click' );
        
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
    
    // support functions
    
    function haveCoreFeatures() {
        
        if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.flexbox ) {
    
            return false;
        
        }
        
        return true;
        
    }
    
    function getConfigFileUrl() {
 
        var configsFile = document.getElementById( 'sbplus_configs' );
        
        if ( configsFile === null ) {
         
         return false;
         
        }
        
        return configsFile.href;
     
    }
    
    function getProgramDirectory() {

        var url = window.location.href.split( "/" );
        
        if ( isEmpty( url[url.length - 1] ) || new RegExp( '[\?]' ).test( url[url.length - 1] ) ) {
            
            url.splice( url.length - 1, 1 );
            
        }
        
        if ( url[4] === undefined ) {
            
            return url[3];
            
        }
        
        return url[4];
    
    }

    function getRootDirectory() {
    
        var url = window.location.href.split( "/" );
        
        if ( isEmpty( url[url.length - 1] ) || new RegExp( '[\?]' ).test( url[url.length - 1] ) || url[url.length - 1] === 'index.html'  ) {
            
            url.splice( url.length - 1, 1 );
            
        }
        
        return url[url.length - 1];
        
    }
    
    function isEmpty( str ) {
        
        return ( !str.trim() || str.trim().length === 0 );
        
    }
    
    
    // init
    
    $.getJSON( getConfigFileUrl(), function( e ) {
        
        manifest = e;
        loadSBPlusData();
        
    } ).fail( function() {
        
        renderError( 'Configuration file (manifest.json) is not found!', 'Please make sure the index.html file is compatible with Storybook Plus version 3.');
        
    });
    
});



$( function() { sbplus(); } );



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