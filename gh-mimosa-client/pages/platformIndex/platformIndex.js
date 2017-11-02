define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'platformIndex',
			chartDataLength: [0, 0], //昨日各渠道投资额排序前5位个数，昨日产品新增投资额TOP5个数
			chartNoDataImgDom: '<img src="assets/images/nodatatips.png" alt="暂无数据" width="220">',
//			charDomId: ['todayAndYesterdayUser', 'todayAndYesterdayInvest', 'bar-vertical', 'bar-horizontal', 'pie-hollow', 'pie-solid1', 'pie-solid2', 'investAndRedeem'],
			charDomId: ['todayAndYesterdayUser', 'bar-vertical', 'bar-horizontal', 'pie-hollow', 'pie-solid2'],
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
				//设置图表DIV高度
				setDomHength();

				// 图形区域初始化
				var chartsArr = [echarts.init(document.getElementById(_this.charDomId[0])), //平台用户数近一个月变化
//					echarts.init(document.getElementById(_this.charDomId[1])), //昨日和今日投资额统计
					echarts.init(document.getElementById(_this.charDomId[1])), //昨日各渠道投资额排序前5位
					echarts.init(document.getElementById(_this.charDomId[2])), //昨日产品新增投资额TOP5
					echarts.init(document.getElementById(_this.charDomId[3])), //平台交易额占比分析
//					echarts.init(document.getElementById(_this.charDomId[5])), //平台交易总额各渠道占比
					echarts.init(document.getElementById(_this.charDomId[4])), //投资人质量分析
//					echarts.init(document.getElementById(_this.charDomId[5])) //累计申购和累计赎回金额对比
				];

				//现在正在加载数据...
				_this.showLoading(chartsArr);

				//查询数据
				http.post(config.api.platformHome, {
						contentType: 'form'
					},
					function(result) {

						//填充统计数据
						fillStatData(result);

						//累计投资金额和累计还款金额
						var investAndRedeemDataArr = [{
							xname: '赎回',
							yvalue: result.totalReturnAmount
						}, {
							xname: '申购',
							yvalue: result.totalLoanAmount
						}];

						//计算各图表相关option数据
						var optionsArr = [
							monthUserOptions(config, formatMonthUserData(result)), //平台用户数近一个月变化
//							barHorizontalOptions1(config, formatTodayAndYesterdayUserData(result), 60, 0), //昨日和今日用户统计
//							barHorizontalOptions1(config, formatTodayAndYesterdayInvestData(result), 100, 2, ' 元'), //昨日和今日投资额统计
							barVerticalOptions(config, result.channelRank, '昨日各渠道投资额排序前5位', 2, ' 元'), //昨日各渠道投资额排序前5位
							barHorizontalOptions(config, result.proInvestorRank, '昨日产品新增投资额TOP5', 2, ' 元'), //昨日产品新增投资额TOP5
							pieHollowOptions(config, result.tradeAmountAnalyse, '平台交易额占比分析', 2, ' 元'),
//							pieSolidOptions(config, result.channelAnalyse, '平台交易总额各渠道占比', 2, ' 元'),
							pieHollowOptions(config, result.investorAnalyse, '投资人质量分析', 0, ' 人'),
//							pieHollowOptions(config, investAndRedeemDataArr, '累计申购和累计赎回金额对比', 2, ' 元')
						];

						//昨日各渠道投资额排序前5位数据条数
						_this.chartDataLength[0] = getArrLength(result.channelRank);
						//昨日产品新增投资额TOP5数据条数
						_this.chartDataLength[1] = getArrLength(result.proInvestorRank);

						//计算完个图片的数据后，根据数据设置图表高度
						setDomHength();

						//生成图表
						for(var i = 0; i < chartsArr.length; i++) {
							_this.hideLoading(chartsArr[i]);
							setChartsOptions(chartsArr[i], optionsArr[i]);
						}

						$(window).resize(function() {
							setDomHength();
							_this.resizeCharts(chartsArr);
						});
					});

				function setChartsOptions(ch, op) {
					if(isSeriesDataEmpty(op.series)) {
						ch.resize();
						ch.setOption(op);
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
							if(series[i] && series[i].data && series[i].data.length > 0) {
								return true;
							}
						}
					}
					return false;
				}

				//填充统计数据
				function fillStatData(result) {
					$$.detailAutoFix($('#platformCountDiv'), result)
				}

				//昨日今日统计图表数据组装
				function formatTodayAndYesterdayInvestData(result) {
					var source = {};
					source.legend = ['昨日', '今日'];
					source.data = [];
					source.axis = ['累计投资', '新增投资'];

					if(result && (result.errorCode == 0)) {
						//昨日数据
						source.data.push({
							seriesName: '昨日',
							data: [
								result.yesterdayInvestAmount,
								result.yesterdayAddedInvestAmount
							]
						});
						//今日数据
						source.data.push({
							seriesName: '今日',
							data: [
								result.todayInvestAmount,
								result.todayAddedInvestAmount
							]
						});
					}
					return source;
				}
				
				//平台用户数折线图数据组装
				function formatMonthUserData(result) {
					var source = {};
					source.legend = [''];
					source.data = {xData: [], yData: []};

					if(result && (result.errorCode == 0) && result.peopleCurve && (result.peopleCurve.length > 0)) {
						for (var i = 0; i < result.peopleCurve.length; i++) {
							source.data.xData[i] = result.peopleCurve[i].date.substring(5);
							source.data.yData[i] = result.peopleCurve[i].number;
						}
					}
					return source;
				}
				
				//生成平台用户数近一个月变化折线图参数
				function monthUserOptions(config, source) {
					return {
						tooltip: {
							trigger: 'axis'
						},
						legend: {
							data: source.legend
						},
						xAxis: [{ // 横坐标配置
							type: 'category',
							data: source.data.xData,
//							axisLabel: {
//								interval: 0
//							},
							splitLine: {
								lineStyle: {
									type: 'dashed'
								}
							}
						}],
						yAxis: [{ // 纵坐标配置
							type: 'value',
							splitLine: {
								lineStyle: {
									type: 'dashed'
								}
							}
						}],
						series: [{
							name: '用户数',
							type: 'line',
							data: source.data.yData,
							symbolSize: 0,
							
							areaStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
										offset: 0,
										color: 'rgba(53, 132, 234, 0.67)'
									}, {
										offset: 1,
										color: 'rgba(218, 245, 253, 0.33)'
									}])
								}
							}
						}],
						color: config.colors
					}
				}

				//昨日今日统计图表数据组装
				function formatTodayAndYesterdayUserData(result) {
					var source = {};
					source.legend = ['昨日', '今日'];
					source.data = [];
					source.axis = ['在线用户数', '注册用户', '实名用户', '投资人数'];

					if(result && (result.errorCode == 0)) {
						//昨日数据
						source.data.push({
							seriesName: '昨日',
							data: [result.yesterdayOnline,
								result.yesterdayRegisterAmount,
								result.yesterdayVerifiedInvestorAmount,
								result.yesterdayInvestorAmount
							]
						});
						//今日数据
						source.data.push({
							seriesName: '今日',
							data: [result.todayOnline,
								result.todayRegisterAmount,
								result.todayVerifiedInvestorAmount,
								result.todayInvestorAmount
							]
						});
					}
					return source;
				}

				// 生成纵向柱状图参数
				function barHorizontalOptions1(config, source, gridLeft, decimalNum, unitName) {

					var toolTipObj = {};
					var seriesData = [];

					//有数据的情况
					if(source && source.data && source.data.length > 0) {
						toolTipObj = { // 提示框
							trigger: 'axis', // 根据坐标触发,
							axisPointer: { // 坐标轴指示器，坐标轴触发有效
								type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
							},
							formatter: function(p) {
								var s = '';
								for(var i = 0; i < p.length; i++) {
									if(i == 0) {
										s += p[i].name + "<br/>";
									}
									if(unitName) {
										s += p[i].seriesName + "：" + numberFormatter(p[i].value, decimalNum) + unitName;
									} else {
										s += p[i].seriesName + "：" + numberFormatter(p[i].value, decimalNum);
									}
									if(i < (p.length - 1)) {
										s += '<br/>';
									}
								}
								return s;
							}
						};

						for(var i = 0; i < source.data.length; i++) {
							seriesData.push({
								name: source.data[i].seriesName,
								type: 'bar', // 柱状条
								data: source.data[i].data,
								label: { // 显示文字配置
									normal: {
										show: true,
										position: 'top',
										textStyle: {
											fontWeight: 'bold'
										},
										formatter: function(obj) { // 格式化
											return numberFormatter(obj.value, decimalNum);
										}
									}
								},
							});
						}

						//没有数据的情况
					} else {
						toolTipObj = { // 提示框
							trigger: 'axis', // 根据坐标触发
							formatter: "暂无相关数据"
						};
						seriesData.push({
							name: '',
							type: 'bar', // 柱状条1
							data: []
						});
					}

					return {
						tooltip: toolTipObj,
						legend: {
							data: source.legend
						},
						xAxis: [{ // 横坐标配置
							type: 'category',
							data: source.axis,
							axisLabel: {
								interval: 0
							},
							splitLine: {
								lineStyle: {
									type: 'dashed'
								}
							}
						}],
						yAxis: [{ // 纵坐标配置
							type: 'value',
							splitLine: {
								lineStyle: {
									type: 'dashed'
								}
							}
						}],
						series: seriesData,
						color: config.colors
					}
				}

				// 生成横向柱状图参数
				function barHorizontalOptions(config, source, seriesName, decimalNum, unitName) {
					source = source ? source : [];
					seriesName = seriesName ? seriesName : '';
					var maxValue = 0;
					for(var i = 0; i < source.length; i++) {
						if(source[i].yvalue > maxValue) {
							maxValue = source[i].yvalue;
						}
					}
					return {
						tooltip: { // 提示框
							trigger: 'axis', // 根据坐标触发
							axisPointer: { // 坐标轴指示器，坐标轴触发有效
								type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
							},
							formatter: function(p) {
								var i = p[0].seriesName + "<br/>" + p[0].name + "：" + numberFormatter(p[0].value, decimalNum);
								if(unitName) {
									return i + unitName;
								} else {
									return i;
								}
							}
						},
						grid: { // 调整图形区域的位置
							top: 10,
							left: 130,
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
								return item.xname
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
									position: 'outer',
									textStyle: {
										fontWeight: 'bold'
									},
									formatter: function(obj) { // 格式化
										return "\n" + numberFormatter(obj.value, decimalNum);
									}
								}
							},
							data: source.map(function(item) {
								return {
									value: item.yvalue,
									itemStyle: {
										normal: {
											label: {
												//柱状图超过50%时显示在内部，不足50%时显示在右侧
												position: (maxValue == 0 || item.yvalue / maxValue < 0.5) ? 'right' : 'insideRight'
											}
										}
									}
								}
							})
						}],
						color: config.colors
					}
				}

				// 生成纵向柱状图参数
				function barVerticalOptions(config, source, seriesName, decimalNum, unitName) {
					source = source ? source : [];
					seriesName = seriesName ? seriesName : '';
					return {
						tooltip: { // 提示框
							trigger: 'axis', // 根据坐标触发
							axisPointer: { // 坐标轴指示器，坐标轴触发有效
								type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
							},
							formatter: function(p) {
								var i = p[0].seriesName + "<br/>" + p[0].name + "：" + numberFormatter(p[0].value, decimalNum);
								if(unitName) {
									return i + unitName;
								} else {
									return i;
								}
							}
						},
						grid: { // 调整图形区域的位置
							top: 20,
							left: 80,
							right: 30,
							bottom: 30
						},
						xAxis: [{ // 横坐标配置 
							name: '', // 横坐标名称
							type: 'category', // 类型：分类类型  
							boundaryGap: true, // 左右都自动预留部分空间
							axisLabel: {
								interval: 0
							},
							data: source.map(function(item) {
								return item.xname
							})
						}],
						yAxis: [{ // 纵坐标配置
							name: '', // 纵坐标名称
							type: 'value', // 类型：值类型
							boundaryGap: ['0%', '20%'], // 左侧不多预留空间，右侧预留20%空间
							splitLine: {
								lineStyle: {
									show: true,
									type: 'dashed'
								}
							}
						}],
						series: [{ // 数据配置
							name: seriesName,
							type: 'bar', // 柱状条
							label: { // 显示文字配置
								normal: {
									show: true,
									position: 'top',
									textStyle: {
										fontWeight: 'bold'
									},
									formatter: function(obj) { // 格式化
										return numberFormatter(obj.value, decimalNum);
									},
									splitLine: {
										lineStyle: {
											show: true,
											type: 'dashed'
										}
									}
								}
							},
							data: source.map(function(item) {
								return item.yvalue;
							})
						}],
						color: config.colors
					}
				}

				// 生成实心饼图参数
				function pieSolidOptions(config, source, seriesName, decimalNum, unitName) {

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
						series: [{
							name: seriesName,
							type: 'pie',
							radius: '75%',
							center: ['50%', '50%'],
							label: {
								normal: {
									show: lavelShow,
									position: 'outer',
									formatter: function(obj) {
										return obj.name + ' ( ' + obj.percent + '% )'
									},
									textStyle: {
										fontWeight: 'bold'
									}
								}
							},
							itemStyle: {
								normal: {
									borderColor: '#fff',
									borderWidth: 2
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

				// 生成空心饼图参数
				function pieHollowOptions(config, source, seriesName, decimalNum, unitName) {

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
								return item.xname
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
									name: item.xname,
									value: item.yvalue
								}
							})
						}],
						color: config.colors
					}
				}

				function getToolTipFormatterText(source, format) {
					return(source && source.length > 0) ? format : "暂无相关数据";
				}

				function setDomHength() {

					for(var i = 0; i < _this.charDomId.length; i++) {
						if(i == 2) {

						} else {
							$("#" + _this.charDomId[i]).height($("#" + _this.charDomId[i]).width() * 0.4);
						}
					}

					//今日统计的2个图在一行，保持高度一致
//					$("#todayAndYesterdayInvest").height($("#todayAndYesterdayUser").width() * 0.4);

					//昨日各渠道投资额排序前5位和昨日产品新增投资额TOP5保持高度一致
					$("#bar-horizontalWap").height($("#bar-vertical").height());
					//昨日产品新增投资额TOP5图片实际高度设置
					if(_this.chartDataLength[1] > 0) {
						//昨日各渠道投资额排序前5位
						var chartHeigth = _this.chartDataLength[1] * 40 + 45;
						$("#" + _this.charDomId[2]).height(chartHeigth);

						//昨日产品新增投资额TOP5垂直居中显示
						$("#bar-horizontalWap").css("position", "relative");
						$("#" + _this.charDomId[2]).css("margin-top", -chartHeigth / 2);
						$("#" + _this.charDomId[2]).css("position", "absolute");
						$("#" + _this.charDomId[2]).css("top", "50%");
					}

				}

				function getArrLength(obj) {
					if(obj && obj.length) {
						return obj.length;
					}
				}

				function numberFormatter(val, i) {
					return $.number(val, i);
				}
			}
		}
	})