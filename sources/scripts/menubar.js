/***************************************
    Menu Bar Accessibility Friendly
    https://www.w3.org/TR/wai-aria-practices-1.1/#menu
****************************************/

function MenuBar( domID, isVerticalMenu ) {
        
    this.id = $( '#' + domID );
    
    this.rootItems = this.id.children( 'li' );
    
    this.items = this.id.find('.menu-item').not('.separator');
    this.parents = this.id.find('.menu-parent');
    this.allItems = this.parents.add(this.items);
    this.activeItem = null;
    
    this.isVerticalMenu = isVerticalMenu;
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
    
    var self = this;
    
    /* MOUSE EVENTS */
    
    // mouseenter handler for the menu items
    self.items.on( 'mouseenter', function() {
        
        $( this ).addClass( 'menu-hover' );
        return true;
        
    } );
    
    // mouseout handler for the menu items
    self.items.on( 'mouseout', function() {
        
        $( this ).removeClass( 'menu-hover' );
        return true;
        
    } );
    
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
    self.allItems.on( 'click', function( e ) {
        
        self.handleClick( $( this ), e );
        
    } );
    
    /* KEY EVENTS */
    
    // keydown handler for all items
    self.allItems.on( 'keydown', function( e ) {
        
        return self.handleKeydown( $( this ), e );
        
    } );
    
    // keypress handler for all items
    self.allItems.on( 'keypress', function( e ) {
        
        return self.handleKeypress( $( this ), e );
        
    } );
    
    // focus handler for all items
    self.allItems.on( 'focus', function( e ) {
        
        return self.handleFocus( $( this ), e );
        
    } );
    
    // blur hander for all items
    self.allItems.on( 'blur', function(  e) {
        
        return self.handleBlur( $( this ), e );
        
    } );
    
    // document click handler
    $( document ).on( 'click', function( e ) {
        
        return self.handleDocumentClick( e );
        
    } );
            
};

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

MenuBar.prototype.handleClick = function( item, e ) {
    
    var self = this;
    var parentUL = item.parent();
    
    if ( parentUL.is('.root-level') ) {
        
        // open the child menu if it is closed
        var menu = item.children( 'ul' ).first();
        
        if ( menu.attr( 'aria-hidden' ) === 'false' ) {
            
            item.attr( 'aria-expanded', 'false' );
            
            menu.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            menu.parent().removeClass( 'active' );
            
        } else {
            
            item.attr( 'aria-expanded', 'true' );
            
            menu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
            
            menu.parent().addClass( 'active' );
            
        }
        
    } else {
        
        // remove hover and focus styling
        self.allItems.removeClass( 'menu-hover menu-focus' );
        
        item.attr( 'aria-expanded', 'false' );
        
        // close the menu
        self.id.find( 'ul' ).not( '.root-level' ).attr( {
            'aria-hidden': 'true',
            'aria-expanded': 'false'
        } );
    
    }
    
    e.stopPropagation();
    return false;

};

// process focus events for the menu
MenuBar.prototype.handleFocus = function( item ) {
    
    var self = this;
    
    // if activeItem is null, get focus from outside the menu
    // store the item that triggered the event
    if ( this.activeItem === null ) {
        
        this.activeItem = item;
        
    } else if ( item[0] !== self.activeItem[0] ) {
        
        return true;
        
    }
    
    // get the set of objects for all the parent items of the active item
    var parentItems = self.activeItem.parentsUntil( 'div' ).filter( 'li' );
    
    // remove focus styling from all other menu items
    self.allItems.removeClass( 'menu-focus' );
    
    // add foucus styling to the active item
    self.activeItem.addClass( 'menu-focus' );
    
    // add focus styling to all parent items
    parentItems.addClass( 'menu-focus' );
    
    if ( self.isVerticalMenu === true ) {
        
        // if the bChildOpen flag has been set, open the active item's child menu (if applicable)
        if ( self.bChildOpen === true ) {
            
            var itemUL = item.parent();
            
            // if the itemUL is a root-level menu and item is a parent item
            if ( itemUL.is( '.root-level' ) && ( item.attr( 'aria-haspopup' ) === 'true' ) ) {
                
                item.attr( 'aria-expanded', 'true' );
                
                item.children( 'ul' ).attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
            }
            
        } else {
            
            self.isVerticalMenu = false;
            
        }
        
    }
    
    return true;

};

// process blur events for the menu
MenuBar.prototype.handleBlur = function( item ) {

   item.removeClass( 'menu-focus' );
   return true;

};

