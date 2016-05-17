/***************************************
    Get Error Module
****************************************/

var sbplusError = ( function() {
    
    var title, content;
    
    function show( _title, _content ) {
        
        title = _title;
        content = _content;
        _render();
        
    }
    
    function _render() {
        
        $('.sbplus_wrapper').html( '<div class="error"><h1>' + title + '</h1><p>' + content + '</p></div>' );
        
    }
    
    return {
        
        show: show
        
    };
    
} )();