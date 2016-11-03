var SBPLUS = SBPLUS || {
    
    /***************************************************************************
        VARIABLES / CONSTANTS / OBJECTS
    ***************************************************************************/
    
    layout: null,
    menu : null,
    
    /***************************************************************************
        CORE FUNCTIONS
    ***************************************************************************/
    
    ready: function() {
    
        this.layout = {
            isMobile: false,
            wrapper: $( '#sbplus' ),
            errorScreen: $( '#sbplus_error_screen' ),
            splashScreen: $( '#sbplus_splash_screen' ),
            widget: $( '#sbplus_widget' ),
            media: $( '#sbplus_media_wrapper' ),
            sidebar: $( '#sbplus_right_col' ),
            dwnldMenu: null
        };
        
        this.button = {
            start: $( '#sbplus_start_btn' ),
            resume: $( '#sbplus_resume_btn' ),
            download: $( '#sbplus_download_btn' ),
            widget: $( '#sbplus_widget_btn' ),
            sidebar: $( '#sbplus_sidebar_btn' ),
            author: $( '#sbplus_author_name' ),
            menu: $( '#sbplus_menu_btn' )
        };
        
        this.menu = {
            menuPanel: $( '#sbplus_menu_items_wrapper' ),
            menuBar: $( '#sbplus_sub_bar' ),
            menuList: $( '#sbplus_menu_items_wrapper .list' ),
            menuItem: $( '#sbplus_menu_items_wrapper .menu.item' ),
            menuContent: $( '#menu_item_content' )
        };
        
        if ( this.checkForSupport() === 0 ) {
            this.showErrorScreen();
            return false;
        }
        
        // calculate the layout initially
        this.resize();
        
        // button click events
        this.button.sidebar.on( 'click', this.toggleSidebar.bind( this ) );
        this.button.widget.on( 'click',  this.toggleWidget.bind( this ) );
        this.button.menu.on( 'click', this.toggleMenu.bind( this ) );
        this.button.author.on( 'click', this.showAthrPrfl.bind( this ) );
        this.button.start.on( 'click', this.hideSplash.bind( this ) );
        this.button.resume.on( 'click', this.hideSplash.bind( this ) );
        this.layout.dwnldMenu = new MenuBar(this.button.download[0].id, false);
        
        // set options from url parameters
        this.setURLOptions();
        
        // calculate the layout on window resize
        $( window ).on( 'resize', this.resize.bind( this ) );
        
    },
    
    /***************************************************************************
        CORE EVENTS FUNCTIONS
    ***************************************************************************/
    
    hideSplash: function() {
        this.layout.splashScreen.addClass( 'fadeOut' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                 function() {
                     $( this ).removeClass( 'fadeOut' ).hide();
                     $( this ).off();
                 }
            );
    },
    
    toggleSidebar: function() {
        
        if ( this.layout.sidebar.is( ':visible' ) ) {
            this.hideSidebar();
        } else {
           this.showSidebar();
        }
        
    },
    
    hideSidebar: function() {
        
        var widget = this.layout.widget;
        var media = this.layout.media;
        
        this.layout.sidebar.hide();
        this.button.sidebar.removeClass( 'sb_active' );
        
        if ( widget.is( ':visible' ) && widget.outerHeight() <= 190 ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        }
        
    },
    
    showSidebar: function() {
        
        var widget = this.layout.widget;
        var media = this.layout.media;
        
        this.layout.sidebar.show();
        this.button.sidebar.addClass( 'sb_active' );
        
        if ( widget.is( ':visible' ) && widget.outerHeight() <= 190 ) {
            media.removeClass( 'non_aspect_ratio' ).addClass( 'aspect_ratio' );
        }
        
    },
    
    toggleWidget: function() {
        
        if ( this.layout.widget.is( ':visible' ) ) {
            this.hideWidget();
        } else {
            this.showWidget();
        }
        
    },
    
    hideWidget: function() {
        
        this.layout.widget.hide();
        this.button.widget.removeClass( 'sb_active' );
        
        if ( this.layout.isMobile ) {
            this.layout.media.addClass( 'aspect_ratio' );
            this.resize();
        } else {
            this.layout.media.removeClass( 'aspect_ratio' )
                    .addClass( 'non_aspect_ratio' ).css( 'height', '100%');
        }
        
    },
    
    showWidget: function() {
        
        this.layout.widget.show();
        this.button.widget.addClass( 'sb_active' );
        this.layout.media.removeClass( 'non_aspect_ratio' )
                .addClass( 'aspect_ratio' ).css( 'height', '' );
        this.resize();
        
    },
    
    toggleMenu: function() {
        if ( this.menu.menuPanel.is( ':visible' ) ) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
        
    },
    
    showMenu: function() {
        
        if ( !this.layout.sidebar.is( ':visible' ) ) {
           this.showSidebar();
        }
        
        var menuPanel = this.menu.menuPanel;
        
        this.button.menu.html( '<span class="icon-close"></span>' )
            .css( {
                'color': '#f00',
                'padding-top': '4px'
            } );
        this.menu.menuBar.find( '.title' ).html( 'Menu' );
        
        menuPanel.show().addClass( 'slideInRight' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                 function() {
                     $( this ).removeClass( 'slideInRight' );
                 }
            );
            
        this.menu.menuItem.on( 'click', this.openMenuItem.bind( this ) );
        
    },
    
    hideMenu: function() {
        
        var menuPanel = this.menu.menuPanel;
        var menuBar = this.menu.menuBar;
        
        this.button.menu.html( 'Menu' )
            .css( {
                'color': '',
                'padding-top': ''
            } );
        
        menuBar.find( '.title' ).html( 'Table of Contents' );
        
        menuPanel.addClass( 'slideOutRight' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    menuPanel.hide().removeClass( 'slideOutRight' );
                    $( this ).off();
                }
             );
        
        this.resetMenu();

    },
    
    openMenuItem: function( e ) {
        
        var itemId = '';
        
        if ( typeof e === 'string' ) {
            itemId = e;
        } else {
            itemId = '#' + e.currentTarget.id;
        }
        
        var menuBar = this.menu.menuBar;
        var menuList = this.menu.menuList;
        var menuContent = this.menu.menuContent;
        var target = $( itemId );
        var backBtn = menuBar.find( '.backBtn' );
        
        menuBar.removeClass( 'full' );
        menuBar.find( '.title' ).html( target.html() );
        
        menuList.addClass( 'fadeOutLeft' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    $(this).hide().removeClass( 'fadeOutLeft' );
                    menuContent.show()
                        .html( '<p>External template data here...</p>' );
                    $( this ).off();
                }
            );
        
        backBtn.html( '<span class="icon-left"></span>' ).prop( 'disabled', false ).on( 'click', 
            function() {
                
                menuBar.addClass( 'full' ).find( '.title' ).html( 'Menu' );
                
                menuList.show().addClass( 'fadeInLeft' )
                    .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                        function() {
                            $( this ).removeClass( 'fadeInLeft' );
                            $( this ).off();
                        } );
                
                menuContent.hide().empty();
                $( this ).empty().prop( 'disabled', true );
                $( this ).off( 'click' );
                
        } );
            
    },
    
    resetMenu: function() {
        
        var menuBar = this.menu.menuBar;
        
        menuBar.addClass( 'full' )
            .find( '.backBtn' ).html( '' ).prop( 'disabled', true );
        menuBar.find( '.title' ).html( 'Table of Contents' );
        
        this.menu.menuList.show();
        this.menu.menuContent.empty().hide();
        this.menu.menuItem.off( 'click' );
        
    },
    
    showAthrPrfl: function() {
        
        if ( !this.menu.menuPanel.is( ':visible' ) ) {
            this.showMenu();
        }
        
        this.openMenuItem( '#sbplus_author_profile' );
        
    },
    
    showErrorScreen: function() {
        
        this.layout.wrapper.hide();
        this.layout.errorScreen.show().addClass( 'shake' )
            .css( 'display', 'flex' );
        
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
        
        var media = this.layout.media;
        var widget = this.layout.widget;
        var sidebar = this.layout.sidebar;
        
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
        
        var sidebar = this.layout.sidebar;
        var widget = this.layout.widget;
        
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
        
        if ( this.urlParam( 'fullview' ) === '1' ) {
            this.layout.wrapper.removeClass( 'sbplus_boxed' )
                        .addClass( 'sbplus_full' );
        }    
            
    },
    
    urlParam: function( name ) {
        
        var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                        .exec(window.location.href);
        
    	if ( results === null ) {
           return null;
        }
        
        return results[1] || 0;
        
    }
        
};

/*******************************************************************************
        ON DOM READY
*******************************************************************************/

$( function() {
    
    SBPLUS.ready();
    
} );





