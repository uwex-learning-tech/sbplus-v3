onmessage = function( e ) {
    
    var url = e.data.php + "?uri=" + encodeURIComponent(e.data.pages),
          fileUrl = e.data.url,
          request = new XMLHttpRequest();
      
      request.open( "GET", url, true );
      request.send();
      
      request.onreadystatechange = function() {
          
          if ( request.readyState === 4 && request.status === 200 ) {
              
              var files = JSON.parse(request.responseText);
              var svgs = [];
              
              files.forEach( function( name ) {
                  
                  if ( isSvg( name ) !== null ) {
                      svgs.push( name );
                  }
                  
                  var imgXhr = new XMLHttpRequest();
                      
                      imgXhr.open( "GET", fileUrl + name, true );
                      imgXhr.setRequestHeader( "Cache-Control", "max-age=3600, stale-while-revalidate=7200, no-cache, no-store, must-revalidate" );
                      imgXhr.send();
                  
              } );
              
              postMessage(svgs);
              
          }
          
      };
      
      request.onerror = function() {
          //console.warn("Image preloading failed.");
      };
      
};

function isSvg( file ) {
    return file.match( new RegExp( /(.svg)$/, "ig") );
}