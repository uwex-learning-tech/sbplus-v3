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
    xml: null,
    splashScreenRendered: false,
    beforeXMLLoadingDone: false,
    presentationStarted: false,
    downloads: {},
    settings: null,
    currentPage: null,
    hasError: false,
    isResuming: false,
    
    /***************************************************************************
        CORE FUNCTIONS
    ***************************************************************************/
    
    go: function() {
        
        // get manifest
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
                mediaContent: '#sbplus_media_wrapper .sbplus_media_content',
                mediaError: '#sbplus_media_wrapper .sbplus_media_error',
                leftCol: '#sbplus_left_col',
                sidebar: '#sbplus_right_col',
                pageStatus: '#sbplus_page_status',
                quizContainer: '#sbplus_quiz_wrapper',
                dwnldMenu: null
            };
            
            this.banner = {
                title: '#sbplus_lession_title',
                author: '#sbplus_author_name'
            }
            
            this.splash = {
                screen: '#sbplus_splash_screen',
                background: '#sb_splash_bg',
                title: '#sbplus_presentation_info .sb_title',
                subtitle: '#sbplus_presentation_info .sb_subtitle',
                author: '#sbplus_presentation_info .sb_author',
                duration: '#sbplus_presentation_info .sb_duration',
                downloadBar: '#sbplus_presentation_info .sb_downloads'
            },
            
            this.tableOfContents = {
                container: '#sbplus_table_of_contents_wrapper',
                header: '.section .header',
                page: '.section .list .item'
            },
            
            this.widget = {
                bg: '#sbplus_widget.noSegments',
                bar: '#sbplus_widget .widget_controls_bar',
                segment: '#sbplus_widget .widget_controls_bar .tab_segment',
                segments: [],
                content: '#sbplus_widget .segment_content'
            },
            
            this.button = {
                start: '#sbplus_start_btn',
                resume: '#sbplus_resume_btn',
                download: '#sbplus_download_btn',
                downloadMenu: '#sbplus_download_btn .menu-parent .downloadFiles',
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
                
                self.setStorageItem( 'sbplus-manifest-loaded', 1, true );
                
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
            
            $( window ).on( 'beforeunload', this.removeAllSessionStorage.bind( this ) );
            
        } else {
            
            return 'Storybook Plus is already in ready state.';
            
        }
             
    },
    
    loadTemplate: function() {
        
        if ( Number( this.getStorageItem( 'sbplus-manifest-loaded', true ) ) === 1
        && this.hasStorageItem( 'sbplus-template-loaded', true ) === false ) {
            
            var self = this;
            var templateUrl = this.manifest.sbplus_root_directory;
            templateUrl += 'scripts/templates/sbplus.tpl';
            
            // call and set the template frame
            $.get( templateUrl, function( data ) {
                
                self.setStorageItem( 'sbplus-template-loaded', 1, true );
                
                $( self.layout.wrapper ).html( data );
                
                // do initial setup before presenting
                self.beforeXMLLoading();
                
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
    
    beforeXMLLoading: function() {
        
        if ( Number( this.getStorageItem( 'sbplus-manifest-loaded', true ) ) === 1 
        && Number( this.getStorageItem( 'sbplus-template-loaded', true ) ) === 1
        && this.beforeXMLLoadingDone === false ) {
            
            this.beforeXMLLoadingDone = true;
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

        if ( this.beforeXMLLoadingDone === true &&
        this.hasStorageItem( 'sbplus-xml-loaded', true ) === false ) {
            
            var self = this;
            var xmlUrl = 'assets/sbplus.xml';
            
            $.get( xmlUrl, function( data ) {
                
                self.setStorageItem( 'sbplus-xml-loaded', 1, true );
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
        
        if ( Number( this.getStorageItem( 'sbplus-xml-loaded', true ) ) === 1
        && this.hasStorageItem( 'sbplus-xml-parsed', true ) === false ) {
            
            var self = this;
            var data = $( d );
            var xSb = data.find( 'storybook' );
            var xSetup = data.find( 'setup' );
            var xAccent = xSb.attr( 'accent' ).trim();
            var xImgType = xSb.attr( 'pageImgFormat' ).toLowerCase().trim();
            var xSplashImgType = 'svg';
            var xAnalytics = xSb.attr( 'analytics' ).toLowerCase().trim();
            var xMathjax = xSb.attr( 'mathjax' ).toLowerCase().trim();
            var xVersion = xSb.attr( 'xmlVersion' );
            var xProgram = '';
            var xCourse = xSetup.attr( 'course' ).toLowerCase().trim();
            var xTitle = this.stripScript( xSetup.find( 'title' ).text().trim() );
            var xSubtitle = this.stripScript( xSetup.find( 'subtitle' ).text().trim() );
            var xLength = xSetup.find( 'length' ).text().trim();
            var xAuthor = xSetup.find( 'author' );
            var xGeneralInfo = this.stripScript( xSetup.find( 'generalInfo' ).text().trim() );
            var xSections = data.find( 'section' );
            
            var splashImgType_temp = xSb.attr( 'splashImgFormat' );
            var program_temp = xSetup.attr( 'program' );
            
            if ( splashImgType_temp ) {
                
                if ( !SBPLUS.isEmpty( splashImgType_temp ) ) {
                    xSplashImgType = xSb.attr( 'splashImgFormat' ).toLowerCase().trim();
                }
                
            }
            
            if ( program_temp ) {
                xProgram = xSetup.attr( 'program' ).toLowerCase().trim()
            }
            
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
                    splashImgType: xSplashImgType,
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
            
            // GET GOOGLE TRACKING
            if ( this.xml.settings.analytics === 'on' ) {
                
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                
                ga('create', self.manifest.sbplus_google_tracking_id, 'auto');
                ga('send', 'pageview');
                ga('send', 'event');
            }
            
            // get centralized author name and profile
            var sanitizedAuthor = this.sanitize( xAuthor.attr( 'name' ).trim() );
            var profileUrl = this.manifest.sbplus_author_directory + sanitizedAuthor + '.json';
            
            $.ajax( {
                    
                crossDomain: true,
                type: 'GET',
                dataType: 'jsonp',
                jsonpCallback: 'author',
                url: profileUrl
                
            } ).done( function( res ) {
                
                self.xml.setup.author = res.name;
                self.xml.setup.profile = self.stripScript( res.profile );
                
            } ).fail( function() {
                
                self.xml.setup.author = xAuthor.attr( 'name' ).trim();
                self.xml.setup.profile = self.stripScript( xAuthor.text().trim() );
                
            } ).always( function() {
                
                self.setStorageItem( 'sbplus-xml-parsed', 1, true );
                self.renderSplashscreen();
                
            } );
            
        } else {
            return 'XML already parsed.';
        }
        
    },
    
    renderSplashscreen: function() {
        
        var self = this;
        
        if ( Number( this.getStorageItem( 'sbplus-xml-parsed', true ) ) === 1
        && this.splashScreenRendered === false ) {
            
            // local storage settings
            if ( this.hasStorageItem( 'sbplus-hide-widget' ) === false ) {
                this.setStorageItem( 'sbplus-hide-widget', 0 );
            }
            
            if ( this.hasStorageItem( 'sbplus-hide-sidebar' ) === false ) {
                this.setStorageItem( 'sbplus-hide-sidebar', 0 );
            }
            
            if ( this.hasStorageItem( 'sbplus-disable-it' ) === false ) {
                this.setStorageItem( 'sbplus-disable-it', 0 );
            }
            
            if ( this.hasStorageItem( 'sbplus-autoplay' ) === false ) {
                this.setStorageItem( 'sbplus-autoplay', 1 );
            }
            
            if ( this.hasStorageItem( 'sbplus-volume' ) === false ) {
                this.setStorageItem( 'sbplus-volume', 0.8 );
            }
            
            if ( this.hasStorageItem( 'sbplus-playbackrate' ) === false ) {
                this.setStorageItem( 'sbplus-playbackrate', 1 );
            }
            
            if ( this.hasStorageItem( 'sbplus-subtitle' ) === false ) {
                this.setStorageItem( 'sbplus-subtitle', 0 );
            }
            
            // splash screen
            $( this.splash.title ).html( this.xml.setup.title );
            $( this.splash.subtitle ).html( this.xml.setup.subtitle );
            $( this.splash.author ).html( this.xml.setup.author );
            $( this.splash.duration ).html( this.xml.setup.duration );
            
            // get splash screen image background
            $.ajax( {
                
                url: 'assets/splash.' + self.xml.settings.splashImgType,
                type: 'head'
                
            } ).done( function() {
                
                self.setSplashImage( this.url );
                
            } ).fail( function() {
                
                var program = self.xml.setup.program;
                var course = self.xml.setup.course;
                
                if ( self.isEmpty( program ) ) {
                    
                    program = SBPLUS.getProgramDirectory();
                    
                }
                
                if ( self.isEmpty( course ) ) {
                    
                    course = SBPLUS.getCourseDirectory();
                    
                    if ( self.isEmpty( course ) ) {
                        
                        course = 'default.' + self.xml.settings.splashImgType;
                    
                    } else {
                        
                        course += '.' + self.xml.settings.splashImgType;
                    
                    }
                    
                } else {
                    course += '.' + self.xml.settings.splashImgType;
                }
                
                if ( !self.isEmpty( program ) && !self.isEmpty( course ) ) {
                    
                    var ss_url = self.manifest.sbplus_splash_directory + program + '/' + course;
                
                    $.ajax( {
                        url: ss_url,
                        type: 'HEAD'
                    } ).done( function() {
                        self.setSplashImage( this.url );
                    }).fail( function() {
                        
                        ss_url = self.manifest.sbplus_splash_directory + program + '/default.' + self.xml.settings.splashImgType;
                        
                        $.ajax( {
                            url: ss_url,
                            type: 'HEAD'
                        } ).done( function() {
                            self.setSplashImage( this.url );
                        })
                        
                    } );
                    
                }
                
            } );
            
            // event listeners
            $( this.button.start ).on( 'click', this.startPresentation.bind( this ) );
            
            if ( this.hasStorageItem( 'sbplus-' + this.sanitize( this.xml.setup.title ) ) ) {
                $( this.button.resume ).on( 'click', this.resumePresentation.bind( this ) );
            } else {
                $( this.button.resume ).hide();
            }
            
            // set download items
            var fileName = SBPLUS.getCourseDirectory();
                
            if ( self.isEmpty( fileName ) ) {
                fileName = 'default';
            }
            
            $.ajax( {
                url: fileName + '.pdf',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.transcript = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.transcript + '" download><span class="icon-download"></span> Transcript</a>' );
            } );
            
            $.ajax( {
                url: fileName + '.mp4',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.video = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.video + '" download><span class="icon-download"></span> Video</a>' );
            } );
            
            $.ajax( {
                url: fileName + '.mp3',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.audio = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.audio + '" download><span class="icon-download"></span> Audio</a>' );
            } );
            
            $.ajax( {
                url: fileName + '.zip',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.supplement = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.supplement + '" download><span class="icon-download"></span> Supplement</a>' );
            } );
            
            // accent
            if ( this.xml.settings.accent !== this.manifest.sbplus_default_accent ) {
                
                var hover = this.colorLum( this.xml.settings.accent, 0.2 );
                var textColor = this.colorContrast( this.xml.settings.accent );
                var style = '.sbplus_wrapper button:hover{color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button{color:' + textColor  + ';background-color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button:hover{background-color:' + hover + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .item:hover{color:' + textColor + ';background-color:' + hover + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .sb_selected{color:' + textColor + ';background-color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col #sbplus_table_of_contents_wrapper .section .current{border-left-color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover{background-color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover a{color:' + textColor + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus{background-color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus a{color:' + textColor + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent:hover{color:' + this.xml.settings.accent + '}.sbplus_wrapper #sbplus .sb_active{color:' + this.xml.settings.accent + '}';
                
                $( 'head' ).append( '<style type="text/css">' + style + '</style>' );
                
            }
            
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
            
            // get iphone inline video library if mobile
            if ( this.isMobileDevice() ) {
                
                $.getScript( this.manifest.sbplus_root_directory + 'scripts/libs/iphone-inline-video.browser.js' );
                
            }
            
            // flag the splash screen as rendered
            this.splashScreenRendered = true;
            
        } else {
            return 'Splash screen already rendered.';
        }
        
    },
    
    setSplashImage: function( str ) {
        
        if ( str ) {
            $( this.splash.background ).css( 'background-image', 
            'url(' + str + ')' );
        }
        
    },
    
    renderPresentation: function() {
        
        var self = this;
        
        // before presenting; applie local storage settings
        if ( this.getStorageItem( 'sbplus-hide-widget' ) === '1' ) {
            this.hideWidget();
        }
        
        if ( this.getStorageItem( 'sbplus-hide-sidebar' ) === '1' ) {
            this.hideSidebar();
        }
        
        // presentation
        $( this.banner.title ).html( this.xml.setup.title );
        $( this.banner.author ).html( this.xml.setup.author );
        
        // table of contents
        $( this.xml.sections ).each( function( i ) {
            
            var sectionHead = $( this ).attr( 'title' );
            var pages = $( this ).find( 'page' );
            
            var sectionHTML = '<div class="section">';
            sectionHTML += '<div class="header">';
            sectionHTML += '<div class="title">';
            sectionHTML += sectionHead +'</div>';
            sectionHTML += '<div class="icon"><span class="icon-collapse"></span></div></div>';
            sectionHTML += '<ul class="list">';
            
            if ( self.isEmpty( sectionHead ) ) {
                sectionHead = 'Section ' + ( i + 1 );
            }
            
            $.each( pages, function( j ) {
                
                ++self.totalPages;
                
                sectionHTML += '<li class="item" data-count="';
                sectionHTML += self.totalPages + '" data-page="' + i + ',' + j + '">';
                
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
        
        if ( this.isResuming ) {
            
            var presentation = this.sanitize( this.xml.setup.title );
            this.selectPage( this.getStorageItem( 'sbplus-' + presentation ) );
            
        } else {
            
            this.selectPage( '0,0' );
            
        }
        
        // event listeners
        $( this.button.sidebar ).on( 'click', this.toggleSidebar.bind( this ) );
        $( this.button.widget ).on( 'click',  this.toggleWidget.bind( this ) );
        $( this.button.menu ).on( 'click', this.toggleMenu.bind( this ) );
        $( this.button.author ).on( 'click', function() {
            self.openMenuItem( 'sbplus_author_profile' );
        } );
        
        $( this.button.next ).on( 'click', this.goToNextPage.bind( this ) );
        $( this.button.prev ).on( 'click', this.goToPreviousPage.bind( this ) );
        $( this.tableOfContents.header ).on( 'click', this.toggleSection.bind( this ) );
        $( this.tableOfContents.page ).on( 'click', this.selectPage.bind( this ) );
        $( this.widget.segment ).on( 'click', 'button', this.selectSegment.bind( this ) );
        this.layout.dwnldMenu = new MenuBar( $( this.button.download )[0].id, false );
        
        if ( this.xml.settings.mathjax === 'on' ) {
            MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
        }
        
        // set download items
        for ( var key in self.downloads ) {
            
            if ( !SBPLUS.isEmpty( self.downloads[key] ) ) {
                $( self.button.downloadMenu ).append(
                    '<li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite"><a download href="'
                    + self.downloads[key] +
                    '">' + self.capitalizeFirstLetter( key ) + '</a></li>'
                );
            }
            
        }
        
    },
    
    /**************************************************************************
        MAIN NAVIGATION FUNCTIONS
    **************************************************************************/
    
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
    
    /**************************************************************************
        SPLASH SCREEN FUNCTIONS
    **************************************************************************/
    
    hideSplash: function() {
        
        $( this.splash.screen ).addClass( 'fadeOut' )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                 function() {
                     $( this ).removeClass( 'fadeOut' ).hide();
                     $( this ).off();
                 }
            );
        
        return $( this.splash.screen );
        
    },
    
    startPresentation: function() {
        
        var self = this;
        
        if ( self.presentationStarted === false ) {
            
            self.hideSplash().promise().done( function() {
                self.renderPresentation();
            } );
            self.presentationStarted = true;
            
            
        }
        
    },
    
    resumePresentation: function() {
        
        var self = this;
        
        if ( self.presentationStarted === false ) {
            
            self.hideSplash().promise().done( function() {
                self.isResuming = true;
                self.renderPresentation();
            } );
            
            self.presentationStarted = true;
            
        }
        
    },
    
    /**************************************************************************
        TABLE OF CONTENT (SIDEBAR) FUNCTIONS
    **************************************************************************/
    
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
        $( this.button.sidebar ).html( '<span class="icon-sidebar-open"></span>' );
        
        if ( widget.is( ':visible' ) && widget.outerHeight() <= 190 ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        }
        
        media.removeClass( 'sidebar_on' ).addClass( 'sidebar_off' );
        
        this.resetMenu();
        
    },
    
    showSidebar: function() {
        
        var widget = $( this.layout.widget );
        var media = $( this.layout.media );
        
        $( this.layout.sidebar ).show();
        $( this.button.sidebar ).html( '<span class="icon-sidebar-close"></span>' );
        
        if ( widget.is( ':visible' ) && widget.outerHeight() <= 190 ) {
            media.removeClass( 'non_aspect_ratio' ).addClass( 'aspect_ratio' );
        }
        
        media.removeClass( 'sidebar_off' ).addClass( 'sidebar_on' );
        
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
        
        // TODO rework this code so it does not hide splash when the presentation is not started
/*
        if ( $( this.splash.screen ).is( ':visible' ) ) {
            this.hideSplash();
        }
*/
              
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
            
            this.getPage( targetPage.data('page') );
            this.updatePageStatus( targetPage.data( 'count' ) );
            this.updateScroll( targetPage[0] );
            
        }
        
    },
    
    getPage: function ( page ) {
        
        page = page.split( ',' );
        
        var section = page[0];
        var item = page[1];
        var target = $( $( this.xml.sections[section] ).find( 'page' )[item] );
        var pageData = {
            title: target.attr( 'title' ).trim(),
            type: target.attr( 'type' ).trim().toLowerCase()
        };
        
        pageData.number = page;
        
        if ( pageData.type !== 'quiz' ) {
            pageData.src = target.attr( 'src' ).trim();
            pageData.notes = this.stripScript( target.find( 'note' ).text().trim() );
            pageData.widget = target.find( 'widget' );
            pageData.frames = target.find( 'frame' );
            pageData.imageFormat = this.xml.settings.imgType;
            pageData.transition = target[0].hasAttribute( 'transition' ) ? 
                target.attr( 'transition' ).trim() : '';
        } else {
            pageData.quiz = target;
        }
        
        this.currentPage = new Page( pageData );
        this.currentPage.getPageMedia();
        
    },
    
    updateScroll: function( target ) {
        
        // TODO: scroll to header if target is not visible
        
        var scrollHeight = $( this.tableOfContents.container ).height();
        var targetHeight = $( target ).outerHeight();
        var targetTop = $( target ).offset().top - targetHeight;
        
        if ( targetTop > scrollHeight ) {
            target.scrollIntoView( false );
        }
        
        if ( targetTop < targetHeight ) {
            target.scrollIntoView( true );
        }
        
    },
    
    /**************************************************************************
        MENU FUNCTIONS
    **************************************************************************/
    
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
            .addClass( 'menu_opened' );
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
        menuContent.empty();
        
        if ( $( '.profileImg' ).length ) {
            $( '.profileImg' ).remove();
        }
        
        if ( !menuList.hasClass( 'fadeOutLeft' )
        && !menuContentWrapper.is( ':visible' ) ) {
            
            backBtn.show().prop( 'disabled', false ).one( 'click', this.closeMenuContent.bind( this ) );
            menuList.addClass( 'fadeOutLeft' ).one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                function() {
                    
                    $(this).hide().removeClass( 'fadeOutLeft' );
            
                    menuContentWrapper.fadeIn();
            
                    $( this ).off();
                    
                }
            );
            
        }
        
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
                
                if ( this.hasStorageItem( 'sbplus-settings-loaded', true ) === false ) {
                    
                    $.get( self.manifest.sbplus_root_directory + 'scripts/templates/settings.tpl', function( data ) {
                    
                        self.settings = data;
                        self.setStorageItem( 'sbplus-settings-loaded', 1, true );
                        menuContent.append( data );
                        self.afterSettingsLoaded();
                        
                    } );
                    
                } else {
                    
                    menuContent.append( self.settings );
                    self.afterSettingsLoaded();
                    
                }
                
                content = '';
                
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
        
        menuContent.append( content );
        
        if ( self.xml.settings.mathjax === 'on' ) {
            MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
        }
            
    },
    
    closeMenuContent: function() {
        
        var menuBar = $( this.menu.menuBar );
        var menuList = $( this.menu.menuList );
        var menuContentWrapper = $( this.menu.menuContentWrapper );
        var menuContent = $( this.menu.menuContent );
        
        menuBar.addClass( 'full' ).find( '.title' ).html( 'Menu' );
        
        menuList.show().addClass( 'fadeInLeft' );
        
        menuContent.empty();
        menuContentWrapper.hide();
        
        if ( $( '.profileImg' ).length ) {
            $( '.profileImg' ).remove();
        }
        
        menuList.one( 'webkitAnimationEnd mozAnimationEnd animationend', 
        function() {
            $( this ).removeClass( 'fadeInLeft' );
            $( this ).off();
        } );
        
        $( this ).prop( 'disabled', true );
        $( this ).off( 'click' );
        
    },
    
    resetMenu: function() {
        
        if ( !$( this.menu.menuPanel ).is( ':visible' ) ) {
            
            var menuBar = $( this.menu.menuBar );
        
            menuBar.find( '.title' ).html( 'Table of Contents' );
            menuBar.addClass( 'full' );
            menuBar.find( '.backBtn' ).hide().prop( 'disabled', true );
            
            $( this.button.menu ).html( '<span class="icon-menu"></span>' ).removeClass( 'menu_opened' );
            $( this.menu.menuList ).show();
            $( this.menu.menuContent ).empty();
            $( this.menu.menuContentWrapper ).hide();
            $( this.menu.menuItem ).off( 'click' );
            
        }
        
    },
    
    /**************************************************************************
        WIDGET FUNCTIONS
    **************************************************************************/
    
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
        $( this.button.widget ).html( '<span class="icon-widget-open"></span>' );
        
        if ( this.layout.isMobile ) {
            media.addClass( 'aspect_ratio' );
            this.resize();
        } else {
            media.removeClass( 'aspect_ratio' )
                    .addClass( 'non_aspect_ratio' ).css( 'height', '100%');
        }
        
        media.removeClass( 'widget_on' ).addClass( 'widget_off' );
        
    },
    
    showWidget: function() {
        
        var media = $( this.layout.media );
        
        $( this.layout.widget ).show();
        $( this.button.widget ).html( '<span class="icon-widget-close"></span>' );
        media.removeClass( 'non_aspect_ratio' )
                .addClass( 'aspect_ratio' ).css( 'height', '' );
        this.resize();
        
        media.removeClass( 'widget_off' ).addClass( 'widget_on' );
        
    },
    
    disableWidget: function() {
        $( this.button.widget ).prop( 'disabled', true ).addClass( 'sb_disabled' );
    },
    
    enableWidget: function() {
        $( this.button.widget ).prop( 'disabled', false ).removeClass( 'sb_disabled' );
    },
    
    selectSegment: function( e ) {
        
        var self = this;
        var button = $( this.widget.segment ).find( 'button' );
        
        if ( button.length > 0 ) {
            
            $( this.layout.widget ).removeClass('noSegments');
            
            var target = '';
            var targetId = '';
            
            if ( typeof e === 'string' ) {
                target = $( '#' + e );
                targetId = e;
            } else {
                target = $( e.currentTarget );
                targetId = target[0].id;
            }
            
            button.removeClass( 'active' );
            target.addClass( 'active' );
            clearInterval(transcriptInterval);
            this.currentPage.getWidgetContent( targetId );
            
            if ( this.xml.settings.mathjax === 'on' ) {
                MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
            }
            
        } else {
            
            $( this.layout.widget ).addClass('noSegments');
            
            if ( this.hasStorageItem( 'sbplus-logo-loaded', true ) === false ) {
                
                var program = this.xml.setup.program;
                
                if ( SBPLUS.isEmpty( program ) ) {
                    
                    program = SBPLUS.getProgramDirectory();
                    
                    if ( SBPLUS.isEmpty( program ) ) {
                        program = this.manifest.sbplus_logo_default;
                    }
                    
                }
                
                var logoUrl = this.manifest.sbplus_logo_directory + program + '.svg';
                
                $.get( logoUrl, function() {
                    
                    self.setStorageItem( 'sbplus-logo-loaded', this.url, true );
                    
                    $( self.widget.bg ).css( 'background-image', 'url(' +
                        self.getStorageItem( 'sbplus-logo-loaded', true ) + ')' );
                        
                } ).fail( function() {
                    
                    logoUrl = self.manifest.sbplus_logo_directory + self.manifest.sbplus_logo_default + '.svg';
                    
                    $.get( logoUrl, function() {
                        
                        self.setStorageItem( 'sbplus-logo-loaded', this.url, true );
                        
                        $( self.widget.bg ).css( 'background-image', 'url(' +
                            self.getStorageItem( 'sbplus-logo-loaded', true ) + ')' );
                            
                    } );
                    
                } );
                
            } else {
                
                $( self.widget.bg ).css( 'background-image', 'url(' +
                    self.getStorageItem( 'sbplus-logo-loaded', true ) + ')' );
                
            }
            
        }
        
    },
    
    selectFirstSegment: function() {
        
        var button = $( this.widget.segment ).find( 'button' )[0];
        var target = $( button ).attr( 'id' );
        
        this.selectSegment( target );
        
    },
    
    addSegment: function( str ) {
        
        var btn = '<button id="sbplus_' + this.sanitize( str ) + '">' + str + '</button>';
        
        this.widget.segments.push( str );
        
        if ( str === 'Notes' ) {
            $( this.widget.segment ).prepend( btn );
        } else {
            $( this.widget.segment ).append( btn );
        }
        
    },
    
    showWidgetSegment: function() {
        if ( this.widget.segments.length >= 2 ) {
            $( this.widget.bar ).show();
            $( this.widget.content ).removeClass( 'noBar' );
        }
        
    },
    
    hideWidgetSegment: function() {
        if ( this.widget.segments.length < 2 ) {
            $( this.widget.bar ).hide();
            $( this.widget.content ).addClass( 'noBar' );
        }
        
    },
    
    clearWidgetSegment: function() {
        $( this.widget.segment ).empty();
        $( this.widget.content ).empty();
        $( this.widget.bg ).css( 'background-image', '' );
        this.widget.segments = [];
    },
    
    /***************************************************************************
        ADDITIONAL MANIFEST OPTION FUNCTIONS
    ***************************************************************************/
    
    setManifestOptions: function() {
        
        if ( this.hasStorageItem( 'sbplus-manifest-options-loaded', true ) === false ) {
            
            this.setStorageItem( 'sbplus-manifest-options-loaded', 1, true );
            
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
    
    capitalizeFirstLetter: function (str) {
        return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
    },
    
    isEmpty: function( str ) {
        
        return str === undefined || str === null || !str.trim() || str.trim().length === 0;
        
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
        
    },
    
    stripScript: function( str ) {
        
        if ( str !== "" || str !== undefined ) {

           var results = $( "<span>" +  $.trim( str ) + "</span>" );
    
           results.find( "script,noscript,style" ).remove().end();
    
           return results.html();
    
       }
    
       return str;
        
    },
    
    hexToRgb: function( hex ) {
        
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        
        hex = hex.replace( shorthandRegex, function( m, r, g, b ) {
            return r + r + g + g + b + b;
        } );
    
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
        
        return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : null;
    },
    
    getProgramDirectory: function() {
        
        var urlArray = this.getUrlArray( urlArray );
        
        if ( urlArray.length >= 3 ) {
            return urlArray[urlArray.length - 2];
        } else if ( urlArray.length === 2 ) {
            return urlArray[0];
        }
        
        return '';
        
    },
    
    getCourseDirectory: function() {
        
        var urlArray = this.getUrlArray( urlArray );
        
        if ( urlArray.length >= 2 ) {
            return urlArray[urlArray.length - 1];
        }
        
        return '';
        
    },
    
    getUrlArray: function() {
        
        var url = window.location.href;
        var urlArray = url.split( '/' );
        
        urlArray.splice(0, 1);
        
        if ( urlArray[urlArray.length - 1].indexOf('.') >= 0 ) {
            
        	urlArray.splice(urlArray.length - 1, 1);
        	
        }
        
        return this.removeEmptyElements( urlArray );
        
    },
    
    removeEmptyElements: function ( array ) {
    
        var found = false;
    
        for ( var i = 0; i < array.length; i++ ) {
            
            if ( SBPLUS.isEmpty( array[i] ) ) {
                found = true;
            }
            
            if ( array[i].match(/^[0-9]+$/m) ) {
                found = true;
            }
            
            if ( found ) {
                array.splice( i, 1 );
                found = false;
            }
            
        }
        
        return array;
        
    },
    
    setStorageItem: function( key, value, toSession ) {
        
        if ( toSession ) {
            
            sessionStorage.setItem( key, value );
            
        } else {
            
            localStorage.setItem( key, value );
            
        }
        
    },
    
    getStorageItem: function( key, fromSession ) {
        
        if ( fromSession ) {
            
            return sessionStorage.getItem( key );
            
        } else {
            
            return localStorage.getItem( key );
            
        }
        
    },
    
    deleteStorageItem: function( key, fromSession ) {
        
        if ( fromSession ) {
            
            return sessionStorage.removeItem( key );
            
        } else {
            
            return localStorage.getItem( key );
            
        }
        
    },
    
    hasStorageItem: function( key, fromSession ) {
        
        if ( fromSession ) {
            
            if ( this.isEmpty( sessionStorage.getItem( key ) ) ) {
                return false;
            }
            
            return true;
            
        } else {
            
            if ( this.isEmpty( localStorage.getItem( key ) ) ) {
                return false;
            }
            
            return true;
            
        }
        
    },
    
    removeAllSessionStorage: function() {
        
        this.deleteStorageItem( 'sbplus-manifest-loaded', true );
        this.deleteStorageItem( 'sbplus-manifest-options-loaded', true );
        this.deleteStorageItem( 'sbplus-template-loaded', true );
        this.deleteStorageItem( 'sbplus-xml-loaded', true );
        this.deleteStorageItem( 'sbplus-xml-parsed', true );
        this.deleteStorageItem( 'sbplus-logo-loaded', true );
        this.deleteStorageItem( 'sbplus-kaltura-loaded', true );
        this.deleteStorageItem( 'sbplus-settings-loaded', true );
        this.deleteStorageItem( 'sbplus-playbackrate-temp', true );
        this.deleteStorageItem( 'sbplus-volume-temp', true );
        this.deleteStorageItem( 'sbplus-subtitle-temp', true );
        this.deleteStorageItem( 'sbplus-vjs-yt-loaded', true );
        this.deleteStorageItem( 'sbplus-vjs-vimeo-loaded', true );
        this.deleteStorageItem( 'sbplus-previously-widget-open', true );
        
    },
    
    isMobileDevice: function() {
        
        if ( navigator.userAgent.match(/iPhone/i) 
        || navigator.userAgent.match(/iPod/i) ) {
            
            return true;
            
        }
        
        return false;
        
    },
    
    afterSettingsLoaded: function() {
        
        var self = this;
        
        if ( self.getStorageItem( 'sbplus-settings-loaded', true ) === '1' ) {
            
            if ( self.isMobileDevice() ) {
                    
                $( '#autoplay_label' ).after( '<p class="error">Mobile devices do not support autoplay.</p>' );
                $( '#sbplus_va_autoplay' ).prop( 'checked', false ).attr( 'disabled', true );
                
            }
            
            self.syncSettings();
            
            $( '#save_settings' ).on( 'click', function( e ) {
                
                var self_btn = this;
                
                $( self_btn ).prop( 'disabled', true ).html( 'Saving...' );
                
                // widget
                if ( $( '#sbplus_gs_widget' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-hide-widget', 1 );
                } else {
                    self.setStorageItem( 'sbplus-hide-widget', 0 );
                }
                
                // sidebar
                if ( $( '#sbplus_gs_sidebar' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-hide-sidebar', 1 );
                } else {
                    self.setStorageItem( 'sbplus-hide-sidebar', 0 );
                }
                
                // interactive transcript
                if ( $( '#sbplus_gs_it' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-disable-it', 1 );
                } else {
                    self.setStorageItem( 'sbplus-disable-it', 0 );
                }
                
                // autoplay
                if ( $( '#sbplus_va_autoplay' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-autoplay', 1 );
                } else {
                    self.setStorageItem( 'sbplus-autoplay', 0 );
                }
                
                // subtitle
                if ( $( '#sbplus_va_subtitle' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-subtitle', 1 );
                } else {
                    self.setStorageItem( 'sbplus-subtitle', 0 );
                }
                
                // volumne
                var vol = $( '#sbplus_va_volume' ).val();
                var volError = false;
                
                if ( vol < 0 || vol > 100 || self.isEmpty( vol ) ) {
                    
                    volError = true;
                    vol = Number( self.getStorageItem( 'sbplus-volume' ) ) * 100;
                    
                } else {
                    
                    self.setStorageItem( 'sbplus-volume', vol / 100 );
                    self.setStorageItem( 'sbplus-volume-temp', vol / 100, true );
                    
                }
                
                if ( volError ) {
                    
                    $( '#volume_label' ).after( '<p class="error">Value must be between 0 and 100.</p>' );
                    
                } else {
                    
                    $( '#volume_label' ).next( '.error' ).remove();
                    
                }
                
                // playback rate
                self.setStorageItem(
                    'sbplus-playbackrate',
                    $( '#sbplus_va_playbackrate option:selected' ).val()
                );
                
                self.setStorageItem(
                    'sbplus-playbackrate-temp',
                    $( '#sbplus_va_playbackrate option:selected' ).val(),
                    true
                );
                
                setTimeout( function() {
                    
                    $( self_btn ).prop( 'disabled', false ).html( 'Save' );
                    
                }, 1500 );
                
                e.preventDefault();
                return false;
                
            } );
            
        }
            
    },
    
    syncSettings: function() {
        
        var self = this;
        
        if ( self.getStorageItem( 'sbplus-settings-loaded', true ) === '1' ) {
            
            // widget
            var widgetVal = self.getStorageItem( 'sbplus-hide-widget' );
            
            if ( widgetVal === '1') {
                $( '#sbplus_gs_widget' ).prop( 'checked', true );
            } else {
                $( '#sbplus_gs_widget' ).prop( 'checked', false );
            }
            
            // sidebar
            var sidebarVal = self.getStorageItem( 'sbplus-hide-sidebar' );
            
            if ( sidebarVal === '1') {
                $( '#sbplus_gs_sidebar' ).prop( 'checked', true );
            } else {
                $( '#sbplus_gs_sidebar' ).prop( 'checked', false );
            }
            
            // interactive transcript
            var itVal = self.getStorageItem( 'sbplus-disable-it' );
            
            if ( itVal === '1') {
                $( '#sbplus_gs_it' ).prop( 'checked', true );
            } else {
                $( '#sbplus_gs_it' ).prop( 'checked', false );
            }
            
            // autoplay
            var autoplayVal = self.getStorageItem( 'sbplus-autoplay' );
            
            if ( self.isMobileDevice() === false ) {
                
                if ( autoplayVal === '1') {
                    $( '#sbplus_va_autoplay' ).prop( 'checked', true );
                } else {
                    $( '#sbplus_va_autoplay' ).prop( 'checked', false );
                }
                
            }
            
            // volume
            var volumeVal = self.getStorageItem( 'sbplus-volume' );
            
            $( '#sbplus_va_volume' ).prop( 'value', volumeVal * 100 );
            
            // playback rate
            var playbackRateVal = self.getStorageItem( 'sbplus-playbackrate' );
            
            $( '#sbplus_va_playbackrate' ).val( playbackRateVal );
            
            //subtitle
            var subtitleVal = self.getStorageItem( 'sbplus-subtitle' );
            
            if ( subtitleVal === '1') {
                $( '#sbplus_va_subtitle' ).prop( 'checked', true );
            } else {
                $( '#sbplus_va_subtitle' ).prop( 'checked', false );
            }
            
        }
        
    }
        
};

/*******************************************************************************
        ON DOM READY
*******************************************************************************/

$( function() {
    
    SBPLUS.go();
    
} );





