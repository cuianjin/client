/**
 * 现金管理类工具审查
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'cashtoolAccess',
		init: function() {
			// 分页配置
			var pageOptions = {
					number: 1,
					size: 10
				}
					// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.cashToolAccessList, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size
							},
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					},
					pageNumber: pageOptions.number,
					pageSize: pageOptions.size,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getQueryParams,
					columns: [{
						field: 'ticker'
					}, {
						field: 'secShortName'
					}, {
						field: 'etfLof',
						formatter: function(val) {
							return util.enum.transform('CASHTOOLTYPE', val);
						}
					}, {
						field: 'dividendType',
						visible: false
					}, {
						field: 'circulationShares',
						visible: false
					}, {
						field: 'perfBenchmark'
					}, {
						field: 'riskLevel'
					}, {
						field: 'state',
						formatter: function(val) {
							return util.enum.transform('cashtoolStates', val);
						}
					}, {
						align: 'center',
						formatter: function(val, row) {
							var buttons = [{
								text: '查看详情',
								type: 'button',
								class: 'item-detail',
								isRender: true
							}, {
								text: '审核',
								type: 'button',
								class: 'item-check',
								isRender: true
							}];
							return util.table.formatter.generateButton(buttons, 'targetAccessTable');
						},
						events: {
							'click .item-check': function(e, value, row) {
								util.form.reset($('#accessFrom')); // 先清理表单
								$("#coid").val(row.oid)
								$('#accessModal').modal('show');
							},
							'click .item-detail': function(e, value, row) {
								http.post(config.api.cashtoolDetQuery, {
									data: {
										oid: row.oid
									},
									contentType: 'form'
								}, function(result) {
									var data = result.data;
										$$.detailAutoFix($('#detCashToolForm'), data); // 自动填充详情
										$$.formAutoFix($('#detCashToolForm'), data); // 自动填充表单
										$('#cashToolDetailModal').modal('show');
								})
							}
						}
					}]
				}
				// 初始化表格
			$('#targetAccessTable').bootstrapTable(tableConfig)

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				return val
			}

			$('#checkpass').on('click', function() {
				$("#confirmTitle").html("确定审核通过？")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						check(config.api.cashToolCheckpass);
					}
				})
			})
			$('#checkreject').on('click', function() {
				$("#confirmTitle").html("确定预审驳回？")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						check(config.api.cashToolCheckreject);
					}
				})
			})
		}
	}

	function check(url) {
		$('#accessFrom').ajaxSubmit({
			url: url,
			success: function(result) {
				util.form.reset($('#accessFrom'));// 先清理表单
				$('#accessModal').modal('hide');
				$('#targetAccessTable').bootstrapTable('refresh');
			}
		})
	}
})