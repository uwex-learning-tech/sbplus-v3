/*
 * Storybook Plus
 *
 * @author: Ethan Lin
 * @url: https://github.com/uwex-learning-tech/sbplus_v3
 * @version: 3.3.3
 * Released 11/29/2021
 *
 * @license: GNU GENERAL PUBLIC LICENSE v3
 *
    Storybook Plus is an web application that serves multimedia contents.
    Copyright (C) 2013-2021  Ethan S. Lin, Learning Technology & Media, University
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

var worker;
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

        // add loaded-in-iframe class if loaded in an iframe
        if ( window.self !== window.top ) {
            $( self.layout.wrapper ).addClass( 'loaded-in-iframe' );
        }
        
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
                if ( self.trimAndLower( xSb.attr( 'mathjax' ) ) === 'on' || self.trimAndLower( xSb.attr( 'mathjax' ) ) === 'true' ) {
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
                    
                    //self.downloads[fileLabel] = this.url;
                    self.downloads[fileLabel] = { 'fileName': fileName, 'fileFormat': file.format, 'url': this.url };
                    
                    $( self.splash.downloadBar ).append(
                        '<a href="' + this.url + '" tabindex="1" download="' + fileName + '.' + file.format + '" aria-label="Download ' + fileLabel + ' file" onclick="SBPLUS.sendToGA( \'' + fileLabel + 'Link\', \'click\', \'' + fileName + '\', 4, 0 );"><span class="icon-download"></span> ' + file.label + '</a>' );
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
        worker = new Worker( self.manifest.sbplus_root_directory + 'scripts/preload.js' );
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

            e.data.forEach( function( image ) {
                
/*
                let imgObj = document.createElement( "img" );
                
                imgObj.src = paths.pages + image;
                imgObj.setAttribute( 'aria-hidden', true );
                imgObj.style = "position: fixed; width: 1px; height: 1px; opacity: 0;";
                
                document.getElementsByTagName( "body" )[0].appendChild( imgObj );
*/

                let linkObj = document.createElement( 'link' );
                linkObj.rel = "prefetch";
                linkObj.href = paths.pages + image;
                linkObj.setAttribute( 'aria-hidden', true );
                linkObj.style = "position: fixed; width: 1px; height: 1px; opacity: 0;";
                document.getElementsByTagName( "body" )[0].appendChild( linkObj );
                
                
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
                    
                    if ( self.downloads[key] != undefined ) {
                        $( self.button.downloadMenu ).append(
                            '<li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite"><a download="' + self.downloads[key].fileName + '.' + self.downloads[key].fileFormat + '" href="'
                            + self.downloads[key].url +
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
        
        if ( (/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
        !window.MSStream ) {
            
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
        
        if ( this.xml.settings.analytics === 'on' || this.xml.settings.analytics === 'true' ) {
            
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







// var transcriptInterval = null;
var Page = function ( obj, data ) {
    
    this.pageXML = obj.xml[0];
    this.pageData = data;
    this.title = obj.title;
    this.type = obj.type;
    this.transition = obj.transition;
    this.pageNumber = obj.number;
    
    // google analytic variables
    this.gaEventCate = '';
    this.gaEventLabel = '';
    this.gaEventAction = '';
    this.gaEventValue = -1;
    this.gaEventHalfway = false;
    this.gaDelays = {
        start: 0,
        halfway: 0,
        completed: 0
    }; 
    
    if ( obj.type !== 'quiz' ) {
        
        this.src = obj.src;
        this.preventAutoplay = obj.preventAutoplay;
        this.useDefaultPlayer = obj.useDefaultPlayer;
        this.notes = obj.notes;
        this.widget = obj.widget;
        this.widgetSegments = {};
        this.copyableContent = obj.copyableContent;
        this.imgType = obj.imageFormat;
        
        if ( obj.frames.length ) {
            this.frames = obj.frames;
            this.cuepoints = [];
        }
        
        this.mediaPlayer = null;
        this.isKaltura = null;
        this.isAudio = false;
        this.isVideo = false;
        this.isYoutube = false;
        this.isVimeo = false;
        this.isBundle = false;
        this.isPlaying = false;
        this.captionUrl = '';
        
        this.transcript = null;
        this.transcriptLoaded = false;
        
        this.hasImage = false;
        this.missingImgUrl = '';
        this.delayStorage = null;
        
    }
    
    this.root = SBPLUS.manifest.sbplus_root_directory;
    this.kaltura = {
        id: SBPLUS.manifest.sbplus_kaltura.id,
        flavors: {
            low: SBPLUS.manifest.sbplus_kaltura.low,
            normal: SBPLUS.manifest.sbplus_kaltura.normal,
            medium: SBPLUS.manifest.sbplus_kaltura.medium
        }
    };
    this.kalturaSrc = {};
    
    this.leftCol = SBPLUS.layout.leftCol;
    this.mediaContent = SBPLUS.layout.mediaContent;
    this.quizContainer = SBPLUS.layout.quizContainer;
    this.mediaError = SBPLUS.layout.mediaError;
    
};

Page.prototype.getPageMedia = function() {
    
    var self = this;
    
    // reset
    if ( $( SBPLUS.layout.quizContainer ).length ) {
        $( SBPLUS.layout.quizContainer ).remove();
    }
    
    $( self.mediaContent ).css('backgroundImage', '').removeClass('compat-object-fit').removeClass( 'show-vjs-poster' );
    
    $( this.mediaError ).empty().hide();
    
    if ( $( '#mp' ).length ) {
        videojs( 'mp' ).dispose();
    }
    
    SBPLUS.clearWidget();
    SBPLUS.enableWidget();
    
    $( self.mediaContent ).removeClass( 'iframeEmbed' ).empty();
    
    if ( SBPLUS.hasStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-previously-widget-open', true ) ) {
        
        if ( SBPLUS.getStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-previously-widget-open', true ) === '1' ) {
            
            SBPLUS.showWidget();
            
        }
        
        SBPLUS.deleteStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-previously-widget-open', true );
        
    }
    
    self.gaEventHalfway = false;
    SBPLUS.clearGATimeout();
    
    $(SBPLUS.layout.mediaMsg).addClass( 'hide' ).html('');
    
    // show copy to clipboard button if applicable
    self.showCopyBtn();
    
    // clearInterval( transcriptInterval );
    
    // end reset
    
    switch ( self.type ) {
        
        case 'kaltura':

            if ( SBPLUS.kalturaLoaded === false ) {

                $.getScript( self.root + 'scripts/libs/kaltura/mwembedloader.js', function() {

                    $.getScript( self.root +  'scripts/libs/kaltura/kwidgetgetsources.js', function() {

                        SBPLUS.kalturaLoaded = true;
                        self.loadKalturaVideoData();

                    });

                });

            } else {
                self.loadKalturaVideoData();
            }

            // var formData = new FormData();
            // formData.append( 'authorization', self.kaltura.auth );
            // formData.append( 'entryId', self.src );

            // var http = new XMLHttpRequest();
            // http.open('POST', self.kaltura.api, true);

            // http.onreadystatechange = function() {

            //     if ( this.readyState === XMLHttpRequest.DONE && this.status === 200 ) {
            //         self.kalturaSrc = JSON.parse( this.response );
            //         self.loadKalturaVideoData();
            //     }

            // }

            // http.send(formData);

            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':kaltura:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
            
        break;
        
        case 'image-audio':
            
            self.isAudio = true;
            
            $.ajax( {
                
                url: 'assets/pages/' + self.src + '.' + self.imgType,
                type: 'HEAD'
                
            } ).done( function() {
                
                self.hasImage = true;
                
            } ).fail( function() {
                
                self.showPageError( 'NO_IMG', this.url );
                self.missingImgUrl = this.url;
                
            } ).always( function() {
                
                $.ajax( {
                    
                    url: 'assets/audio/' + self.src + '.vtt',
                    type: 'HEAD'
                    
                } ).done( function( data ) {
                    
                    self.captionUrl = this.url;
                    self.transcript = SBPLUS.noScript( data );
                    
                } ).always( function() {
                    
                    var html = '<video id="mp" class="video-js vjs-default-skin"></video>';
                    
                    //if ( ! Modernizr.objectfit ) {
                        $( self.mediaContent ).addClass( 'show-vjs-poster' );
                    //}
                    
                    $( self.mediaContent ).html( html ).promise().done( function() {
                
                        self.renderVideoJS();
                        self.setWidgets();
                
                    } );
                    
                } );
                
            } );
            
            self.gaEventCate = 'Audio';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':audio:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 2;
            self.gaDelays.start = 6;
            
        break;
        
        case 'image':
            
            var img = new Image();
            img.src = 'assets/pages/' + self.src + '.' + self.imgType;
            img.alt = self.title;
            
            $( img ).on( 'load', function() {
                
                self.hasImage = true;
                
                if ( ! Modernizr.objectfit ) {
                  $('.sbplus_media_content').each(function () {
                    var $container = $(this),
                        imgUrl = $container.find('img').prop('src');
                    if (imgUrl) {
                      $container
                        .css('backgroundImage', 'url(' + imgUrl + ')')
                        .addClass('compat-object-fit');
                    }  
                  });
                }
                
                
            } );
            
            $( img ).on( 'error', function() {
                self.hasImage = false;
                self.showPageError( 'NO_IMG', img.src );
            } );
            
            $( self.mediaContent ).html( '<img src="' + img.src + '" class="img_only" alt="' + img.alt + '" />' ).promise().done( function() {
                self.setWidgets();
            } );
            
            self.gaEventCate = 'Image';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':image:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 4;
            self.gaDelays.start = 10;
            self.gaDelays.halfway = 30;
            self.gaDelays.completed = 60;
                        
        break;
        
        case 'video':
            
            $.ajax( {
                
                url: 'assets/video/' + self.src + '.vtt',
                type: 'HEAD'
                
            } ).done( function( data ) {
                
                self.captionUrl = this.url;
                self.transcript = SBPLUS.noScript( data );
                
            } ).always( function() {
                
                var html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>';
                
                $( self.mediaContent ).html( html ).promise().done( function() {
                    
                    // call video js
                    self.isVideo = true;
                    self.renderVideoJS();
                    self.setWidgets();
                    
                } );
                
            } );
            
            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':video:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
        
        break;
        
        case 'youtube':
            
            self.isYoutube = true;
            
            if ( self.useDefaultPlayer === "true" || self.useDefaultPlayer === "yes"  ) {
                
                $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin"></video>' ).promise().done( function() {

                    self.renderVideoJS();
                    
                } );

            } else {
                
                var autoplay = 
                    self.preventAutoplay === "false" || self.preventAutoplay === "no" ? 1 : 0;

                $( self.mediaContent ).html( '<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/' + self.src + '?autoplay=' + autoplay + '&playsinline=1&modestbranding=1&disablekb=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>' );

            }
            
            self.setWidgets();

            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':youtube:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
            
        break;
        
        case 'vimeo':

            $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin"></video>' ).promise().done( function() {
                
                self.isVimeo = true;
                self.renderVideoJS();
                self.setWidgets();
                
            } );

            self.gaEventCate = 'Video';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':vimeo:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 3;
            self.gaDelays.start = 6;
            
        break;
        
        case 'bundle':
            
            $( self.frames ).each( function() {
                var cue = toSeconds( $( this ).attr( 'start' ) );
                self.cuepoints.push( cue );
            } );
            
            $.ajax( {
                
                url: 'assets/audio/' + self.src + '.vtt',
                type: 'HEAD'
                
            } ).done( function( data ) {
                
                self.captionUrl = this.url;
                self.transcript = SBPLUS.noScript( data );
                
            } ).always( function() {
                
                var html = '<video id="mp" class="video-js vjs-default-skin"></video>';
                $( self.mediaContent ).addClass( 'show-vjs-poster' );
                
                $( self.mediaContent ).html( html ).promise().done( function() {
            
                    self.isBundle = true;
                    self.renderVideoJS();
                    self.setWidgets();
            
                } );
                
            } );
            
            self.gaEventCate = 'Audio';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':bundle:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 2;
            self.gaDelays.start = 6;
            
        break;
        
        case 'quiz':
            
            $( self.leftCol ).append( '<div id="sbplus_quiz_wrapper"></div>' )
                .promise().done( function() {
            
                    var qObj = {
                        id: self.pageNumber
                    };
                    
                    var quizItem = new Quiz( qObj, self.pageData  );
                    quizItem.getQuiz();
                    
                    if ( $( '#sbplus_widget' ).is( ':visible' ) ) {
                        SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-previously-widget-open', 1, true );
                    }
                    
                    SBPLUS.hideWidget();
                    SBPLUS.disableWidget();

            } );
            
            self.gaEventCate = 'Quiz';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':quiz:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 5;
            self.gaDelays.start = 10;
            self.gaDelays.halfway = 30;
            
        break;
        
        case 'html':
            
            var embed = false;
            var audioSrc = false;
            var path = self.src;
                
            if ( !isUrl(path) ) {
                path = 'assets/html/' + self.src;
            }
            
            if ( $(self.pageXML).attr('embed') !== undefined ) {
                embed = $(self.pageXML).attr('embed').toLowerCase();
            }
            
            if ( $(self.pageXML).find('audio').length >= 1 ) {
                audioSrc = $($(self.pageXML).find('audio')[0]).attr('src').toLowerCase();
            }
            
            if ( embed === 'yes' || embed === "true" ) {
                
                var iframe = '<iframe id="iframeWithAudio" class="html" src="' + path + '"></iframe>';
                
                $( self.mediaContent ).addClass( 'iframeEmbed' );

                if ( audioSrc.length ) {

                    var audio = '<video id="mp" class="video-js vjs-default-skin"></video>';

                    self.isAudio = true;
                    $( self.mediaContent ).append( audio );
                    self.renderVideoJS( audioSrc );
                    $( '.video-js' ).prepend( iframe );

                } else {

                    $( self.mediaContent ).html( iframe );

                }
                
            } else {
                
               var holder = '<div class="html exLink">';
               holder += '<small>click the link to open it in a new tab/window</small>';
               holder += '<a href="' + path + '" target="_blank">' + path + '</a>';
               holder += '</div>'
               
               $( self.mediaContent ).addClass( 'html' ).html( holder );
               window.open(path, '_blank');
               
            }
            
            self.setWidgets();
            
            self.gaEventCate = 'HTML';
            self.gaEventLabel = SBPLUS.getCourseDirectory() + ':html:page' + SBPLUS.targetPage.data('count');
            self.gaEventAction = 'start';
            self.gaEventValue = 6;
            self.gaDelays.start = 10;
            self.gaDelays.halfway = 30;
            self.gaDelays.completed = 60;
            
        break;
        
        default:
            self.showPageError( 'UNKNOWN_TYPE', self.type);
            self.setWidgets();
        break;
        
    }
    
    if ( self.type === 'image' || self.type === 'html' ) {
        
        $( self.mediaContent ).addClass( self.transition )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', function() {
                $( this ).removeClass( self.transition );
                $( this ).off();
            }
        );
        
    }
    
    // add current page index to local storage
    
    window.clearTimeout( self.delayStorage );
    
    self.delayStorage = window.setTimeout( function() {
        
        var presentation = SBPLUS.sanitize( SBPLUS.getCourseDirectory() );
        
        var pSectionNumber = self.pageNumber[0] + ',' + self.pageNumber[1];
        
        if ( pSectionNumber !== '0,0' ) {
            SBPLUS.setStorageItem( 'sbplus-' + presentation, pSectionNumber );
        } else {
            SBPLUS.deleteStorageItem( 'sbplus-' + presentation );
        }
        
    }, 3000 );
    
    // send event to Google Analytics
    if ( self.gaEventCate !== '' ) {
        
        SBPLUS.sendToGA( self.gaEventCate, self.gaEventAction,
                         self.gaEventLabel, self.gaEventValue,
                         self.gaDelays );
        
    }
    
};

