var sbplus=sbplus||{title:"",subtitle:"",length:"",author:"",authorBio:"",generalInfo:"",courseNumber:"",accent:"#535cab",slideFormat:"jpg",analytics:"off",xmlVersion:"3",getSplashInfo:function(){return'<div class="splashinfo"><h1 tabindex="1" class="title">'+this.title+'</h1><p tabindex="1" class="subtitle">'+this.subtitle+'</p><p tabindex="1" class="author">'+this.author+'</p><p tabindex="1" class="length">'+this.length+'</p><button tabindex="1" class="startBtn" aria-label="Start Presentation">START</button></div>'}};$(function(){$.getJSON($.fn.getConfigFileUrl(),function(t){$.fn.loadSBPlus(t)}).fail(function(){$(".sbplus_wrapper").html('<div class="error"><h1>Configuration file (manifest.json) is not found!</h1><p>Please make sure the index.html file is compatible with Storybook Plus version 3.</p></div>')})}),$.fn.loadSBPlus=function(t){$(this).haveCoreFeatures()?$.get("assets/sbplus.xml",function(e){$.fn.loadPresentation(t,$(e))}).fail(function(){$(".sbplus_wrapper").html('<div class="error"><h1>Table of Contents XML file (sbplus.xml) is not found!</h1><p>Please make sure the XML file exists in the assets directory and compatible with Storybook Plus version 3.</p></div>')}):$.get(t.sbplus_root_directory+"scripts/templates/nosupport.tpl",function(t){$(".sbplus_wrapper").html(t)}).fail(function(){$(".sbplus_wrapper").html('<div class="error"><h1>Template file not found!</h1><p>nosupport.tpl file not found in the templates directory.</p></div>')})},$.fn.loadPresentation=function(t,e){var n=e.find("storybook"),s=e.find("setup");sbplus.title=s.find("title").text(),sbplus.subtitle=s.find("subtitle").text(),sbplus.author=s.find("author").attr("name"),sbplus.authorBio=s.find("author").text(),sbplus.length=s.find("length").text(),sbplus.generalInfo=s.find("generalInfo").text(),sbplus.courseNumber=s.attr("courseNumber"),sbplus.accent=$.fn.isEmpty(n.attr("accent"))?sbplus.accent:n.attr("accent"),sbplus.slideFormat=$.fn.isEmpty(n.attr("slideFormat"))?sbplus.slideFormat:n.attr("slideFormat"),sbplus.analytics=$.fn.isEmpty(n.attr("analytics"))?sbplus.analytics:n.attr("analytics"),$(document).attr("title",sbplus.title);var i=t.sbplus_splash_directory+$.fn.getProgramDirectory()+($.fn.isEmpty(sbplus.courseNumber)?"":sbplus.courseNumber)+".jpg";$.get(t.sbplus_root_directory+"scripts/templates/sbplus.tpl",function(e){$(".sbplus_wrapper").html(e),$.get(i,function(){sbplus.splashImg=i}).fail(function(){sbplus.splashImg=t.sbplus_splash_directory+"default.jpg"}).always(function(){$(".splashscreen").html(sbplus.getSplashInfo()).css("background-image","url("+sbplus.splashImg+")"),$(".startBtn").css("background-color",sbplus.accent).on("click",function(){$(".splashscreen").fadeOut("fast",function(){$(".main_content_wrapper").css("display",Modernizr.flexbox?"flex":"block").fadeIn(500,function(){$(this).removeClass("hide"),$.fn.setupPresentation()}),$(this).remove()})})})}).fail(function(){$(".sbplus_wrapper").html('<div class="error"><h1>Template file not found!</h1><p>sbplus.tpl file not found in the templates directory.</p></div>')})},$.fn.setupPresentation=function(){$(".title_bar .title").html(sbplus.title),$(".author").html(sbplus.author),$(".menuBtn").on("click",function(){return $(this).attr("aria-expanded","true"),$("#menu_panel").removeClass("hide").attr("aria-expanded","true"),!1}),$("#showProfile").on("click",function(){return $(this).showMenuItemDetails("Author Profile",sbplus.authorBio),!1}),$("#showGeneralInfo").on("click",function(){return $(this).showMenuItemDetails("General Information",sbplus.generalInfo),!1}),$("#showHelp").on("click",function(){return $(this).showMenuItemDetails("Help","<p>Help information go here...</p>"),!1}),$("#showSettings").on("click",function(){return $(this).showMenuItemDetails("Settings","<p>Settings go here...</p>"),!1}),$(".backBtn").on("click",function(){return $.fn.hideMenuItemDetails(),!1}),$(".closeBtn").on("click",function(){return $(".menuBtn").attr("aria-expanded","false"),$("#menu_panel").addClass("hide").attr("aria-expanded","false"),$.fn.hideMenuItemDetails(),!1})},$.fn.haveCoreFeatures=function(){return Modernizr.audio&&Modernizr.video&&Modernizr.json&&Modernizr.eventlistener?!0:!1},$.fn.getConfigFileUrl=function(){var t=document.getElementById("sbplus_configs");return null===t?!1:t.href},$.fn.isEmpty=function(t){var e=t.trim();return!e||0===e.length},$.fn.showMenuItemDetails=function(t,e){$(this).attr("aria-expanded","true"),$(".menu_item_details").attr("aria-expanded","true"),$(".menu_item_details .navbar .title").html(t),$(".menu_item_details .menu_item_content").html(e),$(".menu_item_details").removeClass("hide").animate({right:"0px"},250)},$.fn.hideMenuItemDetails=function(){$(".menu_item a").attr("aria-expanded","false"),$(".menu_item_details").attr("aria-expanded","false").animate({right:"-258px"},250,function(){$(this).addClass("hide")})},$.fn.getProgramDirectory=function(){var t=window.location.href.split("/");return($.fn.isEmpty(t[t.length-1])||new RegExp("[?]").test(t[t.length-1]))&&t.splice(t.length-1,1),void 0===t[4]?t[3]:t[4]};