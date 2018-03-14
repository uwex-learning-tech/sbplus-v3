var quizTracker = [];
var Quiz = function( obj, data ) {
    
    var self = this;
    
    var cntx = data;
    var qId = Number( obj.id.join().replace( ',', '' ) );
    var qType = cntx.children()[0].nodeName.toLowerCase();
    
    var question = cntx.find( 'question' );
    var qTitle = SBPLUS.getTextContent( question );
    var qImg = '';
    var qAudio = '';
    
    if ( !SBPLUS.isEmpty( question.attr( 'image' ) ) ) {
        qImg = SBPLUS.noScript( question.attr( 'image' ).trim() );
    }
    
    if ( !SBPLUS.isEmpty( question.attr( 'audio' ) ) ) {
        qAudio = SBPLUS.noScript( question.attr( 'audio' ).trim() );
    }
    
    self.quiz = {
        id: qId,
        type: qType,
        question: qTitle,
        questionImg: qImg,
        questionAudio: qAudio,
        stuAnswer: '',
        correct: false
    };
    
    self.quizContainer = SBPLUS.layout.quizContainer;
    
    switch (qType) {
        
        case 'multiplechoicesingle':
            
            var msChoices = $( cntx ).find( 'choices' ).find( 'answer' );
            
            if ( !SBPLUS.isEmpty( $( cntx ).find( 'choices' ).attr('random') ) ) {
                
                var random = SBPLUS.noScript( $( cntx ).find( 'choices' ).attr('random').trim().toLowerCase() );
                
                if ( random === 'yes' ) {
                    self.quiz.random = true;
                } else {
                    self.quiz.random = false;
                }
                
            }
            
            self.quiz.answers = [];
            
            $.each( msChoices, function() {
                
                var answer = {};
                
                answer.value = SBPLUS.noScript( $( this ).find( 'value' ).text().trim() );
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'image' ) ) ) {
                    answer.img = SBPLUS.noScript( $( this ).attr( 'image' ).trim() );
                    answer.value = answer.img;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'audio' ) ) ) {
                    answer.audio = SBPLUS.noScript( $( this ).attr( 'audio' ).trim() );
                    answer.value = answer.audio;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'correct' ) ) ) {
                    
                    if ( $( this ).attr( 'correct' ).toLowerCase() === 'yes' ) {
                        answer.correct = SBPLUS.noScript( $( this ).attr( 'correct' ).trim().toLowerCase() );
                    }
                    
                }
                
                var mcFB = $( this ).find( 'feedback' );
                
                if ( mcFB.length ) {
                    answer.feedback = SBPLUS.getTextContent( mcFB );
                }
                
                self.quiz.answers.push( answer );
                
            } );
            
        break;
        
        case 'multiplechoicemultiple':
            
            var mmChoices = $( cntx ).find( 'choices' ).find( 'answer' );
            
            if ( !SBPLUS.isEmpty( $( cntx ).find( 'choices' ).attr('random') ) ) {
                
                var randomMM = SBPLUS.noScript( $( cntx ).find( 'choices' ).attr('random').trim().toLowerCase() );
                
                if ( randomMM === 'yes' ) {
                    self.quiz.random = true;
                } else {
                    self.quiz.random = false;
                }
                
            }
            
            self.quiz.answers = [];
            
            $.each( mmChoices, function() {
                
                var answer = {};
                
                answer.value = SBPLUS.noScript( $( this ).find( 'value' ).text().trim() );
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'image' ) ) ) {
                    answer.img = SBPLUS.noScript( $( this ).attr( 'image' ).trim() );
                    answer.value = answer.img;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'audio' ) ) ) {
                    answer.audio = SBPLUS.noScript( $( this ).attr( 'audio' ).trim() );
                    answer.value = answer.audio;
                }
                
                if ( !SBPLUS.isEmpty( $( this ).attr( 'correct' ) ) ) {
                    
                    if ( $( this ).attr( 'correct' ).toLowerCase() === 'yes' ) {
                        answer.correct = SBPLUS.noScript( $( this ).attr( 'correct' ).trim().toLowerCase() );
                    }
                    
                }
                
                self.quiz.answers.push( answer );
                
            } );
            
            var cFB = $( cntx ).find( 'correctFeedback' );
            var iFB = $( cntx ).find( 'incorrectFeedback' );
            
            if ( cFB.length ) {
                self.quiz.correctFeedback = SBPLUS.getTextContent( cFB );
            }
            
            if (iFB.length ) {
                self.quiz.incorrectFeedback = SBPLUS.getTextContent( iFB );
            }
            
        break;
        
        case 'shortanswer':
            
            var fb = $( cntx ).find( 'feedback' );
            
            if ( fb.length ) {
                self.quiz.feedback = SBPLUS.getTextContent( fb );
            }
            
        break;
        
        case 'fillintheblank':
            
            var fitbCFB = $( cntx ).find( 'correctFeedback' );
            var fitbIFB = $( cntx ).find( 'incorrectFeedback' );
            
            if ( fitbCFB.length ) {
                self.quiz.correctFeedback = SBPLUS.getTextContent( fitbCFB );
            }
            
            if (fitbIFB.length ) {
                self.quiz.incorrectFeedback = SBPLUS.getTextContent( fitbIFB );
            }
            
            self.quiz.answer = SBPLUS.noScript( $( cntx ).find( 'answer' ).text().trim() );
            
        break;
        
    }
    
    if ( questionExists( self.quiz.id ) === false ) {
        
        quizTracker.push( this.quiz );
        
    }
    
};