// process keydown events for the menus
MenuBar.prototype.handleKeydown = function( item, e ) {
    
    var self = this;
    
    if ( e.altKey || e.ctrlKey ) {
        
        // modifier key pressed; do not process
        return true;
    }
    
    var itemUL = item.parent();
    
    switch( e.keyCode ) {
        
        case self.keys.tab: {
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide all menu items and update their aria attributes
            self.id.find( 'ul' ).attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove focus styling from all menu items
            self.allItems.removeClass( 'menu-focus' );
            
            self.activeItem = null;
            self.bChildOpen = false;
            
            break;
        
        }
        case self.keys.esc: {
            
            item.attr( 'aria-expanded', 'false' );
            
            if ( itemUL.is('.root-level') ) {
                
                // hide the child menu and update the aria attributes
                item.children( 'ul' ).first().attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
            } else {
                
                // move up one level
                self.activeItem = itemUL.parent();
                
                // reset the bChildOpen flag
                self.bChildOpen = false;
                
                // set focus on the new item
                self.activeItem.focus();
                
                // hide the active menu and update the aria attributes
                itemUL.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
            }
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.enter:
        case self.keys.space: {
            
            var parentUL = item.parent();
            
            if ( parentUL.is( '.root-level' ) ) {
        
                // open the child menu if it is closed
                item.children( 'ul' ).first().attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
            } else {
                
                //remove hover and focus styling
                self.allItems.removeClass( 'menu-hover menu-focus' );
                
                // close the menu
                self.id.find( 'ul' ).not( '.root-level' ).attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                // download/open the file
                var id = self.activeItem.find( 'a' ).attr( 'id' );
                document.getElementById( id ).click();
                
                // clear the active item
                self.activeItem = null;
                
            }
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.left: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root level is active,
                // move to the previous item in the menu
                self.activeItem = self.moveUp( item );
                
            } else {
                
                self.activeItem = self.moveToPrevious( item );
                 
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.right: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the next item in the menu
                self.activeItem = self.moveDown( item );
                
            } else {
                
                self.activeItem = self.moveToNext( item );
                
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
            
        }
        
        case self.keys.up: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the previous root-level menu
                self.activeItem = self.moveToPrevious( item );
                
            } else {
                
                self.activeItem = self.moveUp( item );
                
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
        
        }
        
        case self.keys.down: {
            
            if ( self.isVerticalMenu === true && itemUL.is( '.root-level' ) ) {
                
                // if this is a vertical menu and the root-level is active,
                // move to the next root-level menu
                self.activeItem = self.moveToNext( item );
                
            } else {
                
                self.activeItem = self.moveDown( item );
                
            }
            
            self.activeItem.focus();
            
            e.stopPropagation();
            return false;
                
        }
        
    } // end switch
    
    return true;

};

// function to move to the next menu level
MenuBar.prototype.moveToNext = function( item ) {
    
    var self = this;
    
    // item's containing menu
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' );
    
    // the number of items in the active menu
    var menuNum = menuItems.length;
    
    // the items index in its menu
    var menuIndex = menuItems.index(item);
    
    var newItem = null;
    var childMenu = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        // this is the root level move to next sibling and
        // will require closing the current child menu and
        // opening the new one
        
        // if not the root menu
        if ( menuIndex < menuNum - 1 ) {
            
            newItem = item.next();
            
        } else {
            
            // wrap to first item
            newItem = menuItems.first();
            
        }
        
        // close the current child menu (if applicable)
        if ( item.attr( 'aria-haspopup' ) === 'true' ) {
            
            childMenu = item.children( 'ul' ).first();
            
            if ( childMenu.attr( 'aria-hidden' ) === 'false' ) {
                
                item.attr( 'aria-expanded', 'false' );
                
                // update the child menu's aria hidden attribute
                childMenu.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                self.bChildOpen = true;
                
            }
            
        }
        
        // remove the focus styling from the current menu
        item.removeClass( 'menu-focus' );
        
        // open the new child menu (if applicable)
        if ( ( newItem.attr( 'aria-haspopup' ) === 'true' ) && ( self.bChildOpen === true ) ) {
            
            childMenu = newItem.children( 'ul' ).first();
            
            item.attr( 'aria-expanded', 'true' );
            
            // update the child's aria-hidden attribute
            childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
        
        }
        
    } else {
        
        // this is not the root-level
        // if there is a child menu to be moved into,
        // do that; otherwise, move to the next root-level menu
        // if there is one
        
        if ( item.attr('aria-haspopup') === 'true' ) {
        
            childMenu = item.children( 'ul' ).first();
            newItem = childMenu.children( 'li' ).first();
            
            item.attr( 'aria-expanded', 'true' );
            
            // show the child menu and update its aria attribute
            childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
            
        } else {
            
            // at deepest level, move to the next root-item menu
            
            if ( self.isVerticalMenu === true ) {
                
                // do nothing
                return item;
                
            }
            
            var parentMenus = null;
            var rootItem = null;
            
            // get the list of all parent menus for item, up to the root level
            parentMenus = item.parentsUntil( 'div' ).filter( 'ul' ).not( '.root-level' );
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide the current menu and update its aria attribute accordingly
            parentMenus.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus styling from the active menu
            parentMenus.find( 'li' ).removeClass( 'menu-focus' );
            parentMenus.last().parent().removeClass( 'menu-focus' );
            
            // the containing root for the menu
            rootItem = parentMenus.last().parent();
            
            menuIndex = self.rootItems.index( rootItem );
            
            // if this is not the last root menu item,
            // move to the next one
            if ( menuIndex < self.rootItems.length - 1 ) {
                
                newItem = rootItem.next();
                
            } else {
                
                newItem = self.rootItems.first();
                
            }
            
            // add the focus styling to the new menu
            newItem.addClass( 'menu-focus' );
            
            if ( newItem.attr( 'aria-haspopup' ) === 'true' ) {
                
                childMenu = newItem.children( 'ul' ).first();
                
                newItem = childMenu.children( 'li' ).first();
                
                item.attr( 'aria-expanded', 'true' );
                
                // show the child menu and update its aria attribute
                childMenu.attr( {
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                } );
                
                self.bChildOpen = true;
                
            }
            
        }
        
    }
    
    return newItem;
    
};

