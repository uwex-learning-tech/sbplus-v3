<?php

    $jsonStr = "[";
    
    foreach ($dirs = array_diff(scandir("."),array(".","..","...")) as $dir) {
        
        if (is_dir($dir)) {
            
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
