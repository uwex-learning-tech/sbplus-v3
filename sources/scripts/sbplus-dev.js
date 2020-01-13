/*
 * Storybook Plus
 *
 * @author: Ethan Lin
 * @url: https://github.com/oel-mediateam/sbplus_v3
 * @version: 3.4.0
 * Released xx/xx/2020
 *
 * @license: GNU GENERAL PUBLIC LICENSE v3
 *
    Storybook Plus is an web application that serves multimedia contents.
    Copyright (C) 2013-2019  Ethan S. Lin, Creative Media Services, University
    of Wisconsin Extended Campus

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/*******************************************************************************
    STORYBOOK PLUS MAIN OBJECT CLASS
*******************************************************************************/
'use strict';

var SBPLUS = SBPLUS || {
    
    /***************************************************************************
        VARIABLE / CONSTANT / OBJECT DECLARATIONS
    ***************************************************************************/
    
    // holds the HTML structure classes and IDs
    loadingScreen: null,
    themeDecorationBar: null,
    layout: null,
    splash: null,
    banner: null,
    tableOfContents: null,
    widget: null,
    button: null,
    menu : null,
    screenReader: null,
    presentationLoc: '',
    logo: '',
    
    // holds current and total pages in the presentation
    totalPages: 0,
    currentPage: null,
    targetPage: null,
    
    // holds external data
    manifest: null,
    xml: null,
    downloads: {},
    settings: null,
    
    // status flags
    manifestLoaded: false,
    splashScreenRendered: false,
    presentationRendered: false,
    beforeXMLLoadingDone: false,
    xmlLoaded: false,
    xmlParsed: false,
    presentationStarted: false,
    hasError: false,
    kalturaLoaded: false,
    alreadyResized: false,
    
    // videojs
    playbackrate: 1,
    
    // google analytics variables
    gaTimeouts: {
        start: null,
        halfway: null,
        completed: null
    },
    
    // easter egg variables
    clickCount: 0,
    randomNum: Math.floor((Math.random() * 6) + 5),
    
    /***************************************************************************
        CORE FUNCTIONS
    ***************************************************************************/
    
    /**
     * The initiating function that sets the HTML classes and IDs to the class
     * variables. Also, getting data from the manifest file.
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    go: function() {
        
        // set general HTML layout classes and IDs
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
            mediaMsg: '#sbplus_media_wrapper .sbplus_media_msg',
            leftCol: '#sbplus_left_col',
            sidebar: '#sbplus_right_col',
            pageStatus: '#sbplus_page_status',
            quizContainer: '#sbplus_quiz_wrapper',
            mainControl: '#sbplus_control_bar',
            dwnldMenu: null,
            mainMenu: null
        };
        
        // set HTML banner classes and IDs
        this.banner = {
            title: '#sbplus_lession_title',
            author: '#sbplus_author_name'
        };
        
        // set HTML splashscreen classes and IDs
        this.splash = {
            screen: '#sbplus_splash_screen',
            background: '#sb_splash_bg',
            title: '#sbplus_presentation_info .sb_title',
            subtitle: '#sbplus_presentation_info .sb_subtitle',
            author: '#sbplus_presentation_info .sb_author',
            duration: '#sbplus_presentation_info .sb_duration',
            downloadBar: '#sbplus_presentation_info .sb_downloads'
        };
        
        // set HTML table of contents classes and IDs
        this.tableOfContents = {
            container: '#sbplus_table_of_contents_wrapper',
            header: '.section .header',
            page: '.section .list .item'
        };
        
        // set HTML widget classes and IDs
        this.widget = {
            bar: '#sbplus_widget .widget_controls_bar',
            segment: '#sbplus_widget .widget_controls_bar .tab_segment',
            segments: [],
            content: '#sbplus_widget .segment_content'
        };
        
        // set HTML button classes and IDs
        this.button = {
            start: '#sbplus_start_btn',
            resume: '#sbplus_resume_btn',
            downloadWrapper: '#sbplus_download_btn_wrapper',
            download: '#sbplus_download_btn',
            downloadMenu: '#sbplus_download_btn .menu-parent .downloadFiles',
            widget: '#sbplus_widget_btn',
            widgetTip: '#sbplus_widget_btn .btnTip',
            sidebar: '#sbplus_sidebar_btn',
            author: '#sbplus_author_name',
            menu: '#sbplus_menu_btn',
            menuClose: '#sbplus_menu_close_btn',
            next: '#sbplus_next_btn',
            prev: '#sbplus_previous_btn'
        };
        
        // set HTML menu classes and IDs
        this.menu = {
            menuList: '#sbplus_menu_btn_wrapper .menu',
            menuContentList: '#menu_item_content .menu',
            menuBarTitle: '#menu_item_content .sbplus_menu_title_bar .title',
            menuContentWrapper: '#menu_item_content',
            menuContent: '#menu_item_content .content',
            menuSavingMsg: '#save_settings'
        };
        
        // set screen reader classes and IDs
        this.screenReader = {
            pageStatus: '.sr-page-status',
            currentPage: '.sr-page-status .sr-current-page',
            totalPages: '.sr-page-status .sr-total-pages',
            pageTitle: '.sr-page-status .sr-page-title',
            hasNotes: '.sr-page-status .sr-has-notes'
        };

        // set theme decoration bar class
        this.themeDecorationBar = '#theme-decoration-bar';

        // set loading screen id
        this.loadingScreen = {
            wrapper: '#sbplus_loading_screen',
            logo: '#sbplus_loading_screen .program_logo'
        }

        // get manifest data if not set
        if ( this.manifest === null ) {
            
            var self = this;
            
            // use AJAX load the manifest JSON data using the
            // url returned by the getManifestURL function
            $.getJSON( self.getManifestUrl(), function( data ) {
                
                // set the JSON data to the class manifest object
                self.manifest = data;
                self.manifestLoaded = true;
                
                // set an event listener to unload all session storage on HTML
                // page refresh/reload or closing
                $( window ).on( 'unload', self.removeAllSessionStorage.bind( self ) );
                
                if ( self.isEmpty( self.manifest.sbplus_root_directory ) ) {
                    self.manifest.sbplus_root_directory = 'sources/';
                }

                // called the loadTemplate functiont load Storybook Plus's
                // HTML structure
                /* !! SHOULD BE THE LAST THING TO BE CALLED IN THIS BLOCK!! */
                self.loadTemplate();
                
            } ).fail( function() { // when manifest fail to load...
                
                // set an error message
                var msg = '<div class="error">';
                msg += '<p><strong>Storybook Plus Error:</strong> ';
                msg += 'failed to load the manifest file.<br>'
                msg += 'Expecting: <code>' + this.url + '</code></p>';
                msg += '</div>';
                
                // display the error message to the HTML page
                $( self.layout.wrapper ).html( msg );
                
            } );
            
        }
             
    }, // end go function

    /**
     * Load Storybook Plus HTML templates from the templates directory
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    loadTemplate: function() {
        
        var self = this;
        
        if ( self.manifestLoaded ) {
            
            // set the template URL for the sbplus.tpl file
            var templateUrl = self.manifest.sbplus_root_directory;
            templateUrl += 'scripts/templates/sbplus.tpl';
            
            // AJAX call and load the sbplus.tpl template
            $.get( templateUrl, function( data ) {
                
                // output the template date to the HTML/DOM
                $( self.layout.wrapper ).html( data );
                
                // set an event listener to resize elements on viewport resize
                $( window ).on( 'resize', self.resize.bind( self ) );
                
                // show support error is any
                if ( self.checkForSupport() === 0 ) {
                    self.hasError = true;
                    self.showErrorScreen( 'support' );
                    return false; // EXIT & STOP FURTHER SCRIPT EXECUTION
                }
                
                // execute tasks before loading external XML data
                self.beforeXMLLoading();
                
                // load the data from the external XML file
                self.loadXML();
                
            } ).fail( function() { // when fail to load the template
                
                // set an error message
                var msg = '<div class="error">';
                msg += '<p><strong>Storybook Plus Error:</strong> ';
                msg += 'failed to load template.<br>';
                msg += 'Expecting: <code>' + this.url + '</code></p>';
                msg += '</div>';
                
                // display the error message to the HTML page
                $( self.layout.wrapper ).html( msg );
                
            } );
            
        }
        
    }, // end loadTemplate function
    
    /**
     * Set the program theme
     *
     * @since 3.2.0
     * @author(s) Ethan Lin
     *
     * @param none
     * @return none
     **/
     setTheme: function() {
         
        var self = this;
        
        if ( self.manifestLoaded ) {
                
            var program = self.xml.setup.program;
            
            // if program is empty
            if ( self.isEmpty( program ) ) {
                
                program = SBPLUS.getProgramDirectory();
                
                if ( self.isEmpty( program ) ) {
                    
                    program = self.manifest.sbplus_program_default;
                    
                }
                
            }
            
            // set copyright date
            let date = new Date();
            $( '#copyright-footer .copyright-year' ).html( date.getFullYear() + "." );
            
            $.getJSON( self.manifest.sbplus_program_themes, function( data ) {
                
                let themeColors = self.getProgramTheme(0, program, data);
                
                themeColors.forEach( function( color ) {
                    $( self.themeDecorationBar ).append( '<span style="background-color:' + color +'"></span>' );
                } );
                
                $( '#copyright-footer .notice' ).html( data.copyright );
                
            } ).fail( function() { // when themes fail to load...
                
                // do nothing
                
            } );
            
        }
         
     }, // end set theme function
    
     /**
     * Set the program theme bar color
     *
     * @since 3.2.0
     * @author(s) Ethan Lin
     *
     * @param none
     * @return none
     **/
    getProgramTheme: function( count, program, data ) {
        
        let self = this;
        let theme = data.program_themes.filter( theme => theme.name === program );
        let colors = []
        
        if ( theme.length ) {
            
            colors = theme[0].colors;
            
        } else {
            
            if ( count < 3 ) {
                
                if ( !self.isEmpty( self.manifest.sbplus_program_default ) ) {
                    colors = self.getProgramTheme( count + 1, self.manifest.sbplus_program_default, data );
                }
            
            }
            
        }
        
        return colors;
        
    },

    /**
     * Set the program logo
     *
     * @since 3.3.0
     * @author(s) Ethan Lin
     *
     * @param none
     * @return none
     **/
    getLogo: function() {

        var self = this;

        if ( self.isEmpty( self.logo ) ) {
                
            var program = this.xml.setup.program;
            
            if ( SBPLUS.isEmpty( program ) ) {
                
                program = SBPLUS.getProgramDirectory();
                
                if ( SBPLUS.isEmpty( program ) ) {
                    program = this.manifest.sbplus_program_default;
                }
                
            }
            
            var logoUrl = this.manifest.sbplus_logo_directory + program + '.svg';
            
            $.ajax( {
                
                url: logoUrl,
                type: 'HEAD'
                
            } ).done( function() {
                
                self.logo = this.url;
                $( self.loadingScreen.logo ).html( '<img src="' + self.logo + '" />' );
                
            } ).fail( function() {
                
                logoUrl = self.manifest.sbplus_logo_directory + self.manifest.sbplus_program_default + '.svg';
                
                $.ajax( {
                    
                    url: logoUrl,
                    type: 'HEAD'
                    
                } ).done( function() {
                    
                    self.logo = this.url;
                    $( self.loadingScreen.logo ).html( '<img src="' + self.logo + '" />' );
                    
                } ).fail( function() {
                    
                    self.logo = self.manifest.sbplus_root_directory + 'images/default_logo.svg';
                    
                } );
                
            } );
            
        }

    },
    
    /**
     * Execute tasks before loading the external XML data
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    beforeXMLLoading: function() {
        
        // if manifest and template are loaded and XML was never loaded before
        if ( this.manifestLoaded === true && this.beforeXMLLoadingDone === false ) {
            
            // setup the options specified in the URL string query
            this.setURLOptions();
            
            // setup custom menu items specified in the manifest file
            this.setManifestCustomMenu();
            
            // set flag to true
            this.beforeXMLLoadingDone = true;
            
        }
        
    }, // end beforeXMLLoading function
    
    /**
     * Setting up the custom menu items specified in the manifest file
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    setManifestCustomMenu: function() {
        
        if ( this.manifestLoaded ) {
            
            // set the menu item(s) data from the manifest
            var customMenuItems = this.manifest.sbplus_custom_menu_items;
            
            // if data is exists...
            if ( customMenuItems.length ) {
                
                // loop through the data
                for ( var key in customMenuItems ) {
                    
                    // set the menu item name
                    var name = customMenuItems[key].name;
                    
                    // clean and reformat the name
                    var sanitizedName = this.sanitize( name );
                    
                    // set the HTML LI tag
                    var item = '<li tabindex="-1" role="menuitem" aria-live="polite" class="menu-item sbplus_' + sanitizedName + '"><a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_' + sanitizedName + '\');"><span class="icon-' + sanitizedName + '"></span> ' + name + '</a></li>';
                    
                    // append the HTML LI tag to the menu list
                    $( this.menu.menuList ).append( item );
                    
                }
                
            }
            
            // append/display the menu list to inner menu list
            $( this.menu.menuContentList ).html( $( this.menu.menuList ).html() );
            
        }
        
    }, // end setManifestCustomMenu function
    
    /**
     * Load presentation data from an external XML file
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    loadXML: function() {
        
        if ( this.beforeXMLLoadingDone ) {
            
            var self = this;
            
            // set the path to the XML file
            var xmlUrl = 'assets/sbplus.xml?_=' + new Date().getTime();
            
            // AJAX call to the XML file
            $.get( xmlUrl, function( data ) {
                
                self.xmlLoaded = true;
                
                // call function to parse the XML data
                // SHOULD BE THE LAST TASK TO BE EXECUTED IN THIS BLOCK
                self.parseXMLData( data );
                
            } ).fail( function( res, status ) { // when fail to load XML file
                
                // set error flag to true
                self.hasError = true;
                
                // display appropriate error message based on the status
                if ( status === 'parsererror' ) {
                    self.showErrorScreen( 'parser' );
                } else {
                    self.showErrorScreen( 'xml' );
                }
                
            } );
            
        }
        
    }, // end loadXML function
    
    /**
     * Parse presentation data from an external XML file
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 11/14/2019
     *
     * @param string
     * @return none
     **/
    parseXMLData: function( d ) {
        
        var self = this;
            
        if ( self.xmlLoaded ) {
            
            // set the parameter as jQuery set
            var data = $( d );
            
            // set data from the XML to respective variables
            var xSb = data.find( 'storybook' );
            var xSetup = data.find( 'setup' );
            var xAccent = self.trimAndLower( xSb.attr( 'accent' ) );
            var xImgType = self.trimAndLower( xSb.attr( 'pageImgFormat' ) );
            var xSplashImgType = 'svg';
            var xAnalytics = self.trimAndLower( xSb.attr( 'analytics' ) );
            var xMathjax = '';
            var xVersion = xSb.attr( 'xmlVersion' );
            var xProgram = '';
            var xCourse = self.trimAndLower( xSetup.attr( 'course' ) );
            var xTitle = self.noScript( xSetup.find( 'title' ).text().trim() );
            var xSubtitle = self.noScript( xSetup.find( 'subtitle' ).text().trim() );
            var xLength = xSetup.find( 'length' ).text().trim();
            var xAuthor = xSetup.find( 'author' );
            var xGeneralInfo = self.getTextContent( xSetup.find( 'generalInfo' ) );
            var xSections = data.find( 'section' );
            
            // variable to hold temporary XML value for further evaluation
            var splashImgType_temp = xSb.attr( 'splashImgFormat' );
            var program_temp = xSetup.attr( 'program' );
            
            // if temporary splash image type is defined...
            if ( splashImgType_temp ) {
                
                // and if it is not empty...
                if ( !self.isEmpty( splashImgType_temp ) ) {
                    
                    // set the splash image type to the temporary value
                    xSplashImgType = self.trimAndLower( splashImgType_temp );
                    
                }
                
            }
            
            // if program temporary is defined
            if ( program_temp ) {
                
                // set the program to the temporary value
                xProgram = self.trimAndLower( program_temp );
                
            }
            
            // if accent is empty, set the accent to the vaule in the manifest
            if ( self.isEmpty( xAccent ) ) {
                xAccent = self.manifest.sbplus_default_accent;
            }
            
            // if image type is empty, default to jpg
            if ( self.isEmpty( xImgType ) ) {
                xImgType = 'jpg';
            }
            
            // if analytic is not on, default to off
            if ( xAnalytics !== 'on' && xAnalytics !== 'true' ) {
                xAnalytics = 'off';
            }
            
            // if mathjax is not found or empty
            if ( self.isEmpty( xSb.attr( 'mathjax' ) ) ) {
                
                // default to off
                xMathjax = 'off';
                
            } else {
                
                // value in mathjax attribute is on, set to on
                if ( self.trimAndLower( xSb.attr( 'mathjax' ) ) === 'on' ) {
                    xMathjax = 'on';
                }
                
            }
            
            // set the parsed data to the class XML object variable
            self.xml = {
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
                    author: xAuthor,
                    authorPhoto: '',
                    duration: xLength,
                    generalInfo: xGeneralInfo
                },
                sections: xSections
            };

            // get program logo
            self.getLogo();

            // set the program theme
            self.setTheme();
            
            // get/set the presenation storage id
            self.presentationLoc = self.sanitize( self.getCourseDirectory() );            
            
            // if HotJar site id is set in manifest, get and set HotJar tracking code
            if (self.manifest.sbplus_hotjar_site_id != "") {
                var id = Number(self.manifest.sbplus_hotjar_site_id);
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:id,hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            }
            
            // if analytics is on, get and set Google analtyics tracking

            if ( self.xml.settings.analytics === 'on' || self.xml.settings.analytics === 'true' ) {
                
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                
                ga( 'create', self.manifest.sbplus_google_tracking_id, 'auto' );
                ga( 'set', { 'appName': 'SBPLUS', 'appVersion': self.xml.settings.version } );
                
            }
            
            if ( xAuthor.length ) {
                
                // set author name and path to the profile to respective variable
                var sanitizedAuthor = self.sanitize( xAuthor.attr( 'name' ).trim() );
                var profileUrl = self.manifest.sbplus_author_directory + sanitizedAuthor + '.json';
                var profileInXml = self.getTextContent( xAuthor );
                
                self.xml.setup.author = xAuthor.attr( 'name' ).trim();
                
                // if author name in XML is not empty
                if ( !self.isEmpty( sanitizedAuthor ) ) {
                    
                    // get centralized author name and profile via AJAX
                    $.ajax( {
                            
                        crossDomain: true,
                        type: 'GET',
                        dataType: 'jsonp',
                        jsonpCallback: 'author',
                        url: profileUrl
                        
                    } ).done( function( res ) { // when done, set author and profile
                        
                        self.xml.setup.profileName = res.name;

                        if ( !self.isEmpty( profileInXml ) ) {
                            self.xml.setup.profile = profileInXml;
                        } else {
                            self.xml.setup.profile = res.profile;
                        }

                        self.xmlParsed = true;
                        self.renderSplashscreen();
                        
                    } ).fail( function() { // when fail, default to the values in XML
                        
                        self.xml.setup.profile = profileInXml;
                        self.xmlParsed = true;
                        self.renderSplashscreen();
                        
                    } )
                    
                } else { // if not
                    
                    // get the values in the XML
                    self.xml.setup.profile = profileInXml;
                    self.xmlParsed = true;
                    self.renderSplashscreen();
                    
                }
                
            }
            
        }
        
    }, // end parseXMLData function
    
    /**************************************************************************
        SPLASH SCREEN FUNCTIONS
    **************************************************************************/
    
    /**
     * Render presentation splash screen
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 1/2/2020
     *
     * @param none
     * @return none
     **/
    renderSplashscreen: function() {
        
        var self = this;
        
        if ( self.xmlParsed === true && self.splashScreenRendered === false ) {
            
            // set inital local storage settings
            if ( self.hasStorageItem( 'sbplus-hide-widget' ) === false ) {
                self.setStorageItem( 'sbplus-hide-widget', 0 );
            }
            
            if ( self.hasStorageItem( 'sbplus-hide-sidebar' ) === false ) {
                self.setStorageItem( 'sbplus-hide-sidebar', 0 );
            }
            
            if ( self.hasStorageItem( 'sbplus-disable-it' ) === false ) {
                self.setStorageItem( 'sbplus-disable-it', 1 );
            }
            
            if ( self.hasStorageItem( 'sbplus-autoplay' ) === false ) {
                self.setStorageItem( 'sbplus-autoplay', 1 );
            }
            
            if ( self.hasStorageItem( 'sbplus-volume' ) === false ) {
                self.setStorageItem( 'sbplus-volume', 0.8 );
            }
            
            if ( self.hasStorageItem( 'sbplus-playbackrate' ) === false ) {
                self.setStorageItem( 'sbplus-playbackrate', 1 );
            } else {
                self.playbackrate = self.getStorageItem( 'sbplus-playbackrate' );
            }
            
            if ( self.hasStorageItem( 'sbplus-subtitle' ) === false ) {
                self.setStorageItem( 'sbplus-subtitle', 0 );
            }
            
            if ( self.hasStorageItem( 'sbplus-disable-it' ) ) {
                self.deleteStorageItem( 'sbplus-disable-it' );
            }
            
            // if autoplay for videoJS is on, add a class to the body tag
            if ( self.getStorageItem( 'sbplus-autoplay') == '1' ) {
                $( self.layout.wrapper ).addClass( 'sbplus_autoplay_on' );
            }
            
            // set the HTML page title
            $( document ).attr( "title", self.xml.setup.title );
            
            // display data to the splash screen
            $( self.splash.title ).html( self.xml.setup.title );
            $( self.splash.subtitle ).html( self.xml.setup.subtitle );

            if ( self.xml.setup.profileName ) {
                $( self.splash.author ).html( self.xml.setup.profileName );
            } else {
                $( self.splash.author ).html( self.xml.setup.author );
            }
            
            $( self.splash.duration ).html( self.xml.setup.duration );
            
            // get splash image background via AJAX
            $.ajax( { // get the splash image from the local first
                
                url: 'assets/splash.' + self.xml.settings.splashImgType,
                type: 'head'
                
            } ).done( function() { // when successful and done
                
                // display the image
                self.setSplashImage( this.url );
                
            } ).fail( function() { // when failed, get from the server
                
                // get the program and course value
                var program = self.xml.setup.program;
                var course = self.xml.setup.course;
                
                // if program is empty
                if ( self.isEmpty( program ) ) {
                    
                    // set program to the program directory name from the URL
                    program = SBPLUS.getProgramDirectory();
                    
                }
                
                // if course is empty
                if ( self.isEmpty( course ) ) {
                    
                    // set course to the course directory name from the URL
                    course = SBPLUS.getCourseDirectory();
                    
                    // if course is still empty
                    if ( self.isEmpty( course ) ) {
                        
                        // set course name to default
                        course = 'default';
                    
                    }
                    
                }
                
                // append image file extension to course value
                course += '.' + self.xml.settings.splashImgType;
                
                // if both program and course are not empty,
                // get the image from the server
                if ( !self.isEmpty( program ) && !self.isEmpty( course ) ) {
                    
                    // set the path to the image
                    var ss_url = self.manifest.sbplus_splash_directory + program + '/' + course;
                    
                    // load the image via AJAX
                    $.ajax( {
                        
                        url: ss_url,
                        type: 'HEAD'
                        
                    } ).done( function() { // when successful and done
                        
                        // display the image
                        self.setSplashImage( this.url );
                        
                    } ).fail( function() {
                        
                        self.setSplashImage( self.manifest.sbplus_root_directory + 'images/default_splash.svg' );
                        
                    } );
                    
                } else {
                    
                    self.setSplashImage( self.manifest.sbplus_root_directory + 'images/default_splash.svg' );
                    
                }
                
            } );
            
            // set event listener to the start button
            $( self.button.start ).on( 'click', self.startPresentation.bind( self ) );
            
            // if local storage has a value for the matching presentation title
            if ( self.hasStorageItem( 'sbplus-' + self.presentationLoc ) ) {
                
                // set event listener to the resume button
                $( self.button.resume ).on( 'click', self.resumePresentation.bind( self ) );
                
            } else {
                
                // hide the resume button
                $( self.button.resume ).hide( 0, function() {
                    $( self ).attr( 'tabindex', '-1' );
                } );
                
            }
            
            // set downloadable file name from the course directory name in URL
            var fileName = SBPLUS.getCourseDirectory().replace(".sbproj", "");
            
            // if file name is empty, default to 'default'
            if ( self.isEmpty( fileName ) ) {
                fileName = 'default';
            }
            
            // load each supported downloadable files specified in the manifest
            self.manifest.sbplus_download_files.forEach( function( file ) {
                
                $.ajax( {
                    
                    url: fileName + '.' + file.format,
                    type: 'HEAD'
                    
                } ).done( function() {
                    
                    let fileLabel = file.label.toLowerCase();
                    
                    self.downloads[fileLabel] = this.url;
                    
                    $( self.splash.downloadBar ).append(
                        '<a href="' + self.downloads[fileLabel] + '" tabindex="1" download="' + fileName + '" aria-label="Download ' + fileLabel + ' file" onclick="SBPLUS.sendToGA( \'' + fileLabel + 'Link\', \'click\', \'' + fileName + '\', 4, 0 );"><span class="icon-download"></span> ' + file.label + '</a>' );
                } );
                
            } );
            
            // if accent does not match the default accent
            if ( self.xml.settings.accent !== self.manifest.sbplus_default_accent ) {
                
                // set hover color hex value
                var hover = self.colorLum( self.xml.settings.accent, 0.2 );
                
                // set the text color hex value
                var textColor = self.colorContrast( self.xml.settings.accent );
                
                // construct the CSS
                var style = '.sbplus_wrapper button:hover{color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button{color:' + textColor  + ';background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button:hover{background-color:' + hover + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .item:hover{color:' + textColor + ';background-color:' + hover + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .sb_selected{color:' + textColor + ';background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col #sbplus_table_of_contents_wrapper .section .current{border-left-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover{background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover a{color:' + textColor + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .active, .sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .active{color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus{background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus a{color:' + textColor + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent:hover{color:' + self.xml.settings.accent + '}.sbplus_boxed #theme-decoration-bar{background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_left_col #sbplus_media_wrapper #copyToCbBtn{color:' + textColor  + ';background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_left_col #sbplus_media_wrapper #copyToCbBtn:hover{background-color:' + hover + '}';
                
                // append the style/css to the HTML head
                $( 'head' ).append( '<style type="text/css">' + style + '</style>' );
                
            }
            
            // if mathjax if turned on
            if ( self.xml.settings.mathjax === 'on' || self.xml.settings.mathjax === 'true' ) {
                
                // load the MathJAX script from a CDN
                $.getScript( 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML', function() {
            
                    MathJax.Hub.Config({
                        
                      'HTML-CSS': {
                        matchFontHeight: true
                      }
                      
                    });
                    
                });
                
            }
            
            // flag the splash screen as rendered
            self.splashScreenRendered = true;
            
            if ( window.self !== window.top ) {
                
                $( self.layout.wrapper ).addClass( 'loaded-in-iframe' );
                
/*
                if ( document.referrer.indexOf('uwli.courses') >= 0 ) {
                    
                   $( self.layout.wrapper ).addClass( 'loaded-in-iframe' );
                   
                }
*/
                
            }
            
            if ( self.xml.settings.analytics === 'on' || self.xml.settings.analytics === 'true' ) {
                
                ga( 'send', 'screenview', { screenName: self.getCourseDirectory() +  ' - splash' } );
                
            }
            
            self.resize();
            
        }
        
    }, // end renderSplashScreen function
    
    /**
     * Set the splash screen image to the DOM
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 11/14/2019
     *
     * @param string
     * @return none
     **/
    setSplashImage: function( str ) {
        
        // if parameter is not empty, set the background image
        if ( str ) {

            var self = this;

            var img = new Image();
            img.src = str;

            img.addEventListener('load', function() {
                
                if ( img.complete ) {
                    
                    $( self.splash.background )
                        .css( 'background-image', 'url(' + img.src + ')' );
                    
                    $( self.loadingScreen.wrapper ).addClass( "fadeOut" )
                    .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                    function() {
                        $( this ).removeClass( 'fadeOut' ).hide();
                        $( this ).off();
                    }
                );
    
                }

            } );

            self.preloadPresenationImages();
            
        }
        
    },
    
    /**
     * Hide the splash screen. Should be used when starting or resuming.
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return string
     **/
    hideSplash: function() {
        
        // if presentation is rendered...
        if ( this.presentationRendered ) {
            
            // add fadeOut class and listen for animation completion event
            $( this.splash.screen ).addClass( 'fadeOut' )
                .one( 'webkitAnimationEnd mozAnimationEnd animationend', 
                     function() {
                         $( this ).removeClass( 'fadeOut' ).hide();
                         $( this ).off();
                     }
                );
            
        }
        
        // if splash screen is visible or presentation is not rendered
        if ( !$( this.splash.screen ).is( ':visible' ) ||
        this.presentationRendered === false ) {
            
            // throw a warning to the console
            console.warn( 'hideSplash should be called after renderPresentation.' );
            
        }
        
    },

    preloadPresenationImages: function() {

        var self = this;

        // start a worker service thread to preload page images
        var worker = new Worker( self.manifest.sbplus_root_directory + 'scripts/preload.js' );
        var path = window.location.pathname,
            location = window.location.href,
            index = location.indexOf( '?' );
        
        if ( index != -1 ) {
            location = location.substring( 0, index );
        }
        
        index = location.indexOf( '#' );
        
        if ( index != -1 ) {
            location = location.substring( 0, index );
        }
        
        path = path.replace( 'index.html', '' );
        location = location.replace( 'index.html', '' );
        
        var paths = {
            "php": 'php/preload.php',
            "pages": path + "assets/pages/",
            "url": location + "assets/pages/"
        }

        worker.postMessage( paths );
        
        worker.onmessage = function( e ) {

            e.data.forEach( function( svg ) {
                
                let svgObj = document.createElement( "img" );
                
                svgObj.src = paths.pages + svg;
                svgObj.setAttribute( 'aria-hidden', true );
                svgObj.style = "position: fixed; width: 1px; height: 1px; opacity: 0;";
                
                document.getElementsByTagName( "body" )[0].appendChild( svgObj );
                
            } );
            
        }

    },
    
    /**
     * Start presentation function for the start button
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    startPresentation: function() {
        
        var self = this;
        
        // if presentation has not started, hide splash and render presenation
        if ( this.presentationStarted === false ) {
            
            // render presenation
            self.renderPresentation().promise().done( function() {
                
                // hide splash screen
                self.hideSplash();
                
                // select the first page
                self.selectPage( '0,0' );
                
                if ( self.xml.settings.analytics === 'on' || self.xml.settings.analytics === 'true' ) {
                    
                    ga( 'send', 'screenview', { screenName: self.getCourseDirectory() } );
                    self.sendToGA( 'PresentationStartBtn', 'click', self.getCourseDirectory(), 0, 0 );
                    
                }
                
            } );
            
            self.presentationStarted = true;
            
            
        }
        
    },
    
    /**
     * Resume presentation function for the start button
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    resumePresentation: function() {
        
        var self = this;
        
        // if presentation has not started, hide splash, set resuming flag
        // to true and render presenation
        if ( self.presentationStarted === false ) {
            
            // render presentation
            self.renderPresentation().promise().done( function() {
                
                // hide screen
                self.hideSplash();
                
                // select the page that was set in the local storage data
                self.selectPage( self.getStorageItem( 'sbplus-' + self.presentationLoc ) );
                
            } );
            
            self.presentationStarted = true;
            
            if ( self.xml.settings.analytics === 'on' || self.xml.settings.analytics === 'true' ) {
                    
                self.sendToGA( 'PresentationResumeBtn', 'click', self.getCourseDirectory(), 0, 0 );
                
            }
            
        }
        
    },
    
    /**
     * Render the presentation (after the hiding the splash screen)
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 1/2/2020
     *
     * @param none
     * @return none
     **/
    renderPresentation: function() {
        
        if ( this.presentationRendered === false ) {
            
            var self = this;
        
            // before presenting; apply local storage settings
            if ( self.getStorageItem( 'sbplus-hide-widget' ) === '1' ) {
                self.hideWidget();
            }
            
            if ( self.getStorageItem( 'sbplus-hide-sidebar' ) === '1' ) {
                self.hideSidebar();
            }
            
            // remove focus (from the hidden elements)
            $( self.layout.sbplus ).blur();
            
            // display presentation title and author to the black banner bar
            $( self.banner.title ).html( self.xml.setup.title );

            if ( self.xml.setup.profileName ) {
                $( self.banner.author ).html( self.xml.setup.profileName );
            } else {
                $( self.banner.author ).html( self.xml.setup.author );
            }
            
            // display table of contents
            $( self.xml.sections ).each( function( i ) {
                
                // set section head title
                var sectionHead = $( this ).attr( 'title' );
                
                // set page array data
                var pages = $( this ).find( 'page' );
                
                // set section HTML DOM
                var sectionHTML = '<div class="section">';
                
                // if there is more than 2 sections...
                if ( $( self.xml.sections ).length >= 2 ) {
                    
                    // if sectionHead title is empty, set a default title
                    if ( self.isEmpty( sectionHead ) ) {
                        sectionHead = 'Section ' + ( i + 1 );
                    }
                    
                    // append section head HTML to DOM
                    sectionHTML += '<div class="header">';
                    sectionHTML += '<div class="title">';
                    sectionHTML += sectionHead +'</div>';
                    sectionHTML += '<div class="icon"><span class="icon-collapse"></span></div></div>';
                    
                }
                
                // append pages (opening list tag) HTML to DOM
                sectionHTML += '<ul class="list">';
                
                // for each page
                $.each( pages, function( j ) {
                    
                    // increment total page
                    ++self.totalPages;
                    
                    let pageType = $( this ).attr( 'type' );
/*
                    let itemType = "";
                    
                    switch ( pageType ) {
                        
                        case "video":
                        case "youtube":
                        case "kaltura":
                        case "vimeo":
                        itemType = "video-item";
                        break;
                        
                        case "image":
                        itemType = "image-item";
                        break;
                        
                        case "image-audio":
                        case "bundle":
                        itemType = "audio-item";
                        break;
                        
                        case "html":
                        itemType = "html-item";
                        break;
                        
                        case "quiz":
                        itemType = "quiz-item";
                        break;
                        
                        default:
                        itemType = "";
                        break;
                        
                    }
*/
                    
                    // append opening list item tag to DOM
                    //sectionHTML += '<li class="item ' + itemType + '" data-count="';
                    sectionHTML += '<li class="item" data-count="';
                    sectionHTML += self.totalPages + '" data-page="' + i + ',' + j + '">';
                    
                    // if page is quiz
                    if ( pageType === 'quiz' ) {
                        
                        // append an quiz icon
                        sectionHTML += '<span class="icon-assessment"></span>';
                        
                    } else {
                        
                        // append a count number
                        sectionHTML += '<span class="numbering">' + self.totalPages + '.</span> ';
                        
                    }
                    
                    // append page title and close the list item tag
                    sectionHTML += $( this ).attr( 'title' ) + '</li>';
                    
                } );
                
                // appending closing list and div tag
                sectionHTML += '</ul></div>';
                
                // append the section HTML to the table of content DOM area
                $( self.tableOfContents.container ).append( sectionHTML );
                
            } );
            
            // set total page to the status bar and to the screen reader text holder
            $( self.layout.pageStatus ).find( 'span.total' ).html( self.totalPages );
            $( self.screenReader.totalPages ).html( self.totalPages );
            
            // set event listeners
            $( self.button.sidebar ).on( 'click', self.toggleSidebar.bind( self ) );
            $( self.button.widget ).on( 'click',  self.toggleWidget.bind( self ) );
            
            // if author is missing hide author button and menu item
            if ( self.xml.setup.author.length ) {
                
                $( self.button.author ).on( 'click', function() {
                    self.openMenuItem( 'sbplus_author_profile' );
                } );
                
            } else {
                
                $(self.button.author).prop( 'disabled', true );
                
            }
            
            $( self.button.next ).on( 'click', self.goToNextPage.bind( self ) );
            $( self.button.prev ).on( 'click', self.goToPreviousPage.bind( self ) );
            
            if ( $( self.xml.sections ).length >= 2 ) {
                $( self.tableOfContents.header ).on( 'click', self.toggleSection.bind( self ) );
            }
            
            $( self.tableOfContents.page ).on( 'click', self.selectPage.bind( self ) );
            $( self.widget.segment ).on( 'click', 'button', self.selectSegment.bind( self ) );
            
            // add main menu button
            self.layout.mainMenu = new MenuBar( $( self.button.menu )[0].id, false );
            
            // hide general info under main menu if empty
            if (self.isEmpty(self.xml.setup.generalInfo)) {
                $(".sbplus_general_info").hide();
            }
            
            // add download button if downloads object is not empty
            if ( !$.isEmptyObject(self.downloads) ) {
                
                self.layout.dwnldMenu = new MenuBar( $( self.button.download )[0].id, false );
                
                // set download items
                for ( var key in self.downloads ) {
                    
                    if ( !SBPLUS.isEmpty( self.downloads[key] ) ) {
                        $( self.button.downloadMenu ).append(
                            '<li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite"><a download="' + self.xml.setup.title + '" href="'
                            + self.downloads[key] +
                            '" onclick="SBPLUS.sendToGA( \'' + key + 'Link\', \'click\', \'' + self.getCourseDirectory() + '\', 4, 0 );">' + self.capitalizeFirstLetter( key ) + '</a></li>'
                        );
                    }
                    
                }
                
            } else {
                
                // hide the download button if download object is empty
                $( self.button.downloadWrapper ).hide();
            
            }
            
            // queue MathJAX if turned on
            if ( self.xml.settings.mathjax === 'on' || self.xml.settings.mathjax === 'true' ) {
                MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
            }
            
            // easter egg event listener
            $( "#sbplus_menu_btn .menu-parent" ).on( 'click', self.burgerBurger.bind( self ) );
            
            if ( window.innerWidth < 900 || window.screen.width <= 414 ) {
                this.hideWidget();
            }
            
            this.presentationRendered = true;
            
            // resize elements after everything is put in place
            self.resize();
            
            return $( self.layout.sbplus );
            
        }
        
    }, // end renderPresentation function
    
    /**************************************************************************
        MAIN NAVIGATION FUNCTIONS
    **************************************************************************/
    
    /**
     * Go to next page in the table of contents
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    goToNextPage: function() {
        
        // get/set current page array
        var currentPage = $( '.sb_selected' ).data( 'page' ).split(',');
        
        // set section number
        var tSection = Number( currentPage[0] );
        
        // set page number
        var tPage = Number( currentPage[1] );
        
        // set total section
        var totalSections = this.xml.sections.length;
        
        // set total page in current section
        var totalPagesInSection = $( this.xml.sections[tSection] ).find( 'page' ).length;
        
        // increment current page number
        tPage++;
        
        // if current page number is greater than total number of page in
        // current section
        if ( tPage > totalPagesInSection - 1 ) {
            
            // increment current section number
            tSection++;
            
            // if current section number is greater total number of sections
            if ( tSection > totalSections - 1 ) {
                
                // set current section number to 0 or the first section number
                tSection = 0;
            }
            
            // set page number to 0 or the first page in the current section
            tPage = 0;
            
        }
        
        // call selectPage function to get the page with current section and
        // and current page number as the arugments
        this.selectPage( tSection + ',' + tPage );
        
    }, // end goToNextPage function
    
    /**
     * Go to previous page in the table of contents
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    goToPreviousPage: function() {
        
        // get/set current page array
        var currentPage = $( '.sb_selected' ).data( 'page' ).split(',');
        
        // set section number
        var tSection = Number( currentPage[0] );
        
        // set page number
        var tPage = Number( currentPage[1] );
        
        // decrement current page number
        tPage--;
        
        // current page number is less than 0 or the first page
        if ( tPage < 0 ) {
            
            // decrement current section number
            tSection--;
            
            // if current section number is 0 or the first section
            if ( tSection < 0 ) {
                
                // set section number to the last section
                tSection = this.xml.sections.length - 1;
                
            }
            
            // set page number to the last page on the current section
            tPage = $( this.xml.sections[tSection] ).find( 'page' ).length - 1;
            
        }
        
        // call selectPage function to get the page with current section and
        // and current page number as the arugments
        this.selectPage( tSection + ',' + tPage );
        
    }, // end goToPreviousPage function
    
    /**
     * Update Page Status (or the status bar) next to the page controls
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    updatePageStatus: function( num ) {
        
        // display current page number to the status
        $( this.layout.pageStatus ).find( 'span.current' ).html( num );
        
    }, // end updatePageStatus function
    
    /**************************************************************************
        TABLE OF CONTENT (SIDEBAR) FUNCTIONS
    **************************************************************************/
    
    /**
     * Toggling sidebar (table of contents) panel by calling hideSidebar or 
     * showSidebar function
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    toggleSidebar: function() {
        
        if ( $( this.layout.sidebar ).is( ':visible' ) ) {
            this.hideSidebar();
        } else {
           this.showSidebar();
        }
        
    }, // end toggleSidebar function
    
    /**
     * Hide sidebar (table of contents)
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    hideSidebar: function() {
        
        // set media rea DOM jQuery set
        var media = $( this.layout.media );
        
        // hide the sidebar
        $( this.layout.sidebar ).hide();
        
        // update the icon on the toggle sidebar button
        $( this.button.sidebar ).html( '<span class="icon-sidebar-open"></span>' );
        
        // remove sidebar_on and add sidebar_off
        media.removeClass( 'sidebar_on' ).addClass( 'sidebar_off' );
        
    }, // end hideSidebar function
    
    /**
     * Show sidebar (table of contents)
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    showSidebar: function() {
        
        // set media rea DOM jQuery set
        var media = $( this.layout.media );
        
        // hide the sidebar
        $( this.layout.sidebar ).show();
        
        // update the icon on the toggle sidebar button
        $( this.button.sidebar ).html( '<span class="icon-sidebar-close"></span>' );
        
        // remove sidebar_off and add sidebar_on
        media.removeClass( 'sidebar_off' ).addClass( 'sidebar_on' );
        
    }, // end showSidebar function
    
    /**
     * Toggling table of content sections
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 3/14/2018
     *
     * @param string or object
     * @return none
     **/
    toggleSection: function( e ) {
        
        // get total number of 
        var totalHeaderCount = $( this.tableOfContents.header ).length;
        
        // if total number of section is greater than 1...
        if ( totalHeaderCount > 1 ) {
            
            // declare a varible to hold current targeted section
            var targetSectionHeader;
            
            // if the object is an click event object
            if ( e instanceof Object ) {
                
                // set the current section to the current event click target
                targetSectionHeader = $( e.currentTarget );
                
            } else {
                
                // if argument is greather than total number of sections
                if ( Number( e ) > totalHeaderCount - 1 ) {
                    
                    // exit function
                    return false;
                    
                }
                
                // set the current section to the passed argument
                targetSectionHeader = $( '.header:eq(' + e + ')' );
                
            }
            
            // if target is visible...
            if ( $( targetSectionHeader.siblings( '.list' ) ).is( ':visible' ) ) {
                
                this.closeSection( targetSectionHeader );
                
            } else {
                
                this.openSection( targetSectionHeader );
                
            }
            
        }
        
    }, // end toggleSection function
    
    /**
     * Close specified table of content section
     *
     * @since 3.1.3
     * @author(s) Ethan Lin
     * @updated on 3/14/2018
     *
     * @param DOM object
     * @return none
     **/
     
     closeSection: function( obj ) {
        
        // set the target to the list element under the section
        var target = $( obj.siblings( '.list' ) );
        
        // the open/collapse icon on the section title bar
        var icon = obj.find( '.icon' );
        
        // slide up (hide) the list
        target.slideUp();
            
        // update the icon to open icon
        icon.html( '<span class="icon-open"></span>' );
         
     },
     
     /**
     * Open specified table of content section
     *
     * @since 3.1.3
     * @author(s) Ethan Lin
     * @updated on 3/14/2018
     *
     * @param DOM object
     * @return none
     **/
     
     openSection: function( obj ) {
        
        // set the target to the list element under the section
        var target = $( obj.siblings( '.list' ) );
        
        // the open/collapse icon on the section title bar
        var icon = obj.find( '.icon' );
        
        // slide down (show) the list
        target.slideDown();
        
        // update the icon to collapse icon
        icon.html( '<span class="icon-collapse"></span>' );
         
     },
    
    /**
     * Selecting page on the table of contents
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param string or object
     * @return none
     **/
    selectPage: function( e ) {
        
        // if splash screen is visible...
        if ( $( this.splash.screen ).is( ':visible' ) ) {
            
            // render the presentation
            this.renderPresentation();
            
            // hide the splash
            this.hideSplash();
            
            // flag the presentationStarted to true
            this.presentationStarted = true;
            
        }
        
        // if the argument is an click event object
        if ( e instanceof Object ) {
            
            // set target to current click event target
            this.targetPage = $( e.currentTarget );
            
        } else {
            
            // set target to the passed in argument
            this.targetPage = $( '.item[data-page="' + e + '"]' );
            
            // if targe page does not exist
            if ( this.targetPage.length === 0 ) {
                
                // exit function; stop further execution
                return false;
            }
            
        }
        
        // if target page does not have the sb_selected class
        if ( !this.targetPage.hasClass( 'sb_selected' ) ) {
            
            // get jQuery set that contain pages
            var allPages = $( this.tableOfContents.page );
            
            // get jQuery set that contain section headers
            var sectionHeaders = $( this.tableOfContents.header );
            
            // if more than one section headers...
            if ( sectionHeaders.length > 1 ) {
                
                // set the target header to targetted page's header
                var targetHeader = this.targetPage.parent().siblings( '.header' );
                
                // if targetted header does not have the current class
                if ( !targetHeader.hasClass( 'current' ) ) {
                    
                    // remove current class from all section headers
                    sectionHeaders.removeClass( 'current' );
                    
                    // add current class to targetted header
                    targetHeader.addClass( 'current' );
                    
                }
                
                this.openSection( targetHeader );
                
            }
            
            // remove sb_selected class from all pages
            allPages.removeClass( 'sb_selected' );
            
            // add sb_selected class to targetted page
            this.targetPage.addClass( 'sb_selected' );
            
            // call the getPage function with targetted page data as parameter
            this.getPage( this.targetPage.data('page') );
            
            // update the page status with the targetted page count data
            this.updatePageStatus( this.targetPage.data( 'count' ) );
            
            // update screen reader status
            $( this.screenReader.currentPage ).html( this.targetPage.data( 'count' ) );
            
            // update the scroll bar to targeted page
            if ( $( this.layout.sidebar ).is( ':visible' ) ) {
                
                this.updateScroll( this.targetPage[0] );
                
            }
            
        }
        
    }, // end selectPage function
    
    /**
     * Getting page after selected a page
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param string
     * @return none
     **/
    getPage: function ( page ) {
        
        // split the page value into an array
        page = page.split( ',' );
        
        // set section to page array index 0
        var section = page[0];
        
        // set item to page array index 1
        var item = page[1];
        
        // get and set target based on the section and item varible
        var target = $( $( this.xml.sections[section] ).find( 'page' )[item] );
        
        // create a pageData object to hold page title and type
        var pageData = {
            xml: target,
            title: target.attr( 'title' ).trim(),
            type: target.attr( 'type' ).trim().toLowerCase()
        };
        
        // set number property to the pageData object
        pageData.number = page;
        
        // if page type is not quiz
        if ( pageData.type !== 'quiz' ) {
            
            // add/set additional property to the pageData object
            pageData.src = target.attr( 'src' ).trim();
            
            // check for preventAutoplay attribute
            
            if ( target.attr( 'preventAutoplay' ) != undefined ) {
                pageData.preventAutoplay = target.attr( 'preventAutoplay' ).trim();
            } else {
                pageData.preventAutoplay = "false";
            }

            // check for defaultPlayer attribute if it is youtube or vimeo
            if ( target.attr( 'useDefaultPlayer' ) !== undefined ) {
                pageData.useDefaultPlayer = target.attr( 'useDefaultPlayer' ).trim();
            } else {
                pageData.useDefaultPlayer = "true";
            }
            
            // if there is a note tag, set notes
            if ( target.find( 'note' ).length ) {
                
                pageData.notes = this.getTextContent( target.find( 'note' ) );
                
            }
            
            pageData.widget = target.find( 'widget' );

            if ( target.find( 'copyableContent' ).length ) {
                pageData.copyableContent = target.find( 'copyableContent' );
            }

            pageData.frames = target.find( 'frame' );
            pageData.imageFormat = this.xml.settings.imgType;
            pageData.transition = target[0].hasAttribute( 'transition' ) ? 
                target.attr( 'transition' ).trim() : '';
                
            // create new page object using the pageData and set to SBPLUS's
            // currentPage property
            this.currentPage = new Page( pageData );
                
        } else {
            
            this.currentPage = new Page( pageData, target );
            
        }
        
        // get the page media
        this.currentPage.getPageMedia();
        
        // update the page title to the screen reader
        $( this.screenReader.pageTitle ).html( pageData.title );
        
    }, // end getPage function
    
    /**
     * Updating the table of content's scroll bar position
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param object
     * @return none
     **/
    updateScroll: function( obj ) {
        
        // set the obj from the parameter
        var target = obj;
        
        // if the target is not visible
        if ( !$( target ).is( ':visible' ) ) {
            
            // target its parent's siblings
            target = $( target ).parent().siblings( '.header' )[0];
            
        }
        
        if ( $( target ).data( "page" ) == "0,0" ) {
            
            if ( $( target ).parent().prev().length ) {
                
                $( $( target ).parent().prev() )[0].scrollIntoView( { behavior: 'smooth', block: 'end' } );
                
            } else {
                
                target.scrollIntoView( { behavior: 'smooth', block: 'end' } );
                
            }
            
            return;
        }
        
        // get/set the scrollable height
        var scrollHeight = $( this.tableOfContents.container ).height();
        var targetHeight = $( target ).outerHeight();
        var sectionHeaders = $( this.tableOfContents.header );
        var targetTop = $( target ).offset().top - targetHeight;
        
        if ( sectionHeaders.length <= 0 ) {
            targetTop += 40;
        }
        
        if ( targetTop > scrollHeight ) {
            target.scrollIntoView( { behavior: 'smooth', block: 'end' } );
        }
        
        if ( targetTop < targetHeight ) {
            
            target.scrollIntoView( { behavior: 'smooth' } );
            
        }
        
        
        
    }, // end updateScroll function
    
    /**************************************************************************
        MENU FUNCTIONS
    **************************************************************************/
        
    openMenuItem: function( id ) {
        
        if (this.currentPage.mediaPlayer != null) {
            
            if (!this.currentPage.mediaPlayer.paused()) {
                this.currentPage.mediaPlayer.pause();
            }
            
        }
        
        var self = this;
        var itemId = id;
        var content = "";
        var menuContentWrapper = $( this.menu.menuContentWrapper );
        var menuContent = $( this.menu.menuContent );
        var menuTitle = $( this.menu.menuBarTitle );
        
        menuContent.empty();
        
        $( self.menu.menuContentList + ' li' ).removeClass( 'active' );
        $( self.menu.menuContentList + ' .' + itemId ).addClass( 'active' );
        
        switch ( itemId ) {
                    
            case 'sbplus_author_profile':
            
            menuTitle.html( 'Author Profile' );
            
            if ( self.xml.setup.author.length ) {
                
                menuContent.append( '<div class="profileImg"></div>' );
                
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
                
                if ( typeof self.xml.setup.profile !== "object" ) {
                    
                    content = '<p class="name">' + self.xml.setup.author + '</p>';
                    
                } else {
                    
                    content = '<p class="name">' + self.xml.setup.profile.name + '</p>';
                    
                }

                content += self.noScript( self.xml.setup.profile );
                
                
                
            } else {
                content = 'No author profile available.';
            }
            
            break;
            
            case 'sbplus_general_info':
            menuTitle.html( 'General Info' );
            
            if ( self.isEmpty( self.xml.setup.generalInfo ) ) {
                content = 'No general information available.';
            } else {
                content = self.xml.setup.generalInfo;
            }
            
            break;
            
            case 'sbplus_settings':
                
                menuTitle.html( 'Settings' );
                
                if ( Modernizr.localstorage && Modernizr.sessionstorage ) {
                    
                    if ( this.hasStorageItem( 'sbplus-' + self.presentationLoc + '-settings-loaded', true ) === false ) {
                    
                        $.get( self.manifest.sbplus_root_directory + 'scripts/templates/settings.tpl', function( data ) {
                        
                            self.settings = data;
                            self.setStorageItem( 'sbplus-' + self.presentationLoc + '-settings-loaded', 1, true );
                            menuContent.append( data );
                            self.afterSettingsLoaded();
                            
                        } );
                        
                    } else {
                        
                        menuContent.append( self.settings );
                        self.afterSettingsLoaded();
                        
                    }
                    
                } else {
                    
                    content = 'Settings require web browser\'s local storage and session storage support. ';
                    content += 'Your web browser does not support local and session storage or is in private mode.';
                    
                }
                
            break;
            
            default:
                var customMenuItems = self.manifest.sbplus_custom_menu_items;
                for ( var key in customMenuItems ) {
                    var menuId = 'sbplus_' + self.sanitize( customMenuItems[key].name );
                    if ( itemId === menuId ) {
                        menuTitle.html( customMenuItems[key].name );
                        content = customMenuItems[key].content;
                        break;
                    }
                }
            break;
            
        }
        
        menuContentWrapper.show();
        menuContent.append( content );
        
        $( self.button.menuClose ).on( 'click', self.closeMenuContent.bind( self ) );
        
        if ( self.xml.settings.analytics === 'on' || self.xml.settings.analytics === 'true' ) {
            
            ga( 'send', 'screenview', { screenName: menuTitle.html() } );
            
        }
        
        if ( self.xml.settings.mathjax === 'on' || self.xml.settings.mathjax === 'true' ) {
            MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
        }
            
    },
    
    closeMenuContent: function() {
        
        var menuContentWrapper = $( this.menu.menuContentWrapper );
        var menuContent = $( this.menu.menuContent );
        
        menuContent.empty();
        menuContentWrapper.hide();
        
        $( this.button.menuClose ).off( 'click' );
        
    },
    
    burgerBurger: function() {
        
        var menuIcon = $( 'span.menu-icon' );
            
        this.clickCount++;
        
        if ( this.clickCount === this.randomNum ) {
            menuIcon.removeClass('icon-menu').html('🍔');
            this.clickCount = 0;
            this.randomNum = Math.floor((Math.random() * 6) + 5);
        } else {
            menuIcon.addClass('icon-menu').empty();
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
        $( this.button.widget ).find( '.icon-widget-open' ).show();
        $( this.button.widget ).find( '.icon-widget-close' ).hide();
              
        media.css( 'height', '100%');
        media.removeClass( 'widget_on' ).addClass( 'widget_off' );
        
        this.showWidgetContentIndicator();
        
    },
    
    showWidget: function() {
        
        var media = $( this.layout.media );
        
        $( this.layout.widget ).show();
        $( this.button.widget ).find( '.icon-widget-close' ).show();
        $( this.button.widget ).find( '.icon-widget-open' ).hide();
        
        media.css( 'height', '' );
        media.removeClass( 'widget_off' ).addClass( 'widget_on' );
        
        this.hideWidgetContentIndicator()
        
    },
    
    disableWidget: function() {
        $( this.button.widget ).prop( 'disabled', true ).addClass( 'sb_disabled' );
    },
    
    enableWidget: function() {
        $( this.button.widget ).prop( 'disabled', false ).removeClass( 'sb_disabled' );
    },
    
    clearWidget: function() {
        $( this.widget.segment ).empty();
        $( this.widget.content ).empty();
    },
    
    hasWidgetContent: function() {
        
        return $( this.widget.segment ).find( 'button' ).length;
        
    },
    
    showWidgetContentIndicator: function () {
        
        if ( this.hasWidgetContent() ) {
            
            if ( !$( this.layout.widget ).is( ':visible' ) ) {
                
                $( this.button.widget ).addClass( 'showDot' );
                
            }
            
        }
        
    },
    
    hideWidgetContentIndicator: function () {
        
        $( this.button.widget ).removeClass( 'showDot' );
        
    },
    
    selectSegment: function( e ) {
        
        var self = this;
        var button = $( this.widget.segment ).find( 'button' );
        
        if ( self.hasWidgetContent() ) {
            
            self.showWidgetContentIndicator();
            $( self.layout.widget ).removeClass('noSegments');
            $( self.widget.content ).css( 'background-image', '' );
            $( this.screenReader.hasNotes ).html( 'This page contains notes.' );
            
            var target = '';
            var targetId = '';
            
            if ( typeof e === 'string' ) {
                target = $( '#' + e );
                targetId = e;
            } else {
                target = $( e.currentTarget );
                targetId = target[0].id;
            }
            
            if ( !target.hasClass( 'active' ) ) {
                this.currentPage.getWidgetContent( targetId );
                button.removeClass( 'active' );
                target.addClass( 'active' );
            }
            
            if ( this.xml.settings.mathjax === 'on' || this.xml.settings.mathjax === 'true' ) {
                MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
            }
            
        } else {
            
            this.hideWidgetContentIndicator();
            $( this.screenReader.hasNotes ).empty();
            $( this.layout.widget ).addClass('noSegments');

            // show logo
            if ( !self.isEmpty( self.logo ) ) {

                $( self.widget.content ).css( 'background-image', 'url(' + self.logo + ')' );

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
    
    clearWidgetSegment: function() {
        $( this.widget.segment ).empty();
        $( this.widget.content ).empty();
        $( this.widget.bg ).css( 'background-image', '' );
        this.widget.segments = [];
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
        
//         var media = $( this.layout.media );
        var widget = $( this.layout.widget );
        var sidebar = $( this.layout.sidebar );
        var tocWrapper = $( this.tableOfContents.container );
        var widgetBtnTip = $( this.button.widgetTip );
        
/*
        if ( widget.is( ':visible' ) || sidebar.is( ':visible' ) ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        } else {
            media.removeClass( 'non_aspect_ratio' ).addClass( 'aspect_ratio' );
        }
*/
        
        if ( window.innerWidth < 900 || window.screen.width <= 414 ) {
            
            //if ( $( this.layout.wrapper ).hasClass( 'loaded-in-iframe' ) === false ) {

                this.layout.isMobile = true;
                
//                 media.addClass( 'aspect_ratio' );
                
                widgetBtnTip.show();
                
                var adjustedHeight = $( this.layout.leftCol ).height() + $( this.layout.mainControl ).height();
                
                sidebar.css( 'height', 'calc( 100% - ' + adjustedHeight + 'px )'  );
                widget.css( 'height', sidebar.height() );
                tocWrapper.css( 'height', sidebar.height() - 30 );
                
            //}
            
            if ( this.alreadyResized === false ) {
                this.hideWidget();
            }
            
            this.alreadyResized = true;
            
            $( this.layout.wrapper ).removeClass( 'sbplus_boxed' );
            
        } else {
            
            this.layout.isMobile = false;
            
            sidebar.css( 'height', '' );
            
/*
            if ( !widget.is( ':visible' ) ) {
                widget.css( 'height', '100%' );
            } else {
                widget.css( 'height', '' );
            }
*/
            
            widget.css( 'height', '' );
            
            tocWrapper.css( 'height', '' );
            widgetBtnTip.hide();
            
            if ( this.getUrlParam( 'fullview' ) !== '1' ) {
                $( this.layout.wrapper ).addClass( 'sbplus_boxed' );
            }

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
    
    trimAndLower: function (str) {
        return str.trim().toLowerCase();
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

        hex = parseInt( hex.slice( 1 ), 15 );
        return hex > 0xffffff / 2 ? '#000' : '#fff';
        
    },
    
    noScript: function( str ) {
        
        if ( str !== "" || str !== undefined ) {

           var results = $( "<span>" +  $.trim( str ) + "</span>" );
    
           results.find( "script,noscript,style" ).remove().end();
           
           return results.html();
    
       }
    
       return str;
        
    },
    
    noCDATA: function( str ) {
        
        if ( str === undefined || str === '' ) {
            return '';
        }
        
        return str.replace(/<!\[CDATA\[/g, '').replace( /\]\]>/g, '').trim();
        
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
        
        var urlArray = this.getUrlArray();
        
        if ( urlArray.length >= 3 ) {
            return urlArray[urlArray.length - 3];
        } else if ( urlArray.length === 2 ) {
            return urlArray[0];
        }
        
        return '';
        
    },
    
    getCourseDirectory: function() {
        
        var urlArray = this.getUrlArray();
        
        if ( urlArray.length >= 2 ) {
            return urlArray[urlArray.length - 1];
        }
        
        return 'default';
        
    },
    
    getUrlArray: function() {
        
        var href = window.location.href;
        var url = href;
        
        if ( href.indexOf('?') ) {
            href = href.split( '?' );
            url = href[0];
        }
        
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
        
        if ( Modernizr.localstorage || Modernizr.sessionstorage ) {
            
            if ( toSession ) {
            
                sessionStorage.setItem( key, value );
                
            } else {
                
                localStorage.setItem( key, value );
                
            }
            
        }
        
    },
    
    getStorageItem: function( key, fromSession ) {
        
        if ( Modernizr.localstorage || Modernizr.sessionstorage ) {
            
            if ( fromSession ) {
            
                return sessionStorage.getItem( key );
                
            } else {
                
                return localStorage.getItem( key );
                
            }
            
        }
        
    },
    
    deleteStorageItem: function( key, fromSession ) {
        
        if ( Modernizr.localstorage || Modernizr.sessionstorage ) {
            
            if ( fromSession ) {
            
                return sessionStorage.removeItem( key );
                
            } else {
                
                return localStorage.removeItem( key );
                
            }
            
        }
        
    },
    
    hasStorageItem: function( key, fromSession ) {
        
        if ( Modernizr.localstorage || Modernizr.sessionstorage ) {
            
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
            
        }
        
    },
    
    removeAllSessionStorage: function() {
        
        if ( Modernizr.sessionstorage ) {
            
            return sessionStorage.clear();
            
        }
        
    },
    
    getTextContent: function( obj ) {
        
        var str = obj.html();
        
        if ( str === undefined ) {
            
            if ( !this.isEmpty( obj[0].textContent ) ) {
            
                var div = document.createElement('div');
                div.appendChild(obj[0]);
                
                var fcNodePatternOpen = new RegExp('<' + div.firstChild.nodeName + '?\\s*([A-Za-z]*=")*[A-Za-z\\s]*"*>', 'gi');
                var fcNodePatternClose = new RegExp('</' + div.firstChild.nodeName + '>', 'gi');
                
                str = div.innerHTML;
                
                str = str.replace( fcNodePatternOpen, '' )
                      .replace( fcNodePatternClose, '' )
                      .replace( /&lt;/g, '<')
                      .replace( /&gt;/g, '>').trim();
                
            } else {
                
                return '';
                
            }
            
        }
        
        return this.noScript( this.noCDATA( str ) );
        
    },
    
    isIOSDevice: function() {
        
        if ( navigator.userAgent.match(/iPhone/i) 
        || navigator.userAgent.match(/iPod/i) ) {
            
            return true;
            
        }
        
        return false;
        
    },
    
    afterSettingsLoaded: function() {
        
        var self = this;
        
        if ( self.getStorageItem( 'sbplus-' + self.presentationLoc + '-settings-loaded', true ) === '1' ) {
            
            if ( self.isIOSDevice() ) {
                    
                $( '#autoplay_label' ).after( '<p class="error">Mobile devices do not support autoplay.</p>' );
                $( '#sbplus_va_autoplay' ).prop( 'checked', false ).attr( 'disabled', true );
                
            }
            
            self.syncSettings();
            
            $( '.settings input, .settings select' ).on( 'change', function() {
                
                // show msg
                $( self.menu.menuSavingMsg ).fadeIn().html( 'Saving...' );
                
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
/*
                if ( $( '#sbplus_gs_it' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-disable-it', 1 );
                } else {
                    self.setStorageItem( 'sbplus-disable-it', 0 );
                }
*/
                
                // autoplay
                if ( $( '#sbplus_va_autoplay' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-autoplay', 1 );
                    $( self.layout.wrapper ).addClass( 'sbplus_autoplay_on' );
                } else {
                    self.setStorageItem( 'sbplus-autoplay', 0 );
                    $( self.layout.wrapper ).removeClass( 'sbplus_autoplay_on' );
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
                    self.setStorageItem( 'sbplus-' + self.presentationLoc + '-volume-temp', vol / 100, true );
                    
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
                    'sbplus-' + self.presentationLoc + '-playbackrate-temp',
                    $( '#sbplus_va_playbackrate option:selected' ).val(),
                    true
                );
                
                // show msg
                $( self.menu.menuSavingMsg ).html( 'Settings saved!' );
                
                setTimeout( function() {
                    
                    $( self.menu.menuSavingMsg ).fadeOut( 'slow', function() {
                        $( this ).empty();
                    } );
                    
                }, 1500 );
                
            });
            
        }
            
    },
    
    syncSettings: function() {
        
        var self = this;
        
        if ( self.getStorageItem( 'sbplus-' + self.presentationLoc + '-settings-loaded', true ) === '1' ) {
            
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
            
            if ( self.isIOSDevice() === false ) {
                
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
        
    },
    
    sendToGA: function( category, action, label, value, delayObj ) {
        
        if ( this.xml.settings.analytics === 'on' ) {
            
            var self = this;
            var delay = 0;
            var isObj = false;
            
            if ( typeof delayObj === 'object' ) {
                delay = delayObj.start * 1000;
                isObj = true;
            } else {
                delay = delayObj * 1000;
            }
            
            if ( window.ga && ga.loaded ) {
                
                self.gaTimeouts.start = setTimeout( function() {
                    
                    ga( 'send', 'event', category, action, label, value, {screenName: self.getCourseDirectory()} );
                    
                }, delay );
                
                if ( isObj ) {
                    
                    if ( delayObj.halfway > 0 
                         && delayObj.halfway > delayObj.start ) {
                        
                        self.gaTimeouts.halfway = setTimeout( function() {
                    
                            ga( 'send', 'event', category, 'halfway', label, 2, {screenName: self.getCourseDirectory()} );
                            
                        }, delayObj.halfway * 1000 );
                        
                    }
                    
                    if ( delayObj.completed > 0 
                         && delayObj.completed > delayObj.halfway ) {
                        
                        self.gaTimeouts.completed = setTimeout( function() {
                    
                            ga( 'send', 'event', category, 'completed', label, 3, {screenName: self.getCourseDirectory()} );
                            
                        }, delayObj.completed * 1000 );
                        
                    }
                    
                }

            }
            
        }
        
    },
    
    clearGATimeout: function() {
        
        if ( this.xml.settings.analytics === 'on' ) {
            
            var self = this;
            
            if ( self.gaTimeouts.start !== null ) {
                clearTimeout( self.gaTimeouts.start );
            }
            
            if ( self.gaTimeouts.halfway !== null ) {
                clearTimeout( self.gaTimeouts.halfway );
            }
            
            if ( self.gaTimeouts.completed !== null ) {
                clearTimeout( self.gaTimeouts.completed );
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





