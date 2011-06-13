YaVDR.Component.Settings.SystemNetwork = Ext.extend(YaVDR.Component, {
  itemId: 'settings-system-network',
  layout: 'border',
  height: 500,
  bodyStyle: 'background-color: #FFF',
  initComponent: function() {
    this.nfs = new YaVDR.Component.Settings.SystemNetwork.NFS(this);
    this.wol = new YaVDR.Component.Settings.SystemNetwork.WOL(this);

    this.infoBox = new Ext.Panel({
      id: 'settings-system-network-info',
      region: 'south',
      margins: '5 0 0 0',
      padding: 6,
      style: 'background-color: #FFF; border: 1px solid #D0D0D0; font-size: 12px;',
      html: this.nfs.infoText
    });

    this.tabPanel = new Ext.TabPanel({
      plain: true,
      region: 'center',
      xtype: 'tabpanel',
      activeTab: 0,
      items: [
        this.nfs,
        this.wol
      ]
    });

    this.items = [
      new YaVDR.Component.Header({
        region: 'north',
        html: _('Settings')
      }),
      new YaVDR.Component.Item({
        region: 'center',
        style: '',
        layout: 'border',
        title: _('Network'),
        items: [
          this.tabPanel,
          this.infoBox
        ]
      })
    ];
    YaVDR.Component.Settings.SystemNetwork.superclass.initComponent.call(this);
    this.infoBox.on('render', function () {
      this.tabPanel.on('tabchange', function(tab, panel) {
        this.infoBox.update(panel.infoText);
      }, this);
    }, this);
  }
});
YaVDR.registerComponent(YaVDR.Component.Settings.SystemNetwork);

YaVDR.Component.Settings.SystemNetwork.NFS = Ext.extend(Ext.grid.GridPanel, {
  autoScroll: true,
  loadMask: true,
  title: 'NFS',
  stripeRows: true,
  infoText: _('You can define Host and shares which should be mounted automatically. You need to key in the shares using "host:/path/to/the/share".'),
  autoExpandColumn: 'netspec',
  initComponent: function() {

    this.viewConfig = {
      forceFit: true
    };

    this.sm = new Ext.grid.RowSelectionModel({ singleSelect:true });

    this.tbar = [
      {
        xtype: 'textfield',
        itemId: 'remote',
        width: 300
      },
      {
        icon: '/static/images/icons/socket--plus.png',
        text: _('Add'),
        scope: this,
        handler: this.addExport
      },
      {
        icon: '/static/images/icons/socket--pencil.png',
        text: _('Edit'),
        scope: this,
        handler: this.changeExport
      },
      {
        icon: '/static/images/icons/socket--minus.png',
        text: _('Delete'),
        scope: this,
        handler: this.deleteExport
      },
      {
        icon: '/static/images/icons/socket--arrow.png',
        text: _('Save'),
        scope: this,
        handler: this.saveExports
      }

    ];

    this.columns = [
      {
        dataIndex: 'netspec'
      }
    ];

    this.store = new Ext.data.Store({
      url: '/admin/get_autofs_config?cmd=mounts',
      reader: new Ext.data.ArrayReader({}, Ext.data.Record.create([
        {name: 'netspec'}
      ]))
    });

    YaVDR.Component.Settings.SystemNetwork.NFS.superclass.initComponent.call(this);

    this.on('rowclick', this.selectForEdit, this);
    this.on('render', function() {
      this.store.reload();
    }, this);
  },
  saveExports: function() {
    var mounts = [];
    this.loadMask.show()
    Ext.each(this.store.getRange(), function(k) {
      mounts.push(k.data.netspec);
    }, this);

    params = { 'cmd' : 'mounts' }
    if (mounts.length > 0) params.mounts = mounts

    Ext.Ajax.request({
      scope: this,
      url: '/admin/set_autofs_config',
      method:  'GET',
      params: params,
      success: function(xhr) {
        this.loadMask.hide();
        this.store.reload();
      },
      failure:function(form, action) {
        this.loadMask.hide();
      }
    })
  },
  selectForEdit: function(grid, rowIndex, e) {
    var record = this.store.getAt(rowIndex);
    var remote = this.getTopToolbar().getComponent('remote');
    remote.setValue(record.data.netspec);
  },
  addExport: function() {
    var remote = this.getTopToolbar().getComponent('remote');
    if (!remote.getValue()) {
      remote.markInvalid(_('The name is missing'))
    } else {
      var record = new this.store.recordType({netspec: remote.getValue()});
      record.markDirty();
      this.store.add(record);
      remote.setValue();
    }
  },
  deleteExport: function() {
    if (this.getSelectionModel().getSelected()) {
      this.store.remove(this.getSelectionModel().getSelected());
    }
  },
  changeExport: function() {
    var remote = this.getTopToolbar().getComponent('remote');
    this.getSelectionModel().getSelected().set('netspec', remote.getValue());
    remote.setValue();
  }
});

