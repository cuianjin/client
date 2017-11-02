/**
 * 投资者账户管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util,$$) {
	return {
		name: 'refundmng',
		init: function () {
			var pageOptions1 = {
				number: 1,
				size: 10,
				offset: 0,
				orderStatus: ['toRefund','refundFailed'],
				orderCode: '',
				createTimeBegin: '',
				createTimeEnd: ''
			}
			var pageOptions2 = {
				number: 1,
				size: 10,
				offset: 0,
				orderStatus: 'refunded',
				orderCode: '',
				createTimeBegin: '',
				createTimeEnd: ''
			}
			var toRefundOrderCheckItems = []
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(util.buildQueryUrl(config.api.gacha.tradeorder, {
						page: pageOptions1.number,
						rows: pageOptions1.size,
						orderStatus: ['toRefund','refundFailed'],
						orderCode: pageOptions1.orderCode,
						createTimeBegin: pageOptions1.createTimeBegin,
						createTimeEnd: pageOptions1.createTimeEnd
					}), {
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
				onCheck: function(row) {
					var indexOf = -1
					if (toRefundOrderCheckItems.length > 0) {
						toRefundOrderCheckItems.forEach(function(item, index) {
							if (item.tradeOrderOid == row.tradeOrderOid) {
								indexOf = index
							}
						})
					}
					if (indexOf < 0) {
						toRefundOrderCheckItems.push(row)
					}
				},
				onUncheck: function(row) {
					toRefundOrderCheckItems.splice(toRefundOrderCheckItems.indexOf(row), 1)
				},
				onCheckAll: function(rows) {
					toRefundOrderCheckItems = rows.map(function(item) {
						return item
					})
				},
				onUncheckAll: function() {
					toRefundOrderCheckItems = []
				},
				columns: [
					{
						checkbox: true,
						align: 'center'
					},
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions1.offset
						}
					},
					{
						field: 'orderCode',
						align: 'right'
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
					{
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#dataTable1').bootstrapTable('getData').length - 1,
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
							return util.table.formatter.generateButton(buttons, 'dataTable1');
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
			
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.gacha.tradeorder, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							orderStatus: 'refunded',
							orderCode: pageOptions2.orderCode,
							createTimeBegin: pageOptions2.createTimeBegin,
							createTimeEnd: pageOptions2.createTimeEnd
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
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions1.offset
						}
					},
					{
						field: 'orderCode',
						align: 'right'
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
					{
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#dataTable2').bootstrapTable('getData').length - 1,
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
							return util.table.formatter.generateButton(buttons, 'dataTable2');
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
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));
			
			$("#refundpart").on('click', function(){
				if (toRefundOrderCheckItems.length === 0) {
					window.alert('请选择记录退款')
					return
				}
				http.post(config.api.gacha.refundpart, {
					data: JSON.stringify(toRefundOrderCheckItems.map(function(item) {
						return item.tradeOrderOid
					}))
				}, function(result) {
					$("#dataTable1").bootstrapTable('refresh')
					$("#dataTable2").bootstrapTable('refresh')
				})
			})
			
			$("#refundall").on('click', function(){
				http.post(config.api.gacha.refundall, {},
				function (rlt) {
					$("#dataTable1").bootstrapTable('refresh')
					$("#dataTable2").bootstrapTable('refresh')
				})
			})
			
			function getQueryParams1 (val) {
				var form = document.searchForm1
				pageOptions1.size = val.limit
				pageOptions1.number = parseInt(val.offset / val.limit) + 1
				pageOptions1.offset = val.offset
				pageOptions1.orderCode = form.orderCode.value
				pageOptions1.createTimeBegin = form.createTimeBegin.value
				pageOptions1.createTimeEnd = form.createTimeEnd.value
				return val
			}
			
			function getQueryParams2 (val) {
				var form = document.searchForm2
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				pageOptions2.offset = val.offset
				pageOptions2.orderCode = form.orderCode.value
				pageOptions2.createTimeBegin = form.createTimeBegin.value
				pageOptions2.createTimeEnd = form.createTimeEnd.value
				return val
			}
		}
	}
})
