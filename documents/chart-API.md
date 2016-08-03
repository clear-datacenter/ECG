## ECG.js文档-chart部分

**注：该文档为ECG.js中chart部分的文档，chart对象可通过ECG.chart获取。下面使用的chart对象默认为ECG.chart。**

### chart.init(obj)方法

```javascript
chart.init(obj);

参数：
obj {
	id: '',			// 必填，指定ECG的容器的id
	width: 1000,	// ECG容器宽度，默认1000
	height: 500,	// ECG容器gaodu，默认为高度的一半
}
```

### chart.initThumbnail(obj)方法

```javascript
chart.initThumbnail(obj);

参数：
obj {
	id: '',			// 必填，指定缩略图的id
}
```


### chart.drawBc()方法

该方法用户绘制ECG容器的背景，并且会将绘制好的背景导出为base64格式的图片，设置为ECG容器最外层doc.ecgDom.c的背景。该函数全部调用ECG内部封装的方法，所以没有参数。

```javascript
chart.drawBc();

参数：无

返回值：｛boolean｝
```

### chart.clearFc()方法

该方法用于将ECG.doc.context.fcContext中绘制的内容全部清空，准备绘制下一波心电

```javascript
chart.clearFc();

参数：无
该方法会在函数内部直接从ECG.doc中获取fcContext及其相关的参数。

返回值：
{{boolean}} 清空成功返回true
```

### chart.clearTc()方法

该方法用于将ECG.doc.context.tcContext中绘制的内容全部清除，准备绘制下一波心电。

```javascript
chart.clearTc();

参数： 无

返回值：
｛boolean｝：清除成功返回true，否则返回false
```

### chart.hideECG()方法

该方法用于隐藏指定的心电图线条。方法内部调用了chart.drawFc()方法，在设置后会立即重绘。

```javascript
chart.clearECG(name);

参数：
name：可以为字符串或者数组，例'aVF', ['V1', 'Pacer', 'aVF']。

返回值：
清除成功返回true，否则返回false
```

### chart.showECG()方法

该方法用于显示指定的心电图线条。方法内部调用了chart.drawFc()方法，在设置后会立即重绘。

```javascript
chart.clearECG(name);

参数：
name：可以为字符串或者数组，例'aVF', ['V1', 'Pacer', 'aVF']。

返回值：
清除成功返回true，否则返回false
```

### chart.setGain()方法

该方法用于重新设置心电的增益值，入参要求必须为数字，包括整型和浮点类型，不能是字符串形式的数字。

```javascript
chart.setGain(val);

参数：
val：要设置的新的的增益

返回值：
{boolean} 设置成功返回true，否则返回false
```

### chart.setPs()方法

该方法用于重新设置心电的走速，入参要求必须为数字，包括整型和浮点类型，不能是字符串形式的数字。

```javascript
chart.setPs(val);

参数：
val：要设置的新的走速

返回值：
{boolean} 
```

### chart.drawFc()方法

该方法用于绘制fc中各个canvas中要绘制的心电图形和心电时间。

```javascript
chart.drawFc();

参数：无

返回值：{boolean} 绘制成功返回true
```

### chart.drawTc()方法

该方法用于绘制缩略图中的指定心电的图形。

```javascript
chart.drawTc(name);

参数：
name：要绘制的心电的名字

返回值：
{boolean}: 绘制成功则返回true，否则返回false
```

### chart.drawSelectedArea()方法

该方法用于绘制绘制选中的区域。

```javascript
chart.drawSelectedArea(x, lineNum);

参数：
x：选中区域的x坐标
lineNum：选中区域在第几条缩略图范围内

返回值：无
```

### chart.drawSelectedTime()方法

该方法用于绘制绘制选中的区域的时间。

```javascript
chart.drawSelectedTime(x, lineNum, time);

参数：
x：选中区域的x坐标
lineNum：选中区域在第几条缩略图范围内
time: 要绘制的时间

返回值：无
```

### chart.selectTc(e)方法

该方法用于根据发生在doc.ecgDom.tc上的点击事件的位置，来动态的选择要展示在视口中的心电片段。

```javascript
chart.selectTc(e);

参数：
e：点击事件event

返回值：
{boolean}: 绘制成功则返回true，否则返回false
```