(function(w) {
    'use strict';

    var P = w.P,
        ko = w.ko,
        creatures = P.creaturesList,
        marian = new P.Player(),
        shot = P.shot,
        settings = P.settings,
        soundManager = P.soundManager,
        logsSender = P.logsSender,
        game = {};

    var calculateCreatureAngle = function(c) {
        var result = c.orientation() - marian.orientation();
        if (result < -180) {
            result += 360;
        }
        if (result > 180) {
            result -= 360;
        }

        return result;
    };

    var sendGameState = function () {
        var firstCreature = creatures.getFirstCreature();

        var gameState = {
            IsGameStarted: game.started(),
            PlayerOrientation: marian.orientation(),
            PlayerHealth: marian.health(),
            FragsCount: marian.fragsCount(),
            CreatureOrientation: firstCreature != null ? firstCreature.orientation() : null,
            CreatureDistance: firstCreature != null ? firstCreature.distanceFromPlayer() : null
        };
        if (marian.health() == 0 && marian.fragsCount() == 1) {
            console.log("je to tu");    
        }
        
        logsSender.sendGameState(gameState);
    };

    var creatureRelativePositionChanged = function(c) {
        soundManager.changeCreatureNoise(c.id, calculateCreatureAngle(c), c.distanceFromPlayer());
    };

    marian.orientation.subscribe(function() {
        ko.utils.arrayForEach(creatures(), function(c) {
            creatureRelativePositionChanged(c);
        });
    });

    creatures.onCreatureDied = function(c) {
        setTimeout(function() {
            creatures.generateCreature();
        }, settings.timeToRecreateCreature() * 1000);
        marian.fragsCount(marian.fragsCount() + 1);
        soundManager.playCreatureDie();
        soundManager.stopCreatureNoise(c.id);
        game.playerIsDying(false);
    };

    creatures.onCreatureSpawned = function(c) {
        P.soundManager.startCreatureNoise(c.id, calculateCreatureAngle(c), c.distanceFromPlayer());
    };

    creatures.onCreatureMoved = function(c) {
        creatureRelativePositionChanged(c);
    };

    creatures.onCreatureHitPlayer = function(c) {
        marian.takeDamage();
        soundManager.playCreatureHit();
        soundManager.stopCreatureNoise();

        game.playerIsDying(true);
        setTimeout(function() {
            game.playerIsDying(false);
        }, 200);
    };

    marian.isAlive.subscribe(function(isAlive) {
        if (!isAlive) {
            game.stop();
        }
    });

    game.playerIsDying = ko.observable(false);
    game.playerIsHitting = ko.observable(false);
    game.started = ko.observable(false);

    game.shoot = function() {
        shot.shoot(marian.orientation(), creatures);
        soundManager.playShot();

        game.playerIsHitting(true);
        setTimeout(function() {
            game.playerIsHitting(false);
        }, 100);
    };

    game.start = function() {
        marian.init("Marian", 111);

        game.started(true);
        soundManager.startBackgroundMusic();

        setTimeout(function() {
            creatures.init();
        }, 3000);
    };

    game.stop = function() {
        soundManager.stopAll();
        creatures.stop();
        game.started(false);
    };

    game.restart = function() {
        marian.restart();
        creatures.restart();
        settings.restart();

        soundManager.stopAll();
        soundManager.startBackgroundMusic();
    };

    game.changePlayerOrientation = function(orientation) {
        marian.orientation(orientation);
    };

    game.creatures = creatures;
    game.currentPlayer = marian;

    setInterval(sendGameState, 300);

    // expose module
    P.game = game;

}(this))