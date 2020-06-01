<?php
    
    if ( isset( $_REQUEST["uri"] ) ) {
        
        $url = urldecode( $_REQUEST["uri"] );
        
        $entryIds = [];
        $doc = new DOMDocument();

        $curlSession = curl_init();
        curl_setopt($curlSession, CURLOPT_URL, $url);
        curl_setopt($curlSession, CURLOPT_RETURNTRANSFER, true);

        $content = curl_exec($curlSession);
        curl_close($curlSession);

        $doc->loadXML( $content );
        $pages = $doc->getElementsByTagName( 'page' );

        foreach ( $pages as $page ) {

            $type = $page->getAttribute( 'type' );
            
            if ( $type == 'kaltura' ) {
                $id = $page->getAttribute( 'src' );
                array_push( $entryIds, $id );
            }

        }

        echo json_encode( $entryIds );
        
    } else {
        
        header("HTTP/1.0 404 Not Found");
        
    }

?>