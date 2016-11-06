# angular-internationalisation for Angular 2.x

## Usage
### Basic usage
In order to use angular-internationalisation, simply include `angular-internationalisation.ts` in your project and add the dependency `awInternationalisation` to your module definition, like this:
````javascript
import { InternationalisationModule } from "./angular-internationalisation";

@NgModule({
    imports: [ InternationalisationModule ]
})
export class AppModule {}
````

Next, inject `InternationalisationService` somewhere, for example into a component or service, and define the locales you want your app to use:
````javascript
import { InternationalisationService } from "./../angular-internationalisation";

@Injectable()
export class ExampleService {

    constructor (private internationalisationService: InternationalisationService) {}

    doSomething (): void {
        this.internationalisationService.setLocales({
            de: {
                welcomeMessage: "Hallo!",
                textBody: "Beispieltext"
            },
            en: {
                welcomeMessage: "Hello!",
                textBody: "Sample text"
            }
        });
    }

}
````
To set the current locale to English (for example), use `this.internationalisationService.setCurrentLocale("en")`. The current locale is persisted into the browser's `localStorage`. This means, it is restored on page reload.

Include the actual text into your HTML-Markup as follows:
````html
<body>
    <h1>Demoapp</h1>
    <div aw-int="welcomeMessage"></div>
    <div aw-int="textBody"></div>
</body>
````

### Advanced usage
`InternationalisationService` exposes the following functions:

- `setLocales` sets multiple locales (see example above). Should only be called once.
- `setCurrentLocale` sets the current locale (see example above)
- `setDefaultLocale` sets the default locale. The default locale is selected if no locale setting can be found in the browser's `localStorage`. `setDefaultLocale` accepts one parameter (the locale's name), just as `setCurrentLocale` does.
- `getCurrentLocale` gets the name of the current locale
