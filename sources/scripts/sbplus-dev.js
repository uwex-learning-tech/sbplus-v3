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
                
            }).fail( function( r, s ) {
                
                if ( s === 'parsererror' ) {
                    
                    sbplusError.show( 'Something went wrong in the XML!', 'Validate the XML at <a href="https://validator.w3.org/" target="_blank">https://validator.w3.org/</a>.' );
                    
                } else {
                    
                    sbplusError.show( 'Table of Contents XML file (sbplus.xml) is not found!', 'Please make sure the XML file exists in the assets directory and compatible with Storybook Plus version 3.' );
                    
                }
                
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
    
    function renderPresentation( resume ) {
        
        resume = typeof resume !== 'undefined' ? true : false;
        
        $( '.splashscreen' ).fadeOut( 'fast', function() {
                
            $( '.main_content_wrapper' ).removeClass( 'hide' );
            $( '.title_bar .title' ).html( context.title );
            $( '.author' ).html( context.author );
            
            sbplusTableOfContents.get( context, settings );
            
            if ( resume ) {
                
                var leftOfAt = $.fn.getCookie( 'sbplus-' + $.fn.getRootDirectory() ).split( ':' );
                var s = Number(leftOfAt[0]), p = leftOfAt[1];
                
                sbplusSlide.get( context.section, settings, s, p, manifest );
                
            } else {
                
                sbplusSlide.get( context.section, settings, 0, 0, manifest );
                
            }
            
            sbplusControls.init( context.section, settings );
            sbplusMenu.get( manifest, context );
            
            // resize DOM
            resizeDom();
            $( window ).resize( function() {
                
                resizeDom();
                
            } );
            
            if ( resume ) {
                
                sbplusSplashScreen.unbindResumePresentationBtn();
                
            }
            
            sbplusSplashScreen.unbindStartPresentationBtn();            
            
        } );
        
    }
    
    function renderSBPlus( e ) {

        $( document ).attr( "title", context.title );
        $sbplus.html( e );
        sbplusSplashScreen.get( manifest, context, settings );
        
        _initVJSCookies();
        
        if( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) ) {
            _loadiPhoneInlineScript();
        }
        
    }
    
    function renderUnsupportedMessage( e ) {
        
        $sbplus.html( e );
        
    }
    
    function _initVJSCookies() {
        
        // set autoplay
        if ( $.fn.hasCookieValue('sbplus-vjs-autoplay') ) {
            
            $.fn.setCookie( 'sbplus-vjs-autoplay', $.fn.getCookie('sbplus-vjs-autoplay') );
            
        } else {
            
            $.fn.setCookie( 'sbplus-vjs-autoplay', 1 );
            
        }
        
        // set volume level
        if ( $.fn.hasCookieValue('sbplus-vjs-volume') ) {
            
            $.fn.setCookie( 'sbplus-vjs-volume', $.fn.getCookie('sbplus-vjs-volume') );
            
        } else {
            
            $.fn.setCookie( 'sbplus-vjs-volume', 0.8 );
            
        }
        
        // set playback rate
        if ( $.fn.hasCookieValue('sbplus-vjs-playbackrate') ) {
            
            $.fn.setCookie( 'sbplus-vjs-playbackrate', $.fn.getCookie('sbplus-vjs-playbackrate') );
            
        } else {
            
            $.fn.setCookie( 'sbplus-vjs-playbackrate', 1 );
            
        }
        
        // display subtitle
        if ( $.fn.hasCookieValue('sbplus-vjs-enabledSubtitles') ) {
            
            $.fn.setCookie( 'sbplus-vjs-enabledSubtitles', $.fn.getCookie('sbplus-vjs-enabledSubtitles') );
            
        } else {
            
            $.fn.setCookie( 'sbplus-vjs-enabledSubtitles', 0 );
            
        }
        
    }
    
    function _loadiPhoneInlineScript() {
        
        $.getScript( manifest.sbplus_root_directory + 'scripts/libs/iphone-inline-video.browser.js' );
        
    }
    
    function resizeDom() {
        
        var widowWidth = $( window ).outerWidth();
        var windowHeight = $( window ).outerHeight();
        var titleBarHeight = $( '.title_bar' ).outerHeight();
        var controlBarHeight = $( '.control_bar_wrapper' ).outerHeight();
        var slideHeight = $( '.page_container .content' ).outerHeight();
        var sidePanelTopBarHeight = $( '.side_panel .topbar' ).outerHeight();
        var isExpanded = $( '.main_content_wrapper' ).hasClass( 'full-view' );
        var isAssessment = $( '.main_content_wrapper' ).hasClass( 'assessment-view' );
        
        // is assessement view
        if ( isAssessment ) {
            var h = windowHeight - titleBarHeight - controlBarHeight;
            $( '.content .assessment' ).css( {'height': h + 'px'} );
        }
        
        // is expanded view
        if ( isExpanded ) {
            
            var heightPercentage = 100 - ( ( controlBarHeight + titleBarHeight ) / windowHeight * 100 );
            
            $( '.page_container.expanded' ).css( 'height', heightPercentage + '%'  );
            $( '.widget_container .notes' ).css( { 'height': '', 'width': $( '.status' ).outerWidth() + 'px' } );
            $( '.widget_container .side_panel' ).css( {
                'top': ( ( windowHeight - controlBarHeight - titleBarHeight ) * -1 ) + 'px',
                'height': ( windowHeight - controlBarHeight - titleBarHeight ) + 'px',
                'width': $( '.right_controls' ).outerWidth() + 'px'
            } );
            $( '.tableOfContents').css( 'height', ( $( '.widget_container .side_panel' ).outerHeight() - sidePanelTopBarHeight ) + 'px' );
            
        } else {
            
            // notes minimized view
            if ( windowHeight >= 630 ) {
                
                $( '.page_container' ).css( 'height', '' );
                $( '.main_content_wrapper' ).removeClass( 'notes-minimized-view' );
                
                if ( $( '.main_content_wrapper' ).hasClass( 'assessment-view' ) === false ) {
                    $( '.control_bar_wrapper .notesBtn' ).addClass( 'hide' );
                }
                
                $( '.widget_container .notes' ).removeClass( 'hide' ).css( 'width', '' );
                
                if ( widowWidth >= 888 ) {
                    
                    $( '.page_container' ).css( 'width', '' );
                    $( '.side_panel').css( {
                        
                        'margin-top': slideHeight * -1,
                        'border-top': 'none',
                        'height': '',
                        'top': '',
                        'width': ''
                        
                    } );
                    $( '.tableOfContents').css( 'height', windowHeight - titleBarHeight - sidePanelTopBarHeight - 1 );
                    
                } else {
                    
                    if ( isAssessment === false ) {
                        
                        $( '.widget_container .notes' ).removeClass( 'hide' );
                        
                        $( '.page_container' ).css( 'width', '100%' );
                        $( '.side_panel').css( {'margin-top': 0, 'border-top': '1px solid #ccc'} );
                        $( '.tableOfContents').css( 'height', notesHeight + controlBarHeight - sidePanelTopBarHeight - 2 );
                        
                    } else {
                        
                        $( '.widget_container .notes' ).addClass( 'hide' );
                        
                        $( '.page_container' ).css( { 'width': '', 'height': windowHeight - titleBarHeight - controlBarHeight } );
                
                        $( '.side_panel').css( {
                                
                            'margin-top': ( windowHeight - titleBarHeight - controlBarHeight) * -1,
                            'border-top': 'none',
                            'height': windowHeight - titleBarHeight,
                            'top': '',
                            'width': ''
                            
                        } );
                        $( '.tableOfContents').css( 'height', windowHeight - titleBarHeight - sidePanelTopBarHeight - 1 );
                        
                    }
                    
                }
                
                var currentSlideHeight = $( '.page_container .content' ).outerHeight();
                var notesHeight = windowHeight - ( titleBarHeight + controlBarHeight + currentSlideHeight );
                
                $( '.widget_container' ).css( 'height', windowHeight - ( titleBarHeight + currentSlideHeight ) );
                $( '.widget_container .notes' ).css( {
                    
                    'height': windowHeight - ( titleBarHeight + controlBarHeight + currentSlideHeight ),
                    'width': ''
                
                } );
                
            } else {
                
                $( '.main_content_wrapper' ).addClass( 'notes-minimized-view' );
                
                if ( $( '.main_content_wrapper' ).hasClass( 'assessment-view' ) === false ) {
                    $( '.control_bar_wrapper .notesBtn' ).removeClass( 'hide' );
                }
                
                $( '.widget_container .notes' ).addClass( 'hide' ).css( {
                    'width': $( '.status' ).outerWidth(), 
                    'height': ''
                } );
                
                $( '.page_container' ).css( { 'width': '', 'height': windowHeight - titleBarHeight - controlBarHeight } );
                
                $( '.side_panel').css( {
                        
                    'margin-top': ( windowHeight - titleBarHeight - controlBarHeight) * -1,
                    'border-top': 'none',
                    'height': windowHeight - titleBarHeight,
                    'top': '',
                    'width': ''
                    
                } );
                $( '.tableOfContents').css( 'height', windowHeight - titleBarHeight - sidePanelTopBarHeight - 1 );
                
            }
            
        }
        
    }
        
    return {
        
        render: renderPresentation,
        resize: resizeDom
        
    };
    
} )();