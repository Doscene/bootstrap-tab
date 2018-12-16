#Bootstrap-Tab

###1.什么是Bootstrap-Tab?
bootstrap-tab基于bootstrap开发，在其原bootstrap-tab的基础上进行了扩展和修改，使其能支持ajax请求页面、动态添加删除tab。
###2.怎么使用Bootstrap-Tab?
目前只提供通过js构建tab的方法:
```html
<script src="bootstrap-tab.js"></script>
```
```javascript
 $('#myTab').bootstrapTab({
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
###3.参数