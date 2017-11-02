// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'actrule',
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
							http.post(config.api.actRuleList, {
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
				             	return util.enum.transform('actRuleTypes', val);
				            }
						}, {
							field: 'createTime',
							align: 'right',
							formatter: function (val, row, index) {     
				              return null == row.createTime ? '--' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
				            }
						}, {
							field: 'updateTime',
							align: 'right',
							formatter: function (val, row, index) {     
				              return null == row.updateTime ? '--' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
				            }
						}, {
							align: 'center',
							formatter: function(val, row, index) {
								
								var format = '';
								        format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o edit"></span>'
								        +'<span style=" margin:auto 0px auto 10px;cursor: pointer;width:35px;" class="fa fa-trash-o del"></span>';
								  
								    return format;
							},
							events: {
								'click .detail': function(e, value, row) {
									
								},
								'click .edit': function(e, value, row) {
									document.addActRuleForm.oid = row.oid;
									// 重置和初始化表单验证
									$("#addActRuleForm").validator('destroy')

									$$.formAutoFix($('#addActRuleForm'), row); // 自动填充详情
									util.form.validator.init($("#addActRuleForm"));
									
									$('#addActRuleModal')
									.modal('show')
									.find('.modal-title').html('修改活动规则')
								},
								'click .del': function(e, value, row) {
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.actRuleDel, {
												data: {
													oid: row.oid
												},
												contentType: 'form',
											}, function(res) {
												confirm.modal('hide')
												$('#actRuleTable').bootstrapTable('refresh')
											})
										}
									})
								}
							}
						}]
					}
					// 初始化数据表格
				$('#actRuleTable').bootstrapTable(tableConfig);
				$$.searchInit($('#searchForm'), $('#actRuleTable'));

				util.form.validator.init($('#addActRuleForm'))

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

				//将新增页面显示出来
				$("#addActRule").on("click", function() {
					var form = document.addActRuleForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
					util.form.reset($('#addActRuleForm'));
					form.oid.value = '';
					
					$('#addActRuleModal')
					.modal('show')
					.find('.modal-title').html('新建活动规则');
				});

				//新增
				$("#addActRuleSubmit").on("click", function() {
					if (!$('#addActRuleForm').validator('doSubmitCheck')) return
					$('#addActRuleForm').ajaxSubmit({
						url: config.api.actRuleAdd,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#addActRuleModal').modal('hide')
								$('#actRuleTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				});
			}
		}
	})