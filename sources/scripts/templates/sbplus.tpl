<div class="sbplus">
    
    <div class="splashscreen"></div>
    
    <div class="main_content_wrapper hide">
        
        <div class="title_bar">
        
            <div class="title" tabindex="-1"></div>
            <div class="author" tabindex="-1"></div>
            <button class="menuBtn" tabindex="1" aria-label="Menu" aria-expanded="false" aria-controls="menu_panel" title="Open Menu"><span class="icon-menu"></span></button>
            
        </div>
        
        <!-- page/slide container -->
        
        <div class="page_container aspect-ratio" aria-live="polite">
            <div class="content"></div>
        </div>
        
        <div class="widget_container">
            
            <!-- notes & controls -->
            
            <div class="left_side">
                
                <div class="notes">
                    <div class="content"></div>
                </div>
                
                <nav class="control_bar_wrapper">
                    <button class="previous"><span class="icon-left"></span></button>
                    <button class="next"><span class="icon-right"></span></button>
                    <div class="status">Slide <span class="current">#</span> of <span class="total">#</span></div>
                </nav>
            
            </div>
            
            <!-- side bar -->
        
            <div class="side_panel">
                
                <div class="topbar">
                    <div class="title">Table of Contents</div>
                </div>
                
                <div class="tableOfContents"></div>
                
            </div>
            
            <!-- end side bar -->
            
        </div>
        
        <!-- menu panel -->
        <nav id="menu_panel" class="hide" aria-expanded="false">
            
            <div class="menu_bar">
                <div class="title">Menu</div>
                <button class="closeBtn" title="Close Menu"><span class="icon-close"></span></button>
            </div>
            
            <ul class="menu">
                <li class="menu_item"><a id="showProfile" href="#" aria-expanded="false" aria-controls="menu_item_details"><span class="icon-profile"></span> Author Profile</a></li>
                <li class="menu_item"><a id="showGeneralInfo" href="#" aria-expanded="false" aria-controls="menu_item_details"><span class="icon-info"></span> General Information</a></li>
                <li class="menu_item"><a id="showHelp" href="#" aria-expanded="false" aria-controls="menu_item_details"><span class="icon-help"></span> Help</a></li>
                <li class="menu_item"><a id="showSettings" href="#" aria-expanded="false" aria-controls="menu_item_details"><span class="icon-settings"></span> Settings</a></li>
            </ul>
            
            <div id="menu_item_details" class="menu_item_details hide" aria-expanded="false">
                <div class="navbar">
                    <button class="backBtn" aria-label="Back to menu list"><span class="icon-left"></span></button>
                    <div class="title">Title</div>
                </div>
                <div class="menu_item_content"></div>
            </div>
            
        </nav>
        
        <!-- end menu panel -->
        
    </div>
</div>