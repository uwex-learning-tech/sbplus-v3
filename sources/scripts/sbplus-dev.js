var SBPLUS = SBPLUS || {
    
    /***************************************************************************
        VARIABLES / CONSTANTS / OBJECTS
    ***************************************************************************/
    
    layout: null,
    splash: null,
    banner: null,
    tableOfContents: null,
    totalPages: 0,
    widget: null,
    button: null,
    menu : null,
    manifest: null,
    manifestLoaded: false,
    manifestOptionsLoaded: false,
    templateLoaded: false,
    xml: null,
    xmlLoaded: false,
    xmlParsed: false,
    presentationRendered: false,
    beforePresentingDone: false,
    presentationStarted: false,
    hasError: false,
    
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
                widget: '#sbplus_widget',
                media: '#sbplus_media_wrapper',
                sidebar: '#sbplus_right_col',
                pageStatus: '#sbplus_page_status',
                dwnldMenu: null
            };
            
            this.banner = {
                title: '#sbplus_lession_title',
                author: '#sbplus_author_name'
            }
            
            this.splash = {
                screen: '#sbplus_splash_screen',
                title: '#sbplus_presentation_info .sb_title',
                subtitle: '#sbplus_presentation_info .sb_subtitle',
                author: '#sbplus_presentation_info .sb_author',
                duration: '#sbplus_presentation_info .sb_duration'
            },
            
            this.tableOfContents = {
                container: '#sbplus_table_of_contents_wrapper',
                header: '.section .header',
                page: '.section .list .item'
            },
            
            this.widget = {
                bar: '#sbplus_widget .tab_segment',
                segment: '#sbplus_widget button',
                segments: []
            },
            
            this.button = {
                start: '#sbplus_start_btn',
                resume: '#sbplus_resume_btn',
                download: '#sbplus_download_btn',
                widget: '#sbplus_widget_btn',
                sidebar: '#sbplus_sidebar_btn',
                author: '#sbplus_author_name',
                menu: '#sbplus_menu_btn',
                next: '#sbplus_next_btn',
                prev: '#sbplus_previous_btn'
            };
            
            this.menu = {
                menuPanel: '#sbplus_menu_items_wrapper',
                menuBar: '#sbplus_sub_bar',
                menuList: '#sbplus_menu_items_wrapper .list',
                menuItem: '#sbplus_menu_items_wrapper .menu.item',
                menuContentWrapper: '#menu_item_content',
                menuContent: '#menu_item_content .content'
            };
            
            $.getJSON( this.getManifestUrl(), function( data ) {
                
                self.manifestLoaded = true;
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
    
    loadTemplate: function() {
        
        if ( this.manifestLoaded && this.templateLoaded === false ) {
            
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
                    self.hasError = true;
                    self.showErrorScreen( 'support' );
                    return false;
                }
                
                self.loadXML();
                
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
        
        if ( this.manifestLoaded && this.templateLoaded && this.beforePresentingDone === false ) {
            
            this.beforePresentingDone = true;
            this.resize();
            this.setURLOptions();
            
            var pageSectionHeader = $( this.tableOfContents.header );
            
            if ( pageSectionHeader.length === 1 ) {
                pageSectionHeader.hide().off( 'click' );
            }
            
            // setup any additional data from the manifest
            this.setManifestOptions();
            
        }
        
    },
    
    loadXML: function() {
        
        if ( this.beforePresentingDone === true && this.xmlLoaded === false ) {
            
            var self = this;
            var xmlUrl = 'assets/sbplus.xml';
            
            $.get( xmlUrl, function( data ) {
                
                self.xmlLoaded = true;
                self.parseXMLData( data );
                
            } ).fail( function( res, status ) {
                
                self.hasError = true;
                
                if ( status === 'parsererror' ) {
                    self.showErrorScreen( 'parser' );
                } else {
                    self.showErrorScreen( 'xml' );
                }
                
            } );
            
        } else {
            return 'XML already loaded.';
        }
        
    },
    
    parseXMLData: function( d ) {
        
        if ( this.xmlLoaded && this.xmlParsed === false ) {
            
            var self = this;
            var data = $( d );
            var xSb = data.find( 'storybook' );
            var xSetup = data.find( 'setup' );
            var xAccent = xSb.attr( 'accent' ).trim();
            var xImgType = xSb.attr( 'pageImgFormat' ).toLowerCase().trim();
            var xAnalytics = xSb.attr( 'analytics' ).toLowerCase().trim();
            var xMathjax = xSb.attr( 'mathjax' ).toLowerCase().trim();
            var xVersion = xSb.attr( 'xmlVersion' );
            var xProgram = xSetup.attr( 'program' ).toLowerCase().trim();
            var xCourse = xSetup.attr( 'course' ).toLowerCase().trim();
            var xTitle = xSetup.find( 'title' ).text().trim();
            var xSubtitle = xSetup.find( 'subtitle' ).text().trim();
            var xLength = xSetup.find( 'length' ).text().trim();
            var xAuthor = xSetup.find( 'author' );
            var xGeneralInfo = xSetup.find( 'generalInfo' ).text().trim();
            var xSections = data.find( 'section' );
            
            if ( this.isEmpty( xAccent ) ) {
                xAccent = this.manifest.sbplus_default_accent;
            }
            
            if ( this.isEmpty( xImgType ) ) {
                xImgType = 'jpg';
            }
            
            if ( xAnalytics !== 'on' ) {
                xAnalytics = 'off';
            }
            
            if ( xMathjax !== 'on' ) {
                xMathjax = 'off';
            }
            
            this.xml = {
                settings: {
                    accent: xAccent,
                    imgType: xImgType,
                    analytics: xAnalytics,
                    mathjax: xMathjax,
                    version: xVersion
                },
                setup: {
                    program: xProgram,
                    course: xCourse,
                    title: xTitle,
                    subtitle: xSubtitle,
                    authorPhoto: '',
                    duration: xLength,
                    generalInfo: xGeneralInfo
                },
                sections: xSections
            };
            
            var sanitizedAuthor = this.sanitize( xAuthor.attr( 'name' ).trim() );
            var profileUrl = this.manifest.sbplus_author_directory + sanitizedAuthor + '.json';
            
            // get centralized author name and profile
            $.ajax( {
                    
                crossDomain: true,
                type: 'GET',
                dataType: 'jsonp',
                jsonpCallback: 'author',
                url: profileUrl
                
            } ).done( function( res ) {
                
                self.xml.setup.author = res.name;
                self.xml.setup.profile = res.profile;
                
            } ).fail( function() {
                
                self.xml.setup.author = xAuthor.attr( 'name' ).trim();
                self.xml.setup.profile = xAuthor.text().trim();
                
            } ).always( function() {
                
                self.xmlParsed = true;
                self.renderPresentation();
                
            } );
            
        } else {
            return 'XML already parsed.';
        }
        
    },
    
    renderPresentation: function() {
        
        if ( this.xmlParsed && this.presentationRendered === false ) {
            
            var self = this;
            
            // local storage settings
            
            // accent
            if ( this.xml.settings.accent !== this.manifest.sbplus_default_accent ) {
            
                var style = '.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button, ';
                style += '.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_left_col #sbplus_widget .tab_segment .active,';
                style += '.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .sb_selected,';
                style += '.sbplus_wrapper #sbplus #sbplus_banner_bar, .sbplus_wrapper #sbplus #sbplus_banner_bar #sbplus_menu_area #sbplus_author_name {';
                style += 'color: ' + this.colorContrast( this.xml.settings.accent )  + ';';
                style += 'background-color:' + this.xml.settings.accent + ';';
                style += 'border-color:' + this.xml.settings.accent + ';}';
                style += '.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button:hover,';
                style += '.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .item:hover,';
                style += '.sbplus_wrapper #sbplus #sbplus_banner_bar #sbplus_menu_area #sbplus_menu_btn,';
                style += '.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover, .sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover {';
                style += 'background-color: ' + this.colorLum( this.xml.settings.accent, 0.2 ) + '}';
                style += '.sbplus_wrapper button:hover, .sbplus_wrapper #sbplus .sb_active, ';
                style += '.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent:hover, .sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent:hover {';
                style += 'color: ' + this.colorLum( this.xml.settings.accent, 0.2 ) + ';}';
                style += '.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_left_col #sbplus_widget .tab_segment button, ';
                style += '.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_downloads a {';
                style += 'border-color: ' + this.xml.settings.accent + '; color: ' + this.xml.settings.accent + ';}';
                style += '.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_downloads a:hover{';
                style += ' background-color: ' + this.xml.settings.accent + ';}';
                style += '.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_downloads a:first-child {'
                style += 'border-color: ' + this.xml.settings.accent + ';}';
                style += '.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col #sbplus_table_of_contents_wrapper .section .current {';
                style += 'border-left-color: ' + this.xml.settings.accent + ';}'
                $( 'head' ).append( '<style type="text/css">' + style + '</style>' );
                
            }
            
            // splash screen
            $( this.splash.title ).html( this.xml.setup.title );
            $( this.splash.subtitle ).html( this.xml.setup.subtitle );
            $( this.splash.author ).html( this.xml.setup.author );
            $( this.splash.duration ).html( this.xml.setup.duration );
            
            // presentation
            $( this.banner.title ).html( this.xml.setup.title );
            $( this.banner.author ).html( this.xml.setup.author );
            
            // table of contents
            $( this.xml.sections ).each( function( i ) {
                
                var sectionHead = $( this ).attr( 'title' );
                var pages = $( this ).find( 'page' );
                var sectionHTML = '<div class="section">';
                var first = false;
                
                if ( i === 0 ) {
                    first = true;
                }
                
                if ( first ) {
                    sectionHTML += '<div class="header current">';
                } else {
                    sectionHTML += '<div class="header">';
                }
                
                sectionHTML += '<div class="title">';
                sectionHTML += sectionHead +'</div>';
                sectionHTML += '<div class="icon"><span class="icon-collapse"></span></div></div>';
                sectionHTML += '<ul class="list">';
                
                if ( self.isEmpty( sectionHead ) ) {
                    sectionHead = 'Section ' + ( i + 1 );
                }
                
                $.each( pages, function( j ) {
                    
                    ++self.totalPages;
                    
                    if ( first && j === 0 ) {
                        sectionHTML += '<li class="item sb_selected" data-count="';
                        sectionHTML += self.totalPages + '" data-page="' + i + ',' + j + '">';
                    } else {
                        sectionHTML += '<li class="item" data-count="';
                        sectionHTML += self.totalPages + '" data-page="' + i + ',' + j + '">';
                    }
                    
                    if ( $( this ).attr( 'type' ) === 'quiz' ) {
                        sectionHTML += '<span class="icon-assessment"></span>';
                    } else {
                        sectionHTML += '<span class="numbering">' + self.totalPages + '.</span> ';
                    }
                    
                    sectionHTML += $( this ).attr( 'title' ) + '</li>';
                    
                } );
                
                sectionHTML += '</ul></div>';
                
                $( self.tableOfContents.container ).append( sectionHTML );
                
            } );
            
            // page status
            $( this.layout.pageStatus ).find( 'span.total' ).html( this.totalPages );
            this.updatePageStatus( 1 );
            
            // event listeners
            $( this.button.sidebar ).on( 'click', this.toggleSidebar.bind( this ) );
            $( this.button.widget ).on( 'click',  this.toggleWidget.bind( this ) );
            $( this.button.menu ).on( 'click', this.toggleMenu.bind( this ) );
            $( this.button.author ).on( 'click', function() {
                self.openMenuItem( 'sbplus_author_profile' );
            } );
            $( this.button.start ).on( 'click', this.startPresentation.bind( this ) );
            $( this.button.resume ).on( 'click', this.resumePresentation.bind( this ) );
            $( this.button.next ).on( 'click', this.goToNextPage.bind( this ) );
            $( this.button.prev ).on( 'click', this.goToPreviousPage.bind( this ) );
            $( this.tableOfContents.header ).on( 'click', this.toggleSection.bind( this ) );
            $( this.tableOfContents.page ).on( 'click', this.selectPage.bind( this ) );
            $( this.widget.segment ).on( 'click', this.changeSegment.bind( this ) );
            this.layout.dwnldMenu = new MenuBar( $( this.button.download )[0].id, false );
            
            // get mathjax if turned on
            if ( this.xml.settings.mathjax === 'on' ) {
                
                $.getScript( 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML', function() {
            
                    MathJax.Hub.Config({
                        
                      'HTML-CSS': {
                        matchFontHeight: true
                      }
                      
                    });
                    
                });
                
            }
            
        } else {
            return 'Presentation already rendered.';
        }
        
    },
    
    /***************************************************************************
        MAIN NAVIGATION FUNCTIONS
    ***************************************************************************/
    
    goToNextPage: function() {
        
        var currentPage = $( '.sb_selected' ).data( 'page' ).split(',');
        var tSection = Number( currentPage[0] );
        var tPage = Number( currentPage[1] );
        
        var totalSections = this.xml.sections.length;
        var totalPagesInSection = $( this.xml.sections[tSection] ).find( 'page' ).length;
        
        tPage++;
        
        if ( tPage > totalPagesInSection - 1 ) {
            
            tSection++;
            
            if ( tSection > totalSections - 1 ) {
                tSection = 0;
            }
            
            tPage = 0;
            
        }
        
        this.selectPage( tSection + ',' + tPage );
        
    },
    
    goToPreviousPage: function() {
        
        var currentPage = $( '.sb_selected' ).data( 'page' ).split(',');
        var tSection = Number( currentPage[0] );
        var tPage = Number( currentPage[1] );
        
        tPage--;
        
        if ( tPage < 0 ) {
            
            tSection--;
            
            if ( tSection < 0 ) {
                
                tSection = this.xml.sections.length - 1;
                
            }
            
            tPage = $( this.xml.sections[tSection] ).find( 'page' ).length - 1;
            
        }
        
        this.selectPage( tSection + ',' + tPage );
        
    },
    
    updatePageStatus: function( num ) {
        
        $( this.layout.pageStatus ).find( 'span.current' ).html( num );
        
    },
    
    /***************************************************************************
        SPLASH SCREEN FUNCTIONS
    ***************************************************************************/
    
    hideSplash: function() {
        
        $( this.splash.screen ).addClass( 'fadeOut' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                 function() {
                     $( this ).removeClass( 'fadeOut' ).hide();
                     $( this ).off();
                 }
            );
            
    },
    
    startPresentation: function() {
        
        if ( this.presentationStarted === false ) {
            
            this.hideSplash();
            this.presentationStarted = true;
            
        }
        
    },
    
    resumePresentation: function() {
        
        if ( this.presentationStarted === false ) {
            
            this.hideSplash();
            this.presentationStarted = true;
            
        }
        
    },
    
    /***************************************************************************
        TABLE OF CONTENT (SIDEBAR) FUNCTIONS
    ***************************************************************************/
    
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
        
        if ( $( this.splash.screen ).is( ':visible' ) ) {
            this.hideSplash();
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
            this.updatePageStatus( targetPage.data( 'count' ) );
            $( '.sb_selected' )[0].scrollIntoView( false );
            
        }
        
    },
    
    /***************************************************************************
        MENU FUNCTIONS
    ***************************************************************************/
    
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
        
        var self = this;
        
        if ( $( this.splash.screen ).is( ':visible' ) ) {
            this.hideSplash();
        }
        
        if ( !$( this.menu.menuPanel ).is( ':visible' ) ) {
            this.showMenu();
        }
        
        var itemId = '';
        
        if ( typeof e === 'string' ) {
            itemId = e;
        } else {
            itemId = e.currentTarget.id;
        }
        
        var menuBar = $( this.menu.menuBar );
        var menuList = $( this.menu.menuList );
        var menuContentWrapper = $( this.menu.menuContentWrapper );
        var menuContent = $( this.menu.menuContent );
        var target = $( '#' + itemId );
        var backBtn = menuBar.find( '.backBtn' );
        
        menuBar.removeClass( 'full' );
        menuBar.find( '.title' ).html( target.html() );
        
        if ( menuContentWrapper.is( ':visible' ) ) {
            
            menuList.off();
            
        } else {
            
            if ( !menuList.hasClass( 'fadeOutLeft' ) ) {
                menuList.addClass( 'fadeOutLeft' );
            }
            
            menuList.one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    
                    $(this).hide().removeClass( 'fadeOutLeft' );
                    
                    var content = "";
                    
                    switch ( itemId ) {
                        
                        case 'sbplus_author_profile':
                        
                        menuContentWrapper.prepend( '<div class="profileImg"></div>' );
                        
                        if ( self.xml.setup.authorPhoto.length === 0 ) {
                            
                            var author = self.xml.setup.author;
                            var sanitizedAuthor = self.sanitize( author );
                            var profileUrl = self.manifest.sbplus_author_directory + sanitizedAuthor + '.jpg';
                            
                            $.ajax( {
                    
                                type: 'HEAD',
                                url: 'assets/' + sanitizedAuthor + '.jpg'
                                
                            } ).done( function() {
                                
                                self.xml.setup.authorPhoto = this.url;
                                
                                var img = '<img src="';
                                img += this.url +'" alt="Photo of ' + author + '" crossorigin="Anonymous" />';
                                
                                $( '.profileImg' ).html( img );
                                
                            } ).fail( function() {
                                
                                $.ajax( {
                                    
                                    type: 'HEAD',
                                    url: profileUrl
                                
                                } ).done( function() {
                                    
                                    self.xml.setup.authorPhoto = this.url;
                                    
                                    var img = '<img src="';
                                    img += this.url +'" alt="Photo of ' + author + '" crossorigin="Anonymous" />';
                                    
                                    $( '.profileImg' ).html( img );
                                    
                                } );
                                
                            } );
                            
                        } else {
                            
                            var img = '<img src="';
                            img += self.xml.setup.authorPhoto +'" alt="Photo of ' + author + '" crossorigin="Anonymous" />';
                            
                            $( '.profileImg' ).prepend( img );
                            
                        }
                        
                        content = '<p class="name">' + self.xml.setup.author + '</p>';
                        content += self.xml.setup.profile;
                        break;
                        
                        case 'sbplus_general_info':
                        content = self.xml.setup.generalInfo;
                        break;
                        
                        case 'sbplus_settings':
                        content = '<p>Settings go here...</p>';
                        break;
                        
                        default:
                        var customMenuItems = self.manifest.sbplus_custom_menu_items;
                        for ( var key in customMenuItems ) {
                            var menuId = 'sbplus_' + self.sanitize( customMenuItems[key].name );
                            if ( itemId === menuId ) {
                                content = customMenuItems[key].content;
                                break;
                            }
                        }
                        break;
                        
                    }
                    
                    menuContentWrapper.fadeIn();
                    menuContent.append( content );
                    
                    if ( self.xml.settings.mathjax === 'on' ) {
                        MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
                    }
                    
                    $( this ).off();
                    
                }
            );
            
            backBtn.show().prop( 'disabled', false ).one( 'click', function() {
                    
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
                
                menuContentWrapper.hide().html( '<div class="content"></div>' );
                
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
            $( this.menu.menuContentWrapper ).hide().html( '<div class="content"></div>' );
            $( this.menu.menuItem ).off( 'click' );
            
        }
        
    },
    
    /***************************************************************************
        WIDGET FUNCTIONS
    ***************************************************************************/
    
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
    
    changeSegment: function( e ) {
        
        var button = $( this.widget.segment );
        var target = $( e.currentTarget );
        
        button.removeClass( 'active' );
        target.addClass( 'active' );
        
        // TODO: pull and structure content from the XML data
        
        
    },
    
    addSegment: function( str ) {
        
        var btn = '<button id="' + this.sanitize( str ) + '">' + str + '</button>';
        
        this.widget.segments.push( str );
        $( this.widget.bar ).append( btn );
        
    },
    
    /***************************************************************************
        ADDITIONAL MANIFEST OPTION FUNCTIONS
    ***************************************************************************/
    
    setManifestOptions: function() {
        
        if ( this.manifestOptionsLoaded === false ) {
            
            this.manifestOptionsLoaded = true;
            var customMenuItems = this.manifest.sbplus_custom_menu_items;
            
            if ( customMenuItems.length ) {
                
                for ( var key in customMenuItems ) {
                    
                    var name = customMenuItems[key].name;
                    var sanitizedName = this.sanitize( name );
                    var item = '<li class="menu item" id="sbplus_' + sanitizedName + '"><span class="icon-' + sanitizedName + '"></span> ' + name + '</li>';
                    
                    $( this.menu.menuList ).append( item );
                    
                }
                
            }
            
        } else {
            
            return 'Manifest options already loaded.';
            
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
    
    showErrorScreen: function( type ) {
        
        if ( this.hasError && type.length ) {
            
            var errorTemplateUrl = this.manifest.sbplus_root_directory;
        
            $( this.layout.sbplus ).hide();
            
            switch ( type ) {
                
                case 'support':
                    errorTemplateUrl += 'scripts/templates/support_error.tpl';
                break;
                
                case 'xml':
                    errorTemplateUrl += 'scripts/templates/xml_error.tpl';
                break;
                
                case 'parser':
                    errorTemplateUrl += 'scripts/templates/xml_parse_error.tpl';
                break;
                
                default:
                    errorTemplateUrl = '';
                break;
                
            }
            
            if ( errorTemplateUrl.length ) {
                
                var self = this;
                
                $.get( errorTemplateUrl, function( data ) {
                    
                    $( self.layout.errorScreen ).html( data ).show().addClass( 'shake' )
                        .css( 'display', 'flex' );
                    
                } );
                
            }
            
        }
        
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
            sidebar.css( 'max-height', '400px'  );
        } else {
            sidebar.css( 'max-height', ''  );
        }
        
        this.calcWidgetHeight();
        
    },
    
    calcWidgetHeight: function() {
        
        var sidebar = $( this.layout.sidebar );
        var widget = $( this.layout.widget );
        
        if ( this.layout.isMobile === true ) {  
            widget.css( {
                'min-height': sidebar.outerHeight(),
                'bottom': sidebar.outerHeight() * -1
            } );
        } else {
            widget.css( {
                'min-height': '',
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
        
    },
    
    sanitize: function( str ) {
    
        return str.replace(/[^\w]/gi, '').toLowerCase();
    
    },
    
    isEmpty: function( str ) {
        
        return str === undefined || !str.trim() || str.trim().length === 0;
        
    },
    
    colorLum: function( hex, lum ) {
    
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        
        if (hex.length < 6) {
        	hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        
        lum = lum || 0;
        
        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
        	c = parseInt(hex.substr(i*2,2), 16);
        	c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        	rgb += ("00"+c).substr(c.length);
        }
        
        return rgb;
        
    },
    
    colorContrast: function( hex ) {

        hex = parseInt( hex.slice( 1 ), 16 );
        return hex > 0xffffff / 2 ? '#000' : '#fff';
        
    }
        
};

/*******************************************************************************
        ON DOM READY
*******************************************************************************/

$( function() {
    
    SBPLUS.go();
    
} );





