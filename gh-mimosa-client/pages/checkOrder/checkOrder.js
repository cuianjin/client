// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'checkOrder',
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			pagesInit: function() {
				var _this = this;
				// 分页配置
				var pageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					checkCode: '',
			        beginCheckDate: '',
			        endCheckDate: '',
			        checkStatus: ''
				}
				var confirm = $('#confirmModal');
				// 数据表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.checkDataList, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									checkCode: pageOptions.checkCode,
				        			beginCheckDate: pageOptions.beginCheckDate,
				        			endCheckDate: pageOptions.endCheckDate,
				        			checkStatus: pageOptions.checkStatus,
								},
								contentType: 'form'
							}, function(rlt) {
								origin.success(rlt)
							})
						},
						idField: 'oid',
						pagination: true,
						sidePagination: 'server',
						pageList: [10, 20, 30, 50, 100],
						queryParams: getQueryParams,
						columns: [{
							width: 30,
							align: 'center',
							formatter: function(val, row, index) {
								return pageOptions.offset + index + 1
							}
						}, {
							field: 'checkCode'
						}, {
							field: 'checkDate',
							align: 'right'
						}, {
							field: 'checkStatusDisp'
						}, {
							field: 'gaStatusDisp'
						}, {
							field: 'checkDataSyncStatusDisp'
						}, {
							field: 'ldataStatusDisp'
						}, {
							field: 'wrongCount',
							class: 'quantity',
							align: 'right'
						}, {
							field: 'wrongLeftCount',
							class: 'quantity',
							align: 'right'
						}, {
							field: 'beginTime',
							align: 'right'
						}, {
							field: 'endTime',
							align: 'right'
						}, {
							align: 'center',
							formatter: function(val, row, index) {
								var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#dataTable').bootstrapTable('getData').length - 1,
								sub:[{
										text: '远程账单下载',
										type: 'button',
										class: 'synData',
										isRender: true || row.checkDataSyncStatus != 'syncing' && row.confirmStatus != "yes"
									}, {
										text: '本地交易记录准备',
										type: 'button',
										class: 'confirm',
										isRender: true || row.confirmStatus == 'no' && row.checkDataSyncStatus == 'syncOK' && row.checkStatus !='toCheck' && row.checkStatus !='checking'
									}, {
										text: '轧账',
										type: 'button',
										class: 'check',
										isRender: true || row.checkStatus != 'checking' && row.confirmStatus == 'no'  && row.checkDataSyncStatus == 'syncOK'
									}, {
										text: '对账处理',
										type: 'button',
										class: 'checkResult',
										isRender: true || row.checkDataSyncStatus == 'syncOK' && row.checkStatus !='toCheck' && row.checkStatus !='checking'
									}]
								}]
								return util.table.formatter.generateButton(buttons, 'dataTable');
							},
							events: {
								'click .confirm': function(e, value, row) {
									confirm.find('.popover-title').html('提示');
									confirm.find('p').html('是否进行本地交易记录准备?');
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.checkDataConfirm, {
												data: {
													checkOid: row.checkOid
												},
												contentType: 'form',
											}, function(result) {
												$('#dataTable').bootstrapTable('refresh')
											})
										}
									})
								},
								'click .synData': function(e, value, row) {
									confirm.find('.popover-title').html('提示');
									confirm.find('p').html('请确认是否立即下载远程账单?');
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.synCompareData, {
												data: {
													checkOid: row.checkOid
												},
												contentType: 'form',
											}, function(result) {
												$('#dataTable').bootstrapTable('refresh')
											})
										}
									})
								},
								'click .checkResult': function(e, value, row) {
									$("#chekResultTable").bootstrapTable("destroy");
									// 分页配置
									var pageOptions = {
										number: 1,
										size: 10,
										offset: 0,
										orderCode : '',
										iPayNo : '',
										dealStatus : ''
									}
									function getQueryParams(val) {
										// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
										var form = document.resultSearchForm
										// 分页数据赋值
										pageOptions.size = val.limit
										pageOptions.number = parseInt(val.offset / val.limit) + 1
										pageOptions.offset = val.offset
										pageOptions.orderCode = form.orderCode.value
										pageOptions.iPayNo = form.iPayNo.value
										pageOptions.dealStatus = form.dealStatus.value
										return val
									}
									// 数据表格配置
									var tableConfig = {
										ajax: function(origin) {
											http.post(config.api.checkResultList, {
												data: {
													page: pageOptions.number,
													rows: pageOptions.size,
													checkOid: row.checkOid,
													orderCode : pageOptions.orderCode,
													iPayNo : pageOptions.iPayNo,
													dealStatus : pageOptions.dealStatus
												},
												contentType: 'form'
											}, function(rlt) {
												origin.success(rlt)
											})
										},
										idField: 'oid',
										pagination: true,
										sidePagination: 'server',
										pageList: [10, 20, 30, 50, 100],
										queryParams: getQueryParams,
										columns: [{
											width: 30,
											align: 'center',
											formatter: function(val, row, index) {
												return pageOptions.offset + index + 1
											}
										}, {
											field: 'orderCode'
										}, {
											field: 'ipayNo'
										}, {
											field: 'orderTypeDisp'
										}, {
											field: 'orderAmount',
											class: 'currency',
											align: 'right'
										}, {
											field: 'voucher',
											class: 'currency',
											align: 'right'
										}, {
											field: 'fee',
											class: 'currency',
											align: 'right'
										}, {
											field: 'orderStatusDisp'
										}, {
											field: 'orderTime',
											align: 'right'
										}, {
											field: 'investorOid'
										}, {
											field: 'userTypeDisp'
										}, {
											field: 'checkStatusDisp'
										}, {
											field: 'outerOrderCode'
										}, {
											field: 'outerOrderType'
										}, {
											field: 'buzzOrderTypeDisp'
										}, {
											field: 'tradeAmount',
											class: 'currency',
											align: 'right'
										}, {
											field: 'outerVoucher',
											class: 'currency',
											align: 'right'
										}, {
											field: 'outerFee',
											class: 'currency',
											align: 'right'
										}, {
											field: 'outerOrderStatus'
										}, {
											field: 'buzzOrderStatusDisp'
										}, {
											field: 'outerOrderTime',
											align: 'right'
										}, {
											field: 'outerInvestorOid'
										}, {
											field: 'outerUserType'
										}, {
											field: 'buzzUserTypeDisp'
										}, {
											field: 'outerCheckStatusDisp'
										}, {
											field: 'dealStatusDisp'
										}, {
											align:'center',
											formatter: function(val, row, index) {
												var buttons = [{
													text: '操作',
													type: 'buttonGroup',
													sub:[{
														text: '投资人充值长款',
														type: 'button',
														class: 'item-idepositlong',
														isRender: row.outerCheckStatus === 'long' && row.buzzUserType === 'investor' && row.dealStatus === 'toDeal' && row.buzzOrderType === 'deposit'
													}, {
														text: '投资人充值短款',
														type: 'button',
														class: 'item-idepositshort',
														isRender: row.checkStatus === 'short' && row.userType === 'investor' && row.dealStatus === 'toDeal' && row.orderType === 'deposit'
													}, {
														text: '投资人提现长款',
														type: 'button',
														class: 'item-iwithdrawlong',
														isRender: row.outerCheckStatus === 'long' && row.buzzUserType === 'investor' && row.dealStatus === 'toDeal' && row.buzzOrderType === 'withdraw'
													}, {
														text: '投资人提现短款',
														type: 'button',
														class: 'item-iwithdrawshort',
														isRender: row.checkStatus === 'short' && row.userType === 'investor' && row.dealStatus === 'toDeal' && row.orderType === 'withdraw'
													}, {
														text: '投资人红包短款',
														type: 'button',
														class: 'item-iredenvelopeshort',
														isRender: row.checkStatus === 'short' && row.userType === 'investor' && row.dealStatus === 'toDeal' && row.orderType === 'redEnvelope'
													}, {
														text: '发行人充值长款',
														type: 'button',
														class: 'item-pdepositlong',
														isRender: row.outerCheckStatus === 'long' && row.buzzUserType === 'spv' && row.dealStatus === 'toDeal' && row.buzzOrderType === 'deposit'
													}, {
														text: '发行人充值短款',
														type: 'button',
														class: 'item-pdepositshort',
														isRender: row.checkStatus === 'short' && row.userType === 'spv' && row.dealStatus === 'toDeal' && row.orderType === 'deposit'
													}, {
														text: '发行人提现长款',
														type: 'button',
														class: 'item-pwithdrawlong',
														isRender: row.outerCheckStatus === 'long' && row.buzzUserType === 'spv' && row.dealStatus === 'toDeal' && row.buzzOrderType === 'withdraw'
													}, {
														text: '发行人提现短款',
														type: 'button',
														class: 'item-pwithdrawshort',
														isRender: row.checkStatus === 'short' && row.userType === 'spv' && row.dealStatus === 'toDeal' && row.orderType === 'withdraw'
													}, {
														text: '投资人回调成功',
														type: 'button',
														class: 'item-inotifyok',
														isRender: row.checkStatus === 'notifyOk' && row.buzzUserType === 'investor' && row.dealStatus === 'toDeal'
													}, {
														text: '投资人回调失败',
														type: 'button',
														class: 'item-inotifyfail',
														isRender: row.checkStatus === 'notifyFail' && row.buzzUserType === 'investor' && row.dealStatus === 'toDeal'
													}, {
														text: '发行人回调成功',
														type: 'button',
														class: 'item-pnotifyok',
														isRender: row.checkStatus === 'notifyOk' && row.buzzUserType === 'spv' && row.dealStatus === 'toDeal'
													}, {
														text: '发行人回调失败',
														type: 'button',
														class: 'item-pnotifyfail',
														isRender: row.checkStatus === 'notifyFail' && row.buzzUserType === 'spv' && row.dealStatus === 'toDeal'
													}]
												}]
												return util.table.formatter.generateButton(buttons, 'chekResultTable');
											},events: {
												'click .item-idepositlong': function(e, value, row) {
													$('#longForm').clearForm();
													$('#fee').attr('disabled', 'disabled')
													$$.formAutoFix($('#longForm'), row);
													$('#longRefreshDiv').removeClass('overlay');
													$('#longRefreshI').removeClass('fa fa-refresh fa-spin');
													$('#longModal').modal({
														show: true,
														backdrop: 'static'
													}).find(".modal-title").html("投资人充值长款");
													$("#longForm").validator('destroy');
													util.form.validator.init($("#longForm"));
												},
												'click .item-idepositshort': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.idepositshort, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	orderCode: row.orderCode
																}),
																contentType: 'application/json'
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-iwithdrawlong': function(e, value, row) {
													$('#longForm').clearForm();
													$('#fee').removeAttr('disabled')
													$$.formAutoFix($('#longForm'), row);
													$('#longRefreshDiv').removeClass('overlay');
													$('#longRefreshI').removeClass('fa fa-refresh fa-spin');
													$('#longModal').modal({
														show: true,
														backdrop: 'static'
													}).find(".modal-title").html("投资人提现长款");
													$("#longForm").validator('destroy');
													util.form.validator.init($("#longForm"));
												},
												'click .item-iwithdrawshort': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.iwithdrawshort, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	orderCode: row.orderCode
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-iredenvelopeshort': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.iredenvelopeshort, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	orderCode: row.orderCode
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-pdepositlong': function(e, value, row) {
													$('#longForm').clearForm();
													$('#fee').attr('disabled', 'disabled')
													$$.formAutoFix($('#longForm'), row);
													$('#longRefreshDiv').removeClass('overlay');
													$('#longRefreshI').removeClass('fa fa-refresh fa-spin');
													$('#longModal').modal({
														show: true,
														backdrop: 'static'
													}).find(".modal-title").html("发行人充值长款");
													$("#longForm").validator('destroy');
													util.form.validator.init($("#longForm"));
												},
												'click .item-pdepositshort': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.pdepositshort, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	orderCode: row.orderCode
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-pwithdrawlong': function(e, value, row) {
													$('#longForm').clearForm();
													$('#fee').removeAttr('disabled')
													$$.formAutoFix($('#longForm'), row);
													$('#longRefreshDiv').removeClass('overlay');
													$('#longRefreshI').removeClass('fa fa-refresh fa-spin');
													$('#longModal').modal({
														show: true,
														backdrop: 'static'
													}).find(".modal-title").html("发行人提现长款");
													$("#longForm").validator('destroy');
													util.form.validator.init($("#longForm"));
												},
												'click .item-pwithdrawshort': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.pwithdrawshort, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	orderCode: row.orderCode
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-inotifyok': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.inotifyok, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	payNo: row.ipayNo
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-inotifyfail': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.inotifyfail, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	payNo: row.ipayNo
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-pnotifyok': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.pnotifyok, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	payNo: row.ipayNo
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												},
												'click .item-pnotifyfail': function(e, value, row) {
													confirm.find('.popover-title').html('提示');
													confirm.find('p').html('是否确认?');
													$$.confirm({
														container: confirm,
														trigger: this,
														accept: function() {
															http.post(config.api.pnotifyfail, {
																data: JSON.stringify({
																	crOid: row.crOid,
																	payNo: row.ipayNo
																}),
																contentType: 'application/json',
															}, function(result) {
																$('#dataTable').bootstrapTable('refresh')
																$('#chekResultTable').bootstrapTable('refresh')
															})
														}
													})
												}
											}
						
										}]
									}
									// 初始化数据表格
									$('#chekResultTable').bootstrapTable(tableConfig);
