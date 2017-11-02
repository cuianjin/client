// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'couponLog',
			init: function() {
				var _this = this;
				_this.pagesInit();
			},
			pagesInit: function() {
				var _this = this;
				// 分页配置
				var pageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					start: '',
					finish:'',
				}
				// 数据表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.findCouponLog, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									begin: pageOptions.start,
									end: pageOptions.finish
								},
								contentType: 'form'
							}, function(rlt) {
								origin.success(rlt)
							})
						},
						idField: 'oid',
						pagination: true,
						sidePagination: 'server',
						pageList: [10, 20, 30, 50, 100],
						queryParams: getQueryParams,
						columns: [{
							width: 30,
							align: 'center',
							formatter: function(val, row, index) {
								return pageOptions.offset + index + 1
							}
						}, {
							field: 'status'
						}, {
							field: 'type'
						}, {
							
							field: 'sendedTimes',
							align:'right'
						}, {
							
							field: 'limitSendTimes',
							align:'right'
						}, {
							align: 'right',
							field: 'nextNotifyTime'
						}, {
							field: 'userOid'
						}, {
							field: 'createTime',
							align: 'right',
							formatter: function(val, row, index) {
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}
						}, {
							field: 'updateTime',
							align: 'right',
							formatter: function(val, row, index) {
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}
						}]
					}
					// 初始化数据表格
				$('#dataTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#dataTable'));

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.start = form.start.value.trim()
					pageOptions.finish = form.finish.value.trim()
					return val
				}
			}
		}
	})