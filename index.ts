import {
    Directive,
    ElementRef,
    EventEmitter,
    Injectable,
    Input,
    NgModule,
    OnInit,
    OnDestroy
} from "@angular/core";

/**
 * localStorage reference
 */
const localStorage = window.localStorage;

/**
 * The key name used to store the current locale into localStorage
 */
const localStorageKey = "Internationalisation--locale";

/**
 * The string value used as a prefix in logs and messages
 */
const logPrefix = "Internationalisation";

/**
 * Display debug messages
 */
const debug = false;

/**
 * Display ridiculous debug messages
 */
const debugLikeCrazy = false;



@Injectable()
export class InternationalisationService {

    localeChanged: EventEmitter<any> = new EventEmitter();
    restoreLocale = true;

    private initialized = false;
    private localeRestored = false;
    private locales = {};
    private noLocaleSet = true;

    /**
     * Get the name of the currently set locale
     * @returns {string} The current locale's name
     */
    getCurrentLocale (): string {
        this.debugLikeCrazy("'getCurrentLocale' called");

        return this.getLocalStorageLocale();
    }

    /**
     * Get the current locale's translation value for the specified key
     * @param key The translation key
     * @returns {string} The corresponding translation value
     */
    getCurrentLocaleValue (key: string): string {
        this.debugLikeCrazy("'getCurrentLocaleValue' called");

        const currentLocale = this.getCurrentLocale();

        if (!this.validateIdString(currentLocale)) {
            return "";
        }

        const currentMap = this.locales[currentLocale];

        if (!currentMap) {
            this.err("Locale '" + currentLocale + "' is not configured and cannot be used.");

            return "";
        }

        let value;

        if (key.indexOf(".") > -1) {
            let keySplit = key.split(".");

            value = currentMap;

            for (let i = 0; i < keySplit.length; i++) {
                value = value[keySplit[i]];
            }
        } else {
            value = currentMap[key];
        }

        if (!value) {
            this.err("Locale '" + currentLocale + "' does not provide a translation for the key '" + key + "'.");
            return "";
        }

        return value;
    }

    /**
     * Set the current locale
     * @param idString The locale's name
     * @returns {boolean} false, if an error occured, otherwise undefined
     */
    setCurrentLocale (idString: string): boolean {
        this.debugLikeCrazy("'setCurrentLocale' called");

        if (!this.validateIdString(idString)) {
            return false;
        }

        if (!this.locales[idString]) {
            this.err("Locale '" + idString + "' is not configured and cannot be set.");
            return false;
        }

        this.setLocalStorageLocale(idString);

        this.localeChanged.emit();

        this.debug("Locale '" + idString + "' set");

        this.conditionalInit();
    }

    /**
     * Set the default locale that is used if no locale is set manually
     * @param idString The locale's name
     */
    setDefaultLocale (idString: string): void {
        this.debugLikeCrazy("'setDefaultLocale' called");

        if (this.localeRestored) {
            return;
        }

        if (this.setCurrentLocale(idString) !== false) {  // return value false indicates an error
            this.noLocaleSet = false;

            this.debug("Locale '" + idString + "' set as default");
        }

        this.conditionalInit();
    }

    /**
     * Add multiple locales at one
     * @param locales An object of locales. Each key is a locale's name, the corresponding value its translation map.
     */
    setLocales (locales: Object): void {
        this.debugLikeCrazy("'setLocales' called");

        for (let idString in locales) {
            if (locales.hasOwnProperty(idString)) {
                this.addLocale(idString, locales[idString], true);
            }
        }

        this.conditionalInit();
    }

    /**
     * Add a locale
     * @param idString The locale's name
     * @param map The locale's translation map. An object.
     * @param noInit Do not call initialize function (used for bulk operations). Not to be used manually, or unexpected results may happen!
     */
    private addLocale (idString: string, map: Object, noInit?: boolean): void {
        this.debugLikeCrazy("'addLocale' called");

        if (!this.validateIdString(idString)) {
            return;
        }

        if (typeof map !== "object") {
            this.err("Translation map for locale '" + idString + "' has to be an object.");
            return;
        }

        if (this.locales[idString]) {
            this.warn("Locale '" + idString + "' is already configured. Old values are being overridden.");
            return;
        }

        this.locales[idString] = map;

        if (this.noLocaleSet && this.initialized) {
            this.setFirstLocale();
            this.debug("Locale selected after adding a locale");
        }

        if (noInit !== true) {
            this.conditionalInit();
        }
    }

