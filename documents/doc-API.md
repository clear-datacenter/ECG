## ECG.js文档-doc部分

**注：该文档为ECG.js中doc部分的文档，doc对象可通过ECG.doc获取。下面使用的doc对象默认为ECG.doc。**

### 1、doc.ecgDom

```javascript
ecgDom = {
	c: dom,		// ECG容器的最外层容器
	c_in: dom,	// ECG容器的次外层容器
	bc: dom,	// 作为背景的canvas元素
	fc: dom		// 作为展示心电的canvas元素
	t：dom			// ECG的缩略图容器
};
```

### doc.detailId
用于在心电图初始化的时候保存详图最外层容器的id，以便于后面在别的地方使用详图最外层容器的id。

### doc.width
ECG容器的宽度，默认为1000，可通过ECG.outUtil.setECGWH()方法设置。  
ECG.ecgDom.bc的宽度与容器的宽度相等。

### doc.height
ECG容器的高度，默认为宽度的一半，可通过ECG.outUtil.setECGWH()方法设置。  
ECG.ecgDom.bc的宽度与容器的高度相等。

### doc.fcHeight
ECG容器的高度，默认为宽度的一半，可通过ECG.outUtil.setFcWH()方法设置。

### doc.isInit
ECG对象是否被初始化过，初始值为false，在ECG.chart.init()方法被调用后会被置为true。可通过此对象监测是否初始化过ECG对象。

### doc.context
存放canvas的context，结构如下：

```javascript
context: {
	bcContext: null,
	fcContext: null
}
```

bcContext | fcContext分别为ECG.doc.ecgDom.bc｜ECG.doc.ecgDom.fc的语境context，初始值为null。

### doc.marginL
canvas左边边距，左边的边距部分用来存放解释说明性的文字。默认值为100，可通过ECG.doc.marginL获取或者设置。

### doc.tWidth
doc.ecgDom.bc元素的总宽度，该宽度为doc.width + doc.marginL。该宽度不可直接设置，可通过设置doc.width与doc.marginL来间接设置。

### doc.cellWidth
doc.ecgDom.bc中单元格的宽度。

### doc.cellHeight
doc.ecgDom.bc中单元格的高度。

doc.descriptionWordsStyle
doc.ecgDom.bc中描述三条心电图多说明文字配置，该属性是一个js对象，具体结构如下：

```javascript
descriptionWords : { 
                style    : {    // descriptionWords描述文字样式配置
                    V1  : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 1,
                        text   : 'v1',
                    },
                    V5  : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 2,
                        text   : 'v5'
                    }
                    ,
                    avF : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 3,
                        text   : 'avf'
                    },
                },
                position : 4 // 可选项, 描述文字在自己的区域内第几行, 该字段在2016_06_14_01版本中废弃
			},
```

* ifDraw: 是否画该描述文字
* color: 该描述文字的颜色
* text: 该描述文字的内容,可选参数，默认为其键值。
* position: 该属性描述每行描述文字在自己区域内的第几行处绘制，默认在第四行

### doc.rowsPerLine

doc.rowsPerLine表示每条心电图占用几行。

<h3>doc.colsPerSecond</h3>

doc.colsPerSecond表示每秒钟占用多少列。

### doc.bc

后面会将与doc.ecgDom.bc相关的样式设置等信息放到doc.bc对象中。该对象的结构如下：

```javascript
doc.bc = {
	// todo 暂时没有内容，原来的border被删除，使用doc.theme中的样式替代
}
```

### doc.rate

器械的采样频率。默认值为125.

### doc.fc

后面会将与doc.ecgDom.fc相关的样式等设置信息放到doc.fc对象中。该对象的结构如下：

```javascript
doc.fc = {
	gain: {	// 存放增益相关的配置信息
		std: 10,	// 医学标准增益：10mm/mv
		cur: 10,	// 产品中使用的默认增益：10mm/mv
		mul: 1, // 增益的放大倍数，在修改cur时会相应地修改该放大倍数的数值
	},
	ps: {		// 存放走速相关的配置信息
		std: 25,		// 医学标准走纸速度：25mm/s
		cur: 25,		// 产品中使用的默认走纸速度：25mm/s
		mul: 1, // 走速的放大倍数，在修改cur时会相应地修改该放大倍数的数值
	},
	// 该对象用于存放每条心电图当前的绘制位置。结构如下：
	coordinate: {
		v1: {
			x: 1,
			y: 160
		},
		v5: {},
		...
	},
	// 设置每个fc的宽度
	fcWidth: 6000，
	// fc的总个数，计算方法：cellWidth * colsPerSecond * 72 * doc.fc.ps.mul(走速的放大倍数)／ fcWidth
	fcNum: 3,
	// 正在绘制内容的canvas的索引
	drawIndex: 0,
	// 每条数据在x轴的跨度
	pxPerData: 2,
	// 缩放的倍数，默认为1
	scale:1
}
```

### doc.tc

该对象用于存放tc的配置信息，tc只显示一条心电的图形，所以coordinate对象中只保存一对坐标值。该对象的结构如下：

```javascript
doc.tc = {
    // 当前绘制缩略图心电的名字
    name: 'V1',
    // 心电坐标
	coordinate: {
		x: 2,
		y: 0
	}，
	// 由于一条线段绘制不完，所以需要换行，line表示当前是绘制的第几行，用于计算基线位置
	line：1，
	// 每条数据需要多少个像素表示（x轴）
	pxPerData：1,
	// 每毫伏用多少像素表示(y轴)
	pxPerMv: 15,
	// 表示每两条缩略图之间的间隔，该数值会根据缩略canvas的高度动态计算
	space：25
}
```

### doc.ecgData

存放72秒心电片段的数据，具体结构如下：

```json
ecgData = {
	result: {},
	ecgPartBlocks: [
		{
			ecgPartBlocksData: [
				[],
				[]
			],
			ecgPartBlocksHead: {
				headTime: 20160616142537,
				...
			}
		},
		...
	],
	hwLeadConfig: [
		'V1',
		'V5',
		...
	],
	avgLead: [	// 每条心电的平均值
		2.3,
		0.2,
		3.5,
		......
	]
}
```

其中hwLeadConfig中数据的排序与ecgPartBlocksData数组中数据的排序一一对应。

### doc.theme

存放当前心电的主题样式，具体结构如下：

```javascript
theme: {
	background: '',
	font: '',
	grid: '',
	line: '',
	lineWidth: 1,
	dotWidth: 1,
	optionColor: '',	// 缩略图框框的颜色以及设置
}
```

### doc.themes

新增几个备用的主题样式，具体结构如下：

```javascript
themes: {
	default: {结构同theme}，
	theme1: {结构同theme},
	......
}
```
