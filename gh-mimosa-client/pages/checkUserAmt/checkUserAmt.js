// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'checkUserAmt',
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
					checkStatus: '',
					userStatus: ''
				}
				
				var moneyChangePageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					investOid: '',
					recorrectDirection: '',
					recorrectType: '',
					orderType: '',
					doCheckType: '',
					createTimeBegin: '',
					createTimeEnd: ''
				}
				
				// 数据表格配置
				var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.check.query, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								phone: pageOptions.phone,
								checkStatus: pageOptions.checkStatus,
								userStatus: pageOptions.userStatus
							},
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
							
							http.post(config.api.check.platformAmt, {
								data: {},
								contentType: 'form'
							}, function(result) {
								$('#moneyAmt').html(result.allMoneyAmount);
								$('#capitalAmt').html(result.allCapitalAmount);
								if (result.allMoneyAmount !== result.allCapitalAmount) {
									$('#moneyAmt').addClass('text-red');
									$('#capitalAmt').addClass('text-red');
								}
							})
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
						field: 'moneyAmount',
						class: 'align-right',
						formatter: function(val, row, index) {
							var value = $.number(val, 2);
							if (row.moneyAmount !== row.capitalAmount) {
								value = '<span class="text-red">' + value + '</span>'
							}
							return value;
						}
					}, {
						field: 'capitalAmount',
						class: 'align-right',
						formatter: function(val, row, index) {
							var value = $.number(val, 2);
							if (row.moneyAmount !== row.capitalAmount) {
								value = '<span class="text-red">' + value + '</span>'
							}
							return value;
						}
					}, {
						field: 'checkStatus'
					}, 
//					{
//						field: 'allRecorrectAmt',
//						class: 'align-right'
//					}, 
					{
						field: 'userStatus'
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#checkUserAmtTable').bootstrapTable('getData').length - 1,
								sub:[
//								{
//									text: '资金变动记录',
//									type: 'button',
//									class: 'moneyChangeDetail',
//									isRender: true
//								}, 
								{
									text: '账号开启',
									type: 'button',
									class: 'accopen',
									isRender: row.moneyAmount !== row.capitalAmount
								}, {
									text: '重算',
									type: 'button',
									class: 'recheck',
									isRender: row.moneyAmount !== row.capitalAmount
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'checkUserAmtTable');
						},
						events: {
							'click .detail': function(e, value, row) {
								
							},
							'click .moneyChangeDetail': function(e, value, row) {
								moneyChangePageOptions.investOid = row.investOid;
								$('#monChangeDetailSearchForm').resetForm();
								$('#moneyChangeDetailTable').bootstrapTable('refresh')
								$('#moneyChangeDetailModal').modal('show')
							},
							'click .accopen': function(e, value, row) {
								var confirm = $("#confirmModal");
								confirm.find('p').html('确定开启当前用户？');
								$$.confirm({
									container: confirm,
									trigger: this,
									accept: function() {
										http.post(config.api.check.unlock, {
											data: {
												checkOid: row.oid
											},
											contentType: 'form',
										}, function(res) {
											$('#checkUserAmtTable').bootstrapTable('refresh')
											confirm.modal('hide')
										})
									}
								})
								
							},
							'click .recheck': function(e, value, row) {
								var confirm = $("#confirmModal");
								confirm.find('p').html('确定重算当前用户？');
								$$.confirm({
									container: confirm,
									trigger: this,
									accept: function() {
										http.post(config.api.check.singleCheck, {
											data: {
												checkOid: row.oid
											},
											contentType: 'form',
										}, function(res) {
											$('#checkUserAmtTable').bootstrapTable('refresh')
											confirm.modal('hide')
										})
									}
								})
							}
						}
					}]
				}
		
//				var moneyChangeDetailTableConfig = {
//					
//					ajax: function(origin) {
//						http.post(config.api.check.recorrectQuery, {
//							data: {
//								page: moneyChangePageOptions.number,
//								rows: moneyChangePageOptions.size,
//								investOid: moneyChangePageOptions.investOid,
//								recorrectDirection: moneyChangePageOptions.recorrectDirection,
//								recorrectType: moneyChangePageOptions.recorrectType,
//								orderType: moneyChangePageOptions.orderType,
//								doCheckType: moneyChangePageOptions.doCheckType,
//								createTimeBegin: moneyChangePageOptions.createTimeBegin,
//								createTimeEnd: moneyChangePageOptions.createTimeEnd,
//							},
//							contentType: 'form'
//						}, function(rlt) {
//							origin.success(rlt)
//						})
//					},
//					idField: 'oid',
//					pagination: true,
//					sidePagination: 'server',
//					pageList: [10, 20, 30, 50, 100],
//					queryParams: getMoneyChangeDetailQueryParams,
//					columns: [{
//						width: 30,
//						align: 'center',
//						formatter: function(val, row, index) {
//							return moneyChangePageOptions.offset + index + 1
//						}
//					}, {
//						field: 'checkTime'						
//					}, {
//						field: 'phone'
//					}, {
//						field: 'yesterdayCapitalAmt'
//					}, {
//						field: 'balance'
//					}, {
//						field: 'applyBalance'
//					}, {
//						field: 't0ApplyAmt'
//					}, {
//						field: 't0HoldAmt'
//					}, {
//						field: 'tnApplyAmt'
//					}, {
//						field: 'tnHoldlAmt'
//					}, {
//						field: 'recorrectAmt'
//					}, {
//						field: 'recorrectReason'
//					}, {
//						field: 'operator'
//					}, {
//						field: 'capitalAmt'
//					}]
//				}
				
				// 初始化数据表格
				$('#checkUserAmtTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#checkUserAmtTable'));

				util.form.validator.init($('#recorrectForm'))
				
//				$('#moneyChangeDetailTable').bootstrapTable(moneyChangeDetailTableConfig);
				$$.searchInit($('#monChangeDetailSearchForm'), $('#moneyChangeDetailTable'));

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.phone = form.phone.value
					pageOptions.checkStatus = form.checkStatus.value
					pageOptions.userStatus = form.userStatus.value
					return val
				}
				
				function getMoneyChangeDetailQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.monChangeDetailSearchForm
						// 分页数据赋值
					moneyChangePageOptions.size = val.limit
					moneyChangePageOptions.number = parseInt(val.offset / val.limit) + 1
					moneyChangePageOptions.offset = val.offset
					moneyChangePageOptions.recorrectType = form.recorrectType.value.trim() 
					moneyChangePageOptions.createTimeBegin =  form.createTimeBegin.value.trim() 
					moneyChangePageOptions.createTimeEnd = form.createTimeEnd.value.trim()						
					return val
				}
				function queryInfo(value,row){
					$$.detailAutoFix($('#detailForm'), row);
					$('#detailModal').modal('show')
				}
			},
			bindEvent: function() {
				var _this = this;
				
				// 对账
				$("#checkUserAmtBtn").on("click", function() {
					$('#checkRefreshDiv').addClass('overlay');
					$('#checkRefreshI').addClass('fa fa-refresh fa-spin');
					
					http.post(config.api.check.generate, {
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
						$('#checkUserAmtTable').bootstrapTable('refresh');
					} 
					$('#checkRefreshDiv').removeClass('overlay');
					$('#checkRefreshI').removeClass('fa fa-refresh fa-spin');
				}
				
			}
		}
	})