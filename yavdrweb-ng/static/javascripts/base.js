Ext.override(Ext.form.Checkbox, {
  setBoxLabel: function(boxLabel) {
    this.boxLabel = boxLabel;
    if (this.rendered) {
      this.wrap.child('.x-form-cb-label').update(boxLabel);
    }

    return this;
  }
});


Ext.ns('YaVDR');
YaVDR.Components = new Array();

Ext.apply(YaVDR, {

  notice: function(title, message) {
    Ext.Msg.show({
      title: title,
      msg: message,
      buttons: Ext.Msg.OK,
      icon: Ext.MessageBox.INFO
    });
  },
  alert: function(title, message) {
    Ext.Msg.show({
      title: title,
      msg: message,
      buttons: Ext.Msg.OK,
      icon: Ext.MessageBox.ERROR
    });
  },
  syncTS : 0,
  
  syncSession: function() {
    Ext.Ajax.request({
      url: 'session',
      timeout: 5000,
      method: 'GET',
      scope: this,
      success: function(xhr) {
        var data = Ext.util.JSON.decode(xhr.responseText);
        
        if (data.yavdrdb == false) {
          this.fail = true;
          if (!Ext.getBody().isMasked()) {
            Ext.getBody().mask(_('yaVDR database seems to be corrupted or missing.'), 'x-mask-offline');
          }
        } else {          
          if (Ext.getBody().isMasked() && this.fail) {
            Ext.getBody().unmask();
          }
          this.fail = false;
          if (typeof data.update != "undefined") {
            Ext.iterate(data.update, function(key, item) {
              var ts = parseInt(item);
              if (ts > YaVDR.syncTS) {
                YaVDR.syncTS = ts;
                
                var panel =  Ext.getCmp('yavdr-content').getComponent(key);
                if (panel) {
                  if (typeof panel.doReload != "undefined") {
                    panel.doReload();
                  } else if (typeof panel.doLoad != "undefined") {
                    panel.doLoad();
                  }
                }
              }
            });
          }
        }
      },
      failure: function() {
        if (!Ext.getBody().isMasked()) {
          Ext.getBody().mask(_('VDR seams to be switched off or webserver is stopped.'), 'x-mask-offline');
          this.fail = true;
        }
      },
      params: {
        ts: YaVDR.syncTS
      }
    });
  },

  createSubmenu: function(items, columns) {
    columns = columns || YaVDR.columns;

    var rows = Math.ceil(items.length / columns);
    var menu = new Array();

    for (var x = 1; x <= rows; x++) {
      var columnsMenu = new Array;

      for (var y = 1; y <= columns; y++) {
        var item;
        var z = ((x - 1) * columns) + y - 1;

        if (items[z]) {
          item = items[z];
        } else {
          item = {
            xtype: 'spacer'
          }
        }

        var left = 0;
        if (y != columns) left = 5;

        var bottom = 0;
        if (x != rows) bottom = 5;

        item.margins = '0 ' + left + 'px ' + bottom + 'px 0';

        columnsMenu.push(item);
      }
      menu.push({ items: columnsMenu });
    }

    var return_menu = {
      defaults: {
        anchor: '100%',
        margins: '5 0 0 0',
        layout: 'hbox',
        defaults: {
          xtype: 'imagebutton',
          imgWidth : YaVDR.defaultImgWidth,
          imgHeight : YaVDR.defaultImgWidth,
          flex: 1,
          handler: function(button) {
            YaVDR.openComponent(button.itemId);
          }
        }
      },
      items: menu
    };

    return return_menu;
  },

  getComponent: function(componentId) {
    return YaVDR.Components[componentId];
  },
  registerComponent: function(component) {
    var componentId = component.prototype.itemId;
    YaVDR.Components[componentId] = component;
  },
  openComponent: function(componentId) {
    if (YaVDR.Components[componentId]) Ext.History.add(componentId);
  },
  showComponent: function(componentId) {
    if (!componentId) componentId = 'dashboard';
    var panel = YaVDR.getComponent(componentId);
    if (!panel) {
      YaVDR.openComponent('dashboard');
    } else {
      Ext.getCmp('yavdr-content').add(new YaVDR.Components[componentId]);
      Ext.getCmp('yavdr-content').getLayout().setActiveItem(componentId);
    }
  },
  // Todo Error Handling
  getHdfValue: function(key, callback, scope) {
    var url;
    if (typeof key == 'object') {
      url = '/admin/get_hdf_value?' + Ext.urlEncode({hdfpaths: key});
    } else {
      url = '/admin/get_hdf_value?hdfpath=' + key;
    }

    Ext.Ajax.request({
      url: url,
      timeout: 3000,
      method: 'GET',
      scope: scope,
      success: function(xhr) {
        var value;
        if (typeof key == 'object') {
          value = Ext.decode(xhr.responseText);
        } else {
          value = xhr.responseText;
        }
        callback.call(this, value);
      }
    });
  },
  // Todo Error Handling
  getHdfTree: function(key, callback, scope) {
    Ext.Ajax.request({
      url: '/admin/get_hdf_value?hdftree=' + key,
      timeout: 3000,
      method: 'GET',
      scope: scope,
      success: function(xhr) {
        var value = Ext.decode(xhr.responseText);
        callback.call(this, value);
      }
    });
  },
  // Todo Error Handling
  getFileContent: function(file, callback, scope, options) {
    if (typeof options != 'object') options = {};

    options = Ext.applyIf(options, {
      puretext: true
    });

    Ext.Ajax.request({
      url: '/admin/get_file_content?file=' + file + '&puretext=' + (options.puretext ? 'true' : 'false'),
      timeout: 3000,
      method: 'GET',
      scope: scope,
      success: function(xhr) {
        callback.call(this, xhr.responseText);
      }
    })
  }
});

