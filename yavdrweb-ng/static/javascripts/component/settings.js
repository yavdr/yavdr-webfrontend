YaVDR.Component.Settings = Ext.extend(YaVDR.Component, {
	itemId: 'settings',
	title: _('Settings'),
	description: _('Here you can configure your VDR and applications around it.'),
	initComponent: function() {
		this.items = [
			new YaVDR.Component.Item({
				title: _('VDR'),
				style: 'margin-bottom: 5px',
				items: YaVDR.createSubmenu(YaVDR.Component.Settings.menu['vdr'], 3)
			}),
			new YaVDR.Component.Item({
				title: _('Hardware'),
				style: 'margin-bottom: 5px',
				items: YaVDR.createSubmenu(YaVDR.Component.Settings.menu['hw'], 3)
			}),
			new YaVDR.Component.Item({
				title: _('System'),
				items: YaVDR.createSubmenu(YaVDR.Component.Settings.menu['system'], 3)
			})
		];
		YaVDR.Component.Settings.superclass.initComponent.call(this);
	}
});

YaVDR.Component.Settings.menu = new Array;
YaVDR.Component.Settings.menu['vdr'] = new Array;
YaVDR.Component.Settings.menu['hw'] = new Array;
YaVDR.Component.Settings.menu['system'] = new Array;

Ext.apply(YaVDR.Component.Settings, {
	addMenu: function(section, itemId, label, icon) {
/*		YaVDR.Component.Settings.menu[section].push({
			itemId: itemId,
			text: label,
			icon: icon
		});*/
      YaVDR.Component.Settings.menu[section].push({
        itemId : itemId,
        imgPath : icon,
        tooltip : label
      });
	}
});

YaVDR.Component.Settings.addMenu('vdr', 'settings-vdr-generic', _('General'), '/static/images/tango/preferences-system.png');
YaVDR.Component.Settings.addMenu('vdr', 'settings-vdr-channels', _('Channels'), '/static/images/tango/address-book-new.png');

YaVDR.Component.Settings.addMenu('hw', 'settings-hw-remote', _('Remote control'), '/static/images/tango/remote_control.png');
YaVDR.Component.Settings.addMenu('hw', 'settings-hw-audio', _('Audio'), '/static/images/tango/audio-x-generic.png');
YaVDR.Component.Settings.addMenu('hw', 'settings-hw-display', _('Display'), '/static/images/tango/video-display.png');

YaVDR.Component.Settings.addMenu('system', 'settings-system-generic', _('System'), '/static/images/tango/computer.png');
YaVDR.Component.Settings.addMenu('system', 'settings-system-network', _('Network'), '/static/images/tango/network-wired.png');
YaVDR.Component.Settings.addMenu('system', 'settings-system-packages', _('Packages'), '/static/images/tango/package-x-generic.png');
YaVDR.Component.Settings.addMenu('system', 'settings-system-config-editor', _('Edit configurations'), '/static/images/tango/preferences-system.png');

YaVDR.registerComponent(YaVDR.Component.Settings);
