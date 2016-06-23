## ECG.js文档-css部分

**注：该文档为ECG.js中css部分的文档，css对象可通过ECG.css获取。下面使用的css对象默认为ECG.css。**

### 总体结构

```javascript
var css = {
	c: {
	
	},
	bc: {
	
	}
};
```

### css.c

css.c对象存放ECG容器最外层的样式。

```javascript
c: {

}
```

2016-06-23: 为了兼容性，这里将最大宽度设置为doc.tWidth，同时将宽度设置为100%。

### css.bc

css.bc对象存放ECG容器中绘制背景Canvas的样式。

```javascript
bc: {
	display: none;
}
```