    /**
     * Call the init function, in case this has not happened yet
     */
    private conditionalInit (): void {
        this.debugLikeCrazy("'conditionalInit' called");

        if (!this.initialized) {
            this.init();
        }
    }

    /**
     * Display a debug message. Displayed only if debugging is enabled
     * @param msg The message text
     */
    private debug (msg: string): void {
        if (!debug) {
            return;
        }

        console.debug("Internationalisation: " + msg);
    }

    /**
     * Display a ridiculous debug message that should not be necessary. Displayed only if crazy debugging is enabled
     * @param msg
     */
    private debugLikeCrazy (msg: string): void {
        if (!debugLikeCrazy) {
            return;
        }

        console.debug("awInternationalisation [CRAZY DEBUGGING MODE]: " + msg);
    }

    /**
     * Remove the localStorage entry
     */
    private deleteLocalStorageLocale (): void {
        localStorage.removeItem(localStorageKey);
    }

    /**
     * Display an error
     * @param msg The message text
     */
    private err (msg: string): void {
        console.error("Internationalisation: " + msg);
    }

    /**
     * Get the name of the first locale that was added to the locale list
     * @returns {string} The first locale's name
     */
    private getFirstLocaleIdString (): string {
        this.debugLikeCrazy("'getFirstLocaleIdString' called");

        for (let idString in this.locales) {
            if (this.locales.hasOwnProperty(idString)) {
                return idString;
            }
        }
    }

    /**
     * Get the current locale identifier from localStorage
     * @returns {string} The current locale identifier
     */
    private getLocalStorageLocale (): string {
        return localStorage[localStorageKey];
    }

    /**
     * Initialize awInternationalisation (not to be called manually, or unexpected results may happen!)
     */
    private init (): void {
        this.debugLikeCrazy("'init' called");

        this.initialized = true;

        if (!this.restoreLocale) {
            this.deleteLocalStorageLocale();
            return;
        }

        if (!this.noLocaleSet) {
            return;
        }

        const lastLocale = this.getLocalStorageLocale();

        if (this.validateIdString(lastLocale, true)) {   // do not display warning
            this.setCurrentLocale(lastLocale);

            this.noLocaleSet = false;
            this.localeRestored = true;

            this.debug("Locale '" + lastLocale + "' restored");

            return;
        }

        this.setFirstLocale();
        this.debug("Locale selected after init");
    }

    /**
     * Set the first locale that was added to the locale list
     */
    private setFirstLocale (): void {
        this.debugLikeCrazy("'setFirstLocale' called");

        const firstLocale = this.getFirstLocaleIdString();

        if (this.setCurrentLocale(firstLocale) !== false) {
            this.noLocaleSet = false;

            this.debug("Locale '" + firstLocale + "' set because it is the first one");
        }

        this.conditionalInit();
    }

    /**
     * Store the specified locale identifier into localStorage
     * @param idString The locale identifier
     */
    private setLocalStorageLocale (idString: string): void {
        localStorage[localStorageKey] = idString;
    }

    /**
     * Validate if the specified string is a valid locale identifier
     * @param idString The identifier to validate
     * @param silent Do not display a warning in case validation fails
     * @returns {boolean} The identifier is valid
     */
    private validateIdString (idString: string, silent?: boolean): boolean {
        if (!idString || typeof idString !== "string" || !idString.length) {
            if (silent !== true) {
                this.warn("'" + idString + "' is not a valid locale identifier.");
            }

            return false;
        }

        return true;
    }

    /**
     * Display a warning
     * @param msg The message text
     */
    private warn (msg: string): void {
        console.warn("Internationalisation: " + msg);
    }

}



@Directive({
    selector: "[aw-int]"
})
class InternationalisationDirective implements OnInit, OnDestroy {
    @Input("aw-int") private key: string;

    private localeChangedSubscription: any;

    constructor (private internationalisationService: InternationalisationService, private element: ElementRef) {}

    ngOnInit (): void {
        const nativeElement = this.element.nativeElement;

        let updateContent: () => void;

        (updateContent = () => {
            nativeElement.textContent = this.internationalisationService.getCurrentLocaleValue(this.key)
        })();

        this.localeChangedSubscription = this.internationalisationService.localeChanged.subscribe(updateContent);
    }

    ngOnDestroy (): void {
        this.localeChangedSubscription.unsubscribe();
    }

}



@NgModule({
    declarations: [ InternationalisationDirective ],
    providers: [ InternationalisationService ],
    exports: [ InternationalisationDirective ]
})
export class InternationalisationModule {}
