/**
 * 标的会前审查
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'targetAccess',
		init: function() {
			// 分页配置
			var pageOptions = {
					number: 1,
					size: 10
				}
				// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.targetCheckListQuery, {
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
						field: 'sn'
					}, {
						field: 'name'
					}, {
						field: 'accrualType',
						formatter: function(val) {
							return util.enum.transform('ACCRUALTYPE', val);
						}
					}, {
						field: 'expSetDate',
						visible: false,
					}, {
						field: 'type',
						formatter: function(val) {
							return util.enum.transform('TARGETTYPE', val);
						}
					}, {
						field: 'raiseScope',
						formatter: function(val) {
							if (val) {
								var temp = util.safeCalc(val, '/', 10000, 6);
								return temp + '万';
							} else {
								return null;
							}
						}
					}, {
						field: 'life',
						formatter: function(val, row) {
							return val + util.enum.transform('lifeUnit', row.lifeUnit)
						}
					}, {
						field: 'expAror',
						formatter: function(val, row) {
							if (val) {
								var percentage = util.safeCalc(val, '*', 100, 2);
								return percentage.toFixed(2) + "%";
							} else {
								return null;
							}
						}
					}, {
						field: 'state',
						formatter: function(val) {
							return util.enum.transform('targetStates', val);
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
								text: '底层项目',
								type: 'button',
								class: 'item-project',
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
								$('#accessFrom').validator('destroy')
								util.form.reset($('#accessFrom')); // 先清理表单
								document.accessFrom.oid.value = row.oid
								if (row.raiseScope) {
									document.accessFrom.assetAmount.value = util.safeCalc(row.raiseScope, '/', 10000, 6)
								}
								util.form.validator.init($('#accessFrom'))
								$('#accessModal').modal('show');
							},
							'click .item-project': function(e, value, row) { // 底层项目 按钮点击事件
								targetInfo = row; // 变更某一行 投资标的信息
								//								$$.detailAutoFix($('#targetDetail'), targetInfo); // 自动填充详情
								//								$$.formAutoFix($('#targetDetail'), targetInfo); // 自动填充表单
								//								// 给项目表单的 标的id属性赋值
								//								$("#targetOid")[0].value = targetInfo.oid;
								// 初始化底层项目表格
								$('#projectTable').bootstrapTable(projectTableConfig)
								$('#projectTable').bootstrapTable('refresh'); // 项目表单重新加载
								$$.searchInit($('#projectSearchForm'), $('#projectTable'))
								$('#projectDataModal').modal('show');
							},
							'click .item-detail': function(e, value, row) {
								http.post(config.api.targetDetQuery, {
									data: {
										oid: row.oid
									},
									contentType: 'form'
								}, function(result) {
									var data = result.investment;
									var data = result.investment;
									//data.raiseScope = data.raiseScope + '万';
									data.life = data.life + util.enum.transform('lifeUnit', data.lifeUnit);
									/*
									if (data.expAror)
										data.expAror = data.expAror.toFixed(2) + '%';
									if (data.overdueRate)
										data.overdueRate = data.overdueRate.toFixed(2) + '%'
									if (data.collectIncomeRate)
										data.collectIncomeRate = data.collectIncomeRate.toFixed(2) + '%'
									data.floorVolume = data.floorVolume + '万';
									if (data.trustAmount)
										data.trustAmount = data.trustAmount + '万';
									if (data.restTrustAmount)
										data.restTrustAmount = data.restTrustAmount + '万';
										*/
									data.contractDays = data.contractDays + '天/年';
									data.collectDate = data.collectStartDate + " 至 " + data.collectEndDate
									data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
									$$.detailAutoFix($('#detTargetForm'), data); // 自动填充详情
									$('#targetDetailModal').modal('show');
								})
							}
						}
					}]
				}
				// 初始化表格
			$('#targetAccessTable').bootstrapTable(tableConfig)

			var prjPageOptions = {}
			var projectTableConfig = {
				ajax: function(origin) {
					http.post(config.api.targetProjectList, {
						data: prjPageOptions,
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
				queryParams: function(val) {
					var form = document.projectSearchForm
					$.extend(prjPageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象

					prjPageOptions.rows = val.limit
					prjPageOptions.page = parseInt(val.offset / val.limit) + 1
					prjPageOptions.targetOid = targetInfo.oid.trim(); // 标的id					

					return val
				},
				columns: [{
					//编号
					// field: 'oid',
					align: 'center',
					width: 60,
					formatter: function(val, row, index) {
						return index + 1
					}
				}, {
					//项目名称
					field: 'projectName',
				}, {
					//项目项目经理
					field: 'projectManager',
				}, {
					//项目项目类型
					field: 'projectType',
					formatter: function(val) {
						return util.enum.transform('PROJECTTYPE', val);
					}
				}, {
					//城市
					field: 'projectCity',
				}, {
					//创建时间
					field: 'createTime',
				}, {
					//操作
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '详情',
							type: 'button',
							class: 'item-project-detail',
							isRender: true
						}];
						return util.table.formatter.generateButton(buttons, 'projectTable');
					},
					events: {
						'click .item-project-detail': function(e, value, row) { // 底层项目详情
							http.post(config.api.projectDetail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result.data;
								if (!data) {
									alert('查询底层项目详情失败');
								} else {
									$$.detailAutoFix($('#targetDetail_2'), formatTargetData(targetInfo)); // 自动填充详情
									//									$$.detailAutoFix($('#projectDetail'), row); // 自动填充详情-取表格里的内容
									$$.detailAutoFix($('#projectDetail'), formatProjectData(data)); // 自动填充详情-取后台返回的内容
									if (data.warrantor === 'yes') { // 担保人信息									
										$("#warrantorDetail").show()
									} else {
										$("#warrantorDetail").hide()
									}
									if (data.pledge === 'yes') { // 抵押人信息									
										$("#pledgeDetail").show()
									} else {
										$("#pledgeDetail").hide()
									}
									if (data.hypothecation === 'yes') { // 质押人信息									
										$("#hypothecationDetail").show()
									} else {
										$("#hypothecationDetail").hide()
									}

									/* 判断项目类型 */
									if (data.projectType === 'PROJECTTYPE_01') { // 金融类项目									
										$("#estateDetail").hide()
										$("#financeDetai").show()
									} else if (data.projectType === 'PROJECTTYPE_02') { // 地产类项目									
										$("#estateDetail").show()
										$("#financeDetai").hide()
									} else {
										$("#estateDetail").hide()
										$("#financeDetai").hide()
									}

									$('#projectDetailModal').modal('show');
								}
							});

						}
					}
				}]
			};

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				return val
			}

			$('#checkpass').on('click', function() {
				if (!$('#accessFrom').validator('doSubmitCheck')) return
				if (!$(document.accessFrom.trustAmount)) {
					alert('审核通过时授信额度必须大于0')
					return
				}
				$("#confirmTitle").html("确定审核通过？")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						check(config.api.targetCheckPass);
					}
				})
			})
			$('#checkreject').on('click', function() {
				$("#confirmTitle").html("确定审核驳回？")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						check(config.api.targetCheckReject);
					}
				})
			})
		}
	}

	function check(url) {
		$('#accessFrom').ajaxSubmit({
			url: url,
			success: function(result) {
				util.form.reset($('#accessFrom')); // 先清理表单
				$('#accessModal').modal('hide');
				$('#targetAccessTable').bootstrapTable('refresh');
			}
		})
	}

	/**
	 * 格式化投资标的信息
	 * @param {Object} t
	 */
	function formatTargetData(t) {
		if (t) {
			var t2 = {};
			$.extend(t2, t); //合并对象，修改第一个对象
			//t2.expAror = t2.expAror ? (t2.expAror * 100).toFixed(2) + '%' : "";
			t2.expAror = t2.expAror ? (t2.expAror * 100).toFixed(2) : "";
			//t2.collectIncomeRate = t2.collectIncomeRate ? t2.collectIncomeRate.toFixed(2) + '%' : "";

			//t2.raiseScope = t2.raiseScope + '万';
			t2.life = t2.life + util.enum.transform('lifeUnit', t2.lifeUnit);
			//t2.floorVolume = t2.floorVolume + '元';
			t2.contractDays = t2.contractDays + '天/年';
			t2.collectDate = t2.collectStartDate + " 至 " + t2.collectEndDate
			t2.riskRate = util.table.formatter.convertRisk(t2.riskRate); // 格式化风险等级

			return t2;
		}
		return t;
	}
	/**
	 * 格式化底层项目信息
	 * @param {Object} p
	 */
	function formatProjectData(p) {
		if (p) {
			var p2 = {};
			$.extend(p2, p); //合并对象，修改第一个对象

			//p2.warrantorCapital = p2.warrantorCapital ? p2.warrantorCapital.toFixed(4) + '万' : "";
			//p2.warrantorDebt = p2.warrantorDebt ? p2.warrantorDebt.toFixed(4) + '万' : "";

			//p2.pledgeValuation = p2.pledgeValuation ? p2.pledgeValuation.toFixed(4) + '万' : "";
			//p2.margin = p2.margin ? p2.margin.toFixed(4) + '万' : "";

			// p2.pledgeRatio = p2.pledgeRatio ? p2.pledgeRatio.toFixed(2) + '%' : "";
			//p2.spvTariff = p2.spvTariff ? p2.spvTariff.toFixed(2) + '%' : "";

			return p2;
		}
		return p;
	}
})