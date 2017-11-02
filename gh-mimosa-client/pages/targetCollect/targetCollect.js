/**
 * 标的风险预警管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'targetCollect',
		init: function() {
			var collectOption = []
			var cateSelect = document.riskCollectForm.riskWaringCate
			var indicateSelect = document.riskCollectForm.riskWaringIndicate
			var riskWaringSelect = document.riskCollectForm.riskWaring
				//获取风险采集配置项
			http.post(config.api.system.config.ccr.warning.collect.collectOption, {
					contentType: 'form'
				}, function(result) {
					collectOption = result;
					var collectOptions = ''
					var dataType = ''
					var dataUnit = ''
					collectOption.cateList.forEach(function(item) {
						collectOptions += '<option value="' + item.oid + '">' + item.title + '</option>'
					})
					$(cateSelect).html(collectOptions)
				})
				//指标分类change事件
			$(cateSelect).change(function() {
					var cateOid = $(cateSelect).val()
					if (!cateOid || cateOid == '')
						return;
					var collectOptions = ''
					collectOption.indicateList.forEach(function(item) {
						if (item.cate.oid == cateOid) {
							collectOptions += '<option value="' + item.oid + '">' + item.title + '</option>'
						}
					})
					$(indicateSelect).html(collectOptions)
					var indicateOid = $(indicateSelect).val()
					var collectOptions = ''
					collectOption.riskWarningList.forEach(function(item) {
						if (item.indicate.oid == indicateOid) {
							collectOptions += '<option value="' + item.oid + '">' + item.title + '</option>'
							dataType = item.indicate.dataType
							dataUnit = item.indicate.dataUnit
						}
					})
					$(riskWaringSelect).html(collectOptions)
					initCollectData(dataType, dataUnit)
				})
				//指标名称change事件
			$(indicateSelect).change(function() {
					var indicateOid = $(indicateSelect).val()
					var collectOptions = ''
					var dataType = ''
					var dataUnit = ''
					collectOption.riskWarningList.forEach(function(item) {
						if (item.indicate.oid == indicateOid) {
							collectOptions += '<option value="' + item.oid + '">' + item.title + '</option>'
							dataType = item.indicate.dataType
							dataUnit = item.indicate.dataUnit
						}
					})
					$(riskWaringSelect).html(collectOptions)
					initCollectData(dataType, dataUnit)
				})
				//数据采集数据初始化
			function initCollectData(dataType, dataUnit) {
				if (dataType == 'NUMRANGE') {
					$('#riskWaringDataSelect').hide()
					$('#riskWaringDataInput').show()
					$("#riskLevel").html(util.table.formatter.convertRiskLevel("NONE"))
					$("#wLevel").val("NONE")
					$('#riskWaringDataInput').val('');
				} else {
					$('#riskWaringDataInput').hide()
					$('#riskWaringDataSelect').show()
					var oid = $(riskWaringSelect).val()
					var collectOptions = ""
					collectOption.optinList.forEach(function(item) {
						if (item.warning.oid == oid) {
							collectOptions += '<option value="' + item.oid + '">' + item.param0 + '</option>'
						}
					})
					$(document.riskCollectForm.riskWaringDataSelect).html(collectOptions)
					calSelectRiskLevel()
				}
				$('#unit').html(dataUnit)
			}
			//文本或数值数据change事件
			$(document.riskCollectForm.riskWaringDataSelect).change(function() {
					calSelectRiskLevel()
				})
				//区间数据change事件
			$(document.riskCollectForm.riskWaringDataInput).keyup(function() {
					calInputRiskLevel()
				})
				//计算文本或数值分控等级
			function calSelectRiskLevel() {
				var selectOid = $('#riskWaringDataSelect').val()
				collectOption.optinList.forEach(function(item) {
					if (item.oid == selectOid) {
						$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
						$("#wLevel").val(item.wlevel)
					}
				})
				$("#optionOid").val(selectOid)
			}
			//计算区间分控等级
			function calInputRiskLevel() {
				$("#riskLevel").html(util.table.formatter.convertRiskLevel("NONE"))
				$("#wLevel").val("NONE")
				var inputVal = $('#riskWaringDataInput').val()
				var riskWarningOid = $(riskWaringSelect).val()
				collectOption.optinList.forEach(function(item) {
					if (item.warning.oid == riskWarningOid) {
						var min = item.param1
						var max = item.param2
						var f0 = item.param0
						var f1 = item.param3
						if (max == '∞') {
							if (f0 == "[") {
								if (parseFloat(inputVal) >= parseFloat(min)) {
									$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
									$("#optionOid").val(item.oid)
									$("#wLevel").val(item.wlevel)
								}
							} else {
								if (parseFloat(inputVal) > parseFloat(min)) {
									$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
									$("#optionOid").val(item.oid)
									$("#wLevel").val(item.wlevel)
								}
							}
						} else if (min == '∞') {
							if (f1 == "]") {
								if (parseFloat(inputVal) <= parseFloat(max)) {
									$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
									$("#optionOid").val(item.oid)
									$("#wLevel").val(item.wlevel)
								}
							} else {
								if (parseFloat(inputVal) < parseFloat(max)) {
									$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
									$("#optionOid").val(item.oid)
									$("#wLevel").val(item.wlevel)
								}
							}
						} else {
							if (f0 == "[") {
								if (f1 == "]") {
									if (parseFloat(inputVal) >= parseFloat(min) && parseFloat(inputVal) <= parseFloat(max)) {
										$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
										$("#optionOid").val(item.oid)
										$("#wLevel").val(item.wlevel)
									}
								} else {
									if (parseFloat(inputVal) >= parseFloat(min) && parseFloat(inputVal) < parseFloat(max)) {
										$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
										$("#optionOid").val(item.oid)
										$("#wLevel").val(item.wlevel)
									}
								}
							} else {
								if (f1 == "]") {
									if (parseFloat(inputVal) >= parseFloat(min) && parseFloat(inputVal) <= parseFloat(max)) {
										$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
										$("#optionOid").val(item.oid)
										$("#wLevel").val(item.wlevel)
									}
								} else {
									if (parseFloat(inputVal) >= parseFloat(min) && parseFloat(inputVal) < parseFloat(max)) {
										$("#riskLevel").html(util.table.formatter.convertRiskLevel(item.wlevel))
										$("#optionOid").val(item.oid)
										$("#wLevel").val(item.wlevel)
									}
								}
							}
						}
					}
				})
			}
			//数据采集按钮
			$('#riskCollectSubmit').on('click', function() {
					var style = $('#riskWaringDataInput').css('display')
					if (style == 'block') {
						var val = $('#riskWaringDataInput').val()
						if (val.trim() == "") {
							alert("风险指标数据不能为空!")
							return
						}
						if (isNaN(val)) {
							alert("风险指标数据必须为数字!")
							return
						}
					}
					return $('#riskCollectForm').ajaxSubmit({
						url: config.api.system.config.ccr.warning.collect.add,
						success: function(result) {
							$('#targetDetailModal').modal('hide');
							$('#targetCollectTable').bootstrapTable('refresh');
						}
					})
				})
				//分页配置
			var pageOptions = {
					number: 1,
					size: 10,
					targetName: '',
					searchSn: '',
					state: ''
				}
				// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.system.config.ccr.warning.collect.list, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							name: pageOptions.targetName,
							sn: pageOptions.searchSn,
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
				detailView: true,
				onExpandRow: function(index, row, $detail) {
					$detail.append('<p class="form-header">风险详情</p>')
					var detTable = $('<table><thead><tr>' +
						'<th>预警指标</th>' +
						'<th>风险指标</th>' +
						'<th>风险等级</th>' +
						'<th>处置状态</th>' +
						'</tr></thead></table>')
					var detTableConfig = {
						ajax: function(origin) {
							http.post(config.api.system.config.ccr.warning.collect.detail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(rlt) {
								origin.success(rlt)
							})
						},
						columns: [{
							field: 'title',
							align: 'center'
						}, {
							field: 'riskData',
							align: 'center',
							formatter: function(val, row) {
								return val + row.riskUnit;
							}
						}, {
							field: 'riskLevel',
							align: 'center',
							formatter: function(val) {
								return util.table.formatter.convertRiskLevel(val);
							}
						}, {
							field: 'handleLevel',
							align: 'center',
							formatter: function(val) {
								if (!val)
									return '未处置'
								return '已处置';
							}
						}]
					}
					$detail.append(detTable)
					$(detTable).bootstrapTable(detTableConfig)
				},
				columns: [{
					field: 'sn'
				}, {
					field: 'name'
				}, {
					field: 'state',
					formatter: function(val) {
						return util.enum.transform('targetLifeStates', val);
					}
				}, {
					field: 'level',
					formatter: function(val) {
						return util.table.formatter.convertRiskLevel(val);
					}
				}, {
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '风险采集',
							type: 'button',
							class: 'item-add',
							isRender: true
						}, {
							text: '处置历史',
							type: 'button',
							class: 'item-his',
							isRender: true
						}];
						return util.table.formatter.generateButton(buttons, 'targetCollectTable');
					},
					events: {
						'click .item-his': function(e, value, row) {
							$('#targetHandleHisTable').bootstrapTable('destroy')
								//分页配置
							var pageOptions2 = {
									number: 1,
									size: 10,
								}
								// 数据表格配置
							var tableConfig2 = {
								ajax: function(origin) {
									http.post(config.api.system.config.ccr.warning.handle.hisList, {
										data: {
											page: pageOptions2.number,
											rows: pageOptions2.size,
											oid: row.oid,
										},
										contentType: 'form'
									}, function(rlt) {
										origin.success(rlt)
									})
								},
								pageNumber: pageOptions2.number,
								pageSize: pageOptions2.size,
								pagination: true,
								sidePagination: 'server',
								pageList: [10, 20, 30, 50, 100],
								columns: [{
									field: 'riskType'
								}, {
									field: 'riskName'
								}, {
									field: 'riskDet'
								}, {
									field: 'handle',
									formatter: function(val) {
										return util.enum.transform('warningHandleType', val);
									}
								}, {
									field: 'createTime',
								}, {
									align: 'center',
									formatter: function(val, row) {
										var buttons = [{
											text: '预警报告',
											type: 'button',
											class: 'item-report',
											isRender: row.report != null
										}, {
											text: '过会纪要',
											type: 'button',
											class: 'item-meeting',
											isRender: row.meeting != null
										}, {
											text: '处置备忘录',
											type: 'button',
											class: 'item-summary',
											isRender: true
										}];
										return util.table.formatter.generateButton(buttons, 'targetHandleHisTable');
									},
									events: {
										'click .item-summary': function(e, value, row) {
											if (row.summary == "") {
												$('#summary').html('无')
											} else {
												$('#summary').html(row.summary)
											}
											$('#summaryDetailModal').modal('show');
										},
										'click .item-report': function(e, value, row) {
											location.href = row.report + '?realname=' + row.reportName
										},
										'click .item-meeting': function(e, value, row) {
											location.href = row.meeting + '?realname=' + row.meetingName
										}
									}
								}]
							}
							$('#targetHandleHisTable').bootstrapTable(tableConfig2)
							$("#targetHandleHisModal").modal('show')
						},
						'click .item-add': function(e, value, row) {
							var executable = true
							executable = executable && collectOption
							executable = executable && collectOption.cateList
							executable = executable && collectOption.cateList.length > 0

							console.log(executable);

							if (!executable) {
								toastr.error('未配置风险预警模型', '错误信息', {
									timeOut: 3600000
								})
								return;
								return
							}
							http.post(config.api.targetDetQuery, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								util.form.reset($('#riskCollectForm')); // 先清理表单
								var data = result.investment;
								//data.raiseScope = data.raiseScope + '万';
								data.life = data.life + util.enum.transform('lifeUnit', data.lifeUnit);
								/*if (data.expAror)
									data.expAror = data.expAror.toFixed(2) + '%';
								if (data.overdueRate)
									data.overdueRate = data.overdueRate.toFixed(2) + '%'
								if (data.collectIncomeRate)
									data.collectIncomeRate = data.collectIncomeRate.toFixed(2) + '%'
								data.floorVolume = data.floorVolume + '万';
								if (data.trustAmount)
									data.trustAmount = data.trustAmount + '万';
								if (data.restTrustAmount)
									data.restTrustAmount = data.restTrustAmount + '万';*/
								data.contractDays = data.contractDays + '天/年';
								data.collectDate = data.collectStartDate + " 至 " + data.collectEndDate
								data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
								$$.detailAutoFix($('#detTargetForm'), data); // 自动填充详情
								$('#targetOid').val(data.oid)
								$('#targetDetailModal').modal('show');
							})
						}
					}
				}]
			}
			$('#targetCollectTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#targetSearchForm'), $('#targetCollectTable'))

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.targetName = form.searchName.value.trim();
				pageOptions.searchSn = form.searchSn.value.trim();
				pageOptions.state = form.targetStatus.value.trim();
				return val
			}
		}
	}
})