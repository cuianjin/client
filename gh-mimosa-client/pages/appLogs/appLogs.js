/**
 * 复核列表
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'appLogs',
		init: function() {
			var pageOptions = {
					number: 1,
					size: 10,
					uid: ''
				}
			var tableConfig = {
					ajax: function(origin) {
						http.post(
							config.api.appLogmng, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									uid: pageOptions.uid
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
						field: 'errorCode'
					}, {
						field: 'errorMessage'
					}, {
						field: 'uid'
					}, {
						field: 'reqUri'
					}, {
						field: 'params'
					}, {
						field: 'createTime'
					}]
				}
				// 数据表格初始化
			$('#journalTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#journalTable'))
			
			// 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.uid = form.uid.value.trim()
				return val
			}
		}
	}
})