/***************************************
    GLOBAL HELPER FUNCTIONS
****************************************/

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

$.fn.getConfigFileUrl = function() {
 
    var configsFile = document.getElementById( 'sbplus_configs' );
    
    if ( configsFile === null ) {
     
     return false;
     
    }
    
    return configsFile.href;
 
};

$.fn.isEmpty = function( str ) {
    
    return ( !str.trim() || str.trim().length === 0 );
    
};

String.prototype.capitalize = function() {
    
    return this.charAt(0).toUpperCase() + this.slice(1);
    
};

$.fn.cleanString = function( str ) {
    
    return str.replace(/[^\w]/gi, '').toLowerCase();
    
};

$.fn.removeExtension = function( str ) {
    var pos = str.indexOf('.');
    return str.substr(0, pos);
    
};

$.fn.haveCoreFeatures = function() {
        
    if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.flexbox ) {

        return false;
    
    }
    
    return true;
    
};

$.fn.colorLum = function( hex, lum ) {
    
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    
    if (hex.length < 6) {
    	hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    
    lum = lum || 0;
    
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
    	c = parseInt(hex.substr(i*2,2), 16);
    	c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    	rgb += ("00"+c).substr(c.length);
    }
    
    return rgb;
    
};

$.fn.toSeconds = function( str ) {
    
    var arr = str.split( ':' );
    return Number( arr[0] * 60 ) + Number( arr[1] );
    
};

$.fn.autoscroll = function( parent ) {
 
    var currentItemPos = Math.floor( $( this ).position().top );
    
    if ( currentItemPos < 30 || currentItemPos >= ( parent.parent().outerHeight() / 2 ) ) {

        parent.scrollTo( $(this), { duration: 500, offsetTop : ( parent[0].clientHeight / 2 + $( this ).height() ) } );
           
    }

};

$.fn.scrollTo = function( target, options, callback ) {
     
    if ( typeof options === 'function' && arguments.length === 2 ) {
        
        callback = options;
        options = target;
      
    }
    
    var settings = $.extend( {
        
        scrollTarget  : target,
        offsetTop     : 50,
        duration      : 500,
        easing        : 'swing'
        
    }, options );
  
  return this.each( function() {
      
    var scrollPane = $( this );
    var scrollTarget = ( typeof settings.scrollTarget === "number" ) ? settings.scrollTarget : $( settings.scrollTarget );
    var scrollY = ( typeof scrollTarget === "number" ) ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt( settings.offsetTop );
    
    scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function() {
        
        if ( typeof callback === 'function' ) {
          
          callback.call(this);
          
        }
      
    } );
    
  });
  
};

/***************************************
    COOKIE FUNCTIONS
****************************************/

$.fn.setCookie = function( cname, cvalue, exdays ) {
    
    exdays = typeof exdays !== 'undefined' ? exdays : 30;
    
    if ( exdays === 0 ) {
        document.cookie = cname + '=' + cvalue + ';';
    } else {
        var d = new Date();
        d.setTime( d.getTime() + ( exdays * 24 * 60 * 60 * 1000 ) );
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + '; ' + expires;
    }
    
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

$.fn.hasCookieValue = function( cname ) {
    
    var name = $.fn.getCookie( cname );
    
    if ( name !== '' ) {
        
        return true;
        
    }
    
    return false;
    
};