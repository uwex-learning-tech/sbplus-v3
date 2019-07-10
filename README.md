# Storybook Plus (SB+)  
**version 3.2**

---
### Requirements

Storybook Plus is a web application that uses HTML5, JavaScript, CSS3, and web storage to deliver multimedia presentations. As with any other web applications, the choice of web browsers is the most critical rather than the operating systems. JavaScript must be enabled no matter which web browser is utilized. SB+ does not use cookies; however, it does use both local and session web storages.

**Minimum web browser requirements for desktop/laptop:**
* Internet Explorer 11 (in non-Compatibility View mode)
* Microsoft Edge (version 12+)
* Mozilla Firefox (version 45+)
* Google Chrome (version 21+)
* Apple Safari (version 6.1+)
* Opera (version 12.1+)

**Minimum web browser requirements for mobile/smart device:**
* iOS Safari (version 7.1+)
* Opera Mobile (37)
* Android Browser (version 56+)
* Google Chrome for Android (version 57+)
* Mozilla Firefox for Android (version 52)
* Internet Explorer Mobile (version 11.4)

**Recommended (latest stable version) web browsers in order:**
* Mozilla Firefox
* Google Chrome
* Apple Safari
* Microsoft Edge

**Requirement and Recommendations for accessibilities:**
* Windows OS (check screen reader requirements for additional details)
* Mozilla Firefox or Google Chrome
* JAWS (version 16+)
* NVDA (latest version)
* Windows Eyes (version 8+)
* VoiceOver on iOS (iPhone/iPad)

Notes: most visually impaired users started out using screenreader with Internet Explorer prepackaged. However, and unfortunately, Microsoft stops supporting accessibilities as newer versions of Internet Explorer were released. Storybook Plus will cause additional restrictions for screen reader due to Microsoft’s non-existent accessibility supports for HTML5 on Internet Explorer including their latest web browser application, Microsoft Edge. Based on our user testing results, visually impaired users are moving toward Mozilla Firefox or Google Chrome.

SB+ may not function properly with beta or pre-release versions of web browsers. Please use the latest stable version for the best experience.

---
### Version Change Log

#### Pending
_none_  

#### 3.2.0 (07/10/2019)
* When viewing SB+ Presentation on standalone page (i.e., not embedded inside an iframe), program specific style will be applied, include copyright information. If program style is not available, accent color will be used instead.
* `manifest.json` file is updated to allow downloadable file format specifications.
* Added a new `sbplus_program_theme` property to the `manifest.json` file. This property contains the URL to the `themes.json` file.
* SB+ will now look for downloadable file formats specified in the `manifest.json` file.
* Added rewind and skip 10 seconds button to the media playback controls.
* Added a new `preventAutoplay` attribute to the page tag in the SB+ XML. The attribute will force the media to stop autoplaying even when the autoplay setting is on.
* Updated `animated.css` (the transition animations) to version 3.7.2.

#### 3.1.7 (04/08/2019)
* Added `sbplus_program_json` and `sbplus_author_json` properties to `manifest.json` file to hold a URL to the respective JSON file, which returns author name or program name respectively.
* Moved `preload.php`, `programs.php` and `authors.php` files to the new `php` folder.
* Kaltura video now tracks "play reach 25%", "play reach 50%", and "play reach 75%".

