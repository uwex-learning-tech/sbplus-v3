/***************************************
    GLOBAL HELPER FUNCTIONS
****************************************/

$.fn.getProgramDirectory = function() {

    var url = window.location.href.split( "/" );
    
    if ( $.fn.isEmpty( url[url.length - 1] ) || new RegExp( '[\?]' ).test( url[url.length - 1] ) ) {
        
        url.splice( url.length - 1, 1 );
        
    }
    
    if ( url[4] === undefined ) {
        
        return url[3];
        
    }
    
    return url[4];

};

$.fn.getRootDirectory = function() {
    
    var url = window.location.href.split( "/" );
    
    if ( $.fn.isEmpty( url[url.length - 1] ) || new RegExp( '[\?]' ).test( url[url.length - 1] ) || url[url.length - 1] === 'index.html'  ) {
        
        url.splice( url.length - 1, 1 );
        
    }
    
    return url[url.length - 1];
    
};

$.fn.getConfigFileUrl = function() {
 
    var configsFile = document.getElementById( 'sbplus_configs' );
    
    if ( configsFile === null ) {
     
     return false;
     
    }
    
    return configsFile.href;
 
};

$.fn.isEmpty = function( str ) {
    
    return ( !str.trim() || str.trim().length === 0 );
    
};

String.prototype.capitalize = function() {
    
    return this.charAt(0).toUpperCase() + this.slice(1);
    
};

$.fn.cleanString = function( str ) {
    
    return str.replace(/[^\w]/gi, '').toLowerCase();
    
};

$.fn.removeExtension = function( str ) {
    var pos = str.indexOf('.');
    return str.substr(0, pos);
    
};

$.fn.haveCoreFeatures = function() {
        
    if ( !Modernizr.audio || !Modernizr.video || !Modernizr.json || !Modernizr.flexbox ) {

        return false;
    
    }
    
    return true;
    
};

$.fn.colorLum = function( hex, lum ) {
    
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
    
};

$.fn.toSeconds = function( str ) {
    
    var arr = str.split( ':' );
    return Number( arr[0] * 60 ) + Number( arr[1] );
    
};

$.fn.autoscroll = function( parent ) {
 
    var halfParentHeight = parent[0].clientHeight / 2;
    var scrollY = this[0].offsetTop - halfParentHeight;
    
    if ( scrollY < 0 ) {
        scrollY = 0;
    }
    
    parent.animate( {
        scrollTop : scrollY
    }, 500, 'linear' );

};

/***************************************
    Menu Bar Accessibility Friendly
    http://oaa-accessibility.org/example/26/
****************************************/

function MenuBar( id, vmenu ) {
        
    this.$id = $( '#' + id );
    
    this.$rootItems = this.$id.children( 'li' );
    
    this.$items = this.$id.find('.menu-item').not('.separator');
    this.$parents = this.$id.find('.menu-parent');
    this.$allItems = this.$parents.add(this.$items);
    this.$activeItem = null;
    
    this.vmenu = vmenu;
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
    
    var thisObj = this;
    
    /* MOUSE EVENTS */
    
    // mouseenter handler for the menu items
    this.$items.on( 'mouseenter', function() {
        $(this).addClass( 'menu-hover' );
        return true;
    } );
    
    // mouseout handler for the menu items
    this.$items.on( 'mouseout', function() {
        $(this).removeClass( 'menu-hover' );
        return true;
    } );
    
    // mouseenter handler for the menu parents
    this.$parents.on( 'mouseenter', function( e ) {
        return thisObj.handleMouseEnter( $(this), e );
    } );
    
    // mouselease handler for the menu parents
    this.$parents.on( 'mouseleave', function( e ) {
        return thisObj.handleMouseLeave( $(this), e );
    } );
    
    // click handler for all items
    this.$allItems.on( 'click', function() {
        return thisObj.handleClick( $(this) );
    } );
    
    /* KEY EVENTS */
    
    // keydown handler for all items
    this.$allItems.on( 'keydown', function( e ) {
        return thisObj.handleKeydown( $(this), e );
    } );
    
    // keypress handler for all items
    this.$allItems.on( 'keypress', function( e ) {
        return thisObj.handleKeypress( $(this), e );
    } );
    
    // focus handler for all items
    this.$allItems.on( 'focus', function( e ) {
        return thisObj.handleFocus( $(this), e );
    } );
    
    // blur hander for all items
    this.$allItems.on( 'blur', function(  e) {
        return thisObj.handleBlur( $(this), e );
    } );
    
    // document click handler
    $( document ).on( 'click', function( e ) {
        return thisObj.handleDocumentClick( e );
    } );
            
};