// function to move to the previous menu level
MenuBar.prototype.moveToPrevious = function( item ) {
    
    var self = this;
    
    // item's containing menu
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' );
    
    // the items index in its menu
    var menuIndex = menuItems.index( item );
    var newItem = null;
    var childMenu = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        // this is the root level move to previous sibling and
        // will require closing the current child menu and
        // opening the new one
        
        if ( menuIndex > 0 ) {
            
            newItem = item.prev();
            
        } else {
            
            // wrap to the last
            newItem = menuItems.last();
            
        }
        
        // close the current child menu (if applicable)
        if ( item.attr( 'aria-haspopup' ) === 'true' ) {
        
            childMenu = item.children( 'ul' ).first();
            
            if ( childMenu.attr( 'aria-hidden' ) === 'false' ) {
                
                item.attr( 'aria-expanded', 'false' );
                
                // update the child menu's aria-hidden attribute
                childMenu.attr( {
                    'aria-hidden': 'true',
                    'aria-expanded': 'false'
                } );
                
                self.bChildOpen = true;
                
            }
            
        }
        
        // remove the focus styling from the current menu
        item.removeClass('menu-focus');
        
        // open the new child menu (if applicable)
        if ( ( newItem.attr( 'aria-haspopup' ) === 'true' ) && ( self.bChildOpen === true ) ) {
        
            childMenu = newItem.children( 'ul' ).first();
            
            item.attr( 'aria-expanded', 'true' );
            
            // update the child's aria-hidden attribute
            childMenu.attr( {
                'aria-hidden': 'false',
                'aria-expanded': 'true'
            } );
        
        }
        
    } else {
        
        // this is not the root level
        // if there is parent menu that is not the root menu,
        // move up one level; otherwise, move to first item of the previous root menu
        
        var parentLI = itemUL.parent();
        var parentUL = parentLI.parent();
        
        // if this is a vertical menu or is not the first child menu
        // of the root-level menu, move up one level
        if ( self.isVerticalMenu === true || !parentUL.is( '.root-level' ) ) {
        
            newItem = itemUL.parent();
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide the active menu and update aria-hidden
            itemUL.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus highlight from the item
            item.removeClass( 'menu-focus' );
        
            if ( self.isVerticalMenu === true ) {
                
                // set a flag so the focus handler does't reopen the menu
                self.bChildOpen = false;
                
            }
        
        } else {
            
            // move to previous root-level menu
            
            item.attr( 'aria-expanded', 'false' );
            
            // hide the current menu and update the aria attributes accordingly
            itemUL.attr( {
                'aria-hidden': 'true',
                'aria-expanded': 'false'
            } );
            
            // remove the focus styling from the active menu
            item.removeClass( 'menu-focus' );
            parentLI.removeClass( 'menu-focus' );
            
            menuIndex = this.rootItems.index( parentLI );
            
            if ( menuIndex > 0 ) {
                
                // move to the previous root-level menu
                newItem = parentLI.prev();
                
            } else {
                
                // loop to last root-level menu
                newItem = self.rootItems.last();
                
            }
            
            // add the focus styling to the new menu
            newItem.addClass( 'menu-focus' );
            
            if ( newItem.attr( 'aria-haspopup' ) === 'true' ) {
                
                childMenu = newItem.children('ul').first();
                
                item.attr( 'aria-expanded', 'true' );
                
                // show the child menu and update it's aria attributes
                childMenu.attr({
                    'aria-hidden': 'false',
                    'aria-expanded': 'true'
                });
                
                self.bChildOpen = true;
                
                newItem = childMenu.children( 'li' ).first();
                
            }
        }
        
    }
    
    return newItem;
    
};

