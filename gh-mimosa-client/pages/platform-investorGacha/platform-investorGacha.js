/**
 * 投资人-平台轧差
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'platform-investorGacha',
		init: function () {
			var pageOptions1 = {
				number: 1,
				size: 10,
				offset: 0,
				offsetCode: '',
				offsetDateBegin: '',
				offsetDateEnd: ''
			}
			var pageOptions2 = {
				number: 1,
				size: 10,
				offset: 0,
				offsetCode: '',
				offsetDateBegin: '',
				offsetDateEnd: ''
			}
			var pageOptions3 = {
				number: 1,
				size: 10,
				offset: 0,
				orderType: '',
				orderStatus: '',
				orderCode: '',
				createTimeBegin: '',
				createTimeEnd: '',
				investorOffsetOid: '',
				gachaType: ''
			}
			getMoneyDetail()
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(config.api.investorImng, {
						data: {
							page: pageOptions1.number,
							rows: pageOptions1.size,
							offsetCode: pageOptions1.offsetCode,
							offsetFrequency: 'fast',
							offsetDateBegin: pageOptions1.offsetDateBegin,
							offsetDateEnd: pageOptions1.offsetDateEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions1.number,
				pageSize: pageOptions1.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams1,
				columns: [
					{
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions1.offset
						}
					},
//					{
//						field: 'offsetDate'
//					},
					{
						field: 'offsetCode'
					},
					{
						field: 'redeemAmount',
						class: 'currency'
					},
					{
						field: 'createTime',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'clearStatusDisp'
					},
					{
						field: 'closeStatusDisp'
					},
					{
						align: 'center',
						width: 200,
						formatter: function (val, row) {
							var buttons = [{
								text: '订单',
								type: 'button',
								class: 'order-detail',
								isRender: true
							},{
								text: '结算',
								type: 'button',
								class: 'item-close',
								isRender: row.closeStatus === "closeSubmitFailed" || row.closeStatus === "closePayFailed"
							}
//							{
//								text: '轧差明细',
//								type: 'button',
//								class: 'gacha-detail',
//								isRender: true
//							}
							]
							return util.table.formatter.generateButton(buttons, 'dataTable1');
						},
						events: {
							'click .order-detail': function (e, value, row) {
								pageOptions3.investorOffsetOid = row.offsetOid
								pageOptions3.gachaType = 'fast'
								$('#dataTable3').bootstrapTable('refresh')
								$('#detailModal').modal('show')
							},
							'click .item-close': function (e, value, row) {
								$('#clearConfirm').find('p').html('确定进行结算？')
								$$.confirm({
									container: $('#clearConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.fclose, {
											iOffsetOid: row.offsetOid
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable1').bootstrapTable('refresh')
										})
									}
								})
							}
//							'click .gacha-detail': function (e, value, row) {
//								getDetail(row.offsetOid)
//							},
						}
					}
				]
			}
			
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.investorImng, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							offsetCode: pageOptions2.offsetCode,
							offsetFrequency: 'normal',
							offsetDateBegin: pageOptions2.offsetDateBegin,
							offsetDateEnd: pageOptions2.offsetDateEnd
						},
							contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions2.number,
				pageSize: pageOptions2.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams2,
				columns: [
					{
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions2.offset
						}
					},
//					{
//						field: 'offsetDate'
//					},
					{
						field: 'offsetCode'
					},
					{
						field: 'redeemAmount',
						class: 'currency'
					},
					{
						field: 'createTime',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'clearStatusDisp'
					},
					{
						field: 'closeStatusDisp'
					},
					{
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '订单',
								type: 'button',
								class: 'order-detail',
								isRender: true
							},
//							{
//								text: '轧差明细',
//								type: 'button',
//								class: 'gacha-detail',
//								isRender: true
//							},
							{
								text: '清算',
								type: 'button',
								class: 'item-clear',
								isRender: row.clearStatus === "toClear" && row.clearTimeArr
							},{
								text: '结算',
								type: 'button',
								class: 'item-close',
								isRender: row.clearStatus === "cleared" && row.closeStatus === "toClose" || row.closeStatus === "closeFailed" || row.closeStatus === "closeSubmitFailed"
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable2');
						},
						events: {
							'click .order-detail': function (e, value, row) {
								pageOptions3.investorOffsetOid = row.offsetOid
								pageOptions3.gachaType = 'normal'
								$('#dataTable3').bootstrapTable('refresh')
								$('#detailModal').modal('show')
							},
//							'click .gacha-detail': function (e, value, row) {
//								getDetail(row.offsetOid)
//							},
							'click .item-clear': function (e, value, row) {
								$('#clearConfirm').find('p').html('确定进行清算？')
								$$.confirm({
									container: $('#clearConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.iclear, {
											iOffsetOid: row.offsetOid
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable2').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-close': function (e, value, row) {
								$('#clearConfirm').find('p').html('确定进行结算？')
								$$.confirm({
									container: $('#clearConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.iclose, {
											iOffsetOid: row.offsetOid
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable2').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				]
			}
			
			var tableConfig3 = {
				ajax: function (origin) {
					http.post(config.api.gacha.tradeorder, {
						data: {
							page: pageOptions3.number,
							rows: pageOptions3.size,
							orderType: pageOptions3.orderType,
							orderStatus: pageOptions3.orderStatus,
							orderCode: pageOptions3.orderCode,
							createTimeBegin: pageOptions3.createTimeBegin,
							createTimeEnd: pageOptions3.createTimeEnd,
							investorOffsetOid: pageOptions3.investorOffsetOid
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions3.number,
				pageSize: pageOptions3.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams3,
				columns: [
					{
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions3.offset
						}
					},
					{
						field: 'orderCode'
					},
					{
						field: 'orderAmount',
						class: 'currency'
					},
					{
						field: 'couponTypeDisp',
						align: 'right'
					},
					{
						field: 'couponAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'payAmount',
						class: 'currency'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'orderStatusDisp'
					},
//					{
//						field: 'productCode'
//					},
					{
						field: 'productName'
					},
					{
						field: 'createTime',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'createManDisp'
					},
//					{
//						field: 'investorClearStatusDisp',
//						formatter: function (val) {
//							return val || '--'
//						}
//					},
//					{
//						field: 'investorCloseStatusDisp',
//						formatter: function (val) {
//							return val || '--'
//						}
//					},
					{
						field: 'publisherClearStatusDisp',
						formatter: function (val) {
							return val && pageOptions3.gachaType === 'normal' ? val : '--'
						}
					},
					{
						field: 'publisherConfirmStatusDisp',
						formatter: function (val) {
							return val && pageOptions3.gachaType === 'normal' ? val : '--'
						}
					},
					{
						field: 'publisherCloseStatusDisp',
						formatter: function (val) {
							return val && pageOptions3.gachaType === 'normal' ? val : '--'
						}
					},
					{
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '投资协议',
								type: 'button',
								class: 'item-invest',
								isRender: row.investContractAddr
							},{
								text: '服务协议',
								type: 'button',
								class: 'item-service',
								isRender: row.serviceContractAddr
							},{
								text: '支付日志',
								type: 'button',
								class: 'item-logs',
								isRender: row.orderCode
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable3');
						},
						events: {
							'click .item-invest': function (e, value, row) {
								window.open(location.href.substr(0,location.href.indexOf("mimosaui/index.html"))+row.investContractAddr)
							},
							'click .item-service': function (e, value, row) {
								window.open(location.href.substr(0,location.href.indexOf("mimosaui/index.html"))+row.serviceContractAddr)
							},
							'click .item-logs': function (e, value, row) {
								orderLogPageOptions.interfaceName = ''
								orderLogPageOptions.orderCode = row.orderCode
								document.orderLogSearchForm.interfaceName.value = ''
								$('#orderLogDataTable').bootstrapTable('destroy')
								$('#orderLogDataTable').bootstrapTable(orderLogTableConfig)
								$('#orderLogModal').modal('show')
							}
						}
					}
				]
			}
			
			var orderLogPageOptions = {
				number: 1,
				size: 10,
				offset: 0,
				interfaceName: '',
				orderCode: ''
			}
			
			var orderLogTableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.settlementLogmng, {
							data: {
								page: orderLogPageOptions.number,
								rows: orderLogPageOptions.size,
								interfaceName: orderLogPageOptions.interfaceName,
								orderCode: orderLogPageOptions.orderCode
							},
							contentType: 'form'
						},
						function(rlt) {
							origin.success(rlt)
						}
					)
				},
				pageNumber: orderLogPageOptions.number,
				pageSize: orderLogPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					var form = document.orderLogSearchForm
					orderLogPageOptions.size = val.limit
					orderLogPageOptions.number = parseInt(val.offset / val.limit) + 1
					orderLogPageOptions.offset = val.offset
					orderLogPageOptions.interfaceName = form.interfaceName.value.trim()
					return val
				},
				onLoadSuccess: function() {},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'interfaceName':
							$$.detailAutoFix($('#interfaceDetailModal'), row);
							// errorMessage错误有时会包含html标签，影响整体样式显示
							var temp = document.createElement("div");
							temp.innerHTML = row.errorMessage;
							$('#errorMessage').html(temp.innerText);
							$('#interfaceDetailModal').modal('show');
							break
					}
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return index + 1 + orderLogPageOptions.offset
					}
				}, {
					field: 'interfaceName',
					class:"table_title_detail"
				}, {
					field: 'orderCode',
					class: 'align-right'
				}, {
					field: 'ipayNo',
					class: 'align-right'
				}, {
					field: 'handleTypeDisp',
					class: 'align-right'
				}, {
					field: 'errorCode',
					class: 'align-right'
				}, {
					field: 'sendedTimes',
					class: 'align-right'
				}, {
					field: 'limitSendTimes',
					class: 'align-right'
				}, {
					field: 'nextNotifyTime',
					class: 'align-right'
				}, {
					field: 'createTime',
					class: 'align-right'
				}, {
					field: 'updateTime',
					class: 'align-right'
				}]
			}
			
			$("#dataTable1").bootstrapTable(tableConfig1)
			$("#dataTable2").bootstrapTable(tableConfig2)
			$("#dataTable3").bootstrapTable(tableConfig3)
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			$$.searchInit($('#searchForm3'), $('#dataTable3'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));
			
			$('#refresh').on('click', function () {
				getMoneyDetail()
			})
			
			function getMoneyDetail () {
				http.post(config.api.baseaccountDeta, {
					contentType: 'form'
				}, function (result) {
					$('#balance').html(result.balance)
//					$('#superAccBorrowAmount').html('超级户借款金额：<div><span style="font-size: x-large;">'+(result.superAccBorrowAmount || 0)+'</span>&nbsp;元</div>')
//					$('#statusDisp').html('状态：<div><span style="font-size: x-large;">'+result.statusDisp+'</span></div>')
//					$('#totalTradeAmount').html('累计交易总额：<div><span style="font-size: x-large;">'+result.totalTradeAmount+'</span>&nbsp;元</div>')
					$('#totalLoanAmount').html(result.totalLoanAmount)
//					$('#totalReturnAmount').html('累计还款总额：<div><span style="font-size: x-large;">'+result.totalReturnAmount+'</span>&nbsp;元</div>')
					$('#totalInterestAmount').html(result.totalInterestAmount)
//					$('#investorTotalDepositAmount').html('投资人充值总额：<div><span style="font-size: x-large;">'+result.investorTotalDepositAmount+'</span>&nbsp;元</div>')
//					$('#investorTotalWithdrawAmount').html('投资人提现总额：<div><span style="font-size: x-large;">'+result.investorTotalWithdrawAmount+'</span>&nbsp;元</div>')
//					$('#publisherTotalDepositAmount').html('发行人充值总额：<div><span style="font-size: x-large;">'+result.publisherTotalDepositAmount+'</span>&nbsp;元</div>')
//					$('#publisherTotalWithdrawAmount').html('发行人提现总额：<div><span style="font-size: x-large;">'+result.publisherTotalWithdrawAmount+'</span>&nbsp;元</div>')
//					$('#registerAmount').html('注册投资人数：<div><span style="font-size: x-large;">'+result.registerAmount+'</span>&nbsp;人</div>')
//					$('#investorAmount').html('投资人数：<div><span style="font-size: x-large;">'+result.investorAmount+'</span>&nbsp;人</div>')
//					$('#investorHoldAmount').html('持仓人数：<div><span style="font-size: x-large;">'+result.investorHoldAmount+'</span>&nbsp;人</div>')
					$('#overdueTimes').html(result.overdueTimes)
					$('#productAmount').html(result.productAmount)
//					$('#closedProductAmount').html('已结算产品数：<div><span style="font-size: x-large;">'+result.closedProductAmount+'</span>&nbsp;个</div>')
//					$('#toCloseProductAmount').html('待结算产品数：<div><span style="font-size: x-large;">'+result.toCloseProductAmount+'</span>&nbsp;个</div>')
//					$('#onSaleProductAmount').html('在售产品数：<div><span style="font-size: x-large;">'+result.onSaleProductAmount+'</span>&nbsp;个</div>')
//					$('#publisherAmount').html('发行人数：<div><span style="font-size: x-large;">'+result.publisherAmount+'</span>&nbsp;人</div>')
//					$('#verifiedInvestorAmount').html('实名投资人数：<div><span style="font-size: x-large;">'+result.verifiedInvestorAmount+'</span>&nbsp;人</div>')
//					$('#activeInvestorAmount').html('活跃投资人数：<div><span style="font-size: x-large;">'+result.activeInvestorAmount+'</span>&nbsp;人</div>')
//					$('#createTime').html('创建时间：<div><span style="font-size: x-large;">'+result.createTime+'</span></div>')
//					$('#updateTime').html('更新时间：<div><span style="font-size: x-large;">'+result.updateTime+'</span></div>')
				})
			}
			
			function getDetail (offsetOid) {
				http.post(config.api.investorDeta, {
					data: {
						offsetOid: offsetOid
					},
					contentType: 'form'
				}, function (result) {
					var obj = {
						offsetCode: result.offsetCode,
//						netPosition: result.netPosition/10000+'万',
//						buyAmount: result.buyAmount/10000+'万',
						redeemAmount: util.safeCalc(result.redeemAmount, "/", 10000)+'万',
						offsetStatusDisp: result.closeStatusDisp,
						closeMan: result.closeMan || '--'
					}
					$$.detailAutoFix($('#gachaDetailArea'), obj)
					$('#gachaDetailModal').modal('show')
				})
			}
			
			function getQueryParams1 (val) {
				var form = document.searchForm1
				pageOptions1.size = val.limit
				pageOptions1.number = parseInt(val.offset / val.limit) + 1
				pageOptions1.offset = val.offset
				pageOptions1.offsetCode = form.offsetCode.value
				pageOptions1.offsetDateBegin = form.offsetDateBegin.value
				pageOptions1.offsetDateEnd = form.offsetDateEnd.value
				return val
			}
			
			function getQueryParams2 (val) {
				var form = document.searchForm2
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				pageOptions2.offset = val.offset
				pageOptions2.offsetCode = form.offsetCode.value
				pageOptions2.offsetDateBegin = form.offsetDateBegin.value
				pageOptions2.offsetDateEnd = form.offsetDateEnd.value
				return val
			}
			
			function getQueryParams3 (val) {
				var form = document.searchForm3
				pageOptions3.size = val.limit
				pageOptions3.number = parseInt(val.offset / val.limit) + 1
				pageOptions3.offset = val.offset
				pageOptions3.orderType = form.orderType.value
				pageOptions3.orderStatus = form.orderStatus.value
				pageOptions3.orderCode = form.orderCode.value
				pageOptions3.createTimeBegin = form.createTimeBegin.value
				pageOptions3.createTimeEnd = form.createTimeEnd.value
				return val
			}
		}
	}
})
