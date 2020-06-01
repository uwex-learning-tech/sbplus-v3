onmessage = function( e ) {
    
    var url = e.data.php + "?uri=" + encodeURIComponent(e.data.url),
        request = new XMLHttpRequest();
      
    request.open( "GET", url, true );
    request.send();
    
    request.onreadystatechange = function() {
        
        if ( request.readyState === 4 ) {
            
            postMessage( JSON.parse(request.responseText) );
            
        }
        
    };
    
    request.onerror = function() {
        //console.warn("Image preloading failed.");
    };
      
};