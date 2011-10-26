YaVDR.Component.Settings.VdrGeneric = Ext.extend(YaVDR.Component, {
  itemId: 'settings-vdr-generic',
  title: _('Settings'),
  description: _('Here you can make general setting for and around VDR.'),
  initComponent: function() {
    this.items = [
      new YaVDR.Component.Item({
        title: _('General'),
        style: 'margin-bottom: 5px',
        items: new YaVDR.Component.Settings.VdrGeneric.Setup
      }),
      new YaVDR.Component.Item({
        title: _('Lifeguard monitoring items'),
        style: 'margin-bottom: 5px',
        items: new YaVDR.Component.Settings.VdrGeneric.Lifeguard
      }),
      new YaVDR.Component.Item({
        title: _('EPG'),
        style: 'margin-bottom: 5px',
        items: new YaVDR.Component.Settings.VdrGeneric.EPG
      })
    ];
    YaVDR.Component.Settings.VdrGeneric.superclass.initComponent.call(this);
  }
});
YaVDR.registerComponent(YaVDR.Component.Settings.VdrGeneric);


YaVDR.Component.Settings.VdrGeneric.Lifeguard = Ext.extend(YaVDR.Default.Form, {
  initComponent: function() {

    this.lifeguard = {
      itemId: 'lifeguard',
      xtype: 'checkboxgroup',
      fieldLabel: _('Lifeguard'),
      columns: 2,
      defaults: {
        name: 'values'
      },
      items: [
        {
          itemId: 'aptitude',
          boxLabel: 'Aptitude',
          inputValue: 'aptitude'
        },
        {
          itemId: 'ssh',
          boxLabel: 'SSH',
          inputValue: 'ssh'
        },
        {
          itemId: 'nfs',
          boxLabel: 'NFS',
          inputValue: 'nfs'
        },
        {
          itemId: 'ftp',
          boxLabel: 'FTP',
          inputValue: 'ftp'
        },
        {
          itemId: 'smb',
          boxLabel: 'SMB',
          inputValue: 'smb'
        },
        {
          itemId: 'xbmc',
          boxLabel: 'XBMC',
          inputValue: 'xbmc'
        }
      ]
    };

    this.lifeguardHelp = {
      xtype: 'displayfield',
      value: _('VDR-Lifeguard will check the choosen items before allowing the shutdown. Please choose the items which should not be interrupted by a shutdown. Not checked means it will not block the shutdown.'),
      labelSeparator: ' '
    };

    this.items = [
      this.lifeguard,
      this.lifeguardHelp
    ];
    YaVDR.Component.Settings.VdrGeneric.Lifeguard.superclass.initComponent.call(this);
  },
  doSave: function() {
    this.getForm().submit({
      url : '/admin/set_signal?signal=change-lifeguard'
    });
  },
  doLoad: function() {
    YaVDR.getHdfTree('vdr.plugin.lifeguard.enable', function(data) {
      if (data != null) {
        if (typeof data.enable == "object") {
          for (var i = 0; i < data.enable.length; i++) {
            this.getComponent('lifeguard').items.each(function(item) {
              if (item.getItemId() == data.enable[i]) {
                item.setValue(true);
              }
            });
          }
        }
      } else {
        this.getComponent('lifeguard').items.each(function(field) {
          field.setValue(true);
        });
      }
    }, this);
  }
});