YaVDR.Header = Ext.extend(Ext.Panel, {
  height: 60,
  style: "background: #4E78B1 url('/static/images/yavdr-logo-blue-bg.png') no-repeat 780px center; border-radius: 4px; margin-bottom: 20px",
  layout: 'hbox',
  id: 'yavdr-menu',
  cls: 'yavdr-menu',
  baseCls:'x-plain',
  layoutConfig: {
    align: 'top',
    padding:'20 5 0 10'
  },
  defaults: {
    iconAlign: 'center',
    xtype:'button',
    margins:'5 5 0 0',
    handler: function(button) {
      YaVDR.openComponent(button.getItemId())
    }
  },
  initComponent: function() {

    this.items = [
      {
        itemId: 'dashboard',
        tooltip: _('Dashboard'),
        text: _('Dashboard')
      },
      {
        itemId: 'settings',
        margins:'5 5 0 0',
        text: _('Settings'),
        tooltip: _('Settings')
      },
      {
        itemId: 'system',
        tooltip: _('System'),
        text: _('System')
      }
    ];

    YaVDR.Header.superclass.initComponent.call(this);
  }
});

YaVDR.Body = Ext.extend(Ext.Panel, {
  id: 'yavdr-body',
  region: 'center',
  //layout: 'fit',
  activeItem: 0,
  border: true ,
  initComponent: function() {

    this.items = [
      new Ext.Panel({
        id: 'yavdr-content',
        border: false,
        activeItem: 0,
        layout: 'card',
        defaults: {
          //autoScroll: true
        }
      })
    ];

    YaVDR.Body.superclass.initComponent.call(this);
  }
});

YaVDR.Viewport = Ext.extend(Ext.Container, {
  id: 'yavdr',
  renderTo: 'yavdr-main',
  autoHeight: true,
  initComponent: function() {
      this.items= [
      new YaVDR.Header({
        margins: '5 5 0 5'
      }),
      new YaVDR.Body({
        border: false,
        //padding: 5
        margins: '5 5 5 5'
      })
    ]
    YaVDR.Viewport.superclass.initComponent.call(this);
  }
});

Ext.ns('YaVDR.Default');
YaVDR.Default.Form = Ext.extend(Ext.FormPanel, {
  labelWidth: 250,
  initComponent: function() {
	if (!Ext.isArray(this.buttons)) {
		this.buttons = [];
	}
	this.buttons = this.buttons.concat([
      {
        itemId: 'cancel',
        scope: this,
        text: _('Cancel'),
        handler: this.doLoad,
        icon: '/icons/fugue/cross.png'
      },
      {
        itemId: 'save',
        scope: this,
        text: _('Save'),
        handler: this.doSave,
        icon: '/icons/fugue/disk-black.png'
      }
    ]);
    YaVDR.Default.Form.superclass.initComponent.call(this);
    this.on('actioncomplete', this.afterComplete, this);
    this.on('beforeaction', this.beforeAction, this);
    this.on('actionfailed', this.actionFailed, this);
    this.on('render', this.doLoad, this);
  },
  actionFailed: function() {
    YaVDR.alert(_('Saving'), _('Error while saving data.'));
    Ext.getBody().unmask();
  },
  beforeAction: function(form, action) {
    Ext.getBody().mask(_("Saving"), 'x-mask-loading');
  },
  afterComplete: function(form, action) {
    YaVDR.notice(_('Saving'), _('Data stored successfully.'));
    Ext.getBody().unmask();
  },
  doSave: function() {
  },
  doLoad: function() {
  }
});

Ext.onReady(function() {
  Ext.QuickTips.init();
  Ext.History.init();
  new YaVDR.Viewport();

  Ext.History.on('change', function(token) {
    if (!token) token = 'dashboard';
    YaVDR.showComponent(token);
  });
  YaVDR.showComponent(Ext.History.getToken());
});
