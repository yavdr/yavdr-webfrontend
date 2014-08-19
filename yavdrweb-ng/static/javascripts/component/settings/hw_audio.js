YaVDR.Component.Settings.HwAudio = Ext.extend(YaVDR.Component, {
  itemId: 'settings-hw-audio',
  description: _('Please select the audio output. Make your choice and press "Save". At saving VDR and the video output will be restarted in order to make your choice activ.'),
  title: _('Settings'),
  initComponent: function() {
    this.items = [
      new YaVDR.Component.Item({
        title: _('Audio'),
        items: new YaVDR.Component.Settings.HwAudio.Audio
      })
    ];
    YaVDR.Component.Settings.HwAudio.superclass.initComponent.call(this);
  }
});
YaVDR.registerComponent(YaVDR.Component.Settings.HwAudio);

YaVDR.Component.Settings.HwAudio.Audio = Ext.extend(YaVDR.Default.Form, {
  initComponent: function() {
	var me = this;
	
    this.store = new Ext.data.JsonStore({
        url: '/admin/get_sounddevices',
        autoLoad: true,
        root: 'cards',
        idProperty: 'id',
        totalProperty: "results",
        fields: ['id', 'key', 'disabled', 'alsa_address', 'card_id', 'card_name', 'device_id', 'device_index' ],
        listeners: {
        	load: function(store, records, options) {
        		if (typeof me.soundSelectiorView != 'undefined') {
            		YaVDR.getHdfValue('system.sound.alsa', function(value) {
            			this.soundSelectiorView.select("sound-selection-" + value);
            		}, me);
        		}
        	}
        }
    }, this);

    this.soundTpl = new Ext.XTemplate(
      '<tpl for=".">',
      '<tpl if="disabled == true">',
      '<div class="selection-wrap unselectable" id="sound-selection-{alsa_address}">',
      '</tpl>',
      '<tpl if="disabled == false">',
      '<div class="selection-wrap selectable" id="sound-selection-{alsa_address}">',
      '</tpl>',
      '<div class="title">{card_name} - {device_id}</div>',
      '<div class="description">Device: {device_index} - {alsa_address}</div>',
      '</div>',
      '</tpl>'
    );

    this.soundTpl.compile();

    this.soundSelectionHidden = new Ext.form.Hidden({
      name: 'value',
      value: ''
    });

    this.soundSelectiorView = new YaVDR.SelectionList({
      fieldLabel: _("Audio output"),
      hiddenField: this.soundSelectionHidden,
      tpl: this.soundTpl,
      store: this.store
    });

    this.items = [
      this.soundSelectionHidden,
      this.soundSelectiorView
    ];

    YaVDR.Component.Settings.HwAudio.Audio.superclass.initComponent.call(this);
  },
  doLoad: function() {
	  this.store.reload();
  },
  doSave: function() {
    this.getForm().submit({
      url: '/admin/set_signal?signal=change-sound'
    })
  }
});
