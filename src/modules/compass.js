(function(w) {
    var P = w.P,
        compassModule = {},
        orientationUpdateCallback = null;

    compassModule.init = function(settings) {
        var compassNotAvailableCallback = settings.compassNotAvailableCallback;
        orientationUpdateCallback = settings.orientationUpdateCallback;

        Compass.noSupport(function() {
            if (compassNotAvailableCallback) {
                compassNotAvailableCallback();
            }
        });

        Compass.needGPS(function() {
            if (compassNotAvailableCallback) {
                compassNotAvailableCallback();
            }
        });

        Compass.watch(function(heading) {
            if (orientationUpdateCallback) {
                orientationUpdateCallback(heading);
            }
        });
    }

    // expose module
    P.compass = compassModule;

}(this))
