<?php
    
    $dirs = array_diff(scandir("content"),array(".","..","..."));
    
    $jsonStr = "[";
    
    foreach ($dirs as $dir) {
        
        if (is_dir("./content/" . $dir)) {
            
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
