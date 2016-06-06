/**
 * Author:      Tao-Quixote
 * CreateTime:  16/5/26 11:10
 * Description: ECG.js主文件,主要将可以投入生产环境使用的相关方法插入该文件
 */
var ECG = (function () {
        /**
         * 存储所有跟canvas相关的参数
         */
        var doc = {
            // 存储ECG的dom元素
            ecgDom : {
                // canvas容器
                c  : {},
                // 背景 | 后面的canvas
                bc : {},
                // 心电 | 前面的canvas
                fc : {}
            },

            // 存放ECG中所有的context
            context : {
                bcContext : null,
                fcContext : null
            },

            width      : 1000,    // ECG容器的宽度
            height     : 800,     // ECG容器的高度
            marginL    : 1,      // canvas左边边距,用来存放说明性的文字
            tWidth     : 1001,     // canvas元素的总宽度
            fcWidth    : 14400,    // fc宽度
            fcHeight   : 800,     // fc高度
            cellWidth  : 40,       // 背景单元格宽度
            cellHeight : 40,       // 背景单元格高度

            lineColor        : 'orange',   // 背景线条颜色
            lineWidth        : 1,    // 背景线条宽度
            dotColor         : 'orange',     // 点的样式
            dotWidth         : 2,        // 点的大小,
            descriptionWords : {
                style    : {    // descriptionWords描述文字样式配置
                    v1    : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 1,
                        text   : 'v1',
                    },
                    v5    : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 2,
                        text   : 'v5'
                    }
                    ,
                    avf   : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 3,
                        text   : 'avf'
                    },
                    pacer : {
                        ifDraw : true,
                        color  : '#333',
                        index  : 4,
                        text   : 'pacer'
                    }
                },
                position : 4 // 可选项, 描述文字在自己的区域内第几行
            },
            // 主要存放doc.ecgDom.bc的配置信息,后面会将前面的配置逐步放到bc中
            bc               : {
                border : {
                    style : 'red',  // 边框样式
                    width : 1       // 边框宽度
                }
            },
            // 主要存放心电图当前的位置
            coordinate       : {
                v1    : {
                    x : 1,
                    y : 160
                },
                v5    : {
                    x : 1,
                    y : 360
                },
                avf   : {
                    x : 1,
                    y : 560
                },
                pacer : {
                    x : 1,
                    y : 760
                }
            },

            rowsPerLine : 5,        // 每条心电图占用几行
            isInit      : false,   // ECG对象是否初始化
            ifPoint     : true,      // ECG.ecgDom.bc是否要画点
            bcDataUrl   : null,     // ECG.ecgDom.bc绘制内容的导出的base64格式的图片

            rate : 200      // 采样频率
        };

        /**
         * 存放ECG容器的样式
         * c: 同ECG.doc.ecgDom.c
         * bc: 同ECG.doc.ecgDom.bc
         * fc: 同ECG.doc.ecgDom.fc
         */
        var css = {
            // c中存放ECG最外层容器的样式,其中的所有样式都会应用到c容器上
            c  : {
                width            : doc.tWidth + 'px',
                overflowX        : 'scroll',
                overflowY        : 'hidden',
                backgroundRepeat : 'no-repeat'
            },
            // bc中存放ECG中bc的样式,其中所有的样式都会应用到bc容器上
            bc : {
                display : 'none',
            }
        };

        /**
         * 只在函数内部使用的,不对外公开的innerUtil部分
         * @type {{}}
         */
        var innerUtil = {
            /**
             * 检测ECG容器是否声明
             * @param id
             * @returns {boolean}
             */
            checkECG : function (id) {
                var c = document.getElementById(id);
                if (c) {
                    doc.ecgDom.c = c;
                    return true;
                } else {
                    console.log('未找到ECG容器。');
                    return false;
                }
            },

            /**
             * 设置ECG容器参数,如果没有则使用默认值
             *
             * @param obj  {width: number, height: number},宽度和高度为数字
             */
            initECGProperty : function (obj) {
                if (typeof obj === 'object') {
                    // 设置ECG容器的宽度
                    if ('width' in obj) {
                        doc.ecgDom.c.width = obj.width;
                        doc.width = obj.width;
                    }
                    // 设置doc.ecgDom.bc的左边距
                    if ('marginL' in obj) {
                        doc.marginL = obj.marginL;
                    }
                    // 设置ECG容器的高度
                    if ('height' in obj) {
                        doc.ecgDom.height = obj.height;
                        doc.height = obj.height;
                    } else {
                        doc.ecgDom.height = doc.ecgDom.width / 2;
                    }

                    // 设置doc.tWidth
                    {
                        doc.tWidth = doc.width + doc.marginL;
                    }
                } else {
                    console.log('initECGProperty参数错误');
                }
            },

            /**
             * 初始化canvas,js生成canvas dom元素,设置canvas的属性并返回
             *
             * @param param   canvas配置信息
             * @param isBc 是否是心电背景
             */
            initCanvas : function (isBc) {
                var canvas = document.createElement('canvas');

                canvas.height = doc.height;

                /**
                 * 分别处理bc和fc,
                 * bc的宽度会增加doc.marginL,用来存放说明文字
                 * fc左边的边距会增加doc.marginL,便于与bc对齐,且fc的宽度来自doc.fcWidth
                 */
                if (isBc) {
                    canvas.width = doc.width + doc.marginL;
                    canvas.id = 'bc';
                } else {
                    canvas.width = doc.fcWidth;
                    canvas.style.marginLeft = doc.marginL + 'px';
                    canvas.id = 'fc';
                }

                return canvas;
            },

            /**
             * 将doc.ecgDom.bc中绘制的内容导出为base64格式,
             * 然后设置为ECG最外层容器的背景
             *
             * @returns {boolean}
             */
            setECGBackground : function () {
                doc.bcDataUrl = doc.ecgDom.bc.toDataURL();
                doc.ecgDom.c.style.backgroundImage = 'url(' + doc.bcDataUrl + ')';

                return true;
            },

            /**
             * 用于获取指定心电的起始y轴坐标
             *
             * @param name 要获取的心电的名字
             * @returns {number}
             */
            getBaseY : function (name) {
                var index = doc.descriptionWords.style[ name ].index;
                var position = doc.descriptionWords.position;
                var rowsPerLine = doc.rowsPerLine;
                var baseY = doc.cellHeight * (index * rowsPerLine -
                                              (rowsPerLine - position
                                              )
                    );

                return baseY;
            },

            /**
             * 根据传入的心电的名字在指定位置绘制指定的心电
             *
             * @param name 要绘制的心电的名字,具体参见doc.coordinate中的对象
             * @param x 终点的x坐标
             * @param y 终点的y坐标
             */
            drawECG : function (name, x, y) {
                var context = doc.context.fcContext;
                var coordinate = doc.coordinate[ name ];

                context.beginPath();
                context.moveTo(coordinate.x, coordinate.y);
                var baseY = innerUtil.getBaseY(name);
                var y = baseY - y;
                context.lineTo(x, y);

                {
                    coordinate.x = x;
                    coordinate.y = y;
                }

                context.stroke();
            }
        };

        /**
         * 工具对象,存放工具函数,可对外公开的outUtil部分
         */
        var outUtil = {
            /**
             * 设置ECG容器的宽度和高度,暂时不支持设置doc.ecgDom.fc的宽度和高度
             * 这里在设置宽度的时候会加上doc.marginL的宽度
             *
             * @param param
             */
            setECGWH : function (param) {
                if (typeof param !== 'object') {
                    console.log('setECGWH参数错误');
                    return false;
                } else {
                    var ecgDom = doc.ecgDom;
                    // 如果设置了宽度则逐个设置宽度
                    if ('width' in param) {
                        var width = param.width + doc.marginL;
                        ecgDom.bc.width = width;
                    }
                    // 如果设置高度则逐个设置高度
                    if ('height' in param) {
                        var height = param.height;
                        ecgDom.bc.height = height;
                    }
                }
            },

            /**
             * 设置ECG.doc.ecgDom.fc的宽度和高度
             * @param param
             */
            setFcWH : function (param) {
                if (typeof param !== 'object') {
                    console.log('setFcWH参数错误');
                    return false;
                } else {
                    if ('width' in param) {
                        doc.ecgDom.fc.width = param.width;
                    }
                    if ('height' in param) {
                        doc.ecgDom.fc.height = param.height;
                    }
                }
            },

            /**
             * 设置ECG容器的样式
             *
             * @param param 存放样式ECG容器样式的对象
             * @returns {boolean} 设置成功返回true,否则返回false
             */
            setStyle : function (param) {
                if (!ECG.doc.isInit) {
                    console.log('ECG对象未初始化');
                    return false;
                }

                if (typeof param !== 'object') {
                    console.log('setStyle参数错误');
                    return false;
                } else {
                    // 这里最后的s指代style
                    var keys = Object.keys(param),
                        len  = keys.length;
                    for (var i = 0; i < len; i++) {
                        var key = keys[ i ];
                        var subKeys = Object.keys(param[ key ]),
                            subLen  = subKeys.length;
                        for (var j = 0; j < subLen; j++) {
                            var subKey = subKeys[ j ];
                            ECG.doc.ecgDom[ key ].style[ subKey ] = param[ key ][ subKey ];
                        }
                    }

                    return true;
                }
            },

            /**
             * 设置bc和fc的左边距, bc的左边距用来放置说明性的文字,fc的左边距用来与bc对齐
             *
             * @param marginL
             * @returns {boolean}
             */
            setMarginL : function (marginL) {
                if (typeof marginL !== 'number') {
                    console.log('setMarginL参数错误,无效的参数');
                    return false;
                }
                doc.marginL = marginL;
                doc.ecgDom.bc.width = doc.width + marginL;
                doc.tWidth = doc.width + marginL;
                chart.drawBc();
                doc.ecgDom.fc.style.marginLeft = marginL + 'px';
                doc.ecgDom.c.style.width = doc.tWidth + 'px';

                return true;
            },

            /**
             * 设置背景中单元格的大小
             *
             * @param cw 单元格的宽度
             * @param ch 单元格的高度
             */
            setCell : function (cw, ch) {
                doc.cellWidth = cw;
                doc.cellHeight = ch;
                chart.drawBc();
            },

            /**
             * 设置左边描述性文字的样式
             *
             * @param obj 该参数的结构参照doc.descriptionWords
             * @returns {boolean} 成功返回true,否则返回false
             */
            setDescriptionWordsStyle : function (obj) {
                if (typeof obj !== 'object') {
                    console.log('The type of param must be object.');
                    return false;
                }

                var descriptionWords = doc.descriptionWords.style;
                var keys = Object.keys(obj);
                var length = keys.length;
                for (var i = 0; i < length; i++) {
                    var key = keys[ i ];
                    if (descriptionWords.hasOwnProperty(key)) {
                        var subDW = descriptionWords[ key ];
                        var subKeys = Object.keys(obj[ key ]);
                        var subLength = subKeys.length;
                        for (var j = 0; j < subLength; j++) {
                            var subKey = subKeys[ j ];
                            if (subDW.hasOwnProperty(subKey)) {
                                subDW[ subKey ] = obj[ key ][ subKey ];
                            }
                        }
                    }
                }

                if (!chart.drawBc()) {
                    return false;
                }

                return true;
            },

            /**
             * 该方法用于设置doc.ecgDom.bc中左边介绍心电的文字
             *
             * @returns {boolean}
             */
            setDescriptionWords : function () {
                var position = doc.descriptionWords.position;
                var style = doc.descriptionWords.style;
                var keys = Object.keys(style);

                // 保存原来的context
                var bcContext = doc.context.bcContext;
                bcContext.save();

                var length = keys.length;
                for (var i = 0; i < length; i++) {
                    var key = keys[ i ];
                    var subStyle = style[ key ];
                    // 判断是否绘制该说明文字
                    if (!subStyle.ifDraw) {
                        continue;
                    }
                    // 检测说明文字的位置是否正确, 正常情况position < doc.rowsPerLine
                    if (0 > (doc.rowsPerLine - position
                        )) {
                        console.log(
                            'error: the value of position is more than rowsPerLine, outUtil.setDescriptionWords');
                        continue;
                    }

                    bcContext.beginPath();
                    // 修改字体样式
                    bcContext.fillStyle = subStyle.color;
                    // x,y分别为fillText的横坐标和纵坐标
                    var x = doc.marginL;
                    var y = (subStyle.index * doc.rowsPerLine -
                             (doc.rowsPerLine - position
                             )
                            ) * doc.cellHeight;
                    bcContext.fillText(subStyle.text, x, y);
                }

                // 还原context
                bcContext.restore();

                if (!innerUtil.setECGBackground()) {
                    return false;
                }

                return true;
            },

            /**
             * 设置背景中的边框样式
             */
            setBorder : function () {
                var border = doc.bc.border;
                var context = doc.context.bcContext;
                context.beginPath();
                context.strokeStyle = border.style;
                context.strokeWidth = border.width;
                // 这里绘制边框时左边要留出doc.marginL的宽度,用来放置说明文字
                context.rect(doc.marginL - 0.5, 0, doc.width, doc.height);
                context.stroke();

                // 将绘制的内容设置为ECG最外层容器的背景
                innerUtil.setECGBackground();
            }
        };

        /**
         * 图形对象,存放跟图形相关的方法和函数
         */
        var chart = {
            /**
             * ECG初始化方法
             *
             * @param obj 存放canvas配置信息的对象
             */
            init : function (obj) {
                // 检测配置信息, obj错误则直接返回
                if (typeof obj !== 'object') {
                    console.log('配置信息错误,请以对象的形式传入配置信息。');
                    return;
                }
                // 对ECG容器进行初始化
                if ('id' in obj) {
                    // 验证是否能找到ECG容器
                    {
                        var ECG = innerUtil.checkECG(obj.id);
                        if (!ECG) {
                            return;
                        }
                    }

                    // 配置容器的参数,高度默认为宽度的一半
                    {
                        innerUtil.initECGProperty(obj);
                    }

                    // 分别生成背景和心电用的canvas
                    {
                        doc.ecgDom.bc = innerUtil.initCanvas(true);
                        doc.ecgDom.fc = innerUtil.initCanvas(false);

                        doc.ecgDom.c.appendChild(doc.ecgDom.bc);
                        doc.ecgDom.c.appendChild(doc.ecgDom.fc);
                    }

                    // 初始化doc.context.bcContext与doc.context.fcContext
                    {
                        doc.context.bcContext = doc.ecgDom.bc.getContext('2d');
                        doc.context.fcContext = doc.ecgDom.fc.getContext('2d');
                    }

                    // 标志ECG已被初始化
                    {
                        doc.isInit = true;
                    }

                    // 设置ECG容器的样式
                    {
                        outUtil.setStyle(css);
                    }
                } else {
                    console.log('配置信息错误,找不到ECG容器。');
                    return false;
                }
            },

            /**
             * 绘制doc.ecgDom.bc,
             * 并将绘制后的内容导出为base64格式的图片,然后设置为doc.ecgDom.c的背景
             *
             * @returns {boolean}
             */
            drawBc : function () {
                // todo 在绘制的时候要注意考虑doc.marginL
                var canvas     = doc.ecgDom.bc,     // 背景canvas对象
                    cellWidth  = doc.cellWidth,    // 单元格的宽度
                    cellHeight = doc.cellHeight,   // 单元格的高度
                    ifPoint    = doc.ifPoint,       // 是否绘制背景中点标志位
                    context    = doc.context.bcContext;

                // 检测canvas是否存在
                {
                    if (!canvas) {
                        console.log('drawBc参数错误,未设置canvas或者找不到指定的canvas');
                        return false;
                    }
                }

                // 先清空画布
                {
                    context.clearRect(doc.marginL, 0, doc.tWidth, doc.height);
                }
                // 绘制背景的边框
                {
                    outUtil.setBorder(context);
                }
                // 绘制背景的列
                {
                    if (!cellWidth) {
                        cellWidth = 40;
                    }
                    context.strokeStyle = doc.lineColor;
                    /**
                     * 这里i的初始值应为width+doc.marginL,
                     * 因为边框距离canvas左边距为doc.marginL,
                     */
                    var i      = cellWidth + doc.marginL,
                        tWidth = doc.width + doc.marginL,
                        num    = 1;

                    for (i; i < tWidth; i += cellWidth) {
                        if (num % 5 == 0) {
                            context.beginPath();
                            context.strokeWidth = 1;
                            context.moveTo(i, 0);
                            context.lineTo(i, doc.height);
                        } else {
                            context.beginPath();
                            context.strokeWidth = 1;
                            context.moveTo(i + 0.5, 0);
                            context.lineTo(i + 0.5, doc.height);
                        }
                        context.stroke();
                        num++;
                    }
                }
                // 绘制背景的行
                {
                    if (!cellHeight) {
                        cellHeight = width;
                    }
                    context.beginPath();
                    context.strokeStyle = doc.lineColor;
                    context.strokeWidth = doc.lineWidth;
                    var num = 1;
                    for (var j = cellHeight; j < doc.height; j += cellHeight) {
                        /**
                         * 这里行的起始位置的横坐标为doc.marginL,
                         * 因为canvas的border是从距离左边doc.marginL的地方开始画的
                         */
                        if (num % 5 != 0) {
                            context.moveTo(doc.marginL, j + 0.5);
                        } else {
                            context.moveTo(doc.marginL, j);
                        }
                        context.lineTo(doc.tWidth, j + 0.5);
                        num++;
                    }
                    context.stroke();
                }
                // 绘制背景中的点
                {
                    if (ifPoint) {
                        var dotMargin = Math.floor(doc.cellWidth / 5);
                        var context = doc.context.bcContext;
                        context.fillStyle = doc.dotColor;

                        var i = dotMargin + doc.marginL;
                        for (i; i < doc.tWidth; i += dotMargin) {
                            if (((i - doc.marginL
                                 ) % doc.cellWidth
                                ) != 0) {    // 列分隔线处不打点
                                for (var j = dotMargin; j < doc.height; j += dotMargin) {
                                    if ((j % doc.cellHeight
                                        ) != 0) {    // 行分割线处不打点
                                        context.rect(i, j, doc.dotWidth, doc.dotWidth);
                                    }
                                }
                            }
                        }
                        context.fill();
                    }
                }
                // 绘制左边说明文字
                {
                    outUtil.setDescriptionWords();
                }
                // 将doc.ecgDom.bc的内容导出为图片, 并设置为ECG最外层容器的背景
                {
                    innerUtil.setECGBackground();
                }

                return true;
            },

            drawV1    : function (x, y) {
                innerUtil.drawECG('v1', x, y);
            },
            drawV5    : function (x, y) {
                innerUtil.drawECG('v5', x, y);
            },
            drawAvf   : function (x, y) {
                innerUtil.drawECG('avf', x, y);
            },
            drawPacer : function (x, y) {
                innerUtil.drawECG('pacer', x, y);
            },

            /**
             * 绘制doc.ecgDom.fc,
             *
             * @returns {boolean}
             */
            drawFc : function (data) {
                // 每次绘制先清空fc画布
                {
                    var context = doc.context.fcContext;
                    var fc = doc.ecgDom.fc;
                    var fcWidth = fc.width;
                    var fcHeight = fc.height;
                    context.clearRect(0, 0, fcWidth, fcHeight);
                }

                // 生成测试数据存储在数组中
                {
                    var arr = [];
                    var arr2 = [];
                    var x = doc.marginL;
                    var y = 0;
                    var space = doc.cellWidth * 5 / doc.rate;
                    while (x < doc.fcWidth) {
                        y = Math.floor(Math.random() * 100);
                        arr.push(y);
                        x += space;
                    }
                }

                // 分别绘制三条心电
                {
                    var len = arr.length;

                    var x = 0; // reset x

                    for (var i = 0; i < len; i++) {
                        x += space;
                        y = arr[ i ];
                        this.drawV1(x + 0.5, y);
                        this.drawV5(x + 0.5, y);
                        this.drawAvf(x + 0.5, y);
                        this.drawPacer(x + 0.5, y);
                    }
                }

                return true;
            }
        };

        // 返回
        return {
            doc   : doc,
            css   : css,
            chart : chart,
            util  : outUtil,
        };
    }
)();
