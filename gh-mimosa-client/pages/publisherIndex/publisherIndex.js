/**
 * 发行人首页
 */
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'publisherIndex',
//			charDomId: ['raisePies', 'bar-horizontal', 'pie-solid', "investAndRedeem"],
			charDomId: ['raisePies', 'bar-horizontal', 'pie-solid'],
			chartDataLength: [0, 0], //募集产品个数，TOP5产品个数
			chartNoDataImgDom: '<img src="assets/images/nodatatips.png" alt="暂无数据" width="220">',
			showLoading: function(_charts) {
				for(var i = 0; i < _charts.length; i++) {
					if(!_charts[i].isDisposed()) {
						_charts[i].showLoading({
							text: '正在努力的读取数据中...', //loading话术
						});
					}
				}
			},
			hideLoading: function(_chart) {
				if(!_chart.isDisposed()) {
					_chart.hideLoading();
				}
			},
			resizeCharts: function(_charts) {
				for(var i = 0; i < _charts.length; i++) {
					if(!_charts[i].isDisposed()) {
						_charts[i].resize();
					}
				}
			},
			init: function() {

				var _this = this;
				setSailingDomHeigth();

				// 图形区域初始化
				var chartsArr = [echarts.init(document.getElementById(_this.charDomId[0])), //在售产品募集进度
					echarts.init(document.getElementById(_this.charDomId[1])), //昨日产品投资额TOP5
					echarts.init(document.getElementById(_this.charDomId[2])), //投资人质量分析
//					echarts.init(document.getElementById(_this.charDomId[3])) //投资人质量分析
				];

				//现在正在加载数据...
				_this.showLoading(chartsArr);

				//查询数据
				http.post(config.api.publisher.baseAccount.publisherhome, {
						contentType: 'form'
					},
					function(result) {

						//填充统计数据
						fillStatData(result);

						//累计投资金额和累计还款金额
						var investAndRedeemDataArr = [{
							name: '赎回',
							value: result.totalReturnAmount
						}, {
							name: '申购',
							value: result.totalLoanAmount
						}];

						var optionsArr = [raiseOption(config, formatSailingData(result.raiseRate), '在售产品募集进度', numberFormatterUtil), // 在售产品募集进度
							top5Option(config, formatTop5Data(result.top5ProductList), '昨日产品投资额TOP5', numberFormatterUtil), //昨日产品投资额TOP5
							investorOption(config, formatInvestorData(result.investorAnalyse), '投资人质量分析', numberFormatterUtil), //投资人质量分析
//							pieHollowOptions(config, investAndRedeemDataArr, '累计申购和累计赎回金额对比', numberFormatterUtil, 2, " 元")
						]; //

						//根据实际返回的数据，设置各图片高度
						setSailingDomHeigth();

						//在售产品募集进度
						//要先转化数据，计算出行高，设置DIV的高度后再重新画图。否则图片不好看
						_this.hideLoading(chartsArr[0]);
						setChartsOptions(chartsArr[0], optionsArr[0]);

						//投资人质量分析
						_this.hideLoading(chartsArr[2]);
						setSailingDomHeigth();
						setChartsOptions(chartsArr[2], optionsArr[2]);

						// 投资TOP5
						//要先转化数据，计算出行高，设置DIV的高度后再重新画图。否则图片不好看
						_this.hideLoading(chartsArr[1]);
						setSailingDomHeigth();
						setChartsOptions(chartsArr[1], optionsArr[1]);
						setSailingDomHeigth();

//						_this.hideLoading(chartsArr[3]);
//						setChartsOptions(chartsArr[3], optionsArr[3]);

						$(window).resize(function() {
							setSailingDomHeigth();
							_this.resizeCharts(chartsArr);
						});

					}, function (err) {
						if(err.errorCode == 30056){
							$('#createPublisherModal').modal('show')
						}else{
							errorHandle(err)
						}
					});

				$('#createPublisherSubmit').on('click', function(){
					$('#createPublisherModal').modal('hide')
					setTimeout(function(){
						util.nav.dispatch('c_account');
					}, 500)
				})
				
				//填充统计数据
				function fillStatData(result) {
					$$.detailAutoFix($('#statinfo'), result)
				}

				function setChartsOptions(ch, op) {
					if(isSeriesDataEmpty(op.series)) {
						ch.resize();
						ch.setOption(op);
						//无数据时显示默认图片
					} else {
						//注意先释放图表，后将默认图片放上去（如果先放默认图片，那么在释放图表的时候会把默认图片也释放掉）
						var chartDomId = ch.getDom().id;
						ch.clear(); // 图表清空
						ch.dispose(); // 图表释放
						$("#" + chartDomId).html(_this.chartNoDataImgDom);
					}
				}

				//判断options的数据域是否有数据
				function isSeriesDataEmpty(series) {
					if(series && series.length && series.length > 0) {
						for(var i = 0; i < series.length; i++) {
							var seriesObj = series[i];
							if(seriesObj && seriesObj.data && seriesObj.data.length > 0) {
								return true;
							}
						}
					}
					return false;
				}

				// 转化TOP5数据
				function formatTop5Data(source) {
					var arr = [];
					if(source && source.length > 0) {
						for(var i = 0; i < source.length; i++) {
							arr.push({
								name: source[i].xname,
								value: source[i].yvalue
							});
						}

					}
					//TOP5数据个数
					_this.chartDataLength[1] = arr.length;
					return arr;
				}

				// 转化投资人质量分析数据
				function formatInvestorData(source) {
					var arr = [];
					if(source && source.length > 0) {
						for(var i = 0; i < source.length; i++) {
							arr.push({
								name: source[i].xname,
								value: source[i].yvalue
							});
						}
					}
					return arr;
				}

				// 组装募集进度堆叠图数据
				function formatSailingData(raiseRateArr) {
					var chartObjs = {
						seriesdata: [{
							name: '已募集',
							data: []
						}, {
							name: '总规模',
							data: []
						}],
						axis: []
					};
					if(raiseRateArr && raiseRateArr.length > 0) {
						for(var i = 0; i < raiseRateArr.length; i++) {
							chartObjs.axis.push(raiseRateArr[i].productName); //产品名
							chartObjs.seriesdata[0].data.push(raiseRateArr[i].raised); //已募集
							chartObjs.seriesdata[1].data.push(raiseRateArr[i].total); //总规模
						}
					}

					_this.chartDataLength[0] = chartObjs.axis.length;

					return chartObjs;
				}

				//横向堆叠图
				function raiseOption(config, source, seriesName, numberFormatter) {
					var toolTipObj = {
						trigger: 'item',
						axisPointer: { // 坐标轴指示器，坐标轴触发有效
							type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
						}
					};
					if(source.axis.length <= 0) {
						toolTipObj.formatter = "暂无相关数据";
						toolTipObj.trigger = "axis";
					} else {
						toolTipObj.formatter = function(p) {
							return p.seriesName + "<br/>" + p.name + "：" + numberFormatter(p.value, 2) + "%";
						}
					}

					var opt = {
						tooltip: toolTipObj,
						legend: {
							show: false
						},
						grid: { // 调整图形区域的位置
							top: 20,
							left: 130,
							right: 110,
							bottom: 30
						},
						yAxis: [{
							type: 'category',
							data: source.axis,
							axisLabel: {
								formatter: function(p) {
									if(p.length > 10) {
										p = p.substring(0, 8) + "......";
									}
									return p;
								}
							}
						}, {
							type: 'category',
							axisLine: {
								show: false
							},
							axisTick: {
								show: false
							},
							axisLabel: {
								show: false
							},
							splitArea: {
								show: false
							},
							splitLine: {
								show: false
							},
							data: source.axis
						}],
						xAxis: [{
							type: 'value',
							axisLabel: {
								formatter: function(p) {
									return p + '%';
								}
							}
						}],
						series: [{
								name: source.seriesdata[1].name,
								type: 'bar',
								itemStyle: {
									normal: {
										color: 'rgba(60,141,188,1)',
										label: {
											show: true,
											position: "right",
											formatter: function(p) {
												return "\n\n总规模 (" + numberFormatter(p.value, 2) + "%)";
											},
											textStyle: {
												fontWeight: 'bold'
											}
										}
									}
								},
								data: source.seriesdata[1].data
							}, {
								name: source.seriesdata[0].name,
								type: 'bar',
								yAxisIndex: 1,
								itemStyle: {
									normal: {
										color: 'rgba(252,68,48,1)',
										label: {
											show: true,
											position: "right",
											formatter: function(p) {
												return "已募集 (" + numberFormatter(p.value, 2) + "%)\n";
											},
											textStyle: {
												fontWeight: 'bold'
											}
										}
									}
								},
								data: source.seriesdata[0].data
							}

						]
					};
					return opt;
				}

				// 生成横向柱状图参数
				function top5Option(config, source, seriesName, numberFormatter) {
					var maxValue = 0;
					for(var i = 0; i < source.length; i++) {
						if(source[i].value > maxValue) {
							maxValue = source[i].value;
						}
					}
					return {
						tooltip: { // 提示框
							trigger: 'axis', // 根据坐标触发
							formatter: function(p) {
								return p[0].seriesName + "<br/>" + p[0].name + "：" + numberFormatter(p[0].value, 2) + " (元)";
							},
							axisPointer: { // 坐标轴指示器，坐标轴触发有效
								type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
							}
						},
						grid: { // 调整图形区域的位置
							top: 10,
							left: 100,
							right: 30,
							bottom: 30
						},
						xAxis: [{ // 横坐标配置
							name: '', // 横坐标名称
							type: 'value', // 类型：值类型
							boundaryGap: ['0%', '20%'], // 左侧不多预留空间，右侧预留20%空间
							splitLine: {
								lineStyle: {
									show: true,
									type: 'dashed'
								}
							}
						}],
						yAxis: [{ // 纵坐标配置
							name: '', // 纵坐标名称
							type: 'category', // 类型：分类类型
							data: source.map(function(item) {
								return item.name
							}),
							splitLine: {
								lineStyle: {
									show: true,
									type: 'dashed'
								}
							},
							axisLabel: {
								formatter: function(p) { // 格式化
									if(p.length > 10) {
										p = p.substring(0, 8) + "......";
									}
									return p + "\n";
								}
							}
						}],
						series: [{ // 数据配置
							name: seriesName,
							type: 'bar', // 柱状条
							label: { // 显示文字配置
								normal: {
									show: true,
									position: 'insideRight',
									textStyle: {
										fontWeight: 'bold'
									},
									formatter: function(obj) { // 格式化
										return "\n" + numberFormatter(obj.value, 2);
									}
								}
							},
							data: source.map(function(item) {
								return {
									value: item.value,
									itemStyle: {
										normal: {
											label: {
												//柱状图超过50%时显示在内部，不足50%时显示在右侧
												position: (maxValue == 0 || item.value / maxValue < 0.5) ? 'right' : 'insideRight'
											}
										}
									}
								}
							})
						}],
						color: config.colors
					}
				}

				// 生成实心饼图参数
				function investorOption(config, source, serialName, numberFormatter) {

					source = source ? source : [];

					var tooltipFormatter = { // 工具提示栏
						trigger: 'item',
						formatter: getToolTipFormatterText(source, "{a} <br/>{b}：{c} 人({d}%)")
					};

					return {
						tooltip: tooltipFormatter,
						legend: { // 说明区域
							orient: 'vertical', // 纵向显示
							x: 'right', // 右侧显示
							y: 'center', // 中部显示
							data: source.map(function(item) {
								return item.name;
							})
						},
						grid: { // 调整图形区域的位置
							top: 20,
							bottom: 40
						},
						series: [{
							name: serialName,
							type: 'pie',
							radius: '75%',
							center: ['50%', '50%'],
							label: {
								normal: {
									show: true,
									position: 'outer',
									formatter: function(obj) {
										return obj.name + '(' + numberFormatter(obj.percent, 2) + '%)';
									},
									textStyle: {
										fontWeight: 'bold'
									}
								}
							},
							data: source
						}],
						color: config.colors
					}
				}

				// 生成空心饼图参数
				function pieHollowOptions(config, source, seriesName, numberFormatter, decimalNum, unitName) {

					source = source ? source : [];
					seriesName = seriesName ? seriesName : '';

					var tooltipFormatter = { // 工具提示栏
						trigger: 'item',
						formatter: function(p) {
							if(unitName) {
								return p.seriesName + "<br/>" +
									p.name + "：" + numberFormatter(p.value, decimalNum) + unitName +
									"(" + numberFormatter(p.percent, decimalNum) + "%)";
							} else {
								return p.seriesName + "<br/>" +
									p.name + "：" + numberFormatter(p.value, decimalNum) +
									"(" + numberFormatter(p.percent, decimalNum) + "%)";
							}
						}
					};

					var lavelShow = true;
					// 无数据处理
					if(source.length == 0) {
						lavelShow = false;
						source.push({
							name: '',
							value: ''
						});
					};

					return {
						tooltip: tooltipFormatter,
						legend: { // 说明区域
							orient: 'vertical', // 纵向显示
							x: 'right', // 右侧显示
							y: 'center', // 中部显示
							data: source.map(function(item) {
								return item.name
							})
						},
						grid: { // 调整图形区域的位置
							top: 20,
							bottom: 30
						},
						series: [{
							name: seriesName,
							type: 'pie',
							radius: ['40%', '70%'],
							center: ['50%', '50%'],
							label: {
								normal: {
									show: lavelShow,
									position: 'outer',
									formatter: function(obj) {
										return obj.name + '( ' + obj.percent + '% )'
									},
									textStyle: {
										fontWeight: 'bold'
									}
								}
							},
							data: source.map(function(item) {
								return {
									name: item.name,
									value: item.value
								}
							})
						}],
						color: config.colors
					}
				}

				function getToolTipFormatterText(source, format) {
					return(source && source.length > 0) ? format : "暂无相关数据";
				}

				function setSailingDomHeigth() {

					//如果有数据，则根据实际产品个数计算行号
					if(_this.chartDataLength[0] > 0) {
						$("#" + _this.charDomId[0]).height(_this.chartDataLength[0] * 40 + 80);
					} else {
						//如果无数据则保持和其他一样高
						$("#" + _this.charDomId[0]).height($("#" + _this.charDomId[2]).height());
					}

					//如果有数据，则根据实际产品个数计算行号
					if(_this.chartDataLength[1] > 0) {
						//top5图片实际高度
						var top5ChartHeight = _this.chartDataLength[1] * 40 + 45;

						//top5的wapDiv高度
						var top5CharWapHeight = $("#bar-horizontalWap").height();
						top5CharWapHeight = top5CharWapHeight > top5ChartHeight ? top5CharWapHeight : top5ChartHeight;

						//图片实际应具有高度
						$("#" + _this.charDomId[1]).height(top5ChartHeight);
						//投资人分析饼图高度
						var pieHeight = $("#" + _this.charDomId[2]).height();

						//如果昨日产品投资额TOP5和投资人质量分析各占50%宽度
						if($("#raisePiesWap").width() > $("#bar-horizontalWap").width()) {
							//如果top5图比投资人饼图的高度低
							if(top5CharWapHeight <= pieHeight) {
								top5CharWapHeight = pieHeight;

							} else {
								//饼图高度低，设置饼图高度等于柱状图高度
								$("#" + _this.charDomId[2]).height(top5CharWapHeight);
							}

							//设定投资额TOP5横向柱状图高度
							$("#bar-horizontalWap").height(top5CharWapHeight);

							//昨日产品投资额TOP5和投资人质量分析在一行（各占50%）
							//昨日产品投资额TOP5垂直居中显示
							$("#bar-horizontalWap").css("position", "relative");
							$("#" + _this.charDomId[1]).css("position", "absolute");
							$("#" + _this.charDomId[1]).css("top", "50%");
							$("#" + _this.charDomId[1]).css("margin-top", -top5ChartHeight / 2);

						} else {
							$("#bar-horizontalWap").height(top5CharWapHeight);
						}

					} else {
						//如果无数据则保持和其他一样高
						$("#bar-horizontalWap").height($("#" + _this.charDomId[2]).height());
					}

//					$("#" + _this.charDomId[3]).height($("#" + _this.charDomId[2]).height());
				}

				function numberFormatterUtil(val, i) {
					return $.number(val, i);
				}
			}
		}
	})