self.addEventListener('message', function(e) {
    
      var url = e.data;
      
      var request = new XMLHttpRequest();
      
      request.open('GET', url + "assets/pages/", true);
      
      request.onreadystatechange = function() {
          
          if ( request.readyState === 4 ) {
              
              var start = request.responseText.indexOf("<dd class='file'>");
              var end = request.responseText.indexOf("</dl>");
              
              var files = request.responseText.substring(start, end);
              
              files = files.replaceAll("</a></dd>", ",");
              files = files.replaceAll("<dd class=['|\"]file['|\"]><a href=['|\"].*['|\"]>", "");
              files = files.replaceAll("\n|\r", "");
              
              files = files.split(",");
              files.pop();
              
              files.forEach(function(file) {
                  
                  if (file.trim() !== "") {
                  
                      var imgXhr = new XMLHttpRequest();
                      imgXhr.open('GET', url + "assets/pages/" + file, true);
                      imgXhr.send();
                      
                  }
                  
              } );
              
          }
          
      };
      
      request.onerror = function() {
          //console.warn("Image preloading failed.");
      };
      
      request.send();
      
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};