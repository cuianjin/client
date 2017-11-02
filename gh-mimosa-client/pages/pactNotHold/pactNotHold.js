/**
 * 投资标的备选库
 */
define([
	'http',
	'config',
	'extension',
	'util'
], function(http, config, $$, util) {
	return {
		name: 'pactNotHold',
		init: function() {
			
			// TODO 初始化标的类型
			config.init_target_type($(document.searchForm.type), true);
				// js逻辑写在这里
			
				
			var targetInfo;
			var dueDate;
			var principal;
			var interest;
			var repayment;
			var unsetupOid;
			// 分页配置
			var pageOptions = {
					op: "notHoldList",
					page: 1,
					rows: 10
				}
				// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.illiquidAsset.poolList, {
						data: pageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions.page,
				pageSize: pageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				onLoadSuccess: function() {},
				onClickRow: function(row, $element) {
					targetInfo = row;
				},
				onClickCell: function(field, value, row, $element) {
					switch(field) {
						case 'name':
							toDetail(value, row)
					}
				},
				columns: [{ // 编号
					align: 'left',
					field: 'sn',

				}, { // 名称
					align: 'left',
					field: 'name',
					class: 'table_title_detail'

				}, { // 类型
					align: 'left',
					field: 'type',
					formatter: function(val) {
						return util.enum.transform('TARGETTYPE', val);
					}
				}, { // 预期年化收益率
					align: 'right',
					field: 'expAror',
					formatter: function(val, row) {
						if(val)
							return(util.safeCalc(val, '*', 100, 2)).toFixed(2) + "%";
						return val;
					}
				}, {
					// 标的规模
					align: 'right',
					field: 'raiseScope',
					formatter: function(val, row) {
						if(row.type == "TARGETTYPE_15" || row.type == "TARGETTYPE_16") {
							var temp = util.safeCalc(row.purchaseValue, '/', 10000, 6);
							return temp + "万";
						} else {
							var temp = util.safeCalc(val, '/', 10000, 6);
							return temp + "万";
						}
					}
				}, { // 标的限期
					align: 'right',
					field: 'life',
					formatter: function(val, row) {
						if (row.type=="TARGETTYPE_08"){
							return val+ util.enum.transform('lifeUnit', row.lifeUnit);
						}else if (row.type=="TARGETTYPE_15" || row.type=="TARGETTYPE_16"){
							return val+"日";
						}else if (row.type=="TARGETTYPE_17"){
							return val+"日";
						}else if (row.type=="TARGETTYPE_18"){
							return val+"月";
						}else if (row.type=="TARGETTYPE_19"){
							return val+"日";
						}else{
							return val + util.enum.transform('lifeUnit', row.lifeUnit);
						}
					}

				}, { // 状态
					align: 'left',
					field: 'lifeState',
					formatter: function(val) {
						return util.enum.transform('illiquidAssetLifeStatesCondition', val);
					}

				}, { // 已持有份额
					align: 'right',
					visible: false,
					field: 'holdAmount',
					formatter: function(val) {
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
					}
				}, { // 申请中份额
					align: 'right',
					visible: true,
					field: 'applyAmount',
					formatter: function(val) {
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
					}
				}, { // 风险等级
					align: 'center',
					field: 'subjectRating',
					formatter: function(val) {
						return val;
						//return util.table.formatter.convertRisk(val);
					}
				}, {
					align: 'center',
					formatter: function(val, row, index) {
						var buttons = [{
							text: '操作',
							type: 'buttonGroup',
							isRender: true,
							//							isCloseBottom: index >= $('#dataTable').bootstrapTable('getData').length - 1,
							sub: [{
								text: '成立',
								class: 'item-UNSETUP',
								isRender: row.lifeState === 'UNSETUP' && row.type != 'TARGETTYPE_16' && row.type != 'TARGETTYPE_15' && row.type != 'TARGETTYPE_19'
							}, {
								text: '还款计划',
								class: 'item-plan',
								isRender: row.lifeState === 'UNSETUP' &&  row.lifeState != 'OVER_COLLECT' && row.type === 'TARGETTYPE_16' 
							},{
								text: '还款计划',
								class: 'item-plan',
								isRender: row.lifeState === 'UNSETUP' &&  row.lifeState != 'OVER_COLLECT' && row.type === 'TARGETTYPE_15' 
							},{
								text: '成立',
								class: 'item-UNSETUP',
								isRender: row.lifeState === 'OVER_COLLECT',
							}, {
								text: '成立失败',
								class: 'item-unEstablish',
								isRender: row.lifeState === 'OVER_COLLECT'
							}, {
								text: '还款计划',
								class: 'item-plan',
								isRender: row.lifeState === 'SETUP',
							}, {
								text: '还款计划',
								class: 'item-plan',
								isRender: row.lifeState === 'OVER_VALUEDATE',
							}, {
								text: '本息兑付',
								class: 'item-cash',
								isRender: row.lifeState === 'OVER_VALUEDATE',
							}, {
								text: '逾期',
								class: 'item-overdue',
								isRender: row.lifeState === 'OVER_VALUEDATE',
							}, {
								text: '逾期兑付',
								class: 'item-overdueIncome',
								isRender: row.lifeState === 'OVERDUE', // 只有逾期后的标的才能进行逾期兑付
							}, {
								text: '逾期转让',
								class: 'overdue-Transfer',
								isRender: row.lifeState === 'OVERDUE', // 只有逾期后的标的才能进行逾期转让
							}, {
								text: '坏账核销',
								class: 'item-cancel',
								isRender: row.lifeState === 'OVERDUE', // 只有逾期后的标的才能进行逾期转让
							}, {
								text: '还款计划',
								class: 'item-plan',
								isRender: row.lifeState === 'VALUEDATE',
							}]
						}]
						return util.table.formatter.generateButton(buttons, 'dataTable');
					},
					events: {
						'click .item-plan': function(e, value, row) { // 标的预计还款计划
							targetInfo = row;

							$('#viewPlanTable').bootstrapTable(planTableConfig)
							$('#viewPlanTable').bootstrapTable('refresh'); // 项目表单重新加载

							$('#planDataModal').modal('show');
						},
						'click .item-establish': function(e, value, row) { // 标的成立
							initEstablish(row);
						},
						'click .item-UNSETUP': function(e, value, row) { // 标的成立
							iniUnsetUp(row);
						},
						'click .item-unEstablish': function(e, value, row) { // 标的不成立
							initUnEstablish(row);
						},
						'click .item-close': function(e, value, row) { // 结束
							$("#confirmTitle").html("确定资产已结束？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.close, {
											data: {
												oid: row.oid
											},
											contentType: 'form'
										},
										function(obj) {
											$('#dataTable').bootstrapTable('refresh');
										});
								}
							});
						},
						'click .item-overdue': function(e, value, row) { // 逾期
							$("#confirmTitle").html("确定投资标的逾期？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.overdueN, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							});
						},
						'click .item-cash': function(e, value, row) { // 本息兑付
							$("#confirmTitle").html("确定正常还款？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.incomeSaveN, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							});
						},
						'click .item-overdueIncome': function(e, value, row) { // 标的逾期兑付
							$("#confirmTitle").html("确定可兑付？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.incomeSaveD, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							});
						},
						'click .overdue-Transfer': function(e, value, row) { // 逾期
							$("#confirmTitle").html("确定转让？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.overdueTransfer, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							});
						},
						'click .item-cancel': function(e, value, row) { // 坏账核销
							$("#confirmTitle").html("确定坏账核销？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.targetCancel, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							});
						}
					}
				}]
			}

			function iniUnsetUp(row) {
				unsetupOid = row.oid;
				// 初始化   付息日 
				/*
				for(var i = 1; i <= 30; i++) {
					var option = $("<option>").val(i).text(i);
					$(unsetupForm.accrualDate).append(option);
				}
				$(unsetupForm.accrualDate).val(10); // 默认10个工作日
				*/

				$(unsetupForm.accrualDate).empty();
				$('<option value="' + row.accrualDate + '">' + row.accrualDate + '</option>').appendTo($(unsetupForm.accrualDate));

				$$.detailAutoFix($('#targetDetailUnsetup'), formatTargetData(row));

				/*
				http.post(config.api.illiquidAsset.assetDetail, {
						data: {
							oid: row.oid
						},
						contentType: 'form'
					},
					function(obj) {
						var data = obj.data;
						if(!data) {
							toastr.error('标的详情数据不存在', '错误信息', {
								timeOut: 10000
							});
						}
						$$.detailAutoFix($('#targetDetailUnsetup'), formatTargetData(data));
						console.log(data);
						// 自动填充详情

						$$.formAutoFix($('#unsetupForm'), data); // 自动填充表单
					});
				*/

				// 重置和初始化表单验证

				$("#unsetupForm").validator('destroy')
				util.form.validator.init($("#unsetupForm"));

				/*
				$("#unsetupSubmit").hide();
				$("#noDisplayStar").hide();
				$("#noDisplayEnd").hide();
				$("#unsetupHash").hide();
				$('#incomeStartTest').hide();
				$('#incomeEndTest').hide();
				*/

				$('#unsetupForm_01').show();
				$('#unsetupForm_02').hide();

				$('#unsetupQuxiao').show();
				$('#unsetupNext').show();
				$('#unsetupHash').hide();
				$('#unsetupSubmit').hide();

				$(document.unsetupForm.buildDate).data("DateTimePicker").date(null);

				$(document.unsetupForm.buildDate).data("DateTimePicker").maxDate(new Date());

				var type = targetInfo.type;
				if(type == 'TARGETTYPE_17' || type == 'TARGETTYPE_18' || type == 'TARGETTYPE_08') {
					$(document.unsetupForm.incomeStartDate).data("DateTimePicker").disable();
				} else {
					$(document.unsetupForm.incomeStartDate).data("DateTimePicker").enable();
				}

				$('#unsetupModal').modal('show');

			}
			//			$('#establishNext').on('click', function() {
			//				$('#buildDateTest').show();
			//				$('#accrualDateTest').show();
			//				$('#incomeStartTest').show();
			//				$('#incomeEndTest').show();
			//				$('#planTable').show();
			//				$("#buildDate").hide();
			//				$("#fuxi").hide();
			//				$("#unsetupModal").hide();
			//				$("#incomeStartDate").hide();
			//				$("#incomeEndDate").hide();
			//				$("#establishNext").hide();
			//				$("#establishQuxiao").hide();
			//				$("#establishHash").show();
			//				$("#establishSubmit").show();
			//				// TODO 取值， 封装成json参数
			//				//{qishiri: '', jiezhiri: ''}
			//				var startDate = $(document.establishForm.incomeStartDate).val();
			//				var endDate = $(document.establishForm.incomeEndDate).val();
			//				var expAror = $('#expAror').text();
			//				var raiseScope = $('#raiseScope').text();
			//				var options ={startDate:startDate,endDate:endDate,raiseScope:raiseScope,expAror:expAror}
			//				console.log(options);
			//				$('#planTable').bootstrapTable('refresh', {
			//					url : config.api.illiquidAsset.changePlan,
			//					query: options,
			//				});
			//				
			//			});
			//			
			//			$('#establishHash').on('click', function() {
			//				$('#buildDateTest').hide();
			//				$('#accrualDateTest').hide();
			//				$('#incomeStartTest').hide();
			//				$('#incomeEndTest').hide();
			//				$('#planTable').hide();
			//				$("#unsetupModal").hide();
			//				$("#establishHash").hide();
			//				$("#establishSubmit").hide();
			//				$("#establishQuxiao").show();
			//				$("#buildDate").show();
			//				$("#fuxi").show();
			//				$("#incomeStartDate").show();
			//				$("#incomeEndDate").show();
			//				$("#establishNext").show();
			//				
			//			});

			$(document.unsetupForm.buildDate).on('dp.change', function() {

				var v = $(this).val();

				if(v == '') {
					$(document.unsetupForm.incomeStartDate).data("DateTimePicker").date(null);
					return;
				}

				var date = new Date(v)
				var date0;

				var type = targetInfo.type;

				if(type == 'TARGETTYPE_17' || type == 'TARGETTYPE_18' || type == 'TARGETTYPE_08') {
					date0 = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
				} else {
					date0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				}

				$(document.unsetupForm.incomeStartDate).data("DateTimePicker").minDate(date0);

				$(document.unsetupForm.incomeStartDate).data("DateTimePicker").date(date0);

			});

			$(document.unsetupForm.incomeStartDate).on('dp.change', function() {
				var v = $(this).val();

				if(v == '') {
					$(document.unsetupForm.incomeEndDate).data("DateTimePicker").date(null);
					return;
				}

				var date = new Date(v)
				var date0;

				if(targetInfo.lifeUnit == 'month') {
					date0 = new Date(date.getFullYear(), date.getMonth() + targetInfo.life, date.getDate());
				} else if(targetInfo.lifeUnit == 'year') {
					date0 = new Date(date.getFullYear() + targetInfo.life, date.getMonth(), date.getDate());
				} else {
					date0 = new Date(date.getFullYear(), date.getMonth(), date.getDate() + targetInfo.life);
				}

				$(document.unsetupForm.incomeEndDate).data("DateTimePicker").date(date0);

			});

			$('#unsetupHash').on('click', function() {

				$('#unsetupForm_01').show();
				$('#unsetupForm_02').hide();

				$('#unsetupQuxiao').show();
				$('#unsetupNext').show();
				$('#unsetupHash').hide();
				$('#unsetupSubmit').hide();

				/*
				$('#unsetupbuildDate').show();
				$('#unsetuppayTest').show();
				$('#unsetupStartDate').show();
				$('#unsetupEndDate').show();
				$('#unsetupPlanTable').hide();
				$('#unsetupHash').hide();
				$("#unsetupSubmit").hide();
				$("#unsetupQuxiao").show();
				$("#buildDate").show();
				$("#fuxi").show();
				$("#incomeStartDate").show();
				$("#incomeEndDate").show();
				$("#unsetupNext").show();
				*/
			});

			$('#unsetupNext').on('click', function() {
				if(!$('#unsetupForm').validator('doSubmitCheck')) return
				var date1 = $(document.unsetupForm.incomeStartDate).val();
				var date2 = $(document.unsetupForm.incomeEndDate).val();
				if(date1 == null || date1 == undefined || date1 == "Invalid Date24") {
					toastr.error('请选择成立日期 ', '提示信息')
					return false;
				}
				if(date2 == null || date2 == undefined) {
					return false;
				}
				if(Date.parse(date1) > Date.parse(date2)) {
					toastr.error('收益起始日必须小于收益截止日. ', '提示信息')
					return false;
				}

				$('#unsetupForm_01').hide();
				$('#unsetupForm_02').show();

				$('#unsetupQuxiao').hide();
				$('#unsetupNext').hide();
				$('#unsetupHash').show();
				$('#unsetupSubmit').show();

				/*
				$('#unsetupbuildDate').hide();
				$('#unsetuppayTest').hide();
				$('#unsetupStartDate').hide();
				$('#unsetupEndDate').hide();
				$('#unsetupPlanTable').show();
				$("#buildDate").hide();
				$("#buildDate").hide();
				$("#fuxi").hide();
				$("#establishModal").hide();
				$("#incomeStartDate").hide();
				$("#incomeEndDate").hide();
				$("#unsetupNext").hide();
				$("#unsetupQuxiao").hide();
				$("#unsetupHash").show();
				$("#unsetupSubmit").show();
				*/

				var startDate = $(document.unsetupForm.incomeStartDate).val();
				var endDate = $(document.unsetupForm.incomeEndDate).val();
				var expAror = targetInfo.expAror;
				var raiseScope = targetInfo.raiseScope;

				var options = {
					startDate: startDate,
					endDate: endDate,
					raiseScope: raiseScope,
					expAror: expAror,
					accrualType: targetInfo.accrualType,
					contractDays: targetInfo.contractDays,
					accrualDate: targetInfo.accrualDate
				};

				$('#unsetupForm_02').bootstrapTable('refresh', {
					url: config.api.illiquidAsset.changePlan,
					query: options
				});

				return;

			});

			$('#unsetupSubmit').on('click', function() {
				//var oid =row.oid

				var data = {
					oid: targetInfo.oid,
					setDate: $(document.unsetupForm.buildDate).val(),
					restStartDate: $(document.unsetupForm.incomeStartDate).val(),
					restEndDate: $(document.unsetupForm.incomeEndDate).val(),
					plans: []
				};

				var plans = $('#unsetupForm_02').bootstrapTable('getData');

				if(plans && plans.length > 0) {
					data.plans = plans;
				}
				
				http.post(config.api.illiquidAsset.savePlan, {
					data: JSON.stringify(data)
				}, function(rlt) {
					$("#unsetupModal").modal('hide');
					$('#dataTable').bootstrapTable('refresh');
				});

			});
			//zzq1
			var tableConfig1 = {

				columns: [{ // 编号
					align: 'left',
					field: 'issue',
					formatter: function(val, row) {
						issue = val;
						return val;
					}
				}, { // 还款日
					align: 'left',
					field: 'dueDate',
					formatter: function(val, row) {
						dueDate = val;
						return val;
					}
				}, {
					// 还款本金
					align: 'right',
					field: 'principal',
					formatter: function(val, row) {
						principal = val;
						return $.number(val, 2);
					}
				}, { // 还款利息
					align: 'right',
					field: 'interest',
					formatter: function(val, row) {
						interest = val;
						return $.number(val, 2);
					}

				}, { // 还款金额
					align: 'right',
					visible: true,
					field: 'repayment',
					formatter: function(val) {
						repayment = val;
						return $.number(val, 2);
					}
				}]

			}

			function toDetail(value, row) {
				http.post(config.api.illiquidAsset.assetDetail, {
					data: {
						oid: row.oid
					},
					contentType: 'form'
				}, function(result) {
					//					console.log(result);
					var data = result.data;

					if(data.type == "TARGETTYPE_17" || data.type == "TARGETTYPE_18") {
						// 消费
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级

						if(data.type == "TARGETTYPE_17") {
							$("#fenqiqixian").hide();
							$("#jiekuanqixian").show();
							if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#xjd_accrualDate").hide();
							}else{
							$("#xjd_accrualDate").show();
							}
						} else if(data.type == "TARGETTYPE_18") {
							$("#jiekuanqixian").hide();
							$("#fenqiqixian").show();
						}

						$$.detailAutoFix($('#xiaofeiForm'), data); // 自动填充详情

						$('#piaojvForm').hide();
						$('#zhaiquanForm').hide();
						$('#xintuoForm').hide();
						$('#qitaForm').hide();
						$('#fangdaiForm').hide();
						$('#xiaofeiForm').show();
					} else if(data.type == "TARGETTYPE_08") {
						// 债权
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
						data.life = data.life + util.enum.transform('lifeUnit', data.lifeUnit);
						//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级

						$$.detailAutoFix($('#zhaiquanForm'), data); // 自动填充详情
						if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#zq_restEndDate").show();
							$("#zq_accrualDate").hide();
						}else{
							$("#zq_restEndDate").hide();
							$("#zq_accrualDate").show();
						}
						$('#piaojvForm').hide();
						$('#xintuoForm').hide();
						$('#xiaofeiForm').hide();
						$('#qitaForm').hide();
						$('#fangdaiForm').hide();
						$('#zhaiquanForm').show();
					} else if(data.type == "TARGETTYPE_19") {
						// 供应链金融产品类型
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
						$$.detailAutoFix($('#qitaForm'), data); // 自动填充详情
						if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#gyl_accrualDate").hide();
						}else{
							$("#gyl_accrualDate").show();
						}
						$('#xintuoForm').hide();
						$('#xiaofeiForm').hide();
						$('#zhaiquanForm').hide();
						$('#piaojvForm').hide();
						$('#fangdaiForm').hide();
						$('#qitaForm').show();
					} else if(data.type == "TARGETTYPE_15" || data.type == "TARGETTYPE_16") {
						// 票据
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
						$$.detailAutoFix($('#piaojvForm'), data); // 自动填充详情

						$('#xintuoForm').hide();
						$('#xiaofeiForm').hide();
						$('#qitaForm').hide();
						$('#zhaiquanForm').hide();
						$('#fangdaiForm').hide();
						$('#piaojvForm').show();
					} else if(data.type == "TARGETTYPE_20") {
						//房抵贷
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.collectIncomeRate = util.safeCalc(data.collectIncomeRate, '*', 100, 2);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
						if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#fdd_accrualDate").hide();
						}else{
							$("#fdd_accrualDate").show();
						}
						data.accrualType = formatAccrualType(data.accrualType);
						data.accrualDate = "每月第"+data.accrualDate+"日";
						data.subjectRating = formatRiskLevel(data.subjectRating);
						$$.detailAutoFix($('#fangdaiForm'), data); // 自动填充详情
						$("#imgsrcp").attr("href",data.productSpecifications);
						$("#imgsrcps").attr("src",data.productSpecifications);
						$("#imgsrcb").attr("href",data.riskDisclosure);
						$("#imgsrcbs").attr("src",data.riskDisclosure);
						$("#imgsrcm").attr("href",data.platformServiceAgreement);
						$("#imgsrcms").attr("src",data.platformServiceAgreement);
						$("#imgsrch").attr("href",data.photocopy);
						$("#imgsrchs").attr("src",data.photocopy);
						$('#xintuoForm').hide();
						$('#xiaofeiForm').hide();
						$('#qitaForm').hide();
						$('#zhaiquanForm').hide();
						$('#piaojvForm').hide();
						$('#fangdaiForm').show();
					} else {
						//信托
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.restTrustAmount =util.safeCalc(data.purchaseValue, '-', data.applyAmount, 6);
						data.restTrustAmount =util.safeCalc(data.restTrustAmount, '-', data.holdShare, 6);
						data.restTrustAmount = util.safeCalc(data.restTrustAmount, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						data.starValue = util.safeCalc(data.starValue, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.collectIncomeRate = util.safeCalc(data.collectIncomeRate, '*', 100, 2);
						data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
						data.life = data.life + util.enum.transform('lifeUnit', data.lifeUnit);
						if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#xt_accrualDate").hide();
						}else{
							$("#xt_accrualDate").show();
						}
						data.contractDays = data.contractDays + '天/年';
						data.collectDate = data.collectStartDate + " 至 " + data.collectEndDate
							//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
						$$.detailAutoFix($('#xintuoForm'), data); // 自动填充详情

						$('#piaojvForm').hide();
						$('#zhaiquanForm').hide();
						$('#xiaofeiForm').hide();
						$('#qitaForm').hide();
						$('#fangdaiForm').hide();
						$('#xintuoForm').show();
					}

					if(data.state != 'reject') {
						$("#rejectDesc").hide()
					} else {
						$("#rejectDesc").show()
					}
					$('#meetingDet').hide(); // 统一版本去掉过会环节
					$('#targetDetailModal').modal('show');
				})

			}
			var planPageOptions = {
				page: 1,
				rows: 20
			}
			var planTableConfig = {
				ajax: function(origin) {
					http.post(config.api.illiquidAsset.planList, {
						data: planPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: planPageOptions.page,
				pageSize: planPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					planPageOptions.rows = val.limit
					planPageOptions.page = parseInt(val.offset / val.limit) + 1
					planPageOptions.targetOid = targetInfo.oid.trim(); // 标的id				

					return val
				},
				

				onLoadSuccess: function(data) {
				},
				columns: [{ // 编号
					align: 'left',
					field: 'issue',
					formatter: function(val, row) {
						issue = val;
						return val;
					}
				},{
					field: 'repaymentType',
					formatter: function(val) {
						return util.enum.transform('ACCRUALTYPE', val);
					}
				}, { // 还款日
					align: 'left',
					field: 'dueDate',
					formatter: function(val, row) {
						dueDate = val;
						return val;
					}
				}, {
					// 还款本金
					align: 'right',
					field: 'principal',
					formatter: function(val, row) {
						principal = val;
						return $.number(val, 2);
					}
				}, { // 还款利息
					align: 'right',
					field: 'interest',
					formatter: function(val, row) {
						interest = val;
						return $.number(val, 2);
					}

				}, { // 还款金额
					align: 'right',
					visible: true,
					field: 'repayment',
					formatter: function(val) {
						repayment = val;
						return $.number(val, 2);
					}
				}]

			};
			// 分页配置
			var incomePageOptions = {
					page: 1,
					rows: 10
				}
				// 数据表格配置
			var incomeTableConfig = {
				ajax: function(origin) {
					if(incomePageOptions.targetOid) {
						http.post(config.api.investmentTargetIncomeList, {
							data: incomePageOptions,
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					}
				},
				pageNumber: incomePageOptions.page,
				pageSize: incomePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					incomePageOptions.targetOid = targetInfo ? targetInfo.oid : "";
					incomePageOptions.rows = val.limit
					incomePageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				onLoadSuccess: function() {},
				columns: [{
					//编号
					// field: 'oid',
					visible: false,
					width: 60,
					formatter: function(val, row, index) {
						return index + 1
					}
				}, { // 兑付期数
					field: 'seq',

				}, { // 实际支付收益
					field: 'incomeRate',
					formatter: function(val, row, index) {
						if(val)
							return(val * 100.0).toFixed(2) + "%";
						return val;
					}
				}, { // 收益支付日
					field: 'incomeDate',

				}, { // 录入时间
					field: 'createTime',
					visible: false,
				}, { // 操作员
					field: 'operator',
					visible: false,
				}, ],
			}

			// 初始化数据表格
			$('#incomeTable').bootstrapTable(incomeTableConfig);

			//初始化还款计划表格zzq
			$('#planTable').bootstrapTable(tableConfig1);
			$('#unsetupForm_02').bootstrapTable(tableConfig1);

			// 初始化数据表格
			$('#dataTable').bootstrapTable(tableConfig);
			// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#dataTable'))

			// 查询资产池拥有该标的信息
			var assetPoolPageOptions = {
					page: 1,
					rows: 10
			};
			// 数据表格配置
			var assetPoolTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.target.getDataByTargetOid, {
						data: assetPoolPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: assetPoolPageOptions.page,
				pageSize: assetPoolPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getAssetPoolQueryParams,
				onLoadSuccess: function() {},
				columns: [{ // 编号
					field: 'assetPoolOid',
					visible: false
				}, { // 资产池名称
					field: 'assetPoolName',
				}, { // 资产池金额
					field: 'volume',
					formatter: function(val) {
						if(val)
							return(val / 10000).toFixed(2) + "万";
						return val;
					}
				}]
			};
			// 初始化数据表格
			//$('#assetPoolTable').bootstrapTable(assetPoolTableConfig);

			// 成立 按钮点击事件
			/*
			$("#establishSubmit").click(function() {
				if(!$('#establishForm').validator('doSubmitCheck')) return
				var date1 = $(document.establishForm.incomeStartDate).val();
				var date2 = $(document.establishForm.incomeEndDate).val();
				if(Date.parse(date1) > Date.parse(date2)) {
					toastr.error('收益起始日必须小于收益截止日. ', '提示信息')
					return false;
				}
				$("#establishForm").ajaxSubmit({
					type: "post", //提交方式  
					url: config.api.illiquidAsset.establish,
					success: function(data) {
						$('#establishForm').clearForm();
						$('#establishModal').modal('hide');
						$('#dataTable').bootstrapTable('refresh');
					}
				});

			});
			*/

			// 不成立 按钮点击事件
			$("#unEstablishSubmit").click(function() {
				http.post(config.api.illiquidAsset.unEstablish, {
					data: {
						oid: $('#unEstablishModalAssetPoolOid').val()
					},
					contentType: 'form'
				}, function(result) {
					$('#unEstablishModal').modal('hide');
					$('#dataTable').bootstrapTable('refresh');
				})

			});

			function initEstablish(row) {
				// 初始化   付息日 
				for(var i = 1; i <= 30; i++) {
					var option = $("<option>").val(i).text(i);
					$(establishForm.accrualDate).append(option);
				}
				$(establishForm.accrualDate).val(10); // 默认10个工作日

				http.post(config.api.illiquidAsset.assetDetail, {
						data: {
							oid: row.oid
						},
						contentType: 'form'
					},
					function(obj) {
						var data = obj.data;
						if(!data) {
							toastr.error('标的详情数据不存在', '错误信息', {
								timeOut: 10000
							});
						}
						$$.detailAutoFix($('#targetDetailEstablish'), formatTargetData(data));
						// 自动填充详情

						$$.formAutoFix($('#establishForm'), data); // 自动填充表单
					});

				// 重置和初始化表单验证
				$("#establishForm").validator('destroy')
				util.form.validator.init($("#establishForm"));
				$('#establishModal').modal('show');
				$("#establishSubmit").hide();
				$("#establishHash").hide();
				$('#buildDateTest').hide();
				$('#accrualDateTest').hide();
				$('#incomeStartTest').hide();
				$('#incomeEndTest').hide();
			}

			function initUnEstablish(row) {

				http.post(config.api.illiquidAsset.assetDetail, {
						data: {
							oid: row.oid
						},
						contentType: 'form'
					},
					function(obj) {
						//						console.log(obj)
						var data = obj.data;
						if(!data) {
							toastr.error('标的详情数据不存在', '错误信息', {
								timeOut: 10000
							});
						}
						$('#unEstablishModalAssetPoolOid').val(obj.data.oid);
						$$.detailAutoFix($('#targetDetailUnEstablish'), formatTargetData(data)); // 自动填充详情
					});

				// 重置和初始化表单验证
				$("#unEstablishForm").validator('destroy')
				util.form.validator.init($("#unEstablishForm"));
				$('#unEstablishModal').modal('show');
			}

			function getQueryParams(val) {
				var form = document.searchForm
				$.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象

				pageOptions.rows = val.limit
				pageOptions.page = parseInt(val.offset / val.limit) + 1

				return val
			}

			function getAssetPoolQueryParams(val) {
				assetPoolPageOptions.oid = targetInfo ? targetInfo.oid : "";
				assetPoolPageOptions.rows = val.limit
				assetPoolPageOptions.page = parseInt(val.offset / val.limit) + 1
				return val;
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
			};
			
			/**
			 * 格式化还款方式
			 * @param {Object} val
			 */
			function formatAccrualType(val) {
				if(val == 'A_DEBT_SERVICE_DUE') {
					return '一次性还本付息 '
				}
				if(val == 'EACH_INTEREST_RINCIPAL_DUE') {
					return '按月付息到期还本  '
				}
				if(val == 'FIXED-PAYMENT_MORTGAGE') {
					return '等额本息  '
				}
				if(val == 'FIXED-BASIS_MORTGAGE') {
					return '等额本金  '
				}
			};

			/**
			 * 格式化投资标的信息
			 * @param {Object} t
			 */
			function formatTargetData(t) {
				if(t) {
					var t2 = {};
					$.extend(t2, t); //合并对象，修改第一个对象
					t2.expAror = t2.expAror ? util.safeCalc(t2.expAror, '*', 100, 4) + '%' : "";
					//t2.overdueRate = t2.overdueRate ? t2.overdueRate.toFixed(2) + '%' : "";
					t2.collectIncomeRate = t2.collectIncomeRate ? util.safeCalc(t2.collectIncomeRate, '*', 100, 2) + '%' : "";

					t2.raiseScope = util.safeCalc(t2.raiseScope, '/', 10000, 6);
					t2.life = t2.life + util.enum.transform('lifeUnit', t2.lifeUnit);
					//t2.floorVolume = t2.floorVolume + '万';
					//t2.trustAmount = t2.trustAmount ? t2.trustAmount + '万' : "";
					//t2.restTrustAmount = t2.restTrustAmount ? t2.restTrustAmount + '万' : "";
					t2.contractDays = t2.contractDays + '天/年';
					t2.collectDate = t2.collectStartDate + " 至 " + t2.collectEndDate
						//t2.riskRate = util.table.formatter.convertRisk(t2.riskRate); // 格式化风险等级
					t2.accrualDate = t2.accrualDate ? t2.accrualDate + '个工作日以内' : t2.accrualDate;

					return t2;
				}
				return t;
			}
			//			$(document.establishForm.change).change(function() {
			//				$('#establishForm').ajaxSubmit({
			//							url: config.api.
			//							success: function(result) {
			//								util.form.reset($('#editTargetForm')); // 先清理表单
			//								util.form.reset($('#editqitaForm')); // 先清理表单
			//								$('#editTargetModal').modal('hide');
			//								$('#targetApplyTable').bootstrapTable('refresh');
			//							}
			//						})
			//				
			//				
			//				
			//			}
		}
	}
})