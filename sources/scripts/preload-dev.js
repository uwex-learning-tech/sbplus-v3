self.addEventListener( "message", function( e ) {
    
      var url = e.data + "assets/pages/", request = new XMLHttpRequest();
      
      request.open( "GET", url, true );
      request.send();
      
      request.onreadystatechange = function() {
          
          if ( request.readyState === 4 ) {
              
              var start = request.responseText.indexOf("<dd class='file'>");
              var end = request.responseText.indexOf("</dl>");
              
              var files = request.responseText.substring(start, end);
              
              files = files.replaceAll( "</a></dd>", "," );
              files = files.replaceAll( "<dd class=['|\"]file['|\"]><a href=['|\"].*['|\"]>", "" );
              files = files.replaceAll( "\n|\r", "" );
              files = files.split( "," );
              
              files.pop();
              
              files.forEach( function( file ) {
                  
                  if ( file.trim() !== "" ) {
                  
                      var imgXhr = new XMLHttpRequest();
                      
                      imgXhr.open( "GET", url + file, true );
                      imgXhr.setRequestHeader( "Cache-Control", "max-age=3600, no-cache, no-store, must-revalidate" );
                      imgXhr.setRequestHeader( "max-stale", 3600 );
                      imgXhr.send();
                      
                  }
                  
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