// add Copy to clipboard button
Page.prototype.showCopyBtn = function() {
    
    // clear it first
    this.removeCopyBtn();

    if ( this.copyableContent ) {

        // build the button
        const copyBtn = document.createElement( 'button' );
        copyBtn.id = 'copyToCbBtn';

        const copyBtnTxt = document.createElement( 'span' );
        copyBtnTxt.classList.add( 'btn-txt' );
        
        if ( !SBPLUS.isEmpty( $(this.copyableContent).attr( 'name' ) ) ) {
            copyBtnTxt.innerHTML = $(this.copyableContent).attr( 'name' );
        } else {
            copyBtnTxt.innerHTML = 'Copy to Clipboard';
        }

        copyBtn.append( copyBtnTxt );

        const copyTxtArea = document.createElement( 'textarea' );
        copyTxtArea.id = 'copyableTxt';
        copyTxtArea.readOnly = true;
        copyTxtArea.innerHTML = this.copyableContent[0].textContent;
        copyTxtArea.setAttribute( 'aria-hidden', true );

        $( SBPLUS.layout.media ).prepend( copyBtn );
        $( SBPLUS.layout.media ).prepend( copyTxtArea );
        $( SBPLUS.layout.media ).on( 'click', '#copyToCbBtn', copyToClipboard );

    }

};

Page.prototype.removeCopyBtn = function() {

    const copyBtn = document.getElementById( 'copyToCbBtn' );
    const copyTxtArea = document.getElementById( 'copyableTxt' );

    if ( copyBtn && copyTxtArea ) {
        copyBtn.parentNode.removeChild( copyBtn );
        copyTxtArea.parentNode.removeChild( copyTxtArea );
        $( SBPLUS.layout.media ).off( 'click', '#copyToCbBtn', copyToClipboard );
    }

};

function copyToClipboard() {

    const copyBtn = document.getElementById( 'copyToCbBtn' );
    const copyBtnTxt = copyBtn.querySelectorAll( '.btn-txt' )[0];
    const copyTxtArea = document.getElementById( 'copyableTxt' );
    const originalCopyBtnTxt = copyBtn.innerHTML;
    
    if ( copyBtn && copyTxtArea ) {

        copyTxtArea.select();
        document.execCommand( 'copy' );

        copyBtn.focus();
        copyBtnTxt.innerHTML = "Copied";

        setTimeout( function() {
            copyBtnTxt.innerHTML = originalCopyBtnTxt;
        }, 3000 );

    }

}

// kaltura api request
Page.prototype.loadKalturaVideoData = function () {
    
    var self = this;

    self.isKaltura = {
        
        flavors: {},
        status: {
            entry: 0,
            low: 0,
            normal: 0,
            medium: 0
        },
        duration: ''
        
    };

    kWidget.getSources( {

        'partnerId': self.kaltura.id,
        'entryId': self.src,
        'callback': function( data ) {

            var captions = data.caption;

            self.isKaltura.status.entry = data.status;
            self.isKaltura.duration = data.duration;
            self.isKaltura.poster = data.poster;

            for( var i in data.sources ) {

                var source = data.sources[i];
    
                if ( source.flavorParamsId === self.kaltura.flavors.low ) {
                    
                    self.isKaltura.flavors.low = source.src;
                    self.isKaltura.status.low = source.status;
    
                }
    
                if ( source.flavorParamsId === self.kaltura.flavors.normal ) {
    
                    self.isKaltura.flavors.normal = source.src;
                    self.isKaltura.status.normal = source.status;
    
                }
    
                if ( source.flavorParamsId === self.kaltura.flavors.medium ) {
    
                    self.isKaltura.flavors.medium = source.src;
                    self.isKaltura.status.medium = source.status;
    
                }
    
            }

            // entry video
            if ( self.isKaltura.status.entry >= 1 && self.isKaltura.status.entry <= 2 ) {

                // entry video
                if ( self.isKaltura.status.entry >= 1 && self.isKaltura.status.entry <= 2 ) {
                        
                    // flavor videos
                    // if ( self.isKaltura.status.low === 2 && (self.isKaltura.status.normal === 2 || self.isKaltura.status.normal === 4 )
                    // && self.isKaltura.status.medium === 2 )
                    if ( self.isKaltura.status.normal === 2 || self.isKaltura.status.normal === 4 ) {
                    
                        if ( captions !== null ) {

                            self.captionUrl = [];

                            captions.forEach( caption => {

                                if ( caption.label.toLowerCase() != "English (autocaption)" ) {

                                    self.captionUrl.push( {
                                        kinds: 'captions',
                                        language: caption.languageCode,
                                        label: caption.language,
                                        url: 'https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId=' + caption.id + '&segmentDuration=' + self.isKaltura.duration + '&segmentIndex=1'
                                    } );

                                }
                                
                            } );

                        }
                        
                        var html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>';
                    
                        $( self.mediaContent ).html( html ).promise().done( function() {
                            
                            // call video js
                            self.renderVideoJS();
                            
                        } );
                        
                        
                    } else {
                        self.showPageError( 'KAL_NOT_READY' );
                    }
                        
                } else {
                    self.showPageError( 'KAL_ENTRY_NOT_READY' );
                }

                self.setWidgets();

            }

        }

    } );
    // if ( self.kalturaSrc ) {

    //     self.isKaltura.duration = self.kalturaSrc.duration;
    //     self.isKaltura.status.entry = self.kalturaSrc.status;
    //     self.isKaltura.poster = self.kalturaSrc.thumbnail;

    //     for( var i in self.kalturaSrc.sources ) {

    //         var source = self.kalturaSrc.sources[i];

    //         if ( source.flavorParamsId === self.kaltura.flavors.low ) {
                
    //             self.isKaltura.flavors.low = source.src;
    //             self.isKaltura.status.low = source.status;

    //         }

    //         if ( source.flavorParamsId === self.kaltura.flavors.normal ) {

    //             self.isKaltura.flavors.normal = source.src;
    //             self.isKaltura.status.normal = source.status;

    //         }

    //         if ( source.flavorParamsId === self.kaltura.flavors.medium ) {

    //             self.isKaltura.flavors.medium = source.src;
    //             self.isKaltura.status.medium = source.status;

    //         }

    //     }

    //     // entry video
    //     if ( self.isKaltura.status.entry >= 1 && self.isKaltura.status.entry <= 2 ) {
                
    //         // flavor videos
    //         if ( self.isKaltura.status.low === 2 && (self.isKaltura.status.normal === 2 || self.isKaltura.status.normal === 4 )
    //         && self.isKaltura.status.medium === 2 ) {
            
    //             if ( self.kalturaSrc.captions && self.kalturaSrc.captions[0] && self.kalturaSrc.captions[0].captionID !== null ) {
    //                 self.captionUrl = self.kalturaSrc.captions[0].captionWebVTTURL;
    //             }
                
    //             html = '<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>';
            
    //             $( self.mediaContent ).html( html ).promise().done( function() {
                    
    //                 // call video js
    //                 self.renderVideoJS();
    //                 self.setWidgets();
                    
    //             } );
                
                
    //         } else {
    //             self.showPageError( 'KAL_NOT_READY' );
    //         }
                
    //     } else {
    //         self.showPageError( 'KAL_ENTRY_NOT_READY' );
    //     }

    // }
    
};

