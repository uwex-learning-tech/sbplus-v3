<?php
    
    $jsonStr = "[";
    
    foreach ($dirFiles = glob("./*.json") as $file) {
        
        $fileName = $file;
        
        $fPattern = "(.\/)";
        $sPattern = "(.json)";
        $fileName = preg_replace($fPattern, "", $fileName);
        $fileName = preg_replace($sPattern, "", $fileName);
        
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