// Process mouse over events for the top menus
MenuBar.prototype.handleMouseEnter = function( $item ) {
    
    // add hover style (if applicable)
    $item.addClass( 'menu-hover' ).attr( 'aria-expanded', 'true' );
    
    // expand the first level submenu
    if ( $item.attr( 'aria-haspopup' ) === 'true' ) {
        
        $item.children('ul').attr( {
            'aria-hidden': 'false',
            'aria-expanded': 'true'
        } );
        
    }
    
    // stop propagation
    return true;

};

// process mouse out events for the top menu
MenuBar.prototype.handleMouseOut = function( $item ) {
    
    //remove hover style
    $item.removeClass( 'menu-hover' ).attr( 'aria-expanded', 'false' );
    
    // stop propagation
    return true;
    
};

// process mouse leave events for the top menu
MenuBar.prototype.handleMouseLeave = function( $menu ) {

    var $active = $menu.find('.menu-focus');
    
    // remove hover style
    $menu.removeClass( 'menu-hover' ).attr( 'aria-expanded', 'false' );
    
    // if any item in the child menu has focus, move focus to root item
    if ( $active.length > 0 ) {
        
        this.bChildOpen = false;
        
        // remove the focus style from the active item
        $active.removeClass( 'menu-focus' ); 
        
        // store the active item
        this.$activeItem = $menu;
        
        // cannot hide items with focus -- move focus to root item
        $menu.focus();
        
    }
    
    // hide child menu
    $menu.children( 'ul' ).attr( {
        'aria-hidden': 'true',
        'aria-expanded': 'false'
    } );
    
    return true;

};

// process click events for the top menus

MenuBar.prototype.handleClick = function( $item ) {

    var $parentUL = $item.parent();
    
    if ( $parentUL.is('.root-level') ) {
        
        // open the child menu if it is closed
        var $menu = $item.children( 'ul' ).first();
        
        if ( $menu.attr( 'aria-hidden' ) === 'false' ) {
            
            $item.attr( 'aria-expanded', 'false' );
            
            $menu.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
        } else {
            
            $item.attr( 'aria-expanded', 'true' );
            
            $menu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
            
        }
        
    } else {
        
        // remove hover and focus styling
        this.$allItems.removeClass('menu-hover menu-focus');
        
        $item.attr( 'aria-expanded', 'false' );
        
        // close the menu
        this.$id.find( 'ul' ).not( '.root-level' ).attr( {
            'aria-hidden': 'true',
            'aria-expanded': 'false'
        } );
    
    }
    
    //e.stopPropagation();
    //return false;

};

// process focus events for the menu
MenuBar.prototype.handleFocus = function( $item ) {
    
    // if activeItem is null, get focus from outside the menu
    // store the item that triggered the event
    if ( this.$activeItem === null ) {
        
        this.$activeItem = $item;
        
    } else if ( $item[0] !== this.$activeItem[0] ) {
        
        return true;
        
    }
    
    // get the set of objects for all the parent items of the active item
    var $parentItems = this.$activeItem.parentsUntil( 'div' ).filter( 'li' );
    
    // remove focus styling from all other menu items
    this.$allItems.removeClass( 'menu-focus' );
    
    // add foucus styling to the active item
    this.$activeItem.addClass( 'menu-focus' );
    
    // add focus styling to all parent items
    $parentItems.addClass( 'menu-focus' );
    
    if ( this.vmenu === true ) {
        
        // if the bChildOpen flag has been set, open the active item's child menu (if applicable)
        if ( this.bChildOpen === true ) {
            
            var $itemUL = $item.parent();
            
            // if the itemUL is a root-level menu and item is a parent item
            if ( $itemUL.is( '.root-level' ) && ( $item.attr( 'aria-haspopup' ) === 'true' ) ) {
                
                $item.attr( 'aria-expanded', 'true' );
                
                $item.children( 'ul' ).attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
            }
            
        } else {
            
            this.vmenu = false;
            
        }
        
    }
    
    return true;

};

