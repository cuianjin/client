/**
 * 产品存续期管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'productDuration',
		init: function() {
			// js逻辑写在这里
			/**
			 * 用于存储表格checkbox选中的项
			 */
			var checkItems = []
			var selectProductOid

			/**
			 * 用于存储选择的渠道checkbox选中的项
			 */
			var checkChannels = []
			
			/**
			 * 数据表格分页、搜索条件配置
			 */
			var pageOptions = {
				number: 1,
				size: 10,
				name: '',
				type: '',
				status: ''
			}
			
			// 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.name = form.name.value.trim()
				pageOptions.type = form.type.value.trim()
				pageOptions.status = form.status.value.trim()
				return val
			}

			/**
			 * 数据表格配置
			 */
			var tableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.product.duration.productDurationList, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								name: pageOptions.name,
								type: pageOptions.type,
								status: pageOptions.status
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
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'name':
							qryInfo(value,row)
							break
					}
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (pageOptions.number - 1) * pageOptions.size + index + 1
					}
				}, {
					field: 'code',
				}, {
					field: 'name',
					class:"table_title_detail"
				}, {
					field: 'typeName',
				}, {
					field: 'durationPeriod',
					align: 'right',
					formatter: function(val, row, index) {
						var typeOid = row.typeOid;
						if (typeOid == "PRODUCTTYPE_01") {
							return row.durationPeriod;
						} else {
							return "不固定";
						}
					}
				}, {
					field: 'expAror',
					align: 'right',
					formatter: function(val, row, index) {
						if (row.expArorSec != null && row.expAror != row.expArorSec) {
							return row.expAror + "~" + row.expArorSec;
						}
						return row.expAror;
					}
				}, {
					field: 'raisedTotalNumber',
					align: 'right',
					class: 'decimal0',
					formatter: function(val, row, index) {
						var typeOid = row.typeOid;
						return row.raisedTotalNumber
					}
				}, {
					field: 'hqla',
					align: 'right',
					class: 'decimal2',
					formatter: function(val, row, index) {
						return val;
					}
				}, {
					field: 'status',
					formatter: function(val, row, index) {
						switch (val) {
							case 'CREATE':
								return '新建'
							case 'UPDATE':
								return '修改'
							case 'AUDITING':
								return '<span class="text-blue">审核中</span>'
							case 'AUDITFAIL':
								return '<span class="text-red">审核不通过</span>'
							case 'AUDITPASS':
								return '<span class="text-green">审核通过</span>'
							case 'REVIEWFAIL':
								return '<span class="text-red">复核不通过</span>'
							case 'REVIEWPASS':
								return '<span class="text-yellow">复核通过</span>'
							case 'NOTSTARTRAISE':
								return '<span class="text-blue">未开始募集</span>'
							case 'RAISING':
								return '<span class="text-blue">募集中</span>'
							case 'RAISEEND':
								return '<span class="text-red">募集结束</span>'
							case 'RAISEFAIL':
								return '<span class="text-gray">募集失败</span>'
							case 'NOTSTARTDURATION':
								return '<span class="text-blue">存续期未开始</span>'
							case 'DURATIONING':
								return '存续期'	
							case 'DURATIONEND':
								return '<span class="text-red">存续期结束</span>'
							case 'CLEARING':
								return '<span class="text-orange">清算中</span>'
							case 'CLEARED':
								return '<span class="text-green">已清算</span>'
							default:
								return '-'
						}
					}
				}, {
					field: 'assetPoolName',
				}, {
					field: 'isOpenPurchase',
					formatter: function(val) {
						if (val == 'YES') {
							return '开启';
						} else if (val == 'NO') {
							return '关闭';
						} else {
							return null;
						}
					}
				}, {
					field: 'isOpenRemeed',
					formatter: function(val) {
						if (val == 'YES') {
							return '开启';
						} else if (val == 'NO') {
							return '关闭';
						} else {
							return null;
						}
					}
				}, {
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '转到工作台',
							type: 'button',
							class: 'item-workbench',
							isRender: true
						}];
						return util.table.formatter.generateButton(buttons, 'productDurationTable');
					},
					events: {
						'click .item-workbench': function(e, val, row) {
							util.nav.dispatch('productDetail', 'id=' + row.oid)
						}
					}
				}, ]
			}

			/**
			 * 数据表格初始化
			 */
			$('#productDurationTable').bootstrapTable(tableConfig)

			/**
			 * 搜索表单初始化
			 */
			$$.searchInit($('#searchForm'), $('#productDurationTable'))

			// 详情附件表格配置
			var productDetailInvestFileTableConfig = {
					columns: [{
						field: 'name',
					}, {
						field: 'operator',
					}, {
						field: 'createTime',
						align: 'right'
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
								console.log(row);
								location.href = row.furl + '?realname=' + row.name
							}
						}
					}]
				}
				// 详情投资协议书表格初始化
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
					align: 'right'
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
							location.href = row.furl + '?realname=' + row.name
						}
					}
				}]
			}

			/**
			 * 详情信息服务协议表格初始化
			 */
			$('#productDetailServiceFileTable').bootstrapTable(productDetailServiceFileTableConfig)

			// 详情附件表格配置
			var productDetailFileTableConfig = {
					columns: [{
						field: 'name',
					}, {
						field: 'operator',
					}, {
						field: 'createTime',
						align: 'right'
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
								location.href = row.furl + '?realname=' + row.name
							}
						}
					}]
				}
				// 详情附件表格初始化
			$('#productDetailFileTable').bootstrapTable(productDetailFileTableConfig)

			// 产品详情设置奖励收益表格配置
			var productRewardTableConfig = {
					columns: [{
						field: 'level',
					}, {
						field: 'startDate',
						formatter: function(val, row, index) {
							if (row.endDate != null && row.endDate != "") {
								return row.startDate + "天" + "-" + row.endDate + "天";
							} else {
								return "大于等于" + row.startDate + "天";
							}

						}
					}, {
						field: 'ratio',
					}, ]
				}
				// 设置奖励收益表格初始化
			$('#productRewardTable').bootstrapTable(productRewardTableConfig)


			/**
			 * 数据表格配置
			 */
			var channelsTableConfig = {
				columns: [{
					checkbox: true,
					field: 'selectStatus',
					align: 'center',
					formatter: function(val, row, index) {
						var selectStatus = row.selectStatus
						if (true == selectStatus) {
							if (checkChannels.indexOf(row) < 0) {
								checkChannels.push(row)
							}
						}
						return selectStatus
					}
				}, {
					field: 'channelId',
					align: 'center'
				}, {
					field: 'channelName',
					align: 'center'
				}, {
					align: 'center',
					field: 'channelStatus',
					formatter: function(val, row, index) {
						var channelStatus = row.channelStatus
						if ("on" == channelStatus) {
							return "已启用"
						} else if ("off" == channelStatus) {
							return "已停用"
						}
					}
				}, {
					field: 'channelFee',
					align: 'center',
					formatter: function(val, row, index) {
						var channelFee = row.channelFee
						if (channelFee != null && channelFee != "") {
							return channelFee + "%"
						}
						return "";
					}
				}],
				/**
				 * 单选按钮选中一项时
				 * @param {Object} row
				 */
				onCheck: function(row) {
					if (checkChannels.indexOf(row) < 0) {
						checkChannels.push(row)
					}
				},
				/**
				 * 单选按钮取消一项时
				 * @param {Object} row
				 */
				onUncheck: function(row) {
					checkChannels.splice(checkChannels.indexOf(row), 1)
				},
				/**
				 * 全选按钮选中时
				 * @param {Object} rows
				 */
				onCheckAll: function(rows) {
					checkChannels = rows.map(function(item) {
						return item
					})
				},
				/**
				 * 全选按钮取消时
				 */
				onUncheckAll: function() {
					checkChannels = []
				}
			}

			/**
			 * 数据表格初始化
			 */
			$('#productChooseChannelTable').bootstrapTable(channelsTableConfig)

			/**
			 * 选择渠道点击确定按钮事件
			 */
			$('#doChooseChannel').on('click', function() {
				/**
				 * 获取id数组
				 */
				var channelOids = checkChannels.map(function(item) {
					return item.oid
				})

				/**
				 * 提交数组
				 */
				http.post(
					config.api.saveProductChannel, {
						data: {
							productOid: selectProductOid,
							channelOid: JSON.stringify(channelOids)
						},
						contentType: 'form',
					},
					function(result) {
						checkChannels = []
						$('#channelModal').modal('hide')
						$('#productDurationTable').bootstrapTable('refresh')
					}
				)

			})
			
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