Quiz.prototype.getQuiz = function() {
    
    var self = this;
    var answered = false;
    
    self.qIndex = getCurrentQuizItem( quizTracker, self.quiz.id );
    
    if ( Array.isArray( quizTracker[self.qIndex].stuAnswer ) ) {
        
        if ( quizTracker[self.qIndex].stuAnswer.length >= 1 ) {
            answered = true;
        }
        
    } else {
        
        if ( !SBPLUS.isEmpty( quizTracker[self.qIndex].stuAnswer ) ) {
            answered = true;
        }
        
    }
    
    if ( answered ) {
        self.renderFeeback();
    } else {
        self.renderQuiz();
    }
    
    if ( SBPLUS.xml.settings.mathjax === 'on' ) {
        MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
    }
    
}

Quiz.prototype.renderQuiz = function() {
    
    var self = this;
    var questionImg = '';
    var questionAudio = '';
    
    var html = '<div class="sbplus_quiz_header"><span class="icon-assessment"></span>';
    html += ' Self Assessment</div>';
    
    if ( !SBPLUS.isEmpty( self.quiz.questionImg ) ) {
        questionImg = '<p><img src="assets/images/' + self.quiz.questionImg + '" /></p>';
    }
    
    if ( !SBPLUS.isEmpty( self.quiz.questionAudio ) ) {
        questionAudio = '<p><audio controls><source src="assets/audio/' + self.quiz.questionAudio + '" type="audio/mpeg" /></audio></p>';
    }
    
    html += '<div class="sbplus_quiz_question">' + questionImg + questionAudio + self.quiz.question + '</div>';
    html += '<div class="sbplus_quiz_input"></div>';
    html += '<button class="sbplus_quiz_submit_btn">Submit</button>';
    
    $( self.quizContainer ).html( html ).promise().done( function() {
            
            switch( self.quiz.type ) {
                
                case 'multiplechoicesingle':
                    
                    var msInput = '';
                    
                    if ( self.quiz.random ) {
                        shuffle( self.quiz.answers );
                    }
                    
                    $.each( self.quiz.answers, function( i ) {
                        
                        var cleanMSValue = SBPLUS.sanitize( self.quiz.answers[i].value );
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].img ) ) {
                            cleanMSValue = SBPLUS.sanitize( self.quiz.answers[i].img );
                            msInput += '<label class="img_val" for="' + cleanMSValue + '"><input type="radio" id="' + cleanMSValue +'" name="ms" value="' + i + '" /><img src="assets/images/' + self.quiz.answers[i].img + '"/ ></label>';
                            return true;
                        }
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].audio ) ) {
                            cleanMSValue = SBPLUS.sanitize( self.quiz.answers[i].audio );
                            msInput += '<label class="au_val" for="'+cleanMSValue+'"><input type="radio" id="'+cleanMSValue+'" name="ms" value="' + i + '" /> <audio controls><source src="assets/audio/' + self.quiz.answers[i].audio + '" type="audio/mpeg"/></audio></label>';
                            return true;
                        }
                        
                        msInput += '<label for="'+cleanMSValue+'"><input type="radio" id="'+cleanMSValue+'" name="ms" value="' + i + '" /> ' + self.quiz.answers[i].value + '</label>'
                        
                    } );
                    
                    $( '.sbplus_quiz_input' ).html( msInput );
                    
                    
                break;
                
                case 'multiplechoicemultiple':
                
                    var mmInput = '';
                    
                    if ( self.quiz.random ) {
                        shuffle( self.quiz.answers );
                    }
                    
                    $.each( self.quiz.answers, function( i ) {
                        
                        var cleanMMValue = SBPLUS.sanitize( self.quiz.answers[i].value );
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].img ) ) {
                            cleanMMValue = SBPLUS.sanitize( self.quiz.answers[i].img );
                            mmInput += '<label class="img_val" for="' + cleanMMValue + '"><input type="checkbox" id="' + cleanMMValue +'" name="mm" value="' + i + '" /><img src="assets/images/' + self.quiz.answers[i].img + '" /></label>';
                            return true;
                        }
                        
                        if ( !SBPLUS.isEmpty( self.quiz.answers[i].audio ) ) {
                            cleanMMValue = SBPLUS.sanitize( self.quiz.answers[i].audio );
                            mmInput += '<label class="au_val" for="'+cleanMMValue+'"><input type="checkbox" id="'+cleanMMValue+'" name="mm" value="' + i + '" /> <audio controls><source src="assets/audio/' + self.quiz.answers[i].audio + '" type="audio/mpeg"/></audio></label>';
                            return true;
                        }
                        
                        mmInput += '<label for="'+cleanMMValue+'"><input type="checkbox" id="'+cleanMMValue+'" name="mm" value="' + i + '" /> ' + self.quiz.answers[i].value + '</label>'
                        
                    } );
                    
                    $( '.sbplus_quiz_input' ).html( mmInput );
                    
                break;
                
                case 'shortanswer':
                
                    $( '.sbplus_quiz_input' ).html( '<textarea></textarea>' );
                
                break;
                
                case 'fillintheblank':
                
                    $( '.sbplus_quiz_input' ).html( '<input type="text" />' );
                
                break;
                
            }

    } );
    
    $( 'button.sbplus_quiz_submit_btn' ).on( 'click', function() {
        
        switch( self.quiz.type ) {
            
            case 'multiplechoicesingle':
                
                quizTracker[self.qIndex].stuAnswer = $( 'input[type="radio"]:checked' ).val();
                
                if ( !SBPLUS.isEmpty( quizTracker[self.qIndex].stuAnswer ) ) {
                    
                    $.each( self.quiz.answers, function() {
                        
                        if ( this.correct !== undefined ) {
                            
                            var sAnswer = SBPLUS.sanitize( self.quiz.answers[Number(self.quiz.stuAnswer)].value );
                            
                            if ( sAnswer === SBPLUS.sanitize( this.value ) ) {
                                quizTracker[self.qIndex].correct = true;
                            } else {
                                quizTracker[self.qIndex].correct = false;
                            }
                            
                            return false;
                            
                        }
                        
                    } );
                    
                }
                
            break;
            
            case 'multiplechoicemultiple':
                
                var checkboxes = $( 'input:checkbox[name="mm"]' );
                var correctAnswers = [];
                
                quizTracker[self.qIndex].stuAnswer = [];
                
                checkboxes.each( function() {
                    
                    if ( this.checked ) {
                        
                        quizTracker[self.qIndex].stuAnswer.push( Number( $( this ).val() ) );
                        
                    }
                    
                } );
                
                $.each( self.quiz.answers, function() {
                        
                    if ( this.correct !== undefined ) {
                        
                        correctAnswers.push( SBPLUS.sanitize( this.value ) );
                        
                    }
                    
                } );
                
                if ( quizTracker[self.qIndex].stuAnswer.length < correctAnswers.length
                || quizTracker[self.qIndex].stuAnswer.length > correctAnswers.length ) {
                    
                    quizTracker[self.qIndex].correct = false;
                    
                } else if ( quizTracker[self.qIndex].stuAnswer.length === correctAnswers.length ) {
                    
                    for ( var i = 0; i < quizTracker[self.qIndex].stuAnswer.length; i++ ) {
                        
                        var index = Number( quizTracker[self.qIndex].stuAnswer[i] );
                        var mAnswer = SBPLUS.sanitize( quizTracker[self.qIndex].answers[index].value);
                        
                        if ( $.inArray( mAnswer, correctAnswers ) >= 0 ) {
                            quizTracker[self.qIndex].correct = true;
                        } else {
                            quizTracker[self.qIndex].correct = false;
                            break;
                        }
                        
                    }
                    
                }
            
            break;
            
            case 'shortanswer':
                
                quizTracker[self.qIndex].stuAnswer = $( '.sbplus_quiz_input textarea' ).val();
                
            break;
            
            case 'fillintheblank':
            
                quizTracker[self.qIndex].stuAnswer = $( 'input' ).val();
                
                if ( quizTracker[self.qIndex].stuAnswer !== self.quiz.answer ) {
                    quizTracker[self.qIndex].correct = false;
                } else {
                    quizTracker[self.qIndex].correct = true;
                }
                
            break;
            
        }
        
        var containsAnswer = false;
        
        if ( Array.isArray( quizTracker[self.qIndex].stuAnswer ) ) {
            
            if ( quizTracker[self.qIndex].stuAnswer.length >= 1 ) {
                containsAnswer = true;
            }
            
        } else {
            
            if ( !SBPLUS.isEmpty( quizTracker[self.qIndex].stuAnswer ) ) {
                containsAnswer = true
            }
            
        }
        
        if ( containsAnswer === false ) {
            
                $( '.sbplus_quiz_header' ).after( '<div class="quiz_error"><span class="icon-warning"></span> Please answer the question before submitting.</div>' );
                
                setTimeout( function() {
                    
                    $( '.quiz_error' ).fadeOut( 1000, function() {
                        $( this ).remove();
                    } );
                    
                }, 4000 );
                
            } else {
                
                self.renderFeeback();
                
                if ( SBPLUS.xml.settings.mathjax === 'on' ) {
                    MathJax.Hub.Queue( ['Typeset', MathJax.Hub] );
                }
                
            }
            
        } );
        
        var label = SBPLUS.getCourseDirectory() + ':quiz:page' + SBPLUS.targetPage.data( 'count' );
        SBPLUS.sendToGA( 'Quiz', 'completed', label, 3, 0 );
    
};