YaVDR.Component.Settings.VdrGeneric.Setup = Ext.extend(YaVDR.Default.Form, {

  updateSetup: function(value) {
    if(value == 'custom') {
      this.backendSelectorView.show();
      this.frontendSelectorView.show();
    } else {
      this.frontendSelectorView.hide();
      this.backendSelectorView.hide();
      if(value == 'xine') {
        this.frontendSelectorView.select("frontend-selection-xine");
        this.backendSelectorView.select("backend-selection-xine");
      } else if(value == 'xbmc') {
        this.frontendSelectorView.select("frontend-selection-xbmc");
        this.backendSelectorView.select("backend-selection-streaming");
      } else if(value == 'hdff') {
        this.frontendSelectorView.select("frontend-selection-disabled");
        this.backendSelectorView.select("backend-selection-hdff");
      } else if(value == 'headless') {
        this.frontendSelectorView.select("frontend-selection-disabled");
        this.backendSelectorView.select("backend-selection-streaming");
      } else {
        this.frontendSelectorView.select("frontend-selection-sxfe");
        this.backendSelectorView.select("backend-selection-xineliboutput");
      }
    }
  },

  initComponent: function() {

    this.setupStore = new Ext.data.JsonStore({
      fields: [
        { name: 'key' },
        { type: 'boolean', name: 'disabled' },
        { name: 'title' },
        { name: 'description' }
      ],
      data: [
        {
          key: 'sxfe',
          title: 'vdr-sxfe@vdr-plugin-xineliboutput',
          description: _('This choice is using the xineliboutput plugin with frontend vdr-sxfe.')
        },
        {
          key: 'xine',
          title: 'xine@vdr-plugin-xine',
          description: _('This is an alternative frontend. It is using the xine plugin using Xine for decoding.')
        },
        {
          key: 'xbmc',
          title: 'XBMC@vdr-plugin-xvdr (experimental)',
          description: _('If you want to use VDR as backend for XBMC and watch TV only in XBMC this is your choice.')
        },
        {
          key: 'hdff',
          title: 'TT-premium S2-6400 HD (experimental)',
          description: _('If you want to use VDR with a TT-premium S2-6400 HD.')
        },
        {
          key: 'headless',
          title: 'headless (yaVDR server)',
          description: _('You can choose this if you don\'t want to have any video output. This is if you want to use yavdr as server, or disable any decoding on video cards.')
        },
        {
          key: 'custom',
          title: 'custom configuration (experimental)',
          description: _('You can choose this if you want to configure an extended setup ')
        }
      ]

    });

    this.frontendStore = new Ext.data.JsonStore({
      fields: [
        { name: 'key' },
        { type: 'boolean', name: 'disabled' },
        { name: 'title' },
        { name: 'description' }
      ],
      data: [
        {
          key: 'disabled',
          title: _('Disabled')
        },
        {
          key: 'blank',
          title: _('Blank')
        },
        {
          key: 'sxfe',
          title: 'vdr-sxfe'
        },
        {
          key: 'xine',
          title: 'xine'
        },
        {
          key: 'xbmc',
          title: 'xbmc'
        }
      ]

    });

    this.backendStore = new Ext.data.JsonStore({
      fields: [
        { name: 'key' },
        { type: 'boolean', name: 'disabled' },
        { name: 'title' },
        { name: 'description' }
      ],
      data: [
        {
          key: 'disabled',
          title: _('Disabled')
        },
        {
          key: 'streaming',
          title: _('Streaming')
        },
        {
          key: 'xineliboutput',
          title: 'vdr-plugin-xineliboutput'
        },
        {
          key: 'xine',
          title: 'vdr-plugin-xine'
        },
        {
          key: 'hdff',
          title: 'TT-premium S2-6400 HD'
        },
        {
          key: 'sdff',
          title: 'TT-premium SD'
        },
        {
          key: 'pvr350',
          title: 'PVR350'
        }
      ]

    });

    this.setupTpl = new Ext.XTemplate(
      '<tpl for=".">',
      '<tpl if="disabled == true">',
      '<div class="selection-wrap unselectable" id="setup-selection-{key}">',
      '</tpl>',
      '<tpl if="disabled == false">',
      '<div class="selection-wrap selectable" id="setup-selection-{key}">',
      '</tpl>',
      '<div class="title">{title}</div>',
      '<div class="description">{description}</div>',
      '</div>',
      '</tpl>'
      );

    this.frontendTpl = new Ext.XTemplate(
      '<tpl for=".">',
      '<tpl if="disabled == true">',
      '<div class="selection-wrap unselectable" id="frontend-selection-{key}">',
      '</tpl>',
      '<tpl if="disabled == false">',
      '<div class="selection-wrap selectable" id="frontend-selection-{key}">',
      '</tpl>',
      '<div class="title">{title}</div>',
      '<div class="description">{description}</div>',
      '</div>',
      '</tpl>'
      );

    this.backendTpl = new Ext.XTemplate(
      '<tpl for=".">',
      '<tpl if="disabled == true">',
      '<div class="selection-wrap unselectable" id="backend-selection-{key}">',
      '</tpl>',
      '<tpl if="disabled == false">',
      '<div class="selection-wrap selectable" id="backend-selection-{key}">',
      '</tpl>',
      '<div class="title">{title}</div>',
      '<div class="description">{description}</div>',
      '</div>',
      '</tpl>'
      );

    this.setupTpl.compile();
    this.frontendTpl.compile();
    this.backendTpl.compile();

    this.setupSelectionHidden = new Ext.form.Hidden({
      name: 'value',
      listeners: {
        scope: this,
        change: function(element, value) {
          this.updateSetup(value);
        }
      }
    });
    this.frontendSelectionHidden = new Ext.form.Hidden({
      name: 'value2'
    });
    this.backendSelectionHidden = new Ext.form.Hidden({
      name: 'value3'
    });

    this.setupSelectorView = new YaVDR.SelectionList({
      fieldLabel: _('Setup'),
      hiddenField: this.setupSelectionHidden,
      tpl: this.setupTpl,
      store: this.setupStore
    });

    this.frontendSelectorView = new YaVDR.SelectionList({
      hidden: true,
      fieldLabel: _('Frontend'),
      hiddenField: this.frontendSelectionHidden,
      tpl: this.frontendTpl,
      store: this.frontendStore
    });

    this.backendSelectorView = new YaVDR.SelectionList({
      hidden: true,
      fieldLabel: _('Backend'),
      hiddenField: this.backendSelectionHidden,
      tpl: this.backendTpl,
      store: this.backendStore
    });

    this.x11Hud = new Ext.form.Checkbox({
      boxLabel: _('Enable HUD (Experimental)'),
      disabled: true,
      name: 'value4'
    });

    this.frontendSelectionHidden.on('change', function(obj, value) {
      if(value == 'sxfe' || value == 'blank') {
        this.setDisabled(false);
      } else {
        this.setDisabled(true);
      }
    }, this.x11Hud);

    this.items = [
      this.setupSelectionHidden,
      this.frontendSelectionHidden,
      this.backendSelectionHidden,
      this.setupSelectorView,
      this.frontendSelectorView,
      this.backendSelectorView,
      this.x11Hud
    ];

    YaVDR.Component.Settings.VdrGeneric.Setup.superclass.initComponent.call(this);
  },
  doSave: function() {
    this.getForm().submit({
      url: '/admin/set_signal?signal=change-frontend'
    });
  },

  doLoad: function() {
    YaVDR.getHdfValue(['vdr.setup', 'vdr.frontend', 'vdr.backend', 'system.x11.hud'], function(value) {
      try {
        this.setupSelectorView.select("setup-selection-" + value.vdr.setup);
      } catch(e) {
      }

      try {
        this.frontendSelectorView.select("frontend-selection-" + value.vdr.frontend);
      } catch(e) {
      }

      try {
        this.backendSelectorView.select("backend-selection-" + value.vdr.backend);
      } catch(e) {
      }

      try {
        this.x11Hud.setValue(value.system.x11.hud)
      } catch(e) {
      }

    }, this);

  }
});

