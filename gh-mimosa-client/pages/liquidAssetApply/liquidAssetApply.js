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
		name: 'liquidAssetApply',
		init: function() {
			// js逻辑写在这里
			// 分页配置
			var pageOptions = {
				number: 1,
				size: 10,
				sn: '',
				name: '',
				type: '',
				state: ''
			}
			// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.liquidAsset.list, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							sn: pageOptions.sn,
							name: pageOptions.name,
							type: "CASHTOOLTYPE_01"
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
				queryParams: getFundQueryParams,
				onClickCell: function(field, value, row, $element) {
					switch(field) {
						case 'sn':
							toDetail(value, row);
					}
				},
				columns: [{
					field: 'sn',
					align: 'left',
					class: 'table_title_detail'
				}, {
					field: 'name',
					align: 'left',
				}, {
					field: 'perfBenchmark',
					align: 'right'
				}, {
					field: 'riskLevel',
					align: 'right',
					formatter: function(val) {
						return formatRiskLevel(val);
					}
				}, {
					field: 'state',
					align: 'center',
					formatter: function(val, row) {
						if(val == "waitPretrial") {
							return "未审核";
						} else if(val == "pretrial") {
							return "审核中";
						} else if(val == "collecting") {
							return "审核通过";
						} else if(val == "reject") {
							return "驳回";
						} else if(val == "invalid") {
							return "作废";
						} else {
							return "--";
						}
					}
				}, {
					align: 'center',
					formatter: function(val, row, index) {
						var buttons;
						if(row.state != 'waitPretrial' && row.state != 'reject') {
							buttons = [{}]
						} else {
							var buttons = [{
								text: '提交审核',
								type: 'button',
								isRender: row.state == 'waitPretrial' || row.state == 'reject',
								class: 'item-check'
							}]
						}
						var format = util.table.formatter.generateButton(buttons, 'liquidAssetFundApplyTable');
						if(row.state == 'waitPretrial' || row.state == 'reject') {
							format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit"></span>';
						}
						if(row.state != 'invalid') {
							format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-invalid"></span>';
						}
						return format
					},
					events: {
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html("确定作废货币基金？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.liquidAsset.invalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#liquidAssetFundApplyTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-edit': function(e, value, row) {
							util.form.reset($('#editLiquidAssetForm')); // 先清理表单
							http.post(config.api.liquidAsset.detailQuery, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result;
								$$.formAutoFix($('#editLiquidAssetForm'), data); // 自动填充表单
								$('#editLiquidAssetModal').modal('show');
							})
						},
						'click .item-check': function(e, value, row) {
							$("#confirmTitle").html("确定提交预审？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.liquidAsset.examine, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#liquidAssetFundApplyTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}
			var tableTreatyConfig = {
				ajax: function(origin) {
					http.post(config.api.liquidAsset.list, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							sn: pageOptions.sn,
							name: pageOptions.name,
							type: "CASHTOOLTYPE_02"
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
				queryParams: getTreatyQueryParams,
				onClickCell: function(field, value, row, $element) {
					switch(field) {
						case 'sn':
							toDetail(value, row);
					}
				},
				columns: [{
					field: 'sn',
					align: "left",
					class: 'table_title_detail'
				}, {
					field: 'name',
					align: 'left'
				}, {
					field: 'baseAmount',
					align: "right",
					formatter: function(val, row) {
						return util.safeCalc(val, '/', 10000, 2);
					}
				}, {
					field: 'baseYield',
					align: "right",
					formatter: function(val) {
						return util.safeCalc(val, '*', 100, 2);
					}
				}, {
					field: 'yield',
					align: "right",
					formatter: function(val, row) {
						return util.safeCalc(val, '*', 100, 2);
					}
				}, {
					field: 'state',
					align: 'center',
					formatter: function(val, row) {
						if(val == "waitPretrial") {
							return "未审核";
						} else if(val == "pretrial") {
							return "审核中";
						} else if(val == "collecting") {
							return "审核通过";
						} else if(val == "reject") {
							return "驳回";
						} else if(val == "invalid") {
							return "作废";
						} else {
							return "--";
						}
					}
				}, {
					align: 'center',
					formatter: function(val, row, index) {
						var buttons;
						if(row.state != "waitPretrial" && row.state != "reject") {
							buttons = [{}]
						} else {
							buttons = [{
								text: '操作',
								type: 'buttonGroup',
								isRender: true,
								isCloseBottom: index >= $('#liquidAssetTreatyApplyTable').bootstrapTable('getData').length - 1,
								sub: [{
									text: '提交审核',
									class: 'item-check',
									isRender: row.state == 'waitPretrial' || row.state == 'reject'
								}]
							}]
						}
						var format = util.table.formatter.generateButton(buttons, 'liquidAssetTreatyApplyTable');
						if(row.state == 'waitPretrial' || row.state == 'reject') {
							format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit"></span>';
						}
						if(row.state != 'invalid') {
							format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-invalid"></span>';
						}
						return format
					},
					events: {
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html("确定作废协定存款？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.liquidAsset.invalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#liquidAssetTreatyApplyTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-edit': function(e, value, row) {
							util.form.reset($('#editLiquidAssetForm')); // 先清理表单
							http.post(config.api.liquidAsset.detailQuery, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result;
								data.baseAmount = util.safeCalc(data.baseAmount, '/', 10000, 2);
								data.baseYield = util.safeCalc(data.baseYield, '*', 100, 2);
								data.yield = util.safeCalc(data.yield, '*', 100, 2);
								$$.formAutoFix($('#editLiquidAssetForm_treaty'), data); // 自动填充表单
								$('#editLiquidAssetModal_treaty').modal('show');
							})
						},
						'click .item-check': function(e, value, row) {
							$("#confirmTitle").html("确定提交预审？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.liquidAsset.examine, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#liquidAssetTreatyApplyTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}
			// 初始化表格
			$('#liquidAssetFundApplyTable').bootstrapTable(tableConfig);
			$('#liquidAssetTreatyApplyTable').bootstrapTable(tableTreatyConfig);
			// 搜索表单初始化
			$$.searchInit($('#liquidAssetFundSearchFrom'), $('#liquidAssetFundApplyTable'));
			$$.searchInit($('#liquidAssetTreatySearchFrom'), $('#liquidAssetTreatyApplyTable'));

			// 初始化表单验证-新建
			util.form.validator.init($("#addLiquidAsset_fundForm")); //货币基金
			util.form.validator.init($("#addLiquidAsset_treatyForm")); //协定存款

			//初始化表单验证-编辑
			util.form.validator.init($("#editLiquidAssetForm")); //货币基金
			util.form.validator.init($("#editLiquidAssetForm_treaty")); //协定存款

			// 新建标的按钮点击事件
			// 新建标的按钮点击事件
			$('#liquidAssetAdd').on('click', function() {
				var tab_switch = $("#tab_switch").val();
				if(tab_switch == "0") {
					$('#addLiquidAsset_fundForm').resetForm();
					$('#addLiquidAssetModal_fund').modal('show');
				} else if(tab_switch == "1") {
					$('#addLiquidAsset_treatyForm').resetForm();
					$('#addLiquifdAssetModal_treaty').modal('show');
				}
			})
			//保存货币基金
			$('#saveLiquidAsset').on('click', function() {
				if(!$('#addLiquidAsset_fundForm').validator('doSubmitCheck')) return
				saveLiquidAsset();
			});
			//编辑货币基金
			$('#editLiquidAsset').on('click', function() {
				if(!$('#editLiquidAssetForm').validator('doSubmitCheck')) return
				editLiquidAsset();
			});
			//保存协定存款
			$('#saveLiquidAssetTreaty').on('click', function() {
				if(!$('#addLiquidAsset_treatyForm').validator('doSubmitCheck')) return;
				saveLiquidAssetTreaty();
			});
			//编辑协定存款
			$('#editLiquidAsset_treaty').on('click', function() {
				if(!$('#editLiquidAssetForm_treaty').validator('doSubmitCheck')) return
				editLiquidAssetModal_treaty();
			});
			//新建 是否保本选项判断
			$('#addIsGuarFund').change(function() {
				if($(this).val() == 'Y') {
					$('#addGuarPeriod').removeAttr("readonly")
					$('#addGuarRatio').removeAttr("readonly")
				} else {
					$('#addGuarPeriod').val('');
					$('#addGuarPeriod').attr("readonly", "readonly")
					$('#addGuarRatio').val('');
					$('#addGuarRatio').attr("readonly", "readonly")
				}
			});
			//编辑 是否保本选项判断
			$('#editIsGuarFund').change(function() {
				if($(this).val() == 'Y') {
					$('#editGuarPeriod').removeAttr("readonly")
					$('#editGuarRatio').removeAttr("readonly")
				} else {
					$('#editGuarPeriod').val('');
					$('#editGuarPeriod').attr("readonly", "readonly")
					$('#editGuarRatio').val('');
					$('#editGuarRatio').attr("readonly", "readonly")
				}
			});

			function getFundQueryParams(val) {
				var form = document.liquidAssetFundSearchFrom
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.sn = form.sn.value.trim();
				pageOptions.name = form.name.value.trim();
				//pageOptions.type = form.type.value.trim();
				//				pageOptions.state = form.state.value.trim();
				return val
			}

			function getTreatyQueryParams(val) {
				var form = document.liquidAssetTreatySearchFrom
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.sn = form.sn.value.trim();
				pageOptions.name = form.name.value.trim();
				//pageOptions.type = form.type.value.trim();
				return val
			}
		}
	}

	//保存货币基金
	function saveLiquidAsset() {
		$('#addLiquidAsset_fundForm').ajaxSubmit({
			url: config.api.liquidAsset.addFund,
			//			contentType : 'application/json',
			success: function(result) {
				//				if(result.errorCode == -1) {
				//					$$.confirm({
				//						title: "Warning",
				//						text: result.errorMessage,
				//						confirm: function(button) {
				//						},
				//						cancel: function(button) {
				//						},
				//						confirmButton: "确认",
				//						cancelButton: "取消"
				//					});
				//				} else {
				//					util.form.reset($('#addLiquidAsset_fundForm')); // 先清理表单
				//					$('#addLiquidAssetModal_fund').modal('hide');
				//					$('#liquidAssetFundApplyTable').bootstrapTable('refresh');
				//				}
				util.form.reset($('#addLiquidAsset_fundForm')); // 先清理表单
				$('#addLiquidAssetModal_fund').modal('hide');
				$('#liquidAssetFundApplyTable').bootstrapTable('refresh');
			}
		})
	}

	//编辑货币基金
	function editLiquidAsset() {
		$('#editLiquidAssetForm').ajaxSubmit({
			url: config.api.liquidAsset.edit,
			success: function(result) {
				util.form.reset($('#editLiquidAssetForm')); // 先清理表单
				$('#editLiquidAssetModal').modal('hide');
				$('#liquidAssetFundApplyTable').bootstrapTable('refresh');
			}
		})
	}

	//保存协定存款
	function saveLiquidAssetTreaty() {
		var baseYield = util.safeCalc($("#baseYield_save").val(), '/', 100, 4);
		var yield = util.safeCalc($("#yield_save").val(), '/', 100, 4);
		$('#addLiquidAsset_treatyForm').ajaxSubmit({
			url: config.api.liquidAsset.addFund,
			success: function(result) {
				util.form.reset($('#addLiquidAsset_treatyForm')); // 先清理表单
				$('#addLiquifdAssetModal_treaty').modal('hide');
				$('#liquidAssetTreatyApplyTable').bootstrapTable('refresh');
			}
		})
	}

	//编辑协定存款
	function editLiquidAssetModal_treaty() {
		var baseYield = util.safeCalc($("#baseYield_edit").val(), '/', 100, 4);
		var yield = util.safeCalc($("#yield_edit").val(), '/', 100, 4);
		$('#editLiquidAssetForm_treaty').ajaxSubmit({
			url: config.api.liquidAsset.edit,
			success: function(result) {
				util.form.reset($('#editLiquidAssetForm_treaty')); // 先清理表单
				$('#editLiquidAssetModal_treaty').modal('hide');
				$('#liquidAssetTreatyApplyTable').bootstrapTable('refresh');
			}
		})
	}

	/**
	 * 格式化风险等级
	 * @param {Object} value
	 * @param {Object} row
	 */
	function formatRiskLevel(val) {
		if(val == 'R1') {
			return 'R1 - 谨慎型'
		} else if(val == 'R2') {
			return 'R2 - 稳健型'
		} else if(val == 'R3') {
			return 'R3 - 平衡型'
		} else if(val == 'R4') {
			return 'R4 - 进取型'
		} else if(val == 'R5') {
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
			if(data.type == "CASHTOOLTYPE_01") {
				$$.detailAutoFix($('#detLiquidAssetForm'), data); // 自动填充详情
				$$.formAutoFix($('#detLiquidAssetForm'), data); // 自动填充表单
				$('#liquidAsset_fundDetailModal').modal('show');
			} else if(data.type == "CASHTOOLTYPE_02") {
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