#### 3.1.6 (02/27/2019)
* Table of contents no longer hides the first section row when the first item in the first section has more than 2 lines ([#80](https://github.com/oel-mediateam/sbplus_v3/issues/80))
* Page/slide image are now preloaded and cached ([#86](https://github.com/oel-mediateam/sbplus_v3/issues/86))
* Updated XML parse error message ([#89](https://github.com/oel-mediateam/sbplus_v3/issues/89))
* Author profile now scrolls when it has a longer content ([#91](https://github.com/oel-mediateam/sbplus_v3/issues/91))
* Updated file name manipulation to include presentation created by the Packager ([#92](https://github.com/oel-mediateam/sbplus_v3/issues/92))
* Long link in notes or widgets content area now wraps to new/next line ([#93](https://github.com/oel-mediateam/sbplus_v3/issues/93))
* The XML file is no longer cached. Always fresh! ([#94](https://github.com/oel-mediateam/sbplus_v3/issues/94))

#### 3.1.5 (01/23/2019)
* Fixed an issue where author photo is not loaded from the server.
* Author placeholder image has been removed to give more space for text when there is no author photo.
* Added GET requests to Kaltura Analytics for play, impression, and reached 100% event
* Fixed an error caused by missing `note` element in the XML
* Fixed notes section not showing after returning (#90)
* Updated presentation's directory name instead of presentation's title (#87) 

#### 3.1.4 (07/27/2018)
* Fixed an issue where author photo is not loaded from the server.
* Author placeholder image has been removed to give more space for text when there is no author photo.

#### 3.1.3 (02/02/2018)
* If both image and audio are missing for image-audio page type, both errors will be displayed in the error message
* Fixed issue with responsiveness inside an iFrame
* Fixed issue where the page jumps when presentation started
* Default splash image will be loaded last if no other splash image is found (#77) - preventing the distracting flash
* Added a CSS hack for zooming on D2L on a Windows platform
* Fixed an issue where Error Message screen was out of view (#78) and full view URL query is not functioning
* Enhanced HTML page type to allow audio and to open a new tab/window instead of embed
* Enhanced/improved Google Analytic tracking
* Fixed table of content collapsible icon alignment (#79)
* Collapsed section will now open if the currently selected page is under it
* Quiz GA completion event is now fired when it is answered
* Fixed issue #81
* Set all downloadable file name to its directory name
* Changed the outer left border to have transparency color (#82)

#### 3.1.2 (11/07/2017)
* Author profile is now aligned to the right to avoid alignment issues with text wrapping
* Hide General Info under Menu when no general info is provided in the XML
* Video/audio automatically paused when opening a menu item
* Removed centralized author profile request when there is no author specified
* SBPLUS root directory defaults to `sources/` when not specified in the manifest
* Removed duplicate logo requests when a page has no widget contents
* Allow SB+ presentation to be loaded on Safari's private mode or any private mode that does not support local and session storages
* Display unknown page type error message when the page type is not supported
* Changed a few jQuery $.get methods to $.ajax methods for HEAD request
* Updated SBPLUS SVG logo and CSS

#### 3.1.1 (06/22/2017)
* Fixed the issue where bundle page type is not working properly
* Fixed the issue where local author info is not overriding centralized info
* `<![CDATA[ ]]>` is now optional in SB+'s XML
* Fixed the issue where large (hi-res) image in a quiz is not scaled down
* `correct` attribute for multiple choice question will now only recognized "yes" (case in-sensitive) value; all other value will be considered "no"
* Adjusted the color to be lighter for active selected menu item under menu panel
* Fixed the issue where session data conflicting with each other when loading more than one SB+ on the same page
* Fixed the issue with IE not loading the presentation
* Removed body margin on the HTML page
* Fixed the issue where IE does not understand that an undefined variable is undefined
* Left aligned table of contents label
* Fixed the issue where IE does not understand jQuery's .html() method
* Ignored missing tags for quiz pages in SB+ XML
* Fixed layout issues on iOS Safari and other browsers for mobile
* Removed mobile responsiveness when SB+ is loaded inside an iframe
* Fixed the issue where videoJS poster image is not properly sized for Microsoft Edge
* Fixed the issue where the widget area got pushed down after viewing a quiz
* Table of contents auto scroll is disabled when the table of contents is not visible
* Updated setting labels and button tooltips
* Disabled author profile button when an author is not specified
* Interactive transcript is completely switched off and removed from settings (will revisit in a future version)
* Fixed the issue where unordered and ordered HTML list is not properly formatted
* Updated CSS indexing for page error message

#### 3.1.0 (05/26/2017)
* Refactored code to be more robust and flexible
* Removed quiz type label
* Added ability to randomized answer choices
* Added basic optional Google Analytics integration
* Updated videoJS to version 6.1.0
* Applied accent color to other UI elements
* Added program attribute to the SBPLUS XML
* Restructured notes area to become a tabular widget area
* Implement optional interactive transcript (beta)
* Restructured menu and its layouts
* Added the ability to open author's profile by clicking the author's name on the top black bar
* Changed subtitles/captions chat bubble like button to tradition captions button
* Changed download button icon to a cloud with a down arrow
* Added better error message support
* Removed expand/contract button
* Added toggle Widget and toggle table of contents buttons
* Presentation no longer takes up the whole web browser's viewport
* Menu settings are now automatically saved when changes are made
* Author's profile is now loaded from the server first. XML data will override data from the server.
* Added more properties to manifest JSON file

#### 3.0.1 (10/06/2016)
* Proper error reporting for author profile
* For author profile, show what is available
* Fixed menu title bar alignment
* Added a new XML attribute to load MathJax 

#### 3.0.0 (08/29/2016)
* initial beta release

---
### License & Copyright
Storybook Plus (SB+) is licensed under [GNU v3](https://github.com/oel-mediateam/sbplus_v3/blob/master/LICENSE) license. (c) 2013 - 2019. Ethan Lin, [Creative Media Services](https://media.uwex.edu), and [University of Wisconsin Extended Campus](http://ce.uwex.edu/). All rights reserved.
