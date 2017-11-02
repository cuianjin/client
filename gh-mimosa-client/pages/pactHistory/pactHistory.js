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
		name: 'pactHistory',
		init: function() {
				// TODO 初始化标的类型
			config.init_target_type($(document.searchForm.type), true);
			// js逻辑写在这里
			var targetInfo;
			// 分页配置
			var pageOptions = {
					op: "historyList",
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
				onClickCell: function (field, value, row, $element) {
				  	switch (field) {
		        		case 'name':toDetail(value,row)
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
					visible: true,
					field: 'holdShare',
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
						$('#fangdaiForm').hide();
						$('#piaojvForm').hide();
						$('#zhaiquanForm').hide();
						$('#xintuoForm').hide();
						$('#qitaForm').hide();
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
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
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
					}  else {
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
						$('#fangdaiForm').hide();
						$('#piaojvForm').hide();
						$('#zhaiquanForm').hide();
						$('#xiaofeiForm').hide();
						$('#qitaForm').hide();
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
				columns: [{
					align: 'center',
					width: 60,
					formatter: function(val, row, index) {
						return index + 1
					}
				}, {
					field: 'repaymentType',
					formatter: function(val) {
						return util.enum.transform('ACCRUALTYPE', val);
					}
				}, {
					field: 'period',
				}, {
					field: 'repaymentDate'
				}, {
					field: 'capital',
					formatter: function(val) {
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
					}
				}, {
					field: 'profit',
					formatter: function(val) {
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
					}
				}, {
					field: 'overdueProfit',
					formatter: function(val) {
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
					}
				}, {
					field: 'amount',
					formatter: function(val) {
						var temp = util.safeCalc(val, '/', 10000, 6);
						return temp + "万";
					}
				}]
			};
			
			// 初始化数据表格
			$('#dataTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#dataTable'))

			// 查询资产池拥有该标的信息
			var assetPoolPageOptions = {
					page: 1,
					rows: 10
				}
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
						if (val)
							return (val / 10000).toFixed(2) + "万";
						return val;
					}
				}]
			};
			// 初始化数据表格
			$('#assetPoolTable').bootstrapTable(assetPoolTableConfig);

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
			 * 格式化投资标的信息
			 * @param {Object} t
			 */
			function formatTargetData(t) {
				if (t) {
					var t2 = {};
					$.extend(t2, t); //合并对象，修改第一个对象
					//t2.expAror = t2.expAror ? t2.expAror.toFixed(2) + '%' : "";
					//t2.overdueRate = t2.overdueRate ? t2.overdueRate.toFixed(2) + '%' : "";
					//t2.collectIncomeRate = t2.collectIncomeRate ? t2.collectIncomeRate.toFixed(2) + '%' : "";

					//t2.raiseScope = t2.raiseScope + '万';
					t2.life = t2.life + util.enum.transform('lifeUnit', t2.lifeUnit);
					//t2.floorVolume = t2.floorVolume + '万';
					t2.contractDays = t2.contractDays + '天/年';
					t2.collectDate = t2.collectStartDate + " 至 " + t2.collectEndDate
					t2.riskRate = util.table.formatter.convertRisk(t2.riskRate); // 格式化风险等级
					t2.accrualDate = t2.accrualDate ? t2.accrualDate + '个工作日以内' : t2.accrualDate;

					return t2;
				}
				return t;
			}
		}
	}
})