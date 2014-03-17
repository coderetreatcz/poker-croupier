$(document).ready(function() {
    "user strict";

    var player_template = null;

    function refreshCard(holecard, dom_card) {
        $(dom_card).removeClass("spades clubs hearts diamonds");
        if (holecard) {
            $(dom_card).addClass(holecard.suit);
            $(dom_card).text(holecard.rank);
        } else {
            $(dom_card).text('');
        }
    }

    function addPlayer(selector, player) {

        function status() {
            if (player.status === 'active') {
                return 'Bet: ' + player.bet + ' €';
            } else if (player.status === 'folded') {
                return 'Folded';
            } else if (player.status === 'out') {
                return 'Out';
            } else {
                return '';
            }
        }

        function status_style() {
            if(player.status === 'active') {
                return 'label-success';
            } else if(player.status === 'folded') {
                return 'label-danger';
            } else if(player.status === 'out') {
                return 'label-default';
            } else {
                return '';
            }
        }

        $(selector).append($(Mustache.render(player_template,{
            name: player.name,
            version: player.version,
            stack: player.stack,
            card: [
                player.hole_cards[0] || { suit: '', rank: '' },
                player.hole_cards[1] || { suit: '', rank: '' }
            ],
            status: status(),
            status_style: status_style()
        })).attr('id', 'player'+player.id));
    }

    function renderMessage(message) {
        if(message === undefined){ return ''; }

        return message.replace(/(10|\w|\d)\w* of (Diamonds|Hearts|Spades|Clubs)/g, function(string, rank, suit) {
            return "<span class='inline-card "+suit.toLowerCase()+"'>"+rank+"</span>"
        });
    }

    function render(index) {
        var event = window.pokerEvents[index];

        $("#pot-amount").text(event.game_state.pot);
        $('#community-cards div.card').each(function (index, dom_card) {
            refreshCard(event.game_state.community_cards[index], dom_card);
        });
        $('#player-container').empty();
        event.game_state.players.forEach(function (player) {
            addPlayer('#player-container', player);
        });

        $('#player'+event.game_state.dealer).addClass('dealer');
        $('#player'+event.on_turn).addClass('on-turn');

        $('#message').html(renderMessage(event.message));
    }

    $.ajax('template/player.mustache').done(function(data) {
        player_template = data;
        var currentIndex = 0;

        render(currentIndex);

        (function setUpListeners() {
            function next() { if(currentIndex < window.pokerEvents.length - 1) { render(++currentIndex); } else { stopPlay(); } }
            function back() { if(currentIndex > 0) { render(--currentIndex); } }
            function beginning() { render(currentIndex = 0); }
            function end() { render(currentIndex = window.pokerEvents.length - 1); }

            var timerHandle = false;

            function startPlay() {
                timerHandle = setInterval(next, 1200);
                $('#play-button').removeClass('play-button').addClass('stop-button');
            }

            function stopPlay() {
                clearInterval(timerHandle);
                timerHandle = false;
                $('#play-button').removeClass('stop-button').addClass('play-button');
            }

            function togglePlay() {
                if(!timerHandle) {
                    startPlay();
                } else {
                    stopPlay();
                }
            }

            $('#next-button').click(next);
            $('#back-button').click(back);
            $('#beginning-button').click(beginning);
            $('#end-button').click(end);
            $('#play-button').click(togglePlay);

            $(window).keydown(function(e) {
                switch(e.keyCode) {
                    case 37:
                        back();
                        break;
                    case 39:
                        next();
                        break;
                    case 36:
                        beginning();
                        break;
                    case 35:
                        end();
                        break;
                    case 32:
                        togglePlay()
                        break;
                }
            });
        })();
    });


    (function twitterWall() {
        $.ajax('template/tweet.mustache').done(function(template){
            var hashTagSlide = $('#tweets').html();
            var currentTweet = 0;

            function renderTweet() {
                if(currentTweet == window.tweets.length) {
                    $('#tweets').html(hashTagSlide);
                } else {
                    $('#tweets').html($(Mustache.render(template,window.tweets[currentTweet])));
                }
                currentTweet = (currentTweet + 1) % (window.tweets.length + 1);
            }

            if(window.tweets.length > 0) {
                setInterval(renderTweet, 7000);
            }
        });
    })();
});
