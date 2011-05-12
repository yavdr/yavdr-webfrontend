YaVDR.Component.Dashboard = Ext.extend(YaVDR.Component, {
  itemId: 'dashboard',
  layout:'column',
  initComponent: function() {
    //this.padding = 5;
	this.items = [{
	  columnWidth: .5,
	  baseCls:'x-plain',

	  items: [
	    new YaVDR.Component.Dashboard.Vdr()//,
	    //new YaVDR.Component.Dashboard.Recordings()
	  ]
    },
	{
      columnWidth: .5,
      baseCls:'x-plain',
      items: [{
		frame: true,
		autoScroll: true,
		height: 150,
		anchor: '100%',
		title: _('System'),
		tools: [{
		  id: 'refresh'
		}],
	    style: 'margin: 0 0 0px 0 ',
		html: '<b>Shutdown</b>: S3 (Disabled USB-Wakeup)<br> <b>CPU</b>: 10% - <b>RAM</b>: 1024MB (169 MG frei)<br><b>Soundausgabe</b>: HDMI + Analog<br>Achtung Demo Inhalt'
      }]
    }];

    YaVDR.Component.Dashboard.superclass.initComponent.call(this);
  }
});

YaVDR.registerComponent(YaVDR.Component.Dashboard);

YaVDR.Component.Dashboard.Item = Ext.extend(Ext.Panel, {
	frame: true,
	autoScroll: true,
	anchor: '100%',
	height: 250,
	layout: 'fit',
	initComponent: function() {
	    this.tools = [{
	      id: 'refresh',
	      scope: this,
	      handler: function() {
	        this.reload();
	      }
	    }];
		YaVDR.Component.Dashboard.Item.superclass.initComponent.call(this);
	},
	reload: Ext.emptyFn
});

YaVDR.Component.Dashboard.Recordings = Ext.extend(YaVDR.Component.Dashboard.Item, {
	title: _('Recordings'),
	style: 'margin: 0 5px 0 0 ',
	initComponent: function() {

		this.store = new YaVDR.RecordingsStore({ autoLoad: true, baseParams: { limit: 10 } });

		this.gridPanel = new Ext.grid.GridPanel({
			bodyCssClass: 'frame-border',
			autoExpandColumn: 'name',
			loadMask: true,
			viewConfig: {
				forceFit: true
			},
			disableSelection: true,
			columns: [
				{ header: _('Name'), dataIndex: 'name', width: 400 },
				{ header: _('Duration'), dataIndex: 'length', width: 100 }
			],
			store: this.store
		});

		this.items = [this.gridPanel];

		YaVDR.Component.Dashboard.Recordings.superclass.initComponent.call(this);
	},
	reload: function() {
		this.store.reload();
	}
});


YaVDR.Component.Dashboard.Timers = Ext.extend(YaVDR.Component.Dashboard.Item, {
	title: _('Timers'),
	initComponent: function() {

		this.tools = [
			{
				id: 'refresh',
				scope: this,
				handler: this.reload
			}
		],

		this.store = new YaVDR.TimersStore({ autoLoad: true, baseParams: { limit: 10 } });

		this.gridPanel = new Ext.grid.GridPanel({
			bodyCssClass: 'frame-border',
			autoExpandColumn: 'name',
			loadMask: true,
			viewConfig: {
				forceFit: true
			},
			disableSelection: true,
			columns: [
				{ header: _('Name'), dataIndex: 'name', width: 400 },
				{ header: _('Start'), dataIndex: 'start', width: 100, xtype: 'datecolumn', format: 'd.m.Y H:i' }
			],
			store: this.store
		});

		this.items = [this.gridPanel];

		YaVDR.Component.Dashboard.Timers.superclass.initComponent.call(this);
	},
	reload: function() {
		this.store.reload();
	}
});
