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
		name: 'pactAccess',
		init: function() {
			// 分页配置
			var pageOptions = {
					number: 1,
					size: 10
				}
				// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.illiquidAsset.checklist, {
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
					onClickCell: function (field, value, row, $element) {
					  	switch (field) {
			        		case 'name':toDetail(value,row)
					  	}
					},
					columns: [{
						align: 'left',
						field: 'sn'
					}, {
						align: 'left',
						field: 'name',
						class: 'table_title_detail'
					}, {
						align: 'left',
						field: 'accrualType',
						formatter: function(val) {
							return util.enum.transform('ACCRUALTYPE', val);
						}
					}, {
						align: 'right',
						field: 'expSetDate',
						visible: false,
					}, {
						align: 'left',
						field: 'type',
						formatter: function(val) {
							return util.enum.transform('TARGETTYPE', val);
						}
					}, {
						align: 'right',
						field: 'raiseScope',
						formatter: function(val, row) {
							if (row.type=="TARGETTYPE_15" || row.type=="TARGETTYPE_16"){
								var temp = util.safeCalc(row.purchaseValue, '/', 10000, 6);
								return temp + "万";
							}else{
								var temp = util.safeCalc(val, '/', 10000, 6);
								return temp + "万";
							}
						}
					}, {
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
					}, {
						align: 'right',
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
						align: 'left',
						field: 'state',
						formatter: function(val) {
							return util.enum.transform('illiquidAssetStates', val);
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							console.log("z1"+row.type);
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								isRender: true,
//								isCloseBottom: index >= $('#targetAccessTable').bootstrapTable('getData').length - 1,
								sub: [{
									text: '预审',
									class: 'item-check',
									isRender: row.type != 'TARGETTYPE_08' && row.type != 'TARGETTYPE_15' && row.type != 'TARGETTYPE_16' && row.type != 'TARGETTYPE_17' && row.type != 'TARGETTYPE_18' && row.type != 'TARGETTYPE_19' && row.type != 'TARGETTYPE_20'
								},{
									text: '通过',
									class: 'item-checkY',
									isRender: row.type == 'TARGETTYPE_08' || row.type == 'TARGETTYPE_15' || row.type == 'TARGETTYPE_16' || row.type == 'TARGETTYPE_17' || row.type == 'TARGETTYPE_18' || row.type == 'TARGETTYPE_19'|| row.type == 'TARGETTYPE_20'
								},{
									text: '驳回',
									class: 'item-checkN',
									isRender: row.type == 'TARGETTYPE_08' || row.type == 'TARGETTYPE_15' || row.type == 'TARGETTYPE_16' || row.type == 'TARGETTYPE_17' || row.type == 'TARGETTYPE_18' || row.type == 'TARGETTYPE_19' || row.type =='TARGETTYPE_20'
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'targetAccessTable');
						},
						events: {
							'click .item-checkN': function(e, value, row) {
								$("#confirmTitle").html("确定审核驳回？")
								$$.confirm({
									container: $('#doConfirm'),
									trigger: this,
									accept: function() {
										http.post(config.api.illiquidAsset.checkpassN, {
											data: {
												oid: row.oid
											},
											contentType: 'form'
										}, function(result) {
//											console.log(result);
											$('#targetAccessTable').bootstrapTable('refresh');
										}
									)}
								})
							},
							'click .item-checkY': function(e, value, row) {
								console.log("zzq1");
								$("#confirmTitle").html("确定审核通过？")
								console.log("zzq2");
								$$.confirm({
									container: $('#doConfirm'),
									trigger: this,
									accept: function() {
										http.post(config.api.illiquidAsset.checkpassY, {
											data: {
												oid: row.oid
											},
											contentType: 'form'
										}, function(result) {
//											console.log(result);
											$('#targetAccessTable').bootstrapTable('refresh');
										}
									)}
								})
							},
							'click .item-check': function(e, value, row) {
								$('#accessFrom').validator('destroy')
								util.form.reset($('#accessFrom')); // 先清理表单
								document.accessFrom.oid.value = row.oid
								if (row.type=="TARGETTYPE_15" || row.type=="TARGETTYPE_16"){
									document.accessFrom.assetAmount.value = util.safeCalc(row.purchaseValue, '/', 10000, 6)
								}else if (row.raiseScope) {
									document.accessFrom.assetAmount.value = util.safeCalc(row.raiseScope, '/', 10000, 6)
								}
								util.form.validator.init($('#accessFrom'))
								$('#accessModal').modal('show');
							},
							'click .item-project': function(e, value, row) { // 底层项目 按钮点击事件
								targetInfo = row; // 变更某一行 投资标的信息
								// 初始化底层项目表格
								$('#projectTable').bootstrapTable(projectTableConfig)
								$('#projectTable').bootstrapTable('refresh'); // 项目表单重新加载
								$$.searchInit($('#projectSearchForm'), $('#projectTable'))
								$('#projectDataModal').modal('show');
							}
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
					
					if (data.type=="TARGETTYPE_17" || data.type=="TARGETTYPE_18"){
						// 消费
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.loanVolume = util.safeCalc(data.loanVolume, '/', 10000, 6);
						data.serviecYield = util.safeCalc(data.serviecYield, '*', 100, 2);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
						
						if (data.type=="TARGETTYPE_17"){
							$("#fenqiqixian").hide();
							$("#jiekuanqixian").show();
							if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#xjd_accrualDate").hide();
							}else{
							$("#xjd_accrualDate").show();
							}
						}else if(data.type=="TARGETTYPE_18"){
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
					}else if(data.type=="TARGETTYPE_08"){
						// 债权
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
						data.life = data.life+util.enum.transform('lifeUnit', data.lifeUnit);
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
					}else if(data.type=="TARGETTYPE_19"){
						// 供应链金融产品类型
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
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
					}else if(data.type=="TARGETTYPE_15" || data.type=="TARGETTYPE_16"){
						// 票据
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						//data.riskRate = util.table.formatter.convertRisk(data.riskRate); // 格式化风险等级
						$$.detailAutoFix($('#piaojvForm'), data); // 自动填充详情
						
						$('#xintuoForm').hide();
						$('#xiaofeiForm').hide();
						$('#zhaiquanForm').hide();
						$('#qitaForm').hide();
						$('#fangdaiForm').hide();
						$('#piaojvForm').show();
					}else if(data.type == "TARGETTYPE_20") {
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
					} 
					else{
						//信托
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.starValue = util.safeCalc(data.starValue, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						data.restTrustAmount = util.safeCalc(data.restTrustAmount, '/', 10000, 6);
						data.floorVolume = util.safeCalc(data.floorVolume, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.collectIncomeRate = util.safeCalc(data.collectIncomeRate, '*', 100, 2);
						data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
						data.life = data.life + util.enum.transform('lifeUnit', data.lifeUnit);
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
					
					if (data.state != 'reject') {
						$("#rejectDesc").hide()
					} else {
						$("#rejectDesc").show()
					}
					$('#meetingDet').hide(); // 统一版本去掉过会环节
					$('#targetDetailModal').modal('show');
				})
			}
				// 初始化表格
			$('#targetAccessTable').bootstrapTable(tableConfig)

			var prjPageOptions = {}
			var projectTableConfig = {
				ajax: function(origin) {
					http.post(config.api.illiquidAsset.projectlist, {
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
				onClickCell: function (field, value, row, $element) {
				  	switch (field) {
		        		case 'projectName':toPrjDetail(value,row)
				  	}
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
					align: 'left',
					field: 'projectName',
					class: 'table_title_detail'
				}, {
					//项目项目经理
					align: 'left',
					field: 'projectManager',
				}, {
					//项目项目类型
					align: 'left',
					field: 'projectType',
					formatter: function(val) {
						return util.enum.transform('PROJECTTYPE', val);
					}
				}, {
					//城市
					align: 'left',
					field: 'projectCity',
				}, {
					//创建时间
					align: 'right',
					field: 'createTime',
				}]
			};
			
			function toPrjDetail(value, row) { // 底层项目详情
				http.post(config.api.illiquidAsset.projectDetail, {
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

			function getQueryParams(val) {
				var form = document.targetSearchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				return val
			}

            $('#checkPurchaseValue,#checkAssetAmount').on('blur', function() {
					validCDate()
				})
			function validCDate() {
				var flag = true
				$('#PurchaseDiv').removeClass("has-error")
				$('#PurchaseErr').html('')
				var value1 = $('#checkPurchaseValue').val()
				var value2 = $('#checkAssetAmount').val()
				console.log(value1);
				if (parseFloat(value1)>parseFloat(value2)) {
					$('#PurchaseErr').html('授信额度不能大于资产规模')
					$('#PurchaseDiv').addClass("has-error")
					flag = false
				}
				return flag
			}

			$('#checkpass').on('click', function() {
				$(document.accessFrom.trustAmount).attr('required', true);
				// 重置和初始化表单验证
				$("#accessFrom").validator('destroy')
				util.form.validator.init($("#accessFrom"));
				if (!$('#accessFrom').validator('doSubmitCheck')) return
				
				if (!$(document.accessFrom.trustAmount).val()) {
					alert('审核通过时授信额度必须大于0')
					return false;
				}
				$("#confirmTitle").html("确定审核通过？")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						check(config.api.illiquidAsset.checkpass);
					}
				})
			})
			$('#checkreject').on('click', function() {
				$(document.accessFrom.trustAmount).removeAttr('required');
				// 重置和初始化表单验证
				$("#accessFrom").validator('destroy')
				util.form.validator.init($("#accessFrom"));
				$("#confirmTitle").html("确定审核驳回？")
				$$.confirm({
					container: $('#doConfirm'),
					trigger: this,
					accept: function() {
						check(config.api.illiquidAsset.checkreject);
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
			//t2.riskRate = util.table.formatter.convertRisk(t2.riskRate); // 格式化风险等级

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
