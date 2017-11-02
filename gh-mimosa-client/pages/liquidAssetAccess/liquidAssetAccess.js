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
		name: 'liquidAssetAccess',
		init: function() {
			// 分页配置
			var pageOptions = {
					number: 1,
					size: 10
				}
				// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.liquidAsset.accessList, {
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
					onClickCell: function(field, value, row, $element) {
						switch (field) {
							case 'name':
								toDetail(value, row);
						}
					},
					columns: [{
						field: 'sn',
						align: 'left'
						
					}, {
						field: 'name',
						align: 'left',
						class: 'table_title_detail'
					}, {
						field: 'type',
						align: 'left',
						formatter: function(val) {
							if (val == "CASHTOOLTYPE_01") {
								return "货币基金";
							} else if (val == "CASHTOOLTYPE_02") {
								return "协定存款";
							} else {
								return "--";
							}
						}
					}, {
						field: 'createTime',
						align: 'right'
					}, {
						field: 'riskLevel',
						align: 'left',
						formatter: function(val) {
							return formatRiskLevel(val);
						}
					}, {
						field: 'state',
						align: 'left',
						formatter: function(val) {
							return util.enum.transform('cashtoolStates', val);
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = '';
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#liquidAssetAccessTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '通过',
									class: 'item-checkpass',
									isRender: true,
									type: 'button'
								}, {
									text: '驳回',
									class: 'item-checkreject',
									isRender: true,
									type: 'button'
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'liquidAssetAccessTable');
						},
						events: {
							'click .item-checkpass': function(e, value, row) {
								$("#confirmTitle").html("确定审核通过？")
								$$.confirm({
									container: $('#doConfirm'),
									trigger: this,
									accept: function() {
										check(config.api.liquidAsset.checkpass, row.oid);
									}
								})
							},
							'click .item-checkreject': function(e, value, row) {
								$("#confirmTitle").html("确定预审驳回？")
								$$.confirm({
									container: $('#doConfirm'),
									trigger: this,
									accept: function() {
										check(config.api.liquidAsset.checkreject, row.oid);
									}
								})
							}
						}
					}]
				}
				// 初始化表格
			$('#liquidAssetAccessTable').bootstrapTable(tableConfig)

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				return val
			}
		}
	}

	function check(url, oid) {
		$.ajax({
			type: "post",
			url: url,
			data: {
				oid: oid
			},
			async: true,
			success: function(result) {
				if (result.errorCode == 0) {
					$('#liquidAssetAccessTable').bootstrapTable('refresh');
				} else {
					console.log(JSON.stringify(result));
				}
			}
		});
	}

	/**
	 * 格式化风险等级
	 * @param {Object} value
	 * @param {Object} row
	 */
	function formatRiskLevel(val) {
		if (val == 'R1') {
			return 'R1 - 谨慎型'
		} else if (val == 'R2') {
			return 'R2 - 稳健型'
		} else if (val == 'R3') {
			return 'R3 - 平衡型'
		} else if (val == 'R4') {
			return 'R4 - 进取型'
		} else if (val == 'R5') {
			return 'R5 - 激进型'
		}
	}

	//显示标的详情
	function toDetail(value, row) {
		http.post(config.api.liquidAsset.detailQuery, {
			data: {
				oid: row.oid
			},
			contentType: 'form'
		}, function(result) {
			var data = result;
			data.riskLevel = formatRiskLevel(data.riskLevel); // 格式化风险等级
			if (data.type == "CASHTOOLTYPE_01") {
				$$.detailAutoFix($('#detLiquidAssetForm'), data); // 自动填充详情
				$$.formAutoFix($('#detLiquidAssetForm'), data); // 自动填充表单
				$('#liquidAssetDetailModal').modal('show');
			} else if (data.type == "CASHTOOLTYPE_02") {
				data.baseYield = util.safeCalc(data.baseYield, '*', 100, 2);
				data.baseAmount = util.safeCalc(data.baseAmount, '/', 10000, 6);
				data.yield = util.safeCalc(data.yield, '*', 100, 2);
				$$.detailAutoFix($('#detLiquidAsset_treatyForm'), data); // 自动填充详情
				$$.formAutoFix($('#detLiquidAsset_treatyForm'), data); // 自动填充表单
				$('#LiquidAsset_treatyDetailModal').modal('show');
			}
		})
	}
})