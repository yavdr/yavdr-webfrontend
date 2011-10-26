YaVDR.Component.System = Ext.extend(YaVDR.Component, {
  itemId: 'system',
  title: _('System'),
  description: _('Here you can monitor your system. You can look into log files and send them to pastebin to let others review them.'),
  initComponent: function() {
    this.items = [
      new YaVDR.Component.Item({
        title: _('Commands'),
        style: 'margin-bottom: 5px',
        items: YaVDR.createSubmenu(YaVDR.Component.System.menu['commands'])
      }),
      new YaVDR.Component.Item({
        title: _('Diagnostics'),
        items: YaVDR.createSubmenu(YaVDR.Component.System.menu['diagnose'])

      })
    ];
    YaVDR.Component.System.superclass.initComponent.call(this);
  }
});

YaVDR.Component.System.menu = new Array;
YaVDR.Component.System.menu['commands'] = new Array;
YaVDR.Component.System.menu['diagnose'] = new Array;

Ext.apply(YaVDR.Component.System, {
  addCommand: function(label, handler, icon, scope, path, width) {
    path = path || YaVDR.defaultPath;
    width = width || YaVDR.defaultImgWidth;
    
    YaVDR.Component.System.menu['commands'].push({
      scope: scope,
      imgPath : path + '/' + width + '/' + icon + '.png',
      tooltip : label,
      handler: handler
    });
  },
  addMenu: function(section, itemId, label, icon, path, width) {
    path = path || YaVDR.defaultPath;
    width = width || YaVDR.defaultImgWidth;
    
    YaVDR.Component.System.menu[section].push({
      itemId : itemId,
      imgPath : path + '/' + width + '/' + icon + '.png',
      tooltip : label
    });
  },
  changeVdrToSecondDisplay: function() {
    YaVDR.Component.System.request('/admin/set_signal?signal=change-display');
  },
  stopVDR: function() {
    YaVDR.Component.System.request('/admin/set_signal?signal=stop-vdr');
  },
  restartVDR: function() {
    YaVDR.Component.System.request('/admin/set_signal?signal=restart-vdr');
  },
  killXBMC: function() {
    YaVDR.Component.System.request('/admin/set_signal?signal=kill-xbmc');
  },
  resetXBMC: function() {
    YaVDR.Component.System.request('/admin/set_signal?signal=reset-xbmc');
  },
  reboot: function() {
    YaVDR.Component.System.request('/admin/set_signal?signal=reboot');
  },
  request: function(url) {
    Ext.getBody().mask(_("Execute command..."), 'x-mask-loading');
    Ext.Ajax.request({
      url: url,
      success: function() {
        YaVDR.notice(_('Execute command'), _('The command has been executed successfully'));
        Ext.getBody().unmask();
      },
      failue: function() {
        YaVDR.alert(_('Execute command'), _('The command could not complete successfully'));
        Ext.getBody().unmask();
      }
    });
  }
});

YaVDR.Component.System.addCommand(_('Switch temporarily to second screen'), YaVDR.Component.System.changeVdrToSecondDisplay, 'switch-display');
YaVDR.Component.System.addCommand(_('Reboot computer'), YaVDR.Component.System.reboot, 'reboot');
YaVDR.Component.System.addCommand(_('Kill XBMC'), YaVDR.Component.System.killXBMC, 'xbmc-process-stop');
YaVDR.Component.System.addCommand(_('Set XBMC defaults'), YaVDR.Component.System.resetXBMC, 'xbmc-edit-delete');
YaVDR.Component.System.addCommand(_('Restart VDR'), YaVDR.Component.System.restartVDR, 'view-refresh');

YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-system-infos', _('System information'), 'utilities-system-monitor');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-system-logs', _('System log files'), 'document-open');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-xbmc', _('XBMC crash log'), 'xbmc-document-open');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-lirc', _('LIRC configuration'), 'lirc-config');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-vdr', _('VDR configuration'), 'vdr-config');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-x11', _('Xorg server'), 'X11');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-alsa', _('Sound (ALSA)'), 'audio-card');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-dpkg', _('Package information'), 'package-x-generic');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-yavdr', _('yaVDR database'), 'drive-harddisk');

YaVDR.registerComponent(YaVDR.Component.System);
