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

$.fn.haveCoreFeatures = function() {
        
    if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.flexbox ) {

        return false;
    
    }
    
    return true;
    
};

/***************************************
    COOKIE FUNCTIONS
****************************************/

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