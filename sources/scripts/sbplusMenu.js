/***************************************
    Get Menu Module
****************************************/

var sbplusMenu = ( function() {
    
    var context;
    var manifest;
    var settings;
    var settingLoaded = '';
    var profileLoaded = false;
    var profile;
    var photo = '';
    
    function get( _manifest, _context, _settings ) {
        
        manifest = _manifest;
        context = _context;
        settings = _settings;
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
                
                title = 'Author Profile';
                
                var author = context.data.find( 'setup' ).find( 'author' );
                var authorName = author.attr( 'name' );
                var cleanedName = $.fn.cleanString( authorName );
                
                // get local author photo
                // 1st failed - local photo does not exist; check server
                // 2nd failed - server photo does not exist; use default
                
                if ( profileLoaded === false ) {
                    
                    $.ajax( {
    
                        type: 'HEAD',
                        url: 'assets/' + cleanedName + '.jpg'
                        
                    } ).done( function() {
                        
                        photo = '<div class="profileImg"><img src="' + this.url + '" alt="Photo of ' + authorName + '" /></div>';
                        _setAuthorBio( title, self, authorName, cleanedName, author );
                        
                    } ).fail( function() {
                        
                        $.ajax( {
                            
                            type: 'HEAD',
                            url: manifest.sbplus_author_directory + cleanedName + '.jpg'
                        
                        } ).done( function() {
                            
                            photo = '<div class="profileImg"><img src="' + this.url + '" alt="Photo of ' + authorName + '" /></div>';
                            _setAuthorBio( title, self, authorName, cleanedName, author );
                            
                        } ).fail( function() {
                            
                            photo = '<div class="profileImg"><img class="noPhoto" src="' + manifest.sbplus_root_directory + 'images/default_photo.png" alt="Photo of ' + authorName + '" /></div>';
                            _setAuthorBio( title, self, authorName, cleanedName, author );
                            
                        } );
                        
                    } );
                
                } else {
                    
                    _setAuthorBio( title, self, authorName, cleanedName, author );
                    
                }
                
            break;
            
            case '#showGeneralInfo':
                
                title = 'General Information';
                content = $.fn.stripScript( context.generalInfo );
                _renderMenuItemDetails( self, title, content );
                
            break;
            
            case '#showHelp':
                
                title = 'Help';
                content = $.fn.stripScript( manifest.sbplus_help_information );
                _renderMenuItemDetails( self, title, content );
                
            break;
            
            case '#showSettings':
                
                title = 'Settings';
                
                if ( Modernizr.localstorage ) {
                    
                    if ( settingLoaded.length === 0 ) {
                    
                        $.get( manifest.sbplus_root_directory + 'scripts/templates/settings.tpl', function( data ) {
                        
                            settingLoaded = data;
                            _renderMenuItemDetails( self, title, data );
                            _syncSettings();
                            
                        } );
                        
                    } else {
                        
                        content = settingLoaded;
                        _renderMenuItemDetails( self, title, content );
                        _syncSettings();
                        
                    }
                    
                } else {
                    
                    content = '<p style="color:#f00;">Your web browser does not local storage to store setting data.</p>';
                    _renderMenuItemDetails( self, title, content );
                    
                }
                
            break;
            
            default:
            break;
            
        }
        
        return false;
        
    }
    
    function _setAuthorBio( title, self, authorName, cleanedName, author ) {
        
        // get author bio
        if ( $.fn.isEmpty( author.text() ) ) {
            
            if ( profileLoaded === false ) {
                
                $.ajax( {
                    
                    crossDomain: true,
                    type: 'GET',
                    dataType: 'jsonp',
                    jsonpCallback: 'author',
                    url: manifest.sbplus_author_directory + cleanedName + '.json'
                    
                } ).done( function(res) {
                                                  
                    profile = '<p class="name">' + $.fn.stripScript( res.name ) + '</p>' + $.fn.stripScript( res.profile );
                     _renderMenuItemDetails( self, title, profile );
                    
                } ).fail( function( xhr, status ) {
                    
                    profile = '<p style="font-size:18px;font-weight:bold;">Author profile not available.</p>';
                    
                    if ( status === 'parsererror' ) {
                        
                        profile = '<p style="color:#f00;">Author profile failed to load. Syntax error.</p>';
                        
                    }
                    
                    _renderMenuItemDetails( self, title, profile );
                    
                } ).always( function() {
                    
                    profileLoaded = true;
                    
                } );
                
            } else {
                
                _renderMenuItemDetails( self, title, profile );
                
            }
            
        } else {
            
                _renderMenuItemDetails( self, title, '<p class="name">' + authorName + '</p>' +  $.fn.stripScript( author.text() ) );
            
        }
        
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
        
        if ( $(el)[0].id === 'showProfile' ) {
            
            menuContent.html( photo + '<div class="content">' + content + '</div>' );
            
        } else {
            
            menuContent.html( '<div class="content">' + content + '</div>' );
            
        }
        
        if ( $(el)[0].id === 'showSettings' ) {
            
            if( $.fn.isMobile() ) {
                
                $( '#autoplay' ).prop( 'checked', false ).attr( 'disabled', true );
                $( '#autoplay' ).parent().after( '<em style="color:red">Mobile devices do not support autoplay.</em>' );
                
            }
            
            _bindSaveBtn();
            
        }
        
        if ( $(el)[0].id === 'showHelp' ) {
            menuContent.append( '<div class=\"sbplus-info\">Powered by Storybook Plus version 3.0.0.</div>' );
        }
        
        menuContent.css('height', menuPanel.outerHeight() - $( '.title_bar' ).outerHeight() - menuTitle.outerHeight());
        
        menuItem.removeClass( 'hide' ).animate( { right: '0px' }, 250 );
        
        if ( settings.mathjax === 'on' ) {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        }
        
    }
    
    function _syncSettings() {
        
        // autoplay
        var autoplayVal = $.fn.getLSItem('sbplus-vjs-autoplay');
        
        if ( $.fn.isMobile() === false ) {
            
            if ( autoplayVal === '1') {
                $( '#autoplay' ).prop( 'checked', true );
            } else {
                $( '#autoplay' ).prop( 'checked', false );
            }
            
        }
        
        // volume
        var volumeVal = $.fn.getLSItem('sbplus-vjs-volume');
        
        $( '#volume' ).prop( 'value', ( volumeVal * 100 ) );
        
        // playrate
        var rateVal = $.fn.getLSItem('sbplus-vjs-playbackrate');
        $( '#playback' ).val( rateVal );
        
        // subtitle
        var subtitleVal = $.fn.getLSItem('sbplus-vjs-enabledSubtitles');
        
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
                $.fn.setLSItem('sbplus-vjs-autoplay', 1);
            } else {
                $.fn.setLSItem('sbplus-vjs-autoplay', 0);
            }
            
            // volumne
            var vol = $( '#volume' ).val();
            
            if ( vol < 0 || vol > 100 || vol === '' ) {
                volError = true;
                vol = 8;
            } else {
                $.fn.setLSItem('sbplus-vjs-volume', ( vol / 100 ) );
                $.fn.ssSet( 'sbplus-vjs-volume-temp', $.fn.getLSItem( 'sbplus-vjs-volume' ) );
            }
            
            // playrate
            $.fn.setLSItem('sbplus-vjs-playbackrate', $( '#playback option:selected' ).val() );
            $.fn.ssSet( 'sbplus-vjs-playbackrate-temp', $.fn.getLSItem( 'sbplus-vjs-playbackrate' ) );
            
            //subtitle
            if ( $( '#subtitle' ).is( ':checked' ) ) {
                $.fn.setLSItem('sbplus-vjs-enabledSubtitles', 1);
            } else {
                $.fn.setLSItem('sbplus-vjs-enabledSubtitles', 0);
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