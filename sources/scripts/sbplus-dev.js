/*
 * Storybook Plus
 *
 * @author: Ethan Lin
 * @url: https://github.com/oel-mediateam/sbplus
 * @version: 3.1.0
 * Released 05/26/2017
 *
 * @license: GNU GENERAL PUBLIC LICENSE v3
 *
    Storybook Plus is an web application that serves multimedia contents.
    Copyright (C) 2013-2017  Ethan S. Lin, UWEX CEOEL Media Services

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

var SBPLUS = SBPLUS || {
    
    /***************************************************************************
        VARIABLE / CONSTANT / OBJECT DECLARATIONS
    ***************************************************************************/
    
    // holds the HTML structure classes and IDs
    layout: null,
    splash: null,
    banner: null,
    tableOfContents: null,
    widget: null,
    button: null,
    menu : null,
    screenReader: null,
    
    // holds current and total pages in the presentation
    totalPages: 0,
    currentPage: null,
    
    // holds external data
    manifest: null,
    xml: null,
    downloads: {},
    settings: null,
    
    // status flags
    splashScreenRendered: false,
    presentationRendered: false,
    beforeXMLLoadingDone: false,
    presentationStarted: false,
    hasError: false,
    
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
            leftCol: '#sbplus_left_col',
            sidebar: '#sbplus_right_col',
            pageStatus: '#sbplus_page_status',
            quizContainer: '#sbplus_quiz_wrapper',
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
        
        // get manifest data if not set
        if ( this.manifest === null ) {
            
            var self = this;
            
            // use AJAX load the manifest JSON data using the
            // url returned by the getManifestURL function
            $.getJSON( self.getManifestUrl(), function( data ) {
                
                // set the JSON data to the class manifest object
                self.manifest = data;
                
                // flag the session store to indicate manifest was loaded
                self.setStorageItem( 'sbplus-manifest-loaded', 1, true );
                
                // set an event listener to unload all session storage on HTML
                // page refresh/reload or closing
                $( window ).on( 'unload', self.removeAllSessionStorage.bind( self ) );
                
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
        
        // if manifest is loaded but template is not loaded...
        if ( this.getStorageItem( 'sbplus-manifest-loaded', true ) === '1'
        && this.hasStorageItem( 'sbplus-template-loaded', true ) === false ) {
            
            var self = this;
            
            // set the template URL for the sbplus.tpl file
            var templateUrl = self.manifest.sbplus_root_directory;
            templateUrl += 'scripts/templates/sbplus.tpl';
            
            // AJAX call and load the sbplus.tpl template
            $.get( templateUrl, function( data ) {
                
                // flag the session storage to indicate templated is loaded
                self.setStorageItem( 'sbplus-template-loaded', 1, true );
                
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
        if ( this.getStorageItem( 'sbplus-manifest-loaded', true ) === '1' 
        && this.getStorageItem( 'sbplus-template-loaded', true ) === '1'
        && this.beforeXMLLoadingDone === false ) {
            
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
        
        // if manifest custom menu was never loaded before...
        if ( this.hasStorageItem( 'sbplus-manifest-custom-menu-loaded', true ) === false ) {
            
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
            
            // set the loaded flag to 1 or true in local storage
            this.setStorageItem( 'sbplus-manifest-custom-menu-loaded', 1, true );
            
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
        
        // if before xml load flag is true and XML was never loaded before...
        if ( this.beforeXMLLoadingDone === true &&
        this.hasStorageItem( 'sbplus-xml-loaded', true ) === false ) {
            
            var self = this;
            
            // set the path to the XML file
            var xmlUrl = 'assets/sbplus.xml';
            
            // AJAX call to the XML file
            $.get( xmlUrl, function( data ) {
                
                // flag the loaded flag in the local storage
                self.setStorageItem( 'sbplus-xml-loaded', 1, true );
                
                // call function to parse the XML data
                /* SHOULD BE THE LAST TASK TO BE EXECUTED IN THIS BLOCK */
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
     * @updated on 5/19/2017
     *
     * @param string
     * @return none
     **/
    parseXMLData: function( d ) {
        
        // if XML is loaded and was never parsed...
        if ( this.getStorageItem( 'sbplus-xml-loaded', true ) === '1'
        && this.hasStorageItem( 'sbplus-xml-parsed', true ) === false ) {
            
            var self = this;
            
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
            var xGeneralInfo = self.noScript( xSetup.find( 'generalInfo' ).html().trim() );
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
            if ( xAnalytics !== 'on' ) {
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
                    authorPhoto: '',
                    duration: xLength,
                    generalInfo: xGeneralInfo
                },
                sections: xSections
            };
            
            // if analytics is on, get and set Google analtyics tracking
            if ( self.xml.settings.analytics === 'on' ) {
                
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                
                ga('create', self.manifest.sbplus_google_tracking_id, 'auto');
                ga('send', 'pageview');
                ga('send', 'event');
            }
            
            // set author name and path to the profile to respective variable
            var sanitizedAuthor = self.sanitize( xAuthor.attr( 'name' ).trim() );
            var profileUrl = self.manifest.sbplus_author_directory + sanitizedAuthor + '.json';
            
            // if author data in XML is empty
            if ( self.isEmpty( xAuthor.html() ) ) {
                
                // get centralized author name and profile via AJAX
                $.ajax( {
                        
                    crossDomain: true,
                    type: 'GET',
                    dataType: 'jsonp',
                    jsonpCallback: 'author',
                    url: profileUrl
                    
                } ).done( function( res ) { // when done, set author and profile
                    
                    self.xml.setup.author = res.name;
                    self.xml.setup.profile = self.noScript( res.profile );
                    
                } ).fail( function() { // when fail, default to the values in XML
                    
                    self.xml.setup.author = xAuthor.attr( 'name' ).trim();
                    self.xml.setup.profile = self.noScript( xAuthor.html().trim() );
                    
                } ).always( function() { // do no matter what
                    
                    // flag xml parsed as 1 or true in the local storage
                    self.setStorageItem( 'sbplus-xml-parsed', 1, true );
                    
                    // render the presentation splash screen
                    /* SHOULD ALWAYS BE EXECUTED ON THE LAST LINE OF THIS BLOCK */
                    self.renderSplashscreen();
                    
                } );
                
            } else { // if not
                
                // get the values in the XML
                self.xml.setup.author = xAuthor.attr( 'name' ).trim();
                self.xml.setup.profile = self.noScript( xAuthor.html().trim() );
                
                // flag xml parsed as 1 or true in the local storage
                self.setStorageItem( 'sbplus-xml-parsed', 1, true );
                
                // render the presentation splash screen
                /* SHOULD ALWAYS BE EXECUTED ON THE LAST LINE OF THIS BLOCK */
                self.renderSplashscreen();
                
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
     * @updated on 5/19/2017
     *
     * @param none
     * @return none
     **/
    renderSplashscreen: function() {
        
        if ( this.getStorageItem( 'sbplus-xml-parsed', true ) === '1'
        && this.splashScreenRendered === false ) {
            
            var self = this;
            
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
            }
            
            if ( self.hasStorageItem( 'sbplus-subtitle' ) === false ) {
                self.setStorageItem( 'sbplus-subtitle', 0 );
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
            $( self.splash.author ).html( self.xml.setup.author );
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
                        
                    });
                    
                }
                
            } );
            
            // set event listener to the start button
            $( self.button.start ).on( 'click', self.startPresentation.bind( self ) );
            
            // if local storage has a value for the matching presentation title
            if ( self.hasStorageItem( 'sbplus-' + self.sanitize( self.xml.setup.title ) ) ) {
                
                // set event listener to the resume button
                $( self.button.resume ).on( 'click', self.resumePresentation.bind( self ) );
                
            } else {
                
                // hide the resume button
                $( self.button.resume ).hide( 0, function() {
                    $( self ).attr( 'tabindex', '-1' );
                } );
                
            }
            
            // set downloadable file name from the course directory name in URL
            var fileName = SBPLUS.getCourseDirectory();
            
            // if file name is empty, default to 'default'
            if ( self.isEmpty( fileName ) ) {
                fileName = 'default';
            }
            
            // use AJAX to get PDF file
            $.ajax( {
                url: fileName + '.pdf',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.transcript = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.transcript + '" tabindex="1" download aria-label="Download transcript file"><span class="icon-download"></span> Transcript</a>' );
            } );
            
            // use AJAX to get video file
            $.ajax( {
                url: fileName + '.mp4',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.video = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.video + '" tabindex="1" download aria-label="Download video file"><span class="icon-download"></span> Video</a>' );
            } );
            
            // use AJAX to get audio file
            $.ajax( {
                url: fileName + '.mp3',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.audio = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.audio + '" tabindex="1" download aria-label="Download audio file"><span class="icon-download"></span> Audio</a>' );
            } );
            
            // use AJAX to get zipped/packaged file
            $.ajax( {
                url: fileName + '.zip',
                type: 'HEAD'
            } ).done( function() {
                self.downloads.supplement = this.url;
                $( self.splash.downloadBar ).append(
                    '<a href="' + self.downloads.supplement + '" tabindex="1" download aria-label="Download zipped supplement file"><span class="icon-download"></span> Supplement</a>' );
            } );
            
            // if accent does not match the default accent
            if ( self.xml.settings.accent !== self.manifest.sbplus_default_accent ) {
                
                // set hover color hex value
                var hover = self.colorLum( self.xml.settings.accent, 0.2 );
                
                // set the text color hex value
                var textColor = self.colorContrast( self.xml.settings.accent );
                
                // construct the CSS
                var style = '.sbplus_wrapper button:hover{color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button{color:' + textColor  + ';background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button:hover{background-color:' + hover + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .item:hover{color:' + textColor + ';background-color:' + hover + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .sb_selected{color:' + textColor + ';background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col #sbplus_table_of_contents_wrapper .section .current{border-left-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover{background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover a{color:' + textColor + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .active, .sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .active{color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus{background-color:' + self.xml.settings.accent + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus a{color:' + textColor + '}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent:hover{color:' + self.xml.settings.accent + '}';
                
                // append the style/css to the HTML head
                $( 'head' ).append( '<style type="text/css">' + style + '</style>' );
                
            }
            
            // if mathjax if turned on
            if ( self.xml.settings.mathjax === 'on' ) {
                
                // load the MathJAX script from a CDN
                $.getScript( 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML', function() {
            
                    MathJax.Hub.Config({
                        
                      'HTML-CSS': {
                        matchFontHeight: true
                      }
                      
                    });
                    
                });
                
            }
            
            // if viewing device is an iphone
            if ( self.isMobileDevice() ) {
                
                // load the inline video library
                $.getScript( self.manifest.sbplus_root_directory + 'scripts/libs/iphone-inline-video.browser.js' );
                
            }
            
            // flag the splash screen as rendered
            self.splashScreenRendered = true;
            
        }
        
    }, // end renderSplashScreen function
    
    /**
     * Set the splash screen image to the DOM
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
     *
     * @param string
     * @return none
     **/
    setSplashImage: function( str ) {
        
        // if parameter is not empty, set the background image
        if ( str ) {
            $( this.splash.background ).css( 'background-image', 
            'url(' + str + ')' );
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
                
                // get/set the presenation title
                var presentation = self.sanitize( self.xml.setup.title );
                
                // select the page that was set in the local storage data
                self.selectPage( self.getStorageItem( 'sbplus-' + presentation ) );
                
            } );
            
            self.presentationStarted = true;
            
        }
        
    },
    
    /**
     * Render the presentation (after the hiding the splash screen)
     *
     * @since 3.1.0
     * @author(s) Ethan Lin
     * @updated on 5/19/2017
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
            $( self.banner.author ).html( self.xml.setup.author );
            
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
                    
                    // append opening list item tag to DOM
                    sectionHTML += '<li class="item" data-count="';
                    sectionHTML += self.totalPages + '" data-page="' + i + ',' + j + '">';
                    
                    // if page is quiz
                    if ( $( this ).attr( 'type' ) === 'quiz' ) {
                        
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
            $( self.button.author ).on( 'click', function() {
                self.openMenuItem( 'sbplus_author_profile' );
            } );
            
            $( self.button.next ).on( 'click', self.goToNextPage.bind( self ) );
            $( self.button.prev ).on( 'click', self.goToPreviousPage.bind( self ) );
            
            if ( $( self.xml.sections ).length >= 2 ) {
                $( self.tableOfContents.header ).on( 'click', self.toggleSection.bind( self ) );
            }
            
            $( self.tableOfContents.page ).on( 'click', self.selectPage.bind( self ) );
            $( self.widget.segment ).on( 'click', 'button', self.selectSegment.bind( self ) );
            
            // add main menu button
            self.layout.mainMenu = new MenuBar( $( self.button.menu )[0].id, false );
            
            // add download button if downloads object is not empty
            if ( !$.isEmptyObject(self.downloads) ) {
                
                self.layout.dwnldMenu = new MenuBar( $( self.button.download )[0].id, false );
                
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
                
            } else {
                
                // hide the download button if download object is empty
                $( self.button.downloadWrapper ).hide();
            
            }
            
            // queue MathJAX if turned on
            if ( self.xml.settings.mathjax === 'on' ) {
                MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
            }
            
            // easter egg event listener
            $( "#sbplus_menu_btn .menu-parent" ).on( 'click', self.burgerBurger.bind( self ) );
            
            // resize elements after everything is put in place
            self.resize();
            
            this.presentationRendered = true;
            
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
     * @updated on 5/19/2017
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
            
            // set the target to the list element under the section
            var target = $( targetSectionHeader.siblings( '.list' ) );
            
            // the open/collapse icon on the section title bar
            var icon = targetSectionHeader.find( '.icon' );
            
            // if target is visible...
            if ( target.is( ':visible' ) ) {
                
                // slide up (hide) the list
                target.slideUp();
                
                // update the icon to open icon
                icon.html( '<span class="icon-open"></span>' );
                
            } else {
                
                // slide down (show) the list
                target.slideDown();
                
                // update the icon to collapse icon
                icon.html( '<span class="icon-collapse"></span>' );
                
            }
            
        }
        
    }, // end toggleSection function
    
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
        
        // declare a variable to hold targetted page
        var targetPage;
        
        // if the argument is an click event object
        if ( e instanceof Object ) {
            
            // set target to current click event target
            targetPage = $( e.currentTarget );
            
        } else {
            
            // set target to the passed in argument
            targetPage = $( '.item[data-page="' + e + '"]' );
            
            // if targe page does not exist
            if ( targetPage.length === 0 ) {
                
                // exit function; stop further execution
                return false;
            }
            
        }
        
        // if target page does not have the sb_selected class
        if ( !targetPage.hasClass( 'sb_selected' ) ) {
            
            // get jQuery set that contain pages
            var allPages = $( this.tableOfContents.page );
            
            // get jQuery set that contain section headers
            var sectionHeaders = $( this.tableOfContents.header );
            
            // if more than one section headers...
            if ( sectionHeaders.length > 1 ) {
                
                // set the target header to targetted page's header
                var targetHeader = targetPage.parent().siblings( '.header' );
                
                // if targetted header does not have the current class
                if ( !targetHeader.hasClass( 'current' ) ) {
                    
                    // remove current class from all section headers
                    sectionHeaders.removeClass( 'current' );
                    
                    // add current class to targetted header
                    targetHeader.addClass( 'current' );
                    
                }
                
            }
            
            // remove sb_selected class from all pages
            allPages.removeClass( 'sb_selected' );
            
            // add sb_selected class to targetted page
            targetPage.addClass( 'sb_selected' );
            
            // call the getPage function with targetted page data as parameter
            this.getPage( targetPage.data('page') );
            
            // update the page status with the targetted page count data
            this.updatePageStatus( targetPage.data( 'count' ) );
            
            // update screen reader status
            $( this.screenReader.currentPage ).html( targetPage.data( 'count' ) );
            
            // update the scroll bar to targetted page
            this.updateScroll( targetPage[0] );
            
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
            title: target.attr( 'title' ).trim(),
            type: target.attr( 'type' ).trim().toLowerCase()
        };
        
        // set number property to the pageData object
        pageData.number = page;
        
        // if page type is not quiz
        if ( pageData.type !== 'quiz' ) {
            
            // add/set additional property to the pageData object
            pageData.src = target.attr( 'src' ).trim();
            pageData.notes = this.noScript( target.find( 'note' ).html().trim() );
            pageData.widget = target.find( 'widget' );
            pageData.frames = target.find( 'frame' );
            pageData.imageFormat = this.xml.settings.imgType;
            pageData.transition = target[0].hasAttribute( 'transition' ) ? 
                target.attr( 'transition' ).trim() : '';
                
        } else {
            
            // if it is quiz type, add/set quiz property to pageData object
            pageData.quiz = target;
            
        }
        
        // create new page object using the pageData and set to SBPLUS's
        // currentPage property
        this.currentPage = new Page( pageData );
        
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
        
        // get/set the scrollable height
        var scrollHeight = $( this.tableOfContents.container ).height();
        
        // get/set target's height
        var targetHeight = $( target ).outerHeight();
        
        // get/set target's position
        var targetTop = $( target ).offset().top - targetHeight;
        
        // if target's position is greater than scrollable height
        if ( targetTop > scrollHeight ) {
            
            // smoothly scroll to target but do not align to top
            target.scrollIntoView( { behavior: 'smooth', block: 'end' } );
            
        }
        
        // if target's position is less than target's height
        // i.e., scroll to the top of the list when on the last item
        if ( targetTop < targetHeight ) {
            
            // smoothly scroll to target and do align to top
            target.scrollIntoView( { behavior: 'smooth', block: 'start' } );
            
        }
        
    }, // end updateScroll function
    
    /**************************************************************************
        MENU FUNCTIONS
    **************************************************************************/
        
    openMenuItem: function( id ) {
        
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
            
            menuTitle.html( '<div class="menuTitle">Author Profile</div>' );
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
            
            content = '<p class="name">' + self.xml.setup.author + '</p>';
            content += self.xml.setup.profile;
            break;
            
            case 'sbplus_general_info':
            menuTitle.html( 'General Info' );
            content = self.xml.setup.generalInfo;
            break;
            
            case 'sbplus_settings':
                
                menuTitle.html( 'Settings' );
                
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
        
        if ( self.xml.settings.mathjax === 'on' ) {
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
        $( this.button.widget ).html( '<span class="icon-widget-open"></span>' );
        
        if ( this.layout.isMobile ) {
            media.addClass( 'aspect_ratio' );
            this.resize();
        } else {
            media.removeClass( 'aspect_ratio' )
                    .addClass( 'non_aspect_ratio' ).css( 'height', '100%');
        }
        
        media.removeClass( 'widget_on' ).addClass( 'widget_off' );
        
        this.showWidgetContentIndicator();
        
    },
    
    showWidget: function() {
        
        var media = $( this.layout.media );
        
        $( this.layout.widget ).show();
        $( this.button.widget ).html( '<span class="icon-widget-close"></span>' );
        media.removeClass( 'non_aspect_ratio' )
                .addClass( 'aspect_ratio' ).css( 'height', '' );
        this.resize();
        
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
            
            if ( this.xml.settings.mathjax === 'on' ) {
                MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
            }
            
        } else {
            
            this.hideWidgetContentIndicator();
            $( this.screenReader.hasNotes ).empty();
            
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
                    
                    $( self.widget.content ).css( 'background-image', 'url(' +
                        self.getStorageItem( 'sbplus-logo-loaded', true ) + ')' );
                        
                } ).fail( function() {
                    
                    logoUrl = self.manifest.sbplus_logo_directory + self.manifest.sbplus_logo_default + '.svg';
                    
                    $.get( logoUrl, function() {
                        
                        self.setStorageItem( 'sbplus-logo-loaded', this.url, true );
                        
                        $( self.widget.content ).css( 'background-image', 'url(' +
                            self.getStorageItem( 'sbplus-logo-loaded', true ) + ')' );
                            
                    } );
                    
                } );
                
            } else {
                
                $( self.widget.content ).css( 'background-image', 'url(' +
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
            return urlArray[urlArray.length - 3];
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
        
        return sessionStorage.clear();
        
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
            
            $( '.settings input, .settings select' ).on( 'click', function() {
                
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
                if ( $( '#sbplus_gs_it' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-disable-it', 1 );
                } else {
                    self.setStorageItem( 'sbplus-disable-it', 0 );
                }
                
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





