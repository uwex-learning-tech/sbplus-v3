/***************************************
    Get Menu Module
****************************************/

var sbplusMenu = ( function() {
    
    var context;
    var manifest;
    var settingLoaded = '';
    var profileLoaded = '';
    var profile;
    
    function get( _manifest, _context ) {
        
        manifest = _manifest;
        context = _context;
        _render();
        
    }
    
    function _render() {
        
        _bindMenuEvents();
        
    }
    
    function _bindMenuEvents() {
 
        $( '.menuBtn' ).on( 'click', function() {
        
            $( this ).attr( 'aria-expanded', 'true' );
            $( '#menu_panel' ).removeClass( 'hide' ).attr( 'aria-expanded', 'true' );
            
            return false;
        
        } );
        
        
        $( '.backBtn' ).on( 'click', function() {
        
            _renderMenuItemDetails();
            
            return false;
        
        } );
        
        $( '.closeBtn' ).on( 'click', function() {
        
            $( '.menuBtn' ).attr( 'aria-expanded', 'false' );
            $( '#menu_panel' ).addClass( 'hide' ).attr( 'aria-expanded', 'false' );
            
            _renderMenuItemDetails();
            return false;
        
        } );
        
        $( '#showProfile' ).on( 'click', _onMenuItemClick );
        $( '#showGeneralInfo' ).on( 'click', _onMenuItemClick );
        $( '#showHelp' ).on( 'click', _onMenuItemClick );
        $( '#showSettings' ).on( 'click', _onMenuItemClick );
     
    }
    
    function _onMenuItemClick () {
    
        var title, content = ''; 
        var selector = '#' + this.id;
        var self = this;
        
        switch ( selector ) {
        
            case '#showProfile':
                
                var author = context.data.find( 'setup' ).find( 'author' );
                var authorName = author.attr( 'name' );
                
                title = 'Author Profile';
                
                if ( $.fn.isEmpty( author.text() ) ) {
                    
                    if ( profileLoaded.length === 0 ) {
                        
                        var file = manifest.sbplus_author_directory + $.fn.cleanString( authorName );
                        
                        $.ajax({
                            crossDomain: true,
                            type: 'GET',
                            dataType: 'jsonp',
                            jsonpCallback: 'author',
                            url: file + '.json',
                            success: function( res ) {
                                
                                profileLoaded = res;
                                
                                var profileImage = new Image();
                                
                                $( profileImage ).load( function() {
                                    
                                    profile = '<img class="profileImg" src="' + file + '.jpg" alt="Photo of ' + res.name + '" />';
                                    profile += '<p class="name">' + res.name + '</p>' + res.profile;
                                    _renderMenuItemDetails( self, title, profile );
                                    
                                } ).error( function() {
                                    
                                    profile = '<p class="name">' + res.name + '</p>' + res.profile;
                                    _renderMenuItemDetails( self, title, profile );
                                    
                                } ).attr( {
                                    'src': file + '.jpg',
                                    'border': 0
                                } );
                                
                            },
                            error: function() {
                                
                                var msg = '<p style="color:#f00;">No author profile found for ' + authorName + '.</p>';
                                _renderMenuItemDetails( self, title, msg );
                                
                            }
                        });
                        
                    } else {
                        
                        content = profile;
                        
                    }
                    
                } else {
                    
                    content = author.text();
                    
                }
                
            break;
            
            case '#showGeneralInfo':
                
                title = 'General Information';
                content = context.generalInfo;
                
            break;
            
            case '#showHelp':
                
                title = 'Help';
                content = manifest.sbplus_help_information;
                
            break;
            
            case '#showSettings':
                
                title = 'Settings';
                
                if ( settingLoaded.length === 0 ) {
                    
                    $.get( manifest.sbplus_root_directory + 'scripts/templates/settings.tpl', function( data ) {
                    
                        settingLoaded = data;
                        _renderMenuItemDetails( self, title, data );
                        _syncSettings();
                        
                    } );
                    
                } else {
                    
                    content = settingLoaded;
                    _syncSettings();
                    
                }
                
            break;
            
            default:
            
                title = '';
                content ='';
                
            break;
            
        }
        
        if ( title !== '' && content !== '' ) {
            
            _renderMenuItemDetails( self, title, content );
            
        }
        
        return false;
        
    }
    
    function _renderMenuItemDetails( el, title, content ) {
        
        var menuPanel = $( '#menu_panel' );
        var menuItem = $( '.menu_item_details' );
        var menuTitle = $( '.menu_item_details .navbar .title' );
        var menuContent = $( '.menu_item_details .menu_item_content' );
        
        if ( typeof el === 'undefined' ) {
            
            $( '.menu_item a' ).attr( 'aria-expanded', 'false' );
        
            menuItem.attr( 'aria-expanded', 'false' ).animate( { right: '-100%' }, 250, function() {
                
                $( this ).addClass( 'hide' );
            
            } );
            
            _unbindSaveBtn();
            
            return;
            
        }
        
        $( el ).attr( 'aria-expanded', 'true' );
        
        menuItem.attr( 'aria-expanded', 'true' );
        menuTitle.html( title );
        menuContent.html( content );
        menuItem.removeClass( 'hide' ).animate( { right: '0px' }, 250 );
        
        if ( $(el)[0].id === 'showSettings' ) {
            _bindSaveBtn();
        }
        
        menuContent.css('height', menuPanel.outerHeight() - $( '.title_bar' ).outerHeight() - menuTitle.outerHeight());
        
    }
    
    function _syncSettings() {
        
        // autoplay
        var autoplayVal = $.fn.getCookie('sbplus-vjs-autoplay');
        
        if ( autoplayVal === '1') {
            $( '#autoplay' ).prop( 'checked', true );
        } else {
            $( '#autoplay' ).prop( 'checked', false );
        }
        
        // volume
        var volumeVal = $.fn.getCookie('sbplus-vjs-volume');
        
        $( '#volume' ).prop( 'value', ( volumeVal * 100 ) );
        
        // playrate
        var rateVal = $.fn.getCookie('sbplus-vjs-playbackrate');
        $( '#playback' ).val( rateVal );
        
        // subtitle
        var subtitleVal = $.fn.getCookie('sbplus-vjs-enabledSubtitles');
        
        if ( subtitleVal === '1') {
            $( '#subtitle' ).prop( 'checked', true );
        } else {
            $( '#subtitle' ).prop( 'checked', false );
        }
        
    }
    
    function _bindSaveBtn() {
        
        $( '#saveSettingBtn' ).on('click', function(e) {
            
            var self = $( this );
            var volError = false;
            
            self.prop( 'disabled', true ).html( 'Saving...' );
            
            // autoplay
            if ( $( '#autoplay' ).is( ':checked' ) ) {
                $.fn.setCookie('sbplus-vjs-autoplay', 1);
            } else {
                $.fn.setCookie('sbplus-vjs-autoplay', 0);
            }
            
            // volumne
            var vol = $( '#volume' ).val();
            
            if ( vol < 0 || vol > 100 || vol === '' ) {
                volError = true;
                vol = 8;
            } else {
                $.fn.setCookie('sbplus-vjs-volume', ( vol / 100 ) );
            }
            
            // playrate
            $.fn.setCookie('sbplus-vjs-playbackrate', $( '#playback option:selected' ).val() );
            
            //subtitle
            if ( $( '#subtitle' ).is( ':checked' ) ) {
                $.fn.setCookie('sbplus-vjs-enabledSubtitles', 1);
            } else {
                $.fn.setCookie('sbplus-vjs-enabledSubtitles', 0);
            }
            
            if ( volError ) {
                
                $( '#volume' ).parent().parent().addClass( 'invalid' );
                $( '#volume' ).parent().after( '<p class="emsg">Must be between 0 to 100.</p>' );
                
            } else {
                
                $( '#volume' ).parent().parent().removeClass( 'invalid' );
                $( '.emsg' ).remove();
                
            }
            
            setTimeout(function() {
                
                _syncSettings();
                self.html( 'Settings Saved!' );
                
                setTimeout(function() {
                
                    self.prop( 'disabled', false ).html( 'Save' );
                    
                }, 2000);
                
            }, 1000);
            
            e.preventDefault();
            return false;
            
        } );
        
    }
    
    function _unbindSaveBtn() {
        
        $( '#saveSettingBtn' ).unbind();
        
    }
    
    return {
        
        get: get
        
    };
    
} )();