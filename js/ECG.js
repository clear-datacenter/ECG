/**
 * Author:      Tao-Quixote
 * CreateTime:  16/5/26 11:10
 * Description: ECG.js主文件,主要将可以投入生产环境使用的相关方法插入该文件
 */
var ECG = (function() {
        /**
         * 存储所有跟canvas相关的参数
         */
        var doc = {
            // 存储ECG的dom元素
            ecgDom : {
                // canvas容器
                c    : {},
                // canvas内层容器
                c_in : {},
                // 背景 | 后面的canvas
                bc   : null,
                // 心电 | 前面的canvas
                fc   : [],
                // 缩略图容器
                t    : null,
                // 缩略图canvas
                tc   : null
            },

            // 存放ECG中所有的context
            context : {
                bcContext : null,
                fcContext : null,
                tcContext : null
            },

            width        : 1000,    // ECG容器的宽度
            height       : 400,     // ECG容器的高度
            marginL      : 1,      // canvas左边边距,用来存放说明性的文字
            tWidth       : 1001,     // canvas元素的总宽度
            cellWidth    : 50,       // 背景单元格宽度
            cellHeight   : 50,       // 背景单元格高度
            ifReposition : true,     // 是否需要重新定位每条心电的位置
            detailId: null,             // ECG详图最外层容器的id

            descriptionWords : {
                style : {    // descriptionWords描述文字样式配置
                    V1    : {
                        ifDraw : true,
                        index  : 1,
                        text   : 'V1'
                    },
                    V5    : {
                        ifDraw : true,
                        index  : 4,
                        text   : 'V5'
                    },
                    aVF   : {
                        ifDraw : true,
                        index  : 7,
                        text   : 'aVF'
                    },
                    Pacer : {
                        ifDraw : true,
                        index  : 9,
                        text   : 'Pacer'
                    }
                }
            },
            // 主要存放doc.ecgDom.bc的配置信息,后面会将前面的配置逐步放到bc中
            bc               : {},
            // 主要存放doc.ecgDom.fc的配置信息，后面会将前面的配置逐步放到fc中
            fc               : {
                gain       : {     // 存放增益的配置信息
                    std : 10,    // 增益的标准：10mm/mv
                    cur : 10,     // 产品中的当前增益：20mm/mv,
                    mul : 1     // 增益的放大倍数，在修改产品当前增益的时候会相应地修改该放大倍数
                },
                ps         : {   // 存放走速的配置信息，ps == paper speed
                    std : 25,    // 标准走纸速度：25mm/s
                    cur : 25,    // 产品中的当前走纸速度：25mm/s,
                    mul : 1     // 走速的放大倍数，在修改产品当前走速的时候会相应地修改该放大倍数
                },
                // 主要存放心电图当前的位置
                coordinate : {
                    V1    : {
                        x : 0,
                        y : 50
                    },
                    V5    : {
                        x : 0,
                        y : 200
                    },
                    aVF   : {
                        x : 0,
                        y : 350
                    },
                    Pacer : {
                        x : 0,
                        y : 450
                    }
                },
                // 每个fc的初始宽度
                initWidth  : 3000,
                // 当前每个fc的宽度
                fcWidth    : 3000,
                // 一共需要多少个fc
                fcNum      : 6,
                drawIndex  : 0,
                // 每条数据的x轴跨度,
                // 计算方式:doc.cellWidth * doc.colsPerSecond * psMultiple / doc.rate;
                pxPerData  : 2,
                // 心电图的缩放比例
                scale      : 1
            },
            // 主要存放doc.ecgDom.tc的配置信息
            tc               : {
                // 当前绘制缩略图的心电的名字
                name       : 'V1',
                // 缩略图只绘制一条心电,所以只需要保存一个坐标
                coordinate : {
                    x : 0,
                    y : 0
                },
                // 心电要换行,表示当前心电绘制第几行,主要用于计算基线位置
                line       : 1,
                // 每个数据用多少像素表示(x轴)
                pxPerData  : 1,
                // 每毫伏用多少像素表示(y轴)
                pxPerMv    : 15,
                // 表示每两条缩略图之间的间隔
                space      : 25,
                // 选择框的宽度
                sWidth     : 200,
                // 选择框的高度
                sHeight    : 12
            },

            rowsPerLine   : 5,        // 每条心电图占用几行
            colsPerSecond : 5,   // 每秒占用几列
            isInit        : false,   // ECG对象是否初始化
            ifPoint       : true,      // ECG.ecgDom.bc是否要画点

            rate : 125,      // 采样频率

            // 存放从服务端获取到的心电片段数据
            ecgData : {
                result        : {},
                ecgPartBlocks : [],
                hwLeadConfig  : [],
                avgLead       : []
            },

            // 存放当前心电主题样式
            theme : {
                background  : '#fff',
                font        : '#000',
                grid        : '#ff859d',    // 边框及点的颜色
                line        : '#000',        // 心电图线段的颜色
                lineWidth   : 1,       // 边框的宽度
                dotWidth    : 1,         // 点的宽度
                optionColor : '#2ac8c7'
            },

            // 存放所有的配置信息
            themes : {
                default : {
                    background : '#fff',
                    font       : '#000',
                    grid       : '#ff859d',    // 边框及点的颜色
                    line       : '#000',        // 心电图线段的颜色
                    lineWidth  : 1,
                    dotWidth   : 1
                },
                theme2  : {
                    background : '#333',
                    font       : '#3ff936',
                    grid       : '#ccc',    // 边框及点的颜色
                    line       : '#3ff936', // 心电图线段的颜色
                    lineWidth  : 1,
                    dotWidth   : 1
                },
                theme3  : {
                    background : '#eff9ff',
                    font       : '#000',
                    grid       : '#ccc',    // 边框及点的颜色
                    line       : '#007cab',    // 心电图线段的颜色
                    lineWidth  : 1,
                    dotWidth   : 1
                }
            }
        };

        /**
         * 存放ECG容器的样式
         * c: 同ECG.doc.ecgDom.c
         * bc: 同ECG.doc.ecgDom.bc
         * fc: 同ECG.doc.ecgDom.fc
         */
        var css = {
            // c中存放ECG最外层容器的样式,其中的所有样式都会应用到c容器上
            c    : {
                width            : '100%',
                overflowX        : 'scroll',
                overflowY        : 'hidden',
                backgroundRepeat : 'repeat-x'
            },
            // 内层容器的样式
            c_in : {
                width    : '18000px',
                fontSize : '0px'
            },
            // bc中存放ECG中bc的样式,其中所有的样式都会应用到bc容器上
            bc   : {
                display : 'none'
            }
        };

        /**
         * 存放缩略图的样式
         *
         * @type {{t: {}, tc: {}}}
         */
        var tCss = {
            t  : {
                width  : '100%',
                height : '254px'
            },
            tc : {}
        };

        /**
         * 只在函数内部使用的,不对外公开的innerUtil部分
         * @type {{}}
         */
        var innerUtil = {
            /**
             * 检测ECG容器是否声明
             *
             * @param id
             * @returns {boolean}
             */
            checkECGContainer : function(id) {
                var c = document.getElementById(id);
                if(c) {
                    doc.ecgDom.c = c;
                    return true;
                } else {
                    console.error('未找到ECG容器。');
                    return false;
                }
            },

            /**
             * 检测缩略图容器是否声明
             *
             * @param id
             * @returns {boolean}
             */
            checkThumbnailContainer : function(id) {
                var t = document.getElementById(id);
                if(t) {
                    doc.ecgDom.t = t;
                    return true;
                } else {
                    console.error('未找到缩略图容器');
                    return false;
                }
            },

            /**
             * 生成心电详图中的canvas并返回
             *
             * @param isBc
             * @returns {Element}
             */
            createCanvas : function(isBc) {
                var canvas = document.createElement('canvas');

                canvas.height = doc.height;

                /**
                 * 分别处理bc和fc,
                 * bc的宽度会增加doc.marginL,用来存放说明文字
                 * fc左边的边距会增加doc.marginL,便于与bc对齐,且fc的宽度来自doc.fc.fcWidth
                 *
                 * 2016-06-27 背景canvas的宽度设置为doc.width的2倍
                 */
                if(isBc) {
                    canvas.width = doc.width * 2;
                    canvas.id = 'bc';
                } else {
                    canvas.width = doc.fc.fcWidth;
                    canvas.style.float = 'left';
                    canvas.className = 'fc';
                }

                return canvas;
            },

            /**
             * 生成缩略图中使用的canvas元素并返回
             *
             * @returns {*}
             */
            createThumbnailC : function() {
                if(!doc.ecgDom.t) {
                    console.error('can not find thumbnail container');
                    return false;
                }
                var c = document.createElement('canvas');
                var t = doc.ecgDom.t;
                c.width = t.clientWidth;
                c.height = parseInt(tCss.t.height);

                c.id = 'tc';

                doc.ecgDom.tc = c;

                return c;
            },

            /**
             * 将doc.ecgDom.bc中绘制的内容导出为base64格式,
             * 然后设置为ECG最外层容器的背景
             *
             * @returns {boolean}
             */
            setECGBackground : function() {
                var bcDataUrl = doc.ecgDom.bc.toDataURL();
                doc.ecgDom.c.style.backgroundImage = 'url(' + bcDataUrl + ')';

                return true;
            },

            /**
             * 将doc.ecgDom.tc中绘制的
             *
             * @returns {boolean}
             */
            setThumbnailBg : function() {
                var bcDataUrl = doc.ecgDom.tc.toDataURL();
                doc.ecgDom.t.style.backgroundImage = 'url(' + bcDataUrl + ')';

                chart.clearTc();

                return true;
            },

            /**
             * 用于获取指定心电的起始y轴坐标
             *
             * @param name 要获取的心电的名字
             * @returns {number}
             */
            getBaseY : function(name) {
                var index = doc.descriptionWords.style[name].index;

                return doc.cellHeight * index;
            },

            /**
             * 根据传入的心电的名字在指定位置绘制指定的心电
             *
             * @param name 要绘制的心电的名字,具体参见doc.fc.coordinate中的对象
             * @param v 当前要绘制线段终点的心电电压
             * @param nextLine 是否换行
             * @param nextContext 是否切换到下一个canvas
             */
            drawECG : function(name, v, nextLine, nextContext) {
                // 切换绘制下一条心电
                if(nextLine) {
                    doc.context.fcContext = document.querySelector('#fc0').getContext('2d');
                    doc.fc.drawIndex = 0;
                }
                var coordinate = doc.fc.coordinate[name];
                var gainMultiple = doc.fc.gain.mul;
                // 每条线段的x轴宽度
                var space = doc.fc.pxPerData;

                // 计算终点的坐标,同时根据终点坐标来计算当前的fcContext
                {
                    var baseY = innerUtil.getBaseY(name);
                    var destinationX = coordinate.x + space;

                    // 一个中格代表0.5mv, 所以可以通过0.5/cellHeight求得每个像素代表多少电压
                    var pixelPerMv = 0.5 / doc.cellHeight;
                    // 给定的电压转换为像素
                    var destinationY =
                            Math.floor(baseY - v / pixelPerMv * gainMultiple) + 0.5;

                    // 当前画布画到边缘时, 跳到下一个画布继续画
                    if(nextContext) {
                        this.resetCoordinateByName(name);
                        doc.fc.drawIndex++;
                        if(doc.fc.drawIndex < doc.ecgDom.fc.length) {
                            doc.context.fcContext =
                                doc.ecgDom.fc[doc.fc.drawIndex].getContext('2d');
                        }
                        destinationX = space;
                    }
                }
                // 绘制线段
                {
                    var context = doc.context.fcContext;
                    // 根据设置的缩放比例缩放心电
                    var scale = doc.fc.scale;
                    context.save();
                    context.beginPath();
                    context.lineWidth = context.lineWidth / scale;
                    context.scale(scale, scale);
                    context.strokeStyle = doc.theme.line;
                    context.moveTo(coordinate.x, coordinate.y);
                    context.lineTo(destinationX, destinationY);
                }

                // 重置当前的坐标
                {
                    coordinate.x = destinationX;
                    coordinate.y = destinationY;
                }

                context.stroke();
                context.restore();
            },

            /**
             * 检测对象是否为数组
             *
             * @param obj 要检测的对象
             * @returns {boolean} 如果为数组则返回true，否则返回false
             */
            isArray : function(obj) {
                if(obj && Object.prototype.toString.call(obj) == '[object Array]') {
                    return true;
                }

                return false;
            },

            /**
             * 检测对象是否为字符串
             * @param obj
             * @returns {boolean}
             */
            isString : function(obj) {
                if(obj && Object.prototype.toString.call(obj) == '[object String]') {
                    return true;
                }

                return false;
            },

            /**
             * 检测对象是否为数字
             * @param obj
             * @returns {boolean}
             */
            isNumber : function(obj) {
                if(obj && Object.prototype.toString.call(obj) == '[object Number]') {
                    return true;
                }

                return false;
            },

            /**
             * 判断对象是否为对象类型
             *
             * @param obj
             * @returns {boolean}
             */
            isObject : function(obj) {
                if(obj && Object.prototype.toString.call(obj) == '[object Object]') {
                    return true;
                }

                return false;
            },

            /**
             * 判断是否为闰年
             *
             * @param year
             * @returns {boolean}
             */
            isLeapYear : function(year) {
                if((year % 4 == 0
                   ) && (year % 100 != 0
                   ) || (year % 400 == 0
                   )) {
                    return true;
                }

                return false;
            },

            /**
             * 获取所有选中的要显示的心电的名字
             *
             * @param checkboxName
             * @returns {Array}e
             */
            getAllSelectedEcg : function(checkboxName) {
                var queryStr = 'input[name="' + checkboxName + '"]:checked';
                var chkArr = document.querySelectorAll(queryStr);
                var len = chkArr.length;
                var chkNames = [];
                for(var i = 0; i < len; i++) {
                    var name = chkArr[i].value;
                    chkNames.push(name);
                }

                return chkNames;
            },

            /**
             * 重置所有心电坐标,
             * ifY为true时重置Y坐标,否则Y坐标保持不变
             *
             * @param ifY
             * @returns {boolean}
             */
            resetAllCoordinate : function(ifY) {
                var coor = doc.fc.coordinate;
                var keys = Object.keys(coor);
                var len = keys.length;

                for(var i = 0; i < len; i++) {
                    var subKey = keys[i];
                    coor[subKey]['x'] = 0;
                    if(ifY) {
                        coor[subKey]['y'] =
                            doc.descriptionWords.style[subKey]['index'] * doc.cellHeight;
                    }
                }

                return true;
            },

            /**
             * 重置给定名字的心电的坐标
             * ifY: 可选参数,如果设置则会重置y坐标,否则不重置y坐标
             *
             * @param name
             * @param ifY
             * @returns {boolean}
             */
            resetCoordinateByName : function(name, ifY) {
                var coor = doc.fc.coordinate;
                if(ifY) {
                    coor[name]['y'] = 0;
                }
                coor[name]['x'] = 0;

                return true;
            },

            /**
             * 根据导连的名字查询其对应的数据在doc.ecgPartBlocks中的位置
             * @param name
             * @returns {*}
             */
            getEcgIndex : function(name) {
                if(!name || !this.isString(name)) {
                    console.error('error: parameter is wrong.');

                    return false;
                }

                return doc.ecgData.hwLeadConfig.indexOf(name);
            },

            /**
             * 获取所有要绘制的心电的名字
             *
             * @returns {Array}
             */
            getAllDrawECG : function() {
                var all = doc.descriptionWords.style;
                var keys = Object.keys(all);
                var subAll = [];
                var len = keys.length;
                for(var i = 0; i < len; i++) {
                    var key = keys[i];
                    if(all[key]['ifDraw']) {
                        subAll.push(key);
                    }
                }
                return subAll;
            },

            /**
             * 绘制背景中的列
             */
            drawCols : function() {
                var cellWidth = doc.cellWidth;    // 单元格的宽度
                var context = doc.context.bcContext;
                var scale = doc.fc.scale;
                if(!cellWidth) {
                    cellWidth = 50;
                }
                context.strokeStyle = doc.theme.grid;
                context.lineWidth = doc.theme.lineWidth;
                /**
                 * 这里i的初始值应为width+doc.marginL,
                 * 因为边框距离canvas左边距为doc.marginL,
                 */
                var i      = cellWidth * scale + doc.marginL,
                    tWidth = doc.width * 2,
                    num    = 1;

                for(i; i < tWidth; i += cellWidth * scale) {
                    if(num % doc.colsPerSecond == 0) {
                        context.beginPath();
                        context.lineWidth = 2;
                        context.moveTo(i, 0);
                        context.lineTo(i, doc.height);
                    } else {
                        context.beginPath();
                        context.lineWidth = 1;
                        context.moveTo(i + 0.5, 0);
                        context.lineTo(i + 0.5, doc.height);
                    }
                    context.stroke();
                    num++;
                }
            },

            /**
             * 绘制背景中的行
             */
            drawRows : function() {
                var cellHeight = doc.cellHeight;   // 单元格的高度
                var context = doc.context.bcContext;
                var scale = doc.fc.scale;

                if(!cellHeight) {
                    cellHeight = cellWidth;
                }
                context.beginPath();
                context.strokeStyle = doc.theme.grid;
                var num = 1;
                for(var j = cellHeight * scale; j < doc.height; j += cellHeight * scale) {
                    /**
                     * 这里行的起始位置的横坐标为doc.marginL,
                     * 因为canvas的border是从距离左边doc.marginL的地方开始画的
                     */
                    if(num % doc.rowsPerLine == 0) {
                        context.beginPath();
                        context.lineWidth = 2;
                        context.moveTo(doc.marginL, j);
                        context.lineTo(doc.width * 2, j);
                    } else {
                        context.beginPath();
                        context.lineWidth = 1;
                        context.moveTo(doc.marginL, j + 0.5);
                        context.lineTo(doc.width * 2, j + 0.5);
                    }
                    context.stroke();
                    num++;
                }
            },

            /**
             * 绘制背景中的点
             */
            drawPoints : function() {
                var ifPoint = doc.ifPoint;
                var scale = doc.fc.scale;

                if(ifPoint) {
                    var dotMargin = Math.floor(doc.cellWidth / 5) * scale;
                    var context = doc.context.bcContext;
                    context.fillStyle = doc.theme.grid;

                    var i = dotMargin + doc.marginL;
                    for(i; i < doc.width * 2; i += dotMargin) {
                        if(((i - doc.marginL
                            ) % doc.cellWidth
                           ) != 0) {    // 列分隔线处不打点
                            for(var j = dotMargin; j < doc.height; j += dotMargin) {
                                if((j % doc.cellHeight
                                   ) != 0) {    // 行分割线处不打点
                                    context.rect(i, j, doc.theme.dotWidth, doc.theme.dotWidth);
                                }
                            }
                        }
                    }
                    context.fill();
                }
            },

            /**
             * 绘制当前的心电的起始时间,
             * 这里的name属性是为了获取到任意一条心电的起始坐标,
             * 以便确定绘制心电时间的位置
             *
             * @param time
             * @param name
             * @returns {boolean}
             */
            drawTime : function(time, name) {
                var context = doc.context.fcContext;
                var coordinate = doc.fc.coordinate[name];
                var contextX = coordinate.x * doc.fc.scale;
                var contextY = 20 * doc.fc.scale;

                context.save();
                context.beginPath();
                context.fillStyle = doc.theme.font;
                context.fillText(time, contextX, contextY);
                context.restore();

                return true;
            },

            /**
             * 设置c_in次外层容器的宽度
             *
             * @param width
             * @returns {boolean}
             */
            setCInWidth : function(width) {
                if(!this.isNumber(width)) {
                    console.error('error: number is required, but ' + typeof width + ' is given.');

                    return false;
                }

                css.c_in.width = width + 'px';
                doc.ecgDom.c_in.style.width = css.c_in.width;

                return true;
            },

            /**
             * 清空c_in
             */
            emptyCIn : function() {
                var c_in = doc.ecgDom.c_in;
                var bc = doc.ecgDom.bc;
                var fc = doc.ecgDom.fc;

                // 清除c_in中原有的dom元素并生成新的dom元素
                if(bc) {
                    try {
                        c_in.removeChild(bc);
                    } catch(e) {
                        console.error(e);
                    } finally {
                        doc.ecgDom.bc = null;
                    }
                }
                // 循环清除c_in中原来存在的canvas元素
                for(var j = 0; j < fc.length; j++) {
                    try {
                        c_in.removeChild(fc[j]);
                    } catch(e) {
                        console.error(e);
                    }
                }
                doc.ecgDom.fc = [];
            },

            /**
             * 填充c_in容器
             * 该方法会先清空c_in容器,然后根据需要填充bc和fc到c_in容器中
             */
            fillCIn : function() {
                var c_in = doc.ecgDom.c_in;
                var ecgDom = doc.ecgDom;

                // 生成背景canvas并添加到c_in容器中
                ecgDom.bc = innerUtil.createCanvas(true);
                doc.context.bcContext = doc.ecgDom.bc.getContext('2d');
                c_in.appendChild(doc.ecgDom.bc);

                // 生成需要的fc canvas
                for(var i = 0; i < doc.fc.fcNum; i++) {
                    var c = innerUtil.createCanvas(false);
                    c.id = 'fc' + i;
                    ecgDom.fc.push(c);
                    ecgDom.c_in.appendChild(c);
                }
            },

            /**
             * 初始化doc.ecgDom.c左右滚动的距离
             *
             * @param val
             * @param right
             * @returns {*}
             */
            initScrollVal : function(val, right) {
                var c = doc.ecgDom.c;
                var space = 0;
                if(!val) { // 如果没有val入参则滚动doc.ecgDom.c的宽度的距离
                    if(right) {
                        space = c.scrollLeft - c.offsetWidth;
                    } else {
                        space = c.scrollLeft + c.offsetWidth;
                    }
                } else {
                    if(typeof val == 'number') {
                        if(right) {
                            space = c.scrollLeft - val;
                        } else {
                            space = c.scrollLeft + val;
                        }
                    } else {
                        console.error('number required but ' + typeof val + 'given.');

                        return false;
                    }
                }

                return space;
            },

            /**
             * 根据要绘制的心电的条数动态的定位心电的位置
             */
            repositionECG : function() {
                // 上下两个功能不需要动态定位心电的位置, 这里预判断一下
                if(!doc.ifReposition) {
                    return false;
                }
                var height     = doc.height,
                    cellHeight = doc.cellHeight,
                    style      = doc.descriptionWords.style,
                    allDrawECG = innerUtil.getAllDrawECG(),
                    num        = allDrawECG.length,
                    rows       = height / cellHeight,
                    middleRow  = Math.floor(rows / 2);

                if(1 == num % 2) {
                    var middleNum = Math.floor(num / 2);
                    var jump = (middleRow / (middleNum + 1
                        )
                    ).toFixed(1);

                    for(var i = 0; i < num; i++) {
                        if(i < middleNum) {
                            style[allDrawECG[i]]['index'] = (i + 1
                                                            ) * jump;
                        } else if(i == middleNum) {
                            style[allDrawECG[i]]['index'] = middleRow;
                        } else {
                            style[allDrawECG[i]]['index'] = middleRow + (i - middleNum
                                                                        ) * jump;
                        }
                    }
                } else {
                    var jump = parseFloat(((rows - 1
                                           ) / num
                    ).toFixed(1));
                    for(var i = 0; i < num; i++) {
                        style[allDrawECG[i]]['index'] = jump * (i + 1
                            );
                    }
                }

                this.resetAllCoordinate(true);
            },

            /**
             * 绘制缩略图的边框和背景
             *
             * @returns {boolean}
             */
            drawThumbnailBg : function() {

                var theme = doc.theme;
                var context = doc.context.tcContext;
                var tc = doc.ecgDom.tc;
                var w = tc.width;
                var h = tc.height;
                //绘制边框
                {
                    context.lineWidth = 2;
                    context.strokeStyle = theme.grid;
                    context.rect(1, 1, w - 2, h - 2);
                    context.stroke();
                }
                // 绘制格子
                {
                    context.lineWidth = 1;
                    context.strokeStyle = theme.grid;
                    // 绘制行
                    for(var i = 1.5 + doc.cellHeight; i < h; i += doc.cellHeight) {
                        context.moveTo(0, i);
                        context.lineTo(w, i);
                    }
                    for(var j = 1.5 + doc.cellWidth; j < w; j += doc.cellWidth) {
                        context.moveTo(j, 0);
                        context.lineTo(j, h);
                    }
                    context.stroke();
                }
                // 绘制点
                {
                    context.beginPath();
                    var ws = doc.cellWidth / 5;
                    var hs = doc.cellHeight / 5;
                    context.fillStyle = theme.grid;
                    for(var i = 1 + ws; i < w; i += ws) {
                        for(var j = 1 + hs; j < h; j += hs) {
                            context.rect(i, j, theme.dotWidth, theme.dotWidth);
                        }
                    }
                    context.fill();
                }

                // 将绘制的格子设置为容器的背景
                this.setThumbnailBg();

                return true;
            },

            /**
             * 根据在tc上点击事件的位置计算该点击事件在canvas中的位置
             * x,y分别为event.scrollX, event.scrollY
             *
             * @param x
             * @param y
             * @returns {{x: number, y: number}}
             */
            getCoordinateInCanvas : function(x, y) {
                var tc = doc.ecgDom.tc;
                var rect = tc.getBoundingClientRect();

                var body = document.body;
                var scrollLeft = body.scrollLeft,
                    scrollTop  = body.scrollTop;

                // IE浏览器中getBoundingClientRect()方法从(2,2)开始计算坐标,
                // 所以导致最终的计算结果比实际大了两个像素,
                // 所以这里根据document.documentElement.client属性来计算起始计算坐标

                var rectTop  = scrollTop + rect.top - document.documentElement.clientTop,
                    rectLeft = scrollLeft + rect.left - document.documentElement.clientLeft;

                return {
                    x : x - rectLeft,
                    y : y - rectTop
                }
            },

            /**
             * 给tc添加监听事件,
             * 以便选择时间段查看心电图
             */
            addHandlerToTc : function() {
                var tc = doc.ecgDom.tc;
                if(tc.addEventListener) {
                    tc.addEventListener('click', chart.selectTc);
                } else if(tc.attachEvent) {
                    tc.attachEvent('onclick', chart.selectTc);
                } else {
                    tc.onclick = chart.selectTc;
                }
            },
            /**
             * 根据canvas中的点击事件位置计算点击点在第几条缩略图
             *
             * @param y
             * @returns {Number}
             */
            getLineNumInTc : function(y) {
                return parseInt((y / doc.tc.space
                ).toFixed(0));
            },

            /**
             * 将缩略图选中区域的开始位置移动到视口中
             * x: 选中区域的x坐标
             * lineNum: 选中区域在第几条心电范围内
             *
             * @param x
             * @param lineNum
             */
            moveSelectedAreaIntoView : function(x, lineNum) {
                var tcWidth = doc.ecgDom.tc.width;
                var x = (lineNum - 1
                        ) * tcWidth + x;
                var xInFc = x * (doc.fc.pxPerData / doc.tc.pxPerData
                    ) * doc.fc.scale;
                outUtil.scrollLR(xInFc);
            },

            /**
             * 从数据中获取采集第一条数据的时间,
             * 用以计算缩略图中选中部分的起始时间
             *
             * @returns {*}
             */
            getFirstTime : function() {
                if(doc.ecgData && 'ecgPartBlocks' in doc.ecgData) {
                    return doc.ecgData.ecgPartBlocks[0].ecgPartBlockHead.headTime;
                }

                return false;
            },

            /**
             * 时间字符串与秒数相加返回时间字符串
             *
             * @param timeString
             * @param second
             * @returns {string}
             */
            timeAdd : function(timeString, second) {
                var arr = timeString.split(' ');
                var dArr = arr[0].split('-');
                var tArr = arr[1].split(':');
                var y = dArr[0];
                var M = dArr[1];
                var d = dArr[2];
                var h = tArr[0];
                var m = tArr[1];
                var s = tArr[2];

                {
                    s = parseFloat(s);
                    s += parseInt(second);
                    if(s > 59) {
                        var ms = parseInt(s / 60);
                        s = s % 60;
                    }
                    if(s < 10) {
                        s = '0' + s;
                    }
                }
                {
                    if(ms) {
                        m = parseInt(m);
                        m += ms;
                        if(m > 59) {
                            var mm = parseInt(m / 60);
                            m = m % 60;
                        }
                        if(m < 10) {
                            m = '0' + m;
                        }
                    }
                }
                {
                    if(mm) {
                        h = parseInt(h);
                        h += mm;
                        if(h > 23) {
                            var mh = parseInt(h / 24);
                            h = h % 24;
                        }
                        if(h < 10) {
                            h = '0' + h;
                        }
                    }
                }
                {
                    if(mh) {
                        d = parseInt(d);
                        M = parseInt(M);
                        d += mh;
                        var year = new Date().getFullYear();
                        var isLeapYear = this.isLeapYear(year);
                        var big = [1,
                                   3,
                                   5,
                                   7,
                                   8,
                                   10,
                                   12];
                        var small = [4,
                                     6,
                                     9,
                                     11];
                        if(M == 2 && isLeapYear) {
                            if(d > 29) {
                                var md = 1;
                                d = '01';
                            }
                        } else if(M == 2 && !isLeapYear) {
                            if(d > 28) {
                                var md = 1;
                                d = '01';
                            }
                        } else if(big.indexOf(M) >= 0) {
                            if(d > 31) {
                                var md = 1;
                                d = '01';
                            }
                        } else if(small.indexOf(M) >= 0) {
                            if(d > 30) {
                                var md = 1;
                                d = '01';
                            }
                        }
                    }
                }
                {
                    if(md) {
                        M = parseInt(M);
                        M += md;
                        if(M > 12) {
                            var mM = 1;
                            M = '01';
                        }
                    }
                }
                {
                    if(mM) {
                        y = parseInt(y);
                        y += mM;
                    }
                }

                return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s;
            },

            /**
             * 根据心电数据中第一条心电数据的时间计算缩略图中选中部分的起始时间
             * x:缩略图中选中的部分的起始坐标
             * lineNum:缩略图中选中第几条心电缩略图
             *
             * @param x
             * @param lineNum
             * @returns {*}
             */
            getSelectedTime : function(x, lineNum) {
                var firstTime = this.getFirstTime();
                if(firstTime) {
                    var xs = x + (lineNum - 1
                                 ) * doc.ecgDom.tc.width;
                    var s = parseInt(xs / doc.tc.pxPerData / doc.rate);
                    var ms = xs % (doc.tc.pxPerData * doc.rate
                        );
                    var time = this.timeAdd(firstTime, s);
                    time += ':' + ms;

                    return time;
                } else {
                    return false;
                }
            }
        };

        /**
         * 工具对象,存放工具函数,可对外公开的outUtil部分
         */
        var outUtil = {
            /**
             * 设置ECG容器的样式
             *
             * @param param 存放样式ECG容器样式的对象
             * @returns {boolean} 设置成功返回true,否则返回false
             */
            setStyle : function(param) {
                if(!ECG.doc.isInit) {
                    console.error('ECG对象未初始化');
                    return false;
                }

                if(typeof param !== 'object') {
                    console.error('setStyle参数错误');
                    return false;
                } else {
                    // 这里最后的s指代style
                    var keys = Object.keys(param),
                        len  = keys.length;
                    for(var i = 0; i < len; i++) {
                        var key = keys[i];
                        var subKeys = Object.keys(param[key]),
                            subLen  = subKeys.length;
                        for(var j = 0; j < subLen; j++) {
                            var subKey = subKeys[j];
                            ECG.doc.ecgDom[key].style[subKey] = param[key][subKey];
                        }
                    }

                    return true;
                }
            },

            /**
             * 设置背景中单元格的大小
             *
             * @param cw 单元格的宽度
             * @param ch 单元格的高度
             */
            setCell : function(cw, ch) {
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
            setDescriptionWordsStyle : function(obj) {
                if(typeof obj !== 'object') {
                    console.error('The type of param must be object.');
                    return false;
                }

                var descriptionWords = doc.descriptionWords.style;
                var keys = Object.keys(obj);
                var length = keys.length;
                for(var i = 0; i < length; i++) {
                    var key = keys[i];
                    if(descriptionWords.hasOwnProperty(key)) {
                        var subDW = descriptionWords[key];
                        var subKeys = Object.keys(obj[key]);
                        var subLength = subKeys.length;
                        for(var j = 0; j < subLength; j++) {
                            var subKey = subKeys[j];
                            if(subDW.hasOwnProperty(subKey)) {
                                subDW[subKey] = obj[key][subKey];
                            }
                        }
                    }
                }

                if(!chart.drawBc()) {
                    return false;
                }

                return true;
            },

            /**
             * 该方法用于设置doc.ecgDom.bc中左边介绍心电的文字
             *
             * @returns {boolean}
             */
            setDescriptionWords : function() {
                var style = doc.descriptionWords.style;
                var keys = Object.keys(style);

                // 保存原来的context
                var bcContext = doc.context.bcContext;
                bcContext.save();

                var length = keys.length;
                for(var i = 0; i < length; i++) {
                    var key = keys[i];
                    var subStyle = style[key];
                    // 判断是否绘制该说明文字
                    if(!subStyle.ifDraw) {
                        continue;
                    }

                    bcContext.beginPath();
                    // 修改字体样式
                    bcContext.fillStyle = doc.theme.font;
                    // x,y分别为fillText的横坐标和纵坐标
                    var x = doc.marginL;
                    var y = subStyle.index * doc.cellHeight * doc.fc.scale;
                    bcContext.fillText(subStyle.text, x, y);
                }

                // 还原context
                bcContext.restore();

                return true;
            },

            /**
             * 设置背景中的边框样式
             */
            setBorder : function() {
                var context = doc.context.bcContext;
                context.beginPath();
                context.strokeStyle = doc.theme.grid;
                context.lineWidth = 2;
                // 这里绘制边框时左边要留出doc.marginL的宽度,用来放置说明文字
                context.rect(doc.marginL, 1, doc.width * 2, doc.height - 1);
                context.stroke();

                // 将绘制的内容设置为ECG最外层容器的背景
                innerUtil.setECGBackground();
            },

            /**
             * 将从服务器获取到的数据存储到doc.ecgData中
             *
             * @param result
             * @returns {boolean}
             */
            setEcgData : function(result) {
                if(!result || !innerUtil.isObject(result)) {
                    console.error('error: the param is wrong, please check the input param.');
                    return false;
                }

                var ecgData = doc.ecgData;
                ecgData.result = result;
                ecgData.hwLeadConfig = result.hwLeadConfig;
                ecgData.ecgPartBlocks = result.ecgPartBlocks;
                ecgData.avgLead = result.avgLead;

                return true;
            },

            /**
             * 获取所有主题的名字,以数组的形式返回
             *
             * @returns {Array}
             */
            getAllThemes : function() {
                return Object.keys(doc.themes);
            },

            /**
             * 通过主题名字设置在doc.themes中预定义好的主题
             *
             * @param name
             */
            setTheme : function(name) {
                if(!name || !innerUtil.isString(name)) {
                    console.error('error: parameter is wrong, type String expected.');

                    return false;
                }

                if(!doc.themes.hasOwnProperty(name)) {
                    console.error('error: name can not find in doc.themes, please check.');

                    return false;
                }

                var theme = doc.themes[name];
                doc.theme = theme;

                // 设置ECG容器的背景颜色
                var canvas = document.querySelector('#canvas');
                canvas.style.backgroundColor = theme.background;

                // 绘制背景
                if(!chart.drawBc()) {
                    return false;
                }
                // 绘制fcContext
                if(!chart.drawFc()) {
                    return false;
                }

                return true;
            },

            /**
             * 心电向左滚动
             *
             * @param val
             * @returns {boolean}
             */
            scrollLeft : function(val) {
                var result = innerUtil.initScrollVal(val);
                if(false === result) {
                    return false;
                }
                doc.ecgDom.c.scrollLeft = result;

                return true;
            },

            /**
             * 心电向右滚动
             *
             * @param val
             * @returns {boolean}
             */
            scrollRight : function(val) {
                var result = innerUtil.initScrollVal(val, true);
                if(false === result) {
                    return false;
                }

                doc.ecgDom.c.scrollLeft = result;

                return true;
            },

            /**
             * 左右滚动fc
             *
             * @param val
             * @returns {boolean}
             */
            scrollLR : function(val) {
                if(innerUtil.isNumber(val)) {
                    doc.ecgDom.c.scrollLeft = val;

                    return true;
                } else {
                    throw new TypeError('function scrollLR, val: number required, but ' + typeof val + ' is given.');

                    return false;
                }
            },

            /**
             * 心电向上滚动
             */
            scrollTop : function() {
                var style = doc.descriptionWords.style;
                var keys = Object.keys(style);
                var len = keys.length;

                for(var i = 0; i < len; i++) {
                    var sk = keys[i];
                    style[sk].index--;
                }

                doc.ifReposition = false;
                chart.drawBc();
                chart.drawFc();
                doc.ifReposition = true;
            },

            /**
             * 心电向下滚动
             */
            scrollBottom : function() {
                var style = doc.descriptionWords.style;
                var keys = Object.keys(style);
                var len = keys.length;

                for(var i = 0; i < len; i++) {
                    var sk = keys[i];
                    style[sk].index++;
                }

                doc.ifReposition = false;
                chart.drawBc();
                chart.drawFc();
                doc.ifReposition = true;
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
            init : function(obj) {
                // 检测配置信息, obj错误则直接返回
                if(typeof obj !== 'object') {
                    console.error('配置信息错误,请以对象的形式传入配置信息。');
                    return;
                }
                // 对ECG容器进行初始化
                if('id' in obj) {
                    // 验证是否能找到ECG容器
                    {
                        var ECG = innerUtil.checkECGContainer(obj.id);
                        if(!ECG) {
                            console.error('ECG can not find by id');
                            return;
                        }
                    }

                    // 监测是否存在c_in容器
                    {
                        var c_in = document.querySelector('#c_in');
                        if(c_in) {
                            innerUtil.emptyCIn();
                            var parent = c_in.parentNode;
                            parent.removeChild(c_in);
                        }
                    }
                    // 生成canvas的内层容器并添加到最外层容器中
                    {
                        c_in = document.createElement('div');
                        c_in.id = 'c_in';
                        doc.ecgDom.c_in = c_in;
                        doc.ecgDom.c.appendChild(c_in);
                    }

                    // 分别生成背景和心电用的canvas
                    {
                        innerUtil.fillCIn();
                    }

                    // 初始化doc.context.bcContext与doc.context.fcContext
                    {
                        doc.context.bcContext = doc.ecgDom.bc.getContext('2d');
                        doc.context.fcContext = doc.ecgDom.fc[0].getContext('2d');
                    }

                    // 标志ECG已被初始化
                    {
                        doc.isInit = true;
                    }

                    // 设置ECG容器的样式
                    {
                        outUtil.setStyle(css);
                    }

                    // 绘制背景
                    {
                        this.drawBc();
                    }
                    // 存储ECG最外层容器的id
                    {
                        doc.detailId = obj['id'];
                    }
                } else {
                    console.error('配置信息错误,找不到ECG容器。');
                    return false;
                }
            },

            /**
             * 初始化缩略图配置
             *
             * @param obj
             * @returns {boolean}
             */
            initThumbnail : function(obj) {
                // 检测入参类型是否为对象
                if(typeof obj != 'object') {
                    console.error('配置信息错误,请以对象的形式传入参数');
                    return false;
                }
                // 在id存在的情况下进行下一步
                if('id' in obj) {
                    if(!innerUtil.checkThumbnailContainer(obj.id)) {
                        return false;
                    }

                    // 生成缩略图使用的canvas并添加到缩略图容器中
                    {
                        var c = innerUtil.createThumbnailC();
                        if(!c) {
                            console.log('generate thumbnail canvas error, stream is interrupted.');
                            return false;
                        }
                        doc.ecgDom.t.appendChild(c);
                    }

                    // 设置缩略图的样式
                    {
                        var ecgDom = doc.ecgDom;
                        for(var i in tCss) {
                            for(var j in tCss[i]) {
                                ecgDom[i].style[j] = tCss[i][j];
                            }
                        }
                    }

                    // 设置tcContext
                    {
                        doc.context.tcContext = doc.ecgDom.tc.getContext('2d');
                    }

                    // 绘制缩略图的边框和格子
                    {
                        innerUtil.drawThumbnailBg();
                    }

                    // 给tc添加点击事件
                    {
                        innerUtil.addHandlerToTc();
                    }
                }
            },

            /**
             * 绘制doc.ecgDom.bc,
             * 并将绘制后的内容导出为base64格式的图片,然后设置为doc.ecgDom.c的背景
             *
             * @returns {boolean}
             */
            drawBc : function() {
                // todo 在绘制的时候要注意考虑doc.marginL
                var canvas = doc.ecgDom.bc;     // 背景canvas对象
                var context = doc.context.bcContext;

                // 检测canvas是否存在
                {
                    if(!canvas) {
                        console.error('drawBc参数错误,未设置canvas或者找不到指定的canvas');
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
                    innerUtil.drawCols();
                }
                // 绘制背景的行
                {
                    innerUtil.drawRows();
                }
                // todo 重新定位每条ECG,该方法要修改,否则影响"上下"两个功能
                {
                    innerUtil.repositionECG();
                }
                // 绘制背景中的点
                {
                    innerUtil.drawPoints();
                }
                // 绘制背景中的描述文字
                {
                    outUtil.setDescriptionWords();
                }
                // 将doc.ecgDom.bc的内容导出为图片, 并设置为ECG最外层容器的背景
                {
                    innerUtil.setECGBackground();
                }

                return true;
            },

            /**
             * 清空doc.context.fcContext中绘制的内容，准备绘制新的内容
             *
             * @returns {boolean}
             */
            clearFc : function() {
                var fcs = doc.ecgDom.fc;
                var len = fcs.length;
                // 现在是fc组的形式来画心电, 所以循环清除画布内容
                for(var i = 0; i < len; i++) {
                    var fc = fcs[i];
                    var context = fc.getContext('2d');
                    var fcWidth = fc.width;
                    var fcHeight = fc.height;
                    context.clearRect(0, 0, fcWidth, fcHeight);
                }

                // 将所有心电线段的坐标重置
                innerUtil.resetAllCoordinate(true);

                // 重置drawIndex
                doc.fc.drawIndex = 0;
                //
                doc.context.fcContext = doc.ecgDom.fc[0].getContext('2d');

                return true;
            },

            /**
             * 清除缩略图canvas的内容
             *
             * @returns {boolean}
             */
            clearTc : function() {
                var context = doc.context.tcContext;
                var w = doc.ecgDom.tc.width;
                var h = doc.ecgDom.tc.height;
                context.clearRect(0, 0, w, h);

                return true;
            },

            /**
             * 将指定心电设置为不可显示
             *
             * @param name
             * @returns {boolean}
             */
            hideECG : function(name) {
                if(name) {
                    var style = doc.descriptionWords.style;
                    if(innerUtil.isArray(name)) {
                        var len = name.length;
                        for(var i = 0; i < len; i++) {
                            var subName = name[i];
                            if(style[subName]) {
                                style[subName].ifDraw = false;

                                this.drawBc();
                                this.drawFc();

                                return true;
                            } else {
                                console.error('error: could not find ' + subName + ' in doc.descriptionWords.style');

                                return false;
                            }
                        }
                    } else {
                        if(style[name]) {
                            style[name].ifDraw = false;

                            this.drawBc();
                            this.drawFc();

                            return true;
                        } else {
                            console.error('error: could not find ' + name + ' in doc.descriptionWords.style');

                            return false;
                        }
                    }
                }
            },

            /**
             * 将指定心电设置为显示
             *
             * @param name
             * @returns {boolean}
             */
            showECG : function(name) {
                if(name) {
                    var style = doc.descriptionWords.style;
                    if(innerUtil.isArray(name)) {
                        var len = name.length;
                        for(var i = 0; i < len; i++) {
                            var subName = name[i];
                            if(style[subName]) {
                                style[subName].ifDraw = true;

                                this.drawBc();
                                this.drawFc();

                                return true;
                            } else {
                                console.error('error: can not find ' + name + ' in doc.descriptionWords.style.');
                                return false;
                            }
                        }
                    } else {
                        if(style[name]) {
                            style[name].ifDraw = true;

                            this.drawBc();
                            this.drawFc();

                            return true;
                        } else {
                            console.error('error: can not find ' + name + ' doc.descriptionWords.style.');
                            return false;
                        }
                    }
                }
            },

            /**
             * 用于重新设置增益的值
             *
             * @param val
             * @returns {boolean}
             */
            setGain : function(val) {
                if(!innerUtil.isNumber(val)) {
                    console.error('error: the type of val is not Number but ' + Object.prototype.toString.call(val));
                    return false;
                }

                doc.fc.gain.cur = val;
                doc.fc.gain.mul = val / doc.fc.gain.std;

                var result = this.drawFc();
                if(!result) {
                    return false;
                }

                return true;
            },

            /**
             * 用于重新设置走速的值
             * @param val
             * @returns {boolean}
             */
            setPs : function(val) {
                if(!innerUtil.isNumber(val)) {
                    console.error('error: the type of the val is not Number but' + Object.prototype.toString.call(val));
                    return false;
                }

                doc.fc.ps.cur = val;
                var mul = val / doc.fc.ps.std;
                doc.fc.ps.mul = mul;
                doc.fc.pxPerData = doc.cellWidth * doc.colsPerSecond * mul / doc.rate;

                // 重新计算c_in容器的宽度
                var tWidth = doc.cellWidth * doc.colsPerSecond * 72 * mul;

                // 重新设置fcNum
                doc.fc.fcNum = Math.ceil(tWidth / doc.fc.fcWidth);

                // 重新计算设置c_in容器的宽度
                var cInWidth = doc.fc.fcNum * doc.fc.fcWidth;
                innerUtil.setCInWidth(cInWidth);

                // 重新填充c_in容器
                innerUtil.fillCIn();

                this.drawBc();

                // 设置样式
                outUtil.setStyle(css);

                if(!this.drawFc()) {
                    return false;
                }

                return true;
            },

            /**
             * 绘制doc.ecgDom.fc,
             *
             * @returns {boolean}
             */
            drawFc : function() {
                // 每次绘制先清空fc画布
                {
                    this.clearFc();
                }
                // 绘制心电
                {
                    var ecgData = doc.ecgData;
                    var ecgPartBlocks = ecgData.ecgPartBlocks;
                    var allDrawECG = innerUtil.getAllDrawECG();
                    var allDrawECGLen = allDrawECG.length;
                    var avgLead = ecgData.avgLead;

                    for(var i = 0; i < allDrawECGLen; i++) {
                        var name = allDrawECG[i];
                        var index = innerUtil.getEcgIndex(name);
                        for(var j = 0; j < 18; j++) {
                            var subBlocks = ecgPartBlocks[j];
                            var ecgPartBlocksData = subBlocks['ecgPartBlockData'];
                            var ecgPartBlocksHead = subBlocks['ecgPartBlockHead'];
                            var data = ecgPartBlocksData[index];
                            var dataLen = data.length;

                            // 绘制心电时间
                            if(0 == i) {
                                var time = ecgPartBlocksHead['headTime'] + ' 心率: ' + ecgPartBlocksHead['hrVal'];
                                innerUtil.drawTime(time, allDrawECG[0]);
                            }

                            for(var k = 0; k < dataLen; k++) {
                                var v = data[k];
                                var nextLine = (j == 0 && k == 0
                                ) ? true : false;
                                var nextContext = (j !== 0
                                                  ) && (j % 3 == 0
                                                  ) && (k == 0
                                                  ) ? true : false;
                                if(avgLead) {
                                    v -= avgLead[index];
                                }
                                innerUtil.drawECG(name, v, nextLine, nextContext);
                            }
                        }
                    }
                }

                return true;
            },

            /**
             * 用于根据缩放倍数重新绘制心电图
             *
             * @param mul
             */
            fcScale : function(mul) {
                var r = parseFloat(mul);
                if(!r) {
                    throw new Error('the value of mul is not expected.');
                }
                if(r <= 2 && r >= 0.25) {
                    // 将心电缩放比例存储在配置中,
                    // drawECG()方法会读取doc.fc.scale的值并绘制相应的心电
                    var fc = doc.fc;
                    fc.scale = r;
                    fc.fcWidth = doc.fc.initWidth * r;
                    var width = doc.fc.fcNum * doc.fc.fcWidth;
                    css.c_in.width = width + 'px';
                    this.init({id : doc.detailId});
                    this.drawFc();
                } else {
                    throw new Error('the value of mul is beyond the range.');
                }
            },

            /**
             * 绘制缩略图
             *
             * @param name
             */
            drawTc : function(name) {
                name = name ? name : 'V1';
                // 将当前绘制缩略图心电的名字保存
                {
                    doc.tc.name = name;
                }
                // 清除原来的内容
                {
                    this.clearTc();
                }
                // 每次绘制缩略图初始化坐标等数据
                {
                    var tc = doc.tc;
                    tc.coordinate.x = 0;
                    tc.coordinate.y = 0;
                    tc.line = 1;
                }
                // 计算
                {
                    // 缩略的总宽度
                    var tWidth = 72 * doc.rate * doc.tc.pxPerData;
                    // canvas宽度
                    var cWidth = doc.ecgDom.tc.width;
                    // canvas高度
                    var cHeight = doc.ecgDom.tc.height;
                    // 需要多少行绘制所有的缩略, 加1是为了解决最后一行显示不全的问题
                    var lines = Math.ceil(tWidth / cWidth) + 1;
                    // 每行心电的间隔
                    var space = Math.floor(cHeight / lines);
                    tc.space = space;
                    // tc心电坐标
                    var co = doc.tc.coordinate;
                }
                // 设置context属性
                {
                    var c = doc.context.tcContext;
                    c.beginPath();
                    c.lineWidth = doc.theme.lineWidth;
                    c.strokeStyle = doc.theme.line;
                }
                // 获取指定心电的数据并绘制心电缩略图
                {
                    var ecgData = doc.ecgData;
                    var ecgPartBlocks = ecgData.ecgPartBlocks;
                    var avgLead = ecgData.avgLead;
                    var index = innerUtil.getEcgIndex(name);

                    for(var i = 0; i < 18; i++) {
                        if(!innerUtil.isArray(ecgPartBlocks) || ecgPartBlocks.length == 0) {
                            console.error('ecgPartBlocks is not an Array or the array is empty.');
                            return false;
                        }
                        var subBlocks = ecgPartBlocks[i];
                        var ecgPartBlocksData = subBlocks['ecgPartBlockData'];
                        var data = ecgPartBlocksData[index];
                        for(var j = 0; j < data.length; j++) {
                            var v = data[j];

                            // 处理x坐标
                            {
                                var x = co.x + tc.pxPerData;
                                if(x > cWidth) {
                                    tc.line++;
                                    x -= cWidth;
                                    co.x = 0;
                                    co.y += tc.line * space;
                                }
                            }
                            // 处理心电电压
                            {
                                if(avgLead) {
                                    v -= avgLead[index];
                                }
                                v *= tc.pxPerMv;
                                v = tc.line * space - v;
                            }
                            if(0 == co.x) {
                                co.y = v;
                            }
                            // 绘制缩略图
                            {
                                c.moveTo(co.x, co.y + 0.5);
                                c.lineTo(x, v + 0.5);
                            }
                            // 保存最后一次心电坐标
                            {
                                co.x = x;
                                co.y = v;
                            }
                        }
                    }

                    c.stroke();
                }
            },

            /**
             * 绘制选中的区域,
             * x: 要绘制的起始点,即点击事件发生在tc中的x坐标
             * lineNum: 由于缩略图分为很多条, 该参数为第几条缩略图
             *
             * @param x
             * @param lineNum
             */
            drawSelectedArea : function(x, lineNum) {
                // 参数校验
                {
                    if('number' != typeof x) {
                        throw new TypeError('function drawSelectedArea, param x: number required, but ' + typeof x + ' given');
                    }
                    if('number' != typeof lineNum) {
                        throw new TypeError('function drawSelectedArea, param lineNum: number required, but ' + typeof x + ' given');
                    }
                }
                // 边框绘制参数
                {
                    var tc = doc.tc;
                    var sWidth = tc.sWidth;
                    var sHeight = tc.sHeight;
                    x = x - 0.5;
                    var y = lineNum * tc.space - sHeight / 2 - 0.5;
                }
                // 绘制选中区域
                {
                    var c = doc.context.tcContext;
                    c.beginPath();
                    c.strokeStyle = doc.theme.optionColor;
                    c.strokeRect(x, y, sWidth, sHeight);
                }
            },

            /**
             * 在选择框上面绘制选择心电片段的时间
             *
             * @param x
             * @param lineNum
             * @param time
             */
            drawSelectedTime : function(x, lineNum, time) {
                var tc = doc.tc;
                var sHeight = tc.sHeight;
                x -= 0.5;
                var y = lineNum * tc.space - sHeight / 2 - 1;

                var context = doc.context.tcContext;
                context.beginPath();
                context.fillStyle = doc.theme.optionColor;
                context.fillText(time, x, y);
            },

            /**
             * 在缩略图中选择区域
             *
             * @param e
             */
            selectTc : function(e) {
                // 这里不考虑IE8及更低版本不支持event.pageX和event.pageY
                var pageX = e.pageX,
                    pageY = e.pageY;

                // 获取点击点在canvas中的位置
                {
                    var coor = innerUtil.getCoordinateInCanvas(pageX, pageY);
                }

                // 获取点击点在canvas中第几条心电缩略图的位置
                {
                    var lineNum = innerUtil.getLineNumInTc(coor.y);
                }

                // 在点击位置绘制框框
                {
                    if(('number' == typeof lineNum
                       ) && lineNum > 0) {  // lineNum为0时不绘制
                        chart.drawTc(doc.tc.name);
                        chart.drawSelectedArea(coor.x, lineNum);
                        var time = innerUtil.getSelectedTime(coor.x, lineNum);
                        chart.drawSelectedTime(coor.x, lineNum, time);
                    }
                }

                // 移动fc到缩略图选中的位置
                {
                    innerUtil.moveSelectedAreaIntoView(coor.x, lineNum);
                }
            }
        };

        // 返回
        return {
            doc   : doc,
            css   : css,
            tCss  : tCss,
            chart : chart,
            util  : outUtil,
            inner : innerUtil
        };
    }
)();
