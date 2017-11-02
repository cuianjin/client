/**
 * 投资组合运营管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'portfolioManagement',
		init: function() {

			// 缓存当前页投资组合id
			var pageState = {
				portfolioOid: util.nav.getHashObj(location.hash).id || ''
			};
			// 缓存可用现金，单位（万元）
			var freeCash = 0;
			// 实际值--收益分配事件
			var incomeEventOid = null;
			//是否全部赎回/转出
			var forceClose = 'NO';


			// 历史总资产净值查询定义
			var allNetValuePageOptions = {
				page: 1,
				rows: 10,
				portfolioOid: pageState.portfolioOid
			};
			// 历史总资产净值表格配置  开始
			var allNetValueTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getListByHistory, {
						data: allNetValuePageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: allNetValuePageOptions.page,
				pageSize: allNetValuePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					allNetValuePageOptions.rows = val.limit
					allNetValuePageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(allNetValuePageOptions.page - 1) * allNetValuePageOptions.rows + index + 1
					}
				}, {
					field: 'netDate',
					align: 'right'
				}, {
					field: 'nav',
					align: 'right'
				}, {
					field: 'share',
					align: 'right'
				}, {
					field: 'net',
					align: 'right'
				}, {
					field: 'chargeAmount',
					align: 'right'
				}, {
					field: 'withdrawAmount',
					align: 'right'
				}, {
					field: 'tradeAmount',
					align: 'right'
				}, {
					field: 'netYield',
					align: 'right',
					formatter: function(val) {
						return formatPercent(val)
					}
				}]
			};
			// 历史总资产净值表格配置  结束

			// 净值校准记录 查询定义
			var netValuePageOptions = {
				page: 1,
				rows: 10,
				portfolioOid: pageState.portfolioOid
			};
			// 净值校准记录 表格配置   开始
			var netValueTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getListByRecording, {
						data: netValuePageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: netValuePageOptions.page,
				pageSize: netValuePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					netValuePageOptions.rows = val.limit
					netValuePageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(netValuePageOptions.page - 1) * netValuePageOptions.rows + index + 1
					}
				}, {
					field: 'netDate',
					align: 'right'
				}, {
					field: 'nav',
					align: 'right'
				}, {
					field: 'share',
					align: 'right'
				}, {
					field: 'net',
					align: 'right'

				}, {
					field: 'netYield',
					align: 'right',
					formatter: function(val) {
						return formatPercent(val)
					}
				}, {
					field: 'orderState',
					align: 'left',
					formatter: function(val, row) {
						var className = ''
						if(val === 'SUBMIT') {
							className = 'text-yellow'
							return '<span class="' + className + '">待审核</span>'
						}
						if(val === 'PASS') {
							className = 'text-green'
							return '<span class="' + className + '">审核通过</span>'
						}
						if(val === 'FAIL') {
							className = 'text-red'
							return '<span class="' + className + '">审核驳回</span>'
						}
						if(val === 'DELETE') {
							className = 'text-red'
							return '<span class="' + className + '">已删除</span>'
						}
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
									text: '提交审核',
									type: 'button',
									class: 'item-submit',
									isRender: row.orderState == 'FAIL'
								}]
						var format = util.table.formatter.generateButton(buttons, 'netValueTable')
		            	if(row.orderState == 'SUBMIT' || row.orderState == 'FAIL'){
		            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
		            	}
						return format
					},
					events: {
						'click .item-submit': function(e, val, row) {
							http.post(config.api.portfolio.submit, {
								data: {
									portfolioOid: pageState.portfolioOid,
									netDate: row.netDate,
									nav: row.nav,
									share: row.share
								},
								contentType: 'form'
							}, function(json) {

							})
							$('#netValueTable').bootstrapTable('refresh')
						},
						'click .item-delete': function(e, val, row) {
							http.post(config.api.portfolio.delete, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {

							})
							$('#netValueTable').bootstrapTable('refresh')
						}
					}
				}]
			};
			// 净值校准记录 表格配置   结束

			// 资产交易表格 查询定义 
			var assetDealPageOptions = {
				page: 1,
				rows: 10,
				portfolioOid: pageState.portfolioOid
			};
			// 资产交易表格配置  开始
			var assetDealTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getMarketOrderListByPortfolioOid, {
						data: assetDealPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: assetDealPageOptions.page,
				pageSize: assetDealPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					assetDealPageOptions.rows = val.limit
					assetDealPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(assetDealPageOptions.page - 1) * assetDealPageOptions.rows + index + 1
					}
				}, {
					field: 'orderDate',
					align: 'right'
				}, {
					field: 'assetName',
					align: 'left'
				}, {
					field: 'assetType',
					align: 'left',
					formatter: function(val, row) {
						return formatAssetType(val, row)
					}
				}, {
					field: 'dealType',
					align: 'left',
					formatter: function(val) {
						return formatDealType(val)
					}
				}, {
					field: 'orderAmount',
					align: 'right',
					formatter: function(val, row) {
						switch(row.dealType) {
							case "PURCHASE":
							case "SUBSCRIPE":
							case "REDEEM":
							case "SELLOUT":
							case "REFUND":
							case "TRANSFER":
							case "OVERDUETRANS":
							case "CANCELLATE":
							case "OVERDUECANCELLATE":
								return formatNumber(row.orderAmount);
								break;
							case "REPAYMENT":
								return formatNumber(row.capital + row.income);
								break;
						}
						return null;
					}
				}, {
					field: 'tradeShare',
					align: 'right',
					formatter: function(val, row) {
						switch(row.dealType) {
							case "PURCHASE":
							case "SUBSCRIPE":
							case "REDEEM":
							case "SELLOUT":
							case "REFUND":
							case "TRANSFER":
							case "OVERDUETRANS":
							case "CANCELLATE":
							case "OVERDUECANCELLATE":
								return formatNumber(row.tradeShare);
								break;
							case "REPAYMENT":
								return formatNumber(row.capital);
								break;
						}
						return null;
					}
				}]
			};
			// 资产交易表格配置  结束

			// 交易记录表格 查询定义
			var assetDealRecordPageOptions = {
				page: 1,
				rows: 10,
				portfolioOid: pageState.portfolioOid
			};
			// 交易记录表格配置  开始
			var assetDealRecordTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getMarketOrderRecordList, {
						data: assetDealRecordPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: assetDealRecordPageOptions.page,
				pageSize: assetDealRecordPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					assetDealRecordPageOptions.rows = val.limit
					assetDealRecordPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(assetDealRecordPageOptions.page - 1) * assetDealRecordPageOptions.rows + index + 1
					}
				}, {
					field: 'assetName',
					align: 'left'
				}, {
					field: 'assetType',
					align: 'left',
					formatter: function(val, row) {
						return formatAssetType(val, row)
					}
				}, {
					field: 'orderDate',
					align: 'right'
				}, {
					field: 'dealType',
					align: 'left',
					formatter: function(val) {
						return formatDealType(val)
					}
				}, {
					field: 'orderAmount',
					align: 'right',
					formatter: function(val, row) {
						switch(row.dealType) {
							case "PURCHASE":
							case "SUBSCRIPE":
							case "REDEEM":
							case "SELLOUT":
							case "REFUND":
							case "TRANSFER":
							case "OVERDUETRANS":
							case "CANCELLATE":
							case "OVERDUECANCELLATE":
								return formatNumber(row.orderAmount);
								break;
							case "REPAYMENT":
								return formatNumber(row.capital + row.income);
								break;
						}
						return null;
					}
				}, {
					field: 'tradeShare',
					align: 'right',
					formatter: function(val, row) {
						switch(row.dealType) {
							case "PURCHASE":
							case "SUBSCRIPE":
							case "REDEEM":
							case "SELLOUT":
							case "REFUND":
							case "TRANSFER":
							case "OVERDUETRANS":
							case "CANCELLATE":
							case "OVERDUECANCELLATE":
								return formatNumber(row.tradeShare);
								break;
							case "REPAYMENT":
								return formatNumber(row.capital);
								break;
						}
						return null;
					}
				}, {
					field: 'orderState',
					align: 'center',
					formatter: function(val) {
						if(val == 'SUBMIT') {
							return '待审核'
						}
						if(val == 'PASS') {
							return '通过'
						}
						if(val == 'FAIL') {
							return '驳回'
						}
						if(val == 'DELETE') {
							return '已删除'
						}
					}
				}, {
					field: 'auditMark',
					align: 'center',
				}]
			};
			// 交易记录表格配置  结束
			
			// 累计计提费用明细 查询定义
			var countintChargefeeDetailPageOptions = {
				page: 1,
				rows: 10,
				portfolioOid: pageState.portfolioOid
			};
			// 累计计提费用明细 表格配置   开始
			var countintChargefeeDetailTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.chargefeeList, {
						data: countintChargefeeDetailPageOptions,
						contentType: 'form'
					}, function(rlt) {
						console.log(rlt)
						origin.success(rlt)
					})
				},
				pageNumber: countintChargefeeDetailPageOptions.page,
				pageSize: countintChargefeeDetailPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					countintChargefeeDetailPageOptions.rows = val.limit
					countintChargefeeDetailPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(countintChargefeeDetailPageOptions.page - 1) * countintChargefeeDetailPageOptions.rows + index + 1
					}
				},{
					field: 'estimateDate',
					align: 'right'
				}, {
					field: 'totalEstimate',
					align: 'right'
				}, {
					field: 'liquidEstimate',
					align: 'right'
				}, {
					field: 'illiquidEstimate',
					align: 'right'

				}, {
					field: 'cashEstimate',
					align: 'right'
				}, {
					field: 'manageChargefee',
					align: 'center'
				}, {
					field: 'trusteeChargefee',
					align: 'center'
				}, {
					field: 'chargefee',
					align: 'center'
				}]
			};
			// 累计计提费用明细 表格配置   结束

			// 投资损益表格 查询定义
			var deviationValueRecordPageOptions = {
				page: 1,
				rows: 10,
				portfolioOid: pageState.portfolioOid
			};
			// 投资损益表格配置  开始
			var deviationValueRecordTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getListByLosses, {
						data: deviationValueRecordPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: deviationValueRecordPageOptions.page,
				pageSize: deviationValueRecordPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					deviationValueRecordPageOptions.rows = val.limit
					deviationValueRecordPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(deviationValueRecordPageOptions.page - 1) * deviationValueRecordPageOptions.rows + index + 1
					}
				}, {
					field: 'assetName',
					align: 'left'
				}, {
					field: 'assetType',
					align: 'left',
					formatter: function(val, row) {
						return formatAssetType(val, row)
					}
				}, {
					field: 'orderDate',
					align: 'right'
				}, {
					field: 'investCapital',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'investIncome',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'holdShare',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'selloutShare',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'selloutPrice',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'losses',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}]
			};
			// 投资损益表格配置  结束

			// 现金类管理资产表格配 查询定义
			var liquidAssetPageOptions = {
				page: 1,
				rows: 10,
				oid: pageState.portfolioOid
			};
			// 现金类管理资产表格配置  开始
			var liquidAssetTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getLiquidManageOrderList, {
						data: liquidAssetPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: liquidAssetPageOptions.page,
				pageSize: liquidAssetPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					liquidAssetPageOptions.rows = val.limit
					liquidAssetPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(liquidAssetPageOptions.page - 1) * liquidAssetPageOptions.rows + index + 1
					}
				}, {
					field: 'assetName',
					align: 'left'
				}, {
					field: 'assetType',
					align: 'left',
					formatter: function(val) {
						return formatAssetType(val)
					}
				}, {
					field: 'investDate',
					align: 'right'
				}, {
					field: 'valueDate',
					align: 'right'
				}, {
					field: 'holdShare',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'investAmount',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'investCome',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'totalPfofit',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '赎回',
							type: 'button',
							class: 'item-redeem',
							isRender: true
						}]
						return util.table.formatter.generateButton(buttons, 'liquidAssetTable')
					},
					events: {
						'click .item-redeem': function(e, val, row) {
							$('#doRedeem').removeAttr('disabled');
							http.post(config.api.portfolio.getLiquidRedeemOrderList, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								var data = json; 
								var maxHoldShare = formatUnitToWan(data.holdShare);
								$('#liquidAssetReturnVolume').attr('data-validfloatrange', '6-6-0-' + maxHoldShare);
								$('#redeemForm').validator('destroy');
								$('#redeemForm').validator({
									custom: {
										validfloat: util.form.validator.validfloat,
										validfloatrange: util.form.validator.validfloatrange
									},
									errors: {
										validfloat: '数据格式不正确',
										validfloatrange: '赎回份额不能小于0且不能大于持有份额'
									}
								});
								data.assetType = formatAssetType(data.assetType)
								data.holdAmount = formatNumber(data.holdAmount)
								data.holdShare = formatNumber(data.holdShare)
								data.investAmount = formatNumber(data.investAmount)
								data.investCome = formatNumber(data.investCome)
								data.totalPfofit = formatNumber(data.totalPfofit)
								$$.detailAutoFix($('#redeemForm'), json);
								$$.formAutoFix($('#redeemForm'), json);
								$('#redeemModal').modal('show');
							})
						}
					}
				}]
			};
			// 现金类管理资产表格配置  结束

			// 非现金类管理资产表格 查询定义
			var iliquidAssetPageOptions = {
				page: 1,
				rows: 10,
				oid: pageState.portfolioOid
			};
			// 非现金类管理资产表格配置  开始
			var iliquidAssetTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getIlliquidManageOrderList, {
						data: iliquidAssetPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: iliquidAssetPageOptions.page,
				pageSize: iliquidAssetPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					iliquidAssetPageOptions.rows = val.limit
					iliquidAssetPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(iliquidAssetPageOptions.page - 1) * iliquidAssetPageOptions.rows + index + 1
					}
				}, {
					field: 'assetName',
					align: 'left'
				}, {
					field: 'assetType',
					align: 'left',
					formatter: function(val) {
						return formatAssetType(val)
					}
				}, {
					field: 'investDate',
					align: 'right'
				}, {
					field: 'valueDate',
					align: 'right'
				}, {
					field: 'expectValue',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'holdShare',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'holdIncome',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'totalPfofit',
					align: 'right',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'accrualType',
					align: 'left',
					formatter: function(val) {
						return formatAccrualType(val)
					}
				}, {
					field: 'lifeState',
					align: 'left',
					formatter: function(val) {
						return util.enum.transform('illiquidAssetLifeStatesCondition', val);
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row,index) {
						var repaymentBtn = {
							text: '还款计划',
							type: 'button',
							class: 'item-repayment'
						};
						var transBtn = {
							text: '转让',
							type: 'button',
							class: 'item-trans'
						};
						var selloutBtn = {
							text: '转让',
							type: 'button',
							class: 'item-sellout'
						};
						var overdueTransBtn = {
							text: '转让',
							type: 'button',
							class: 'item-overdueTrans'
						};
						var cancellateBtn = {
							text: '坏账核销',
							type: 'button',
							class: 'item-cancellate'
						};
						var overduecancellateBtn = {
							text: '逾期坏账核销',
							type: 'button',
							class: 'item-overduecancellate'
						};
						var refundBtn = {
							text: '退款',
							type: 'button',
							class: 'item-refund',
							isRender: row.lifeState == 'SETUP_FAIL'
						};
						var buttons = [];
						buttons.push(refundBtn);
						switch(row.assetType) {
							case 'TARGETTYPE_05':
							case 'TARGETTYPE_06':
							case 'TARGETTYPE_07':
							case 'TARGETTYPE_04':
							case 'TARGETTYPE_03':
							case 'TARGETTYPE_12':
							case 'TARGETTYPE_13':
							case 'TARGETTYPE_01':
							case 'TARGETTYPE_02':
							case 'TARGETTYPE_14':
								switch(row.lifeState) {
									case 'SETUP':
									case 'OVER_VALUEDATE':
									case 'REPAYMENTS':
									case 'OVERDUE_REPAYMENTS':
										buttons.push(repaymentBtn);
										break;
									case 'OVERDUE':
									case 'OVERDUE_TRANSFER':
										buttons.push(overdueTransBtn);
										break;
									case 'CANCELLATION':
										buttons.push(cancellateBtn);
										break;
									case 'OVERDUE_CANCELLATION':
										buttons.push(overduecancellateBtn);
										break;
									case 'TRANSFER':
										buttons.push(transBtn);
										break;
									case 'VALUEDATE':
										buttons.push(repaymentBtn);
										buttons.push(selloutBtn);
										break;
								}
								break;
							case 'TARGETTYPE_16':
							case 'TARGETTYPE_15':
								switch(row.lifeState) {
									case 'UNSETUP':
									case 'OVER_VALUEDATE':
									case 'REPAYMENTS':
									case 'OVERDUE_REPAYMENTS':
										buttons.push(repaymentBtn);
										break;
									case 'OVERDUE':
									case 'OVERDUE_TRANSFER':
										buttons.push(overdueTransBtn);
										break;
									case 'CANCELLATION':
										buttons.push(cancellateBtn);
										break;
									case 'OVERDUE_CANCELLATION':
										buttons.push(overduecancellateBtn);
										break;
									case 'TRANSFER':
										buttons.push(transBtn);
										break;
									case 'VALUEDATE':
										buttons.push(repaymentBtn);
										buttons.push(selloutBtn);
										break;
								}
								break;
							case 'TARGETTYPE_17':
							case 'TARGETTYPE_18':
								switch(row.lifeState) {
									case 'UNSETUP':
									case 'OVER_VALUEDATE':
									case 'REPAYMENTS':
									case 'OVERDUE_REPAYMENTS':
										buttons.push(repaymentBtn);
										break;
									case 'OVERDUE':
									case 'OVERDUE_TRANSFER':
										buttons.push(overdueTransBtn);
										break;
									case 'CANCELLATION':
										buttons.push(cancellateBtn);
										break;
									case 'OVERDUE_CANCELLATION':
										buttons.push(overduecancellateBtn);
										break;
									case 'TRANSFER':
										buttons.push(transBtn);
										break;
									case 'VALUEDATE':
										buttons.push(repaymentBtn);
										buttons.push(selloutBtn);
										break;
								}
								break;
							case 'TARGETTYPE_19':
								switch(row.lifeState) {
									case 'UNSETUP':
									case 'OVER_VALUEDATE':
									case 'REPAYMENTS':
									case 'OVERDUE_REPAYMENTS':
										buttons.push(repaymentBtn);
										break;
									case 'OVERDUE':
									case 'OVERDUE_TRANSFER':
										buttons.push(overdueTransBtn);
										break;
									case 'CANCELLATION':
										buttons.push(cancellateBtn);
										break;
									case 'OVERDUE_CANCELLATION':
										buttons.push(overduecancellateBtn);
										break;
									case 'TRANSFER':
										buttons.push(transBtn);
										break;
									case 'VALUEDATE':
										buttons.push(repaymentBtn);
										buttons.push(selloutBtn);
										break;
								}
								break;
							case 'TARGETTYPE_08':
								switch(row.lifeState) {
									case 'UNSETUP':
									case 'SETUP':
									case 'OVER_VALUEDATE':
									case 'REPAYMENTS':
									case 'OVERDUE_REPAYMENTS':
										buttons.push(repaymentBtn);
										break;
									case 'OVERDUE':
									case 'OVERDUE_TRANSFER':
										buttons.push(overdueTransBtn);
										break;
									case 'CANCELLATION':
										buttons.push(cancellateBtn);
										break;
									case 'OVERDUE_CANCELLATION':
										buttons.push(overduecancellateBtn);
										break;
									case 'TRANSFER':
										buttons.push(transBtn);
										break;
									case 'VALUEDATE':
										buttons.push(selloutBtn);
										break;
								}
								break;
								case 'TARGETTYPE_20':
							        switch(row.lifeState) {
							         case 'SETUP':
							         case 'VALUEDATE':
							         case 'OVER_VALUEDATE':
							         case 'REPAYMENTS':
							         case 'OVERDUE_REPAYMENTS':
							          buttons.push(repaymentBtn);
							          break;
							         case 'OVERDUE_TRANSFER':
							          buttons.push(overdueTransBtn);
							          break;
							         case 'CANCELLATION':
							          buttons.push(cancellateBtn);
							          break;
							         case 'TRANSFER':
							          buttons.push(transBtn);
							          break;
							       }
							       break;
						}
						
						buttons = [{
								text: '操作',
								type: 'buttonGroup',
								isCloseBottom: index >= $('#iliquidAssetTable').bootstrapTable('getData').length - 1,
								sub:buttons
							}]
						return util.table.formatter.generateButton(buttons, 'iliquidAssetTable')
					},
					events: {
						'click .item-repayment': function(e, val, row) {
							$('#doRepayment').removeAttr('disabled');
							http.post(config.api.portfolio.repaymentList, {
								data: {
									holdOid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								$('#repaymentScheduleTable').bootstrapTable('load', json.rows);
								$('#repaymentScheduleModal').modal('show');
							})
						},
						'click .item-trans': function(e, val, row) {
							$('#doTransfer').removeAttr('disabled');
							http.post(config.api.portfolio.getIlliquidRedeemOrderList, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								var data = json;
								$('#doTransferForm').validator('destroy');
								$('#doTransferForm').validator({
									custom: {
										validfloat: util.form.validator.validfloat
									},
									errors: {
										validfloat: '数据格式不正确'
									}
								});
								var viewData = {
									illiquidAssetOid: data.illiquidAssetOid,
									assetName: data.assetName,
									assetType: formatAssetType(data.assetType),
									investDate: data.investDate,
									valueDate: data.valueDate,
									expectValue: formatNumber(data.expectValue),
									holdShare: formatNumber(data.holdShare),
									accrualType: formatAccrualType(data.accrualType),
									holdIncome: formatNumber(data.holdIncome),
									transOrderAmout: formatNumber(data.expectValue)
								}
								$$.formAutoFix($('#doTransferForm'), viewData);
								$('#doTransferModal').modal('show');
							})
						},
						'click .item-sellout': function(e, val, row) {
							$('#doSellout').removeAttr('disabled');
							http.post(config.api.portfolio.getIlliquidRedeemOrderList, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								var data = json;
								var maxHoldShare = formatNumber(data.holdShare);
								$('#selloutOrderShare').attr('data-validfloatrange', '6-6-0-' + maxHoldShare);
								$('#doSelloutForm').validator('destroy');
								$('#doSelloutForm').validator({
									custom: {
										validfloatforplus: util.form.validator.validfloatforplus,
										validfloatrange: util.form.validator.validfloatrange
									},
									errors: {
										validfloatforplus: '数据格式不正确',
										validfloatrange: '转出份额不能小于0且不能大于持有份额'
									}
								});
								var viewData = {
									illiquidAssetOid: data.illiquidAssetOid,
									assetName: data.assetName,
									assetType: formatAssetType(data.assetType),
									investDate: data.investDate,
									valueDate: data.valueDate,
									expectValue: formatNumber(data.expectValue),
									holdShare: formatNumber(data.holdShare),
									accrualType: formatAccrualType(data.accrualType),
									holdIncome: formatNumber(data.holdIncome),
									selloutOrderAmout: formatNumber(data.expectValue)
								}
								$$.formAutoFix($('#doSelloutForm'), viewData);
								$('#doSelloutModal').modal('show');
							})
						},
						'click .item-overdueTrans': function(e, val, row) {
							$('#doOverduetrans').removeAttr('disabled');
							http.post(config.api.portfolio.getIlliquidRedeemOrderList, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								var data = json;
								$('#doOverduetransForm').validator('destroy');
								$('#doOverduetransForm').validator({
									custom: {
										validfloat: util.form.validator.validfloat
									},
									errors: {
										validfloat: '数据格式不正确'
									}
								});
								var viewData = {
									illiquidAssetOid: data.illiquidAssetOid,
									assetName: data.assetName,
									assetType: formatAssetType(data.assetType),
									investDate: data.investDate,
									valueDate: data.valueDate,
									expectValue: formatNumber(data.expectValue),
									holdShare: formatNumber(data.holdShare),
									accrualType: formatAccrualType(data.accrualType),
									holdIncome: formatNumber(data.holdIncome),
									overduetransOrderAmout: formatNumber(data.expectValue)
								}
								$$.formAutoFix($('#doOverduetransForm'), viewData);
								$('#doOverduetransModal').modal('show');
							})
						},
						'click .item-cancellate': function(e, val, row) {
							$('#doCancellate').removeAttr('disabled');
							http.post(config.api.portfolio.getIlliquidRedeemOrderList, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								var data = json;
								var viewData = {
									illiquidAssetOid: data.illiquidAssetOid,
									assetName: data.assetName,
									assetType: formatAssetType(data.assetType),
									investDate: data.investDate,
									valueDate: data.valueDate,
									expectValue: formatNumber(data.expectValue),
									holdShare: formatNumber(data.holdShare),
									accrualType: formatAccrualType(data.accrualType),
									totalPfofit: formatNumber(data.totalPfofit)
								}
								$$.formAutoFix($('#doCancellateForm'), viewData);
								$('#doCancellateModal').modal('show');
							})
						},
						'click .item-overduecancellate': function(e, val, row) {
							$('#doOverdueCancellate').removeAttr('disabled');
							http.post(config.api.portfolio.getIlliquidRedeemOrderList, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(json) {
								var data = json;
								var viewData = {
									illiquidAssetOid: data.illiquidAssetOid,
									assetName: data.assetName,
									assetType: formatAssetType(data.assetType),
									investDate: data.investDate,
									valueDate: data.valueDate,
									expectValue: formatNumber(data.expectValue),
									holdShare: formatNumber(data.holdShare),
									accrualType: formatAccrualType(data.accrualType),
									totalPfofit: formatNumber(data.totalPfofit)
								}
								$$.formAutoFix($('#doOverdueCancellateForm'), viewData);
								$('#doOverdueCancellateModal').modal('show');
							})
						},
						'click .item-refund': function(e, val, row) {
							$('#doRefund').removeAttr('disabled');
							$('#doRefundForm').validator('destroy');
							$('#doRefundForm').validator({
								custom: {
									validfloat: util.form.validator.validfloat
								},
								errors: {
									validfloat: '数据格式不正确'
								}
							});
							var viewData = {
								illiquidAssetOid: row.illiquidAssetOid,
								assetName: row.assetName,
								expectValue: formatNumber(row.expectValue),
								holdShare: formatNumber(row.holdShare),
								holdIncome: formatNumber(row.holdIncome),
								refundAmount: formatNumber(row.expectValue)
							};
							$$.formAutoFix($('#doRefundForm'), viewData);
							$('#doRefundModal').modal('show');
						},
					}
				}]
			};
			// 非现金类管理资产表格配置  结束

			// 收益分配记录 查询定义
			var pdListPageOptions = {
				number: 1,
				size: 10,
				assetPoolOid: pageState.portfolioOid
			};
			// 收益分配记录 表格配置
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
				queryParams: function(val) {

					pdListPageOptions.size = val.limit
					pdListPageOptions.number = parseInt(val.offset / val.limit) + 1
					pdListPageOptions.assetPoolOid = pageState.portfolioOid
					return val

				},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'productName':
							qryInfo(value,row)
							break
					}
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return(pdListPageOptions.number - 1) * pdListPageOptions.size + index + 1
					}
				}, {
					field: 'baseDate',
					align: 'right'
				}, {
					field: 'productName',
					align: 'left',
					class:"table_title_detail"
				}, {
					class: 'decimal4',
					field: 'capital',
					align: 'right'
				}, {
					field: 'allocateIncomeType',
					formatter: function(val) {
						if(val == 'raiseIncome') {
							return '募集期收益'
						}
						if(val == 'durationIncome') {
							return '存续期收益'
						}
					}
				}, {
					class: 'currency',
					field: 'totalAllocateIncome',
					align: 'right'
				}, {
					class: 'currency',
					field: 'allocateIncome',
					align: 'right'
				}, {
					class: 'currency',
					field: 'rewardIncome',
					align: 'right'
				}, {
					class: 'currency',
					field: 'couponIncome',
					align: 'right'
				}, {
					class: 'currency',
					field: 'successAllocateIncome',
					align: 'right'
				}, {
					class: 'currency',
					field: 'successAllocateRewardIncome',
					align: 'right'
				}, {
					class: 'currency',
					field: 'successAllocateCouponIncome',
					align: 'right'
				}, {
					field: 'ratio',
					align: 'right'
				}, {
					field: 'status',
					align: 'left',
					formatter: function(val) {
						var className = ''
						if(val == 'CREATE') {
							className = 'text-yellow'
							return '<span class="' + className + '">待审核</span>'
						}
						if(val == 'ALLOCATING') {
							className = 'text-blue'
							return '<span class="' + className + '">发放中</span>'
						}
						if(val == 'ALLOCATED') {
							className = 'text-green'
							return '<span class="' + className + '">发放完成</span>'
						}
						if(val == 'ALLOCATEFAIL') {
							className = 'text-red'
							return '<span class="' + className + '">发放失败</span>'
						}
						if(val == 'FAIL') {
							className = 'text-red'
							return '<span class="' + className + '">驳回</span>'
						}
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '再次发放',
							type: 'button',
							class: 'item-allocate',
							isRender: row.status == 'ALLOCATEFAIL'
						}/*, {
							text: '删除',
							type: 'button',
							class: 'item-delete',
							isRender: row.status == 'CREATE' || row.status == 'FAIL'
						}*/]
						var format =  util.table.formatter.generateButton(buttons, 'profitDistributeTable')
						if(row.status == 'CREATE' || row.status == 'FAIL'){
							format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>'
						}
						return format;
					},
					events: {
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
							$('#confirmModal').find('p').html('确定删除此条数据？')
							$$.confirm({
								container: $('#confirmModal'),
								trigger: this,
								accept: function() {
									http.post(config.api.duration.income.deleteIncomeAdjust, {
										data: {
											oid: row.oid
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
			};
			// 收益分配记录 表格配置 end;	

			/**
			 * 收益分配持有人明细分页列表 表格配置
			 */
			var pdOrderPageOptions = {
				number: 1,
				size: 10,
				incomeOid: incomeEventOid
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
				queryParams: function(val) {
					pdOrderPageOptions.size = val.limit
					pdOrderPageOptions.number = parseInt(val.offset / val.limit) + 1
					pdOrderPageOptions.incomeOid = incomeEventOid
					return val
				},
				onLoadSuccess: function() {},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return(pdOrderPageOptions.number - 1) * pdOrderPageOptions.size + index + 1
					}
				}, {
					field: 'phoneNum',
					align: 'right'
				}, {
					field: 'confirmDate',
					align: 'right'
				}, {
					field: 'accureVolume',
					align: 'right',
					class: 'decimal4'
//					formatter: function(val, row, index) {
//						return (Math.floor(val * 100) / 100).toFixed(2);
//					}										
				}, {
					field: 'baseAmount',
					align: 'right',
					class: 'currency'
//					formatter: function(val, row, index) {
//						return (Math.floor(val * 100) / 100).toFixed(2);
//					}					
				}, {
					field: 'rewardAmount',
					align: 'right',
					class: 'currency'
//					formatter: function(val, row, index) {
//						return (Math.floor(val * 100) / 100).toFixed(2);
//					}					
				}, {
					field: 'couponAmount',
					align: 'right',
					class: 'currency'
//					formatter: function(val, row, index) {
//						return (Math.floor(val * 100) / 100).toFixed(2);
//					}					
				}, {
					field: 'incomeAmount',
					align: 'right',
					class: 'currency'
//					formatter: function(val, row, index) {
//						return (Math.floor(val * 100) / 100).toFixed(2);
//					}					
				}]
			};

			// 净值校准 定义 开始
			// 净值校准按钮点击事件
			$('#netValueAdjsut').off().on('click', function() {
				$('#doNetValueAdjust').removeAttr('disabled');
				$('#netValueAdjustForm').validator('destroy');
				$('#netValueAdjustForm').validator({
					custom: {
						validpositive: util.form.validator.validpositive,
						validfloatforplus: util.form.validator.validfloatforplus
					},
					errors: {
						validpositive: '数据不能小于等于0',
						validfloatforplus: '数据格式不正确'
					}
				});
				http.post(config.api.portfolio.prepare, {
					data: {
						portfolioOid: pageState.portfolioOid,
					},
					contentType: 'form'
				}, function(json) {
					if(json.correcting == true) {
						$('#correctingMessage').show()
						$('#allCorrectedMessage').hide()
						$('#netValueAdjustMessageModal').modal('show')
					} else if(json.allCorrected == true) {
						$('#correctingMessage').hide()
						$('#allCorrectedMessage').show()
						$('#netValueAdjustMessageModal').modal('show')
					} else if(json.corrected == true) {
						$('#netValueAdjustForm').show();
						var viewData = {
							lastNetDate: json.lastNetDate,
							lastNet: json.lastNet,
							lastNav: json.lastNav,
							lastShare: json.lastShare,
							currentCorrectDate: json.currentCorrectDate
						}
						$$.formAutoFix($('#netValueAdjustForm'), viewData);
						$('#netValueAdjustModal').modal('show')
					} else if(json.corrected == false) {
						$('#netValueAdjustForm').show();
						$('#doNetValueAdjustShow').hide();
						$('#doNetValueAdjustNetDate').removeAttr('readonly');
						$('#doNetValueAdjustNetDate').data("DateTimePicker").maxDate(json.maxCorrectDate);
						$('#netValueAdjustModal').modal('show');
					}
				})
			});

			//净值校准 之前做过净值校准 单位净值chang事件
			$('#doNetValueAdjustNav').off().on('change', function() {
				if($('#doNetValueAdjustNav').val() == '' || $('#doNetValueAdjustNav').val() == null) {
					$('#doNetValueAdjustNet').val(0)
				} else if($('#doNetValueAdjustShare').val() != '' && $('#doNetValueAdjustShare').val() != null) {
					var r = $('#doNetValueAdjustNet').val()
					r = parseFloat($('#doNetValueAdjustNav').val()) * parseFloat($('#doNetValueAdjustShare').val())
					$('#doNetValueAdjustNet').val(r)
				}
			}).change();

			//净值校准 之前做过净值校准 份额chang事件
			$('#doNetValueAdjustShare').off().on('change', function() {
				if($('#doNetValueAdjustShare').val() == '' || $('#doNetValueAdjustShare').val() == null) {
					$('#doNetValueAdjustNet').val(0)
				} else if($('#doNetValueAdjustNav').val() != '' && $('#doNetValueAdjustNav').val() != null) {
					var r = $('#doNetValueAdjustNet').val()
					r = parseFloat($('#doNetValueAdjustNav').val()) * parseFloat($('#doNetValueAdjustShare').val())
					$('#doNetValueAdjustNet').val(r)
				}
			}).change();

			//净值校准  之前做过净值校准  提交审核事件
			$('#doNetValueAdjust').off().on('click', function() {
				if(!$('#netValueAdjustForm').validator('doSubmitCheck')) return
				$('#doNetValueAdjust').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					netDate: $('#doNetValueAdjustNetDate').val(),
					nav: $('#doNetValueAdjustNav').val(),
					share: $('#doNetValueAdjustShare').val()
				};
				http.post(config.api.portfolio.submit, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#doNetValueAdjust').attr('disabled', false);
					$('#netValueAdjustModal').modal('hide');
				});
			});
			// 净值校准定义结束

			// 收益分配 按钮点击事件
			$('#profitDistribute').off().on('click', function() {
				$("#profitDistributeForm").validator('destroy')
				util.form.reset($('#profitDistributeForm'))
				var modal = $('#profitDistributeModal')
				http.post(config.api.duration.income.getIncomeAdjustData, {
					data: {
						assetPoolOid: pageState.portfolioOid
					},
					contentType: 'form'
				}, function(result) {
					var data = result
					if(data.investmentAssetsStr === null) {
						data.investmentAssetsStr = 0
					}
					if(data.apUndisIncomeStr === null) {
						data.apUndisIncomeStr = 0
					}
					if(data.apReceiveIncomeStr === null) {
						data.apReceiveIncomeStr = 0
					}

					if(data.productTotalScaleStr === null) {
						data.productTotalScaleStr = 0
					}
					if(data.productRewardBenefitStr === null) {
						data.productRewardBenefitStr = 0
					}
					if(data.feeValueStr === null) {
						data.feeValueStr = 0
					}

					var form = document.profitDistributeForm
					form.assetpoolOid.value = pageState.portfolioOid

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
					$('#productCouponBenefit').hide()

					if(data.lastIncomeDate == '') {
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
				})

			});

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
				var productCouponBenefit = parseFloat(document.profitDistributeForm.productCouponBenefit.value) //产品范畴 产品加息收益 
				var incomeCalcBasis = parseInt(document.profitDistributeForm.incomeCalcBasis.value) //计算基础
				var apUndisIncome = parseFloat(document.profitDistributeForm.apUndisIncome.value) //未分配收益 资产池范畴

				if(isNaN(apUndisIncome)) {
					apUndisIncome = 0
				}
				if(isNaN(productTotalScale)) {
					productTotalScale = 0
				}
				if(isNaN(productRewardBenefit)) {
					productRewardBenefit = 0
				}
				if(isNaN(productCouponBenefit)) {
					productCouponBenefit = 0
				}
				if(isNaN(incomeCalcBasis)) {
					incomeCalcBasis = 365
				}

				var productAnnualYield = 0 //产品范畴 年化收益率=分配收益/产品总规模*365
				if(!isNaN(productTotalScale) && productTotalScale != 0) {
					//					productAnnualYield = productDistributionIncome * incomeCalcBasis * 100 / productTotalScale
					productAnnualYield = (Math.pow(((productDistributionIncome / productTotalScale) + 1), 365) - 1) * 100
				}

				var receiveIncome = 0
				var undisIncome = apUndisIncome - productRewardBenefit - productDistributionIncome - productCouponBenefit //未分配收益 试算结果
				if(isNaN(undisIncome)) {
					undisIncome = 0
				}

				if(undisIncome < 0) {
					receiveIncome = Math.abs(undisIncome)
					undisIncome = 0
				}

				var totalScale = productTotalScale + productRewardBenefit + productDistributionIncome + productCouponBenefit//产品总规模 试算结果

				var millionCopiesIncome = 0;
				if(productTotalScale !== 0) {
					millionCopiesIncome = productDistributionIncome * 10000 / productTotalScale //万份收益 试算结果
				}

				document.profitDistributeForm.productAnnualYield.value = productAnnualYield.toFixed(2) //年化收益率 产品范畴
				document.profitDistributeForm.undisIncome.value = undisIncome.toFixed(2) //未分配收益 试算结果
				document.profitDistributeForm.receiveIncome.value = receiveIncome.toFixed(2) //应收投资收益 试算结果
				document.profitDistributeForm.totalScale.value = totalScale.toFixed(2) //产品总规模 试算结果
				document.profitDistributeForm.annualYield.value = productAnnualYield.toFixed(2) //年化收益率 试算结果
				document.profitDistributeForm.millionCopiesIncome.value = millionCopiesIncome.toFixed(4) //万份收益 试算结果

				var distributionIncomeStr = this.value
				if(distributionIncomeStr.indexOf(".") != -1) {
					var str = new Array();
					str = distributionIncomeStr.split(".");
					if(str.length == 2) {
						if(str[0].length > 12 || str[1].length > 2) {
							$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
							$('#productDistributionIncomeDiv').addClass("has-error")
							flag = false
						} else {
							$('#productDistributionIncomeError').html('')
						}
					} else {
						$('#productDistributionIncomeError').html('')
					}
				} else {
					if(distributionIncomeStr.length > 12) {
						$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
						$('#productDistributionIncomeDiv').addClass("has-error")
						flag = false
					} else {
						$('#productDistributionIncomeError').html('')
					}
				}

				var productAnnualYieldStr = document.profitDistributeForm.productAnnualYield.value
				if(productAnnualYieldStr.indexOf(".") != -1) {
					var str = new Array();
					str = productAnnualYieldStr.split(".");
					if(str.length == 2) {
						if(str[0].length > 4 || str[1].length > 2) {
							$('#productAnnualYieldError').html('年化收益只能为前4位后2位小数')
							$('#productAnnualYieldDiv').addClass("has-error")
							flag = false
						} else {
							$('#productAnnualYieldError').html('')
						}
					} else {
						$('#productAnnualYieldError').html('')
					}
				} else {
					if(productAnnualYieldStr.length > 4) {
						$('#productAnnualYieldError').html('年化收益只能为前4位后2位小数')
						$('#productAnnualYieldDiv').addClass("has-error")
						flag = false
					} else {
						$('#productAnnualYieldError').html('')
					}
				}

				return flag

			});

			// 分收益分配天数输入框input事件绑定
			$(document.profitDistributeForm.incomeFirstDate).on('blur', function() {
				$("#profitDistributeForm").validator('destroy')

				var incomeDate = this.value
				document.profitDistributeForm.incomeDistrDate.value = incomeDate
				if(incomeDate !== '') {
					http.post(config.api.duration.income.getTotalScaleRewardBenefit, {
						data: {
							assetPoolOid: pageState.portfolioOid,
							incomeDate: incomeDate
						},
						contentType: 'form'
					}, function(result) {
						if(result.errorCode == 0) {
							var data = result

							if(data.productTotalScaleStr === null) {
								data.productTotalScaleStr = 0
							}

							if(data.productRewardBenefitStr === null) {
								data.productRewardBenefitStr = 0
							}

							document.profitDistributeForm.productTotalScale.value = data.productTotalScale
							document.profitDistributeForm.productRewardBenefit.value = data.productRewardBenefit
							document.profitDistributeForm.productCouponBenefit.value = data.productCouponBenefit

							$('#productTotalScaleStr').hide()
							$('#productRewardBenefitStr').hide()
							$('#productCouponBenefitStr').hide()
							$('#feeValueStr').hide()

							$('#productTotalScale').show()
							$('#productRewardBenefit').show()
							$('#productCouponBenefit').show()
							$('#feeValue').show()

							var productDistributionIncome = parseFloat(document.profitDistributeForm.productDistributionIncome.value) //产品范畴 分配收益1
							var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) //产品范畴 产品总规模 1
							var productRewardBenefit = parseFloat(document.profitDistributeForm.productRewardBenefit.value) //产品范畴 产品奖励收益 
							var productCouponBenefit = parseFloat(document.profitDistributeForm.productCouponBenefit.value) //产品范畴 产品加息收益 
							var incomeCalcBasis = parseInt(document.profitDistributeForm.incomeCalcBasis.value) //计算基础
							var apUndisIncome = parseFloat(document.profitDistributeForm.apUndisIncome.value) //未分配收益 资产池范畴

							if(isNaN(apUndisIncome)) {
								apUndisIncome = 0
							}
							if(isNaN(productTotalScale)) {
								productTotalScale = 0
							}
							if(isNaN(productRewardBenefit)) {
								productRewardBenefit = 0
							}
							if(isNaN(productCouponBenefit)) {
								productCouponBenefit = 0
							}
							if(isNaN(incomeCalcBasis)) {
								incomeCalcBasis = 365
							}

							var productAnnualYield = 0 //产品范畴 年化收益率
							if(!isNaN(productTotalScale) && productTotalScale != 0) {
								productAnnualYield = productDistributionIncome / productTotalScale * incomeCalcBasis * 100
							}

							var receiveIncome = 0
							var undisIncome = apUndisIncome - productRewardBenefit - productDistributionIncome - productCouponBenefit//未分配收益 试算结果
							if(isNaN(undisIncome)) {
								undisIncome = 0
							}

							if(undisIncome < 0) {
								receiveIncome = Math.abs(undisIncome)
								undisIncome = 0
							}

							var totalScale = productTotalScale + productRewardBenefit + productDistributionIncome + productCouponBenefit//产品总规模 试算结果
							var millionCopiesIncome = productAnnualYield / incomeCalcBasis * 10000 / 100 //万份收益 试算结果

							document.profitDistributeForm.productAnnualYield.value = productAnnualYield.toFixed(2) //年化收益率 产品范畴
							document.profitDistributeForm.undisIncome.value = undisIncome.toFixed(2) //未分配收益 试算结果
							document.profitDistributeForm.receiveIncome.value = receiveIncome.toFixed(2) //应收投资收益 试算结果
							document.profitDistributeForm.totalScale.value = totalScale.toFixed(2) //产品总规模 试算结果
							document.profitDistributeForm.annualYield.value = productAnnualYield.toFixed(2) //年化收益率 试算结果
							document.profitDistributeForm.millionCopiesIncome.value = millionCopiesIncome.toFixed(4) //万份收益 试算结果

							util.form.validator.init($('#profitDistributeForm'))

						}
					})

				}

			});

			/**
			 * 格式化交易类型
			 * @param {Object} val
			 */
			function formatDealType(val) {
				if(val === 'PURCHASE') {
					return '申购'
				}
				if(val === 'SUBSCRIPE') {
					return '认购'
				}
				if(val === 'REDEEM') {
					return '赎回'
				}
				if(val === 'REPAYMENT') {
					return '还款'
				}
				if(val === 'SELLOUT') {
					return '转让'
				}
				if(val === 'TRANSFER') {
					return '转让'
				}
				if(val === 'OVERDUETRANS') {
					return '转让'
				}
				if(val === 'CANCELLATE') {
					return '坏账核销'
				}
				if(val === 'OVERDUECANCELLATE') {
					return '逾期坏账核销'
				}
				if(val === 'REFUND') {
					return '退款'
				}
			};

			/**
			 * 格式化资产标的类型
			 * @param {Object} val
			 */
			function formatAssetType(val) {
				if(val === 'CASHTOOLTYPE_01') {
					return '货币基金'
				}
				if(val === 'CASHTOOLTYPE_02') {
					return '协定存款'
				}
				if(val === 'TARGETTYPE_05') {
					return '信托类 - 券商资管计划'
				}
				if(val === 'TARGETTYPE_06') {
					return '信托类 - 基金/基金子公司资管计划'
				}
				if(val === 'TARGETTYPE_07') {
					return '信托类 - 保险资管计划'
				}
				if(val === 'TARGETTYPE_04') {
					return '信托类 - 信托计划-房地产类'
				}
				if(val === 'TARGETTYPE_03') {
					return '信托类 - 信托计划-政信类'
				}
				if(val === 'TARGETTYPE_12') {
					return '信托类 - 信托计划-工商企业类'
				}
				if(val === 'TARGETTYPE_13') {
					return '信托类 - 信托计划-金融产品投资类'
				}
				if(val === 'TARGETTYPE_01') {
					return '信托类 - 证券类'
				}
				if(val === 'TARGETTYPE_02') {
					return '信托类 - 股权投资类'
				}
				if(val === 'TARGETTYPE_14') {
					return '信托类 - 银行理财类'
				}
				if(val === 'TARGETTYPE_16') {
					return '票据类 - 商票'
				}
				if(val === 'TARGETTYPE_15') {
					return '票据类 - 银票'
				}
				if(val === 'TARGETTYPE_17') {
					return '消费金融类 - 现金贷'
				}
				if(val === 'TARGETTYPE_18') {
					return '消费金融类 - 消费分期'
				}
				if(val === 'TARGETTYPE_19') {
					return '供应链金融产品类'
				}
				if(val === 'TARGETTYPE_08') {
					return '债权及债权收益类'
				}
				if(val === 'TARGETTYPE_20') {
					return '房抵贷'
				}
			};

			/**
			 * 格式化还款方式
			 * @param {Object} val
			 */
			function formatAccrualType(val) {
				if(val == 'A_DEBT_SERVICE_DUE') {
					return '一次性还本付息 '
				}
				if(val == 'EACH_INTEREST_RINCIPAL_DUE') {
					return '按月付息到期还本  '
				}
				if(val == 'FIXED-PAYMENT_MORTGAGE') {
					return '等额本息  '
				}
				if(val == 'FIXED-BASIS_MORTGAGE') {
					return '等额本金  '
				}
			};

			/**
			 * 格式化风险等级
			 * @param {Object} value
			 * @param {Object} row
			 */
			function formatRiskLevel(val) {
				if(val == 'R1') {
					return 'R1 - 谨慎型'
				} else if(val == 'R2') {
					return 'R2 - 稳健型'
				} else if(val == 'R3') {
					return 'R3 - 平衡型'
				} else if(val == 'R4') {
					return 'R4 - 进取型'
				} else if(val == 'R5') {
					return 'R5 - 激进型'
				}
			};

			/**
			 * 格式化单位为（万元）
			 * @param {Object} val
			 */
			function formatUnitToWan(val) {
				if(val) {
					val = parseFloat(val)
					return util.safeCalc(val, '/', 10000, 6)
				} else {
					return 0
				}
			};

			/**
			 * 格式化单位为（万元）
			 * @param {Object} val
			 */
			function formatNumber(val) {
				if(val) {
					val = formatUnitToWan(val)
					return $.number(val, 6)
				} else {
					return 0
				}
			};

			/**
			 * 格式化百分比
			 * 以千分位展示
			 * @param {Object} val
			 */
			function formatPercent(val) {
				if(val) {
					val = parseFloat(val)
					return util.safeCalc(val, '*', 100, 4)
				} else {
					return 0
				}
			};

			// 还款计划表格配置  开始
			var repaymentScheduleTableConfig = {
				columns: [{
					field: 'issue',
					align: 'center'
				}, {
					field: 'intervalDays',
					align: 'center'
				}, {
					field: 'startDate',
					align: 'center',
					width: 100
				}, {
					field: 'endDate',
					align: 'center',
					width: 100
				}, {
					field: 'dueDate',
					align: 'center',
					width: 100
				}, {
					field: 'principalPlan',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'interestPlan',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'principal',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'interest',
					formatter: function(val) {
						return formatNumber(val)
					}
				}, {
					field: 'state',
					align: 'center',
					width: 120,
					formatter: function(val) {
						if(val == 'UNDUE') {
							return '未还款'
						} else if(val == 'PAYING') {
							return '已到期未还款'
						} else if(val == 'AUDIT') {
							return '还款待审核'
						} else {
							return '已还款'
						}
					}
				}, {
					width: 100,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '还款入账',
							type: 'button',
							class: 'item-doRepayment',
							isRender: row.paidable
						}]
						return util.table.formatter.generateButton(buttons, 'repaymentScheduleTable')
					},
					events: {
						'click .item-doRepayment': function(e, val, row) {
							var viewData = {
								oid: row.oid,
								illiquidAssetOid: row.illiquidAssetOid,
								issue: row.issue,
								startDate: row.startDate,
								endDate: row.endDate,
								principalPlan: formatNumber(row.principalPlan),
								interestPlan: formatNumber(row.interestPlan),
								repaymentPlan: formatNumber(row.repaymentPlan),
								principal: formatNumber(row.principalPlan),
								interest: formatNumber(row.interestPlan),
								repayment: formatNumber(row.repaymentPlan)
							}
							$$.formAutoFix($('#doRepaymentForm'), viewData); // 自动填充表单
							if(row.repaymentType == 'EACH_INTEREST_RINCIPAL_DUE' && row.lastIssue == 'NO') {
								$('#orderCapitalFact').attr('readOnly', 'readOnly')
								$('#orderCapitalFact').val(0)
								$('#repaymentFact').val($('#orderIncomeFact').val())
							} else {
								$('#orderCapitalFact').removeAttr('readOnly')
							}
							$('#doRepaymentScheduleModal').modal('show')
							$('#repaymentScheduleModal').modal('hide')
						}
					}
				}]
			};
			// 还款计划表格配置结束

			//还款  实还本金chang事件
			$('#orderCapitalFact').off().on('change', function() {
				var r = $('#repaymentFact').val()
				r = parseFloat($('#orderCapitalFact').val()) + parseFloat($('#orderIncomeFact').val())
				$('#repaymentFact').val(r)
			}).change();

			//还款  实还利息chang事件
			$('#orderIncomeFact').off().on('change', function() {
				var r = $('#repaymentFact').val()
				r = parseFloat($('#orderCapitalFact').val()) + parseFloat($('#orderIncomeFact').val())
				$('#repaymentFact').val(r)
			}).change();
			
			// 交易申请按钮点击事件
			$('#buyAsset').off().on('click', function() {
//				bindIlliquidAssetTrade();
				$('#buyAssetModal').modal('show');
				if ($('#orderAmount').val() != '' && $('#orderAmount').val() != null && $('#orderAmount').val() != undefined) {
					$('#doBuyAsset').removeAttr('disabled');
				}
				if ($('#subIlliquidAssetOrderAmount').val() != '' && $('#subIlliquidAssetOrderAmount').val() != null && $('#subIlliquidAssetOrderAmount').val() != undefined) {
					$('#doSubIlliquidAsset').removeAttr('disabled');
				}
				if ($('#buyIlliquidAssetOrderAmount').val() != '' && $('#buyIlliquidAssetOrderAmount').val() != null && $('#buyIlliquidAssetOrderAmount').val() != undefined 
				 && $('#buyIlliquidAssetOrderShare').val() != '' && $('#buyIlliquidAssetOrderShare').val() != null && $('#buyIlliquidAssetOrderShare').val() != undefined) {
					$('#doBuyIlliquidAsset').removeAttr('disabled');
				}
			});

			// 是否全部赎回radio按钮事件-现金类资产
			$(document.redeemForm.allFlag_liquidAsset).on('ifChecked', function() {
				if(this.value === 'NO') {
					$('#liquidAssetReturnVolume').removeAttr('disabled')
					$("#redeemForm").validator('destroy')
					util.form.validator.init($('#redeemForm'))
					forceClose = 'NO';
				} else {
					$('#liquidAssetReturnVolume').attr('disabled', 'disabled')
					$("#redeemForm").validator('destroy')
					util.form.validator.init($('#redeemForm'))
					forceClose = 'YES';
				}
			});

			// 是否全部转出radio按钮事件-非现金类资产
			$(document.doSelloutForm.allFlag_sellout).on('ifChecked', function() {
				if(this.value === 'NO') {
					$('#selloutOrderShare').removeAttr('disabled')
					$("#doSelloutForm").validator('destroy')
					util.form.validator.init($('#doSelloutForm'))
					forceClose = 'NO';
				} else {
					$('#selloutOrderShare').attr('disabled', 'disabled')
					$("#doSelloutForm").validator('destroy')
					util.form.validator.init($('#doSelloutForm'))
					forceClose = 'YES';
				}
			});

			// 交易申请 - 申购现金类资产提交审核按钮点击事件
			$('#doBuyAsset').off().on('click', function() {
				if(!$('#buyAssetForm').validator('doSubmitCheck')) return
				$('#doBuyAsset').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					liquidAssetOid: $('#liquidAssetTargetName').val(),
					orderAmount: $('#orderAmount').val()
				};
				http.post(config.api.portfolio.purchaseForLiquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doBuyAsset').attr('disabled', false);
					$('#buyAssetModal').modal('hide');
				});
			});

			// 交易申请 - 认购非现金类资产提交审核按钮点击事件
			$('#doSubIlliquidAsset').off().on('click', function() {
				if(!$('#subIlliquidAssetForm').validator('doSubmitCheck')) return
				$('#doSubIlliquidAsset').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#illiquidAssetTargetName').val(),
					orderAmount: $('#subIlliquidAssetOrderAmount').val(),
					exceptWay: $('#subExceptWay').val()
				};
				http.post(config.api.portfolio.subscripeForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doSubIlliquidAsset').attr('disabled', false);
					bindIlliquidAssetTrade();
					$('#buyAssetModal').modal('hide');
				});
			});

			// 交易申请 - 申购非现金类资产提交审核按钮点击事件
			$('#doBuyIlliquidAsset').off().on('click', function() {
				if(!$('#buyIlliquidAssetForm').validator('doSubmitCheck')) return
				$('#doBuyIlliquidAsset').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#illiquidAssetName').val(),
					orderAmount: $('#buyIlliquidAssetOrderAmount').val(),
					orderShare: $('#buyIlliquidAssetOrderShare').val(),
					exceptWay: $('#buyExceptWay').val()
				};
				http.post(config.api.portfolio.purchaseForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doBuyIlliquidAsset').attr('disabled', false);
					bindIlliquidAssetTrade();
					$('#buyAssetModal').modal('hide');
				});
			});

			// 赎回 - 现金类提交审核按钮点击事件
			$('#doRedeem').off().on('click', function() {
				if(!$('#redeemForm').validator('doSubmitCheck')) return
				$('#doRedeem').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					liquidAssetOid: $('#liquidAssetOid').val(),
					orderAmount: $('#liquidAssetReturnVolume').val(),
					forceClose: forceClose
				};
				http.post(config.api.portfolio.redeemForLiquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doRedeem').attr('disabled', false);
					$('#redeemModal').modal('hide');
				});
			});

			// 还款 - 非现金类提交审核按钮点击事件
			$('#doRepayment').off().on('click', function() {
				$('#doRepayment').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#repaymentIlliquidAssetOid').val(),
					illiquidAssetRepaymentOid: $('#illiquidAssetRepaymentOid').val(),
					orderCapital: $('#orderCapitalFact').val(),
					orderIncome: $('#orderIncomeFact').val()
				};
				http.post(config.api.portfolio.repaymentForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doRepayment').attr('disabled', false);
					$('#doRepaymentScheduleModal').modal('hide');
				});
			});

			// 转让 - 非现金类提交审核按钮点击事件
			$('#doTransfer').off().on('click', function() {
				if(!$('#doTransferForm').validator('doSubmitCheck')) return
				$('#doTransfer').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#transIlliquidAssetOid').val(),
					orderAmount: $('#transOrderAmout').val()
				};
				http.post(config.api.portfolio.transferForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doTransfer').attr('disabled', false);
					$('#doTransferModal').modal('hide');
				});
			});

			// 逾期转让 - 非现金类提交审核按钮点击事件
			$('#doOverduetrans').off().on('click', function() {
				if(!$('#doOverduetransForm').validator('doSubmitCheck')) return
				$('#doOverduetrans').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#overduetransIlliquidAssetOid').val(),
					orderAmount: $('#overduetransOrderAmout').val()
				};
				http.post(config.api.portfolio.overduetransForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doOverduetrans').attr('disabled', false);
					$('#doOverduetransModal').modal('hide');
				});
			});

			// 转出 - 非现金类提交审核按钮点击事件
			$('#doSellout').off().on('click', function() {
				if(!$('#doSelloutForm').validator('doSubmitCheck')) return
				$('#doSellout').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#selloutIlliquidAssetOid').val(),
					orderAmount: $('#selloutOrderAmout').val(),
					orderShare: $('#selloutOrderShare').val(),
					forceClose: 'YES'
				};
				http.post(config.api.portfolio.selloutForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doSellout').attr('disabled', false);
					$('#doSelloutModal').modal('hide');
				});
			});

			// 坏账核销 - 非现金类提交审核按钮点击事件
			$('#doCancellate').off().on('click', function() {
				$('#doCancellate').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#cancellateIlliquidAssetOid').val()
				};
				http.post(config.api.portfolio.cancellateForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doCancellate').attr('disabled', false);
					$('#doCancellateModal').modal('hide');
				});
			});

			// 逾期坏账核销 - 非现金类提交审核按钮点击事件
			$('#doOverdueCancellate').off().on('click', function() {
				$('#doOverdueCancellate').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#overdueCancellateIlliquidAssetOid').val()
				};
				http.post(config.api.portfolio.overdueCancellateForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doOverdueCancellate').attr('disabled', false);
					$('#doOverdueCancellateModal').modal('hide');
				});
			});

			// 退款 - 非现金类提交审核按钮点击事件
			$('#doRefund').off().on('click', function() {
				if(!$('#doRefundForm').validator('doSubmitCheck')) return
				$('#doRefund').attr('disabled', true);
				var data = {
					portfolioOid: pageState.portfolioOid,
					illiquidAssetOid: $('#refundIlliquidAssetOid').val(),
					orderAmount: $('#refundAmount').val()
				};
				http.post(config.api.portfolio.refundForIlliquid, {
					data: data,
					contentType: 'form'
				}, function(json) {
					$('#assetDealTable').bootstrapTable('refresh');
					$('#assetDealRecordTable').bootstrapTable('refresh');
					$('#doRefund').attr('disabled', false);
					$('#doRefundModal').modal('hide');
				});
			});

			// 收益分配录入审核 - 通过按钮点击事件
			$('#profitDistributeAuditPass').off().on('click', function() {
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
			});

			// 收益分配录入审核 - 不通过按钮点击事件
			$('#profitDistributeAuditFail').off().on('click', function() {
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
			});

			// 再次发送收益分配 - 确定按钮点击事件
			$('#profitDistributeAgain').off().on('click', function() {
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
			});

			// 再次发送收益分配 - 取消按钮点击事件
			$('#profitDistributeCancel').off().on('click', function() {
				var modal = $('#profitDistributeAgainModal')
				modal.modal('hide')
			});
			// 设置收益首分配日可选日期为今天之前
			$(document.profitDistributeForm.incomeFirstDate).datetimepicker({
				maxDate: moment().subtract(1, 'days')
			});

			$(document.profitDistributeForm.productAnnualYield).on('input', function() {
				var flag = true
				$('#productDistributionIncomeError').html('')
				$('#productAnnualYieldError').html('')
				$('#productDistributionIncomeDiv').removeClass("has-error")
				$('#productAnnualYieldDiv').removeClass("has-error")

				var productAnnualYield = parseFloat(this.value) || 0 //产品范畴 年化收益率

				var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) || 0 //产品范畴 产品总规模 1
				var productRewardBenefit = parseFloat(document.profitDistributeForm.productRewardBenefit.value) //产品范畴 产品奖励收益 
				var productCouponBenefit = parseFloat(document.profitDistributeForm.productCouponBenefit.value) //产品范畴 产品加息收益 
				var incomeCalcBasis = parseInt(document.profitDistributeForm.incomeCalcBasis.value) //计算基础
				var apUndisIncome = parseFloat(document.profitDistributeForm.apUndisIncome.value) //未分配收益 资产池范畴

				if(isNaN(apUndisIncome)) {
					apUndisIncome = 0
				}
				if(isNaN(productTotalScale)) {
					productTotalScale = 0
				}
				if(isNaN(productRewardBenefit)) {
					productRewardBenefit = 0
				}
				if(isNaN(productCouponBenefit)) {
					productCouponBenefit = 0
				}
				if(isNaN(incomeCalcBasis)) {
					incomeCalcBasis = 365
				}

				//				productAnnualYield * productTotalScale / incomeCalcBasis / 100
				var productDistributionIncome = (Math.pow((productAnnualYield / 100 + 1), (1 / incomeCalcBasis)) - 1) * productTotalScale //产品范畴 分配收益1

				var receiveIncome = 0
				var undisIncome = apUndisIncome - productRewardBenefit - productDistributionIncome - productCouponBenefit//未分配收益 试算结果
				if(isNaN(undisIncome)) {
					undisIncome = 0
				}
				if(undisIncome < 0) {
					receiveIncome = Math.abs(undisIncome)
					undisIncome = 0
				}

				var totalScale = productTotalScale + productRewardBenefit + productDistributionIncome + productCouponBenefit//产品总规模 试算结果
				var millionCopiesIncome = 0;
				if(incomeCalcBasis != 0) {
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
				if(productAnnualYieldStr.indexOf(".") != -1) {
					var str = new Array();
					str = productAnnualYieldStr.split(".");
					if(str.length == 2) {
						if(str[0].length > 4 || str[1].length > 2) {
							$('#productAnnualYieldError').html('年化收益只能为前4位后2位小数')
							$('#productAnnualYieldDiv').addClass("has-error")
							flag = false
						} else {
							$('#productAnnualYieldError').html('')
						}
					} else {
						$('#productAnnualYieldError').html('')
					}
				} else {
					if(productAnnualYieldStr.length > 4) {
						$('#productAnnualYieldError').html('年化收益只能为前4位后2位小数')
						$('#productAnnualYieldDiv').addClass("has-error")
						flag = false
					} else {
						$('#productAnnualYieldError').html('')
					}
				}

				var distributionIncomeStr = document.profitDistributeForm.productDistributionIncome.value
				if(distributionIncomeStr.indexOf(".") != -1) {
					var str = new Array();
					str = distributionIncomeStr.split(".");
					if(str.length == 2) {
						if(str[0].length > 12 || str[1].length > 2) {
							$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
							$('#productDistributionIncomeDiv').addClass("has-error")
							flag = false
						} else {
							$('#productDistributionIncomeError').html('')
						}
					} else {
						$('#productDistributionIncomeError').html('')
					}
				} else {
					if(distributionIncomeStr.length > 12) {
						$('#productDistributionIncomeError').html('可分配收益只能为前12位后2位小数')
						$('#productDistributionIncomeDiv').addClass("has-error")
						flag = false
					} else {
						$('#productDistributionIncomeError').html('')
					}
				}
				return flag

			});

			// 审收益分配“确定”按钮点击事件
			$('#profitDistributeSubmit').off().on('click', function() {
				if(!$('#profitDistributeForm').validator('doSubmitCheck')) return

				var incomeLastDistrDate = document.profitDistributeForm.incomeLastDistrDate.value
				var productTotalScale = parseFloat(document.profitDistributeForm.productTotalScale.value) //产品范畴 产品总规模 1
				if(incomeLastDistrDate === '' && productTotalScale == 0) {
					return
				}
				$('#profitDistributeModal').modal('hide')
				$('#profitDistributeForm').ajaxSubmit({
					url: config.api.duration.income.saveIncomeAdjust,
					success: function(addResult) {
						if(addResult.errorCode == -1) {
							if($("#alertMessage").children().length > 0) {
								$("#alertMessage").children().remove()
							}
							var h5 = $('<h5>' + addResult.errorMessage + '</h5>')
							$("#alertMessage").append(h5)
							$('#alertModal').modal('show')
						} else {
							$('#profitDistributeTable').bootstrapTable('refresh')
						}
					}
				})
			});

			//页面初始化
			function pageInit(pageState) {
				http.post(config.api.portfolio.getPortfolioByOid, {
					data: {
						oid: pageState.portfolioOid || ''
					},
					contentType: 'form'
				}, function(json) {
					var detail = pageState.detail = json.result
					freeCash = formatNumber(detail.cashPosition)
				})
			};

			//页面初始化
			function statisticsInit(pageState) {
				http.post(config.api.portfolio.statistics, {
					data: {
						oid: pageState.portfolioOid || ''
					},
					contentType: 'form'
				}, function(json) {
					if(json.receivableIncome != 0) {
						$('#payableIncome').hide();
						$('#receivableIncome').show();
						var netViewData = {
							baseDate: json.baseDate,
							shares: $.number(json.shares),
							nav: $.number(json.nav, 2),
							netValue: $.number(json.netValue),
							equity: $.number(json.equity),
							receivableIncome: $.number(json.receivableIncome,2)
						} 
						$$.detailAutoFix($('#statistics_net'), netViewData);
					} else {
						$('#receivableIncome').hide();
						$('#payableIncome').show();
						var netViewData = {
							baseDate: json.baseDate,
							shares: $.number(json.shares, 2),
							nav: $.number(json.nav, 2),
							netValue: $.number(json.netValue, 2),
							equity: $.number(json.equity, 2),
							payableIncome: $.number(json.payableIncome, 2)
						}
						$$.detailAutoFix($('#statistics_net'), netViewData);
					}
					if(json.productType=="PRODUCTTYPE_01"){
						$("#profitDistribute").hide();
						$("#incomeScheduleBut").hide();
						$("#sy_pq").hide();
					}else{
						$("#profitDistribute").show();
						$("#incomeScheduleBut").show();
						$("#sy_pq").show();
					}
					var dimensionViewData = {
						dimensionsDate: json.dimensionsDate,
						estimate: $.number(json.estimate, 2),
						dimensions: $.number(json.dimensions, 2),
						countintChargefee: $.number(json.countintChargefee, 2),
						cashPosition: $.number(json.cashPosition, 2),
						liquidDimensions: $.number(json.liquidDimensions, 2),
						illiquidDimensions: $.number(json.illiquidDimensions, 2),
						deviationValue: $.number(json.deviationValue, 2)
					}
					$('#liquidAssetEstimate').text($.number(json.liquidDimensions, 2));
					$('#illiquidAssetEstimate').text($.number(json.illiquidDimensions, 2));
					$$.detailAutoFix($('#statistics_dimensions'), dimensionViewData);
				})
			}

			//初始化投资组合投资范围
			function initScopes(pageState) {
				$('#illiquidAssetTargetType').empty();
				$('#illiquidAssetType').empty();
				http.post(config.api.portfolio.getPortfolioByOid, {
					data: {
						oid: pageState.portfolioOid || ''
					},
					contentType: 'form'
				}, function(result) {

					var data = result.result.scopes;
					var x = {};
					if(data && data.length > 0) {
						// $('#illiquidAssetTargetTypeTab').show();
						// $('#illiquidAssetTypeTab').show();
						$.each(data, function(i) {
							x[data[i].oid] = data[i].name;
						});
					} else {
						// $('#illiquidAssetTargetTypeTab').hide();
						// $('#illiquidAssetTypeTab').hide();
					}

					var options = {}
					var assetTypes = config.target_type();
					$.each(assetTypes, function(key) {
						var list = [];
						$.each(assetTypes[key], function(code) {
							if(x[code]) {
								list.push({
									code: code,
									name: assetTypes[key][code]
								})
							}
						});
						if(list.length > 0) {
							options[key] = list;
						}
					})
					// 认购类型控件
					var illiquidAssetTargetType = $('#illiquidAssetTargetType');
					// 申购类型控件
					var illiquidAssetType = $('#illiquidAssetType');

					$('<option value="">全部</option>').appendTo(illiquidAssetTargetType);
					$('<option value="">全部</option>').appendTo(illiquidAssetType);

					$.each(options, function(k, v) {
						var group = '<optgroup label="' + k + '"></optgroup>';
						var illiquidAssetTargetTypeGroup = $(group);
						var illiquidAssetTypeGroup = $(group);

						$.each(v, function(o) {
							$('<option value="' + v[o].code + '">' + v[o].name + '</option>').appendTo(illiquidAssetTargetTypeGroup);
							if(v[o].code != "TARGETTYPE_20"){
								$('<option value="' + v[o].code + '">' + v[o].name + '</option>').appendTo(illiquidAssetTypeGroup);
							}
						});
						illiquidAssetTargetTypeGroup.appendTo(illiquidAssetTargetType);
						illiquidAssetTypeGroup.appendTo(illiquidAssetType);
					});
				});

				bindIlliquidAssetTrade();
			};

			//申购现金类标的类型改变change事件
			$('#liquidAssetTargetType').off().on('change', function() {
				var type = $(this).val();
				$('#liquidAssetTargetName').empty();
				if(type == 'CASHTOOLTYPE_01') {
					$('#buyAssetForm_fund').show();
					$('#buyAssetForm_treaty').hide();
				} else if(type == 'CASHTOOLTYPE_02') {
					$('#buyAssetForm_treaty').show();
					$('#buyAssetForm_fund').hide();
				}
				http.post(config.api.liquidAsset.options, {
					data: {
						type: type
					},
					contentType: 'form'
				}, function(json) {
					if(json && json.length > 0) {
						$.each(json, function(i) {
							$('<option value="' + json[i].oid + '">' + json[i].name + '</option>').appendTo($('#liquidAssetTargetName'));
						});
					} else {
						$('<option value="">--</option>').appendTo($('#liquidAssetTargetName'));
					}
					$('#liquidAssetTargetName').trigger('change');
				});
			}).change();

			//申购现金类标的名称改变change事件
			$('#liquidAssetTargetName').off().on('change', function() {
				var oid = $(this).val();
				if(oid == null || oid == undefined || oid == '') {
					$('.buyAssetForm_fund_detail').val('--');
					$('#doBuyAsset').hide();
					return;
				}
				$('#doBuyAsset').show();
				http.post(config.api.liquidAsset.detailQuery, {
					data: {
						oid: oid
					},
					contentType: 'form'
				}, function(json) {
					$('#orderAmount').attr('data-validfloatrange', '6-6-0.000001-10000000');
					$('#buyAssetForm').validator('destroy');
					$('#buyAssetForm').validator({
						custom: {
							validfloat: util.form.validator.validfloat,
							validfloatrange: util.form.validator.validfloatrange
						},
						errors: {
							validfloat: '申购金额输入错误',
							validfloatrange: '申购金额输入错误'
						}
					});
					if(json.type == 'CASHTOOLTYPE_01') {
						var viewData = {
							dailyProfit: json.dailyProfit,
							weeklyYield: formatPercent(json.weeklyYield),
							riskLevel: formatRiskLevel(json.riskLevel),
							holdShare: formatNumber(json.holdShare)
						};
						$$.formAutoFix($('#buyAssetForm_fund'), viewData);
					}
					if(json.type == 'CASHTOOLTYPE_02') {
						var viewData = {
							baseAmount: formatNumber(json.baseAmount),
							yield: formatPercent(json.yield),
							riskLevel: formatRiskLevel(json.riskLevel),
							holdShare: formatNumber(json.holdShare)
						};
						$$.formAutoFix($('#buyAssetForm_treaty'), viewData);
					}
				})
			});

			var bindIlliquidAssetTrade = function() {
				//认购非现金类标的类型改变change事件
				$('#illiquidAssetTargetType').off().on('change', function() {
					var type = $(this).val();
					$('#illiquidAssetTargetName').empty();
					if(type == null || type == '' || type == undefined) {
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_16' || type == 'TARGETTYPE_15') {
						$('#subIlliquidAssetForm_bill').show();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_17') {
						$('#subIlliquidAssetForm_loan').show();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_18') {
						$('#subIlliquidAssetForm_stage').show();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_19') {
						$('#subIlliquidAssetForm_chain').show();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_08') {
						$('#subIlliquidAssetForm_creditor').show();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_20') {
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_trust').hide();
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_fangdai').show();
					} else {
						$('#subIlliquidAssetForm_trust').show();
						$('#subIlliquidAssetForm_bill').hide();
						$('#subIlliquidAssetForm_loan').hide();
						$('#subIlliquidAssetForm_stage').hide();
						$('#subIlliquidAssetForm_chain').hide();
						$('#subIlliquidAssetForm_creditor').hide();
						$('#subIlliquidAssetForm_fangdai').hide();
					}

					if(pageState.portfolioOid == '' || pageState.portfolioOid == null || pageState.portfolioOid == undefined) {
						return
					}
					http.post(config.api.portfolio.subscripeOptions, {
						data: {
							portfolioOid: pageState.portfolioOid,
							type: type
						},
						contentType: 'form'
					}, function(json) {
						if(json && json.length > 0) {
							$.each(json, function(i) {
								$('<option value="' + json[i].oid + '">' + json[i].name + '</option>').appendTo($('#illiquidAssetTargetName'));
							});
						} else {
							$('<option value="">--</option>').appendTo($('#illiquidAssetTargetName'));
						}
						$('#illiquidAssetTargetName').trigger('change');
					});
				}).change();

				//认购非现金类标的名称改变change事件
				$('#illiquidAssetTargetName').off().on('change', function() {
					var oid = $(this).val();
					if(oid == null || oid == undefined || oid == '') {
						$('.subIlliquidAssetForm_detail').val('--');
						$('#doSubIlliquidAsset').hide();
						return;
					}
					$('#doSubIlliquidAsset').show();
					http.post(config.api.illiquidAsset.assetDetail, {
						data: {
							oid: oid
						},
						contentType: 'form'
					}, function(json) {
						var data = json.data
						var maxAmount = util.safeCalc(data.purchaseValue, '-', data.holdShare);
						maxAmount = util.safeCalc(maxAmount, '-', data.applyAmount);
						var restTrustAmount = formatNumber(maxAmount);
						$('#subIlliquidAssetOrderAmount').attr('data-validfloatrange', '6-6-' + (data.starValue ? util.safeCalc(data.starValue, '/', 10000) : 0) + '-' + util.safeCalc(maxAmount, '/', 10000));
						$('#subIlliquidAssetForm').validator('destroy');
						$('#subIlliquidAssetForm').validator({
							custom: {
								validfloat: util.form.validator.validfloat,
								validfloatrange: util.form.validator.validfloatrange
							},
							errors: {
								validfloat: '数据格式不正确',
								validfloatrange: '认购金额不能小于起购金额，且不可超过可认购额度'
							}
						});
						if(data.type == 'TARGETTYPE_16' || data.type == 'TARGETTYPE_15') {
							$('#subIlliquidAssetForm_bill').show();
							$('#subIlliquidAssetForm_trust').hide();
							$('#subIlliquidAssetForm_loan').hide();
							$('#subIlliquidAssetForm_stage').hide();
							$('#subIlliquidAssetForm_chain').hide();
							$('#subIlliquidAssetForm_creditor').hide();
							$('#subIlliquidAssetForm_fangdai').hide();
							var viewData = {
								ticketNumber: data.ticketNumber,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								restStartDate: data.restStartDate,
								restEndDate: data.restEndDate,
								ticketValue: formatNumber(data.ticketValue),
								purchaseValue: formatNumber(data.purchaseValue),
								capitalSettlementDate: data.capitalSettlementDate,
								restTrustAmount_bill: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_bill'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_17') {
							$('#subIlliquidAssetForm_loan').show();
							$('#subIlliquidAssetForm_trust').hide();
							$('#subIlliquidAssetForm_bill').hide();
							$('#subIlliquidAssetForm_stage').hide();
							$('#subIlliquidAssetForm_chain').hide();
							$('#subIlliquidAssetForm_creditor').hide();
							$('#subIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								ticketValue: formatNumber(data.ticketValue),
								raiseScope: formatNumber(data.raiseScope),
								expAror: formatPercent(data.expAror),
								life: data.life,
								setDate: data.setDate,
								accrualDate: data.accrualDate,
								restTrustAmount_loan: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_loan'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_18') {
							$('#subIlliquidAssetForm_stage').show();
							$('#subIlliquidAssetForm_trust').hide();
							$('#subIlliquidAssetForm_bill').hide();
							$('#subIlliquidAssetForm_loan').hide();
							$('#subIlliquidAssetForm_chain').hide();
							$('#subIlliquidAssetForm_creditor').hide();
							$('#subIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								ticketValue: formatNumber(data.ticketValue),
								raiseScope: formatNumber(data.raiseScope),
								expAror: formatPercent(data.expAror),
								life: data.life,
								setDate: data.setDate,
								accrualDate: data.accrualDate,
								restTrustAmount_stage: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_stage'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_19') {
							$('#subIlliquidAssetForm_chain').show();
							$('#subIlliquidAssetForm_trust').hide();
							$('#subIlliquidAssetForm_bill').hide();
							$('#subIlliquidAssetForm_loan').hide();
							$('#subIlliquidAssetForm_stage').hide();
							$('#subIlliquidAssetForm_creditor').hide();
							$('#subIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								raiseScope: formatNumber(data.raiseScope),
								accrualType: formatAccrualType(data.accrualType),
								setDate: data.setDate,
								restEndDate: data.restEndDate,
								ticketValue: formatNumber(data.ticketValue),
								purchaseValue: formatNumber(data.purchaseValue),
								accrualDate: data.accrualDate,
								expAror: formatPercent(data.expAror),
								capitalSettlementDate: data.capitalSettlementDate,
								capitalBackDate: data.capitalBackDate,
								returnBackDate: data.returnBackDate,
								restTrustAmount_chain: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_chain'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_08') {
							$('#subIlliquidAssetForm_creditor').show();
							$('#subIlliquidAssetForm_trust').hide();
							$('#subIlliquidAssetForm_bill').hide();
							$('#subIlliquidAssetForm_loan').hide();
							$('#subIlliquidAssetForm_stage').hide();
							$('#subIlliquidAssetForm_chain').hide();
							$('#subIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								raiseScope: formatNumber(data.raiseScope),
								lifed: data.lifed,
								expAror: formatPercent(data.expAror),
								overdueRate: formatPercent(data.overdueRate),
								accrualType: formatAccrualType(data.accrualType),
								setDate: data.setDate,
								accrualDate: data.accrualDate,
								restTrustAmount_creditor: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_creditor'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_20') {
							$('#subIlliquidAssetForm_fangdai').show();
							$('#subIlliquidAssetForm_creditor').hide();
							$('#subIlliquidAssetForm_trust').hide();
							$('#subIlliquidAssetForm_bill').hide();
							$('#subIlliquidAssetForm_loan').hide();
							$('#subIlliquidAssetForm_stage').hide();
							$('#subIlliquidAssetForm_chain').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								raiseScope: formatNumber(data.raiseScope),
								life: data.life,
								collectIncomeRate: formatPercent(data.collectIncomeRate),
								expAror: formatPercent(data.expAror),
								overdueRate: formatPercent(data.overdueRate),
								accrualType: formatAccrualType(data.accrualType),
								restTrustAmount_fangdai: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_fangdai'), viewData); // 自动填充表单
						} else {
							$('#subIlliquidAssetForm_trust').show();
							$('#subIlliquidAssetForm_bill').hide();
							$('#subIlliquidAssetForm_loan').hide();
							$('#subIlliquidAssetForm_stage').hide();
							$('#subIlliquidAssetForm_chain').hide();
							$('#subIlliquidAssetForm_creditor').hide();
							$('#subIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								collectStartDate: data.collectStartDate,
								collectEndDate: data.collectEndDate,
								collectIncomeRate: formatPercent(data.collectIncomeRate),
								expAror: formatPercent(data.expAror),
								overdueRate: formatPercent(data.overdueRate),
								accrualDate: data.accrualDate,
								accrualType: formatAccrualType(data.accrualType),
								lifed: data.lifed,
								purchaseValue: formatNumber(data.purchaseValue),
								starValue: formatNumber(data.starValue),
								restTrustAmount_trust: restTrustAmount
							}
							$$.formAutoFix($('#subIlliquidAssetForm_trust'), viewData); // 自动填充表单
						}
					});
				});

				//申购非现金类标的类型改变change事件
				$('#illiquidAssetType').off().on('change', function() {
					var type = $(this).val();
					$('#illiquidAssetName').empty();
					if(type == null || type == '' || type == undefined) {
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_16' || type == 'TARGETTYPE_15') {
						$('#buyIlliquidAssetForm_bill').show();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_17') {
						$('#buyIlliquidAssetForm_loan').show();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_18') {
						$('#buyIlliquidAssetForm_stage').show();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_19') {
						$('#buyIlliquidAssetForm_chain').show();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_08') {
						$('#buyIlliquidAssetForm_creditor').show();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					} else if(type == 'TARGETTYPE_20') {
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_trust').hide();
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_fangdai').show();
					} else {
						$('#buyIlliquidAssetForm_trust').show();
						$('#buyIlliquidAssetForm_bill').hide();
						$('#buyIlliquidAssetForm_loan').hide();
						$('#buyIlliquidAssetForm_stage').hide();
						$('#buyIlliquidAssetForm_chain').hide();
						$('#buyIlliquidAssetForm_creditor').hide();
						$('#buyIlliquidAssetForm_fangdai').hide();
					}

					//判断投资组合是否为空
					if(pageState.portfolioOid == '' || pageState.portfolioOid == null || pageState.portfolioOid == undefined) {
						return
					}

					http.post(config.api.portfolio.purchaseOptions, {
						data: {
							portfolioOid: pageState.portfolioOid,
							type: type
						},
						contentType: 'form'
					}, function(json) {
						if(json && json.length > 0) {
							$.each(json, function(i) {
								if (json[i].type != "TARGETTYPE_20") {
									$('<option value="' + json[i].oid + '">' + json[i].name + '</option>').appendTo($('#illiquidAssetName'));
								}
							});
						} else {
							$('<option value="">--</option>').appendTo($('#illiquidAssetName'));
						}
						$('#illiquidAssetName').trigger('change');
					});
				}).change();

				//申购非现金类标的名称改变change事件
				$('#illiquidAssetName').off().on('change', function() {
					var oid = $(this).val();
					if(oid == null || oid == undefined || oid == '') {
						$('.buyIlliquidAssetForm_detaill').val('--');
						$('#doBuyIlliquidAsset').hide();
						return;
					};
					$('#doBuyIlliquidAsset').show();
					http.post(config.api.illiquidAsset.assetDetail, {
						data: {
							oid: oid
						},
						contentType: 'form'
					}, function(json) {
						var data = json.data
						var maxAmount = util.safeCalc(data.purchaseValue, '-', data.holdShare);
						maxAmount = util.safeCalc(maxAmount, '-', data.applyAmount);
						var restTrustAmount = formatNumber(maxAmount);
						$('#buyIlliquidAssetOrderAmount').attr('data-validfloatrange', '6-6-0');
						$('#buyIlliquidAssetOrderShare').attr('data-validfloatrange', '6-6-' + (data.starValue ? util.safeCalc(data.starValue, '/', 10000) : 0) + '-' + util.safeCalc(maxAmount, '/', 10000));
						$('#buyIlliquidAssetForm').validator('destroy');
						$('#buyIlliquidAssetForm').validator({
							custom: {
								validfloat: util.form.validator.validfloat,
								validpositive: util.form.validator.validpositive,
								validfloatrange: util.form.validator.validfloatrange
							},
							errors: {
								validfloat: '数据格式不正确',
								validpositive: '申购金额不能小于等于0',
								validfloatrange: '数据输入有误'
							}
						});
						if(data.type == 'TARGETTYPE_16' || data.type == 'TARGETTYPE_15') {
							$('#buyIlliquidAssetForm_bill').show();
							$('#buyIlliquidAssetForm_trust').hide();
							$('#buyIlliquidAssetForm_loan').hide();
							$('#buyIlliquidAssetForm_stage').hide();
							$('#buyIlliquidAssetForm_chain').hide();
							$('#buyIlliquidAssetForm_creditor').hide();
							$('#buyIlliquidAssetForm_fangdai').hide();
							var viewData = {
								ticketNumber: data.ticketNumber,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								restStartDate: data.restStartDate,
								restEndDate: data.restEndDate,
								ticketValue: formatNumber(data.ticketValue),
								purchaseValue: formatNumber(data.purchaseValue),
								capitalSettlementDate: data.capitalSettlementDate,
								restTrustAmount: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_bill'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_17') {
							$('#buyIlliquidAssetForm_loan').show();
							$('#buyIlliquidAssetForm_trust').hide();
							$('#buyIlliquidAssetForm_bill').hide();
							$('#buyIlliquidAssetForm_stage').hide();
							$('#buyIlliquidAssetForm_chain').hide();
							$('#buyIlliquidAssetForm_creditor').hide();
							$('#buyIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								ticketValue: formatNumber(data.ticketValue),
								raiseScope: formatNumber(data.raiseScope),
								expAror: formatPercent(data.expAror),
								life: data.life,
								setDate: data.setDate,
								accrualDate: data.accrualDate,
								restTrustAmount: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_loan'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_18') {
							$('#buyIlliquidAssetForm_stage').show();
							$('#buyIlliquidAssetForm_trust').hide();
							$('#buyIlliquidAssetForm_bill').hide();
							$('#buyIlliquidAssetForm_loan').hide();
							$('#buyIlliquidAssetForm_chain').hide();
							$('#buyIlliquidAssetForm_creditor').hide();
							$('#buyIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								ticketValue: formatNumber(data.ticketValue),
								raiseScope: formatNumber(data.raiseScope),
								expAror: formatPercent(data.expAror),
								life: data.life,
								setDate: data.setDate,
								accrualDate: data.accrualDate,
								restTrustAmount: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_stage'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_19') {
							$('#buyIlliquidAssetForm_chain').show();
							$('#buyIlliquidAssetForm_trust').hide();
							$('#buyIlliquidAssetForm_bill').hide();
							$('#buyIlliquidAssetForm_loan').hide();
							$('#buyIlliquidAssetForm_stage').hide();
							$('#buyIlliquidAssetForm_creditor').hide();
							$('#buyIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								raiseScope: formatNumber(data.raiseScope),
								accrualType: formatAccrualType(data.accrualType),
								setDate: data.setDate,
								restEndDate: data.restEndDate,
								ticketValue: formatNumber(data.ticketValue),
								purchaseValue: formatNumber(data.purchaseValue),
								accrualDate: data.accrualDate,
								expAror: formatPercent(data.expAror),
								capitalSettlementDate: data.capitalSettlementDate,
								capitalBackDate: data.capitalBackDate,
								returnBackDate: data.returnBackDate,
								restTrustAmount: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_chain'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_08') {
							$('#buyIlliquidAssetForm_creditor').show();
							$('#buyIlliquidAssetForm_trust').hide();
							$('#buyIlliquidAssetForm_bill').hide();
							$('#buyIlliquidAssetForm_loan').hide();
							$('#buyIlliquidAssetForm_stage').hide();
							$('#buyIlliquidAssetForm_chain').hide();
							$('#buyIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								raiseScope: formatNumber(data.raiseScope),
								lifed: data.lifed,
								expAror: formatPercent(data.expAror),
								overdueRate: formatPercent(data.overdueRate),
								accrualType: formatAccrualType(data.accrualType),
								setDate: data.setDate,
								accrualDate: data.accrualDate,
								restTrustAmount: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_creditor'), viewData); // 自动填充表单
						} else if(data.type == 'TARGETTYPE_20') {
							$('#buyIlliquidAssetForm_creditor').hide();
							$('#buyIlliquidAssetForm_trust').hide();
							$('#buyIlliquidAssetForm_bill').hide();
							$('#buyIlliquidAssetForm_loan').hide();
							$('#buyIlliquidAssetForm_stage').hide();
							$('#buyIlliquidAssetForm_chain').hide();
							$('#buyIlliquidAssetForm_fangdai').show();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								raiseScope: formatNumber(data.raiseScope),
								life: data.life,
								collectIncomeRate: formatPercent(data.collectIncomeRate),
								expAror: formatPercent(data.expAror),
								overdueRate: formatPercent(data.overdueRate),
								accrualType: formatAccrualType(data.accrualType),
								restTrustAmount_fangdai: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_fangdai'), viewData); // 自动填充表单
						} else {
							$('#buyIlliquidAssetForm_trust').show();
							$('#buyIlliquidAssetForm_bill').hide();
							$('#buyIlliquidAssetForm_loan').hide();
							$('#buyIlliquidAssetForm_stage').hide();
							$('#buyIlliquidAssetForm_chain').hide();
							$('#buyIlliquidAssetForm_creditor').hide();
							$('#buyIlliquidAssetForm_fangdai').hide();
							var viewData = {
								sn: data.sn,
								lifeState: config.target_lifeState().getStateName(data.lifeState),
								setDate: data.setDate,
								expAror: formatPercent(data.expAror),
								restStartDate: data.restStartDate,
								restEndDate: data.restEndDate,
								overdueRate: formatPercent(data.overdueRate),
								accrualDate: data.accrualDate,
								accrualType: formatAccrualType(data.accrualType),
								lifed: data.lifed,
								purchaseValue: formatNumber(data.purchaseValue),
								starValue: formatNumber(data.starValue),
								restTrustAmount: restTrustAmount
							}
							$$.formAutoFix($('#buyIlliquidAssetForm_trust'), viewData); // 自动填充表单
						}
					})
				});

			};



			
			
			
			
			
			
			
			// 收益排期按钮
			$('#incomeScheduleBut').on('click', function() {
				$('#incomeScheduleTable').bootstrapTable('refresh');
				$('#incomeScheduleModal').modal('show');
			})
			
			// 收益排期添加按钮
			$('#incomeScheduleAddBut').on('click', function() {
				//去除重复提交样式
				$('#refreshDiv1').removeClass('overlay');
				$('#refreshI1').removeClass('fa fa-refresh fa-spin');
						
				incomeSubType = 'add';
				$('#incomeScheduleAddTitle').html("收益分配排期添加");
				$("#incomeDistrDate").removeAttr("readonly");
				
				util.form.reset($(document.incomeScheduleAddForm));
				
				http.post(config.api.duration.assetPool.schedule.getBaseDate, {
                  	data: {
                    	oid: pageState.portfolioOid
                  	},
                  	contentType: 'form',
                }, function (result) {
                	$('#incomeDistrDate').val(result.shouldDate);
                })
				
				$(document.incomeScheduleAddForm).validator('destroy');
				util.form.validator.init($(document.incomeScheduleAddForm));
				
				$(document.incomeScheduleAddForm.assetpoolOid).val(pageState.portfolioOid);
				$('#incomeScheduleAddModal').modal('show');
			})
			
			
			
			// 收益排期添加按钮
			$('#incomeAddSubmit').on('click', function() {
				if (!$('#incomeScheduleAddForm').validator('doSubmitCheck')) return
				
				//添加重复提交样式
				$('#refreshDiv1').addClass('overlay');
			    $('#refreshI1').addClass('fa fa-refresh fa-spin');
			    
			    if (incomeSubType == 'add'){
			    	incomdeUrl = config.api.duration.assetPool.schedule.add;
			    }else if (incomeSubType == 'update'){
			    	incomdeUrl = config.api.duration.assetPool.schedule.update;
			    }else{
			    	//去除重复提交样式
					$('#refreshDiv1').removeClass('overlay');
					$('#refreshI1').removeClass('fa fa-refresh fa-spin');
					alert("类型出错！");
					return
			    }
			    
				$('#incomeScheduleAddForm').ajaxSubmit({
					url: incomdeUrl,
					success: function(result) {
						console.log(result);
						if(result.errorCode==0){
							$('#incomeScheduleTable').bootstrapTable('refresh');
							$('#incomeScheduleApplyTable').bootstrapTable('refresh');
							$('#incomeScheduleAddModal').modal('hide');
							if (incomeSubType == 'update'){
								alert("修改申请已提交！");
							}
						}else{
			            	errorHandle(result);
			            }
						
						//去除重复提交样式
						$('#refreshDiv1').removeClass('overlay');
						$('#refreshI1').removeClass('fa fa-refresh fa-spin');
					}
				})
			})
			
			// 设置收益分配排期日可选日期为今天之后
			$(document.incomeScheduleAddForm.incomeDistrDate).datetimepicker({
				minDate: moment().add(0, 'days')
			})

			// 收益排期表格配置
			var incomeSchedulePageOptions = {
				page: 1,
				rows: 10,
				assetPoolOid: pageState.portfolioOid
			}
			var incomeScheduleTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.assetPool.schedule.list, {
						data: incomeSchedulePageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: incomeSchedulePageOptions.page,
				pageSize: incomeSchedulePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					incomeSchedulePageOptions.rows = val.limit
					incomeSchedulePageOptions.page = parseInt(val.offset / val.limit) + 1
					incomeSchedulePageOptions.assetPoolOid = pageState.portfolioOid
					return val
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (incomeSchedulePageOptions.page - 1) * incomeSchedulePageOptions.rows + index + 1
					}
				}, {
					width: 80,
					field: 'basicDate'
				}, {
					field: 'annualizedRate'
				}, {
					field: 'errorMes'
				}, {
					width: 55,
					field: 'status',
		            formatter: function (val) {
		            	return util.enum.transform('incomeScheduleStatus', val);
		            }
				}, {
					width: 100,
					align: 'center',
					formatter: function(val, row, index) {
						var buttons = [{
							text: '修改',
							type: 'button',
							class: 'item-update',
            				isRender: row.status=='pass'
						},{
							text: '删除',
							type: 'button',
							class: 'item-delete',
            				isRender: row.status=='pass'
						}]
						return util.table.formatter.generateButton(buttons, 'incomeScheduleTable')
					},
					events: {
						'click .item-update': function(e, val, row) {
							//去除重复提交样式
							$('#refreshDiv1').removeClass('overlay');
							$('#refreshI1').removeClass('fa fa-refresh fa-spin');
				
							incomeSubType = 'update';
							util.form.reset($(document.incomeScheduleAddForm))
							$(document.incomeScheduleAddForm.oid).val(row.oid);
							$(document.incomeScheduleAddForm.incomeDistrDate).val(row.basicDate);
							$(document.incomeScheduleAddForm.productAnnualYield).val(row.annualizedRate);
							
							$(document.incomeScheduleAddForm).validator('destroy');
							util.form.validator.init($(document.incomeScheduleAddForm));
							
							$('#incomeScheduleAddTitle').html("收益分配排期修改");
							$("#incomeDistrDate").attr("readonly","true");
							$('#incomeScheduleAddModal').modal('show');
						},
						'click .item-delete': function(e, val, row) {
							$('#confirmModal').find('p').html('确定删除此条数据？')
							$$.confirm({
				              	container: $('#confirmModal'),
			                  	trigger: this,
			                  	accept: function () {
				                    http.post(config.api.duration.assetPool.schedule.delete, {
				                      	data: {
				                        	oid: row.oid
				                      	},
				                      	contentType: 'form',
				                    }, function (result) {
				                    	alert("删除申请已提交！");
						            	$('#incomeScheduleApplyTable').bootstrapTable('refresh');
				                    })
			               		}
			                })
						},
					}
				}]
			}
			
			// 收益排期申请表格配置
			var incomeScheduleApplyPageOptions = {
				page: 1,
				rows: 10,
				assetPoolOid: pageState.portfolioOid
			}
			var incomeScheduleApplyTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.assetPool.schedule.applyList, {
						data: incomeScheduleApplyPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: incomeScheduleApplyPageOptions.page,
				pageSize: incomeScheduleApplyPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					incomeScheduleApplyPageOptions.rows = val.limit
					incomeScheduleApplyPageOptions.page = parseInt(val.offset / val.limit) + 1
					incomeScheduleApplyPageOptions.assetPoolOid = pageState.portfolioOid
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (incomeScheduleApplyPageOptions.page - 1) * incomeScheduleApplyPageOptions.rows + index + 1
					}
				}, {
					field: 'basicDate'
				}, {
					field: 'annualizedRate'
//				}, {
//					field: 'creator'
				}, {
					field: 'createTime'
//				}, {
//					field: 'approver'
				}, {
					field: 'approverTime'
				}, {
					field: 'type',
		            formatter: function (val) {
		            	return util.enum.transform('incomeScheduleApplyTypes', val);
		            }
				}, {
					field: 'status',
		            formatter: function (val) {
		            	return util.enum.transform('incomeScheduleApplyStatus', val);
		            }
				}, {
					align: 'center',
					formatter: function(val, row, index) {
						var buttons = [{
							text: '通过',
							type: 'button',
							class: 'item-pass',
            				isRender: row.status=='toApprove'
						},{
							text: '驳回',
							type: 'button',
							class: 'item-reject',
            				isRender: row.status=='toApprove'
						},{
							text: '删除',
							type: 'button',
							class: 'item-delete',
            				isRender: row.status=='toApprove'
						}]
						return util.table.formatter.generateButton(buttons, 'incomeScheduleTable')
					},
					events: {
						'click .item-pass': function(e, val, row) {
							$('#confirmModal').find('p').html('确定通过审核?')
							$$.confirm({
				              	container: $('#confirmModal'),
			                  	trigger: this,
			                  	accept: function () {
				                    http.post(config.api.duration.assetPool.schedule.pass, {
				                      	data: {
				                        	oid: row.oid
				                      	},
				                      	contentType: 'form',
				                    }, function (result) {
				                    	$('#incomeScheduleApplyTable').bootstrapTable('refresh');
				                    })
			               		}
			                })
						},
						'click .item-reject': function(e, val, row) {
							$('#confirmModal').find('p').html('确定驳回申请?')
							$$.confirm({
				              	container: $('#confirmModal'),
			                  	trigger: this,
			                  	accept: function () {
				                    http.post(config.api.duration.assetPool.schedule.reject, {
				                      	data: {
				                        	oid: row.oid
				                      	},
				                      	contentType: 'form',
				                    }, function (result) {
				                    	$('#incomeScheduleApplyTable').bootstrapTable('refresh');
				                    })
			               		}
			                })
						},
						'click .item-delete': function(e, val, row) {
							$('#confirmModal').find('p').html('确定删除此条数据？')
							$$.confirm({
				              	container: $('#confirmModal'),
			                  	trigger: this,
			                  	accept: function () {
				                    http.post(config.api.duration.assetPool.schedule.approveDelete, {
				                      	data: {
				                        	oid: row.oid
				                      	},
				                      	contentType: 'form',
				                    }, function (result) {
				                    	$('#incomeScheduleApplyTable').bootstrapTable('refresh');
				                    })
			               		}
			                })
						}
					}
				}]
			}
			
			
			util.form.validator.init($('#incomeScheduleAddForm'));
	
	









			var firstLoad = true;

			// 投资组合切换列表
			http.post(config.api.portfolio.getAllNameList, function(json) {
				var portfolioOptions = ''
				var select = document.searchForm.portfolioName
				json.rows.forEach(function(item) {
					portfolioOptions += '<option value="' + item.oid + '" ' + (item.oid == pageState.portfolioOid ? 'selected' : '') + '>' + item.name + '</option>'
				})
				$(select).html(portfolioOptions);
				// 改变投资组合后刷新页面
				$(document.searchForm.portfolioName).on('change', function() {

					pageState.portfolioOid = this.value
					countintChargefeeDetailPageOptions.portfolioOid = this.value
					allNetValuePageOptions.portfolioOid = this.value
					netValuePageOptions.portfolioOid = this.value
					assetDealPageOptions.portfolioOid = this.value
					assetDealRecordPageOptions.portfolioOid = this.value
					deviationValueRecordPageOptions.portfolioOid = this.value
					liquidAssetPageOptions.oid = this.value
					iliquidAssetPageOptions.oid = this.value
					pdListPageOptions.assetPoolOid = this.value

					pageInit(pageState)
					initScopes(pageState)
					statisticsInit(pageState)
					if(firstLoad) {

						// 历史总资产净值表格配置  开始
						$('#allNetValueTable').bootstrapTable(allNetValueTableConfig)
						// 历史总资产净值表格配置  结束

						// 净值校准记录 表格配置   开始
						$('#netValueTable').bootstrapTable(netValueTableConfig)
						// 净值校准记录 表格配置   结束

						// 现金类管理资产表格配置  开始
						$('#liquidAssetTable').bootstrapTable(liquidAssetTableConfig);
						// 现金类管理资产表格配置  结束

						// 非现金类管理资产表格配置  开始
						$('#iliquidAssetTable').bootstrapTable(iliquidAssetTableConfig)
						// 非现金类管理资产表格配置  结束

						// 资产交易表格配置  开始
						$('#assetDealTable').bootstrapTable(assetDealTableConfig);
						// 资产交易表格配置  结束

						// 交易记录表格配置  开始
						$('#assetDealRecordTable').bootstrapTable(assetDealRecordTableConfig);
						// 交易记录表格配置  结束
						
						// 累计计提费用明细表格配置  开始
						$('#countintChargefeeDetailTable').bootstrapTable(countintChargefeeDetailTableConfig);
						//累计计提费用明细表格配置  结束

						// 投资损益表格配置  开始
						$('#deviationValueRecordTable').bootstrapTable(deviationValueRecordTableConfig)
						// 投资损益表格配置  结束

						// 还款计划表格配置  开始
						$('#repaymentScheduleTable').bootstrapTable(repaymentScheduleTableConfig);
						//还款计划表格配置  结束

						// 收益分配记录 表格配置
						$('#profitDistributeTable').bootstrapTable(profitDistributeTableConfig);
						// 收益分配记录 表格配置 end;			

						// 收益分配持有人明细分页列表 表格配置
						$('#profitDistributeOrderTable').bootstrapTable(profitDistributeOrderTableConfig)
						
						// 收益分配排期申请表配置
						$('#incomeScheduleApplyTable').bootstrapTable(incomeScheduleApplyTableConfig);
						// 收益分配排期表配置
						$('#incomeScheduleTable').bootstrapTable(incomeScheduleTableConfig);
			
						firstLoad = false;
					} else {
						$('#allNetValueTable').bootstrapTable('refresh')
						$('#netValueTable').bootstrapTable('refresh')
						$('#assetDealTable').bootstrapTable('refresh')
						$('#assetDealRecordTable').bootstrapTable('refresh')
						$('#countintChargefeeDetailTable').bootstrapTable('refresh')
						$('#deviationValueRecordTable').bootstrapTable('refresh')
						$('#liquidAssetTable').bootstrapTable('refresh')
						$('#iliquidAssetTable').bootstrapTable('refresh')
						$('#profitDistributeTable').bootstrapTable('refresh')
						
						$('#incomeScheduleApplyTable').bootstrapTable('refresh')
					}
				});
				$(document.searchForm.portfolioName).change();
			});
			
			
			function qryInfo(value,row){
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
						
			}
			
			
	
	
	
	

		}
	}

})