// process blur events for the menu
MenuBar.prototype.handleBlur = function( $item ) {

   $item.removeClass( 'menu-focus' );
   return true;

};

// process keydown events for the menus
MenuBar.prototype.handleKeydown = function( $item, e ) {

    if ( e.altKey || e.ctrlKey ) {
        
        // modifier key pressed; do not process
        return true;
    }
    
    var $itemUL = $item.parent();
    
    switch( e.keyCode ) {
        
        case this.keys.tab: {
            
            $item.attr( 'aria-expanded', 'false' );
            
            // hide all menu items and update their aria attributes
            this.$id.find( 'ul' ).attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove focus styling from all menu items
            this.$allItems.removeClass( 'menu-focus' );
            
            this.$activeItem = null;
            this.bChildOpen = false;
            
            break;
        
        }
        case this.keys.esc: {
            
            $item.attr( 'aria-expanded', 'false' );
            
            if ( $itemUL.is('.root-level') ) {
                
                // hide the child menu and update the aria attributes
                $item.children( 'ul' ).first().attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
            } else {
                
                // move up one level
                this.$activeItem = $itemUL.parent();
                
                // reset the bChildOpen flag
                this.bChildOpen = false;
                
                // set focus on the new item
                this.$activeItem.focus();
                
                // hide the active menu and update the aria attributes
                $itemUL.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
            }
            
            e.stopPropagation();
            return false;
            
        }
        
        case this.keys.enter:
        case this.keys.space: {
            
            var $parentUL = $item.parent();
            
            if ( $parentUL.is('.root-level') ) {
        
                // open the child menu if it is closed
                $item.children( 'ul' ).first().attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
            } else {
                
                //remove hover and focus styling
                this.$allItems.removeClass( 'menu-hover menu-focus' );
                
                // close the menu
                this.$id.find( 'ul' ).not( '.root-level' ).attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                // download/open the file
                var id = this.$activeItem.find( 'a' ).attr( 'id' );
                document.getElementById( id ).click();
                
                // clear the active item
                this.$activeItem = null;
                
            }
            
            e.stopPropagation();
            return false;
            
        }
        
        case this.keys.left: {
            
            if ( this.vmenu === true && $itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root level is active,
                // move to the previous item in the menu
                this.$activeItem = this.moveUp( $item );
                
            } else {
                
                this.$activeItem = this.moveToPrevious( $item );
                 
            }
            
            this.$activeItem.focus();
            
            e.stopPropagation();
            return false;
            
        }
        
        case this.keys.right: {
            
            if ( this.vmenu === true && $itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the next item in the menu
                this.$activeItem = this.moveDown( $item );
                
            } else {
                
                this.$activeItem = this.moveToNext( $item );
                
            }
            
            this.$activeItem.focus();
            
            e.stopPropagation();
            return false;
            
        }
        
        case this.keys.up: {
            
            if ( this.vmenu === true && $itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the previous root-level menu
                this.$activeItem = this.moveToPrevious( $item );
                
            } else {
                
                this.$activeItem = this.moveUp($item);
                
            }
            
            this.$activeItem.focus();
            
            e.stopPropagation();
            return false;
        
        }
        
        case this.keys.down: {
            
            if ( this.vmenu === true && $itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the next root-level menu
                this.$activeItem = this.moveToNext( $item );
                
            } else {
                
                this.$activeItem = this.moveDown( $item );
                
            }
            
            this.$activeItem.focus();
            
            e.stopPropagation();
            return false;
                
        }
        
    } // end switch
    
    return true;

};

