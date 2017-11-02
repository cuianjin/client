/**
 * 投资者账户详情
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'u_accountdetail',
		init: function () {
			var investorOid = '', ids = [];				
				
				investorOid = util.nav.getHashObj(location.hash).investorOid || ''
//				http.post(config.api.uaccountUserinfo, {
//					data: {
//						uoid: uoid
//					},
//					contentType: 'form'
//				}, function (rlt) {
//					$("#realName").html("用户名："+rlt.realName)
//					$("#phoneNum").html("手机号："+rlt.phoneNum)
//					$("#status").html("状态："+util.enum.transform('uaccountStatus', rlt.status))       	 
//					$("#createTime1").html("注册时间："+util.table.formatter.timestampToDate(rlt.createTime, 'YYYY-MM-DD HH:mm:ss'))
//					$("#firstInvestTime").html(rlt.firstInvestTime ? "首次投资时间："+util.table.formatter.timestampToDate(rlt.firstInvestTime, 'YYYY-MM-DD HH:mm:ss') : '')
//				})
				http.post(config.api.uaccountCashuserinfo, {
					data: {
						uoid: investorOid
					},
					contentType: 'form'
				}, function (rlt) {
					$("#realName").html(rlt.realName)
					$("#phoneNum").html(rlt.phoneNum)
					$("#status").html(util.enum.transform('uaccountStatus', rlt.status))
					$("#owner").html(rlt.owner)
					$("#isFreshmanDisp").html(rlt.isFreshmanDisp)
					$("#createTime").html(rlt.createTime ? util.table.formatter.timestampToDate(rlt.createTime, 'YYYY-MM-DD HH:mm:ss') : '')
					$("#updateTime").html(rlt.updateTime ? util.table.formatter.timestampToDate(rlt.updateTime, 'YYYY-MM-DD HH:mm:ss') : '')
//					$("#firstInvestTime").html(rlt.firstInvestTime ? util.table.formatter.timestampToDate(rlt.firstInvestTime, 'YYYY-MM-DD HH:mm:ss') : '')
					$("#incomeConfirmDate").html(rlt.incomeConfirmDate ? util.table.formatter.timestampToDate(rlt.incomeConfirmDate, 'YYYY-MM-DD') : '')
					$("#balance").html(rlt.balance)
					$("#totalDepositAmount").html(rlt.totalDepositAmount)
					$("#totalWithdrawAmount").html(rlt.totalWithdrawAmount)
					$("#totalInvestAmount").html(rlt.totalInvestAmount)
					$("#totalRedeemAmount").html(rlt.totalRedeemAmount)
					$("#totalIncomeAmount").html(rlt.totalIncomeAmount)
					$("#totalRepayLoan").html(rlt.totalRepayLoan)
					$("#t0YesterdayIncome").html(rlt.t0YesterdayIncome)
					$("#tnTotalIncome").html(rlt.tnTotalIncome)
					$("#t0TotalIncome").html(rlt.t0TotalIncome)
					$("#t0CapitalAmount").html(rlt.t0CapitalAmount)
					$("#tnCapitalAmount").html(rlt.tnCapitalAmount)
//					$("#totalInvestProducts").html(rlt.totalInvestProducts)
					$("#totalDepositCount").html(rlt.totalDepositCount)
					$("#totalWithdrawCount").html(rlt.totalWithdrawCount)
					$("#totalInvestCount").html(rlt.totalInvestCount)
					$("#totalRedeemCount").html(rlt.totalRedeemCount)
					$("#todayDepositCount").html(rlt.todayDepositCount)
					$("#todayWithdrawCount").html(rlt.todayWithdrawCount)
					$("#todayInvestCount").html(rlt.todayInvestCount)
					$("#todayRedeemCount").html(rlt.todayRedeemCount)
					$("#todayDepositAmount").html(rlt.todayDepositAmount)
					$("#todayWithdrawAmount").html(rlt.todayWithdrawAmount)
					$("#todayInvestAmount").html(rlt.todayInvestAmount)
					$("#todayRedeemAmount").html(rlt.todayRedeemAmount)
				})

			
			getBankInfo();
			
			var pageOptions1 = {
				number: 1,
				size: 10,
				offset: 0,
				tradeType: '',
				createTimeBegin: '',
				createTimeEnd: ''
			}
			var pageOptions2 = {
				number: 1,
				size: 10,
				offset: 0,
				holdStatus: '',
				productName: '',
				productCode: ''
			}
			var pageOptions3 = {
				number: 1,
				size: 10,
				offset: 0,
				holdStatus: '',
				productName: '',
				productCode: ''
			}
			var pageOptions4 = {
				number: 1,
				size: 10,
				offset: 0
			}
			var pageOptions5 = {
				number: 1,
				size: 10,
				offset: 0,
				orderType: '',
				orderCode: '',
				orderTimeBegin: '',
				orderTimeEnd: ''
			}
			var pageOptions6 = {
				number: 1,
				size: 10,
				offset: 0,
				orderType: '',
				orderStatus: '',
				orderCode: '',
				createTimeBegin: '',
				createTimeEnd: '',
				investorOid: '',
				productOid: ''
			}
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(config.api.uaccountCashflow, {
						data: {
							page: pageOptions1.number,
							rows: pageOptions1.size,
							investorBaseAccountOid: investorOid,
							tradeType: pageOptions1.tradeType,
							createTimeBegin: pageOptions1.createTimeBegin,
							createTimeEnd: pageOptions1.createTimeEnd
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
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions1.offset
						}
					},
					{
						field: 'tradeAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'tradeTypeDisp'
					},
					{
						field: 'createTime',
						align: 'right',
						formatter: function (val) {
							if(val){
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}else{
								return '--'
							}
						}
					},
					{
						field: 'updateTime',
						align: 'right'
					}
				]
			}
			
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.uaccountHoldconfirm, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							investorBaseAccountOid: investorOid,
							holdStatus: pageOptions2.holdStatus,
							productName: pageOptions2.productName,
							productCode: pageOptions2.productCode,
							productType: 'PRODUCTTYPE_02'
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
				onLoadSuccess: function() {},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'phoneNum':
							pageOptions6.investorOid = row.investorOid
							pageOptions6.productOid = row.productOid
							$('#dataTable6').bootstrapTable('refresh')
							$('#detailModal').modal('show')
							break
						case 'productName' : 
							qryInfo(value,row)
							break
					}
				},
				columns: [{
					halign: 'center',
					align: 'center',
					width: 30,
					formatter: function(val, row, index) {
						return index + 1 + pageOptions2.offset
					}
				}, { // 标识
					field: 'phoneNum',
					class:"table_title_detail"
				}, {
					field: 'productCode'
				}, {
					field: 'productName',
					class:"table_title_detail"
				}, {
					field: 'expAror'
				}, {
					field: 'totalVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'toConfirmRedeemVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'toConfirmInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'totalInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'accruableHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'redeemableHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'lockRedeemHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'value',
					class: 'currency',
					align: 'right'
				}, {
					field: 'expGoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdTotalIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalBaseIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalRewardIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalCouponIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'holdYesterdayIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayBaseIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayRewardIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayCouponIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'confirmDate',
					align: 'right'
				}, {
					field: 'expectIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'accountTypeDisp'
				}, {
					field: 'dayRedeemVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'dayInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'dayRedeemCount',
					class: 'quantity',
					align: 'right'
				}, {
					field: 'maxHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdStatusDisp'
				}, {
					field: 'latestOrderTime',
					align: 'right'
				}, {
					field: 'productAlias'
				}]
			}
			
			var tableConfig3 = {
				ajax: function (origin) {
					http.post(config.api.uaccountHoldconfirm, {
						data: {
							page: pageOptions3.number,
							rows: pageOptions3.size,
							investorBaseAccountOid: investorOid,
							holdStatus: pageOptions3.holdStatus,
							productName: pageOptions3.productName,
							productCode: pageOptions3.productCode,
							productType: 'PRODUCTTYPE_01'
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
				onLoadSuccess: function() {},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'phoneNum':
							pageOptions6.investorOid = row.investorOid
							pageOptions6.productOid = row.productOid
							$('#dataTable6').bootstrapTable('refresh')
							$('#detailModal').modal('show')
							break
						case 'productName' : 
							qryInfo(value,row)
							break
					}
				},
				columns: [{
					halign: 'center',
					align: 'center',
					width: 30,
					formatter: function(val, row, index) {
						return index + 1 + pageOptions3.offset
					}
				}, { // 标识
					field: 'phoneNum',
					class:"table_title_detail"
				}, {
					field: 'productCode'
				}, {
					field: 'productName',
					class:"table_title_detail"
				}, {
					field: 'expAror'
				}, {
					field: 'totalVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'toConfirmRedeemVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'toConfirmInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'totalInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'accruableHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'redeemableHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'lockRedeemHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'value',
					class: 'currency',
					align: 'right'
				}, {
					field: 'expGoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdTotalIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalBaseIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalRewardIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalCouponIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'holdYesterdayIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayBaseIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayRewardIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayCouponIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'confirmDate',
					align: 'right'
				}, {
					field: 'expectIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'accountTypeDisp'
				}, {
					field: 'dayRedeemVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'dayInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'dayRedeemCount',
					class: 'quantity',
					align: 'right'
				}, {
					field: 'maxHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdStatusDisp'
				}, {
					field: 'latestOrderTime',
					align: 'right'
				}, {
					field: 'productAlias'
				}]
			}
			
			var tableConfig4 = {
				ajax: function (origin) {
					http.post(config.api.uaccountIncome, {
						data: {
							page: pageOptions4.number,
							rows: pageOptions4.size,
							investorOid: investorOid
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions4.number,
				pageSize: pageOptions4.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams4,
				columns: [
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions4.offset
						}
					},
					{
						field: 'productCode'
					},
					{
						field: 'productName'
					},
					{
						field: 'incomeAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'baseAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'rewardAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'accureVolume',
						class: 'decimal2',
						align: 'right'
					},
					{
						field: 'confirmDate',
						align: 'right'
					},
					{
						field: 'createTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					}
				]
			}
			
			var tableConfig5 = {
				ajax: function (origin) {
					http.post(config.api.uaccountBankorder, {
						data: {
							page: pageOptions5.number,
							rows: pageOptions5.size,
							investorOid: investorOid,
							orderType: pageOptions5.orderType,
							orderCode: pageOptions5.orderCode,
							orderTimeBegin: pageOptions5.orderTimeBegin,
							orderTimeEnd: pageOptions5.orderTimeEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions5.number,
				pageSize: pageOptions5.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams5,
				columns: [
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions5.offset
						}
					},
					{
						field: 'orderCode'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'orderAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'orderTime',
						align: 'right',
						formatter: function (val) {
							if(val){
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}else{
								return '--'
							}
						}
					},
					{
						field: 'orderStatusDisp'
					},
					{
						field: 'fee',
						class: 'currency',
						align: 'right'
					},
					{
						align: 'center',
						formatter: function (val, row,index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								sub:[{
									text: '冲正',
									type: 'button',
									class: 'item-positive',
									isRender: row.orderType === "deposit" && row.orderStatus === "payFailed"
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable5');
						},
						events: {
							'click .item-positive': function (e, value, row) {
								$('#confirmModal').find('p').html('确定进行冲正？')
								$$.confirm({
									container: $('#confirmModal'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.uaccountCright, {
											orderCode: row.orderCode
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable5').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				]
			}
			
			var tableConfig6 = {
				ajax: function (origin) {
					http.post(config.api.gacha.tradeorder, {
						data: {
							page: pageOptions6.number,
							rows: pageOptions6.size,
							orderType: pageOptions6.orderType,
							orderStatus: pageOptions6.orderStatus,
							orderCode: pageOptions6.orderCode,
							createTimeBegin: pageOptions6.createTimeBegin,
							createTimeEnd: pageOptions6.createTimeEnd,
							investorOid: pageOptions6.investorOid,
							productOid: pageOptions6.productOid
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions6.number,
				pageSize: pageOptions6.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams6,
				columns: [
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions6.offset
						}
					},
					{
						field: 'orderCode'
					},
					{
						field: 'orderAmount',
						class: 'currency',
						align: 'right'
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
						class: 'currency',
						align: 'right'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'orderStatusDisp'
					},
					{
						field: 'productName'
					},
					{
						field: 'createTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'createManDisp'
					},
					{
						field: 'publisherClearStatusDisp',
						formatter: function (val) {
							return val || '--'
						}
					},
					{
						field: 'publisherConfirmStatusDisp',
						formatter: function (val) {
							return val || '--'
						}
					},
					{
						field: 'publisherCloseStatusDisp',
						formatter: function (val) {
							return val || '--'
						}
					},
					{
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
								var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#dataTable6').bootstrapTable('getData').length - 1,
									sub:[{
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
								}]
							return util.table.formatter.generateButton(buttons, 'dataTable6');
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
			
			if (investorOid) {
				$("#dataTable1").bootstrapTable(tableConfig1)
				$("#dataTable2").bootstrapTable(tableConfig2)
				$("#dataTable3").bootstrapTable(tableConfig3)
				$("#dataTable4").bootstrapTable(tableConfig4)
				$("#dataTable5").bootstrapTable(tableConfig5)
				$("#dataTable6").bootstrapTable(tableConfig6)
			}
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			$$.searchInit($('#searchForm3'), $('#dataTable3'))
			$$.searchInit($('#searchForm5'), $('#dataTable5'))
			$$.searchInit($('#searchForm6'), $('#dataTable6'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));
			
			/**
			 * 详情附件表格配置
			 */
			var productDetailInvestFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailInvestFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl+'?realname='+row.name
						}
					}
				}]
			}

			/**
			 * 详情投资协议书表格初始化
			 */
			$('#productDetailInvestFileTable').bootstrapTable(productDetailInvestFileTableConfig)
			
			/**
			 * 详情信息服务协议表格配置
			 */
			var productDetailServiceFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailServiceFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl+'?realname='+row.name
						}
					}
				}]
			}

			/**
			 * 详情信息服务协议表格初始化
			 */
			$('#productDetailServiceFileTable').bootstrapTable(productDetailServiceFileTableConfig)
			
			/**
			 * 详情附件表格配置
			 */
			var productDetailFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
						align: 'right',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl+'?realname='+row.name
						}
					}
				}]
			}

			/**
			 * 详情附件表格初始化
			 */
			$('#productDetailFileTable').bootstrapTable(productDetailFileTableConfig)
			
			/**
			 * 产品详情设置奖励收益表格配置
			 */
			var productRewardTableConfig = {
				columns: [{
					field: 'level'
				}, {
					field: 'startDate',
					formatter: function(val, row, index) {console.log(row)
						if (row.endDate != null && row.endDate != "") {
							return row.startDate + "-" + row.endDate;
						} else {
							return "大于等于" + row.startDate;
						}

					}
				}, {
					field: 'ratio'
				}, ]
			}

			/**
			 * 设置奖励收益表格初始化
			 */
			$('#productRewardTable').bootstrapTable(productRewardTableConfig)
			
			function getQueryParams1 (val) {
				var form = document.searchForm1
				pageOptions1.size = val.limit
				pageOptions1.number = parseInt(val.offset / val.limit) + 1
				pageOptions1.offset = val.offset
				pageOptions1.tradeType = form.tradeType.value
				pageOptions1.createTimeBegin = form.createTimeBegin.value
				pageOptions1.createTimeEnd = form.createTimeEnd.value
				return val
			}
			
			function getQueryParams2 (val) {
				var form = document.searchForm2
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				pageOptions2.offset = val.offset
				pageOptions2.holdStatus = form.holdStatus.value
				pageOptions2.productName = form.productName.value
				pageOptions2.productCode = form.productCode.value
				return val
			}
			
			function getQueryParams3 (val) {
				var form = document.searchForm3
				pageOptions3.size = val.limit
				pageOptions3.number = parseInt(val.offset / val.limit) + 1
				pageOptions3.offset = val.offset
				pageOptions3.holdStatus = form.holdStatus.value
				pageOptions3.productName = form.productName.value
				pageOptions3.productCode = form.productCode.value
				return val
			}
			
			function getQueryParams4 (val) {
				pageOptions4.size = val.limit
				pageOptions4.number = parseInt(val.offset / val.limit) + 1
				pageOptions4.offset = val.offset
				return val
			}
			
			function getQueryParams5 (val) {
				var form = document.searchForm5
				pageOptions5.size = val.limit
				pageOptions5.number = parseInt(val.offset / val.limit) + 1
				pageOptions5.offset = val.offset
				pageOptions5.orderType = form.orderType.value
				pageOptions5.orderCode = form.orderCode.value
				pageOptions5.orderTimeBegin = form.orderTimeBegin.value
				pageOptions5.orderTimeEnd = form.orderTimeEnd.value
				return val
			}
			
			function getQueryParams6 (val) {
				var form = document.searchForm6
				pageOptions6.size = val.limit
				pageOptions6.number = parseInt(val.offset / val.limit) + 1
				pageOptions6.offset = val.offset
				pageOptions6.orderType = form.orderType.value
				pageOptions6.orderStatus = form.orderStatus.value
				pageOptions6.orderCode = form.orderCode.value
				pageOptions6.createTimeBegin = form.createTimeBegin.value
				pageOptions6.createTimeEnd = form.createTimeEnd.value
				return val
			}
			
			$("#removeBankCardBtn").on('click', function() {
				$('#confirmModal').find('p').html('是否解绑此用户绑定的银行卡？')
				$$.confirm({
					container: $('#confirmModal'),
					trigger: this,
					accept: function () {
						http.post(config.api.removebank + '?investorOid=' + investorOid, {
							data: {},
							contentType: 'form'
						}, function (rlt) {
							getBankInfo();
						})
					}
				})			
			})
			
			function getBankInfo() {
				http.post(config.api.bankinfo + '?investorOid=' + investorOid, {
					data: {},
					contentType: 'form'
				}, function (rlt) {
					$("#cardRealName").html(rlt.name || '暂无')
					$("#idCardNum").html(rlt.idNumb || '暂无')
					$("#bankName").html(rlt.bankName || '暂无')       	 
					$("#bankCard").html(rlt.cardNumb || '暂无')
					$("#phone").html(rlt.phoneNo || '暂无')
					$("#bindbankTime").html(rlt.createTime || '暂无')
					if (rlt.isbind) {
						$("#removeBankCardBtn").removeClass('hidden')
					} else {
						$("#removeBankCardBtn").addClass('hidden')
					}
				})
			}
			
			function qryInfo(value,row){
				http.post(config.api.productDetail, {
					data: {
						oid: row.productOid
					},
					contentType: 'form'
				}, function(result) {
					if (result.errorCode == 0) {
						var data = result;

						switch (data.typeOid) {
							case 'PRODUCTTYPE_01':
								$('#detailProductType01Area').show()
								$('#detailProductType02Area').hide()
								$('#rewardDetail').hide()
								break
							case 'PRODUCTTYPE_02':
								$('#detailProductType02Area').show()
								$('#detailProductType01Area').hide()
								$('#rewardDetail').show()
								break
						}

						var productDetailInvestFiles = []
						if (data.investFiles != null && data.investFiles.length > 0) {
							for (var i = 0; i < data.investFiles.length; i++) {
								productDetailInvestFiles.push(data.investFiles[i])
							}
						}
						$('#productDetailInvestFileTable').bootstrapTable('load', productDetailInvestFiles)

						var productDetailServiceFiles = []
						if (data.serviceFiles != null && data.serviceFiles.length > 0) {
							for (var i = 0; i < data.serviceFiles.length; i++) {
								productDetailServiceFiles.push(data.serviceFiles[i])
							}
						}
						$('#productDetailServiceFileTable').bootstrapTable('load', productDetailServiceFiles)

						var productDetailFiles = []
						if (data.files != null && data.files.length > 0) {
							for (var i = 0; i < data.files.length; i++) {
								productDetailFiles.push(data.files[i])
							}
						}
						$('#productDetailFileTable').bootstrapTable('load', productDetailFiles)

						var productRewards = []
						if (data.rewards != null && data.rewards.length > 0) {
							for (var i = 0; i < data.rewards.length; i++) {
								productRewards.push(data.rewards[i])
							}
						}
						$('#productRewardTable').bootstrapTable('load', productRewards)
						
						data.expandProductLabels=''
						if(data.expandProductLabelNames != null && data.expandProductLabelNames.length > 0) {
							for(var i = 0; i < data.expandProductLabelNames.length; i++) {
								data.expandProductLabels+=data.expandProductLabelNames[i]+"&nbsp;&nbsp;&nbsp;"
							}
						}

						$$.detailAutoFix($('#productDetailModal'), data); // 自动填充详情
						$('#productDetailModal').modal('show');
					} else {
						alert(查询失败);
					}
				})
			
			}
		}
	}
})
