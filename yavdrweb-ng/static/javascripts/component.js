YaVDR.Component = Ext.extend(Ext.Panel, {
  border: false ,
  header: false,
  initComponent: function() {
    YaVDR.Component.superclass.initComponent.call(this);
    if (this.title) this.insert(0, new YaVDR.Component.Header({ html: this.title }));
    if (this.description) this.insert(1, new YaVDR.Component.Item({
      title: _('Introduction'),
      cls: 'component-header',
      style: 'padding-bottom: 5px',
      html: this.description
    }));
  }
});


YaVDR.Component.Header = Ext.extend(Ext.BoxComponent, {
  height: 36,
  style: 'color: #233d6d; font-weight: bold; font-size: 1.4em; text-indent: 3px; font-family: sans-serif; padding-bottom: 5px;'
});

YaVDR.Component.Item = Ext.extend(Ext.Panel, {
  frame: true
});


Ext.namespace('Ext.ux');
Ext.ux.ImageButton = function(cfg) {
  Ext.ux.ImageButton.superclass.constructor.call(this, cfg);
};
Ext.extend(Ext.ux.ImageButton, Ext.Button, {
  onRender : function(ct, position) {
    this.disabledImgPath = this.disabledImgPath || this.imgPath;
    var tplHTML = '<div><img src="{imgPath}" border="0" width="{imgWidth}" height="{imgHeight}" qTip="{tooltip}" style="cursor: {cursor};" /><br clear="all"/>{tooltip:htmlEncode}<br/><br/></div>';
    var tpl = new Ext.Template(tplHTML);
    var btn, targs = {
            imgPath : this.disabled ? this.disabledImgPath : this.imgPath,
            imgWidth : this.imgWidth || "",
            imgHeight : this.imgHeight || "",
            imgText : this.text || "",
            cursor : this.disabled ? "default" : "pointer",
            tooltip : this.tooltip || ""
    };
    btn = tpl.append(ct, targs, true);
    btn.on("click", this.onClick, this);
    if (this.cls) {
            btn.addClass(this.cls);
    }
    this.el = btn;
    if (this.hidden) {
            this.hide();
    }
  },
  disable : function(newImgPath) {
    var replaceImgPath = newImgPath || this.disabledImgPath;
    if (replaceImgPath)
            this.el.dom.firstChild.src = re        placeImgPath;
    this.disabled = true;
  },
  enable : function(newImgPath) {
    var replaceImgPath = newImgPath || this.imgPath;
    if (replaceImgPath)
            this.el.dom.firstChild.src = replaceImgPath;
    this.disabled = false;
  }
});
Ext.reg('imagebutton', Ext.ux.ImageButton);