// render videojs
Page.prototype.renderVideoJS = function( src ) {
    
    var self = this;
    
    var ka = {
        play: false,
        replay: false,
        playReached25: false,
        playReached50: false,
        playReached75: false,
        playReached100: false
    }
    
    src = typeof src !== 'undefined' ? src : self.src;

    var isAutoplay = true;
    
    if ( SBPLUS.getStorageItem( 'sbplus-autoplay' ) === '0' ) {
        isAutoplay = false;
    }
    
    if ( self.preventAutoplay === "true" ) {
        
        isAutoplay = false;
        $( SBPLUS.layout.wrapper ).addClass( 'preventAutoplay' ); 
        
    } else {
        $( SBPLUS.layout.wrapper ).removeClass( 'preventAutoplay' ); 
    }
    
    var options = {
        
        techOrder: ['html5'],
        controls: true,
        autoplay: isAutoplay,
        preload: "auto",
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
            fullscreenToggle: false
        },
        plugins: {
            replayButton: true
        }

    };
    
    // autoplay is off for iPhone or iPod
    if( SBPLUS.isIOSDevice() ) {
        options.autoplay = false;
        options.playsinline = true;
        options.nativeControlsForTouch = false;
    }
    
    // set tech order and plugins
    if ( self.isKaltura ) {
        
        $.extend( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );
        
    } else if ( self.isYoutube ) {
        
        options.techOrder = ['youtube'];
        options.sources = [{ type: "video/youtube", src: "https://www.youtube.com/watch?v=" + src + "&modestbranding=1" }];
        options.playbackRates = null;
        
        $.extend( options.plugins, { videoJsResolutionSwitcher: { 'default': 720 } } );

    } else if ( self.isVimeo ) {
        
        options.techOrder = ["vimeo"];
        options.sources = [{ type: "video/vimeo", src: "https://vimeo.com/" + src }];
        options.playbackRates = null;
        //options.controls = false;
        
    }
    
    self.mediaPlayer = videojs( 'mp', options, function() {
        
        var player = this;
        
        if ( self.isKaltura ) {
            
            if ( isAutoplay === false ) {
                player.poster( self.isKaltura.poster + '/width/900/quality/100' );
            }
            
            player.updateSrc( [
			
    			{ src: self.isKaltura.flavors.low, type: "video/mp4", label: "low", res: 360 },
    			{ src: self.isKaltura.flavors.normal, type: "video/mp4", label: "normal", res: 720 },
    			{ src: self.isKaltura.flavors.medium, type: "video/mp4", label: "medium", res: 640 }
    			
    		] );
            
        }
        
        if ( self.isAudio || self.isBundle ) {
            
            if ( self.isAudio && self.hasImage ) {
                player.poster( 'assets/pages/' + src + '.' + self.imgType );
            }
            
            if ( self.isBundle ) {
                
                var srcDuration = 0;
                var pageImage = new Image();
                
                player.on( 'loadedmetadata', function() {
                    
                    srcDuration = Math.floor( player.duration() );
                    
                } );
                
                player.cuepoints();
                player.addCuepoint( {
                    	
                	namespace: src + '-1',
                	start: 0,
                	end: self.cuepoints[0],
                	onStart: function() {
                    	
                    	pageImage.src = 'assets/pages/' + src + '-1.' + self.imgType;
                    	$('.vjs-poster')[0].innerHTML = "<img src=" + pageImage.src + " />";
                    	player.poster( pageImage.src );
                    	
                	},
                	onEnd: function() {
                    	
                	},
                	params: ''
                	
            	} );
                
                $.each( self.cuepoints, function( i ) {
            
                    var endCue;
                    
                    if ( self.cuepoints[i+1] === undefined ) {
                        endCue = srcDuration;
                    } else {
                        endCue = self.cuepoints[i+1];
                    }
                    
                    player.addCuepoint( {
                        namespace: src + '-' + ( i + 2 ),
                        start: self.cuepoints[i],
                        end: endCue,
                        onStart: function() {
                            
                            pageImage.src = 'assets/pages/' + src + '-' + ( i + 2 )  + '.' + self.imgType;
                    	    
                            $( pageImage ).on( 'error', function() {
                                self.showPageError( 'NO_IMG', pageImage.src );
                            } );
                            
                            var imageEl = $('.vjs-poster')[0];
                            
                            var img = document.createElement('img');
                            
                            img.src = pageImage.src;
                            
                            $( imageEl ).append( img );
                            $( img ).hide().fadeIn(250);
                            
                            player.poster( pageImage.src );
                            
                        }
                    } );
                    
                } );
                
                player.on('seeking', function() {
                    
                    $('.vjs-poster')[0].innerHTML = "";
                    
                    	
                	if ( player.currentTime() <= self.cuepoints[0] ) {
                    	
                    	player.poster( 'assets/pages/' + src + '-1.' + self.imgType );
                    	
                	}
                	
            	} );
                
            }
            
            player.src( { type: 'audio/mp3', src: 'assets/audio/' + src + '.mp3' } );
            
        }
        
        if ( self.isVideo ) {
            player.src( { type: 'video/mp4', src: 'assets/video/' + src + '.mp4' } );
        }
        
        // add caption

        if ( self.isKaltura ) {

            if ( self.captionUrl.length ) {

                self.captionUrl.forEach( caption => {
    
                    player.addRemoteTextTrack( {
                        kind: caption.kind,
                        language: caption.language,
                        label: caption.label,
                        src: caption.url
                    }, true );
    
                } );
    
            }

        } else {

            if ( self.captionUrl ) {

                player.addRemoteTextTrack( {
                    kind: 'captions',
                    language: 'en',
                    label: 'English',
                    src: self.captionUrl
                }, true );
                
            }
        }

        if ( self.isYoutube && self.useDefaultPlayer ) {

            $.ajax( {
                    
                url: 'assets/video/yt-' + src + '.vtt',
                type: 'HEAD'
                
            } ).done( function() {
                
                player.addRemoteTextTrack( {
                    kind: 'captions',
                    language: 'en',
                    label: 'English',
                    src: 'assets/video/yt-' + src + '.vtt'
                }, true );
                
            } )

        }
        
        // set playback rate
        if ( options.playbackRates !== null ) {
            player.playbackRate( SBPLUS.playbackrate );
        }
        
        // video events
        player.on(['waiting', 'pause' ], function() {
            
          self.isPlaying = false;
          
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
          }
*/
          
        });
        
        player.on( 'loadedmetadata', function() {
            
            if ( self.isKaltura ) {
                
                sendKAnalytics(2, self.kaltura.id, self.src, player.duration());
                
            }
            
/*
            if ( SBPLUS.getStorageItem( 'sbplus-autoplay' ) === "1" && self.preventAutoplay === "true" ) {
        
                $( SBPLUS.layout.mediaMsg ).html( 'This media is intentionally prevented from autoplaying. Please click the play button to view this media.' ).removeClass( 'hide' );
                
            }
*/
            
        } );
        
        player.on('play', function() {
            
            if ( $(SBPLUS.layout.mediaMsg).is( ':visible' ) ) {
                $(SBPLUS.layout.mediaMsg).addClass( 'hide' ).html('');
            }
            
        });
        
        player.on('playing', function() {
            
          self.isPlaying = true;
          
          if ( self.isKaltura && ka.play === false && ka.replay === false ) {
              
              ka.play = true;
              sendKAnalytics(3, self.kaltura.id, self.src, player.duration());
              
          }
          
          if ( self.isKaltura && ka.replay ) {
              
              ka.replay = false;
              sendKAnalytics(16, self.kaltura.id, self.src, player.duration());
              
          }
          
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' )
              && self.transcriptIntervalStarted === false ) {
                self.startInteractiveTranscript();
              }
          }
*/
          
        });
        
        player.on('timeupdate', function() {
          
          if ( self.isKaltura && self.isPlaying ) {
              
              var progress = player.currentTime() / player.duration()
              
              if ( progress > 0.25 && ka.playReached25 === false ) {
                  
                  ka.playReached25 = true;
                  sendKAnalytics(4, self.kaltura.id, self.src, player.duration());
                  
              }
              
              if ( progress > 0.50 && ka.playReached50 === false ) {
                  
                  ka.playReached50 = true;
                  sendKAnalytics(5, self.kaltura.id, self.src, player.duration());
                  
              }
              
              if ( progress > 0.75 && ka.playReached75 === false ) {
                  
                  ka.playReached75 = true;
                  sendKAnalytics(6, self.kaltura.id, self.src, player.duration());
                  
              }
              
          }
          
        });
        
        player.on( 'ended', function() {
            
            self.isPlaying = false;
            
            if ( self.isKaltura && ka.playReached100 === false ) {
                
                ka.playReached100 = true;
                sendKAnalytics(7, self.kaltura.id, self.src, player.duration());
            
            }
            
            if ( self.isKaltura && ka.replay === false ) {
                ka.replay = true;
            }
          
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' ) ) {
                  $( '.lt-wrapper .lt-line' ).removeClass( 'current' );
              }
              
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
              
          }
          
*/

            // send event to Google Analytics
            if ( self.gaEventCate !== '' ) {
                
                SBPLUS.sendToGA( self.gaEventCate, "completed",
                                 self.gaEventLabel, 3, 0 );
                
            }
          
        });
        
        if ( SBPLUS.xml.settings.analytics === 'on' ) {
            
            player.on( 'timeupdate', function() {
                
                var percent = player.currentTime() / player.duration() * 100;
                
                if ( self.gaEventCate !== '' && percent >= 50
                     && self.gaEventHalfway === false ) {
                    
                    SBPLUS.sendToGA( self.gaEventCate, "halfway",
                                 self.gaEventLabel, 2, 0 );
                    self.gaEventHalfway = true;
                                 
                }
              
            });
        
        }
        
        player.on( 'error', function() {
            
          self.showPageError( 'NO_MEDIA', player.src() );
          
        });
        
        player.on( 'resolutionchange', function() {
                
    		player.playbackRate( SBPLUS.playbackrate );
    		
		} );
        
        player.on( 'ratechange', function() {
            
            var rate = this.playbackRate();
            
            if ( SBPLUS.playbackrate !== rate ) {
                
                SBPLUS.playbackrate = rate;
                this.playbackRate(rate);
                
            }
    		
		} );
        
        // volume
        
        if ( SBPLUS.hasStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-volume-temp', true ) ) {
            player.volume( Number( SBPLUS.getStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-volume-temp', true ) ) );
            
        } else {
            
            player.volume( Number( SBPLUS.getStorageItem( 'sbplus-volume' ) ) );
            
        }
        
        player.on( 'volumechange', function() {
            
            SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-volume-temp', this.volume(), true );
            
        } );
        
        // subtitle
        if ( self.isYoutube === false && self.isVimeo === false && player.textTracks().tracks_.length >= 1 ) {
            
            if ( SBPLUS.hasStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-subtitle-temp', true ) ) {
            
                if ( SBPLUS.getStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-subtitle-temp', true ) === '1' ) {
                    player.textTracks().tracks_[0].mode = 'showing';
                } else {
                    player.textTracks().tracks_[0].mode = 'disabled';
                }
                
            } else {
                
                if ( SBPLUS.getStorageItem( 'sbplus-subtitle' ) === '1' ) {
                    player.textTracks().tracks_[0].mode = 'showing';
                } else {
                    player.textTracks().tracks_[0].mode = 'disabled';
                }
                
            }
            
            player.textTracks().addEventListener( 'change', function() {
                
                var tracks = this.tracks_;
                
                $.each( tracks, function() {
                    
                    if ( this.mode === 'showing' ) {
                        
                        SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-subtitle-temp', 1, true );
                        
                    } else {
                        
                        SBPLUS.setStorageItem( 'sbplus-' + SBPLUS.presentationLoc + '-subtitle-temp', 0, true );
                        
                    }
                    
                } );
                
            } );
            
        }
        
        // add forward and backward buttons

        addForwardButton( player );
        addBackwardButton( player ); 
            
    } );
    
    if ( $( '#mp_html5_api' ).length ) {
        
        $( '#mp_html5_api' ).addClass( 'animated ' + self.transition )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', function() {
                $( this ).removeClass( 'animated ' +  self.transition );
                $( this ).off();
            }
        );
        
    }
    
    if ( $( '#mp_Youtube_api' ).length ) {
        
        var parent = $( '#mp_Youtube_api' ).parent();
        
        parent.addClass( 'animated ' + self.transition )
            .one( 'webkitAnimationEnd mozAnimationEnd animationend', function() {
                $( this ).removeClass( 'animated ' +  self.transition );
                $( this ).off();
            }
        );
        
    }

}

