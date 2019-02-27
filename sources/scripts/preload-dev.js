self.addEventListener( "message", function( e ) {
    
      var url = e.data.php + "?uri=" + encodeURIComponent(e.data.pages),
          fileUrl = e.data.url,
          request = new XMLHttpRequest();
      
      request.open( "GET", url, true );
      request.send();
      
      request.onreadystatechange = function() {
          
          if ( request.readyState === 4 ) {
              
              var files = JSON.parse(request.responseText);

              files.forEach( function( name ) {
                  
                  var imgXhr = new XMLHttpRequest();
                      
                      imgXhr.open( "GET", fileUrl + name, true );
                      imgXhr.setRequestHeader( "Cache-Control", "max-age=3600, stale-while-revalidate=7200, no-cache, no-store, must-revalidate" );
                      imgXhr.send();
                  
              } );
              
          }
          
      };
      
      request.onerror = function() {
          //console.warn("Image preloading failed.");
      };
      
} );

String.prototype.replaceAll = function( search, replacement ) {
    return this.replace( new RegExp( search, "g" ), replacement );
};