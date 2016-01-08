/**
 * Storybook Plus
 *
 * @author: Ethan S. Lin
 * @url: https://github.com/oel-mediateam/sbplus_v3
 * @version: 3.0.0
 * Released MM/DD/2016
 *
   Storybook Plus Web Application Version 3
   Copyright (C) 2013-2015  Ethan S. Lin

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
 /* global requirejs */
 /* global require */
 /* global sbplus */
 
requirejs.config( {
    
    baseUrl: 'sources/scripts',
    paths: {
        views: 'views',
        templates: 'templates',
        models: 'models',
        collections: 'collections'
    }
    
} );
 
/**** ON DOM READY ****/
require( [ 'domReady' ], function ( domReady ) {
    
    domReady( function () {
        
        $( this ).checkFeatures();
        
        var sbplusView = new sbplus.mainView();
        $( '.sbplus_wrapper' ).html( sbplusView.render().el );
        
        var splashInfo = new sbplus.setup( { title: 'ABD' } );
        var splashscreen = new sbplus.splashView( { model: splashInfo } );
        $( '.splashscreen' ).html( splashscreen.render().el );
        
    } );
    
} );
 
/**** METHODS ****/
 
 $.fn.checkFeatures = function() {
     
     if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.eventlistener) {
         
         $(this).displayErrorScreen( 'Your web browser is not supported!', 'Please use a modern web browser.', false );
         
     } else {
         
         // check for aesthetic features
         if ( !Modernizr.mediaqueries || !Modernizr.rgba || !Modernizr.unicode || !Modernizr.fontface || !Modernizr.svg || !Modernizr.boxsizing || !Modernizr.csstransforms ) {
             
             $(this).displayErrorScreen( 'Your web browser is not modern!', 'For best viewing experiences, please use a modern web browser.', true );
             
         }
         
         // check for cookies
         if ( !Modernizr.cookies ) {
             
             $(this).displayErrorScreen( 'Cookies are not enabled!', 'For best experiences, please enable cookies on your web browser.', true );
             
         }
         
     }
     
 };
 
 $.fn.displayErrorScreen = function( ttl, msg, allowContinue ) {
     
     allowContinue = typeof allowContinue !== 'undefined' ? allowContinue : false;
     
     var errorScreen = $( '.sbplus_wrapper .sbplus .errorscreen' );
     
     errorScreen.find( '.title' ).html( ttl );
     errorScreen.find( '.msg' ).html( msg );
     
     if ( allowContinue ) {
         
         errorScreen.find( '.act' ).html( '<button class="btn-continue">continue</button>' );
         $( '.btn-continue' ).bind( 'click', $.fn.hideErrorScreen );
         
     }
     
     errorScreen.removeClass( 'hide' ).hide().fadeIn();
     
 };
 
 $.fn.hideErrorScreen = function() {
     
     var errorScreen = $( '.sbplus_wrapper .sbplus .errorscreen' );
     
     errorScreen.find( '.title' ).html( '' );
     errorScreen.find( '.msg' ).html( '' );
     errorScreen.find( '.act' ).html( '' );
     
     errorScreen.fadeOut( function() {
         
         errorScreen.addClass( 'hide' );
         $( '.btn-continue' ).unbind( 'click', $.fn.hideErrorScreen );
         
    } );
     
 };