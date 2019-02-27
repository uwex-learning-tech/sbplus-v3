<div id="sbplus_error_info">
    <p class="center_icon"><span class="icon-warning"></span></p>
    <h1>Hmm, the XML is not quite right...</h1>
    <div id="validLink"></div>
    <script>
        
        var output = document.getElementById( 'validLink' );
        var url = window.location.href;
        var urlSplit = url.split( '/' );
        var validatorUrl = '';
        
        if ( urlSplit[urlSplit.length - 1].indexOf('.') >= 0 ) {
        	urlSplit[urlSplit.length - 1] = '';
        	validatorUrl = urlSplit.join('/');
        } else {
        	if ( url.lastIndexOf('/') != url.length - 1 ) {
            	validatorUrl = url + '/';
            } else {
            	validatorUrl = url;
            }
        }
        
        var index = validatorUrl.indexOf( '?' );
            
        if ( index != -1 ) {
            validatorUrl = validatorUrl.substring( 0, index );
        }
        
        index = validatorUrl.indexOf( '#' );
        
        if ( index != -1 ) {
            validatorUrl = validatorUrl.substring( 0, index );
        }

        output.innerHTML = '<p>XML: <a href="'+ validatorUrl + 'assets/sbplus.xml" target="_blank">' + validatorUrl + 'assets/sbplus.xml</a></p><p>Validate the XML file using any one of the following services. All of the services can load XML by URL, upload, or direct input.<ul><li><a href="https://www.truugo.com/xml_validator/" target="blank">Truugo</a></li><li><a href="https://codebeautify.org/xmlvalidator" target="blank">Code Beautify</a></li><li><a href="https://jsonformatter.org/xml-validator" target="blank">JSON formatter</a></li></ul></p>';
        
    </script>
</div>