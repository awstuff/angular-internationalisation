(function () {
    /**
     * The AngularJS module used
     */
    var app = angular.module("awInternationalisation", []);

    /**
     * localStorage reference
     * @type {Storage}
     */
    var localStorage = window.localStorage;

    /**
     * The key name used to store the current locale into localStorage
     * @type {string}
     */
    var localStorageKey = "awInternationalisation--locale";

    /**
     * Display debug messages
     * @type {boolean}
     */
    var debug = false;

    /**
     * Display ridiculous debug messages
     * @type {boolean}
     */
    var debugLikeCrazy = false;

    /**
     * awInternationalisationProvider's init function has been called
     */
    var initialized = false;

    /**
     * The previous session's locale has been restored
     */
    var localeRestored = false;

    /**
     * No locale has been set yet
     */
    var noLocaleSet = true;




    var helperFunctions = {
        /**
         * Display a warning
         * @param msg The message text
         */
        warn: function (msg) {
            console.warn("awInternationalisation: " + msg);
        },

        /**
         * Display an error
         * @param msg The message text
         */
        err: function (msg) {
            console.error("awInternationalisation: " + msg);
        },

        /**
         * Display a debug message. Displayed only if debugging is enabled
         * @param msg The message text
         */
        debug: function (msg) {
            if (!debug) {
                return;
            }

            console.debug("awInternationalisation: " + msg);
        },

        /**
         * Display a ridiculous debug message that should not be necessary. Displayed only if crazy debugging is enabled
         * @param msg
         */
        debugLikeCrazy: function (msg) {
            if (!debugLikeCrazy) {
                return;
            }

            console.debug("awInternationalisation [CRAZY DEBUGGING MODE]: " + msg);
        },

        /**
         * Validate if the specified string is a valid locale identifier
         * @param idString The identifier to validate
         * @param silent Do not display a warning in case validation fails
         * @returns {boolean} The identifier is valid
         */
        validateIdString: function (idString, silent) {
            if (!idString || typeof idString !== "string" || !idString.length) {
                if (silent !== true) {
                    helperFunctions.warn("'" + idString + "' is not a valid locale identifier.");
                }

                return false;
            }

            return true;
        },

        /**
         * Store the specified locale identifier into localStorage
         * @param idString The locale identifier
         */
        setLocalStorageLocale: function (idString) {
            localStorage[localStorageKey] = idString;
        },

        /**
         * Get the current locale identifier from localStorage
         * @returns {string} The current locale identifier
         */
        getLocalStorageLocale: function () {
            return localStorage[localStorageKey];
        },

        /**
         * Remove the localStorage entry
         */
        deleteLocalStorageLocale: function () {
            localStorage.removeItem(localStorageKey);
        }
    };


    /**
     * The factory that takes care of pretty much everything
     */
    app.factory("awInternationalisationProvider", ["$rootScope", function ($rootScope) {

        var locales = {};

        var awInternationalisationProvider = {

            /**
             * Restore the previous session's locale
             */
            restoreLocale: true,

            /**
             * Initialize awInternationalisation (not to be called manually, or unexpected results may happen!)
             */
            init: function () {
                helperFunctions.debugLikeCrazy("'init' called");

                //if (typeof initFunction === "function") {
                //    initFunction();
                //}

                initialized = true;

                if (!awInternationalisationProvider.restoreLocale) {
                    helperFunctions.deleteLocalStorageLocale();
                    return;
                }

                if (!noLocaleSet) {
                    return;
                }

                var lastLocale = helperFunctions.getLocalStorageLocale();

                // if (!lastLocale) {  // no need to print a warning in this case
                //     return;
                // }

                if (helperFunctions.validateIdString(lastLocale, true)) {   // do not display warning
                    awInternationalisationProvider.setCurrentLocale(lastLocale);

                    noLocaleSet = false;
                    localeRestored = true;

                    helperFunctions.debug("Locale '" + lastLocale + "' restored");

                    return;
                }

                awInternationalisationProvider.setFirstLocale();
                helperFunctions.debug("Locale selected after init");
            },

            /**
             * Call the init function, in case this has not happened yet
             */
            conditionalInit: function () {
                helperFunctions.debugLikeCrazy("'conditionalInit' called");

                if (!initialized) {
                    awInternationalisationProvider.init();
                }
            },

            /**
             * Add a locale
             * @param idString The locale's name
             * @param map The locale's translation map. An object.
             * @param noInit Do not call initialize function (used for bulk operations). Not to be used manually, or unexpected results may happen!
             */
            addLocale: function (idString, map, noInit) {
                helperFunctions.debugLikeCrazy("'addLocale' called");

                if (!helperFunctions.validateIdString(idString)) {
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

                if (noLocaleSet && initialized) {
                    awInternationalisationProvider.setFirstLocale();
                    helperFunctions.debug("Locale selected after adding a locale");
                }

                if (noInit !== true) {
                    awInternationalisationProvider.conditionalInit();
                }
            },

            /**
             * Add multiple locales at one
             * @param locales An object of locales. Each key is a locale's name, the corresponding value its translation map.
             */
            addLocales: function (locales) {
                helperFunctions.debugLikeCrazy("'addLocales' called");

                angular.forEach(locales, function (map, idString) {
                    awInternationalisationProvider.addLocale(idString, map, true);  // prevent init function call after each iteration
                });

                awInternationalisationProvider.conditionalInit();
            },

            /**
             * Set the current locale
             * @param idString The locale's name
             * @returns {boolean} false, if an error occured, otherwise undefined
             */
            setCurrentLocale: function (idString) {
                helperFunctions.debugLikeCrazy("'setCurrentLocale' called");

                if (!helperFunctions.validateIdString(idString)) {
                    return false;
                }

                if (!locales[idString]) {
                    helperFunctions.err("Locale '" + idString + "' is not configured and cannot be set.");
                    return false;
                }

                helperFunctions.setLocalStorageLocale(idString);

                $rootScope.$emit("awInternationalisation:localeChanged");

                helperFunctions.debug("Locale '" + idString + "' set");

                awInternationalisationProvider.conditionalInit();
            },

            /**
             * Set the default locale that is used if no locale is set manually
             * @param idString The locale's name
             */
            setDefaultLocale: function (idString) {
                helperFunctions.debugLikeCrazy("'setDefaultLocale' called");

                if (localeRestored) {
                    return;
                }

                if (awInternationalisationProvider.setCurrentLocale(idString) !== false) {  // return value false indicates an error
                    noLocaleSet = false;

                    helperFunctions.debug("Locale '" + idString + "' set as default");
                }

                awInternationalisationProvider.conditionalInit();
            },

            /**
             * Set the first locale that was added to the locale list
             */
            setFirstLocale: function () {
                helperFunctions.debugLikeCrazy("'setFirstLocale' called");

                var firstLocale = awInternationalisationProvider.getFirstLocaleIdString();

                if (awInternationalisationProvider.setCurrentLocale(firstLocale) !== false) {
                    noLocaleSet = false;

                    helperFunctions.debug("Locale '" + firstLocale + "' set because it is the first one");
                }

                awInternationalisationProvider.conditionalInit();
            },

            /**
             * Get the name of the first locale that was added to the locale list
             * @returns {string} The first locale's name
             */
            getFirstLocaleIdString: function () {
                helperFunctions.debugLikeCrazy("'getFirstLocaleIdString' called");

                for (var idString in locales) {
                    if (locales.hasOwnProperty(idString)) {
                        return idString;
                    }
                }
            },

            /**
             * Get the name of the currently set locale
             * @returns {string} The current locale's name
             */
            getCurrentLocale: function () {
                helperFunctions.debugLikeCrazy("'getCurrentLocale' called");

                return helperFunctions.getLocalStorageLocale();
            },

            /**
             * Get the current locale's translation value for the specified key
             * @param key The translation key
             * @returns {string} The corresponding translation value
             */
            getCurrentLocaleValue: function (key) {
                helperFunctions.debugLikeCrazy("'getCurrentLocaleValue' called");

                var currentLocale = awInternationalisationProvider.getCurrentLocale();

                if (!helperFunctions.validateIdString(currentLocale)) {
                    return "";
                }

                var currentMap = locales[currentLocale];

                if (!currentMap) {
                    helperFunctions.err("Locale '" + currentLocale + "' is not configured and cannot be used.");
                    return "";
                }

                var value = currentMap[key];

                if (!value) {
                    helperFunctions.err("Locale '" + currentLocale + "' does not provide a translation for the key '" + key + "'.");
                    return "";
                }

                return value;
            }
        };

        return awInternationalisationProvider;
    }]);


    /**
     * The directive used within a view
     */
    app.directive("awInt", ["$rootScope", "awInternationalisationProvider", function ($rootScope, awInternationalisationProvider) {
        return {
            restrict: "E",

            link: function ($scope, elem, attrs) {
                var key = attrs.content;

                var updateContent;

                (updateContent = function () {
                    elem.text(awInternationalisationProvider.getCurrentLocaleValue(key));
                })();

                $rootScope.$on("awInternationalisation:localeChanged", function () {
                    updateContent();
                });
            }
        };
    }]);
})();
