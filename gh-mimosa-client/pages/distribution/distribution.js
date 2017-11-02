// 载入所需模块
define([
        'http',
        'config',
        'util',
        'extension'
    ],
    function(http, config, util, $$) {
        return {
            name: 'distribution',
            init: function() {
                var _this = this;
                _this.pagesInit();
                _this.bindEvent();
            },
            showLoading: function(_charts) {
                if(!_charts.isDisposed()) {
                    _charts.showLoading({
                        text: '正在努力的读取数据中...', //loading话术
                    });
                }
            },
            hideLoading: function(_chart) {
                if(!_chart.isDisposed()) {
                    _chart.hideLoading();
                }
            },
            resizeCharts: function(_charts) {
                if(!_charts.isDisposed()) {
                    _charts.resize();
                }
            },
            entity: {
                source: ''
            },
            pagesInit: function() {
                var _this = this;
                // 分页配置
                var pageOptions = {
                    number: 1,
                    size: 10,
                    offset: 0,
                    startTime: '',
                    endTime: ''
                }
                
                // 历史配置
                var page2Options = {
                    number: 1,
                    size: 10,
                    offset: 0,
                    startTime: '',
                    endTime: '',
                    source: ''
                }
                
                var confirm = $('#confirmModal');
                // 数据表格配置
                var tableConfig = {
                    ajax: function(origin) {
                        http.post(config.api.ope.distribution.list, {
                            data: {
                                page: pageOptions.number,
                                rows: pageOptions.size,
                                startTime: pageOptions.startTime,
                                endTime: pageOptions.endTime
                            },
                            contentType: 'form'
                        }, function(rlt) {
                            origin.success(rlt)
                        })
                    },
                    idField: 'oid',
                    pagination: true,
                    sidePagination: 'server',
                    pageList: [10, 20, 30, 50, 100],
                    queryParams: getQueryParams,
                    columns: [{
                        width: 60,
                        align: 'center',
                        formatter: function(val, row, index) {
                            return pageOptions.offset + index + 1
                        }
                    }, {
//                      align: 'left',
                        field: 'source'
                    }, {
                        align: 'right',
                        field: 'registerNum'
                    }, {
                        align: 'right',
                        field: 'bindNum'
                    }, {
                        align: 'right',
                        field: 'rechargeNum'
                    }, {
                        align: 'right',
                        field: 'buyNum'
                    }, {
                        align: 'center',
                        formatter: function(val, row, index) {
                            var buttons = [{
                                text: '查看历史',
                                type: 'button',
                                class: 'item_sources',
                                isRender: true
                            }]
                            return util.table.formatter.generateButton(buttons, 'distributionTable');
                        },
                        events: {
                            'click .item_sources': toSources
                        }
                    }]
                }
                
                // 数据表格配置
                var table2Config = {
                    ajax: function(origin) {
                        http.post(config.api.ope.distribution.sourcelist, {
                            data: {
                                page: page2Options.number,
                                rows: page2Options.size,
                                startTime: page2Options.startTime,
                                endTime: page2Options.endTime,
                                source: page2Options.source
                            },
                            contentType: 'form'
                        }, function(rlt) {
                            origin.success(rlt)
                            showPicture(rlt);// 加载echart图
                        })
                    },
                    idField: 'oid',
                    pagination: true,
                    sidePagination: 'server',
                    pageList: [10, 20, 30, 50, 100],
                    queryParams: getQuery2Params,
                    columns: [{
                        width: 60,
                        align: 'center',
                        formatter: function(val, row, index) {
                            return page2Options.offset + index + 1
                        }
                    }, {
//                      align: 'right',
                        field: 'time'
                    }, {
//                      align: 'left',
                        field: 'source'
                    }, {
//                      align: 'right',
                        field: 'registerNum'
                    }, {
//                      align: 'right',
                        field: 'bindNum'
                    }, {
//                      align: 'right',
                        field: 'rechargeNum'
                    }, {
//                      align: 'right',
                        field: 'buyNum'
                    }]
                }
                var myChart = echarts.init(document.getElementById('picture'));
                // 初始化数据表格
                var nowtime = util.table.formatter.timestampToDate(new Date(), 'YYYY-MM-DD');
                $(document.searchForm.startTime).val(nowtime);
                $(document.searchForm.endTime).val(nowtime);
                $('#distributionTable').bootstrapTable(tableConfig);
                $$.searchInit($('#searchForm'), $('#distributionTable'));
                $('#sourcesTable').bootstrapTable(table2Config);
                $$.searchInit($('#sourcesSearchForm'), $('#sourcesTable'));
                
                // 查看历史
                function toSources(e, value, row) {
                    _this.entity.source = row.source;
                    
                    var stim = getBeforeDate(new Date(), 6);
                    var etim = util.table.formatter.timestampToDate(new Date(), 'YYYY-MM-DD');
                    $(document.sourcesSearchForm.startTime).val(stim);
                    $(document.sourcesSearchForm.endTime).val(etim);
                    
                    myChart.clear();
                    myChart.showLoading({
                            text: '正在努力的读取数据中...', //loading话术
                        })
                    $('#sourcesTable').bootstrapTable('refresh');
                    $('#sourcesModal').modal('show');
                }
                
                // 加载echart图
                function showPicture(rlt) {
                    console.log(rlt);
                    
                    var totalList = rlt.totalList;
                    var dateList = [];
                    var registerNumList = [];
                    var bindNumList = [];
                    var rechargeNumList = [];
                    var buyNumList = [];
                    for(var i = 0; i < totalList.length; i++) {
                        dateList.push(totalList[i].time);
                        registerNumList.push(totalList[i].registerNum);
                        bindNumList.push(totalList[i].bindNum);
                        rechargeNumList.push(totalList[i].rechargeNum);
                        buyNumList.push(totalList[i].buyNum);
                    }
                    
                    option = {
                        title : {
//					        text: '未来一周气温变化',
//					        subtext: '纯属虚构'
                        },
                        tooltip : {
                            trigger: 'axis'
                        },
                        legend: {
                            data:['注册用户数','首次绑卡数','首次充值数','首次购买数']
                        },
                        toolbox: {
                            show : true,
                            feature : {
                                mark : {show: true},
//					            dataView : {show: true, readOnly: false},
                                magicType : {show: true, type: ['line', 'bar']},
//					            restore : {show: true},
//					            saveAsImage : {show: true}
                            }
                        },
                        calculable : true,
//					    xAxis : [
//					        {
//					            type : 'category',
//					            boundaryGap : false,
//					            data : dateList//['2010-01-05','2010-01-06','2010-01-07','2010-01-08','2010-01-09','2010-01-10','2010-01-11']
//					        }
//					    ],
                        yAxis : [
                            {
                                type : 'value',
                                axisLabel : {
                                    formatter: '{value} 位'
                                }
                            }
                        ]
//					    ,
//					    series : [
//					        {
//					            name:'注册用户数',
//					            type:'line',
//					            data:registerNumList,//[11, 11, 15, 13, 12, 13, 10],
//					            markPoint : {
//					                data : [
//					                    {type : 'max', name: '最大值'},
//					                    {type : 'min', name: '最小值'}
//					                ]
//					            },
//					            markLine : {
//					                data : [
//					                    {type : 'average', name: '平均值'}
//					                ]
//					            }
//					        },
//					        {
//					            name:'首次绑卡数',
//					            type:'line',
//					            data:bindNumList,//[21, 22, 22, 25, 29, 22, 20],
//					            markPoint : {
//					                data : [
//					                    {type : 'max', name: '最大值'},
//					                    {type : 'min', name: '最小值'}
//					                ]
//					            },
//					            markLine : {
//					                data : [
//					                    {type : 'average', name : '平均值'}
//					                ]
//					            }
//					        },
//					        {
//					            name:'首次充值数',
//					            type:'line',
//					            data:rechargeNumList,//[32, 31, 34, 38, 36, 39, 31],
//					            markPoint : {
//					                data : [
//					                    {type : 'max', name: '最大值'},
//					                    {type : 'min', name: '最小值'}
//					                ]
//					            },
//					            markLine : {
//					                data : [
//					                    {type : 'average', name : '平均值'}
//					                ]
//					            }
//					        },
//					        {
//					            name:'首次购买数',
//					            type:'line',
//					            data:buyNumList,//[5, 3, 7, 5, 9, 9, 8],
//					            markPoint : {
//					                data : [
//					                    {type : 'max', name: '最大值'},
//					                    {type : 'min', name: '最小值'}
//					                ]
//					            },
//					            markLine : {
//					                data : [
//					                    {type : 'average', name : '平均值'}
//					                ]
//					            }
//					        }
//					    ]
                    };
                    
                    var axis = [];
                    axis.push({
                                type : 'category',
                                boundaryGap : false,
                                data : dateList
                            });
                            
                    var serie = [];
                    serie.push({
                                name:'注册用户数',
                                type:'line',
                                data:registerNumList,
                                markPoint : {
                                    data : [
                                        {type : 'max', name: '最大值'},
                                        {type : 'min', name: '最小值'}
                                    ]
                                },
                                markLine : {
                                    data : [
                                        {type : 'average', name: '平均值'}
                                    ]
                                }
                            });
                    serie.push({
                                name:'首次绑卡数',
                                type:'line',
                                data:bindNumList,
                                markPoint : {
                                    data : [
                                        {type : 'max', name: '最大值'},
                                        {type : 'min', name: '最小值'}
                                    ]
                                },
                                markLine : {
                                    data : [
                                        {type : 'average', name : '平均值'}
                                    ]
                                }
                           });
                    serie.push({
                                name:'首次充值数',
                                type:'line',
                                data:rechargeNumList,
                                markPoint : {
                                    data : [
                                        {type : 'max', name: '最大值'},
                                        {type : 'min', name: '最小值'}
                                    ]
                                },
                                markLine : {
                                    data : [
                                        {type : 'average', name : '平均值'}
                                    ]
                                }
                          });
                    serie.push({
                                name:'首次购买数',
                                type:'line',
                                data:buyNumList,
                                markPoint : {
                                    data : [
                                        {type : 'max', name: '最大值'},
                                        {type : 'min', name: '最小值'}
                                    ]
                                },
                                markLine : {
                                    data : [
                                        {type : 'average', name : '平均值'}
                                    ]
                                }
                           });
                    option.xAxis = axis;
                    option.series = serie;
                    
                    //生成图表
                    _this.hideLoading(myChart);
                    myChart.setOption(option);
                    $(window).resize(function() {
                        setDomHength();
                        _this.resizeCharts(myChart);
                    });
                }
                
                function setDomHength() {
                    $("#picture").height($("#picture").width() * 0.4);
                }
                
                
                function getQueryParams(val) {
                    var form = document.searchForm
                    pageOptions.size = val.limit
                    pageOptions.number = parseInt(val.offset / val.limit) + 1
                    pageOptions.offset = val.offset
                    pageOptions.startTime = form.startTime.value.trim()
                    pageOptions.endTime = form.endTime.value.trim()
                    return val
                }
                
                function getQuery2Params(val) {
                    var form = document.sourcesSearchForm
                    page2Options.size = val.limit
                    page2Options.number = parseInt(val.offset / val.limit) + 1
                    page2Options.offset = val.offset
                    page2Options.source = _this.entity.source
                    if (!form.startTime.value || form.startTime.value.trim() == ''){
                        var stim = getBeforeDate(new Date(), 6);
                        $(document.sourcesSearchForm.startTime).val(stim);
                    }
                    
                    if (!form.endTime.value || form.endTime.value.trim() == ''){
                        var etim = util.table.formatter.timestampToDate(new Date(), 'YYYY-MM-DD');
                        $(document.sourcesSearchForm.endTime).val(etim);
                    }
                    
                    page2Options.startTime = form.startTime.value.trim()
                    page2Options.endTime = form.endTime.value.trim()
                    page2Options.endTime = getNextDate(page2Options.endTime, 1)
                    
                    myChart.resize();
                    myChart.showLoading({
                            text: '正在努力的读取数据中...', //loading话术
                        })
                    
                    return val
                }
                
                function getBeforeDate(val, num){
                    if (val && val!=''){
                        var now = new Date(val);
                        var next = now.getTime()-24*60*60*1000*num;
                        var nextDate = util.table.formatter.timestampToDate(next, 'YYYY-MM-DD');
                        return nextDate;
                    }else{
                        return val;
                    }
                }
                function getNextDate(val, num){
                    if (val && val!=''){
                        var now = new Date(val);
                        var next = now.getTime()+24*60*60*1000*num;
                        var nextDate = util.table.formatter.timestampToDate(next, 'YYYY-MM-DD');
                        return nextDate;
                    }else{
                        return val;
                    }
                }
            },
            bindEvent: function() {
                var _this = this;
            }
        }
    })