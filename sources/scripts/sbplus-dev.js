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
 /* global sbplus */
 
/**** ON DOM READY ****/
$( document ).ready( function() {
    
    // check for core compatible features
        if ( $( this ).haveCoreFeatures() ) {
            
            // initialize the sbplus splash screen model
            var splashInfo = new sbplus.setup( {
                title: 'Presentation Title Goes Here and Can Be As Many Lines As You Want But Two Is Recommended',
                subtitle: 'Subtitle goes here and Can Be As Many Lines As You Want But Two Is Recommended',
                author: 'Dr. Firstname Lastname',
                length: '25 minutes'
            } );
            
            // initialize the sbplus splash screen view
            var splashScreen = new sbplus.splashView( { model: splashInfo } );
            
            // set the document/page title
            $( document ).attr( "title", splashInfo.get( 'title' ) );
            
            // get the sbplus structure via ajax
            $.get( 'sources/scripts/templates/sbplus.tpl', function( frame ) {
                
                // display the sbplus frame
                $( '.sbplus_wrapper' ).html( frame );
                
                // display the splashscreen
                $( '.splashscreen' ).html( splashScreen.render().el ).css( 'background-image', 'url(' + splashInfo.get( 'splashImg' ) + ')' );
                
                // bind start button for splash screen
                $( '.startBtn' ).on( 'click', function() {
                    
                    $( '.splashscreen' ).fadeOut();
                    
                } );
                
            } );
            
        } else {
            
            $( '.sbplus_wrapper' ).html( '<div class="notSupportedMsg"><h1>Your web browser is not supported.</h1><p>It is not capable of delivering the core features of this application.</p><p><strong>Recommended web browsers</strong>: latest stable version of all modern web browsers (Mozilla Firefox, Google Chrome, Apple Safari, Microsoft Edge, etc.).</p><p><strong>Minimium supported web browser versions</strong>:<ul><li>Microsoft Internet Explorer 10</li><li>Mozilla Firefox 35</li><li>Google Chorme 33</li><li>Apple Safari 5</li></ul></p><p>For more information on modern web browsers and how to update, visit <a href="https://whatbrowser.org/" target="_blank">whatbrowser.org</a>.</p></div>' );
            
        }
    
} );
 
/**** METHODS ****/
 
 $.fn.haveCoreFeatures = function() {
     
     if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.eventlistener ) {
         
         return false;
         
     }
     
     return true;
     
 };
 
 $.fn.displayErrorScreen = function( ttl, msg, allowContinue ) {
     
     allowContinue = typeof allowContinue !== 'undefined' ? allowContinue : false;
     
     var errorScreen = $( '.errorscreen' );
     
     errorScreen.find( '.title' ).html( ttl );
     errorScreen.find( '.msg' ).html( msg );
     
     if ( allowContinue ) {
         
         errorScreen.find( '.act' ).html( '<button class="btn-continue">continue</button>' );
         $( '.btn-continue' ).bind( 'click', $.fn.hideErrorScreen );
         
     }
     
     errorScreen.removeClass( 'hide' ).hide().fadeIn();
     
 };
 
 $.fn.hideErrorScreen = function() {
     
     var errorScreen = $( '.errorscreen' );
     
     errorScreen.find( '.title' ).html( '' );
     errorScreen.find( '.msg' ).html( '' );
     errorScreen.find( '.act' ).html( '' );
     
     errorScreen.fadeOut( function() {
         
         errorScreen.addClass( 'hide' );
         $( '.btn-continue' ).unbind( 'click', $.fn.hideErrorScreen );
         
    } );
     
 };