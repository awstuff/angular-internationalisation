(function () {
    var app = angular.module("awInternationalisation", []);

    var localStorage = window.localStorage;

    var localStorageKey = "awInternationalisation--locale";

    var debug = true;

    var helperFunctions = {
        warn: function (msg) {
            console.warn("awInternationalisation: " + msg);
        },
        err: function (msg) {
            console.error("awInternationalisation: " + msg);
        },
        debug: function (msg) {
            if (!debug) {
                return;
            }

            console.debug("awInternationalisation: " + msg);
        },
        validateIdString: function (idString) {
            if (!idString || typeof idString !== "string" || !idString.length) {
                helperFunctions.warn("'" + idString + "' is not a valid locale identifier.");
                return false;
            }

            return true;
        },
        setLocalStorageLocale: function (idString) {
            localStorage[localStorageKey] = idString;
        },
        getLocalStorageLocale: function () {
            return localStorage[localStorageKey];
        },
        deleteLocalStorageLocale: function () {
            localStorage.removeItem(localStorageKey);
        }
    };

    app.factory("awInternationalisationProvider", [function () {

        var locales = {};

        var awInternationalisationProvider = {
            restoreLocale: true,    // restore the previous session's locale

            initialized: false, // init function has been called

            noLocaleSet: true,  // no locale has been set yet

            init: function (initFunction) {
                if (typeof initFunction === "function") {
                    initFunction();
                }

                awInternationalisationProvider.initialized = true;

                if (!awInternationalisationProvider.restoreLocale) {
                    helperFunctions.deleteLocalStorageLocale();
                    return;
                }

                if (!awInternationalisationProvider.noLocaleSet) {
                    return;
                }

                var lastLocale = helperFunctions.getLocalStorageLocale();

                if (!lastLocale) {  // no need to print a warning in this case
                    return;
                }

                if (helperFunctions.validateIdString(lastLocale)) {
                    awInternationalisationProvider.setCurrentLocale(lastLocale);

                    awInternationalisationProvider.noLocaleSet = false;

                    helperFunctions.debug("Locale '" + lastLocale + "' restored");

                    return;
                }

                awInternationalisationProvider.setFirstLocale();
                helperFunctions.debug("Locale selected after init");
            },

            addLocale: function (idString, map) {
                if (!helperFunctions.validateIdString) {
                    return;
                }

                if (typeof map !== "object") {
                    helperFunctions.err("Translation map for locale '" + idString + "' has to be an object.");
                    return;
                }

                if (locales[idString]) {
                    helperFunctions.warn("Locale '" + idString + "' is already configured. Old values are being overridden.");
                    return;
                }

                locales[idString] = map;

                if (awInternationalisationProvider.noLocaleSet && awInternationalisationProvider.initialized) {
                    awInternationalisationProvider.setFirstLocale();
                    helperFunctions.debug("Locale selected after adding a locale");
                }
            },

            setCurrentLocale: function (idString) {
                if (!helperFunctions.validateIdString) {
                    return;
                }

                if (!locales[idString]) {
                    helperFunctions.err("Locale '" + idString + "' is not configured and cannot be set.");
                    return;
                }

                helperFunctions.setLocalStorageLocale(idString);

                helperFunctions.debug("Locale '" + idString + "' set");
            },

            setDefaultLocale: function (idString) {
                awInternationalisationProvider.setCurrentLocale(idString);
                awInternationalisationProvider.noLocaleSet = false;

                helperFunctions.debug("Locale '" + idString + "' set as default");
            },

            setFirstLocale: function () {
                var firstLocale = awInternationalisationProvider.getFirstLocaleIdString();

                awInternationalisationProvider.setCurrentLocale(firstLocale);
                awInternationalisationProvider.noLocaleSet = false;

                helperFunctions.debug("Locale '" + firstLocale + "' set because it is the first one");
            },

            getFirstLocaleIdString: function () {
                for (var idString in locales) {
                    if (locales.hasOwnProperty(idString)) {
                        return idString;
                    }
                }
            },

            getCurrentLocale: function () {
                return helperFunctions.getLocalStorageLocale();
            }
        };

        // if (!awInternationalisationProvider.initialized) {
        //     awInternationalisationProvider.init();
        // }

        return awInternationalisationProvider;
    }]);



    app.directive("awInternationalize", [function () {}]);
})();
