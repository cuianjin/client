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
		name: 'pactApply',
		init: function() {
			// TODO 初始化标的类型
			config.init_target_type($(document.targetSearchForm.targetType), true)
			config.init_target_type($('#bdType'))
			//新建标的 募集期起始日 截止日 拟成立日 控件 onblur事件
			$('#createCollectStartDate,#createCollectEndDate').on('blur', function() {
					validCDate()
				})
			$('#cStarValue,#cRaiseScope').on('change', function() {
					validStarValue()
				})
				//校验新建标的 募集期起始日 截止日 拟成立日 
			function validCDate() {
				var flag = true
				$('#cdateDiv1').removeClass("has-error")
				$('#cdateDiv2').removeClass("has-error")
				$('#cdateErr1').html('')
				$('#cdateErr2').html('')
				var data1 = $('#createCollectStartDate').val()
				var data2 = $('#createCollectEndDate').val()
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
				return flag
			}
			function validStarValue() {
				var flag = true
				$('#cStarVDiv').removeClass("has-error")
				$('#cStarVErr').html('')
				var value1 = $('#cStarValue').val()
				var value2 = $('#cRaiseScope').val()
				if (!value1) {
					$('#cStarVErr').html('起够金额不能为空')
					$('#cStarVDiv').addClass("has-error")
					flag = false
				}
				if (isNaN(value1) || parseFloat(value1)>parseFloat(value2)) {
					$('#cStarVErr').html('起够金额不能大于资产规模')
					$('#cStarVDiv').addClass("has-error")
					flag = false
				}
				return flag
			}
			function valiqiate() {
				var flag = true
				$('#cdateDiv1').removeClass("has-error")
				$('#cdateDiv2').removeClass("has-error")
				$('#cStarVDiv').removeClass("has-error")
				$('#cdateErr1').html('')
				$('#cdateErr2').html('')
				$('#cStarVErr').html('')
			}
			$('#buildsetDateJr').on('blur', function() {
					validsDate()
				})
				function validsDate() {
					var flag = true
					$('#sdateErrJr').removeClass("has-error")
					$('#sdateErrJr').html('')
					var isSetup =$("#isSetup_Jr").val();
					if(isSetup=="YES"){
						var data1 = $('#buildsetDateJr').val()
						if (!data1) {
							$('#sdateErrJr').html('成立日不能为空')
							$('#sdateErrJr').addClass("has-error")
							flag = false
						}
					}else if(isSetup=="YES"){
						flag = true
					}
					return flag
				}
	 Date.prototype.Format = function (fmt) {  
        var o = {  
            "M+": this.getMonth() + 1, //月份   
            "d+": this.getDate(), //日   
            "h+": this.getHours(), //小时   
            "m+": this.getMinutes(), //分   
            "s+": this.getSeconds(), //秒   
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
            "S": this.getMilliseconds() //毫秒   
        };  
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));  
        for (var k in o)  
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));  
        return fmt;  
    }  
			$('#buildZqSetDate').on('blur', function() {
					//validsDateZq();
					if($("#life_zq").val()!=""&&$('#buildZqSetDate').val()!=""){
						var setDatev=new Date($('#buildZqSetDate').val());
						if($("#lifeUnit_zq").val()=="day"){
							 setDatev.setDate(setDatev.getDate()+parseInt($("#life_zq").val())-1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()+parseInt($("#life_zq").val()));
						}
						$("#buildZqEndDate").val(setDatev.Format("yyyy-MM-dd"));
					}
					else if($("#buildZqEndDate").val()!=""&&$('#buildZqSetDate').val()!=""){
						var setDatev=new Date($('#buildZqSetDate').val());
						var endDate=new Date($('#buildZqEndDate').val());
						if($("#lifeUnit_zq").val()=="day"){
							$("#life_zq").val(endDate.getDate()-setDatev.getDate()+1);
						}else{
							$("#life_zq").val(endDate.getMonth()-setDatev.getMonth());
						}
					}
					
				});
				$('#buildZqEndDate').on('blur', function() {
					if($("#life_zq").val()!=""&&$('#buildZqEndDate').val()!=""){
						var setDatev=new Date($('#buildZqEndDate').val());
						if($("#lifeUnit_zq").val()=="day"){
							 setDatev.setDate(setDatev.getDate()-parseInt($("#life_zq").val())+1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()-parseInt($("#life_zq").val()));
						}
						$("#buildZqSetDate").val(setDatev.Format("yyyy-MM-dd"));
					}else if($("#buildZqEndDate").val()!=""&&$('#buildZqSetDate').val()!=""){
						var setDatev=new Date($('#buildZqSetDate').val());
						var endDate=new Date($('#buildZqEndDate').val());
						if($("#lifeUnit_zq").val()=="day"){
						$("#life_zq").val(endDate.getDate()-setDatev.getDate()+1);
						}else{
							$("#life_zq").val(endDate.getMonth()-setDatev.getMonth());
						}
					}
				});
				$('#life_zq').on('blur', function() {
					if($("#life_zq").val()!=""&&$('#buildZqEndDate').val()!=""){
						var setDatev=new Date($('#buildZqEndDate').val());
						if($("#lifeUnit_zq").val()=="day"){
							setDatev.setDate(setDatev.getDate()-parseInt($("#life_zq").val())+1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()-parseInt($("#life_zq").val()));
						}
						$("#buildZqSetDate").val(setDatev.Format("yyyy-MM-dd"));
					}else if($("#life_zq").val()!=""&&$('#buildZqSetDate').val()!=""){
						var setDatev=new Date($('#buildZqSetDate').val());
						if($("#lifeUnit_zq").val()=="day"){
							setDatev.setDate(setDatev.getDate()+parseInt($("#life_zq").val())-1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()+parseInt($("#life_zq").val()));
							var setDate=new Date($('#buildZqSetDate').val());
						}
						$("#buildZqEndDate").val(setDatev.Format("yyyy-MM-dd"));
					}
				});
				function validsDateZq() {
					var flag = true
					$('#sdateErrZq').removeClass("has-error")
					$('#sdateErrZq').html('')
					var isSetup =$("#isSetup_Zq").val();
					if(isSetup=="YES"){
						var data1 = $('#buildZqSetDate').val()
						if (!data1) {
							$('#sdateErrZq').html('成立日不能为空')
							$('#sdateErrZq').addClass("has-error")
							flag = false
						}
					}else if(isSetup!="YES"){
						flag = true
					}
					return flag
				}
			//编辑标的 募集期起始日 截止日 拟成立日 控件 onblur事件
			$('#editCollectStartDate,#editCollectEndDate').on('blur', function() {
					validEDate()
				})
				//校验编辑标的 募集期起始日 截止日 拟成立日 
			function validEDate() {
				var flag = true
				$('#edateDiv1').removeClass("has-error")
				$('#edateDiv2').removeClass("has-error")
				$('#edateErr1').html('')
				$('#edateErr2').html('')
				var data1 = $('#editCollectStartDate').val()
				var data2 = $('#editCollectEndDate').val()
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
//					http.post(config.api.targetListQuery, {
					http.post(config.api.illiquidAsset.assetList, {
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
							var percentage = util.safeCalc(val, '*', 100, 2)
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
					field: 'subjectRating',
					formatter: function(val) {
						return val;
						//return util.table.formatter.convertRisk(val);
					}
				}, {
					align: 'left',
					formatter: function(val, row, index) {
						var buttons = [{
							text: '操作',
							type: 'buttonGroup',
							isRender: true,
							isCloseBottom: index >= $('#targetApplyTable').bootstrapTable('getData').length - 1,
							sub: [{
								text: '提交预审',
								class: 'item-check',
								isRender: row.state == 'CREATE' || row.state == 'REJECT' 
							},{
								text: '推荐入池',
								class: 'item-enter',
								isRender: row.state == 'PASS'
							}]
						}] 
						
						var format = util.table.formatter.generateButton(buttons, 'targetApplyTable');
						if(row.state == 'CREATE' || row.state == 'REJECT'){
		            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit"></span>'
		            		+'<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-invalid"></span>';
		            	}
		            	return format
					},
					events: {
						'click .item-enter': function(e, value, row) {
							$("#confirmTitle").html("确定确认投资标的？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.enterAsset, {
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
							
							// 加载付息日
							for (var i = 1; i <= 30; i++) {
								var option = $("<option>").val(i).text(i);
								$(editXiaofeiForm.accrualDate).append(option);
							}
							for (var i = 1; i <= 30; i++) {
								var option = $("<option>").val(i).text(i);
								$(editZhaiquanForm.accrualDate).append(option);
							}
							for (var i = 1; i <= 31; i++) {
								var option = $("<option>").val(i).text(i);
								$(editqitaForm.accrualDate).append(option);
							}
							for (var i = 1; i <= 31; i++) {
								var option = $("<option>").val(i).text(i);
								$(editXintuoForm.accrualDate).append(option);
							}
							for (var i = 1; i <= 31; i++) {
								var option = $("<option>").val(i).text(i);
								$(editfangdaiForm.accrualDate).append(option);
							}
							$(editXiaofeiForm.accrualDate).val(1); // 默认0个工作日
							$(editZhaiquanForm.accrualDate).val(1); // 默认0个工作日
							
							http.post(config.api.illiquidAsset.assetDetail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editPiaojvForm')); // 先清理表单
								util.form.reset($('#editXiaofeiForm')); // 先清理表单
								util.form.reset($('#editpiaojv_file_form')); // 先清理表单
								util.form.reset($('#editZhaiquanForm')); // 先清理表单
								util.form.reset($('#editXintuoForm')); // 先清理表单
								util.form.reset($('#editqitaForm')); // 先清理表单
								util.form.reset($('#editfangdaiForm')); // 先清理表单
								var data = result.data;
								$$.formAutoFix($('#editTargetForm'), data); // 自动填充表单
								
								// 重置表单验证
								$("#editTargetForm").validator('destroy');
								
								util.form.validator.init($("#editTargetForm"));	// 初始化表单验证
								
								if (data.type=="TARGETTYPE_17" || data.type=="TARGETTYPE_18"){
									 var buildShow =data.setDate;
										if(buildShow==""||buildShow==null){
											$("#edit_isSetup_Jr").val("NO");
											$("#edit_buildDate_Jr").hide();
			        						$("#editsetDateJr").attr('required',false)
										}else{
											$("#edit_isSetup_Jr").val("YES");
											$("#edit_buildDate_Jr").show();
			        						$("#editsetDateJr").attr('required',true)
										}
									// 消费
									
									//初始化省市
									initEditProvince();
									$("#editSelProvince option").each(function(){  
										if($(this).html()==data.province){  
										 	$(this).attr("selected",true);
										 	var selValue = $(this).val();
										 	$.each(city, function (k, p) { 
							                    if (p.ProID == selValue) {
							                        var option = "<option value='" + p.CityID + "'>" + p.CityName + "</option>";
							                        $("#editSelCity").append(option);
							                    }
							                });
							                
							                $("#editSelCity option").each(function(){  
												if($(this).html()==data.city){  
												 	$(this).attr("selected",true);
												 }
											})
										}
									})
									
									data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
									data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
									data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
									
									$$.formAutoFix($('#editXiaofeiForm'), data); // 自动填充详情
									$("#editXiaofeiForm").validator('destroy');
									util.form.validator.init($("#editXiaofeiForm"));	// 初始化表单验证
								   
									if (data.type=="TARGETTYPE_17"){
										$("#editpayDay").hide();
										$("#edit_fenqi").hide();
										$("#edit_jiekuan").show();
										$("#lifeOfD1").val(data.life);
										$("#lifeOfD1").attr("required",true);
									}else if(data.type=="TARGETTYPE_18"){
										$("#editpayDay").show();
										$("#edit_jiekuan").hide();
										$("#edit_fenqi").show();
										$("#lifeOfD1").attr("required",false);
									}
									
									$('#editpiaojv').hide();
									$('#editzhaiquan').hide();
									$('#editxintuo').hide();
									$('#editfangdai').hide();
									$('#editqita').hide();
									$('#editxiaofei').show();
								}else if(data.type=="TARGETTYPE_08"){
									// 债权
									data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
									data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
									data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
									
									$$.formAutoFix($('#editZhaiquanForm'), data); // 自动填充详情
									$("#editZhaiquanForm").validator('destroy');
									util.form.validator.init($("#editZhaiquanForm"));// 初始化表单验证
									
									$('#editpiaojv').hide();
									$('#editxintuo').hide();
									$('#editxiaofei').hide();
									$('#editqita').hide();
									$('#editfangdai').hide();
									$('#editzhaiquan').show();
									if(data.accrualType=="A_DEBT_SERVICE_DUE"){
										$("#edit_huankuai_zq").hide();
									}else{
										$("#edit_daoqiri_zq").hide();
									}
								}else if(data.type=="TARGETTYPE_15" || data.type=="TARGETTYPE_16"){
									// 票据
									data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
									data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
									$$.formAutoFix($('#editPiaojvForm'), data); // 自动填充详情
									$("#editPiaojvForm").validator('destroy');
									util.form.validator.init($("#editPiaojvForm"));// 初始化表单验证
									
									$('#editxintuo').hide();
									$('#editxiaofei').hide();
									$('#editzhaiquan').hide();
									$('#addqita').hide();
									$('#editfangdai').hide();
									$('#editpiaojv').show();
								}
								else if(data.type=="TARGETTYPE_19"){
									// 其他purchaseValue
									data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
									data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
									data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
									data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
									//data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
									$$.formAutoFix($('#editqitaForm'), data); // 自动填充详情
									$("#editqitaForm").validator('destroy');
									util.form.validator.init($("#editqitaForm"));// 初始化表单验证
									if(data.accrualType=="A_DEBT_SERVICE_DUE"){
										$("#accrualDate_Gy_edit").hide();
									}else{
										$("#accrualDate_Gy_edit").show();
									}
									$('#editxintuo').hide();
									$('#editxiaofei').hide();
									$('#editzhaiquan').hide();
									$('#editpiaojv').hide();
									$('#editfangdai').hide();
									$('#editqita').show();
								}else if(data.type=="TARGETTYPE_20"){
									// 债权
									data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
									data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
									data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
									data.collectIncomeRate = util.safeCalc(data.collectIncomeRate, '*', 100, 2);
									
									$$.formAutoFix($('#editfangdaiForm'), data); // 自动填充详情
									$("#editfangdaiForm").validator('destroy');
									util.form.validator.init($("#editfangdaiForm"));// 初始化表单验证
									 var h = $("#edit_fandidai_ticketNumber").val().split(",");
									 $("input[type=checkbox]").val(h);
									 var codename=$("#edit_idcard_photocopy_name").val();
									 var bankname=$("#edit_riskDisclosure_photocopy_name").val();
									 var platname=$("#edit_platformServiceAgreement_photocopy_name").val();
									 var propertyname=$("#edit_photocopy_photocopy_name").val();
									 $("#edy").val(data.warrantor);
									  $("#ezx").val(data.usages);
									 $("#eimgsrcp").attr("href",data.productSpecifications);
									$("#eimgsrcps").attr("src",data.productSpecifications);
									 $("#eimgsrcb").attr("href",data.riskDisclosure);
									$("#eimgsrcbs").attr("src",data.riskDisclosure);
									$("#eimgsrcm").attr("href",data.platformServiceAgreement);
									$("#eimgsrcms").attr("src",data.platformServiceAgreement);
									$("#eimgsrch").attr("href",data.photocopy);
									$("#eimgsrchs").attr("src",data.photocopy);
									$('#editpiaojv').hide();
									$('#editxintuo').hide();
									$('#editxiaofei').hide();
									$('#editqita').hide();
									$('#editzhaiquan').hide();
									$('#editfangdai').show();
									if(data.accrualType=="A_DEBT_SERVICE_DUE"){
										$("#fd_accrualDate_edit").hide();
									}else{
										$("#fd_accrualDate_edit").show();
									}
								}
								else{
									//信托starValue
									data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
									data.starValue = util.safeCalc(data.starValue, '/', 10000, 6);
									data.trustAmount = util.safeCalc(data.trustAmount, '/', 10000, 6);
									data.restTrustAmount = util.safeCalc(data.restTrustAmount, '/', 10000, 6);
									data.floorVolume = util.safeCalc(data.floorVolume, '/', 10000, 6);
									data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
									data.collectIncomeRate = util.safeCalc(data.collectIncomeRate, '*', 100, 2);
									data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
									
									$$.formAutoFix($('#editXintuoForm'), data); // 自动填充详情
									$("#editXintuoForm").validator('destroy');
									util.form.validator.init($("#editXintuoForm"));// 初始化表单验证
									if(data.accrualType=="A_DEBT_SERVICE_DUE"){
										$("#accrualDate_xt_edit").hide();
									}else{
										$("#accrualDate_xt_edit").show();
									}
									$('#editpiaojv').hide();
									$('#zhaiquan').hide();
									$('#editzhaiquan').hide();
									$('#editqita').hide();
									$('#editfangdai').hide();
									$('#editxintuo').show();
								}
								
								$('#editTargetModal').modal('show');
							})
						},
						'click .item-check': function(e, value, row) {
							$("#confirmTitle").html("确定提交预审？");
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.illiquidAsset.examineAsset, {
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
									http.post(config.api.illiquidAsset.invalidAsset, {
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
						'click .item-project': function(e, value, row) { // 底层项目 按钮点击事件
							targetInfo = row; // 变更某一行 投资标的信息
							$('#projectSearchForm').resetForm(); // 先清理搜索项目表单
							$$.detailAutoFix($('#targetDetail'), formatTargetData(targetInfo)); // 自动填充详情
							// 给项目表单的 标的id属性赋值
							$("#targetOid")[0].value = targetInfo.oid;
							// 初始化底层项目表格
							$('#projectTable').bootstrapTable(projectTableConfig)
							$('#projectTable').bootstrapTable('refresh'); // 项目表单重新加载
							$$.searchInit($('#projectSearchForm'), $('#projectTable'))
							// 控制是否能显示 添加项目按钮
							if (targetInfo.state == 'CREATE' || targetInfo.state == 'REJECT')
								$('#projectAdd').show();
							else
								$('#projectAdd').hide();

							$('#projectDataModal').modal('show');
						}
					}
				}]
			};
			
			  $("#edit_accrualType_zq").on("change", function() {
			     	var isSetup =$("#edit_accrualType_zq").val();
			     		var yesOrno=$("#edit_isSetup_Zq").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#edit_huankuai_zq").show();
			        	$("#edit_daoqiri_zq").hide();
			        }else{
			        	if(yesOrno=="YES"){
			        			 	$("#edit_huankuai_zq").hide();
			       			 	$("#edit_daoqiri_zq").show();
			        		}else{
			        			$("#edit_huankuai_zq").hide();
			       			$("#edit_daoqiri_zq").hide();
			        		}
			        }
			     })
				  $("#edit_isSetup_Zq").on("change", function() {
			     	var isSetup =$("#edit_isSetup_Zq").val();
			        if(isSetup=="YES"){
			        	$("#buildDate_Zq_edit").show();
			        	$("#edit_daoqiri_zq").show();
			        	$("#edit_buildZqEndDate").attr('required',true)
			        	$("#editsetDateZq").attr('required',true)
			        }else{
			        	$("#buildDate_Zq_edit").hide();
			        	$("#editsetDateZq").val("");
			        	$("#editsetDateZq").attr('required',false)
			        	$("#edit_daoqiri_zq").hide();
			        	$("#edit_buildZqEndDate").attr('required',false);
			        	$("#edit_buildZqEndDate").val("");
			        }
			     })
		    $("#edit_isSetup_Jr").on("change", function() {
			     	var isSetup =$("#edit_isSetup_Jr").val();
			        if(isSetup=="YES"){
			        	$("#edit_buildDate_Jr").show();
			        		$("#editsetDateJr").attr('required',true)
			        }else{
			        	$("#edit_buildDate_Jr").hide();
			        	$("#editsetDateJr").val("");
			        	$("#editsetDateJr").attr('required',false)
			        }
			     });
			  $('#editsetDateZq').on('blur', function() {
					//validsDateZq();
					if($("#life_zq_edit").val()!=""&&$('#editsetDateZq').val()!=""){
						var setDatev=new Date($('#editsetDateZq').val());
						if($("#lifeUnit_zq_edit").val()=="day"){
							 setDatev.setDate(setDatev.getDate()+parseInt($("#life_zq_edit").val())-1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()+parseInt($("#life_zq_edit").val()));
						}
						$("#edit_buildZqEndDate").val(setDatev.Format("yyyy-MM-dd"));
					}
					else if($("#edit_buildZqEndDate").val()!=""&&$('#editsetDateZq').val()!=""){
						var setDatev=new Date($('#editsetDateZq').val());
						var endDate=new Date($('#edit_buildZqEndDate').val());
						if($("#lifeUnit_zq_edit").val()=="day"){
							$("#life_zq_edit").val(endDate.getDate()-setDatev.getDate()+1);
						}else{
							$("#life_zq_edit").val(endDate.getMonth()-setDatev.getMonth());
						}
					}
					
				});
			$('#edit_buildZqEndDate').on('blur', function() {
					if($("#life_zq_edit").val()!=""&&$('#edit_buildZqEndDate').val()!=""){
						var setDatev=new Date($('#edit_buildZqEndDate').val());
						if($("#lifeUnit_zq_edit").val()=="day"){
							 setDatev.setDate(setDatev.getDate()-parseInt($("#life_zq_edit").val())+1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()-parseInt($("#life_zq_edit").val()));
						}
						$("#editsetDateZq").val(setDatev.Format("yyyy-MM-dd"));
					}else if($("#edit_buildZqEndDate").val()!=""&&$('#editsetDateZq').val()!=""){
						var setDatev=new Date($('#editsetDateZq').val());
						var endDate=new Date($('#edit_buildZqEndDate').val());
						if($("#lifeUnit_zq_edit").val()=="day"){
						$("#life_zq_edit").val(endDate.getDate()-setDatev.getDate()+1);
						}else{
							$("#life_zq_edit").val(endDate.getMonth()-setDatev.getMonth());
						}
					}
				});
				$('#life_zq_edit').on('blur', function() {
					if($("#life_zq_edit").val()!=""&&$('#edit_buildZqEndDate').val()!=""){
						var setDatev=new Date($('#edit_buildZqEndDate').val());
						if($("#lifeUnit_zq_edit").val()=="day"){
							setDatev.setDate(setDatev.getDate()-parseInt($("#life_zq_edit").val())+1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()-parseInt($("#life_zq_edit").val()));
						}
						$("#editsetDateZq").val(setDatev.Format("yyyy-MM-dd"));
					}else if($("#life_zq_edit").val()!=""&&$('#editsetDateZq').val()!=""){
						var setDatev=new Date($('#editsetDateZq').val());
						if($("#lifeUnit_zq_edit").val()=="day"){
							setDatev.setDate(setDatev.getDate()+parseInt($("#life_zq_edit").val())-1);
						}else{
							 setDatev.setMonth(setDatev.getMonth()+parseInt($("#life_zq_edit").val()));
						}
						$("#edit_buildZqEndDate").val(setDatev.Format("yyyy-MM-dd"));
					}
				});
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
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
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
					}else if(data.type=="TARGETTYPE_19"){
						// 供应链金融产品类型
						data.raiseScope = util.safeCalc(data.raiseScope, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.ticketValue = util.safeCalc(data.ticketValue, '/', 10000, 6);
						data.riskRate = util.safeCalc(data.riskRate, '/', 10000, 6);
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
						data.restTrustAmount = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						data.purchaseValue = util.safeCalc(data.purchaseValue, '/', 10000, 6);
						data.floorVolume = util.safeCalc(data.floorVolume, '/', 10000, 6);
						data.expAror = util.safeCalc(data.expAror, '*', 100, 2);
						data.collectIncomeRate = util.safeCalc(data.collectIncomeRate, '*', 100, 2);
						data.overdueRate = util.safeCalc(data.overdueRate, '*', 100, 2);
						data.life = data.life + util.enum.transform('lifeUnit', data.lifeUnit);
						data.contractDays = data.contractDays + '天/年';
						if(data.accrualType=="A_DEBT_SERVICE_DUE"){
							$("#xt_accrualDate").hide();
						}else{
							$("#xt_accrualDate").show();
						}
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
					
					if (data.state != 'REJECT') {
						$("#rejectDesc").hide()
					} else {
						$("#rejectDesc").show()
					}
					$('#meetingDet').hide(); // 统一版本去掉过会环节
					$('#targetDetailModal').modal('show');
				})

			}
			var prjPageOptions = {
				page: 1,
				rows: 10
			}
			var projectTableConfig = {
				ajax: function(origin) {
					http.post(config.api.illiquidAsset.projectlist, {
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
				}, {
					//操作
					align: 'center',
					formatter: function(val, row) {
						
						var format = '';
						if(targetInfo.state == 'CREATE' || targetInfo.state == 'REJECT'){
		            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-project-update"></span>'
		            		+'<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-project-delete"></span>';
		            	}
						return format
					},
					events: {
						'click .item-project-update': function(e, value, row) { // 底层项目修改
							util.form.reset($('#projectForm')); // 先清理表单
							$$.detailAutoFix($('#targetDetail'), formatTargetData(targetInfo)); // 自动填充详情
							// 给项目表单的 标的id属性赋值
							$("#targetOid")[0].value = targetInfo.oid;
							//row.targetOid = targetInfo.oid;
							//初始化:担保方式下拉列表,抵押方式下拉列表,质押方式下拉列表	 
							initSel();
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
									http.post(config.api.illiquidAsset.deleteProject, {
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
			util.form.validator.init($("#addPiaojvForm")); // 初始化表单验证
			util.form.validator.init($("#addXiaofeiForm")); // 初始化表单验证
			util.form.validator.init($("#addZhaiquanForm")); // 初始化表单验证
			util.form.validator.init($("#addXintuoForm")); // 初始化表单验证
			util.form.validator.init($("#addfangdaiForm")); // 初始化表单验证
			util.form.validator.init($("#addqitaForm")); // 初始化表单验证
			// 初始化新建时省市
			function initAddProvince(){
				$("#selProvince option").remove();
				$.each(province, function (k, p) { 
	                var option = "<option value='" + p.ProID + "'>" + p.ProName + "</option>";
	                $("#selProvince").append(option);
	            });
	            $('#addProvince').val($('#selProvince option:eq(0)').html())
	             
	            $("#selCity option").remove();
	            $("#selProvince").change(function () {
	            	
	            	$('#addProvince').val($('#selProvince option:selected').html());
	            	
	                var selValue = $(this).val(); 
					$("#selCity option").remove();
	                 
	                $.each(city, function (k, p) { 
	                    if (p.ProID == selValue) {
	                        var option = "<option value='" + p.CityID + "'>" + p.CityName + "</option>";
	                        $("#selCity").append(option);
	                    }
	                });
	                
	                $('#addCity').val($('#selCity option:eq(0)').html());
	            }).change();
	            
	            $("#selCity").change(function () {
	               $('#addCity').val($('#selCity option:selected').html());
	            });
			}
			// 初始化修改时省市
			function initEditProvince(){
				$("#editSelProvince option").remove();
				$.each(province, function (k, p) { 
	                var option = "<option value='" + p.ProID + "'>" + p.ProName + "</option>";
	                $("#editSelProvince").append(option);
	            });
	             
	            $("#editSelCity option").remove();
	            $("#editSelProvince").change(function () {
	            	$('#editProvince').val($('#editSelProvince option:selected').html());
	            	
	                var selValue = $(this).val(); 
					$("#editSelCity option").remove();
	                 
	                $.each(city, function (k, p) { 
	                    if (p.ProID == selValue) {
	                        var option = "<option value='" + p.CityID + "'>" + p.CityName + "</option>";
	                        $("#editSelCity").append(option);
	                    }
	                });
	                
	                $('#editCity').val($('#editSelCity option:eq(0)').html());
	            });
	            
	            $("#editSelCity").change(function () {
	               $('#editCity').val($('#editSelCity option:selected').html());
	            });
			}
			// 新建标的按钮点击事件
			$('#targetAdd').on('click', function() {
				valiqiate();
				$('#addTargetForm').resetForm(); // 先清理表单内容
				$('#addTargetForm').validator('destroy')//清理表单报错
				util.form.validator.init($("#addTargetForm"));//添加表单校验
				
				$('#addPiaojvForm').resetForm(); // 先清理表单
				$('#addPiaojvForm').validator('destroy')//清理表单报错
				util.form.validator.init($("#addPiaojvForm"));//添加表单校验
				
				$('#addXiaofeiForm').resetForm(); // 先清理表单
				$('#addXiaofeiForm').validator('destroy')//清理表单报错
				util.form.validator.init($("#addXiaofeiForm"));//添加表单校验
				
				$('#addZhaiquanForm').resetForm(); // 先清理表单
				$('#addZhaiquanForm').validator('destroy')//清理表单报错
				util.form.validator.init($("#addZhaiquanForm"));//添加表单校验
				
				util.form.reset($('#addXintuoForm')); // 先清理表单
				$('#addXintuoForm').validator('destroy')
				util.form.validator.init($("#addXintuoForm"));
				
				$('#addqitaForm').resetForm(); // 先清理表单
				$('#addqitaForm').validator('destroy')//清理表单报错
				util.form.validator.init($("#addqitaForm"));//添加表单校验
				
				$('#addfangdaiForm').resetForm(); // 先清理表单
				$('#addfangdaiForm').validator('destroy')//清理表单报错
				util.form.validator.init($("#addfangdaiForm"));//添加表单校验
				
				$('#addTargetSubmit').removeAttr('disabled');
				
				// 初始化   付息日 
				for (var i = 1; i <= 31; i++) {
					var option = $("<option>").val(i).text(i);
					$(addXiaofeiForm.accrualDate).append(option);
				}
				for (var i = 1; i <= 31; i++) {
					var option = $("<option>").val(i).text(i);
					$(addZhaiquanForm.accrualDate).append(option);
				}
				for (var i = 1; i <= 31; i++) {
					var option = $("<option>").val(i).text(i);
					$(addXintuoForm.accrualDate).append(option);
				}
				for (var i = 1; i <= 31; i++) {
					var option = $("<option>").val(i).text(i);
					$(addqitaForm.accrualDate).append(option);
				}
				for (var i = 1; i <= 31; i++) {
					var option = $("<option>").val(i).text(i);
					$(addfangdaiForm.accrualDate).append(option);
				}
				$(addXiaofeiForm.accrualDate).val(1); // 默认0个工作日
				$(addZhaiquanForm.accrualDate).val(1); // 默认0个工作日
				
				initAddProvince();	// 初始化省市
				
				$("#zhaiquan").hide();
				$("#xiaofei").hide();
				$("#piaojv").hide();
				$("#qita").hide();
				$("#fangdai").hide();
				$("#xintuo").show();
				$('#addTargetModal').modal('show')
			})
			//新建标的按钮点击事件
			$('#addTargetSubmit').off().on('click', function() {
				if(!$('#addTargetForm').validator('doSubmitCheck')) return;				
				
				var bianhao = $(document.addTargetForm.sn).val();
				var mingcheng = $(document.addTargetForm.name).val();
				var leixing = $(document.addTargetForm.type).val();
				var v = $(document.addTargetForm.type).val();
				if (v === 'TARGETTYPE_08'){
					// 债权
					if(!$('#addZhaiquanForm').validator('doSubmitCheck')) return;
					$('#addTargetSubmit').attr('disabled', true);
					if ($('#addZhaiquanForm').validator('doSubmitCheck')& validsDateZq()){
						
						$('#zhaiquan_sn').val(bianhao);
						$('#zhaiquan_name').val(mingcheng);
						$('#zhaiquan_type').val(leixing);
						$('#addZhaiquanForm').ajaxSubmit({
							url: config.api.illiquidAsset.addAsset,
							success: function(result) {
								util.form.reset($('#addTargetForm')); // 先清理表单
								util.form.reset($('#addZhaiquanForm')); // 先清理表单
								$('#addTargetSubmit').attr('disabled', false);
								$('#addTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else if(v === 'TARGETTYPE_17' || v === 'TARGETTYPE_18'){
					// 消费
					if(!$('#addXiaofeiForm').validator('doSubmitCheck')) return;
					$('#addTargetSubmit').attr('disabled', true);
					if ($('#addXiaofeiForm').validator('doSubmitCheck')& validsDate()){
						if (v === 'TARGETTYPE_17'){
							// 借款
							$("#xiaofei_accrualType").val("A_DEBT_SERVICE_DUE");
							var lifed = $("#lifeOfD").val();
							$("#lifeOfM").val(lifed);
							$("#accrual_Date_xf").val("1");
						}else if(v === 'TARGETTYPE_18'){
							// 消费分期
							$("#xiaofei_accrualType").val("EACH_INTEREST_RINCIPAL_DUE");
						}
						$('#xiaofei_sn').val(bianhao);
						$('#xiaofei_name').val(mingcheng);
						$('#xiaofei_type').val(leixing);
						$('#addXiaofeiForm').ajaxSubmit({
							url: config.api.illiquidAsset.addAsset,
							success: function(result) {
								console.log(result);
								util.form.reset($('#addTargetForm')); // 先清理表单
								util.form.reset($('#addXiaofeiForm')); // 先清理表单
								$('#addTargetSubmit').attr('disabled', false);
								$('#addTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
					
				}else if(v === 'TARGETTYPE_15' || v === 'TARGETTYPE_16'){
					//票据
					if(!$('#addPiaojvForm').validator('doSubmitCheck')) return;
					$('#addTargetSubmit').attr('disabled', true);
					if ($('#addPiaojvForm').validator('doSubmitCheck')){
						$("#piaojv_accrualType").val("A_DEBT_SERVICE_DUE");
						$('#piaojv_sn').val(bianhao);
						$('#piaojv_name').val(mingcheng);
						$('#piaojv_type').val(leixing);
						
						var ticketdeadline = getDateDiff($('#piaojv_ticketRepaymentDate').val(),$('#piaojv_ticketDate').val());
						$('#piaojv_ticketdeadline').val(ticketdeadline);
						
						$('#addPiaojvForm').ajaxSubmit({
							url: config.api.illiquidAsset.addAsset,
							success: function(result) {
								util.form.reset($('#addTargetForm')); // 先清理表单
								util.form.reset($('#addPiaojvForm')); // 先清理表单
								$('#addTargetSubmit').attr('disabled', false);
								$('#addTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else if(v === 'TARGETTYPE_19'){
					// 供应链金融产品类
					if(!$('#addqitaForm').validator('doSubmitCheck')) return;
					$('#addTargetSubmit').attr('disabled', true);
					if ($('#addqitaForm').validator('doSubmitCheck')){
						$('#qita_sn').val(bianhao);
						$('#qita_name').val(mingcheng);
						$('#qita_type').val(leixing);
						
						var ticketdeadline = getDateDiff($('#qita_ticketRepaymentDate').val(),$('#qita_ticketDate').val());
						$('#qita_ticketdeadline').val(ticketdeadline);
						
						$('#addqitaForm').ajaxSubmit({
							url: config.api.illiquidAsset.addAsset,
							success: function(result) {
								console.log(result)
								util.form.reset($('#addTargetForm')); // 先清理表单
								util.form.reset($('#addqitaForm')); // 先清理表单
								$('#addTargetSubmit').attr('disabled', false);
								$('#addTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else if(v === 'TARGETTYPE_20'){
					// 房屋贷
					if(!$('#addfangdaiForm').validator('doSubmitCheck')) return;
					$('#addTargetSubmit').attr('disabled', true);
					if ($('#addfangdaiForm').validator('doSubmitCheck')){
						$('#fangdai_sn').val(bianhao);
						$('#fangdai_name').val(mingcheng);
						$('#fangdai_type').val(leixing);
						//var ticketdeadline = getDateDiff($('#fangdai_ticketRepaymentDate').val(),$('#fangdai_ticketDate').val());
						//$('#fangdai_ticketdeadline').val(ticketdeadline);
						var str="";
						$('input[name="scopes"]:checked').each(function(){
							str+=$(this).val()+",";
							}); 
							str=str.substring(0,str.length-1);
							$('#add_fandidai_ticketNumber').val(str);
						$('#addfangdaiForm').ajaxSubmit({
							url: config.api.illiquidAsset.addAsset,
							success: function(result) {
								console.log(result)
								util.form.reset($('#addTargetForm')); // 先清理表单
								util.form.reset($('#addfangdaiForm')); // 先清理表单
								$('#addTargetSubmit').attr('disabled', false);
								$('#addTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else{
					// 信托
					if(!$('#addXintuoForm').validator('doSubmitCheck')) return;
					$('#addTargetSubmit').attr('disabled', true);
					if ($('#addXintuoForm').validator('doSubmitCheck') & validCDate() & validStarValue()) {
						$('#xintuo_sn').val(bianhao);
						$('#xintuo_name').val(mingcheng);
						$('#xintuo_type').val(leixing);
						$('#addXintuoForm').ajaxSubmit({
							url: config.api.illiquidAsset.addAsset,
							success: function(result) {
								util.form.reset($('#addTargetForm')); // 先清理表单
								util.form.reset($('#addXintuoForm')); // 先清理表单
								$('#addTargetSubmit').attr('disabled', false);
								$('#addTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}
				
			})
			  $("#accrualType_zq").on("change", function() {
			     	var isSetup =$("#accrualType_zq").val();
			     	var yesOrno=$("#isSetup_Zq").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#huankuai_zq").show();
			        	$("#daoqiri_zq").hide();
			        }else{
			        		if(yesOrno=="YES"){
			        			 	$("#huankuai_zq").hide();
			       			 	$("#daoqiri_zq").show();
			        		}else{
			        			$("#huankuai_zq").hide();
			       			$("#daoqiri_zq").hide();
			        		}
			       
			        }
			     })
			  $("#accrualType_Xt").on("change", function() {
			     	var isSetup =$("#accrualType_Xt").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#huankuaiXt").show();
			        }else{
			        	$("#huankuaiXt").hide();
			        }
			     })
			  $("#accrualType_Gy").on("change", function() {
			     	var isSetup =$("#accrualType_Gy").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#huankuaiGy").show();
			        }else{
			        	$("#huankuaiGy").hide();
			        }
			     })
			   $("#accrualType_Gy_edit").on("change", function() {
			     	var isSetup =$("#accrualType_Gy_edit").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#accrualDate_Gy_edit").show();
			        }else{
			        	$("#accrualDate_Gy_edit").hide();
			        }
			     })
			  $("#accrualType_Fd").on("change", function() {
			     	var isSetup =$("#accrualType_Fd").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#huankuaiFd").show();
			        }else{
			        	$("#huankuaiFd").hide();
			        }
			     })
			  	  $("#accrualType_fd_edit").on("change", function() {
			     	var isSetup =$("#accrualType_fd_edit").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#fd_accrualDate_edit").show();
			        }else{
			        	$("#fd_accrualDate_edit").hide();
			        }
			     })
			  	 $("#accrualType_xt_edit").on("change", function() {
			     	var isSetup =$("#accrualType_xt_edit").val();
			        if(isSetup!="A_DEBT_SERVICE_DUE"){
			        	$("#accrualDate_xt_edit").show();
			        }else{
			        	$("#accrualDate_xt_edit").hide();
			        }
			     })
		  $("#isSetup_Zq").on("change", function() {
			     	var isSetup =$("#isSetup_Zq").val();
			        if(isSetup=="YES"){
			        	$("#buildDate_Zq").show();
			        	$("#daoqiri_zq").show();
			        	$("#buildZqEndDate").attr('required',true);
			        	$("#buildZqSetDate").attr('required',true);
			        }else{
			        	$("#buildDate_Zq").hide();
			        	$('#sdateErrZq').removeClass("has-error")
			        	$("#buildZqSetDate").val('')
			        	$('#sdateErrZq').html('')
			        	$("#buildZqSetDate").attr('required',false)
			        	$("#daoqiri_zq").hide();
			        	$("#buildZqEndDate").val('');
			        	$("#buildZqEndDate").attr('required',false);
			        }
			     })
		    $("#isSetup_Jr").on("change", function() {
			     	var isSetup =$("#isSetup_Jr").val();
			        if(isSetup=="YES"){
			        	$("#buildDate_Jr").show();
			        	$("#buildsetDateJr").attr('required',true)
			        }else{
			        	$("#buildDate_Jr").hide();
			        	$("#buildsetDateJr").val('')
			        	$('#sdateErrJr').removeClass("has-error")
			        	$('#sdateErrJr').html('')
			        	$("#buildsetDateJr").attr('required',false)
			        }
			     })
		    
		    
			$("#piaojv_file").on("change", function() {
				var pic1=document.piaojv_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#piaojv_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							console.log($('#piaojv_file_form').files[0].size);
							
							if (picResult.length > 0){
								$("#piaojv_photocopy").val("/"+picResult[0].url);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#idcard_file").on("change", function() {
				var pic1=document.idcard_file_form.picWebsiteContent.value.trim();
				console.log(pic1);
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#idcard_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							console.log(picResult);
							if (picResult.length > 0){
								$("#idcard_photocopy").val("/"+picResult[0].url);
								$("#idcard_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#bank_file").on("change", function() {
				var pic1=document.bank_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#bank_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							console.log(picResult);
							if (picResult.length > 0){
								$("#riskDisclosure_photocopy").val("/"+picResult[0].url);
								$("#riskDisclosure_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#marriage_file").on("change", function() {
				var pic1=document.marriage_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#marriage_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							if (picResult.length > 0){
								$("#platformServiceAgreement_photocopy").val("/"+picResult[0].url);
								$("#platformServiceAgreement_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#property_file").on("change", function() {
				var pic1=document.property_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#property_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							if (picResult.length > 0){
								$("#photocopy_photocopy").val("/"+picResult[0].url);
								$("#photocopy_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
		$("#edit_idcard_file").on("change", function() {
				var pic1=document.edit_idcard_file_form.picWebsiteContent.value.trim();
				console.log(pic1);
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#edit_idcard_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							if (picResult.length > 0){
								$("#edit_idcard_photocopy").val("/"+picResult[0].url);
								$("#edit_idcard_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#edit_bank_file").on("change", function() {
				var pic1=document.edit_bank_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#edit_bank_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							if (picResult.length > 0){
								$("#edit_riskDisclosure_photocopy").val("/"+picResult[0].url);
								$("#edit_riskDisclosure_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#edit_marriage_file").on("change", function() {
				var pic1=document.edit_marriage_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#edit_marriage_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							if (picResult.length > 0){
								$("#edit_platformServiceAgreement_photocopy").val("/"+picResult[0].url);
								$("#edit_platformServiceAgreement_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			$("#edit_property_file").on("change", function() {
				var pic1=document.edit_property_file_form.picWebsiteContent.value.trim();
				if (pic1 && pic1!=''){
					if (!checkFileSuffixName(pic1)) return ;
					$("#edit_property_file_form").ajaxSubmit({
						url: "/yup",
						success: function (picResult) {
							if (picResult.length > 0){
								$("#edit_photocopy_photocopy").val("/"+picResult[0].url);
								$("#edit_photocopy_photocopy_name").val(picResult[0].realname);
							}else{
								alert("上传失败！");
							}
						}
					})
				}
			})
			function checkFileSuffixName(filename){
				var postf=getSuffixName(filename);
				if(postf.toLowerCase()=="jpg"||postf.toLowerCase()=="png"){
					return true;
				}else{
					utils.showError("图片格式仅限JPG、PNG！", ".form_tips");
					return false;
				}
			}
			function getSuffixName(filename){
		      	if(!filename){
		      	  	alert("文件为空!");
		      	  	return false;
		      	}
		      	var idx = filename.lastIndexOf(".");  
				var filenameLen = filename.length;
				var postf = filename.substring(idx + 1, filenameLen);//后缀名  
				return postf;
		    }
			// 计算两日期差值
			function getDateDiff(startDate,endDate)  
			{  
			    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
			    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
			    var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
			    return  dates;    
			}

			//修改标的按钮点击事件
			$('#editTargetSubmit').on('click', function() {
				if(!$('#editTargetForm').validator('doSubmitCheck')) return;
				
				var bianhao = $(document.editTargetForm.sn).val();
				var mingcheng = $(document.editTargetForm.name).val();
				var leixing = $(document.editTargetForm.type).val();
				var bianhao = $(document.editTargetForm.sn).val();
				var mingcheng = $(document.editTargetForm.name).val();
				var leixing = $(document.editTargetForm.type).val();
				
				if (leixing === 'TARGETTYPE_08'){
					// 债权
					if ($('#editZhaiquanForm').validator('doSubmitCheck')){
						$('#edit_zhaiquan_sn').val(bianhao);
						$('#edit_zhaiquan_name').val(mingcheng);
						$('#edit_zhaiquan_type').val(leixing);
						$('#editZhaiquanForm').ajaxSubmit({
							url: config.api.illiquidAsset.editAsset,
							success: function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editZhaiquanForm')); // 先清理表单
								$('#editTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else if(leixing === 'TARGETTYPE_17' || leixing === 'TARGETTYPE_18'){
					// 消费
					if ($('#editXiaofeiForm').validator('doSubmitCheck')){
						if (leixing === 'TARGETTYPE_17'){
							var lifed = $("#lifeOfD1").val();
							$("#lifeOfM1").val(lifed);
							$("#edit_accrual_Date_xf").val("0");
							// 借款
							//$("#edit_xiaofei_accrualType").val("ACCRUALTYPE_05");
						}else if(leixing === 'TARGETTYPE_18'){
							// 消费分期
							//$("#edit_xiaofei_accrualType").val("ACCRUALTYPE_08");
						}
						$('#edit_xiaofei_sn').val(bianhao);
						$('#edit_xiaofei_name').val(mingcheng);
						$('#edit_xiaofei_type').val(leixing);
						$('#editXiaofeiForm').ajaxSubmit({
							url: config.api.illiquidAsset.editAsset,
							success: function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editXiaofeiForm')); // 先清理表单
								$('#editTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
					
				}else if(leixing === 'TARGETTYPE_15' || leixing === 'TARGETTYPE_16'){
					//票据
					if ($('#editPiaojvForm').validator('doSubmitCheck')){
						$("#edit_piaojv_accrualType").val("A_DEBT_SERVICE_DUE");
						$('#edit_piaojv_sn').val(bianhao);
						$('#edit_piaojv_name').val(mingcheng);
						$('#edit_piaojv_type').val(leixing);
						
						var ticketdeadline = getDateDiff($('#edit_piaojv_ticketRepaymentDate').val(),$('#edit_piaojv_ticketDate').val());
						$('#edit_piaojv_ticketdeadline').val(ticketdeadline);	// 设置票面期限
						
						$('#editPiaojvForm').ajaxSubmit({
							url: config.api.illiquidAsset.editAsset,
							success: function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editPiaojvForm')); // 先清理表单
								$('#editTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else if(leixing === 'TARGETTYPE_19'){
					// 供应链金融产品类
					if ($('#editqitaForm').validator('doSubmitCheck')){
						$('#edit_qita_sn').val(bianhao);
						$('#edit_qita_name').val(mingcheng);
						$('#edit_qita_type').val(leixing);
						$('#editqitaForm').ajaxSubmit({
							url: config.api.illiquidAsset.editAsset,
							success: function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editqitaForm')); // 先清理表单
								$('#editTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else if(leixing === 'TARGETTYPE_20'){
					// 房抵贷
					if ($('#editfangdaiForm').validator('doSubmitCheck')){
						$('#edit_fangdai_sn').val(bianhao);
						$('#edit_fangdai_name').val(mingcheng);
						$('#edit_fagdai_type').val(leixing);
							var str="";
						$('input[name="escopes"]:checked').each(function(){
							str+=$(this).val()+",";
							}); 
							$('#edit_fandidai_ticketNumber').val(str);
						$('#editfangdaiForm').ajaxSubmit({
							url: config.api.illiquidAsset.editAsset,
							success: function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editfangdaiForm')); // 先清理表单
								$('#editTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}else{
					// 信托
					if ($('#editXintuoForm').validator('doSubmitCheck') & validEDate()) {
						$('#edit_xintuo_sn').val(bianhao);
						$('#edit_xintuo_name').val(mingcheng);
						$('#edit_xintuo_type').val(leixing);
						$('#editXintuoForm').ajaxSubmit({
							url: config.api.illiquidAsset.editAsset,
							success: function(result) {
								util.form.reset($('#editTargetForm')); // 先清理表单
								util.form.reset($('#editXintuoForm')); // 先清理表单
								$('#editTargetModal').modal('hide');
								$('#targetApplyTable').bootstrapTable('refresh');
							}
						})
					}
				}
			})
				
			// 标的类型改变
			$(document.editTargetForm.type).change(function() { 
				var v = $(this).val();
				var t = $(this).find("option:selected").text();
				if (v === 'TARGETTYPE_08'){
					$("#editxintuo").hide();
					$("#editxiaofei").hide();
					$("#editpiaojv").hide();
					$("#editqita").hide();
					$("#editfangdai").hide();
					$("#editzhaiquan").show();
				}else if(v === 'TARGETTYPE_17' || v === 'TARGETTYPE_18'){
					$("#editxintuo").hide();
					$("#editzhaiquan").hide();
					$("#editpiaojv").hide();
					$("#editqita").hide();
					$("#editfangdai").hide();
					$("#editxiaofei").show();
					if (v === 'TARGETTYPE_17'){
						$("#edit_fenqi").hide();
						$("#edit_jiekuan").show();
					}else if(v === 'TARGETTYPE_18'){
						$("#edit_jiekuan").hide();
						$("#edit_fenqi").show();
					}
				}else if(v === 'TARGETTYPE_15' || v === 'TARGETTYPE_16'){
					$("#editxintuo").hide();
					$("#editqita").hide();
					$("#editzhaiquan").hide();
					$("#editxiaofei").hide();
					$("#editfangdai").hide();
					$("#editpiaojv").show();
				}else if(v === 'TARGETTYPE_19'){
					$("#editxintuo").hide();
					$("#editzhaiquan").hide();
					$("#editxiaofei").hide();
					$("#editpiaojv").hide();
					$("#editfangdai").hide();
					$("#editqita").show();
				}else if(v === 'TARGETTYPE_20'){
					$("#editxintuo").hide();
					$("#editzhaiquan").hide();
					$("#editxiaofei").hide();
					$("#editpiaojv").hide();
					$("#editqita").hide();
					$("#editfangdai").show();
				}else{
					$("#editzhaiquan").hide();
					$("#editfangdai").hide();
					$("#editxiaofei").hide();
					$("#editpiaojv").hide();
					$("#editqita").hide();
					$("#editxintuo").show();
				}
			});
			
			
			
			
			// 标的类型改变
			$(document.addTargetForm.type).change(function() { 
				var v = $(this).val();
				var t = $(this).find("option:selected").text();
//				console.log(v+t)
				if (v === 'TARGETTYPE_08'){
					$("#xintuo").hide();
					$("#xiaofei").hide();
					$("#piaojv").hide();
					$("#qita").hide();
					$("#fangdai").hide();
					$("#zhaiquan").show();
				}else if(v === 'TARGETTYPE_17' || v === 'TARGETTYPE_18'){
					$("#xintuo").hide();
					$("#zhaiquan").hide();
					$("#piaojv").hide();
					$("#qita").hide();
					$("#fangdai").hide();
					$("#xiaofei").show();
					if (v === 'TARGETTYPE_17'){
						$("#payDay").hide();
						$("#returi").show();
						$("#fenqi").hide();
						$("#huankuan").hide();
						$("#fangdai").hide();
						$("#jiekuan").show();
						$("#lifeOfD").attr("required",true);
						$(addXiaofeiForm.lifeOfLoanUnit).change();
					}else if(v === 'TARGETTYPE_18'){
						$("#payDay").show();
						$("#returi").hide();
						$("#jiekuan").hide();
						$("#fangdai").hide();
						$("#fenqi").show();
						$("#huankuan").show();
						$("#lifeOfD").attr("required",false);
					}
				}else if(v === 'TARGETTYPE_15' || v === 'TARGETTYPE_16'){
					$("#xintuo").hide();
					$("#qita").hide();
					$("#zhaiquan").hide();
					$("#fangdai").hide();
					$("#xiaofei").hide();
					$("#piaojv").show();
				}else if(v === 'TARGETTYPE_19'){
					$("#xintuo").hide();
					$("#zhaiquan").hide();
					$("#xiaofei").hide();
					$("#piaojv").hide();
					$("#fangdai").hide();
					$("#qita").show();
				}else if(v === 'TARGETTYPE_20'){
					$("#xintuo").hide();
					$("#zhaiquan").hide();
					$("#xiaofei").hide();
					$("#piaojv").hide();
					$("#fangdai").show();
					$("#qita").hide();
					
				}else{
					$("#zhaiquan").hide();
					$("#xiaofei").hide();
					$("#piaojv").hide();
					$("#qita").hide();
					$("#fangdai").hide();
					$("#xintuo").show();
				}
			});
			
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

			$('#addEventCollect_xintuo').on('click', function() {
				eventCollect('');
			});
			$('#addEventCollect_piaojv').on('click', function() {
				eventCollect('');
			});
			$('#addEventCollect_xiaofei').on('click', function() {
				eventCollect('');
			});
			$('#addEventCollect_zhaiquan').on('click', function() {
				eventCollect('');
			});
			$('#addEventCollect_qita').on('click', function() {
				eventCollect('');
			});
			$('#editEventCollect_xintuo').on('click', function() {
				eventCollect($(document.editTargetForm.oid).val());
			});
			$('#editEventCollect_zhaiquan').on('click', function() {
				eventCollect($(document.editTargetForm.oid).val());
			});
			$('#editEventCollect_xiaofei').on('click', function() {
				eventCollect($(document.editTargetForm.oid).val());
			});
			$('#editEventCollect_piaojv').on('click', function() {
				eventCollect($(document.editTargetForm.oid).val());
			});
			$('#editEventCollect_qita').on('click', function() {
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
//				console.log(data);
				$(document.addXintuoForm.riskOption).val(JSON.stringify(data));
				$(document.addPiaojvForm.riskOption).val(JSON.stringify(data));
				$(document.addXiaofeiForm.riskOption).val(JSON.stringify(data));
				$(document.addZhaiquanForm.riskOption).val(JSON.stringify(data));
				$(document.addqitaForm.riskOption).val(JSON.stringify(data));
				
				$(document.editPiaojvForm.riskOption).val(JSON.stringify(data));
				$(document.editXiaofeiForm.riskOption).val(JSON.stringify(data));
				$(document.editZhaiquanForm.riskOption).val(JSON.stringify(data));
				$(document.editXintuoForm.riskOption).val(JSON.stringify(data));
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
//				console.log(checkConditionsSource)
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


	function editTarget() {
		$('#editTargetForm').ajaxSubmit({
			url: config.api.illiquidAsset.editAsset,
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
			url: config.api.illiquidAsset.saveProject,
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
