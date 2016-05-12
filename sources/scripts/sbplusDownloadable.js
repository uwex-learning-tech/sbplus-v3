/***************************************
    Get Downloadable Item(s) Module
****************************************/

var sbplusDownloadable = ( function() {
    
    var videoPath, audioPath, transcriptPath, supplementPath;
    
    function getItems() {
        
        var fileName = $.fn.getProgramDirectory();
        
        $.get( fileName + '.mp4', function() {
                
            videoPath = this.url;
            
        } ).always( function() {
            
            $.get( fileName + '.mp3', function() {
            
                audioPath = this.url;
                
            } ).always( function() {
                
                $.get( fileName + '.pdf', function() {
            
                    transcriptPath = this.url;
                    
                } ).always( function() {
                    
                    $.get( fileName + '.zip', function() {
            
                        supplementPath = this.url;
                        
                    } ).always( function() {
                        
                        _render();
                        
                    } );
                    
                } );
                
            } );
            
        } );
        
    }
    
    function getEl( type, path ) {
        
        return '<a class="dl_item ' + type + '" href="' + path + '" role="button" tabindex="1" aria-label="Download ' + type + ' file" download><span class="icon-download"></span> ' + type.capitalize() + '</a> ';
        
    }
    
    function _render() {
        
        var downloadables = '';
        
        if ( typeof videoPath !== 'undefined' ) {
            
            downloadables += getEl( 'video', videoPath );
            
        }
        
        if ( typeof audioPath !== 'undefined' ) {
            
            downloadables += getEl( 'audio', audioPath );
            
        }
        
        if ( typeof transcriptPath !== 'undefined' ) {
            
            downloadables += getEl( 'transcript', transcriptPath );
            
        }
        
        if ( typeof supplementPath !== 'undefined' ) {
            
            downloadables += getEl( 'supplement', supplementPath );
            
        }
        
        $( '.download_files' ).hide().html( downloadables ).fadeIn( 500 );
        
    }
    
    return {
        
        get: getItems
        
    };
    
} )();