Quiz.prototype.renderFeeback = function() {
    
    var self = this;
    var questionImg = '';
    var questionAudio = '';
    
    var html = '<div class="sbplus_quiz_header"><span class="icon-assessment"></span>';
    html += ' Self Assessment Feedback</div>';
    
    if ( self.quiz.type !== 'shortanswer' ) {
        
        if ( quizTracker[self.qIndex].correct ) {
            html += '<div class="quiz_correct"><span class="icon-check"></span> Correct!</div>';
        } else {
            html += '<div class="quiz_incorrect"><span class="icon-warning"></span> Incorrect!</div>';
        }
        
    } 
    
    if ( !SBPLUS.isEmpty( self.quiz.questionImg ) ) {
        questionImg = '<p><img src="assets/images/' + self.quiz.questionImg + '" /></p>';
    }
    
    if ( !SBPLUS.isEmpty( self.quiz.questionAudio ) ) {
        questionAudio = '<p><audio controls><source src="assets/audio/' + self.quiz.questionAudio + '" type="audio/mpeg" /></audio></p>';
    }
    
    html += '<div class="sbplus_quiz_question">' + questionImg + questionAudio + self.quiz.question + '</div>';
    html += '<div class="sbplus_quiz_result">';
    
    switch ( self.quiz.type ) {
        
        case 'shortanswer':
            
            html += '<p><strong>Your answer:</strong><br>' + quizTracker[self.qIndex].stuAnswer + '</p>';
            
            if ( !SBPLUS.isEmpty( self.quiz.feedback ) ) {
                html += '<p><strong>Feedback:</strong><br>' + self.quiz.feedback + '</p>';
            }
    
        break;
        
        case 'fillintheblank':
        
            html += '<p><strong>Your answer:</strong><br>' + quizTracker[self.qIndex].stuAnswer + '</p>';
            html += '<p><strong>Correct answer:</strong><br>' + self.quiz.answer + '</p>';
            
            if ( quizTracker[self.qIndex].correct ) {
                
                if ( !SBPLUS.isEmpty( self.quiz.correctFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.correctFeedback + '</p>';
                }
                
            } else {
                
                if ( !SBPLUS.isEmpty( self.quiz.incorrectFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.incorrectFeedback + '</p>';
                }
                
            }
    
        break;
        
        case 'multiplechoicesingle':
            
            var msAnswerIndex = Number(quizTracker[self.qIndex].stuAnswer);
            var msAnswerNode = quizTracker[self.qIndex].answers[msAnswerIndex];
            var msAnswer = msAnswerNode.value;
            var msFeedback = msAnswerNode.feedback;
            var msAnswerImg = msAnswerNode.img;
            var msAnswerAudio = msAnswerNode.audio;
            var msAnswerType = 'text';
            
            if ( !SBPLUS.isEmpty( msAnswerImg ) ) {
                msAnswerType = 'img';
            }
            
            if ( !SBPLUS.isEmpty( msAnswerAudio ) ) {
                msAnswerType = 'audio';
            }
            
            switch ( msAnswerType ) {
                        
                case 'img':
                    html += '<p><strong>Your answer:</strong><br><img src="assets/images/' + msAnswerNode.img + '" /></p>';
                break;
                
                case 'audio':
                    html += '<p><strong>Your answer:</strong><br><audio controls><source src="assets/audio/' + msAnswerAudio + '" type="audio/mpeg"/></audio></p>';
                break;
                
                case 'text':
                    html += '<p><strong>Your answer:</strong><br>' + msAnswer + '</p>';
                break;
                
            }
            
            $.each( self.quiz.answers, function( i ) {
                
                if ( self.quiz.answers[i].correct !== undefined ) {
                    
                    var output = self.quiz.answers[i].value;
                    
                    switch ( msAnswerType ) {
                        
                        case 'img':
                            output = '<img src="assets/images/' + self.quiz.answers[i].value + '" />';
                        break;
                        
                        case 'audio':
                            output = '<audio controls><source src="assets/audio/' + self.quiz.answers[i].value + '" type="audio/mpeg"/></audio>';
                        break;
                        
                    }
                    
                    html += '<p><strong>Correct answer:</strong><br>' + output + '</p>';
                    
                    return false;
                }
                
            } );
            
            if ( !SBPLUS.isEmpty( msFeedback ) ) {
                html += '<p><strong>Feedback:</strong><br>' + msFeedback + '</p>';
            }
    
        break;
        
        case 'multiplechoicemultiple':
        
            var stuAnswerAry = quizTracker[self.qIndex].stuAnswer;
            
            html += '<p><strong>Your answer:</strong><br>';
            
            $.each( stuAnswerAry, function( i ) {
                
                var saIndex = Number(stuAnswerAry[i]);
                var mmAnswerType = 'text';
                
                if ( !SBPLUS.isEmpty( self.quiz.answers[saIndex].img ) ) {
                    mmAnswerType = 'img';
                }
                
                if ( !SBPLUS.isEmpty( self.quiz.answers[saIndex].audio ) ) {
                    mmAnswerType = 'audio';
                }
                
                switch ( mmAnswerType ) {
                            
                    case 'img':
                        html += '<img src="assets/images/' + self.quiz.answers[saIndex].value + '" /><br>';
                    break;
                    
                    case 'audio':
                        html += '<audio controls><source src="assets/audio/' + self.quiz.answers[saIndex].value + '" type="audio/mpeg"/></audio><br>';
                    break;
                    
                    case 'text':
                        html += self.quiz.answers[saIndex].value + '<br>';
                    break;
                    
                }
                
            } );
            
            html += '</p><p><strong>Correct answer:</strong><br>';
            
            $.each( self.quiz.answers, function() {
                
                if ( this.correct !== undefined ) {
                    
                    var aType = 'text';
                
                    if ( !SBPLUS.isEmpty( this.img ) ) {
                        aType = 'img';
                    }
                    
                    if ( !SBPLUS.isEmpty( this.audio ) ) {
                        aType = 'audio';
                    }
                    
                    switch ( aType ) {
                            
                        case 'img':
                            html += '<img src="assets/images/' + this.value + '" /><br>';
                        break;
                        
                        case 'audio':
                            html += '<audio controls><source src="assets/audio/' + this.value + '" type="audio/mpeg"/></audio><br>';
                        break;
                        
                        case 'text':
                            html += this.value + '<br>';
                        break;
                        
                    }
                    
                }
                
            } );
            
            html += '</p>';
            
            if ( quizTracker[self.qIndex].correct ) {
                
                if ( !SBPLUS.isEmpty( self.quiz.correctFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.correctFeedback + '</p>';
                }
                
            } else {
                
                if ( !SBPLUS.isEmpty( self.quiz.incorrectFeedback ) ) {
                    html += '<p><strong>Feedback:</strong><br>' + self.quiz.incorrectFeedback + '</p>';
                }
            }
                
        
        break;
        
    }
    
    html += '</div>';
    
    // display the html
    $( self.quizContainer ).html( html );
    
};

function questionExists( id ) {
    
    var found = false;
    
    $.each( quizTracker, function( i ) {
        
        if (quizTracker[i].id === id ) {
            found = true;
            return;
        }
        
    } );
    
    return found;
    
}

function shuffle( array ) {
    
    var randomIndex, temp, index;
    
    for ( index = array.length; index; index-- ) {
        
        randomIndex = Math.floor( Math.random() * index );
        
        temp = array[index - 1];
        array[index - 1] = array[randomIndex];
        array[randomIndex] = temp;
    }
}

function getCurrentQuizItem( array, id ) {
    
    var result = undefined;
    
    $.each( array, function( i ) {
        
        if ( array[i].id === id ) {
            result = i;
            return false;
        }
        
    } );
    
    return result;
    
}