Page.prototype.setWidgets = function() {
    
    var self = this;
    SBPLUS.clearWidgetSegment();
    
    if ( this.type != 'quiz' ) {
        
        if ( !SBPLUS.isEmpty( this.notes ) ) {
            
            SBPLUS.addSegment( 'Notes' );
            
        }
        
        if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
            
            if ( self.isAudio || self.isVideo || self.isBundle ) {
            
                if ( !SBPLUS.isEmpty( self.transcript ) ) {
                    
                    SBPLUS.addSegment( 'Interactive Transcript (alpha)' );
                    
                }
                
            }
            
            if ( self.isKaltura ) {
                
                if ( !SBPLUS.isEmpty( self.captionUrl ) ) {
                    
                    SBPLUS.addSegment( 'Interactive Transcript (alpha)' );
                    
                }
                
            }
            
        }
        
        if ( this.widget.length ) {
            
            var segments = $( $( this.widget ).find( 'segment' ) );
            
            segments.each( function() {
                
                var name = $( this ).attr( 'name' );
                var key = 'sbplus_' + SBPLUS.sanitize( name );
                
                self.widgetSegments[key] = SBPLUS.getTextContent( $( this ) );
                SBPLUS.addSegment( name );
                
            } );
            
        }
        
        SBPLUS.selectFirstSegment();
        
    }
    
}

Page.prototype.getWidgetContent = function( id ) {
    
    var self = this;
    
    switch( id ) {
        
        case 'sbplus_notes':
            
            displayWidgetContent( this.notes );
            
        break;
        
        case 'sbplus_interactivetranscriptalpha':
            
            if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
                
                if ( self.isAudio || self.isVideo ) {
                
                    displayWidgetContent( parseTranscript( self.transcript ) );
                    self.startInteractiveTranscript();
                    
                } else {
                    
                    if ( self.transcriptLoaded === false ) {
                        
                        $.get( self.captionUrl, function( d ) {
                        
                            self.transcriptLoaded = true;
                            self.transcript = parseTranscript( SBPLUS.noScript( d ) );
                            
                            displayWidgetContent( self.transcript );
                            self.startInteractiveTranscript();
                            
                        } );
                        
                    } else {
                         
                         displayWidgetContent( self.transcript );
                         self.startInteractiveTranscript();
                        
                    }
                 
                }
                
            }
            
              
        break;
        
        default:
            
            displayWidgetContent( self.widgetSegments[id] );
            
        break;
        
    }
    
}

/*
Page.prototype.startInteractiveTranscript = function() {
    
    var self = this;
    
    if ( self.mediaPlayer ) {
        
        var ltArray = $( '.lt-wrapper .lt-line' );
        
        transcriptInterval = setInterval( function() {
            
            if ( self.isPlaying 
            && $( SBPLUS.layout.widget ).is( ':visible' ) ) {
                
                ltArray.removeClass( 'current' );
                
                // TO DO: Refine loop to binary search
                ltArray.each( function() {

                    if ( self.mediaPlayer.currentTime() >= $( this ).data('start') 
                    && self.mediaPlayer.currentTime() <= $( this ).data('end') ) {
                        $( this ).addClass( 'current' );
                        return;
                    }
                    
                } );
                
                var target = $( '.lt-wrapper .lt-line.current' );
            
                if ( target.length ) {
                    
                    var scrollHeight = $( '#sbplus_widget' ).height();
                    var targetTop = target[0].offsetTop;
                    
                    if ( targetTop > scrollHeight ) {
                        target[0].scrollIntoView( false );
                    }
                    
                }
                
            }
            
        }, 500 );
        
        self.transcriptIntervalStarted = true;
    
    }
    
    $( '.lt-wrapper .lt-line' ).on( 'click', function(e) {
        
        var currentTarget = $( e.currentTarget ).data('start');
        self.mediaPlayer.currentTime(currentTarget);
        
    } );
    
}
*/

// display page error
Page.prototype.showPageError = function( type, src ) {
    
    src = typeof src !== 'undefined' ? src : '';
    
    var self = this;
    
    var msg = '';
    
    switch ( type ) {
                
        case 'NO_IMG':
        
            msg = '<p><strong>The content for this Storybook Page could not be loaded.</strong></p><p><strong>Expected image:</strong> ' + src + '</p><p>Please try refreshing your browser, or coming back later.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';

        break;
        
        case 'KAL_NOT_READY':
            msg = '<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID  ' + self.src + '<br><strong>Status</strong>:<br>';
            
            msg += 'Low &mdash; ' + getKalturaStatus( self.isKaltura.status.low ) + '<br>';
            msg += 'Normal &mdash; ' + getKalturaStatus( self.isKaltura.status.normal ) + '<br>';
            msg += 'Medium &mdash; ' + getKalturaStatus( self.isKaltura.status.medium ) + '</p>';
            
        break;
        
        case 'KAL_ENTRY_NOT_READY':
            msg = '<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID ' + self.src + '<br><strong>Status</strong>: ';
            
            msg += getEntryKalturaStatus( self.isKaltura.status.entry ) + '</p>';
            
        break;
        
        case 'NO_MEDIA':
        
            msg = '<p><strong>The content for this Storybook Page could not be loaded.</strong></p>';
            
            if ( self.hasImage === false ) {
                msg += '<p><strong>Expected audio:</strong> ' + src + '<br>';
                msg += '<strong>Expected image:</strong> ' + self.missingImgUrl + '</p>';
            } else {
                msg += '<p><strong>Expected media:</strong> ' + src + '</p>';
            }
            
            msg += '<p>Please try refreshing your browser, or coming back later.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';
            
        break;
        
        case 'UNKNOWN_TYPE':
            msg = '<p><strong>UNKNOWN PAGE TYPE</strong></p><p>Page type ("' + src + '") is not supported.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';
        break;
        
    }
    
    $( self.mediaError ).html( msg ).show();
    
}

function getKalturaStatus( code ) {
    var msg = '';
    switch( code ) {
        case -1:
        msg = 'ERROR';
        break;
        case 0:
        msg = 'QUEUED (queued for conversion)';
        break;
        case 1:
        msg = 'CONVERTING';
        break;
        case 2:
        msg = 'READY';
        break;
        case 3:
        msg = 'DELETED';
        break;
        case 4:
        msg = 'NOT APPLICABLE';
        break;
        default:
        msg = 'UNKNOWN ERROR (check main entry)';
        break;
        
    }
    return msg;
}

function getEntryKalturaStatus( code ) {
    var msg = '';
    switch( code ) {
        case -2:
        msg = 'ERROR IMPORTING';
        break;
        case -1:
        msg = 'ERROR CONVERTING';
        break;
        case 0:
        msg = 'IMPORTING';
        break;
        case 1:
        msg = 'PRECONVERT';
        break;
        case 2:
        msg = 'READY';
        break;
        case 3:
        msg = 'DELETED';
        break;
        case 4:
        msg = 'PENDING MODERATION';
        break;
        case 5:
        msg = 'MODERATE';
        break;
        case 6:
        msg = 'BLOCKED';
        break;
        default:
        msg = 'UNKNOWN ERROR (check entry ID)';
        break;
        
    }
    return msg;
}

// page class helper functions

function addForwardButton( vjs ) {
    
    let secToSkip = 10;
    let Button = videojs.getComponent( 'Button' );
    let forwardBtn = videojs.extend( Button, {
        constructor: function( player, options ) {
            
            Button.call( this, player, options );
            this.el().setAttribute( 'aria-label','Skip Forward' );
            this.controlText( 'Skip Forward' );

        },
        handleClick: function() {
            
            if ( vjs.seekable() ) {
                
                let seekTime = vjs.currentTime() + secToSkip;
                
                if ( seekTime >= vjs.duration() ) {
                    seekTime = vjs.duration();
                }
                
                vjs.currentTime( seekTime );
                
            }
            
        },
        buildCSSClass: function() {
            return 'vjs-forward-button vjs-control vjs-button';
        } 
    } );

    videojs.registerComponent( 'ForwardBtn', forwardBtn );
    vjs.getChild( 'controlBar' ).addChild( 'ForwardBtn', {}, 1 );
    
}

function addBackwardButton( vjs ) {
    
    let secToSkip = 10;
    let Button = videojs.getComponent( 'Button' );
    let backwardBtn = videojs.extend( Button, {
        constructor: function( player, options ) {
            
            Button.call( this, player, options );
            this.el().setAttribute( 'aria-label','Skip Backward' );
            this.controlText( 'Skip Backward' );

        },
        handleClick: function() {
            
            if ( vjs.seekable() ) {
                
                let seekTime = vjs.currentTime() - secToSkip;
                
                if ( seekTime <= 0 ) {
                    seekTime = 0;
                }
                
                vjs.currentTime( seekTime );
                
            }
            
        },
        
        buildCSSClass: function() {
            return 'vjs-backward-button vjs-control vjs-button';
        }
        
    } );

    videojs.registerComponent( 'BackwardBtn', backwardBtn );
    vjs.getChild( 'controlBar' ).addChild( 'BackwardBtn', {}, 1 );
    
}

function sendKAnalytics(type, id, source, duration) {
    
    //$.get( 'https://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId=' + guid() + '&event%3AeventType=' + type + '&event%3ApartnerId=' + id + '&event%3AentryId=' + source + '&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=false&event%3Aduration=' + duration + '&event%3AeventTimestamp=' + +new Date() );
    
    var settings = {
      "url": "https://www.kaltura.com/api_v3/service/stats/action/collect",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "data": {
        "event[entryId]": source,
        "event[partnerId]": id,
        "event[duration]": duration,
        "event[eventType]": type,
        "event[referrer]": "https://media.uwex.edu",
        "event[seek]": "false",
        "event[sessionId]": guid(),
        "event[eventTimestamp]": +new Date(),
        "event[objectType]": "KalturaStatsEvent"
      }
    };
    
    $.ajax(settings);
    
}

