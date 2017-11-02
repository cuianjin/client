/**
 * 产品存续期明细
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'productDetail',
		chartNoDataImgDom: '<img src="assets/images/nodatatips.png" alt="暂无数据" width="220">',
		init: function() {
			var _this = this;
			
			$('#purchaseRelevant').hide()
			$('#remeedRelevant').hide()
			$('#clearOther').hide()

			var availableMaxSaleVolume = 0

			var pageState = {
				productOid: util.nav.getHashObj(location.hash).id || '',
				incomeCalcBasis: 365,
				detail: null //当前产品明细数据
			}

			// 设置可售份额申请申请日期可选日期为今天即今天之后
			$(document.availbleSaleVolumeForm.basicDate).datetimepicker({
				minDate: moment(moment().format('L'))
			})

			/**
			 * 产品切换列表
			 */
			http.post(config.api.product.duration.productNameList, function(json) {
				var productNameOptions = ''
				var productOid = ''
				var select = document.searchForm.productName
				json.rows.forEach(function(item) {
					productNameOptions += '<option value="' + item.oid + '">' + item.name + '</option>'
					if(productOid==='') {
						productOid = item.oid
					}
				})
				$(select).html(productNameOptions)
				
				if(pageState.productOid!=='') {
					select.value = pageState.productOid
				} else {
					pageState.productOid = productOid
				}
				
				http.post(config.api.product.duration.getProductByOid, {
					data: {
						oid: pageState.productOid
					},
					contentType: 'form'	
				}, function(result) {	
					if (result.errorCode == 0 && result != null) {
						var detail = pageState.detail = result
						pageState.incomeCalcBasis = detail.incomeCalcBasis
						
						//数据表格初始化
						$('#dataAnalysisTable').bootstrapTable(dataAnalysisTableConfig)
						$('#spvOrderTable').bootstrapTable(spvOrderTableConfig)
						$('#productPurchaseRemeedTable').bootstrapTable(productPurchaseRemeedTableConfig)
						$('#availbleSaleVolumeTable').bootstrapTable(availbleSaleVolumeTableConfig)
						$('#channelTable').bootstrapTable(channelTableConfig)
						$('#availbleSaleDateTable').bootstrapTable(availbleSaleDateTableConfig)
						$('#acceptedOrderTable').bootstrapTable(acceptedOrderTableConfig);
						$('#refusedOrderTable').bootstrapTable(refusedOrderTableConfig);
						$('#investTable1').bootstrapTable(acceptedInvestTableConfig);
						$('#investTable2').bootstrapTable(abandonOrderTableConfig);
						$('#maxSaleVolumeDateTable').bootstrapTable(maxSaleVolumeDateTableConfig)
						$('#productOrderTable').bootstrapTable(productOrderTableConfig)
						$$.searchInit($('#productOrderSearchForm'), $('#productOrderTable'));

						http.post(config.api.product.duration.getProductDuration, {
							data: {
								oid: pageState.productOid
							},
							contentType: 'form'
						}, function(pd) {
							$$.detailAutoFix($('#detailboard'), pd)
						})
						
						$('#purchaseRelevant').show()
						if('PRODUCTTYPE_01' == detail.typeOid) {
							$('#remeedRelevant').hide()
							$('#tabpanelli5').hide()
							$('#tabpanelli7').hide()
						} else {
							$('#remeedRelevant').show()
							$('#tabpanelli5').show()
							$('#tabpanelli7').show()
						}
						$('#clearOther').show()
						
					} else {	
					}
				})	

			})

			/**
			 * 改变产品后刷新页面
			 */
			$(document.searchForm.productName).on('change', function() {
				pageState.productOid = this.value

				productDetailInit(pageState, http, config, $$)

			})
			
			/**
			 * productOrderTable 表格配置
			 */
			var productOrderPageOptions = {
				page: 1,
				rows: 10,
				offset: 0,
				orderCode: '',
				orderType: '',
				orderStatus: '',
				createTimeBegin: '',
				createTimeEnd: '',
				productOid: pageState.productOid
			}

			var productOrderTableConfig = {
				ajax: function(origin) {
					http.post(config.api.gacha.tradeorder, {
						data: productOrderPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: productOrderPageOptions.page,
				pageSize: productOrderPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					var form = document.productOrderSearchForm
					$.extend(productOrderPageOptions, util.form.serializeJson(form));
					productOrderPageOptions.rows = val.limit
					productOrderPageOptions.page = parseInt(val.offset / val.limit) + 1
					productOrderPageOptions.offset = val.offset
					productOrderPageOptions.productOid = pageState.productOid
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return productOrderPageOptions.offset + index + 1
					}
				}, {
					field: 'orderCode',
					align: 'right'
				}, {
					field: 'orderAmount',
					class: 'currency',
					align: 'right'
				}, {
					field: 'couponTypeDisp',
					align: 'right'
				}, {
					field: 'couponAmount',
					class: 'currency',
					align: 'right'
				}, {
					field: 'payAmount',
					class: 'currency',
					align: 'right'
				}, {
					field: 'orderTypeDisp'
				}, {
					field: 'orderStatusDisp'
				}, 
//				{
//					field: 'productCode'
//				}, 
				{
					field: 'productName'
				}, {
					field: 'createTime',
					align: 'right',
					formatter: function (val) {
						return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
					}
				}, {
					field: 'createManDisp'
				}, 
//				{
//					field: 'investorClearStatusDisp',
//					formatter: function (val) {
//						return val || '--'
//					}
//				}, {
//					field: 'investorCloseStatusDisp',
//					formatter: function (val) {
//						return val || '--'
//					}
//				}, 
				{
					field: 'publisherClearStatusDisp',
					formatter: function (val, row) {
						return val && row.orderType !== 'fastRedeem' ? val : '--'
					}
				}, {
					field: 'publisherConfirmStatusDisp',
					formatter: function (val, row) {
						return val && row.orderType !== 'fastRedeem' ? val : '--'
					}
				}, {
					field: 'publisherCloseStatusDisp',
					formatter: function (val, row) {
						return val && row.orderType !== 'fastRedeem' ? val : '--'
					}
				}, {
					align: 'center',
					width: 200,
					formatter: function (val, row, index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#productOrderTable').bootstrapTable('getData').length - 1,
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
						return util.table.formatter.generateButton(buttons, 'productOrderTable');
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
				}]
			}
			
			/**
			 * 订单日志 表格配置
			 */
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
			
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));


			/**
			 * dataAnalysisTable 表格配置
			 */
			var dataAnalysisPageOptions = {
				productOid: pageState.productOid,
			}

			var dataAnalysisTableConfig = {
				ajax: function(origin) {
					http.post(config.api.product.duration.practice, {
						data: dataAnalysisPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				sidePagination: 'server',
				queryParams: function(val) {
					dataAnalysisPageOptions.productOid = pageState.productOid
					return val
				},
				onLoadSuccess: function(result) {
					var pieChart = echarts.init(document.getElementById('pieChart'))
					if(result.rows.length>0) {
						pieChart.setOption(getDataAnalysisPieOptions(config, result.rows))
					} else {
						//注意先释放图表，后将默认图片放上去（如果先放默认图片，那么在释放图表的时候会把默认图片也释放掉）
						pieChart.clear(); // 图表清空
						pieChart.dispose(); // 图表释放
						$("#pieChart").html(_this.chartNoDataImgDom);
					}
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return index + 1
					}
				}, {
					field: 'level'
				}, {
					field: 'orderStatus',
					align: 'right',
					formatter: function(val, row, index) {
						if (row.endDate) {
							return row.startDate + '天 - ' + row.endDate + '天'
						} else {
							return row.startDate + '天以上'
						}
					}
				}, {
					field: 'rewardRatio',
					align: 'right',
					formatter: function(val, row) {
						return (val * 100).toFixed(2) 
					}
				}, {
//					class: 'decimal2',
					field: 'totalHoldVolume',
					align: 'right',
					formatter: function(val, row, index) {
						return (Math.floor(val * 100) / 100).toFixed(2);
					}					
				}]
			}

			/**
			 * 产品申购开关申请 表格配置
			 */
			var spvOrderPageOptions = {
				number: 1,
				size: 10,
				productOid: pageState.productOid
			}

			function getSpvOrderQueryParams(val) {
				spvOrderPageOptions.size = val.limit
				spvOrderPageOptions.number = parseInt(val.offset / val.limit) + 1
				spvOrderPageOptions.productOid = pageState.productOid
				return val
			}

			var spvOrderTableConfig = {
				ajax: function(origin) {
					http.post(config.api.product.spv.getProductSpvOrderlist, {
						data: {
							page: spvOrderPageOptions.number,
							rows: spvOrderPageOptions.size,
							productOid: spvOrderPageOptions.productOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: spvOrderPageOptions.number,
				pageSize: spvOrderPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getSpvOrderQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (spvOrderPageOptions.number - 1) * spvOrderPageOptions.size + index + 1
					}
				}, {
					field: 'orderType',
					formatter: function(val) {
						switch (val) {
							case 'INVEST':
								return '申购'
							case 'REDEEM':
								return '赎回'
							case 'BUY_IN':
								return '买入'
							case 'PART_SELL_OUT':
								return '部分卖出'
							case 'FULL_SELL_OUT':
								return '全部卖出'
							default:
								return '-'
						}
					}
				}, {
					field: 'orderCate',
					formatter: function(val) {
						switch (val) {
							case 'TRADE':
								return '交易订单'
							case 'STRIKE':
								return '冲账订单'
							default:
								return '-'
						}
					}
				}, {
					field: 'orderAmount',
					class: 'currency6',
					align: 'right'
				}, {
					field: 'orderDate',
					align: 'right'
				}, {
					field: 'orderStatus',
					formatter: function(val) {
						var className = ''
						switch (val) {
							case 'SUBMIT':
								className = 'text-red'
								return '<span class="' + className + '">未确认</span>'
							case 'CONFIRM':
								className = 'text-green'
								return '<span class="' + className + '">确认</span>'
							case 'DISABLE':
								className = 'text-red'
								return '<span class="' + className + '">失效</span>'
							case 'CALCING':
								className = 'text-yellow'
								return '<span class="' + className + '">清算中</span>'
							default:
								return '-'
						}
					}
				}, {
					field: 'entryStatus',
					formatter: function(val) {
						var className = ''
						switch (val) {
							case 'NO':
								className = 'text-red'
								return '<span class="' + className + '">未入账</span>'
							case 'YES':
								className = 'text-green'
								return '<span class="' + className + '">已入账</span>'
							default:
								return '-'
						}
					}
				}, {
					field: 'creater',
				}, {
					field: 'createTime',
					align: 'right'
				}, {
					field: 'auditor',
				}, {
					field: 'completeTime',
					align: 'right'
				}]
			}

			/**
			 * 产品申购开关申请 表格配置
			 */
			var purchaseRemeedPageOptions = {
				number: 1,
				size: 10,
				productOid: pageState.productOid
			}

			function getPurchaseRemeedQueryParams(val) {
				purchaseRemeedPageOptions.size = val.limit
				purchaseRemeedPageOptions.number = parseInt(val.offset / val.limit) + 1
				purchaseRemeedPageOptions.productOid = pageState.productOid
				return val
			}

			var productPurchaseRemeedTableConfig = {
				ajax: function(origin) {
					http.post(config.api.product.duration.productPurchaseRemeedApplyList, {
						data: {
							page: purchaseRemeedPageOptions.number,
							rows: purchaseRemeedPageOptions.size,
							productOid: purchaseRemeedPageOptions.productOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: purchaseRemeedPageOptions.number,
				pageSize: purchaseRemeedPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getPurchaseRemeedQueryParams,
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (purchaseRemeedPageOptions.number - 1) * purchaseRemeedPageOptions.size + index + 1
					}
				}, {
					field: 'type',
					formatter: function(val) {
						if (val == 'PURCHASE_ON') {
							return '申请开启申购'
						} else if (val == 'PURCHASE_OFF') {
							return '申请关闭申购'
						} else if (val == 'REDEEM_ON') {
							return '申请开启赎回'
						} else if (val == 'REDEEM_OFF') {
							return '申请关闭赎回'
						}else if (val == 'CLOSING_FIFO') {
							return '申请赎回规则FIFO'
						}else if (val == 'CLOSING_LIFO') {
							return '申请赎回规则LIFO'
						}
					}
				}, {
					field: 'creator'
				}, {
					field: 'createTime',
					align: 'right'
				}, {
					field: 'auditor'
				}, {
					field: 'auditTime',
					align: 'right'
				}, {
					field: 'status',					
					formatter: function(val) {
						var className = '';
						if (val == 'SUBMIT') {
							className = 'text-yellow'
							return '<span class="' + className + '">待审核</span>'
						} else if (val == 'PASS') {
							className = 'text-green'
							return '<span class="' + className + '">审核通过</span>'
						} else if (val == 'FAIL') {
							className = 'text-red'
							return '<span class="' + className + '">审核驳回</span>'
						}
					}
				}, {
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#productPurchaseRemeedTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '撤销',
									type: 'button',
									class: 'item-cancel',
									isRender: row.status == 'SUBMIT'
								}, {
									text: '驳回',
									type: 'button',
									class: 'item-fail',
									isRender: row.status == 'SUBMIT'
								}, {
									text: '通过',
									type: 'button',
									class: 'item-pass',
									isRender: row.status == 'SUBMIT'
								}/*, {
									text: '删除',
									type: 'button',
									class: 'item-delete',
									isRender: row.status == 'FAIL'
								}*/]
							}]
						var format = util.table.formatter.generateButton(buttons, 'productPurchaseRemeedTable')
		            	if(row.status == 'FAIL'){
		            		format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
		            	}
						return format
					},
					events: {
						'click .item-cancel': function(e, val, row) {
							$("#confirmTitle").html("确定撤销此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.duration.rollbackPurchaseRemeed, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#productPurchaseRemeedTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-fail': function(e, val, row) {
							$("#confirmTitle").html("确定驳回此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.duration.failPurchaseRemeed, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#productPurchaseRemeedTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-pass': function(e, val, row) {
							$("#confirmTitle").html("确定通过此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.duration.passPurchaseRemeed, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#productPurchaseRemeedTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-delete': function(e, val, row) {
							$("#confirmTitle").html("确定删除此条数据？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.duration.deletePurchaseRemeed, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#productPurchaseRemeedTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}

			/**
			 * 可售份额申请 表格配置
			 */
			var availbleSaleVolumePageOptions = {
				number: 1,
				size: 10,
				productOid: pageState.productOid
			}

			function getSaleVolumeQueryParams(val) {
				availbleSaleVolumePageOptions.size = val.limit
				availbleSaleVolumePageOptions.number = parseInt(val.offset / val.limit) + 1
				availbleSaleVolumePageOptions.productOid = pageState.productOid
				return val
			}

			var availbleSaleVolumeTableConfig = {
				ajax: function(origin) {
					http.post(config.api.product.salePosition.saleVolumeApplyList, {
						data: {
							page: availbleSaleVolumePageOptions.number,
							rows: availbleSaleVolumePageOptions.size,
							productOid: availbleSaleVolumePageOptions.productOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: availbleSaleVolumePageOptions.number,
				pageSize: availbleSaleVolumePageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getSaleVolumeQueryParams,
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (availbleSaleVolumePageOptions.number - 1) * availbleSaleVolumePageOptions.size + index + 1
					}
				}, {
					field: 'baseDate'
				}, {
					field: 'volume',
					class: 'currency',
					formatter: function(val) {
						return val
					}
				}, {
					field: 'creator'
				}, {
					field: 'createTime',
					align: 'right'
				}, {
					field: 'auditor'
				}, {
					field: 'auditTime',
					align: 'right'
				}, {
					field: 'status',
					formatter: function(val) {
						var className = '';
						if (val == 'SUBMIT') {
							className = 'text-yellow';
							return '<span class="' + className + '">待审核</span>'
						} else if (val == 'PASS') {
							className = 'text-green';
							return '<span class="' + className + '">审核通过</span>'
						} else if (val == 'FAIL') {
							className = 'text-red';
							return '<span class="' + className + '">审核驳回</span>'
						} else if (val == 'CANCEL') {
							return '<span class="' + className + '">取消</span>'
						} else if (val == 'DELETE') {
							return '<span class="' + className + '">删除</span>'
						} else if (val == 'ACTIVE') {
							className = 'text-green';
							return '<span class="' + className + '">已生效</span>'
						} else if (val == 'DEACTIVE') {
							className = 'text-red';
							return '<span class="' + className + '">生效失败</span>'
						}

					}
				}, {
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#availbleSaleVolumeTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '撤销',
									type: 'button',
									class: 'item-cancel',
									isRender: row.status == 'SUBMIT'
								}, {
									text: '驳回',
									type: 'button',
									class: 'item-fail',
									isRender: row.status == 'SUBMIT'
								}, {
									text: '通过',
									type: 'button',
									class: 'item-pass',
									isRender: row.status == 'SUBMIT'
								}]
							}]
						var format = util.table.formatter.generateButton(buttons, 'availbleSaleVolumeTable')
		            	if(row.status == 'FAIL'){
		            		format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
		            	}
						return format
					},
					events: {
						'click .item-cancel': function(e, val, row) {
							$("#confirmTitle").html("确定撤销此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.salePosition.rollbackAvailbleSaleVolume, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#availbleSaleVolumeTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-fail': function(e, val, row) {
							$("#confirmTitle").html("确定驳回此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.salePosition.auditFailAvailbleSaleVolume, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#availbleSaleVolumeTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-pass': function(e, val, row) {
							$("#confirmTitle").html("确定通过此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.salePosition.auditPassAvailbleSaleVolume, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#availbleSaleVolumeTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-delete': function(e, val, row) {
							$("#confirmTitle").html("确定删除此条数据？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.salePosition.deleteAvailbleSaleVolume, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#availbleSaleVolumeTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}

			/**
			 * 产品选择渠道 表格配置
			 */
			var channelPageOptions = {
				number: 1,
				size: 10,
				productOid: pageState.productOid
			}

			function getChannelQueryParams(val) {
				channelPageOptions.size = val.limit
				channelPageOptions.number = parseInt(val.offset / val.limit) + 1
				channelPageOptions.productOid = pageState.productOid
				return val
			}

			var channelTableConfig = {
				ajax: function(origin) {
					http.post(config.api.product.channel.channelApplyList, {
						data: {
							page: channelPageOptions.number,
							rows: channelPageOptions.size,
							productOid: channelPageOptions.productOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: channelPageOptions.number,
				pageSize: channelPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getChannelQueryParams,
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (channelPageOptions.number - 1) * channelPageOptions.size + index + 1
					}
				}, {
					field: 'channelName'
				}, {
					field: 'creator'
				}, {
					field: 'createTime',
					align: 'right'
				}, {
					field: 'auditor'
				}, {
					field: 'auditTime',
					align: 'right'
				}, {
					field: 'status',
					formatter: function(val) {
						var className = '';
						if (val == 'SUBMIT') {
							className = 'text-yellow';
							return '<span class="' + className + '">待审核</span>'
						} else if (val == 'PASS') {
							className = 'text-green';
							return '<span class="' + className + '">审核通过</span>'
						} else if (val == 'FAIL') {
							className = 'text-red';
							return '<span class="' + className + '">审核驳回</span>'
						}
					}
				}, {
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#channelTable').bootstrapTable('getData').length - 1,
								sub: [{
									text: '撤销',
									type: 'button',
									class: 'item-cancel',
									isRender: row.status == 'SUBMIT'
								}, {
									text: '驳回',
									type: 'button',
									class: 'item-fail',
									isRender: row.status == 'SUBMIT'
								}, {
									text: '通过',
									type: 'button',
									class: 'item-pass',
									isRender: row.status == 'SUBMIT'
								}]
							}]
						var format = util.table.formatter.generateButton(buttons, 'channelTable')
		            	if(row.status == 'FAIL'){
		            		format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
		            	}
						return format
					},
					events: {
						'click .item-cancel': function(e, val, row) {
							$("#confirmTitle").html("确定撤销此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.channel.rollbackChannel, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#channelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-fail': function(e, val, row) {
							$("#confirmTitle").html("确定驳回此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.channel.auditFailChannel, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#channelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-pass': function(e, val, row) {
							$("#confirmTitle").html("确定通过此次申请吗？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.channel.auditPassChannel, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#channelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-delete': function(e, val, row) {
							$("#confirmTitle").html("确定删除此条数据？")
							$("#confirmTitle1").html("")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.product.channel.deleteChannel, {
										data: {
											oid: row.oid,
										},
										contentType: 'form'
									}, function(json) {
										$('#channelTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}

			/**
			 * 可售份额申请排期历史 表格配置
			 */
			var availbleSaleDatePageOptions = {
				number: 1,
				size: 10,
				productOid: pageState.productOid
			}

			function getAvailbleSaleDateQueryParams(val) {
				availbleSaleDatePageOptions.size = val.limit
				availbleSaleDatePageOptions.number = parseInt(val.offset / val.limit) + 1
				availbleSaleDatePageOptions.productOid = pageState.productOid
				return val
			}

			var availbleSaleDateTableConfig = {
				ajax: function(origin) {
					http.post(config.api.product.salePosition.saleVolumeScheduleList, {
						data: {
							page: availbleSaleDatePageOptions.number,
							rows: availbleSaleDatePageOptions.size,
							productOid: availbleSaleDatePageOptions.productOid
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: availbleSaleDatePageOptions.number,
				pageSize: availbleSaleDatePageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getAvailbleSaleDateQueryParams,
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (availbleSaleDatePageOptions.number - 1) * availbleSaleDatePageOptions.size + index + 1
					}
				}, {
					field: 'baseDate'
				}, {
					field: 'volume',
					class: 'currency',
					formatter: function(val) {
						return val
					}
				}, {
					field: 'creator'
				}, {
					field: 'createTime',
					align: 'right'
				}, {
					field: 'auditor'
				}, {
					field: 'auditTime',
					align: 'right'
				}, {
					field: 'status',
					formatter: function(val) {
						var className = '';
						if (val == 'SUBMIT') {
							className = 'text-yellow';
							return '<span class="' + className + '">待审核</span>'
						} else if (val == 'PASS') {
							className = 'text-green';
							return '<span class="' + className + '">审核通过</span>'
						} else if (val == 'FAIL') {
							className = 'text-red';
							return '<span class="' + className + '">审核驳回</span>'
						} else if (val == 'CANCEL') {
							return '<span class="' + className + '">取消</span>'
						} else if (val == 'DELETE') {
							return '<span class="' + className + '">删除</span>'
						} else if (val == 'ACTIVE') {
							className = 'text-green';
							return '<span class="' + className + '">已生效</span>'
						} else if (val == 'DEACTIVE') {
							className = 'text-red';
							return '<span class="' + className + '">生效失败</span>'
						}

					}
				}]
			}

			// 赎回单处理 - 可拒绝赎回单表格配置
			// 赎回单处理 - 可拒绝赎回单表格配置
			var acceptedOrderCheckItems = []
			var acceptedOrderOptions = {
				page: 1,
				rows: 10,
				orderStatus: 'accepted',
				orderType: 'normalRedeem'
			}

			var acceptedOrderTableConfig = {
				ajax: function(origin) {
					http.post(config.api.gacha.tradeorder + '?publisherClearStatus=toClear&productOid=' + pageState.productOid, {
						data: acceptedOrderOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: acceptedOrderOptions.page,
				pageSize: acceptedOrderOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					acceptedOrderOptions.rows = val.limit
					acceptedOrderOptions.page = parseInt(val.offset / val.limit) + 1
					acceptedOrderOptions.offset = val.offset
					return val
				},
				onCheck: function(row) {
					var indexOf = -1
					if (acceptedOrderCheckItems.length > 0) {
						acceptedOrderCheckItems.forEach(function(item, index) {
							if (item.tradeOrderOid == row.tradeOrderOid) {
								indexOf = index
							}
						})
					}
					if (indexOf < 0) {
						acceptedOrderCheckItems.push(row)
					}
				},
				onUncheck: function(row) {
					acceptedOrderCheckItems.splice(acceptedOrderCheckItems.indexOf(row), 1)
				},
				onCheckAll: function(rows) {
					acceptedOrderCheckItems = rows.map(function(item) {
						return item
					})
				},
				onUncheckAll: function() {
					acceptedOrderCheckItems = []
				},
				columns: [{
					checkbox: true,
					align: 'center'
				}, {
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return acceptedOrderOptions.offset + index + 1
					}
				}, {
					field: 'orderCode'
				}, {
					field: 'orderTypeDisp'
				}, {
					field: 'orderStatusDisp'
				}, {
					field: 'orderAmount',
					class: 'currency'
				}, {
					field: 'createTime',
					align: 'right'
				}]
			}

			// 赎回单处理 - 已拒绝赎回单表格配置
			var refusedOrderOptions = {
				page: 1,
				rows: 10,
				orderStatus: 'refused',
				orderType: 'normalRedeem'
			}

			var refusedOrderTableConfig = {
				ajax: function(origin) {
					http.post(config.api.gacha.tradeorder + "?productOid=" + pageState.productOid, {
						data: refusedOrderOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: refusedOrderOptions.page,
				pageSize: refusedOrderOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					refusedOrderOptions.rows = val.limit
					refusedOrderOptions.page = parseInt(val.offset / val.limit) + 1
					refusedOrderOptions.offset = val.offset
					return val
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return refusedOrderOptions.offset + index + 1
					}
				}, {
					field: 'orderCode'
				}, {
					field: 'orderTypeDisp'
				}, {
					field: 'orderStatusDisp'
				}, {
					field: 'orderAmount',
					class: 'currency'
				}, {
					field: 'createTime',
					align: 'right'
				}]
			}
			
			// 阶梯奖励 下载
			$('#dataAnalysisTableDown').on('click', function() {
				util.tableToExcel("dataAnalysisTable", "阶梯奖励")
			})

			//订单列表下载
			$('#productOrderTableDown').on('click', function() {
				util.tableToExcel("productOrderTable", "订单列表")
			})

			//发行渠道申请下载
			$('#channelTableDown').on('click', function() {
				util.tableToExcel("channelTable", "发行渠道申请")
			})

			//SPV交易记录下载
			$('#spvOrderTableDown').on('click', function() {
				util.tableToExcel("spvOrderTable", "SPV交易记录")
			})

			//运营申请下载
			$('#productPurchaseRemeedTableDown').on('click', function() {
				util.tableToExcel("productPurchaseRemeedTable", "运营申请")
			})

			//可售份额申请下载
			$('#availbleSaleVolumeTableDown').on('click', function() {
				util.tableToExcel("availbleSaleVolumeTable", "可售份额申请")
			})

			//份额申请排期下载
			$('#availbleSaleDateTableDown').on('click', function() {
				util.tableToExcel("availbleSaleDateTable", "份额申请排期")
			})
			
			/**
			 * 申购相关
			 */
			$('#purchaseRelevant').on('click', function() {
				if (pageState.detail != null) {
					http.post(config.api.product.duration.getProductByOid, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						if (result.errorCode == 0 && result != null) {
							var data = result
							
							$('#channelModalDiv').hide()
							$('#availbleSaleVolumeModalDiv').hide()
							$('#investModalDiv').hide()
							$('#closeManageInvestorder').hide()
							
							$$.detailAutoFix($('#purchaseRelevantModal'), data); // 自动填充详情
							$$.formAutoFix($('#purchaseRelevantForm'), data); // 自动填充表单
							
							$('#closeManageInvestorder').hide()
							if ('PRODUCTTYPE_01' == data.typeOid) {
								$('#availbleSaleVolume').hide()
							} else {
								$('#availbleSaleVolume').show()
							}
							if (data.status == 'CLEARING' || data.status == 'CLEARED') {
								$('#channelApply').hide()
								
								$('#openPurchase').hide()
								$('#closePurchase').hide()
							} else {
								$('#channelApply').show()
								if (data.isOpenPurchase == 'YES') { //关闭申购申请
									$('#openPurchase').hide()
									$('#closePurchase').show()
								} else { //开启申购申请
									$('#openPurchase').show()
									$('#closePurchase').hide()
								}
							}
							$('#purchaseRelevantModal').modal('show')
							
						} else {
							
						}
					})	
				}

			})
			
			/**
			 * 赎回相关
			 */
			$('#remeedRelevant').on('click', function() {
				if (pageState.detail != null) {
					http.post(config.api.product.duration.getProductByOid, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						if (result.errorCode == 0 && result != null) {
							var data = result
							
							$('#tradeorderModalDiv').hide()
							$('#closeManageTradeorder').hide()
							$('#singleDailyMaxRedeemModalDiv').hide()
							$('#fastRedeemModalDiv').hide()
							
							$$.detailAutoFix($('#remeedRelevantModal'), data); // 自动填充详情
							$$.formAutoFix($('#remeedRelevantForm'), data); // 自动填充表单
							
							$('#closeManageTradeorder').hide()
//							$('#singleDailyMaxRedeem').hide()
							
							if (data.status == 'CLEARING' || data.status == 'CLEARED') {
								$('#openRemeed').hide()
								$('#closeRemeed').hide()
//								$('#singleDailyMaxRedeem').hide()
								$('#openRedeemConfirm').hide()
								$('#closeRedeemConfirm').hide()
								$('#fastRedeemSet').hide()
							} else {
								if (data.isOpenRemeed == 'YES') { //关闭赎回申请
									$('#openRemeed').hide()
									$('#closeRemeed').show()
								} else { //开启赎回申请
									$('#openRemeed').show()
									$('#closeRemeed').hide()
								}
								if (data.isOpenRedeemConfirm == 'YES') { //屏蔽赎回确认
									$('#openRedeemConfirm').hide()
									$('#closeRedeemConfirm').show()
								} else { //激活赎回确认
									$('#openRedeemConfirm').show()
									$('#closeRedeemConfirm').hide()
								}
								if ('PRODUCTTYPE_02' == data.typeOid) {
//									$('#singleDailyMaxRedeem').show()
									$('#fastRedeemSet').show()
								} else {
//									$('#singleDailyMaxRedeem').hide()
									$('#fastRedeemSet').hide()
								}	
								
								if (data.closingRule && data.closingRule == 'LIFO'){
									$('#closingRuleLIFO').hide()
									$('#closingRuleFIFO').show()
								}else{
									$('#closingRuleFIFO').hide()
									$('#closingRuleLIFO').show()
								}
							}
							$('#remeedRelevantModal').modal('show')
						} else {
							
						}
					})	
				}

			})
			
			/**
			 * 其他
			 */
			$('#clearOther').on('click', function() {
				if (pageState.detail != null) {
					http.post(config.api.product.duration.getProductByOid, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						if (result.errorCode == 0 && result != null) {
							var data = result
							
							$('#raiseSuccessOrFailModalDiv').hide()
							$('#editProductModalDiv').hide()
							$('#productLabelSetModalDiv').hide()
							$('#isAutoAssignIncomeModalDiv').hide()
							$('#profitDistributeModalDiv').hide()
							$('#clearProductModalDiv').hide()
							
							$$.detailAutoFix($('#clearOtherModal'), data); // 自动填充详情
							$$.formAutoFix($('#clearOtherForm'), data); // 自动填充表单
							
							$('#tradingRuleSet').show()
							$('#productLabelSet').show()
							$('#isAutoAssignIncome').show()
							
							if(config.customerButtonIsOpen=='true'){
								$('#generateFile').show()
							}else{
								$('#generateFile').hide()
							}
							
							if ('PRODUCTTYPE_02' == data.typeOid) {//活期
								$('#raiseSuccessOrFail').hide()
								$('#dividendService').hide()
								$('#debtService').hide()
								if (data.status == 'CLEARING' || data.status == 'CLEARED') {
									$('#clearingProduct').hide()
									$('#tradingRuleSet').hide()
									$('#productLabelSet').hide()
								} else {
									$('#clearingProduct').show()
								}
							} else {//定期
								if (data.status == 'RAISEEND') {
									$('#raiseSuccessOrFail').show()
								} else {
									$('#raiseSuccessOrFail').hide()
								}
								$('#clearingProduct').hide()
								if(data.status == 'DURATIONEND'){
									$('#dividendService').show()
									$('#debtService').show()
								} else{
									$('#dividendService').hide()
									$('#debtService').hide()
								}
							}
							$('#clearOtherModal').modal('show')
						} else {
							
						}
					})	
				}

			})
			
			//文件生成--投资人收益明细
			$("#generateFile").on("click", function(){
				if (pageState.detail != null) {
				var confirm = $('#confirmModal');
				//通过
				confirm.find('.popover-title').html('提示');
				var html="确定生成投资人收益明细文件？"
				confirm.find('p').html(html);
				$$.confirm({
					container: confirm,
					trigger: this,
					accept: function() {
						http.post(config.api.generateIncomeFile, {
							data: {
								oid: pageState.productOid
							},
							contentType: 'form',
						}, function(result) {
							refresh();
						})
					}
				})
			
			}
			});
			
			/**
			 * 赎回规则FIFO申请
			 */
			$('#closingRuleFIFO').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定申请赎回规则FIFO吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.closingFIFOApply, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#productPurchaseRemeedTable').bootstrapTable('refresh')
								$('#remeedRelevantModal').modal('hide')
							})
						}
					})
				}

			})
			/**
			 * 赎回规则FILO申请
			 */
			$('#closingRuleLIFO').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定申请赎回规则LIFO吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.closingLIFOApply, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#productPurchaseRemeedTable').bootstrapTable('refresh')
								$('#remeedRelevantModal').modal('hide')
							})
						}
					})
				}

			})

			/**
			 * 开启赎回申请
			 */
			$('#openRemeed').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定开启赎回申请吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.openRedeem, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#productPurchaseRemeedTable').bootstrapTable('refresh')
								$('#remeedRelevantModal').modal('hide')
							})
						}
					})
				}

			})

			/**
			 * 关闭赎回申请
			 */
			$('#closeRemeed').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定关闭赎回申请吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.closeRedeem, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#productPurchaseRemeedTable').bootstrapTable('refresh')
								$('#remeedRelevantModal').modal('hide')
							})
						}
					})
				}

			})

			/**
			 * 可售份额申请
			 */
			$('#availbleSaleVolume').on('click', function() {
				if (pageState.detail != null) {

					http.post(
						config.api.product.salePosition.findSalePositionApply, {
							data: {
								productOid: pageState.detail.oid
							},
							contentType: 'form'
						},
						function(result) {
							if (result.errorCode == 0) {
								var data = result
								availableMaxSaleVolume = data.availableMaxSaleVolume
								util.form.reset($('#availbleSaleVolumeForm'))
								$("#availbleSaleVolumeForm").validator('destroy')
								var form = document.availbleSaleVolumeForm
								$$.formAutoFix($('#availbleSaleVolumeForm'), data); // 自动填充表单
								// 剩余可售份额
								if (null == data.maxSaleVolume || undefined == data.maxSaleVolume) {
									data.maxSaleVolume = 0;
								}
								if (null == data.lockCollectedVolume || undefined == data.lockCollectedVolume) {
									data.lockCollectedVolume = 0;
								}
								$$.detailAutoFix($('#availbleSaleVolumeForm'), data); // 自动填充详情
								util.form.validator.init($('#availbleSaleVolumeForm'))

								maxSaleVolumeDates = []
								oleMaxSaleVolumeDates = []
								if (data.schedules != null && data.schedules.length > 0) {
									var object = null;
									for (var i = 0; i < data.schedules.length; i++) {
										object = data.schedules[i]
										object.applyingAmount = object.applyAmount
										maxSaleVolumeDates.push(object)
										oleMaxSaleVolumeDates.push(object)
									}
								}
								$('#maxSaleVolumeDateTable').bootstrapTable('load', maxSaleVolumeDates)
								
								$('#channelModalDiv').hide()
								$('#investModalDiv').hide()
								$('#closeManageInvestorder').hide()
								$('#availbleSaleVolumeModalDiv').show()

							}

						}
					)

				}
			})

			//			function validMaxSaleVolume($el) {
			//				return (Number($el.val()) <= availableMaxSaleVolume)
			//			}

			var oleMaxSaleVolumeDates = []
				/**
				 * 销售金额申请排期表
				 */
			var maxSaleVolumeDates = []
			var maxSaleVolumeDateTableConfig = {
				columns: [{
					field: 'baseDate'
				}, {
					field: 'auditAmount',
					class: 'decimal2'
				}, {
					field: 'applyingAmount',
					class: 'decimal2'
				}, {
					field: 'syncTime'
				}]
			}

			// 可申请份额输入框input事件绑定
			$(document.availbleSaleVolumeForm.newMaxSaleVolume).on('input', function() {
				var newMaxSaleVolume = parseFloat(this.value) || 0
				var baseDate = document.availbleSaleVolumeForm.basicDate.value
				if (baseDate !== '' && newMaxSaleVolume > 0) {
					var newMaxSaleVolumeDates = []
					var contain = false
					if (maxSaleVolumeDates.length > 0) {
						maxSaleVolumeDates.forEach(function(item, index) {
							if (item.baseDate == baseDate) {
								contain = true
								var object = new Object();
								object.oid = item.oid
								object.baseDate = item.baseDate //排期
								object.approvalAmount = item.approvalAmount //生效份额
								object.auditAmount = item.auditAmount //已经审批
								var applyAmount = parseFloat(item.applyAmount) //申请份额
								object.applyAmount = applyAmount //审批
								object.applyingAmount = applyAmount + newMaxSaleVolume //审批中
								object.syncTime = item.syncTime
								newMaxSaleVolumeDates.push(object)
							} else {
								newMaxSaleVolumeDates.push(item)
							}
						})
					}
					if (contain == false) {
						var object = new Object();
						object.oid = ''
						object.baseDate = baseDate
						object.auditAmount = 0 //已经审批
						object.approvalAmount = 0 //生效份额
						object.applyAmount = 0 //审批
						object.applyingAmount = newMaxSaleVolume //审批中
						object.syncTime = null
						newMaxSaleVolumeDates.push(object)
					}
					maxSaleVolumeDates = newMaxSaleVolumeDates
					$('#maxSaleVolumeDateTable').bootstrapTable('load', newMaxSaleVolumeDates)

				}
			})

			// 排期输入框input事件绑定
			$(document.availbleSaleVolumeForm.basicDate).on('blur', function() {
				document.availbleSaleVolumeForm.newMaxSaleVolume.value = ''
				maxSaleVolumeDates = oleMaxSaleVolumeDates
				$('#maxSaleVolumeDateTable').bootstrapTable('load', maxSaleVolumeDates)
			})

			// 可售份额申请“确定”按钮点击事件
			$('#availbleSaleVolumeSubmit').on('click', function() {
				if (!$('#availbleSaleVolumeForm').validator('doSubmitCheck')) return

				$('#availbleSaleVolumeForm').ajaxSubmit({
					url: config.api.product.salePosition.saveAvailbleSaleVolume,
					success: function(result) {
						if (result.errorCode == 0) {
							$('#purchaseRelevantModal').modal('hide')
							$('#availbleSaleVolumeTable').bootstrapTable('refresh')
						} else {
							alert(result.errorMessage)
						}

					}
				})
			})

			/**
			 * 发行渠道申请
			 */
			$('#channelApply').on('click', function() {
				if (pageState.detail != null) {
					var channelSelect = document.addProductChannelForm.channelOid
					$(channelSelect).empty()
					$('#availbleSaleVolumeModalDiv').hide()
					$('#investModalDiv').hide()
					$('#closeManageInvestorder').hide()
					$('#channelModalDiv').show()
					
					http.post(
						config.api.product.channel.chooseChannels, {
							data: {
								productOid: pageState.detail.oid
							},
							contentType: 'form'
						},
						function(result) {
							document.addProductChannelForm.productOid.value = pageState.detail.oid
							$$.formAutoFix($('#addProductChannelForm'), result); // 自动填充表单
							var select = document.addProductChannelForm.channelOid
							$(select).empty()
							result.rows.forEach(function(item, index) {
								$(select).append('<option value="' + item.oid + '" ' + (!index ? 'checked' : '') + '>' + item.channelName + '</option>')
							})
						}
					)
					
				}
			})

			$('#addProductChannelSubmit').on('click', function() {
				var channelOid = document.addProductChannelForm.channelOid.value
				if(channelOid==='') {
					if ($("#alertMessage").children().length > 0) {
						$("#alertMessage").children().remove()
					}
					var h5 = $('<h5>没有可以选择的渠道</h5>')
					$("#alertMessage").append(h5)
					$('#alertModal').modal('show')
				} else {
					$('#addProductChannelForm').ajaxSubmit({
						url: config.api.product.channel.saveChannel,
						success: function(addResult) {
							$('#channelModalDiv').hide()
							$('#channelTable').bootstrapTable('refresh')
						}
					})
				}

			})
			
			$('#addProductChannelCancel').on('click', function() {
				$('#channelModalDiv').hide()
			})
			
			
			/**
			 * 开启申购申请
			 */
			$('#openPurchase').on('click', function() {
				$('#channelModalDiv').hide()
				$('#availbleSaleVolumeModalDiv').hide()
				$('#investModalDiv').hide()
				$('#closeManageInvestorder').hide()
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定开启申购申请吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.openPurchase, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#productPurchaseRemeedTable').bootstrapTable('refresh')
								$('#purchaseRelevantModal').modal('hide')
							})
						}
					})
				}

			})

			/**
			 * 关闭申购申请
			 */
			$('#closePurchase').on('click', function() {
				$('#channelModalDiv').hide()
				$('#availbleSaleVolumeModalDiv').hide()
				$('#investModalDiv').hide()
				$('#closeManageInvestorder').hide()
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定关闭申购申请吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.closePurchase, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#productPurchaseRemeedTable').bootstrapTable('refresh')
								$('#purchaseRelevantModal').modal('hide')
							})
						}
					})
				}

			})

			/**
			 * 触发清盘
			 */
			$('#clearingProduct').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
							
				if (pageState.detail != null) {
					document.clearProductForm.clearingComment.value = ""
//					$$.confirm({
//						container: $('#doClearingConfirm'),
//						trigger: this,
//						accept: function() {
//							var clearingComment = $("#clearingComment").val()
//
//							if (clearingComment !== "") {
//								http.post(config.api.product.duration.productClearing, {
//									data: {
//										oid: pageState.detail.oid,
//										clearingComment: clearingComment
//									},
//									contentType: 'form',
//								}, function(result) {
//									$('#clearOtherModal').modal('hide')
//								})
//							}
//
//						}
//					})
					
					util.form.validator.init($('#clearProductForm'))
					$('#clearProductModalDiv').show()

				}

			})
			
			/**
			 * 确认清盘
			 */
			$('#clearProductSubmit').on('click', function() {
				if (!$('#clearProductForm').validator('doSubmitCheck')) return
				
				http.post(config.api.product.duration.productClearing, {
					data: {
						oid: pageState.detail.oid,
						clearingComment: $("#clearingComment").val()
					},
					contentType: 'form'
				}, function(result) {
					$('#clearOtherModal').modal('hide')
				})
				
			})
			
			
			/**
			 * 还本付息
			 */
			$('#debtService').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
				
				
				$("#confirmTitle").html("确定进行还本付息？")
				$("#confirmTitle1").html("")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						http.post(config.api.product.duration.cash, {
							data: {
								productOid: pageState.productOid
							},
							contentType: 'form'
						}, function(result) {
							$('#clearOtherModal').modal('hide')
						})
					}
				})
			})
			
			/**
			 * 派息
			 */
			$('#dividendService').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
				
				$("#profitDistributeForm").validator('destroy')
				util.form.reset($('#profitDistributeForm'))
				http.post(config.api.product.duration.productDeta, {
					data: {
						productOid: pageState.productOid,
					},
					contentType: 'form'
				}, function(result) {
					$("#totalHoldVolume").html(result.totalHoldVolume)
					
					var productCouponIncome = parseFloat(result.totalCouponVolume) || 0;
					$("#productCouponIncome").val(productCouponIncome)
					util.form.validator.init($('#profitDistributeForm'))
					$('#profitDistributeModalDiv').show()
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
				var productTotalScale = parseFloat($("#totalHoldVolume").html()) || 0 //产品范畴 产品总规模 1
				var incomeCalcBasis = parseInt(pageState.incomeCalcBasis) //计算基础

				if (isNaN(productTotalScale)) {
					productTotalScale = 0
				}
				if (isNaN(incomeCalcBasis)) {
					incomeCalcBasis = 365
				}

				var productAnnualYield = 0 //产品范畴 年化收益率=分配收益/产品总规模*365
				if (!isNaN(productTotalScale) && productTotalScale != 0) {
					productAnnualYield = productDistributionIncome * incomeCalcBasis * 100 / productTotalScale
				}

				document.profitDistributeForm.productAnnualYield.value = productAnnualYield.toFixed(2) //年化收益率 产品范畴

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

				var productTotalScale = parseFloat($("#totalHoldVolume").html()) || 0 //产品范畴 产品总规模 1
				var incomeCalcBasis = parseInt(pageState.incomeCalcBasis) //计算基础

				if (isNaN(productTotalScale)) {
					productTotalScale = 0
				}
				if (isNaN(incomeCalcBasis)) {
					incomeCalcBasis = 365
				}

				var productDistributionIncome = productAnnualYield * productTotalScale / incomeCalcBasis / 100 //产品范畴 分配收益1
				document.profitDistributeForm.productDistributionIncome.value = productDistributionIncome.toFixed(2)

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
			
			/**
			 * 确认派息
			 */
			$('#profitDistributeSubmit').on('click', function() {
				if (!$('#profitDistributeForm').validator('doSubmitCheck')) return
				http.post(config.api.product.duration.allocateIncome, {
					data: {
						productOid: pageState.productOid,
						incomeAmount: $("#productDistributionIncome").val(),
						couponAmount: $("#productCouponIncome").val(),
						fpRate: $("#productAnnualYield").val()
					},
					contentType: 'form'
				}, function(result) {
					$('profitDistributeModalDiv').hide()
					$('#clearOtherModal').modal('hide')
				})
				
			})

			$('#tradingRuleSet').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
							
				$('#editProductForm').validator('destroy')

				http.post(config.api.productDetail, {
					data: {
						oid: pageState.productOid
					},
					contentType: 'form'
				}, function(result) {
					if (result.errorCode == 0) {
						var data = result;
						$$.formAutoFix($('#editProductForm'), data); // 自动填充表单
						
						if ('PRODUCTTYPE_02' == data.typeOid) {
						 	$('#updateProductType02Area_1').show()
							$('#updateProductType02Area_1').show().find('input').attr('disabled', false)
							$('#updateProductType02Area_2').show()
							$('#updateProductType02Area_2').show().find('input').attr('disabled', false)
							$('#updateProductType02Area_3').show()
							$('#updateProductType02Area_3').show().find('input').attr('disabled', false)
							
						} else {
						 	$('#updateProductType02Area_1').hide()
							$('#updateProductType02Area_1').hide().find('input').attr('disabled', 'disabled')
						 	$('#updateProductType02Area_2').hide()
							$('#updateProductType02Area_2').hide().find('input').attr('disabled', 'disabled')
							$('#updateProductType02Area_3').hide()
							$('#updateProductType02Area_3').hide().find('input').attr('disabled', 'disabled')
						}
						
						if (data.basicProductLabelCode == '8') {
							$(document.editProductForm.purchaseConfirmDate).attr('data-validint','0-244').attr('data-error','应该大于等于0小于244的整数').attr('readonly','readonly')
							$(document.editProductForm.redeemConfirmDate).attr('data-validint','0-244').attr('data-error','应该大于等于0小于244的整数').attr('readonly','readonly')
							$(document.editProductForm.interestsDate).attr('data-validint','0-244').attr('data-error','应该大于等于0小于244的整数').attr('readonly','readonly')
						} else {
							$(document.editProductForm.purchaseConfirmDate).attr('data-validint','1-244').attr('data-error','应该大于等于1小于244的整数').removeAttr('readonly')
							$(document.editProductForm.redeemConfirmDate).attr('data-validint','1-244').attr('data-error','应该大于等于1小于244的整数').removeAttr('readonly')
							$(document.editProductForm.interestsDate).attr('data-validint','1-244').attr('data-error','应该大于等于1小于244的整数').removeAttr('readonly')
						}
						 	
						 util.form.validator.init($('#editProductForm'))	
						$('#editProductModalDiv').show()

					} else {
						alert(查询失败);
					}

				})

			})
			
			//校验交易结束时间大于等于交易开始时间
			$(document.editProductForm.dealStartTime).on('blur', function() {
				var flag = true
				$('#updateDealStartTimeDiv').removeClass("has-error")
				$('#updateDealEndTimeDiv').removeClass("has-error")
				$('#updateDealStartTimeError').html('')
				$('#updateDealEndTimeError').html('')
				
				var dealStartTime = parseInt(this.value) || 0 
				var dealEndTime = parseInt(document.editProductForm.dealEndTime.value) || 0 
				
				if (dealEndTime>0 && dealStartTime > dealEndTime) {
					$('#updateDealStartTimeError').html('交易开始时间必须小于交易结束时间')
					$('#updateDealStartTimeDiv').addClass("has-error")
					flag = false
				}
				return flag
			})
			
			
			$(document.editProductForm.dealEndTime).on('blur', function() {
				var flag = true
				$('#updateDealStartTimeDiv').removeClass("has-error")
				$('#updateDealEndTimeDiv').removeClass("has-error")
				$('#updateDealStartTimeError').html('')
				$('#updateDealEndTimeError').html('')
				
				var dealEndTime = parseInt(this.value) || 0 
				var dealStartTime = parseInt(document.editProductForm.dealStartTime.value) || 0 
				
				if (dealStartTime>0 && dealEndTime < dealStartTime) {
					$('#updateDealEndTimeError').html('交易结束时间必须大于交易开始时间')
					$('#updateDealEndTimeDiv').addClass("has-error")
					flag = false
				}
				return flag
				
			})

			// 编辑产品“保存”按钮点击事件
			$('#editProductSubmit').on('click', function() {
				if (!$('#editProductForm').validator('doSubmitCheck')) return
				
				
				//校验单笔投资最高份额不能小于单笔投资最低份额
				var investMinStr = document.editProductForm.investMin.value
				var investMaxStr = document.editProductForm.investMax.value
				
				if(investMinStr!=null && investMinStr!='' && investMaxStr!=null && investMaxStr!='') {//都有填写
					var investMin = parseFloat(investMinStr) || 0 
					var investMax = parseFloat(investMaxStr) || 0 
					if (investMin > investMax) {
						$('#editInvestMinDiv').removeClass("has-error")
						$('#editInvestMaxDiv').removeClass("has-error")
						$('#editInvestMinError').html('')
						$('#editInvestMaxError').html('')
						$('#editInvestMinError').html('单笔投资最低份额不能大于单笔投资最高份额')
						$('#editInvestMinDiv').addClass("has-error")
						$('#editInvestMaxError').html('单笔投资最高份额不能小于单笔投资最低份额')
						$('#editInvestMaxDiv').addClass("has-error")
						return
					}
				}
				
				//校验单笔赎回最低份额 必须小于单人单日赎回上限 并且小于单笔赎回最高份额
				var minRredeemStr = document.editProductForm.minRredeem.value
				var maxRredeemStr = document.editProductForm.maxRredeem.value
				var singleDailyMaxRedeemStr = document.editProductForm.singleDailyMaxRedeem.value
				
				var minRredeem = parseFloat(minRredeemStr) || 0 
				var maxRredeem = parseFloat(maxRredeemStr) || 0 
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0 
				
				if(minRredeemStr!=null && minRredeemStr!='' && maxRredeemStr!=null && maxRredeemStr!='') {//都有填写
					if (minRredeem > maxRredeem) {
						$('#editMinRredeemDiv').removeClass("has-error")
						$('#editMaxRredeemDiv').removeClass("has-error")
						$('#editMinRredeemError').html('')
						$('#editMaxRredeemError').html('')
						
						$('#editMinRredeemError').html('单笔赎回最低份额不能大于单笔赎回最高份额')
						$('#editMinRredeemDiv').addClass("has-error")
						$('#editMaxRredeemError').html('单笔赎回最高份额不能小于单笔赎回最低份额')
						$('#editMaxRredeemDiv').addClass("has-error")
						return
					}
				}
				if(minRredeemStr!=null && minRredeemStr!='' && singleDailyMaxRedeemStr!=null && singleDailyMaxRedeemStr!='') {//都有填写
					if (minRredeem > singleDailyMaxRedeem) {
						$('#editMinRredeemDiv').removeClass("has-error")
						$('#editSingleDailyMaxRedeemDiv').removeClass("has-error")
						$('#editMinRredeemError').html('')
						$('#editSingleDailyMaxRedeemError').html('')

						$('#editMinRredeemError').html('单笔赎回最低份额不能大于单人单日赎回上限')
						$('#editMinRredeemDiv').addClass("has-error")
						$('#editSingleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
						$('#editSingleDailyMaxRedeemDiv').addClass("has-error")			
						return
					}
				}

				//校验起息日大于等于申购确认日
				var interestsDate = parseInt(document.editProductForm.interestsDate.value) || 0
				var purchaseConfirmDate = parseInt(document.editProductForm.purchaseConfirmDate.value) || 0
				if (purchaseConfirmDate > 0 && interestsDate > 0 && interestsDate < purchaseConfirmDate) {
					$('#editPurchaseConfirmDateDiv').removeClass("has-error")
					$('#editInterestsDateDiv').removeClass("has-error")
					$('#editPurchaseConfirmDateError').html('')
					$('#editInterestsDateError').html('')

					$('#editInterestsDateError').html('起息日必须大于等于申购确认日')
					$('#editInterestsDateDiv').addClass("has-error")
					$('#editPurchaseConfirmDateError').html('申购确认日必须小于等于起息日')
					$('#editPurchaseConfirmDateDiv').addClass("has-error")
					return
				}

				$('#editProductForm').ajaxSubmit({
					url: config.api.product.duration.currentTradingRuleSet,
					success: function(result) {
						if (result.errorCode == 0) {
							$('#clearOtherModal').modal('hide')
						} else {
							alert(result.errorMessage)
						}
					}
				})
			})
			
			
			//校验单笔投资最低份额不能大于单笔投资最高份额
			$(document.editProductForm.investMin).on('input', function() {
				var flag = true
				$('#editInvestMinDiv').removeClass("has-error")
				$('#editInvestMaxDiv').removeClass("has-error")
				$('#editInvestMinError').html('')
				$('#editInvestMaxError').html('')
					
				var investMinStr = this.value
				var investMaxStr = document.editProductForm.investMax.value
				
				if(investMinStr!=null && investMinStr!='' && investMaxStr!=null && investMaxStr!='') {//都有填写
					var investMin = parseFloat(investMinStr) || 0 
					var investMax = parseFloat(investMaxStr) || 0 
					if (investMin > investMax) {
						$('#editInvestMinError').html('单笔投资最低份额不能大于单笔投资最高份额')
						$('#editInvestMinDiv').addClass("has-error")
						flag = false
					}
				}
				
				return flag
			})
			
			//校验单笔投资最高份额不能小于单笔投资最低份额
			$(document.editProductForm.investMax).on('input', function() {
				var flag = true
				$('#editInvestMinDiv').removeClass("has-error")
				$('#editInvestMaxDiv').removeClass("has-error")
				$('#editInvestMinError').html('')
				$('#editInvestMaxError').html('')
				
				var investMaxStr = this.value
				var investMinStr = document.editProductForm.investMin.value
				
				if(investMinStr!=null && investMinStr!='' && investMaxStr!=null && investMaxStr!='') {//都有填写
					var investMin = parseFloat(investMinStr) || 0 
					var investMax = parseFloat(investMaxStr) || 0 
					if (investMin > investMax) {
						$('#editInvestMaxError').html('单笔投资最高份额不能小于单笔投资最低份额')
						$('#editInvestMaxDiv').addClass("has-error")
						flag = false
					}
				}
				return flag
				
			})
			
			//校验单笔赎回最低份额 必须小于单人单日赎回上限 并且小于单笔赎回最高份额
			$(document.editProductForm.minRredeem).on('input', function() {
				var flag = true
				$('#editMinRredeemDiv').removeClass("has-error")
				$('#editMaxRredeemDiv').removeClass("has-error")
				$('#editSingleDailyMaxRedeemDiv').removeClass("has-error")
				$('#editMinRredeemError').html('')
				$('#editMaxRredeemError').html('')
				$('#editSingleDailyMaxRedeemError').html('')
				
				var minRredeemStr = this.value
				var maxRredeemStr = document.editProductForm.maxRredeem.value
				var singleDailyMaxRedeemStr = document.editProductForm.singleDailyMaxRedeem.value
					
				var minRredeem = parseFloat(minRredeemStr) || 0 
				var maxRredeem = parseFloat(maxRredeemStr) || 0 
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0 
				
				if(minRredeemStr!=null && minRredeemStr!='' && maxRredeemStr!=null && maxRredeemStr!='') {//都有填写
					if (minRredeem > maxRredeem) {
						$('#editMinRredeemError').html('单笔赎回最低份额不能大于单笔赎回最高份额')
						$('#editMinRredeemDiv').addClass("has-error")
						flag = false
						return flag
					}
				}
				if(minRredeemStr!=null && minRredeemStr!='' && singleDailyMaxRedeemStr!=null && singleDailyMaxRedeemStr!='') {//都有填写
					if (minRredeem > singleDailyMaxRedeem) {
						$('#editMinRredeemError').html('单笔赎回最低份额不能大于单人单日赎回上限')
						$('#editMinRredeemDiv').addClass("has-error")
						flag = false
						return flag
					}
				}
				return flag
			})
			
			//校验单笔赎回最高份额 必须大于单笔赎回最低份额
			$(document.editProductForm.maxRredeem).on('input', function() {
				var flag = true
				$('#editMinRredeemDiv').removeClass("has-error")
				$('#editMaxRredeemDiv').removeClass("has-error")
				$('#editMinRredeemError').html('')
				$('#editMaxRredeemError').html('')
				
				var maxRredeemStr = this.value
				var minRredeemStr = document.editProductForm.minRredeem.value
					
				var minRredeem = parseFloat(minRredeemStr) || 0 
				var maxRredeem = parseFloat(maxRredeemStr) || 0 
				
				if(minRredeemStr!=null && minRredeemStr!='' && maxRredeemStr!=null && maxRredeemStr!='') {//都有填写
					if (minRredeem > maxRredeem) {
						$('#editMaxRredeemError').html('单笔赎回最高份额不能小于单笔赎回最低份额')
						$('#editMaxRredeemDiv').addClass("has-error")
						flag = false
					}
				}
				return flag
			})
			
			//校验单人单日赎回上限必须大于单笔赎回最低份额 
			$(document.editProductForm.singleDailyMaxRedeem).on('input', function() {
				var flag = true
				$('#editMinRredeemDiv').removeClass("has-error")
				$('#editSingleDailyMaxRedeemDiv').removeClass("has-error")
				$('#editMinRredeemError').html('')
				$('#editSingleDailyMaxRedeemError').html('')
				
				var minRredeemStr = document.editProductForm.minRredeem.value
				var singleDailyMaxRedeemStr = this.value
				
				var minRredeem = parseFloat(minRredeemStr) || 0 
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0 
				
				if(minRredeemStr!=null && minRredeemStr!='' && singleDailyMaxRedeemStr!=null && singleDailyMaxRedeemStr!='') {//都有填写
					if (minRredeem > singleDailyMaxRedeem) {
						$('#editSingleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
						$('#editSingleDailyMaxRedeemDiv').addClass("has-error")
						flag = false
					}
				}
				return flag
				
			})

			//校验起息日大于等于申购确认日
			$(document.editProductForm.purchaseConfirmDate).on('input', function() {
				var flag = true
				$('#editPurchaseConfirmDateDiv').removeClass("has-error")
				$('#editInterestsDateDiv').removeClass("has-error")
				$('#editPurchaseConfirmDateError').html('')
				$('#editInterestsDateError').html('')

				var purchaseConfirmDate = parseInt(this.value) || 0
				var interestsDate = parseInt(document.editProductForm.interestsDate.value) || 0

				if (interestsDate > 0 && purchaseConfirmDate > interestsDate) {
					$('#editPurchaseConfirmDateError').html('申购确认日必须小于等于起息日')
					$('#editPurchaseConfirmDateDiv').addClass("has-error")
					flag = false
				}
				return flag
			})


			$(document.editProductForm.interestsDate).on('input', function() {
				var flag = true
				$('#editPurchaseConfirmDateDiv').removeClass("has-error")
				$('#editInterestsDateDiv').removeClass("has-error")
				$('#editPurchaseConfirmDateError').html('')
				$('#editInterestsDateError').html('')

				var interestsDate = parseInt(this.value) || 0
				var purchaseConfirmDate = parseInt(document.editProductForm.purchaseConfirmDate.value) || 0

				if (purchaseConfirmDate > 0 && interestsDate < purchaseConfirmDate) {
					$('#editInterestsDateError').html('起息日必须大于等于申购确认日')
					$('#editInterestsDateDiv').addClass("has-error")
					flag = false
				}
				return flag

			})

			/**
			 * 单人单日赎回上限设置
			 */
//			$('#singleDailyMaxRedeem').on('click', function() {
//				$('#tradeorderModalDiv').hide()
//				$('#closeManageTradeorder').hide()
//				$('#singleDailyMaxRedeemModalDiv').hide()
//				$('#fastRedeemModalDiv').hide()
//				
//				if (pageState.detail != null) {
//
//					http.post(config.api.productDetail, {
//						data: {
//							oid: pageState.productOid
//						},
//						contentType: 'form'
//					}, function(result) {
//						if (result.errorCode == 0) {
//							var data = result
//							$("#singleDailyMaxRedeemForm").validator('destroy')
//
//							$$.detailAutoFix($('#singleDailyMaxRedeemForm'), data); // 自动填充详情	
//							$$.formAutoFix($('#singleDailyMaxRedeemForm'), data); // 自动填充表单
//
//							util.form.validator.init($('#singleDailyMaxRedeemForm'))
//
//							$('#singleDailyMaxRedeemModalDiv').show()
//
//						} else {
//							alert(查询失败);
//						}
//
//					})
//				}
//			})

			$(document.singleDailyMaxRedeemForm.singleDailyMaxRedeem).on('input', function() {
				var flag = true
				$('#singleDailyMaxRedeemDiv').removeClass("has-error")
				$('#singleDailyMaxRedeemError').html('')

				var singleDailyMaxRedeem = parseInt(this.value) || 0
				var minRredeem = parseInt(document.singleDailyMaxRedeemForm.minRredeem.value) || 0
				if (minRredeem >= 0 && singleDailyMaxRedeem >= 0 && minRredeem > singleDailyMaxRedeem) {
					$('#singleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
					$('#singleDailyMaxRedeemDiv').addClass("has-error")
					flag = false
				}
				return flag

			})

			// 开启限额赎回“确定”按钮点击事件
			$('#singleDailyMaxRedeemSubmit').on('click', function() {
				if (!$('#singleDailyMaxRedeemForm').validator('doSubmitCheck')) return

				//校验单人单日赎回上限必须大于单笔赎回最低份额 
				var singleDailyMaxRedeem = parseInt($("#singleDailyMaxRedeemFormInput").val()) || 0
				var minRredeem = parseInt(document.singleDailyMaxRedeemForm.minRredeem.value) || 0
				if (minRredeem >= 0 && singleDailyMaxRedeem >= 0 && minRredeem > singleDailyMaxRedeem) {
					$('#singleDailyMaxRedeemDiv').removeClass("has-error")
					$('#singleDailyMaxRedeemError').html('')

					$('#singleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
					$('#singleDailyMaxRedeemDiv').addClass("has-error")
					return
				}


				$('#singleDailyMaxRedeemForm').ajaxSubmit({
					url: config.api.product.duration.updateSingleDailyMaxRedeem,
					success: function(result) {
						if (result.errorCode == 0) {
							$('#singleDailyMaxRedeemModalDiv').hide()
							$('#remeedRelevantModal').modal('hide')
						} else {
							alert(result.errorMessage)
						}

					}
				})
			})

			/**
			 * 激活赎回确认
			 */
			$('#openRedeemConfirm').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定激活赎回确认吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.openRedeemConfirm, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#remeedRelevantModal').modal('hide')
							})
						}
					})
				}

			})

			/**
			 * 屏蔽赎回确认
			 */
			$('#closeRedeemConfirm').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {
					$("#confirmTitle").html("产品名称:" + pageState.detail.fullName)
					$("#confirmTitle1").html("确定屏蔽赎回确认吗？")
					$$.confirm({
						container: $('#doConfirm'),
						trigger: this,
						position: 'bottomRight',
						accept: function() {
							http.post(config.api.product.duration.closeRedeemConfirm, {
								data: {
									oid: pageState.detail.oid
								},
								contentType: 'form',
							}, function(result) {
								$('#remeedRelevantModal').modal('hide')
							})
						}
					})
				}

			})
			
			/**
			 * 快速赎回设置
			 */
			$('#fastRedeemSet').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				if (pageState.detail != null) {

					http.post(config.api.productDetail, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						if (result.errorCode == 0) {
							var data = result
							$("#fastRedeemForm").validator('destroy')

							$$.detailAutoFix($('#fastRedeemForm'), data); // 自动填充详情	
							$$.formAutoFix($('#fastRedeemForm'), data); // 自动填充表单
							
							if (data.fastRedeemStatus === 'YES') {
								$('#fastRedeemMaxDiv').show()
							} else {
								$('#fastRedeemMaxDiv').hide()
							}

							util.form.validator.init($('#fastRedeemForm'))
							
							$('#fastRedeemModalDiv').show()

						} else {
							alert(查询失败);
						}

					})
				}
			})
			
			/**
			 * 赎回占比开关radio change事件
			 */
			$('#updateProductType02Area_3').find('input[name=isPreviousCurVolume]').on('ifChecked', function() {
				if(this.value === 'YES') {
					$('#addPreviousCurVolumePercent').show().find('input[name=previousCurVolumePercent]').attr('required','required')
				} else {
					$('#addPreviousCurVolumePercent').hide().find('input[name=previousCurVolumePercent]').val('').removeAttr('required')
				}
			})
			
			/**
			 * 快速赎回开关radio change事件
			 */
			$(document.fastRedeemForm.fastRedeemStatus).on('ifChecked', function() {
				if (this.value === 'YES') {
					$('#fastRedeemMaxDiv').show()
				} else {
					$('#fastRedeemMaxDiv').hide()
				}
			})
			
			// 快速赎回设置“确定”按钮点击事件
			$('#fastRedeemSubmit').on('click', function() {
				if (!$('#fastRedeemForm').validator('doSubmitCheck')) return

				$('#fastRedeemForm').ajaxSubmit({
					url: config.api.product.duration.updateFastRedeem,
					success: function(addResult) {
						if (addResult.errorCode == 0) {
							$('#fastRedeemModalDiv').hide()
							$('#remeedRelevantModal').modal('hide')
						}

					}
				})
			})
			
			/**
			 * 标签类型设置
			 */
			$('#productLabelSet').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
							
				if (pageState.detail != null) {

					http.post(config.api.productDetail, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						if (result.errorCode == 0) {
							var data = result
							
							$(document.productLabelSetForm.expandProductLabels).select2()
							
							data.oldExpandProductLabels=''
							if(data.expandProductLabelNames != null && data.expandProductLabelNames.length > 0) {
								for(var i = 0; i < data.expandProductLabelNames.length; i++) {
									data.oldExpandProductLabels+=data.expandProductLabelNames[i]+"&nbsp;&nbsp;&nbsp;"
								}
							}
							
							http.post(config.api.system.productLabel.getProductLabelNames, {
								data: {
									labelType: 'extend'
								},
								contentType: 'form'
							}, function(result) {
								var select = document.productLabelSetForm.expandProductLabels
								$(select).empty()
								result.rows.forEach(function(item, index) {
									$(select).append('<option value="' + item.oid + '">' + item.name + '</option>')
								})
								$(document.productLabelSetForm.expandProductLabels).val(data.expandProductLabelOids).trigger('change')
							})
							
							$$.detailAutoFix($('#productLabelSetForm'), data); // 自动填充详情	
							$$.formAutoFix($('#productLabelSetForm'), data); // 自动填充表单

							$('#productLabelSetModalDiv').show()

						} else {
							alert(查询失败);
						}

					})
				}
			})
			
			// 标签类型设置“确定”按钮点击事件 
			$('#productLabelSetSubmit').on('click', function() {
				$('#productLabelSetForm').ajaxSubmit({
					url: config.api.product.duration.updateProductLabel,
					success: function(addResult) {
						if (addResult.errorCode == 0) {
							$('#clearOtherModal').modal('hide')
						}

					}
				})
			})
			
			/**
			 * 是否自动派息
			 */
			$('#isAutoAssignIncome').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
							
				if (pageState.detail != null) {

					http.post(config.api.productDetail, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						var data = result
						
						$$.detailAutoFix($('#isAutoAssignIncomeForm'), data); // 自动填充详情	
						$$.formAutoFix($('#isAutoAssignIncomeForm'), data); // 自动填充表单

						$('#isAutoAssignIncomeModalDiv').show()
					})
				}
			})
			
			// 是否自动派息设置“确定”按钮点击事件 
			$('#isAutoAssignIncomeSubmit').on('click', function() {
				$('#isAutoAssignIncomeForm').ajaxSubmit({
					url: config.api.product.duration.isAutoAssignIncomeSet,
					success: function(addResult) {
						if (addResult.errorCode == 0) {
							$('#clearOtherModal').modal('hide')
						}

					}
				})
			})
			
			/**
			 * 募集管理
			 */
			$('#raiseSuccessOrFail').on('click', function() {
				$('#raiseSuccessOrFailModalDiv').hide()
				$('#editProductModalDiv').hide()
				$('#productLabelSetModalDiv').hide()
				$('#isAutoAssignIncomeModalDiv').hide()
				$('#profitDistributeModalDiv').hide()
				$('#clearProductModalDiv').hide()
				
				if (pageState.detail != null) {

					http.post(config.api.productDetail, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						var data = result
						if (data.status == 'RAISEEND') {
							data.expandProductLabels=''
							if(data.expandProductLabelNames != null && data.expandProductLabelNames.length > 0) {
								for(var i = 0; i < data.expandProductLabelNames.length; i++) {
									data.expandProductLabels+=data.expandProductLabelNames[i]+"&nbsp;&nbsp;&nbsp;"
								}
							}
								
							$$.detailAutoFix($('#raiseSuccessOrFailForm'), data); // 自动填充详情	
							$('#raiseSuccessOrFailModalDiv').show()
						}
					})
				}
			})
			
			// 募集管理“募集失败”按钮点击事件 
			$('#raiseFailSubmit').on('click', function() {
				if (pageState.detail != null) {
					http.post(config.api.product.duration.productRaiseFail, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						$('#raiseSuccessOrFailModalDiv').hide()
						$('#clearOtherModal').modal('hide')
					})
				}
			})
			
			// 募集管理“募集成功”按钮点击事件 
			$('#raiseSuccessSubmit').on('click', function() {
				if (pageState.detail != null) {
					http.post(config.api.product.duration.productRaiseSuccess, {
						data: {
							oid: pageState.productOid
						},
						contentType: 'form'
					}, function(result) {
						$('#raiseSuccessOrFailModalDiv').hide()
						$('#clearOtherModal').modal('hide')
					})
				}
			})

			
			// 赎回单处理按钮点击事件
			$('#manageTradeorder').on('click', function() {
				$('#acceptedOrderTable').bootstrapTable('refresh');
				$('#refusedOrderTable').bootstrapTable('refresh');
				
				$('#singleDailyMaxRedeemModalDiv').hide()
				$('#fastRedeemModalDiv').hide()
				
				$('#tradeorderModalDiv').show()
				$('#closeManageTradeorder').show()
				
			})
			
			// 隐藏赎回单处理按钮点击事件
			$('#closeManageTradeorder').on('click', function() {
				$('#tradeorderModalDiv').hide()
				$('#closeManageTradeorder').hide()
				
			})

			// 拒绝赎回单按钮点击事件
			$('#doRefuse').on('click', function() {
				if (acceptedOrderCheckItems.length === 0) {
					return
				}
				http.post(config.api.gacha.refuse, {
					data: JSON.stringify(acceptedOrderCheckItems.map(function(item) {
						return item.orderCode
					}))
				}, function(result) {
					$('#acceptedOrderTable').bootstrapTable('refresh')
					$('#refusedOrderTable').bootstrapTable('refresh')
				})
			})
			
			// 投资单处理 - 可作废投资单表格配置
			var acceptedInvestCheckItems = []
			var acceptedInvestOptions = {
				page: 1,
				rows: 10,
				orderStatus: 'accepted',
				orderType: 'invest'
			}

			var acceptedInvestTableConfig = {
				ajax: function(origin) {
					http.post(util.buildQueryUrl(config.api.gacha.tradeorder, {
						publisherClearStatus: 'toClear',
						productOid: pageState.productOid,
						page: 1,
						rows: 10,
						orderStatus: 'accepted',
						orderType: 'invest'
					}), {
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: acceptedInvestOptions.page,
				pageSize: acceptedInvestOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					acceptedInvestOptions.rows = val.limit
					acceptedInvestOptions.page = parseInt(val.offset / val.limit) + 1
					acceptedInvestOptions.offset = val.offset
					return val
				},
				onCheck: function(row) {
					var indexOf = -1
					if (acceptedInvestCheckItems.length > 0) {
						acceptedInvestCheckItems.forEach(function(item, index) {
							if (item.tradeOrderOid == row.tradeOrderOid) {
								indexOf = index
							}
						})
					}
					if (indexOf < 0) {
						acceptedInvestCheckItems.push(row)
					}
				},
				onUncheck: function(row) {
					acceptedInvestCheckItems.splice(acceptedInvestCheckItems.indexOf(row), 1)
				},
				onCheckAll: function(rows) {
					acceptedInvestCheckItems = rows.map(function(item) {
						return item
					})
				},
				onUncheckAll: function() {
					acceptedInvestCheckItems = []
				},
				columns: [{
					checkbox: true,
					align: 'center'
				}, {
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return acceptedInvestOptions.offset + index + 1
					}
				}, {
					field: 'orderCode'
				}, {
					field: 'orderTypeDisp'
				}, {
					field: 'orderStatusDisp'
				}, {
					field: 'orderAmount',
					class: 'currency'
				}, {
					field: 'createTime',
					align: 'right'
				}]
			}

			// 投资单处理 - 已作废投资单表格配置
			var abandonOrderOptions = {
				page: 1,
				rows: 10,
				orderStatus: 'abandoned',
				orderType: 'invest'
			}

			var abandonOrderTableConfig = {
				ajax: function(origin) {
					http.post(config.api.gacha.tradeorder + "?productOid=" + pageState.productOid, {
						data: abandonOrderOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: abandonOrderOptions.page,
				pageSize: abandonOrderOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					abandonOrderOptions.rows = val.limit
					abandonOrderOptions.page = parseInt(val.offset / val.limit) + 1
					abandonOrderOptions.offset = val.offset
					return val
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return abandonOrderOptions.offset + index + 1
					}
				}, {
					field: 'orderCode'
				}, {
					field: 'orderTypeDisp'
				}, {
					field: 'orderStatusDisp'
				}, {
					field: 'orderAmount',
					class: 'currency'
				}, {
					field: 'createTime',
					align: 'right'
				}]
			}
			
			// 投资单处理按钮点击事件
			$('#manageInvestorder').on('click', function() {
				$('#investTable1').bootstrapTable('refresh');
				$('#investTable2').bootstrapTable('refresh');
				$('#investModalDiv').show()
				$('#channelModalDiv').hide()
				$('#availbleSaleVolumeModalDiv').hide()
				$('#closeManageInvestorder').show()
				
			})
			
			// 隐藏投资单处理按钮点击事件
			$('#closeManageInvestorder').on('click', function() {
				$('#investModalDiv').hide()
				$('#closeManageInvestorder').hide()
				
			})

			// 废弃投资单按钮点击事件
			$('#doAbandon').on('click', function() {
				if (acceptedInvestCheckItems.length === 0) {
					return
				}
				http.post(config.api.gacha.abandon, {
					data: JSON.stringify(acceptedInvestCheckItems.map(function(item) {
						return item.orderCode
					}))
				}, function(result) {
					$('#investTable1').bootstrapTable('refresh')
					$('#investTable2').bootstrapTable('refresh')
				})
			})

			// 刷新轧差数据按钮
			$('#refreshGacha').on('click', function() {
				http.post(config.api.product.duration.findpid + '?productOid=' + pageState.productOid, function(result) {
					if (result.netPosition != undefined && result.netPosition != null) {
						$(this).prev('div').html(result.netPosition)
					}
				}.bind(this))
			})

		}
	}
})

