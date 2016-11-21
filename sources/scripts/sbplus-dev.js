var SBPLUS = SBPLUS || {
    
    /***************************************************************************
        VARIABLES / CONSTANTS / OBJECTS
    ***************************************************************************/
    
    layout: null,
    tableOfContents: null,
    menu : null,
    button: null,
    manifest: null,
    isReady: false,
    templateLoaded: false,
    beforePresentingDone: false,
    
    /***************************************************************************
        CORE FUNCTIONS
    ***************************************************************************/
    
    go: function() {
        
        if ( this.manifest === null ) {
            
            var self = this;
        
            this.layout = {
                isMobile: false,
                html: 'html',
                wrapper: '.sbplus_wrapper',
                sbplus: '#sbplus',
                errorScreen: '#sbplus_error_screen',
                splashScreen: '#sbplus_splash_screen',
                widget: '#sbplus_widget',
                media: '#sbplus_media_wrapper',
                sidebar: '#sbplus_right_col',
                dwnldMenu: null
            };
            
            this.tableOfContents = {
                header: '.section .header',
                page: '.section .list .item'
            },
            
            this.button = {
                start: '#sbplus_start_btn',
                resume: '#sbplus_resume_btn',
                download: '#sbplus_download_btn',
                widget: '#sbplus_widget_btn',
                sidebar: '#sbplus_sidebar_btn',
                author: '#sbplus_author_name',
                menu: '#sbplus_menu_btn'
            };
            
            this.menu = {
                menuPanel: '#sbplus_menu_items_wrapper',
                menuBar: '#sbplus_sub_bar',
                menuList: '#sbplus_menu_items_wrapper .list',
                menuItem: '#sbplus_menu_items_wrapper .menu.item',
                menuContent: '#menu_item_content'
            };
            
            $.getJSON( this.getManifestUrl(), function( data ) {
                
                self.isReady = true;
                self.manifest = data;
                self.loadTemplate();
                
            } ).fail( function() {
                
                var msg = '<div class="error">';
                msg += '<p><strong>Storybook Plus Error:</strong> ';
                msg += 'failed to load the manifest file.<br>'
                msg += 'Expecting: <code>' + this.url + '</code></p>';
                msg += '</div>';
                
                $( self.layout.wrapper ).html( msg );
                
            } );
            
        } else {
            
            return 'Storybook Plus is already in ready state.';
            
        }
             
    },
    
    /***************************************************************************
        CORE EVENTS FUNCTIONS
    ***************************************************************************/
    
    loadTemplate: function() {
        
        if ( this.isReady && this.templateLoaded === false ) {
            
            var self = this;
            var templateUrl = this.manifest.sbplus_root_directory;
            templateUrl += 'scripts/templates/sbplus.tpl';
            
            // call and set the template frame
            $.get( templateUrl, function( data ) {
                
                self.templateLoaded = true;
                
                $( self.layout.wrapper ).html( data );
                
                // do initial setup before presenting
                self.beforePresenting();
                
                // show error is any
                if ( self.checkForSupport() === 0 ) {
                    self.showErrorScreen();
                    return false;
                }
                
                // button click events
                $( self.button.sidebar ).on( 'click', self.toggleSidebar.bind( self ) );
                $( self.button.widget ).on( 'click',  self.toggleWidget.bind( self ) );
                $( self.button.menu ).on( 'click', self.toggleMenu.bind( self ) );
                $( self.button.author ).on( 'click', function() {
                    self.openMenuItem( '#sbplus_author_profile' );
                } );
                $( self.button.start ).on( 'click', self.hideSplash.bind( self ) );
                $( self.button.resume ).on( 'click', self.hideSplash.bind( self ) );
                $( self.tableOfContents.header ).on( 'click', self.toggleSection.bind(self) );
                $( self.tableOfContents.page ).on( 'click', self.selectPage.bind(self) );
                
                self.layout.dwnldMenu = new MenuBar( $( self.button.download )[0].id, false );
                
                // calculate the layout on window resize
                $( window ).on( 'resize', self.resize.bind( self ) );
                
            } ).fail( function() {
                
                var msg = '<div class="error">';
                msg += '<p><strong>Storybook Plus Error:</strong> ';
                msg += 'failed to load template.<br>'
                msg += 'Expecting: <code>' + this.url + '</code></p>';
                msg += '</div>';
                
                $( self.layout.wrapper ).html( msg );
                
            } );
            
        } else {
            
            return 'Storybook Plus template already loaded.';
            
        }
        
    },
    
    beforePresenting: function() {
        
        if ( this.isReady && this.templateLoaded && this.beforePresentingDone === false ) {
            
            this.beforePresentingDone = true;
            this.resize();
            this.setURLOptions();
            
            var pageSectionHeader = $( this.tableOfContents.header );
            if ( pageSectionHeader.length === 1 ) {
                pageSectionHeader.hide().off( 'click' );
            }
            
        }
        
    },
    
    toggleSection: function( e ) {
        
        var totalHeaderCount = $( this.tableOfContents.header ).length;
        
        if ( totalHeaderCount > 1 ) {
            
            var targetSectionHeader;
        
            if ( e instanceof Object ) {
                targetSectionHeader = $( e.currentTarget );
            } else {
                
                if ( Number( e ) > totalHeaderCount - 1 ) {
                    return false;
                }
                
                targetSectionHeader = $( '.header:eq(' + e + ')' );
                
            }
            
            var target = $( targetSectionHeader.siblings( '.list' ) );
            var icon = targetSectionHeader.find( '.icon' );
            
            if ( target.is( ':visible' ) ) {
                target.slideUp();
                icon.html( '<span class="icon-open"></span>' );
            } else {
                target.slideDown();
                icon.html( '<span class="icon-collapse"></span>' );
            }
            
        }
        
    },
    
    selectPage: function( e ) {
        
        var targetPage;
        
        if ( e instanceof Object ) {
            targetPage = $( e.currentTarget );
        } else {
            
            targetPage = $( '.item[data-page="' + e + '"]' );
            
            if ( targetPage.length === 0 ) {
                return false;
            }
            
        }
        
        if ( !targetPage.hasClass( 'sb_selected' ) ) {
            
            var previousPage = $( this.tableOfContents.page );
            var sectionHeader = $( this.tableOfContents.header );
            
            if ( sectionHeader.length > 1 ) {
                
                var targetHeader = targetPage.parent().siblings( '.header' );
            
                if ( !targetHeader.hasClass( 'current' ) ) {
                    sectionHeader.removeClass( 'current' );
                    targetHeader.addClass( 'current' );
                }
                
            }
            
            previousPage.removeClass( 'sb_selected' );
            targetPage.addClass( 'sb_selected' );
            
        }
        
    },
    
    hideSplash: function() {
        
        $( this.layout.splashScreen ).addClass( 'fadeOut' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                 function() {
                     $( this ).removeClass( 'fadeOut' ).hide();
                     $( this ).off();
                 }
            );
            
    },
    
    toggleSidebar: function() {
        
        if ( $( this.layout.sidebar ).is( ':visible' ) ) {
            this.hideSidebar();
        } else {
           this.showSidebar();
        }
        
    },
    
    hideSidebar: function() {
        
        var widget = $( this.layout.widget );
        var media = $( this.layout.media );
        
        $( this.layout.sidebar ).hide();
        $( this.button.sidebar ).removeClass( 'sb_active' );
        
        if ( widget.is( ':visible' ) && widget.outerHeight() <= 190 ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        }
        
    },
    
    showSidebar: function() {
        
        var widget = $( this.layout.widget );
        var media = $( this.layout.media );
        
        $( this.layout.sidebar ).show();
        $( this.button.sidebar ).addClass( 'sb_active' );
        
        if ( widget.is( ':visible' ) && widget.outerHeight() <= 190 ) {
            media.removeClass( 'non_aspect_ratio' ).addClass( 'aspect_ratio' );
        }
        
    },
    
    toggleWidget: function() {
        
        if ( $( this.layout.widget ).is( ':visible' ) ) {
            this.hideWidget();
        } else {
            this.showWidget();
        }
        
    },
    
    hideWidget: function() {
        
        var media = $( this.layout.media );
        
        $( this.layout.widget ).hide();
        $( this.button.widget ).removeClass( 'sb_active' );
        
        if ( this.layout.isMobile ) {
            media.addClass( 'aspect_ratio' );
            this.resize();
        } else {
            media.removeClass( 'aspect_ratio' )
                    .addClass( 'non_aspect_ratio' ).css( 'height', '100%');
        }
        
    },
    
    showWidget: function() {
        
        $( this.layout.widget ).show();
        $( this.button.widget ).addClass( 'sb_active' );
        $( this.layout.media ).removeClass( 'non_aspect_ratio' )
                .addClass( 'aspect_ratio' ).css( 'height', '' );
        this.resize();
        
    },
    
    toggleMenu: function() {
        
        if ( $( this.menu.menuPanel ).is( ':visible' ) ) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
        
    },
    
    showMenu: function() {
        
        if ( !$( this.layout.sidebar ).is( ':visible' ) ) {
           this.showSidebar();
        }
        
        var menuPanel = $( this.menu.menuPanel );
        
        $( this.button.menu ).html( '<span class="icon-close"></span>' )
            .css( {
                'color': '#f00',
                'padding-top': '4px'
            } );
        $( this.menu.menuBar ).find( '.title' ).html( 'Menu' );
        
        menuPanel.show().addClass( 'slideInRight' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                 function() {
                     $( this ).removeClass( 'slideInRight' );
                     $( this ).off();
                 }
            );
            
        $( this.menu.menuItem ).on( 'click', this.openMenuItem.bind( this ) );
        
    },
    
    hideMenu: function() {
        
        var self = this;
        var menuPanel = $( this.menu.menuPanel );
        var menuBar = $( this.menu.menuBar );
        
        $( this.button.menu ).html( 'Menu' )
            .css( {
                'color': '',
                'padding-top': ''
            } );
        
        menuBar.find( '.title' ).html( 'Table of Contents' );
        
        menuPanel.addClass( 'slideOutRight' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    menuPanel.hide().removeClass( 'slideOutRight' );
                    self.resetMenu();
                    $( this ).off();
                }
             );

    },
    
    openMenuItem: function( e ) {
        
        if ( !$( this.menu.menuPanel ).is( ':visible' ) ) {
            this.showMenu();
        }
        
        var itemId = '';
        
        if ( typeof e === 'string' ) {
            itemId = e;
        } else {
            itemId = '#' + e.currentTarget.id;
        }
        
        var menuBar = $( this.menu.menuBar );
        var menuList = $( this.menu.menuList );
        var menuContent = $( this.menu.menuContent );
        var target = $( itemId );
        var backBtn = menuBar.find( '.backBtn' );
        
        menuBar.removeClass( 'full' );
        menuBar.find( '.title' ).html( target.html() );
        
        if ( menuContent.is( ':visible' ) ) {
            
            menuList.off();
            
        } else {
            
            if ( !menuList.hasClass( 'fadeOutLeft' ) ) {
                menuList.addClass( 'fadeOutLeft' );
            }
            
            menuList.one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    
                    $(this).hide().removeClass( 'fadeOutLeft' );
                    menuContent.show()
                        .html( '<p>External template data here...</p>' );
                    $( this ).off();
                    
                }
            );
            
            backBtn.prop( 'disabled', false ).one( 'click', function() {
                    
                menuBar.addClass( 'full' ).find( '.title' ).html( 'Menu' );
                
                menuList.show();
                
                if ( !menuList.hasClass( 'fadeInLeft' ) ) {
                    menuList.addClass( 'fadeInLeft' );
                }
                
                menuList.one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    $( this ).removeClass( 'fadeInLeft' );
                    $( this ).off();
                } );
                
                menuContent.hide().empty();
                
                $( this ).prop( 'disabled', true );
                $( this ).off( 'click' );
            
            } );
            
        }
            
    },
    
    resetMenu: function() {
        
        if ( !$( this.menu.menuPanel ).is( ':visible' ) ) {
            
            var menuBar = $( this.menu.menuBar );
        
            menuBar.find( '.title' ).html( 'Table of Contents' );
            menuBar.addClass( 'full' );
            menuBar.find( '.backBtn' ).hide().prop( 'disabled', true );
            
            $( this.menu.menuList ).show();
            $( this.menu.menuContent ).empty().hide();
            $( this.menu.menuItem ).off( 'click' );
            
        }
        
    },
    
    showErrorScreen: function() {
        
        if ( this.checkForSupport() === 0 ) {
            $( this.layout.sbplus ).hide();
            $( this.layout.errorScreen ).show().addClass( 'shake' )
                .css( 'display', 'flex' );
        } else {
            return 'No errors!';
        }
        
    },
    
    /***************************************************************************
        HELPER FUNCTIONS
    ***************************************************************************/
    
    checkForSupport: function() {
        
        if ( Modernizr.video && Modernizr.eventlistener && Modernizr.json && 
             Modernizr.flexbox && Modernizr.flexwrap && Modernizr.csscalc ) {
            return 1;
        }
        
        return 0;
        
    },
    
    calcLayout: function() {
        
        var media = $( this.layout.media );
        var widget = $( this.layout.widget );
        var sidebar = $( this.layout.sidebar );
        
        if ( window.innerWidth >= 1826 ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        } else {
            media.removeClass( 'non_aspect_ratio' ).addClass( 'aspect_ratio' );
        }
        
        if ( !widget.is( ':visible' ) ) {
            media.css( 'height', '100%' );
        }
        
        if ( window.innerWidth <= 740 || window.screen.width <= 414 ) {
            this.layout.isMobile = true;
        } else {
            this.layout.isMobile = false;
        }
        
        if ( this.layout.isMobile === false && widget.outerHeight() <= 190 ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        }
        
        if ( this.layout.isMobile === true ) {
            sidebar.css( 'height', 'calc( 100% - ' + media.height() + 'px)'  );
        } else {
            sidebar.css( 'height', ''  );
        }
        
        this.calcWidgetHeight();
        
    },
    
    calcWidgetHeight: function() {
        
        var sidebar = $( this.layout.sidebar );
        var widget = $( this.layout.widget );
        
        if ( this.layout.isMobile === true ) {  
            widget.css( {
                'height': sidebar.outerHeight(),
                'bottom': sidebar.outerHeight() * -1
            } );
        } else {
            widget.css( {
                'height': '',
                'bottom': ''
            } );
        }
        
    },
    
    resize: function() {
        
        this.calcLayout();
            
        if ( this.layout.isMobile ) {
            this.showSidebar();
        }
        
    },
    
    setURLOptions: function() {
        
        var html = $( this.layout.html );
        var wrapper = $( this.layout.wrapper );
        
        if ( this.getUrlParam( 'fullview' ) === '1' ) {
            html.addClass( 'sbplus_pop_full' );
            wrapper.removeClass( 'sbplus_boxed' ).addClass( 'sbplus_full' );
        } else {
            html.removeClass( '.sbplus_pop_full' );
            wrapper.addClass( 'sbplus_boxed' ).removeClass( 'sbplus_full' );
        }  
            
    },
    
    getUrlParam: function( name ) {
        
        var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                        .exec(window.location.href);
        
    	if ( results === null ) {
           return null;
        }
        
        return results[1] || 0;
        
    },
    
    getManifestUrl: function() {
        
        var manifest = $( '#sbplus_configs' );
        
        if ( manifest.length ) {
            return manifest[0].href;
        }
        
        return '';
        
    }
        
};

/*******************************************************************************
        ON DOM READY
*******************************************************************************/

$( function() {
    
    SBPLUS.go();
    
} );