function displayWidgetContent( str ) {
    
    $( SBPLUS.widget.content ).html( str )
        .addClass( 'fadeIn' ).one( 'webkitAnimationEnd mozAnimationEnd animationend', 
        function() {
            
            var region = $( this );
            
            region.removeClass( 'fadeIn' ).off();
            
            if ( region.find( 'a' ).length ) {

        		region.find( 'a' ).each( function() {
            		
        			$( this ).attr( "target", "_blank" );
        
                } );
        
            }
            
        }
     );
    
}

function parseTranscript( str ) {
    
    try {
        
        var result = '<div class="lt-wrapper">';
        var tAry = str.replace(/\n/g, '<br>').split('<br>');
        var brCount = 0;
        
        tAry = cleanArray( SBPLUS.removeEmptyElements( tAry ) );
    
        if ( tAry[0].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) 
        && tAry[1].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) ) {
            tAry[0] = '';
            tAry = SBPLUS.removeEmptyElements( tAry );
        }
        
        for ( var i = 1; i < tAry.length; i += 2 ) {
            
            var cueParts = tAry[i-1].split( ' ' );
            
            result += '<span class="lt-line" data-start="' + toSeconds(cueParts[0]) + '" data-end="' + toSeconds(cueParts[2]) + '">' + tAry[i] + '</span> ';
            brCount++;
            
            if( brCount >= 17 ) {
                result += '<br><br>';
                brCount = 0;
            }
            
        }
        
        result += '</div>';
        
        return result;
        
    } catch(e) {
        
        return 'Oops, SB+ has some complications with the requested caption file.';
        
    }
    
} 

function cleanArray( array ) {
    
    array = SBPLUS.removeEmptyElements( array );
    
    var index = array.findIndex( firstCueZero );
    
    if ( index === -1 ) {
        index = array.indexOf( array.find( firstCue ) );
    }
    
    array = array.splice( index );
    
    for ( var j = 0; j < array.length; j++ ) {
        
        if ( array[j].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) ) {
            
            var innerSplit = array[j].split( ' ' );
            
            if ( innerSplit.length > 3 ) {
                array[j] = innerSplit.splice( 0, 3 ).join(' ');
            } else {
                continue;
            }
            
        } else {
            
            if ( array[j+1] !== undefined ) {
                
                if ( !array[j+1].match(/\d{2}:\d{2}:\d{2}.\d{3}/g) ) {
                    array[j] = array[j] + ' ' + array[j+1];
                    array[j+1] = '';
                }
                
            }
            
        }
        
    }
    
    return SBPLUS.removeEmptyElements( array );
    
}

function guid() {
    
    function s4() {
        return Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring (1 );
    }
    
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    
}

function firstCueZero( cue ) {
    
    return cue.match(/(00:00:00.000)/);
    
}

function firstCue( cue ) {
    
    return cue.match(/\d{2}:\d{2}:\d{2}.\d{3}/g);
    
}

function toSeconds( str ) {
    
    var arr = str.split( ':' );
    
    if ( arr.length >= 3 ) {
        return Number( arr[0] * 60 ) * 60 + Number( arr[1] * 60 ) + Number( arr[2] );
    } else {
        return Number( arr[0] * 60 ) + Number( arr[1] );
    }
    
}

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

var quizTracker = [];
var Quiz = function( obj, data ) {
    
    var self = this;
    
    var cntx = data;
    var qId = Number( obj.id.join().replace( ',', '' ) );
    var qType = cntx.children()[0].nodeName.toLowerCase();
    
    var question = cntx.find( 'question' );
    var qTitle = SBPLUS.getTextContent( question );
    var qImg = '';
    var qAudio = '';
    
    if ( !SBPLUS.isEmpty( question.attr( 'image' ) ) ) {
        qImg = SBPLUS.noScript( question.attr( 'image' ).trim() );
    }
    
    if ( !SBPLUS.isEmpty( question.attr( 'audio' ) ) ) {
        qAudio = SBPLUS.noScript( question.attr( 'audio' ).trim() );
    }
    
    self.quiz = {
        id: qId,
        type: qType,
        question: qTitle,
        questionImg: qImg,
        questionAudio: qAudio,
        stuAnswer: '',
        correct: false
    };
    
    self.quizContainer = SBPLUS.layout.quizContainer;
    
    switch (qType) {
        
        case 'multiplechoicesingle':
            
            var msChoices = $( cntx ).find( 'choices' ).find( 'answer' );
            
            if ( !SBPLUS.isEmpty( $( cntx ).find( 'choices' ).attr('random') ) ) {
                
                var random = SBPLUS.noScript( $( cntx ).find( 'choices' ).attr('random').trim().toLowerCase() );
                
                if ( random === 'yes' || random === 'true' ) {
                    self.quiz.random = true;
                } else {
                    self.quiz.random = false;
                }
                
            }
            
            self.quiz.answers = [];
            
            $.each( msChoices, function() {
                
                var answer = {};
                
                answer.value = SBPLUS.noScript( $( this ).find( 'value' ).text().trim() );
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'image' ) ) ) {
                    answer.img = SBPLUS.noScript( $( this ).attr( 'image' ).trim() );
                    answer.value = answer.img;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'audio' ) ) ) {
                    answer.audio = SBPLUS.noScript( $( this ).attr( 'audio' ).trim() );
                    answer.value = answer.audio;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'correct' ) ) ) {
                    
                    if ( $( this ).attr( 'correct' ).toLowerCase() === 'yes' || $( this ).attr( 'correct' ).toLowerCase() === 'true' ) {
                        answer.correct = SBPLUS.noScript( $( this ).attr( 'correct' ).trim().toLowerCase() );
                    }
                    
                }
                
                var mcFB = $( this ).find( 'feedback' );
                
                if ( mcFB.length ) {
                    answer.feedback = SBPLUS.getTextContent( mcFB );
                }
                
                self.quiz.answers.push( answer );
                
            } );
            
        break;
        
        case 'multiplechoicemultiple':
            
            var mmChoices = $( cntx ).find( 'choices' ).find( 'answer' );
            
            if ( !SBPLUS.isEmpty( $( cntx ).find( 'choices' ).attr('random') ) ) {
                
                var randomMM = SBPLUS.noScript( $( cntx ).find( 'choices' ).attr('random').trim().toLowerCase() );
                
                if ( randomMM === 'yes' || randomMM === 'true' ) {
                    self.quiz.random = true;
                } else {
                    self.quiz.random = false;
                }
                
            }
            
            self.quiz.answers = [];
            
            $.each( mmChoices, function() {
                
                var answer = {};
                
                answer.value = SBPLUS.noScript( $( this ).find( 'value' ).text().trim() );
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'image' ) ) ) {
                    answer.img = SBPLUS.noScript( $( this ).attr( 'image' ).trim() );
                    answer.value = answer.img;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'audio' ) ) ) {
                    answer.audio = SBPLUS.noScript( $( this ).attr( 'audio' ).trim() );
                    answer.value = answer.audio;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'correct' ) ) ) {
                    
                    if ( $( this ).attr( 'correct' ).toLowerCase() === 'yes' || $( this ).attr( 'correct' ).toLowerCase() === 'true' ) {
                        answer.correct = SBPLUS.noScript( $( this ).attr( 'correct' ).trim().toLowerCase() );
                    }
                    
                }
                
                self.quiz.answers.push( answer );
                
            } );
            
            var cFB = $( cntx ).find( 'correctFeedback' );
            var iFB = $( cntx ).find( 'incorrectFeedback' );
            
            if ( cFB.length ) {
                self.quiz.correctFeedback = SBPLUS.getTextContent( cFB );
            }
            
            if (iFB.length ) {
                self.quiz.incorrectFeedback = SBPLUS.getTextContent( iFB );
            }
            
        break;
        
        case 'shortanswer':
            
            var fb = $( cntx ).find( 'feedback' );
            
            if ( fb.length ) {
                self.quiz.feedback = SBPLUS.getTextContent( fb );
            }
            
        break;
        
        case 'fillintheblank':
            
            var fitbCFB = $( cntx ).find( 'correctFeedback' );
            var fitbIFB = $( cntx ).find( 'incorrectFeedback' );
            
            if ( fitbCFB.length ) {
                self.quiz.correctFeedback = SBPLUS.getTextContent( fitbCFB );
            }
            
            if (fitbIFB.length ) {
                self.quiz.incorrectFeedback = SBPLUS.getTextContent( fitbIFB );
            }
            
            self.quiz.answer = SBPLUS.noScript( $( cntx ).find( 'answer' ).text().trim() );
            
        break;
        
    }
    
    if ( questionExists( self.quiz.id ) === false ) {
        
        quizTracker.push( this.quiz );
        
    }
    
};

Quiz.prototype.getQuiz = function() {
    
    var self = this;
    var answered = false;
    
    self.qIndex = getCurrentQuizItem( quizTracker, self.quiz.id );
    
    if ( Array.isArray( quizTracker[self.qIndex].stuAnswer ) ) {
        
        if ( quizTracker[self.qIndex].stuAnswer.length >= 1 ) {
            answered = true;
        }
        
    } else {
        
        if ( !SBPLUS.isEmpty( quizTracker[self.qIndex].stuAnswer ) ) {
            answered = true;
        }
        
    }
    
    if ( answered ) {
        self.renderFeeback();
    } else {
        self.renderQuiz();
    }
    
    if ( SBPLUS.xml.settings.mathjax === 'on' || SBPLUS.xml.settings.mathjax === 'true' ) {
        MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
    }
    
}

