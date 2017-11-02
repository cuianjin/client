/**
 * 标的申请管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'targetApply',
		init: function() {
			//新建标的 募集期起始日 截止日 拟成立日 控件 onblur事件
			//			$('#createCollectStartDate,#createCollectEndDate,#createExpSetDate').on('blur', function() {
			$('#createCollectStartDate,#createCollectEndDate').on('blur', function() {
					validCDate()
				})
				//校验新建标的 募集期起始日 截止日 拟成立日 
			function validCDate() {
				var flag = true
				$('#cdateDiv1').removeClass("has-error")
				$('#cdateDiv2').removeClass("has-error")
					//				$('#cdateDiv3').removeClass("has-error")
				$('#cdateErr1').html('')
				$('#cdateErr2').html('')
					//				$('#cdateErr3').html('')
				var data1 = $('#createCollectStartDate').val()
				var data2 = $('#createCollectEndDate').val()
					//				var data3 = $('#createExpSetDate').val()
				if (!data1) {
					$('#cdateErr1').html('募集起始日不能为空')
					$('#cdateDiv1').addClass("has-error")
					flag = false
				}
				if (!data2 || Date.parse(data1) > Date.parse(data2)) {
					$('#cdateErr2').html('募集截止日不能为空且必须大于募集起始日')
					$('#cdateDiv2').addClass("has-error")
					flag = false
				}
				//				if (!data3 || Date.parse(data2) > Date.parse(data3)) {
				//					$('#cdateErr3').html('拟成立日不能为空且必须大于募集截至日')
				//					$('#cdateDiv3').addClass("has-error")
				//					flag = false
				//				}
				return flag
			}
			//编辑标的 募集期起始日 截止日 拟成立日 控件 onblur事件
			//			$('#editCollectStartDate,#editCollectEndDate,#editExpSetDate').on('blur', function() {
			$('#editCollectStartDate,#editCollectEndDate').on('blur', function() {
					validEDate()
				})
				//校验编辑标的 募集期起始日 截止日 拟成立日 
			function validEDate() {
				var flag = true
				$('#edateDiv1').removeClass("has-error")
				$('#edateDiv2').removeClass("has-error")
					//				$('#edateDiv3').removeClass("has-error")
				$('#edateErr1').html('')
				$('#edateErr2').html('')
					//				$('#edateErr3').html('')
				var data1 = $('#editCollectStartDate').val()
				var data2 = $('#editCollectEndDate').val()
					//				var data3 = $('#editExpSetDate').val()
				if (!data1) {
					$('#edateErr1').html('募集起始日不能为空')
					$('#edateDiv1').addClass("has-error")
					flag = false
				}
				if (!data2 || Date.parse(data1) > Date.parse(data2)) {
					$('#edateErr2').html('募集截止日不能为空且必须大于募集起始日')
					$('#edateDiv2').addClass("has-error")
					flag = false
				}
				//				if (!data3 || Date.parse(data2) > Date.parse(data3)) {
				//					$('#edateErr3').html('拟成立日不能为空且必须大于募集截至日')
				//					$('#edateDiv3').addClass("has-error")
				//					flag = false
				//				}
				return flag
			}

			// js逻辑写在这里
			// 分页配置
			var targetInfo; // 缓存 选中的某一行的 投资标的信息
			var pageOptions = {
					number: 1,
					size: 10,
					targetName: '',
					targetType: '',
					state: ''
				}
				// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.targetListQuery, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							name: pageOptions.targetName,
							type: pageOptions.targetType,
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
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
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
							var percentage = util.safeCalc(val, '*', 100, 2)
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
					field: 'riskRate',
					formatter: function(val) {
						return util.table.formatter.convertRisk(val);
					}
				}, {
					width: 400,
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
							isRender: true,
							//isRender: row.state == 'waitPretrial' || row.state == 'reject'
						}, {
							text: '提交预审',
							type: 'button',
							class: 'item-check',
							isRender: row.state == 'waitPretrial' || row.state == 'reject'
						}, {
							text: '编辑',
							type: 'button',
							class: 'item-edit',
							isRender: row.state == 'waitPretrial' || row.state == 'reject'
						}, {
							text: '作废',
							type: 'button',
							class: 'item-invalid',
							//							isRender: row.state != 'invalid' && row.state != 'metting'
							isRender: row.state === 'waitPretrial' || row.state === 'reject'
						}, {
							text: '推荐入池',
							type: 'button',
							class: 'item-enter',
							isRender: row.state == 'metted'
						}];
						return util.table.formatter.generateButton(buttons, 'targetApplyTable');
					},
					events: {
						'click .item-enter': function(e, value, row) {
							$("#confirmTitle").html("确定确认投资标的？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.targetEnter, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#targetApplyTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-edit': function(e, value, row) {

							http.post(config.api.targetDetQuery, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								var data = result.investment;
								//								$$.detailAutoFix($('#editTargetForm'), data); // 自动填充详情
								$$.formAutoFix($('#editTargetForm'), data); // 自动填充表单
								// 重置和初始化表单验证
								$("#editTargetForm").validator('destroy')
								util.form.validator.init($("#editTargetForm"));
								$('#editTargetModal').modal('show');
							})
						},
						'click .item-check': function(e, value, row) {
							$("#confirmTitle").html("确定提交预审？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.targetExamine, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#targetApplyTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html("确定作废标的？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.targetInvalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#targetApplyTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-detail': function(e, value, row) {
							http.post(config.api.targetDetQuery, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
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
								if (data.state != 'reject') {
									$("#rejectDesc").hide()
								} else {
									$("#rejectDesc").show()
								}
								/*
								if (data.state == 'collecting' || data.state == 'meetingPass') {
									http.post(config.api.targetNewMeeting, {
										data: {
											investmentOid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										var data = result.data;
										$$.detailAutoFix($('#meetingDetForm'), data); // 自动填充详情
										http.post(config.api.meetingTargetVoteDet, {
												data: {
													meetingOid: data.oid,
													targetOid: row.oid
												},
												contentType: 'form'
											},
											function(obj) {
												$('#detVoteTable').bootstrapTable('load', obj)
											});
									})
									$('#meetingDet').show();
								} else {
									$('#meetingDet').hide();
								}
								*/
								$('#meetingDet').hide(); // 统一版本去掉过会环节
								$('#targetDetailModal').modal('show');
							})

						},
						'click .item-project': function(e, value, row) { // 底层项目 按钮点击事件
							targetInfo = row; // 变更某一行 投资标的信息
							//console.info("targetInfo---------->" + JSON.stringify(targetInfo))

							$('#projectSearchForm').resetForm(); // 先清理搜索项目表单
							$$.detailAutoFix($('#targetDetail'), formatTargetData(targetInfo)); // 自动填充详情
							// 给项目表单的 标的id属性赋值
							$("#targetOid")[0].value = targetInfo.oid;
							//111
							// 初始化底层项目表格
							$('#projectTable').bootstrapTable(projectTableConfig)
							$('#projectTable').bootstrapTable('refresh'); // 项目表单重新加载
							$$.searchInit($('#projectSearchForm'), $('#projectTable'))

							// 控制是否能显示 添加项目按钮
							if (targetInfo.state == 'waitPretrial' || targetInfo.state == 'reject')
								$('#projectAdd').show();
							else
								$('#projectAdd').hide();

							$('#projectDataModal').modal('show');

						}
					}
				}]
			};

			var prjPageOptions = {
				page: 1,
				rows: 10
			}
			var projectTableConfig = {
				ajax: function(origin) {
					http.post(config.api.targetProjectList, {
						data: prjPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: prjPageOptions.page,
				pageSize: prjPageOptions.rows,
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
						}, {
							text: '修改',
							type: 'button',
							class: 'item-project-update',
							isRender: targetInfo.state == 'waitPretrial' || targetInfo.state == 'reject'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-project-delete',
							//isRender: true
							isRender: targetInfo.state == 'waitPretrial' || targetInfo.state == 'reject'
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

						},
						'click .item-project-update': function(e, value, row) { // 底层项目修改
							util.form.reset($('#projectForm')); // 先清理表单

							$$.detailAutoFix($('#targetDetail'), formatTargetData(targetInfo)); // 自动填充详情

							// 给项目表单的 标的id属性赋值
							$("#targetOid")[0].value = targetInfo.oid;
							//row.targetOid = targetInfo.oid;

							//初始化:担保方式下拉列表,抵押方式下拉列表,质押方式下拉列表	 
							initSel();

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

									//$$.formAutoFix($('#projectForm'), row); // 自动填充表单-取表格里的内容
									$$.formAutoFix($('#projectForm'), data); // 自动填充表单-取后台返回的内容
									// 重置和初始化表单验证
									$("#projectForm").validator('destroy')
									util.form.validator.init($("#projectForm"));

									$(document.projectForm.projectType).val(data.projectType).change();
									$('#projectModal').modal('show');
								}
							});

						},
						'click .item-project-delete': function(e, value, row) { // 删除底层项目
							$("#confirmTitle").html("确定删除底层项目？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									//console.log('targetInfo===>' + JSON.stringify(targetInfo));
									//console.log('项目row===>' + JSON.stringify(row));
									http.post(config.api.targetProjectDelete, {
										data: {
											targetOid: targetInfo.oid,
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#projectTable').bootstrapTable('refresh');
									})
								}
							})

						}
					}
				}]
			};
			// 初始化表格
			$('#targetApplyTable').bootstrapTable(tableConfig)

			// 搜索表单初始化
			$$.searchInit($('#targetSearchForm'), $('#targetApplyTable'))

			// 新建标的表单初始化
			util.form.validator.init($("#addTargetForm")); // 初始化表单验证

			// 新建标的按钮点击事件
			$('#targetAdd').on('click', function() {
				$('#addTargetForm').resetForm(); // 先清理表单
				$('#addTargetModal').modal('show')
			})

			//新建标的按钮点击事件
			$('#addTargetSubmit').on('click', function() {
				if ($('#addTargetForm').validator('doSubmitCheck') & validCDate()) {
					saveTarget()
				}
			})

			//修改标的按钮点击事件
			$('#editTargetSubmit').on('click', function() {
				if ($('#editTargetForm').validator('doSubmitCheck') & validEDate()) {
					editTarget()
				}
			})

			// 新建底层项目表单验证初始化
			util.form.validator.init($("#projectForm"));

			// 新建底层项目按钮点击事件
			$('#projectAdd').on('click', function() {
				if (!targetInfo) {
					alert('请选择投资标的');
					return false;
				}

				$$.detailAutoFix($('#targetDetail'), formatTargetData(targetInfo)); // 自动填充详情

				util.form.reset($('#projectForm')); // 先清理表单

				//初始化:担保方式下拉列表,抵押方式下拉列表,质押方式下拉列表	 
				initSel();

				// 给项目表单的 标的id属性赋值
				//$("#targetOid")[0].value = targetInfo.oid;
				$(document.projectForm.targetOid).val(targetInfo.oid); // 给项目表单的 标的id属性赋值
				$(document.projectForm.oid).val(''); // 重置项目oid
				$('#projectModal').modal('show');
			})

			// 保存底层项目按钮点击事件
			$('#projectSubmit').on('click', function() {
				saveProject();
			})

			// 新增/修改底层项目-项目类型下拉列表选项改变事件
			$(document.projectForm.projectType).change(function() { // 项目类型
				var ptt = $(this).val();
				if (ptt === 'PROJECTTYPE_01') { // 金融
					$("#estateDiv").hide().find(':input').attr('disabled', 'disabled');
					$("#financeDiv").show().find(':input').attr('disabled', false);
				} else if (ptt === 'PROJECTTYPE_02') { // 房地产
					$("#estateDiv").show().find(':input').attr('disabled', false);
					$("#financeDiv").hide().find(':input').attr('disabled', 'disabled');
				} else {
					$("#estateDiv").hide().find(':input').attr('disabled', 'disabled');
					$("#financeDiv").hide().find(':input').attr('disabled', 'disabled');
				}

				$(document.projectForm.projectTypeName).val($(this).find("option:selected").text()); // 设置项目类型名称

				$('#projectForm').validator('destroy'); // 先销毁验证规则
				util.form.validator.init($('#projectForm')); // 然后添加验证规则
			});

			// 新增/修改底层项目-房地产项目属性下拉列表选项改变事件
			$(document.projectForm.estateProp).change(function() { // 房地产项目属性
				var v = $(this).val();
				var t = $(this).find("option:selected").text();
				$(document.projectForm.estatePropName).val(t); // 设置房地产项目属性名称
			});

			// 新增/修改底层项目-是否有担保单选按钮改变事件
			$(document.projectForm.warrantor).each(function(index, item) {
				$(item).on('ifChecked', function(e) { // 是否有担保
					if ($(this).val() === 'yes')
						$('#prjWarrantorInfo').show().find(':input').attr('disabled', false);
					else
						$('#prjWarrantorInfo').hide().find(':input').attr('disabled', 'disabled');

					$('#projectForm').validator('destroy'); // 先销毁验证规则
					util.form.validator.init($('#projectForm')); // 然后添加验证规则
				});
			})

			// 新增/修改底层项目-是否有抵押人单选按钮改变事件
			$(document.projectForm.pledge).each(function(index, item) {
				$(item).on('ifChecked', function(e) { // 是否有抵押人
					if ($(this).val() === 'yes')
						$('#prjPledgeInfo').show().find(':input').attr('disabled', false);
					else
						$('#prjPledgeInfo').hide().find(':input').attr('disabled', 'disabled');

					$('#projectForm').validator('destroy'); // 先销毁验证规则
					util.form.validator.init($('#projectForm')); // 然后添加验证规则
				});
			})

			// 新增/修改底层项目-是否有质押人单选按钮改变事件
			$(document.projectForm.hypothecation).each(function(index, item) {
				$(item).on('ifChecked', function(e) { // 是否有质押人
					if ($(this).val() === 'yes')
						$('#prjHypothecation').show().find(':input').attr('disabled', false);
					else
						$('#prjHypothecation').hide().find(':input').attr('disabled', 'disabled');

					$('#projectForm').validator('destroy'); // 先销毁验证规则
					util.form.validator.init($('#projectForm')); // 然后添加验证规则
				});
			})

			$('#addEventCollect').on('click', function() {
				eventCollect('');
			});
			$('#editEventCollect').on('click', function() {
				eventCollect($(document.editTargetForm.oid).val());
			});
			// 标的风险采集
			function eventCollect(relative) {
				// TODO 这里要调下, 标的模块要设置标的的oid
				//var relative = "xxxxxxxxxxxxxxxx";
				// TODO 这里要设置数据采集类型
				var type = "SCORE";
				http.post(config.api.system.config.ccr.options.preCollect, {
						data: {
							type: 'SCORE'
						},
						contentType: 'form'
					},
					function(val) {

						http.post(config.api.system.config.ccr.indicate.collect.preUpdate, {
								data: {
									relative: relative
								},
								contentType: 'form'
							},
							function(predata) {

								var initdata = {

								};

								if (predata && predata.length > 0) {
									$.each(predata, function(i, item) {
										initdata[item.indicateOid] = item;
									});
								};

								$(document.collectForm.relative).val(relative);

								$(document.collectForm.type).val(type);

								$('#collectModalContent').empty();

								if (val && val.length > 0) {

									var content = $('#collectModalContent');

									$.each(val, function(i, collect) {
										$('<h6><b>' + collect.cateTitle + '</b></h6>').appendTo(content);

										$.each(collect.indicates, function(j, indicate) {
											var form = $('<form></form>');
											form.appendTo(content);

											var indicateOid = $('<input type="hidden" name="indicateOid" value="' + indicate.indicateOid + '" />');
											indicateOid.appendTo(form);

											var row = $('<div class="row"></div>');
											row.appendTo(form);
											var col = $('<div class="col-sm-12 col-xs-6"></div>');
											col.appendTo(row);
											var formGroup = $('<div class="form-group"></div>');
											formGroup.appendTo(col);
											var inputGroup = $('<div class="input-group input-group-sm"></div>');
											inputGroup.appendTo(formGroup);

											var inputTitle = $('<div class="input-group-addon">' + indicate.indicateTitle + '</div>');
											inputTitle.appendTo(inputGroup);

											if (indicate.indicateType == 'NUMBER') {
												var inputOcx = $('<select name="options" class="form-control input-sm"></select>');
												inputOcx.appendTo(inputGroup);
												$.each(indicate.options, function(k, option) {
													var check = false;
													if (initdata[indicate.indicateOid] && initdata[indicate.indicateOid].collectOption == option.oid) {
														check = true;
													}
													if (!initdata[indicate.indicateOid] && option.dft == 'YES') {
														check = true;
													}
													var inputOption = $('<option value="' + option.oid + '" ' + (check ? 'selected' : '') + '>' + option.title + '</option>');
													inputOption.appendTo(inputOcx);
												});
											}

											if (indicate.indicateType == 'NUMRANGE') {
												var inputOcx = $('<input name="collectData" type="text" value="' + (initdata[indicate.indicateOid] ? initdata[indicate.indicateOid].collectData : '') + '" class="form-control">');
												inputOcx.appendTo(inputGroup);
											}

											if (indicate.indicateType == 'TEXT') {
												var inputOcx = $('<select name="options" class="form-control input-sm"></select>');
												inputOcx.appendTo(inputGroup);
												$.each(indicate.options, function(k, option) {
													var check = false;
													if (initdata[indicate.indicateOid] && initdata[indicate.indicateOid].collectOption == option.oid) {
														check = true;
													}
													if (!initdata[indicate.indicateOid] && option.dft == 'YES') {
														check = true;
													}
													var inputOption = $('<option value="' + option.oid + '" ' + (check ? 'selected' : '') + '>' + option.title + '</option>');
													inputOption.appendTo(inputOcx);
												});
											}

											if (indicate.indicateUnit && indicate.indicateUnit != '') {
												var inputSuffix = $('<span class="input-group-addon">' + indicate.indicateUnit + '</span>');
												inputSuffix.appendTo(inputGroup);
											}

										});

									});
								}

								$('#collectModal').modal('show');

							});

					});
			}

			$('#collectButton').on('click', function() {

				var data = {
					relative: document.collectForm.relative.value,
					type: document.collectForm.type.value,
					datas: []
				}

				$('#collectModalContent').find('form').each(function(x, form) {
					var config = {};
					$.each($(form).serializeArray(), function(i, v) {
						config[v.name] = v.value.trim();
					});
					data.datas.push(config);
				});

				// TODO 这个 data 对象是采集页面录入的数据, 可以根据具体业务场景使用
				console.log(data);
				$(document.addTargetForm.riskOption).val(JSON.stringify(data));
				$(document.editTargetForm.riskOption).val(JSON.stringify(data));
				$('#collectModal').modal('hide');
				/*
				http.post(config.api.system.config.ccr.indicate.collect.save, {
					data: JSON.stringify(data)
				}, function(rlt) {
					$('#collectForm').resetForm();
					$('#collectModalContent').empty();

					$('#collectModal').modal('hide');
				});
				*/
			});

			//标的详情过会表决表配置
			var voteTableConfig = {
					data: '',
					columns: [{
						field: 'name',
						align: 'center'
					}, {
						field: 'voteStatus',
						align: 'center',
						formatter: function(val) {
							return util.enum.transform('voteStates', val);
						}
					}, {
						field: 'time',
						align: 'center'
					}, {
						align: 'center',
						formatter: function(val, row) {
							var buttons = [{
								text: '下载',
								type: 'button',
								class: 'item-download',
								isRender: row.file != null && row.file != ''
							}];
							return util.table.formatter.generateButton(buttons, 'detVoteTable');
						},
						events: {
							'click .item-download': function(e, value, row) {
								location.href = row.file + '?realname=' + row.fileName
							}
						}
					}]
				}
				// 初始化表决状态表格
			$('#detVoteTable').bootstrapTable(voteTableConfig)
				//已确认检查项表格配置
			var confrimCheckListConfig = {
				data: '',
				columns: [{
					field: 'text',
					align: 'center'
				}, {
					field: 'remark',
					align: 'center'
				}, {
					field: 'time',
					align: 'center'
				}, {
					field: 'checker',
					align: 'center'
				}, {
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download',
							isRender: row.file != null && row.file != ''
						}];
						return util.table.formatter.generateButton(buttons, 'checkListConfrimTable');
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.file + '?realname=' + row.fileName
						}
					}
				}]
			}
			$('#checkListConfrimTable').bootstrapTable(confrimCheckListConfig)
			var checkConditionsSource;
			// 临时存储已选数量
			var checkConditionsCount = 0
				// 临时存储操作检查项
			var currentCheckCondition = null
				// 确认项表格配置
			var checkConditionsTableConfig = {
					data: checkConditionsSource,
					columns: [{
						checkbox: true

					}, {
						field: 'text'
					}, {
						width: 100,
						align: 'center',
						formatter: function() {
							var buttons = [{
								text: '附件与备注',
								type: 'button',
								class: 'item-file'
							}]
							return util.table.formatter.generateButton(buttons, 'checkConditionsTable')
						},
						events: {
							'click .item-file': function(e, value, row) {
								currentCheckCondition = row
								var form = document.fileAndRemarkForm
								form.remark.value = row.remark
								form.file.value = row.file
								if (row.file) {
									$('#checkFile').show().find('a').attr('href', row.file)
									$('#checkFile').find('span').html('下载')
								} else {
									$('#checkFile').show().find('a').attr('href', '#')
									$('#checkFile').find('span').html('')
									$('#checkFile').hide()
								}
								$('#fileAndRemarkModal').modal('show')
							}
						}
					}],
					// 单选按钮选中一项时
					onCheck: function(row) {
						row.checked = true
						checkConditionsCount += 1
						var percentage = Math.round(checkConditionsCount / checkConditionsSource.length * 100)
						renderProgressbar(percentage)
					},
					// 单选按钮取消一项时
					onUncheck: function(row) {
						row.checked = false
						checkConditionsCount -= 1
						var percentage = Math.round(checkConditionsCount / checkConditionsSource.length * 100)
						renderProgressbar(percentage)
					},
					// 全选按钮选中时
					onCheckAll: function(rows) {
						checkConditionsSource.forEach(function(item) {
							item.checked = true
						})
						checkConditionsCount = checkConditionsSource.length
						renderProgressbar(100)
					},
					// 全选按钮取消时
					onUncheckAll: function() {
						checkConditionsSource.forEach(function(item) {
							item.checked = false
						})
						checkConditionsCount = 0
						renderProgressbar(0)
					}
				}
				// 初始化确认项表格
			$('#checkConditionsTable').bootstrapTable(checkConditionsTableConfig)
				// 初始化附件与备注 - 附件上传
			$$.uploader({
					container: $('#checkUploader'),
					success: function(file) {
						$('#checkFile').show().find('a').attr('href', file.url)
						$('#checkFile').find('span').html(file.name)
						document.fileAndRemarkForm.file.value = file.url
						document.fileAndRemarkForm.fileName.value = file.name
						document.fileAndRemarkForm.fileSize.value = file.size
					}
				})
				// 附件与备注确定按钮点击事件
			$('#doAddFileAndRemark').on('click', function() {
					var form = document.fileAndRemarkForm
					currentCheckCondition.remark = form.remark.value.trim()
					currentCheckCondition.file = form.file.value
					$('#fileAndRemarkModal').modal('hide')
				})
				// 确认检查项 - 确定按钮点击事件
			$('#doConfirmCheckConditions').on('click', function() {
				document.checkConditionsForm.checkConditions.value = JSON.stringify(checkConditionsSource)
				console.log(checkConditionsSource)
				$('#checkConditionsForm').ajaxSubmit({
					type: "post", //提交方式  
					url: config.api.confirmCheckList,
					success: function(data) {
						$('#checkConditionsModal').modal('hide')
					}
				})
			})

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.targetName = form.searchName.value.trim();
				pageOptions.targetType = form.targetType.value.trim();
				pageOptions.state = form.targetStatus.value.trim();
				return val
			}
		}
	}

	function saveTarget() {
		$('#addTargetForm').ajaxSubmit({
			url: config.api.targetAdd,
			success: function(result) {
				util.form.reset($('#addTargetForm')); // 先清理表单
				$('#addTargetModal').modal('hide');
				$('#targetApplyTable').bootstrapTable('refresh');
			}
		})
	}

	function editTarget() {
		$('#editTargetForm').ajaxSubmit({
			url: config.api.targetEdit,
			success: function(result) {
				util.form.reset($('#editTargetForm')); // 先清理表单
				$('#editTargetModal').modal('hide');
				$('#targetApplyTable').bootstrapTable('refresh');
			}
		})
	}

	function saveProject() {
		if (!$('#projectForm').validator('doSubmitCheck')) return
		$('#projectForm').ajaxSubmit({
			type: "post", //提交方式  
			//dataType:"json", //数据类型'xml', 'script', or 'json'  
			url: config.api.saveProject,
			//			contentType : 'application/json',
			success: function(result) {
				util.form.reset($('#projectForm')); // 先清理表单
				$('#projectModal').modal('hide');
				$('#projectTable').bootstrapTable('refresh'); // 项目表单重新加载
				$('#targetApplyTable').bootstrapTable('refresh'); // 标的标的重新加载
			}
		})
	}

	function renderProgressbar(percentage) {
		var currentClass = ''
		if (percentage <= 30) {
			currentClass = 'progress-bar-primary'
		} else if (percentage > 30 && percentage <= 60) {
			currentClass = 'progress-bar-danger'
		} else if (percentage > 60 && percentage <= 99) {
			currentClass = 'progress-bar-yellow'
		} else {
			currentClass = 'progress-bar-success'
		}
		$('#checkConditionsProgress')
			.removeClass('progress-bar-primary')
			.removeClass('progress-bar-danger')
			.removeClass('progress-bar-yellow')
			.removeClass('progress-bar-success')
			.addClass(currentClass)
			.css({
				width: percentage + '%'
			})
	}

	/**
	 * 初始化:担保方式下拉列表,抵押方式下拉列表,质押方式下拉列表
	 * 初始化:担保方式担保期限权数下拉列表,抵押方式担保期限权数下拉列表,质押方式担保期限权数下拉列表
	 */
	function initSel() {
		http.post(config.api.system.config.ccp.warrantyMode.search, {
			data: {},
			contentType: 'form'
		}, function(data) {
			if (data) { // 返回的是list
				var warrantorTypeSel = $(projectForm.guaranteeModeOid); // 保证方式select
				var pledgeTypeSel = $(projectForm.mortgageModeOid); // 抵押方式select
				var hypothecationTypeSel = $(projectForm.hypothecationModeOid); // 质押方式select
				$.each(data, function(i, item) {
					var oid = item.oid; // oid
					var title = item.title; // 名称 
					var weight = item.weight; // 权重
					var type = item.type; // 类型
					/**
					 * type:
					 * GUARANTEE-保证方式;
					 * MORTGAGE-抵押方式
					 * HYPOTHECATION-质押方式
					 */
					var option = $("<option>").val(oid).text(title);
					if ('GUARANTEE' === type && warrantorTypeSel) {
						warrantorTypeSel.append(option);
					} else if ('MORTGAGE' === type && pledgeTypeSel) {
						pledgeTypeSel.append(option);
					} else if ('HYPOTHECATION' === type && hypothecationTypeSel) {
						hypothecationTypeSel.append(option);
					}

				});
			}
		});

		// 担保期限权数
		http.post(config.api.system.config.ccp.warrantyExpire.search, {
			data: {},
			contentType: 'form'
		}, function(data) {
			console.info(data)
			if (data) { // 返回的是list
				var warrantorExpireSel = $(projectForm.guaranteeModeExpireOid); // 保证方式担保期限权数select
				var pledgeExpireSel = $(projectForm.mortgageModeExpireOid); // 抵押方式担保期限权数select
				var hypothecationExpireSel = $(projectForm.hypothecationModeExpireOid); // 质押方式担保期限权数select
				$.each(data, function(i, item) {
					var oid = item.oid; // oid
					var title = item.title; // 名称
					var weight = item.weight; // 权重

					warrantorExpireSel.append($("<option>").val(oid).text(title));
					pledgeExpireSel.append($("<option>").val(oid).text(title));
					hypothecationExpireSel.append($("<option>").val(oid).text(title));

				});
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