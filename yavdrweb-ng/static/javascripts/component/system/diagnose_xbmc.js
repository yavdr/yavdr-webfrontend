YaVDR.Component.System.XBMC = Ext.extend(YaVDR.Component.System.Diagnose, {
  itemId: 'system-diagnose-xbmc',
  subTitle: _('XBMC crash log'),
  initComponent: function() {
    YaVDR.Component.System.XBMC.superclass.initComponent.call(this);
    this.addFileContent('/var/lib/vdr/.kodi/temp/kodi.log', '/var/lib/vdr/.kodi/temp/kodi.log');
    this.addFileContent('/var/lib/vdr/.kodi/temp/kodi.old.log', '/var/lib/vdr/.kodi/temp/kodi.old.log');
  }
});
YaVDR.registerComponent(YaVDR.Component.System.XBMC);
