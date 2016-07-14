/***************************************
    Get Downloadable Item(s) Module
****************************************/

var sbplusDownloadable = ( function() {
    
    var videoPath, audioPath, transcriptPath, supplementPath;
    var downloads = {};
    
    function getItems() {
        
        var fileName = $.fn.getRootDirectory();
        
        $.get( fileName + '.mp4', function() {
                
            videoPath = this.url;
            downloads.video = videoPath;
            
        } ).always( function() {
            
            $.get( fileName + '.mp3', function() {
            
                audioPath = this.url;
                downloads.audio = audioPath;
                
            } ).always( function() {
                
                $.get( fileName + '.pdf', function() {
            
                    transcriptPath = this.url;
                    downloads.pdf = transcriptPath;
                    
                } ).always( function() {
                    
                    $.get( fileName + '.zip', function() {
            
                        supplementPath = this.url;
                        downloads.zip = supplementPath;
                        
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
    
    function getDownloads() {
        return downloads;
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
        
        if ( supplementPath === undefined && transcriptPath === undefined && audioPath === undefined && videoPath === undefined ) {
            $( '.download_files' ).html('No downloadable file available.');
            setTimeout(function() {
                
                var parent = $( '.download_files' ).parent();
                var target = $( '.download_files' );
                
                parent.animate({'height': (parent.outerHeight() - target.outerHeight(true)) }, 500, 'linear');
                target.fadeOut();
                
            }, 3000);
        } else {
            $( '.download_files' ).hide().html( downloadables ).fadeIn( 500 );
        }
        
    }
    
    return {
        
        get: getItems,
        getDownloads: getDownloads
        
    };
    
} )();