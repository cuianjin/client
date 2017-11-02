// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'channel',
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			channelInfo: {
				oid: ''
			},
			pagesInit: function() {
				var _this = this;
				// 分页配置
				var pageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					channelName: '',
					channelStatus: '',
					delStatus: 'no'
				}
				var confirm = $('#confirmModal');
				// 数据表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.channelQuery, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									channelName: pageOptions.channelName,
									channelStatus: pageOptions.channelStatus,
									delStatus: pageOptions.delStatus
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
				        	case 'channelName':
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
							field: 'oid'
						}, {
							field: 'channelName',
							class:"table_title_detail"
						}, {
							field: 'cid',
							align: 'right'
						}, {
							field: 'ckey'
						}, {
							field: 'partner'
						}, {
							field: 'channelContactName'
						}, {
							field: 'channelFee',
							align: 'right',
							class: 'decimal2',
							formatter: function(val, row, index) {
								if (val) {
									return util.safeCalc(val, '*', 100, 2) ;
								} else {
									return '--';
								}
							}
						}, {
							field: 'channelStatus',
							formatter: function(val, row, index) {
								return util.enum.transform('channelStatus', val);
							}
						}, {
							field: 'approvelStatus',
							formatter: function(val, row, index) {
								return util.enum.transform('approveStatus', val);
							}
						}, {
							align: 'center',
							formatter: function(val, row, index) {
								var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#channelTable').bootstrapTable('getData').length - 1,
									sub:[{
											text: '申请停用',
											type: 'button',
											class: 'apply',
											isRender: row.channelStatus == 'on' && row.approvelStatus != 'toApprove'
										}, {
											text: '申请启用',
											type: 'button',
											class: 'apply',
											isRender: row.channelStatus == 'off' && row.approvelStatus != 'toApprove'
										}, {
											text: '审核意见',
											type: 'button',
											class: 'remarks',
											isRender: row.commentNum>0
										}]
									
								}]
								var format = util.table.formatter.generateButton(buttons, 'channelTable')
				            	if(row.channelStatus == 'off' && row.deleteStatus == 'no'){
				            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o edit"></span>'
				            		if(row.approvelStatus != 'toApprove'){
				            			format+='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o del"></span>';
				            		}
				            	}
				            	return format
							},
							events: {
								'click .apply': function(e, value, row) {
									var applyType = row.channelStatus == 'on' ? 'off' : 'on';
									confirm.find('.popover-title').html('渠道状态申请')
//									confirm.find('p').html($(this).html() + '?');
									if(row.channelStatus == 'on') {
										confirm.find('p').html('请确认是否申请停用?');
									} else {
										confirm.find('p').html('请确认是否申请启用?');
									}
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.setapply, {
												data: {
													oid: row.oid,
													requestType: applyType
												},
												contentType: 'form',
											}, function(res) {
												confirm.modal('hide')
												$('#channelTable').bootstrapTable('refresh')
											})
										}
									})
								},
								'click .remarks': function(e, value, row) {
									http.post(config.api.remarksQuery, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(res) {
										var remarks = '';
										var rows = res.rows;
										for (var idx in rows) {
											var remark = rows[idx].remark == null ? '' : rows[idx].remark;
											remarks += '时间：' + util.table.formatter.timestampToDate(rows[idx].time, 'YYYY-MM-DD HH:mm:ss') + '&nbsp;&nbsp;&nbsp;&nbsp;审核意见：' + remark + '</br>';
										}
										$("#remarks").html(remarks);
										$('#remarksModal').modal('show');
									})
								},
								'click .edit': function(e, value, row) {
									_this.channelInfo.oid = row.oid;
									// 重置和初始化表单验证
									$("#editChannelForm").validator('destroy')

									http.post(config.api.channelinfo, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$$.formAutoFix($('#editChannelForm'), result); // 自动填充详情
										util.form.validator.init($("#editChannelForm"));
										$('#editChannelModal').modal('show')
									})
									
								},
								'click .del': function(e, value, row) {
									confirm.find('.popover-title').html('提示')
									confirm.find('p').html('确定删除此条数据？');
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.delChannel, {
												data: {
													oid: row.oid
												},
												contentType: 'form',
											}, function(res) {
												confirm.modal('hide')
												$('#channelTable').bootstrapTable('refresh')
											})
										}
									})
								}
							}
						}]
					}
					// 初始化数据表格
				$('#channelTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#channelTable'));

				util.form.validator.init($('#addChannelForm'))

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.channelName = form.channelName.value.trim()
					pageOptions.channelStatus = form.channelStatus.value
					return val
				}
				
				function queryInfo(value,row){
					http.post(config.api.channelinfo, {
						data: {
							oid: row.oid
						},
						contentType: 'form',
					}, function(result) {
						$$.detailAutoFix($('#detailForm'), result); // 自动填充详情	                    
						$('#detailModal').modal('show');
					})
				}
			},
			bindEvent: function() {
				var _this = this;

				//将新增渠道页面显示出来
				$("#addChannel").on("click", function() {
					util.form.reset($('#addChannelForm'));
					_this.channelInfo.oid = '';
					$('#addChannelModal').modal('show');
				});

				//新增渠道
				$("#addChannelSubmit").on("click", function() {
					if (!$('#addChannelForm').validator('doSubmitCheck')) return
					$('#addChannelForm').ajaxSubmit({
						url: config.api.addChannel,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#addChannelModal').modal('hide')
								$('#channelTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				});

				//修改渠道
				$("#editChannelSubmit").on("click", function() {
					if (!$('#editChannelForm').validator('doSubmitCheck')) return
					document.editChannelForm.oid.value = _this.channelInfo.oid
					$('#editChannelForm').ajaxSubmit({
						url: config.api.editChannel,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#editChannelModal').modal('hide')
								$('#channelTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				});

			}

		}
	})