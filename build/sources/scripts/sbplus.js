function getKalturaStatus(t){var e="";switch(t){case-1:e="ERROR";break;case 0:e="QUEUED (queued for conversion)";break;case 1:e="CONVERTING";break;case 2:e="READY";break;case 3:e="DELETED";break;case 4:e="NOT APPLICABLE";break;default:e="UNKNOWN ERROR (check main entry)"}return e}function getEntryKalturaStatus(t){var e="";switch(t){case-2:e="ERROR IMPORTING";break;case-1:e="ERROR CONVERTING";break;case 0:e="IMPORTING";break;case 1:e="PRECONVERT";break;case 2:e="READY";break;case 3:e="DELETED";break;case 4:e="PENDING MODERATION";break;case 5:e="MODERATE";break;case 6:e="BLOCKED";break;default:e="UNKNOWN ERROR (check entry ID)"}return e}function MenuBar(t,e){this.$id=$("#"+t),this.$rootItems=this.$id.children("li"),this.$items=this.$id.find(".menu-item").not(".separator"),this.$parents=this.$id.find(".menu-parent"),this.$allItems=this.$parents.add(this.$items),this.$activeItem=null,this.vmenu=e,this.bChildOpen=!1,this.keys={tab:9,enter:13,esc:27,space:32,left:37,up:38,right:39,down:40},this.bindHandlers()}var Page=function(t){this.title=t.title,this.type=t.type,this.src=t.src,this.transition=t.transition,this.notes=t.notes,this.widget=t.widget,this.imgType=t.imageFormat,this.isKaltura=!1,this.isAudio=!1,this.mediaPlayer=null,this.video=null,this.transcript=null,this.hasImage=!1,this.root=SBPLUS.manifest.sbplus_root_directory,this.kaltura={loaded:SBPLUS.kalturaLoaded,id:SBPLUS.manifest.sbplus_kaltura.id,flavors:{low:SBPLUS.manifest.sbplus_kaltura.low,normal:SBPLUS.manifest.sbplus_kaltura.normal,high:SBPLUS.manifest.sbplus_kaltura.high}},this.mediaContent=SBPLUS.layout.mediaContent,this.mediaError=SBPLUS.layout.mediaError,$("#ap").length&&videojs("ap").dispose()};Page.prototype.getPageMedia=function(){var t=this;switch(SBPLUS.externalContentLoaded=!1,t.type){case"kaltura":t.kaltura.loaded===!1?$.when($.getScript(t.root+"/scripts/libs/kaltura/mwembedloader.js"),$.getScript(t.root+"/scripts/libs/kaltura/kwidgetgetsources.js"),$.Deferred(function(t){$(t.resolve)})).done(function(){SBPLUS.kalturaLoaded=!0,t.loadKalturaVideoData()}):t.loadKalturaVideoData();break;case"image-audio":t.isAudio=!0;var e="";$.get("assets/pages/"+t.src+"."+t.imgType,function(){t.hasImage=!0}).fail(function(){t.showPageError("NO_IMG")}).always(function(){$.get("assets/audio/"+t.src+".vtt",function(){e='<track kind="subtitles" label="English" srclang="en" src="'+this.url+'" />'}).fail(function(){e=""}).always(function(){var s='<video id="ap" class="video-js vjs-default-skin" webkit-playsinline>'+e+"</video>";$(t.mediaContent).html(s).promise().done(function(){t.renderVideoJS()})}),t.setWidgets()});break;default:t.setWidgets()}},Page.prototype.loadKalturaVideoData=function(){var t=this;t.video={flavors:{},status:{entry:0,low:0,normal:0,high:0},captionUrl:"",duration:""},kWidget.getSources({partnerId:t.kaltura.id,entryId:t.src,callback:function(e){var s=e.captionId,a="",i="";t.video.status.entry=e.status,t.video.duration=e.duration;for(var n in e.sources){var r=e.sources[n];r.flavorParamsId===t.kaltura.flavors.low&&(t.video.flavors.low=r.src,t.video.status.low=0),r.flavorParamsId===t.kaltura.flavors.normal&&(t.video.flavors.normal=r.src,t.video.status.normal=r.status),r.flavorParamsId===t.kaltura.flavors.high&&(t.video.flavors.high=r.src,t.video.status.high=r.status)}t.video.status.entry>=1&&t.video.status.entry<=2?2===t.video.status.low&&2===t.video.status.normal&&2===t.video.status.high?(null!==s&&(t.video.captionUrl="https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId="+s+"&segmentDuration="+t.video.duration+"&segmentIndex=1"),t.video.captionUrl.length>0&&(a='<track kind="subtitles" label="English" srclang="en" src="'+t.video.captionUrl+'">'),i='<video id="ap" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%" webkit-playsinline>'+a+"</video>",$(t.mediaContent).html(i).promise().done(function(){t.isKaltura=!0,t.renderVideoJS()})):t.showPageError("KAL_NOT_READY"):t.showPageError("KAL_ENTRY_NOT_READY"),t.setWidgets()}})},Page.prototype.renderVideoJS=function(){var t=this,e={techOrder:["html5"],controls:!0,autoplay:!0,preload:"auto",playbackRates:[.5,1,1.5,2],controlBar:{fullscreenToggle:!1}};t.isKaltura&&(e.plugins={videoJsResolutionSwitcher:{default:720}}),t.mediaPlayer=videojs("ap",e,function(){var e=this;t.isKaltura&&e.updateSrc([{src:t.video.flavors.low,type:"video/mp4",label:"low",res:360},{src:t.video.flavors.normal,type:"video/mp4",label:"normal",res:720},{src:t.video.flavors.high,type:"video/mp4",label:"high",res:1080}]),t.isAudio&&(t.hasImage&&e.poster("assets/pages/"+t.src+"."+t.imgType),e.src({type:"audio/mp3",src:"assets/audio/"+t.src+".mp3"}))})},Page.prototype.setWidgets=function(){if(SBPLUS.clearWidgetSegment(),"quiz"!=this.type){var t=0;SBPLUS.isEmpty(this.notes)||(SBPLUS.addSegment("Notes"),t++),null!==this.video&&(SBPLUS.isEmpty(this.video.captionUrl)||(SBPLUS.addSegment("Live Transcript"),t++)),this.widget.length&&(t+=this.widget.length),t>=2?(SBPLUS.showWidgetSegment(),SBPLUS.selectFirstSegment()):SBPLUS.hideWidgetSegment()}},Page.prototype.getWidgetContent=function(t){var e=this;switch(t){case"sbplus_notes":$(SBPLUS.widget.content).html(this.notes);break;case"sbplus_livetranscript":SBPLUS.isEmpty(this.video.captionUrl)||(SBPLUS.externalContentLoaded===!1?$.get(this.video.captionUrl,function(t){SBPLUS.externalContentLoaded=!0,e.transcript=t,$(SBPLUS.widget.content).html(t)}):$(SBPLUS.widget.content).html(e.transcript))}},Page.prototype.showPageError=function(t){var e=this,s="";switch(t){case"NO_IMG":s="<p>The image for this Storybook Page could not be loaded. Please try refreshing your browser. Contact support if you continue to have issues.</p>";break;case"KAL_NOT_READY":s="<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID  "+e.src+"<br><strong>Status</strong>:<br>",s+="Low &mdash; "+getKalturaStatus(e.video.status.low)+"<br>",s+="Normal &mdash; "+getKalturaStatus(e.video.status.normal)+"<br>",s+="High &mdash; "+getKalturaStatus(e.video.status.high)+"</p>";break;case"KAL_ENTRY_NOT_READY":s="<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID "+e.src+"<br><strong>Status</strong>: ",s+=getEntryKalturaStatus(e.video.status.entry)+"</p>"}$(e.mediaError).html(s)},MenuBar.prototype.bindHandlers=function(){var t=this;this.$items.on("mouseenter",function(){return $(this).addClass("menu-hover"),!0}),this.$items.on("mouseout",function(){return $(this).removeClass("menu-hover"),!0}),this.$allItems.on("click",function(){return t.handleClick($(this))}),this.$allItems.on("keydown",function(e){return t.handleKeydown($(this),e)}),this.$allItems.on("keypress",function(e){return t.handleKeypress($(this),e)}),this.$allItems.on("focus",function(e){return t.handleFocus($(this),e)}),this.$allItems.on("blur",function(e){return t.handleBlur($(this),e)}),$(document).on("click",function(e){return t.handleDocumentClick(e)})},MenuBar.prototype.handleMouseEnter=function(t){return t.addClass("menu-hover").attr("aria-expanded","true"),"true"===t.attr("aria-haspopup")&&t.children("ul").attr({"aria-hidden":"false","aria-expanded":"true"}),!0},MenuBar.prototype.handleMouseOut=function(t){return t.removeClass("menu-hover").attr("aria-expanded","false"),!0},MenuBar.prototype.handleMouseLeave=function(t){var e=t.find(".menu-focus");return t.removeClass("menu-hover").attr("aria-expanded","false"),e.length>0&&(this.bChildOpen=!1,e.removeClass("menu-focus"),this.$activeItem=t,t.focus()),t.children("ul").attr({"aria-hidden":"true","aria-expanded":"false"}),!0},MenuBar.prototype.handleClick=function(t){var e=t.parent();if(e.is(".root-level")){var s=t.children("ul").first();"false"===s.attr("aria-hidden")?(t.attr("aria-expanded","false"),s.attr({"aria-hidden":"true","aria-expanded":"false"})):(t.attr("aria-expanded","true"),s.attr({"aria-hidden":"false","aria-expanded":"true"}))}else this.$allItems.removeClass("menu-hover menu-focus"),t.attr("aria-expanded","false"),this.$id.find("ul").not(".root-level").attr({"aria-hidden":"true","aria-expanded":"false"})},MenuBar.prototype.handleFocus=function(t){if(null===this.$activeItem)this.$activeItem=t;else if(t[0]!==this.$activeItem[0])return!0;var e=this.$activeItem.parentsUntil("div").filter("li");if(this.$allItems.removeClass("menu-focus"),this.$activeItem.addClass("menu-focus"),e.addClass("menu-focus"),this.vmenu===!0)if(this.bChildOpen===!0){var s=t.parent();s.is(".root-level")&&"true"===t.attr("aria-haspopup")&&(t.attr("aria-expanded","true"),t.children("ul").attr({"aria-hidden":"false","aria-expanded":"true"}))}else this.vmenu=!1;return!0},MenuBar.prototype.handleBlur=function(t){return t.removeClass("menu-focus"),!0},MenuBar.prototype.handleKeydown=function(t,e){if(e.altKey||e.ctrlKey)return!0;var s=t.parent();switch(e.keyCode){case this.keys.tab:t.attr("aria-expanded","false"),this.$id.find("ul").attr({"aria-hidden":"true","aria-expanded":"false"}),this.$allItems.removeClass("menu-focus"),this.$activeItem=null,this.bChildOpen=!1;break;case this.keys.esc:return t.attr("aria-expanded","false"),s.is(".root-level")?t.children("ul").first().attr({"aria-hidden":"true","aria-expanded":"false"}):(this.$activeItem=s.parent(),this.bChildOpen=!1,this.$activeItem.focus(),s.attr({"aria-hidden":"true","aria-expanded":"false"})),e.stopPropagation(),!1;case this.keys.enter:case this.keys.space:var a=t.parent();if(a.is(".root-level"))t.children("ul").first().attr({"aria-hidden":"false","aria-expanded":"true"});else{this.$allItems.removeClass("menu-hover menu-focus"),this.$id.find("ul").not(".root-level").attr({"aria-hidden":"true","aria-expanded":"false"});var i=this.$activeItem.find("a").attr("id");document.getElementById(i).click(),this.$activeItem=null}return e.stopPropagation(),!1;case this.keys.left:return this.vmenu===!0&&s.is(".root-level")?this.$activeItem=this.moveUp(t):this.$activeItem=this.moveToPrevious(t),this.$activeItem.focus(),e.stopPropagation(),!1;case this.keys.right:return this.vmenu===!0&&s.is(".root-level")?this.$activeItem=this.moveDown(t):this.$activeItem=this.moveToNext(t),this.$activeItem.focus(),e.stopPropagation(),!1;case this.keys.up:return this.vmenu===!0&&s.is(".root-level")?this.$activeItem=this.moveToPrevious(t):this.$activeItem=this.moveUp(t),this.$activeItem.focus(),e.stopPropagation(),!1;case this.keys.down:return this.vmenu===!0&&s.is(".root-level")?this.$activeItem=this.moveToNext(t):this.$activeItem=this.moveDown(t),this.$activeItem.focus(),e.stopPropagation(),!1}return!0},MenuBar.prototype.moveToNext=function(t){var e=t.parent(),s=e.children("li"),a=s.length,i=s.index(t),n=null,r=null;if(e.is(".root-level"))n=i<a-1?t.next():s.first(),"true"===t.attr("aria-haspopup")&&(r=t.children("ul").first(),"false"===r.attr("aria-hidden")&&(t.attr("aria-expanded","false"),r.attr({"aria-hidden":"true","aria-expanded":"false"}),this.bChildOpen=!0)),t.removeClass("menu-focus"),"true"===n.attr("aria-haspopup")&&this.bChildOpen===!0&&(r=n.children("ul").first(),t.attr("aria-expanded","true"),r.attr({"aria-hidden":"false","aria-expanded":"true"}));else if("true"===t.attr("aria-haspopup"))r=t.children("ul").first(),n=r.children("li").first(),t.attr("aria-expanded","true"),r.attr({"aria-hidden":"false","aria-expanded":"true"});else{if(this.vmenu===!0)return t;var o=null,l=null;o=t.parentsUntil("div").filter("ul").not(".root-level"),t.attr("aria-expanded","false"),o.attr({"aria-hidden":"true","aria-expanded":"false"}),o.find("li").removeClass("menu-focus"),o.last().parent().removeClass("menu-focus"),l=o.last().parent(),i=this.$rootItems.index(l),n=i<this.$rootItems.length-1?l.next():this.$rootItems.first(),n.addClass("menu-focus"),"true"===n.attr("aria-haspopup")&&(r=n.children("ul").first(),n=r.children("li").first(),t.attr("aria-expanded","true"),r.attr({"aria-hidden":"false","aria-expanded":"true"}),this.bChildOpen=!0)}return n},MenuBar.prototype.moveToPrevious=function(t){var e=t.parent(),s=e.children("li"),a=s.index(t),i=null,n=null;if(e.is(".root-level"))i=a>0?t.prev():s.last(),"true"===t.attr("aria-haspopup")&&(n=t.children("ul").first(),"false"===n.attr("aria-hidden")&&(t.attr("aria-expanded","false"),n.attr({"aria-hidden":"true","aria-expanded":"false"}),this.bChildOpen=!0)),t.removeClass("menu-focus"),"true"===i.attr("aria-haspopup")&&this.bChildOpen===!0&&(n=i.children("ul").first(),t.attr("aria-expanded","true"),n.attr({"aria-hidden":"false","aria-expanded":"true"}));else{var r=e.parent(),o=r.parent();this.vmenu!==!0&&o.is(".root-level")?(t.attr("aria-expanded","false"),e.attr({"aria-hidden":"true","aria-expanded":"false"}),t.removeClass("menu-focus"),r.removeClass("menu-focus"),a=this.$rootItems.index(r),i=a>0?r.prev():this.$rootItems.last(),i.addClass("menu-focus"),"true"===i.attr("aria-haspopup")&&(n=i.children("ul").first(),t.attr("aria-expanded","true"),n.attr({"aria-hidden":"false","aria-expanded":"true"}),this.bChildOpen=!0,i=n.children("li").first())):(i=e.parent(),t.attr("aria-expanded","false"),e.attr({"aria-hidden":"true","aria-expanded":"false"}),t.removeClass("menu-focus"),this.vmenu===!0&&(this.bChildOpen=!1))}return i},MenuBar.prototype.moveDown=function(t,e){var s=t.parent(),a=s.children("li").not(".separator"),i=a.length,n=a.index(t),r=null,o=null;if(s.is(".root-level"))return"true"!==t.attr("aria-haspopup")?t:(o=t.children("ul").first(),r=o.children("li").first(),$(o.parent()).attr("aria-expanded","true"),t.attr("aria-expanded","true"),o.attr({"aria-hidden":"false","aria-expanded":"true"}),r);if(e){var l=!1,u=n+1;for(u===i&&(u=0);u!==n;){var d=a.eq(u).html().charAt(0);if(d.toLowerCase()===e){l=!0;break}u+=1,u===i&&(u=0)}return l===!0?(r=a.eq(u),t.removeClass("menu-focus"),r):t}return r=n<i-1?a.eq(n+1):a.first(),t.removeClass("menu-focus"),r},MenuBar.prototype.moveUp=function(t){var e=t.parent(),s=e.children("li").not(".separator"),a=s.index(t),i=null;return e.is(".root-level")?t:(i=a>0?s.eq(a-1):s.last(),t.removeClass("menu-focus"),i)},MenuBar.prototype.handleKeypress=function(t,e){if(e.altKey||e.ctrlKey||e.shiftKey)return!0;switch(e.keyCode){case this.keys.tab:return!0;case this.keys.esc:case this.keys.up:case this.keys.down:case this.keys.left:case this.keys.right:return e.stopPropagation(),!1;default:var s=String.fromCharCode(e.which);return this.$activeItem=this.moveDown(t,s),this.$activeItem.focus(),e.stopPropagation(),!1}},MenuBar.prototype.handleDocumentClick=function(){return this.$allItems.removeClass("menu-focus"),this.$activeItem=null,!0};var SBPLUS=SBPLUS||{layout:null,splash:null,banner:null,tableOfContents:null,totalPages:0,widget:null,button:null,menu:null,manifest:null,manifestLoaded:!1,manifestOptionsLoaded:!1,templateLoaded:!1,xml:null,xmlLoaded:!1,xmlParsed:!1,splashScreenRendered:!1,beforePresentingDone:!1,presentationStarted:!1,currentPage:null,kalturaLoaded:!1,externalContentLoaded:!1,hasError:!1,go:function(){if(null!==this.manifest)return"Storybook Plus is already in ready state.";var t=this;this.layout={isMobile:!1,html:"html",wrapper:".sbplus_wrapper",sbplus:"#sbplus",errorScreen:"#sbplus_error_screen",widget:"#sbplus_widget",media:"#sbplus_media_wrapper",mediaContent:"#sbplus_media_wrapper .sbplus_media_content",mediaError:"#sbplus_media_wrapper .sbplus_media_error",sidebar:"#sbplus_right_col",pageStatus:"#sbplus_page_status",dwnldMenu:null},this.banner={title:"#sbplus_lession_title",author:"#sbplus_author_name"},this.splash={screen:"#sbplus_splash_screen",title:"#sbplus_presentation_info .sb_title",subtitle:"#sbplus_presentation_info .sb_subtitle",author:"#sbplus_presentation_info .sb_author",duration:"#sbplus_presentation_info .sb_duration"},this.tableOfContents={container:"#sbplus_table_of_contents_wrapper",header:".section .header",page:".section .list .item"},this.widget={bar:"#sbplus_widget .tab_segment",segment:"#sbplus_widget .widget_controls_bar .tab_segment",segments:[],content:"#sbplus_widget .segment_content"},this.button={start:"#sbplus_start_btn",resume:"#sbplus_resume_btn",download:"#sbplus_download_btn",widget:"#sbplus_widget_btn",sidebar:"#sbplus_sidebar_btn",author:"#sbplus_author_name",menu:"#sbplus_menu_btn",next:"#sbplus_next_btn",prev:"#sbplus_previous_btn"},this.menu={menuPanel:"#sbplus_menu_items_wrapper",menuBar:"#sbplus_sub_bar",menuList:"#sbplus_menu_items_wrapper .list",menuItem:"#sbplus_menu_items_wrapper .menu.item",menuContentWrapper:"#menu_item_content",menuContent:"#menu_item_content .content"},$.getJSON(this.getManifestUrl(),function(e){t.manifestLoaded=!0,t.manifest=e,t.loadTemplate()}).fail(function(){var e='<div class="error">';e+="<p><strong>Storybook Plus Error:</strong> ",e+="failed to load the manifest file.<br>",e+="Expecting: <code>"+this.url+"</code></p>",e+="</div>",$(t.layout.wrapper).html(e)})},loadTemplate:function(){if(!this.manifestLoaded||this.templateLoaded!==!1)return"Storybook Plus template already loaded.";var t=this,e=this.manifest.sbplus_root_directory;e+="scripts/templates/sbplus.tpl",$.get(e,function(e){return t.templateLoaded=!0,$(t.layout.wrapper).html(e),t.beforePresenting(),0===t.checkForSupport()?(t.hasError=!0,t.showErrorScreen("support"),!1):(t.loadXML(),void $(window).on("resize",t.resize.bind(t)))}).fail(function(){var e='<div class="error">';e+="<p><strong>Storybook Plus Error:</strong> ",e+="failed to load template.<br>",e+="Expecting: <code>"+this.url+"</code></p>",e+="</div>",$(t.layout.wrapper).html(e)})},beforePresenting:function(){if(this.manifestLoaded&&this.templateLoaded&&this.beforePresentingDone===!1){this.beforePresentingDone=!0,this.resize(),this.setURLOptions();var t=$(this.tableOfContents.header);1===t.length&&t.hide().off("click"),this.setManifestOptions()}},loadXML:function(){if(this.beforePresentingDone!==!0||this.xmlLoaded!==!1)return"XML already loaded.";var t=this,e="assets/sbplus.xml";$.get(e,function(e){t.xmlLoaded=!0,t.parseXMLData(e)}).fail(function(e,s){t.hasError=!0,"parsererror"===s?t.showErrorScreen("parser"):t.showErrorScreen("xml")})},parseXMLData:function(t){if(!this.xmlLoaded||this.xmlParsed!==!1)return"XML already parsed.";var e=this,s=$(t),a=s.find("storybook"),i=s.find("setup"),n=a.attr("accent").trim(),r=a.attr("pageImgFormat").toLowerCase().trim(),o=a.attr("analytics").toLowerCase().trim(),l=a.attr("mathjax").toLowerCase().trim(),u=a.attr("xmlVersion"),d=i.attr("program").toLowerCase().trim(),p=i.attr("course").toLowerCase().trim(),h=this.stripScript(i.find("title").text().trim()),c=this.stripScript(i.find("subtitle").text().trim()),m=i.find("length").text().trim(),b=i.find("author"),f=this.stripScript(i.find("generalInfo").text().trim()),g=s.find("section");this.isEmpty(n)&&(n=this.manifest.sbplus_default_accent),this.isEmpty(r)&&(r="jpg"),"on"!==o&&(o="off"),"on"!==l&&(l="off"),this.xml={settings:{accent:n,imgType:r,analytics:o,mathjax:l,version:u},setup:{program:d,course:p,title:h,subtitle:c,authorPhoto:"",duration:m,generalInfo:f},sections:g};var v=this.sanitize(b.attr("name").trim()),_=this.manifest.sbplus_author_directory+v+".json";$.ajax({crossDomain:!0,type:"GET",dataType:"jsonp",jsonpCallback:"author",url:_}).done(function(t){e.xml.setup.author=t.name,e.xml.setup.profile=e.stripScript(t.profile)}).fail(function(){e.xml.setup.author=b.attr("name").trim(),e.xml.setup.profile=e.stripScript(b.text().trim())}).always(function(){e.xmlParsed=!0,e.renderSplashscreen()})},renderSplashscreen:function(){if(!this.xmlParsed||this.splashScreenRendered!==!1)return"Splash screen already rendered.";if($(this.splash.title).html(this.xml.setup.title),$(this.splash.subtitle).html(this.xml.setup.subtitle),$(this.splash.author).html(this.xml.setup.author),$(this.splash.duration).html(this.xml.setup.duration),$(this.button.start).on("click",this.startPresentation.bind(this)),$(this.button.resume).on("click",this.resumePresentation.bind(this)),this.xml.settings.accent!==this.manifest.sbplus_default_accent){var t=this.colorLum(this.xml.settings.accent,.2),e=this.colorContrast(this.xml.settings.accent),s=".sbplus_wrapper button:hover{color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button{color:"+e+";background-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button:hover{background-color:"+t+"}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_downloads a{color:"+this.xml.settings.accent+";border-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_downloads a:hover{color:"+e+";background-color:"+t+"}.sbplus_wrapper #sbplus #sbplus_banner_bar{color:"+e+";background-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_banner_bar #sbplus_menu_area #sbplus_menu_btn{background-color:"+t+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_left_col #sbplus_widget .widget_controls_bar .tab_segment button{color:"+this.xml.settings.accent+";border-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_left_col #sbplus_widget .widget_controls_bar .tab_segment .active{color:"+e+";background:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .item:hover{color:"+e+";background-color:"+t+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .sb_selected{color:"+e+";background-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col #sbplus_table_of_contents_wrapper .section .current{border-left-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover{background-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover a{color:"+e+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus{background-color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus a{color:"+e+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent:hover{color:"+this.xml.settings.accent+"}.sbplus_wrapper #sbplus .sb_active{color:"+this.xml.settings.accent+"}@media only screen and (min-device-width: 737px) and (min-width: 737px){.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_downloads a:first-child{border-left-color:"+this.xml.settings.accent+"}}";$("head").append('<style type="text/css">'+s+"</style>")}"on"===this.xml.settings.mathjax&&$.getScript("https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML",function(){MathJax.Hub.Config({"HTML-CSS":{matchFontHeight:!0}})})},renderPresentation:function(){var t=this;$(this.banner.title).html(this.xml.setup.title),$(this.banner.author).html(this.xml.setup.author),$(this.xml.sections).each(function(e){var s=$(this).attr("title"),a=$(this).find("page"),i='<div class="section">';i+='<div class="header">',i+='<div class="title">',i+=s+"</div>",i+='<div class="icon"><span class="icon-collapse"></span></div></div>',i+='<ul class="list">',t.isEmpty(s)&&(s="Section "+(e+1)),$.each(a,function(s){++t.totalPages,i+='<li class="item" data-count="',i+=t.totalPages+'" data-page="'+e+","+s+'">',i+="quiz"===$(this).attr("type")?'<span class="icon-assessment"></span>':'<span class="numbering">'+t.totalPages+".</span> ",i+=$(this).attr("title")+"</li>"}),i+="</ul></div>",$(t.tableOfContents.container).append(i)}),$(this.layout.pageStatus).find("span.total").html(this.totalPages),this.selectPage("0,0"),$(this.button.sidebar).on("click",this.toggleSidebar.bind(this)),$(this.button.widget).on("click",this.toggleWidget.bind(this)),$(this.button.menu).on("click",this.toggleMenu.bind(this)),$(this.button.author).on("click",function(){t.openMenuItem("sbplus_author_profile")}),$(this.button.next).on("click",this.goToNextPage.bind(this)),$(this.button.prev).on("click",this.goToPreviousPage.bind(this)),$(this.tableOfContents.header).on("click",this.toggleSection.bind(this)),$(this.tableOfContents.page).on("click",this.selectPage.bind(this)),$(this.widget.segment).on("click","button",this.selectSegment.bind(this)),this.layout.dwnldMenu=new MenuBar($(this.button.download)[0].id,!1),"on"===this.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub])},goToNextPage:function(){var t=$(".sb_selected").data("page").split(","),e=Number(t[0]),s=Number(t[1]),a=this.xml.sections.length,i=$(this.xml.sections[e]).find("page").length;s++,s>i-1&&(e++,e>a-1&&(e=0),s=0),this.selectPage(e+","+s)},goToPreviousPage:function(){var t=$(".sb_selected").data("page").split(","),e=Number(t[0]),s=Number(t[1]);s--,s<0&&(e--,e<0&&(e=this.xml.sections.length-1),s=$(this.xml.sections[e]).find("page").length-1),this.selectPage(e+","+s)},updatePageStatus:function(t){$(this.layout.pageStatus).find("span.current").html(t)},hideSplash:function(){return $(this.splash.screen).addClass("fadeOut").one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass("fadeOut").hide(),$(this).off()}),$(this.splash.screen)},startPresentation:function(){var t=this;t.presentationStarted===!1&&(t.hideSplash().promise().done(function(){t.renderPresentation()}),t.presentationStarted=!0)},resumePresentation:function(){var t=this;t.presentationStarted===!1&&(t.hideSplash().promise().done(function(){t.renderPresentation()}),t.presentationStarted=!0)},toggleSidebar:function(){$(this.layout.sidebar).is(":visible")?this.hideSidebar():this.showSidebar()},hideSidebar:function(){var t=$(this.layout.widget),e=$(this.layout.media);$(this.layout.sidebar).hide(),$(this.button.sidebar).removeClass("sb_active"),t.is(":visible")&&t.outerHeight()<=190&&e.removeClass("aspect_ratio").addClass("non_aspect_ratio"),this.resetMenu()},showSidebar:function(){var t=$(this.layout.widget),e=$(this.layout.media);$(this.layout.sidebar).show(),$(this.button.sidebar).addClass("sb_active"),t.is(":visible")&&t.outerHeight()<=190&&e.removeClass("non_aspect_ratio").addClass("aspect_ratio")},toggleSection:function(t){var e=$(this.tableOfContents.header).length;if(e>1){var s;if(t instanceof Object)s=$(t.currentTarget);else{if(Number(t)>e-1)return!1;s=$(".header:eq("+t+")")}var a=$(s.siblings(".list")),i=s.find(".icon");a.is(":visible")?(a.slideUp(),i.html('<span class="icon-open"></span>')):(a.slideDown(),i.html('<span class="icon-collapse"></span>'))}},selectPage:function(t){var e;if(t instanceof Object)e=$(t.currentTarget);else if(e=$('.item[data-page="'+t+'"]'),0===e.length)return!1;if(!e.hasClass("sb_selected")){var s=$(this.tableOfContents.page),a=$(this.tableOfContents.header);if(a.length>1){var i=e.parent().siblings(".header");i.hasClass("current")||(a.removeClass("current"),i.addClass("current"))}s.removeClass("sb_selected"),e.addClass("sb_selected"),this.getPage(e.data("page")),this.updatePageStatus(e.data("count")),this.updateScroll(e[0])}},getPage:function(t){t=t.split(",");var e=t[0],s=t[1],a=$($(this.xml.sections[e]).find("page")[s]),i={title:a.attr("title").trim(),type:a.attr("type").trim().toLowerCase(),transition:a[0].hasAttribute("transition")?a.attr("transition").trim():"",imageFormat:this.xml.settings.imgType};"quiz"!==i.type&&(i.src=a.attr("src").trim(),i.notes=this.stripScript(a.find("note").text().trim()),i.widget=a.find("widget")),this.currentPage=new Page(i),this.currentPage.getPageMedia()},updateScroll:function(t){var e=$(this.tableOfContents.container).height(),s=$(t).outerHeight(),a=$(t).offset().top-s;a>e&&t.scrollIntoView(!1),a<s&&t.scrollIntoView(!0)},toggleMenu:function(){$(this.menu.menuPanel).is(":visible")?this.hideMenu():this.showMenu()},showMenu:function(){$(this.layout.sidebar).is(":visible")||this.showSidebar();var t=$(this.menu.menuPanel);$(this.button.menu).html('<span class="icon-close"></span>').addClass("menu_opened"),$(this.menu.menuBar).find(".title").html("Menu"),t.show().addClass("slideInRight").one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass("slideInRight"),$(this).off()}),$(this.menu.menuItem).on("click",this.openMenuItem.bind(this))},hideMenu:function(){var t=this,e=$(this.menu.menuPanel),s=$(this.menu.menuBar);s.find(".title").html("Table of Contents"),e.addClass("slideOutRight").one("webkitAnimationEnd mozAnimationEnd animationend",function(){e.hide().removeClass("slideOutRight"),t.resetMenu(),$(this).off()})},openMenuItem:function(t){var e=this;$(this.splash.screen).is(":visible")&&this.hideSplash(),$(this.menu.menuPanel).is(":visible")||this.showMenu();var s="";s="string"==typeof t?t:t.currentTarget.id;var a=$(this.menu.menuBar),i=$(this.menu.menuList),n=$(this.menu.menuContentWrapper),r=$(this.menu.menuContent),o=$("#"+s),l=a.find(".backBtn");a.removeClass("full"),a.find(".title").html(o.html()),n.is(":visible")?i.off():(i.hasClass("fadeOutLeft")||i.addClass("fadeOutLeft"),i.one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).hide().removeClass("fadeOutLeft");var t="";switch(s){case"sbplus_author_profile":if(n.prepend('<div class="profileImg"></div>'),0===e.xml.setup.authorPhoto.length){var a=e.xml.setup.author,i=e.sanitize(a),o=e.manifest.sbplus_author_directory+i+".jpg";$.ajax({type:"HEAD",url:"assets/"+i+".jpg"}).done(function(){e.xml.setup.authorPhoto=this.url;var t='<img src="';t+=this.url+'" alt="Photo of '+a+'" crossorigin="Anonymous" />',$(".profileImg").html(t)}).fail(function(){$.ajax({type:"HEAD",url:o}).done(function(){e.xml.setup.authorPhoto=this.url;var t='<img src="';t+=this.url+'" alt="Photo of '+a+'" crossorigin="Anonymous" />',$(".profileImg").html(t)})})}else{var l='<img src="';l+=e.xml.setup.authorPhoto+'" alt="Photo of '+a+'" crossorigin="Anonymous" />',$(".profileImg").prepend(l)}t='<p class="name">'+e.xml.setup.author+"</p>",t+=e.xml.setup.profile;break;case"sbplus_general_info":t=e.xml.setup.generalInfo;break;case"sbplus_settings":t="<p>Settings go here...</p>";break;default:var u=e.manifest.sbplus_custom_menu_items;for(var d in u){var p="sbplus_"+e.sanitize(u[d].name);if(s===p){t=u[d].content;break}}}n.fadeIn(),r.append(t),"on"===e.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub]),$(this).off()}),l.show().prop("disabled",!1).one("click",function(){a.addClass("full").find(".title").html("Menu"),i.show(),i.hasClass("fadeInLeft")||i.addClass("fadeInLeft"),i.one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass("fadeInLeft"),$(this).off()}),n.hide().html('<div class="content"></div>'),$(this).prop("disabled",!0),$(this).off("click")}))},resetMenu:function(){if(!$(this.menu.menuPanel).is(":visible")){var t=$(this.menu.menuBar);t.find(".title").html("Table of Contents"),
t.addClass("full"),t.find(".backBtn").hide().prop("disabled",!0),$(this.button.menu).html("Menu").removeClass("menu_opened"),$(this.menu.menuList).show(),$(this.menu.menuContentWrapper).hide().html('<div class="content"></div>'),$(this.menu.menuItem).off("click")}},toggleWidget:function(){$(this.layout.widget).is(":visible")?this.hideWidget():this.showWidget()},hideWidget:function(){var t=$(this.layout.media);$(this.layout.widget).hide(),$(this.button.widget).removeClass("sb_active"),this.layout.isMobile?(t.addClass("aspect_ratio"),this.resize()):t.removeClass("aspect_ratio").addClass("non_aspect_ratio").css("height","100%")},showWidget:function(){$(this.layout.widget).show(),$(this.button.widget).addClass("sb_active"),$(this.layout.media).removeClass("non_aspect_ratio").addClass("aspect_ratio").css("height",""),this.resize()},selectSegment:function(t){var e=$(this.widget.segment).find("button"),s="",a="";"string"==typeof t?(s=$("#"+t),a=t):(s=$(t.currentTarget),a=s[0].id),e.removeClass("active"),s.addClass("active"),this.currentPage.getWidgetContent(a)},selectFirstSegment:function(){var t=$(this.widget.segment).find("button")[0],e=$(t).attr("id");this.selectSegment(e)},addSegment:function(t){var e='<button id="sbplus_'+this.sanitize(t)+'">'+t+"</button>";this.widget.segments.push(t),"Notes"===t?$(this.widget.bar).prepend(e):$(this.widget.bar).append(e)},showWidgetSegment:function(){this.widget.segments.length>=2&&$(this.widget.segment).show()},hideWidgetSegment:function(){this.widget.segments.length<2&&$(this.widget.segment).hide()},clearWidgetSegment:function(){$(this.widget.segment).empty(),$(this.widget.content).empty(),this.widget.segments=[]},setManifestOptions:function(){if(this.manifestOptionsLoaded!==!1)return"Manifest options already loaded.";this.manifestOptionsLoaded=!0;var t=this.manifest.sbplus_custom_menu_items;if(t.length)for(var e in t){var s=t[e].name,a=this.sanitize(s),i='<li class="menu item" id="sbplus_'+a+'"><span class="icon-'+a+'"></span> '+s+"</li>";$(this.menu.menuList).append(i)}},checkForSupport:function(){return Modernizr.video&&Modernizr.eventlistener&&Modernizr.json&&Modernizr.flexbox&&Modernizr.flexwrap&&Modernizr.csscalc?1:0},showErrorScreen:function(t){if(this.hasError&&t.length){var e=this.manifest.sbplus_root_directory;switch($(this.layout.sbplus).hide(),t){case"support":e+="scripts/templates/support_error.tpl";break;case"xml":e+="scripts/templates/xml_error.tpl";break;case"parser":e+="scripts/templates/xml_parse_error.tpl";break;default:e=""}if(e.length){var s=this;$.get(e,function(t){$(s.layout.errorScreen).html(t).show().addClass("shake").css("display","flex")})}}},calcLayout:function(){var t=$(this.layout.media),e=$(this.layout.widget),s=$(this.layout.sidebar);window.innerWidth>=1826?t.removeClass("aspect_ratio").addClass("non_aspect_ratio"):t.removeClass("non_aspect_ratio").addClass("aspect_ratio"),e.is(":visible")||t.css("height","100%"),window.innerWidth<=740||window.screen.width<=414?this.layout.isMobile=!0:this.layout.isMobile=!1,this.layout.isMobile===!1&&e.outerHeight()<=190&&t.removeClass("aspect_ratio").addClass("non_aspect_ratio"),this.layout.isMobile===!0?s.css("max-height","400px"):s.css("max-height",""),this.calcWidgetHeight()},calcWidgetHeight:function(){var t=$(this.layout.sidebar),e=$(this.layout.widget);this.layout.isMobile===!0?e.css({"min-height":t.outerHeight(),bottom:t.outerHeight()*-1}):e.css({"min-height":"",bottom:""})},resize:function(){this.calcLayout(),this.layout.isMobile&&this.showSidebar()},setURLOptions:function(){var t=$(this.layout.html),e=$(this.layout.wrapper);"1"===this.getUrlParam("fullview")?(t.addClass("sbplus_pop_full"),e.removeClass("sbplus_boxed").addClass("sbplus_full")):(t.removeClass(".sbplus_pop_full"),e.addClass("sbplus_boxed").removeClass("sbplus_full"))},getUrlParam:function(t){var e=new RegExp("[?&]"+t+"=([^&#]*)").exec(window.location.href);return null===e?null:e[1]||0},getManifestUrl:function(){var t=$("#sbplus_configs");return t.length?t[0].href:""},sanitize:function(t){return t.replace(/[^\w]/gi,"").toLowerCase()},isEmpty:function(t){return void 0===t||!t.trim()||0===t.trim().length},colorLum:function(t,e){t=String(t).replace(/[^0-9a-f]/gi,""),t.length<6&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),e=e||0;var s="#",a,i;for(i=0;i<3;i++)a=parseInt(t.substr(2*i,2),16),a=Math.round(Math.min(Math.max(0,a+a*e),255)).toString(16),s+=("00"+a).substr(a.length);return s},colorContrast:function(t){return t=parseInt(t.slice(1),16),t>8388607.5?"#000":"#fff"},stripScript:function(t){if(""!==t||void 0!==t){var e=$("<span>"+$.trim(t)+"</span>");return e.find("script,noscript,style").remove().end(),e.html()}return t}};$(function(){SBPLUS.go()});
//# sourceMappingURL=./sbplus.js.map