YaVDR.Component.Settings.SystemNetwork.WOLForm = Ext.extend(Ext.Window, {
  record: false,
  grid: null,
  modal: true,
  initComponent: function() {

    if(this.record) {
      this.title = _('Edit wakeup address');
    } else {
      this.title = _('New wapeup address');
    }

    this.form = new Ext.FormPanel({
      border: false,
      padding: 10,
      labelWidth: 200,
      items: [
      {
        fieldLabel: _('Name'),
        xtype: 'textfield',
        itemId: 'name',
        blankText: _('The name is missing'),
        allowBlank: false,
	anchor:'100%'
      },
      {
        fieldLabel: _('Hardware address'),
        xtype: 'textfield',
        itemId: 'address',
        maskRe: /[A-F0-9:]/i,
        regex: /^[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}$/i,
        regexText: _('Invalid MAC address'),
        blankText: _('The address is missing'),
        allowBlank: false,
	anchor:'100%'
      },
      {
        xtype: 'button',
        fieldLabel: '&nbsp;',
        labelSeparator: '',
        text: 'Speichern',
        listeners: {
          scope: this,
          click: function() {
            if(this.form.getComponent('name').isValid() && this.form.getComponent('address').isValid()) {
              if(this.record) {
                this.record.set('name', this.form.getComponent('name').getValue());
                this.record.set('address', this.form.getComponent('address').getValue());
              } else {
                var record = new this.grid.store.recordType({
                  name: this.form.getComponent('name').getValue(),
                  address: this.form.getComponent('address').getValue()
                });
                record.markDirty();
                this.grid.store.add(record);
              }
              this.close();
            }
          }
        }
      }
    ]
    });

    this.items = [this.form]

    YaVDR.Component.Settings.SystemNetwork.WOLForm.superclass.initComponent.call(this);

    this.on('render', function() {
      if(this.record) {
        this.form.getComponent('name').setValue(this.record.data.name);
        this.form.getComponent('address').setValue(this.record.data.address);
      }
    }, this);

  }
});

YaVDR.Component.Settings.SystemNetwork.WOL = Ext.extend(Ext.grid.GridPanel, {
  autoScroll: true,
  loadMask: true,
  title: 'Wake on LAN',
  stripeRows: true,
  autoExpandColumn: 'name',
  infoText: _('You can define mac addresses for wake on lan. (format: XX:XX:XX:XX:XX:XX)'),
  initComponent: function() {

    this.viewConfig = {
      forceFit: true
    };

    this.sm = new Ext.grid.RowSelectionModel({ singleSelect:true });

    this.tbar = [
      {
        icon: '/static/images/icons/socket--plus.png',
        text: _('Add'),
        scope: this,
        handler: function() {
          this.openForm();
        }
      },
      {
        icon: '/static/images/icons/socket--arrow.png',
        text: _('Save'),
        scope: this,
        handler: this.saveAddresses
      }

    ];

    this.columns = [
      {
        dataIndex: 'name',
        header: _('Name')
      }, {
        dataIndex: 'address',
        header: _('Hardware address')
      }
    ];

    this.store = new Ext.data.JsonStore({
      url: '/admin/get_wol_list',
      root: 'rows',
      fields: ['address', 'name']
    });

    YaVDR.Component.Settings.SystemNetwork.WOL.superclass.initComponent.call(this);

    this.on('rowcontextmenu', this.onRowContextMenu, this);	
    this.on('render', function() {
      this.store.reload();
    }, this);
  },
  onRowContextMenu: function(grid, index, e) {
    e.stopEvent();
    var record = grid.getStore().getAt(index);
    grid.getSelectionModel().selectRow(index);
    var contextMenu = new Ext.menu.Menu({
      items: [
        {
          text: 'Ändern',
          icon: '/static/images/icons/socket--pencil.png',
          scope: this,
          record: record,
          handler: function(e) {
            this.openForm(e.record);
          }
        },
        {
          text: 'Löschen',
          icon: '/static/images/icons/socket--minus.png',
          scope: this,
          handler: function(btn, e) {
            Ext.Msg.confirm(_('Delete'), _('Delete adress?'), function(btn) {
              if (btn == 'yes') {
                grid.getStore().remove(record);
              }
            })
          }
        }
      ]
    });
    // show
    contextMenu.showAt(e.getXY());
  },

  saveAddresses: function() {
    var names = [];
    var addresses = [];
    this.loadMask.show()
    Ext.each(this.store.getRange(), function(k) {
      names.push(k.data.name);
      addresses.push(k.data.address);
    }, this);

    params = {};
    if (addresses.length > 0) {
      params.names = names;
      params.addresses = addresses;
    }

    Ext.Ajax.request({
      scope: this,
      url: '/admin/set_wol_list',
      method:  'POST',
      params: params,
      success: function(xhr) {
        this.loadMask.hide();
        this.store.reload();
      },
      failure:function(form, action) {
        this.loadMask.hide();
      }
    })
  },

  openForm: function(record) {
    (new YaVDR.Component.Settings.SystemNetwork.WOLForm({ record: record, grid: this })).show();
  }
});
