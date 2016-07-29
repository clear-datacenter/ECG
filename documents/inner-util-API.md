## ECG.js文档-innerUtil部分

**注：该文档为ECG.js中innerUtil部分的文档，innerUtil对象不可获取，只能在IIFE函数内部调用。**

### innerUtil.windowToCanvas()方法

该方法用于获取鼠标相对于canvas边界，在canvas内部的坐标。

```javascript
innerUtil.windowToCanvas(canvas,x,y);

参数：
canvas: canvas对象
x: 鼠标在window中的横坐标
y: 鼠标在window中的纵坐标

返回值：
{
	x: number,	// 鼠标在canvas中的横坐标
	y: number	// 鼠标在canvas中的纵坐标
}
```

### innerUtil.checkECGContainer()方法

该方法检测ECG容器是否声明。

```javascript
innerUtil.checkECGContainer(id);

参数：
id：String		// 必填，ECG容器的id

返回值：
boolean：存在则返回true，不存在返回false
```

### innerUtil.checkThumbnailContainer()方法

该方法检测ECG缩略图容器是否声明。

```javascript
innerUtil.checkThumbnailContainer(id);

参数：
id: String	// 必填，ECG缩略图容器的id

返回值：
{boolean}: 存在则返回true，否则返回false
```

### innerUtil.createCanvas()方法

```javascript
innerUtil.createCanvas(isBc);

参数：
isBC: boolean;	// 该canvas是背景还是前景

返回值：
canvas：domObj	// 生成的dom元素
```

### innerUtil.createThumbnailC()方法

生成缩略图使用的canvas并返回。

```javascript
innerUtil.createThumbnailC();

参数：无

返回值：
{Element}: 生成的canvas元素
```

### innerUtil.setECGBackground()方法

该方法将doc.ecgDom.bc中绘制的内容导出为base64格式, 然后设置为ECG最外层容器的背景。

```javascript
innerUtil.setECGBackground();

返回值：
设置成功则返回true；
```

### innerUtil.setThumbnailBc()方法

该方法将doc.ecgDom.tc中绘制的内容导出为base64格式, 然后设置为缩略图最外层容器的背景。

```javascript
innerUtil.setThumbnailBc();

返回值：
设置成功则返回true；
```

### innerUtil.getBaseY()方法

该方法用于获取每条心电图线的起始纵坐标。该起始纵坐标表示在该心电图在整个canvas中y轴的起始位置，用该坐标值减去每次心电的震动幅度即得每次心电震动在canvas中y轴的取值（canvas坐标y轴向下为正）。

```javascript
innerUtil.getBaseY(name);

参数：
要获取的心电的名字，具体名字参见ECG.doc.descriptionWords.style中的各个键值

返回值：
baseY：number类型
```

### innerUtil.drawECG()方法

```javascript
innerUtil.drawECG(name, v);

参数：
name：要绘制的心电的名字
v：本次绘制终点心电的电压

返回值：无
```

### innerUtil.isArray()方法

```javascript
innerUtil.isArray(obj);

参数：
obj：要检测的对象

返回值：如果被检测对象为数组返回true，否则返回false
```

### innerUtil.isString()方法

```javascript
innerUtil.isString(obj);

参数：
obj：要检测的对象

返回值：如果被检测对象为字符串则返回true，否则返回false
```

### innerUtil.resetAllCoordinate()方法

该方法用于重置所有心电当前位置的坐标为初始坐标。

```javascript
innerUtil.resetAllCoordinate();

参数： 
ifY: 是否重置y坐标

返回值：
{boolean} 初始成功返回true，否则返回false。
```

### innerUtil.resetCoordinateByName()方法

该方法用于重置心电的坐标，需要指定重置心电的名字。

```javascript
innerUtil.resetCoordinateByName(name, ifY);

参数：
name：需要重置心电坐标的名字
ifY：是否需要重置y坐标

返回值：
{boolean}: 初始化成功返回true，否则返回false
```

### innerUtil.isNumber()方法

该方法用于检测入参是否为Number类型。

```javascript
innerUtil.isNumber(obj);

参数：
obj：要检测的对象

返回值：
{boolean}： 如果入参为Number类型则返回true，否则返回false
```

### innerUtil.isObject()方法

该方法用于检测入参是否为Objec类型。

```javascript
innerUtil.isObject(obj);

参数：
obj：要检测的对象

返回值：
{boolean}：如果入参为Object类型则返回true，否则返回false。
```

### innerUtil.getEcgIndex()方法

