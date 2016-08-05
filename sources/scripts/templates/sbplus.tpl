<div class="sbplus">
    
    <div class="splashscreen"></div>
    
    <div class="main_content_wrapper hide">
        
        <div class="title_bar">
        
            <div class="title" tabindex="-1"></div>
            <div class="author" tabindex="-1"></div>
            <button class="menuBtn" tabindex="1" aria-label="Menu" aria-expanded="false" aria-controls="menu_panel" title="Open Menu"><span class="icon-menu"></span></button>
            
        </div>
        
        <div class="sr-PageStatus" tabindex="1">You are currently on page <span class="currentPage" >#</span> of <span class="totalPages">#</span>. <span class="pageTitle">Page title</span>. <span class="hasNotes"></span></div>
        
        <!-- page/slide container -->
    
        <div class="page_container aspect-ratio" aria-live="polite">
            <div class="content" tabindex="1"></div>
        </div>
        
        <div class="widget_container">
            
            <!-- notes & controls -->
            
            <div class="left_side">
                
                <div class="notes" tabindex="-1">
                    <div class="content"></div>
                </div>
                
                <div class="control_bar_wrapper">
                    <div class="left_controls">
                        <button class="previous" tabindex="1" title="Previous page" aria-label="Previous"><span class="icon-left"></span></button>
                        <button class="next" tabindex="1" title="Next page" aria-label="Next"><span class="icon-right"></span></button>
                    </div>
                    <div class="status" tabindex="1">Page <span class="current">#</span> of <span class="total">#</span></div>
                    <div class="downloadsMenu_wrapper">
                        
                        <ul id="download-menu-btn" class="root-level" role="menubar">
                            
                            <li class="menu-parent" role="menuitem" aria-label="Downloads Menu" tabindex="1" aria-haspopup="true" aria-expanded="false">
                                <span class="icon-download"></span>
                                <ul class="downloadFiles menu" role="menu" aria-hidden="true" aria-expanded="false"></ul>
                            </li>
                            
                        </ul>
                        
                    </div>
                    
                    <div class="right_controls">
                        <button tabindex="1" class="notesBtn hide" title="Show notes" aria-label="Notes"><span class="icon-notes"></span></button>
                        <button tabindex="1" class="tocBtn hide" title="Show table of contents" aria-label="Table of Contents"><span class="icon-table-of-content"></span></button>
                        <button tabindex="1" class="expandContractBtn" title="Expand or contract" aria-label="Expand or contract toggle"><span class="icon-expand"></span></button>
                        <!-- <button class="popoutBtn hide"><span class="icon-popout"></span></button> -->
                    </div>
                    
                </div>
            
            </div>
            
            <!-- side bar -->
        
            <div class="side_panel">
                
                <div class="topbar" tabindex="-1">
                    <div class="title" id="tocLabel">Table of Contents</div>
                </div>
                
                <div class="tableOfContents" role="navigation" aria-labelledby="tocLabel" tabindex="1"></div>
                
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
                    <button class="backBtn" aria-label="Back to menu list" title="Back"><span class="icon-left"></span></button>
                    <div class="title">Title</div>
                </div>
                <div class="menu_item_content"></div>
            </div>
            
        </nav>
        
        <!-- end menu panel -->
        
    </div>
</div>