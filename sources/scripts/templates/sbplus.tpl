<div id="sbplus_error_screen" class="animated"></div>

<div id="sbplus">
    
    <div id="sbplus_splash_screen" class="animated">
        
        <div id="sbplus_presentation_info">
            
            <p class="sb_title" tabindex="1"></p>
            <p class="sb_subtitle" tabindex="1"></p>
            <p class="sb_author" tabindex="1"></p>
            <p class="sb_duration" tabindex="1"></p>
            <p class="sb_cta">
                <button id="sbplus_start_btn" tabindex="1">Start</button>
                <button id="sbplus_resume_btn" tabindex="1">Resume</button>
            </p>
            <p class="sb_downloads"></p>
                
        </div>
        
        <div id="sb_splash_bg" class="animated fadeIn"></div>
        
    </div>
    
    <div id="sbplus_banner_bar">
        <div id="sbplus_lession_title"></div>
        <div id="sbplus_menu_area">
            
            <button id="sbplus_author_name"></button>
            
            <div id="sbplus_menu_btn_wrapper">
                
                <ul id="sbplus_menu_btn" class="root-level" role="menubar" title="Main Menu">
                    
                    <li class="menu-parent" role="menuitem" aria-label="Menu" tabindex="1" aria-haspopup="true" aria-expanded="false">
                        <span class="icon-menu menu-icon"></span>
                        <ul class="menu" role="menu" aria-hidden="true" aria-expanded="false">
                            
                            <li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite" id="sbplus_author_profile">
                                <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem('sbplus_author_profile');">
                                    <span class="icon-profile"></span>
                                    Author Profile
                                </a>
                            </li>
                            
                            <li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite" id="sbplus_general_info">
                                <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem('sbplus_general_info');">
                                    <span class="icon-info"></span>
                                    General Info
                                </a>
                            </li>
                            
                            <li class="menu-item" tabindex="-1" role="menuitem" aria-live="polite" id="sbplus_settings">
                                <a href="javascript:void(0);" onclick="SBPLUS.openMenuItem('sbplus_settings');">
                                    <span class="icon-settings"></span>
                                    Settings
                                </a>
                            </li>
                            
                        </ul>
                        
                    </li>
                    
                </ul>
                
            </div>
            
        </div>
        
    </div>
    
    <div id="sbplus_content_wrapper">
    
        <div id="sbplus_left_col">
            
            <div id="sbplus_media_wrapper" class="aspect_ratio">
                <div class="sbplus_media_error"></div>
                <div class="sbplus_media_content animated"></div>
            </div>
            
            <div id="sbplus_widget">
                
                <div class="widget_controls_bar">
                    <div class="tab_segment"></div>
                </div>
                
                <div class="segment_content animated"></div>
                
            </div>
            
        </div>
        
        <div id="sbplus_right_col">
            
            <div id="sbplus_sub_bar" class="full">
                <button class="backBtn"><span class="icon-left"></span></button>
                <div class="title">Table of Contents</div>
            </div>
            
            <div id="sbplus_table_of_contents_wrapper"></div>
            
        </div>
    
    </div>
    
    <div id="sbplus_control_bar">
        
        <div id="sbplus_left_controls">
            
            <button id="sbplus_previous_btn" title="Previous">
                <span class="icon-left"></span>
            </button>
            
            <button id="sbplus_next_btn" title="Next">
                <span class="icon-right"></span>
            </button>
            
            <div id="sbplus_page_status">
                <div>
                    Page <span class="current">#</span> of 
                    <span class="total">#</span>
                </div>
            </div>
            
        </div>
        
        <div id="sbplus_right_controls">
            
            <div id="sbplus_download_btn_wrapper">
                
                <ul id="sbplus_download_btn" class="root-level" role="menubar" title="Downloads">
                    
                    <li class="menu-parent" role="menuitem" aria-label="Downloads Menu" tabindex="1" aria-haspopup="true" aria-expanded="false">
                        <span class="icon-download"></span>
                        <ul class="downloadFiles menu" role="menu" aria-hidden="true" aria-expanded="false"></ul>
                    </li>
                    
                </ul>
                
            </div>
            
            <button id="sbplus_widget_btn" title="Widget">
                <span class="icon-widget-close"></span>
            </button>
            
            <button id="sbplus_sidebar_btn" title="Table of Contents">
                <span class="icon-sidebar-close"></span>
            </button>
            
        </div>
        
    </div>
    
    <div id="menu_item_content" class="animated">
        <div class="sbplus_menu_title_bar">
            <div class="title"></div>
            <button id="sbplus_menu_close_btn"><span class="icon-close"></span> Close</button>
        </div>
        <div class="content"></div>
    </div>
    
</div>

