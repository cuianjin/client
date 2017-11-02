/**
 * 发行人资金管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'publisherGacha',
		init: function () {
			var publisherOid = ''
			
			// 记录正在操作的单条轧差数据
			var opGacha = null
			
			// 是否有发行人账户
			var flag = true
			
			var operating = {
				operateType: '',
				times: 0
			}
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
				orderType: '',
				orderStatus: ''
			}
			var pageOptions3 = {
				number: 1,
				size: 10,
				offset: 0,
				dividendCloseStatus: '',
				dividendDateBegin: '',
				dividendDateEnd: ''
			}
			var pageOptions4 = {
				number: 1,
				size: 10,
				offset: 0,
				code: '',
				name: '',
				creTimeBegin: '',
				creTimeEnd: ''
			}
			var pageOptions5 = {
				number: 1,
				size: 10,
				offset: 0,
				orderType: ["normalRedeem","dividend","cash","cashFailed","clearRedeem"],
				publisherCloseStatus: '',
				isPubAcc: 'yes'
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
				publisherOffsetOid: ''
			}
			
			/**
			 * 用于存储表格checkbox选中的项
			 */
			var checkItems = []
			
			getMoneyDetail()
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(config.api.publisherPmng, {
						data: {
							page: pageOptions1.number,
							rows: pageOptions1.size,
							offsetCode: pageOptions1.offsetCode,
							offsetDateBegin: pageOptions1.offsetDateBegin,
							offsetDateEnd: pageOptions1.offsetDateEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					}, function (err) {
						if(err.errorCode != 30056){
							errorHandle(err)
						}
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
//					{
//						field: 'offsetDate'
//					},
					{
						field: 'offsetCode',
						align: 'right'
					},
					{
						field: 'toCloseRedeemAmount',
						align: 'right',
						class: 'quantity'						
					},
					{
						field: 'netPosition',
						align: 'right',
						class: 'currency'						
					},
					{
						field: 'buyAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'redeemAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'createTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'clearStatusDisp'
					},
					{
						field: 'confirmStatusDisp'
					},
					{
						field: 'closeStatusDisp'
					},
					{
						align: 'center',
						width: 300,
						formatter: function (val, row,index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#dataTable1').bootstrapTable('getData').length - 1,
								sub:[{
									text: '订单',
									type: 'button',
									class: 'order-detail',
									isRender: true
								},{
									text: '产品轧差',
									type: 'button',
									class: 'item-product',
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
									text: '份额确认',
									type: 'button',
									class: 'item-volconfirm',
									isRender: row.clearStatus === "cleared" && row.confirmStatus === "toConfirm" || row.confirmStatus === "confirmFailed"
								},{
									text: '结算',
									type: 'button',
									class: 'item-close',
									isRender: row.clearStatus === "cleared" && row.closeStatus === "toClose" || row.closeStatus === "closeFailed" || row.closeStatus === "closeSubmitFailed"
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable1');
						},
						events: {
							'click .order-detail': function (e, value, row) {
								pageOptions6.publisherOffsetOid = row.offsetOid
								$('#dataTable6').bootstrapTable('refresh')
								$('#detailModal').modal('show')
							},
							'click .item-product': function (e, value, row) {
								opGacha = row
								loadProducts(http, config, row)
								$('#productModal').modal('show')
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
										http.post(util.buildQueryUrl(config.api.gacha.clear, {
											offsetOid: row.offsetOid
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable1').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-volconfirm': function (e, value, row) {
								$('#clearConfirm').find('p').html('确定进行份额确认？')
								$$.confirm({
									container: $('#clearConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.gacha.volconfirm, {
											offsetOid: row.offsetOid
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable1').bootstrapTable('refresh')
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
										http.post(util.buildQueryUrl(config.api.gacha.close, {
											offsetOid: row.offsetOid,
											returnUrl: row.netPosition < 0 ? window.location.href : ''
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable1').bootstrapTable('refresh')
											if(result.retHtml){
												var aa = window.open()
												aa.document.write(result.retHtml)
											}
										})
									}
								})
							}
						}
					}
				]
			}
			
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.publisherMng, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							orderType: pageOptions2.orderType,
							orderStatus: pageOptions2.orderStatus,
//							publisherOid: publisherOid
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					}, function (err) {
						if(err.errorCode != 30056){
							errorHandle(err)
						}
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
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions2.offset
						}
					},
					{
						field: 'orderCode'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'feePayerDisp',
						formatter: function (val) {
							return val || '--'
						}
					},
					{
						field: 'fee',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'orderAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'orderStatusDisp'
					},
					{
						field: 'orderTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'completeTime',
						align: 'right',
						formatter: function (val) {
							return val ? util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss') : '--'
						}
					},
					{
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								sub:[{
									text: '支付日志',
									type: 'button',
									class: 'item-logs',
									isRender: row.orderCode
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable2');
						},
						events: {
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
			
			var tableConfig3 = {
				ajax: function (origin) {
					http.post(config.api.dividendoffsetMng, {
						data: {
							page: pageOptions3.number,
							rows: pageOptions3.size,
							dividendCloseStatus: pageOptions3.dividendCloseStatus,
							dividendDateBegin: pageOptions3.dividendDateBegin,
							dividendDateEnd: pageOptions3.dividendDateEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					}, function (err) {
						if(err.errorCode != 30056){
							errorHandle(err)
						}
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
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions3.offset
						}
					},
					{
						field: 'productName'
					},
					{
						field: 'dividendDate'
					},
					{
						field: 'dividendAmount',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'toCloseDividendNumber',
						class: 'quantity'
					},
					{
						field: 'message'
					},
					{
						field: 'dividendCloseStatusDisp'
					},
					{
						align: 'center',
						formatter: function (val, row,index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								sub:[{
									text: '结算',
									type: 'button',
									class: 'item-close',
									isRender: row.dividendCloseStatus === "toClose" || row.dividendCloseStatus === "closeSubmitFailed" || row.dividendCloseStatus === "closePayFailed"
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable3');
						},
						events: {
							'click .item-close': function (e, value, row) {
								$('#clearConfirm').find('p').html('确定进行结算？')
								$$.confirm({
									container: $('#clearConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.dividendoffsetClose, {
											dividendOffsetOid: row.dividendOffsetOid,
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable3').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				]
			}
			
			var tableConfig4 = {
				ajax: function (origin) {
					http.post(config.api.caccountAccproducts, {
						data: {
							page: pageOptions4.number,
							rows: pageOptions4.size,
							code: pageOptions4.code,
							name: pageOptions4.name,
							publisherBaseAccountOid: publisherOid,
							creTimeBegin: pageOptions4.creTimeBegin,
							creTimeEnd: pageOptions4.creTimeEnd
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
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'name':
							qryInfo(value,row)
							break
					}
				},
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
						field: 'code'
					},
					{
						field: 'name',
						class:"table_title_detail"
					},
					{
						field: 'typeName'
					},
					{
						field: 'administrator'
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
					http.post(util.buildQueryUrl(config.api.gacha.tradeorder, {
						page: pageOptions5.number,
						rows: pageOptions5.size,
						orderType: pageOptions5.orderType,
						isPubAcc: pageOptions5.isPubAcc,
						publisherCloseStatus: pageOptions5.publisherCloseStatus
						
					}), {
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					}, function (err) {
						if(err.errorCode != 30056){
							errorHandle(err)
						}
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
						checkbox: true,
						align: 'center',
						formatter: function (val, row, index) {
							return {
								disabled: row.publisherCloseStatus !== 'closeSubmitFailed' && row.publisherCloseStatus !== 'closePayFailed'
							}
						}
					},
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
						field: 'orderAmount',
						class: 'currency',
						align: 'right'
					},
//					{
//						field: 'couponAmount',
//						class: 'currency',
//						align: 'right'
//					},
//					{
//						field: 'payAmount',
//						class: 'currency',
//						align: 'right'
//					},
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
								},{
									text: '重新结算',
									class: 'item-repayment',
									isRender: row.publisherCloseStatus=='closeSubmitFailed'||row.publisherCloseStatus=='closePayFailed'
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable5');
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
							},
							'click .item-repayment': function (e, value, row) {
								$('#clearConfirm').find('p').html('确定重新结算？')
								var oids = [];
								oids.push(row.tradeOrderOid);
								$$.confirm({
									container: $('#clearConfirm'),
									trigger: this,
									accept: function () {
										
										http.post(config.api.gacha.repayment, {
											data: {
												oids : JSON.stringify(oids)
											},
											contentType: 'form'
										}, function (rlt) {
											$('#dataTable5').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				],
				
				/**
				 * 单选按钮选中一项时
				 * @param {Object} row
				 */
				onCheck: function(row) {
					var indexOf = -1
					if(checkItems.length > 0) {
						checkItems.forEach(function(item, index) {
							if(item.tradeOrderOid == row.tradeOrderOid) {
								indexOf = index
							}
						})
					}
					if(indexOf < 0) {
						checkItems.push(row)
					}
				},

				/**
				 * 单选按钮取消一项时
				 * @param {Object} row
				 */
				onUncheck: function(row) {
					checkItems.splice(checkItems.indexOf(row), 1)
				},

				/**
				 * 全选按钮选中时
				 * @param {Object} rows
				 */
				onCheckAll: function(rows) {
					checkItems = rows.map(function(item) {
						return item
					})
				},

				/**
				 * 全选按钮取消时
				 */
				onUncheckAll: function() {
					checkItems = []
				}
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
							publisherOffsetOid: pageOptions6.publisherOffsetOid
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
//					{
//						field: 'productCode'
//					},
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
//								isCloseBottom: index >= $('#dataTable6').bootstrapTable('getData').length - 1,
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
			
			// 待录入产品表格配置
			var productTableConfig = {
				columns: [
					{
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1
						}
					},
					{
						field: 'productName'
					},
					{
						field: 'busTime'
					},
					{
						field: 'investAmount',
						class: 'currency'
					},
					{
						field: 'redeemAmount',
						class: 'currency'
					},
					{
						field: 'netPosition',
						class: 'currency'
					},
				]
			}
			
			$("#dataTable1").bootstrapTable(tableConfig1)
			$("#dataTable2").bootstrapTable(tableConfig2)
			$("#dataTable3").bootstrapTable(tableConfig3)
			$("#dataTable4").bootstrapTable(tableConfig4)
			$("#dataTable5").bootstrapTable(tableConfig5)
			$("#dataTable6").bootstrapTable(tableConfig6)
			$('#productTable').bootstrapTable(productTableConfig)
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			$$.searchInit($('#searchForm3'), $('#dataTable3'))
			$$.searchInit($('#searchForm4'), $('#dataTable4'))
			$$.searchInit($('#searchForm5'), $('#dataTable5'))
			$$.searchInit($('#searchForm6'), $('#dataTable6'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));
//			util.form.validator.init($("#depositAndWithdrawForm"))
			
			$('#deposit').on('click', function () {
				if(!flag){
					$('#createPublisherModal').modal('show')
					return
				}
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'deposit'
				$('#depositAndWithdrawForm')
				.clearForm()
//				.find('input[name=returnUrl]').val(window.location.href)
				$('#depositAndWithdrawForm').find('input[name=orderAmount]').attr('placeholder','请输入充值金额')
				var form = document.depositAndWithdrawForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
//				$(document.depositAndWithdrawForm).validator('validate')
				$('#depositAndWithdrawModal')
				.modal('show')
				.find('.modal-title').html('充值')
			})
			
			$('#withdraw').on('click', function () {
				if(!flag){
					$('#createPublisherModal').modal('show')
					return
				}
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'withdraw'
				$('#depositAndWithdrawForm')
				.clearForm()
//				.find('input[name=returnUrl]').val(window.location.href)
				$('#depositAndWithdrawForm').find('input[name=orderAmount]').attr('placeholder','请输入提现金额')
				var form = document.depositAndWithdrawForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
//				$(document.depositAndWithdrawForm).validator('validate')
				$('#depositAndWithdrawModal')
				.modal('show')
				.find('.modal-title').html('提现')
			})
			
			$('#collect').on('click', function () {
				if(!flag){
					$('#createPublisherModal').modal('show')
					return
				}
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'collect'
				$('#depositAndWithdrawForm')
				.clearForm()
				$('#depositAndWithdrawForm').find('input[name=orderAmount]').attr('placeholder','请输入收款金额')
				var form = document.depositAndWithdrawForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#depositAndWithdrawModal')
				.modal('show')
				.find('.modal-title').html('收款')
			})
			
			$('#pay').on('click', function () {
				if(!flag){
					$('#createPublisherModal').modal('show')
					return
				}
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'pay'
				$('#depositAndWithdrawForm')
				.clearForm()
				$('#depositAndWithdrawForm').find('input[name=orderAmount]').attr('placeholder','请输入放款金额')
				var form = document.depositAndWithdrawForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#depositAndWithdrawModal')
				.modal('show')
				.find('.modal-title').html('放款')
			})
			
			$('#refresh').on('click', function () {
				if(!flag){
					$('#createPublisherModal').modal('show')
					return
				}
				getMoneyDetail()
			})
			
			$('#depositAndWithdrawSubmit').on('click', function () {
				if (!$('#depositAndWithdrawForm').validator('doSubmitCheck')) return
				$('#refreshDiv').addClass('overlay');
				$('#refreshI').addClass('fa fa-refresh fa-spin');
				var url = ''
				if (operating.operateType === 'deposit') {
					url = config.api.publisherDapply;
				} else if (operating.operateType === 'withdraw') {
					url = config.api.publisherWithdraw;
				} else if (operating.operateType === 'collect') {
					url = config.api.publisherCollect;
				} else if (operating.operateType === 'pay') {
					url = config.api.publisherPay;
				}
				if (operating.operateType === 'deposit') {
					http.post(url, {
						data:JSON.stringify({
							orderAmount: document.depositAndWithdrawForm.orderAmount.value
						}),
						contentType: 'application/json'
					}, function(result){
						showDeposit(result.payNo)
					}, function(err){
						$('#refreshDiv').removeClass('overlay');
						$('#refreshI').removeClass('fa fa-refresh fa-spin');
						errorHandle(err)
					})
				} else {
					$('#depositAndWithdrawForm').ajaxSubmit({
						url: url,
						success: function (result) {
							if(result.errorCode == 0){
								if (operating.operateType === 'withdraw') {
									checkOrder(result.bankOrderOid)
								} else {
									$('#depositAndWithdrawModal').modal('hide')
									$('#dataTable2').bootstrapTable('refresh')
								}
//								var aa = window.open()
//								aa.document.write(result.retHtml)
							}else{
								errorHandle(result)
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');
							}
						}
					})
				}
			})
			
			$('#depositSubmit').on('click', function () {
				if (!$('#depositForm').validator('doSubmitCheck')) return
				$('#depositRefreshDiv').addClass('overlay');
				$('#depositRefreshI').addClass('fa fa-refresh fa-spin');
				$('#depositForm').ajaxSubmit({
					url: config.api.publisherDeposit,
					success: function (result) {
						if(result.errorCode == 0){
							checkOrder(result.bankOrderOid)
						}else{
							errorHandle(result)
							$('#depositRefreshDiv').removeClass('overlay');
							$('#depositRefreshI').removeClass('fa fa-refresh fa-spin');
						}
					}
				})
			})
			
			/**
			 * 重新结算按钮点击事件
			 */
			$('#orderRepayment').on('click', function() {
				if(checkItems.length > 0) {
					var orderCodes = checkItems.map(function(item) {
						return item
					})
					var le = orderCodes.length

					if($("#auditOrderCodes").children().length > 0) {
						$("#auditOrderCodes").children().remove()
					}

					for(var i = 0; i < le; i++) {
						var p = $('<p></p>')
						p.html(orderCodes[i].orderCode)
						$("#auditOrderCodes").append(p)
					}
					var h5 = $('<h5>确认提交以上订单重新结算吗？</h5>')
					$("#auditOrderCodes").append(h5)
					$('#orderCodeAuditModal').modal('show')
				} else {
					if($("#alertMessage").children().length > 0) {
						$("#alertMessage").children().remove()
					}
					var h5 = $('<h5>请选择结算订单</h5>')
					$("#alertMessage").append(h5)
					$('#alertModal').modal('show')
				}
			})

			/**
			 * 提交审核弹窗 -> 提交按钮点击事件
			 */
			$('#doOrderCodeAudit').on('click', function() {
				/**
				 * 获取id数组
				 */
				var oids = checkItems.map(function(item) {
					return item.tradeOrderOid
				})

				/**
				 * 提交数组
				 */
				http.post(config.api.gacha.repayment, {
					data: {
						oids : JSON.stringify(oids)
					},
					contentType: 'form'
				}, function (rlt) {
					checkItems = []
					$('#orderCodeAuditModal').modal('hide')
					$('#dataTable5').bootstrapTable('refresh')
				})

			})
			
			$('#createPublisherSubmit').on('click', function(){
				$('#createPublisherModal').modal('hide')
				setTimeout(function(){
					util.nav.dispatch('c_account');
				}, 500)
			})
			
			function showDeposit (payNo) {
				$('#depositRefreshDiv').removeClass('overlay');
				$('#depositRefreshI').removeClass('fa fa-refresh fa-spin');
				$('#depositForm').clearForm()
				var form = document.depositForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				form.orderAmount.value = document.depositAndWithdrawForm.orderAmount.value
				form.payNo.value = payNo
				$('#depositAndWithdrawModal').modal('hide')
				$('#depositModal').modal('show')
			}
			
			function checkOrder (bankOrderOid) {
				http.post(util.buildQueryUrl(config.api.publisherIsdone, {
					bankOrderOid: bankOrderOid
				}), {
					contentType: 'application/json'
				}, function (result) {
					operating.times = 0
					if (operating.operateType === 'deposit') {
						$('#depositModal').modal('hide')
					} else {
						$('#depositAndWithdrawModal').modal('hide')
					}
					$('#dataTable2').bootstrapTable('refresh')
				}, function (err) {
					if (err.errorCode == -1) {
						if (operating.times < 10) {
							operating.times ++
							setTimeout(function(){
								checkOrder(bankOrderOid);
							},5000)
						} else {
							operating.times = 0
							if (operating.operateType === 'deposit') {
								$('#depositModal').modal('hide')
							} else {
								$('#depositAndWithdrawModal').modal('hide')
							}
							$('#dataTable2').bootstrapTable('refresh')
						}
					} else {
						operating.times = 0
						if (operating.operateType === 'deposit') {
							$('#depositRefreshDiv').removeClass('overlay');
							$('#depositRefreshI').removeClass('fa fa-refresh fa-spin');
						} else {
							$('#refreshDiv').removeClass('overlay');
							$('#refreshI').removeClass('fa fa-refresh fa-spin');
						}
						errorHandle(err)
					}
				})
			}
			
			function getMoneyDetail (){
				
				http.post(config.api.publisherUserinfo, {
					contentType: 'form',
					async: false
				}, function (result) {
					$('#basicBalance').html(util.safeCalc(result.basicBalance, "/", 10000))
					$('#totalLoanAmount').html(util.safeCalc(result.totalLoanAmount, "/", 10000))
					$('#totalReturnAmount').html(util.safeCalc(result.totalReturnAmount, "/", 10000))
					$('#totalDepositAmount').html(util.safeCalc(result.totalDepositAmount, "/", 10000))
					$('#totalWithdrawAmount').html(util.safeCalc(result.totalWithdrawAmount, "/", 10000))
					$('#totalInterestAmount').html(util.safeCalc(result.totalInterestAmount, "/", 10000))
					$('#collectionSettlementBalance').html(util.safeCalc(result.collectionSettlementBalance, "/", 10000))
					$('#availableAmountBalance').html(util.safeCalc(result.availableAmountBalance, "/", 10000))
					$('#frozenAmountBalance').html(util.safeCalc(result.frozenAmountBalance, "/", 10000))
					$('#withdrawAvailableAmountBalance').html(util.safeCalc(result.withdrawAvailableAmountBalance, "/", 10000))
					$('#overdueTimes').html(result.overdueTimes)
					publisherOid = result.baseAccountOid
				}, function (err) {
					if(err.errorCode == 30056){
						flag = false
						$('#createPublisherModal').modal('show')
					}else{
						errorHandle(err)
					}
				})
			}
			
			function getDetail (offsetOid) {
				http.post(config.api.publisherDeta, {
					data: {
						offsetOid: offsetOid
					},
					contentType: 'form'
				}, function (result) {
					var obj = {
						offsetCode: result.offsetCode,
						netPosition: util.safeCalc(result.netPosition, "/", 10000)+'万',
						buyAmount: util.safeCalc(result.buyAmount, "/", 10000)+'万',
						redeemAmount: util.safeCalc(result.redeemAmount, "/", 10000)+'万',
						offsetStatusDisp: result.closeStatusDisp,
						closeMan: result.closeMan || ''
					}
					$$.detailAutoFix($('#gachaDetailArea'), obj)
					$('#gachaDetailModal').modal('show')
				})
			}
			
			function loadProducts (http, config, row) {
				http.post(config.api.gacha.findsoid, {
					data: {
						offsetOid : row.offsetOid
					},
					contentType: 'form'
				}, function (rlt) {
					$('#productTable').bootstrapTable('load', rlt.rows.map(function (item) {
						item.money = item.money ||0
						item.couFee = item.couFee || 0
						item.lexinFee = item.lexinFee || 0
						item.lexinCouFee = item.lexinCouFee || 0
						item.actualAmount = item.actualAmount || 0
						item.busDate = row.offsetDate
						item.busTime = row.offsetDate
						return item
					}))
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
				pageOptions2.orderType = form.orderType.value
				pageOptions2.orderStatus = form.orderStatus.value
				return val
			}
			
			function getQueryParams3 (val) {
				var form = document.searchForm3
				pageOptions3.size = val.limit
				pageOptions3.number = parseInt(val.offset / val.limit) + 1
				pageOptions3.offset = val.offset
				pageOptions3.dividendCloseStatus = form.dividendCloseStatus.value
				pageOptions3.dividendDateBegin = form.dividendDateBegin.value
				pageOptions3.dividendDateEnd = form.dividendDateEnd.value
				return val
			}
			
			function getQueryParams4 (val) {
				var form = document.searchForm4
				pageOptions4.size = val.limit
				pageOptions4.number = parseInt(val.offset / val.limit) + 1
				pageOptions4.offset = val.offset
				pageOptions4.code = form.code.value
				pageOptions4.name = form.name.value
				pageOptions4.creTimeBegin = form.creTimeBegin.value
				pageOptions4.creTimeEnd = form.creTimeEnd.value
				return val
			}
			
			function getQueryParams5 (val) {
				var form = document.searchForm5
				pageOptions5.size = val.limit
				pageOptions5.number = parseInt(val.offset / val.limit) + 1
				pageOptions5.offset = val.offset
				pageOptions5.orderType = form.orderType.value || ["normalRedeem","dividend","cash","cashFailed","clearRedeem"]
				pageOptions5.publisherCloseStatus = form.publisherCloseStatus.value
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
					formatter: function(val, row, index) {
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
			
			function qryInfo(value,row){
				http.post(config.api.productDetail, {
					data: {
						oid: row.oid
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