Quiz.prototype.renderQuiz = function() {
    
    var self = this;
    var questionImg = '';
    var questionAudio = '';
    
    var html = '<div class="sbplus_quiz_header"><span class="icon-assessment"></span>';
    html += ' Self Assessment</div>';
    
    if ( !SBPLUS.isEmpty( self.quiz.questionImg ) ) {
        questionImg = '<p><img src="assets/images/' + self.quiz.questionImg + '" /></p>';
    }
    
    if ( !SBPLUS.isEmpty( self.quiz.questionAudio ) ) {
        questionAudio = '<p><audio controls><source src="assets/audio/' + self.quiz.questionAudio + '" type="audio/mpeg" /></audio></p>';
    }
    
    html += '<div class="sbplus_quiz_question">' + questionImg + questionAudio + self.quiz.question + '</div>';
    html += '<div class="sbplus_quiz_input"></div>';
    html += '<button class="sbplus_quiz_submit_btn">Submit</button>';
    
    $( self.quizContainer ).html( html ).promise().done( function() {
            
            switch( self.quiz.type ) {
                
                case 'multiplechoicesingle':
                    
                    var msInput = '';
                    
                    if ( self.quiz.random ) {
                        shuffle( self.quiz.answers );
                    }
                    
                    $.each( self.quiz.answers, function( i ) {
                        
                        var cleanMSValue = SBPLUS.sanitize( self.quiz.answers[i].value );
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].img ) ) {
                            cleanMSValue = SBPLUS.sanitize( self.quiz.answers[i].img );
                            msInput += '<label class="img_val" for="' + cleanMSValue + '"><input type="radio" id="' + cleanMSValue +'" name="ms" value="' + i + '" /><img src="assets/images/' + self.quiz.answers[i].img + '"/ ></label>';
                            return true;
                        }
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].audio ) ) {
                            cleanMSValue = SBPLUS.sanitize( self.quiz.answers[i].audio );
                            msInput += '<label class="au_val" for="'+cleanMSValue+'"><input type="radio" id="'+cleanMSValue+'" name="ms" value="' + i + '" /> <audio controls><source src="assets/audio/' + self.quiz.answers[i].audio + '" type="audio/mpeg"/></audio></label>';
                            return true;
                        }
                        
                        msInput += '<label for="'+cleanMSValue+'"><input type="radio" id="'+cleanMSValue+'" name="ms" value="' + i + '" /> ' + self.quiz.answers[i].value + '</label>'
                        
                    } );
                    
                    $( '.sbplus_quiz_input' ).html( msInput );
                    
                    
                break;
                
                case 'multiplechoicemultiple':
                
                    var mmInput = '';
                    
                    if ( self.quiz.random ) {
                        shuffle( self.quiz.answers );
                    }
                    
                    $.each( self.quiz.answers, function( i ) {
                        
                        var cleanMMValue = SBPLUS.sanitize( self.quiz.answers[i].value );
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].img ) ) {
                            cleanMMValue = SBPLUS.sanitize( self.quiz.answers[i].img );
                            mmInput += '<label class="img_val" for="' + cleanMMValue + '"><input type="checkbox" id="' + cleanMMValue +'" name="mm" value="' + i + '" /><img src="assets/images/' + self.quiz.answers[i].img + '" /></label>';
                            return true;
                        }
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].audio ) ) {
                            cleanMMValue = SBPLUS.sanitize( self.quiz.answers[i].audio );
                            mmInput += '<label class="au_val" for="'+cleanMMValue+'"><input type="checkbox" id="'+cleanMMValue+'" name="mm" value="' + i + '" /> <audio controls><source src="assets/audio/' + self.quiz.answers[i].audio + '" type="audio/mpeg"/></audio></label>';
                            return true;
                        }
                        
                        mmInput += '<label for="'+cleanMMValue+'"><input type="checkbox" id="'+cleanMMValue+'" name="mm" value="' + i + '" /> ' + self.quiz.answers[i].value + '</label>'
                        
                    } );
                    
                    $( '.sbplus_quiz_input' ).html( mmInput );
                    
                break;
                
                case 'shortanswer':
                
                    $( '.sbplus_quiz_input' ).html( '<textarea></textarea>' );
                
                break;
                
                case 'fillintheblank':
                
                    $( '.sbplus_quiz_input' ).html( '<input type="text" />' );
                
                break;
                
            }

    } );
    
    $( 'button.sbplus_quiz_submit_btn' ).on( 'click', function() {
        
        switch( self.quiz.type ) {
            
            case 'multiplechoicesingle':
                
                quizTracker[self.qIndex].stuAnswer = $( 'input[type="radio"]:checked' ).val();
                
                if ( !SBPLUS.isEmpty( quizTracker[self.qIndex].stuAnswer ) ) {
                    
                    $.each( self.quiz.answers, function() {
                        
                        if ( this.correct !== undefined ) {
                            
                            var sAnswer = SBPLUS.sanitize( self.quiz.answers[Number(quizTracker[self.qIndex].stuAnswer)].value );
                            
                            if ( sAnswer === SBPLUS.sanitize( this.value ) ) {
                                quizTracker[self.qIndex].correct = true;
                            } else {
                                quizTracker[self.qIndex].correct = false;
                            }
                            
                            return false;
                            
                        }
                        
                    } );
                    
                }
                
            break;
            
            case 'multiplechoicemultiple':
                
                var checkboxes = $( 'input:checkbox[name="mm"]' );
                var correctAnswers = [];
                
                quizTracker[self.qIndex].stuAnswer = [];
                
                checkboxes.each( function() {
                    
                    if ( this.checked ) {
                        
                        quizTracker[self.qIndex].stuAnswer.push( Number( $( this ).val() ) );
                        
                    }
                    
                } );
                
                $.each( self.quiz.answers, function() {
                        
                    if ( this.correct !== undefined ) {
                        
                        correctAnswers.push( SBPLUS.sanitize( this.value ) );
                        
                    }
                    
                } );
                
                if ( quizTracker[self.qIndex].stuAnswer.length < correctAnswers.length
                || quizTracker[self.qIndex].stuAnswer.length > correctAnswers.length ) {
                    
                    quizTracker[self.qIndex].correct = false;
                    
                } else if ( quizTracker[self.qIndex].stuAnswer.length === correctAnswers.length ) {
                    
                    for ( var i = 0; i < quizTracker[self.qIndex].stuAnswer.length; i++ ) {
                        
                        var index = Number( quizTracker[self.qIndex].stuAnswer[i] );
                        var mAnswer = SBPLUS.sanitize( quizTracker[self.qIndex].answers[index].value);
                        
                        if ( $.inArray( mAnswer, correctAnswers ) >= 0 ) {
                            quizTracker[self.qIndex].correct = true;
                        } else {
                            quizTracker[self.qIndex].correct = false;
                            break;
                        }
                        
                    }
                    
                }
            
            break;
            
            case 'shortanswer':
                
                quizTracker[self.qIndex].stuAnswer = $( '.sbplus_quiz_input textarea' ).val();
                
            break;
            
            case 'fillintheblank':
            
                quizTracker[self.qIndex].stuAnswer = $( 'input' ).val();
                
                if ( quizTracker[self.qIndex].stuAnswer !== self.quiz.answer ) {
                    quizTracker[self.qIndex].correct = false;
                } else {
                    quizTracker[self.qIndex].correct = true;
                }
                
            break;
            
        }
        
        var containsAnswer = false;
        
        if ( Array.isArray( quizTracker[self.qIndex].stuAnswer ) ) {
            
            if ( quizTracker[self.qIndex].stuAnswer.length >= 1 ) {
                containsAnswer = true;
            }
            
        } else {
            
            if ( !SBPLUS.isEmpty( quizTracker[self.qIndex].stuAnswer ) ) {
                containsAnswer = true
            }
            
        }
        
        if ( containsAnswer === false ) {
            
                $( '.sbplus_quiz_header' ).after( '<div class="quiz_error"><span class="icon-warning"></span> Please answer the question before submitting.</div>' );
                
                setTimeout( function() {
                    
                    $( '.quiz_error' ).fadeOut( 1000, function() {
                        $( this ).remove();
                    } );
                    
                }, 4000 );
                
            } else {
                
                self.renderFeeback();
                
                if ( SBPLUS.xml.settings.mathjax === 'on' || SBPLUS.xml.settings.mathjax === 'true' ) {
                    MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
                }
                
            }
            
        } );
        
        var label = SBPLUS.getCourseDirectory() + ':quiz:page' + SBPLUS.targetPage.data( 'count' );
        SBPLUS.sendToGA( 'Quiz', 'completed', label, 3, 0 );
    
};

