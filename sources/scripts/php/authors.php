<?php
    
    $path = $_SERVER['DOCUMENT_ROOT']."/content/media/player_support/author/*.json";
    $jsonStr = "[";
    
    foreach ($dirFiles = glob($path) as $file) {
        
        $fileName = basename($file, ".json");
        
        $aPattern = "(author\()";
        $ePattern = "((\);))";
        $content = file_get_contents($file);
        $content = preg_replace($aPattern, "", $content);
        $content = preg_replace($ePattern, "", $content);
        $author = json_decode($content, true);
        
        $jsonStr .= '{"file":"' . $fileName . '","name":"' . $author['name'] . '"}';
        
        if ($file !== end($dirFiles)) {
            $jsonStr .= ",";
        }
        
    }
    
    $jsonStr .= "]";
    
    header('Content-type:application/json;charset=utf-8');
    echo $jsonStr;

?>