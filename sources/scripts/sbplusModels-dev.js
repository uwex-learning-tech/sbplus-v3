/* global Backbone */

// Storybook Plus Namespace
var sbplus = sbplus || {};

sbplus.setup = Backbone.Model.extend( {
    
    defaults: {
        
        title: '',
        subtitle: '',
        length: '',
        author: '',
        authorBio: '',
        generalInfo: '',
        accent: '#0000ff',
        slideFormat: 'jpg',
        analytics: 'off',
        xmlVersion: '3',
        splashImg: 'sources/images/default_splash.jpg'
        
    }
    
} );