Quiz.prototype.renderFeeback = function() {
    
    var self = this;
    var questionImg = '';
    var questionAudio = '';
    
    var html = '<div class="sbplus_quiz_header"><span class="icon-assessment"></span>';
    html += ' Self Assessment Feedback</div>';
    
    if ( self.quiz.type !== 'shortanswer' ) {
        
        if ( quizTracker[self.qIndex].correct ) {
            html += '<div class="quiz_correct"><span class="icon-check"></span> Correct!</div>';
        } else {
            html += '<div class="quiz_incorrect"><span class="icon-warning"></span> Incorrect!</div>';
        }
        
    } 
    
    if ( !SBPLUS.isEmpty( self.quiz.questionImg ) ) {
        questionImg = '<p><img src="assets/images/' + self.quiz.questionImg + '" /></p>';
    }
    
    if ( !SBPLUS.isEmpty( self.quiz.questionAudio ) ) {
        questionAudio = '<p><audio controls><source src="assets/audio/' + self.quiz.questionAudio + '" type="audio/mpeg" /></audio></p>';
    }
    
    html += '<div class="sbplus_quiz_question">' + questionImg + questionAudio + self.quiz.question + '</div>';
    html += '<div class="sbplus_quiz_result">';
    
    switch ( self.quiz.type ) {
        
        case 'shortanswer':
            
            html += '<p><strong>Your answer:</strong><br>' + quizTracker[self.qIndex].stuAnswer + '</p>';
            
            if ( !SBPLUS.isEmpty( self.quiz.feedback ) ) {
                html += '<p><strong>Feedback:</strong><br>' + self.quiz.feedback + '</p>';
            }
    
        break;
        
        case 'fillintheblank':
        
            html += '<p><strong>Your answer:</strong><br>' + quizTracker[self.qIndex].stuAnswer + '</p>';
            html += '<p><strong>Correct answer:</strong><br>' + self.quiz.answer + '</p>';
            
            if ( quizTracker[self.qIndex].correct ) {
                
                if ( !SBPLUS.isEmpty( self.quiz.correctFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.correctFeedback + '</p>';
                }
                
            } else {
                
                if ( !SBPLUS.isEmpty( self.quiz.incorrectFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.incorrectFeedback + '</p>';
                }
                
            }
    
        break;
        
        case 'multiplechoicesingle':
            
            var msAnswerIndex = Number(quizTracker[self.qIndex].stuAnswer);
            var msAnswerNode = quizTracker[self.qIndex].answers[msAnswerIndex];
            var msAnswer = msAnswerNode.value;
            var msFeedback = msAnswerNode.feedback;
            var msAnswerImg = msAnswerNode.img;
            var msAnswerAudio = msAnswerNode.audio;
            var msAnswerType = 'text';
            
            if ( !SBPLUS.isEmpty( msAnswerImg ) ) {
                msAnswerType = 'img';
            }
            
            if ( !SBPLUS.isEmpty( msAnswerAudio ) ) {
                msAnswerType = 'audio';
            }
            
            switch ( msAnswerType ) {
                        
                case 'img':
                    html += '<p><strong>Your answer:</strong><br><img src="assets/images/' + msAnswerNode.img + '" /></p>';
                break;
                
                case 'audio':
                    html += '<p><strong>Your answer:</strong><br><audio controls><source src="assets/audio/' + msAnswerAudio + '" type="audio/mpeg"/></audio></p>';
                break;
                
                case 'text':
                    html += '<p><strong>Your answer:</strong><br>' + msAnswer + '</p>';
                break;
                
            }
            
            $.each( self.quiz.answers, function( i ) {
                
                if ( self.quiz.answers[i].correct !== undefined ) {
                    
                    var output = self.quiz.answers[i].value;
                    
                    switch ( msAnswerType ) {
                        
                        case 'img':
                            output = '<img src="assets/images/' + self.quiz.answers[i].value + '" />';
                        break;
                        
                        case 'audio':
                            output = '<audio controls><source src="assets/audio/' + self.quiz.answers[i].value + '" type="audio/mpeg"/></audio>';
                        break;
                        
                    }
                    
                    html += '<p><strong>Correct answer:</strong><br>' + output + '</p>';
                    
                    return false;
                }
                
            } );
            
            if ( !SBPLUS.isEmpty( msFeedback ) ) {
                html += '<p><strong>Feedback:</strong><br>' + msFeedback + '</p>';
            }
    
        break;
        
        case 'multiplechoicemultiple':
        
            var stuAnswerAry = quizTracker[self.qIndex].stuAnswer;
            
            html += '<p><strong>Your answer:</strong><br>';
            
            $.each( stuAnswerAry, function( i ) {
                
                var saIndex = Number(stuAnswerAry[i]);
                var mmAnswerType = 'text';
                
                if ( !SBPLUS.isEmpty( self.quiz.answers[saIndex].img ) ) {
                    mmAnswerType = 'img';
                }
                
                if ( !SBPLUS.isEmpty( self.quiz.answers[saIndex].audio ) ) {
                    mmAnswerType = 'audio';
                }
                
                switch ( mmAnswerType ) {
                            
                    case 'img':
                        html += '<img src="assets/images/' + self.quiz.answers[saIndex].value + '" /><br>';
                    break;
                    
                    case 'audio':
                        html += '<audio controls><source src="assets/audio/' + self.quiz.answers[saIndex].value + '" type="audio/mpeg"/></audio><br>';
                    break;
                    
                    case 'text':
                        html += self.quiz.answers[saIndex].value + '<br>';
                    break;
                    
                }
                
            } );
            
            html += '</p><p><strong>Correct answer:</strong><br>';
            
            $.each( self.quiz.answers, function() {
                
                if ( this.correct !== undefined ) {
                    
                    var aType = 'text';
                
                    if ( !SBPLUS.isEmpty( this.img ) ) {
                        aType = 'img';
                    }
                    
                    if ( !SBPLUS.isEmpty( this.audio ) ) {
                        aType = 'audio';
                    }
                    
                    switch ( aType ) {
                            
                        case 'img':
                            html += '<img src="assets/images/' + this.value + '" /><br>';
                        break;
                        
                        case 'audio':
                            html += '<audio controls><source src="assets/audio/' + this.value + '" type="audio/mpeg"/></audio><br>';
                        break;
                        
                        case 'text':
                            html += this.value + '<br>';
                        break;
                        
                    }
                    
                }
                
            } );
            
            html += '</p>';
            
            if ( quizTracker[self.qIndex].correct ) {
                
                if ( !SBPLUS.isEmpty( self.quiz.correctFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.correctFeedback + '</p>';
                }
                
            } else {
                
                if ( !SBPLUS.isEmpty( self.quiz.incorrectFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.incorrectFeedback + '</p>';
                }
            }
                
        
        break;
        
    }
    
    html += '</div>';
    
    // display the html
    $( self.quizContainer ).html( html );
    
};

function questionExists( id ) {
    
    var found = false;
    
    $.each( quizTracker, function( i ) {
        
        if (quizTracker[i].id === id ) {
            found = true;
            return;
        }
        
    } );
    
    return found;
    
}

function shuffle( array ) {
    
    var randomIndex, temp, index;
    
    for ( index = array.length; index; index-- ) {
        
        randomIndex = Math.floor( Math.random() * index );
        
        temp = array[index - 1];
        array[index - 1] = array[randomIndex];
        array[randomIndex] = temp;
    }
}

function getCurrentQuizItem( array, id ) {
    
    var result = undefined;
    
    $.each( array, function( i ) {
        
        if ( array[i].id === id ) {
            result = i;
            return false;
        }
        
    } );
    
    return result;
    
}







/***************************************
    Menu Bar Accessibility Friendly
    https://www.w3.org/TR/wai-aria-practices-1.1/#menu
****************************************/

function MenuBar( domID, isVerticalMenu ) {
        
    this.id = $( '#' + domID );
    
    this.rootItems = this.id.children( 'li' );
    
    this.items = this.id.find('.menu-item').not('.separator');
    this.parents = this.id.find('.menu-parent');
    this.allItems = this.parents.add(this.items);
    this.activeItem = null;
    
    this.isVerticalMenu = isVerticalMenu;
    this.bChildOpen = false;
    
    this.keys = {
        tab:    9,
        enter:  13,
        esc:    27,
        space:  32,
        left:   37,
        up:     38,
        right:  39,
        down:   40 
    };
    
    this.bindHandlers();
    
}

MenuBar.prototype.bindHandlers = function() {
    
    var self = this;
    
    /* MOUSE EVENTS */
    
    // mouseenter handler for the menu items
    self.items.on( 'mouseenter', function() {
        
        $( this ).addClass( 'menu-hover' );
        return true;
        
    } );
    
    // mouseout handler for the menu items
    self.items.on( 'mouseout', function() {
        
        $( this ).removeClass( 'menu-hover' );
        return true;
        
    } );
    
    // mouseenter handler for the menu parents
/*
    self.parents.on( 'mouseenter', function( e ) {
        return self.handleMouseEnter( $( this ), e );
    } );
*/
    
    // mouselease handler for the menu parents
/*
    self.parents.on( 'mouseleave', function( e ) {
        return self.handleMouseLeave( $( this ), e );
    } );
*/
    
    // click handler for all items
    self.allItems.on( 'click', function( e ) {
        
        self.handleClick( $( this ), e );
        
    } );
    
    /* KEY EVENTS */
    
    // keydown handler for all items
    self.allItems.on( 'keydown', function( e ) {
        
        return self.handleKeydown( $( this ), e );
        
    } );
    
    // keypress handler for all items
    self.allItems.on( 'keypress', function( e ) {
        
        return self.handleKeypress( $( this ), e );
        
    } );
    
    // focus handler for all items
    self.allItems.on( 'focus', function( e ) {
        
        return self.handleFocus( $( this ), e );
        
    } );
    
    // blur hander for all items
    self.allItems.on( 'blur', function(  e) {
        
        return self.handleBlur( $( this ), e );
        
    } );
    
    // document click handler
    $( document ).on( 'click', function( e ) {
        
        return self.handleDocumentClick( e );
        
    } );
            
};

// Process mouse over events for the top menus

/*
MenuBar.prototype.handleMouseEnter = function( item ) {
    
    // add hover style (if applicable)
    item.addClass( 'menu-hover' ).attr( 'aria-expanded', 'true' );
    
    // expand the first level submenu
    if ( item.attr( 'aria-haspopup' ) === 'true' ) {
        
        item.children( 'ul' ).attr( {
            'aria-hidden': 'false',
            'aria-expanded': 'true'
        } );
        
    }
    
    // stop propagation
    return true;

};
*/

// process mouse leave events for the top menu

/*
MenuBar.prototype.handleMouseLeave = function( menu ) {
    
    var self = this;
    var active = menu.find( '.menu-focus' );
    
    // remove hover style
    menu.removeClass( 'menu-hover' ).attr( 'aria-expanded', 'false' );
    
    // if any item in the child menu has focus, move focus to root item
    if ( active.length > 0 ) {
        
        self.bChildOpen = false;
        
        // remove the focus style from the active item
        active.removeClass( 'menu-focus' ); 
        
        // store the active item
        self.activeItem = $menu;
        
        // cannot hide items with focus -- move focus to root item
        menu.focus();
        
    }
    
    // hide child menu
    menu.children( 'ul' ).attr( {
        'aria-hidden': 'true',
        'aria-expanded': 'false'
    } );
    
    return true;

};
*/

// process click events for the top menus

MenuBar.prototype.handleClick = function( item, e ) {
    
    var self = this;
    var parentUL = item.parent();
    
    if ( parentUL.is('.root-level') ) {
        
        // open the child menu if it is closed
        var menu = item.children( 'ul' ).first();
        
        if ( menu.attr( 'aria-hidden' ) === 'false' ) {
            
            item.attr( 'aria-expanded', 'false' );
            
            menu.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            menu.parent().removeClass( 'active' );
            
        } else {
            
            item.attr( 'aria-expanded', 'true' );
            
            menu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
            
            menu.parent().addClass( 'active' );
            
        }
        
    } else {
        
        // remove hover and focus styling
        self.allItems.removeClass( 'menu-hover menu-focus' );
        
        item.attr( 'aria-expanded', 'false' );
        
        // close the menu
        self.id.find( 'ul' ).not( '.root-level' ).attr( {
            'aria-hidden': 'true',
            'aria-expanded': 'false'
        } );
    
    }
    
    e.stopPropagation();
    return false;

};

// process focus events for the menu
MenuBar.prototype.handleFocus = function( item ) {
    
    var self = this;
    
    // if activeItem is null, get focus from outside the menu
    // store the item that triggered the event
    if ( this.activeItem === null ) {
        
        this.activeItem = item;
        
    } else if ( item[0] !== self.activeItem[0] ) {
        
        return true;
        
    }
    
    // get the set of objects for all the parent items of the active item
    var parentItems = self.activeItem.parentsUntil( 'div' ).filter( 'li' );
    
    // remove focus styling from all other menu items
    self.allItems.removeClass( 'menu-focus' );
    
    // add foucus styling to the active item
    self.activeItem.addClass( 'menu-focus' );
    
    // add focus styling to all parent items
    parentItems.addClass( 'menu-focus' );
    
    if ( self.isVerticalMenu === true ) {
        
        // if the bChildOpen flag has been set, open the active item's child menu (if applicable)
        if ( self.bChildOpen === true ) {
            
            var itemUL = item.parent();
            
            // if the itemUL is a root-level menu and item is a parent item
            if ( itemUL.is( '.root-level' ) && ( item.attr( 'aria-haspopup' ) === 'true' ) ) {
                
                item.attr( 'aria-expanded', 'true' );
                
                item.children( 'ul' ).attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
            }
            
        } else {
            
            self.isVerticalMenu = false;
            
        }
        
    }
    
    return true;

};

// process blur events for the menu
MenuBar.prototype.handleBlur = function( item ) {

   item.removeClass( 'menu-focus' );
   return true;

};

// process keydown events for the menus
MenuBar.prototype.handleKeydown = function( item, e ) {
    
    var self = this;
    
    if ( e.altKey || e.ctrlKey ) {
        
        // modifier key pressed; do not process
        return true;
    }
    
    var itemUL = item.parent();
    
    switch( e.keyCode ) {
        
        case self.keys.tab: {
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide all menu items and update their aria attributes
            self.id.find( 'ul' ).attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove focus styling from all menu items
            self.allItems.removeClass( 'menu-focus' );
            
            self.activeItem = null;
            self.bChildOpen = false;
            
            break;
        
        }
        case self.keys.esc: {
            
            item.attr( 'aria-expanded', 'false' );
            
            if ( itemUL.is('.root-level') ) {
                
                // hide the child menu and update the aria attributes
                item.children( 'ul' ).first().attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
            } else {
                
                // move up one level
                self.activeItem = itemUL.parent();
                
                // reset the bChildOpen flag
                self.bChildOpen = false;
                
                // set focus on the new item
                self.activeItem.focus();
                
                // hide the active menu and update the aria attributes
                itemUL.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
            }
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.enter:
        case self.keys.space: {
            
            var parentUL = item.parent();
            
            if ( parentUL.is( '.root-level' ) ) {
        
                // open the child menu if it is closed
                item.children( 'ul' ).first().attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
            } else {
                
                //remove hover and focus styling
                self.allItems.removeClass( 'menu-hover menu-focus' );
                
                // close the menu
                self.id.find( 'ul' ).not( '.root-level' ).attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                // download/open the file
                var id = self.activeItem.find( 'a' ).attr( 'id' );
                document.getElementById( id ).click();
                
                // clear the active item
                self.activeItem = null;
                
            }
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.left: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root level is active,
                // move to the previous item in the menu
                self.activeItem = self.moveUp( item );
                
            } else {
                
                self.activeItem = self.moveToPrevious( item );
                 
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.right: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the next item in the menu
                self.activeItem = self.moveDown( item );
                
            } else {
                
                self.activeItem = self.moveToNext( item );
                
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.up: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the previous root-level menu
                self.activeItem = self.moveToPrevious( item );
                
            } else {
                
                self.activeItem = self.moveUp( item );
                
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
        
        }
        
        case self.keys.down: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the next root-level menu
                self.activeItem = self.moveToNext( item );
                
            } else {
                
                self.activeItem = self.moveDown( item );
                
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
                
        }
        
    } // end switch
    
    return true;

};

// function to move to the next menu level
MenuBar.prototype.moveToNext = function( item ) {
    
    var self = this;
    
    // item's containing menu
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' );
    
    // the number of items in the active menu
    var menuNum = menuItems.length;
    
    // the items index in its menu
    var menuIndex = menuItems.index(item);
    
    var newItem = null;
    var childMenu = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        // this is the root level move to next sibling and
        // will require closing the current child menu and
        // opening the new one
        
        // if not the root menu
        if ( menuIndex < menuNum - 1 ) {
            
            newItem = item.next();
            
        } else {
            
            // wrap to first item
            newItem = menuItems.first();
            
        }
        
        // close the current child menu (if applicable)
        if ( item.attr( 'aria-haspopup' ) === 'true' ) {
            
            childMenu = item.children( 'ul' ).first();
            
            if ( childMenu.attr( 'aria-hidden' ) === 'false' ) {
                
                item.attr( 'aria-expanded', 'false' );
                
                // update the child menu's aria hidden attribute
                childMenu.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                self.bChildOpen = true;
                
            }
            
        }
        
        // remove the focus styling from the current menu
        item.removeClass( 'menu-focus' );
        
        // open the new child menu (if applicable)
        if ( ( newItem.attr( 'aria-haspopup' ) === 'true' ) && ( self.bChildOpen === true ) ) {
            
            childMenu = newItem.children( 'ul' ).first();
            
            item.attr( 'aria-expanded', 'true' );
            
            // update the child's aria-hidden attribute
            childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
        
        }
        
    } else {
        
        // this is not the root-level
        // if there is a child menu to be moved into,
        // do that; otherwise, move to the next root-level menu
        // if there is one
        
        if ( item.attr('aria-haspopup') === 'true' ) {
        
            childMenu = item.children( 'ul' ).first();
            newItem = childMenu.children( 'li' ).first();
            
            item.attr( 'aria-expanded', 'true' );
            
            // show the child menu and update its aria attribute
            childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
            
        } else {
            
            // at deepest level, move to the next root-item menu
            
            if ( self.isVerticalMenu === true ) {
                
                // do nothing
                return item;
                
            }
            
            var parentMenus = null;
            var rootItem = null;
            
            // get the list of all parent menus for item, up to the root level
            parentMenus = item.parentsUntil( 'div' ).filter( 'ul' ).not( '.root-level' );
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide the current menu and update its aria attribute accordingly
            parentMenus.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus styling from the active menu
            parentMenus.find( 'li' ).removeClass( 'menu-focus' );
            parentMenus.last().parent().removeClass( 'menu-focus' );
            
            // the containing root for the menu
            rootItem = parentMenus.last().parent();
            
            menuIndex = self.rootItems.index( rootItem );
            
            // if this is not the last root menu item,
            // move to the next one
            if ( menuIndex < self.rootItems.length - 1 ) {
                
                newItem = rootItem.next();
                
            } else {
                
                newItem = self.rootItems.first();
                
            }
            
            // add the focus styling to the new menu
            newItem.addClass( 'menu-focus' );
            
            if ( newItem.attr( 'aria-haspopup' ) === 'true' ) {
                
                childMenu = newItem.children( 'ul' ).first();
                
                newItem = childMenu.children( 'li' ).first();
                
                item.attr( 'aria-expanded', 'true' );
                
                // show the child menu and update its aria attribute
                childMenu.attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
                self.bChildOpen = true;
                
            }
            
        }
        
    }
    
    return newItem;
    
};

// function to move to the previous menu level
MenuBar.prototype.moveToPrevious = function( item ) {
    
    var self = this;
    
    // item's containing menu
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' );
    
    // the items index in its menu
    var menuIndex = menuItems.index( item );
    var newItem = null;
    var childMenu = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        // this is the root level move to previous sibling and
        // will require closing the current child menu and
        // opening the new one
        
        if ( menuIndex > 0 ) {
            
            newItem = item.prev();
            
        } else {
            
            // wrap to the last
            newItem = menuItems.last();
            
        }
        
        // close the current child menu (if applicable)
        if ( item.attr( 'aria-haspopup' ) === 'true' ) {
        
            childMenu = item.children( 'ul' ).first();
            
            if ( childMenu.attr( 'aria-hidden' ) === 'false' ) {
                
                item.attr( 'aria-expanded', 'false' );
                
                // update the child menu's aria-hidden attribute
                childMenu.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                self.bChildOpen = true;
                
            }
            
        }
        
        // remove the focus styling from the current menu
        item.removeClass('menu-focus');
        
        // open the new child menu (if applicable)
        if ( ( newItem.attr( 'aria-haspopup' ) === 'true' ) && ( self.bChildOpen === true ) ) {
        
            childMenu = newItem.children( 'ul' ).first();
            
            item.attr( 'aria-expanded', 'true' );
            
            // update the child's aria-hidden attribute
            childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
        
        }
        
    } else {
        
        // this is not the root level
        // if there is parent menu that is not the root menu,
        // move up one level; otherwise, move to first item of the previous root menu
        
        var parentLI = itemUL.parent();
        var parentUL = parentLI.parent();
        
        // if this is a vertical menu or is not the first child menu
        // of the root-level menu, move up one level
        if ( self.isVerticalMenu === true || !parentUL.is( '.root-level' ) ) {
        
            newItem = itemUL.parent();
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide the active menu and update aria-hidden
            itemUL.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus highlight from the item
            item.removeClass( 'menu-focus' );
        
            if ( self.isVerticalMenu === true ) {
                
                // set a flag so the focus handler does't reopen the menu
                self.bChildOpen = false;
                
            }
        
        } else {
            
            // move to previous root-level menu
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide the current menu and update the aria attributes accordingly
            itemUL.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus styling from the active menu
            item.removeClass( 'menu-focus' );
            parentLI.removeClass( 'menu-focus' );
            
            menuIndex = this.rootItems.index( parentLI );
            
            if ( menuIndex > 0 ) {
                
                // move to the previous root-level menu
                newItem = parentLI.prev();
                
            } else {
                
                // loop to last root-level menu
                newItem = self.rootItems.last();
                
            }
            
            // add the focus styling to the new menu
            newItem.addClass( 'menu-focus' );
            
            if ( newItem.attr( 'aria-haspopup' ) === 'true' ) {
                
                childMenu = newItem.children('ul').first();
                
                item.attr( 'aria-expanded', 'true' );
                
                // show the child menu and update it's aria attributes
                childMenu.attr({
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                });
                
                self.bChildOpen = true;
                
                newItem = childMenu.children( 'li' ).first();
                
            }
        }
        
    }
    
    return newItem;
    
};

// function to select the next item in a menu
MenuBar.prototype.moveDown = function( item, startChr ) {
    
    // item's containing menu
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' ).not( '.separator' );
    
    // the number of items in the active menu
    var menuNum = menuItems.length;
    
    // the items index in its menu
    var menuIndex = menuItems.index( item );
    
    var newItem = null;
    var newItemUL = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        if ( item.attr( 'aria-haspopup' ) !== 'true' ) {
            
            // no child to move to
            return item;
            
        }
        
        // move to the first item in the child menu
        newItemUL = item.children( 'ul' ).first();
        newItem = newItemUL.children( 'li' ).first();
        
        $( newItemUL.parent() ).attr( 'aria-expanded', 'true' );
        
        item.attr( 'aria-expanded', 'true' );
        
        // make sure the child menu is visible
        newItemUL.attr( {
            'aria-hidden': 'false',
            'aria-expanded': 'true'
        } );
        
        return newItem;
        
    }
    
    // If startChr is specified, move to the next item
    // with a title that begins with that character.
    
    if ( startChr ) {
        
        var bMatch = false;
        var curNdx = menuIndex + 1;
        
        // check if the active item was the last one on the list
        if ( curNdx === menuNum ) {
            
            curNdx = 0;
            
        }
        
        // Iterate through the menu items (starting from the current item and wrapping)
        // until a match is found or the loop returns to the current menu item 
        while ( curNdx !== menuIndex )  {
        
            var titleChr = menuItems.eq( curNdx ).html().charAt( 0 );
            
            if ( titleChr.toLowerCase() === startChr ) {
                
                bMatch = true;
                break;
                
            }
            
            curNdx = curNdx + 1;
            
            if ( curNdx === menuNum ) {
                
                // reached the end of the list, start again at the beginning
                curNdx = 0;
                
            }
            
        }
    
        if ( bMatch === true ) {
            
            newItem = menuItems.eq( curNdx );
            
            // remove the focus styling from the current item
            item.removeClass( 'menu-focus' );
            return newItem;
            
        } else {
            
            return item;
            
        }
        
    } else {
        
        if ( menuIndex < menuNum - 1 ) {
            
            newItem = menuItems.eq( menuIndex + 1 );
            
        } else {
            
            newItem = menuItems.first();
            
        }
        
    }
    
    // remove the focus styling from the current item
    item.removeClass('menu-focus');
    
    return newItem;
    
};

// function to select the previous item in a menu
MenuBar.prototype.moveUp = function( item ) {
    
    // item's containing menu 
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' ).not( '.separator' );
    
    // the items index in its menu
    var menuIndex = menuItems.index( item );
    
    var newItem = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        // nothing to do
        return item;
        
    }
    
    // if item is not the first item in its menu,
    // move to the previous item
    if ( menuIndex > 0 ) {
        
        newItem = menuItems.eq( menuIndex - 1 );
        
    } else {
        
        // loop to top of the menu
        newItem = menuItems.last();
    }
    
    // remove the focus styling from the current item
    item.removeClass('menu-focus');
    
    return newItem;
    
};

