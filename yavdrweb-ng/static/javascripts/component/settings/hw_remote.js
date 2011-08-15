YaVDR.Component.Settings.HwRemote = Ext.extend(YaVDR.Component, {
  data: {},
  itemId: 'settings-hw-remote',
  title: _('Settings'),
  description: _('Here you can configure your remote hardware.'),
  initComponent: function() {

    this.lircForm = new YaVDR.Component.Settings.HwRemote.LIRC({
      base: this
    });

    this.items = [
      new YaVDR.Component.Item({
        title: _('LIRC'),
        items: this.lircForm
      })
    ];
    YaVDR.Component.Settings.HwRemote.superclass.initComponent.call(this);
    this.on('render', this.doLoad, this);
  },

  // Global load
  doLoad: function() {
    Ext.Ajax.request({
      url: '/admin/get_lirchwdb',
      method: 'GET',
      scope: this,
      success: function(xhr) {
        var data = Ext.decode(xhr.responseText);
        this.data.lircReceiverList = data.receiverlist;
        this.data.currentLircReceiver = data.current_receiver;
        this.data.currentLircSerialPort = data.current_serial_port;
        this.lircForm.receiverStore.loadData(this.data.lircReceiverList);
      }
    });
  }
});
YaVDR.registerComponent(YaVDR.Component.Settings.HwRemote);

YaVDR.Component.Settings.HwRemote.LIRC = Ext.extend(YaVDR.Default.Form, {
  initComponent: function() {

    this.receiverStore = new Ext.data.ArrayStore({
      fields: [
        "id",
        "description",
        "driver",
        "lirc_driver",
        "hw_default",
        "lircd_conf"
      ],
      sortInfo: {
        field: 'description',
        direction: 'ASC'
      }
    });

    this.driver = new Ext.form.ComboBox({
      itemId: 'driver',
      tpl: '<tpl for="."><div ext:qtip="' +
        _("Driver") +
        ': {driver}<br/' + '>' +
        _('LIRC driver') +
        ': {lirc_driver}<br/' +
        '>' + _('HW-Default') + ': {hw_default}<' + 'br/' +
        '>' + _('Lircd-Conf') + ': {lircd_conf}" class="x-combo-list-item">{description}</div></tpl>',

      hiddenName: 'receiver_id',
      valueField: 'id',
      anchor: '100%',
      displayField:'description',
      typeAhead: true,
      forceSelection: true,
      mode: "local",
      store: this.receiverStore,
      triggerAction: 'all',
      fieldLabel: _('Receiver'),
      selectOnFocus: true
    });


    this.serialPort = new Ext.form.RadioGroup({
      itemId: 'serial_port',
      name: 'serial_port',
      columns: 1,
      fieldLabel: _('Serial port'),
      items: [
        {boxLabel: 'none', name: 'serial_port', inputValue: '', checked: true},
        {boxLabel: '/dev/ttyS0 (COM1)', name: 'serial_port', inputValue: '/dev/ttyS0'},
        {boxLabel: '/dev/ttyS1 (COM2)', name: 'serial_port', inputValue: '/dev/ttyS1'}
      ]
    });

    this.items = [
      this.driver,
      this.serialPort
    ];

    YaVDR.Component.Settings.HwRemote.LIRC.superclass.initComponent.call(this);
  },
  doSave: function() {
    this.getForm().submit({
      url: '/admin/set_lirchw'
    })
  }
});
