/**
 * Author:      Tao-Quixote
 * CreateTime:  16/5/26 13:53
 * Description: This a demo.js, useless.
 */

$(function () {
    // todo 初始化canvas信息
    ECG.chart.init({
        id : 'canvas'
    });

    $('#begin').on('click', function () {
        ECG.chart.drawFc();
    });
    // todo 给增益绑定修改事件
    $('#gain').on('change', function (e) {
        var gain = $(this);
        var value = parseInt(gain.val());
        ECG.chart.setGain(value);
    });
    // todo 给走速绑定修改事件
    $('#ps').on('change', function (e) {
        var ps = $(this);
        var value = parseFloat(ps.val());
        ECG.chart.setPs(value);
    });
    $('#top').on('click', function () {
        ECG.util.scrollTop();
    });
    $('#bottom').on('click', function () {
        ECG.util.scrollBottom();
    });
    $('#left').on('click', function () {
        ECG.util.scrollLeft();
    });
    $('#right').on('click', function () {
        ECG.util.scrollRight();
    });

    {
        var ecgs = $('#ecg-group input');
        for (var i = 0; i < ecgs.length; i++) {
            $(ecgs[ i ]).on('click', function () {
                if ($(this).attr('checked') == true) {
                    ECG.chart.showECG($(this).attr('id'));
                } else {
                    ECG.chart.hideECG($(this).attr('id'));
                }
            });
        }
    }

    // TODO 获取服务器数据
    if (true) {
        $.ajax(
            {
                type        : 'post',
                contentType : 'application/json',
                dataType    : 'json',
                url         : 'http://10.0.10.131:8080/ycl-yun-vh-api-webapp/requestEcgDataAnalysis',
                data        : JSON.stringify({
                    'ossId' : 40
                }),
                success     : function (data) {
                    window.result = data.result;
                    window.hwLeadConfig = result.hwLeadConfig;
                    window.ecgPartBlocks = result.ecgPartBlocks;
                    console.log('data is ready');
                    ECG.util.setEcgData(data.result);
                    ECG.chart.drawFc();
                }
            }
        )
    }
});
