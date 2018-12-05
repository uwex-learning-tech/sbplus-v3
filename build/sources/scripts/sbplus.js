/*
 * Storybook Plus
 *
 * @author: Ethan Lin
 * @url: https://github.com/oel-mediateam/sbplus
 * @version: 3.1.4
 * Released 07/27/2018
 *
 * @license: GNU GENERAL PUBLIC LICENSE v3
 *
    Storybook Plus is an web application that serves multimedia contents.
    Copyright (C) 2013-2018  Ethan S. Lin, UWEX CEOEL Media Services

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
"use strict";function getKalturaStatus(e){var t="";switch(e){case-1:t="ERROR";break;case 0:t="QUEUED (queued for conversion)";break;case 1:t="CONVERTING";break;case 2:t="READY";break;case 3:t="DELETED";break;case 4:t="NOT APPLICABLE";break;default:t="UNKNOWN ERROR (check main entry)";break}return t}function getEntryKalturaStatus(e){var t="";switch(e){case-2:t="ERROR IMPORTING";break;case-1:t="ERROR CONVERTING";break;case 0:t="IMPORTING";break;case 1:t="PRECONVERT";break;case 2:t="READY";break;case 3:t="DELETED";break;case 4:t="PENDING MODERATION";break;case 5:t="MODERATE";break;case 6:t="BLOCKED";break;default:t="UNKNOWN ERROR (check entry ID)";break}return t}
// page class helper functions
function displayWidgetContent(e){$(SBPLUS.widget.content).html(e).addClass("fadeIn").one("webkitAnimationEnd mozAnimationEnd animationend",function(){var e=$(this);e.removeClass("fadeIn").off(),e.find("a").length&&e.find("a").each(function(){$(this).attr("target","_blank")})})}function parseTranscript(e){try{var t='<div class="lt-wrapper">',a=e.replace(/\n/g,"<br>").split("<br>"),s=0;(a=cleanArray(SBPLUS.removeEmptyElements(a)))[0].match(/\d{2}:\d{2}:\d{2}.\d{3}/g)&&a[1].match(/\d{2}:\d{2}:\d{2}.\d{3}/g)&&(a[0]="",a=SBPLUS.removeEmptyElements(a));for(var i=1;i<a.length;i+=2){var r=a[i-1].split(" ");t+='<span class="lt-line" data-start="'+toSeconds(r[0])+'" data-end="'+toSeconds(r[2])+'">'+a[i]+"</span> ",17<=++s&&(t+="<br><br>",s=0)}return t+="</div>"}catch(e){return"Oops, SB+ has some complications with the requested caption file."}}function cleanArray(e){var t=(e=SBPLUS.removeEmptyElements(e)).findIndex(firstCueZero);-1===t&&(t=e.indexOf(e.find(firstCue))),e=e.splice(t);for(var a=0;a<e.length;a++)if(e[a].match(/\d{2}:\d{2}:\d{2}.\d{3}/g)){var s=e[a].split(" ");if(!(3<s.length))continue;e[a]=s.splice(0,3).join(" ")}else void 0!==e[a+1]&&(e[a+1].match(/\d{2}:\d{2}:\d{2}.\d{3}/g)||(e[a]=e[a]+" "+e[a+1],e[a+1]=""));return SBPLUS.removeEmptyElements(e)}function guid(){function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()}function firstCueZero(e){return e.match(/(00:00:00.000)/)}function firstCue(e){return e.match(/\d{2}:\d{2}:\d{2}.\d{3}/g)}function toSeconds(e){var t=e.split(":");return 3<=t.length?60*Number(60*t[0])+Number(60*t[1])+Number(t[2]):Number(60*t[0])+Number(t[1])}function isUrl(e){var t;return/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(e)}function questionExists(t){var a=!1;return $.each(quizTracker,function(e){quizTracker[e].id!==t||(a=!0)}),a}function shuffle(e){var t,a,s;for(s=e.length;s;s--)t=Math.floor(Math.random()*s),a=e[s-1],e[s-1]=e[t],e[t]=a}function getCurrentQuizItem(t,a){var s=void 0;return $.each(t,function(e){if(t[e].id===a)return s=e,!1}),s}
/***************************************
    Menu Bar Accessibility Friendly
    https://www.w3.org/TR/wai-aria-practices-1.1/#menu
****************************************/
function MenuBar(e,t){this.id=$("#"+e),this.rootItems=this.id.children("li"),this.items=this.id.find(".menu-item").not(".separator"),this.parents=this.id.find(".menu-parent"),this.allItems=this.parents.add(this.items),this.activeItem=null,this.isVerticalMenu=t,this.bChildOpen=!1,this.keys={tab:9,enter:13,esc:27,space:32,left:37,up:38,right:39,down:40},this.bindHandlers()}var SBPLUS=SBPLUS||{
/***************************************************************************
        VARIABLE / CONSTANT / OBJECT DECLARATIONS
    ***************************************************************************/
// holds the HTML structure classes and IDs
layout:null,splash:null,banner:null,tableOfContents:null,widget:null,button:null,menu:null,screenReader:null,uniqueTitle:"",logo:"",
// holds current and total pages in the presentation
totalPages:0,currentPage:null,targetPage:null,
// holds external data
manifest:null,xml:null,downloads:{},settings:null,
// status flags
manifestLoaded:!1,splashScreenRendered:!1,presentationRendered:!1,beforeXMLLoadingDone:!1,xmlLoaded:!1,xmlParsed:!1,presentationStarted:!1,hasError:!1,kalturaLoaded:!1,alreadyResized:!1,
// videojs
playbackrate:1,
// google analytics variables
gaTimeouts:{start:null,halfway:null,completed:null},
// easter egg variables
clickCount:0,randomNum:Math.floor(6*Math.random()+5),
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
go:function(){
// get manifest data if not set
if(
// set general HTML layout classes and IDs
this.layout={isMobile:!1,html:"html",wrapper:".sbplus_wrapper",sbplus:"#sbplus",errorScreen:"#sbplus_error_screen",widget:"#sbplus_widget",media:"#sbplus_media_wrapper",mediaContent:"#sbplus_media_wrapper .sbplus_media_content",mediaError:"#sbplus_media_wrapper .sbplus_media_error",leftCol:"#sbplus_left_col",sidebar:"#sbplus_right_col",pageStatus:"#sbplus_page_status",quizContainer:"#sbplus_quiz_wrapper",mainControl:"#sbplus_control_bar",dwnldMenu:null,mainMenu:null},
// set HTML banner classes and IDs
this.banner={title:"#sbplus_lession_title",author:"#sbplus_author_name"},
// set HTML splashscreen classes and IDs
this.splash={screen:"#sbplus_splash_screen",background:"#sb_splash_bg",title:"#sbplus_presentation_info .sb_title",subtitle:"#sbplus_presentation_info .sb_subtitle",author:"#sbplus_presentation_info .sb_author",duration:"#sbplus_presentation_info .sb_duration",downloadBar:"#sbplus_presentation_info .sb_downloads"},
// set HTML table of contents classes and IDs
this.tableOfContents={container:"#sbplus_table_of_contents_wrapper",header:".section .header",page:".section .list .item"},
// set HTML widget classes and IDs
this.widget={bar:"#sbplus_widget .widget_controls_bar",segment:"#sbplus_widget .widget_controls_bar .tab_segment",segments:[],content:"#sbplus_widget .segment_content"},
// set HTML button classes and IDs
this.button={start:"#sbplus_start_btn",resume:"#sbplus_resume_btn",downloadWrapper:"#sbplus_download_btn_wrapper",download:"#sbplus_download_btn",downloadMenu:"#sbplus_download_btn .menu-parent .downloadFiles",widget:"#sbplus_widget_btn",widgetTip:"#sbplus_widget_btn .btnTip",sidebar:"#sbplus_sidebar_btn",author:"#sbplus_author_name",menu:"#sbplus_menu_btn",menuClose:"#sbplus_menu_close_btn",next:"#sbplus_next_btn",prev:"#sbplus_previous_btn"},
// set HTML menu classes and IDs
this.menu={menuList:"#sbplus_menu_btn_wrapper .menu",menuContentList:"#menu_item_content .menu",menuBarTitle:"#menu_item_content .sbplus_menu_title_bar .title",menuContentWrapper:"#menu_item_content",menuContent:"#menu_item_content .content",menuSavingMsg:"#save_settings"},
// set screen reader classes and IDs
this.screenReader={pageStatus:".sr-page-status",currentPage:".sr-page-status .sr-current-page",totalPages:".sr-page-status .sr-total-pages",pageTitle:".sr-page-status .sr-page-title",hasNotes:".sr-page-status .sr-has-notes"},null===this.manifest){var t=this;
// use AJAX load the manifest JSON data using the
// url returned by the getManifestURL function
$.getJSON(t.getManifestUrl(),function(e){
// set the JSON data to the class manifest object
t.manifest=e,t.manifestLoaded=!0,
// set an event listener to unload all session storage on HTML
// page refresh/reload or closing
$(window).on("unload",t.removeAllSessionStorage.bind(t)),t.isEmpty(t.manifest.sbplus_root_directory)&&(t.manifest.sbplus_root_directory="sources/"),
// called the loadTemplate functiont load Storybook Plus's
// HTML structure
/* !! SHOULD BE THE LAST THING TO BE CALLED IN THIS BLOCK!! */
t.loadTemplate()}).fail(function(){// when manifest fail to load...
// set an error message
var e='<div class="error">';e+="<p><strong>Storybook Plus Error:</strong> ",e+="failed to load the manifest file.<br>",e+="Expecting: <code>"+this.url+"</code></p>",e+="</div>",
// display the error message to the HTML page
$(t.layout.wrapper).html(e)})}},// end go function
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
loadTemplate:function(){var t=this;if(t.manifestLoaded){
// set the template URL for the sbplus.tpl file
var e=t.manifest.sbplus_root_directory;e+="scripts/templates/sbplus.tpl",
// AJAX call and load the sbplus.tpl template
$.get(e,function(e){
// show support error is any
if(
// output the template date to the HTML/DOM
$(t.layout.wrapper).html(e),
// set an event listener to resize elements on viewport resize
$(window).on("resize",t.resize.bind(t)),0===t.checkForSupport())return t.hasError=!0,t.showErrorScreen("support"),!1;// EXIT & STOP FURTHER SCRIPT EXECUTION
// execute tasks before loading external XML data
t.beforeXMLLoading(),
// load the data from the external XML file
t.loadXML()}).fail(function(){// when fail to load the template
// set an error message
var e='<div class="error">';e+="<p><strong>Storybook Plus Error:</strong> ",e+="failed to load template.<br>",e+="Expecting: <code>"+this.url+"</code></p>",e+="</div>",
// display the error message to the HTML page
$(t.layout.wrapper).html(e)})}},// end loadTemplate function
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
beforeXMLLoading:function(){
// if manifest and template are loaded and XML was never loaded before
!0===this.manifestLoaded&&!1===this.beforeXMLLoadingDone&&(
// setup the options specified in the URL string query
this.setURLOptions(),
// setup custom menu items specified in the manifest file
this.setManifestCustomMenu(),
// set flag to true
this.beforeXMLLoadingDone=!0)},// end beforeXMLLoading function
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
setManifestCustomMenu:function(){if(this.manifestLoaded){
// set the menu item(s) data from the manifest
var e=this.manifest.sbplus_custom_menu_items;
// if data is exists...
if(e.length)
// loop through the data
for(var t in e){
// set the menu item name
var a=e[t].name,s=this.sanitize(a),i='<li tabindex="-1" role="menuitem" aria-live="polite" class="menu-item sbplus_'+s+'"><a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_'+s+'\');"><span class="icon-'+s+'"></span> '+a+"</a></li>";
// clean and reformat the name
// append the HTML LI tag to the menu list
$(this.menu.menuList).append(i)}
// append/display the menu list to inner menu list
$(this.menu.menuContentList).html($(this.menu.menuList).html())}},// end setManifestCustomMenu function
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
loadXML:function(){if(this.beforeXMLLoadingDone){var a=this,e="assets/sbplus.xml";
// set the path to the XML file
// AJAX call to the XML file
$.get(e,function(e){a.xmlLoaded=!0,
// call function to parse the XML data
// SHOULD BE THE LAST TASK TO BE EXECUTED IN THIS BLOCK
a.parseXMLData(e)}).fail(function(e,t){// when fail to load XML file
// set error flag to true
a.hasError=!0,
// display appropriate error message based on the status
"parsererror"===t?a.showErrorScreen("parser"):a.showErrorScreen("xml")})}},// end loadXML function
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
parseXMLData:function(e){var t=this,a,s,i,r,n,o,l,u,d,c,p,m,g;if(t.xmlLoaded){
// set the parameter as jQuery set
var h=$(e),b=h.find("storybook"),f=h.find("setup"),v=t.trimAndLower(b.attr("accent")),S=t.trimAndLower(b.attr("pageImgFormat")),w="svg",_=t.trimAndLower(b.attr("analytics")),y="",k=b.attr("xmlVersion"),P="",x=t.trimAndLower(f.attr("course")),L=t.noScript(f.find("title").text().trim()),C=t.noScript(f.find("subtitle").text().trim()),I=f.find("length").text().trim(),q=f.find("author"),E=t.getTextContent(f.find("generalInfo")),B=h.find("section"),U=b.attr("splashImgFormat"),z=f.attr("program");
// set data from the XML to respective variables
// if HotJar site id is set in manifest, get and set HotJar tracking code
if(
// if temporary splash image type is defined...
U&&(
// and if it is not empty...
t.isEmpty(U)||(
// set the splash image type to the temporary value
w=t.trimAndLower(U))),
// if program temporary is defined
z&&(
// set the program to the temporary value
P=t.trimAndLower(z)),
// if accent is empty, set the accent to the vaule in the manifest
t.isEmpty(v)&&(v=t.manifest.sbplus_default_accent),
// if image type is empty, default to jpg
t.isEmpty(S)&&(S="jpg"),
// if analytic is not on, default to off
"on"!==_&&(_="off"),
// if mathjax is not found or empty
t.isEmpty(b.attr("mathjax"))?
// default to off
y="off":
// value in mathjax attribute is on, set to on
"on"===t.trimAndLower(b.attr("mathjax"))&&(y="on"),
// set the parsed data to the class XML object variable
t.xml={settings:{accent:v,imgType:S,splashImgType:w,analytics:_,mathjax:y,version:k},setup:{program:P,course:x,title:L,subtitle:C,author:q,authorPhoto:"",duration:I,generalInfo:E},sections:B},
// get/set the presenation title
t.uniqueTitle=t.sanitize(t.xml.setup.title),""!=t.manifest.sbplus_hotjar_site_id){var T=Number(t.manifest.sbplus_hotjar_site_id);u=window,d=document,c="https://static.hotjar.com/c/hotjar-",p=".js?sv=",u.hj=u.hj||function(){(u.hj.q=u.hj.q||[]).push(arguments)},u._hjSettings={hjid:T,hjsv:6},m=d.getElementsByTagName("head")[0],(g=d.createElement("script")).async=1,g.src=c+u._hjSettings.hjid+p+u._hjSettings.hjsv,m.appendChild(g)}
// if analytics is on, get and set Google analtyics tracking
if("on"===t.xml.settings.analytics&&(a=window,s=document,i="script",r="//www.google-analytics.com/analytics.js",n="ga",a.GoogleAnalyticsObject=n,a.ga=a.ga||function(){(a.ga.q=a.ga.q||[]).push(arguments)},a.ga.l=1*new Date,o=s.createElement(i),l=s.getElementsByTagName(i)[0],o.async=1,o.src=r,l.parentNode.insertBefore(o,l),ga("create",t.manifest.sbplus_google_tracking_id,"auto"),ga("set",{appName:"SBPLUS",appVersion:t.xml.settings.version})),q.length){
// set author name and path to the profile to respective variable
var A=t.sanitize(q.attr("name").trim()),M=t.manifest.sbplus_author_directory+A+".json";t.xml.setup.author=q.attr("name").trim(),
// if author data in XML is empty
t.isEmpty(q.text())&&!t.isEmpty(A)?
// get centralized author name and profile via AJAX
$.ajax({crossDomain:!0,type:"GET",dataType:"jsonp",jsonpCallback:"author",url:M}).done(function(e){// when done, set author and profile
t.xml.setup.profile=e,t.xmlParsed=!0,t.renderSplashscreen()}).fail(function(){// when fail, default to the values in XML
t.xml.setup.profile=t.getTextContent(q),t.xmlParsed=!0,t.renderSplashscreen()}):(// if not
// get the values in the XML
t.xml.setup.profile=t.getTextContent(q),t.xmlParsed=!0,t.renderSplashscreen())}}},// end parseXMLData function
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
renderSplashscreen:function(){var s=this;if(!0===s.xmlParsed&&!1===s.splashScreenRendered){
// set inital local storage settings
!1===s.hasStorageItem("sbplus-hide-widget")&&s.setStorageItem("sbplus-hide-widget",0),!1===s.hasStorageItem("sbplus-hide-sidebar")&&s.setStorageItem("sbplus-hide-sidebar",0),!1===s.hasStorageItem("sbplus-disable-it")&&s.setStorageItem("sbplus-disable-it",1),!1===s.hasStorageItem("sbplus-autoplay")&&s.setStorageItem("sbplus-autoplay",1),!1===s.hasStorageItem("sbplus-volume")&&s.setStorageItem("sbplus-volume",.8),!1===s.hasStorageItem("sbplus-playbackrate")?s.setStorageItem("sbplus-playbackrate",1):s.playbackrate=s.getStorageItem("sbplus-playbackrate"),!1===s.hasStorageItem("sbplus-subtitle")&&s.setStorageItem("sbplus-subtitle",0),s.hasStorageItem("sbplus-disable-it")&&s.deleteStorageItem("sbplus-disable-it"),
// if autoplay for videoJS is on, add a class to the body tag
"1"==s.getStorageItem("sbplus-autoplay")&&$(s.layout.wrapper).addClass("sbplus_autoplay_on"),
// set the HTML page title
$(document).attr("title",s.xml.setup.title),
// display data to the splash screen
$(s.splash.title).html(s.xml.setup.title),$(s.splash.subtitle).html(s.xml.setup.subtitle),$(s.splash.author).html(s.xml.setup.author),$(s.splash.duration).html(s.xml.setup.duration),
// get splash image background via AJAX
$.ajax({// get the splash image from the local first
url:"assets/splash."+s.xml.settings.splashImgType,type:"head"}).done(function(){// when successful and done
// display the image
s.setSplashImage(this.url)}).fail(function(){// when failed, get from the server
// get the program and course value
var e=s.xml.setup.program,t=s.xml.setup.course;
// if both program and course are not empty,
// get the image from the server
if(
// if program is empty
s.isEmpty(e)&&(
// set program to the program directory name from the URL
e=SBPLUS.getProgramDirectory()),
// if course is empty
s.isEmpty(t)&&(
// set course to the course directory name from the URL
t=SBPLUS.getCourseDirectory(),
// if course is still empty
s.isEmpty(t)&&(
// set course name to default
t="default")),
// append image file extension to course value
t+="."+s.xml.settings.splashImgType,s.isEmpty(e)||s.isEmpty(t))s.setSplashImage(s.manifest.sbplus_root_directory+"images/default_splash.svg");else{
// set the path to the image
var a=s.manifest.sbplus_splash_directory+e+"/"+t;
// load the image via AJAX
$.ajax({url:a,type:"HEAD"}).done(function(){// when successful and done
// display the image
s.setSplashImage(this.url)}).fail(function(){s.setSplashImage(s.manifest.sbplus_root_directory+"images/default_splash.svg")})}}),
// set event listener to the start button
$(s.button.start).on("click",s.startPresentation.bind(s)),
// if local storage has a value for the matching presentation title
s.hasStorageItem("sbplus-"+s.uniqueTitle)?
// set event listener to the resume button
$(s.button.resume).on("click",s.resumePresentation.bind(s)):
// hide the resume button
$(s.button.resume).hide(0,function(){$(s).attr("tabindex","-1")});
// set downloadable file name from the course directory name in URL
var e=SBPLUS.getCourseDirectory();
// if file name is empty, default to 'default'
// if accent does not match the default accent
if(s.isEmpty(e)&&(e="default"),
// use AJAX to get PDF file
$.ajax({url:e+".pdf",type:"HEAD"}).done(function(){s.downloads.transcript=this.url,$(s.splash.downloadBar).append('<a href="'+s.downloads.transcript+'" tabindex="1" download="'+e+"\" aria-label=\"Download transcript file\" onclick=\"SBPLUS.sendToGA( 'transcriptLink', 'click', '"+e+'\', 4, 0 );"><span class="icon-download"></span> Transcript</a>')}),
// use AJAX to get video file
$.ajax({url:e+".mp4",type:"HEAD"}).done(function(){s.downloads.video=this.url,$(s.splash.downloadBar).append('<a href="'+s.downloads.video+'" tabindex="1" download="'+e+"\" aria-label=\"Download video file\" onclick=\"SBPLUS.sendToGA( 'videoLink', 'click', '"+e+'\', 4, 0 );"><span class="icon-download"></span> Video</a>')}),
// use AJAX to get audio file
$.ajax({url:e+".mp3",type:"HEAD"}).done(function(){s.downloads.audio=this.url,$(s.splash.downloadBar).append('<a href="'+s.downloads.audio+'" tabindex="1" download="'+e+"\" aria-label=\"Download audio file\" onclick=\"SBPLUS.sendToGA( 'audioLink', 'click', '"+e+'\', 4, 0 );"><span class="icon-download"></span> Audio</a>')}),
// use AJAX to get zipped/packaged file
$.ajax({url:e+".zip",type:"HEAD"}).done(function(){s.downloads.supplement=this.url,$(s.splash.downloadBar).append('<a href="'+s.downloads.supplement+'" tabindex="1" download="'+e+"\" aria-label=\"Download zipped supplement file\" onclick=\"SBPLUS.sendToGA( 'supplementLink', 'click', '"+e+'\', 4, 0 );"><span class="icon-download"></span> Supplement</a>')}),s.xml.settings.accent!==s.manifest.sbplus_default_accent){
// set hover color hex value
var t=s.colorLum(s.xml.settings.accent,.2),a=s.colorContrast(s.xml.settings.accent),i=".sbplus_wrapper button:hover{color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button{color:"+a+";background-color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_splash_screen #sbplus_presentation_info .sb_cta button:hover{background-color:"+t+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .item:hover{color:"+a+";background-color:"+t+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col .list .sb_selected{color:"+a+";background-color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_content_wrapper #sbplus_right_col #sbplus_table_of_contents_wrapper .section .current{border-left-color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover{background-color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:hover a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:hover a{color:"+a+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .active, .sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .active{color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus{background-color:"+s.xml.settings.accent+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent .menu .menu-item:focus a,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent .menu .menu-item:focus a{color:"+a+"}.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper #sbplus_download_btn .menu-parent:hover,.sbplus_wrapper #sbplus #sbplus_control_bar #sbplus_right_controls #sbplus_download_btn_wrapper .root-level .menu-parent:hover{color:"+s.xml.settings.accent+"}";
// set the text color hex value
// append the style/css to the HTML head
$("head").append('<style type="text/css">'+i+"</style>")}
// if mathjax if turned on
"on"===s.xml.settings.mathjax&&
// load the MathJAX script from a CDN
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",function(){MathJax.Hub.Config({"HTML-CSS":{matchFontHeight:!0}})}),
// flag the splash screen as rendered
s.splashScreenRendered=!0,window.self!==window.top&&0<=document.referrer.indexOf("uwli.courses")&&$(s.layout.wrapper).addClass("loaded-in-iframe"),"on"===s.xml.settings.analytics&&ga("send","screenview",{screenName:"Splash"}),s.resize()}},// end renderSplashScreen function
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
setSplashImage:function(e){
// if parameter is not empty, set the background image
e&&$(this.splash.background).css("background-image","url("+e+")")},
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
hideSplash:function(){
// if presentation is rendered...
this.presentationRendered&&
// add fadeOut class and listen for animation completion event
$(this.splash.screen).addClass("fadeOut").one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass("fadeOut").hide(),$(this).off()}),
// if splash screen is visible or presentation is not rendered
$(this.splash.screen).is(":visible")&&!1!==this.presentationRendered||
// throw a warning to the console
console.warn("hideSplash should be called after renderPresentation.")},
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
startPresentation:function(){var e=this;
// if presentation has not started, hide splash and render presenation
!1===this.presentationStarted&&(
// render presenation
e.renderPresentation().promise().done(function(){
// hide splash screen
e.hideSplash(),
// select the first page
e.selectPage("0,0"),"on"===e.xml.settings.analytics&&ga("send","screenview",{screenName:"Main"})}),e.presentationStarted=!0,e.sendToGA("PresentationStartBtn","click",e.getCourseDirectory(),0,0))},
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
resumePresentation:function(){var e=this;
// if presentation has not started, hide splash, set resuming flag
// to true and render presenation
!1===e.presentationStarted&&(
// render presentation
e.renderPresentation().promise().done(function(){
// hide screen
e.hideSplash(),
// select the page that was set in the local storage data
e.selectPage(e.getStorageItem("sbplus-"+e.uniqueTitle))}),e.presentationStarted=!0,e.sendToGA("PresentationResumeBtn","click",e.getCourseDirectory(),0,0))},
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
renderPresentation:function(){if(!1===this.presentationRendered){var i=this;
// before presenting; apply local storage settings
// add download button if downloads object is not empty
if("1"===i.getStorageItem("sbplus-hide-widget")&&i.hideWidget(),"1"===i.getStorageItem("sbplus-hide-sidebar")&&i.hideSidebar(),
// remove focus (from the hidden elements)
$(i.layout.sbplus).blur(),
// display presentation title and author to the black banner bar
$(i.banner.title).html(i.xml.setup.title),$(i.banner.author).html(i.xml.setup.author),
// display table of contents
$(i.xml.sections).each(function(t){
// set section head title
var e=$(this).attr("title"),a=$(this).find("page"),s='<div class="section">';
// set page array data
// if there is more than 2 sections...
2<=$(i.xml.sections).length&&(
// if sectionHead title is empty, set a default title
i.isEmpty(e)&&(e="Section "+(t+1)),
// append section head HTML to DOM
s+='<div class="header">',s+='<div class="title">',s+=e+"</div>",s+='<div class="icon"><span class="icon-collapse"></span></div></div>'),
// append pages (opening list tag) HTML to DOM
s+='<ul class="list">',
// for each page
$.each(a,function(e){
// increment total page
++i.totalPages,
// append opening list item tag to DOM
s+='<li class="item" data-count="',s+=i.totalPages+'" data-page="'+t+","+e+'">',
// if page is quiz
"quiz"===$(this).attr("type")?
// append an quiz icon
s+='<span class="icon-assessment"></span>':
// append a count number
s+='<span class="numbering">'+i.totalPages+".</span> ",
// append page title and close the list item tag
s+=$(this).attr("title")+"</li>"}),
// appending closing list and div tag
s+="</ul></div>",
// append the section HTML to the table of content DOM area
$(i.tableOfContents.container).append(s)}),
// set total page to the status bar and to the screen reader text holder
$(i.layout.pageStatus).find("span.total").html(i.totalPages),$(i.screenReader.totalPages).html(i.totalPages),
// set event listeners
$(i.button.sidebar).on("click",i.toggleSidebar.bind(i)),$(i.button.widget).on("click",i.toggleWidget.bind(i)),
// if author is missing hide author button and menu item
i.xml.setup.author.length?$(i.button.author).on("click",function(){i.openMenuItem("sbplus_author_profile")}):$(i.button.author).prop("disabled",!0),$(i.button.next).on("click",i.goToNextPage.bind(i)),$(i.button.prev).on("click",i.goToPreviousPage.bind(i)),2<=$(i.xml.sections).length&&$(i.tableOfContents.header).on("click",i.toggleSection.bind(i)),$(i.tableOfContents.page).on("click",i.selectPage.bind(i)),$(i.widget.segment).on("click","button",i.selectSegment.bind(i)),
// add main menu button
i.layout.mainMenu=new MenuBar($(i.button.menu)[0].id,!1),
// hide general info under main menu if empty
i.isEmpty(i.xml.setup.generalInfo)&&$(".sbplus_general_info").hide(),$.isEmptyObject(i.downloads))
// hide the download button if download object is empty
$(i.button.downloadWrapper).hide();else
// set download items
for(var e in i.layout.dwnldMenu=new MenuBar($(i.button.download)[0].id,!1),i.downloads)SBPLUS.isEmpty(i.downloads[e])||$(i.button.downloadMenu).append('<li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite"><a download="'+i.xml.setup.title+'" href="'+i.downloads[e]+'" onclick="SBPLUS.sendToGA( \''+e+"Link', 'click', '"+i.getCourseDirectory()+"', 4, 0 );\">"+i.capitalizeFirstLetter(e)+"</a></li>");
// queue MathJAX if turned on
return"on"===i.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub]),
// easter egg event listener
$("#sbplus_menu_btn .menu-parent").on("click",i.burgerBurger.bind(i)),(window.innerWidth<900||window.screen.width<=414)&&this.hideWidget(),this.presentationRendered=!0,
// resize elements after everything is put in place
i.resize(),$(i.layout.sbplus)}},// end renderPresentation function
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
goToNextPage:function(){
// get/set current page array
var e=$(".sb_selected").data("page").split(","),t=Number(e[0]),a=Number(e[1]),s=this.xml.sections.length,i;
// set section number
// if current page number is greater than total number of page in
// current section
$(this.xml.sections[t]).find("page").length-1<
// increment current page number
++a&&(
// increment current section number
// if current section number is greater total number of sections
s-1<++t&&(
// set current section number to 0 or the first section number
t=0),
// set page number to 0 or the first page in the current section
a=0),
// call selectPage function to get the page with current section and
// and current page number as the arugments
this.selectPage(t+","+a)},// end goToNextPage function
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
goToPreviousPage:function(){
// get/set current page array
var e=$(".sb_selected").data("page").split(","),t=Number(e[0]),a=Number(e[1]);
// set section number
// current page number is less than 0 or the first page
// decrement current page number
--a<0&&(
// decrement current section number
// if current section number is 0 or the first section
--t<0&&(
// set section number to the last section
t=this.xml.sections.length-1),
// set page number to the last page on the current section
a=$(this.xml.sections[t]).find("page").length-1),
// call selectPage function to get the page with current section and
// and current page number as the arugments
this.selectPage(t+","+a)},// end goToPreviousPage function
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
updatePageStatus:function(e){
// display current page number to the status
$(this.layout.pageStatus).find("span.current").html(e)},// end updatePageStatus function
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
toggleSidebar:function(){$(this.layout.sidebar).is(":visible")?this.hideSidebar():this.showSidebar()},// end toggleSidebar function
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
hideSidebar:function(){
// set media rea DOM jQuery set
var e=$(this.layout.media);
// hide the sidebar
$(this.layout.sidebar).hide(),
// update the icon on the toggle sidebar button
$(this.button.sidebar).html('<span class="icon-sidebar-open"></span>'),
// remove sidebar_on and add sidebar_off
e.removeClass("sidebar_on").addClass("sidebar_off")},// end hideSidebar function
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
showSidebar:function(){
// set media rea DOM jQuery set
var e=$(this.layout.media);
// hide the sidebar
$(this.layout.sidebar).show(),
// update the icon on the toggle sidebar button
$(this.button.sidebar).html('<span class="icon-sidebar-close"></span>'),
// remove sidebar_off and add sidebar_on
e.removeClass("sidebar_off").addClass("sidebar_on")},// end showSidebar function
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
toggleSection:function(e){
// get total number of 
var t=$(this.tableOfContents.header).length;
// if total number of section is greater than 1...
if(1<t){
// declare a varible to hold current targeted section
var a;
// if the object is an click event object
if(e instanceof Object)
// set the current section to the current event click target
a=$(e.currentTarget);else{
// if argument is greather than total number of sections
if(Number(e)>t-1)
// exit function
return!1;
// set the current section to the passed argument
a=$(".header:eq("+e+")")}
// if target is visible...
$(a.siblings(".list")).is(":visible")?this.closeSection(a):this.openSection(a)}},// end toggleSection function
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
closeSection:function(e){
// set the target to the list element under the section
var t=$(e.siblings(".list")),a=e.find(".icon");
// the open/collapse icon on the section title bar
// slide up (hide) the list
t.slideUp(),
// update the icon to open icon
a.html('<span class="icon-open"></span>')},
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
openSection:function(e){
// set the target to the list element under the section
var t=$(e.siblings(".list")),a=e.find(".icon");
// the open/collapse icon on the section title bar
// slide down (show) the list
t.slideDown(),
// update the icon to collapse icon
a.html('<span class="icon-collapse"></span>')},
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
selectPage:function(e){
// if the argument is an click event object
if(
// if splash screen is visible...
$(this.splash.screen).is(":visible")&&(
// render the presentation
this.renderPresentation(),
// hide the splash
this.hideSplash(),
// flag the presentationStarted to true
this.presentationStarted=!0),e instanceof Object)
// set target to current click event target
this.targetPage=$(e.currentTarget);else
// if targe page does not exist
if(
// set target to the passed in argument
this.targetPage=$('.item[data-page="'+e+'"]'),0===this.targetPage.length)
// exit function; stop further execution
return!1;
// if target page does not have the sb_selected class
if(!this.targetPage.hasClass("sb_selected")){
// get jQuery set that contain pages
var t=$(this.tableOfContents.page),a=$(this.tableOfContents.header);
// get jQuery set that contain section headers
// if more than one section headers...
if(1<a.length){
// set the target header to targetted page's header
var s=this.targetPage.parent().siblings(".header");
// if targetted header does not have the current class
s.hasClass("current")||(
// remove current class from all section headers
a.removeClass("current"),
// add current class to targetted header
s.addClass("current")),this.openSection(s)}
// remove sb_selected class from all pages
t.removeClass("sb_selected"),
// add sb_selected class to targetted page
this.targetPage.addClass("sb_selected"),
// call the getPage function with targetted page data as parameter
this.getPage(this.targetPage.data("page")),
// update the page status with the targetted page count data
this.updatePageStatus(this.targetPage.data("count")),
// update screen reader status
$(this.screenReader.currentPage).html(this.targetPage.data("count")),
// update the scroll bar to targeted page
$(this.layout.sidebar).is(":visible")&&this.updateScroll(this.targetPage[0])}},// end selectPage function
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
getPage:function(e){
// set section to page array index 0
var t=(
// split the page value into an array
e=e.split(","))[0],a=e[1],s=$($(this.xml.sections[t]).find("page")[a]),i={xml:s,title:s.attr("title").trim(),type:s.attr("type").trim().toLowerCase()};
// set item to page array index 1
// set number property to the pageData object
i.number=e,
// if page type is not quiz
"quiz"!==i.type?(
// add/set additional property to the pageData object
i.src=s.attr("src").trim(),i.notes=this.getTextContent(s.find("note")),i.widget=s.find("widget"),i.frames=s.find("frame"),i.imageFormat=this.xml.settings.imgType,i.transition=s[0].hasAttribute("transition")?s.attr("transition").trim():"",
// create new page object using the pageData and set to SBPLUS's
// currentPage property
this.currentPage=new Page(i)):this.currentPage=new Page(i,s),
// get the page media
this.currentPage.getPageMedia(),
// update the page title to the screen reader
$(this.screenReader.pageTitle).html(i.title)},// end getPage function
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
updateScroll:function(e){
// set the obj from the parameter
var t=e;
// if the target is not visible
$(t).is(":visible")||(
// target its parent's siblings
t=$(t).parent().siblings(".header")[0]);
// get/set the scrollable height
var a=$(this.tableOfContents.container).height(),s=$(t).outerHeight(),i=$(this.tableOfContents.header),r=$(t).offset().top-s;
// get/set target's height
i.length<=0&&(r+=40),
// if target's position is greater than scrollable height
a<r&&
// smoothly scroll to target but do not align to top
t.scrollIntoView({behavior:"smooth",block:"end"}),
// if target's position is less than target's height
// i.e., scroll to the top of the list when on the last item
r<s&&
// smoothly scroll to target and do align to top
t.scrollIntoView()},// end updateScroll function
/**************************************************************************
        MENU FUNCTIONS
    **************************************************************************/
