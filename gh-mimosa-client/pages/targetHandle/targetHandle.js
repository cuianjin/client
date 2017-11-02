/**
 * 风险处置管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'targetHandle',
		init: function() {
			$("#a1").click(function() {
				$('#riskWarningHandleTable').bootstrapTable('refresh')
			})
			$("#a2").click(function() {
				$('#riskWarningHandleHisTable').bootstrapTable('refresh')
			})

			$$.uploader({
				container: $('#reportUploader'),
				success: function(file) {
					$('#reportFile').show().find('a').attr('href', file.url)
					$('#reportFile').find('span').html(file.name)
					console.log(file)
					document.riskHandleForm.report.value = file.url
					document.riskHandleForm.reportSize.value = file.size
					document.riskHandleForm.reportName.value = file.name
				}
			})

			$$.uploader({
				container: $('#meetingUploader'),
				success: function(file) {
					$('#meetingFile').show().find('a').attr('href', file.url)
					$('#meetingFile').find('span').html(file.name)
					document.riskHandleForm.meeting.value = file.url
					document.riskHandleForm.meetingSize.value = file.size
					document.riskHandleForm.meetingName.value = file.name
				}
			})

			//风险处置按钮
			$('#riskHandleSubmit').on('click', function() {
					$('#riskHandleForm').ajaxSubmit({
						url: config.api.system.config.ccr.warning.handle.handle,
						success: function(result) {
							$('#targetDetailModal').modal('hide');
							$('#riskWarningHandleTable').bootstrapTable('refresh');
						}
					})
				})
				//投资标的检索框
			http.post(config.api.system.config.ccr.warning.handle.targetList, {
				contentType: 'form'
			}, function(rlt) {
				var select = document.targetSearchForm.relative
				var collectOptions = '<option value="" selected>全部</option>'
				for (var key in rlt) {
					collectOptions += '<option value="' + key + '">' + rlt[key] + '</option>'
				}
				$(select).html(collectOptions)
			})

			//分页配置
			var pageOptions = {
					number: 1,
					size: 10,
					relative: '',
					wlevel: '',
					riskName: ','
				}
				// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.system.config.ccr.warning.handle.list, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							relative: pageOptions.relative,
							wlevel: pageOptions.wlevel,
							riskName: pageOptions.riskName
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
					field: 'relativeName'
				}, {
					field: 'riskType'
				}, {
					field: 'riskName'
				}, {
					field: 'riskDet'
				}, {
					field: 'handleLevel',
					formatter: function(val) {
						if (!val)
							return '未处置'
						return '已处置';
					}
				}, {
					field: 'riskData',
					formatter: function(val, row) {
						return val + row.riskUnit;
					}
				}, {
					field: 'wlevel',
					align: 'center',
					formatter: function(val, row) {
						return util.table.formatter.convertRiskLevel(val);
					}
				}, {
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '风险处置',
							type: 'button',
							class: 'item-handle',
							isRender: true
						}];
						return util.table.formatter.generateButton(buttons, 'riskWarningHandleTable');
					},
					events: {
						'click .item-handle': function(e, value, row) {
							http.post(config.api.targetDetQuery, {
								data: {
									oid: row.relative
								},
								contentType: 'form'
							}, function(result) {
								util.form.reset($('#riskHandleForm')); // 先清理表单
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
								$('#oid').val(row.oid)
								$('#targetDetailModal').modal('show');
							})
						}
					}
				}]
			}
			$('#riskWarningHandleTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#targetSearchForm'), $('#riskWarningHandleTable'))

			//分页配置
			var pageOptions2 = {
					number: 1,
					size: 10,
				}
				// 数据表格配置
			var tableConfig2 = {
				ajax: function(origin) {
					http.post(config.api.system.config.ccr.warning.handle.hisListAll, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
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
				queryParams: getQueryParams2,
				columns: [{
					field: 'relativeName'
				}, {
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
						return util.table.formatter.generateButton(buttons, 'riskWarningHandleHisTable');
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
			$('#riskWarningHandleHisTable').bootstrapTable(tableConfig2)

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.relative = form.relative.value.trim();
				pageOptions.wlevel = form.wlevel.value.trim();
				pageOptions.riskName = form.riskName.value.trim();
				return val
			}

			function getQueryParams2(val) {
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				return val
			}
		}
	}

})