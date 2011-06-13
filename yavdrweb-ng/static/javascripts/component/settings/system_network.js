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


YaVDR.Component.Settings.SystemNetwork.WOL = Ext.extend(Ext.grid.GridPanel, {
  autoScroll: true,
  loadMask: true,
  title: 'Wake on LAN',
  stripeRows: true,
  autoExpandColumn: 'address',
  infoText: _('You can define mac addresses for wake on lan. (format: XX:XX:XX:XX:XX:XX)'),
  initComponent: function() {

    this.viewConfig = {
      forceFit: true
    };

    this.sm = new Ext.grid.RowSelectionModel({ singleSelect:true });

    this.tbar = [
      {
        xtype: 'textfield',
        itemId: 'address',
        maskRe: /[A-F0-9:]/i,
        regex: /^[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}$/i,
        regexText: _('Invalid MAC address'),
        blankText: _('The address is missing'),
        allowBlank: false,
        width: 300
      },
      {
        icon: '/static/images/icons/socket--plus.png',
        text: _('Add'),
        scope: this,
        handler: this.addAddress
      },
      {
        icon: '/static/images/icons/socket--pencil.png',
        text: _('Edit'),
        scope: this,
        handler: this.changeAddress
      },
      {
        icon: '/static/images/icons/socket--minus.png',
        text: _('Delete'),
        scope: this,
        handler: this.deleteAddress
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
        dataIndex: 'address'
      }
    ];

    this.store = new Ext.data.Store({
      url: '/admin/get_wol_list',
      reader: new Ext.data.ArrayReader({}, Ext.data.Record.create([
        {name: 'address'}
      ]))
    });

    YaVDR.Component.Settings.SystemNetwork.WOL.superclass.initComponent.call(this);

    this.on('rowclick', this.selectForEdit, this);
    this.on('render', function() {
      this.store.reload();
    }, this);
  },
  saveAddresses: function() {
    var addresses = [];
    this.loadMask.show()
    Ext.each(this.store.getRange(), function(k) {
      addresses.push(k.data.address);
    }, this);

    params = {};
    if (addresses.length > 0) params.addresses = addresses;

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
  selectForEdit: function(grid, rowIndex, e) {
    var record = this.store.getAt(rowIndex);
    var address = this.getTopToolbar().getComponent('address');
    address.setValue(record.data.address);
  },
  addAddress: function() {
    var address = this.getTopToolbar().getComponent('address');
    if (address.isValid()) {
      var record = new this.store.recordType({address: address.getValue()});
      record.markDirty();
      this.store.add(record);
      address.setValue();
    }
  },
  deleteAddress: function() {
    if (this.getSelectionModel().getSelected()) {
      this.store.remove(this.getSelectionModel().getSelected());
    }
  },
  changeAddress: function() {
    var address = this.getTopToolbar().getComponent('address');
    if (address.isValid()) {
      this.getSelectionModel().getSelected().set('address', address.getValue());
      address.setValue();
    }
  }
});
