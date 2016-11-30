<div id="sbplus_error_info">
    <p class="center_icon"><span class="icon-warning"></span></p>
    <h1>Something went wrong in the XML!</h1>
    <p id="validLink"></p>
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

        output.innerHTML = '<a href="https://validator.w3.org/check?uri=' + validatorUrl + 'assets/sbplus.xml' + '&charset=%28detect+automatically%29&doctype=Inline&group=0" target="_blank">Validate the XML at the WC3 Markup Validation Service.</a>';
        
    </script>
</div>