YaVDR.Component.System = Ext.extend(YaVDR.Component, {
  itemId: 'system',
  title: _('System'),
  description: _('Here you can monitor your system. You can look into log files and send them to pastebin to let others review them.'),
  initComponent: function() {
    this.items = [
      new YaVDR.Component.Item({
        title: _('Commands'),
        style: 'margin-bottom: 5px',
        items: YaVDR.createSubmenu(YaVDR.Component.System.menu['commands'], 3)
      }),
      new YaVDR.Component.Item({
        title: _('Diagnostics'),
        items: YaVDR.createSubmenu(YaVDR.Component.System.menu['diagnose'], 3)

      })
    ];
    YaVDR.Component.System.superclass.initComponent.call(this);
  }
});

YaVDR.Component.System.menu = new Array;
YaVDR.Component.System.menu['commands'] = new Array;
YaVDR.Component.System.menu['diagnose'] = new Array;

Ext.apply(YaVDR.Component.System, {
  addCommand: function(label, handler, icon, scope) {
    /*YaVDR.Component.System.menu['commands'].push({
      scope: scope,
      text: label,
      handler: handler,
      icon: icon
    });*/
    YaVDR.Component.System.menu['commands'].push({
      scope: scope,
      imgPath : icon,
      tooltip : label,
      handler: handler
    });
  },
  addMenu: function(section, itemId, label, icon) {
    /*YaVDR.Component.System.menu[section].push({
      itemId: itemId,
      text: label,
      icon: icon
    });*/
    YaVDR.Component.System.menu[section].push({
      itemId : itemId,
      imgPath : icon,
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

YaVDR.Component.System.addCommand(_('Switch temporarily to second screen'), YaVDR.Component.System.changeVdrToSecondDisplay, '/static/images/tango/switch-display.png');
YaVDR.Component.System.addCommand(_('Reboot computer'), YaVDR.Component.System.reboot, '/icons/fugue/arrow-circle-225.png');
YaVDR.Component.System.addCommand(_('Kill XBMC'), YaVDR.Component.System.killXBMC, '/static/images/tango/xbmc-process-stop.png');
YaVDR.Component.System.addCommand(_('Set XBMC defaults'), YaVDR.Component.System.resetXBMC, '/static/images/tango/xbmc-edit-delete.png');
YaVDR.Component.System.addCommand(_('Restart VDR'), YaVDR.Component.System.restartVDR, '/static/images/tango/view-refresh.png');

YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-system-infos', _('System information'), '/static/images/tango/utilities-system-monitor.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-system-logs', _('System log files'), '/static/images/tango/document-open.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-xbmc', _('XBMC crash log'), '/static/images/tango/xbmc-document-open.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-lirc', _('LIRC configuration'), '/icons/silk/keyboard.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-vdr', _('VDR configuration'), '/icons/fugue/screwdriver.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-x11', _('Xorg server'), '/static/images/tango/X11.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-alsa', _('Sound (ALSA)'), '/static/images/tango/audio-card.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-dpkg', _('System information'), '/static/images/tango/package-x-generic.png');
YaVDR.Component.System.addMenu('diagnose', 'system-diagnose-yavdr', _('yaVDR database'), '/static/images/tango/drive-harddisk.png');

YaVDR.registerComponent(YaVDR.Component.System);