// function to select the next item in a menu
MenuBar.prototype.moveDown = function( item, startChr ) {
    
    // item's containing menu
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' ).not( '.separator' );
    
    // the number of items in the active menu
    var menuNum = menuItems.length;
    
    // the items index in its menu
    var menuIndex = menuItems.index( item );
    
    var newItem = null;
    var newItemUL = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        if ( item.attr( 'aria-haspopup' ) !== 'true' ) {
            
            // no child to move to
            return item;
            
        }
        
        // move to the first item in the child menu
        newItemUL = item.children( 'ul' ).first();
        newItem = newItemUL.children( 'li' ).first();
        
        $( newItemUL.parent() ).attr( 'aria-expanded', 'true' );
        
        item.attr( 'aria-expanded', 'true' );
        
        // make sure the child menu is visible
        newItemUL.attr( {
            'aria-hidden': 'false',
            'aria-expanded': 'true'
        } );
        
        return newItem;
        
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
        
            var titleChr = menuItems.eq( curNdx ).html().charAt( 0 );
            
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
            
            newItem = menuItems.eq( curNdx );
            
            // remove the focus styling from the current item
            item.removeClass( 'menu-focus' );
            return newItem;
            
        } else {
            
            return item;
            
        }
        
    } else {
        
        if ( menuIndex < menuNum - 1 ) {
            
            newItem = menuItems.eq( menuIndex + 1 );
            
        } else {
            
            newItem = menuItems.first();
            
        }
        
    }
    
    // remove the focus styling from the current item
    item.removeClass('menu-focus');
    
    return newItem;
    
};

// function to select the previous item in a menu
MenuBar.prototype.moveUp = function( item ) {
    
    // item's containing menu 
    var itemUL = item.parent();
    
    // the items in the currently active menu
    var menuItems = itemUL.children( 'li' ).not( '.separator' );
    
    // the items index in its menu
    var menuIndex = menuItems.index( item );
    
    var newItem = null;
    
    if ( itemUL.is( '.root-level' ) ) {
        
        // nothing to do
        return item;
        
    }
    
    // if item is not the first item in its menu,
    // move to the previous item
    if ( menuIndex > 0 ) {
        
        newItem = menuItems.eq( menuIndex - 1 );
        
    } else {
        
        // loop to top of the menu
        newItem = menuItems.last();
    }
    
    // remove the focus styling from the current item
    item.removeClass('menu-focus');
    
    return newItem;
    
};

// function to process keypress events for the menu
MenuBar.prototype.handleKeypress = function( item, e ) {
    
    var self = this;
    
    if ( e.altKey || e.ctrlKey || e.shiftKey ) {
        
        // modifier key pressed; do not process
        return true;
        
    }
    
    switch( e.keyCode ) {
        
        case self.keys.tab: {
            return true;
        }
        
        case self.keys.esc:
        case self.keys.up:
        case self.keys.down:
        case self.keys.left:
        case self.keys.right: {
            e.stopPropagation();
            return false;
        }
        default : {
            var chr = String.fromCharCode( e.which );
        
            self.activeItem = self.moveDown( item, chr );
            self.activeItem.focus();
        
            e.stopPropagation();
            return false;
        }
    
    } // end switch

};

// function to process click events on the document
MenuBar.prototype.handleDocumentClick = function() {
    
    var self = this;
    
    // get the list of all child menus
    var childMenus = self.id.find( 'ul' ).not( '.root-level' );
    
    // hide the child menus
    childMenus.attr( {
        'aria-hidden': 'true',
        'aria-expanded': 'false'
    } );
    
    self.allItems.removeClass( 'menu-focus' );
    self.allItems.removeClass( 'active' );
    
    self.activeItem = null;
    
    // allow the event to propagate
    return true;

};