// function to move to the next menu level
MenuBar.prototype.moveToNext = function( $item ) {
    
    // item's containing menu
    var $itemUL = $item.parent();
    
    // the items in the currently active menu
    var $menuItems = $itemUL.children( 'li' );
    
    // the number of items in the active menu
    var menuNum = $menuItems.length;
    
    // the items index in its menu
    var menuIndex = $menuItems.index($item);
    
    var $newItem = null;
    var $childMenu = null;
    
    if ( $itemUL.is( '.root-level' ) ) {
        
        // this is the root level move to next sibling and
        // will require closing the current child menu and
        // opening the new one
        
        // if not the root menu
        if ( menuIndex < menuNum - 1 ) {
            
            $newItem = $item.next();
            
        } else {
            
            // wrap to first item
            $newItem = $menuItems.first();
            
        }
        
        // close the current child menu (if applicable)
        if ( $item.attr( 'aria-haspopup' ) === 'true' ) {
            
            $childMenu = $item.children( 'ul' ).first();
            
            if ( $childMenu.attr( 'aria-hidden' ) === 'false' ) {
                
                $item.attr( 'aria-expanded', 'false' );
                
                // update the child menu's aria hidden attribute
                $childMenu.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                this.bChildOpen = true;
                
            }
            
        }
        
        // remove the focus styling from the current menu
        $item.removeClass('menu-focus');
        
        // open the new child menu (if applicable)
        if ( ( $newItem.attr( 'aria-haspopup' ) === 'true' ) && ( this.bChildOpen === true ) ) {
            
            $childMenu = $newItem.children( 'ul' ).first();
            
            $item.attr( 'aria-expanded', 'true' );
            
            // update the child's aria-hidden attribute
            $childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
        
        }
        
    } else {
        
        // this is not the root-level
        // if there is a child menu to be moved into,
        // do that; otherwise, move to the next root-level menu
        // if there is one
        
        if ( $item.attr('aria-haspopup') === 'true' ) {
        
            $childMenu = $item.children('ul').first();
            $newItem = $childMenu.children('li').first();
            
            $item.attr( 'aria-expanded', 'true' );
            
            // show the child menu and update its aria attribute
            $childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
            
        } else {
            
            // at deepest level, move to the next root-item menu
            
            if ( this.vmenu === true ) {
                
                // do nothing
                return $item;
                
            }
            
            var $parentMenus = null;
            var $rootItem = null;
            
            // get the list of all parent menus for item, up to the root level
            $parentMenus = $item.parentsUntil( 'div' ).filter( 'ul' ).not( '.root-level' );
            
            $item.attr( 'aria-expanded', 'false' );
            
            // hide the current menu and update its aria attribute accordingly
            $parentMenus.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus styling from the active menu
            $parentMenus.find( 'li' ).removeClass( 'menu-focus' );
            $parentMenus.last().parent().removeClass( 'menu-focus' );
            
            // the containing root for the menu
            $rootItem = $parentMenus.last().parent();
            
            menuIndex = this.$rootItems.index( $rootItem );
            
            // if this is not the last root menu item,
            // move to the next one
            if ( menuIndex < this.$rootItems.length - 1 ) {
                
                $newItem = $rootItem.next();
                
            } else {
                
                $newItem = this.$rootItems.first();
                
            }
            
            // add the focus styling to the new menu
            $newItem.addClass( 'menu-focus' );
            
            if ( $newItem.attr( 'aria-haspopup' ) === 'true' ) {
                
                $childMenu = $newItem.children( 'ul' ).first();
                
                $newItem = $childMenu.children( 'li' ).first();
                
                $item.attr( 'aria-expanded', 'true' );
                
                // show the child menu and update its aria attribute
                $childMenu.attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                this.bChildOpen = true;
                
            }
            
        }
        
    }
    
    return $newItem;
};