function productDetailInit(pageState, http, config, $$) {
	http.post(config.api.product.duration.getProductByOid, {
		data: {
			oid: pageState.productOid
		},
		contentType: 'form'
	}, function(result) {
		if (result.errorCode == 0 && result != null) {
			var detail = pageState.detail = result
			pageState.productOid = document.searchForm.productName.value = detail.oid
			pageState.incomeCalcBasis = detail.incomeCalcBasis

			http.post(config.api.product.duration.getProductDuration, {
				data: {
					oid: pageState.productOid
				},
				contentType: 'form'
			}, function(pd) {
				$$.detailAutoFix($('#detailboard'), pd)
			})

			$('#productOrderTable').bootstrapTable('refresh')
			$('#dataAnalysisTable').bootstrapTable('refresh')
			$('#spvOrderTable').bootstrapTable('refresh')
			$('#productPurchaseRemeedTable').bootstrapTable('refresh')
			$('#availbleSaleVolumeTable').bootstrapTable('refresh')
			$('#channelTable').bootstrapTable('refresh')
			$('#availbleSaleDateTable').bootstrapTable('refresh')
			
			$('#purchaseRelevant').show()
			if('PRODUCTTYPE_01' == detail.typeOid) {
				$('#remeedRelevant').hide()
				$('#tabpanelli5').hide()
				$('#tabpanelli7').hide()
			} else {
				$('#remeedRelevant').show()
				$('#tabpanelli5').show()
				$('#tabpanelli7').show()
			}
			$('#clearOther').show()

		} else {

		}

	})
}



function getDataAnalysisPieOptions(config, source) {
	return {
		tooltip: {
			trigger: 'item',
			formatter: "{a} <br/>{b}: {c} ({d}%)"
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			data: source.map(function(item) {
				return '阶段' + item.level
			})
		},
		series: [{
			name: '投资占比',
			type: 'pie',
			radius: '75%',
			center: ['55%', '50%'],
			data: source.map(function(item) {
				return {
					name: '阶段' + item.level,
					value: item.totalHoldVolume
				}
			})
		}],
		color: config.colors
	}
}