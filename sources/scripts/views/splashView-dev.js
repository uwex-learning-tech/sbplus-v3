/* global require */
/* global sbplus */
/* global Backbone */
/* global _ */

require( [ 'text!templates/splashscreen.tpl' ], function( templateHTML ) {
    
    // the view for setup model, which will be used for the splash screen
    sbplus.splashView = Backbone.View.extend( {
        
        tagName: 'div',
        className: 'splashinfo',
        
        template: _.template( templateHTML ),
        
        render: function() {
            
            var splashTemplate = this.template( this.model.toJSON() );
             
            this.$el.html( splashTemplate );
            return this;
            
        }
        
    } );
    
} );