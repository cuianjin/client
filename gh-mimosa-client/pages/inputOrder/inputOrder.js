/**
 * 审核列表
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'inputOrder',
		init: function() {

			/**
			 * 数据表格分页、搜索条件配置
			 */

			var pageOptions = {
				number: 1,
				size: 10,
				productName: '',
				channelName: '',
				orderType: ''
			}

			/**
			 * 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			 * @param {Object} val
			 */
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.productName = form.productName.value.trim()
				pageOptions.channelName = form.channelName.value.trim()
				pageOptions.orderType = form.orderType.value.trim()
				return val
			}


			/**
			 * 数据表格配置
			 */
			var tableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.gacha.tradeorder, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								orderStatus: "accepted",
								productName: pageOptions.productName,
								channelName: pageOptions.channelName,
								orderType: pageOptions.orderType
							},
							contentType: 'form'
						},
						function(rlt) {
							origin.success(rlt)
						}
					)
				},
				pageNumber: pageOptions.number,
				pageSize: pageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (pageOptions.number - 1) * pageOptions.size + index + 1
					}
				}, {
					field: 'orderCode'
				}, {
					field: 'phoneNum',
					align: 'right'
				}, 
//				{
//					field: 'productOid',
//				}, 
				{
					field: 'productName',
				}, {
					field: 'channelName',
				}, {
					field: 'orderTypeDisp',
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
					field: 'orderTime',
					align: 'right'
				}, {
					field: 'publisherClearStatus',
					formatter: function(val) {
						var className = ''
						var orderStatus = ''
						if (val === 'toClear') {
							orderStatus = '待清算'
							className = 'text-yellow'
						} else if (val === 'clearing') {
							orderStatus = '清算中'
							className = 'text-blue'
						} else if (val === 'cleared') {
							orderStatus = '已清算'
							className = 'text-green'
						} else {
							return '--';
						}
						return '<span class="' + className + '">' + orderStatus + '</span>'
					}
				}, {
					field: 'publisherConfirmStatus',
					formatter: function(val) {
						var className = ''
						var orderStatus = ''
						if (val === 'toConfirm') {
							orderStatus = '待交收'
							className = 'text-yellow'
						} else if (val === 'confirming') {
							orderStatus = '交收中'
							className = 'text-blue'
						} else if (val === 'confirmed') {
							orderStatus = '已交收'
							className = 'text-green'
						} else if (val === 'confirmFailed') {
							orderStatus = '交收失败'
							className = 'text-red'
						} else {
							return '--';
						}
						return '<span class="' + className + '">' + orderStatus + '</span>'
					}
				}, {
					field: 'publisherCloseStatus',
					formatter: function(val) {
						var className = ''
						var orderStatus = ''
						if (val === 'toClose') {
							orderStatus = '待结算 '
							className = 'text-yellow'
						} else if (val === 'closing') {
							orderStatus = '结算中'
							className = 'text-blue'
						} else if (val === 'closed') {
							orderStatus = '已结算'
							className = 'text-green'
						} else if (val === 'closeSubmitFailed') {
							orderStatus = '结算申请失败'
							className = 'text-purple'
						} else if (val === 'closePayFailed') {
							orderStatus = '结算支付失败'
							className = 'text-indigo'
						} else {
							return '--';
						}
						return '<span class="' + className + '">' + orderStatus + '</span>'
					}
				}, {
					align: 'center',
					width: 200,
					formatter: function (val, row, index) {
						var buttons = [{
							text: '操作',
							type: 'buttonGroup',
//							isCloseBottom: index >= $('#inputOrderTable').bootstrapTable('getData').length - 1,
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
						return util.table.formatter.generateButton(buttons, 'inputOrderTable');
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

			/**
			 * 数据表格初始化
			 */
			$('#inputOrderTable').bootstrapTable(tableConfig)

			/**
			 * 搜索表单初始化
			 */
			$$.searchInit($('#searchForm'), $('#inputOrderTable'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));

		}
	}
})