openMenuItem:function(e){null!=this.currentPage.mediaPlayer&&(this.currentPage.mediaPlayer.paused()||this.currentPage.mediaPlayer.pause());var t=this,a=e,s="",i=$(this.menu.menuContentWrapper),r=$(this.menu.menuContent),n=$(this.menu.menuBarTitle);switch(r.empty(),$(t.menu.menuContentList+" li").removeClass("active"),$(t.menu.menuContentList+" ."+a).addClass("active"),a){case"sbplus_author_profile":if(n.html("Author Profile"),t.xml.setup.author.length){if(r.append('<div class="profileImg"></div>'),0===t.xml.setup.authorPhoto.length){var o=t.xml.setup.author,l=t.sanitize(o),u=t.manifest.sbplus_author_directory+l+".jpg";$.ajax({type:"HEAD",url:"assets/"+l+".jpg"}).done(function(){t.xml.setup.authorPhoto=this.url;var e='<img src="';e+=this.url+'" alt="Photo of '+o+'" crossorigin="Anonymous" />',$(".profileImg").html(e)}).fail(function(){$.ajax({type:"HEAD",url:u}).done(function(){t.xml.setup.authorPhoto=this.url;var e='<img src="';e+=this.url+'" alt="Photo of '+o+'" crossorigin="Anonymous" />',$(".profileImg").html(e)})})}else{var d='<img src="';d+=t.xml.setup.authorPhoto+'" alt="Photo of '+o+'" crossorigin="Anonymous" />',$(".profileImg").prepend(d)}"object"!=typeof t.xml.setup.profile?(s='<p class="name">'+t.xml.setup.author+"</p>",s+=t.noScript(t.xml.setup.profile)):(s='<p class="name">'+t.xml.setup.profile.name+"</p>",s+=t.noScript(t.xml.setup.profile.profile))}else s="No author profile available.";break;case"sbplus_general_info":n.html("General Info"),s=t.isEmpty(t.xml.setup.generalInfo)?"No general information available.":t.xml.setup.generalInfo;break;case"sbplus_settings":n.html("Settings"),Modernizr.localstorage&&Modernizr.sessionstorage?!1===this.hasStorageItem("sbplus-"+t.uniqueTitle+"-settings-loaded",!0)?$.get(t.manifest.sbplus_root_directory+"scripts/templates/settings.tpl",function(e){t.settings=e,t.setStorageItem("sbplus-"+t.uniqueTitle+"-settings-loaded",1,!0),r.append(e),t.afterSettingsLoaded()}):(r.append(t.settings),t.afterSettingsLoaded()):(s="Settings require web browser's local storage and session storage support. ",s+="Your web browser does not support local and session storage or is in private mode.");break;default:var c=t.manifest.sbplus_custom_menu_items;for(var p in c){var m;if(a==="sbplus_"+t.sanitize(c[p].name)){n.html(c[p].name),s=c[p].content;break}}break}i.show(),r.append(s),$(t.button.menuClose).on("click",t.closeMenuContent.bind(t)),"on"===t.xml.settings.analytics&&ga("send","screenview",{screenName:n.html()}),"on"===t.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub])},closeMenuContent:function(){var e=$(this.menu.menuContentWrapper),t;$(this.menu.menuContent).empty(),e.hide(),$(this.button.menuClose).off("click")},burgerBurger:function(){var e=$("span.menu-icon");this.clickCount++,this.clickCount===this.randomNum?(e.removeClass("icon-menu").html("🍔"),this.clickCount=0,this.randomNum=Math.floor(6*Math.random()+5)):e.addClass("icon-menu").empty()},
/**************************************************************************
        WIDGET FUNCTIONS
    **************************************************************************/
