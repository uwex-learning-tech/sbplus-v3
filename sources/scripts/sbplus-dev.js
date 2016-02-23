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
 
var sbplus = sbplus || {
        
    title: '',
    subtitle: '',
    length: '',
    author: '',
    authorBio: '',
    generalInfo: '',
    accent: '#0000ff',
    slideFormat: 'jpg',
    analytics: 'off',
    xmlVersion: '3',
    splashImg: 'sources/images/default_splash.jpg',
    
    splashinfo: function() {
        
        return '<div class="splashinfo"><h1 tabindex="1" class="title">' + this.title + '</h1><p tabindex="1" class="subtitle">'+ this.subtitle + '</p><p tabindex="1" class="author">' + this.author + '</p><p tabindex="1" class="length">' + this.length + '</p><button tabindex="1" class="startBtn" aria-label="Start Presentation">START</button></div>';
        
    }
    
};
 
/**** ON DOM READY ****/
$( function() {
    
    // check for core compatible features
    if ( $( this ).haveCoreFeatures() ) {
        
        // initialize the sbplus splash screen model
        sbplus.title = 'Presentation Title Goes Here and Can Be As Many Lines As You Want But Two Is Recommended';
        sbplus.subtitle = 'Subtitle goes here and Can Be As Many Lines As You Want But Two Is Recommended';
        sbplus.author = 'Dr. Firstname Lastname';
        sbplus.length = '25 minutes';
        
        // set the document/page title
        $( document ).attr( "title", sbplus.title );
        
        // get the sbplus template via ajax
        $.get( 'sources/scripts/templates/sbplus.tpl', function( template ) {
            
            // display the sbplus frame
            $( '.sbplus_wrapper' ).html( template );
            
            // display the splashscreen
            $( '.splashscreen' ).html( sbplus.splashinfo() ).css( 'background-image', 'url(' + sbplus.splashImg + ')' );
            
            // bind start button for splash screen
            $( '.startBtn' ).on( 'click', function() {
                
                $( '.splashscreen' ).fadeOut( 'fast', function() {
                    
                    $( '.main_content_wrapper' ).fadeIn( 500 ).css( 'display', ( Modernizr.flexbox ) ? 'flex' : 'block' ).removeClass( 'hide' );
                    
                } );
                
            } );
            
        } );
        
    } else {
        
        $.get( 'sources/scripts/templates/nosupport.tpl', function( template ) {
            
            $( '.sbplus_wrapper' ).html( template );
            
        } );
        
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