该方法用于获取对应的心电数据在ECG.doc.ecgData.ecgPartBlocks[n][ecgPartBlockData]中的位置。

```javascript
innerUtil.getEcgIndex(name);

参数：
name：要搜索的心电的名字

返回值：
{*}：找不到返回false，否则返回对应的index
```

### innerUtil.getAllDrawECG()方法

该方法用于获取所有要绘制的心电的名字，这些获取到的名字用于在doc.ecgData.hwLeadConfig中查找对应的心电数据的下标。

```javascript
innerUtil.getAllDrawECG();

参数：无

返回值：
［］：所有要绘制的心电名字的数组
```

### innerUtil.drawCols()方法

该方法用于绘制心电图背景中的列，每列的宽度读取配置信息中的doc.cellWidth属性的值，目前暂且绘制在bc canvas中，以后会考虑绘制在fc canvas中，以便于保存图片到本地。

```javascript
innerUtil.drawCols();

参数：无

返回值：无
```

### innerUtil.drawRows()方法

该方法用于绘制心电图背景中的行，每行的宽度读取配置信息中的doc.cellHeight属性的值，目前暂且绘制在bc canvas中，以后会考虑绘制在fc canvas中，以便于保存图片到本地。

```javascript
innerUtil.drawRows();

参数：无

返回值：无
```

### innerUtil.drawPoints()方法

该方法用于绘制心电图背景中的点，每个中格子会被4 ＊ 4个点分成5 ＊ 5个小格子，绘制点点位置根据cellWidth和cellHeight的数值确定，目前暂且绘制在bc canvas中，以后会考虑绘制在fc canvas中，以便于保存图片到本地。

```javascript
innerUtil.drawPoints();

参数：无

返回值：无
```

### innerUtil.drawTime()方法

该方法用于绘制当前心电的起始时间，每四秒绘制一次。

```javascript
innerUtil.drawTime(time, name);

参数：
time：要绘制的时间的字符串
name：随便一条要绘制的心电的名字，该名字用来在ECG.doc.coordinate属性中获取任一条心电当前的X轴的位置，用来确定时间的起始绘制位置

返回值：
{boolean}: 设置成功返回true
```

### innerUtil.setCInWidth()方法

该方法用于设置c_in次外层容器的宽度。

```javascript
innerUtil.setCInWidth(width);

参数：
width: 要设置的次外层容器的宽度的数值

返回值：
{boolean}: 设置成功返回true，否则返回false
```

### innerUtil.initScrollVal()方法

该方法用于初始化左右滚动的距离，如果没有入参则默认滚动doc.ecgDom.c的宽度的距离。该方法会在当前c的左右滚动距离的基础上加上或者减去要滚动的距离。

```javascript
innerUtil.initScrollVal(val, right);

参数：
val：可选参数，滚动距离
right：滚动方向是否向右，如果向左可以省略

返回值：
number｜Boolean：设置滚动距离成功或者不设置返回number，如果val设置错误会返回false
```

### innerUtil.drawThumbnailBg()方法

该方法用于绘制缩略图的边框和格子以及点，相当于缩略图的背景。

```javascript
innerUtil.drawThumbnailBg();

参数：无

返回值：
{boolean}: 设置成功返回true，绘制失败返回false
```

### innerUtil.getCoordinateInCanvas()方法

该方法根据在canvas上点击事件的位置计算该点击事件在canvas中的位置。

```javascript
innerUtil.getCoordinateInCanvas(x, y);

参数：
x：点击事件的pageX属性
y：点击事件的pageY属性

返回值：
{{x: number, y: number}}: 返回x，y
```

### innerUtil.addHandlerToTc()方法

该方法用于给doc.ecgDom.tc添加监听事件，监听事件为chart.selectTc()方法。

```javascript
innerUtil.addHandlerToTc();

参数：无

返回值：
无
```

### innerUtil.getLineNumInTc()方法

该方法根据canvas中的点击事件位置计算点击点在第几条缩略图。

```javascript
innerUtil.getLineNumInTc(y);

参数：
y：点击事件在canvas中发生的位置

返回值：
{number}: canvas中点击事件在缩略图中位于第几条缩略心电
```

### innerUtil.moveSelectedAreaIntoView()方法

该方法将缩略图选中区域的开始位置移动到视口中。

```javascript
innerUtil.moveSelectedAreaIntoView(x, lineNum);

参数：
x: 选中区域的x坐标
lineNum: 选中区域在第几条心电范围内

返回值：无
```