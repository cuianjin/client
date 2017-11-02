// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'checkUserMoneyDetail',
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
					phone: '',
					checkStatus: ''
				}
				
				var moneyChangePageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					investOid: '',
					tradeType: '',				
					createTimeBegin: '',
					createTimeEnd: ''
				}
							
				// 数据表格配置
				var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.check.detailQuery, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								phone: pageOptions.phone,
								checkStatus: pageOptions.checkStatus
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
					 onClickCell: function (field, value, row, $element) {
					  switch (field) {
				        case 'phone':
				        	queryInfo(value,row)
				        	break
						}
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return pageOptions.offset + index + 1
						}
					}, {
						field: 'checkTime',
						class: 'align-right'
					}, {
						field: 'phone',
						class: 'table_title_detail'
					}, 
//					{
//						field: 'investOid'
//					}, 
					{
						field: 'balance',
						class: 'currency align-right',
						formatter: function(val, row, index) {
							var value = $.number(val, 2);;
							if (row.balance !== row.recorrectBalance) {
								value = '<span class="text-red">' + value + '</span>'
							}
							return value;
						}
					}, {
						field: 'recorrectBalance',
						class: 'currency align-right',
						formatter: function(val, row, index) {
							var value = $.number(val, 2);;
							if (row.balance !== row.recorrectBalance) {
								value = '<span class="text-red">' + value + '</span>'
							}
							return value;
						}
					}, {
						field: 'checkStatus'
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#checkUserAmtDetailTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '重算',
									type: 'button',
									class: 'reRecorrect',
									isRender: row.balance !== row.recorrectBalance
								}
//								,
//								{
//									text: '补登',
//									type: 'button',
//									class: 'recorrect',
//									isRender: row.balance !== row.recorrectBalance
//								}
								]
							}]
							return util.table.formatter.generateButton(buttons, 'checkUserAmtDetailTable');
						},
						events: {
							'click .detail': function(e, value, row) {
								
							},
							'click .reRecorrect': function(e, value, row) {
								var confirm = $('#confirmModal');
								$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.check.singleGenerate +'?detailOid=' + row.oid, {
												data: {},
												contentType: 'form',
											}, function(res) {
												confirm.modal('hide')
												$('#checkUserAmtDetailTable').bootstrapTable('refresh')
											})
										}
									})
							},
							'click .recorrect': function(e, value, row) {
								var form = document.recorrectForm
								$(form).validator('destroy')
								util.form.validator.init($(form));
								util.form.reset($('#recorrectForm'));
								$(form.orderType).html('<option value="recharge">充值</option><option value="redeem">赎回</option><option value="intConfirm">收益确认</option>')
								
								form.userMaxCheckTime.value = row.userMaxCheckTime;
								form.checkTime.value = row.checkTime;
								form.investOid.value = row.investOid
								$('#recorrectModal').modal('show')
							}
						}
					}]
				}
				
				var moneyChangeDetailTableConfig = {
					ajax: function(origin) {
						http.post(config.api.check.query4recorrect, {
							data: {
								page: moneyChangePageOptions.number,
								rows: moneyChangePageOptions.size,
								investOid: moneyChangePageOptions.investOid,
								tradeType: moneyChangePageOptions.tradeType,
								createTimeBegin: moneyChangePageOptions.createTimeBegin,
								createTimeEnd: moneyChangePageOptions.createTimeEnd
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
					queryParams: getMoneyChangeDetailQueryParams,
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return moneyChangePageOptions.offset + index + 1
						}
					}, {
						field: 'phone'
					}, {
						field: 'direction'
					}, {
						field: 'orderType'
					}, {
						field: 'orderTime',
						align: 'right'
					}, {
						field: 'orderAmt',
						class: 'currency',
						align: 'right'
					}, {
						field: 'doCheckType'
					}]
				}
				
				// 初始化数据表格
				$('#checkUserAmtDetailTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#checkUserAmtDetailTable'));

				util.form.validator.init($('#recorrectForm'))
				
				$('#moneyChangeDetailsTable').bootstrapTable(moneyChangeDetailTableConfig);
				$$.searchInit($('#moneyChangeDetailSearchForm'), $('#moneyChangeDetailsTable'));

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.phone = form.phone.value.trim()
					pageOptions.checkStatus = form.checkStatus.value
					return val
				}
				
				function getMoneyChangeDetailQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.moneyChangeDetailSearchForm
					
//					var directionArr = form.direction.value.split(",");
//					var doCheckTypeArr = form.doCheckType.value.split(",");

					// 分页数据赋值
					moneyChangePageOptions.size = val.limit
					moneyChangePageOptions.number = parseInt(val.offset / val.limit) + 1
					moneyChangePageOptions.offset = val.offset
					moneyChangePageOptions.tradeType = form.tradeType.value
					moneyChangePageOptions.createTimeBegin = form.createTimeBegin.value
					moneyChangePageOptions.createTimeEnd = form.createTimeEnd.value								
					return val
				}
				function queryInfo(value,row){
					moneyChangePageOptions.investOid = row.investOid;
					$('#moneyChangeDetailSearchForm').resetForm();
					$('#moneyChangeDetailsTable').bootstrapTable('refresh')
					$('#moneyChangeDetailModal').modal('show')
				}
			},
			bindEvent: function() {
				var _this = this;

				$(document.recorrectForm.recorrectDirection).on('click', function(){
					if (this.value == 'add') {
						$(document.recorrectForm.orderType).html('<option value="recharge">充值</option><option value="redeem">赎回</option><option value="intConfirm">收益确认</option>')
					} else {
						$(document.recorrectForm.orderType).html('<option value="withdraw">提现</option><option value="buy">申购</option>')
					}
				})

				//新增补登记录
				$("#recorrectSubmit").on("click", function() {
					if (!$('#recorrectForm').validator('doSubmitCheck')) return
					$('#recorrectForm').ajaxSubmit({
						url: config.api.check.addRecorrect,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#checkUserAmtDetailTable').bootstrapTable('refresh');
								$('#recorrectModal').modal('hide')
							} else {
								errorHandle(res);
							}
						}
					})
				});
				
				// 对账
				$("#checkDetailAmtBtn").on("click", function() {
					$('#checkRefreshDiv').addClass('overlay');
					$('#checkRefreshI').addClass('fa fa-refresh fa-spin');
					
					http.post(config.api.check.detailGenetate, {
							data: {},
							contentType: 'form'
						}, function(res) {
							resultFun(res);
						},function(res) {
							resultFun(res);
							errorHandle(res)
						})
				});
				
				function resultFun(res) {
					if (res.errorCode == 0) {
						$('#checkUserAmtDetailTable').bootstrapTable('refresh');
					} 
					$('#checkRefreshDiv').removeClass('overlay');
					$('#checkRefreshI').removeClass('fa fa-refresh fa-spin');
				}
				
			}
		}
	})