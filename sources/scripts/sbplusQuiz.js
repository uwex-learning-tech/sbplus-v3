/***************************************
    Get Quiz Module
****************************************/

var sbplusQuiz = ( function() { 
    
    var context;
    var questions = [];
    var currentQuestion = {};
    var el;
    
    function get( _el, _context, id ) {
        
        el = _el;
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
            question.answered = false;
            
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
            
            if ( question.type === 'fillInTheBlank' || question.type === 'multipleChoiceMultiple' ) {
                
                if ( question.type === 'fillInTheBlank' ) {
                    question.answer = $( _context ).find( 'answer' ).text();
                }
                
                question.correctFeedback = $( _context ).find( 'correctFeedback' ).text();
                question.incorrectFeedback = $( _context ).find( 'incorrectFeedback' ).text();
                
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
        
        if ( currentQuestion.answered ) {
            
            showFeedback();
            
        } else {
            
            var html = '<div class="assessment">';
            
            switch ( currentQuestion.type ) {
            
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
                        
                        html += '<label for="'+ cleanValue +'"><input id="'+ cleanValue +'" type="checkbox" name="ma" value="'+ cleanValue +'" /> ' + this.value + '</label>';
                    } );
                    
                break;
                
            }
            
            html += '<button id="assessmentSubmitBtn">Submit</button></div>';
            
            return html;
            
        }
        
    }
    
    function check() {
        
        switch ( currentQuestion.type ) {
            
            case 'shortAnswer':
                currentQuestion.stuAnswer = $( 'textarea' ).val();
            break;
            
            case 'fillInTheBlank':
            
                currentQuestion.stuAnswer = $( 'input' ).val();
                
                if ( currentQuestion.stuAnswer !== currentQuestion.answer ) {
                    currentQuestion.correct = false;
                } else {
                    currentQuestion.correct = true;
                }
                
            break;
            
            case 'multipleChoiceSingle':
            
                var radioButtons = $( 'input:radio[name="single"]' );
                var selectedIndex = radioButtons.index(radioButtons.filter(':checked'));
                
                currentQuestion.stuAnswer = $( 'input[type="radio"]:checked' ).val();
                
                $.each( currentQuestion.answer, function() {
                        
                    if ( this.correct !== undefined ) {
                        
                        if ( currentQuestion.stuAnswer === $.fn.cleanString( this.value ) ) {
                            currentQuestion.correct = true;
                        } else {
                            currentQuestion.correct = false;
                        }
                        
                        return true;
                        
                    }
                    
                } );
                
                currentQuestion.stuAnswer = selectedIndex;
                
            break;
            
            case 'multipleChoiceMultiple':
                
                var checkboxes = $( 'input:checkbox[name="ma"]' );
                var correctAnswers = [];
                
                currentQuestion.stuAnswer = [];
                
                checkboxes.each( function(i) {
                    
                    if ( this.checked ) {
                        
                        var ansObj = {};
                        ansObj.value = $( this ).val();
                        ansObj.index = i;
                        currentQuestion.stuAnswer.push( ansObj );
                        
                    }
                    
                } );
                
                $.each( currentQuestion.answer, function(i) {
                        
                    if ( this.correct !== undefined ) {
                        
                        correctAnswers.push(i);
                        
                    }
                    
                } );
                
                if ( currentQuestion.stuAnswer.length < correctAnswers.length || currentQuestion.stuAnswer.length > correctAnswers.length ) {
                    
                    currentQuestion.correct = false;
                    
                } else if ( currentQuestion.stuAnswer.length === correctAnswers.length ) {
                    
                    for ( var i = 0; i < currentQuestion.stuAnswer.length; i++ ) {
                        
                        if ( $.inArray( currentQuestion.stuAnswer[i].index, correctAnswers ) >= 0 ) {
                            currentQuestion.correct = true;
                        } else {
                            currentQuestion.correct = false;
                            break;
                        }
                        
                    }
                    
                }
                
            break;
            
        }
        
        currentQuestion.answered = true;
        
        _render();
        
    }
    
    function showFeedback() {
        
        var html = '<div class="assessment">';
        
        html += '<div class="header"><span class="icon-assessment"></span> Feedback for Self Assessment</div>';
        
        if ( currentQuestion.correct ) {
            
            html += '<div class="correctStatus">Correct!</div>';
            
        } else if ( currentQuestion.correct === false ) {
            
            html += '<div class="incorrectStatus">Incorrect!</div>';
            
        }
        
        html += '<div class="title">'+currentQuestion.title.description+'</div>';
        html += '<div class="content">';
        
        switch ( currentQuestion.type ) {
            
            case 'shortAnswer':
                html += '<p><strong>Your answer:</strong><br>' + currentQuestion.stuAnswer + '</p>';
                html += '<p><strong>Feedback:</strong><br>' + currentQuestion.feedback + '</p>';
            break;
            
            case 'fillInTheBlank':
                
                html += '<p><strong>Your answer:</strong><br>' + currentQuestion.stuAnswer + '</p>';
                html += '<p><strong>Correct answer:</strong><br>' + currentQuestion.answer + '</p>';
                
                if ( currentQuestion.correct ) {
                    html += '<p><strong>Feedback:</strong><br>' + currentQuestion.correctFeedback + '</p>';
                } else {
                    html += '<p><strong>Feedback:</strong><br>' + currentQuestion.incorrectFeedback + '</p>';
                }
                
            break;
            
            case 'multipleChoiceSingle':
                
                html += '<p><strong>Your answer:</strong><br>' + currentQuestion.answer[currentQuestion.stuAnswer].value + '</p>';
                
                $.each( currentQuestion.answer, function() {
                        
                    if ( this.correct !== undefined ) {
                        
                        html += '<p><strong>Correct answer:</strong><br>' + this.value + '</p>';
                        return true;
                        
                    }
                    
                } );
                
                html += '<p><strong>Feedback:</strong><br>' + currentQuestion.answer[currentQuestion.stuAnswer].feedback + '</p>';
                
            break;
            
            case 'multipleChoiceMultiple':
                
                html += '<p><strong>Your answer:</strong></p><ul>';
                
                $.each( currentQuestion.stuAnswer, function() {
                        
                    html += '<li>' + currentQuestion.answer[this.index].value + '</li>';
                    
                } );
                html += '</ul>';
                
                html += '<p><strong>Correct answer:</strong></p><ul>';
                $.each( currentQuestion.answer, function() {
                        
                    if ( this.correct !== undefined ) {
                        
                        html += '<li>' + this.value + '</li>';
                        
                    }
                    
                } );
                html += '</ul>';
                
                if ( currentQuestion.correct ) {
                    html += '<p><strong>Feedback:</strong><br>' + currentQuestion.correctFeedback + '</p>';
                } else {
                    html += '<p><strong>Feedback:</strong><br>' + currentQuestion.incorrectFeedback + '</p>';
                }
                
            break;
            
        }
        
        html += '</div></div>';
        
        el.html( html );
        sbplus.resize();
        
        return false;
        
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
        
        get: get,
        check: check
        
    };
    
} )();