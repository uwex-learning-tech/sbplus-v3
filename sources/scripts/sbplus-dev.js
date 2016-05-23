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
    
    function renderPresentation() {
        
        $( '.splashscreen' ).fadeOut( 'fast', function() {
                
            $( '.main_content_wrapper' ).css( 'display', 'flex' ).fadeIn( 500, function() {
                
                $( this ).removeClass( 'hide' );
                
                $( '.title_bar .title' ).html( context.title );
                $( '.author' ).html( context.author );
                
                _resizeDom();
                
                $( window ).resize( function() {
                    
                    _resizeDom();
                    
                } );
                
                sbplusTableOfContents.get( context, settings );
                sbplusSlide.get( context.section, settings );
                sbplusMenu.get( context );
                
            } );
            
            $( this ).remove();
            sbplusSplashScreen.unbindStartPresentationBtn();
            
        } );
        
    }
    
    function renderSBPlus( e ) {

        $( document ).attr( "title", context.title );
        $sbplus.html( e );
        sbplusSplashScreen.get( manifest, context, settings );
        sbplusControls.init( context.section, settings );
        
        _loadVideoJS();
        
    }
    
    function renderUnsupportedMessage( e ) {
        
        $sbplus.html( e );
        
    }
    
    function _loadVideoJS() {
        
        var j = document.createElement('script');
        j.type = 'text/javascript';
        j.src = manifest.sbplus_root_directory + 'scripts/libs/videojs/video.min.js';
        document.getElementsByTagName('head')[0].appendChild(j);
        
        var ls = document.createElement('link');
        ls.rel= 'stylesheet';
        ls.href= manifest.sbplus_root_directory + 'scripts/libs/videojs/video-js.min.css';
        document.getElementsByTagName('head')[0].appendChild(ls);
        
        _initVJSCookies();
        
    }
    
    function _initVJSCookies() {
        
        $.fn.setCookie( 'sbplus-vjs-autoplay', 1 );
        $.fn.setCookie( 'sbplus-vjs-volume', 0.8 );
        $.fn.setCookie( 'sbplus-vjs-playbackrate', 1 );
        $.fn.setCookie( 'sbplus-vjs-enabledSubtitles', 0 );
        
    }
    
    function _resizeDom() {
        
        var notesHeight = $( window ).outerHeight() - ( $( '.main_content_wrapper .title_bar' ).outerHeight() + $( '.main_content .control_bar_wrapper' ).outerHeight() + $( '.main_content .container .content' ).outerHeight() ); 
        
        var contentHeight = ( 1 - ( $( '.main_content_wrapper .title_bar' ).outerHeight() / $( window ).outerHeight() ) ) * 100;
        
        $( '.main_content, .side_panel').css( 'height', contentHeight + '%' );
        $( '.main_content .notes' ).css( 'height', notesHeight );
        
    }
        
    return {
        
        render: renderPresentation
        
    };
    
} )();