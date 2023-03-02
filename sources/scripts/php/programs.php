<?php
    
    $path = $_SERVER['DOCUMENT_ROOT']."/content/";
    $dirs = array_diff(scandir($path),array(".","..","..."));
    $jsonStr = "[";
    
    foreach ($dirs as $dir) {
        
        if (is_dir($path . $dir)) {
            
            $jsonStr .= '{"name":"' . $dir . '"}';
        
            if ($dir !== end($dirs)) {
                $jsonStr .= ",";
            }
            
        }
        
    }
    
    $jsonStr .= "]";
    
    header('Content-type:application/json;charset=utf-8');
    echo $jsonStr;

?>
