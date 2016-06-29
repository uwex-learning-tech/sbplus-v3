/***************************************
    Get Quiz Module
****************************************/

var sbplusQuiz = ( function() { 
    
    var context;
    var questions = [];
    var currentQuestion = {};
    
    function get( _context, id ) {
        
        context = _context;
        var index;
        
        if ( ( index = hasID( id ) ) >= 0 ) {
            
            currentQuestion = questions[index];
            
        } else {
            
            var question = {};
            var q = $( _context ).find( 'question' );
            
            question.id = id;
            question.type = $( _context ).children()[0].nodeName;
            question.title = {
                description: q.text()
            };
            question.answer = [];
            
            if ( question.type === 'multipleChoiceSingle' || question.type === 'multipleChoiceMultiple' ) {
                
                if ( !$.fn.isEmpty( q.attr( 'image' ) ) ) {
                    question.title.image = q.attr( 'image' );
                }
                
                if ( !$.fn.isEmpty( q.attr( 'audio' ) ) ) {
                    question.title.audio = q.attr( 'audio' );
                }
                
                var answers = $( _context ).find( 'choices' ).find( 'answer' );
                
                $.each( answers, function() {
                    
                    var image = $( this ).attr('image');
                    var audio = $( this ).attr('audio');
                    
                    var answer = {};
                    
                    answer.value = $( this ).find('value').text();
                    
                    if ( !$.fn.isEmpty( image ) ) {
                        answer.image = image;
                    }
                    
                    if ( !$.fn.isEmpty( audio ) ) {
                        answer.audio = audio;
                    }
                    
                    if ( question.type === 'multipleChoiceSingle' ) {
                        answer.feedback = $( this ).find('feedback').text();
                    }
                    
                    if ( $( this ).attr('correct') === 'yes' ) {
                        answer.correct = 'yes';
                    }
                    
                    question.answer.push( answer );
                    
                } );
                
            }
            
            if ( question.type === 'fileInTheBlank' || question.type === 'multipleChoiceMultiple' ) {
                
                if ( question.type === 'fileInTheBlank' ) {
                    question.answer = $( _context ).find( 'answer' );
                }
                
                question.correctFeedback = $( _context ).find( 'correctFeedback' );
                question.incorrectFeedback = $( _context ).find( 'incorrectFeedback' );
                
            } else if ( question.type === 'shortAnswer' ) {
                
                question.feedback = $( _context ).find( 'feedback' ).text();
                
            }
            
            currentQuestion = question;
            questions.push( question );
            
        }
        
        return _render();
        
    }
    
    function _render() {
        
        $( '.main_content_wrapper' ).addClass( 'assessment-view' );
        
        var type = currentQuestion.type;
        var html = '<div class="assessment">';
        
        
        switch ( type ) {
            
            case 'shortAnswer':
                html += '<div class="header"><span class="icon-assessment"></span> Question for Self Assessment: Short Answer</div>';
                html += '<div class="title">'+currentQuestion.title.description+'</div>';
                html += '<textarea></textarea>';
            break;
            
            case 'fillInTheBlank':
                html += '<div class="header"><span class="icon-assessment"></span> Question for Self Assessment: Fill in the Blank</div>';
                html += '<div class="title">'+currentQuestion.title.description+'</div>';
                html += '<input type="text" />';
            break;
            
            case 'multipleChoiceSingle':
                html += '<div class="header"><span class="icon-assessment"></span> Question for Self Assessment: Multiple Choice</div>';
                html += '<div class="title">'+currentQuestion.title.description+'</div>';
                
                $.each( currentQuestion.answer, function() {
                    
                    var cleanValue = $.fn.cleanString( this.value );
                    
                    html += '<label for="'+ cleanValue +'"><input id="'+ cleanValue +'" type="radio" name="single" value="'+ cleanValue +'" /> ' + this.value + '</label>';
                } );
                
            break;
            
            case 'multipleChoiceMultiple':
                html += '<div class="header"><span class="icon-assessment"></span> Question for Self Assessment: Multiple Choice</div>';
                html += '<div class="title">'+currentQuestion.title.description+'</div>';
                
                $.each( currentQuestion.answer, function() {
                    
                    var cleanValue = $.fn.cleanString( this.value );
                    
                    html += '<label for="'+ cleanValue +'"><input id="'+ cleanValue +'" type="checkbox" value="'+ cleanValue +'" /> ' + this.value + '</label>';
                } );
                
            break;
            
        }
        
        html += '<button>Submit</button></div>';
        return html;
        
    }
    
    function hasID( id ) {
        
        var tracker = -1;
        
        $.each( questions, function(i) {
            
            if ( this.id === id ) {
                tracker = i;
                return true;
            }
            
        } );
        
        return tracker;
        
    }
    
    return {
        
        get: get
        
    };
    
} )();