toggleWidget:function(){$(this.layout.widget).is(":visible")?this.hideWidget():this.showWidget()},hideWidget:function(){var e=$(this.layout.media);$(this.layout.widget).hide(),$(this.button.widget).find(".icon-widget-open").show(),$(this.button.widget).find(".icon-widget-close").hide(),e.css("height","100%"),e.removeClass("widget_on").addClass("widget_off"),this.showWidgetContentIndicator()},showWidget:function(){var e=$(this.layout.media);$(this.layout.widget).show(),$(this.button.widget).find(".icon-widget-close").show(),$(this.button.widget).find(".icon-widget-open").hide(),e.css("height",""),e.removeClass("widget_off").addClass("widget_on"),this.hideWidgetContentIndicator()},disableWidget:function(){$(this.button.widget).prop("disabled",!0).addClass("sb_disabled")},enableWidget:function(){$(this.button.widget).prop("disabled",!1).removeClass("sb_disabled")},clearWidget:function(){$(this.widget.segment).empty(),$(this.widget.content).empty()},hasWidgetContent:function(){return $(this.widget.segment).find("button").length},showWidgetContentIndicator:function(){this.hasWidgetContent()&&($(this.layout.widget).is(":visible")||$(this.button.widget).addClass("showDot"))},hideWidgetContentIndicator:function(){$(this.button.widget).removeClass("showDot")},selectSegment:function(e){var t=this,a=$(this.widget.segment).find("button");if(t.hasWidgetContent()){t.showWidgetContentIndicator(),$(t.layout.widget).removeClass("noSegments"),$(t.widget.content).css("background-image",""),$(this.screenReader.hasNotes).html("This page contains notes.");var s="",i="";i="string"==typeof e?(s=$("#"+e),e):(s=$(e.currentTarget))[0].id,s.hasClass("active")||(this.currentPage.getWidgetContent(i),a.removeClass("active"),s.addClass("active")),"on"===this.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub])}else if(this.hideWidgetContentIndicator(),$(this.screenReader.hasNotes).empty(),$(this.layout.widget).addClass("noSegments"),t.isEmpty(t.logo)){var r=this.xml.setup.program;SBPLUS.isEmpty(r)&&(r=SBPLUS.getProgramDirectory(),SBPLUS.isEmpty(r)&&(r=this.manifest.sbplus_logo_default));var n=this.manifest.sbplus_logo_directory+r+".svg";$.ajax({url:n,type:"HEAD"}).done(function(){t.logo=this.url,$(t.widget.content).css("background-image","url("+t.logo+")")}).fail(function(){n=t.manifest.sbplus_logo_directory+t.manifest.sbplus_logo_default+".svg",$.ajax({url:n,type:"HEAD"}).done(function(){t.logo=this.url,$(t.widget.content).css("background-image","url("+t.logo+")")}).fail(function(){t.logo=t.manifest.sbplus_root_directory+"images/default_logo.svg"})})}else $(t.widget.content).css("background-image","url("+t.logo+")")},selectFirstSegment:function(){var e=$(this.widget.segment).find("button")[0],t=$(e).attr("id");this.selectSegment(t)},addSegment:function(e){var t='<button id="sbplus_'+this.sanitize(e)+'">'+e+"</button>";this.widget.segments.push(e),"Notes"===e?$(this.widget.segment).prepend(t):$(this.widget.segment).append(t)},clearWidgetSegment:function(){$(this.widget.segment).empty(),$(this.widget.content).empty(),$(this.widget.bg).css("background-image",""),this.widget.segments=[]},
/***************************************************************************
        HELPER FUNCTIONS
    ***************************************************************************/
