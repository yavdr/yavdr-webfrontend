YaVDR.Component.Settings.HwDisplay = Ext.extend(YaVDR.Component, {
  itemId: 'settings-hw-display',
  description: _('Here you can configure your display settings.'),
  title: _('Settings'),
  initComponent: function() {
    this.items = [
      new YaVDR.Component.Item({
        title: _('Display'),
        style: 'margin-bottom: 5px',
        items: new YaVDR.Component.Settings.HwDisplay.Display
      })
    ];
    YaVDR.Component.Settings.HwDisplay.superclass.initComponent.call(this);
  }
});
YaVDR.registerComponent(YaVDR.Component.Settings.HwDisplay);

YaVDR.Component.Settings.HwDisplay.Display = Ext.extend(YaVDR.Default.Form, {
  defaults: {
    xtype: 'fieldset',
    layout: 'form',
    anchor: '100%',
    defaults: {
      anchor: '100%'
    }
  },
  initComponent: function() {
    this.buttons = [
	  {
	    itemId: 'rescan',
		scope: this,
		text: _('Rescan displays'),
		handler: this.doRescan,
		icon: '/icons/fugue/monitor--plus.png'
	  }
	];
	this.items = [];
	this.disabledDev = [];

    YaVDR.Component.Settings.HwDisplay.Display.superclass.initComponent.call(this);
  },
  doSave: function() {
    this.getForm().submit({
      url: '/admin/set_x11',
      scope: this,
      success: function (form, action) {
        this.doLoad();
      }
    })
  },
  buildFrequencies: function(display, record) {
    var index = display.index;
    var item = display.itemData;

    if (display.getComponent('frequencies')) {
      display.getComponent('frequencies').destroy();
    }

    if (display.getComponent('defaultfreq')) {
      display.getComponent('defaultfreq').destroy();
    }

    var defaultFrequency = new YaVDR.DefaultFrequency({
      index: index,
      name: 'defaultfreq' + index + '_name',
      hiddenName: 'defaultfreq' + index
    });

    var checkboxes = [];
    var count = 0;
    var hasValids = false;
    for (hz in record.data.modes) {
      if (record.data.modes.hasOwnProperty(hz)) {
        ++count;
        hasValids = hasValids || (!record.data.modes[hz].interlace && !record.data.modes[hz].doublescan);
      }
    }

    for (hz in record.data.modes) {
      var mode = record.data.modes[hz];

      var isChecked = false;
      if (display.itemData.current.id == record.data.id && typeof display.itemData.current.selected != "undefined") {
        for (i = 0; i < display.itemData.current.selected.length; i++) {
          if (isChecked = (count == 1 || display.itemData.current.selected[i] == mode.id)) break;
        }
      } else {
        isChecked = ((!mode.interlace && !mode.doublescan) || count == 1 || !hasValids);
      }

      checkboxes.push(new YaVDR.FrequencyCheckbox({
        checked: isChecked,
        hz: hz,
        index: index,
        defaultFrequency: defaultFrequency,
        frequency: record.data.modes[hz]
      }));
    }

    if (typeof display.itemData.defaultfreq != 'undefined' &&
        display.itemData.current.id == record.data.id) {
      if (display.itemData.current.defaultfreq != 'nvidia-auto-select')
        defaultFrequency.setValue(display.itemData.defaultfreq);
      else {
        // select first
        defaultFrequency.setValue(defaultFrequency.store.getAt(0).data.id);
      }
    } else {
      // select first
      defaultFrequency.setValue(defaultFrequency.store.getAt(0).data.id);
    }
    display.insert(5, defaultFrequency);

    display.insert(6, {
      name: 'freq' + index,
      xtype: 'checkboxgroup',
      columns: 3,
      fieldLabel: _('Refresh rate'),
      itemId: 'frequencies',
      items: checkboxes
    });

    display.doLayout();
  },
  onModelineSelect: function(combo, record) {
    var display = this.getComponent('display_' + combo.index);

    this.buildFrequencies.call(this, display, record);
  },
  onDualHeadCheck: function(cb, checked) {
    for (index = 0; index < 3; index++) {
      var displayFieldset = this.getComponent('display_' + index);
      if (displayFieldset) {
        if (checked) {
          if (displayFieldset.getComponent('primary').getValue() == '1') {
            displayFieldset.getComponent('secondary').show().disable().setValue(false);
          } else {
            displayFieldset.getComponent('secondary').show().enable().setValue(true);
            //displayFieldset.getComponent('modeline').setValue('nvidia-auto-select');
          }
        } else {
          displayFieldset.getComponent('secondary').hide().disable().setValue(false);
        }
      }
    }
  },
  onPrimaryCheck: function(cb, checked) {
    // Deaktivere eigenen secondary und aktivere alle anderen
    if (this.getComponent('basic').getComponent('x11_dualhead').getValue()) {
      if (checked) {
        for (index = 0; index < 3; index++) {
          var displayFieldset = this.getComponent('display_' + index);
          if (displayFieldset) {
            if (cb.index != index) {
              displayFieldset.getComponent('secondary').enable();
            } else {
              displayFieldset.getComponent('secondary').disable().setValue(false);
            }
          }
        }
      }
    }
  },
  doViewPortTest: function(button) {
      var index = button.screenIndex;
      var displayFieldset = this.getComponent('display_' + index);
      if (displayFieldset) {
		  Ext.getBody().mask(_('Setting Viewport. Displays may flicker.'), 'x-mask-loading');
		  
		  var vpi = displayFieldset.getComponent('viewportin').items;
		  var vpo = displayFieldset.getComponent('viewportout').items;
	
	      Ext.Ajax.request({
		    url: '/admin/set_signal',
		    params: {
				signal: 'test-viewport',
				value: index,
				value2: displayFieldset.getComponent('devicename').getValue(),
				value3: displayFieldset.getComponent('defaultfreq').getValue(),
				value4: vpi.items[0].getValue(),
				value5: vpi.items[1].getValue(),
				value6: vpo.items[0].getValue(),
				value7: vpo.items[1].getValue(),
				value8: vpo.items[2].getValue(),
				value9: vpo.items[3].getValue()
		    },
		    //timeout: 120000,
		    method: 'GET',
		    scope: this,
		    success: function(xhr) {
		      //this.doLoad();
		      Ext.getBody().unmask();
		    },
		    failure:function() {
		      Ext.getBody().unmask();
		      Ext.Msg.alert(_('Test Viewport failed.'));
		    }
		  });
      }
  },
  renderDisplay: function(item, index) {
    var items = [];
    var connected = item.connected == 'connected';
    
    if (connected) {
	    items.push({
	      hideLabel: true,
	      xtype: 'displayfield',
	      value: _('Device') + ': ' + item.devicename + ', ' + 'modeline' + ': ' + item.current.id + ' ' + item.current.freq + ' Hz'
	    });
	
	    items.push({
	      xtype: 'hidden',
	      name: 'display' + index,
	      itemId: 'devicename',
	      value: item.devicename
	    });
	
	    items.push({
	      xtype: 'radio',
	      index: index,
	      itemId: 'primary',
	      name: 'primary',
	      fieldLabel: _('Primary'),
	      inputValue: item.devicename,
	      checked: item.primary,
	      listeners: {
	        scope: this,
	        check: this.onPrimaryCheck
	      }
	    });
	
	    items.push({
	      xtype: 'radio',
	      index: index,
	      disabled: true,
	      itemId: 'secondary',
	      name: 'secondary',
	      fieldLabel: _('Secondary'),
	      inputValue: item.devicename,
	      checked: item.secondary
	    });
	
	    var modelines = new Ext.data.JsonStore({
	      idIndex: 0,
	      fields: [
	        "id",
	        "modes"
	      ],
	      data : item.modelines
	    });
	
	    var resolution = null;
	    if (connected) {
			resolution = item.current.id;
	    } else {
	    	resolution = 'disabled';
	    }
	    items.push(new YaVDR.EasyComboBox({
	      itemId: 'modeline',
	      index: index,
	      store: modelines,
	      inputValue: 'temporal',
	      emptyText: _('Select resolution'),
	      fieldLabel: _('Resolution'),
	      hiddenName: 'modeline' + index,
	      value: resolution,
	      listeners: {
	        scope: this,
	        select: this.onModelineSelect,
	        render: function(combo) {
	          var display = this.getComponent('display_' + combo.index);
	          var record = combo.getStore().getById(combo.getValue());
	          if (record) {
	            this.buildFrequencies.call(this, display, record);
	          }
	        }
	      }
	    }));
    
        items.push({
    	    xtype: 'compositefield',
    	    itemId: 'viewportin',
    	    fieldLabel: _('ViewPortIn'),
    	    items: [{
                xtype     : 'numberfield',
                itemId    : 'vpix',
                name      : 'viewportinx' + index,
                width     : 50,
                value     : parseInt(item.viewport.in.width)
            },{
            	html: 'x'
            },{
                xtype     : 'numberfield',
                itemId    : 'vpiy',
                name      : 'viewportiny' + index,
                width     : 50,
                value     : parseInt(item.viewport.in.height)
            }]
    	});
    	
        items.push({
    	    xtype: 'compositefield',
    	    itemId: 'viewportout',
    	    fieldLabel: _('ViewPortOut'),
    	    items: [{
                xtype     : 'textfield',
                itemId    : 'vpox',
                name      : 'viewportoutx' + index,
                width     : 50,
                value     : parseInt(item.viewport.out.width)
            },{
            	html: 'x'
            },{
                xtype     : 'textfield',
                itemId    : 'vpoy',
                name      : 'viewportouty' + index,
                width     : 50,
                value     : parseInt(item.viewport.out.height)
            },{
            	html: '+'
            },{
                xtype     : 'textfield',
                itemId    : 'vpopx',
                name      : 'viewportoutplusx' + index,
                width     : 30,
                value     : parseInt(item.viewport.out.x)
            },{
            	html: '+'
            },{
                xtype     : 'textfield',
                itemId    : 'vpopy',
                name      : 'viewportoutplusy' + index,
                width     : 30,
                value     : parseInt(item.viewport.out.y)
            },{
            	xtype     : 'button',
            	itemId    : 'test',
            	screenIndex: index,
    			text      : _('Test ViewPort'),
    			listeners: {
    			    scope: this,
    		        click: function(button){
    		            this.doViewPortTest(button);
    		        }
    	        },			
    			icon      : '/icons/fugue/monitor--arrow.png'        	
            }]
    	});

        this.insert(1 + index, {
          xtype:'fieldset',
          collapsible: true,
          collapsed: false,
          index: index,
          itemData: item,
          itemId: 'display_' + index,
          title: _('Display') + ' ' + item.name + ' @ ' + item.devicename + ' (' + _('connected') + ')',
          items: items
        });
    } else {
    	this.disabledDev.push({
            xtype: 'displayfield',
            fieldLabel: _('Display'),
            name: 'display_' + index,
            value: item.name
        });
    }

  },
  doLoad: function() {
    Ext.Ajax.request({
      url: '/admin/get_x11',
      method: 'GET',
      scope: this,
      success: function(xhr) {
        var displayData = Ext.decode(xhr.responseText);
        this.removeAll(true);
        
        var basic = new Ext.form.FieldSet({
          itemId: 'basic',
          title: _('Basic'),
          items: [
            {
              disabled: true,
              itemId: 'x11_dualhead',
              name: 'x11_dualhead',
              xtype: 'checkbox',
              fieldLabel: _('Dual-Head Mode'),
              boxLabel: _('enabled'),
              inputValue: 1,
              listeners: {
                scope: this,
                check: this.onDualHeadCheck
              }
            },
            {
              itemId: 'x11_graphtft',
              name: 'x11_graphtft',
              xtype: 'checkbox',
              fieldLabel: _('GraphTFT'),
              boxLabel: _('enabled'),
              inputValue: 1,
              disabled: true
            }
          ]
        });

        var xine = new Ext.form.FieldSet({
          itemId: 'xine',
          title: _('Xine'),
          items: [
            new YaVDR.EasyComboBox({
              itemId: 'deinterlacer_hd',
              name: 'deinterlacer_hd',
              data: [
                ['bob'],
                ['half temporal'],
                ['half temporal_spatial'],
                ['temporal'],
                ['temporal_spatial']
              ],
              fieldLabel: _('Xine HD deinterlacer') + ' <small/>(' + _('default') + ': bob)</small>',
              inputValue: 'bob'
            }),
            new YaVDR.EasyComboBox({
              itemId: 'deinterlacer_sd',
              name: 'deinterlacer_sd',
              data: [
                ['bob'],
                ['half temporal'],
                ['half temporal_spatial'],
                ['temporal'],
                ['temporal_spatial']
              ],
              fieldLabel: _('Xine SD deinterlacer') + ' <small/>(' + _('default') + ': temporal)</small>',
              inputValue: 'temporal'
            })
          ]
        });
        
        this.add(basic);
        
        if (typeof displayData.system.x11.displays != "undefined") {
          Ext.each(displayData.system.x11.displays, function(item, index) {
            var display = this.getComponent('display_' + index);
            if (display) {
              display.destroy();
            }
            this.renderDisplay.call(this, item, index);
          }, this);
          
          this.add({
              xtype:'fieldset',
              collapsible: true,
              collapsed: true,
              title: _('disconnected interfaces'),
              items: this.disabledDev
            });
          this.disabledDev = [];
        }

        this.add(xine);

        this.doLayout();

        // Gibt es mehrere Displays
        if (typeof displayData.system.x11.displays == "undefined"
          || displayData.system.x11.displays.length >= 2
          //|| (yavdrwebGlobalInfo.devmode == "1")
          ) {

          // Wenn ja aktivere CheckBoxen
          var dualhead = displayData.system.x11.dualhead.enabled;
          basic.getComponent('x11_dualhead').enable().setValue(dualhead == '1');

          var graphtft = displayData.vdr.plugin.graphtft.enabled;
          basic.getComponent('x11_graphtft').enable().setValue(graphtft == '1');
        } else {
          // Disable Checkox und Update Texts
          basic.getComponent('x11_dualhead').disable().setBoxLabel(_('disabled (less than 2 displays found)'));
        }

        // Setzte Deinterlacer Settings
        xine.getComponent('deinterlacer_hd').setValue(displayData.vdr.deinterlacer.hd.type);
        xine.getComponent('deinterlacer_sd').setValue(displayData.vdr.deinterlacer.sd.type);
      }
    });
  },
  doRescan: function() {
	  Ext.getBody().mask(_('Rescan display. Displays may flicker.'), 'x-mask-loading');

      Ext.Ajax.request({
	    url: '/admin/set_signal?signal=rescan-display',
	    timeout: 120000,
	    method: 'GET',
	    scope: this,
	    success: function(xhr) {
	      this.doLoad();
	      Ext.getBody().unmask();
	    },
	    failure:function() {
	      Ext.getBody().unmask();
	      Ext.Msg.alert(_('Rescan display failed.'));
	    }
	  });
	  
  },
  onCheckDualHead: function(field, check) {
    var basic = this.getComponent('basic');
    if (check) {
      basic.getComponent('x11_graphtft').enable();
    } else {
      basic.getComponent('x11_graphtft').disable().setValue(false);
    }
  }
});


