/* global require */
/* global sbplus */
/* global Backbone */
/* global _ */

require( [ 'text!templates/sbplus.tpl' ], function( templateHTML ) {
    
    // the view for setup model, which will be used for the splash screen
    sbplus.mainView = Backbone.View.extend( {
        
        tagName: 'div',
        className: 'sbplus',
        
        template: _.template( templateHTML ),
        
        render: function() {
            
            var splashTemplate = this.template();
             
            this.$el.html( splashTemplate );
            return this;
            
        }
        
    } );
    
} );