// function to move to the previous menu level
MenuBar.prototype.moveToPrevious = function( $item ) {
    
    // $item's containing menu
    var $itemUL = $item.parent();
    
    // the items in the currently active menu
    var $menuItems = $itemUL.children( 'li' );
    
    // the items index in its menu
    var menuIndex = $menuItems.index( $item );
    var $newItem = null;
    var $childMenu = null;
    
    if ( $itemUL.is( '.root-level' ) ) {
        
        // this is the root level move to previous sibling and
        // will require closing the current child menu and
        // opening the new one
        
        if ( menuIndex > 0 ) {
            
            $newItem = $item.prev();
            
        } else {
            
            // wrap to the last
            $newItem = $menuItems.last();
            
        }
        
        // close the current child menu (if applicable)
        if ( $item.attr( 'aria-haspopup' ) === 'true' ) {
        
            $childMenu = $item.children('ul').first();
            
            if ( $childMenu.attr( 'aria-hidden' ) === 'false' ) {
                
                $item.attr( 'aria-expanded', 'false' );
                
                // update the child menu's aria-hidden attribute
                $childMenu.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                this.bChildOpen = true;
                
            }
            
        }
        
        // remove the focus styling from the current menu
        $item.removeClass('menu-focus');
        
        // open the new child menu (if applicable)
        if ( ( $newItem.attr( 'aria-haspopup' ) === 'true' ) && ( this.bChildOpen === true ) ) {
        
            $childMenu = $newItem.children('ul').first();
            
            $item.attr( 'aria-expanded', 'true' );
            
            // update the child's aria-hidden attribute
            $childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
        
        }
        
    } else {
        
        // this is not the root level
        // if there is parent menu that is not the root menu,
        // move up one level; otherwise, move to first item of the previous root menu
        
        var $parentLI = $itemUL.parent();
        var $parentUL = $parentLI.parent();
        
        // if this is a vertical menu or is not the first child menu
        // of the root-level menu, move up one level
        if ( this.vmenu === true || !$parentUL.is( '.root-level' ) ) {
        
            $newItem = $itemUL.parent();
            
            $item.attr( 'aria-expanded', 'false' );
            
            // hide the active menu and update aria-hidden
            $itemUL.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus highlight from the $item
            $item.removeClass( 'menu-focus' );
        
            if ( this.vmenu === true ) {
                
                // set a flag so the focus handler does't reopen the menu
                this.bChildOpen = false;
                
            }
        
        } else {
            
            // move to previous root-level menu
            
            $item.attr( 'aria-expanded', 'false' );
            
            // hide the current menu and update the aria attributes accordingly
            $itemUL.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus styling from the active menu
            $item.removeClass( 'menu-focus' );
            $parentLI.removeClass( 'menu-focus' );
            
            menuIndex = this.$rootItems.index( $parentLI );
            
            if ( menuIndex > 0 ) {
                
                // move to the previous root-level menu
                $newItem = $parentLI.prev();
                
            } else {
                
                // loop to last root-level menu
                $newItem = this.$rootItems.last();
                
            }
            
            // add the focus styling to the new menu
            $newItem.addClass( 'menu-focus' );
            
            if ( $newItem.attr( 'aria-haspopup' ) === 'true' ) {
                
                $childMenu = $newItem.children('ul').first();
                
                $item.attr( 'aria-expanded', 'true' );
                
                // show the child menu and update it's aria attributes
                $childMenu.attr({
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                });
                
                this.bChildOpen = true;
                
                $newItem = $childMenu.children('li').first();
                
            }
        }
        
    }
    
    return $newItem;
    
};

// function to select the next item in a menu
MenuBar.prototype.moveDown = function( $item, startChr ) {
    
    // $item's containing menu
    var $itemUL = $item.parent();
    
    // the items in the currently active menu
    var $menuItems = $itemUL.children( 'li' ).not( '.separator' );
    
    // the number of items in the active menu
    var menuNum = $menuItems.length;
    
    // the items index in its menu
    var menuIndex = $menuItems.index( $item );
    
    var $newItem = null;
    var $newItemUL = null;
    
    if ( $itemUL.is( '.root-level' ) ) {
        
        if ( $item.attr( 'aria-haspopup' ) !== 'true' ) {
            
            // no child to move to
            return $item;
            
        }
        
        // move to the first item in the child menu
        $newItemUL = $item.children( 'ul' ).first();
        $newItem = $newItemUL.children( 'li' ).first();
        
        $($newItemUL.parent()).attr( 'aria-expanded', 'true' );
        
        $item.attr( 'aria-expanded', 'true' );
        
        // make sure the child menu is visible
        $newItemUL.attr( {
            'aria-hidden': 'false',
            'aria-expanded': 'true'
        } );
        
        return $newItem;
        
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
        
            var titleChr = $menuItems.eq( curNdx ).html().charAt( 0 );
            
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
            
            $newItem = $menuItems.eq( curNdx );
            
            // remove the focus styling from the current item
            $item.removeClass( 'menu-focus' );
            return $newItem;
            
        } else {
            
            return $item;
            
        }
        
    } else {
        
        if ( menuIndex < menuNum - 1 ) {
            
            $newItem = $menuItems.eq( menuIndex + 1 );
            
        } else {
            
            $newItem = $menuItems.first();
            
        }
        
    }
    
    // remove the focus styling from the current item
    $item.removeClass('menu-focus');
    
    return $newItem;
    
};

