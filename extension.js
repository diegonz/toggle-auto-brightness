'use strict';

const Gio = imports.gi.Gio;
const St = imports.gi.St;

const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SCHEMA = 'org.gnome.settings-daemon.plugins.power';
const KEY = 'ambient-enabled';

class Extension {

    constructor() {
        this.Name = 'ToggleAutoBrightness.Extension';
    }

    _onButtonClicked() {
        if (Gio.Settings.list_schemas().indexOf(SCHEMA) == -1) {
            throw _("Schema \"%s\" not found.").format(SCHEMA);
        }

        let settings = new Gio.Settings({ schema: SCHEMA });
        const newSettingsValue = !settings.get_boolean(KEY);
        const textValue = 'Auto Brightness ' + (newSettingsValue ? 'ON' : 'OFF');

        settings.set_boolean(KEY, newSettingsValue);

        const monitor = Main.layoutManager.primaryMonitor;
        let text = new St.Label({ style_class: 'gsetab', text: textValue, opacity: 255 });
        Main.uiGroup.add_actor(text);
        text.set_position(
            monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
            monitor.y + Math.floor(monitor.height / 1.5 - text.height / 2)
        );

        Tweener.addTween(text, {
            opacity: 0,
            time: 1.25,
            transition: 'easeInOutBack',
            onComplete() {
                Main.uiGroup.remove_actor(text);
                text = null;
            }
        });
    }

    enable() {
        let systemMenu = Main.panel.statusArea['aggregateMenu']._system;
        this._button = systemMenu._createActionButton('weather-clear', _(Me.metadata.name));
        this._buttonId = this._button.connect('clicked', this._onButtonClicked);
        systemMenu._actionsItem.actor.insert_child_at_index(this._button, 2);
        this._button.visible = true;
    }

    disable() {
        this._button.visible = false;
        if (this._buttonId) {
            this._button.disconnect(this._buttonId);
            this._buttonId = 0;
        }
        if (this._button) {
            this._button.destroy();
            this._button = 0;
        }
    }
};

function init(metadata) {
    return new Extension();
}