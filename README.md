Bootstrap-Tab
=============
1.什么是Bootstrap-Tab?
---------------------
bootstrap-tab基于bootstrap开发，在其原bootstrap-tab的基础上进行了扩展和修改，使其能支持ajax请求页面、动态添加删除tab。

2.怎么使用Bootstrap-Tab?
-----------------------
目前只提供通过js构建tab的方法:
```html
<script src="js/bootstrap-tab.js"></script>
```
```javascript
 $('#myTab').bootstrapTab({
        onAll:function(){
            console.info('All event will trigger this.');
        },
        tabs: [
            {
                id: 'home',
                title: '主界面',
                remote: 'content1.html',
                active: true
            },
            {
                id: 'info',
                title: '个人信息',
                remote: 'content2.html'
            },
            {
                id: 'user',
                title: 'zxc',
                target:'#divContent'
            }
        ]
    });
```
3.demo
------

4.方法
------
方法列表 jQuery.fn.bootstrapTab.methods

5.事件
------
事件列表 jQuery.fn.bootstrapTab.events
<table>
    <thead>
    <tr>
        <th>Option 事件</th>
        <th>jQuery事件</th>
        <th>参数列表</th>
        <th>描述</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td>onAll</td>
            <td>all.bs.tab</td>
            <td>name:事件名<br>args:事件的参数</td>
            <td>所有事件均会触发该事件</td>
        </tr>
        <tr>
            <td>onSelect</td>
            <td>select.bs.tab</td>
            <td>id:选项卡id<br>data:选项卡数据<br>target:选项卡导航的jquery对象</td>
            <td>选中选项卡后触发</td>
        </tr>
        <tr>
            <td>onLoaded</td>
            <td>loaded.bs.tab</td>
            <td>id:选项卡id<br>data:选项卡数据<br>target:选项卡导航的jquery对象</td>
            <td>为选项卡加载好panel后触发</td>
        </tr>
        <tr>
            <td>onRemove</td>
            <td>remove.bs.tab</td>
            <td>id:选项卡id<br>data:选项卡数据<br>target:选项卡导航的jquery对象</td>
            <td>选项卡被移除后触发</td>
        </tr>
        <tr>
            <td>onRemove</td>
            <td>remove.bs.tab</td>
            <td>id:选项卡id<br>data:选项卡数据</td>
            <td>选项卡被移除后触发</td>
        </tr>
        <tr>
            <td>onCreate</td>
            <td>create.bs.tab</td>
            <td>option:选项卡配置<br>created:选项卡导航的jquery对象</td>
            <td>渲染一个选项卡后触发</td>
        </tr>
        <tr>
            <td>onPush</td>
            <td>push.bs.tab</td>
            <td>option:选项卡配置<br>pushed:选项卡导航的jquery对象</td>
            <td>用户手动添加选项卡后触发</td>
        </tr>
    </tbody>
</table>

6.选项卡参数
-----------
选项卡参数 jQuery.fn.bootstrapTab.defaults
<table>
    <thead>
    <tr>
        <th>名称</th>
        <th>类型</th>
        <th>默认</th>
        <th>描述</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td>classes</td>
            <td>String</td>
            <td>nav nav-tabs</td>
            <td>选项卡导航栏样式，可选'nav nav-pills'，可根据用户需求定制</td>
        </tr>
        <tr>
            <td>tabContentClasses</td>
            <td>String</td>
            <td>tab-content</td>
            <td>选项卡面板容器样式</td>
        </tr>
        <tr>
            <td>tabPanelClass</td>
            <td>String</td>
            <td>tab-pane</td>
            <td>选项卡面板样式</td>
        </tr>
        <tr>
            <td>activeClass</td>
            <td>String</td>
            <td>active</td>
            <td>选项卡激活时的样式，可根据用户需求定制</td>
        </tr>
        <tr>
            <td>lazyLoad</td>
            <td>Boolean</td>
            <td>true</td>
            <td>远程数据是否启用懒加载模式</td>
        </tr>
        <tr>
            <td>tabs</td>
            <td>Array</td>
            <td>[]</td>
            <td>选项卡数据</td>
        </tr>
    </tbody>
</table>

7.选项卡实例参数
---------------
选项卡参数 jQuery.fn.bootstrapTab.tabInstance
<table>
    <thead>
    <tr>
        <th>名称</th>
        <th>类型</th>
        <th>默认</th>
        <th>描述</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>String</td>
            <td>undefined</td>
            <td>选项卡唯一标识</td>
        </tr>
        <tr>
            <td>title</td>
            <td>String</td>
            <td>undefined</td>
            <td>选项卡名称</td>
        </tr>
        <tr>
            <td>remote</td>
            <td>String</td>
            <td>undefined</td>
            <td>远程html的url,远程数据优先,可在连接后追加jquery选择器</td>
        </tr>
        <tr>
            <td>target</td>
            <td>String</td>
            <td>undefined</td>
            <td>本地html选择器,使用jquery选择器</td>
        </tr>
        <tr>
            <td>active</td>
            <td>Booelan</td>
            <td>false</td>
            <td>在初始化时是否激活</td>
        </tr>
        <tr>
            <td>closeable</td>
            <td>Booelan</td>
            <td>true</td>
            <td>能否被关闭,设置为true时会在该选项卡导航按钮上出现'x'</td>
        </tr>
    </tbody>
</table>
