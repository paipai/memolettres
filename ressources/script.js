let app =  {    
    config: {
        nbLetters: 5,
        delay: 400
    },
    game: {
        currentlevel: 0,
        score: 0,
        highscore: 0,
        levels: [
            { nbLetters: 2, delay: 400, rate: 10, minscore: 0 },        
            { nbLetters: 3, delay: 400, rate: 20, minscore: 80 },
            { nbLetters: 4, delay: 400, rate: 30, minscore: 320 },
            { nbLetters: 5, delay: 500, rate: 40, minscore: 640 },
            { nbLetters: 5, delay: 400, rate: 50, minscore: 1040 },
            { nbLetters: 5, delay: 300, rate: 100, minscore: 1840 },
            { nbLetters: 6, delay: 400, rate: 500, minscore: 4840 },
            { nbLetters: 6, delay: 300, rate: 1000, minscore: 9000 }
        ]
    },
    isWaiting: false
}

document.addEventListener("DOMContentLoaded", function() {
    initWorker();
    initDefaultOptions();
    initEvent();
    initFocus();
    start();
});

function start() {
    showSection('home');
}

function initWorker() {    
    if ('serviceWorker' in navigator) {
        let registration;
        const registerServiceWorker = async () => {
            registration = await navigator.serviceWorker.register('https://paipai.github.io/memolettres/service-worker.js');
        };
        registerServiceWorker();
    }
}

function initDefaultOptions() {
    document.getElementById('delay').value = app.config.delay;
    document.getElementById('nbletters').value = app.config.nbLetters;
}

// Load options
function loadOptions() {
    document.getElementById('delay').value = app.config.delay;
    document.getElementById('nbletters').value = app.config.nbLetters;
}

// Display focus only when user navigates with keyboard
function initFocus() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var axsStyles = head.appendChild(document.createElement('style'));
    document.addEventListener('mousedown', function() {
        axsStyles.innerHTML = '* {outline:none !important}';
    });
    document.addEventListener('keydown', function() {
        axsStyles.innerHTML = '';
    });
}

function initEvent() {
    
    document.getElementById('btn-training').addEventListener('click', () => startTraining());    
    document.getElementById('btn-game').addEventListener('click', () => startGame());

    document.getElementById('btn-show').addEventListener('click', (e) => {        
        e.stopPropagation();
        e.preventDefault();
        show();
    });

    // Save options
    document.getElementById('btn-saveoptions').addEventListener('click', (e) => {
        let delay = document.getElementById('delay').value;
        let nbLetters = document.getElementById('nbletters').value;
        
        if (!isNaN(delay)) {            
            app.config.delay = delay;
        }
        
        if (!isNaN(nbLetters)) {
            app.config.nbLetters = nbLetters;
        }

        showSection('home');
    });

    document.getElementById('btn-next').addEventListener('click', (e) => {        
        if (app.isWaiting) {
            next();     
        }
    });

    document.querySelector('.training .btn-back').addEventListener('click', (e) => {                
        app.isWaiting = false;
        document.querySelector('.training .screen').style.visibility = 'hidden';
        showSection('home');
    });    

    document.querySelector('.options .btn-back').addEventListener('click', (e) => {        
        showSection('home');
    });    

    document.querySelector('.game .btn-back').addEventListener('click', (e) => {        
        document.querySelector('.game').classList.remove('isWaiting');
        showSection('home');
    });    

    document.getElementById('btn-options').addEventListener('click', (e) => {
        showSection('options', loadOptions);
    });
    
    document.getElementById('btn-game').addEventListener('click', (e) => {
        showSection('game');
    });    

    [].forEach.call(document.querySelectorAll('.game .toolbar .btn-answer'), function(el) {
        el.addEventListener('click', function() {
            if (app.isWaiting === true) {
                return;
            }

            app.isWaiting = true;

            if (document.querySelector('.game .screen').innerHTML == el.innerHTML) {
                app.game.score += app.game.levels[app.game.currentlevel].rate;
                el.classList.add('right');
            } else {
                app.game.score -= (app.game.levels[app.game.currentlevel].rate);
                if (app.game.score < 0) {
                    app.game.score = 0;
                }
                el.classList.add('wrong');                
            }

            updateScore();

            window.setTimeout(function () {
                app.isWaiting = false;
                document.querySelector('.game').classList.remove('isWaiting');
                el.classList.remove('right');
                el.classList.remove('wrong');
                nextGame();
            }, 500);
        });
    });
    
}

function startGame() {
    updateScore();
    showSection('game');
    window.setTimeout(function () { nextGame();}, 1000);
}

function show() {    
    if (app.isWaiting) {
        let screen = document.querySelector('.training .screen');
        screen.style.visibility = screen.style.visibility === 'visible'?'hidden':'visible';
    }
}

function startTraining() {
    showSection('training');
    window.setTimeout(function () { next();}, 1000);
}

function showSection(toolbar, callback) {
    document.body.dataset.section = toolbar;
    if (callback) {
        callback();
    }
}

function next() {
    app.isWaiting = false;
    let screen = document.querySelector('.training .screen');

    if (screen.style.visibility === 'visible') {        
        screen.style.visibility = 'hidden';
        window.setTimeout(next, 800);
        return;
    }
    
    screen.innerHTML = getLetters(app.config.nbLetters);
    screen.style.visibility = 'visible';

    // auto hide after delay
    window.setTimeout(function() {
        app.isWaiting = true;
        screen.style.visibility = 'hidden';
    }, app.config.delay);
}

function nextGame() {
    let screen = document.querySelector('.game .screen');
    
    screen.innerHTML = getLetters(app.game.levels[app.game.currentlevel].nbLetters);
    screen.style.visibility = 'visible';

    // auto hide after delay
    window.setTimeout(function() {
        //app.isWaiting = true;
        screen.style.visibility = 'hidden';

        let trueAnswer = Math.floor(Math.random() * 4);

        [].forEach.call(document.querySelectorAll('.game .answer button'), function (el, i) {            
            if (i !== trueAnswer) {
                let letters = screen.innerHTML;                                                
                do {
                    el.innerHTML = replaceAt(screen.innerHTML, Math.floor(Math.random() * screen.innerHTML.length), getLetters(1));                                        
                } while (letters == el.innerHTML);
            } else {
                el.innerHTML = screen.innerHTML;
            }
        });

        document.querySelector('.game').classList.add('isWaiting');

    }, app.game.levels[app.game.currentlevel].delay);
    
}

function getLetters(nbLetters) {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, nbLetters);
}

function replaceAt(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
}

function updateScore() {
    
    if (app.game.score > app.game.levels[app.game.currentlevel + 1].minscore) {
        app.game.currentlevel += 1;
        if (app.game.currentLevel > 6) { app.game.currentlevel = 6; }        
    }

    if (app.game.score < app.game.levels[app.game.currentlevel].minscore) {
        app.game.currentlevel -= 1;
        if (app.game.currentLevel < 0) { app.game.currentlevel = 0; }
    }

    if (app.game.highscore < app.game.score) {
        app.game.highscore = app.game.score;
    }

    document.getElementById('game-score').innerHTML = 'Score : ' + app.game.score + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Meilleur score : ' + app.game.highscore;
}