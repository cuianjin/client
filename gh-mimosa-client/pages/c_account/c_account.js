/**
 * 发行人账户管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util,$$) {
	return {
		name: 'c_account',
		init:function(){
//			http.post(config.api.caccountBank, {
//				contentType: 'form'
//			}, function (rlt) {
//				var opt = ''
//				for (var i = 0; i < rlt.total; i++) {
//					opt += '<option value="'+rlt.rows[i].oid+'">'+rlt.rows[i].name+'</option>'
//				}
//				$("#bankCode")[0].innerHTML = opt
//			})
			var bankCodeList = []
			var bankNameList = []
			var pageOptions = {
				number: 1,
				size: 10,
				offset: 0,
				phone: '',
			}
			var tableConfig = {
				ajax: function (origin) {
					http.post(config.api.caccountList, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							phone: pageOptions.phone,
						},
						contentType: 'form'
					}, function (rlt) {
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
						case 'phone':
						queryInfo(value,row)
						break
					}
				},
				columns: [
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions.offset
						}
					},
					{
						field: 'phone',
						align: 'right',
						class:'table_title_detail'
					},
					{
						field: 'realName'
					},
					{
						field: 'certificateNo'
					},
					{
						field: 'bankName'
					},
					{
						field: 'cardNo'
					},
					{
						field: 'basicBalance',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'collectionSettlementBalance',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'availableAmountBalance',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'frozenAmountBalance',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'withdrawAvailableAmountBalance',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'statusDisp'
					},
					{
						field: 'updateTime',
						align: 'right'
					},
					{
						field: 'createTime',
						align: 'right',
//						formatter: function (val) {
//							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
//						}
					},
					{
						align: 'center',
						width: 280,
						formatter: function (val, row, index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#dataTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '修改管理员',
									type: 'button',
									class: 'item-update',
									isRender: true
								},
//								{
//									text: '企业开户',
//									type: 'button',
//									class: 'item-open',
//									isRender: row.isOpen === "no"
//								},{
//									text: '锁定',
//									type: 'button',
//									class: 'item-lock',
//									isRender: row.status === 1
//								},{
//									text: '启用',
//									type: 'button',
//									class: 'item-unlock',
//									isRender: row.status === 2
//								},
								{
									text: '绑卡',
									type: 'button',
									class: 'item-bind',
									isRender: row.status == 'created' || row.status == 'applied'
								},{
									text: '解绑卡',
									type: 'button',
									class: 'item-unbind',
									isRender: row.status == 'confirmed'
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable');
						},
						events: {
							'click .item-detail': function (e, value, row) {
//								window.location.href = window.location.href.substr(0,window.location.href.indexOf("#")) +"#c_accountdetail?phone=" + row.phone
//								location.reload()
								
								
							},
							'click .item-update': function (e, value, row) {
								$('#accForm').clearForm()
								$("#accForm").validator('destroy')
								util.form.validator.init($("#accForm"));
								http.post(config.api.allaccmodify+"?baseAccountOid="+row.baseAccountOid, {
									contentType: 'application/json'
								}, function(result){
									var lista = '', listb = '';
									var ADMINUPDATELIST = [];
									result.allAcc.forEach(function(acc){
					            		lista += acc
					            	})
					            	config["ADMINLIST"].forEach(function(admin){
					            		if(!lista.match(admin.id)){
					            			listb += admin.id+','
					            		}
					            	})
					            	listb = listb.substr(0,listb.lastIndexOf(',')).split(',')
					            	listb.forEach(function(list){
					            		config["ADMINLIST"].forEach(function(admin){
					            			if (list === admin.id) {
					            				ADMINUPDATELIST.push(admin)
					            			}
					            		})
					            	})
					            	config["ADMINUPDATELIST"] = ADMINUPDATELIST
					            	$$.enumSourceInit($(document))
					            	$("#acc").select2()
									$("#acc").val(result.selectedAcc).trigger("change");
								})
								document.accForm.baseAccountOid.value = row.baseAccountOid
								$("#accModal").modal('show')
							},
							'click .item-open': function (e, value, row) {
								document.getElementById('openAndLockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要为['+row.name+']开通企业账户吗？'
								$$.confirm({
									container: $('#openAndLockConfirm'),
									trigger: this,
									accept: function () {
										http.post(config.api.caccountOpen, {
											data: {
												corperateOid: row.oid,
												publisherPayUid: row.identityId
											},
											contentType: 'form',
										}, function (result) {
											window.alert('企业账户开通成功！')
											$('#dataTable').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-lock': function (e, value, row) {
								document.getElementById('openAndLockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要锁定['+row.name+']吗？'
								$$.confirm({
									container: $('#openAndLockConfirm'),
									trigger: this,
									accept: function () {
										http.post(config.api.caccountLockin, {
											data: {
												oid: row.oid,
											},
											contentType: 'form',
										}, function (result) {
											$('#dataTable').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-unlock': function (e, value, row) {
								document.getElementById('openAndLockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要解锁['+row.name+']吗？'
								$$.confirm({
									container: $('#openAndLockConfirm'),
									trigger: this,
									accept: function () {
										http.post(config.api.caccountLockin, {
											data: {
												oid: row.oid,
											},
											contentType: 'form',
										}, function (result) {
											$('#dataTable').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-bind': function (e, value, row) {
								$('#bindCardForm').clearForm()
								$("#bindCardForm").validator('destroy')
								util.form.validator.init($("#bindCardForm"));
								initBankList()
								document.bindCardForm.baseAccountOid.value = row.baseAccountOid
							},
							'click .item-unbind': function (e, value, row) {
								document.getElementById('openAndLockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要解绑卡吗？'
								$$.confirm({
									container: $('#openAndLockConfirm'),
									trigger: this,
									accept: function () {
										http.post(config.api.unbind, {
											data: {
												baseAccountOid: row.baseAccountOid,
											},
											contentType: 'form',
										}, function (result) {
											$('#dataTable').bootstrapTable('refresh')
										})
									}
								})
							},
						}
					}
				]
			}
			
			$('#dataTable').bootstrapTable(tableConfig)
			
			$$.searchInit($('#searchForm'), $('#dataTable'))
			
			$("#createCaccount").on("click",function(){
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				$('#createForm').clearForm()
				$('#picForm').clearForm()
//				$(document.createForm).validator('validate')
//				$(document.picForm).validator('validate')
				$("#createForm").validator('destroy')
				util.form.validator.init($("#createForm"));
				$("#picForm").validator('destroy')
				util.form.validator.init($("#picForm"));
				$(document.createForm.adminInvestorOids).select2()
				$('#createCaccountModal').modal('show')
			})
			
			$('#reset').on('click', function () {
				document.createForm.reset()
//				document.picForm.reset()
				$("#createForm").validator('destroy')
				util.form.validator.init($("#createForm"));
				$("#picForm").validator('destroy')
				util.form.validator.init($("#picForm"));
//				$(document.createForm).validator('validate')
//				$(document.picForm).validator('validate')
			})
			
			$("#createSubmit").on('click',function () {
				if (!$('#createForm').validator('doSubmitCheck')) return
				
				$('#createForm').ajaxSubmit({
					url: config.api.caccountCreate,
					success: function (result) {
						if(result.errorCode == 0){
							$('#dataTable').bootstrapTable('refresh')
							$('#createCaccountModal').modal('hide')
						}else{
							errorHandle(result)
							$('#refreshDiv').removeClass('overlay');
							$('#refreshI').removeClass('fa fa-refresh fa-spin');
						}
					}
				})
				
//				if (!$('#picForm').validator('doSubmitCheck')) return
//				if (!$('#createForm').validator('doSubmitCheck')) return
//				$('#refreshDiv').addClass('overlay');
//				$('#refreshI').addClass('fa fa-refresh fa-spin');
//				$('#picForm').find('input[name=fileName]').val($('#createForm').find('input[name=phonetic]').val() + ".zip")
//				$('#picForm').ajaxSubmit({
//					url: config.api.upload,
//					success: function (picResult) {
//						if (picResult.uploaded && picResult.uploaded == 1) {
//							$('#createForm').find('input[name=fileName]').val(picResult.fileName)
//							$('#createForm').find('input[name=digest]').val(picResult.md5sum)
//							$('#createForm').find('input[name=digestType]').val('MD5')
//							$('#createForm').find('input[name=certType]').val("IC")
//							$('#createForm').find('input[name=cardType]').val("DEBIT")
//							$('#createForm').find('input[name=cardAttribute]').val("B")
//							$('#createForm').ajaxSubmit({
//								url: config.api.caccountCreate,
//								success: function (result) {
//									if(result.errorCode == 0){
//										$('#dataTable').bootstrapTable('refresh')
//										$('#createCaccountModal').modal('hide')
//									}else{
//										errorHandle(result)
//										$('#refreshDiv').removeClass('overlay');
//										$('#refreshI').removeClass('fa fa-refresh fa-spin');
//									}
//								}
//							})
//						} else {
//							window.alert("上传文件失败!")
//							$('#refreshDiv').removeClass('overlay');
//							$('#refreshI').removeClass('fa fa-refresh fa-spin');
//						}
//					}
//				})
			})
			
			$("#doExport").on("click",function(){
				util.tableToExcel($("#dataTable")[0],"企业管理")
			})
			
			$("#accSubmit").on('click', function(){
				if (!$('#accForm').validator('doSubmitCheck')) return
				$('#accForm').ajaxSubmit({
					url: config.api.uploginacc,
					success: function (result) {
						if(result.errorCode == 0){
							http.post(config.api.allacc, {
								contentType: 'application/json'
							}, function(result){
								var lista = '', listb = '';
								var ADMINACCLIST = [];
								result.allAcc.forEach(function(acc){
				            		lista += acc
				            	})
				            	config["ADMINLIST"].forEach(function(admin){
				            		if(!lista.match(admin.id)){
				            			listb += admin.id+','
				            		}
				            	})
				            	listb = listb.substr(0,listb.lastIndexOf(',')).split(',')
				            	listb.forEach(function(list){
				            		config["ADMINLIST"].forEach(function(admin){
				            			if (list === admin.id) {
				            				ADMINACCLIST.push(admin)
				            			}
				            		})
				            	})
				            	config["ADMINACCLIST"] = ADMINACCLIST
				            	$$.enumSourceInit($(document))
							})
							$('#accModal').modal('hide')
							$('#dataTable').bootstrapTable('refresh')
						}else{
							errorHandle(result)
						}
					}
				})
			})
			
			$('#bindCardSubmit').on('click', function(){
				if (!$('#bindCardForm').validator('doSubmitCheck')) return
				$('#bindCardForm').ajaxSubmit({
					url: config.api.bapply,
					success: function(res) {
						if (res.errorCode == 0) {
							$('#bindCardModal').modal('hide')
							$('#bindCardConfirmForm').clearForm()
							$("#bindCardConfirmForm").validator('destroy')
							util.form.validator.init($("#bindCardConfirmForm"));
							document.bindCardConfirmForm.baseAccountOid.value = document.bindCardForm.baseAccountOid.value
							document.bindCardConfirmForm.cardOrderId.value = res.cardOrderId
							$('#bindCardConfirmModal').modal('show')
						} else {
							errorHandle(res);
						}
					}
				})
			})
			
			$('#bindCardConfirmSubmit').on('click', function(){
				if (!$('#bindCardConfirmForm').validator('doSubmitCheck')) return
				$('#bindCardConfirmForm').ajaxSubmit({
					url: config.api.bconfirm,
					success: function(res) {
						if (res.errorCode == 0) {
							$('#bindCardConfirmModal').modal('hide')
							$('#dataTable').bootstrapTable('refresh')
						} else {
							errorHandle(res);
						}
					}
				})
			})
			
			$(document.bindCardForm.cardNo).on('input', function(){
				if($(this).val().length > 15){
					findBankByCard();
				}
			})
			
			$(document.bindCardForm.cardNo).on('blur', function(){
				if($(this).val().length > 15){
					findBankByCard();
				}
			})
			
			$(document.bindCardForm.bankName).on('change', function(){
				if($(document.bindCardForm.cardNo).val().length > 15){
					findBankByCard();
				}
			})
			
			function getQueryParams (val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.offset = val.offset
				pageOptions.phone = form.phone.value
				return val
			}
			
			function queryInfo(value,row){
				util.nav.dispatch('c_accountdetail', 'publisherOid=' + row.baseAccountOid);
			}
			
			function initBankList () {
				bankCodeList = []
				bankNameList = []
				http.post(config.api.caccountBank, {
					contentType: 'application/json'
				}, function(result){
					if (result.datas && result.datas.length > 0) {
						var html = ""
						result.datas.forEach(function(e, i){
							html += '<option value="' + e.bankName + '">' + e.bankName + '</option>'
							bankCodeList.push(e.peopleBankCode)
							bankNameList.push(e.bankName)
						})
						document.bindCardForm.bankName.innerHTML = html
						$('#bindCardModal').modal('show')
					}else{
						toastr.error("暂无可选择的银行", '错误信息', {
							timeOut: 2000
						})
					}
				})
			}
			
			function findBankByCard () {
				http.post(config.api.findBankByCard+"?bankCard="+document.bindCardForm.cardNo.value, {
					contentType: 'application/json'
				}, function(result){
					if(result.bankInfo.bankCode){
						if(result.bankInfo.bankCode == bankCodeList[bankNameList.indexOf($(document.bindCardForm.bankName).val())]){
							$('#cardNoDiv').removeClass("has-error")
							$('#cardNoError').html('')
						}else{
							if(bankCodeList.indexOf(result.bankInfo.bankCode) > -1){
								toastr.error("银行卡号与银行不匹配！已为您自动匹配银行", '错误信息', {
									timeOut: 2000
								})
								$('#cardNoDiv').removeClass("has-error")
								$('#cardNoError').html('')
								$(document.bindCardForm.bankName).val(bankNameList[bankCodeList.indexOf(result.bankInfo.bankCode)])
							}else{
								$('#cardNoDiv').addClass("has-error")
								$('#cardNoError').html('不支持该银行卡！')
							}
						}
					}else{
						$('#cardNoDiv').addClass("has-error")
						$('#cardNoError').html('银行卡号错误或不支持该银行卡！')
					}
				})
			}
		}
	}
})