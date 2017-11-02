/**
 * 资产池存续期管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'AssetPoolDuration',
		init: function() {
			// 缓存标的名称数组值
			var targetNames = null
			// 缓存可用现金，单位（万元）
			var freeCash = 0
			// 缓存标的起购金额，单位（万元）
			var floorAmount = 0
			// 缓存标的申购上线，单位（万元）
			var remainAmount = 0
			// 缓存当前页资产池id、图标echarts对象、明细数据
			var pageState = {
				pid: util.nav.getHashObj(location.hash).id || '',
				year_days: 0, // 年化天数
				detail: null, //当前资产池明细数据
				mockData: [{
						date: '2015-01-01',
						yield: 0.12
					}, {
						date: '2015-01-02',
						yield: 0.43
					}, {
						date: '2015-01-03',
						yield: 0.53
					}, {
						date: '2015-01-04',
						yield: 0.61
					}, {
						date: '2015-01-05',
						yield: 0.02
					}, ] // 折线图假数据
				}
			// 净值校准--净值校准记录--点击审核时，保存当前订单的oid
			var marketOid = null
			// 净值校准--缓存前一日的 单位净值 * 份额
			var calcData = 0;
			// 净值校准--净交易额
			var calcOrders = 0;
			// 净值校准--份额
			var calcShares = 0;
			// 净值校准--单位净值
			var calcNav = 0;
			// 净值校准--净收益
			var calcProfit = 0;
			// 实际值--收益分配事件
			var incomeEventOid = null
			// 页面主tabs点击渲染图表
			$('#mainTab').find('li').each(function(index, item) {
				if (index) {
					$(item).on('shown.bs.tab', function() {
						initPieChartAndBarChart(pageState)
					})
				} else {
					$(item).on('shown.bs.tab', function() {
						initLineChart(pageState)
					})
				}
			})

			// 实际市值 脚本区域 start ==============================================================================================================================
			// 资产池历史估值表格配置
			var historyDetailPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			var historyDetailTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.assetPool.history.getAll, {
						data: historyDetailPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: historyDetailPageOptions.page,
				pageSize: historyDetailPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					historyDetailPageOptions.rows = val.limit
					historyDetailPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (historyDetailPageOptions.page - 1) * historyDetailPageOptions.rows + index + 1
					}
				}, {
					field: 'baseDate'
				}, {
					field: 'scale',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'feeValue',
					formatter: function(val) {
						return formatNumber(val)
					}
				}]
			}
			$('#historyDetailTable').bootstrapTable(historyDetailTableConfig)

			// 适配费率表格配置
			var feeDetailTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.assetPool.loadSetting, {
						data: {
							assetPoolOid: pageState.pid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return index + 1
					}
				}, {
					formatter: function(val, row) {
						if (row.endAmount) {
							return row.startAmount + '万 - ' + row.endAmount + '万'
						} else {
							return row.startAmount + '万以上'
						}
					}
				}, {
					field: 'feeRatio',
					formatter: function(val) {
						return val + '%'
					}
				}]
			}
			$('#feeDetailTable').bootstrapTable(feeDetailTableConfig)

			// 净值校准录入表单验证初始化
			$('#marketAdjustForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
				}
			})

			pageInit(pageState)

			// 控制初始化资产池的弹层
			var dispatchSign = 0;

			// 初始化资产池 - 按钮点击事件
			$('#nullAssetPoolButton').on('click', function() {
				dispatchSign = 1;
				$('#nullAssetPoolModal').modal('hide')
			})
			
			// 初始化资产池 - 监听事件
			$('#nullAssetPoolModal').on('hidden.bs.modal', function(e) {
				if (dispatchSign) {
					util.nav.dispatch('AssetPool', 'init=yes')
				}
			})

			// 费用明细 按钮点击事件
			$('#feeDetail').on('click', function() {
				var modal = $('#feeDetailModal')
				http.post(config.api.duration.assetPool.history.getAll, {
					data: {
						pid: pageState.pid,
					},
					contentType: 'form'
				}, function(json) {
					modal.modal('show')
				})
			})

			// 净值校准 按钮点击事件
			$('#marketAdjsut').on('click', function() {
				$('.ratioShow').removeAttr("style")
				$('.ratioMsg').css('display', 'none')
				
				var form = document.marketAdjustForm
				util.form.reset($(form))
				calcOrders = 0
				calcData = 0
				
				http.post(config.api.duration.market.getMarketAdjustData, {
					data: {
						pid: pageState.pid,
					},
					contentType: 'form'
				}, function(json) {
					var result = json.result
					document.marketAdjustForm.oid.value = result.oid
					document.marketAdjustForm.baseDate.value = result.baseDate
					document.marketAdjustForm.aversion.value = result.aversion
					
					// 缓存数据
					calcOrders = formatUnitToWan(result.lastOrders)
					calcData = util.safeCalc(result.lastNav, '*', formatUnitToWan(result.lastShares), 6)
					
					// 格式化数据
					result = resultDataFormatPlus(result, '')
					
					var modal = $('#marketAdjustModal')
					$$.detailAutoFix(modal, result)
					modal.modal('show')
				})
			})

			// 净值校准记录 表格配置
			var marketAdjustListPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			var marketAdjustListTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.market.getMarketAdjustList, {
						data: marketAdjustListPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: marketAdjustListPageOptions.page,
				pageSize: marketAdjustListPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					marketAdjustListPageOptions.rows = val.limit
					marketAdjustListPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (marketAdjustListPageOptions.page - 1) * marketAdjustListPageOptions.rows + index + 1
					}
				}, {
					field: 'baseDate'
				}, {
					field: 'shares',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'nav'
				}, {
					field: 'purchase',
					formatter: function(val) {
						if (val) {
							return formatNumber(val)
						}
					}
				}, {
					field: 'redemption',
					formatter: function(val) {
						if (val) {
							return formatNumber(val)
						}
					}
				}, {
					field: 'orders',
					formatter: function(val) {
						if (val) {
							return formatNumber(val)
						}
					}
				}, {
					field: 'ratio',
					formatter: function(val) {
						if (val === -999.99) {
							return '-'
						}
						return formatPercent(val)
					}
				}, {
					field: 'status',
					formatter: function(val, row) {

						if (val === 'create') {
							if (row.overtime === 'YES') {
								return '已过期,未审核'
							}
							return '待审核'
						}
						if (val === 'pass') {
							return '通过'
						}
						if (val === 'fail') {
							return '驳回'
						}

					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '查看详情',
							type: 'button',
							class: 'item-detail'
						}, {
							text: '审核',
							type: 'button',
							class: 'item-audit',
							isRender: row.status === 'create' && row.overtime === 'NO'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete',
							isRender: (row.status === 'fail') || (row.status ==='create' && row.overtime === 'YES')
						}]
						return util.table.formatter.generateButton(buttons, 'marketAdjustTable')
					},
					events: {
						'click .item-detail': function(e, val, row) {
							var modal = $('#marketAdjustAuditModal')
							$('#marketAdjustDoCheck').hide()
							http.post(config.api.duration.market.getMarketAdjust, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result
								result = resultDataFormatPlus(result, '')
								$$.detailAutoFix(modal, result)
							})
							$('#trustTitleName').html('净值校准详情')
							modal.modal('show')
						},
						'click .item-audit': function(e, val, row) {
							var modal = $('#marketAdjustAuditModal')
							$('#marketAdjustDoCheck').show()
							http.post(config.api.duration.market.getMarketAdjust, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result
								marketOid = result.oid
								result = resultDataFormatPlus(result, '')
								$$.detailAutoFix(modal, result)
							})
							$('#trustTitleName').html('净值校准录入审核')
							modal.modal('show')
						},
						'click .item-delete': function(e, val, row) {
							$$.confirm({
								container: $('#confirmModal'),
								trigger: this,
								accept: function() {
									http.post(config.api.duration.market.deleteMarketAdjust, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#marketAdjustTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}
			$('#marketAdjustTable').bootstrapTable(marketAdjustListTableConfig)
				// 净值校准记录 表格配置 end

			// 净值校准记录 - 保存按钮点击事件
			$('#doMarketAdjust').on('click', function() {
				var form = document.marketAdjustForm
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: config.api.duration.market.saveMarketAdjust,
					success: function(result) {
						if (result.errorCode != 0) {
							toastr.error(result.errorMessage, '错误信息', {
								timeOut: 3600000
							})
							return;
						} else {
							util.form.reset($(form))
							$('#marketAdjustTable').bootstrapTable('refresh')
							$('#marketAdjustModal').modal('hide')
							pageInit(pageState)
							yieldInit(pageState)
						}
					}
				})
			})

			// 净值校准录入审核 - 通过按钮点击事件
			$('#doMarketAdjustCheck').on('click', function() {
				var modal = $('#marketAdjustAuditModal')
				http.post(config.api.duration.market.auditMarketAdjust, {
					data: {
						oid: marketOid,
						type: 'pass'
					},
					contentType: 'form'
				}, function(json) {
					$('#marketAdjustTable').bootstrapTable('refresh')
					pageInit(pageState)
					yieldInit(pageState)
				})
				modal.modal('hide')
			})

			// 净值校准录入审核 - 不通过按钮点击事件
			$('#doMarketAdjustUnCheck').on('click', function() {
				var modal = $('#marketAdjustAuditModal')
				http.post(config.api.duration.market.auditMarketAdjust, {
					data: {
						oid: marketOid,
						type: 'not'
					},
					contentType: 'form'
				}, function(json) {
					$('#marketAdjustTable').bootstrapTable('refresh')
				})
				modal.modal('hide')
			})

			/**
			 * 净收益和收益率输入框input事件绑定
			 * 净值增长额 = T日总资产净值  - (T-1)日总资产净值 - T日确定净申赎额
			 * 净值增长率 = T日净值增长额  / (T-1)日总资产净值
			 */
			$(document.marketAdjustForm.shares).on('input', function() {
				calcShares = parseFloat(this.value) || 0
				var ratio = 0
				var calcPorfit = 0
				/*if (calcData === 0) {
					if (calcOrders === 0) {
						ratio = 100
						calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
					} else {
						calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
						calcProfit = util.safeCalc(calcProfit, '-', calcOrders, 6)
						ratio = util.safeCalc(calcProfit, '/', calcOrders, 6)
						ratio = util.safeCalc(ratio, '*', 100, 5)
						ratio = util.safeCalc(ratio, '*', pageState.year_days, 2)
					}
				} else {
					calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
					calcProfit = util.safeCalc(calcProfit, '-', calcData, 6)
					calcProfit = util.safeCalc(calcProfit, '-', calcOrders, 6)
					ratio = util.safeCalc(calcProfit, '/', calcData, 6)
					ratio = util.safeCalc(ratio, '*', 100, 5)
					ratio = util.safeCalc(ratio, '*', pageState.year_days, 2)
				}*/
				calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
				calcProfit = util.safeCalc(calcProfit, '-', calcData, 6)
				calcProfit = util.safeCalc(calcProfit, '-', calcOrders, 6)
				if (calcData === 0) {
					$('.ratioShow').css('display', 'none')
					$('.ratioMsg').css('display', 'block')
					document.marketAdjustForm.ratio.value = -99999
				} else {
					ratio = util.safeCalc(calcProfit, '/', calcData, 6)
					ratio = util.safeCalc(ratio, '*', 100, 5)
					ratio = util.safeCalc(ratio, '*', pageState.year_days, 2)
					document.marketAdjustForm.ratio.value = ratio
				}
				document.marketAdjustForm.profit.value = calcProfit
			})
			$(document.marketAdjustForm.nav).on('input', function() {
				calcNav = parseFloat(this.value) || 0
				var ratio = 0
				var calcPorfit = 0
				/*if (calcData === 0) {
					if (calcOrders === 0) {
						ratio = 100
						calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
					} else {
						calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
						calcProfit = util.safeCalc(calcProfit, '-', calcOrders, 6)
						ratio = util.safeCalc(calcProfit, '/', calcOrders, 6)
						ratio = util.safeCalc(ratio, '*', 100, 5)
						ratio = util.safeCalc(ratio, '*', pageState.year_days, 2)
					}
				} else {
					calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
					calcProfit = util.safeCalc(calcProfit, '-', calcData, 6)
					calcProfit = util.safeCalc(calcProfit, '-', calcOrders, 6)
					ratio = util.safeCalc(calcProfit, '/', calcData, 6)
					ratio = util.safeCalc(ratio, '*', 100, 5)
					ratio = util.safeCalc(ratio, '*', pageState.year_days, 2)
				}*/
				calcProfit = util.safeCalc(calcNav, '*', calcShares, 4)
				calcProfit = util.safeCalc(calcProfit, '-', calcData, 6)
				calcProfit = util.safeCalc(calcProfit, '-', calcOrders, 6)
				if (calcData === 0) {
					$('.ratioShow').css('display', 'none')
					$('.ratioMsg').css('display', 'block')
					document.marketAdjustForm.ratio.value = -99999
				} else {
					ratio = util.safeCalc(calcProfit, '/', calcData, 6)
					ratio = util.safeCalc(ratio, '*', 100, 5)
					ratio = util.safeCalc(ratio, '*', pageState.year_days, 2)
					document.marketAdjustForm.ratio.value = ratio
				}
				document.marketAdjustForm.profit.value = calcProfit
			})

			// 实际市值 脚本区域 end ==============================================================================================================================

			// 资产池估值 脚本区域 start ==============================================================================================================================
			// 资产池切换列表
			http.post(config.api.duration.assetPool.getNameList, function(json) {
				var assetPoolOptions = ''
				var select = document.searchForm.assetPoolName
				json.rows.forEach(function(item) {
					assetPoolOptions += '<option value="' + item.oid + '">' + item.name + '</option>'
				})
				$(select).html(assetPoolOptions)
			})

			// 改变资产池后刷新页面
			$(document.searchForm.assetPoolName).on('change', function() {
					pageState.pid = orderingToolPageOptions.pid = toolPageOptions.pid = orderingTrustPageOptions.pid = trustPageOptions.pid = accountDetailPageOptions.pid = this.value
					marketAdjustListPageOptions.pid = this.value
					pdListPageOptions.assetPoolOid = this.value
					repaymentSchedulePageOptions.pid = this.value
					pageInit(pageState)
					$('#marketAdjustTable').bootstrapTable('refresh')
					$('#profitDistributeTable').bootstrapTable('refresh')

					$('#orderingToolTable').bootstrapTable('refresh')
					$('#toolTable').bootstrapTable('refresh')
					$('#orderingTrustTable').bootstrapTable('refresh')
					$('#trustTable').bootstrapTable('refresh')
				})
				// 申购金额验证
			$('#buyAssetForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validpurchaseamount: validpurchaseamount,
					validpurchasecashfortrust: validpurchasecashfortrust,
					validpurchaseamountforfund: validpurchaseamountforfund,
					validpurchaseamountfortrust: validpurchaseamountfortrust
				},
				errors: {
					validfloat: '数据格式不正确',
					validpurchaseamount: '申购金额不能小于等于0，且不可超过可用现金',
					validpurchasecashfortrust: '申购金额不能小于等于0，且不可超过可用现金',
					validpurchaseamountforfund: '申购金额不能小于等于0，且不可超过可用现金',
					validpurchaseamountfortrust: '申购额度不能小于起购额度，且不可超过剩余额度'
				}
			})

			// 资产申购类型radio change事件
			$(document.buyAssetForm.buyType).on('ifChecked', function() {
				$(document.buyAssetForm.applyVolume).val('')
				$(document.buyAssetForm.applyCash).val('')
				if (this.value === 'fund') {
					$('#buyAssetShowFund').show()
					$('#buyAssetShowTrust').hide()
					$('#buyAssetShowTrans').hide()
					$('#profitType').hide().find(':input').attr('disabled', 'disabled')
					$('#transVolumeDiv').hide().find(':input').attr('disabled', 'disabled')
					$('#transCashDiv').show().find(':input').attr('disabled', false)
					$(document.buyAssetForm.passUrl).val('fund')
				} else if (this.value === 'trust') {
					$('#buyAssetShowFund').hide()
					$('#buyAssetShowTrust').show()
					$('#buyAssetShowTrans').hide()
					$('#profitType').show().find(':input').attr('disabled', false)
					$('#transVolumeDiv').show().find(':input').attr('disabled', false)
					$('#transCashDiv').hide().find(':input').attr('disabled', 'disabled')
					$(document.buyAssetForm.passUrl).val('trust')
					$('#trustTargetName').trigger('change')
				} else {
					$('#buyAssetShowFund').hide()
					$('#buyAssetShowTrust').hide()
					$('#buyAssetShowTrans').show()
					$('#profitType').show().find(':input').attr('disabled', false)
					$('#transVolumeDiv').show().find(':input').attr('disabled', false)
					$('#transCashDiv').show().find(':input').attr('disabled', false)
					$(document.buyAssetForm.passUrl).val('trans')
					$('#transTargetName').trigger('change')
				}
				// 资产申购表单验证重置
				$('#buyAssetForm').validator('destroy')
					// 申购金额验证
				$('#buyAssetForm').validator({
					custom: {
						validfloat: util.form.validator.validfloat,
						validpurchaseamount: validpurchaseamount,
						validpurchasecashfortrust: validpurchasecashfortrust,
						validpurchaseamountforfund: validpurchaseamountforfund,
						validpurchaseamountfortrust: validpurchaseamountfortrust
					},
					errors: {
						validfloat: '数据格式不正确',
						validpurchaseamount: '申购金额不能小于等于0，且不可超过可用现金',
						validpurchasecashfortrust: '申购金额不能小于等于0，且不可超过可用现金',
						validpurchaseamountforfund: '申购金额不能小于等于0，且不可超过可用现金',
						validpurchaseamountfortrust: '申购额度不能小于起购额度，且不可超过剩余额度'
					}
				})
			})

			// 资产申购按钮点击事件
			$('#buyAsset').on('click', function() {
				http.post(config.api.duration.target.getTargetList, {
					data: {
						pid: pageState.pid
					},
					contentType: 'form'
				}, function(json) {
					targetNames = json
					var fundTargetNameOptions = ''
					var trustTargetNameOptions = ''
					var transTargetNameOptions = ''
					json.fund.forEach(function(item) {
						fundTargetNameOptions += '<option value="' + item.cashtoolOid + '">' + item.cashtoolName + '</option>'
						
						// 格式化数据
						item = buyDataFormat(item)
					})
					json.trust.forEach(function(item) {
						trustTargetNameOptions += '<option value="' + item.targetOid + '">' + item.targetName + '</option>'
						
						// 格式化数据
						item = buyDataFormat(item)
					})
					json.trans.forEach(function(item) {
						transTargetNameOptions += '<option value="' + item.t_targetOid + '">' + item.t_targetName + '</option>'
						
						// 格式化数据
						item = buyDataFormat(item)
					
					})
					$('#fundTargetName').html(fundTargetNameOptions).trigger('change')
					$('#trustTargetName').html(trustTargetNameOptions).trigger('change')
					$('#transTargetName').html(transTargetNameOptions).trigger('change')
					document.buyAssetForm.assetPoolOid.value = pageState.pid
				})
				$('#buyAssetModal').modal('show')
			})

			// 资产申购标的名称下拉菜单change事件 - 现金管理工具
			$('#fundTargetName').on('change', function() {
				var source = targetNames.fund.filter(function(item) {
					return item.cashtoolOid === this.value
				}.bind(this))
				if (source[0]) {
					$$.formAutoFix($('#buyAssetForm'), source[0])
				}
			})
			
			// 资产申购标的名称下拉菜单change事件 - 投资标的
			$('#trustTargetName').on('change', function() {
				var source = targetNames.trust.filter(function(item) {
					return item.targetOid === this.value
				}.bind(this))
				if (source[0]) {
					$$.formAutoFix($('#buyAssetForm'), source[0])
				}
			})
			
			// 资产申购标的名称下拉菜单change事件 - 投资标的转入
			$('#transTargetName').on('change', function() {
				var source = targetNames.trans.filter(function(item) {
					return item.t_targetOid === this.value
				}.bind(this))
				if (source[0]) {
					$$.formAutoFix($('#buyAssetForm'), source[0])
				}
			})

			// 资产申购 - 提交审核按钮点击事件
			$('#doBuyAsset').on('click', function() {
				var form = document.buyAssetForm
				var url = form.passUrl.value
				if (form.passUrl.value === 'fund') {
					url = config.api.duration.order.fund.purchase.purchaseForFund
				} else if (form.passUrl.value === 'trust') {
					url = config.api.duration.order.trust.purchase.purchaseForTrust
				} else {
					url = config.api.duration.order.trust.trans.purchaseForTrans
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#orderingTrustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#buyAssetModal').modal('hide')
					}
				})
			})

			// 还款计划按钮点击事件
			$('#showRepayment').on('click', function() {
				$('#repaymentScheduleTable').bootstrapTable('refresh')
				$('#repaymentScheduleModal').modal('show')
			})

			// 还款计划表格配置
			var repaymentSchedulePageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			var repaymentScheduleTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.target.getRepaymentScheduleList, {
						data: repaymentSchedulePageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: repaymentSchedulePageOptions.page,
				pageSize: repaymentSchedulePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					repaymentSchedulePageOptions.rows = val.limit
					repaymentSchedulePageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (repaymentSchedulePageOptions.page - 1) * repaymentSchedulePageOptions.rows + index + 1
					}
				}, {
					field: 'targetName'
				}, {
					field: 'repaymentDate'
				}, {
					field: 'repaymentAmount',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'type',
					formatter: function(val) {
						return '本息兑付'
							/*if (val === 'capital') {
								return '本金兑付'
							} else {
								return '利息兑付'
							}*/
					}
				}]
			}
			$('#repaymentScheduleTable').bootstrapTable(repaymentScheduleTableConfig)

			// 出入金明细按钮点击事件
			$('#showAccountDetail').on('click', function() {
				$('#accountDetailTable').bootstrapTable('refresh')
				$('#accountDetailModal').modal('show')
			})

			// 出入金明细表格配置
			var accountDetailPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			var accountDetailTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.assetPool.getAllCapitalList, {
						data: accountDetailPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: accountDetailPageOptions.page,
				pageSize: accountDetailPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					accountDetailPageOptions.rows = val.limit
					accountDetailPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (accountDetailPageOptions.page - 1) * accountDetailPageOptions.rows + index + 1
					}
				}, {
					field: 'subject'
				}, {
					field: 'createTime'
				}, {
					field: 'operation'
				}, {
					field: 'capital',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'status'
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '查看详情',
							type: 'button',
							class: 'item-detail'
						}]
						return util.table.formatter.generateButton(buttons, 'accountDetailTable')
					},
					events: {
						// 出入金明细-查看详情
						'click .item-detail': function(e, val, row) {
							http.post(config.api.duration.order.getTargetOrderByOidForCapital, {
								data: {
									oid: row.orderOid,
									operation: row.operation
								},
								contentType: 'form'
							}, function(json) {
								// 操作类型（现金管理工具申购，现金管理工赎回，投资标的申购，本息兑付，投资标的转入，投资标的转让）
								if (row.operation === '现金管理工具申购' || row.operation === '现金管理工赎回') {
									var result = json.result
									result = resultDataFormatPlus(result, '元')
									if (row.operation === '现金管理工具申购') {
										$('#applyVolume').show()
										$('#investDate').show()
										$('#redeemVolume').hide()
										$('#redeemDate').hide()
									} else {
										$('#applyVolume').hide()
										$('#investDate').hide()
										$('#redeemVolume').show()
										$('#redeemDate').show()
									}
									$$.detailAutoFix($('#fundDetailModal'), result)
									$('#fundDetailModal').modal('show')
								} else if (row.operation === '投资标的申购') {
									var result = json.result
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix($('#trustDetailModal'), result)
									$('#trustDetailModal').modal('show')
								} else if (row.operation === '本息兑付') {
									var result = json.result.incomeForm
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix($('#trustIncomeOrderDetailModal'), result)
									$('#trustIncomeOrderDetailModal').modal('show')
								} else if (row.operation === '退款') {
									var result = json.result.incomeForm
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix($('#trustBackOrderDetailModal'), result)
									$('#trustBackOrderDetailModal').modal('show')
								} else if (row.operation === '投资标的转入' || row.operation === '投资标的转让') {
									var result = json.result
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix($('#trustTransOrderDetailModal'), result)
									$('#trustTransOrderDetailModal').modal('show')
								}
							})
						}
					}
				}]
			}
			$('#accountDetailTable').bootstrapTable(accountDetailTableConfig)

			// 预约中现金管理类工具分页信息
			var orderingToolPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			
			// 预约中现金管理类工具表格配置
			var orderingToolTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.target.getFundListForAppointment, {
						data: orderingToolPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: orderingToolPageOptions.page,
				pageSize: orderingToolPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					orderingToolPageOptions.rows = val.limit
					orderingToolPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return (orderingToolPageOptions.page - 1) * orderingToolPageOptions.rows + index + 1
						}
					}, {
						field: 'cashtoolName'
					}, {
						field: 'cashtoolType',
						formatter: function(val) {
							return util.enum.transform('CASHTOOLTYPE', val)
						}
					}, {
						field: 'netRevenue',
						formatter: function(val) {
							return $.number(val, 2)
						}
					}, {
						field: 'yearYield7',
						formatter: function(val) {
							return formatPercent(val)
						}
					},
					{
						field: 'applyCash',
						formatter: function(val) {
							return formatNumber(val)
						}
					}, {
						field: 'optType',
						formatter: function(val) {
							return val === 'purchase' ? '申购' : '赎回'
						}
					}, {
						field: 'state',
						formatter: function(val) {
							switch (val) {
								case '00':
									return '<span class="text-aqua">待审核</span>'
								case '10':
									return '<span class="text-red">审核未通过</span>'
								case '11':
									return '<span class="text-blue">审核通过待预约</span>'
								case '20':
									return '<span class="text-red">预约未通过</span>'
								case '21':
									return '<span class="text-yellow">预约通过待确认</span>'
								case '30':
									return '<span class="text-red">确认未通过</span>'
							}
						}
					}, {
						width: 180,
						align: 'center',
						formatter: function(val, row) {
							var buttons = [{
								text: '审核',
								type: 'button',
								class: 'item-audit',
								isRender: parseInt(row.state) === 0
							}, {
								text: '预约',
								type: 'button',
								class: 'item-ordering',
								isRender: parseInt(row.state) === 0 || parseInt(row.state) === 11
							}, {
								text: '确认',
								type: 'button',
								class: 'item-accpet',
								isRender: parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 21
							}, {
								text: '查看详情',
								type: 'button',
								class: 'item-detail',
								isRender: parseInt(row.state) === 10 || parseInt(row.state) === 20 || parseInt(row.state) === 30
							}, {
								text: '删除',
								type: 'button',
								class: 'item-delete',
								isRender: parseInt(row.state) === 10 || parseInt(row.state) === 20 || parseInt(row.state) === 30
							}]
							return util.table.formatter.generateButton(buttons, 'orderingToolTable')
						},
						events: {
							// 预约中现金管理工具-审核
							'click .item-audit': function(e, val, row) {
								var modal = null
								var form = null;
								if (row.optType === 'purchase') {
									modal = $('#fundCheckModal')
									form = document.fundCheckForm
								} else {
									modal = $('#fundRedeemCheckModal')
									form = document.fundRedeemCheckForm
								}
								http.post(config.api.duration.order.getFundOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									util.form.reset($(form))
									form.oid.value = result.oid
									form.applyCash = formatUnitToWan(result.applyCash)
									form.cashtoolOid.value = result.cashtoolOid
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									$(form).validator({
										custom: {
											validfloatforplus: util.form.validator.validfloatforplus,
											validauditamount: validauditamount,
										},
										errors: {
											validfloatforplus: '数据格式不正确',
											validauditamount: '请按实际值录入，可能会导致可用现金为负值',
										}
									})
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '元')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中现金管理工具-预约
							'click .item-ordering': function(e, val, row) {
								var modal = null
								var form = null;
								if (row.optType === 'purchase') {
									modal = $('#fundCheckModal')
									form = document.fundCheckForm
								} else {
									modal = $('#fundRedeemCheckModal')
									form = document.fundRedeemCheckForm
								}
								http.post(config.api.duration.order.getFundOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									util.form.reset($(form))
									form.oid.value = result.oid
									form.applyCash = formatUnitToWan(result.applyCash)
									form.cashtoolOid.value = result.cashtoolOid
									form.opType.value = 'ordering'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									$(form).validator({
										custom: {
											validfloatforplus: util.form.validator.validfloatforplus,
											validauditamount: validauditamount,
										},
										errors: {
											validfloatforplus: '数据格式不正确',
											validauditamount: '请按实际值录入，可能会导致可用现金为负值',
										}
									})
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '元')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中现金管理工具-确认
							'click .item-accpet': function(e, val, row) {
								var modal = null
								var form = null;
								if (row.optType === 'purchase') {
									modal = $('#fundCheckModal')
									form = document.fundCheckForm
								} else {
									modal = $('#fundRedeemCheckModal')
									form = document.fundRedeemCheckForm
								}
								http.post(config.api.duration.order.getFundOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									util.form.reset($(form))
									form.oid.value = result.oid
//										form.applyCash.value = formatUnitToWan(result.applyCash)
									form.cashtoolOid.value = result.cashtoolOid
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 2) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									$(form).validator({
										custom: {
											validfloatforplus: util.form.validator.validfloatforplus,
											validauditamount: validauditamount,
										},
										errors: {
											validfloatforplus: '数据格式不正确',
											validauditamount: '请按实际值录入，可能会导致可用现金为负值',
										}
									})
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'block'
									})
									result = resultDataFormatPlus(result, '元')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中现金管理工具-查看详情
							'click .item-detail': function(e, val, row) {
								var modal = $('#fundOrderDetailModal')
								if (row.optType === 'purchase') {
									$('#orderPurchaseArea').show()
									$('#orderRedeemArea').hide()
								} else {
									$('#orderPurchaseArea').hide()
									$('#orderRedeemArea').show()
								}
								http.post(config.api.duration.order.getFundOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'block'
									})
									result = resultDataFormatPlus(result, '元')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中现金管理工具-删除
							'click .item-delete': function(e, val, row) {
								$$.confirm({
									container: $('#confirmModal'),
									trigger: this,
									accept: function() {
										http.post(config.api.duration.order.delete, {
											data: {
												oid: row.oid,
												operation: '现金管理工具'
											},
											contentType: 'form'
										}, function() {
											$('#orderingToolTable').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				]
			}
			
			// 预约中现金管理类工具表格初始化
			$('#orderingToolTable').bootstrapTable(orderingToolTableConfig)

			// 现金管理类工具分页信息
			var toolPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			
			// 现金管理类工具表格配置
			var toolTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.target.getFundList, {
						data: toolPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: toolPageOptions.page,
				pageSize: toolPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					toolPageOptions.rows = val.limit
					toolPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				onLoadSuccess: function() {},
				columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return (toolPageOptions.page - 1) * toolPageOptions.rows + index + 1
						}
					}, {
						field: 'cashtoolName'
					}, {
						field: 'cashtoolType',
						formatter: function(val) {
							return util.enum.transform('CASHTOOLTYPE', val)
						}
					}, {
						field: 'netRevenue',
						formatter: function(val) {
							return $.number(val, 2)
						}
					}, {
						field: 'yearYield7',
						formatter: function(val) {
							return formatPercent(val)
						}
					}, {
						field: 'incomeDate'
					}, {
						field: 'amount',
						formatter: function(val) {
							return formatNumber(val)
						}
					}, {
						field: 'redeemVolume',
						formatter: function(val) {
							return formatNumber(val)
						}
					}, {
						field: 'dailyProfit',
						formatter: function(val) {
							return formatNumber(val)
						}
					},
					{
						width: 150,
						align: 'center',
						formatter: function() {
							var buttons = [
								{
									text: '赎回',
									type: 'button',
									class: 'item-redeem'
								}, {
									text: '纠偏',
									type: 'button',
									class: 'item-update'
								}
							]
							return util.table.formatter.generateButton(buttons, 'toolTable')
						},
						events: {
							// 现金管理工具-申购
							'click .item-purchase': function(e, val, row) {
								http.post(config.api.duration.order.getFundByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									util.form.reset($('#purchaseForm'))
									var result = json.result
									result = resultDataFormat(result)
									$$.formAutoFix($('#purchaseForm'), result)
								})
								$('#purchaseModal').modal('show')
							},
							// 现金管理工具-赎回
							'click .item-redeem': function(e, val, row) {
								http.post(config.api.duration.order.getFundByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									util.form.reset($('#redeemForm'))
									var result = json.result
									result = resultDataFormat(result)
									$$.formAutoFix($('#redeemForm'), result)
								})
								$('#redeemModal').modal('show')
							},
							// 现金管理工具-纠偏
							'click .item-update': function(e, val, row) {
								http.post(config.api.duration.order.getFundByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									util.form.reset($(document.updateFundVolumeForm))
									document.updateFundVolumeForm.oid.value = json.result.oid
									json.result = resultDataFormatPlus(json.result, '元')
									$$.detailAutoFix($('#updateFundVolumeModal'), json.result)
									$('#updateFundVolumeModal').modal('show')
								})
							}
						}
					}
				]
			}
			
			// 现金管理类工具表格初始化
			$('#toolTable').bootstrapTable(toolTableConfig)
			
			// 现金管理类工具 - 申购表格验证初始化
			util.form.validator.init($('#purchaseForm'))
			// 现金管理类工具 - 赎回表格验证初始化
			//			util.form.validator.init($('#redeemForm'))
			
			// 现金管理类工具 申购 审核/预约/确认 - 通过按钮点击事件
			$('#doFundCheck').on('click', function() {
				var form = document.fundCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.fund.purchase.auditForPurchase
						break
					case 'ordering':
						url = config.api.duration.order.fund.purchase.appointmentForPurchase
						break
					default:
						url = config.api.duration.order.fund.purchase.orderConfirmForPurchase
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#fundCheckModal').modal('hide')
					}
				})
			})

			// 现金管理类工具 申购 审核/预约/确认 - 不通过按钮点击事件
			$('#doFundUnCheck').on('click', function() {
				var form = document.fundCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.fund.purchase.auditForPurchase
						break
					case 'ordering':
						url = config.api.duration.order.fund.purchase.appointmentForPurchase
						break
					default:
						url = config.api.duration.order.fund.purchase.orderConfirmForPurchase
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#fundCheckModal').modal('hide')
					}
				})
			})

			// 现金管理类工具 赎回 审核/预约/确认 - 通过按钮点击事件
			$('#doFundRedeemCheck').on('click', function() {
				var form = document.fundRedeemCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.fund.redeem.auditForRedeem
						break
					case 'ordering':
						url = config.api.duration.order.fund.redeem.appointmentForRedeem
						break
					default:
						url = config.api.duration.order.fund.redeem.orderConfirmForRedeem
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#fundRedeemCheckModal').modal('hide')
					}
				})
			})

			// 现金管理类工具 赎回 审核/预约/确认 - 不通过按钮点击事件
			$('#doFundRedeemUnCheck').on('click', function() {
				var form = document.fundRedeemCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.fund.redeem.auditForRedeem
						break
					case 'ordering':
						url = config.api.duration.order.fund.redeem.appointmentForRedeem
						break
					default:
						url = config.api.duration.order.fund.redeem.orderConfirmForRedeem
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#fundRedeemCheckModal').modal('hide')
					}
				})
			})
			
			// 现金管理类工具 - 申购弹窗 - 提交审核按钮点击事件
			$('#doPurchase').on('click', function() {
				var form = document.purchaseForm
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: config.api.duration.order.fund.purchase.purchaseForFund,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#purchaseModal').modal('hide')
					}
				})
			})
			
			// 现金管理类工具 - 赎回弹窗 - 提交审核按钮点击事件
			$('#doRedeem').on('click', function() {
				var form = document.redeemForm
				if (!$(form).validator('doSubmitCheck')) return
				form.amount.value = parseFloat(form.amount.value.replace(/\,/g,""))
				$(form).ajaxSubmit({
					url: config.api.duration.order.fund.redeem.redeem,
					success: function() {
						util.form.reset($(form))
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#redeemModal').modal('hide')
					}
				})
			})
			
			// 预约中信托计划分页信息
			var orderingTrustPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			
			// 预约中信托计划表格配置
			var orderingTrustTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.target.getTrustListForAppointment, {
						data: orderingTrustPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: orderingTrustPageOptions.page,
				pageSize: orderingTrustPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					orderingTrustPageOptions.rows = val.limit
					orderingTrustPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				onLoadSuccess: function() {},
				columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return (orderingTrustPageOptions.page - 1) * orderingTrustPageOptions.rows + index + 1
						}
					}, {
						field: 'targetName'
					}, {
						field: 'expAror',
						formatter: function(val) {
							return formatPercent(val)
						}
					},
					{
						field: 'accrualType',
						formatter: function(val) {
							return util.enum.transform('ACCRUALTYPE', val)
						}
					}, {
						field: 'trustAmount',
						formatter: function(val) {
							return formatNumber(val)
						}
					}, {
						field: 'applyVolume',
						formatter: function(val) {
							return formatNumber(val)
						}
					}, {
						field: 'applyCash',
						formatter: function(val) {
							return formatNumber(val)
						}
					}, {
						field: 'subjectRating'
					}, {
						field: 'type'
					}, {
						field: 'profitType',
						formatter: function(val) {
							return 'amortized_cost' === val ? '摊余成本法' : '账面价值法'
						}
					}, {
						field: 'state',
						formatter: function(val) {
							switch (val) {
								case '00':
									return '<span class="text-aqua">待审核</span>'
								case '10':
									return '<span class="text-red">审核未通过</span>'
								case '11':
									return '<span class="text-blue">审核通过待预约</span>'
								case '12':
									return '<span class="text-blue">审核通过待确认</span>'
								case '20':
									return '<span class="text-red">预约未通过</span>'
								case '21':
									return '<span class="text-yellow">预约通过待确认</span>'
								case '30':
									return '<span class="text-red">确认未通过</span>'
							}
						}
					}, {
						width: 256,
						align: 'center',
						formatter: function(val, row) {
							// 操作类型（现金管理工具申购，现金管理工赎回，投资标的申购，本息兑付，投资标的转入，投资标的转让）
							var buttons = [{
								text: '审核',
								type: 'button',
								class: 'item-audit',
								isRender: row.type === '投资标的申购' && (parseInt(row.state) === 0)
							}, {
								text: '预约',
								type: 'button',
								class: 'item-ordering',
								isRender: row.type === '投资标的申购' && (parseInt(row.state) === 0 || parseInt(row.state) === 11)
							}, {
								text: '确认',
								type: 'button',
								class: 'item-accpet',
								isRender: row.type === '投资标的申购' && (parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 21)
							}, {
								text: '审核',
								type: 'button',
								class: 'item-trans-audit',
								isRender: row.type === '投资标的转入' && (parseInt(row.state) === 0)
							}, {
								text: '预约',
								type: 'button',
								class: 'item-trans-ordering',
								isRender: row.type === '投资标的转入' && (parseInt(row.state) === 0 || parseInt(row.state) === 11)
							}, {
								text: '确认',
								type: 'button',
								class: 'item-trans-accpet',
								isRender: row.type === '投资标的转入' && (parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 21)
							}, {
								text: '退款审核',
								type: 'button',
								class: 'item-back-audit',
								isRender: row.type === '退款' && (parseInt(row.state) === 0)
							}, {
								text: '退款确认',
								type: 'button',
								class: 'item-back-accpet',
								isRender: row.type === '退款' && (parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 12)
							}, {
								text: '本息兑付审核',
								type: 'button',
								class: 'item-income-audit',
								isRender: row.type === '本息兑付' && (parseInt(row.state) === 0)
							}, {
								text: '本息兑付确认',
								type: 'button',
								class: 'item-income-accpet',
								isRender: row.type === '本息兑付' && (parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 12)
							}, {
								text: '转让审核',
								type: 'button',
								class: 'item-transfer-audit',
								isRender: row.type === '投资标的转让' && (parseInt(row.state) === 0)
							}, {
								text: '转让确认',
								type: 'button',
								class: 'item-transfer-accpet',
								isRender: row.type === '投资标的转让' && (parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 12)
							}, {
								text: '逾期转让审核',
								type: 'button',
								class: 'item-overdue-transfer-audit',
								isRender: row.type === '投资标的逾期转让' && (parseInt(row.state) === 0)
							}, {
								text: '逾期转让确认',
								type: 'button',
								class: 'item-overdue-transfer-accpet',
								isRender: row.type === '投资标的逾期转让' && (parseInt(row.state) === 0 || parseInt(row.state) === 11 || parseInt(row.state) === 12)
							}, {
								text: '查看详情',
								type: 'button',
								class: 'item-detail',
								isRender: row.type === '投资标的申购' && (parseInt(row.state) === 10 || parseInt(row.state) === 20 || parseInt(row.state) === 30)
							}, {
								text: '查看详情',
								type: 'button',
								class: 'item-trans-detail',
								isRender: (row.type === '投资标的转入' || row.type === '投资标的转让') && (parseInt(row.state) === 10 || parseInt(row.state) === 20 || parseInt(row.state) === 30)
							}, {
								text: '查看详情',
								type: 'button',
								class: 'item-income-detail',
								isRender: row.type === '本息兑付' && (parseInt(row.state) === 10 || parseInt(row.state) === 20 || parseInt(row.state) === 30)
							}, {
								text: '删除',
								type: 'button',
								class: 'item-delete',
								isRender: parseInt(row.state) === 10 || parseInt(row.state) === 20 || parseInt(row.state) === 30
							}]
							return util.table.formatter.generateButton(buttons, 'orderingTrustTable')
						},
						events: {
							// 预约中信托计划-审核
							'click .item-audit': function(e, val, row) {
								var modal = $('#trustCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-转入审核
							'click .item-trans-audit': function(e, val, row) {
								var modal = $('#trustTransCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustTransCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.row')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'none'
									})
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-退款审核
							'click .item-back-audit': function(e, val, row) {
								var modal = $('#trustBackCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustBackCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result.incomeForm, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-本息兑付审核
							'click .item-income-audit': function(e, val, row) {
								var modal = $('#trustIncomeCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustIncomeCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.seq.value = result.seq
									form.type.value = row.type
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result.incomeForm, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-转让审核
							'click .item-transfer-audit': function(e, val, row) {
								var modal = $('#transCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.transCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.row')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-逾期转让审核
							'click .item-overdue-transfer-audit': function(e, val, row) {
								var modal = $('#transOverdueCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.transOverdueCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'audit'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (!index) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									result.holdAmount = result.applyVolume
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-预约
							'click .item-ordering': function(e, val, row) {
								var modal = $('#trustCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'ordering'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'block'
									})
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-转入预约
							'click .item-trans-ordering': function(e, val, row) {
								var modal = $('#trustTransCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustTransCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'ordering'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.row')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'block'
									})
									modal.find('.labelForOrdering').css({
										display: 'none'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-确认
							'click .item-accpet': function(e, val, row) {
								var modal = $('#trustCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 2) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'block'
									})
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-转让确认
							'click .item-trans-accpet': function(e, val, row) {
								var modal = $('#trustTransCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustTransCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.row')
									formGroups.each(function(index, item) {
										if (index === 2) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'block'
									})
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-退款确认
							'click .item-back-accpet': function(e, val, row) {
								var modal = $('#trustBackCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustBackCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result.incomeForm, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-本息兑付确认
							'click .item-income-accpet': function(e, val, row) {
								var modal = $('#trustIncomeCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.trustIncomeCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.seq.value = result.seq
									form.type.value = row.type
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result.incomeForm, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-转让确认
							'click .item-transfer-accpet': function(e, val, row) {
								var modal = $('#transCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.transCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.row')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-逾期转让确认
							'click .item-overdue-transfer-accpet': function(e, val, row) {
								var modal = $('#transOverdueCheckModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									var form = document.transOverdueCheckForm
									util.form.reset($(form))
									form.oid.value = result.oid
									form.type.value = row.type
									form.opType.value = 'accept'
									form.assetPoolOid.value = pageState.pid
									var formGroups = $(form).find('.form-group')
									formGroups.each(function(index, item) {
										if (index === 1) {
											$(item).css({
												display: 'block'
											}).find('input').attr('disabled', false)
										} else {
											$(item).css({
												display: 'none'
											}).find('input').attr('disabled', 'disabled')
										}
									})
									$(form).validator('destroy')
									util.form.validator.init($(form))
									modal.find('.labelForAudit').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'none'
									})
									result = resultDataFormatPlus(result, '份')
									result.holdAmount = result.applyVolume
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-查看详情
							'click .item-detail': function(e, val, row) {
								var modal = $('#trustOrderDetailModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'block'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-转入查看详情
							'click .item-trans-detail': function(e, val, row) {
								var modal = $('#trustTransOrderDetailModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'block'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-本息兑付查看详情
							'click .item-income-detail': function(e, val, row) {
								var modal = $('#trustIncomeOrderDetailModal')
								http.post(config.api.duration.order.getTrustOrderByOid, {
									data: {
										oid: row.oid,
										type: row.type
									},
									contentType: 'form'
								}, function(json) {
									var result = json.result.incomeForm
									modal.find('.labelForOrdering').css({
										display: 'block'
									})
									modal.find('.labelForAccept').css({
										display: 'block'
									})
									result = resultDataFormatPlus(result, '份')
									$$.detailAutoFix(modal, result)
								})
								modal.modal('show')
							},
							// 预约中信托计划-删除
							'click .item-delete': function(e, val, row) {
								currentPool = row
								$$.confirm({
									container: $('#confirmModal'),
									trigger: this,
									accept: function() {
										http.post(config.api.duration.order.delete, {
											data: {
												oid: row.oid,
												operation: row.type
											},
											contentType: 'form'
										}, function() {
											$('#orderingTrustTable').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				]
			}
			
			// 预约中信托计划表格初始化
			$('#orderingTrustTable').bootstrapTable(orderingTrustTableConfig)
			
			// 信托计划审核表单初始化
			util.form.validator.init($('#trustCheckForm'))
			
			// 缓存本息兑付期数信息
			var seqs = []
			
			// 信托计划分页信息
			var trustPageOptions = {
				page: 1,
				rows: 10,
				pid: pageState.pid
			}
			
			// 信托计划表格配置
			var trustTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.target.getTrustList, {
						data: trustPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: trustPageOptions.page,
				pageSize: trustPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					trustPageOptions.rows = val.limit
					trustPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				onLoadSuccess: function() {},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (trustPageOptions.page - 1) * trustPageOptions.rows + index + 1
					}
				}, {
					field: 'targetName'
				}, {
					field: 'expAror',
					formatter: function(val) {
						return formatPercent(val)
					}
				}, {
					field: 'incomeDate'
				}, {
					field: 'accrualType',
					formatter: function(val) {
						return util.enum.transform('ACCRUALTYPE', val)
					}
				}, {
					field: 'trustAmount',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'holdAmount',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'tranVolume',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'subjectRating'
				}, {
					field: 'profitType',
					formatter: function(val) {
						return 'amortized_cost' === val ? '摊余成本法' : '账面价值法'
					}
				}, {
					field: 'dailyProfit',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'totalProfit',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'state',
					formatter: function(val) {
						switch (val) {
							case 'PREPARE':
								return '<span class="text-aqua">募集期</span>'
							case 'STAND_UP':
								return '<span class="text-blue">成立</span>'
							case 'STAND_FAIL':
								return '<span class="text-blue">成立失败 </span>'
							case 'CLOSE':
								return '<span class="text-blue">结束</span>'
							case 'PAY_BACK':
								return '<span class="text-blue">兑付期 </span>'
							case 'OVER_TIME':
								return '<span class="text-blue">逾期 </span>'
							case 'RETURN_BACK':
								return '<span class="text-blue">本息兑付 </span>'
						}
					}
				}, {
					width: 180,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '本息兑付',
							type: 'button',
							class: 'item-income',
							// 只有已结束的标的才可以进行本息兑付
							isRender: (row.lifeState === 'normalIncome' || row.lifeState === 'overdueIncome') && parseInt(row.holdAmount) > 0
						}, {
							text: '转让',
							type: 'button',
							class: 'item-transfer',
							//							isRender: (row.state === 'PREPARE' || row.state === 'STAND_UP' || row.state === 'PAY_BACK') && parseInt(row.holdAmount) > 0
							isRender: row.state === 'STAND_UP' && parseInt(row.holdAmount) > 0
						}, {
							text: '逾期转让',
							type: 'button',
							class: 'item-overdue-transfer',
							isRender: row.lifeState === 'overdueTransfer' && parseInt(row.holdAmount) > 0
						}, {
							text: '退款',
							type: 'button',
							class: 'item-back',
							isRender: row.state === 'STAND_FAIL' && parseInt(row.holdAmount) > 0
						}, {
							text: '纠偏',
							type: 'button',
							class: 'item-update',
							isRender: row.state !== 'CLOSE'
						}, {
							text: '坏账核销确认',
							type: 'button',
							class: 'item-cancel',
							isRender: row.lifeState === 'targetCancel'
						}]
						return util.table.formatter.generateButton(buttons, 'trustTable')
					},
					events: {
						// 信托计划-本息兑付
						'click .item-income': function(e, val, row) {
							var form = document.trustIncomeForm
							util.form.reset($(form))
							$(form).validator('destroy')
							http.post(config.api.duration.order.getTrustByOid, {
								data: {
									oid: row.oid,
									type: 'income'
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result.incomeForm
								form.oid.value = json.result.oid
								form.assetPoolOid.value = json.result.assetPoolOid
								result = resultDataFormat(result)
								$$.formAutoFix($('#trustIncomeForm'), result)
									// 信托计划本息兑付表单初始化
								util.form.validator.init($(form))
							})
							$('#trustIncomeModal').modal('show')
						},
						
						// 信托计划-转让
						'click .item-transfer': function(e, val, row) {
							http.post(config.api.duration.order.getTrustByOid, {
								data: {
									oid: row.oid,
									type: 'transfer'
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result
								var form = document.trustTransferForm
								util.form.reset($(form))
								form.oid.value = result.oid
								form.assetPoolOid.value = pageState.pid
								form.tmpHoldAmount.value = formatUnitToWan(result.holdAmount)
								result = resultDataFormatPlus(result, '份')
								$$.detailAutoFix($('#trustTransferModal'), result)
							})
							$('#trustTransferModal').modal('show')
						},
						
						// 信托计划-逾期转让
						'click .item-overdue-transfer': function(e, val, row) {
							http.post(config.api.duration.order.getTrustByOid, {
								data: {
									oid: row.oid,
									type: 'overdue-transfer'
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result
								var form = document.trustOverdueTransferForm
								util.form.reset($(form))
								form.oid.value = result.oid
								form.assetPoolOid.value = pageState.pid
								form.tranVolume.value = formatUnitToWan(result.holdAmount)
								form.tmpHoldAmount.value = form.tranVolume.value
								result = resultDataFormatPlus(result, '份')
								$$.detailAutoFix($('#trustOverdueTransferModal'), result)
							})
							$('#trustOverdueTransferModal').modal('show')
						},
						
						// 信托计划-成立失败退款
						'click .item-back': function(e, val, row) {
							var form = document.trustBackForm
							util.form.reset($(form))
							$(form).validator('destroy')
							http.post(config.api.duration.order.getTrustByOid, {
								data: {
									oid: row.oid,
									type: 'back'
								},
								contentType: 'form'
							}, function(json) {
								form.oid.value = json.result.oid
								form.assetPoolOid.value = json.result.assetPoolOid
								form.investVolume.value = formatUnitToWan(json.result.investVolume)
								form.incomeRate.value = formatPercent(json.result.collectIncomeRate)
								if (json.result.incomeForm && json.result.incomeForm.expIncome) {
									form.income.value = formatUnitToWan(json.result.incomeForm.expIncome)
								}
								
								// 信托计划本息兑付表单初始化
								util.form.validator.init($(form))
							})
							$('#trustBackModal').modal('show')
						},
						
						// 信托计划-纠偏
						'click .item-update': function(e, val, row) {
							http.post(config.api.duration.order.getTrustByOid, {
								data: {
									oid: row.oid,
									type: row.type
								},
								contentType: 'form'
							}, function(json) {
								util.form.reset($(document.updateTrustVolumeForm))
								json.result.holdAmount = formatUnitToWan(json.result.holdAmount) + '\t万元'
								document.updateTrustVolumeForm.oid.value = json.result.oid
								$$.detailAutoFix($('#updateTrustVolumeModal'), json.result)
								$('#updateTrustVolumeModal').modal('show')
							})
						},
						
						// 信托计划-已坏账核销待确认
						'click .item-cancel': function(e, val, row) {
							$$.confirm({
								container: $('#confirmModal'),
								trigger: this,
								accept: function () {
									http.post(config.api.duration.order.cancelOrder, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(json) {
										$('#trustTable').bootstrapTable('refresh');
									})
								}
							})
						}
					}
				}]
			}
			
			// 信托计划表格初始化
			$('#trustTable').bootstrapTable(trustTableConfig)
			
			// 信托计划转让表单初始化
			//			util.form.validator.init($('#trustTransferForm'))

			// 信托计划逾期转让表单初始化
			util.form.validator.init($('#trustOverdueTransferForm'))
			
			// 当选择本金兑付时，显示本金
			$(document.trustIncomeForm.capitalFlag).on('ifChecked', function() {
				if (this.value === '1') {
					$('#capitalArea').show()
				} else {
					$('#capitalArea').hide()
				}
			})
			
			// 当选择本金兑付时，显示本金
			$(document.redeemForm.allFlag).on('ifChecked', function() {
				if (this.value === 'no') {
					$('#returnVolume').removeAttr('disabled')
					$("#redeemForm").validator('destroy')
					util.form.validator.init($('#redeemForm'))
				} else {
					$('#returnVolume').attr('disabled', 'disabled')
					$("#redeemForm").validator('destroy')
					util.form.validator.init($('#redeemForm'))
				}
			})
			
			// 当实际收益为0时，本金可编辑
			$(document.trustIncomeForm.income).on('focusout', function() {
				var val = this.value
				if (parseFloat(val) === 0) {
					$('#capitalInput').removeAttr('readonly')
				} else {
					$('#capitalInput').attr('readonly', 'readonly')
				}
			})
			
			// 申购金额验证
			//			$('#buyAssetForm').validator({
			//				custom: {
			//					validfloat: util.form.validator.validfloat,
			//					validpurchaseamountforfund: validpurchaseamountforfund,
			//					validpurchaseamountfortrust: validpurchaseamountfortrust
			//				},
			//				errors: {
			//					validfloat: '数据格式不正确',
			//					validpurchaseamountforfund: '申购金额不能小于等于0，且不可超过可用现金',
			//					validpurchaseamountfortrust: '申购金额不能小于起购金额，且不可超过剩余额度'
			//				}
			//			})
				
			// 赎回金额验证
			$('#redeemForm').validator({
				custom: {
					validredeemamount: validredeemamount
				},
				errors: {
					validredeemamount: '赎回份额不能为0，且不可超过持有额度'
				}
			})
			
			// 转让金额验证
			$('#trustTransferForm').validator({
				custom: {
					validtransamount: validtransamount,
					validfloat: util.form.validator.validfloat,
					validfloatforplus: util.form.validator.validfloatforplus
				},
				errors: {
					validtransamount: '转让份额不能为0，且不可超过持有额度',
					validfloat: '数据格式不正确',
					validfloatforplus: '数据格式不正确'
				}
			})
			
			// 本金不可超过申购时的金额
			$('#addAssetPoolForm').validator({
				custom: {
					validCapital: validCapital
				},
				errors: {
					validCapital: '本金不可超过申购时的金额'
				}
			})
			
			// 信托计划审核/预约/确认 - 通过按钮点击事件
			$('#doTrustCheck').on('click', function() {
				var form = document.trustCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.type.value) {
					case '投资标的申购':
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.purchase.auditForTrust
								break
							case 'ordering':
								url = config.api.duration.order.trust.purchase.appointmentForTrust
								break
							default:
								url = config.api.duration.order.trust.purchase.orderConfirmForTrust
								break
						}
						break
					case '投资标的转入':
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.trans.auditForTrans
								break
							case 'ordering':
								url = config.api.duration.order.trust.trans.appointmentForTrans
								break
							default:
								url = config.api.duration.order.trust.trans.orderConfirmForTrans
								break
						}
						break
					case '本息兑付':
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.income.auditForIncome
								break
							default:
								url = config.api.duration.order.trust.income.orderConfirmForIncome
								break
						}
						break
					default:
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.transfer.auditForTransfer
								break
							default:
								url = config.api.duration.order.trust.transfer.orderConfirmForTransfer
								break
						}
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function(rlt) {
						if(rlt.errorCode != 0) {
							toastr.error(rlt.errorMessage, '错误信息', {
								timeOut: 3600000
							})
							return;
						}
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustCheckModal').modal('hide')
					}
				})
			})

			// 信托计划审核/预约/确认 - 不通过按钮点击事件
			$('#doTrustUnCheck').on('click', function() {
				var form = document.trustCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.type.value) {
					case '投资标的申购':
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.purchase.auditForTrust
								break
							case 'ordering':
								url = config.api.duration.order.trust.purchase.appointmentForTrust
								break
							default:
								url = config.api.duration.order.trust.purchase.orderConfirmForTrust
								break
						}
						break
					case '投资标的转入':
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.trans.auditForTrans
								break
							case 'ordering':
								url = config.api.duration.order.trust.trans.appointmentForTrans
								break
							default:
								url = config.api.duration.order.trust.trans.orderConfirmForTrans
								break
						}
						break
					case '本息兑付':
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.income.auditForIncome
								break
							default:
								url = config.api.duration.order.trust.income.orderConfirmForIncome
								break
						}
						break
					default:
						switch (form.opType.value) {
							case 'audit':
								url = config.api.duration.order.trust.transfer.auditForTransfer
								break
							default:
								url = config.api.duration.order.trust.transfer.orderConfirmForTransfer
								break
						}
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustCheckModal').modal('hide')
					}
				})
			})
			
			// 信托计划转入审核/预约/确认 - 通过按钮点击事件
			$('#doTrustTransCheck').on('click', function() {
				var form = document.trustTransCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.trans.auditForTrans
						break
					case 'ordering':
						url = config.api.duration.order.trust.trans.appointmentForTrans
						break
					default:
						url = config.api.duration.order.trust.trans.orderConfirmForTrans
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustTransCheckModal').modal('hide')
					}
				})
			})

			// 信托计划转入审核/预约/确认 - 不通过按钮点击事件
			$('#doTrustTransUnCheck').on('click', function() {
				var form = document.trustTransCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.trans.auditForTrans
						break
					case 'ordering':
						url = config.api.duration.order.trust.trans.appointmentForTrans
						break
					default:
						url = config.api.duration.order.trust.trans.orderConfirmForTrans
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustTransCheckModal').modal('hide')
					}
				})
			})
			
			// 本息兑付审核/预约/确认 - 通过按钮点击事件
			$('#doIncomeCheck').on('click', function() {
				var form = document.trustIncomeCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.income.auditForIncome
						break
					default:
						url = config.api.duration.order.trust.income.orderConfirmForIncome
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustIncomeCheckModal').modal('hide')
					}
				})
			})

			// 本息兑付审核/预约/确认 - 不通过按钮点击事件
			$('#doIncomeUnCheck').on('click', function() {
				var form = document.trustIncomeCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.income.auditForIncome
						break
					default:
						url = config.api.duration.order.trust.income.orderConfirmForIncome
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustIncomeCheckModal').modal('hide')
					}
				})
			})

			// 信托计划退款表单初始化
			util.form.validator.init($('#trustBackForm'))

			// 信托计划退款表单验证初始化
			util.form.validator.init($('#trustBackCheckForm'))
			
			// 退款审核/预约/确认 - 通过按钮点击事件
			$('#doBackCheck').on('click', function() {
				var form = document.trustBackCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.back.auditForBack
						break
					default:
						url = config.api.duration.order.trust.back.orderConfirmForBack
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustBackCheckModal').modal('hide')
					}
				})
			})

			// 退款审核/预约/确认 - 不通过按钮点击事件
			$('#doBackUnCheck').on('click', function() {
				var form = document.trustBackCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.back.auditForBack
						break
					default:
						url = config.api.duration.order.trust.back.orderConfirmForBack
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustBackCheckModal').modal('hide')
					}
				})
			})
			
			// 转让审核/预约/确认 - 通过按钮点击事件
			$('#doTransCheck').on('click', function() {
				var form = document.transCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.transfer.auditForTransfer
						break
					default:
						url = config.api.duration.order.trust.transfer.orderConfirmForTransfer
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#transCheckModal').modal('hide')
					}
				})
			})

			// 转让审核/预约/确认 - 不通过按钮点击事件
			$('#doTransUnCheck').on('click', function() {
				var form = document.transCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.transfer.auditForTransfer
						break
					default:
						url = config.api.duration.order.trust.transfer.orderConfirmForTransfer
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#transCheckModal').modal('hide')
					}
				})
			})
			
			// 逾期转让审核/预约/确认 - 通过按钮点击事件
			$('#doOverdueTransCheck').on('click', function() {
				var form = document.transOverdueCheckForm
				form.state.value = '0'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.transfer.auditForOverdueTransfer
						break
					default:
						url = config.api.duration.order.trust.transfer.orderConfirmForOverdueTransfer
						break
				}
				if (!$(form).validator('doSubmitCheck')) return
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#transOverdueCheckModal').modal('hide')
					}
				})
			})

			// 逾期转让审核/预约/确认 - 不通过按钮点击事件
			$('#doOverdueTransUnCheck').on('click', function() {
				var form = document.transOverdueCheckForm
				form.state.value = '-1'
				var url = ''
				switch (form.opType.value) {
					case 'audit':
						url = config.api.duration.order.trust.transfer.auditForOverdueTransfer
						break
					default:
						url = config.api.duration.order.trust.transfer.orderConfirmForOverdueTransfer
						break
				}
				$(form).ajaxSubmit({
					url: url,
					success: function() {
						util.form.reset($(form))
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#transOverdueCheckModal').modal('hide')
					}
				})
			})
			
			// 信托计划 - 转让按钮点击事件
			$('#doTrustTransfer').on('click', function() {
				if (!$('#trustTransferForm').validator('doSubmitCheck')) return
				$('#trustTransferForm').ajaxSubmit({
					url: config.api.duration.order.trust.transfer.applyForTransfer,
					success: function() {
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustTransferModal').modal('hide')
					}
				})
			})
			
			// 信托计划 - 逾期转让按钮点击事件
			$('#doTrustOverdueTransfer').on('click', function() {
				if (!$('#trustOverdueTransferForm').validator('doSubmitCheck')) return
				$('#trustOverdueTransferForm').ajaxSubmit({
					url: config.api.duration.order.trust.transfer.applyForOverdueTransfer,
					success: function() {
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustOverdueTransferModal').modal('hide')
					}
				})
			})
			
			// 信托计划 - 本息兑付按钮点击事件
			$('#doTrustIncome').on('click', function() {
				if (!$('#trustIncomeForm').validator('doSubmitCheck')) return
				$('#trustIncomeForm').ajaxSubmit({
					url: config.api.duration.order.trust.income.applyForIncome,
					success: function() {
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustIncomeModal').modal('hide')
					}
				})
			})
			
			// 信托计划 - 退款按钮点击事件
			$('#doTrustBack').on('click', function() {
				if (!$('#trustBackForm').validator('doSubmitCheck')) return
				$('#trustBackForm').ajaxSubmit({
					url: config.api.duration.order.trust.back.applyForBack,
					success: function() {
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#trustBackModal').modal('hide')
					}
				})
			})
			
			// 修改资产池投资范围select2初始化
			//			$(document.updateAssetPoolForm.scopes).select2()
			
			// 修改资产池表单验证初始化
			$('#updateAssetPoolForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
				}
			})

			// 修改资产池现金表单验证初始化
			$('#updateAssetPoolCashForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
				}
			})

			// 修改资产池偏离损益表单验证初始化
			$('#updateAssetPoolProfitForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
				}
			})

			// 纠偏现金管理工具表单验证初始化
			$('#updateFundVolumeForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
				}
			})

			// 纠偏信托标的表单验证初始化
			$('#updateTrustVolumeForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
				}
			})
			
			// 编辑账户按钮点击事件
			$('#updateAccount').on('click', function() {
				http.post(config.api.duration.assetPool.getById, {
					data: {
						oid: pageState.pid
					},
					contentType: 'form'
				}, function(json) {
					util.form.reset($(document.updateAssetPoolCashForm))
					json.result.cashPosition = formatNumber(json.result.cashPosition) + '\t万元'
					document.updateAssetPoolCashForm.oid.value = json.result.oid
					$$.detailAutoFix($('#updateAssetPoolCashModal'), json.result)
					$('#updateAssetPoolCashModal').modal('show')
				})
			})
			
			// 编辑资产池现金 - 确定按钮点击事件
			$('#doUpdateAssetPoolCash').on('click', function() {
				if (!$('#updateAssetPoolCashForm').validator('doSubmitCheck')) return
				$('#updateAssetPoolCashForm').ajaxSubmit({
					url: config.api.duration.assetPool.editPoolForCash,
					success: function() {
						pageInit(pageState)
						$('#updateAssetPoolCashModal').modal('hide')
					}
				})
			})

			// 编辑偏离损益按钮点击事件
			$('#updateProfit').on('click', function() {
				//				document.updateAssetPoolProfitForm.oid.value = pageState.pid
				//				util.form.reset($('#updateAssetPoolProfitForm'))
				//				$('#updateAssetPoolProfitModal').modal('show')
				http.post(config.api.duration.assetPool.getById, {
					data: {
						oid: pageState.pid
					},
					contentType: 'form'
				}, function(json) {
					util.form.reset($(document.updateAssetPoolProfitForm))
					json.result.deviationValue = formatNumber(json.result.deviationValue) + '\t万元'
					document.updateAssetPoolProfitForm.oid.value = json.result.oid
					$$.detailAutoFix($('#updateAssetPoolProfitModal'), json.result)
					$('#updateAssetPoolProfitModal').modal('show')
				})
			})
			
			// 编辑资产池偏离损益 - 确定按钮点击事件
			$('#doUpdateAssetPoolProfit').on('click', function() {
				if (!$('#updateAssetPoolProfitForm').validator('doSubmitCheck')) return
				$('#updateAssetPoolProfitForm').ajaxSubmit({
					url: config.api.duration.assetPool.updateDeviationValue,
					success: function() {
						pageInit(pageState)
						$('#updateAssetPoolProfitModal').modal('hide')
					}
				})
			})

			// 修改现金管理工具偏离损益 - 确定按钮点击事件
			$('#doUpdateFundVolume').on('click', function() {
				if (!$('#updateFundVolumeForm').validator('doSubmitCheck')) return
				$('#updateFundVolumeForm').ajaxSubmit({
					url: config.api.duration.order.updateFund,
					success: function() {
						$('#orderingToolTable').bootstrapTable('refresh')
						$('#toolTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#updateFundVolumeModal').modal('hide')
					}
				})
			})

			// 编辑资产池偏离损益 - 确定按钮点击事件
			$('#doUpdateTrustVolume').on('click', function() {
				if (!$('#updateTrustVolumeForm').validator('doSubmitCheck')) return
				$('#updateTrustVolumeForm').ajaxSubmit({
					url: config.api.duration.order.updateTrust,
					success: function() {
						$('#orderingTrustTable').bootstrapTable('refresh')
						$('#trustTable').bootstrapTable('refresh')
						pageInit(pageState)
						$('#updateTrustVolumeModal').modal('hide')
					}
				})
			})

			// 收益分配记录 表格配置
			var pdListPageOptions = {
				number: 1,
				size: 10,
				assetPoolOid: pageState.pid
			}

			function getProfitDistributeQueryParams(val) {
				pdListPageOptions.size = val.limit
				pdListPageOptions.number = parseInt(val.offset / val.limit) + 1
				pdListPageOptions.assetPoolOid = pageState.pid
				return val
			}

			var profitDistributeTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.income.getIncomeAdjustList, {
						data: {
							page: pdListPageOptions.number,
							rows: pdListPageOptions.size,
							assetPoolOid: pdListPageOptions.assetPoolOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pdListPageOptions.number,
				pageSize: pdListPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getProfitDistributeQueryParams,
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (pdListPageOptions.number - 1) * pdListPageOptions.size + index + 1
					}
				}, {
					field: 'baseDate'
				}, {
					field: 'productName'
				}, {
					class: 'currency',
					field: 'capital'
				}, {
					field: 'allocateIncomeType',
					formatter: function(val) {
						if (val == 'raiseIncome') {
							return '募集期收益'
						}
						if (val == 'durationIncome') {
							return '存续期收益'
						}
					}
				}, {
					class: 'currency',
					field: 'totalAllocateIncome'
				}, {
					class: 'currency',
					field: 'allocateIncome'
				}, {
					class: 'currency',
					field: 'rewardIncome'
				}, {
					class: 'currency',
					field: 'successAllocateIncome'
				}, {
					class: 'currency',
					field: 'successAllocateRewardIncome'
				}, {
					field: 'ratio'
				}, 
				/*{
					align: 'center',
					field: 'creator'
				}, {
					align: 'center',
					field: 'createTime'
				}, {
					align: 'center',
					field: 'auditor'
				}, {
					align: 'center',
					field: 'auditTime'
				},*/
				{
					field: 'status',
					formatter: function(val) {
						if (val == 'CREATE') {
							return '待审核'
						}
						if (val == 'ALLOCATING') {
							return '发放中'
						}
						if (val == 'ALLOCATED') {
							return '发放完成'
						}
						if (val == 'ALLOCATEFAIL') {
							return '发放失败'
						}
						if (val == 'FAIL') {
							return '驳回'
						}
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '详情',
							type: 'button',
							class: 'item-detail',
							isRender: true
						}, {
							text: '审核',
							type: 'button',
							class: 'item-audit',
							isRender: row.status == 'CREATE'
						}, {
							text: '再次发放',
							type: 'button',
							class: 'item-allocate',
							isRender: row.status == 'ALLOCATEFAIL'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete',
							isRender: row.status == 'CREATE' || row.status == 'FAIL'
						}]
						return util.table.formatter.generateButton(buttons, 'profitDistributeTable')
					},
					events: {
						'click .item-detail': function(e, val, row) {
							incomeEventOid = row.oid
							var modal = $('#profitDistributeAgainModal')
							$('#doProfitDistributeAudit').hide()
							http.post(config.api.duration.income.getIncomeAdjust, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(result) {
								var data = result
								$$.detailAutoFix(modal, data)
							})
							$('#profitDistributeOrderTable').bootstrapTable('refresh')
							
							$('#incomeDisDetailTitleName').html('收益分配详情')
							modal.modal('show')
						},
						'click .item-audit': function(e, val, row) {
							incomeEventOid = row.oid
							var modal = $('#profitDistributeAuditModal')
							http.post(config.api.duration.income.getIncomeAdjust, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(result) {
								var data = result
								$$.detailAutoFix(modal, data)
							})
							modal.modal('show')
						},
						'click .item-allocate': function(e, val, row) {
							incomeEventOid = row.oid
							var modal = $('#profitDistributeAgainModal')
							$('#doProfitDistributeAudit').show()
							http.post(config.api.duration.income.getIncomeAdjust, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(result) {
								var data = result
								$$.detailAutoFix(modal, data)
							})
							$('#profitDistributeOrderTable').bootstrapTable('refresh')
							
							$('#incomeDisDetailTitleName').html('收益分配再次发放')
							modal.modal('show')
						},
						'click .item-delete': function(e, val, row) {
							$$.confirm({
								container: $('#confirmModal'),
								trigger: this,
								accept: function() {
									http.post(config.api.duration.income.deleteIncomeAdjust, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#profitDistributeTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}
			$('#profitDistributeTable').bootstrapTable(profitDistributeTableConfig);
			// 收益分配记录 表格配置 end;
			
			/**
			 * 收益分配持有人明细分页列表 表格配置
			 */
			var pdOrderPageOptions = {
				number: 1,
				size: 10,
				incomeOid: incomeEventOid
			}

			function pdOrderQueryParams(val) {
				pdOrderPageOptions.size = val.limit
				pdOrderPageOptions.number = parseInt(val.offset / val.limit) + 1
				pdOrderPageOptions.incomeOid = incomeEventOid
				return val
			}

			var profitDistributeOrderTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.income.allocateIncomeHolders, {
						data: {
							page: pdOrderPageOptions.number,
							rows: pdOrderPageOptions.size,
							incomeOid: pdOrderPageOptions.incomeOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pdOrderPageOptions.number,
				pageSize: pdOrderPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: pdOrderQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (pdOrderPageOptions.number - 1) * pdOrderPageOptions.size + index + 1
					}
				}, {
					field: 'phoneNum'
				}, {
					field: 'confirmDate'
				}, {
					field: 'accureVolume',
					class: 'currency'
				}, {
					field: 'baseAmount',
					class: 'currency'
				}, {
					field: 'rewardAmount',
					class: 'currency'
				}, {
					field: 'incomeAmount',
					class: 'currency'
				}]
			}
			$('#profitDistributeOrderTable').bootstrapTable(profitDistributeOrderTableConfig)

			// 收益分配录入审核 - 通过按钮点击事件
			$('#profitDistributeAuditPass').on('click', function() {
				var modal = $('#profitDistributeAuditModal')
				http.post(config.api.duration.income.auditPassIncomeAdjust, {
					data: {
						oid: incomeEventOid
					},
					contentType: 'form'
				}, function(json) {
					$('#profitDistributeTable').bootstrapTable('refresh')
				})
				modal.modal('hide')
			})

			// 收益分配录入审核 - 不通过按钮点击事件
			$('#profitDistributeAuditFail').on('click', function() {
				var modal = $('#profitDistributeAuditModal')
				http.post(config.api.duration.income.auditFailIncomeAdjust, {
					data: {
						oid: incomeEventOid
					},
					contentType: 'form'
				}, function(json) {
					$('#profitDistributeTable').bootstrapTable('refresh')
				})
				modal.modal('hide')
			})


			// 再次发送收益分配 - 确定按钮点击事件
			$('#profitDistributeAgain').on('click', function() {
				var modal = $('#profitDistributeAgainModal')
				http.post(config.api.duration.income.allocateIncomeAgain, {
					data: {
						oid: incomeEventOid
					},
					contentType: 'form'
				}, function(json) {
					$('#profitDistributeTable').bootstrapTable('refresh')
				})
				modal.modal('hide')
			})

			// 再次发送收益分配 - 取消按钮点击事件
			$('#profitDistributeCancel').on('click', function() {
					var modal = $('#profitDistributeAgainModal')
					modal.modal('hide')
				})
				// 设置收益首分配日可选日期为今天之前
			$(document.profitDistributeForm.incomeFirstDate).datetimepicker({
				maxDate: moment().subtract(1, 'days')
			})

			// 收益分配 按钮点击事件
			$('#profitDistribute').on('click', function() {
				$("#profitDistributeForm").validator('destroy')
				util.form.reset($('#profitDistributeForm'))
				var modal = $('#profitDistributeModal')
				http.post(config.api.duration.income.getIncomeAdjustData, {
					data: {
						assetPoolOid: pageState.pid,
					},
					contentType: 'form'
				}, function(result) {
					if (result.errorCode == 0) {
						var data = result
						if (data.investmentAssetsStr === null) {
							data.investmentAssetsStr = 0
						}
						if (data.apUndisIncomeStr === null) {
							data.apUndisIncomeStr = 0
						}
						if (data.apReceiveIncomeStr === null) {
							data.apReceiveIncomeStr = 0
						}

						if (data.productTotalScaleStr === null) {
							data.productTotalScaleStr = 0
						}
						if (data.productRewardBenefitStr === null) {
							data.productRewardBenefitStr = 0
						}
						if (data.feeValueStr === null) {
							data.feeValueStr = 0
						}

						var form = document.profitDistributeForm
						form.assetpoolOid.value = pageState.pid

						$$.detailAutoFix(modal, data)
						$$.formAutoFix($(form), data) // 自动填充表单

						document.profitDistributeForm.incomeDistrDate.value = data.incomeDate
						document.profitDistributeForm.incomeLastDistrDate.value = data.lastIncomeDate

						$('#feeValueStr').show()
						$('#productTotalScaleStr').show()
						$('#productRewardBenefitStr').show()

						$('#feeValue').hide()
						$('#productTotalScale').hide()
						$('#productRewardBenefit').hide()

						if (data.lastIncomeDate == '') {
							$('#incomeLastDateRowDiv').hide()
							$('#incomeLatestDateRowDiv').hide()
							$('#incomeFirstDateRowDiv').show()
						} else {
							$('#incomeLastDateRowDiv').show()
							$('#incomeLatestDateRowDiv').show()
							$('#incomeFirstDateRowDiv').hide()

							document.profitDistributeForm.incomeFirstDate.value = data.incomeDate
						}
						util.form.validator.init($('#profitDistributeForm'))
						modal.modal('show')
					} else {
						alert(result.errorMessage);
					}
				})

			})

			// 分配收益和年化收益率输入框input事件绑定
			$(document.profitDistributeForm.productDistributionIncome).on('input', function() {
				var flag = true
				$('#productDistributionIncomeError').html('')
				$('#productAnnualYieldError').html('')
				$('#productDistributionIncomeDiv').removeClass("has-error")
				$('#productAnnualYieldDiv').removeClass("has-error")

				var productDistributionIncome = parseFloat(this.value) || 0 //产品范畴 分配收益1
				var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) || 0 //产品范畴 产品总规模 1
				var productRewardBenefit = parseFloat(document.profitDistributeForm.productRewardBenefit.value) //产品范畴 产品奖励收益 
				var incomeCalcBasis = parseInt(document.profitDistributeForm.incomeCalcBasis.value) //计算基础
				var apUndisIncome = parseFloat(document.profitDistributeForm.apUndisIncome.value) //未分配收益 资产池范畴

				if (isNaN(apUndisIncome)) {
					apUndisIncome = 0
				}
				if (isNaN(productTotalScale)) {
					productTotalScale = 0
				}
				if (isNaN(productRewardBenefit)) {
					productRewardBenefit = 0
				}
				if (isNaN(incomeCalcBasis)) {
					incomeCalcBasis = 365
				}

				var productAnnualYield = 0 //产品范畴 年化收益率=分配收益/产品总规模*365
				if (!isNaN(productTotalScale) && productTotalScale != 0) {
//					productAnnualYield = productDistributionIncome * incomeCalcBasis * 100 / productTotalScale
					productAnnualYield = (Math.pow(((productDistributionIncome / productTotalScale) + 1), 365) - 1) * 100
				}

				var receiveIncome = 0
				var undisIncome = apUndisIncome - productRewardBenefit - productDistributionIncome //未分配收益 试算结果
				if (isNaN(undisIncome)) {
					undisIncome = 0
				}

				if (undisIncome < 0) {
					receiveIncome = Math.abs(undisIncome)
					undisIncome = 0
				}

				var totalScale = productTotalScale + productRewardBenefit + productDistributionIncome //产品总规模 试算结果

				var millionCopiesIncome = 0;
				if (productTotalScale !== 0) {
					millionCopiesIncome = productDistributionIncome * 10000 / productTotalScale //万份收益 试算结果
				}

				document.profitDistributeForm.productAnnualYield.value = productAnnualYield.toFixed(2) //年化收益率 产品范畴
				document.profitDistributeForm.undisIncome.value = undisIncome.toFixed(2) //未分配收益 试算结果
				document.profitDistributeForm.receiveIncome.value = receiveIncome.toFixed(2) //应收投资收益 试算结果
				document.profitDistributeForm.totalScale.value = totalScale.toFixed(2) //产品总规模 试算结果
				document.profitDistributeForm.annualYield.value = productAnnualYield.toFixed(2) //年化收益率 试算结果
				document.profitDistributeForm.millionCopiesIncome.value = millionCopiesIncome.toFixed(4) //万份收益 试算结果

				var distributionIncomeStr = this.value
				if (distributionIncomeStr.indexOf(".") != -1) {
					var str = new Array();
					str = distributionIncomeStr.split(".");
					if (str.length == 2) {
						if (str[0].length > 12 || str[1].length > 2) {
							$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
							$('#productDistributionIncomeDiv').addClass("has-error")
							flag = false
						}
					}
				} else {
					if (distributionIncomeStr.length > 12) {
						$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
						$('#productDistributionIncomeDiv').addClass("has-error")
						flag = false
					}
				}

				var productAnnualYieldStr = document.profitDistributeForm.productAnnualYield.value
				if (productAnnualYieldStr.indexOf(".") != -1) {
					var str = new Array();
					str = productAnnualYieldStr.split(".");
					if (str.length == 2) {
						if (str[0].length > 4 || str[1].length > 2) {
							$('#productAnnualYieldError').html('预期年化收益只能为前4位后2位小数')
							$('#productAnnualYieldDiv').addClass("has-error")
							flag = false
						}
					}
				} else {
					if (productAnnualYieldStr.length > 4) {
						$('#productAnnualYieldError').html('预期年化收益只能为前4位后2位小数')
						$('#productAnnualYieldDiv').addClass("has-error")
						flag = false
					}
				}

				return flag

			})

			$(document.profitDistributeForm.productAnnualYield).on('input', function() {
				var flag = true
				$('#productDistributionIncomeError').html('')
				$('#productAnnualYieldError').html('')
				$('#productDistributionIncomeDiv').removeClass("has-error")
				$('#productAnnualYieldDiv').removeClass("has-error")

				var productAnnualYield = parseFloat(this.value) || 0 //产品范畴 年化收益率

				var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) || 0 //产品范畴 产品总规模 1
				var productRewardBenefit = parseFloat(document.profitDistributeForm.productRewardBenefit.value) //产品范畴 产品奖励收益 
				var incomeCalcBasis = parseInt(document.profitDistributeForm.incomeCalcBasis.value) //计算基础
				var apUndisIncome = parseFloat(document.profitDistributeForm.apUndisIncome.value) //未分配收益 资产池范畴

				if (isNaN(apUndisIncome)) {
					apUndisIncome = 0
				}
				if (isNaN(productTotalScale)) {
					productTotalScale = 0
				}
				if (isNaN(productRewardBenefit)) {
					productRewardBenefit = 0
				}
				if (isNaN(incomeCalcBasis)) {
					incomeCalcBasis = 365
				}

//				productAnnualYield * productTotalScale / incomeCalcBasis / 100
				var productDistributionIncome = (Math.pow((productAnnualYield / 100 + 1), (1 / incomeCalcBasis)) - 1) * productTotalScale //产品范畴 分配收益1

				var receiveIncome = 0
				var undisIncome = apUndisIncome - productRewardBenefit - productDistributionIncome //未分配收益 试算结果
				if (isNaN(undisIncome)) {
					undisIncome = 0
				}
				if (undisIncome < 0) {
					receiveIncome = Math.abs(undisIncome)
					undisIncome = 0
				}

				var totalScale = productTotalScale + productRewardBenefit + productDistributionIncome //产品总规模 试算结果
				var millionCopiesIncome = 0;
				if (incomeCalcBasis != 0) {
					millionCopiesIncome = (Math.pow((productAnnualYield / 100 + 1), (1 / incomeCalcBasis)) - 1) * 10000 //万份收益 试算结果
//					millionCopiesIncome = productAnnualYield * 10000 / incomeCalcBasis / 100
				}

				document.profitDistributeForm.productDistributionIncome.value = productDistributionIncome.toFixed(2)
				document.profitDistributeForm.undisIncome.value = undisIncome.toFixed(2) //未分配收益 试算结果
				document.profitDistributeForm.receiveIncome.value = receiveIncome.toFixed(2) //应收投资收益 试算结果
				document.profitDistributeForm.totalScale.value = totalScale.toFixed(2) //产品总规模 试算结果
				document.profitDistributeForm.annualYield.value = productAnnualYield.toFixed(2) //年化收益率 试算结果
				document.profitDistributeForm.millionCopiesIncome.value = millionCopiesIncome.toFixed(4) //万份收益 试算结果

				var productAnnualYieldStr = this.value
				if (productAnnualYieldStr.indexOf(".") != -1) {
					var str = new Array();
					str = productAnnualYieldStr.split(".");
					if (str.length == 2) {
						if (str[0].length > 4 || str[1].length > 2) {
							$('#productAnnualYieldError').html('预期年化收益只能为前4位后2位小数')
							$('#productAnnualYieldDiv').addClass("has-error")
							flag = false
						}
					}
				} else {
					if (productAnnualYieldStr.length > 4) {
						$('#productAnnualYieldError').html('预期年化收益只能为前4位后2位小数')
						$('#productAnnualYieldDiv').addClass("has-error")
						flag = false
					}
				}

				var distributionIncomeStr = document.profitDistributeForm.productDistributionIncome.value
				if (distributionIncomeStr.indexOf(".") != -1) {
					var str = new Array();
					str = distributionIncomeStr.split(".");
					if (str.length == 2) {
						if (str[0].length > 12 || str[1].length > 2) {
							$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
							$('#productDistributionIncomeDiv').addClass("has-error")
							flag = false
						}
					}
				} else {
					if (distributionIncomeStr.length > 12) {
						$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
						$('#productDistributionIncomeDiv').addClass("has-error")
						flag = false
					}
				}
				return flag

			})

			// 分收益分配天数输入框input事件绑定
			$(document.profitDistributeForm.incomeFirstDate).on('blur', function() {
				$("#profitDistributeForm").validator('destroy')

				var incomeDate = this.value
				document.profitDistributeForm.incomeDistrDate.value = incomeDate
				if (incomeDate !== '') {
					http.post(config.api.duration.income.getTotalScaleRewardBenefit, {
						data: {
							assetPoolOid: pageState.pid,
							incomeDate: incomeDate
						},
						contentType: 'form'
					}, function(result) {
						var data = result

						if (data.productTotalScaleStr === null) {
							data.productTotalScaleStr = 0
						}

						if (data.productRewardBenefitStr === null) {
							data.productRewardBenefitStr = 0
						}

						document.profitDistributeForm.productTotalScale.value = data.productTotalScale
						document.profitDistributeForm.productRewardBenefit.value = data.productRewardBenefit

						$('#productTotalScaleStr').hide()
						$('#productRewardBenefitStr').hide()
						$('#feeValueStr').hide()

						$('#productTotalScale').show()
						$('#productRewardBenefit').show()
						$('#feeValue').show()

						var productDistributionIncome = parseFloat(document.profitDistributeForm.productDistributionIncome.value) //产品范畴 分配收益1
						var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) //产品范畴 产品总规模 1
						var productRewardBenefit = parseFloat(document.profitDistributeForm.productRewardBenefit.value) //产品范畴 产品奖励收益 
						var incomeCalcBasis = parseInt(document.profitDistributeForm.incomeCalcBasis.value) //计算基础
						var apUndisIncome = parseFloat(document.profitDistributeForm.apUndisIncome.value) //未分配收益 资产池范畴


						if (isNaN(apUndisIncome)) {
							apUndisIncome = 0
						}
						if (isNaN(productTotalScale)) {
							productTotalScale = 0
						}
						if (isNaN(productRewardBenefit)) {
							productRewardBenefit = 0
						}
						if (isNaN(incomeCalcBasis)) {
							incomeCalcBasis = 365
						}

						var productAnnualYield = 0 //产品范畴 年化收益率
						if (!isNaN(productTotalScale) && productTotalScale != 0) {
							productAnnualYield = productDistributionIncome / productTotalScale * incomeCalcBasis * 100
						}

						var receiveIncome = 0
						var undisIncome = apUndisIncome - productRewardBenefit - productDistributionIncome //未分配收益 试算结果
						if (isNaN(undisIncome)) {
							undisIncome = 0
						}

						if (undisIncome < 0) {
							receiveIncome = Math.abs(undisIncome)
							undisIncome = 0
						}

						var totalScale = productTotalScale + productRewardBenefit + productDistributionIncome //产品总规模 试算结果
						var millionCopiesIncome = productAnnualYield / incomeCalcBasis * 10000 / 100 //万份收益 试算结果

						document.profitDistributeForm.productAnnualYield.value = productAnnualYield.toFixed(2) //年化收益率 产品范畴
						document.profitDistributeForm.undisIncome.value = undisIncome.toFixed(2) //未分配收益 试算结果
						document.profitDistributeForm.receiveIncome.value = receiveIncome.toFixed(2) //应收投资收益 试算结果
						document.profitDistributeForm.totalScale.value = totalScale.toFixed(2) //产品总规模 试算结果
						document.profitDistributeForm.annualYield.value = productAnnualYield.toFixed(2) //年化收益率 试算结果
						document.profitDistributeForm.millionCopiesIncome.value = millionCopiesIncome.toFixed(4) //万份收益 试算结果

						util.form.validator.init($('#profitDistributeForm'))
					})

				}


			})

			// 审收益分配“确定”按钮点击事件
			$('#profitDistributeSubmit').on('click', function() {
				if (!$('#profitDistributeForm').validator('doSubmitCheck')) return

				var incomeLastDistrDate = document.profitDistributeForm.incomeLastDistrDate.value
				var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) //产品范畴 产品总规模 1
				if (incomeLastDistrDate === '' && productTotalScale == 0) {
					return
				}
				$('#profitDistributeModal').modal('hide')
				$('#profitDistributeForm').ajaxSubmit({
					url: config.api.duration.income.saveIncomeAdjust,
					success: function(addResult) {
						if(addResult.errorCode==-1) {
							if ($("#alertMessage").children().length > 0) {
								$("#alertMessage").children().remove()
							}
							var h5 = $('<h5>'+addResult.errorMessage+'</h5>')
							$("#alertMessage").append(h5)
							$('#alertModal').modal('show')
						} else {
							$('#profitDistributeTable').bootstrapTable('refresh')
						}
					}
				})
			})

		}
	}
		
	/**
	 * 格式化单位为（万元）
	 * @param {Object} val
	 */
	function formatUnitToWan(val) {
		if (val) {
			val = parseFloat(val)
			return util.safeCalc(val, '/', 10000, 6)
		} else {
			return 0
		}
	}
		
	/**
	 * 格式化以千分位展示
	 * @param {Object} val
	 */
	function formatNumber(val) {
		if (val) {
			val = formatUnitToWan(val)
			return $.number(val, 6)
		} else {
			return 0
		}
	}
		
	/**
	 * 格式化单位为（万元）
	 * 以千分位展示
	 * @param {Object} val
	 */
	function formatPercent(val) {
		if (val) {
			val = parseFloat(val)
			return util.safeCalc(val, '*', 100, 4)
		} else {
			return 0
		}
	}

	/**
	 * 格式化申购标的数据
	 * 解析枚举值
	 * 单位换算成 万元
	 * 半分比换算成有 %
	 * @param {Object} item
	 */
	function buyDataFormat(item) {
		item = formatMenu(item)
		
		item.yearYield7 		= formatPercent(item.yearYield7)
		item.collectIncomeRate 	= formatPercent(item.collectIncomeRate)
		item.expAror 			= formatPercent(item.expAror)
		
		item.trustAmount 		= formatUnitToWan(item.trustAmount)
		item.restTrustAmount 	= formatUnitToWan(item.restTrustAmount)
		item.floorVolume 		= formatUnitToWan(item.floorVolume)
		item.raiseScope 		= formatUnitToWan(item.raiseScope)
		item.t_trustAmount 		= formatUnitToWan(item.t_trustAmount)
		item.t_restTrustAmount 	= formatUnitToWan(item.t_restTrustAmount)
		item.t_floorVolume 		= formatUnitToWan(item.t_floorVolume)
		item.t_raiseScope 		= formatUnitToWan(item.t_raiseScope)
		
		return item
	}

	/**
	 * 格式化数据
	 * 解析枚举值
	 * 单位换算成 万元
	 * 半分比换算成有 %
	 * @param {Object} result
	 */
	function resultDataFormat(result) {
		result = formatMenu(result)
		
		result.amount 			= formatNumber(result.amount)
		result.lastShares 		= formatNumber(result.lastShares)
		result.purchase 		= formatNumber(result.purchase)
		result.redemption 		= formatNumber(result.redemption)
		result.lastOrders 		= formatNumber(result.lastOrders)
		result.shares 			= formatNumber(result.shares)
		result.profit 			= formatNumber(result.profit)
		result.raiseScope 		= formatNumber(result.raiseScope)
		result.floorVolume 		= formatNumber(result.floorVolume)
		result.returnVolume 	= formatNumber(result.returnVolume)
		result.income 			= formatNumber(result.income)
		result.auditIncome 		= formatNumber(result.auditIncome)
		result.investIncome 	= formatNumber(result.investIncome)
		result.capital 			= formatNumber(result.capital)
		result.sellScope 		= formatNumber(result.sellScope)
		result.trustAmount 		= formatNumber(result.trustAmount)
		result.restTrustAmount 	= formatNumber(result.restTrustAmount)
		result.applyCash 		= formatNumber(result.applyCash)
		result.applyVolume 		= formatNumber(result.applyVolume)
		result.auditCapital 	= formatNumber(result.auditCapital)
		result.auditCash 		= formatNumber(result.auditCash)
		result.auditVolume 		= formatNumber(result.auditVolume)
		result.reserveCash 		= formatNumber(result.reserveCash)
		result.reserveVolume 	= formatNumber(result.reserveVolume)
		result.investCash 		= formatNumber(result.investCash)
		result.investVolume 	= formatNumber(result.investVolume)
		result.investCapital 	= formatNumber(result.investCapital)
		result.holdAmount 		= formatNumber(result.holdAmount)
		result.volume 			= formatNumber(result.volume)
	
		result.ratio 			= formatPercent(result.ratio)
		result.expAror 			= formatPercent(result.expAror)
		result.collectIncomeRate = formatPercent(result.collectIncomeRate)
		result.collectRate 		= formatPercent(result.collectRate)
		result.yearYield7 		= formatPercent(result.yearYield7)
		result.investIncomeRate = formatPercent(result.investIncomeRate)
		result.incomeRate 		= formatPercent(result.incomeRate)
		result.expIncomeRate 	= formatPercent(result.expIncomeRate)
		result.overdueRate 		= formatPercent(result.overdueRate)
		result.auditIncomeRate 	= formatPercent(result.auditIncomeRate)
		
		return result
	}

	/**
	 * 格式化数据（包含单位）
	 * 解析枚举值
	 * 单位换算成 万元
	 * 半分比换算成加 %
	 * @param {Object} result
	 */
	function resultDataFormatPlus(result, unit) {
		result = formatMenu(result)
		
		if (result.life) {
			result.life = result.life + '\t 天'
		}
		if (result.seq) {
			result.seq = result.seq + '\t 期'
		}
		
		if (result.netRevenue) {
			result.netRevenue = $.number(result.netRevenue, 2) + '\t 元'
		} else {
			result.netRevenue = 0 + '\t 元'
		}
		
		
		result.lastShares 		= formatNumber(result.lastShares) 		+ '\t 万份'
		result.purchase 		= formatNumber(result.purchase) 		+ '\t 万元'
		result.redemption 		= formatNumber(result.redemption) 		+ '\t 万元'
		result.lastOrders 		= formatNumber(result.lastOrders) 		+ '\t 万元'
		result.shares 			= formatNumber(result.shares) 			+ '\t 万份'
		result.profit 			= formatNumber(result.profit) 			+ '\t 万元'
		result.raiseScope 		= formatNumber(result.raiseScope) 		+ "\t 万元"
		result.floorVolume 		= formatNumber(result.floorVolume) 		+ '\t 万元'
		result.returnVolume 	= formatNumber(result.returnVolume) 	+ '\t 万份'
		result.income 			= formatNumber(result.income) 			+ '\t 万元'
		result.auditIncome 		= formatNumber(result.auditIncome) 		+ '\t 万元'
		result.investIncome 	= formatNumber(result.investIncome) 	+ '\t 万元'
		result.capital 			= formatNumber(result.capital) 			+ '\t 万元'
		result.sellScope 		= formatNumber(result.sellScope) 		+ '\t 万元'
		result.trustAmount 		= formatNumber(result.trustAmount) 		+ '\t 万元'
		result.restTrustAmount 	= formatNumber(result.restTrustAmount) 	+ '\t 万元'
		result.applyCash 		= formatNumber(result.applyCash) 		+ '\t 万元'
		result.applyVolume 		= formatNumber(result.applyVolume) 		+ '\t 万份'
		result.auditCapital 	= formatNumber(result.auditCapital) 	+ '\t 万元'
		result.auditCash 		= formatNumber(result.auditCash) 		+ '\t 万元'
		result.reserveCash 		= formatNumber(result.reserveCash) 		+ '\t 万元'
		result.investCash 		= formatNumber(result.investCash) 		+ '\t 万元'
		result.investCapital 	= formatNumber(result.investCapital) 	+ '\t 万元'
		result.holdAmount 		= formatNumber(result.holdAmount) 		+ '\t 万份'
		result.volume 			= formatNumber(result.volume) 			+ '\t 万元'
		result.auditVolume 		= formatNumber(result.auditVolume) 		+ '\t 万' + unit
		result.reserveVolume 	= formatNumber(result.reserveVolume) 	+ '\t 万' + unit
		result.investVolume 	= formatNumber(result.investVolume) 	+ '\t 万' + unit

		if (result.ratio === -999.99) {
			result.ratio = '--'
		} else {
			result.ratio = formatPercent(result.ratio) + '\t %'
		}
		
		result.expAror 			= formatPercent(result.expAror) 			+ '\t %'
		result.collectIncomeRate = formatPercent(result.collectIncomeRate) 	+ '\t %'
		result.collectRate 		= formatPercent(result.collectRate) 		+ '\t %'
		result.yearYield7 		= formatPercent(result.yearYield7) 			+ '\t %'
		result.investIncomeRate = formatPercent(result.investIncomeRate) 	+ '\t %'
		result.incomeRate 		= formatPercent(result.incomeRate) 			+ '\t %'
		result.overdueRate 		= formatPercent(result.overdueRate) 		+ '\t %'
		result.auditIncomeRate 	= formatPercent(result.auditIncomeRate) 	+ '\t %'
		
		return result
	}
	
	/**
	 * 解析枚举值
	 * @param {Object} result
	 */
	function formatMenu(result) {
		if (result.targetType) {
			result.targetType = util.enum.transform('TARGETTYPE', result.targetType)
		}
		if (result.t_targetType) {
			result.t_targetType = util.enum.transform('TARGETTYPE', result.t_targetType)
		}
		if (result.accrualType) {
			result.accrualType = util.enum.transform('ACCRUALTYPE', result.accrualType)
		}
		if (result.t_accrualType) {
			result.t_accrualType = util.enum.transform('ACCRUALTYPE', result.t_accrualType)
		}
		if (result.cashtoolType) {
			result.cashtoolType = util.enum.transform('CASHTOOLTYPE', result.cashtoolType)
		}
		if (result.transType) {
			result.transType = util.enum.transform('TRANSTYPE', result.transType)
		}
		if (result.life) {
			result.lifeView = result.life + (result.lifeUnit == 'day' ? '天' : (result.lifeUnit == 'monty' ? '月' : (result.lifeUnit == 'year' ? '年' : '')))
		}
		if (result.t_life) {
			result.t_lifeView = result.t_life + (result.t_lifeUnit == 'day' ? '天' : (result.t_lifeUnit == 'monty' ? '月' : (result.t_lifeUnit == 'year' ? '年' : '')))
		}
		
		return result
	}

	function pageInit(pageState) {
		http.post(config.api.duration.assetPool.getById, {
			data: {
				oid: pageState.pid || ''
			},
			contentType: 'form'
		}, function(json) {
			var detail = pageState.detail = json.result
			if (!detail) {
				$('#nullAssetPoolModal').modal('show')
			} else {
				pageState.year_days = detail.calcBasis
				freeCash = formatNumber(detail.cashPosition)
				pageState.pid = document.searchForm.assetPoolName.value = detail.oid
				assetPoolListInit(pageState)
				$('#detailPoolScale').html(formatNumber(detail.scale))
				freeCash = formatUnitToWan(detail.scale)
				$('#detailPoolCash').html(formatNumber(detail.cashPosition))
				if (detail.deviationValue < 0) {
					$('#detailPoolProfit').removeClass('text-black')
					$('#detailPoolProfit').addClass('text-red')
				} else {
					$('#detailPoolProfit').removeClass('text-red')
					$('#detailPoolProfit').addClass('text-black')
				}
				$('#detailPoolProfit').html(formatNumber(detail.deviationValue))
	
				initPieChartAndBarChart(pageState)
	
				initLineChart(pageState)
	
				yieldInit(pageState)
	
				$('#marketValue').html(formatNumber(detail.marketValue))
				$('#baseDate').html(detail.baseDate)
				$('#unDistributeProfit').html(formatNumber(detail.unDistributeProfit))
	//			$('#payFeigin').html(formatNumber(detail.payFeigin)）
				$('#spvProfit').html(formatNumber(detail.spvProfit))
				$('#investorProfit').html(formatNumber(detail.investorProfit))
				
				$('#netValue').html(formatNumber(detail.netValue))
				$('#trusteeFee').html(formatNumber(detail.trusteeFee))
				$('#manageFee').html(formatNumber(detail.manageFee))
			}
		})
	}
	
	function getBarOptions(source) {
		return {
			tooltip: {
				trigger: 'axis'
			},
			legend: {
//				orient: 'vertical',
				x: 'left',
				data: ['可用现金', '冻结资金', '在途资金'],
			},
			grid: {
				top: 40,
				left: 30,
				right: 30,
				bottom: 30
			},
			xAxis: [{
				type: 'value',
				boundaryGap: ['0%', '20%'],
			}],
			yAxis: [{
				name: '',
				type: 'category',
				boundaryGap: true,
				data: []
			}],
			series: [{
				name: '可用现金',
				type: 'bar',
				label: {
					normal: {
						show: true,
						position: 'right',
						formatter: function(obj) {
							return obj.value + '万'
						}
					}
				},
				data: [formatUnitToWan(source.cashPosition)]
			}, {
				name: '冻结资金',
				type: 'bar',
				label: {
					normal: {
						show: true,
						position: 'right',
						formatter: function(obj) {
							return obj.value + '万'
						}
					}
				},
				data: [formatUnitToWan(source.freezeCash)]
			}, {
				name: '在途资金',
				type: 'bar',
				showAllSymbol: true,
				label: {
					normal: {
						show: true,
						position: 'right',
						formatter: function(obj) {
							return obj.value + '万'
						}
					}
				},
				data: [formatUnitToWan(source.transitCash)]
			}],
			color: config.colors
		}
	}
	
	function getPieOptions(source) {
		return {
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b}: {c} ({d}%)"
			},
			legend: {
//				orient: 'vertical',
				x: 'left',
				data: ['现金', '现金管理类工具', '信托计划']
			},
			series: [{
				name: '投资占比',
				type: 'pie',
				//radius: ['50%', '70%'],
				radius: '60%',
				center: ['50%', '50%'],
				//avoidLabelOverlap: false,
				//label: {
				//  normal: {
				//    show: false,
				//    position: 'center'
				//  },
				//  emphasis: {
				//    show: true,
				//    textStyle: {
				//      fontSize: '18',
				//      fontWeight: 'bold'
				//    }
				//  }
				//},
				//labelLine: {
				//  normal: {
				//    show: false
				//  }
				//},
				data: [
					// {value:source.cashRate, name:'现金'},
					// {value:source.cashtoolRate, name:'现金管理类工具'},
					// {value:source.targetRate, name:'信托计划'}
					{
						value: source.cashFactRate,
						name: '现金'
					}, {
						value: source.cashtoolFactRate,
						name: '现金管理类工具'
					}, {
						value: source.targetFactRate,
						name: '信托计划'
					}
				]
			}],
			color: config.colors
		}
	}
	
	function getLineOptions(source) {
		return {
			tooltip: {
				trigger: 'axis'
			},
			grid: {
				top: 25,
				left: 50,
				right: 30,
				bottom: 70
			},
			dataZoom: {
				show: true,
				start: 100 - Math.round(7 / source.length * 100),
				end: 100,
				handleSize: 7
			},
			xAxis: [{
				type: 'category',
				boundaryGap: true,
				data: source.map(function(item) {
					return item.date
				})
			}],
			yAxis: [{
				name: '每日收益率',
				boundaryGap: true,
				//min: '-1000000',
				axisLabel: {
					formatter: function(val) {
						return val + '%'
					}
				},
				type: 'value'
			}],
			series: [{
				name: '收益率',
				type: 'line',
				showAllSymbol: true,
				label: {
					normal: {
						show: true,
						textStyle: {
							color: '#333'
						}
					}
				},
				data: source.map(function(item) {
					return parseInt(item.yield * 100) / 100
				})
			}],
			color: config.colors
		}
	}
	// 自定义验证 - 现金比例/现金管理类工具比例/信托计划比例 加起来不能超过100
	function validpercentage($el) {
		var form = $el.closest('form')
		var parts = form.find('input[data-validpercentage]')
		var percentage = 0
		parts.each(function(index, item) {
			percentage += Number(item.value)
		})
		return !(percentage > 100)
	}
	
	function assetPoolListInit(pageState) {
		http.post(config.api.duration.assetPool.getNameList, function(json) {
			var assetPoolOptions = ''
			var select = document.searchForm.assetPoolName
			json.rows.forEach(function(item) {
				assetPoolOptions += '<option value="' + item.oid + '">' + item.name + '</option>'
			})
			$(select).html(assetPoolOptions).val(pageState.pid)
		})
	}
	
	function yieldInit(pageState) {
		http.post(config.api.duration.market.getYield, {
			data: {
				pid: pageState.pid
			},
			contentType: 'form'
		}, function(json) {
			json.result.forEach(function(item) {
				if (item.yield === -999.99) {
					item.yield = ''
				} else {
					item.yield = util.safeCalc(item.yield, '*', 100, 4)
				}
			})
			pageState.mockData = json.result
			initLineChart(pageState)
		})
	}
	
	// tab1页饼图与柱状图生成
	function initPieChartAndBarChart(pageState) {
		var pieChart = echarts.init(document.getElementById('pieChart'))
		var barChart = echarts.init(document.getElementById('barChart'))
		pieChart.setOption(getPieOptions(pageState.detail))
		barChart.setOption(getBarOptions(pageState.detail))
	}
	
	// tab2页折线图生成
	function initLineChart(pageState) {
		var lineChart = echarts.init(document.getElementById('lineChart'))
		lineChart.setOption(getLineOptions(pageState.mockData))
	}
	
	function validCapital($el) {
	
	}
	// 现金管理类工具申购额度验证
	function validpurchaseamountforfund($el) {
		var amount = $el.val()
		var type = document.buyAssetForm.passUrl.value
		if (type !== 'trans') {
			return parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(freeCash)
		}
		//	return parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(freeCash)
		return true
	}
	
	// 现金管理类工具申购额度验证
	function validpurchaseamount($el) {
		var amount = $el.val()
		return parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(freeCash)
	}
	
	// 现金管理类工具申购额度验证
	function validpurchasecashfortrust($el) {
		var type = document.buyAssetForm.passUrl.value
		if (type === 'trust') {
			var amount = $el.val()
			return parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(freeCash)
		}
		return true
	}
	
	// 信托标的申购额度验证--判断大于起购额度，小于剩余额度
	function validpurchaseamountfortrust($el) {
		var amount = $el.val()
			// 起购额度
		var floorAmount = 0
			// 剩余额度
		var remainAmount = 0
		var type = document.buyAssetForm.passUrl.value
		if (type === 'fund') {
			return true
		} else if (type === 'trust') {
			floorAmount = document.buyAssetForm.floorVolume.value
			remainAmount = document.buyAssetForm.restTrustAmount.value
		} else {
			floorAmount = document.buyAssetForm.t_floorVolume.value
			remainAmount = document.buyAssetForm.t_restTrustAmount.value
		}
		var tmpfloor = floorAmount + ''
		if (tmpfloor.indexOf(',') > 0) {
			tmpfloor = tmpfloor.replace(/[,]/g,'')
		}
		var tmpremain = remainAmount + ''
		if (tmpremain.indexOf(',') > 0) {
			tmpremain = tmpremain.replace(/[,]/g,'')
		}
		return parseFloat(amount) >= parseFloat(tmpfloor) && parseFloat(amount) <= parseFloat(tmpremain)
	}
	
	// 赎回额度验证
	function validredeemamount($el) {
		var form = $el.closest('form')
		var holdAmount = form.find('input[name=amount]')
		var amount = $el.val()
		return parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(holdAmount.val())
	}
	
	// 审核验证
	function validauditamount($el) {
		//  var auditCash = $el.val()
		//  var form = $el.closest('form')
		//  var applyCash = form.find('input[name=applyCash]')
		//  console.log(applyCash.val())
		//  console.log(auditCash)
		//	if (parseFloat(auditCash) !== parseFloat(applyCash.val())) {
		//		return false
		//	} else {
		//		return true
		//	}
		$('#auditMessage').show();
		$('#reserveMessage').show();
		$('#investMessage').show();
		return true
	}
	
	// 转让额度验证
	function validtransamount($el) {
		var form = $el.closest('form')
		var holdAmount = form.find('input[name=tmpHoldAmount]')
		var tranVolume = $el.val()
		return parseFloat(tranVolume) > 0 && parseFloat(tranVolume) <= parseFloat(holdAmount.val())
	}
})
