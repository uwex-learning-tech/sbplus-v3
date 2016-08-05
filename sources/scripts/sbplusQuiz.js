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
                        answer.value = $.fn.removeExtension( image );
                    }
                    
                    if ( !$.fn.isEmpty( audio ) ) {
                        
                        answer.audio = audio;
                        answer.value = $.fn.removeExtension( audio );
                        
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
                question.answer = '';
                
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
                case 'multipleChoiceMultiple':
                
                    html += '<div class="header"><span class="icon-assessment"></span> Question for Self Assessment: Multiple Choice</div>';    
                    var isImage = false;
                    var isAudio = false;
                    var hasQuestionImage = false;
                    var hasQuestionAudio = false;
                    var multipleAnswers = false;
                    var inputType = 'radio';
                    var inputName = 'single';
                    
                    if ( currentQuestion.type === 'multipleChoiceMultiple' ) {
                        multipleAnswers = true;
                        inputType = 'checkbox';
                        inputName = 'ma';
                    }
                    
                    if ( currentQuestion.answer[0].image !== undefined ) {
                        isImage = true;
                    }
                    
                    if ( currentQuestion.answer[0].audio !== undefined ) {
                        isAudio = true;
                    }
                    
                    if ( currentQuestion.title.image !== undefined ) {
                        hasQuestionImage = true;
                    }
                    
                    if ( currentQuestion.title.audio !== undefined ) {
                        hasQuestionAudio = true;
                    }        
                    
                    html += '<div class="title">';
                    html += currentQuestion.title.description;
                    
                    if ( hasQuestionImage ) {
                        html += '<img src="assets/images/' + currentQuestion.title.image + '" />';
                    }
                    
                    if ( hasQuestionAudio ) {
                        html += '<audio controls><source src="assets/audio/' + currentQuestion.title.audio + '" type="audio/mpeg" /></audio>';             
                    }
                    
                    html += '</div>';
                    
                    if ( isImage ) {
                        
                        html += '<div class="hasImages">';
                        
                    } else if ( isAudio ) {
                        
                        html += '<div class="hasAudio">';
                        
                    }
                    
                    $.each( currentQuestion.answer, function() {
                        
                        var cleanValue = $.fn.cleanString( this.value );
                        
                        if ( isAudio ) {
                            html += '<label for="'+ cleanValue +'"><input id="'+ cleanValue +'" type="'+inputType+'" name="'+inputName+'" value="'+ cleanValue +'" /><audio controls><source src="assets/audio/' + this.audio + '" type="audio/mpeg"/></audio></label>';
                        } else if ( isImage ) {
                            html += '<label for="'+ cleanValue +'"><input id="'+ cleanValue +'" type="'+inputType+'" name="'+inputName+'" value="'+ cleanValue +'" /><img src="assets/images/'+this.image+'" alt="'+this.value+'" /></label>';
                        } else {
                            html += '<label for="'+ cleanValue +'"><input id="'+ cleanValue +'" type="'+inputType+'" name="'+inputName+'" value="'+ cleanValue +'" /> ' + this.value + '</label>';
                        }
                        
                    } );
                    
                    if ( isImage || isAudio ) {
                        
                        html += '</div>';
                        
                    }
                    
                break;
                
            }
            
            html += '<button id="assessmentSubmitBtn">Submit</button></div>';
            
            return html;
            
        }
        
    }
    
    function check() {
        
        currentQuestion.stuAnswer = '';
        
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
        
        if ( $.isArray( currentQuestion.stuAnswer ) ) {
            
            if ( currentQuestion.stuAnswer.length >= 1 ) {
                currentQuestion.answered = true;
                _render();
            } else {
                _showError();
            }
            
        } else {
            
            if ( currentQuestion.stuAnswer !== '' && currentQuestion.stuAnswer !== -1 ) {
                currentQuestion.answered = true;
                _render();
            } else {
                _showError();
            }
            
        }
        
    }
    
    function showFeedback() {
        
        var html = '<div class="assessment">';
        
        html += '<div class="header"><span class="icon-assessment"></span> Feedback for Self Assessment</div>';
        
        if ( currentQuestion.correct ) {
            
            html += '<div class="correctStatus"><span class="icon-check"></span> Correct!</div>';
            
        } else if ( currentQuestion.correct === false ) {
            
            html += '<div class="incorrectStatus"><span class="icon-warning"></span> Incorrect!</div>';
            
        }
        
        var hasQuestionImage = false;
        var hasQuestionAudio = false;
        
        if ( $.isArray(currentQuestion.answer) ) {
            
            if ( currentQuestion.answer[0].image !== undefined ) {
                isImage = true;
            }
            
        }
        
        if ( currentQuestion.title.image !== undefined ) {
            hasQuestionImage = true;
        }
        
        if ( currentQuestion.title.audio !== undefined ) {
            hasQuestionAudio = true;
        }        
        
        html += '<div class="title">';
        html += currentQuestion.title.description;
        
        if ( hasQuestionImage ) {
            
            html += '<img src="assets/images/' + currentQuestion.title.image + '" />';
            
        }
        
        if ( hasQuestionAudio ) {
            
            html += '<audio controls><source src="assets/audio/' + currentQuestion.title.audio + '" type="audio/mpeg" /></audio>';
            
        }
        
        html += '</div>';
        
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
                
                var isImage = false;
                var isAudio = false;
                
                if ( currentQuestion.answer[0].image !== undefined ) {
                    isImage = true;
                }
                
                if ( currentQuestion.answer[0].audio !== undefined ) {
                    isAudio = true;
                }
                
                if ( isImage ) {
                    html += '<p><strong>Your answer:</strong><br><img src="assets/images/' + currentQuestion.answer[currentQuestion.stuAnswer].image + '" alt="'+currentQuestion.answer[currentQuestion.stuAnswer].value+'" /></p>';
                } else if ( isAudio ) {
                    html += '<p><strong>Your answer:</strong><br><audio controls><source src="assets/audio/' + currentQuestion.answer[currentQuestion.stuAnswer].audio + '" type="audio/mpeg" /></audio></p>';
                } else {
                    html += '<p><strong>Your answer:</strong><br>' + currentQuestion.answer[currentQuestion.stuAnswer].value + '</p>';
                }
                
                $.each( currentQuestion.answer, function() {
                        
                    if ( this.correct !== undefined ) {

                        if ( isImage ) {
                            html += '<p><strong>Correct answer:</strong><br><img src="assets/images/' + this.image + '" alt="'+this.value+'" /></p>';
                        } else if ( isAudio ) {
                            html += '<p><strong>Correct answer:</strong><br><audio controls><source src="assets/audio/' + this.audio + '" type="audio/mpeg" /></audio></p>';
                        } else {
                            html += '<p><strong>Correct answer:</strong><br>' + this.value + '</p>';
                        }
                        
                        return true;
                        
                    }
                    
                } );
                
                html += '<p><strong>Feedback:</strong><br>' + currentQuestion.answer[currentQuestion.stuAnswer].feedback + '</p>';
                
            break;
            
            case 'multipleChoiceMultiple':
                
                var isMCMImage = false;
                var isMCMAudio = false;
                
                if ( currentQuestion.answer[0].image !== undefined ) {
                    isMCMImage = true;
                }
                
                if ( currentQuestion.answer[0].audio !== undefined ) {
                    isMCMAudio = true;
                }
                
                html += '<p><strong>Your answer:</strong></p>';
                
                if ( isImage ) {
                    html += '<ul class="images">';
                } else if( isAudio ) {
                    html += '<ul class="audio">';
                } else {
                    html += '<ul>';
                }
                
                $.each( currentQuestion.stuAnswer, function() {
                    
                    if ( isMCMImage ) {
                        
                        html += '<li><img src="assets/images/' + currentQuestion.answer[this.index].image + '" alt="'+ currentQuestion.answer[this.index].value +'" /></li>';
                        
                    } else if( isMCMAudio ) {
                        html += '<li><audio controls><source src="assets/audio/' + currentQuestion.answer[this.index].audio + '" type="audio/mpeg" /></audio></li>';
                    } else {
                        html += '<li>' + currentQuestion.answer[this.index].value + '</li>';
                    }
                    
                } );
                
                html += '</ul>';
                
                html += '<p><strong>Correct answer:</strong></p>';
                
                if ( isMCMImage ) {
                    html += '<ul class="images">';
                } else if( isMCMAudio ) {
                    html += '<ul class="audio">';
                } else {
                    html += '<ul>';
                }
                
                $.each( currentQuestion.answer, function() {
                        
                    if ( this.correct !== undefined ) {
                        
                        if ( isMCMImage ) {
                        
                            html += '<li><img src="assets/images/' + this.image + '" alt="'+ this.value +'" /></li>';
                            
                        } else if( isMCMAudio ) {
                            html += '<li><audio controls><source src="assets/audio/' + this.audio + '" type="audio/mpeg" /></audio></li>';
                        } else {
                            html += '<li>' + this.value + '</li>';
                        }
                        
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
    
    function _showError() {
        $( '.assessment .header' ).after( '<div class="error"><span class="icon-warning"></span> Please answer the question before submitting.' );
        setTimeout( function() {
            $( '.assessment .error' ).remove();
        }, 5000 );
    }
    
    return {
        
        get: get,
        check: check
        
    };
    
} )();