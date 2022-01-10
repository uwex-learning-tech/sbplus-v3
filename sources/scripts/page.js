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
    
    $( self.mediaContent ).removeClass( 'iframeEmbed' ).empty();
    
    self.gaEventHalfway = false;
    SBPLUS.clearGATimeout();
    
    $(SBPLUS.layout.mediaMsg).addClass( 'hide' ).html('');
    
    removeSecondaryControls();

    // show copy to clipboard button if applicable
    self.showCopyBtn();
    
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
                    
                } ).done( function() {
                    
                    self.captionUrl = this.url;
                    
                } ).always( function() {
                    
                    var html = '<video id="mp" class="video-js vjs-default-skin"></video>';
                    
                    $( self.mediaContent ).addClass( 'show-vjs-poster' );
                    
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
                addSecondaryControls();
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
                
            } ).done( function() {
                
                self.captionUrl = this.url;
                
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

            $( self.mediaContent ).html( '<video id="mp" class="video-js vjs-default-skin vjs-vimeo-tech"></video>' ).promise().done( function() {
                
                self.isVimeo = true;
                self.renderVideoJS();
                self.setWidgets();
                addSecondaryControls();
                
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
                
            } ).done( function() {
                
                self.captionUrl = this.url;
                
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
            addSecondaryControls();
            
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
                    if ( self.isKaltura.status.normal === 2 || self.isKaltura.status.normal === 4 ) {
                    
                        if ( captions !== null ) {

                            self.captionUrl = [];

                            captions.forEach( caption => {

                                if ( caption.label.toLowerCase() != "english (autocaption)" ) {

                                    self.captionUrl.push( {
                                        kind: 'captions',
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
        inactivityTimeout: 0,
        autoplay: isAutoplay,
        preload: "auto",
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
            fullscreenToggle: false,
            children: [
                'PlayToggle',
                'VolumePanel',
                'ProgressControl',
                'RemainingTimeDisplay',
                'PlaybackRateMenuButton',
                'CaptionsButton'
            ]
        }

    };
    
    // autoplay is off for iPhone or iPod
    if( SBPLUS.isIOSDevice() ) {
        options.autoplay = false;
        options.playsinline = true;
        options.nativeControlsForTouch = false;
    }
    
    // set tech order and plugins
    if ( self.isYoutube ) {
        
        options.techOrder = ['youtube'];
        options.sources = [{ type: "video/youtube", src: "https://www.youtube.com/watch?v=" + src + "&modestbranding=1" }];
        options.playbackRates = null;

    } else if ( self.isVimeo ) {
        
        options.techOrder = ["vimeo"];
        options.sources = [{ type: "video/vimeo", src: "https://vimeo.com/" + src }];
        options.playbackRates = null;
        
    }
    
    self.mediaPlayer = videojs( 'mp', options, function onPlayerReady() {
        
        var player = this;
        
        if ( self.isKaltura ) {
            
            if ( isAutoplay === false ) {
                player.poster( self.isKaltura.poster + '/width/900/quality/100' );
            }
            
            player.src( [
			
    			{ src: self.isKaltura.flavors.low, type: "video/mp4", label: "low" },
    			{ src: self.isKaltura.flavors.normal, type: "video/mp4", label: "normal", selected: true },
    			{ src: self.isKaltura.flavors.medium, type: "video/mp4", label: "medium" }
    			
    		] );

            player.controlBar.addChild('QualitySelector');
            
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
        } );
        
        player.on( 'loadedmetadata', function() {
            
            if ( self.isKaltura ) {
                sendKAnalytics(2, self.kaltura.id, self.src, player.duration());
            }
            
        } );
        
        player.on('play', function() {
            
            if ( $(SBPLUS.layout.mediaMsg).is( ':visible' ) ) {
                $(SBPLUS.layout.mediaMsg).addClass( 'hide' ).html('');
            }
            
        } );
        
        player.on( 'playing', function() {
            
          self.isPlaying = true;
          
          if ( self.isKaltura && ka.play === false && ka.replay === false ) {
              
              ka.play = true;
              sendKAnalytics(3, self.kaltura.id, self.src, player.duration());
              
          }
          
          if ( self.isKaltura && ka.replay ) {
              
              ka.replay = false;
              sendKAnalytics(16, self.kaltura.id, self.src, player.duration());
              
          }
          
        });
        
        player.on( 'timeupdate', function() {
          
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
          
        } );
        
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

        // add expand/contract button
        addExpandContractButton( player );
            
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
        
        default:
            
            displayWidgetContent( self.widgetSegments[id] );
            
        break;
        
    }
    
}

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

function addExpandContractButton( vjs ) {

    let Button = videojs.getComponent( 'Button' );
    let expandContractBtn = videojs.extend( Button, {
        constructor: function( player, options ) {
            
            Button.call( this, player, options );
            this.el().setAttribute( 'aria-label','Expand/Contract' );
            this.controlText( 'Expand/Contract' );

            if (document.querySelector( SBPLUS.layout.sbplus ).classList.contains( 'sbplus-vjs-expanded' )) {
                vjs.addClass( 'sbplus-vjs-expanded' );
            }

        },
        handleClick: function() {
            
            if ( vjs.hasClass( 'sbplus-vjs-expanded' ) ) {
                vjs.removeClass( 'sbplus-vjs-expanded' );
                document.querySelector( SBPLUS.layout.sbplus ).classList.remove( 'sbplus-vjs-expanded' );
            } else {
                vjs.addClass( 'sbplus-vjs-expanded' );
                document.querySelector( SBPLUS.layout.sbplus ).classList.add( 'sbplus-vjs-expanded' );
            }
            
        },
        
        buildCSSClass: function() {
            return 'vjs-expand-contract-button vjs-control vjs-button';
        }
        
    } );

    videojs.registerComponent( 'ExpandContractBtn', expandContractBtn );
    vjs.getChild( 'controlBar' ).addChild( 'ExpandContractBtn', {}, 10 );
    
}

function toggleExpandContractView(evt) {

    const layout = document.querySelector( SBPLUS.layout.sbplus );

    if ( layout.classList.contains( 'sbplus-vjs-expanded' ) ) {
        evt.target.classList.remove( 'expanded' );
        layout.classList.remove( 'sbplus-vjs-expanded' );
    } else {
        evt.target.classList.add( 'expanded' )
        layout.classList.add( 'sbplus-vjs-expanded' );
    }

}

function addSecondaryControls() {

    const secondaryControlDiv = document.createElement( 'div' );
    secondaryControlDiv.classList.add( 'sbplus_secondary_controls' );
1
    const expandContractBtn = document.createElement( 'button' );
    expandContractBtn.setAttribute( 'id', 'expand_contract_btn' );
    expandContractBtn.setAttribute( 'title', 'Expand/Contract' );
    expandContractBtn.setAttribute( 'aria-label', 'Expand/Contract' );
    expandContractBtn.setAttribute( 'tabindex', '1' );

    secondaryControlDiv.appendChild(expandContractBtn);
    secondaryControlDiv.addEventListener( 'click', toggleExpandContractView );

    $( SBPLUS.layout.mediaContent ).append( secondaryControlDiv );

}

function removeSecondaryControls() {

    const secondaryControlsDiv = document.querySelector( '.sbplus_secondary_controls' );

    if ( secondaryControlsDiv ) {
        const expandBtn = document.querySelector( '#expand_contract_btn' );
        expandBtn.removeEventListener( 'click', toggleExpandContractView );
    }

}

function sendKAnalytics(type, id, source, duration) {
    
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

function guid() {
    
    function s4() {
        return Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring (1 );
    }
    
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    
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