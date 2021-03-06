### ECG.js文档-outUtil部分

**注：该文档为ECG.js中outUtil部分的文档，util对象可通过ECG.util获取。下面使用的outUtil对象默认为ECG.util。**

### outUtil.setStyle()方法

设置ECG容器的样式，会将参数中所有的css样式全部应用到对应的ECG容器及其子容器上。

```javascript
outUtil.setStyle(param);

参数：
param: {
	c: {
		background: 'blue'
	},
	bc: {
		background: 'red'
	}
}
注：param中的键只能是ECG.doc.ecgDom中的键，即只能设置ECG.doc.ecgDom.c、
ECG.doc.ecgDom.bc以及ECG.doc.ecgDom.fc的样式。

返回值：
boolean: true | false； 设置成功返回true，否则返回false
```

### outUtil.setCell()方法

设置doc.ecgDom.bc中单元格的大小。

```javascript
outUtil.setCell(cw, ch);

参数：
cw：number，	// 单元格的宽度
ch：number		// 单元格的高度
```

### outUtil.setDescriptionWordsStyle()方法

设置doc.ecgDom.bc中左边描述心电图的描述性文字的样式。

```javascript
outUtil.setDescriptionWordsStyle(obj);

参数：
obj = {
	v1: {
		ifDraw: true,		// 是否显示该行描述文字
		color: 'red',		// 改行描述文字的颜色，值为CSS支持的颜色字符串即可
		index: 1,			// 该行描述文字的位置
		text: 'v1'		// 该行描述文字的内容
	},
	v5: {
		...
	}
}
```

### outUtil.setDescriptionWords()方法

该方法用于设置doc.ecgDom.bc中左边介绍心电的文字。该方法不需要参数，在函数内部根据outUtil.setDescriptionWordsStyle中设置的样式进行绘制。该方法会调用innerUtil.setECGBackground方法讲绘制好的内容设置为ECG最外层容器的背景。

```javascript
outUtil.setDescriptionWords();

返回值：
boolean：true | false
```

### outUtil.setBorder()方法

该方法用于设置doc.ecgDom.bc中边框的样式，该方法在内部先在bc中重新绘制border，然后调用innerUtil.setECGBackground方法将bc中的内容导出图片并设置为ECG最外层容器的背景。该方法在内部直接调用的doc.context.bcContext，所以该方法依赖doc.context.bcContext。

```javascript
outUtil.setBorder();
```

### outUtil.setEcgData()方法

该方法用于将从服务端获取到的数据保存到ECG.doc.ecgData中，绘图方法中直接从doc.ecgData中获取相关的数据绘制心电图。

```javascript
outUtil.setEcgData(result);

参数：
result：从服务端获取到的心电数据中的result部分

返回值：
{boolean}：设置成功返回true，否则返回false
```

**注：result为服务端返回的数据中的result部分。**

### outUtil.getAllThemes()方法

该方法用于获取所有ECG主题的名字，所有主题的名字会以数组的形式返回。对于获取的主题的名字，可以通过outUtil.setTheme()方法设置主题样式。

```javascript
outUtil.getAllThemes();

参数：无

返回值：
｛Array}: 所有主题名字组成的数组
```

现有主题：default、theme1、theme2

### outUtil.setTheme()方法

该方法用于设置当前ECG的主题，主题名字可以通过outUtil.getAllThemes()方法获取。

```javascript
outUtil.setTheme(name);

参数：
name：在ECG.doc.themes中预定义好的主题的名字

返回值：
{boolean}: 设置成功返回true，否则返回false
```

### outUtil.scrollLeft()方法

该方法用于向左滚动心电图。

```javascript
outUtil.scrollLeft(val);

参数：
val：向左滚动的距离

返回值：
{boolean}: 成功返回true，否则返回false
```

### outUtil.scrollRight()方法

该方法用于向右滚动心电图。

```javascript
outUtil.scrollLeft(val);

参数：
val：向右滚动的距离

返回值：
{boolean}: 成功返回true，否则返回false
```

### outUtil.scrollTop() / outUtil.scrollBottom()方法

该方法用于上下移动心电图。

```javascript
outUtil.scrollTop();

参数：无

返回值：
{boolean}: 成功返回true，否则返回false
```