YaVDR.Component.Settings.VdrGeneric.EPG = Ext.extend(YaVDR.Default.Form, {

    initComponent: function() {

        this.charsetOverrideStore = new Ext.data.JsonStore({
            fields: [
                { name: 'key' },
                { name: 'title' },
                { name: 'description' }
            ],
            data: [
                {
                    key: '',
                    title: 'None',
                    description: ''
                },
                {
                    key: 'ISO-8859-9',
                    title: 'ISO-8859-9',
                    description: _('Override incorrect not DVB compliant EPG Encoding, as send by Sky')
                }
            ]
        });

        this.charsetOverrideTpl = new Ext.XTemplate(
                        '<tpl for=".">',
                        '<div class="selection-wrap selectable" id="charset-selection-{key}">',
                        '<div class="title">{title}</div>',
                        '<div class="description">{description}</div>',
                        '</div>',
                        '</tpl>'
                        );

        this.charsetOverrideTpl.compile();

        this.charsetOverrideSelectionHidden = new Ext.form.Hidden({
            name: 'value',
            value: ''
        });

        this.charsetOverrideSelectorView = new YaVDR.SelectionList({
            fieldLabel: _('Charset override'),
            hiddenField: this.charsetOverrideSelectionHidden,
            tpl: this.charsetOverrideTpl,
            store: this.charsetOverrideStore
        });

        this.items = [
            this.charsetOverrideSelectionHidden,
            this.charsetOverrideSelectorView
        ];


        YaVDR.Component.Settings.VdrGeneric.EPG.superclass.initComponent.call(this);
    },
    doSave: function() {
        this.getForm().submit({
            url: '/admin/set_signal?signal=change-epg'
        });
    },

    doLoad: function() {
        YaVDR.getHdfValue('vdr.epg.charset_override', function(value) {
      this.charsetOverrideSelectorView.select("charset-selection-" + value);
        }, this);
    }
});