YaVDR.DefaultFrequency = Ext.extend(Ext.form.ComboBox, {
  editable: false,
  forceSelection: true,
  mode: 'local',
  triggerAction: 'all',
  valueField: 'id',
  hiddenName: 'dsdasd',
  displayField: 'label',
  itemId: 'defaultfreq',
  fieldLabel: _('Default frequency'),
  initComponent: function() {
    this.store = new Ext.data.JsonStore({
      idProperty: 'id',
      fields: ['id', 'label']
    });
    YaVDR.DefaultFrequency.superclass.initComponent.call(this);
    this.store.on('remove', this.onRecordRemove, this);
    this.on('select', this.test, this);
  },
  onRecordRemove: function(store, record, index) {
    // lösche ich die freq die aus gewählt ist nehme ich den ersten noch verfühgbaren eintrag aus store
    if (record.data.id == this.getValue()) {
      if (this.getStore().getAt(0)) {
        this.setValue(this.getStore().getAt(0).data.id);
      } else {
        this.clearValue();
      }
    }
  }
});

YaVDR.FrequencyCheckbox = Ext.extend(Ext.form.Checkbox, {
  initComponent: function() {

    var value = "000" + String(this.frequency.hz);
    this.store = this.defaultFrequency.store;
    value = value.substring(value.length - 3, value.length) + this.frequency.id;

    this.boxLabel = this.hz + (this.hz == 'auto' ? '' : 'hz')  +' ' + _('rate');
    this.name = 'freq' + this.index;
    this.inputValue = this.frequency.id;

    this.record = new this.store.recordType({id: this.inputValue, label: this.boxLabel});
    if (this.checked) {
      this.store.add(this.record);
    }

    YaVDR.FrequencyCheckbox.superclass.initComponent.call(this);

    this.on('check', this.updateFrequencyStoreOnCheck, this.store);
  },

  updateFrequencyStoreOnCheck: function(cb, checked) {
    console.log(this.store);
    if (checked) {
      this.add(cb.record);
    } else {
      this.remove(cb.record);
    }
  }
});
