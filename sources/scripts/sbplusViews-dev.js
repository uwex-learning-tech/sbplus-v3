/* global sbplus */
/* global Backbone */
/* global _ */

sbplus.splashView = Backbone.View.extend( {
    
    tagName: 'div',
    className: 'splashinfo',
    
    render: function() {
        
        var template = _.template( '<h1 class="title"><%= title %></h1><p class="subtitle"><%= subtitle %></p><p class="author"><%= author %></p><p class="length"><%= length %></p><button class="startBtn">START</button>' );
        
        this.$el.html( template( this.model.toJSON() ) );
        
        return this;
        
    }
    
} );