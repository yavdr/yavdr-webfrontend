YaVDR.Component.Settings = Ext.extend(YaVDR.Component, {
	itemId: 'settings',
	title: _('Settings'),
	description: _('Here you can configure your VDR and applications around it.'),
	initComponent: function() {
		this.items = [
			new YaVDR.Component.Item({
				title: _('VDR'),
		        style: 'margin-bottom: 5px',
				items: YaVDR.createSubmenu(YaVDR.Component.Settings.menu['vdr'])
			}),
			new YaVDR.Component.Item({
				title: _('Hardware'),
		        style: 'margin-bottom: 5px',
				items: YaVDR.createSubmenu(YaVDR.Component.Settings.menu['hw'])
			}),
			new YaVDR.Component.Item({
				title: _('System'),
				items: YaVDR.createSubmenu(YaVDR.Component.Settings.menu['system'])
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
	addMenu: function(section, itemId, label, icon, path, width) {
	  path = path || YaVDR.defaultPath;
	  width = width || YaVDR.defaultImgWidth;
	  
      YaVDR.Component.Settings.menu[section].push({
        itemId : itemId,
        imgPath : path + '/' + width + '/' + icon + '.png',
        tooltip : label
      });
	}
});

YaVDR.Component.Settings.addMenu('vdr', 'settings-vdr-generic', _('General'), 'preferences-system');
YaVDR.Component.Settings.addMenu('vdr', 'settings-vdr-channels', _('Channels'), 'address-book-new');

YaVDR.Component.Settings.addMenu('hw', 'settings-hw-remote', _('Remote control'), 'remote_control');
YaVDR.Component.Settings.addMenu('hw', 'settings-hw-audio', _('Audio'), 'audio-x-generic');
YaVDR.Component.Settings.addMenu('hw', 'settings-hw-display', _('Display'), 'video-display');

YaVDR.Component.Settings.addMenu('system', 'settings-system-generic', _('System'), 'computer');
YaVDR.Component.Settings.addMenu('system', 'settings-system-network', _('Network'), 'network-wired');
YaVDR.Component.Settings.addMenu('system', 'settings-system-packages', _('Packages'), 'package-x-generic');
YaVDR.Component.Settings.addMenu('system', 'settings-system-config-editor', _('Edit configurations'), 'preferences-system');

YaVDR.registerComponent(YaVDR.Component.Settings);
