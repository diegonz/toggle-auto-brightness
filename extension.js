#!/usr/bin/gjs

const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Main = imports.ui.main;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const SCHEMA = 'org.gnome.settings-daemon.plugins.power';
const KEY = 'ambient-enabled';

const Extension = new Lang.Class({
    Name: 'ToggleAutoBrightness.Extension',

    enable() {
        this._systemMenu = Main.panel.statusArea['aggregateMenu']._system;
        this._toggleAutoBrightnessActionButton = this._systemMenu._createActionButton(
            'weather-clear', _("Toggle")
        );
        this._toggleAutoBrightnessActionButtonId = this._toggleAutoBrightnessActionButton.connect(
            'clicked', Lang.bind(this, this._onToggleAutoBrightnessClicked)
        );
        this._systemMenu._actionsItem.actor.insert_child_at_index(
            this._toggleAutoBrightnessActionButton,
            2
        );
        // this._systemMenu._actionsItem.actor.add(this._toggleAutoBrightnessActionButton, { expand: true, x_fill: false });
        this._toggleAutoBrightnessActionButton.visible = true;
    },

    disable() {
        this._toggleAutoBrightnessActionButton.visible = false;
        if (this._toggleAutoBrightnessActionButtonId) {
            this._toggleAutoBrightnessActionButton.disconnect(this._toggleAutoBrightnessActionButtonId);
            this._toggleAutoBrightnessActionButtonId = 0;
        }
        if (this._toggleAutoBrightnessActionButton) {
            this._toggleAutoBrightnessActionButton.destroy();
            this._toggleAutoBrightnessActionButton = 0;
        }
    },

    _onToggleAutoBrightnessClicked() {
        if (Gio.Settings.list_schemas().indexOf(SCHEMA) == -1) {
            throw _("Schema \"%s\" not found.").format(SCHEMA);
        }
        let settings = new Gio.Settings({ schema: SCHEMA });
        let newSettingsValue = !settings.get_boolean(KEY);
        settings.set_boolean(KEY, newSettingsValue);
        this._showMessage('Auto Brightness ' + (newSettingsValue ? 'ON' : 'OFF'));
    },

    _showMessage(message) {
        let monitor = Main.layoutManager.primaryMonitor;
        let text = new St.Label({
            style_class: 'toggle-auto-brightness-label',
            text: message || 'Unknown auto brightness status!',
            opacity: 255
        });

        Main.uiGroup.add_actor(text);
        text.set_position(
            monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
            // monitor.y + Math.floor(monitor.height / 2 - text.height / 2)
            monitor.y + Math.floor(monitor.height / 1.5)
        );

        Tweener.addTween(text, {
            opacity: 0,
            time: 1.25,
            transition: 'easeOutQuad',
            onComplete: function () {
                Main.uiGroup.remove_actor(text);
                text = null;
            }
        });
    }
});

function init(metadata) {
    return new Extension();
}