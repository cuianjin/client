// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'cmschannel',
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
					code: '',
					name: '',
				}
				var confirm = $('#confirmModal');
				// 数据表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.cmsChannelQuery, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									code: pageOptions.code,
									name: pageOptions.name,
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
							field: 'oid'
						}, {
							field: 'code',
							class: 'align-right'
						}, {
							field: 'name'
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
								'click .edit': function(e, value, row) {
									$('#editCode').attr('readonly',true);
									document.addChannelForm.oid = row.oid;
									// 重置和初始化表单验证
									$("#addChannelForm").validator('destroy')

									$$.formAutoFix($('#addChannelForm'), row); // 自动填充详情
									util.form.validator.init($("#addChannelForm"));
									
									$('#addChannelModal')
									.modal('show')
									.find('.modal-title').html('修改渠道')
								},
								'click .del': function(e, value, row) {
									$$.confirm({
										container: confirm,
										trigger: this,
										accept: function() {
											http.post(config.api.cmsChannelDel, {
												data: {
													oid: row.oid
												},
												contentType: 'form',
											}, function(res) {
												_this.syncChannel();
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
					pageOptions.code = form.code.value.trim()
					pageOptions.name = form.name.value
					return val
				}
			},
			bindEvent: function() {
				var _this = this;

				//将新增渠道页面显示出来
				$("#addChannel").on("click", function() {
					$('#editCode').attr('readonly',false);
					var form = document.addChannelForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
					util.form.reset($('#addChannelForm'));
					form.oid.value = '';
					
					$('#addChannelModal')
					.modal('show')
					.find('.modal-title').html('新建渠道');
				});

				//新增渠道
				$("#addChannelSubmit").on("click", function() {
					if (!$('#addChannelForm').validator('doSubmitCheck')) return
					$('#addChannelForm').ajaxSubmit({
						url: config.api.cmsChannelAdd,
						success: function(res) {
							if (res.errorCode == 0) {
								_this.syncChannel();
								$('#addChannelModal').modal('hide')
								$('#channelTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				});
			},
			syncChannel: function() {
				//CMS渠道下拉列表
	            http.post(config.api.cmsChannelSelect, {
	                 contentType: 'form'
	            }, function (enums) {
	                for (var key in enums) {
	                   config[key] = enums[key]
	                }
	                $$.enumSourceInit($(document))
	            });
			}
		}
	})