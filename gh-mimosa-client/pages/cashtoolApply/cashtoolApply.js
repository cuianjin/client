/**
 * 现金管理类工具申请
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'cashtoolApply',
		init: function() {
			// js逻辑写在这里
			// 分页配置
			var pageOptions = {
					number: 1,
					size: 10,
					ticker: '',
					secShortName: '',
					etfLof: '',
					state: ''
				}
				// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.cashtoolListQuery, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								ticker: pageOptions.ticker,
								secShortName: pageOptions.secShortName,
								etfLof: pageOptions.etfLof,
								state: pageOptions.state
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
						visible: false,
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
								text: '编辑',
								type: 'button',
								class: 'item-edit',
								isRender: row.state == 'waitPretrial' || row.state == 'reject'
							}, {
								text: '提交审核',
								type: 'button',
								class: 'item-check',
								isRender: row.state == 'waitPretrial' || row.state == 'reject'
							}, {
								text: '作废',
								type: 'button',
								class: 'item-invalid',
								isRender: row.state != 'invalid'
							}];
							return util.table.formatter.generateButton(buttons, 'cashToolApplyTable');
						},
						events: {
							'click .item-invalid': function(e, value, row) {
								$("#confirmTitle").html("确定作废现金管理类工具？")
								$$.confirm({
									container: $('#doConfirm'),
									trigger: this,
									accept: function() {
										http.post(config.api.cashToolInvalid, {
											data: {
												oid: row.oid
											},
											contentType: 'form',
										}, function(result) {
											$('#cashToolApplyTable').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-edit': function(e, value, row) {
								util.form.reset($('#editCashToolForm')); // 先清理表单
								http.post(config.api.cashtoolDetQuery, {
									data: {
										oid: row.oid
									},
									contentType: 'form'
								}, function(result) {
									var data = result.data;
									data.guarRatio = data.guarRatio * 100.0
									//								$$.detailAutoFix($('#editTargetForm'), data); // 自动填充详情
									$$.formAutoFix($('#editCashToolForm'), data); // 自动填充表单
									$('#editCashToolModal').modal('show');
								})
							},
							'click .item-check': function(e, value, row) {
								$("#confirmTitle").html("确定提交预审？")
								$$.confirm({
									container: $('#doConfirm'),
									trigger: this,
									accept: function() {
										http.post(config.api.cashToolExamine, {
											data: {
												oid: row.oid
											},
											contentType: 'form',
										}, function(result) {
											$('#cashToolApplyTable').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-detail': function(e, value, row) {
								http.post(config.api.cashtoolDetQuery, {
									data: {
										oid: row.oid
									},
									contentType: 'form'
								}, function(result) {
									var data = result.data;
									if (data.guarRatio)
										data.guarRatio = data.guarRatio * 100.0 + '%'; //保本比例格式化
									$$.detailAutoFix($('#detCashToolForm'), data); // 自动填充详情
									$$.formAutoFix($('#detCashToolForm'), data); // 自动填充表单
									$('#cashToolDetailModal').modal('show');
								})
							}
						}
					}]
				}
				// 初始化表格
			$('#cashToolApplyTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#cashToolSearchForm'), $('#cashToolApplyTable'))
				// 初始化表单验证
			util.form.validator.init($("#addCashToolForm"));
			util.form.validator.init($("#editCashToolForm"));
			// 新建标的按钮点击事件
			$('#cashToolAdd').on('click', function() {
					$('#addCashToolForm').resetForm();
					$('#addCashToolModal').modal('show')
				})
				// 新建底层资产按钮点击事件
			$('#assetAdd').on('click', function() {
					$('#addAssetModal').modal('show')
				})
				//新建现金管理工具按钮
			$('#saveCashTool').on('click', function() {
					saveCashTool();
				})
				//编辑现金管理工具按钮
			$('#editCashTool').on('click', function() {
					editCashTool();
				})
				//新建 是否保本选项判断
			$('#addIsGuarFund').change(function() {
					if ($(this).val() == 'Y') {
						$('#addGuarPeriod').removeAttr("readonly")
						$('#addGuarRatio').removeAttr("readonly")
					} else {
						$('#addGuarPeriod').val('');
						$('#addGuarPeriod').attr("readonly", "readonly")
						$('#addGuarRatio').val('');
						$('#addGuarRatio').attr("readonly", "readonly")
					}
				})
				//编辑 是否保本选项判断
			$('#editIsGuarFund').change(function() {
				if ($(this).val() == 'Y') {
					$('#editGuarPeriod').removeAttr("readonly")
					$('#editGuarRatio').removeAttr("readonly")
				} else {
					$('#editGuarPeriod').val('');
					$('#editGuarPeriod').attr("readonly", "readonly")
					$('#editGuarRatio').val('');
					$('#editGuarRatio').attr("readonly", "readonly")
				}
			})

			function getQueryParams(val) {
				var form = document.cashToolSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.ticker = form.ticker.value.trim();
				pageOptions.secShortName = form.secShortName.value.trim();
				pageOptions.etfLof = form.etfLof.value.trim();
				pageOptions.state = form.state.value.trim();
				return val
			}
		}
	}

	function saveCashTool() {
		if (!$('#addCashToolForm').validator('doSubmitCheck')) return
		$('#addCashToolForm').ajaxSubmit({
			url: config.api.cashtoolAdd,
			//			contentType : 'application/json',
			success: function(result) {
				util.form.reset($('#addCahsToolForm'));// 先清理表单
				$('#addCashToolModal').modal('hide');
				$('#cashToolApplyTable').bootstrapTable('refresh');
			}
		})
	}

	function editCashTool() {
		if (!$('#editCashToolForm').validator('doSubmitCheck')) return
		$('#editCashToolForm').ajaxSubmit({
			url: config.api.cashToolEdit,
			success: function(result) {
				util.form.reset($('#editCashToolForm'));// 先清理表单
				$('#editCashToolModal').modal('hide');
				$('#cashToolApplyTable').bootstrapTable('refresh');
			}
		})
	}

})