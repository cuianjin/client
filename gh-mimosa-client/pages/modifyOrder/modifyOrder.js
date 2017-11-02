// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'modifyOrder',
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			pagesInit: function() {
				var _this = this;
				/**
				 * 用于存储表格checkbox选中的项
				 */
				var checkItems = []
				// 分页配置
				var pageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					orderCode: '',
			        opType: '',
			        checkCode:''
				}
				var confirm = $('#confirmModal');
				// 数据表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.modifyOrderList, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									orderCode: pageOptions.orderCode,
				        			opType: pageOptions.opType,
				        			checkCode: pageOptions.checkCode
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
							checkbox: true,
							align: 'center'
						},{
							width: 30,
							align: 'center',
							formatter: function(val, row, index) {
								return pageOptions.offset + index + 1
							}
						}, {
							field: 'checkCode'
						}, {
							field: 'orderCode',
							align: 'right'
						}, {
							field: 'tradeType',
							formatter: function(val, row, index) {
								return util.enum.transform('orderType', val);
							}
						}, {
							field: 'orderAmount',
							align: 'right'
						}, {
							field: 'opType',
							formatter: function(val, row, index) {
								return util.enum.transform('checkOpType', val);
							}
						}, {
							field: 'investorOid'
						}, {
							field: 'approveStatus',
							formatter: function(val, row, index) {
								return util.enum.transform('checkApproveStatus', val);
							}
						}, {
							field: 'dealStatus',
							formatter: function(val, row, index) {
								return util.enum.transform('dealStatus', val);
							}
						}, {
							field: 'operator' 
						}, {
							field: 'updateTime',
							align: 'right',
							formatter: function(val, row, index) {
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}
						}, {
							field: 'createTime',
							align: 'right',
							formatter: function(val, row, index) {
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}
						}, {
							align: 'center',
							formatter: function(val, row, index) {
									var buttons = [{
										text: '操作',
										type: 'buttonGroup',
//										isCloseBottom: index >= $('#channelTable').bootstrapTable('getData').length - 1,
										sub:[{
											text: '通过',
											type: 'button',
											class: 'pass',
											isRender: row.approveStatus == 'toApprove' 
										}, {
											text: '驳回',
											type: 'button',
											class: 'refused',
											isRender: row.approveStatus == 'toApprove' 
										}]
									}]
								return util.table.formatter.generateButton(buttons, 'channelTable');
							},
							events: {
								'click .pass': function(e, value, row) {
									confirm.find('.popover-title').html('提示');
									confirm.find('p').html('是否通过审核?');
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.modifyOrderApprove, {
												data: {
													oid: row.oid,
													resultOid: row.resultOid,
													approveStatus : 'pass'
												},
												contentType: 'form',
											}, function(result) {
												confirm.modal('hide')
												$('#dataTable').bootstrapTable('refresh')
											})
										}
									})
								},
								'click .refused': function(e, value, row) {
									confirm.find('.popover-title').html('提示');
									confirm.find('p').html('是否驳回审核?');
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.modifyOrderApprove, {
												data: {
													oid: row.oid,
													resultOid: row.resultOid,
													approveStatus : 'refused'
												},
												contentType: 'form',
											}, function(result) {
												confirm.modal('hide')
												$('#dataTable').bootstrapTable('refresh')
											})
										}
									})
								}
							}
						}],
						/**
						 * 单选按钮选中一项时
						 * @param {Object} row
						 */
						onCheck: function(row) {
							var indexOf = -1
							if(checkItems.length > 0) {
								checkItems.forEach(function(item, index) {
									if(item.oid == row.oid) {
										indexOf = index
									}
								})
							}
							if(indexOf < 0) {
								checkItems.push(row)
							}
						},
		
						/**
						 * 单选按钮取消一项时
						 * @param {Object} row
						 */
						onUncheck: function(row) {
							checkItems.splice(checkItems.indexOf(row), 1)
						},
		
						/**
						 * 全选按钮选中时
						 * @param {Object} rows
						 */
						onCheckAll: function(rows) {
							checkItems = rows.map(function(item) {
								return item
							})
						},
		
						/**
						 * 全选按钮取消时
						 */
						onUncheckAll: function() {
							checkItems = []
						}
					}
					// 初始化数据表格
				$('#dataTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#dataTable'));

//				util.form.validator.init($('#addChannelForm'))

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
					// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.orderCode = form.orderCode.value
			        pageOptions.opType = form.opType.value
			        pageOptions.checkCode = form.checkCode.value
					return val
				}
				$("#batchApprove").on('click',function(){
					if(checkItems.length > 0) {
						confirm.find('.popover-title').html('提示');
						confirm.find('p').html('是否审核通过?');
						$$.confirm({
							container: confirm,
							trigger: this,
							accept: function() {
								console.log(checkItems);
								var oids=[];
								for(var i=0;i<checkItems.length;i++){
									oids.push(checkItems[i].oid);
								}
								http.post(config.api.modifyOrderBatchApprove, {
									data: {
										'oids': oids.join(",")
									},
									contentType: 'form',
								}, function(result) {
									confirm.modal('hide')
									$('#dataTable').bootstrapTable('refresh')
								})
							}
						})
					}else{
						$("#alertMessage").html("<h4>请选择需要审核的数据!</h4>")
						$('#alertModal').modal('show');
					}
				});
			},
			bindEvent: function() {
				var _this = this;
			}

		}
	})