checkForSupport:function(){return Modernizr.video&&Modernizr.eventlistener&&Modernizr.json&&Modernizr.flexbox&&Modernizr.flexwrap&&Modernizr.csscalc?1:0},showErrorScreen:function(e){if(this.hasError&&e.length){var t=this.manifest.sbplus_root_directory;switch($(this.layout.sbplus).hide(),e){case"support":t+="scripts/templates/support_error.tpl";break;case"xml":t+="scripts/templates/xml_error.tpl";break;case"parser":t+="scripts/templates/xml_parse_error.tpl";break;default:t="";break}if(t.length){var a=this;$.get(t,function(e){$(a.layout.errorScreen).html(e).show().addClass("shake").css("display","flex")})}}},calcLayout:function(){
//         var media = $( this.layout.media );
var e=$(this.layout.widget),t=$(this.layout.sidebar),a=$(this.tableOfContents.container),s=$(this.button.widgetTip);
/*
        if ( widget.is( ':visible' ) || sidebar.is( ':visible' ) ) {
            media.removeClass( 'aspect_ratio' ).addClass( 'non_aspect_ratio' );
        } else {
            media.removeClass( 'non_aspect_ratio' ).addClass( 'aspect_ratio' );
        }
*/
if(window.innerWidth<900||window.screen.width<=414){
//if ( $( this.layout.wrapper ).hasClass( 'loaded-in-iframe' ) === false ) {
this.layout.isMobile=!0,
//                 media.addClass( 'aspect_ratio' );
s.show();var i=$(this.layout.leftCol).height()+$(this.layout.mainControl).height();t.css("height","calc( 100% - "+i+"px )"),e.css("height",t.height()),a.css("height",t.height()-30),
//}
!1===this.alreadyResized&&this.hideWidget(),this.alreadyResized=!0,$(this.layout.wrapper).removeClass("sbplus_boxed")}else this.layout.isMobile=!1,t.css("height",""),
/*
            if ( !widget.is( ':visible' ) ) {
                widget.css( 'height', '100%' );
            } else {
                widget.css( 'height', '' );
            }
*/
e.css("height",""),a.css("height",""),s.hide(),"1"!==this.getUrlParam("fullview")&&$(this.layout.wrapper).addClass("sbplus_boxed")},resize:function(){this.calcLayout(),this.layout.isMobile&&this.showSidebar()},setURLOptions:function(){var e=$(this.layout.html),t=$(this.layout.wrapper);"1"===this.getUrlParam("fullview")?(e.addClass("sbplus_pop_full"),t.removeClass("sbplus_boxed").addClass("sbplus_full")):(e.removeClass(".sbplus_pop_full"),t.addClass("sbplus_boxed").removeClass("sbplus_full"))},getUrlParam:function(e){var t=new RegExp("[?&]"+e+"=([^&#]*)").exec(window.location.href);return null===t?null:t[1]||0},getManifestUrl:function(){var e=$("#sbplus_configs");return e.length?e[0].href:""},sanitize:function(e){return e.replace(/[^\w]/gi,"").toLowerCase()},capitalizeFirstLetter:function(e){return e.charAt(0).toUpperCase()+e.slice(1)},trimAndLower:function(e){return e.trim().toLowerCase()},isEmpty:function(e){return null==e||!e.trim()||0===e.trim().length},colorLum:function(e,t){(
// validate hex string
e=String(e).replace(/[^0-9a-f]/gi,"")).length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),t=t||0;
// convert to decimal and change luminosity
var a="#",s,i;for(i=0;i<3;i++)s=parseInt(e.substr(2*i,2),16),a+=("00"+(s=Math.round(Math.min(Math.max(0,s+s*t),255)).toString(16))).substr(s.length);return a},colorContrast:function(e){return 8388607.5<(e=parseInt(e.slice(1),15))?"#000":"#fff"},noScript:function(e){if(""===e&&void 0===e)return e;var t=$("<span>"+$.trim(e)+"</span>");return t.find("script,noscript,style").remove().end(),t.html()},noCDATA:function(e){return void 0===e||""===e?"":e.replace(/<!\[CDATA\[/g,"").replace(/\]\]>/g,"").trim()},hexToRgb:function(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;e=e.replace(t,function(e,t,a,s){return t+t+a+a+s+s});var a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return a?parseInt(a[1],16)+","+parseInt(a[2],16)+","+parseInt(a[3],16):null},getProgramDirectory:function(){var e=this.getUrlArray();return 3<=e.length?e[e.length-3]:2===e.length?e[0]:""},getCourseDirectory:function(){var e=this.getUrlArray();return 2<=e.length?e[e.length-1]:"default"},getUrlArray:function(){var e=window.location.href,t=e;e.indexOf("?")&&(t=(e=e.split("?"))[0]);var a=t.split("/");return a.splice(0,1),0<=a[a.length-1].indexOf(".")&&a.splice(a.length-1,1),this.removeEmptyElements(a)},removeEmptyElements:function(e){for(var t=!1,a=0;a<e.length;a++)SBPLUS.isEmpty(e[a])&&(t=!0),e[a].match(/^[0-9]+$/m)&&(t=!0),t&&(e.splice(a,1),t=!1);return e},setStorageItem:function(e,t,a){(Modernizr.localstorage||Modernizr.sessionstorage)&&(a?sessionStorage.setItem(e,t):localStorage.setItem(e,t))},getStorageItem:function(e,t){if(Modernizr.localstorage||Modernizr.sessionstorage)return t?sessionStorage.getItem(e):localStorage.getItem(e)},deleteStorageItem:function(e,t){if(Modernizr.localstorage||Modernizr.sessionstorage)return t?sessionStorage.removeItem(e):localStorage.removeItem(e)},hasStorageItem:function(e,t){if(Modernizr.localstorage||Modernizr.sessionstorage)return t?!this.isEmpty(sessionStorage.getItem(e)):!this.isEmpty(localStorage.getItem(e))},removeAllSessionStorage:function(){if(Modernizr.sessionstorage)return sessionStorage.clear()},getTextContent:function(e){var t=e.html();if(void 0!==t){if(this.isEmpty(e[0].textContent))return"";var a=document.createElement("div");a.appendChild(e[0]);var s=new RegExp("<"+a.firstChild.nodeName+'?\\s*([A-Za-z]*=")*[A-Za-z\\s]*"*>',"gi"),i=new RegExp("</"+a.firstChild.nodeName+">","gi");t=(t=a.innerHTML).replace(s,"").replace(i,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim()}return this.noScript(this.noCDATA(t))},isIOSDevice:function(){return!(!navigator.userAgent.match(/iPhone/i)&&!navigator.userAgent.match(/iPod/i))},afterSettingsLoaded:function(){var a=this;"1"===a.getStorageItem("sbplus-"+a.uniqueTitle+"-settings-loaded",!0)&&(a.isIOSDevice()&&($("#autoplay_label").after('<p class="error">Mobile devices do not support autoplay.</p>'),$("#sbplus_va_autoplay").prop("checked",!1).attr("disabled",!0)),a.syncSettings(),$(".settings input, .settings select").on("change",function(){
// show msg
$(a.menu.menuSavingMsg).fadeIn().html("Saving..."),
// widget
$("#sbplus_gs_widget").is(":checked")?a.setStorageItem("sbplus-hide-widget",1):a.setStorageItem("sbplus-hide-widget",0),
// sidebar
$("#sbplus_gs_sidebar").is(":checked")?a.setStorageItem("sbplus-hide-sidebar",1):a.setStorageItem("sbplus-hide-sidebar",0),
// interactive transcript
/*
                if ( $( '#sbplus_gs_it' ).is( ':checked' ) ) {
                    self.setStorageItem( 'sbplus-disable-it', 1 );
                } else {
                    self.setStorageItem( 'sbplus-disable-it', 0 );
                }
*/
// autoplay
$("#sbplus_va_autoplay").is(":checked")?(a.setStorageItem("sbplus-autoplay",1),$(a.layout.wrapper).addClass("sbplus_autoplay_on")):(a.setStorageItem("sbplus-autoplay",0),$(a.layout.wrapper).removeClass("sbplus_autoplay_on")),
// subtitle
$("#sbplus_va_subtitle").is(":checked")?a.setStorageItem("sbplus-subtitle",1):a.setStorageItem("sbplus-subtitle",0);
// volumne
var e=$("#sbplus_va_volume").val(),t=!1;e<0||100<e||a.isEmpty(e)?(t=!0,e=100*Number(a.getStorageItem("sbplus-volume"))):(a.setStorageItem("sbplus-volume",e/100),a.setStorageItem("sbplus-"+a.uniqueTitle+"-volume-temp",e/100,!0)),t?$("#volume_label").after('<p class="error">Value must be between 0 and 100.</p>'):$("#volume_label").next(".error").remove(),
// playback rate
a.setStorageItem("sbplus-playbackrate",$("#sbplus_va_playbackrate option:selected").val()),a.setStorageItem("sbplus-"+a.uniqueTitle+"-playbackrate-temp",$("#sbplus_va_playbackrate option:selected").val(),!0),
// show msg
$(a.menu.menuSavingMsg).html("Settings saved!"),setTimeout(function(){$(a.menu.menuSavingMsg).fadeOut("slow",function(){$(this).empty()})},1500)}))},syncSettings:function(){var e=this;if("1"===e.getStorageItem("sbplus-"+e.uniqueTitle+"-settings-loaded",!0)){
// widget
var t,a,s;"1"===e.getStorageItem("sbplus-hide-widget")?$("#sbplus_gs_widget").prop("checked",!0):$("#sbplus_gs_widget").prop("checked",!1),"1"===e.getStorageItem("sbplus-hide-sidebar")?$("#sbplus_gs_sidebar").prop("checked",!0):$("#sbplus_gs_sidebar").prop("checked",!1),"1"===e.getStorageItem("sbplus-disable-it")?$("#sbplus_gs_it").prop("checked",!0):$("#sbplus_gs_it").prop("checked",!1);
// sidebar
// autoplay
var i=e.getStorageItem("sbplus-autoplay");!1===e.isIOSDevice()&&("1"===i?$("#sbplus_va_autoplay").prop("checked",!0):$("#sbplus_va_autoplay").prop("checked",!1));
// volume
var r=e.getStorageItem("sbplus-volume");$("#sbplus_va_volume").prop("value",100*r);
// playback rate
var n=e.getStorageItem("sbplus-playbackrate"),o;$("#sbplus_va_playbackrate").val(n),"1"===e.getStorageItem("sbplus-subtitle")?$("#sbplus_va_subtitle").prop("checked",!0):$("#sbplus_va_subtitle").prop("checked",!1)}},sendToGA:function(e,t,a,s,i){if("on"===this.xml.settings.analytics){var r=this,n=0,o=!1;"object"==typeof i?(n=1e3*i.start,o=!0):n=1e3*i,window.ga&&ga.loaded&&(r.gaTimeouts.start=setTimeout(function(){ga("send","event",e,t,a,s,{screenName:r.getCourseDirectory()})},n),o&&(0<i.halfway&&i.halfway>i.start&&(r.gaTimeouts.halfway=setTimeout(function(){ga("send","event",e,"halfway",a,2,{screenName:r.getCourseDirectory()})},1e3*i.halfway)),0<i.completed&&i.completed>i.halfway&&(r.gaTimeouts.completed=setTimeout(function(){ga("send","event",e,"completed",a,3,{screenName:r.getCourseDirectory()})},1e3*i.completed))))}},clearGATimeout:function(){if("on"===this.xml.settings.analytics){var e=this;null!==e.gaTimeouts.start&&clearTimeout(e.gaTimeouts.start),null!==e.gaTimeouts.halfway&&clearTimeout(e.gaTimeouts.halfway),null!==e.gaTimeouts.completed&&clearTimeout(e.gaTimeouts.completed)}}};
/*******************************************************************************
        ON DOM READY
*******************************************************************************/$(function(){SBPLUS.go()});// var transcriptInterval = null;
var Page=function(e,t){this.pageXML=e.xml[0],this.pageData=t,this.title=e.title,this.type=e.type,this.transition=e.transition,this.pageNumber=e.number,
// google analytic variables
this.gaEventCate="",this.gaEventLabel="",this.gaEventAction="",this.gaEventValue=-1,this.gaEventHalfway=!1,this.gaDelays={start:0,halfway:0,completed:0},"quiz"!==e.type&&(this.src=e.src,this.notes=e.notes,this.widget=e.widget,this.widgetSegments={},this.imgType=e.imageFormat,e.frames.length&&(this.frames=e.frames,this.cuepoints=[]),this.mediaPlayer=null,this.isKaltura=null,this.isAudio=!1,this.isVideo=!1,this.isYoutube=!1,this.isVimeo=!1,this.isBundle=!1,this.isPlaying=!1,this.captionUrl="",this.transcript=null,this.transcriptLoaded=!1,this.hasImage=!1,this.missingImgUrl="",this.delayStorage=null),this.root=SBPLUS.manifest.sbplus_root_directory,this.kaltura={id:SBPLUS.manifest.sbplus_kaltura.id,flavors:{low:SBPLUS.manifest.sbplus_kaltura.low,normal:SBPLUS.manifest.sbplus_kaltura.normal,medium:SBPLUS.manifest.sbplus_kaltura.medium}},this.leftCol=SBPLUS.layout.leftCol,this.mediaContent=SBPLUS.layout.mediaContent,this.quizContainer=SBPLUS.layout.quizContainer,this.mediaError=SBPLUS.layout.mediaError};Page.prototype.getPageMedia=function(){var a=this;
// reset
// clearInterval( transcriptInterval );
// end reset
switch($(SBPLUS.layout.quizContainer).length&&$(SBPLUS.layout.quizContainer).remove(),$(SBPLUS.layout.mediaContent).css("backgroundImage","").removeClass("compat-object-fit").removeClass("show-vjs-poster"),$(this.mediaError).empty().hide(),$("#mp").length&&videojs("mp").dispose(),SBPLUS.clearWidget(),SBPLUS.enableWidget(),$(a.mediaContent).removeClass("iframeEmbed").empty(),SBPLUS.hasStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-previously-widget-open",!0)&&("1"===SBPLUS.getStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-previously-widget-open",!0)&&SBPLUS.showWidget(),SBPLUS.deleteStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-previously-widget-open",!0)),a.gaEventHalfway=!1,SBPLUS.clearGATimeout(),a.type){case"kaltura":!1===SBPLUS.kalturaLoaded?$.getScript(a.root+"scripts/libs/kaltura/mwembedloader.js",function(){$.getScript(a.root+"scripts/libs/kaltura/kwidgetgetsources.js",function(){SBPLUS.kalturaLoaded=!0,a.loadKalturaVideoData()})}):a.loadKalturaVideoData(),a.gaEventCate="Video",a.gaEventLabel=SBPLUS.getCourseDirectory()+":kaltura:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=3,a.gaDelays.start=6;break;case"image-audio":a.isAudio=!0,$.ajax({url:"assets/pages/"+a.src+"."+a.imgType,type:"HEAD"}).done(function(){a.hasImage=!0}).fail(function(){a.showPageError("NO_IMG",this.url),a.missingImgUrl=this.url}).always(function(){$.ajax({url:"assets/audio/"+a.src+".vtt",type:"HEAD"}).done(function(e){a.captionUrl=this.url,a.transcript=SBPLUS.noScript(e)}).always(function(){var e='<video id="mp" class="video-js vjs-default-skin"></video>';Modernizr.objectfit||$(a.mediaContent).addClass("show-vjs-poster"),$(a.mediaContent).html(e).promise().done(function(){a.renderVideoJS(),a.setWidgets()})})}),a.gaEventCate="Audio",a.gaEventLabel=SBPLUS.getCourseDirectory()+":audio:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=2,a.gaDelays.start=6;break;case"image":var e=new Image;e.src="assets/pages/"+a.src+"."+a.imgType,e.alt=a.title,$(e).on("load",function(){a.hasImage=!0,Modernizr.objectfit||$(".sbplus_media_content").each(function(){var e=$(this),t=e.find("img").prop("src");t&&e.css("backgroundImage","url("+t+")").addClass("compat-object-fit")})}),$(e).on("error",function(){a.hasImage=!1,a.showPageError("NO_IMG",e.src)}),$(a.mediaContent).html('<img src="'+e.src+'" class="img_only" alt="'+e.alt+'" />').promise().done(function(){a.setWidgets()}),a.gaEventCate="Image",a.gaEventLabel=SBPLUS.getCourseDirectory()+":image:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=4,a.gaDelays.start=10,a.gaDelays.halfway=30,a.gaDelays.completed=60;break;case"video":$.ajax({url:"assets/video/"+a.src+".vtt",type:"HEAD"}).done(function(e){a.captionUrl=this.url,a.transcript=SBPLUS.noScript(e)}).always(function(){var e='<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>';$(a.mediaContent).html(e).promise().done(function(){
// call video js
a.isVideo=!0,a.renderVideoJS(),a.setWidgets()})}),a.gaEventCate="Video",a.gaEventLabel=SBPLUS.getCourseDirectory()+":video:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=3,a.gaDelays.start=6;break;case"youtube":$(a.mediaContent).html('<video id="mp" class="video-js vjs-default-skin"></video>').promise().done(function(){a.isYoutube=!0,a.renderVideoJS(),a.setWidgets()}),a.gaEventCate="Video",a.gaEventLabel=SBPLUS.getCourseDirectory()+":youtube:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=3,a.gaDelays.start=6;break;case"vimeo":$(a.mediaContent).html('<video id="mp" class="video-js vjs-default-skin"></video>').promise().done(function(){a.isVimeo=!0,a.renderVideoJS(),a.setWidgets()}),a.gaEventCate="Video",a.gaEventLabel=SBPLUS.getCourseDirectory()+":vimeo:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=3,a.gaDelays.start=6;break;case"bundle":$(a.frames).each(function(){var e=toSeconds($(this).attr("start"));a.cuepoints.push(e)}),$.ajax({url:"assets/audio/"+a.src+".vtt",type:"HEAD"}).done(function(e){a.captionUrl=this.url,a.transcript=SBPLUS.noScript(e)}).always(function(){var e='<video id="mp" class="video-js vjs-default-skin"></video>';$(a.mediaContent).html(e).promise().done(function(){a.isBundle=!0,a.renderVideoJS(),a.setWidgets()})}),a.gaEventCate="Audio",a.gaEventLabel=SBPLUS.getCourseDirectory()+":bundle:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=2,a.gaDelays.start=6;break;case"quiz":$(a.leftCol).append('<div id="sbplus_quiz_wrapper"></div>').promise().done(function(){var e={id:a.pageNumber},t;new Quiz(e,a.pageData).getQuiz(),$("#sbplus_widget").is(":visible")&&SBPLUS.setStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-previously-widget-open",1,!0),SBPLUS.hideWidget(),SBPLUS.disableWidget()}),a.gaEventCate="Quiz",a.gaEventLabel=SBPLUS.getCourseDirectory()+":quiz:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=5,a.gaDelays.start=10,a.gaDelays.halfway=30;break;case"html":var t=!1,s=!1,i=a.src;if(isUrl(i)||(i="assets/html/"+a.src),void 0!==$(a.pageXML).attr("embed")&&(t=$(a.pageXML).attr("embed").toLowerCase()),1<=$(a.pageXML).find("audio").length&&(s=$($(a.pageXML).find("audio")[0]).attr("src").toLowerCase()),"yes"===t){var r='<iframe class="html" src="'+i+'"></iframe>';$(a.mediaContent).addClass("iframeEmbed").html(r).promise().done(function(){s.length&&(a.isAudio=!0,$(a.mediaContent).append('<audio id="mp" class="video-js vjs-default-skin"></audio>'),a.renderVideoJS(s))})}else{var n='<div class="html exLink">';n+="<small>click the link to open it in a new tab/window</small>",n+='<a href="'+i+'" target="_blank">'+i+"</a>",n+="</div>",$(a.mediaContent).addClass("html").html(n),window.open(i,"_blank")}a.setWidgets(),a.gaEventCate="HTML",a.gaEventLabel=SBPLUS.getCourseDirectory()+":html:page"+SBPLUS.targetPage.data("count"),a.gaEventAction="start",a.gaEventValue=6,a.gaDelays.start=10,a.gaDelays.halfway=30,a.gaDelays.completed=60;break;default:a.showPageError("UNKNOWN_TYPE",a.type),a.setWidgets();break}"image"!==a.type&&"html"!==a.type||$(a.mediaContent).addClass(a.transition).one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass(a.transition),$(this).off()}),
// add current page index to local storage
window.clearTimeout(a.delayStorage),a.delayStorage=window.setTimeout(function(){var e=SBPLUS.sanitize($(SBPLUS.banner.title).text()),t=a.pageNumber[0]+","+a.pageNumber[1];"0,0"!==t?SBPLUS.setStorageItem("sbplus-"+e,t):SBPLUS.deleteStorageItem("sbplus-"+e)},3e3),
// send event to Google Analytics
""!==a.gaEventCate&&SBPLUS.sendToGA(a.gaEventCate,a.gaEventAction,a.gaEventLabel,a.gaEventValue,a.gaDelays)},
// kaltura api request
Page.prototype.loadKalturaVideoData=function(){var r=this;r.isKaltura={flavors:{},status:{entry:0,low:0,normal:0,high:0},duration:""},kWidget.getSources({partnerId:r.kaltura.id,entryId:r.src,callback:function(e){var t=e.captionId,a="";for(var s in r.isKaltura.status.entry=e.status,r.isKaltura.duration=e.duration,e.sources){var i=e.sources[s];i.flavorParamsId===r.kaltura.flavors.low&&(r.isKaltura.flavors.low=i.src,r.isKaltura.status.low=i.status),i.flavorParamsId===r.kaltura.flavors.normal&&(r.isKaltura.flavors.normal=i.src,r.isKaltura.status.normal=i.status),i.flavorParamsId===r.kaltura.flavors.medium&&(r.isKaltura.flavors.medium=i.src,r.isKaltura.status.high=i.status)}
// entry video
1<=r.isKaltura.status.entry&&r.isKaltura.status.entry<=2?
// flavor videos
2===r.isKaltura.status.low&&2===r.isKaltura.status.normal&&2===r.isKaltura.status.high?(null!==t&&(r.captionUrl="https://www.kaltura.com/api_v3/?service=caption_captionasset&action=servewebvtt&captionAssetId="+t+"&segmentDuration="+r.isKaltura.duration+"&segmentIndex=1"),a='<video id="mp" class="video-js vjs-default-skin" crossorigin="anonymous" width="100%" height="100%"></video>',$(r.mediaContent).html(a).promise().done(function(){
// call video js
r.renderVideoJS(),r.setWidgets()})):r.showPageError("KAL_NOT_READY"):r.showPageError("KAL_ENTRY_NOT_READY")}})},
// render videojs
Page.prototype.renderVideoJS=function(r){var n=this;r=void 0!==r?r:n.src;var e=!0;"0"===SBPLUS.getStorageItem("sbplus-autoplay")&&(e=!1);var o={techOrder:["html5"],controls:!0,autoplay:e,preload:"auto",playbackRates:[.5,1,1.5,2],controlBar:{fullscreenToggle:!1},plugins:{replayButton:!0}},t;
// autoplay is off for iPhone or iPod
(SBPLUS.isIOSDevice()&&(o.autoplay=!1,o.playsinline=!0,o.nativeControlsForTouch=!1),
// set tech order and plugins
n.isKaltura?$.extend(o.plugins,{videoJsResolutionSwitcher:{default:720}}):n.isYoutube?(o.techOrder=["youtube"],o.sources=[{type:"video/youtube",src:"https://www.youtube.com/watch?v="+r}],o.playbackRates=null,$.extend(o.plugins,{videoJsResolutionSwitcher:{default:720}})):n.isVimeo&&(o.techOrder=["vimeo"],o.sources=[{type:"video/vimeo",src:"https://vimeo.com/"+r}],o.playbackRates=null),n.mediaPlayer=videojs("mp",o,function(){var a=this;if(n.isKaltura&&a.updateSrc([{src:n.isKaltura.flavors.low,type:"video/mp4",label:"low",res:360},{src:n.isKaltura.flavors.normal,type:"video/mp4",label:"normal",res:720},{src:n.isKaltura.flavors.medium,type:"video/mp4",label:"medium",res:640}]),n.isAudio||n.isBundle){if(n.isAudio&&n.hasImage&&a.poster("assets/pages/"+r+"."+n.imgType),n.isBundle){var s=0,i=new Image;a.on("loadedmetadata",function(){s=Math.floor(a.duration())}),a.cuepoints(),a.addCuepoint({namespace:r+"-1",start:0,end:n.cuepoints[0],onStart:function(){i.src="assets/pages/"+r+"-1."+n.imgType,a.poster(i.src)},onEnd:function(){},params:""}),$.each(n.cuepoints,function(e){var t;t=void 0===n.cuepoints[e+1]?s:n.cuepoints[e+1],a.addCuepoint({namespace:r+"-"+(e+2),start:n.cuepoints[e],end:t,onStart:function(){i.src="assets/pages/"+r+"-"+(e+2)+"."+n.imgType,$(i).on("error",function(){n.showPageError("NO_IMG",i.src)}),a.poster(i.src)}})}),a.on("seeking",function(){a.currentTime()<=n.cuepoints[0]&&a.poster("assets/pages/"+r+"-1."+n.imgType)})}a.src({type:"audio/mp3",src:"assets/audio/"+r+".mp3"})}n.isVideo&&a.src({type:"video/mp4",src:"assets/video/"+r+".mp4"}),
// add caption
n.captionUrl&&a.addRemoteTextTrack({kind:"captions",language:"en",label:"English",src:n.captionUrl},!0),
// set playback rate
null!==o.playbackRates&&a.playbackRate(SBPLUS.playbackrate),
// video events
a.on(["waiting","pause"],function(){n.isPlaying=!1;
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              clearInterval( transcriptInterval );
              self.transcriptIntervalStarted = false;
          }
*/}),a.on("loadedmetadata",function(){if(n.isKaltura){var e=+new Date;if($.get("https://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId="+guid()+"&event%3AeventType=2&event%3ApartnerId="+n.kaltura.id+"&event%3AentryId="+n.src+"&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=false&event%3Aduration="+a.duration()+"&event%3AeventTimestamp="+e),o.autoplay){var t=+new Date;$.get("https://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId="+guid()+"&event%3AeventType=3&event%3ApartnerId="+n.kaltura.id+"&event%3AentryId="+n.src+"&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=0&event%3Aduration="+a.duration()+"&event%3AeventTimestamp="+t)}else $(".vjs-big-play-button").one("click",function(){var e=+new Date;$.get("https://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId="+guid()+"&event%3AeventType=3&event%3ApartnerId="+n.kaltura.id+"&event%3AentryId="+n.src+"&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=0&event%3Aduration="+a.duration()+"&event%3AeventTimestamp="+e)})}}),a.on("ended",function(){if(n.isPlaying=!1,n.isKaltura){var e=+new Date;$.get("https://www.kaltura.com/api_v3/index.php?service=stats&action=collect&event%3AsessionId="+guid()+"&event%3AeventType=7&event%3ApartnerId="+n.kaltura.id+"&event%3AentryId="+n.src+"&event%3Areferrer=https%3A%2F%2Fmedia.uwex.edu&event%3Aseek=false&event%3Aduration="+a.duration()+"&event%3AeventTimestamp="+e)}
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
""!==n.gaEventCate&&SBPLUS.sendToGA(n.gaEventCate,"completed",n.gaEventLabel,3,0)}),a.on("playing",function(){n.isPlaying=!0;
/*
          if ( SBPLUS.getStorageItem( 'sbplus-disable-it' ) === "0" ) {
              if ( $( '#sbplus_interactivetranscript' ).hasClass( 'active' )
              && self.transcriptIntervalStarted === false ) {
                self.startInteractiveTranscript();
              }
          }
*/}),"on"===SBPLUS.xml.settings.analytics&&a.on("timeupdate",function(){var e=a.currentTime()/a.duration()*100;""!==n.gaEventCate&&50<=e&&!1===n.gaEventHalfway&&(SBPLUS.sendToGA(n.gaEventCate,"halfway",n.gaEventLabel,2,0),n.gaEventHalfway=!0)}),a.on("error",function(){n.showPageError("NO_MEDIA",a.src())}),a.on("resolutionchange",function(){a.playbackRate(SBPLUS.playbackrate)}),a.on("ratechange",function(){var e=this.playbackRate();SBPLUS.playbackrate!==e&&(SBPLUS.playbackrate=e,this.playbackRate(e))}),
// volume
SBPLUS.hasStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-volume-temp",!0)?a.volume(Number(SBPLUS.getStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-volume-temp",!0))):a.volume(Number(SBPLUS.getStorageItem("sbplus-volume"))),a.on("volumechange",function(){SBPLUS.setStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-volume-temp",this.volume(),!0)}),
// subtitle
!1===n.isYoutube&&!1===n.isVimeo&&1<=a.textTracks().tracks_.length&&(SBPLUS.hasStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-subtitle-temp",!0)?"1"===SBPLUS.getStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-subtitle-temp",!0)?a.textTracks().tracks_[0].mode="showing":a.textTracks().tracks_[0].mode="disabled":"1"===SBPLUS.getStorageItem("sbplus-subtitle")?a.textTracks().tracks_[0].mode="showing":a.textTracks().tracks_[0].mode="disabled",a.textTracks().addEventListener("change",function(){var e=this.tracks_;$.each(e,function(){"showing"===this.mode?SBPLUS.setStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-subtitle-temp",1,!0):SBPLUS.setStorageItem("sbplus-"+SBPLUS.uniqueTitle+"-subtitle-temp",0,!0)})}))}),$("#mp_html5_api").length&&$("#mp_html5_api").addClass("animated "+n.transition).one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass("animated "+n.transition),$(this).off()}),$("#mp_Youtube_api").length)&&$("#mp_Youtube_api").parent().addClass("animated "+n.transition).one("webkitAnimationEnd mozAnimationEnd animationend",function(){$(this).removeClass("animated "+n.transition),$(this).off()})},Page.prototype.setWidgets=function(){var a=this;if(SBPLUS.clearWidgetSegment(),"quiz"!=this.type){var e;if(SBPLUS.isEmpty(this.notes)||SBPLUS.addSegment("Notes"),"0"===SBPLUS.getStorageItem("sbplus-disable-it")&&((a.isAudio||a.isVideo||a.isBundle)&&(SBPLUS.isEmpty(a.transcript)||SBPLUS.addSegment("Interactive Transcript (alpha)")),a.isKaltura&&(SBPLUS.isEmpty(a.captionUrl)||SBPLUS.addSegment("Interactive Transcript (alpha)"))),this.widget.length)$($(this.widget).find("segment")).each(function(){var e=$(this).attr("name"),t="sbplus_"+SBPLUS.sanitize(e);a.widgetSegments[t]=SBPLUS.getTextContent($(this)),SBPLUS.addSegment(e)});SBPLUS.selectFirstSegment()}},Page.prototype.getWidgetContent=function(e){var t=this;switch(e){case"sbplus_notes":displayWidgetContent(this.notes);break;case"sbplus_interactivetranscriptalpha":"0"===SBPLUS.getStorageItem("sbplus-disable-it")&&(t.isAudio||t.isVideo?(displayWidgetContent(parseTranscript(t.transcript)),t.startInteractiveTranscript()):!1===t.transcriptLoaded?$.get(t.captionUrl,function(e){t.transcriptLoaded=!0,t.transcript=parseTranscript(SBPLUS.noScript(e)),displayWidgetContent(t.transcript),t.startInteractiveTranscript()}):(displayWidgetContent(t.transcript),t.startInteractiveTranscript()));break;default:displayWidgetContent(t.widgetSegments[e]);break}}
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
,Page.prototype.showPageError=function(e,t){t=void 0!==t?t:"";var a=this,s="";switch(e){case"NO_IMG":s="<p><strong>The content for this Storybook Page could not be loaded.</strong></p><p><strong>Expected image:</strong> "+t+'</p><p>Please try refreshing your browser, or coming back later.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';break;case"KAL_NOT_READY":s="<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID  "+a.src+"<br><strong>Status</strong>:<br>",s+="Low &mdash; "+getKalturaStatus(a.isKaltura.status.low)+"<br>",s+="Normal &mdash; "+getKalturaStatus(a.isKaltura.status.normal)+"<br>",s+="High &mdash; "+getKalturaStatus(a.isKaltura.status.high)+"</p>";break;case"KAL_ENTRY_NOT_READY":s="<p>The video for this Storybook Page is still processing and could not be loaded at the moment. Please try again later. Contact support if you continue to have issues.</p><p><strong>Expected video source</strong>: Kaltura video ID "+a.src+"<br><strong>Status</strong>: ",s+=getEntryKalturaStatus(a.isKaltura.status.entry)+"</p>";break;case"NO_MEDIA":!(s="<p><strong>The content for this Storybook Page could not be loaded.</strong></p>")===a.hasImage?(s+="<p><strong>Expected audio:</strong> "+t+"<br>",s+="<strong>Expected image:</strong> "+a.missingImgUrl+"</p>"):s+="<p><strong>Expected media:</strong> "+t+"</p>",s+='<p>Please try refreshing your browser, or coming back later.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';break;case"UNKNOWN_TYPE":s='<p><strong>UNKNOWN PAGE TYPE</strong></p><p>Page type ("'+t+'") is not supported.</p><p>If this problem continues, please <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem(\'sbplus_help\');">contact tech support</a>.</p>';break}$(a.mediaError).html(s).show()};var quizTracker=[],Quiz=function(e,t){var a=this,s=t,i=Number(e.id.join().replace(",","")),r=s.children()[0].nodeName.toLowerCase(),n=s.find("question"),o=SBPLUS.getTextContent(n),l="",u="";switch(SBPLUS.isEmpty(n.attr("image"))||(l=SBPLUS.noScript(n.attr("image").trim())),SBPLUS.isEmpty(n.attr("audio"))||(u=SBPLUS.noScript(n.attr("audio").trim())),a.quiz={id:i,type:r,question:o,questionImg:l,questionAudio:u,stuAnswer:"",correct:!1},a.quizContainer=SBPLUS.layout.quizContainer,r){case"multiplechoicesingle":var d=$(s).find("choices").find("answer");if(!SBPLUS.isEmpty($(s).find("choices").attr("random"))){var c=SBPLUS.noScript($(s).find("choices").attr("random").trim().toLowerCase());a.quiz.random="yes"===c}a.quiz.answers=[],$.each(d,function(){var e={};e.value=SBPLUS.noScript($(this).find("value").text().trim()),SBPLUS.isEmpty($(this).attr("image"))||(e.img=SBPLUS.noScript($(this).attr("image").trim()),e.value=e.img),SBPLUS.isEmpty($(this).attr("audio"))||(e.audio=SBPLUS.noScript($(this).attr("audio").trim()),e.value=e.audio),SBPLUS.isEmpty($(this).attr("correct"))||"yes"===$(this).attr("correct").toLowerCase()&&(e.correct=SBPLUS.noScript($(this).attr("correct").trim().toLowerCase()));var t=$(this).find("feedback");t.length&&(e.feedback=SBPLUS.getTextContent(t)),a.quiz.answers.push(e)});break;case"multiplechoicemultiple":var p=$(s).find("choices").find("answer");if(!SBPLUS.isEmpty($(s).find("choices").attr("random"))){var m=SBPLUS.noScript($(s).find("choices").attr("random").trim().toLowerCase());a.quiz.random="yes"===m}a.quiz.answers=[],$.each(p,function(){var e={};e.value=SBPLUS.noScript($(this).find("value").text().trim()),SBPLUS.isEmpty($(this).attr("image"))||(e.img=SBPLUS.noScript($(this).attr("image").trim()),e.value=e.img),SBPLUS.isEmpty($(this).attr("audio"))||(e.audio=SBPLUS.noScript($(this).attr("audio").trim()),e.value=e.audio),SBPLUS.isEmpty($(this).attr("correct"))||"yes"===$(this).attr("correct").toLowerCase()&&(e.correct=SBPLUS.noScript($(this).attr("correct").trim().toLowerCase())),a.quiz.answers.push(e)});var g=$(s).find("correctFeedback"),h=$(s).find("incorrectFeedback");g.length&&(a.quiz.correctFeedback=SBPLUS.getTextContent(g)),h.length&&(a.quiz.incorrectFeedback=SBPLUS.getTextContent(h));break;case"shortanswer":var b=$(s).find("feedback");b.length&&(a.quiz.feedback=SBPLUS.getTextContent(b));break;case"fillintheblank":var f=$(s).find("correctFeedback"),v=$(s).find("incorrectFeedback");f.length&&(a.quiz.correctFeedback=SBPLUS.getTextContent(f)),v.length&&(a.quiz.incorrectFeedback=SBPLUS.getTextContent(v)),a.quiz.answer=SBPLUS.noScript($(s).find("answer").text().trim());break}!1===questionExists(a.quiz.id)&&quizTracker.push(this.quiz)};Quiz.prototype.getQuiz=function(){var e=this,t=!1;e.qIndex=getCurrentQuizItem(quizTracker,e.quiz.id),Array.isArray(quizTracker[e.qIndex].stuAnswer)?1<=quizTracker[e.qIndex].stuAnswer.length&&(t=!0):SBPLUS.isEmpty(quizTracker[e.qIndex].stuAnswer)||(t=!0),t?e.renderFeeback():e.renderQuiz(),"on"===SBPLUS.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub])},Quiz.prototype.renderQuiz=function(){var n=this,e="",t="",a='<div class="sbplus_quiz_header"><span class="icon-assessment"></span>';a+=" Self Assessment</div>",SBPLUS.isEmpty(n.quiz.questionImg)||(e='<p><img src="assets/images/'+n.quiz.questionImg+'" /></p>'),SBPLUS.isEmpty(n.quiz.questionAudio)||(t='<p><audio controls><source src="assets/audio/'+n.quiz.questionAudio+'" type="audio/mpeg" /></audio></p>'),a+='<div class="sbplus_quiz_question">'+e+t+n.quiz.question+"</div>",a+='<div class="sbplus_quiz_input"></div>',a+='<button class="sbplus_quiz_submit_btn">Submit</button>',$(n.quizContainer).html(a).promise().done(function(){switch(n.quiz.type){case"multiplechoicesingle":var a="";n.quiz.random&&shuffle(n.quiz.answers),$.each(n.quiz.answers,function(e){var t=SBPLUS.sanitize(n.quiz.answers[e].value);return SBPLUS.isEmpty(n.quiz.answers[e].img)?SBPLUS.isEmpty(n.quiz.answers[e].audio)?void(a+='<label for="'+t+'"><input type="radio" id="'+t+'" name="ms" value="'+e+'" /> '+n.quiz.answers[e].value+"</label>"):(t=SBPLUS.sanitize(n.quiz.answers[e].audio),a+='<label class="au_val" for="'+t+'"><input type="radio" id="'+t+'" name="ms" value="'+e+'" /> <audio controls><source src="assets/audio/'+n.quiz.answers[e].audio+'" type="audio/mpeg"/></audio></label>',!0):(t=SBPLUS.sanitize(n.quiz.answers[e].img),a+='<label class="img_val" for="'+t+'"><input type="radio" id="'+t+'" name="ms" value="'+e+'" /><img src="assets/images/'+n.quiz.answers[e].img+'"/ ></label>',!0)}),$(".sbplus_quiz_input").html(a);break;case"multiplechoicemultiple":var s="";n.quiz.random&&shuffle(n.quiz.answers),$.each(n.quiz.answers,function(e){var t=SBPLUS.sanitize(n.quiz.answers[e].value);return SBPLUS.isEmpty(n.quiz.answers[e].img)?SBPLUS.isEmpty(n.quiz.answers[e].audio)?void(s+='<label for="'+t+'"><input type="checkbox" id="'+t+'" name="mm" value="'+e+'" /> '+n.quiz.answers[e].value+"</label>"):(t=SBPLUS.sanitize(n.quiz.answers[e].audio),s+='<label class="au_val" for="'+t+'"><input type="checkbox" id="'+t+'" name="mm" value="'+e+'" /> <audio controls><source src="assets/audio/'+n.quiz.answers[e].audio+'" type="audio/mpeg"/></audio></label>',!0):(t=SBPLUS.sanitize(n.quiz.answers[e].img),s+='<label class="img_val" for="'+t+'"><input type="checkbox" id="'+t+'" name="mm" value="'+e+'" /><img src="assets/images/'+n.quiz.answers[e].img+'" /></label>',!0)}),$(".sbplus_quiz_input").html(s);break;case"shortanswer":$(".sbplus_quiz_input").html("<textarea></textarea>");break;case"fillintheblank":$(".sbplus_quiz_input").html('<input type="text" />');break}}),$("button.sbplus_quiz_submit_btn").on("click",function(){switch(n.quiz.type){case"multiplechoicesingle":quizTracker[n.qIndex].stuAnswer=$('input[type="radio"]:checked').val(),SBPLUS.isEmpty(quizTracker[n.qIndex].stuAnswer)||$.each(n.quiz.answers,function(){var e;if(void 0!==this.correct)return SBPLUS.sanitize(n.quiz.answers[Number(n.quiz.stuAnswer)].value)===SBPLUS.sanitize(this.value)?quizTracker[n.qIndex].correct=!0:quizTracker[n.qIndex].correct=!1,!1});break;case"multiplechoicemultiple":var e=$('input:checkbox[name="mm"]'),t=[];if(quizTracker[n.qIndex].stuAnswer=[],e.each(function(){this.checked&&quizTracker[n.qIndex].stuAnswer.push(Number($(this).val()))}),$.each(n.quiz.answers,function(){void 0!==this.correct&&t.push(SBPLUS.sanitize(this.value))}),quizTracker[n.qIndex].stuAnswer.length<t.length||quizTracker[n.qIndex].stuAnswer.length>t.length)quizTracker[n.qIndex].correct=!1;else if(quizTracker[n.qIndex].stuAnswer.length===t.length)for(var a=0;a<quizTracker[n.qIndex].stuAnswer.length;a++){var s=Number(quizTracker[n.qIndex].stuAnswer[a]),i=SBPLUS.sanitize(quizTracker[n.qIndex].answers[s].value);if(!(0<=$.inArray(i,t))){quizTracker[n.qIndex].correct=!1;break}quizTracker[n.qIndex].correct=!0}break;case"shortanswer":quizTracker[n.qIndex].stuAnswer=$(".sbplus_quiz_input textarea").val();break;case"fillintheblank":quizTracker[n.qIndex].stuAnswer=$("input").val(),quizTracker[n.qIndex].stuAnswer!==n.quiz.answer?quizTracker[n.qIndex].correct=!1:quizTracker[n.qIndex].correct=!0;break}var r=!1;Array.isArray(quizTracker[n.qIndex].stuAnswer)?1<=quizTracker[n.qIndex].stuAnswer.length&&(r=!0):SBPLUS.isEmpty(quizTracker[n.qIndex].stuAnswer)||(r=!0),!1===r?($(".sbplus_quiz_header").after('<div class="quiz_error"><span class="icon-warning"></span> Please answer the question before submitting.</div>'),setTimeout(function(){$(".quiz_error").fadeOut(1e3,function(){$(this).remove()})},4e3)):(n.renderFeeback(),"on"===SBPLUS.xml.settings.mathjax&&MathJax.Hub.Queue(["Typeset",MathJax.Hub]))});var s=SBPLUS.getCourseDirectory()+":quiz:page"+SBPLUS.targetPage.data("count");SBPLUS.sendToGA("Quiz","completed",s,3,0)},Quiz.prototype.renderFeeback=function(){var s=this,e="",t="",i='<div class="sbplus_quiz_header"><span class="icon-assessment"></span>';switch(i+=" Self Assessment Feedback</div>","shortanswer"!==s.quiz.type&&(quizTracker[s.qIndex].correct?i+='<div class="quiz_correct"><span class="icon-check"></span> Correct!</div>':i+='<div class="quiz_incorrect"><span class="icon-warning"></span> Incorrect!</div>'),SBPLUS.isEmpty(s.quiz.questionImg)||(e='<p><img src="assets/images/'+s.quiz.questionImg+'" /></p>'),SBPLUS.isEmpty(s.quiz.questionAudio)||(t='<p><audio controls><source src="assets/audio/'+s.quiz.questionAudio+'" type="audio/mpeg" /></audio></p>'),i+='<div class="sbplus_quiz_question">'+e+t+s.quiz.question+"</div>",i+='<div class="sbplus_quiz_result">',s.quiz.type){case"shortanswer":i+="<p><strong>Your answer:</strong><br>"+quizTracker[s.qIndex].stuAnswer+"</p>",SBPLUS.isEmpty(s.quiz.feedback)||(i+="<p><strong>Feedback:</strong><br>"+s.quiz.feedback+"</p>");break;case"fillintheblank":i+="<p><strong>Your answer:</strong><br>"+quizTracker[s.qIndex].stuAnswer+"</p>",i+="<p><strong>Correct answer:</strong><br>"+s.quiz.answer+"</p>",quizTracker[s.qIndex].correct?SBPLUS.isEmpty(s.quiz.correctFeedback)||(i+="<p><strong>Feedback:</strong><br>"+s.quiz.correctFeedback+"</p>"):SBPLUS.isEmpty(s.quiz.incorrectFeedback)||(i+="<p><strong>Feedback:</strong><br>"+s.quiz.incorrectFeedback+"</p>");break;case"multiplechoicesingle":var a=Number(quizTracker[s.qIndex].stuAnswer),r=quizTracker[s.qIndex].answers[a],n=r.value,o=r.feedback,l=r.img,u=r.audio,d="text";switch(SBPLUS.isEmpty(l)||(d="img"),SBPLUS.isEmpty(u)||(d="audio"),d){case"img":i+='<p><strong>Your answer:</strong><br><img src="assets/images/'+r.img+'" /></p>';break;case"audio":i+='<p><strong>Your answer:</strong><br><audio controls><source src="assets/audio/'+u+'" type="audio/mpeg"/></audio></p>';break;case"text":i+="<p><strong>Your answer:</strong><br>"+n+"</p>";break}$.each(s.quiz.answers,function(e){if(void 0!==s.quiz.answers[e].correct){var t=s.quiz.answers[e].value;switch(d){case"img":t='<img src="assets/images/'+s.quiz.answers[e].value+'" />';break;case"audio":t='<audio controls><source src="assets/audio/'+s.quiz.answers[e].value+'" type="audio/mpeg"/></audio>';break}return i+="<p><strong>Correct answer:</strong><br>"+t+"</p>",!1}}),SBPLUS.isEmpty(o)||(i+="<p><strong>Feedback:</strong><br>"+o+"</p>");break;case"multiplechoicemultiple":var c=quizTracker[s.qIndex].stuAnswer;i+="<p><strong>Your answer:</strong><br>",$.each(c,function(e){var t=Number(c[e]),a="text";switch(SBPLUS.isEmpty(s.quiz.answers[t].img)||(a="img"),SBPLUS.isEmpty(s.quiz.answers[t].audio)||(a="audio"),a){case"img":i+='<img src="assets/images/'+s.quiz.answers[t].value+'" /><br>';break;case"audio":i+='<audio controls><source src="assets/audio/'+s.quiz.answers[t].value+'" type="audio/mpeg"/></audio><br>';break;case"text":i+=s.quiz.answers[t].value+"<br>";break}}),i+="</p><p><strong>Correct answer:</strong><br>",$.each(s.quiz.answers,function(){if(void 0!==this.correct){var e="text";switch(SBPLUS.isEmpty(this.img)||(e="img"),SBPLUS.isEmpty(this.audio)||(e="audio"),e){case"img":i+='<img src="assets/images/'+this.value+'" /><br>';break;case"audio":i+='<audio controls><source src="assets/audio/'+this.value+'" type="audio/mpeg"/></audio><br>';break;case"text":i+=this.value+"<br>";break}}}),i+="</p>",quizTracker[s.qIndex].correct?SBPLUS.isEmpty(s.quiz.correctFeedback)||(i+="<p><strong>Feedback:</strong><br>"+s.quiz.correctFeedback+"</p>"):SBPLUS.isEmpty(s.quiz.incorrectFeedback)||(i+="<p><strong>Feedback:</strong><br>"+s.quiz.incorrectFeedback+"</p>");break}i+="</div>",
// display the html
$(s.quizContainer).html(i)},MenuBar.prototype.bindHandlers=function(){var t=this;
/* MOUSE EVENTS */
// mouseenter handler for the menu items
t.items.on("mouseenter",function(){return $(this).addClass("menu-hover"),!0}),
// mouseout handler for the menu items
t.items.on("mouseout",function(){return $(this).removeClass("menu-hover"),!0}),
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
t.allItems.on("click",function(e){t.handleClick($(this),e)}),
/* KEY EVENTS */
// keydown handler for all items
t.allItems.on("keydown",function(e){return t.handleKeydown($(this),e)}),
// keypress handler for all items
t.allItems.on("keypress",function(e){return t.handleKeypress($(this),e)}),
// focus handler for all items
t.allItems.on("focus",function(e){return t.handleFocus($(this),e)}),
// blur hander for all items
t.allItems.on("blur",function(e){return t.handleBlur($(this),e)}),
// document click handler
$(document).on("click",function(e){return t.handleDocumentClick(e)})},
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
MenuBar.prototype.handleClick=function(e,t){var a=this,s;if(e.parent().is(".root-level")){
// open the child menu if it is closed
var i=e.children("ul").first();"false"===i.attr("aria-hidden")?(e.attr("aria-expanded","false"),i.attr({"aria-hidden":"true","aria-expanded":"false"}),i.parent().removeClass("active")):(e.attr("aria-expanded","true"),i.attr({"aria-hidden":"false","aria-expanded":"true"}),i.parent().addClass("active"))}else
// remove hover and focus styling
a.allItems.removeClass("menu-hover menu-focus"),e.attr("aria-expanded","false"),
// close the menu
a.id.find("ul").not(".root-level").attr({"aria-hidden":"true","aria-expanded":"false"});return t.stopPropagation(),!1},
// process focus events for the menu
MenuBar.prototype.handleFocus=function(e){var t=this;
// if activeItem is null, get focus from outside the menu
// store the item that triggered the event
if(null===this.activeItem)this.activeItem=e;else if(e[0]!==t.activeItem[0])return!0;
// get the set of objects for all the parent items of the active item
var a=t.activeItem.parentsUntil("div").filter("li"),s;
// remove focus styling from all other menu items
(t.allItems.removeClass("menu-focus"),
// add foucus styling to the active item
t.activeItem.addClass("menu-focus"),
// add focus styling to all parent items
a.addClass("menu-focus"),!0===t.isVerticalMenu)&&(
// if the bChildOpen flag has been set, open the active item's child menu (if applicable)
!0===t.bChildOpen?
// if the itemUL is a root-level menu and item is a parent item
e.parent().is(".root-level")&&"true"===e.attr("aria-haspopup")&&(e.attr("aria-expanded","true"),e.children("ul").attr({"aria-hidden":"false","aria-expanded":"true"})):t.isVerticalMenu=!1);return!0},
// process blur events for the menu
MenuBar.prototype.handleBlur=function(e){return e.removeClass("menu-focus"),!0},
// process keydown events for the menus
MenuBar.prototype.handleKeydown=function(e,t){var a=this;if(t.altKey||t.ctrlKey)
// modifier key pressed; do not process
return!0;var s=e.parent();switch(t.keyCode){case a.keys.tab:e.attr("aria-expanded","false"),
// hide all menu items and update their aria attributes
a.id.find("ul").attr({"aria-hidden":"true","aria-expanded":"false"}),
// remove focus styling from all menu items
a.allItems.removeClass("menu-focus"),a.activeItem=null,a.bChildOpen=!1;break;case a.keys.esc:return e.attr("aria-expanded","false"),s.is(".root-level")?
// hide the child menu and update the aria attributes
e.children("ul").first().attr({"aria-hidden":"true","aria-expanded":"false"}):(
// move up one level
a.activeItem=s.parent(),
// reset the bChildOpen flag
a.bChildOpen=!1,
// set focus on the new item
a.activeItem.focus(),
// hide the active menu and update the aria attributes
s.attr({"aria-hidden":"true","aria-expanded":"false"})),t.stopPropagation(),!1;case a.keys.enter:case a.keys.space:var i;if(e.parent().is(".root-level"))
// open the child menu if it is closed
e.children("ul").first().attr({"aria-hidden":"false","aria-expanded":"true"});else{
//remove hover and focus styling
a.allItems.removeClass("menu-hover menu-focus"),
// close the menu
a.id.find("ul").not(".root-level").attr({"aria-hidden":"true","aria-expanded":"false"});
// download/open the file
var r=a.activeItem.find("a").attr("id");document.getElementById(r).click(),
// clear the active item
a.activeItem=null}return t.stopPropagation(),!1;case a.keys.left:return!0===a.isVerticalMenu&&s.is(".root-level")?
// if this is a vertical menu and the root level is active,
// move to the previous item in the menu
a.activeItem=a.moveUp(e):a.activeItem=a.moveToPrevious(e),a.activeItem.focus(),t.stopPropagation(),!1;case a.keys.right:return!0===a.isVerticalMenu&&s.is(".root-level")?
// if this is a vertical menu and the root-level is active,
// move to the next item in the menu
a.activeItem=a.moveDown(e):a.activeItem=a.moveToNext(e),a.activeItem.focus(),t.stopPropagation(),!1;case a.keys.up:return!0===a.isVerticalMenu&&s.is(".root-level")?
// if this is a vertical menu and the root-level is active,
// move to the previous root-level menu
a.activeItem=a.moveToPrevious(e):a.activeItem=a.moveUp(e),a.activeItem.focus(),t.stopPropagation(),!1;case a.keys.down:return!0===a.isVerticalMenu&&s.is(".root-level")?
// if this is a vertical menu and the root-level is active,
// move to the next root-level menu
a.activeItem=a.moveToNext(e):a.activeItem=a.moveDown(e),a.activeItem.focus(),t.stopPropagation(),!1}// end switch
return!0},
// function to move to the next menu level
MenuBar.prototype.moveToNext=function(e){var t=this,a=e.parent(),s=a.children("li"),i=s.length,r=s.index(e),n=null,o=null;
// item's containing menu
if(a.is(".root-level"))
// this is the root level move to next sibling and
// will require closing the current child menu and
// opening the new one
// if not the root menu
n=r<i-1?e.next():s.first(),
// close the current child menu (if applicable)
"true"===e.attr("aria-haspopup")&&"false"===(o=e.children("ul").first()).attr("aria-hidden")&&(e.attr("aria-expanded","false"),
// update the child menu's aria hidden attribute
o.attr({"aria-hidden":"true","aria-expanded":"false"}),t.bChildOpen=!0),
// remove the focus styling from the current menu
e.removeClass("menu-focus"),
// open the new child menu (if applicable)
"true"===n.attr("aria-haspopup")&&!0===t.bChildOpen&&(o=n.children("ul").first(),e.attr("aria-expanded","true"),
// update the child's aria-hidden attribute
o.attr({"aria-hidden":"false","aria-expanded":"true"}));else
// this is not the root-level
// if there is a child menu to be moved into,
// do that; otherwise, move to the next root-level menu
// if there is one
if("true"===e.attr("aria-haspopup"))n=(o=e.children("ul").first()).children("li").first(),e.attr("aria-expanded","true"),
// show the child menu and update its aria attribute
o.attr({"aria-hidden":"false","aria-expanded":"true"});else{
// at deepest level, move to the next root-item menu
if(!0===t.isVerticalMenu)
// do nothing
return e;var l=null,u=null;
// get the list of all parent menus for item, up to the root level
l=e.parentsUntil("div").filter("ul").not(".root-level"),e.attr("aria-expanded","false"),
// hide the current menu and update its aria attribute accordingly
l.attr({"aria-hidden":"true","aria-expanded":"false"}),
// remove the focus styling from the active menu
l.find("li").removeClass("menu-focus"),l.last().parent().removeClass("menu-focus"),
// the containing root for the menu
u=l.last().parent(),
// add the focus styling to the new menu
(
// if this is not the last root menu item,
// move to the next one
n=(r=t.rootItems.index(u))<t.rootItems.length-1?u.next():t.rootItems.first()).addClass("menu-focus"),"true"===n.attr("aria-haspopup")&&(n=(o=n.children("ul").first()).children("li").first(),e.attr("aria-expanded","true"),
// show the child menu and update its aria attribute
o.attr({"aria-hidden":"false","aria-expanded":"true"}),t.bChildOpen=!0)}return n},
// function to move to the previous menu level
MenuBar.prototype.moveToPrevious=function(e){var t=this,a=e.parent(),s=a.children("li"),i=s.index(e),r=null,n=null;
// item's containing menu
if(a.is(".root-level"))
// this is the root level move to previous sibling and
// will require closing the current child menu and
// opening the new one
r=0<i?e.prev():s.last(),
// close the current child menu (if applicable)
"true"===e.attr("aria-haspopup")&&"false"===(n=e.children("ul").first()).attr("aria-hidden")&&(e.attr("aria-expanded","false"),
// update the child menu's aria-hidden attribute
n.attr({"aria-hidden":"true","aria-expanded":"false"}),t.bChildOpen=!0),
// remove the focus styling from the current menu
e.removeClass("menu-focus"),
// open the new child menu (if applicable)
"true"===r.attr("aria-haspopup")&&!0===t.bChildOpen&&(n=r.children("ul").first(),e.attr("aria-expanded","true"),
// update the child's aria-hidden attribute
n.attr({"aria-hidden":"false","aria-expanded":"true"}));else{
// this is not the root level
// if there is parent menu that is not the root menu,
// move up one level; otherwise, move to first item of the previous root menu
var o=a.parent(),l=o.parent();
// if this is a vertical menu or is not the first child menu
// of the root-level menu, move up one level
!0!==t.isVerticalMenu&&l.is(".root-level")?(
// move to previous root-level menu
e.attr("aria-expanded","false"),
// hide the current menu and update the aria attributes accordingly
a.attr({"aria-hidden":"true","aria-expanded":"false"}),
// remove the focus styling from the active menu
e.removeClass("menu-focus"),o.removeClass("menu-focus"),
// add the focus styling to the new menu
(
// move to the previous root-level menu
r=0<(i=this.rootItems.index(o))?o.prev():t.rootItems.last()).addClass("menu-focus"),"true"===r.attr("aria-haspopup")&&(n=r.children("ul").first(),e.attr("aria-expanded","true"),
// show the child menu and update it's aria attributes
n.attr({"aria-hidden":"false","aria-expanded":"true"}),t.bChildOpen=!0,r=n.children("li").first())):(r=a.parent(),e.attr("aria-expanded","false"),
// hide the active menu and update aria-hidden
a.attr({"aria-hidden":"true","aria-expanded":"false"}),
// remove the focus highlight from the item
e.removeClass("menu-focus"),!0===t.isVerticalMenu&&(
// set a flag so the focus handler does't reopen the menu
t.bChildOpen=!1))}return r},
// function to select the next item in a menu
MenuBar.prototype.moveDown=function(e,t){
// item's containing menu
var a=e.parent(),s=a.children("li").not(".separator"),i=s.length,r=s.index(e),n=null,o=null;
// the items in the currently active menu
if(a.is(".root-level"))return"true"!==e.attr("aria-haspopup")?e:(
// move to the first item in the child menu
n=(o=e.children("ul").first()).children("li").first(),$(o.parent()).attr("aria-expanded","true"),e.attr("aria-expanded","true"),
// make sure the child menu is visible
o.attr({"aria-hidden":"false","aria-expanded":"true"}),n);
// If startChr is specified, move to the next item
// with a title that begins with that character.
if(t){var l=!1,u=r+1;
// Iterate through the menu items (starting from the current item and wrapping)
// until a match is found or the loop returns to the current menu item 
for(
// check if the active item was the last one on the list
u===i&&(u=0);u!==r;){var d;if(s.eq(u).html().charAt(0).toLowerCase()===t){l=!0;break}(u+=1)===i&&(
// reached the end of the list, start again at the beginning
u=0)}return!0===l?(n=s.eq(u),
// remove the focus styling from the current item
e.removeClass("menu-focus"),n):e}
// remove the focus styling from the current item
return n=r<i-1?s.eq(r+1):s.first(),e.removeClass("menu-focus"),n},
// function to select the previous item in a menu
MenuBar.prototype.moveUp=function(e){
// item's containing menu 
var t=e.parent(),a=t.children("li").not(".separator"),s=a.index(e),i=null;
// the items in the currently active menu
return t.is(".root-level")?e:(
// if item is not the first item in its menu,
// move to the previous item
i=0<s?a.eq(s-1):a.last(),
// remove the focus styling from the current item
e.removeClass("menu-focus"),i)},
// function to process keypress events for the menu
MenuBar.prototype.handleKeypress=function(e,t){var a=this;if(t.altKey||t.ctrlKey||t.shiftKey)
// modifier key pressed; do not process
return!0;switch(t.keyCode){case a.keys.tab:return!0;case a.keys.esc:case a.keys.up:case a.keys.down:case a.keys.left:case a.keys.right:return t.stopPropagation(),!1;default:var s=String.fromCharCode(t.which);return a.activeItem=a.moveDown(e,s),a.activeItem.focus(),t.stopPropagation(),!1}// end switch
},
// function to process click events on the document
MenuBar.prototype.handleDocumentClick=function(){var e=this,t;
// get the list of all child menus
// allow the event to propagate
// hide the child menus
return e.id.find("ul").not(".root-level").attr({"aria-hidden":"true","aria-expanded":"false"}),e.allItems.removeClass("menu-focus"),e.allItems.removeClass("active"),!(e.activeItem=null)};