YaVDR.Component.Settings.HwRemote = Ext.extend(YaVDR.Component, {
  data: {},
  itemId: 'settings-hw-remote',
  title: _('Settings'),
  description: Gettext.strargs(_("The system tries to detect your remote control / IR receiver automatically. If the system recognizes your remote correctly, no manual configuration steps are necessary at all. Your remote control should just work out of the box from the moment you choose to plug in the USB receiver.\n\nIf the system is not able to recognize your remote this means that either no configuration for your remote was found in the list of the configuration files we are shipping with yaVDR or you are using a non-detectable device - for example receivers connected to the serial port. In case of a non-detectable device you can enable LIRC and configure it below.\n\nIf you own a detectable remote device - please read up %1 how to support us in making your device work out of the box. We target at improving this support with regular updates to the package"), '<a href="https://github.com/yavdr/yavdr-remote" target="_blank">' + _('here') +'</a>').replace(/\n/g, "<br/>\n"),
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
      url: '/admin/get_remote',
      method: 'GET',
      scope: this,
      success: function(xhr) {
        var data = Ext.decode(xhr.responseText);
        if(data.lirc == '1') {
          this.lircForm.active.setValue(true);
        } else {
          this.lircForm.active.setValue(false);
        }
        this.lircForm.serialPort.setValue(data.lirc_serial_port);
        this.lircForm.receiverStore.loadData(data.lirc_receiver_list);
        this.lircForm.driver.setValue(data.lirc_receiver_id);
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

      hiddenName: 'lirc_receiver_id',
      valueField: 'id',
      anchor: '100%',
      displayField:'description',
      typeAhead: true,
      forceSelection: true,
      mode: "local",
      store: this.receiverStore,
      triggerAction: 'all',
      fieldLabel: _('Receiver'),
      selectOnFocus: true,
      disabled: true
    });

    this.active = new Ext.form.Checkbox({
      itemId: 'active',
      name: 'lirc',
      fieldLabel: _('LIRC support'),
      listeners: {
        scope: this,
        check: function(cb, checked) {
          if (checked) {
            this.serialPort.enable();
            this.driver.enable();
          } else {
            this.serialPort.disable();
            this.driver.disable();
          }
        }
      }
    });

    this.serialPort = new Ext.form.RadioGroup({
      itemId: 'serial_port',
      name: 'serial_port',
      columns: 1,
      fieldLabel: _('Serial port'),
      items: [
        {boxLabel: 'none', name: 'lirc_serial_port', inputValue: '', checked: true},
        {boxLabel: '/dev/ttyS0 (COM1)', name: 'lirc_serial_port', inputValue: '/dev/ttyS0'},
        {boxLabel: '/dev/ttyS1 (COM2)', name: 'lirc_serial_port', inputValue: '/dev/ttyS1'}
      ],
      disabled: true
    });

    this.items = [
      this.active,
      this.driver,
      this.serialPort
    ];

    YaVDR.Component.Settings.HwRemote.LIRC.superclass.initComponent.call(this);
    this.un('render', this.doLoad);
  },
  doSave: function() {
    this.getForm().submit({
      url: '/admin/set_remote'
    })
  },
  doLoad: function() {
    this.base.doLoad.call(this.base);
  }
});
