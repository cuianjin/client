/**
 * 系统通知
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'sysInfo',
		init: function () {
			var pageOptions = {
				number: 1,
				size: 10,
				offset: 0,
				informCode: '',
				informType: '',
				createTimeBegin: '',
				createTimeEnd: ''
			}
			var tableConfig = {
				ajax: function (origin) {
					http.post(config.api.infoQuery, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							informCode: pageOptions.informCode,
							informType: pageOptions.informType,
							createTimeBegin: pageOptions.createTimeBegin,
							createTimeEnd: pageOptions.createTimeEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions.number,
				pageSize: pageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				columns: [
					{
						width: 30,
						align: 'center',
						formatter: function (val, row, index) {
							return index + 1 + pageOptions.offset
						}
					},
					{
						field: 'informCode'
					},
					{
						field: 'informTypeDisp'
					},
					{
						field: 'createTime',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'informContent'
					}
				]
			}
			
			$("#dataTable").bootstrapTable(tableConfig)
			
			$$.searchInit($('#searchForm'), $('#dataTable'))
			
			function getQueryParams (val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.offset = val.offset
				pageOptions.informCode = form.informCode.value
				pageOptions.informType = form.informType.value
				pageOptions.createTimeBegin = form.createTimeBegin.value
				pageOptions.createTimeEnd = form.createTimeEnd.value
				return val
			}
		}
	}
})