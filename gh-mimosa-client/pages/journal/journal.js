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
		name: 'journal',
		init: function() {
			var pageOptions = {
					number: 1,
					size: 10,
					interfaceName: ''
				}
			var tableConfig = {
					ajax: function(origin) {
						http.post(
							config.api.logmng, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									interfaceName: pageOptions.interfaceName
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
						$$.detailAutoFix($('#interfaceDetailModal'), row);
						// errorMessage错误有时会包含html标签，影响整体样式显示
						var temp = document.createElement("div");
						temp.innerHTML = row.errorMessage;
						$('#errorMessage').html(temp.innerText);
						$('#interfaceDetailModal').modal('show');
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return (pageOptions.number - 1) * pageOptions.size + index + 1
						}
					}, {
						field: 'interfaceName',
						class:"table_title_detail"
					}, {
						field: 'errorCode',
						class: 'align-right'
					}, 
//					{
//						field: 'errorMessage',
//						formatter: function(val, row, index) {
//							var div = document.createElement("div");
//							var text = document.createTextNode(val);
//							div.appendChild(text);
//							return div.innerHTML;
//						}
//					}, 
					{
						field: 'sendedTimes',
						class: 'align-right'
					}, {
						field: 'limitSendTimes',
						class: 'align-right'
						
					}, {
						field: 'nextNotifyTime',
						class: 'align-right'
					}, 
//					{
//						field: 'sendObj'
//					}, 
					{
						field: 'createTime',
						class: 'align-right'
					}, {
						field: 'updateTime',
						class: 'align-right'
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
				pageOptions.interfaceName = form.interfaceName.value.trim()
				return val
			}
		}
	}
})