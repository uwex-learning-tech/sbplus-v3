<?php
    
    if ( isset( $_REQUEST["uri"] ) ) {
        
        $url = urldecode( $_REQUEST["uri"] );
        $files = array();
        
        foreach ($dir = glob($_SERVER['DOCUMENT_ROOT'].$url."*") as $file) {

            array_push($files, preg_replace("/\/.*\//", "", $file));
            
        }
        
        echo json_encode($files);
        
    } else {
        
        header("HTTP/1.0 404 Not Found");
        
    }

?>


