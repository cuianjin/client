/**
 * 买卖单管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'purchaseOrder',
		init: function () {
			var productInfo = {
				poid:'',
				money:0,
				cid:'',
				ckey:''
			}
			var pageOptions1 = {
				number: 1,
				size: 10,
				offset: 0,
				createTimeBegin: '',
				createTimeEnd: ''
			}
//			var pageOptions2 = {
//				number: 1,
//				size: 10,
//				offset: 0,
//				createTimeBegin: '',
//				createTimeEnd: ''
//			}
			getSman()
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(config.api.placcountMng, {
						data: {
							page: pageOptions1.number,
							rows: pageOptions1.size,
//							holdStatus: 'holding',
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
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions1.offset
						}
					},
					{
						field: 'productCode'
					},
					{
						field: 'productName'
					},
					{
						field: 'expAror'
					},
					{
						field: 'totalVolume',
						class: 'decimal2'
					},
					{
						class: 'decimal2',
						formatter: function (val, row) {
							return util.safeCalc(util.safeCalc(row.toConfirmRedeemVolume, '+', row.redeemableHoldVolume), '+', row.lockRedeemHoldVolume)
						}
					},
					{
						field: 'redeemableHoldVolume',
						class: 'decimal2'
					},
					{
						field: 'lockRedeemHoldVolume',
						class: 'decimal2'
					},
					{
						field: 'toConfirmRedeemVolume',
						class: 'decimal2'
					},
					{
						field: 'value',
						class: 'currency'
					},
					{
						field: 'holdTotalIncome',
						class: 'currency'
					},
					{
						field: 'holdYesterdayIncome',
						class: 'currency'
					},
					{
						field: 'confirmDate',
						formatter: function (val) {
							return val ? util.table.formatter.timestampToDate(val, 'YYYY-MM-DD') : '--'
						}
					},
					{
						field: 'holdStatusDisp'
					},
					{
						align: 'center',
						width: 100,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '明细',
								type: 'button',
								class: 'item-detail',
								isRender: true
							}, {
								text: '赎回',
								type: 'button',
								class: 'item-redeem',
								isRender: row.holdStatus === 'holding' && row.value > 0
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable1');
						},
						events: {
							'click .item-redeem': function (e, value, row) {
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');
								$('#redeemForm').clearForm();
								$("#maxRedeem").html(row.redeemableHoldAmount);
								var form = document.redeemForm
								$(form).validator('destroy')
								util.form.validator.init($(form));
//								$('#redeemForm').validator('validate');
								$('#redeemModal').modal('show');
								productInfo.poid = row.productOid;
								productInfo.money = row.value;
								productInfo.cid = row.cid;
								productInfo.ckey = row.ckey;
							},
							'click .item-detail': function (e, value, row) {
								// 初始化当前持仓明细
								var currHoldPageOptions = {
									page: 1,
									rows: 10,
									offset: 0,
									holdOid: ''
								};
								var currHoldTableConfig = {
									ajax: function(origin) {
										http.post(config.api.publisher.holdapart.holdQuery, {
												data: currHoldPageOptions,
												contentType: 'form'
											},
											function(rlt) {
												origin.success(rlt)
											})
									},
									pageNumber: currHoldPageOptions.page,
									pageSize: currHoldPageOptions.rows,
									pagination: true,
									sidePagination: 'server',
									pageList: [10, 20, 30, 50, 100],
									queryParams: function(val) {
										currHoldPageOptions.rows = val.limit;
										currHoldPageOptions.page = parseInt(val.offset / val.limit) + 1;
										currHoldPageOptions.offset = val.offset
										currHoldPageOptions.holdOid = row.holdOid;
										return val;
									},
									columns: [{
										halign: 'left',
										align: 'center',
										width: 30,
										formatter: function (val, row, index) {
											return index + 1 + currHoldPageOptions.offset
										}
									}, {
										field: 'channelName'
									}, {
										field: 'productName'
									}, {
										field: 'investVolume',
										class: 'decimal2'
									}, {
										field: 'holdVolume',
										class: 'decimal2'
									}, {
										field: 'totalBaseIncome',
										class: 'currency'
									}, {
										field: 'totalRewardIncome',
										class: 'currency'
									}, {
										field: 'beginAccuralDate'
									}, {
										field: 'accrualStatus',
										formatter: function(val){
											return util.enum.transform('accrualStatus', val)
										}
									}, {
										field: 'baseIncomeRatio',
										class: 'decimal2',
										formatter: function(val) {
											return val * 100 || '--'
										}
									}, {
										field: 'rewardIncomeRatio',
										class: 'decimal2',
										formatter: function(val) {
											return val * 100 || '--'
										}
									}, {
										field: 'rewardIncomeLevel'
									}, {
										field: 'holdDays',
										class: 'quantity'
									}]
								};
								$('#currHoldTable').bootstrapTable('destroy');
								$('#currHoldTable').bootstrapTable(currHoldTableConfig);
	
								// 初始化订单明细
								var orderPageOptions = {
									page: 1,
									rows: 10,
									offset: 0,
									orderType: '',
									orderStatus: '',
									orderCode: '',
									createTimeBegin: '',
									createTimeEnd: '',
									investorOid: '',
									productOid: ''
								};
	
								var orderTableConfig = {
									ajax: function(origin) {
										http.post(config.api.gacha.tradeorder, {
											data: orderPageOptions,
											contentType: 'form'
										}, function(rlt) {
											origin.success(rlt)
										})
									},
									pageNumber: orderPageOptions.page,
									pageSize: orderPageOptions.rows,
									pagination: true,
									sidePagination: 'server',
									pageList: [10, 20, 30, 50, 100],
									queryParams: function(val) {
										var form = document.orderForm
										orderPageOptions.rows = val.limit;
										orderPageOptions.page = parseInt(val.offset / val.limit) + 1;
										orderPageOptions.offset = val.offset
										orderPageOptions.investorOid = row.investorOid;
										orderPageOptions.productOid = row.productOid;
										orderPageOptions.orderType = form.orderType.value
										orderPageOptions.orderStatus = form.orderStatus.value
										orderPageOptions.orderCode = form.orderCode.value
										orderPageOptions.createTimeBegin = form.createTimeBegin.value
										orderPageOptions.createTimeEnd = form.createTimeEnd.value
										return val;
									},
									columns: [
										{
											halign: 'left',
											align: 'center',
											width: 30,
											formatter: function (val, row, index) {
												return index + 1 + orderPageOptions.offset
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
											field: 'orderTypeDisp'
										},
										{
											field: 'orderStatusDisp'
										},
//										{
//											field: 'productCode'
//										},
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
												return util.table.formatter.generateButton(buttons, 'orderTable');
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
								};
								$('#orderTable').bootstrapTable('destroy');
								$('#orderTable').bootstrapTable(orderTableConfig);
	
								$('#investorDetailModal').modal('show');
							}
						}
					}
				]
			}
//			var tableConfig2 = {
//				ajax: function (origin) {
//					http.post(util.buildQueryUrl(config.api.placcountMng, {
//						page: pageOptions2.number,
//						rows: pageOptions2.size,
//						holdStatus: ['expired','closed'],
//						createTimeBegin: pageOptions2.createTimeBegin,
//						createTimeEnd: pageOptions2.createTimeEnd
//					}), {
//						contentType: 'form'
//					}, function (rlt) {
//						origin.success(rlt)
//					})
//				},
//				pageNumber: pageOptions2.number,
//				pageSize: pageOptions2.size,
//				pagination: true,
//				sidePagination: 'server',
//				pageList: [10, 20, 30, 50, 100],
//				queryParams: getQueryParams2,
//				columns: [
//					{
//						halign: 'left',
//						align: 'center',
//						width: 30,
//						formatter: function (val, row, index) {
//							return index + 1 + pageOptions2.offset
//						}
//					},
//					{
//						field: 'productCode'
//					},
//					{
//						field: 'productName'
//					},
//					{
//						field: 'expAror'
//					},
//					{
//						field: 'totalVolume',
//						class: 'decimal2'
//					},
//					{
//						field: 'redeemableHoldVolume',
//						class: 'decimal2'
//					},
//					{
//						field: 'lockRedeemHoldVolume',
//						class: 'decimal2'
//					},
//					{
//						field: 'value',
//						class: 'currency'
//					},
//					{
//						field: 'holdTotalIncome',
//						class: 'currency'
//					},
//					{
//						field: 'holdYesterdayIncome',
//						class: 'currency'
//					},
//					{
//						field: 'confirmDate',
//						formatter: function (val) {
//							return val ? util.table.formatter.timestampToDate(val, 'YYYY-MM-DD') : '--'
//						}
//					},
//					{
//						field: 'holdStatusDisp'
//					},
//					{
//						align: 'center',
//						width: 100,
//						formatter: function (val, row, index) {
//							var buttons = [{
//								text: '明细',
//								type: 'button',
//								class: 'item-detail',
//								isRender: true
//							}]
//							return util.table.formatter.generateButton(buttons, 'dataTable2');
//						},
//						events: {
//							'click .item-detail': function (e, value, row) {
//								
//							},
//						}
//					}
//				]
//			}
			
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
//			$("#dataTable2").bootstrapTable(tableConfig2)
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
//			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			$$.searchInit($('#orderForm'), $('#orderTable'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));
			
//			$('#redeemForm').validator({
//				custom: {
//					validfloat: util.form.validator.validfloat,
//					validmoney: validmoney
//				},
//				errors: {
//					validfloat: '数据格式小数2位',          
//					validmoney: '赎回金额不能超过当前最大赎回金额'
//				}
//			})
			
			$("#refresh").on('click', function(){
				getSman()
			})
			
			function getSman () {
				http.post(config.api.placcountSman, {
					contentType: 'form'
				}, function (result) {
					$('#balance').html(util.safeCalc(result.balance, "/", 10000))
					$('#t0CapitalAmount').html(util.safeCalc(result.t0CapitalAmount, "/", 10000))
					$('#totalIncomeAmount').html(util.safeCalc(result.totalIncomeAmount, "/", 10000))
				})
			}
			
			function getQueryParams1 (val) {
				var form = document.searchForm1
				pageOptions1.size = val.limit
				pageOptions1.number = parseInt(val.offset / val.limit) + 1
				pageOptions1.offset = val.offset
				pageOptions1.createTimeBegin = form.createTimeBegin.value
				pageOptions1.createTimeEnd = form.createTimeEnd.value
				return val
			}
			
//			function getQueryParams2 (val) {
//				var form = document.searchForm2
//				pageOptions2.size = val.limit
//				pageOptions2.number = parseInt(val.offset / val.limit) + 1
//				pageOptions2.offset = val.offset
//				pageOptions2.createTimeBegin = form.createTimeBegin.value
//				pageOptions2.createTimeEnd = form.createTimeEnd.value
//				return val
//			}
			
			$('#redeemBtn').on('click', function(){
				if (!$('#redeemForm').validator('doSubmitCheck')) return
				if ($('#moneyVolume').val() > parseFloat($('#maxRedeem').html().replace(/\,/g,''))) {
					window.alert('赎回金额不可大于可赎回金额！')
					return
				}
				var redeemMoney = {
					productOid: productInfo.poid,
					moneyVolume: $('#moneyVolume').val(),
					cid: productInfo.cid,
					ckey: productInfo.ckey
				}
				$('#refreshDiv').addClass('overlay');
				$('#refreshI').addClass('fa fa-refresh fa-spin');
				http.post(config.api.placcountSuperRedeem, {
					data:JSON.stringify(redeemMoney),
					contentType: 'application/json'
				}, function (rlt) {
					$('#redeemModal').modal('hide');
					$("#dataTable1").bootstrapTable('refresh')
				}, function(err){
					$('#refreshDiv').removeClass('overlay');
					$('#refreshI').removeClass('fa fa-refresh fa-spin');
					errorHandle(err)
				})
			})
			
			//验证金额
//			function validmoney($el) {
//				var form = $el.closest('form')
//				var part = form.find('input[data-validMoney]')
//				return !(part.val() > productInfo.money)
//			}
		}
	}
})
