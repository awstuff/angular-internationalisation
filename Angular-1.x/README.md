# angular-internationalisation for Angular 1.x

## Usage
### Basic usage
In order to use angular-internationalisation, simply include `angular-internationalisation.js` in your project and add the dependency `awInternationalisation` to your module definition, like this:
````javascript
var app = angular.module("demoApp", ["awInternationalisation"]);
````

Next, inject `awInternationalisationProvider` somewhere, for example into your controller, and define the locales you want your app to use. You can add them one by one by calling `awInternationalisationProvider.addLocale`, or add all of them at once via `awInternationalisationProvider.addLocales`.
````javascript
app.controller("demoController", ["$scope", "awInternationalisationProvider", function ($scope, awInternationalisationProvider) {

    // Add both locales at once:
    $scope.locales = {
        de: {
            welcomeMessage: "Hallo!",
            textBody: "Beispieltext"
        },
        en: {
            welcomeMessage: "Hello!",
            textBody: "Sample text"
        }
    };
    awInternationalisationProvider.addLocales($scope.locales);

    // Add locales one by one:
    awInternationalisationProvider.addLocale("fr", {
        welcomeMessage: "Bonjour!",
        textBody: "Texte modèle"
    });
});
````
To set the current locale to English (for example), use `awInternationalisationProvider.setCurrentLocale("en")`. The current locale is persisted into the browser's `localStorage`. This means, it is restored on page reload.

Include the actual text elements into your HTML-Markup as follows:
````html
<body>
    <h1>Demoapp</h1>
    <aw-int content="welcomeMessage"></aw-int>
</body>
````

### Advanced usage
`awInternationalisationprovider` exposes the following functions:

- `addLocale` adds a locale (see example above)
- `addLocales` adds multiple locales (see example above)
- `setCurrentLocale` sets the current locale (see example above)
- `setDefaultLocale` sets the default locale. The default locale is selected if no locale setting can be found in the browser's `localStorage`. `setDefaultLocale` accepts one parameter (the locale's name), just as `setCurrentLocale` does.
- `setFirstLocale` sets the current locale to the first one that was added via `addLocale` or `addLocales`. This function is mainly used internally, but it is exposed publicly, in case there is any other scenario where it may be useful.
- `getCurrentLocale` gets the name of the current locale