// function to select the previous item in a menu
MenuBar.prototype.moveUp = function( $item ) {
    
    // $item's containing menu 
    var $itemUL = $item.parent();
    
    // the items in the currently active menu
    var $menuItems = $itemUL.children( 'li' ).not( '.separator' );
    
    // the items index in its menu
    var menuIndex = $menuItems.index( $item );
    
    var $newItem = null;
    
    if ( $itemUL.is( '.root-level' ) ) {
        
        // nothing to do
        return $item;
        
    }
    
    // if item is not the first item in its menu,
    // move to the previous item
    if ( menuIndex > 0 ) {
        
        $newItem = $menuItems.eq( menuIndex - 1 );
        
    } else {
        
        // loop to top of the menu
        $newItem = $menuItems.last();
    }
    
    // remove the focus styling from the current item
    $item.removeClass('menu-focus');
    
    return $newItem;
    
};

// function to process keypress events for the menu
MenuBar.prototype.handleKeypress = function( $item, e ) {

    if ( e.altKey || e.ctrlKey || e.shiftKey ) {
        
        // modifier key pressed; do not process
        return true;
        
    }
    
    switch( e.keyCode ) {
        
        case this.keys.tab: {
            return true;
        }
        
        case this.keys.esc:
        //case this.keys.enter:
        //case this.keys.space:
        case this.keys.up:
        case this.keys.down:
        case this.keys.left:
        case this.keys.right: {
            e.stopPropagation();
            return false;
        }
        default : {
            var chr = String.fromCharCode( e.which );
        
            this.$activeItem = this.moveDown( $item, chr );
            this.$activeItem.focus();
        
            e.stopPropagation();
            return false;
        }
    
    } // end switch
    
    return true;

};

// function to process click events on the document
MenuBar.prototype.handleDocumentClick = function() {
    
    // get the list of all child menus
    var $childMenus = this.$id.find( 'ul' ).not( '.root-level' );
    
    // hide the child menus
/*
    $childMenus.attr( {
        'aria-hidden': 'true',
        'aria-expanded': 'false'
    } );
*/
    
    this.$allItems.removeClass( 'menu-focus' );
    
    this.$activeItem = null;
    
    // allow the event to propagate
    return true;

};

/***************************************
    LOCAL STORAGE FUNCTIONS
****************************************/

$.fn.setLSItem = function( name, value ) {
    
    localStorage.setItem( name, value );
    
};

$.fn.getLSItem = function( name ) {
    
    return localStorage.getItem( name );
    
};

$.fn.removeLSItem = function( name ) {
    
    localStorage.removeItem( name );
    
};

$.fn.hasLSItem = function( name ) {
  
  if ( localStorage.getItem( name ) === null ) {
      return false;
  }
  
  if ( $.fn.isEmpty( localStorage.getItem( name ) ) ) {
      return false;
  }

  return true;
    
};

/***************************************
    SESSION STORAGE FUNCTIONS
****************************************/

$.fn.ssSet = function( name, value ) {
    
    sessionStorage.setItem( name, value );
    
};

$.fn.ssGet = function( name ) {
    
    return sessionStorage.getItem( name );
    
};

$.fn.ssRemove = function( name ) {
    
    sessionStorage.removeItem( name );
    
};

$.fn.ssHas = function( name ) {
  
  if ( sessionStorage.getItem( name ) === null ) {
      return false;
  }
  
  if ( $.fn.isEmpty( sessionStorage.getItem( name ) ) ) {
      return false;
  }

  return true;
    
};