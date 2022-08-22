onmessage = function( e ) {

    var url = e.data.php + "?uri=" + encodeURIComponent(e.data.pages),
          fileUrl = e.data.url,
          request = new XMLHttpRequest();
      
      request.open( "GET", url, true );
      request.send();
      
      request.onreadystatechange = function() {
          
          if ( request.readyState === 4 && request.status === 200 ) {
              
              var files = JSON.parse(request.responseText);
              var images = [];
              
              files.forEach( function( name ) {
                  
                  if ( isImg( name ) !== null ) {
                      images.push( name );
                  }
                  
                  var imgXhr = new XMLHttpRequest();
                      
                      imgXhr.open( "GET", fileUrl + name, true );
                      imgXhr.setRequestHeader( "Cache-Control", "public, max-age=604800, stale-while-revalidate=86400, must-revalidate" );
                      imgXhr.send();
                  
              } );
              
              postMessage(images);
              
          }
          
      };
      
      request.onerror = function() {
          //console.warn("Image preloading failed.");
      };
      
};

function isImg( file ) {
    return file.match( new RegExp( /.((svg)|(jpg)|(jpeg)|(png)|(gif))$/, "ig") );
}