//									$('#chekResultTable').bootstrapTable('refresh');
									$('#chekResultModal').modal({
										show: true,
										backdrop: 'static'
									}).find('.modal-title').html("对账处理");
								},
								'click .check': function(e, value, row) {
									confirm.find('.popover-title').html('提示');
									confirm.find('p').html('请确认是否立即轧账?');
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.checkOrder, {
												data: {
													checkOid : row.checkOid
												},
												contentType: 'form',
											}, function(result) {
												$('#dataTable').bootstrapTable('refresh');
											})
										}
									})
								}
							}
						}]
					}
					// 初始化数据表格
				$('#dataTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#dataTable'));
				$$.searchInit($('#resultSearchForm'), $('#chekResultTable'));
				util.form.validator.init($("#addOrderForm"));
				util.form.validator.init($("#removeOrderForm"));
				util.form.validator.init($("#refundForm"));
				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
					// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.checkCode = form.checkCode.value
			        pageOptions.beginCheckDate = form.beginCheckDate.value
			        pageOptions.endCheckDate = form.endCheckDate.value
			        pageOptions.checkStatus = form.checkStatus.value
					return val
				}
			},
			bindEvent: function() {
				var _this = this;
				$("#addBankOrderSubmit").on('click',function(){
					$('#addBankOrderRefreshDiv').addClass('overlay');
				    $('#addBankOrderRefreshI').addClass('fa fa-refresh fa-spin');
				    var checkOid=document.addBankOrderForm.checkOid.value;
					var investorOid=document.addBankOrderForm.checkInvestorOid.value;
					var orderAmount=document.addBankOrderForm.checkOrderAmount.value;
					var tradeType=document.addBankOrderForm.checkOrderType.value;
					var orderCode=document.addBankOrderForm.checkOrderCode.value;
					var orderTime=document.addBankOrderForm.orderTime.value;
					var resultOid=document.addBankOrderForm.oid.value;
					http.post(config.api.saveModifyOrder, {
						data: {
							'checkOid': checkOid,
							'investorOid':investorOid,
							'orderAmount':orderAmount,
							'tradeType':tradeType,
							'orderCode':orderCode,
							'orderTime':orderTime,
							'resultOid':resultOid,
							'opType':'fixOrder'
						},
						contentType: 'form'
					}, function(result) {
						if(result.errorCode==0){
							$('#addBankOrderModal').modal('hide');
							$('#chekResultTable').bootstrapTable('refresh');
						}
						$('#addBankOrderRefreshDiv').removeClass('overlay');
				    	$('#addBankOrderRefreshI').removeClass('fa fa-refresh fa-spin');
					});
				});
				$("#removeBankOrderSubmit").on('click',function(){
					$('#removeBankOrderRefreshDiv').addClass('overlay');
				    $('#removeBankOrderRefreshI').addClass('fa fa-refresh fa-spin');
				    var checkOid=document.removeBankOrderForm.checkOid.value;
					var investorOid=document.removeBankOrderForm.investorOid.value;
					var tradeType=document.removeBankOrderForm.orderType.value;
					var orderCode=document.removeBankOrderForm.orderCode.value;
					var premodifyStatus=document.removeBankOrderForm.orderStatus.value;
					var resultOid=document.removeBankOrderForm.oid.value;
					var orderTime=document.removeBankOrderForm.orderTime.value;
					var orderAmount=document.removeBankOrderForm.orderAmount.value;
					http.post(config.api.saveModifyOrder, {
						data: {
							'checkOid': checkOid,
							'investorOid':investorOid,
							'orderAmount':orderAmount,
							'tradeType':tradeType,
							'orderCode':orderCode,
							'orderAmount':orderAmount,
							'premodifyStatus':premodifyStatus,
							'resultOid':resultOid,
							'orderTime':orderTime,
							'opType':'removeOrder'
						},
						contentType: 'form'
					}, function(result) {
						if(result.errorCode==0){
							$('#removeBankOrderModal').modal('hide');
							$('#chekResultTable').bootstrapTable('refresh');
						}
						$('#removeBankOrderRefreshDiv').removeClass('overlay');
				    	$('#removeBankOrderRefreshI').removeClass('fa fa-refresh fa-spin');
					});
				});
				$("#checkAmount").on('click',function(){
					if ($(this).is(':checked')) {
						$("#removeOrderForm").find("input[name=orderAmount]").attr("required",true);
						$("#removeOrderForm").validator('destroy');
						util.form.validator.init($("#removeOrderForm"));
						$("#removeOrderForm").find("input[name=orderAmount]").val("").show();
					} else {
						$("#removeOrderForm").find("input[name=orderAmount]").removeAttr("required");
						$("#removeOrderForm").validator('destroy');
						$("#removeOrderForm").find("input[name=orderAmount]").hide();
					}
				});
				
				$("#removeTradeOrderSubmit").on('click',function(){
					$('#removeTradeOrderRefreshDiv').addClass('overlay');
				    $('#removeTradeOrderRefreshI').addClass('fa fa-refresh fa-spin');
				    var checkOid=document.removeTradeOrderForm.checkOid.value;
					var investorOid=document.removeTradeOrderForm.investorOid.value;
					var tradeType=document.removeTradeOrderForm.orderType.value;
					var orderCode=document.removeTradeOrderForm.orderCode.value;
					var premodifyStatus=document.removeTradeOrderForm.orderStatus.value;
					var resultOid=document.removeTradeOrderForm.oid.value;
					var orderTime=document.removeTradeOrderForm.orderTime.value;
					var orderAmount=document.removeTradeOrderForm.orderAmount.value;
					http.post(config.api.saveModifyOrder, {
						data: {
							'checkOid': checkOid,
							'investorOid':investorOid,
							'orderAmount':orderAmount,
							'tradeType':tradeType,
							'orderCode':orderCode,
							'orderAmount':orderAmount,
							'premodifyStatus':premodifyStatus,
							'resultOid':resultOid,
							'orderTime':orderTime,
							'opType':'removeOrder'
						},
						contentType: 'form'
					}, function(result) {
						if(result.errorCode==0){
							$('#removeTradeOrderModal').modal('hide');
							$('#chekResultTable').bootstrapTable('refresh');
						}
						$('#removeTradeOrderRefreshDiv').removeClass('overlay');
				    	$('#removeTradeOrderRefreshI').removeClass('fa fa-refresh fa-spin');
					});
				});
				$("#addTradeOrderSubmit").on('click',function(){
					
					$('#addTradeOrderRefreshDiv').addClass('overlay');
				    $('#addTradeOrderRefreshI').addClass('fa fa-refresh fa-spin');
				    var checkOid=document.addTradeOrderForm.checkOid.value;
					var investorOid=document.addTradeOrderForm.checkInvestorOid.value;
					var orderAmount=document.addTradeOrderForm.checkOrderAmount.value;
					var tradeType=document.addTradeOrderForm.checkOrderType.value;
					var orderCode=document.addTradeOrderForm.checkOrderCode.value;
					var orderTime=document.addTradeOrderForm.orderTime.value;
					var resultOid=document.addTradeOrderForm.oid.value;
					http.post(config.api.saveModifyOrder, {
						data: {
							'checkOid': checkOid,
							'investorOid':investorOid,
							'orderAmount':orderAmount,
							'tradeType':tradeType,
							'orderCode':orderCode,
							'orderTime':orderTime,
							'resultOid':resultOid,
							'opType':'fixOrder'
						},
						contentType: 'form'
					}, function(result) {
						if(result.errorCode==0){
							$('#addTradeOrderModal').modal('hide');
							$('#chekResultTable').bootstrapTable('refresh');
						}
						$('#addTradeOrderRefreshDiv').removeClass('overlay');
				    	$('#addTradeOrderRefreshI').removeClass('fa fa-refresh fa-spin');
					});
				});
				
				$("#longSubmit").on('click',function(){
					if (!$('#longForm').validator('doSubmitCheck')) return
					$('#longRefreshDiv').addClass('overlay');
				    $('#longRefreshI').addClass('fa fa-refresh fa-spin');
					
					var url = '', title = $("#longModal").find(".modal-title").html(), form = document.longForm;
					var data = {
						msg: form.msg.value,
						crOid: form.crOid.value,
						orderCode: form.outerOrderCode.value,
						orderAmount: form.tradeAmount.value,
						orderStatus: form.buzzOrderStatus.value,
						orderTime: form.outerOrderTime.value,
						investorOid: form.outerInvestorOid.value
					}
					if(title == '投资人充值长款'){
						url = config.api.idepositlong
					}else if(title == '投资人提现长款'){
						url = config.api.iwithdrawlong
						data.fee = form.outerFee.value
					}else if(title == '发行人充值长款'){
						url = config.api.pdepositlong
					}else if(title == '发行人提现长款'){
						url = config.api.pwithdrawlong
						data.fee = form.outerFee.value
					}
					
					http.post(url, {
						data: JSON.stringify(data),
						contentType: 'application/json',
					}, function(result) {
						$('#dataTable').bootstrapTable('refresh')
						$('#chekResultTable').bootstrapTable('refresh')
						$('#longModal').modal('hide')
					}, function(err){
						errorHandle(err)
						$('#longRefreshDiv').removeClass('overlay');
				    	$('#longRefreshI').removeClass('fa fa-refresh fa-spin');
					})
				});
				/*$("#checkResultTableDown").on('click',function(){	
					util.tableToExcel("chekResultTable", "数据分布")	
				});*/
			}

		}
	})