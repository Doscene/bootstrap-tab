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
        // noinspection JSUnresolvedFunction
        this.init();
    };
    /**
     *初始化标签，用于内部
     */
    BootstrapTab.prototype.init = function () {
        this.initContainer();
        this.initTabs();
        this.initStatus();
    };
    /**
     * 初始化容器,用于内部
     */
    BootstrapTab.prototype.initContainer = function () {
        var options = this.options;
        var navs = $('<ul class="{0}"></ul>'.place(options.classes));
        this.$navs = navs.appendTo(this.$el);

        var tabContent = $('<div class="{0}"></div>'.place(options.tabContentClass));
        this.$panels = tabContent.appendTo(this.$el);
    };
    /**
     * 初始化渲染元素,用于内部
     */
    BootstrapTab.prototype.initTabs = function () {
        var that = this;
        $.each(this.options.tabs, function () {
            that.createItem(this, !that.options.lazyLoad);
        });
    };
    /**
     * 初始化标签导航的激活状态，用于内部
     * 激活规则：
     * 1.如果有多个[.active]的标签则只[active]最后一次出现[.active]的标签
     * 2.如果只有一个[.active]的标签则[active]该标签
     * 3.如果没有[.active]的标签则[active]第一个标签
     */
    BootstrapTab.prototype.initStatus = function () {
        var options = this.options;
        var lastActive = null;
        $.each(options.tabs, function () {
                var tab = $.extend(BootstrapTab.TAB_INSTANCE, this);
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
     * 事务触发
     * @param name
     */
    BootstrapTab.prototype.trigger = function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        name += '.bs.tab';
        this.options[BootstrapTab.EVENTS[name]].apply(this.options, args);
        this.$el.trigger($.Event(name), args);

        this.options.onAll(name, args);
        this.$el.trigger($.Event('all.bs.tab'), [name, args]);
    };
    /**
     * 创建标签，用于内部
     * 规则：
     * 1.如果[load=true]或者新标签处于[active]状态则会加载标签对应的面板
     * 2.如果[!第一条]则不会加载标签对应的面板
     * 3.本方法不会重复创建id相同的标签
     * @param option   标签配置
     * @param   load    是否加载nav对应的panel
     */
    BootstrapTab.prototype.createItem = function (option, load) {
        var $navs = this.$navs, $panels = this.$panels, options = this.options;
        var item = $.extend({}, BootstrapTab.TAB_INSTANCE, option);
        if (!item.id || item.id.length < 0) {
            throw 'The id of tab cannot be blank.';
        }
        var exist = $navs.find('> li a[data-id="{0}"]'.place(item.id));
        if (exist.length > 0) {
            console.warn('Duplicate id({0}) duplicate ,and skip it.'.place(item.id));
            return;
        }
        var $nav = $([item.active ? '<li class="{0}">'.place(options.activeClass) : '<li>',
            '<a data-id="{0}" data-remote="{1}" data-target="{2}" data-title="{3}" data-closeable="{4}">'.place(item.id, item.remote, item.target, item.title, item.closeable),
            item.title, item.closeable ? '<button type="button" style="margin-left: 10px" class="close">&times;</button>' : '',
            '</a></li>'].join(''));
        $navs.append($nav);

        var $panel = $(item.active ? '<div class="{0} {1}" data-id="{2}">'.place(options.tabPanelClass, options.activeClass, item.id) : '<div class="{0}" data-id="{1}">'.place(options.tabPanelClass, item.id));
        if (load || item.active || item.target) {
            this.loadPanel($panel);
        }
        $panels.append($panel);
        this.trigger('create', item, $nav);
        return $nav;
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
            element.addClass(activeClass);
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
     * 1.以[remote]为优先，remote可以在连接后附带[jquery selector] e.g.:  'foo.html  #myDiv .header'
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
        if (remote !== 'undefined') {
            $panel.load(remote);
        } else if (target !== 'undefined') {
            $panel.html($(target));
        } else {
            throw 'Remote and target both have not config.';
        }
        $panel.prop('data-loaded', true);
        this.trigger('loaded', id, $nav.data(), $nav);
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
        var result = $panels.find('> .{0}[data-id="{1}"]:first'.place(this.options.tabPanelClass, panelId));
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
        this.trigger('select', id, $nav.data(), $nav);
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
    BootstrapTab.prototype.close = function (id) {
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
        this.trigger('close', id, $nav.data());
        $nav.parent().remove();
        $panel.remove();
    };
    /**
     * 插入新标签，可外部调用
     */
    BootstrapTab.prototype.push = function (tab) {
        var option = $.extend({}, BootstrapTab.TAB_INSTANCE, tab);
        var $created = this.createItem(option, this.options.lazyLoad);
        if (option.active) {
            this.select(option.id);
        }
        this.trigger('push', option, $created);
    };


    /**
     * 获取配置信息，可外部调用
     * @returns {*}
     */
    BootstrapTab.prototype.getOptions = function () {
        return this.options;
    };
    /**
     * 获取激活标签的信息，可外部调用
     */
    BootstrapTab.prototype.getSelection = function () {
        var $navs = this.$navs;
        return $navs.find('> li.active:first a').data();
    };

    /**
     * 入口
     * @param option
     * @returns {Plugin}
     * @constructor
     */
    var Plugin = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);
        // noinspection JSUnresolvedFunction
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
     * 使用字符参数替换占位符
     * @returns {String}
     */
    String.prototype.place = function () {
        if (arguments.length === 0) return this;
        var param = arguments[0], str = this;
        if (typeof (param) === 'object') {
            for (var key in param)
                str = str.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
            return str;
        } else {
            for (var i = 0; i < arguments.length; i++)
                str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
            return str;
        }
    };


    /***********************************注册插件到jQuery和配置信息*******************************************/
    BootstrapTab.DEFAULTS = {
        classes: 'nav nav-tabs',
        tabContentClass: 'tab-content',
        tabPanelClass: 'tab-pane',
        activeClass: 'active',
        lazyLoad: true,
        tabs: [],
        onAll: function (name, args) {
            return false;
        },
        onCreate: function (option, created) {
            return false;
        },
        onSelect: function (id, data, target) {
            return false;
        },
        onLoaded: function (id, data, target) {
            return false;
        },
        onClose: function (id, data) {
            return false;
        },
        onPush: function (option, pushed) {
            return false;
        }
    };
    BootstrapTab.TAB_INSTANCE = {
        id: undefined,
        title: undefined,
        remote: undefined,
        target: undefined,
        active: false,
        closeable: true
    };
    BootstrapTab.METHODS = ['getOptions', 'close', 'select', 'load', 'getSelection', 'push'];
    BootstrapTab.EVENTS = {
        'all.bs.tab': 'onAll',
        'select.bs.tab': 'onSelect',
        'loaded.bs.tab': 'onLoaded',
        'close.bs.tab': 'onClose',
        'create.bs.tab': 'onCreate',
        'push.bs.tab': 'onPush'
    };
    BootstrapTab.TRANSITION_DURATION = 500;
    $.fn.bootstrapTab = Plugin;
    $.fn.bootstrapTab.constructor = BootstrapTab;
    $.fn.bootstrapTab.defaults = BootstrapTab.DEFAULTS;
    $.fn.bootstrapTab.tabInstance = BootstrapTab.TAB_INSTANCE;
    $.fn.bootstrapTab.methods = BootstrapTab.METHODS;
    $.fn.bootstrapTab.events = BootstrapTab.EVENTS;
    var selectHandler = function (e) {
        e.preventDefault();
        var $this = $(this);
        var $target = $this.parent().parent().parent();
        Plugin.call($target, 'select', $this.attr('data-id'));
    };
    var removeHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var $target = $this.parent().parent().parent().parent();
        Plugin.call($target, 'close', $this.parent().attr('data-id'));
    };
    $(document).on('click.bootstrap.tab', 'ul.nav >li>a', selectHandler);
    $(document).on('click.bootstrap.tab', 'ul.nav >li>a>button.close', removeHandler);
})(jQuery);