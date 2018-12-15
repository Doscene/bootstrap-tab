/**
 * @author doscene <doscene@outlook.com>
 * version: 1.11.1
 * https://github.com/doscene
 * TODO 重复代码抽取
 * TODO 事件
 * TODO 进一步封装option
 * TODO 控制面板的样式
 */
(function ($) {
    "use strict";
    /**
     * 构造函数
     * @param el
     * @param options
     * @constructor
     */
    var BootstrapTab = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.init();
    };
    /**
     *初始化标签，用于内部
     */
    BootstrapTab.prototype.init = function () {
        var $this = this.$el, options = this.options;

        var navs = new StringBuffer();
        navs.append('<ul class="{0}">'.place(options.classes));
        navs.append('</ul>');
        this.$navs = $(navs.toString());
        $this.append(this.$navs);

        var tabContent = new StringBuffer();
        tabContent.append('<div class="{0}">'.place(options.tabContentClasses));
        tabContent.append('</div>');
        this.$panels = $(tabContent.toString());
        $this.append(this.$panels);
        this.initInternal();
        this.initStatus();
    };
    /**
     * 初始化渲染元素，用于内部
     */
    BootstrapTab.prototype.initInternal = function () {
        var _this = this, options = this.options, tabs = options.tabs;
        $.each(tabs, function () {
            _this.createItem(this, !options.lazyLoad);
        });
    };
    /**
     * 初始化标签导航的激活状态，用于内部
     * 1.如果有多个[.active]的标签则只[active]最后一次出现[.active]的标签
     * 2.如果只有一个[.active]的标签则[active]该标签
     * 3.如果没有[.active]的标签则[active]第一个标签
     */
    BootstrapTab.prototype.initStatus = function () {
        var options = this.options;
        var lastActive = null;
        $.each(options.tabs, function () {
                var tab = $.extend(BootstrapTab.TAB_DEFAULTS, this);
                if (tab.active) {
                    lastActive = tab.id;
                }
            }
        );
        if (lastActive !== null) {
            this.select(lastActive);
        } else {
            this.select(options.tabs[0].id);
        }
    };
    /**
     * 创建标签，用于内部
     * 1.如果[load=true]或者新标签处于[active]状态则会加载标签对应的面板
     * 2.如果[!第一条]则不会加载标签对应的面板
     * 3.本方法不会重复创建id相同的标签
     * @param option   标签配置
     * @param   load    是否加载nav对应的panel
     */
    BootstrapTab.prototype.createItem = function (option, load) {
        var $navs = this.$navs, $content = this.$panels, options = this.options;
        var item = $.extend(BootstrapTab.TAB_DEFAULTS, option);
        if (!item.id || item.id.length < 0) {
            throw 'The id of tab cannot be blank.';
        }
        var exist = $navs.find('> li a[data-id="{0}"]'.place(item.id));
        if (exist.length > 0) {
            console.warn('Id({0}) duplicate ,and skip it.'.place(item.id));
            return;
        }
        var nav = new StringBuffer();
        nav.append(item.active ? '<li class="{0}">'.place(options.activeClass) : '<li>');
        nav.append('<a data-id="{0}" data-remote="{1}" data-target="{2}">'.place(item.id, item.remote, item.target));
        nav.append(item.title);
        if (item.closeable) {
            nav.append('<button type="button" style="margin-left: 10px" class="close">&times;</button>');
        }
        nav.append('</a>');
        nav.append('</li>');
        $navs.append($(nav.toString()));

        var panel = new StringBuffer();
        panel.append(item.active ? '<div class="tab-pane {0}" data-id="{1}">'.place(options.activeClass, item.id) : '<div class="tab-pane" data-id="{0}">'.place(item.id));
        var $panel = $(panel.toString());
        if (load || item.active) {
            this.loadPanel($panel);
        }
        $content.append($panel);
    };
    /**
     * 激活标签,内部使用
     * 1.用于维护标签的状态，保证最多只有一个标签[active]
     * 2.TODO   调用时过于复杂,应当进一步优化
     * @param element   被激活标签可以是[nav]或者[panel]
     * @param container 被激活标签的容器,必须以[element]的类型对应
     * @param callback  回调函数
     */
    BootstrapTab.prototype.active = function (element, container, callback) {
        var activeClass = this.options.activeClass;
        var $active = container.find('> .{0}'.place(activeClass));
        var transition = callback
            && $.support.transition
            && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

        function next() {
            $active
                .removeClass(activeClass)
                .find('> .dropdown-menu > .{0}'.place(activeClass))
                .removeClass(activeClass)
                .end();

            element
                .addClass(activeClass);

            if (transition) {
                element[0].offsetWidth;// reflow for transition
                element.addClass('in');
            } else {
                element.removeClass('fade');
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass(activeClass);
            }

            callback && callback()
        }

        //TODO  动画处理
        $active.length && transition ?
            $active
                .one('bsTransitionEnd', next)
                .emulateTransitionEnd(BootstrapTab.TRANSITION_DURATION) :
            next();
        $active.removeClass('in');
    };

    /**
     * 加载标签内容,用于内部
     * 1.以[remote]为优先，remote可以在连接后带[jquery selector] e.g.:  'foo.html  #myDiv .header'
     * 2.在没有[remote]情况下，使用标签的[target]，[target]为[jquery selector]
     * @param panel
     */
    BootstrapTab.prototype.loadPanel = function (panel) {
        var _this = this;
        var $panel = '';
        if (typeof panel === 'object') {
            $panel = $(panel);
        } else if (typeof panel === 'string') {
            $panel = this.getPanel(panel);
        }
        if (!$panel || $panel.length < 0) {
            console.warn('Fail to load content for panel.cause:{0}'.place(panel[0]));
            return;
        }
        var id = $panel.attr('data-id');
        var $nav = _this.getNav(id);
        var remote = $nav.attr('data-remote');
        var target = $nav.attr('data-target');
        if (remote) {
            $panel.load(remote);
        } else if (target) {
            this.html($(target).clone());
        }
        $panel.prop('data-loaded', true);
    };

    /**
     * 通过绑定id获取nav,用于内部
     * @param navId
     * @returns {*|number}
     */
    BootstrapTab.prototype.getNav = function (navId) {
        var $navs = this.$navs;
        var result = $navs.find('> li a[data-id="{0}"]:first'.place(navId));
        if (!result[0]) {
            console.warn('Cannot find nav with data-id equals to {0}'.place(navId));
        }
        return result;
    };
    /**
     * 通过绑定id获取panel,用于内部
     * @param panelId
     * @returns {*|number}
     */
    BootstrapTab.prototype.getPanel = function (panelId) {
        var $panels = this.$panels;
        var result = $panels.find('> .tab-pane[data-id="{0}"]'.place(panelId));
        if (!result[0]) {
            console.warn('Cannot find panel with data-id equals to {0}'.place(panelId));
        }
        return result;
    };

    /*********************************可外部使用的高级方法*********************************************/

    /**
     *选择标签，可外部调用
     * @param id 标签id
     */
    BootstrapTab.prototype.select = function (id) {
        if (typeof id !== 'string') {
            return;
        }
        var $nav = this.getNav(id);
        if ($nav.parent().hasClass(this.options.activeClass)) {
            return;
        }
        this.active($nav.parent(), this.$navs);
        var $panel = this.getPanel(id);
        if (!$panel.prop('data-loaded')) {
            this.loadPanel(id);
        }
        this.active($panel, this.$panels);
    };

    /**
     *加载面板数据，可外部调用
     * @param panelId
     */
    BootstrapTab.prototype.load = function (panelId) {
        this.loadPanel(panelId);
    };

    /**
     * 关闭标签，可外部调用
     * 1.判断被关闭的标签是否为激活状态
     * 2.如果是激活状态则选定其前一个元素或者后一个标签激活
     * 3.否则只做移除处理
     */
    BootstrapTab.prototype.remove = function (id) {
        if (!id) {
            console.warn('tabId is undefined,check your argument.');
            return;
        }
        var $nav = this.getNav(id), $panel = this.getPanel(id);
        if (!$nav || $nav.length < 0 || !$panel || $panel.length < 0) {
            console.warn('Tab with id {0} not found.'.place(id));
            return;
        }

        if ($nav.parent().hasClass(this.options.activeClass)) {
            var $next = $nav.parent().next('li');
            var $prev = $nav.parent().prev('li');
            if ($next && $next.length > 0) {
                var nid = $next.find('> a').attr('data-id');
                this.select(nid);
            } else if ($prev && $prev.length > 0) {
                var pid = $prev.find('> a').attr('data-id');
                this.select(pid);
            } else {
                console.warn('Tab is empty now');
            }
        }
        $nav.parent().remove();
        $panel.remove();
    };
    /**
     * 获取配置信息，可外部调用
     * @returns {*}
     */
    BootstrapTab.prototype.getOptions = function () {
        return this.options;
    };

    var Plugin = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);
        this.each(function () {
            var $this = $(this),
                data = $this.data('bootstrap.tab'),
                options = $.extend({}, BootstrapTab.DEFAULTS, $this.data(),
                    typeof option === 'object' && option);
            if (typeof option === 'string') {
                if ($.inArray(option, BootstrapTab.METHODS) < 0) {
                    throw new Error("Unknown method: " + option);
                }

                if (!data) {
                    return;
                }

                value = data[option].apply(data, args);

                if (option === 'destroy') {
                    $this.removeData('bootstrap.tab');
                }
            }
            if (!data) {
                data = new BootstrapTab(this, options);
                $this.data('bootstrap.tab', data);
            }
        });
        return typeof value === 'undefined' ? this : value;
    };

    /**
     * 构建的字符串缓存类，便于拼接html
     * @constructor
     */
    var StringBuffer = function () {
        this.internal = [];
    };
    StringBuffer.prototype.append = function (resource) {
        if (typeof resource === 'object') {
            this.internal.push(JSON.stringify(resource));
        } else if (typeof resource === 'undefined') {
            return this;
        } else {
            this.internal.push(resource.toString());
        }
        return this;
    };
    StringBuffer.prototype.toString = function () {
        return this.internal.join('');
    };
    /**
     * 使用字符参数替换占位符
     * @returns {String}
     */
    String.prototype.place = function () {
        if (arguments.length === 0) return this;
        var param = arguments[0], str = this;
        if (typeof(param) === 'object') {
            for (var key in param)
                str = str.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
            return str;
        } else {
            for (var i = 0; i < arguments.length; i++)
                str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
            return str;
        }
    };


    /******************************************方法注册********************************************************/
    BootstrapTab.DEFAULTS = {
        classes: 'nav nav-tabs',
        tabContentClasses: 'tab-content',
        activeClass: 'active',
        lazyLoad: true,
        tabs: []
    };
    BootstrapTab.TAB_DEFAULTS = {
        id: '',
        title: '',
        remote: '',
        target: '',
        active: false,
        closeable: true
    };
    BootstrapTab.METHODS = ['getOptions', 'remove', 'select', 'load'];

    BootstrapTab.TRANSITION_DURATION = 500;
    $.fn.bootstrapTab = Plugin;
    $.fn.bootstrapTab.constructor = BootstrapTab;
    $.fn.bootstrapTab.defaults = BootstrapTab.DEFAULTS;
    $.fn.bootstrapTab.methods = BootstrapTab.METHODS;
    var clickHandler = function (e) {
        e.preventDefault();
        var $this = $(this);
        var $target = $this.parent().parent().parent();
        Plugin.call($target, 'select', $this.attr('data-id'));
    };
    var closeClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var $target = $this.parent().parent().parent().parent();
        Plugin.call($target, 'remove', $this.parent().attr('data-id'));
    };
    $(document).on('click.bootstrap.tab', 'ul.nav-tabs >li>a', clickHandler);
    $(document).on('click.bootstrap.tab', 'ul.nav-tabs >li>a>button.close', closeClickHandler);
})(jQuery);