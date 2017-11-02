// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'protocol',
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
					typeId: '',
				}
				var confirm = $('#confirmModal');
				// 数据表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.protocolList, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									typeId: pageOptions.typeId,
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
					        case 'typeId':
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
							field: 'typeId',
							class: 'table_title_detail',
							formatter: function (val, row, index) {
				             	return util.enum.transform('protocolTypes', val);
				            }
						}, {
							field: 'createTime',
							class: 'align-right',
							formatter: function (val, row, index) {     
				              return null == row.createTime ? '--' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
				            }
						}, {
							field: 'updateTime',
							class: 'align-right',
							formatter: function (val, row, index) {     
				              return null == row.updateTime ? '--' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
				            }
						}, {
							align: 'center',
							formatter: function(val, row, index) {
								
								var format = ''
					            	format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o edit"></span>'
					            	format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;width:35px;" class="fa fa-trash-o del"></span>';
					            	return format;
								
							},
							events: {
								'click .detail': function(e, value, row) {
									
								},
								'click .edit': function(e, value, row) {
									document.addProtocolForm.oid = row.oid;
									// 重置和初始化表单验证
									$("#addProtocolForm").validator('destroy')

									$$.formAutoFix($('#addProtocolForm'), row); // 自动填充详情
									util.form.validator.init($("#addProtocolForm"));
									
									$('#addProtocolModal')
									.modal('show')
									.find('.modal-title').html('修改协议')
								},
								'click .del': function(e, value, row) {
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.protocolDel, {
												data: {
													oid: row.oid
												},
												contentType: 'form',
											}, function(res) {
												confirm.modal('hide')
												$('#protocolTable').bootstrapTable('refresh')
											})
										}
									})
								}
							}
						}]
					}
					// 初始化数据表格
				$('#protocolTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#protocolTable'));

				util.form.validator.init($('#addProtocolForm'))

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.typeId = form.typeId.value
					return val
				}
				function queryInfo(value,row){
					$$.detailAutoFix($('#detailForm'), row); // 自动填充详情            	
				            		$('#content').val(row.content);
				            		$('#createTime').html(null == row.createTime ? '--' : util.table.formatter.timestampToDate(row.createTime, 'YYYY-MM-DD HH:mm:ss'))
			       					$('#updateTime').html(null == row.updateTime ? '--' : util.table.formatter.timestampToDate(row.updateTime, 'YYYY-MM-DD HH:mm:ss'))
				                	$('#detailModal').modal('show')
				}
			},
			bindEvent: function() {
				var _this = this;

				//将新增协议页面显示出来
				$("#addProtocol").on("click", function() {
					var form = document.addProtocolForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
					util.form.reset($('#addProtocolForm'));
					form.oid.value = '';
					
					$('#addProtocolModal')
					.modal('show')
					.find('.modal-title').html('新建协议');
				});

				//新增协议
				$("#addProtocolSubmit").on("click", function() {
					if (!$('#addProtocolForm').validator('doSubmitCheck')) return
					$('#addProtocolForm').ajaxSubmit({
						url: config.api.protocolAdd,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#addProtocolModal').modal('hide')
								$('#protocolTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				});
			}
		}
	})