// function to process keypress events for the menu
MenuBar.prototype.handleKeypress = function( item, e ) {
    
    var self = this;
    
    if ( e.altKey || e.ctrlKey || e.shiftKey ) {
        
        // modifier key pressed; do not process
        return true;
        
    }
    
    switch( e.keyCode ) {
        
        case self.keys.tab: {
            return true;
        }
        
        case self.keys.esc:
        case self.keys.up:
        case self.keys.down:
        case self.keys.left:
        case self.keys.right: {
            e.stopPropagation();
            return false;
        }
        default : {
            var chr = String.fromCharCode( e.which );
        
            self.activeItem = self.moveDown( item, chr );
            self.activeItem.focus();
        
            e.stopPropagation();
            return false;
        }
    
    } // end switch

};

// function to process click events on the document
MenuBar.prototype.handleDocumentClick = function() {
    
    var self = this;
    
    // get the list of all child menus
    var childMenus = self.id.find( 'ul' ).not( '.root-level' );
    
    // hide the child menus
    childMenus.attr( {
        'aria-hidden': 'true',
        'aria-expanded': 'false'
    } );
    
    self.allItems.removeClass( 'menu-focus' );
    self.allItems.removeClass( 'active' );
    
    self.activeItem = null;
    
    // allow the event to propagate
    return true;

};